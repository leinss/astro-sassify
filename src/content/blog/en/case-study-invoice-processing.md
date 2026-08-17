---
title: "Reference Build: AI-Powered Invoice Processing"
description: "The full architecture for a vision-AI invoice pipeline on n8n and Claude Vision (intake, extraction, validation, DATEV export) with the workflow available to download and the live demo running on your own documents."
pubDate: 2026-06-10
heroImage: "/images/blog/case-study-invoice.png"
category: reference-build
tags: ["invoices", "ocr", "n8n", "claude-vision", "ollama", "accounting", "ai"]
draft: false
lang: en
alternateSlug: "fallstudie-rechnungsverarbeitung"
---

> **Short answer:** A vision model reads each invoice (PDF, scan, or a photo taken on a phone) and returns structured data: supplier, tax ID, net, VAT, line items. Business rules check the arithmetic and the VAT before anything is exported, and anything the model is unsure about goes to a human queue instead of into your books. Built on n8n with Claude Vision, or entirely on-premise with Ollama and DeepSeek-OCR when the data cannot leave the building.

> **What this is:** a reference build. The architecture, the extraction schema and the validation rules, written up so you can judge the engineering. There are no client figures here. What you can check yourself is the running system: **[feed the demo one of your own invoices →](/en/blog/automating-invoice-processing/)**.

## The problem it solves

Invoices arrive by email, in cloud folders, and through client portals, in every format there is. Someone opens each one and retypes it into DATEV or Lexware. That work is slow, it is dull, and it is at its worst exactly when volume peaks, at month-end and in tax season, which is also when a transposed digit is most likely and least likely to be caught.

The task splits cleanly in two: reading the document, which a vision model now does well, and deciding whether the reading can be trusted, which is arithmetic and business rules. This build gives the first half to a model and keeps the second half in code.

## At a glance

| | |
|---|---|
| **Stack** | n8n intake + Claude Vision extraction (or local Ollama + DeepSeek-OCR) + validation + DATEV/CSV export |
| **What it extracts** | Supplier, address, tax ID, invoice number, dates, net, VAT, gross, line items |
| **Guardrails** | Line items must sum to net, VAT rate must be valid, duplicate invoice numbers rejected, low-confidence fields queued for review |
| **You can inspect** | The full n8n JSON, exported from the running instance, in both cloud and on-premise variants |

This is the kind of build I do under [document & data workflows](/en/services/document-workflows/). You can try the [invoice-reader demo](/en/projects/) on real documents.

## The Solution

A vision AI pipeline reads, understands, and validates each invoice.

### Tool Stack

| Component | Tool | Why |
|-----------|------|-----|
| Document Intake | Google Drive / Email | Clients already used these |
| Workflow Engine | n8n | Self-hosted for data privacy |
| Document AI (Cloud) | Claude Vision API | Handles rotated, skewed and low-resolution scans |
| Document AI (Local) | Ollama + DeepSeek-OCR | For clients requiring on-premise |
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

**Ollama + DeepSeek-OCR Alternative**: For clients in regulated industries (healthcare, legal), we deploy DeepSeek-OCR locally. Processing stays on-premise, meeting strict compliance requirements. The workflow automatically detects PDFs and converts them to images for processing.

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

## What changes, and what does not

I am not going to give you a before-and-after table. I have not run this pipeline inside your firm, and numbers invented for a fictional one would tell you nothing.

What the architecture changes is structural:

- **Reading stops being the bottleneck.** Extraction takes seconds per document and runs as many in parallel as you let it, so a month-end spike no longer becomes a queue.
- **Errors surface before the export, not after the booking.** The arithmetic and VAT checks run on every invoice, every time, which is the part a tired human at 6pm does not.
- **Uncertainty gets a place to go.** Anything the model is unsure about lands in a review queue with its reasoning attached, instead of quietly becoming a wrong number in your books.

