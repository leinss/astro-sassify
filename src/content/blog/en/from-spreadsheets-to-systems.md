---
title: "Escaping Spreadsheet Hell: Auto-Clean Contact Lists with n8n and AI"
description: "How to clean, normalize, and deduplicate messy contact lists in seconds using n8n and an LLM, instead of spending hours on manual data work."
pubDate: 2026-01-22
category: automation
tags: ["spreadsheets", "excel", "contacts", "data-cleaning", "n8n", "ai"]
heroImage: "/images/blog/from-spreadsheets-to-systems.png"
draft: false
lang: en
alternateSlug: "von-tabellen-zu-systemen"
---

> **Short answer:** To clean a messy contact list automatically, feed the CSV to a workflow that sends it to a language model under a strict prompt and returns structured JSON: trimmed whitespace, lowercased emails, phone numbers in one format, properly capitalised names, matched company names, and duplicates removed, including fuzzy matches. The work drops from an afternoon to about the time it takes to read the change log.

Every business has one: the contact list that grew over years. Names with inconsistent capitalization, email addresses in ALL CAPS, phone numbers in four different formats, company names sometimes "LLC" and sometimes "llc": and somewhere in there, duplicate entries hiding.

Cleaning it manually costs hours, sometimes days. And just when you're done, new entries come in and break everything again.

## What does dirty data actually cost you?

The visible problems are obvious. But the invisible ones are more expensive:

- **Duplicate emails sent** damage your reputation with recipients and email providers
- **Failed validations** because "John Smith" and "john smith" are treated as two different people
- **Missed contacts** because searching for "Acme Corp" finds nothing, even though "acme corp" and "Acme corp" are in the system
- **Compliance risk** from incorrect or outdated records

The result: the CRM that was supposed to solve the problem becomes the problem itself.

## The Spreadsheet Rescuer: Automated Data Cleaning with AI

This workflow solves exactly that. You upload your CSV data (or paste it directly), and n8n sends it to a language model, which:

1. Removes **leading and trailing whitespace**
2. Normalizes **email addresses** (lowercase) and checks syntactic validity
3. Standardizes **phone numbers** into a consistent format (e.g. `+1 555 123 4567`)
4. Correctly capitalizes **names**
5. Makes **company names** consistent (detects "acme corp" and "Acme Corp" as identical)
6. Finds and removes **duplicates**: including fuzzy matches (same person, slightly different spelling)
7. Flags **invalid fields**

The result: a clean CSV file ready to download, plus a summary of every change made.

## Live Demo

Test it with sample data or your own. This is one of several [document & data workflows](/en/services/document-workflows/) I build; more run on the [live demos page](/en/projects/).

## How the Workflow Works

```
[CSV Upload / Text Input]
        ↓
[Validate Input]
  - Empty? Too large? → Error
        ↓
[LLM API (Clean Data)]
  - Strict prompt: JSON output only
  - Prompt defines cleaning rules
        ↓
[Format Result]
  - Cleaned rows → CSV
  - Build change log
        ↓
[Return JSON Response]
  - headers, cleaned_rows, changes, stats
```

The key: the model is pinned by its system prompt to return a JSON object and nothing else, and a code node parses that and fails loudly if the shape is wrong. This is what makes the output usable no matter how many special characters are in the data. The demo instance runs Kimi k2.5 in JSON mode; the same workflow works against Claude with tool-use, which enforces the shape at the API rather than in the prompt.

## Where the time goes

| Task | Manual | With Workflow |
|------|--------|---------------|
| Clean a few hundred contacts | An afternoon of find-and-replace | One run, plus reading the change log |
| Find duplicates | Sort, squint, repeat | Automatic, including near-matches |
| Normalize phone numbers | One at a time | In batch |
| Do it again next month | The same afternoon | The same one run |

Rather than quote you a stopwatch figure from my machine, run the demo on a sample of your own list. That tells you both the speed and, more usefully, whether the rules it applies are the ones you want.

The honest caveat: fuzzy duplicate matching is a judgement call, and a model will occasionally merge two people who share a name or keep two records that are the same person. Read the change log before you import the result. That is the step nobody puts in the time table.

## Customization Options

The workflow is a starting point. Common extensions:

- **Describe your target system** directly (e.g. "Export only contacts with valid US phone numbers for HubSpot import")
- **Add more fields**: addresses, zip codes, IBAN validation
- **Email delivery** after cleaning (result sent directly to your inbox)
- **Scheduling** for regular cleanup of a Google Sheet

## Privacy Note

The demo runs on my self-hosted n8n, and the rows you paste go to the model provider it calls. Two things follow. Do not paste a real customer list into a public demo, mine or anyone's: use a sample. And in a production build, n8n retains execution data until you configure pruning, so set that policy deliberately if the data is personal.

## Download the Workflow

> **Not a screenshot: the real workflow.** This is the n8n JSON: import it into your own n8n and inspect every node yourself.
>
> [Download n8n Workflow (JSON)](/workflows/excel-retter.json)

Import: n8n → Workflows → Import from File → Upload JSON → Set credentials (the API key of whichever model provider you point it at)

## Technical detail

If you're interested in the implementation details: which rules belong in a prompt and which belong in code, how the request is assembled, and why the parse step is where the reliability lives:

→ **[How I clean messy spreadsheets with an LLM and n8n](https://leinss.xyz/blog/en/spreadsheet-cleaning-technical/)** *(leinss.xyz)*

Related reading: the [multi-platform inventory sync reference build](/en/blog/case-study-ecommerce-sync/), which is the same problem at four-system scale.

---

*Interested in a tailored solution for your specific data challenges? [Get in touch.](https://cal.com/tobias-leinss/strategymeeting)*
