// @ts-check
import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import alpinejs from "@astrojs/alpinejs"
import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  site: "https://leinss-consulting.de",
  integrations: [tailwind(), alpinejs(), react()],
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
    "/de": "/ki-kommunication",
    "/ki-kommunikation/datenschutz": "/ki-kommunikation/datenschutzerklaerung",
    "/ki-kommunikation/datenschutzerklärung":
      "/ki-kommunikation/datenschutzerklaerung",
    "/imprint": "/ai-communication/imprint",
    "/impressum": "/ki-kommunication/impressum",
    "/privacy-policy": "/ai-communication/privacy-policy",
    "/datenschutz": "/ki-kommunication/datenschutzerklaerung",
    "/datenschutzerklärung": "/ki-kommunication/datenschutzerklaerung",
    "/datenschutzerklaerung": "/ki-kommunication/datenschutzerklaerung",
  },
  // Configure view transitions - this is now a standard feature in Astro 5.x
  // No need for experimental flag
  build: {
    // Improve transition performance
    inlineStylesheets: "auto",
  },
})
