---
title: "Case Study: Multi-Platform Inventory Sync for Retail"
description: "A fictional scenario showing how to eliminate 95% of stock discrepancies and reduce listing time from 30 minutes to 3 minutes across Shopify, WooCommerce, and Amazon."
pubDate: 2026-06-28
heroImage: "/images/blog/case-study-ecommerce.png"
category: case-study
tags: ["e-commerce", "inventory", "n8n", "shopify", "woocommerce", "amazon", "ai", "claude", "ollama"]
draft: false
lang: en
alternateSlug: "fallstudie-ecommerce-sync"
---

> **Short answer:** A multi-channel retailer with 2,000 SKUs kept overselling because stock lived in spreadsheets and synced by hand. One central n8n hub with real-time webhooks cut stock discrepancies by 95%, dropped new-product listing time from 30 minutes to 3, and delivered its first-ever zero-oversell Black Friday.

> **Note:** This is a fictional scenario illustrating what this kind of automation can achieve. The company profile and metrics are representative examples based on common industry patterns, not a specific client.

A retailer sold across Shopify, WooCommerce, Amazon, and eBay. Each platform lived in isolation, so overselling was routine, listings drifted apart, and the team burned hours on manual updates. Here's the central sync hub I'd build, and the numbers it moved.

## At a glance

| | |
|---|---|
| **Client / Industry** | Multi-channel retailer, 2,000 SKUs, 4 sales platforms |
| **Problem** | Stock in spreadsheets, manual sync, overselling, 30+ min per listing |
| **Solution** | Central n8n hub + Airtable source of truth + real-time webhooks + AI listing content |
| **Result** | Stock discrepancies -95%, oversells 8-12/mo → 0-1, listing time 30 → 3 min, inventory accuracy 85% → 99.7% |

This is the kind of build I do under [integrations & APIs](/en/services/integrations-apis/) — connecting tools so data moves on its own. See the [live demos](/en/projects/) for working examples.

## The challenge

**Example Company**: Multi-channel retailer, 2,000 SKUs, 4 sales platforms

**Pain Points**:
- Inventory managed in spreadsheets, synced manually to each platform
- Overselling during high-traffic periods (Black Friday nightmare)
- Same product had different descriptions per marketplace
- New product listings took 30+ minutes each (duplicate work)
- No visibility into true stock levels

**Before Automation**:
| Metric | Value |
|--------|-------|
| Stock discrepancies per week | 15-20 incidents |
| Oversells per month | 8-12 orders |
| Time to list new product | 30+ minutes |
| Inventory sync frequency | Daily (manual) |
| Time spent on inventory ops | 15 hrs/week |

## The Solution

We built a central inventory hub with real-time sync and AI-powered product management.

### Tool Stack

| Component | Tool | Why |
|-----------|------|-----|
| Central Hub | Airtable / Notion | Flexible, API-friendly, visual |
| Workflow Engine | n8n | Real-time webhooks, self-hosted |
| Shopify Sync | n8n + Shopify API | Native integration |
| WooCommerce Sync | n8n + WooCommerce API | REST API |
| Amazon Sync | n8n + Amazon SP-API | Marketplace integration |
| AI Product Assistant | Claude API | Categorization, descriptions |
| AI Local | Ollama | Anomaly detection, cost savings |

### Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Shopify   │◄───►│             │◄───►│ WooCommerce │
└─────────────┘     │   Central   │     └─────────────┘
                    │   n8n Hub   │
┌─────────────┐     │             │     ┌─────────────┐
│   Amazon    │◄───►│             │◄───►│    eBay     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │   Airtable │
                    │  (Source)  │
                    └───────────┘
