import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    category: z.enum(['automation', 'integration', 'crm', 'documents', 'communication', 'case-study']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
    author: z.string().default('Tobias Leinss'),
    lang: z.enum(['de', 'en']),
    // Slug for the alternate language version
    alternateSlug: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
