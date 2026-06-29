import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    featuredImage: z.string().optional(),
  }),
});

const products = defineCollection({
  loader: glob({
    base: './src/content/products',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    heading: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date(),
    updatedLabel: z.string().optional(),
    breadcrumbParent: z.string(),
    breadcrumbParentHref: z.string(),
    breadcrumbLabel: z.string(),
  }),
});

export const collections = { blog, products };
