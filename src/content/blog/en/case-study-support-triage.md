---
title: "Reference Build: AI Support Triage for E-commerce"
description: "The full architecture for an AI triage layer that classifies, routes and auto-answers support tickets: every node explained, with the n8n workflow available to download and inspect."
pubDate: 2026-07-04
heroImage: "/images/blog/case-study-support.png"
category: reference-build
tags: ["support", "triage", "n8n", "slack", "ai", "claude", "ollama", "e-commerce"]
draft: false
lang: en
alternateSlug: "fallstudie-support-triage"
---

> **Short answer:** An AI triage layer sits between your customers and your support team. It reads every incoming message, scores urgency, assigns a category, routes it to the right Slack channel, and answers the routine ones itself, with confidence thresholds and sentiment checks so anything doubtful reaches a human. Built on n8n and Claude, with a local Ollama pre-filter to keep the API bill down.

> **What this is:** a reference build. The architecture, the prompts and the exact n8n workflow, written up so you can judge the engineering. There are no client figures here. What you can check yourself is the running system: **[try the demos →](/en/projects/)**.

## The problem it solves

Support requests arrive by email, contact form, and social media, and they get handled first-come-first-served. That means "where is my order?" and "my payment failed" sit in the same queue in arrival order. Routine questions absorb the day, urgent ones wait behind them, and a weekend builds a backlog that takes days to clear.

Prioritisation is the fix, and prioritisation needs to read the message. That is the job this build gives to a model.

## At a glance

