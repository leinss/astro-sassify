import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import type { APIContext } from "astro"

type Lang = "de" | "en"

const META: Record<Lang, { title: string; description: string }> = {
  de: {
    title: "Leinss Consulting: Blog",
    description: "Automatisierung, KI und Workflow-Optimierung für den Mittelstand",
  },
  en: {
    title: "Leinss Consulting: Blog",
    description: "Automation, AI and workflow engineering for mid-sized companies",
  },
}

/**
 * One feed per language, built from the same code so the two cannot drift.
 * The German feed used to be the only one, written inline in the route, and
 * English readers had no feed at all.
 */
export const feed = (lang: Lang) =>
  async function GET(context: APIContext) {
    const posts = (await getCollection("blog"))
      .filter((p) => !p.data.draft && p.data.lang === lang)
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

    return rss({
      ...META[lang],
      site: context.site ?? "https://leinss-consulting.de",
      items: posts.map((p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: `/${lang}/blog/${p.id.replace(new RegExp(`^${lang}/`), "")}/`,
      })),
      customData: `<language>${lang}</language>`,
    })
  }
