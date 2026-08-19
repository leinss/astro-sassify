# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server at localhost:4321
pnpm build        # Production build to ./dist/
pnpm preview      # Build + preview locally
pnpm astro check  # TypeScript validation
```

## Architecture

**Bilingual Astro 5 site** for Leinss Consulting (consulting.leinss.xyz) with static output for GitHub Pages.

### Routing & i18n

Routes use ISO locale prefixes:
- `/de/` → German (default)
- `/en/` → English

Root `/` has locale detection that redirects to `/de/` or `/en/` based on browser language. Legacy URLs (`/ki-kommunikation/`, `/ai-communication/`) redirect to new paths.

All static content translations live in `src/assets/i18n.json`. Components receive language via props:
```typescript
const { lang } = Astro.props; // 'en' | 'de'
const basePath = lang === "en" ? "/en" : "/de";
```

### Content Collections

Blog posts in `src/content/blog/{de,en}/` with schema defined in `src/content/config.ts`:
- Categories: `automation | integration | crm | documents | communication | case-study`
- Required: `lang: 'de' | 'en'`, `draft: boolean`
- Optional: `alternateSlug` for cross-language linking

### Key Files

- `src/assets/config.ts` - External links (Cal.com booking URLs)
- `src/assets/i18n.json` - All UI translations
- `src/layouts/Layout.astro` - Base layout with dark mode, Umami analytics, view transitions
- `src/components/Header.astro` - Sticky nav with language switcher
- `src/pages/index.astro` - Root redirect with locale detection

### Styling Patterns

Tailwind with custom animations in `tailwind.config.mjs`. Scroll-triggered reveals use:
```html
<div class="reveal-animation" data-animate="fade-up">
```
Intersection Observer in Layout.astro handles activation.

### Newsletter

Newsletter subscription uses Listmonk public API directly (client-side fetch to public endpoint).

## Deployment

GitHub Actions deploys to GitHub Pages on push to `release` branch. Uses pnpm 10.6.5 and Node.js 22.13.