```

### Core Features

#### 1. Real-Time Inventory Sync

**How it works**:
- Each platform sends webhooks on order/inventory change
- n8n receives event, updates central Airtable
- Change propagates to all other platforms within 60 seconds

**Webhook Events Handled**:
- Order placed → Decrement stock across all platforms
- Order cancelled → Increment stock
- Manual adjustment → Sync to all platforms
- Refund processed → Restock if applicable

**Conflict Resolution**:
When two orders come in simultaneously for the last item:
1. First webhook wins (atomic update in Airtable)
2. Second order triggers stock alert
3. Human decides: fulfill from alternate source or cancel

#### 2. AI-Powered Product Categorization

New products need proper categorization for each marketplace. AI handles this automatically.

**Input** (from supplier data):
```
Product: "Ergonomic Wireless Mouse, 2.4GHz, Silent Click, Black"
EAN: 1234567890123
Brand: TechFlow
```

**AI Output**:
```json
{
  "amazon_category": "Electronics > Computers > Mice",
  "amazon_keywords": ["wireless mouse", "ergonomic mouse", "silent mouse"],
  "shopify_type": "Computer Accessories",
  "shopify_tags": ["wireless", "ergonomic", "mouse", "office"],
  "ebay_category_id": 23160,
  "attributes": {
    "connectivity": "2.4GHz Wireless",
    "color": "Black",
    "feature": "Silent Click"
  }
}
```

The AI maps products to each platform's taxonomy automatically.

#### 3. Stock Anomaly Detection

Ollama runs locally to detect inventory anomalies:

**Monitored Patterns**:
- Sudden large stock decreases (theft? bulk order?)
- Stock count doesn't match sales velocity
- Platform counts diverge from central hub
- Unusual refund patterns

**Alert Example**:
```
⚠️ Anomaly Detected
Product: SKU-1234 (Wireless Mouse Black)
Issue: Shopify shows 45 units, central hub shows 23
Action: Manual stock check required
Possible cause: Unrecorded shipment or sync failure
```

#### 4. AI Description Generation

Creating marketplace-specific listings used to take 30 minutes. Now:

**Input**: Basic product info + one photo

**AI Generates**:
- Amazon listing (bullet points, A+ content ready)
- Shopify description (brand voice, SEO optimized)
- eBay listing (marketplace-specific keywords)
- Translations (German, French, Spanish)

**Before → after**:

*Input*:
```
Mouse, wireless, ergonomic, black, silent clicks
```

*Shopify Output*:
```
Work in comfort with the TechFlow Ergonomic Wireless Mouse.
Designed for all-day use, featuring silent click technology
that won't disturb your colleagues. The 2.4GHz wireless
connection provides reliable, lag-free performance up to 10m.

✓ Ergonomic design reduces wrist strain
✓ Silent switches for quiet operation
✓ 12-month battery life
✓ Plug & play USB receiver
```

*Amazon Output*:
```
• ERGONOMIC COMFORT: Scientifically designed shape supports
  natural hand position, reducing fatigue during extended use
• SILENT CLICK TECHNOLOGY: Noise-reduced switches perfect
  for office, library, or shared workspaces
• RELIABLE 2.4GHz WIRELESS: Strong connection up to 33ft,
  no interference from other devices
