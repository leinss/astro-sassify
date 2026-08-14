---
title: "Escaping Spreadsheet Hell: Auto-Clean Contact Lists with n8n and AI"
description: "How to clean, normalize, and deduplicate messy contact lists in seconds using n8n and Claude – instead of spending hours on manual data work."
pubDate: 2026-01-22
category: automation
tags: ["spreadsheets", "excel", "contacts", "data-cleaning", "n8n", "ai"]
heroImage: "/images/blog/from-spreadsheets-to-systems.png"
draft: false
lang: en
alternateSlug: "von-tabellen-zu-systemen"
---

> **Short answer:** To clean a messy contact list automatically, feed the CSV to a workflow that sends each row to Claude and returns structured JSON: trimmed whitespace, lowercased emails, phone numbers in one format, properly capitalised names, matched company names, and duplicates removed — including fuzzy matches. Cleaning 100 contacts drops from hours to about 20 seconds.

Every business has one: the contact list that grew over years. Names with inconsistent capitalization, email addresses in ALL CAPS, phone numbers in four different formats, company names sometimes "LLC" and sometimes "llc" – and somewhere in there, duplicate entries hiding.

Cleaning it manually costs hours, sometimes days. And just when you're done, new entries come in and break everything again.

## What does dirty data actually cost you?

The visible problems are obvious. But the invisible ones are more expensive:

- **Duplicate emails sent** damage your reputation with recipients and email providers
- **Failed validations** because "John Smith" and "john smith" are treated as two different people
- **Missed contacts** because searching for "Acme Corp" finds nothing, even though "acme corp" and "Acme corp" are in the system
- **Compliance risk** from incorrect or outdated records

The result: the CRM that was supposed to solve the problem becomes the problem itself.

## The Spreadsheet Rescuer: Automated Data Cleaning with AI

This workflow solves exactly that. You upload your CSV data (or paste it directly), and n8n sends it to Claude – which:

1. Removes **leading and trailing whitespace**
2. Normalizes **email addresses** (lowercase) and checks syntactic validity
3. Standardizes **phone numbers** into a consistent format (e.g. `+1 555 123 4567`)
4. Correctly capitalizes **names**
5. Makes **company names** consistent (detects "acme corp" and "Acme Corp" as identical)
6. Finds and removes **duplicates** – including fuzzy matches (same person, slightly different spelling)
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
[Claude API (Clean Data)]
  - Tool-use: structured JSON output
  - Prompt defines cleaning rules
        ↓
[Format Result]
  - Cleaned rows → CSV
  - Build change log
        ↓
[Return JSON Response]
  - headers, cleaned_rows, changes, stats
```

The key: Claude returns the result as structured JSON via tool-use – not as text. This makes the output reliably parseable no matter how many special characters are in the data.

## Time Savings in Numbers

| Task | Manual | With Workflow |
|------|--------|---------------|
| Clean 100 contacts | 2–4 hours | ~20 seconds |
| Clean 1,000 contacts | 1–2 days | ~3 minutes |
| Find duplicates | 30 min per 100 | Automatic |
| Normalize phone numbers | 1 min per number | In batch |

For monthly-maintained lists: **annual savings of 10–30 hours** per person.

## Customization Options

The workflow is a starting point. Common extensions:

- **Describe your target system** directly (e.g. "Export only contacts with valid US phone numbers for HubSpot import")
- **Add more fields**: addresses, zip codes, IBAN validation
- **Email delivery** after cleaning (result sent directly to your inbox)
- **Scheduling** for regular cleanup of a Google Sheet

## Privacy Note

Data is used exclusively for AI processing and not stored afterward. The workflow runs on a self-hosted n8n server. For production use, add your own API key and run the workflow on your own instance.

## Download the Workflow

> **📥 Not a screenshot — the real workflow.** This is the exact n8n JSON, exported from a running instance. Import it into your own n8n and inspect every node yourself.
>
> [Download n8n Workflow (JSON)](/workflows/excel-retter.json)

Import: n8n → Workflows → Import from File → Upload JSON → Set credentials (Anthropic API Key)

## Technical Deep Dive

If you're interested in the implementation details — why Kimi k2.5 instead of Claude tool-use, how RFC 4180-compliant CSV quoting works in JavaScript, and which prompt engineering techniques ensure reliable JSON output:

→ **[Spreadsheet Rescuer: CSV Cleaning with n8n and Kimi k2.5](https://leinss.xyz/blog/en/spreadsheet-cleaning-technical/)** *(leinss.xyz)*

Related reading: the [multi-platform inventory sync reference build](/en/blog/case-study-ecommerce-sync/), which is the same problem at four-system scale.

---

*Interested in a tailored solution for your specific data challenges? [Get in touch.](https://cal.com/tobias-leinss/strategymeeting)*
