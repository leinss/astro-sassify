---
title: "Case Study: Automated Lead Nurturing for a SaaS Startup"
description: "A fictional scenario showing how to reduce lead response time from 2 days to 4 hours and increase qualified leads by 35% using n8n, Notion, and AI-powered lead scoring."
pubDate: 2025-01-27
updatedDate: 2026-07-04
heroImage: "/images/blog/case-study-crm.png"
category: case-study
tags: ["crm", "lead-nurturing", "n8n", "notion", "ai", "claude", "ollama"]
draft: false
lang: en
alternateSlug: "fallstudie-crm-leadpflege"
---

> **Short answer:** A 15-person B2B SaaS startup automated its lead handling with n8n, Notion, and AI scoring. Lead response time dropped from 2 days to 4 hours, qualified leads rose from 12% to 35%, and each rep got 6 hours a week back. The build paid for itself in 6 weeks.

> **Note:** This is a fictional scenario illustrating what this kind of automation can achieve. The company profile and metrics are representative examples based on common industry patterns, not a specific client.

A B2B SaaS company was losing deals because leads went cold. Follow-ups were inconsistent, and the sales team spent more time copying data between tools than selling. Here's the system I'd build to fix it, and the numbers it moved.

## At a glance

| | |
|---|---|
| **Client / Industry** | B2B SaaS startup, 15 employees, €2M ARR |
| **Problem** | Leads sat in inboxes, no systematic follow-up, reps buried in admin |
| **Solution** | n8n orchestration + Notion CRM + AI lead scoring (Claude / Ollama) |
| **Result** | Response time 2 days → 4 hours, qualified leads 12% → 35%, admin 8 → 2 hrs/week/rep, payback in 6 weeks |

This is the kind of build I do under [CRM & sales automation](/en/services/crm-sales-automation/). You can watch the [lead-response demo](/en/projects/) run live.

## The challenge

**Example Company**: B2B SaaS startup, 15 employees, €2M ARR

**Pain Points**:
- Leads from website, LinkedIn, and events sat in email inboxes
- No systematic follow-up process
- Sales reps manually copied data between tools
- Lead quality varied wildly—time wasted on unqualified prospects

**Before Automation**:
| Metric | Value |
|--------|-------|
| Average lead response time | 2 days |
| Lead qualification rate | 12% |
| Time spent on admin per rep | 8 hrs/week |
| Leads falling through cracks | ~40% |

## The Solution

We designed a three-stage automation system using **n8n** as the orchestration layer.

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

## Results

After 3 months of running the automated system:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Lead response time | 2 days | 4 hours | -83% |
| Qualified leads | 12% | 35% | +192% |
| Admin time per rep | 8 hrs/week | 2 hrs/week | -75% |
| Leads lost to gaps | ~40% | <5% | -87% |
| Pipeline velocity | 45 days | 28 days | -38% |

**ROI**: Implementation cost paid back in 6 weeks through increased conversion.

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
4. **Iterate prompts**: We refined scoring prompts 8 times based on sales feedback

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

Download and import into n8n:

[Download n8n-crm-lead.json](/workflows/n8n-crm-lead.json)

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

If slow follow-up is the real culprit, the [5 signs your business needs automation](/en/blog/5-signs-your-business-needs-automation/) is a quick gut-check on where the ROI sits.

[Book a free strategy call](https://cal.com/tobias-leinss/strategymeeting) — I'll walk through what this would look like for your setup.
