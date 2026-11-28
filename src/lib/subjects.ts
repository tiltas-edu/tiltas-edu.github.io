// Subjects that have tasks, and the task groups (sections) shown on each subject page, in order.
// A group id is the `group` field of a task; the title is an i18n key.
export const subjects = {
  math: ['numbers', 'area-from-perimeter', 'side-from-area', 'motion', 'word-problems', 'multiply-column', 'estimate', 'equations', 'expressions', 'volume', 'units', 'fractions', 'triangles', 'data', 'chance'],
  lithuanian: ['verb-tenses'],
  society: ['rights-duties', 'screens', 'people-together'],
} as const;

export type Subject = keyof typeof subjects;
export const groupIds = Object.values(subjects).flat() as [string, ...string[]];
export const groupKey = (id: string) => `group_${id.replaceAll('-', '_')}` as const;
