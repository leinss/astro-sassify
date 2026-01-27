---
title: "Case Study: Automated Lead Nurturing for a SaaS Startup"
description: "How we reduced lead response time from 2 days to 4 hours and increased qualified leads by 35% using n8n, Notion, and AI-powered lead scoring."
pubDate: 2025-01-27
heroImage: "/images/blog/case-study-crm.png"
category: case-study
tags: ["crm", "lead-nurturing", "n8n", "notion", "ai", "claude", "ollama"]
draft: false
lang: en
alternateSlug: "fallstudie-crm-leadpflege"
---

# Automated Lead Nurturing for a SaaS Startup

A growing B2B SaaS company was losing deals because leads went cold. Manual follow-ups were inconsistent, and the sales team spent more time on admin than selling. We built an automated lead nurturing system that transformed their pipeline.

## The Challenge

**Client**: B2B SaaS startup, 15 employees, €2M ARR

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

## Your Turn

Running a similar lead management challenge?

1. **Audit**: Map your current lead flow—where are the gaps?
2. **Prioritize**: Start with one source (e.g., website forms)
3. **Measure**: Track response time before and after

[Book a free strategy call](https://cal.com/tobias-leinss/strategymeeting) — I'll walk through what this would look like for your setup.