| | |
|---|---|
| **Stack** | n8n triage + Claude classification (Ollama pre-filter) + Slack routing + AI auto-responses |
| **What it decides** | Urgency 1-5, category, auto-resolvable yes/no, sentiment, confidence |
| **Guardrails** | 90% confidence floor, sentiment gate, escalation keywords, 5% human spot-check |
| **You can inspect** | The full n8n JSON, exported from the running instance ([download below](#get-the-starter-workflow)) |

This is the kind of build I do under [communication automation](/en/services/communication-automation/). See the [live demos](/en/projects/) for working examples.

## The Solution

An AI-powered triage layer sits between customers and the support team.

### Tool Stack

| Component | Tool | Why |
|-----------|------|-----|
| Message Intake | Email + Contact Form Webhooks | Unified entry point |
| Workflow Engine | n8n | Flexible routing logic |
| AI Classification | Claude API | Nuanced understanding of intent |
| AI Classification (Local) | Ollama + Mistral | Cost-effective for high volume |
| Team Communication | Slack | Real-time alerts, channel routing |
| Response Drafting | Claude API | Consistent, on-brand replies |

### System Architecture

```
Customer Message → n8n → AI Classification → Route/Respond → Slack/Email
```

**Step 1: Message Intake**

All support channels funnel into n8n:
- Email forwarding to dedicated inbox
- Contact form webhook
- Social media via Zapier/Make integration

Each message gets a unique ticket ID and timestamp.

**Step 2: AI Classification**

Claude analyzes each message for three dimensions:

**Urgency** (1-5):
- 5: Payment failed, account locked, security issue
- 4: Order not delivered (past expected date)
- 3: Product question, shipping inquiry
- 2: General feedback, feature request
- 1: Spam, irrelevant

**Category**:
- `order-status`: Where is my order?
- `returns`: Return/refund requests
- `product`: Product questions
- `payment`: Payment issues
- `account`: Login, password, account changes
- `complaint`: Negative feedback
- `other`: Everything else

**Auto-Resolvable** (yes/no):
Can this be answered with standard information + order lookup?

**Classification Prompt**:
```
Analyze this customer support message:

"{message}"

Customer email: {email}
Order history: {recent_orders_summary}

Return JSON:
{
  "urgency": 1-5,
  "category": "order-status|returns|product|payment|account|complaint|other",
  "auto_resolvable": true/false,
  "key_issue": "one sentence summary",
  "suggested_response": "draft if auto_resolvable"
}
```

**Step 3: Intelligent Routing**

Based on classification, messages take different paths:

| Urgency | Auto-Resolvable | Action |
|---------|-----------------|--------|
| 5 | Any | Immediate Slack alert to #support-urgent |
| 3-4 | No | Route to appropriate Slack channel |
| 1-4 | Yes | Auto-respond + log |
| 1 | N/A | Archive (spam filter) |

**Slack Channels**:
- `#support-urgent`: Payment issues, security concerns
- `#support-orders`: Shipping, delivery, order changes
- `#support-returns`: Returns and refunds
- `#support-general`: Everything else

Each Slack message includes:
- Customer name and email
- Order history summary
- AI's classification and reasoning
- One-click actions (respond, escalate, close)

**Step 4: Auto-Response System**

For auto-resolvable queries, AI drafts responses using:
- Order status from shop system (Shopify/WooCommerce API)
- Shipping carrier tracking
- Return policy details
- FAQ knowledge base

**Example Auto-Response (Order Status)**:
```
Hi Sarah,

Thanks for reaching out! I checked your order #12345.

📦 Current Status: In transit
🚚 Carrier: DHL
📍 Last Update: Package departed sorting facility in Hamburg
📅 Expected Delivery: January 29, 2025

You can track your package here: [tracking link]

Let me know if you need anything else!

Best,
[Brand] Support
```

Auto-responses are sent immediately but logged for agent review.

### Ollama for High Volume

For cost optimisation, Mistral 7B runs locally for the first classification pass:
- It takes the clear-cut cases, which on most ticket mixes is the large majority
- Claude is called only for ambiguous or high-urgency messages
- Your saving scales with how lopsided your ticket mix is, measure it in shadow mode before you assume a number

## What changes, and what does not

I am not going to give you a before-and-after table. I have not run this system inside your business, and any numbers I invented for one would tell you nothing.

What the architecture does change is structural, and you can reason about it directly:

- **Arrival order stops deciding priority.** A failed payment reaches a human before a tracking-number question, regardless of which landed first.
- **Answerable questions stop waiting for an agent.** Anything the system can answer from order data plus the FAQ is answered at once, at any hour.
- **Agents stop copy-pasting tracking numbers.** The queue they see is the queue that needs a person.

How much that is worth depends on your ticket mix. The honest way to find out is to run the classifier over your last month of tickets in shadow mode and count what it would have auto-resolved, before you switch a single auto-response on. That is week three in the timeline below, and it is the step I would not skip.

## Implementation Details

### Fail-Safes

AI systems need guardrails:

1. **Confidence threshold**: Auto-respond only if AI confidence >90%
2. **Sentiment check**: Angry customers always go to humans
3. **Escalation keywords**: "lawyer", "complaint", "fraud" → immediate escalation
4. **Daily review**: Agent spot-checks 5% of auto-responses

### Response Quality

All auto-responses follow brand guidelines:
- Tone: Friendly, concise, helpful
- Format: Emoji use, paragraph structure
- Sign-off: Consistent signature

Templates are AI-generated but human-approved before deployment.

### Privacy Considerations

- Customer data stays in existing systems (Shopify, email)
- AI receives only necessary context (order summary, not full history)
- Self-hosted n8n for workflow logic
- Option to run classification locally via Ollama

## Timeline

**Week 1**: Intake integration, classification prompt development

**Week 2**: Slack routing, auto-response templates

**Week 3**: Testing with 2 weeks of historical tickets

**Week 4**: Shadow mode (AI classifies, humans verify)

**Week 5-6**: Gradual auto-response rollout (10% → 50% → 100%)

**Ongoing Costs**:
| Item | Monthly |
|------|---------|
| Claude API (classification + drafting) | €120 |
| Ollama (self-hosted, pre-filter) | €0 |
| n8n (self-hosted) | €0 |
| Slack (existing) | €0 |
| **Total** | **€120/month** |

vs. hiring an additional support agent at €3,500/month.

## Key Learnings

1. **Classification accuracy is everything**: Spend 80% of time on prompt engineering
2. **Start with low-risk auto-responses**: Order status is safe; complaints are not
3. **Human override is easy**: One-click to stop auto-response for specific customer
4. **Measure what matters**: CSAT improved more than volume handled

## Build This Yourself

Here's the architecture for building a smart support triage system.

### Node-by-Node Breakdown

**1. Email Trigger (IMAP)**

Monitor your support inbox for incoming messages. The trigger polls every 2 minutes (configurable) and captures:
- Sender email
- Subject line
- Message body (text and HTML)
- Timestamp

Alternative: Use a webhook if your support platform (Zendesk, Intercom) can push events.

**2. Pre-Filter with Ollama**

Before calling Claude's API, run a quick local classification using Ollama (Mistral 7B works well). This handles 80% of clear-cut cases cheaply:

```
order-status | returns | product | payment | account | complaint | spam | other
```

Why two-stage? Cost optimization. Ollama is free/local; Claude API costs per token. Route only ambiguous or high-stakes messages to Claude.

**3. Escalation Check**

Before detailed analysis, scan for escalation keywords: "lawyer", "lawsuit", "fraud", "police", "legal action". These bypass normal routing and go straight to `#support-urgent` with maximum priority.

**4. Claude Deep Analysis**

For complex or ambiguous tickets, Claude provides:
- **Urgency score (1-5)**: Payment failed = 5, general question = 2
- **Category**: More nuanced than pre-filter
- **Auto-resolvable**: Can this be answered with order lookup + FAQ?
- **Sentiment**: Detect angry customers for human handling
- **Suggested response**: Draft reply if auto-resolvable
- **Confidence score**: Only auto-respond if >90%

**5. Category-Based Slack Routing**

Route tickets to specialized channels:
- `#support-billing` → Payment issues (urgency 4-5)
- `#support-orders` → Shipping, delivery questions
- `#support-returns` → Return/refund requests
- `#support-general` → Everything else

Each Slack message includes: customer email, urgency, AI summary, and whether auto-response was sent.

**6. Auto-Response Logic (Optional)**

For tickets marked `auto_resolvable: true` with high confidence and non-angry sentiment:
- Fetch order status from your shop API
- Generate personalized response using template + live data
- Send immediately (or queue for human review)
- Log for spot-checking

### Get the Starter Workflow

> **Not a screenshot: the real workflow.** This is importable n8n JSON: read every node, wire in your own credentials, run it. It is the build as designed rather than an export from a running instance, so treat it as a starting point you can verify by reading, not as a system with production mileage on it. The workflows behind the [live demos](/en/projects/) are the ones exported from my own n8n.
>
> [Download n8n-support-triage.json](/workflows/n8n-support-triage.json)

**Quick Setup:**
1. Import JSON via n8n Settings → Import Workflow
2. Configure credentials (IMAP for support inbox, Slack, Anthropic API)
3. Set up Ollama locally or skip pre-filter (Claude-only mode)
4. Create Slack channels (#support-urgent, #support-billing, etc.)
5. Customize urgency levels and categories for your business

This starter implements classification and routing. A full implementation would add auto-response templates, order status API integration, confidence thresholds, CSAT tracking, and agent assignment logic, the operational details that make the difference between a demo and a system your team relies on.

## Technical detail

For a detailed technical walkthrough on building customer service bots with n8n, see my personal blog: **[Building Customer Service Bots with n8n](https://leinss.xyz/blog/en/n8n-customer-service/)**, which covers intent classification, context retrieval and response generation.

## Your turn

Support team drowning in repetitive queries?

1. **Categorize**: What % of tickets are truly repetitive?
2. **Audit**: Which queries could be auto-answered with data you already have?
3. **Pilot**: Start with one category, e.g. order status.

For the wider picture on where AI fits into customer support, see [automating communication without losing the human touch](/en/blog/automating-communication/).

[Book a free strategy call](https://cal.com/tobias-leinss/strategymeeting), I'll analyze your support patterns and show what's automatable.
