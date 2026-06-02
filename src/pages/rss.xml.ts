import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import type { APIContext } from "astro"

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft && p.data.lang === "de")
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  return rss({
    title: "Leinss Consulting — Blog",
    description: "Automatisierung, KI und Workflow-Optimierung für den Mittelstand",
    site: context.site ?? "https://leinss-consulting.de",
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/de/blog/${p.id.replace(/^de\//, "")}/`,
    })),
    customData: `<language>de</language>`,
  })
}
