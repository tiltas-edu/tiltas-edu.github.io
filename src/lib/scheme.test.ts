import { describe, expect, it } from 'vitest';
import { labels, legend, shown, type Lbl, type Scheme } from './scheme';

interface Task { subject: string; answer: string; scheme?: Scheme; see?: string[] }
const files = import.meta.glob<Task>('../content/tasks/*.json', { eager: true, import: 'default' });
const tasks = Object.entries(files).map(([path, t]) => ({ id: path.split('/').pop()!, ...t }));
const nums = (s: string) => (s.match(/\d[\d\s]*(?:[.,]\d+)?/g) ?? []).map((x) => x.replace(/\s/g, ''));
const fill = (l: Partial<Lbl>): Lbl => ({ lt: '', find: false, value: '', ...l });

describe('scheme helpers', () => {
  it('hides the asked value until the solution', () => {
    const l = fill({ lt: 'plotis', value: '12 m', find: true });
    expect(shown(l, false)).toBe('?');
    expect(shown(l, true)).toBe('12 m');
    expect(shown({ ...l, find: false }, false)).toBe('12 m');
  });
  it('lists each Lithuanian word once in the legend', () => {
    const s: Scheme = { kind: 'tree', root: { lbl: fill({ lt: 'kraštinė', ru: 'сторона', value: '5' }), op: '·', kids: [{ lbl: fill({ lt: 'kraštinė', ru: 'сторона', value: '5' }) }, { lbl: fill({ value: '4' }) }] } };
    expect(legend(s, 'ru')).toEqual([{ lt: 'kraštinė', tr: 'сторона' }]);
  });
});

describe('task schemes', () => {
  const maths = tasks.filter((t) => t.subject === 'math');
  it('every maths task has a scheme and a visual page', () => {
    for (const t of maths) {
      expect(t.scheme, t.id).toBeTruthy();
      expect(t.see?.length, t.id).toBeGreaterThan(0);
    }
  });
  for (const t of tasks.filter((x) => x.scheme)) {
    it(`${t.id}: words are translated and the answer is what the scheme asks`, () => {
      const all = labels(t.scheme!).map(fill);
      for (const l of all) if (l.lt) expect(l.ru && l.en, `${t.id}: ${l.lt}`).toBeTruthy();
      const asked = all.filter((l) => l.find);
      expect(asked.length, t.id).toBeGreaterThan(0);
      expect(asked.flatMap((l) => nums(l.value)), t.id).toContain(nums(t.answer)[0]);
    });
  }
});
