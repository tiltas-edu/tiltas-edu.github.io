import { z } from 'astro/zod';
import data from '../data/word-frequency.json';
import { POS, type RankedWord } from './pos';

// Strict on purpose: the build fails if task text, source or any other field gets into the public file.
const schema = z.strictObject({
  tasks: z.number().int().nonnegative(),
  subjects: z.record(z.string(), z.number().int().positive()),
  words: z.array(
    z.strictObject({
      lemma: z.string(),
      pos: z.string(),
      ru: z.string(),
      en: z.string(),
      forms: z.array(z.string().regex(/^[\p{L}\p{M}]+$/u, 'a form is a single word')),
      tasks: z.number().int().positive(),
      bySubject: z.record(z.string(), z.number().int().positive()),
    }),
  ),
});

export const frequency: { tasks: number; subjects: Record<string, number>; words: RankedWord[] } = schema.parse(data);

// The most frequent word of each main part of speech, for the home page.
export const topWords = POS.flatMap((pos) => frequency.words.find((w) => w.pos === pos) ?? []);
