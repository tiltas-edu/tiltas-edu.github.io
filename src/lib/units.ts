// Units ladder for grades 1–4: big units on top, small ones below. Going down multiplies, going up divides.
// Pure, tested in units.test.ts.

export type Lang = 'lt' | 'ru' | 'en';
export type Tri = Record<Lang, string>;
export type Kind = 'length' | 'mass' | 'capacity' | 'time';

export interface Unit {
  id: string;
  sym: Tri; // what is written after the number
  name: Tri;
  size: number; // in the smallest unit of the ladder
}

const u = (id: string, size: number, name: Tri, sym: Tri = { lt: id, ru: id, en: id }): Unit => ({ id, size, name, sym });

// Biggest first, as the ladder is drawn.
export const LADDERS: Record<Kind, Unit[]> = {
  length: [
    u('km', 1_000_000, { lt: 'kilometras', ru: 'километр', en: 'kilometre' }),
    u('m', 1000, { lt: 'metras', ru: 'метр', en: 'metre' }),
    u('dm', 100, { lt: 'decimetras', ru: 'дециметр', en: 'decimetre' }),
    u('cm', 10, { lt: 'centimetras', ru: 'сантиметр', en: 'centimetre' }),
    u('mm', 1, { lt: 'milimetras', ru: 'миллиметр', en: 'millimetre' }),
  ],
  mass: [
    u('t', 1_000_000, { lt: 'tona', ru: 'тонна', en: 'tonne' }),
    u('kg', 1000, { lt: 'kilogramas', ru: 'килограмм', en: 'kilogram' }),
    u('g', 1, { lt: 'gramas', ru: 'грамм', en: 'gram' }),
  ],
  capacity: [
    u('l', 1000, { lt: 'litras', ru: 'литр', en: 'litre' }),
    u('ml', 1, { lt: 'mililitras', ru: 'миллилитр', en: 'millilitre' }),
  ],
  time: [
    u('para', 86_400, { lt: 'para', ru: 'сутки', en: 'day' }, { lt: 'para', ru: 'сут.', en: 'day' }),
    u('h', 3600, { lt: 'valanda', ru: 'час', en: 'hour' }),
    u('min', 60, { lt: 'minutė', ru: 'минута', en: 'minute' }),
    u('s', 1, { lt: 'sekundė', ru: 'секунда', en: 'second' }),
  ],
};

export const KIND_NAME: Record<Kind, Tri> = {
  length: { lt: 'Ilgis', ru: 'Длина', en: 'Length' },
  mass: { lt: 'Masė', ru: 'Масса', en: 'Mass' },
  capacity: { lt: 'Talpa', ru: 'Вместимость', en: 'Capacity' },
  time: { lt: 'Laikas', ru: 'Время', en: 'Time' },
};

export const MAX_VALUE = 1_000_000;

// Decimal comma for lt/ru, as in the exercise book.
export const fmt = (lang: Lang, x: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 6, useGrouping: 'min2' }).format(x);
const round = (x: number) => Math.round(x * 1e9) / 1e9;

export function find(kind: Kind, id: string) {
  const i = LADDERS[kind].findIndex((x) => x.id === id);
  if (i < 0) throw new Error(`no unit ${id} in ${kind}`);
  return i;
}

export interface Step {
  big: Unit; // upper rung of the pair
  small: Unit;
  by: number; // 1 big = by small
  down: boolean;
  before: number;
  after: number;
}

export interface Result {
  value: number;
  steps: Step[];
  // Going up from whole numbers: 350 cm = 3 m 50 cm.
  mixed: { whole: number; to: Unit; rest: number; from: Unit } | null;
}

export function convert(kind: Kind, value: number, from: string, to: string): Result {
  const L = LADDERS[kind];
  const i = find(kind, from);
  const j = find(kind, to);
  const down = j > i;
  const steps: Step[] = [];
  let v = value;
  for (let k = i; k !== j; k += down ? 1 : -1) {
    const big = L[down ? k : k - 1];
    const small = L[down ? k + 1 : k];
    const by = big.size / small.size;
    const after = round(down ? v * by : v / by);
    steps.push({ big, small, by, down, before: v, after });
    v = after;
  }
  let mixed: Result['mixed'] = null;
  if (!down && i !== j && Number.isInteger(value) && v >= 1 && !Number.isInteger(v)) {
    const whole = Math.floor(v);
    const rest = round(value - (whole * L[j].size) / L[i].size);
    mixed = { whole, to: L[j], rest, from: L[i] };
  }
  return { value: v, steps, mixed };
}

export function stepText(s: Step): Tri {
  const t = (lang: Lang) => {
    const b = s.big.sym[lang];
    const m = s.small.sym[lang];
    const k = fmt(lang, s.by);
    const x = fmt(lang, s.before);
    const y = fmt(lang, s.after);
    return { b, m, k, x, y };
  };
  const lt = t('lt');
  const ru = t('ru');
  const en = t('en');
  return s.down
    ? {
        lt: `1 ${lt.b} = ${lt.k} ${lt.m}. Lipame žemyn – dauginame: ${lt.x} · ${lt.k} = ${lt.y} ${lt.m}.`,
        ru: `1 ${ru.b} = ${ru.k} ${ru.m}. Спускаемся вниз — умножаем: ${ru.x} · ${ru.k} = ${ru.y} ${ru.m}.`,
        en: `1 ${en.b} = ${en.k} ${en.m}. Going down, multiply: ${en.x} · ${en.k} = ${en.y} ${en.m}.`,
      }
    : {
        lt: `${lt.k} ${lt.m} = 1 ${lt.b}. Lipame aukštyn – dalijame: ${lt.x} : ${lt.k} = ${lt.y} ${lt.b}.`,
        ru: `${ru.k} ${ru.m} = 1 ${ru.b}. Поднимаемся вверх — делим: ${ru.x} : ${ru.k} = ${ru.y} ${ru.b}.`,
        en: `${en.k} ${en.m} = 1 ${en.b}. Going up, divide: ${en.x} : ${en.k} = ${en.y} ${en.b}.`,
      };
}

// "1 m = 10 dm = 100 cm = 1000 mm": what each rung holds of every rung below it.
export function chain(kind: Kind, lang: Lang, from = 0) {
  const L = LADDERS[kind];
  return L.slice(from).map((x, i) => `${i === 0 ? 1 : fmt(lang, L[from].size / x.size)} ${x.sym[lang]}`).join(' = ');
}

export function parse(s: string) {
  const t = s.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 && n <= MAX_VALUE ? n : null;
}
