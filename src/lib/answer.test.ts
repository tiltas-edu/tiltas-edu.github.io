import { describe, expect, it } from 'vitest';
import { hintFor, isCorrect, norm, same } from './answer';

describe('norm', () => {
  it('takes the first number and drops spaces and units', () => {
    expect(norm('2 500 m²')).toBe('2500');
    expect(norm('5 000 cm²')).toBe('5000');
    expect(norm('216 m2')).toBe('216');
    expect(norm('3,5')).toBe('3.5');
    expect(norm('Teisė')).toBe('');
  });
});

describe('same', () => {
  it('compares numbers as numbers', () => {
    expect(same('140', '140 m')).toBe(true);
    expect(same('1400', '1 400')).toBe(true);
    expect(same('0.5', '0,5')).toBe(true);
    expect(same('140', '14')).toBe(false);
    expect(same('140', 'abc')).toBe(false);
    expect(same('140', '')).toBe(false);
  });
  it('compares options as text, ignoring case and extra spaces', () => {
    expect(same('Pareiga', 'pareiga')).toBe(true);
    expect(same('Būtasis dažninis laikas', ' būtasis  dažninis laikas ')).toBe(true);
    expect(same('Pareiga', 'Teisė')).toBe(false);
    expect(same('veždavo', 'vešdavo')).toBe(false);
  });
});

describe('isCorrect and hintFor', () => {
  const mistakes = [{ value: '30', hint: 'width' }, { value: 'Teisė', hint: 'right' }];
  it('accepts any listed answer', () => {
    expect(isCorrect(['7', '700'], '700 ct')).toBe(true);
    expect(isCorrect(['7', '700'], '70')).toBe(false);
  });
  it('finds the hint of a known wrong answer only', () => {
    expect(hintFor(mistakes, '30 m')).toBe('width');
    expect(hintFor(mistakes, 'teisė')).toBe('right');
    expect(hintFor(mistakes, '31')).toBeNull();
  });
});

// Every task in src/content/tasks must be solvable with its own data.
interface Task {
  id: string;
  answer: string;
  check: string[];
  choices?: string[];
  mistakes?: { value: string }[];
}
const files = import.meta.glob<Omit<Task, 'id'>>('../content/tasks/*.json', { eager: true, import: 'default' });
const tasks: Task[] = Object.entries(files).map(([path, data]) => ({ id: path.split('/').pop()!, ...data }));

it('finds the tasks', () => expect(tasks.length).toBeGreaterThan(20));

describe.each(tasks)('task $id', (task: Task) => {
  it('has answers to check', () => expect(task.check.length).toBeGreaterThan(0));
  it('accepts the shown answer', () => {
    if (task.choices) expect(task.choices).toContain(task.answer);
    expect(isCorrect(task.check, task.answer)).toBe(true);
  });
  it('does not accept a listed mistake', () => {
    for (const m of task.mistakes ?? []) expect(isCorrect(task.check, m.value), m.value).toBe(false);
  });
  it('offers every accepted answer and mistake as an option', () => {
    if (!task.choices) return;
    for (const v of [...task.check, ...(task.mistakes ?? []).map((m) => m.value)]) {
      expect(task.choices, v).toContain(v);
    }
  });
});
