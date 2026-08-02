import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    // Sequential ledger id, e.g. "AO-001". Assigned by scripts/new-post.mjs.
    id: z.string(),
    title: z.string(),
    // One-line summary shown in the ledger list and used as the syndication hook.
    summary: z.string(),
    date: z.coerce.date(),
    status: z.enum(['note', 'in-progress', 'shipped']).default('note'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
