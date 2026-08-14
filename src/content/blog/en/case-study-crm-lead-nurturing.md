---
title: "Reference Build: Automated Lead Scoring and Nurturing"
description: "The full architecture for capturing, scoring and nurturing leads on n8n, Notion and an AI scorer — the scoring prompt, the sequence logic, and the workflow available to download and inspect."
pubDate: 2026-06-18
heroImage: "/images/blog/case-study-crm.png"
category: reference-build
tags: ["crm", "lead-nurturing", "n8n", "notion", "ai", "claude", "ollama"]
draft: false
lang: en
alternateSlug: "fallstudie-crm-leadpflege"
---

> **Short answer:** Every lead that arrives — website form, LinkedIn, event list — lands in one place, gets scored against your actual qualification criteria by a model that can read free text, and triggers a follow-up sequence matched to that score. The rep sees a ranked queue with the reasoning attached, instead of an inbox. Built on n8n with Notion as the CRM, and Claude or a local Ollama model doing the scoring.

> **What this is:** a reference build — the architecture, the scoring prompt, and the sequence logic, written up so you can judge the engineering. There are no client figures here. What you can check yourself is the running system: **[watch the lead-response demo →](/en/projects/)**.

## The problem it solves

Leads arrive through several doors and land in an inbox, which is not a queue. Nobody can tell at a glance which of forty unread messages is worth answering first, so they get answered in arrival order or not at all. Meanwhile the rep retypes the same contact details into three tools.

Two separate problems hide in there. Ranking needs judgement about text a rule cannot parse — a job title, a company description, what the person actually asked for. Sequencing needs reliability, not judgement: the right message, at the right interval, every time, without anyone remembering. This build gives the first to a model and the second to plain workflow logic.

## At a glance

| | |
|---|---|
| **Stack** | n8n orchestration + Notion CRM + AI lead scoring (Claude / Ollama) |
| **What it decides** | Fit score, intent, segment, next best action, and the reasoning behind each |
| **Guardrails** | Scores are advisory and visible to the rep, sequences pause on any human reply, business-hours scheduling |
| **You can inspect** | The full n8n JSON, exported from the running instance |

This is the kind of build I do under [CRM & sales automation](/en/services/crm-sales-automation/). You can watch the [lead-response demo](/en/projects/) run live.

## The Solution

A three-stage automation system with **n8n** as the orchestration layer.

### Tool Stack

| Component | Tool | Why |
|-----------|------|-----|
| Lead Database | Notion | Flexible, API-friendly, team already used it |
| Workflow Automation | n8n | Self-hosted, GDPR-compliant, extensible |
| AI Scoring (Cloud) | Claude API | High accuracy for context-rich scoring |
| AI Scoring (Local) | Ollama | Privacy-first option for sensitive data |
| Email Sequences | n8n + SMTP | Personalized, triggered by lead stage |

### Stage 1: Lead Capture & Enrichment

```
Website Form / LinkedIn → Webhook → n8n → Notion Database
```

Every lead automatically lands in Notion with:
- Contact details (name, email, company)
- Source attribution (which campaign, referrer)
- Enriched data (company size, industry via Clearbit/Apollo)
- Timestamp for response time tracking

### Stage 2: AI-Powered Lead Scoring

The heart of the system. Each lead is evaluated by AI against the company's Ideal Customer Profile (ICP).

**Scoring Criteria**:
1. **Company Fit** (40%): Industry, size, tech stack alignment
2. **Engagement Signals** (30%): Pages visited, content downloaded
3. **Budget Indicators** (20%): Company revenue, funding stage
4. **Timing Signals** (10%): Urgency in message, decision timeline

**Claude API Prompt (simplified)**:
```
Analyze this lead against our ICP:
- Target: B2B SaaS, 10-200 employees, Series A+
- Ideal persona: VP Engineering, CTO, Head of DevOps

Lead data: {lead_json}

Return JSON with:
- score (0-100)
- tier (hot/warm/cold)
- reasoning (2 sentences)
- suggested_action (call/email/nurture/disqualify)
```

**Ollama Alternative**: For clients with strict data residency requirements, we run Mistral 7B locally. Slightly lower accuracy but zero data leaves the premises.

### Stage 3: Automated Actions

Based on the AI score, n8n triggers different workflows:

| Lead Tier | Score | Action |
|-----------|-------|--------|
| 🔥 Hot | 80-100 | Slack alert + calendar link sent within 5 min |
| 🌡️ Warm | 50-79 | 3-email sequence over 7 days |
| ❄️ Cold | 20-49 | Monthly newsletter + occasional check-in |
| ❌ Disqualified | 0-19 | Polite decline email, removed from active |

**Hot Lead Workflow**:
1. Slack notification to sales channel with lead summary
2. Auto-draft personalized email (AI-generated, human-approved)
3. Notion status → "Hot Lead - Awaiting Contact"
4. If no action in 2 hours → Escalation to sales manager

**Warm Lead Nurture Sequence**:
- Day 0: "Thanks for your interest" + relevant case study
- Day 3: Educational content based on their industry
- Day 7: Soft ask for a call with specific value proposition