The figure that decides whether this is worth building for you is your touchless rate: the share of invoices that pass validation with no human involvement. It depends almost entirely on how uniform your suppliers' documents are, so it is not something I can quote at you in advance. Run a month of real invoices through the pipeline in review-everything mode and count. That measurement costs one afternoon and is worth more than any table I could put here.

## Technical detail

### Handling Edge Cases

Real invoices are messy. Here is how the pipeline handles them:

**Multi-page invoices**: Claude Vision processes each page, n8n merges the extracted data.

**Handwritten notes**: AI ignores handwritten additions, flags if covering critical data.

**Credit notes**: Detected automatically, amounts stored as negative values.

**Foreign currencies**: Converted to EUR using ECB rates, original preserved.

### Privacy & Compliance

In accounting, data handling decides whether a build is usable at all:

- **Self-hosted n8n**: Workflow engine runs on your own infrastructure
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

## Build This Yourself

Want to implement this workflow? Here's how each piece connects.

### Node-by-Node Breakdown

**1. Document Trigger (Email or Folder Watch)**

The workflow starts when a new document arrives. You have two options:
- **Email Trigger**: Monitors a dedicated inbox via IMAP. When an invoice lands, the workflow fires within 30 seconds.
- **Folder Watch**: For local/self-hosted setups, watches a directory for new PDFs.

```
Trigger → Extract attachment → Pass to AI
```

**2. Claude Vision Analysis**

The core extraction happens here. Claude receives the document image and a structured prompt asking for specific fields. The prompt is critical, it defines the exact JSON structure you need for your accounting software.

Key prompt elements:
- Explicit JSON schema with all required fields
- Instructions to return "only valid JSON, no explanation"
- Field-level guidance for ambiguous cases (e.g., "tax_id" vs "VAT number")

**3. Response Parsing**

Claude returns JSON, but sometimes wrapped in markdown code blocks or with extra text. The Code node:
- Strips markdown formatting
- Validates JSON structure
- Merges with source metadata (email sender, timestamp)
- Flags parse failures for manual review

**4. Validation Layer**

Before exporting, every invoice passes sanity checks:
- Math verification: Do line items sum to the total?
- VAT rate validation: Is 19% or 7% (German rates) applied correctly?
- Duplicate detection: Hash the invoice number to catch re-submissions

**5. Export & Archive**

Finally, validated data exports to your accounting system format (DATEV XML, CSV) and archives the original with processing metadata.

### Get the Starter Workflow

> **Not a screenshot: the real workflow.** This is importable n8n JSON: read every node, wire in your own credentials, run it. It is the build as designed rather than an export from a running instance, so treat it as a starting point you can verify by reading, not as a system with production mileage on it. The workflows behind the [live demos](/en/projects/) are the ones exported from my own n8n.
>
> **Cloud version (Claude API):** [Download n8n-invoice-cloud.json](/workflows/n8n-invoice-cloud.json)
> **Local version (Ollama):** [Download n8n-invoice-local.json](/workflows/n8n-invoice-local.json)

**Quick Setup:**
1. Import JSON via n8n Settings → Import Workflow
2. Configure credentials (IMAP, Anthropic/Ollama, file storage)
3. Adjust the prompt for your invoice format
4. Test with 5-10 sample invoices

This starter handles the core extraction flow. A tailored implementation would add your specific validation rules, accounting software export format, error alerting, and multi-source intake, the pieces that make it production-ready for your setup.

## Learn More

For a conceptual overview of AI-powered invoice automation and ROI calculations, see: **[Automating Invoice Processing with AI](/en/blog/automating-invoice-processing/)**

## Your Turn

Processing stacks of documents manually?

1. **Measure**: How long does one document actually take?
2. **Sample**: Collect 20 typical documents in their messiest formats
3. **Test**: We can run a proof-of-concept on your samples

[Book a free assessment](https://cal.com/tobias-leinss/strategymeeting), I'll show you what accuracy you could expect with your document types.
