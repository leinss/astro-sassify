---
title: "Case Study: AI Support Triage for E-commerce"
description: "How we reduced first-response time from 8 hours to 15 minutes and auto-resolved 60% of support tickets using AI-powered classification and routing."
pubDate: 2025-01-27
heroImage: "/images/blog/case-study-support.png"
category: case-study
tags: ["support", "triage", "n8n", "slack", "ai", "claude", "ollama", "e-commerce"]
draft: false
lang: en
alternateSlug: "fallstudie-support-triage"
---

# AI Support Triage for E-commerce

An online retailer's support team was overwhelmed. Customer messages piled up, urgent issues got buried, and response times stretched to days. We built an AI triage system that classifies, routes, and even resolves common queries automatically.

## The Challenge

**Client**: E-commerce retailer, 50k monthly orders, 5-person support team

**Pain Points**:
- Support requests via email, contact form, and social media
- No prioritization—first come, first served (even if it's "where's my order?" vs. "payment failed")
- Repetitive questions consumed 70% of agent time
- Weekend/holiday backlog took days to clear

**Before Automation**:
| Metric | Value |
|--------|-------|
| First response time | 8 hours (average) |
| Resolution time | 24-48 hours |
| Tickets per agent/day | 40-50 |
| Repetitive queries | 70% |
| Customer satisfaction | 3.2/5 |

## The Solution

We deployed an AI-powered triage layer that sits between customers and the support team.

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

For cost optimization, we run Mistral 7B locally for initial classification:
- Handles 80% of messages (clear-cut cases)
- Claude API only called for ambiguous or high-urgency
- Reduces API costs by 70%

## Results

After 6 weeks in production:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| First response time | 8 hours | 15 minutes | -97% |
| Resolution time | 24-48 hours | 4 hours | -83% |
| Tickets per agent/day | 40-50 | 25-30 (complex only) | -40% |
| Auto-resolved | 0% | 60% | +60% |
| Customer satisfaction | 3.2/5 | 4.6/5 | +44% |

**Breakdown of Auto-Resolution**:
- Order status inquiries: 95% auto-resolved
- Shipping questions: 85% auto-resolved
- Return policy questions: 80% auto-resolved
- Account issues: 40% auto-resolved (often need manual verification)

**Agent Feedback**: "I now handle interesting problems instead of copy-pasting tracking numbers."

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

## Technical Deep Dive

For a detailed technical walkthrough on building customer service bots with n8n, see my personal blog: **[Building Customer Service Bots with n8n](https://leinss.xyz/blog/en/n8n-customer-service/)** — covers intent classification, context retrieval, and response generation.

## Your Turn

Support team drowning in repetitive queries?

1. **Categorize**: What % of tickets are truly repetitive?
2. **Audit**: Which queries could be auto-answered with data you have?
3. **Pilot**: Start with one category (e.g., order status)

[Book a free strategy call](https://cal.com/tobias-leinss/strategymeeting) — I'll analyze your support patterns and show what's automatable.