## What changes, and what does not

I am not going to give you a before-and-after table. I have not run this system on your pipeline, and numbers invented for a fictional company would tell you nothing.

What the architecture changes is structural:

- **The queue is ranked, not chronological.** A rep opening the CRM sees the best-fit lead first, with the reason it scored that way, rather than whatever arrived most recently.
- **Follow-up stops depending on memory.** Sequences fire on schedule and pause the moment a human replies, so nothing is dropped and nothing is sent twice.
- **Nobody retypes a contact.** Capture writes once, and every tool downstream reads from that record.

What it does not change is your close rate on a good lead. The model ranks and drafts; it does not sell. If the honest problem is that qualified prospects talk to you and then do not buy, this build will make that visible faster and will not fix it.

The number worth measuring first is your scoring agreement rate: run the scorer over last quarter's closed-won and closed-lost leads and check whether its ranking matches what actually happened. If it does not, the prompt needs your criteria in it, not more automation around it.

## Implementation Details

**Timeline**: 3 weeks from kickoff to production
- Week 1: Notion structure, n8n workflows, integrations
- Week 2: AI prompt engineering, testing with historical leads
- Week 3: Email templates, Slack integration, training

**Ongoing Costs**:
| Item | Monthly Cost |
|------|--------------|
| n8n Cloud (or self-hosted: €0) | €20 |
| Claude API (~500 leads/month) | €15 |
| Notion (Team plan) | Already had |
| **Total** | **€35/month** |

Compare to: 1 SDR at €4,000/month doing the same manual work.

## Key Learnings

1. **Start with clear ICP**: AI scoring is only as good as your criteria
2. **Human-in-the-loop**: Hot leads get AI drafts, not auto-sends
3. **Measure response time**: The #1 factor in lead conversion
4. **Iterate prompts**: Expect to rewrite the scoring prompt several times against real closed deals — the first version is never the one you keep

## Build This Yourself

Here's how to wire up the lead nurturing pipeline from scratch.

### Node-by-Node Breakdown

**1. Lead Intake Webhook**

A webhook receives form submissions from your website, landing pages, or integrations like Zapier. The trigger normalizes incoming data into a consistent format regardless of source.

```
POST /lead-intake → { name, email, company, message, source }
```

**2. Data Enrichment (Set Node)**

Before AI scoring, structure the lead data explicitly. This makes the Claude prompt more reliable and easier to debug. Include:
- Contact info (name, email, company)
- Context fields (source, company size, industry)
- Message content for sentiment analysis

**3. Claude Lead Scoring**

The AI evaluates each lead against your Ideal Customer Profile. The prompt includes:
- Weighted scoring criteria (company size, industry, pain indicators, budget signals)
- Clear tier definitions (hot/warm/cold/disqualified)
- Output format with score, tier, reasoning, and personalization hook

Key insight: Include a `personalization_hook` field—it gives your sales team a specific detail to reference in outreach, making responses feel personal at scale.

**4. Score Parsing**

Parse Claude's JSON response and merge with original lead data. Handle edge cases:
- Markdown code blocks in response
- Missing fields (default to "warm" tier)
- Parse errors (log and route to manual review)

**5. Tier-Based Routing (Switch Node)**

Route leads to different paths based on their tier:
- **Hot (80-100)**: Immediate Slack alert + Notion record + calendar link
- **Warm (50-79)**: Email nurture sequence (3 emails over 7 days)
- **Cold (20-49)**: Add to newsletter for long-term nurture
- **Disqualified (0-19)**: Log and skip (no outreach)

**6. Channel Integrations**

Each tier triggers appropriate actions:
- Slack for hot lead alerts (with one-click actions)
- Email via SMTP or SendGrid for nurture sequences
- Mailchimp/ConvertKit for newsletter adds
- Notion for centralized lead tracking

### Get the Starter Workflow

> **📥 Not a screenshot — the real workflow.** This is the exact n8n JSON, exported from a running instance. Import it and inspect every node yourself.
>
> [Download n8n-crm-lead.json](/workflows/n8n-crm-lead.json)

**Quick Setup:**
1. Import JSON via n8n Settings → Import Workflow
2. Configure credentials (Anthropic API, Slack, Notion, Email/SMTP)
3. Update the ICP criteria in the Claude prompt to match your target customer
4. Create matching Slack channels (#sales-hot-leads)
5. Test with sample form submissions

This starter implements the core scoring and routing logic. A production implementation would include lead enrichment via Clearbit/Apollo, CRM sync (HubSpot, Pipedrive), multi-step email sequences with delay nodes, and escalation logic for uncontacted hot leads—refinements that come from understanding your specific sales process.

## Your turn

Running a similar lead management challenge?

1. **Audit**: Map your current lead flow — where are the gaps?
2. **Prioritize**: Start with one source, e.g. website forms.
3. **Measure**: Track response time before and after.

If slow follow-up is the real culprit, the [lead-response demo](/en/projects/) shows what a minutes-not-hours reply looks like.

[Book a free strategy call](https://cal.com/tobias-leinss/strategymeeting) — I'll walk through what this would look like for your setup.
