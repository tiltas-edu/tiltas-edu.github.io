// Fraction strips for grades 2–4: names, equal fractions and a part of a number. Pure, tested in fraction.test.ts.
import type { Lang, Tri } from './units';

export const MAX_DEN = 10;
export const MAX_WHOLE = 60; // part of a number: dots stay countable

const CARD = {
  lt: ['', 'viena', 'dvi', 'trys', 'keturios', 'penkios', 'šešios', 'septynios', 'aštuonios', 'devynios', 'dešimt'],
  ru: ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять'],
  en: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
};
// Denominator: after 1, after 2–9, after 10.
const ORD = {
  lt: {
    one: ['', '', 'antroji', 'trečioji', 'ketvirtoji', 'penktoji', 'šeštoji', 'septintoji', 'aštuntoji', 'devintoji', 'dešimtoji'],
    few: ['', '', 'antrosios', 'trečiosios', 'ketvirtosios', 'penktosios', 'šeštosios', 'septintosios', 'aštuntosios', 'devintosios', 'dešimtosios'],
    many: ['', '', 'antrųjų', 'trečiųjų', 'ketvirtųjų', 'penktųjų', 'šeštųjų', 'septintųjų', 'aštuntųjų', 'devintųjų', 'dešimtųjų'],
  },
  ru: {
    one: ['', '', 'вторая', 'третья', 'четвёртая', 'пятая', 'шестая', 'седьмая', 'восьмая', 'девятая', 'десятая'],
    few: ['', '', 'вторых', 'третьих', 'четвёртых', 'пятых', 'шестых', 'седьмых', 'восьмых', 'девятых', 'десятых'],
    many: ['', '', 'вторых', 'третьих', 'четвёртых', 'пятых', 'шестых', 'седьмых', 'восьмых', 'девятых', 'десятых'],
  },
  en: {
    one: ['', '', 'half', 'third', 'quarter', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'],
    few: ['', '', 'halves', 'thirds', 'quarters', 'fifths', 'sixths', 'sevenths', 'eighths', 'ninths', 'tenths'],
    many: ['', '', 'halves', 'thirds', 'quarters', 'fifths', 'sixths', 'sevenths', 'eighths', 'ninths', 'tenths'],
  },
};
const EVERYDAY: Record<string, Tri> = {
  '1/2': { lt: 'pusė', ru: 'половина', en: 'a half' },
  '1/4': { lt: 'ketvirtis', ru: 'четверть', en: 'a quarter' },
};
const WHOLE: Tri = { lt: 'vienetas (visa juosta)', ru: 'единица (вся полоска)', en: 'one whole (the whole strip)' };

// "trys ketvirtosios", "три четвёртых", "three quarters".
export function name(lang: Lang, a: number, n: number) {
  if (n === 1) return a === 1 ? WHOLE[lang] : String(a);
  const form = a === 1 ? 'one' : a < 10 ? 'few' : 'many';
  const base = `${CARD[lang][a]} ${ORD[lang][form][n]}`;
  const everyday = EVERYDAY[`${a}/${n}`];
  if (everyday) return `${base} (${everyday[lang]})`;
  return a === n ? `${base} = 1` : base;
}

// Every other strip with an edge at the same place: 1/2 = 2/4 = 3/6 = 4/8 = 5/10.
export function equal(a: number, n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let m = 1; m <= MAX_DEN; m++) if (m !== n && (a * m) % n === 0) out.push([(a * m) / n, m]);
  return out;
}

export function compare(a: number, n: number, b: number, m: number) {
  return Math.sign(a * m - b * n);
}

export function partOf(whole: number, a: number, n: number): Tri {
  if (whole % n !== 0) {
    const lo = Math.floor(whole / n) * n;
    const hi = lo + n;
    const near = lo > 0 ? `${lo}, ${hi}` : String(hi);
    return {
      lt: `${whole} į ${n} lygias dalis be liekanos nepadalinsi. Imk, pavyzdžiui, ${near}.`,
      ru: `${whole} не делится на ${n} равных частей без остатка. Возьми, например, ${near}.`,
      en: `${whole} does not split into ${n} equal parts. Try ${near}.`,
    };
  }
  const each = whole / n;
  const r = each * a;
  const tail = (one: string) => (a === 1 ? '' : ` ${each} · ${a} = ${r}${one}`);
  return {
    lt: `${a}/${n} skaičiaus ${whole}: ${whole} : ${n} = ${each} – tai viena dalis.${tail('.')}`,
    ru: `${a}/${n} от ${whole}: ${whole} : ${n} = ${each} — это одна часть.${tail('.')}`,
    en: `${a}/${n} of ${whole}: ${whole} : ${n} = ${each} is one part.${tail('.')}`,
  };
}

// "The strip is split into 4 equal parts, we take 3."
export function meaning(a: number, n: number): Tri {
  if (n === 1) return { lt: 'Visa juosta – vienetas.', ru: 'Вся полоска — единица.', en: 'The whole strip is one.' };
  const lt = new Intl.PluralRules('lt').select(n) === 'few' ? 'lygias dalis' : 'lygių dalių';
  const ru = new Intl.PluralRules('ru').select(n) === 'few' ? 'равные части' : 'равных частей';
  return {
    lt: `Juosta padalyta į ${n} ${lt}, imame ${a}.`,
    ru: `Полоска разделена на ${n} ${ru}, берём ${a}.`,
    en: `The strip is split into ${n} equal parts, we take ${a}.`,
  };
}
