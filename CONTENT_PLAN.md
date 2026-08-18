# Content Plan — consulting.leinss.xyz

Editorial calendar for the bilingual (DE/EN) blog. Every post ships as a
language pair with bidirectional `alternateSlug`, an answer block at the top
(`> **Kurz gesagt:** / **Short answer:**`), a scan table, query-shaped headings,
and internal links to a service pillar, a live demo, and a related post.

Formats are prioritised by how often AI answer engines cite them: comparison
pages first, then guides and listicles, then industry pages.

## Service pillars (link targets)

| Pillar | DE slug | EN slug |
|--------|---------|---------|
| CRM & Sales | `crm-vertriebsautomatisierung` | `crm-sales-automation` |
| Documents & Data | `dokumenten-workflows` | `document-workflows` |
| Communication | `kommunikationsautomatisierung` | `communication-automation` |
| Integrations & APIs | `integrationen-apis` | `integrations-apis` |

## Live demos (real numbers — never invent)

| Demo | Result | Mounted on (DE / EN) |
|------|--------|----------------------|
| Invoice reader | ~4 h/week → ~15 min | `rechnungsverarbeitung-automatisieren` / `automating-invoice-processing` |
| Lead response | ~6 h → under 5 min | `kommunikation-automatisieren-menschlich-bleiben` / `automating-communication` |
| Meeting minutes | 1 h → ~2 min | `meeting-protokoll-automatisieren` / `meeting-minutes-automation` |
| Spreadsheet rescue | qualitative | `von-tabellen-zu-systemen` / `from-spreadsheets-to-systems` |
| Support assistant | qualitative | `faq-assistent-ki-support` / `faq-automation-ai-support` |

## Published

### Comparison pages
- **n8n vs Make vs Zapier** — three-way decision table + pricing-model explainer + verdict. `n8n-vs-make-vs-zapier` (DE/EN). Target: "n8n vs zapier", "n8n vs make", "best automation tool".
- **n8n vs Zapier** — focused head-to-head for growing SMBs; cost-at-scale + self-hosting + DSGVO. `n8n-vs-zapier` (DE/EN).

### Listicles
- **7 processes every SMB should automate** — threads all five demos + four pillars. `7-prozesse-die-jeder-mittelstaendler-automatisieren-sollte` / `7-processes-every-smb-should-automate`.
- **5 signs your business needs automation** (existing) — cluster anchor. `5-zeichen-...` / `5-signs-...`.

### Industry pages
- **Tax & accounting firms** — document data entry, chasing documents, DSGVO/Steuergeheimnis. `automatisierung-fuer-steuerberater` / `automation-for-tax-advisors`.
- **E-commerce** — inventory sync, support triage, order updates, cart recovery. `automatisierung-fuer-ecommerce` / `automation-for-ecommerce`.

## Queued

### Comparison pages
- **Make vs n8n for document workflows** — narrower angle on the two most capable tools.
- **Self-hosted vs cloud automation** — data-residency decision for DACH.
- **n8n vs Power Automate** — for Microsoft-heavy shops.

### Listicles / guides
- **Automation ROI: how to calculate payback** — expand the existing ROI post into a worked example with a table.
- **When NOT to automate** — the honest counter-listicle; builds trust.
- **First 30 days with n8n** — onboarding guide for a new self-hosted setup.

### Industry pages (one genuine page per verified vertical — no thin spam)
- **Handwerk / trades** — quoting, scheduling, invoicing, follow-up.
- **Agencies** — client reporting, onboarding, retainer status.
- **Property management** — tenant requests, document handling, reminders.

## Cadence

- **New post pair:** aim for two per month, alternating format (comparison → listicle/industry).
- **Freshness refresh:** review every post's `updatedDate` quarterly; bump the date and update any figures or tool facts that have drifted. Comparison pages get priority — tool pricing models and feature sets change.
- **Before publishing:** run `pnpm lint:blog-parity` (DE/EN parity + hero-image mapping) and `pnpm astro check`. Both twins publish together or neither does.

## House rules

- Real numbers only — the demo results above are the only metrics to cite; label anything illustrative as such.
- Every post links to a pillar, a demo, and a related post.
- Native German, not translated English. Plain, direct voice; no filler.
- New posts reuse an existing mapped hero image (`src/assets/blogImages.ts`) unless a new one is generated and registered.
