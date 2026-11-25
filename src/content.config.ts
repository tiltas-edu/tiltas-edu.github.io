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

// A labelled value in a solution scheme: "ilgis 18 m", or "plotis ?" when find is set.
const lbl = z.object({
  lt: z.string().default(''), // Lithuanian word; empty for a bare number
  ru: z.string().optional(),
  en: z.string().optional(),
  value: z.string(),
  find: z.boolean().default(false), // what the task asks: "?" in the hint, the value in the solution
});
type Node = { lbl: z.infer<typeof lbl>; op?: string; kids?: Node[] };
const node: z.ZodType<Node> = z.lazy(() => z.object({ lbl, op: z.string().optional(), kids: z.array(node).optional() }));
const scheme = z.discriminatedUnion('kind', [
  // A rectangle or square, optionally split into equal squares, shaded or lengthened.
  z.object({
    kind: z.literal('shape'),
    square: z.boolean().default(false),
    cols: z.number().int().min(1).max(4).default(1),
    rows: z.number().int().min(1).max(4).default(1),
    around: lbl.optional(), // perimeter: the border is drawn bold
    bottom: lbl.optional(),
    side: lbl.optional(),
    inside: lbl.optional(),
    cell: lbl.optional(), // written in the first small square
    cellSide: lbl.optional(), // under the first small square
    shade: z.tuple([z.number().int(), z.number().int()]).optional(), // [3, 4]: 3 of 4 strips
    shadeLbl: lbl.optional(),
    ext: lbl.optional(), // dashed piece added on the right
  }),
  // Bar model: a whole split into parts.
  z.object({
    kind: z.literal('bar'),
    total: lbl,
    parts: z.array(z.object({ w: z.number().positive(), lbl: lbl.optional(), mark: z.boolean().default(false) })).min(1),
  }),
  // What to find on top, what it is made of below.
  z.object({ kind: z.literal('tree'), root: node }),
  // Motion on a road: positions run from 0 to len; arrows are the movers, braces the distances.
  z.object({
    kind: z.literal('road'),
    len: z.number().positive(),
    arrows: z.array(z.object({ from: z.number(), to: z.number(), lbl, below: z.boolean().default(false) })).min(1),
    braces: z.array(z.object({ from: z.number(), to: z.number(), lbl, below: z.boolean().default(false) })).default([]),
    notes: z.array(lbl).default([]), // lines under the road, e.g. the time
  }),
]);

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
    // Solution picture, the first hint: "?" where the task asks, numbers in the solution.
    scheme: scheme.optional(),
    // Visual maths pages that show the idea of this task (/<lang>/math/<page>/).
    see: z.array(z.enum(['column', 'formulas', 'times-table', 'units', 'fractions'])).default([]),
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
