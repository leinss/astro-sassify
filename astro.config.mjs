// @ts-check
import { defineConfig } from "astro/config"
import tailwind from "@astrojs/tailwind"
import alpinejs from "@astrojs/alpinejs"

import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  site: "https://leinss-consulting.de",
  base: "/ki",
  integrations: [tailwind(), alpinejs(), react()],
  redirects: {
    "/": "/ki",
  },
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "de",
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
