---
title: "Case Study: Three Applications on Data I Did Not Own"
description: "Nine months rebuilding the product, storefront and events systems for a multi-branch retailer whose source of truth lives in a point-of-sale system and a supply-chain platform owned by other people. What broke, and what I changed because of it."
pubDate: 2026-08-14
heroImage: "/images/blog/case-study-ecommerce.png"
category: case-study
tags: ["postgresql", "supabase", "e-commerce", "integration", "row-level-security", "data-quality"]
draft: false
lang: en
alternateSlug: "fallstudie-multi-filial-handelsplattform"
---

> **Short answer:** A regulated consumer-goods retailer running several branches and a warehouse had a point-of-sale system with limited data entry, a website disconnected from both the POS and the storefront, no reliable sync, and no way to tell when the two disagreed. Over nine months I built three applications on top of it — a back-office product manager, the customer storefront, and an events site — plus the integration into a supply-chain platform owned by someone else. The hard part was never the applications. It was being correct on data I could not control.

> **On specifics:** the client is not named and neither are their vendors. Everything technical below is real and comes from the work; the figures are counted from the repositories, not estimated.

## Where it started

The point-of-sale system held the truth about stock and prices, and it was the only place staff could enter anything — with limited fields and no validation worth the name. A WordPress site sat alongside it, connected to neither the POS nor the storefront. Product data was uploaded by hand in batches, so the moment anyone edited a price in one place, the other two were wrong and nobody could tell.

There was no drift detection. That is the part people underestimate. Two systems disagreeing is a normal Tuesday; two systems disagreeing *silently* for three weeks is what costs you money.

## What I built

Three applications, all in production:

| | What it does |
|---|---|
| **Back-office product manager** | Where staff curate: descriptions, wholesale prices, visibility, images, and a review queue for anything that has drifted from the POS |
| **Customer storefront** | The public shop, reading the curated layer and the live POS figures together |
| **Events site** | A separate public site for the location's events and visitor information |

Plus the integration with a **separately owned supply-chain system** — inventory movements, FIFO lot tracking, per-branch and warehouse stock. I contribute to that one through a staging branch; its maintainer promotes to production. That constraint shaped more of the design than anything else, and the next two sections are why.

Postgres throughout, with row-level security, object storage for product media, and continuous deployment. Roughly **1,067 commits** across the three applications I own, over nine months. All three are live.

## The design decision that paid off: no stored drift flags

The obvious way to track whether curated data has diverged from the POS is a trigger and a boolean column. Something writes `is_stale = true`, a queue reads it, staff clear it.

I did not do that, and it is the decision I would defend hardest.

Drift detection here is a **read-time JOIN with `IS DISTINCT FROM`**. Nothing is stored, so nothing can be stale about staleness. There is no trigger to forget on a bulk import, no flag to backfill after a migration, no window where the queue disagrees with reality because a write path skipped the trigger. The comparison runs when someone looks, against whatever both sides say at that moment, and it is correct by construction rather than by maintenance.

The cost is a slightly more expensive read. That was a good trade, and the two failures below explain why I stopped trusting anything stored about upstream data.

## What went wrong, part one: the POS reassigns product codes

The POS lets an operator take an existing product code and give it to a **different product**. Same code, new item, no signal.

The sync upserted the curated overlay with `ON CONFLICT (sku) DO NOTHING`. Read that with the above in mind: when a code was reused, the overlay kept its original snapshot and all its curation — description, wholesale price, visibility — permanently attached to a product that no longer existed under that code. The storefront showed one thing, the POS meant another, and the row looked healthy from every angle.

The tempting fix is a policy: tell staff to stop reusing codes. That fails twice. It relies on operator discipline in a system I do not control, and it does nothing for the rows already broken.

So the sync had to *tolerate* reuse:

1. **Readers resolve the canonical row.** Both the back-office and the storefront pick the live product per code, preferring active rows, so names, prices and stock are right regardless of which twin they land on.
2. **Staff see the conflict.** Where the live title differs from the frozen snapshot, the back-office surfaces "code reassigned — re-pull", so a human can fix the curation deliberately instead of discovering it through a customer.
3. **The root-cause fix went upstream.** The durable answer is to stop keying on the code at all and track the POS's *internal* product id, which nobody can reassign. That sync belongs to the supply-chain maintainer, so I wrote the migration and the diff and handed it over rather than editing someone else's function.

The general lesson is worth more than the incident: **never key your data on an identifier another system can reassign.** If you must, keep the foreign identity alongside it so a swap is detectable rather than invisible.

## What went wrong, part two: a fix the next sync deletes

Six product images stopped being editable in the back-office. The classification field they are gated on had gone null.

I backfilled them in a single transaction, verified zero remaining, and wrote down the exact statement to reverse it. Then I checked whether the fix would survive — and it would not. Every sync run re-derives that field from a **hardcoded category map**, and the map was missing one of the POS's categories. The next run would null all six again.

One row was worse. Its category was blank in every upstream record, so there was nothing to derive from at all. A manual backfill there would be wiped on every single run, forever. I deliberately left it broken and documented why, because a fix you have to reapply weekly is not a fix, it is a chore you have volunteered for.

The durable change was one line in that category map — again, in a function owned by someone else, so again a diff handed upstream rather than applied.

If there is one habit worth stealing from this project, it is that one: **after you fix data, work out what will undo it.** In a pipeline you do not fully own, that question has an answer surprisingly often.

## What this changes if you are the one buying

Most integration work is sold as if the systems were yours. Usually they are not. There is a POS the staff will not give up, a supplier platform with its own maintainer and its own release schedule, and a website somebody's cousin built. What you can actually control is your own layer, and the discipline that makes the difference is:

- **Assume the upstream will contradict itself,** and make the contradiction visible instead of letting it settle silently into your data.
- **Do not store conclusions about someone else's data.** Compute them when you need them, or you will be maintaining a cache of facts that quietly went false.
- **Separate the workaround from the fix.** Tolerate the problem on your side today, send the root-cause change to whoever owns it, and be honest about which of the two you have actually done.

That is the shape of the work: [integrations & APIs](/en/services/integrations-apis/) where the systems are real, the data is messy, and nobody hands you ownership of the whole chain.

If that sounds like your situation, [book a free call](https://cal.com/tobias-leinss/strategymeeting) and describe where your systems disagree. That is usually the interesting part.
