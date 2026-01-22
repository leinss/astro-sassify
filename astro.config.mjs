// @ts-check
import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import alpinejs from "@astrojs/alpinejs"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"

// https://astro.build/config
export default defineConfig({
  site: "https://leinss-consulting.de",
  // Static output for GitHub Pages (newsletter uses Listmonk public API directly)
  output: "static",
  integrations: [
    tailwind(),
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
  },
  // Configure view transitions - this is now a standard feature in Astro 5.x
  // No need for experimental flag
  build: {
    // Improve transition performance
    inlineStylesheets: "auto",
  },
})
