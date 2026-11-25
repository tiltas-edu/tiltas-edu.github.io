import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { groupIds } from './lib/subjects';

const tri = z.object({ ru: z.string(), en: z.string() });

// One JSON file per topic: a list of Lithuanian terms with RU/EN translations.
const glossary = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/glossary' }),
  schema: z.object({
    subject: z.string(),
    title: tri,
    terms: z.array(
      z.object({
        lt: z.string(),
        ru: z.string(),
        en: z.string(),
        // Look-alike words a child mixes up with this one (plotas -> plotis); the differing letters get marked.
        like: z.array(z.string()).optional(),
        note: tri.optional(),
      }),
    ),
  }),
});

// One JSON file per task. Tasks are ORIGINAL (written for Tiltas),
// they only use the same wording patterns as school platforms.
const tasks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tasks' }),
  schema: z.object({
    subject: z.string(),
    topic: z.string(), // glossary id this task trains
    group: z.enum(groupIds), // section on the subject page (src/lib/subjects.ts)
    level: z.number().int().min(1).max(3), // 1 = one step, 3 = several steps
    grade: z.number(),
    lt: z.string(), // original task text
    translation: tri,
    steps: z.object({ ru: z.array(z.string()), en: z.array(z.string()) }),
    answer: z.string(), // shown answer, e.g. "2 500 m²"
    check: z.array(z.string()).default([]), // accepted answers: numbers, or the exact text of a choice
    choices: z.array(z.string()).optional(), // answer options in Lithuanian; without them the child types a number
    keywords: z.array(z.string()).default([]), // lt terms to highlight
    // Typical wrong answers and a calm hint for each, e.g. the area typed where the perimeter is asked.
    mistakes: z.array(z.object({ value: z.string(), hint: tri })).default([]),
  }),
});

// External links, grouped by category. Add a `checked` date when you open the link yourself.
const resources = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/resources' }),
  schema: z.object({
    category: z.enum(['platforms', 'dictionaries', 'official', 'family']),
    order: z.number(),
    items: z.array(
      z.object({
        name: z.string(),
        url: z.url(),
        desc: tri,
        tags: z.array(z.enum(['LT', 'RU', 'EN', 'UK'])).default(['LT']),
        checked: z.string().optional(), // YYYY-MM-DD when a human last confirmed the link works
      }),
    ),
  }),
});

export const collections = { glossary, tasks, resources };