...
```

### Implementation Highlights

#### Shopify Webhook Setup

```javascript
// n8n webhook node configuration
{
  "topic": "orders/create",
  "address": "https://n8n.yourdomain.com/webhook/shopify-orders",
  "format": "json"
}
```

When an order arrives:
1. Extract line items and quantities
2. Update Airtable stock counts
3. Trigger sync to WooCommerce, Amazon, eBay
4. Log transaction for audit trail

#### Amazon SP-API Integration

Amazon requires OAuth and signed requests. n8n handles:
- Token refresh (automatic)
- Request signing
- Rate limiting (throttle to avoid 429s)
- Feed submission for bulk updates

#### Handling Platform Delays

Not all platforms update instantly:
- Shopify: Real-time webhooks ✓
- WooCommerce: Real-time webhooks ✓
- Amazon: Feeds processed every 15 min
- eBay: API calls, near real-time

For Amazon's delay, we maintain a "pending" state:
- Immediately mark stock as "reserved" in central hub
- Confirm when Amazon feed completes
- Alert if feed fails

## Results

After 2 months in production:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Stock discrepancies/week | 15-20 | <1 | -95% |
| Oversells/month | 8-12 | 0-1 | -92% |
| Time to list new product | 30 min | 3 min | -90% |
| Inventory sync frequency | Daily | Real-time | ∞ |
| Time on inventory ops | 15 hrs/week | 3 hrs/week | -80% |

**Additional Wins**:
- Black Friday: Zero oversells (first time ever)
- New marketplace (Kaufland): Added in 2 days, not 2 weeks
- Inventory accuracy: 99.7% (up from 85%)

**ROI**: €4,500/month in labor savings + €2,000/month in avoided oversell costs.

## Technical Details

### Stock Buffer Strategy

To prevent overselling during sync delays:
- Set platform stock = central stock - buffer
- Buffer varies by velocity: fast sellers get larger buffer
- Auto-adjusted weekly based on sales patterns

### Multi-Language Product Content

For German and French markets:
1. AI generates base description in English
2. Claude translates with marketplace-specific terminology
3. Human review for top 20% sellers, auto-publish rest

### Monitoring Dashboard

Real-time visibility in Airtable:
- Stock levels across all platforms
- Sync status (last update, any failures)
- Anomaly alerts
- Sales velocity per channel

## Costs

| Item | Monthly |
|------|---------|
| Airtable Pro | €20 |
| n8n self-hosted | €0 |
| Claude API (descriptions, categorization) | €45 |
| Ollama (anomaly detection) | €0 |
| **Total** | **€65/month** |

vs. 15 hours/week of manual work = €1,500/month equivalent.

## Key Learnings

1. **Webhooks > Polling**: Real-time sync prevents most oversells
2. **Single source of truth**: Airtable is authoritative, platforms are mirrors
3. **Buffer for slow platforms**: Amazon's 15-min delay needs accounting
4. **AI for tedious, not critical**: Use AI for descriptions, not stock counts

## Build This Yourself

Here's how to build a multi-platform inventory sync from scratch.

### Node-by-Node Breakdown

**1. Universal Webhook Intake**

A single webhook endpoint receives events from all platforms. The first step normalizes different payload formats:

```javascript
// Detect platform from payload structure
if (body.topic?.includes('shopify')) platform = 'shopify';
else if (body.source === 'woocommerce') platform = 'woocommerce';
else if (body.NotificationType) platform = 'amazon';
```

Output: Consistent `{ sku, quantity_change, new_quantity, source }` regardless of origin.

**2. Central Hub Lookup (Airtable)**

Query your central inventory database by SKU. Airtable (or Notion) serves as the single source of truth:
- Current stock level
- Platform-specific IDs (Shopify variant ID, WooCommerce product ID, Amazon ASIN)
- Last sync timestamp
- Buffer quantities per platform

**3. Stock Calculation**

Handle two update types:
- **Absolute**: "Set stock to 50" → new_quantity = 50
- **Relative**: "Order placed, -1" → new_quantity = current - 1

Always enforce non-negative values. Log the delta for audit trails.

**4. Update Central Hub**

Write the new stock level back to Airtable with:
- Updated quantity
- Timestamp
- Source platform (to prevent echo loops)

**5. Platform Distribution (Split → Switch)**

For each platform that needs updating (all except the source):
- **Shopify**: GraphQL API or REST `/variants/{id}/inventory_levels`
- **WooCommerce**: REST API `PUT /products/{id}`
- **Amazon**: SP-API inventory feed (batch, 15-min processing)

Handle platform-specific quirks:
- Shopify needs location_id for multi-location inventory
- Amazon requires XML feed format and polling for confirmation
- WooCommerce stock management must be enabled per product

**6. Confirmation & Alerting**

After successful sync:
- Slack notification with SKU, new level, platforms updated
- Webhook response confirms completion
- Log for debugging sync issues

### AI-Powered Categorization (Optional Node)

When listing new products, Claude can auto-categorize:
- Amazon category path and keywords
- Shopify product type and tags
- Attribute extraction from product name

This node is disabled by default in the starter—enable it for new product workflows.

### Get the Starter Workflow

> **📥 Not a screenshot — the real workflow.** This is the exact n8n JSON, exported from a running instance. Import it and inspect every node yourself.
>
> [Download n8n-ecommerce-sync.json](/workflows/n8n-ecommerce-sync.json)

**Quick Setup:**
1. Import JSON via n8n Settings → Import Workflow
2. Configure credentials (Airtable, Shopify, WooCommerce, Slack)
3. Set up Airtable base with: SKU, stock, shopify_id, wc_id, amazon_asin
4. Configure webhooks in each platform to point to your n8n endpoint
5. Test with manual stock adjustments

This starter handles the core sync loop. A production system would add stock buffers for slow platforms, conflict resolution for simultaneous orders, anomaly detection (Ollama), multi-location support, and retry logic for API failures—the resilience layer that handles Black Friday traffic without breaking a sweat.

## Your turn

Selling across multiple platforms?

1. **Map the mess**: Which platforms? What's the current sync method?
2. **Find the pain**: Oversells, listing time, discrepancies?
3. **Start with sync**: Fix inventory first, then add AI features.

If keeping systems in step is a recurring headache, [solving data-sync nightmares](/en/blog/data-sync-nightmares/) covers the patterns that stop them recurring.

[Book a free strategy call](https://cal.com/tobias-leinss/strategymeeting) — I'll assess your multi-platform setup and recommend a sync strategy.
