// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import alpinejs from "@astrojs/alpinejs"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
  site: "https://leinss-consulting.de",
  // Static output for GitHub Pages (newsletter uses Listmonk public API directly)
  output: "static",
  integrations: [
    alpinejs(),
    react(),
    sitemap({
      i18n: {
        defaultLocale: "de",
        locales: {
          de: "de-DE",
          en: "en-US",
        },
      },
      filter: (page) => !page.includes("/404"),
    }),
  ],
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "de",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false, // We handle root redirect with locale detection
    },
  },
  redirects: {
    // Root "/" handled by src/pages/index.astro with locale detection
    // Legacy URL compatibility (SEO) - base paths only (dynamic redirects not supported in static mode)
    "/ki-kommunikation": "/de",
    "/ai-communication": "/en",
    // Legacy legal page redirects
    "/ki-kommunikation/datenschutzerklaerung": "/de/datenschutzerklaerung",
    "/ki-kommunikation/impressum": "/de/impressum",
    "/ai-communication/privacy-policy": "/en/privacy-policy",
    "/ai-communication/imprint": "/en/imprint",
    // Privacy page aliases
    "/de/datenschutz": "/de/datenschutzerklaerung",
    "/datenschutz": "/de/datenschutzerklaerung",
    "/datenschutzerklaerung": "/de/datenschutzerklaerung",
    // Legal page shortcuts
    "/imprint": "/en/imprint",
    "/impressum": "/de/impressum",
    "/privacy-policy": "/en/privacy-policy",
    // Retired blog posts. Static output means these emit meta-refresh pages,
    // not 301s, so each points at the nearest surviving page rather than a
    // bare index where a reasonable successor exists.
    "/en/blog/automation-for-ecommerce": "/en/blog/case-study-ecommerce-sync/",
    "/de/blog/automatisierung-fuer-ecommerce": "/de/blog/fallstudie-ecommerce-sync/",
    "/en/blog/automation-for-tax-advisors": "/en/blog/case-study-invoice-processing/",
    "/de/blog/automatisierung-fuer-steuerberater": "/de/blog/fallstudie-rechnungsverarbeitung/",
    "/en/blog/data-sync-nightmares": "/en/blog/case-study-ecommerce-sync/",
    "/de/blog/datensync-albtraeume-loesen": "/de/blog/fallstudie-ecommerce-sync/",
    "/en/blog/building-your-first-workflow": "/en/blog/common-automation-mistakes/",
    "/de/blog/ihren-ersten-workflow-bauen": "/de/blog/haeufige-automatisierungsfehler/",
    "/en/blog/from-manual-to-automated": "/en/blog/common-automation-mistakes/",
    "/de/blog/von-manuell-zu-automatisiert": "/de/blog/haeufige-automatisierungsfehler/",
    "/en/blog/5-signs-your-business-needs-automation": "/en/blog/",
    "/de/blog/5-zeichen-dass-ihr-unternehmen-automatisierung-braucht": "/de/blog/",
    "/en/blog/7-processes-every-smb-should-automate": "/en/blog/",
    "/de/blog/7-prozesse-die-jeder-mittelstaendler-automatisieren-sollte": "/de/blog/",
    "/en/blog/power-of-integration": "/en/services/integrations-apis/",
    "/de/blog/die-macht-der-integration": "/de/services/integrationen-apis/",
    "/en/blog/roi-of-automation": "/en/services/",
    "/de/blog/roi-von-automatisierung": "/de/services/",
    "/en/blog/cloud-automation-reduces-costs": "/en/services/",
    "/de/blog/cloud-automatisierung-reduziert-kosten": "/de/services/",
    "/en/blog/n8n-vs-zapier": "/en/blog/",
    "/de/blog/n8n-vs-zapier": "/de/blog/",
    "/en/blog/n8n-vs-make-vs-zapier": "/en/blog/",
    "/de/blog/n8n-vs-make-vs-zapier": "/de/blog/",
  },
  // Configure view transitions - this is now a standard feature in Astro 5.x
  // No need for experimental flag
  build: {
    // Improve transition performance
    inlineStylesheets: "auto",
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
