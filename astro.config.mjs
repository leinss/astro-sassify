// @ts-check
import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import alpinejs from "@astrojs/alpinejs"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import node from "@astrojs/node"

// https://astro.build/config
export default defineConfig({
  site: "https://leinss-consulting.de",
  // Server output for API routes (newsletter subscription)
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
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
    locales: ["ai-communication", "ki-kommunikation"],
    defaultLocale: "ki-kommunikation",
    routing: {
      prefixDefaultLocale: true,
    },
  },
  redirects: {
    "/": "/ki-kommunikation",
    "/en": "/ai-communication",
    "/de": "/ki-kommunikation",
    "/ki-kommunikation/datenschutz": "/ki-kommunikation/datenschutzerklaerung",
    "/ki-kommunikation/datenschutzerklärung":
      "/ki-kommunikation/datenschutzerklaerung",
    "/imprint": "/ai-communication/imprint",
    "/impressum": "/ki-kommunikation/impressum",
    "/privacy-policy": "/ai-communication/privacy-policy",
    "/datenschutz": "/ki-kommunikation/datenschutzerklaerung",
    "/datenschutzerklärung": "/ki-kommunikation/datenschutzerklaerung",
    "/datenschutzerklaerung": "/ki-kommunikation/datenschutzerklaerung",
  },
  // Configure view transitions - this is now a standard feature in Astro 5.x
  // No need for experimental flag
  build: {
    // Improve transition performance
    inlineStylesheets: "auto",
  },
})
