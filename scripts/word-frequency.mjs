// Ranks words from real textbook tasks. Input format: docs/word-frequency.md. Run: npm run words
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const POS = {
  verb: 'Глаголы',
  noun: 'Существительные',
  adj: 'Прилагательные',
  adv: 'Наречия',
  prep: 'Предлоги',
  pron: 'Местоимения',
  num: 'Числительные',
  conj: 'Союзы',
  part: 'Частицы',
  intj: 'Междометия',
};
const NOT_RANKED = ['name', 'unit'];

const root = process.argv[2] ?? fileURLToPath(new URL('../corpus', import.meta.url));
const dir = join(root, 'tasks');
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
const tokens = (text) => text.normalize('NFC').toLowerCase().match(/[\p{L}\p{M}]+/gu) ?? [];

const errors = [];
const seen = new Map();
const stats = new Map();

for (const file of files) {
  const { text, words } = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  // Numbers are part of the key: the same wording with other numbers is another task.
  const key = text.normalize('NFC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu)?.join(' ');
  if (seen.has(key)) {
    console.log(`SKIP ${file}: same task as ${seen.get(key)}`);
    continue;
  }
  seen.set(key, file);

  const expected = tokens(text).join(' ');
  const actual = words.map((w) => w.form.normalize('NFC').toLowerCase()).join(' ');
  if (expected !== actual) errors.push(`${file}: "words" must cover every word of "text", in order`);

  for (const { form, lemma, pos, ru, en } of words) {
    if (NOT_RANKED.includes(pos)) continue;
    if (!POS[pos] || !lemma || !ru || !en) {
      errors.push(`${file}: "${form}" needs a valid pos, lemma, ru and en`);
      continue;
    }
    const id = `${pos}:${lemma}`;
    if (!stats.has(id)) stats.set(id, { lemma, pos, total: 0, tasks: new Set(), forms: new Set(), ru: new Set(), en: new Set() });
    const s = stats.get(id);
    s.total++;
    s.tasks.add(file);
    s.forms.add(form.toLowerCase());
    s.ru.add(ru);
    s.en.add(en);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
if (!seen.size) {
  console.log('No tasks in corpus/tasks yet.');
  process.exit(0);
}

// The number of tasks matters more than repeats inside a single task.
const ranked = [...stats.values()].sort(
  (a, b) => b.tasks.size - a.tasks.size || b.total - a.total || a.lemma.localeCompare(b.lemma, 'lt'),
);

const lines = ['# Частотный словарь', '', `Заданий: ${seen.size}. Разных слов: ${ranked.length}.`];
for (const [pos, title] of Object.entries(POS)) {
  const rows = ranked.filter((s) => s.pos === pos);
  if (!rows.length) continue;
  lines.push('', `## ${title}`, '', '| # | Слово | RU | EN | В заданиях | Всего | Формы |', '|--:|---|---|---|--:|--:|---|');
  rows.forEach((s, i) => {
    const share = Math.round((100 * s.tasks.size) / seen.size);
    const list = (set) => [...set].join(', ');
    lines.push(`| ${i + 1} | ${s.lemma} | ${list(s.ru)} | ${list(s.en)} | ${s.tasks.size} (${share}%) | ${s.total} | ${list(s.forms)} |`);
  });
}
writeFileSync(join(root, 'frequency.md'), `${lines.join('\n')}\n`);
console.log(`${seen.size} tasks, ${ranked.length} words -> ${join(root, 'frequency.md')}`);
