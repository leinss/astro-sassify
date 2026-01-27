---
title: "Case Study: AI-Powered Invoice Processing for an Accounting Firm"
description: "How we cut invoice processing from 15 minutes to 90 seconds per document with 99.2% accuracy using n8n, Claude Vision, and intelligent validation."
pubDate: 2025-01-27
heroImage: "/images/blog/case-study-invoice.png"
category: case-study
tags: ["invoices", "ocr", "n8n", "claude-vision", "ollama", "accounting", "ai"]
draft: false
lang: en
alternateSlug: "fallstudie-rechnungsverarbeitung"
---

# AI-Powered Invoice Processing for an Accounting Firm

A mid-sized accounting firm was drowning in paper. Their clients sent hundreds of invoices monthly in every format imaginable—PDFs, scans, photos of receipts. We built an AI-powered extraction pipeline that transformed their document processing.

## The Challenge

**Client**: Accounting firm, 8 staff, 120+ business clients

**Pain Points**:
- Invoices arrived via email, cloud folders, and client portals
- Manual data entry into accounting software (DATEV, Lexware)
- High error rates during busy periods (month-end, tax season)
- Staff burned out on repetitive work instead of advisory services

**Before Automation**:
| Metric | Value |
|--------|-------|
| Time per invoice | 12-15 minutes |
| Daily invoice volume | 80-120 documents |
| Error rate | 3-5% |
| Staff hours on data entry | 25 hrs/week |
| Client complaints about delays | Weekly |

## The Solution

We designed a vision AI pipeline that reads, understands, and validates invoices automatically.

### Tool Stack

| Component | Tool | Why |
|-----------|------|-----|
| Document Intake | Google Drive / Email | Clients already used these |
| Workflow Engine | n8n | Self-hosted for data privacy |
| Document AI (Cloud) | Claude Vision API | Best-in-class document understanding |
| Document AI (Local) | Ollama + LLaVA | For clients requiring on-premise |
| Validation | Custom n8n logic | Business rule enforcement |
| Export | DATEV XML / CSV | Native accounting software format |

### How It Works

```
Email/Drive → Trigger → PDF Extraction → AI Analysis → Validation → Export
```

**Step 1: Document Intake**

n8n monitors multiple sources:
- Dedicated invoice email inbox (`invoices@client.com`)
- Shared Google Drive folders per client
- Webhook endpoint for client portal integrations

New documents trigger the workflow within 30 seconds.

**Step 2: AI Document Analysis**

Claude Vision receives the document image and extracts structured data:

```json
{
  "supplier": {
    "name": "Office Supplies GmbH",
    "address": "Hauptstraße 15, 80331 München",
    "tax_id": "DE123456789"
  },
  "invoice": {
    "number": "2025-00142",
    "date": "2025-01-15",
    "due_date": "2025-02-14",
    "currency": "EUR"
  },
  "line_items": [
    {
      "description": "Printer Paper A4, 500 sheets",
      "quantity": 10,
      "unit_price": 4.99,
      "vat_rate": 19,
      "total": 49.90
    }
  ],
  "totals": {
    "net": 49.90,
    "vat": 9.48,
    "gross": 59.38
  }
}
```

**Why Claude Vision?**
- Handles rotated, skewed, and low-quality scans
- Understands context (identifies invoice vs. quote vs. receipt)
- Multi-language support (German, English, French invoices)
- Extracts implicit data (infers payment terms from text)

**Ollama + LLaVA Alternative**: For clients in regulated industries (healthcare, legal), we deploy LLaVA 13B locally. Processing stays on-premise, meeting strict compliance requirements.

**Step 3: Intelligent Validation**

Before export, every invoice passes validation:

| Check | Logic | Action on Fail |
|-------|-------|----------------|
| Math verification | Sum line items = net total? | Flag for review |
| VAT validation | Rate matches German tax law? | Correct common errors |
| Duplicate detection | Invoice number seen before? | Alert + block |
| Supplier verification | Tax ID in database? | Lookup or flag |
| Date sanity | Future dates, >90 days old? | Review queue |

**Step 4: Export & Routing**

Validated invoices export to:
- DATEV XML format (direct import to accounting software)
- CSV for clients using Lexware or custom systems
- Archive copy to organized folder structure

Failed validations go to a review queue with the AI's reasoning attached.

## Results

After 2 months in production:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Time per invoice | 15 min | 90 sec | -90% |
| Daily throughput | 80-120 | 300+ | +200% |
| Error rate | 3-5% | 0.8% | -84% |
| Staff hours on entry | 25 hrs/week | 4 hrs/week | -84% |
| Processing backlog | 3-5 days | Same day | Eliminated |

**Accuracy Breakdown**:
- 99.2% of invoices processed without human intervention
- 0.6% flagged for review (usually unusual formats)
- 0.2% actual errors (complex multi-page invoices)

**ROI**: €3,200/month saved in labor costs. Implementation paid back in 5 weeks.

## Technical Deep Dive

### Handling Edge Cases

Real-world invoices are messy. Here's how we handle them:

**Multi-page invoices**: Claude Vision processes each page, n8n merges the extracted data.

**Handwritten notes**: AI ignores handwritten additions, flags if covering critical data.

**Credit notes**: Detected automatically, amounts stored as negative values.

**Foreign currencies**: Converted to EUR using ECB rates, original preserved.

### Privacy & Compliance

For an accounting firm, data handling is critical:

- **Self-hosted n8n**: Workflow engine runs on client infrastructure
- **API data handling**: Claude API doesn't store data after processing
- **Audit trail**: Every document logged with timestamp, hash, and processing result
- **Retention policy**: Processed data auto-deleted from pipeline after 30 days

## Implementation Timeline

**Week 1**:
- n8n deployment, Google Drive integration
- Initial Claude Vision prompt engineering

**Week 2**:
- DATEV export format development
- Validation logic implementation

**Week 3**:
- Testing with 200 historical invoices
- Prompt refinement based on edge cases

**Week 4**:
- Staff training (2 hours)
- Parallel run alongside manual process
- Go-live

**Ongoing Costs**:
| Item | Monthly |
|------|---------|
| Claude Vision API (~2,500 invoices) | €75 |
| n8n self-hosted | €0 |
| Google Drive (existing) | €0 |
| **Total** | **€75/month** |

vs. €3,200/month equivalent labor cost.

## Key Learnings

1. **Quality in = Quality out**: Ask clients to send PDFs, not photos of printouts
2. **Validation catches AI mistakes**: 90% of flagged items are correct flags
3. **Start with high-volume clients**: Biggest ROI, most sample data for tuning
4. **Keep humans for exceptions**: Staff now handle only the 0.8% that needs judgment

## Learn More

For a conceptual overview of AI-powered invoice automation and ROI calculations, see: **[Automating Invoice Processing with AI](/en/blog/automating-invoice-processing/)**

## Your Turn

Processing stacks of documents manually?

1. **Measure**: How long does one document actually take?
2. **Sample**: Collect 20 typical documents in their messiest formats
3. **Test**: We can run a proof-of-concept on your samples

[Book a free assessment](https://cal.com/tobias-leinss/strategymeeting) — I'll show you what accuracy you could expect with your document types.
