import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    category: z.enum(["automation", "integration", "crm", "documents", "communication", "reference-build", "case-study"]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
    author: z.string().default("Tobias Leinss"),
    lang: z.enum(["de", "en"]),
    alternateSlug: z.string().optional(),
  }),
})

export const collections = {
  blog: blogCollection,
}
