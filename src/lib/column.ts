// Column arithmetic laid out cell by cell, like in a squared school notebook, with one step per written move.
// Pure data: src/components/ColumnMath.tsx draws it.

export type Op = 'add' | 'sub' | 'mul' | 'div';
// Every text in Lithuanian (as said in class) and in the reader's language.
export interface Tri { lt: string; ru: string; en: string }

export interface Cell {
  row: number;
  col: number;
  text: string;
  kind: 'digit' | 'small' | 'sign' | 'result';
  step: number; // appears at this step
  until?: number; // replaced from this step on (a changed small digit)
  struckAt?: number; // crossed out from this step on (a digit that lent 1)
}
export interface Rule { row: number; from: number; to: number; step: number } // line under `row`, columns from..to
export interface Step { text: Tri; focus: string[] } // focus: `${row}:${col}` of the cells this step is about
export interface Legend { value: number; lt: string; term: { ru: string; en: string } }
export interface Layout {
  op: Op;
  rows: number;
  cols: number;
  cells: Cell[];
  rules: Rule[];
  bar?: { col: number; rows: number }; // division corner: vertical line left of `col`
  steps: Step[];
  legend: Legend[];
  check: Tri[];
  result: number;
  remainder?: number;
}

export const LIMITS = { max: 99999, mulBy: 999, divBy: 99 };

const digits = (n: number) => String(n).split('').map(Number);
// Place values. lt/ru: nominative, genitive ("dešimčių skyrius", "цифра десятков"), instrumental ("po dešimtimis", "под десятками").
const PLACE = [
  { lt: 'vienetai', ltGen: 'vienetų', ltIns: 'vienetais', ru: 'единицы', gen: 'единиц', ins: 'единицами', en: 'units' },
  { lt: 'dešimtys', ltGen: 'dešimčių', ltIns: 'dešimtimis', ru: 'десятки', gen: 'десятков', ins: 'десятками', en: 'tens' },
  { lt: 'šimtai', ltGen: 'šimtų', ltIns: 'šimtais', ru: 'сотни', gen: 'сотен', ins: 'сотнями', en: 'hundreds' },
  { lt: 'tūkstančiai', ltGen: 'tūkstančių', ltIns: 'tūkstančiais', ru: 'тысячи', gen: 'тысяч', ins: 'тысячами', en: 'thousands' },
  { lt: 'dešimtys tūkstančių', ltGen: 'dešimčių tūkstančių', ltIns: 'dešimtimis tūkstančių', ru: 'десятки тысяч', gen: 'десятков тысяч', ins: 'десятками тысяч', en: 'ten thousands' },
  { lt: 'šimtai tūkstančių', ltGen: 'šimtų tūkstančių', ltIns: 'šimtais tūkstančių', ru: 'сотни тысяч', gen: 'сотен тысяч', ins: 'сотнями тысяч', en: 'hundred thousands' },
];
const place = (p: number, lang: 'lt' | 'ru' | 'en') => PLACE[p][lang];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const key = (row: number, col: number) => `${row}:${col}`;
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Rounds to the leading digit (84 -> 80, 25 -> 30, 456 -> 500): good enough to spot a wrong digit.
const rough = (n: number) => {
  if (n < 10) return n;
  const p = 10 ** (String(n).length - 1);
  return Math.round(n / p) * p;
};

class Builder {
  cells: Cell[] = [];
  rules: Rule[] = [];
  steps: Step[] = [];
  constructor(public cols: number) {}
  put(row: number, col: number, text: string, kind: Cell['kind'], step: number) {
    const cell: Cell = { row, col, text, kind, step };
    this.cells.push(cell);
    return cell;
  }
  // Writes a number so that its last digit lands in column `end`.
  num(row: number, end: number, n: number | string, kind: Cell['kind'], step: number) {
    const s = String(n);
    return [...s].map((d, i) => this.put(row, end - (s.length - 1 - i), d, kind, step));
  }
  step(lt: string, ru: string, en: string, focus: string[] = []) {
    this.steps.push({ text: { lt, ru, en }, focus });
    return this.steps.length - 1;
  }
  get rows() {
    return Math.max(...this.cells.map((c) => c.row), ...this.rules.map((r) => r.row)) + 1;
  }
}

function addition(nums: number[]): Layout {
  const sum = nums.reduce((a, b) => a + b, 0);
  const width = String(sum).length;
  const b = new Builder(width + 1); // column 0 holds the sign
  const last = b.cols - 1;
  const col = (p: number) => last - p;
  const top = 1; // row 0 is for carried digits
  const resultRow = top + nums.length;
  b.step(
    'Skaičius rašome vieną po kitu: vienetus po vienetais, dešimtis po dešimtimis.',
    'Пишем числа друг под другом: единицы под единицами, десятки под десятками.',
    'Write the numbers one under another: units under units, tens under tens.',
  );
  nums.forEach((n, i) => b.num(top + i, last, n, 'digit', 0));
  b.put(top + nums.length - 1, 0, '+', 'sign', 0);
  b.rules.push({ row: resultRow - 1, from: 0, to: last, step: 0 });

  let carry = 0;
  for (let p = 0; p < width; p++) {
    const parts = nums.map((n) => digits(n).reverse()[p]).filter((d) => d !== undefined) as number[];
    if (!parts.length && !carry) break;
    const total = parts.reduce((a, d) => a + d, 0) + carry;
    const terms = [...parts, ...(carry ? [carry] : [])].join(' + ');
    const focus = nums.flatMap((n, i) => (p < String(n).length ? [key(top + i, col(p))] : []));
    if (carry) focus.push(key(0, col(p)));
    const isLast = p === width - 1 || (parts.length === 0);
    const write = isLast ? total : total % 10;
    const s = b.steps.length;
    b.num(resultRow, col(p), write, 'result', s);
    focus.push(...String(write).split('').map((_, i) => key(resultRow, col(p) - i)));
    const next = Math.floor(total / 10);
    if (!isLast && next) {
      b.put(0, col(p + 1), String(next), 'small', s);
      focus.push(key(0, col(p + 1)));
    }
    const lt = `${cap(place(p, 'lt'))}: ${terms} = ${total}.` +
      (isLast ? ` Rašome ${total}.` : next ? ` Rašome ${total % 10}, ${next} perkeliame į ${PLACE[p + 1].ltGen} skyrių.` : ` Rašome ${total}.`);
    const ru = `${cap(place(p, 'ru'))}: ${terms} = ${total}.` +
      (isLast ? ` Пишем ${total}.` : next ? ` Пишем ${total % 10}, ${next} переносим в ${PLACE[p + 1].ru}.` : ` Пишем ${total}.`);
    const en = `${cap(place(p, 'en'))}: ${terms} = ${total}.` +
      (isLast ? ` Write ${total}.` : next ? ` Write ${total % 10}, carry ${next} to the ${PLACE[p + 1].en}.` : ` Write ${total}.`);
    b.step(lt, ru, en, focus);
    carry = isLast ? 0 : next;
    if (isLast) break;
  }
  const lastDigits = nums.map((n) => n % 10);
  const lastSum = lastDigits.reduce((a, d) => a + d, 0);
  return {
    op: 'add', rows: b.rows, cols: b.cols, cells: b.cells, rules: b.rules, steps: b.steps, result: sum,
    legend: [
      ...nums.map((n) => ({ value: n, lt: 'dėmuo', term: { ru: 'слагаемое', en: 'addend' } })),
      { value: sum, lt: 'suma', term: { ru: 'сумма', en: 'sum' } },
    ],
    check: [
      {
        lt: `Paskutinis skaitmuo: ${lastDigits.join(' + ')} = ${lastSum}, todėl atsakymas baigiasi ${lastSum % 10}.`,
        ru: `Последняя цифра: ${lastDigits.join(' + ')} = ${lastSum}, значит ответ оканчивается на ${lastSum % 10}.`,
        en: `Last digit: ${lastDigits.join(' + ')} = ${lastSum}, so the answer ends in ${lastSum % 10}.`,
      },
      {
        lt: `Apytiksliai: ${nums.map((n) => fmt(rough(n))).join(' + ')} = ${fmt(nums.reduce((a, n) => a + rough(n), 0))}, atsakymas turi būti netoli.`,
        ru: `Прикидка: ${nums.map((n) => fmt(rough(n))).join(' + ')} = ${fmt(nums.reduce((a, n) => a + rough(n), 0))}, ответ должен быть рядом.`,
        en: `Estimate: ${nums.map((n) => fmt(rough(n))).join(' + ')} = ${fmt(nums.reduce((a, n) => a + rough(n), 0))}; the answer should be close.`,
      },
    ],
  };
}

function subtraction(a: number, c: number): Layout {
  const diff = a - c;
  const width = String(a).length;
  const b = new Builder(width + 1);
  const last = b.cols - 1;
  const col = (p: number) => last - p;
  b.step(
    'Viršuje rašome turinį, po juo – atėminį: vienetus po vienetais.',
    'Пишем уменьшаемое сверху, вычитаемое под ним: единицы под единицами.',
    'Write the bigger number on top, the smaller one below it: units under units.',
  );
  const top = b.num(1, last, a, 'digit', 0).reverse(); // top[p] = digit cell at place p
  b.num(2, last, c, 'digit', 0);
  b.put(2, 0, '−', 'sign', 0);
  b.rules.push({ row: 2, from: 0, to: last, step: 0 });

  const cur = digits(a).reverse();
  const low = digits(c).reverse();
  const small: (Cell | undefined)[] = []; // the latest small digit written above each place
  const change = (p: number, value: number, s: number) => {
    const prev = small[p];
    if (prev) prev.until = s;
    else top[p].struckAt = s;
    small[p] = b.put(0, col(p), String(value), 'small', s);
  };
  const resultLen = String(diff).length;
  for (let p = 0; p < width; p++) {
    const d = low[p] ?? 0;
    const s = b.steps.length;
    const focus = [key(1, col(p))];
    if (p < String(c).length) focus.push(key(2, col(p)));
    let lt = '';
    let ru = '';
    let en = '';
    if (cur[p] < d) {
      let k = p + 1;
      while (cur[k] === 0) k++;
      const from = PLACE[k];
      cur[k]--;
      change(k, cur[k], s);
      focus.push(key(0, col(k)));
      for (let q = k - 1; q > p; q--) {
        cur[q] = 9;
        change(q, 9, s);
        focus.push(key(0, col(q)));
      }
      lt = `${cap(place(p, 'lt'))}: iš ${cur[p]} negalima atimti ${d}. Pasiskoliname 1 iš ${from.ltGen} skyriaus` +
        (k > p + 1 ? ' (nuliai pakeliui virsta devynetais)' : '') + `: ${cur[p] + 10} − ${d} = ${cur[p] + 10 - d}.`;
      ru = `${cap(place(p, 'ru'))}: из ${cur[p]} нельзя вычесть ${d}. Занимаем 1 из разряда «${from.ru}»` +
        (k > p + 1 ? ' (нули по дороге становятся девятками)' : '') + `: ${cur[p] + 10} − ${d} = ${cur[p] + 10 - d}.`;
      en = `${cap(place(p, 'en'))}: you can't take ${d} from ${cur[p]}. Borrow 1 from the ${from.en}` +
        (k > p + 1 ? ' (zeros on the way become nines)' : '') + `: ${cur[p] + 10} − ${d} = ${cur[p] + 10 - d}.`;
      cur[p] += 10;
      change(p, cur[p], s);
      focus.push(key(0, col(p)));
    } else {
      lt = `${cap(place(p, 'lt'))}: ${cur[p]} − ${d} = ${cur[p] - d}.`;
      ru = `${cap(place(p, 'ru'))}: ${cur[p]} − ${d} = ${cur[p] - d}.`;
      en = `${cap(place(p, 'en'))}: ${cur[p]} − ${d} = ${cur[p] - d}.`;
    }
    const r = cur[p] - d;
    if (p < resultLen) {
      b.put(3, col(p), String(r), 'result', s);
      focus.push(key(3, col(p)));
    } else {
      lt += ' Nulio priekyje nerašome.';
      ru += ' Ноль впереди не пишем.';
      en += ' A leading zero is not written.';
    }
    b.step(lt, ru, en, focus);
  }
  return {
    op: 'sub', rows: 4, cols: b.cols, cells: b.cells, rules: b.rules, steps: b.steps, result: diff,
    legend: [
      { value: a, lt: 'turinys', term: { ru: 'уменьшаемое', en: 'minuend' } },
      { value: c, lt: 'atėminys', term: { ru: 'вычитаемое', en: 'subtrahend' } },
      { value: diff, lt: 'skirtumas', term: { ru: 'разность', en: 'difference' } },
    ],
    check: [
      {
        lt: `Patikriname sudėtimi: ${fmt(diff)} + ${fmt(c)} = ${fmt(a)}.`,
        ru: `Проверка сложением: ${fmt(diff)} + ${fmt(c)} = ${fmt(a)}.`,
        en: `Check by adding: ${fmt(diff)} + ${fmt(c)} = ${fmt(a)}.`,
      },
    ],
  };
}

function multiplication(a: number, m: number): Layout {
  const product = a * m;
  const md = digits(m).reverse();
  const width = Math.max(String(product).length, String(a).length, String(m).length);
  const b = new Builder(width + 1);
  const last = b.cols - 1;
  const col = (p: number) => last - p;
  const one = md.length === 1;
  const top = 1; // row 0: carried digits (one-digit multiplier only)
  b.step(
    'Dauginamąjį ir daugiklį rašome vieną po kitu, lygiuodami dešinėje.',
    'Пишем множители друг под другом, выравнивая по правому краю.',
    'Write the factors one under another, lined up on the right.',
  );
  b.num(top, last, a, 'digit', 0);
  b.num(top + 1, last, m, 'digit', 0);
  b.put(top + 1, 0, '×', 'sign', 0);
  b.rules.push({ row: top + 1, from: 0, to: last, step: 0 });

  if (one) {
    let carry = 0;
    const ad = digits(a).reverse();
    for (let p = 0; p < ad.length; p++) {
      const s = b.steps.length;
      const v = ad[p] * m + carry;
      const isLast = p === ad.length - 1;
      const write = isLast ? v : v % 10;
      const focus = [key(top, col(p)), key(top + 1, last)];
      if (carry) focus.push(key(0, col(p)));
      b.num(top + 2, col(p), write, 'result', s);
      focus.push(...String(write).split('').map((_, i) => key(top + 2, col(p) - i)));
      const next = Math.floor(v / 10);
      if (!isLast && next) {
        b.put(0, col(p + 1), String(next), 'small', s);
        focus.push(key(0, col(p + 1)));
      }
      const expr = `${ad[p]} · ${m}` + (carry ? ` + ${carry}` : '');
      b.step(
        `${cap(place(p, 'lt'))}: ${expr} = ${v}.` + (isLast ? ` Rašome ${v}.` : next ? ` Rašome ${v % 10}, ${next} perkeliame į ${PLACE[p + 1].ltGen} skyrių.` : ` Rašome ${v}.`),
        `${cap(place(p, 'ru'))}: ${expr} = ${v}.` + (isLast ? ` Пишем ${v}.` : next ? ` Пишем ${v % 10}, ${next} запоминаем.` : ` Пишем ${v}.`),
        `${cap(place(p, 'en'))}: ${expr} = ${v}.` + (isLast ? ` Write ${v}.` : next ? ` Write ${v % 10}, carry ${next}.` : ` Write ${v}.`),
        focus,
      );
      carry = next;
    }
  } else {
    let row = top + 2;
    const partials: { row: number; value: number; shift: number }[] = [];
    for (let p = 0; p < md.length; p++) {
      const s = b.steps.length;
      if (md[p] === 0) {
        b.step(
          `Daugiklio ${PLACE[p].ltGen} skaitmuo – 0. Nulių eilutės nereikia: kitą eilutę rašysime dar vienu langeliu kairiau.`,
          `Цифра ${PLACE[p].gen} во втором множителе — 0. Строка из нулей не нужна: следующую строку сдвинем ещё на клетку.`,
          `The ${place(p, 'en')} digit is 0. No row of zeros is needed: the next row moves one more cell left.`,
          [key(top + 1, col(p))],
        );
        continue;
      }
      const v = a * md[p];
      b.num(row, col(p), v, 'result', s);
      const focus = [key(top + 1, col(p)), ...String(v).split('').map((_, i) => key(row, col(p) - i))];
      b.step(
        p === 0
          ? `${fmt(a)} · ${md[p]} = ${fmt(v)}. Rašome po brūkšniu, paskutinį skaitmenį – po vienetais.`
          : `${fmt(a)} · ${md[p]} (${PLACE[p].lt}) = ${fmt(v)}. Paskutinį skaitmenį rašome po ${PLACE[p].ltIns}: ${p} ${p === 1 ? 'langeliu' : 'langeliais'} kairiau.`,
        p === 0
          ? `${fmt(a)} · ${md[p]} = ${fmt(v)}. Пишем под чертой, последняя цифра под единицами.`
          : `${fmt(a)} · ${md[p]} (${PLACE[p].ru}) = ${fmt(v)}. Последнюю цифру пишем под ${PLACE[p].ins}: сдвиг на ${p} ${p === 1 ? 'клетку' : 'клетки'} влево.`,
        p === 0
          ? `${fmt(a)} · ${md[p]} = ${fmt(v)}. Write it under the line, last digit under the units.`
          : `${fmt(a)} · ${md[p]} (${PLACE[p].en}) = ${fmt(v)}. Its last digit goes under the ${PLACE[p].en}: ${p} cell${p === 1 ? '' : 's'} to the left.`,
        focus,
      );
      partials.push({ row, value: v, shift: p });
      row++;
    }
    if (partials.length > 1) {
      const s = b.steps.length;
      b.rules.push({ row: row - 1, from: 0, to: last, step: s });
      b.put(row - 1, 0, '+', 'sign', s);
      b.num(row, last, product, 'result', s);
      const sum = partials.map((x) => fmt(x.value * 10 ** x.shift)).join(' + ');
      b.step(
        `Eilutes sudedame stulpeliu: ${sum} = ${fmt(product)}.`,
        `Складываем строки столбиком: ${sum} = ${fmt(product)}.`,
        `Add the rows in a column: ${sum} = ${fmt(product)}.`,
        String(product).split('').map((_, i) => key(row, last - i)),
      );
    } else {
      // Only one non-zero digit (e.g. · 20): its row is the answer; add the shifted zeros.
      const x = partials[0];
      const s = b.steps.length;
      for (let p = 0; p < x.shift; p++) b.put(x.row, col(p), '0', 'result', s);
      b.step(
        `Dešinėje prirašome ${x.shift === 1 ? 'nulį' : 'nulius'}: ${fmt(product)}.`,
        `Справа дописываем ${x.shift === 1 ? 'ноль' : 'нули'} от сдвига: ${fmt(product)}.`,
        `Fill the shifted place${x.shift === 1 ? '' : 's'} on the right with zero${x.shift === 1 ? '' : 's'}: ${fmt(product)}.`,
        Array.from({ length: x.shift }, (_, p) => key(x.row, col(p))),
      );
    }
  }
  const ld = ((a % 10) * (m % 10)) % 10;
  return {
    op: 'mul', rows: 0, cols: b.cols, cells: b.cells, rules: b.rules, steps: b.steps, result: product,
    legend: [
      { value: a, lt: 'dauginamasis', term: { ru: 'первый множитель', en: 'multiplicand' } },
      { value: m, lt: 'daugiklis', term: { ru: 'второй множитель', en: 'multiplier' } },
      { value: product, lt: 'sandauga', term: { ru: 'произведение', en: 'product' } },
    ],
    check: [
      {
        lt: `Paskutinis skaitmuo: ${a % 10} · ${m % 10} = ${(a % 10) * (m % 10)}, todėl atsakymas baigiasi ${ld}.`,
        ru: `Последняя цифра: ${a % 10} · ${m % 10} = ${(a % 10) * (m % 10)}, значит ответ оканчивается на ${ld}.`,
        en: `Last digit: ${a % 10} · ${m % 10} = ${(a % 10) * (m % 10)}, so the answer ends in ${ld}.`,
      },
      {
        lt: `Apytiksliai: ${fmt(rough(a))} · ${fmt(rough(m))} = ${fmt(rough(a) * rough(m))}, atsakymas turi būti netoli.`,
        ru: `Прикидка: ${fmt(rough(a))} · ${fmt(rough(m))} = ${fmt(rough(a) * rough(m))}, ответ должен быть рядом.`,
        en: `Estimate: ${fmt(rough(a))} · ${fmt(rough(m))} = ${fmt(rough(a) * rough(m))}; the answer should be close.`,
      },
    ],
  };
}

function division(a: number, d: number): Layout {
  const q = Math.floor(a / d);
  const rem = a % d;
  const ad = digits(a);
  const n = ad.length;
  // Column 0: minus signs; 1..n: the dividend; then the corner with the divisor and the quotient.
  const right = n + 1;
  const width = Math.max(String(d).length, String(q).length);
  const b = new Builder(right + width);
  const dc = (i: number) => 1 + i; // column of the dividend's digit i
  b.step(
    'Rašome dalinį, dešinėje už kampo – daliklį. Dalmenį rašysime po dalikliu.',
    'Пишем делимое, справа за уголком — делитель. Частное будем писать под делителем.',
    'Write the dividend, the divisor to the right behind the corner. The quotient goes under the divisor.',
  );
  b.num(0, dc(n - 1), a, 'digit', 0);
  b.num(0, right + String(d).length - 1, d, 'digit', 0);
  b.rules.push({ row: 0, from: right, to: right + width - 1, step: 0 });

  let qCol = right;
  const writeQ = (digit: number, s: number) => {
    b.put(1, qCol, String(digit), 'result', s);
    return key(1, qCol++);
  };

  // First incomplete dividend: the shortest start of the number that is not less than the divisor.
  let i = 0;
  let cur = ad[0];
  while (cur < d && i < n - 1) cur = cur * 10 + ad[++i];
  let row = 0;
  let curFocus = Array.from({ length: i + 1 }, (_, k) => key(0, dc(k)));
  if (cur < d) {
    const s = b.steps.length;
    const f = writeQ(0, s);
    b.step(`${a} mažesnis už ${d}: dalmuo 0, liekana ${a}.`, `${a} меньше ${d}: частное 0, остаток ${a}.`, `${a} is less than ${d}: the quotient is 0, the remainder ${a}.`, [f]);
  } else {
    b.step(
      `Imame tiek pirmųjų skaitmenų, kad skaičius būtų ne mažesnis už ${d}: tai ${cur}.`,
      `Берём столько первых цифр, чтобы число было не меньше ${d}: это ${cur}.`,
      `Take as many first digits as needed to get at least ${d}: that is ${cur}.`,
      curFocus,
    );
  }
  let first = true;
  while (cur >= d || !first) {
    first = false;
    let s = b.steps.length;
    if (cur < d) {
      // Not enough to divide: 0 in the quotient, bring the next digit down (or stop).
      const f = writeQ(0, s);
      if (i === n - 1) {
        b.step(
          `${cur} mažesnis už ${d}: dalmenyje rašome 0. Skaitmenų nebeliko, ${cur} – liekana.`,
          `${cur} меньше ${d}: в частном пишем 0. Цифр больше нет, ${cur} — остаток.`,
          `${cur} is less than ${d}: write 0 in the quotient. No digits left, ${cur} is the remainder.`,
          [...curFocus, f],
        );
        break;
      }
      i++;
      cur = cur * 10 + ad[i];
      b.put(row, dc(i), String(ad[i]), 'digit', s);
      b.step(
        `${Math.floor(cur / 10)} mažesnis už ${d}: dalmenyje rašome 0 (nepraleisk jo!) ir nukeliame kitą skaitmenį ${ad[i]}. Gavome ${cur}.`,
        `${Math.floor(cur / 10)} меньше ${d}: в частном пишем 0 (не пропускай его!) и сносим следующую цифру ${ad[i]}. Получилось ${cur}.`,
        `${Math.floor(cur / 10)} is less than ${d}: write 0 in the quotient (don't skip it!) and bring down the next digit ${ad[i]}. Now it is ${cur}.`,
        [f, key(row, dc(i)), key(0, dc(i))],
      );
      curFocus = String(cur).split('').map((_, k) => key(row, dc(i) - k));
      continue;
    }
    const digit = Math.floor(cur / d);
    const prod = digit * d;
    const left = cur - prod;
    const f = writeQ(digit, s);
    b.num(row + 1, dc(i), prod, 'digit', s);
    b.put(row + 1, dc(i) - String(prod).length, '−', 'sign', s);
    b.rules.push({ row: row + 1, from: dc(i) - String(cur).length + 1, to: dc(i), step: s });
    const prodFocus = String(prod).split('').map((_, k) => key(row + 1, dc(i) - k));
    b.step(
      `${cur} : ${d} = ${digit} (${digit} · ${d} = ${prod}${digit < 9 ? `, o ${digit + 1} · ${d} = ${(digit + 1) * d} jau per daug` : ''}). Dalmenyje rašome ${digit}, ${prod} – po ${cur}.`,
      `${cur} : ${d} = ${digit} (${digit} · ${d} = ${prod}${digit < 9 ? `, а ${digit + 1} · ${d} = ${(digit + 1) * d} уже больше` : ''}). Пишем ${digit} в частное, ${prod} под ${cur}.`,
      `${cur} : ${d} = ${digit} (${digit} · ${d} = ${prod}${digit < 9 ? `, while ${digit + 1} · ${d} = ${(digit + 1) * d} is too much` : ''}). Write ${digit} in the quotient, ${prod} under ${cur}.`,
      [...curFocus, f, ...prodFocus],
    );
    s = b.steps.length;
    row += 2;
    const remFocus: string[] = [];
    if (left > 0 || i === n - 1) {
      b.num(row, dc(i), left, 'result', s);
      remFocus.push(...String(left).split('').map((_, k) => key(row, dc(i) - k)));
    }
    if (i === n - 1) {
      b.step(
        `${cur} − ${prod} = ${left}. Skaitmenų nebeliko: ${left === 0 ? 'padalijome be liekanos' : `liekana ${left}`}.`,
        `${cur} − ${prod} = ${left}. Цифр больше нет: ${left === 0 ? 'разделилось без остатка' : `остаток ${left}`}.`,
        `${cur} − ${prod} = ${left}. No digits left: ${left === 0 ? 'no remainder' : `the remainder is ${left}`}.`,
        remFocus,
      );
      break;
    }
    i++;
    b.put(row, dc(i), String(ad[i]), 'digit', s);
    cur = left * 10 + ad[i];
    curFocus = String(cur).split('').map((_, k) => key(row, dc(i) - k));
    b.step(
      `${left + prod} − ${prod} = ${left}. Nukeliame kitą skaitmenį ${ad[i]}: gavome ${cur}.`,
      `${left + prod} − ${prod} = ${left}. Сносим следующую цифру ${ad[i]}: получилось ${cur}.`,
      `${left + prod} − ${prod} = ${left}. Bring down the next digit ${ad[i]}: now it is ${cur}.`,
      [...remFocus, key(row, dc(i)), key(0, dc(i))],
    );
  }
  return {
    op: 'div', rows: 0, cols: b.cols, cells: b.cells, rules: b.rules, bar: { col: right, rows: 2 }, steps: b.steps,
    result: q, remainder: rem,
    legend: [
      { value: a, lt: 'dalinys', term: { ru: 'делимое', en: 'dividend' } },
      { value: d, lt: 'daliklis', term: { ru: 'делитель', en: 'divisor' } },
      { value: q, lt: 'dalmuo', term: { ru: 'частное', en: 'quotient' } },
      ...(rem ? [{ value: rem, lt: 'liekana', term: { ru: 'остаток', en: 'remainder' } }] : []),
    ],
    check: [
      {
        lt: `Patikriname daugyba: ${fmt(q)} · ${d}${rem ? ` + ${rem}` : ''} = ${fmt(a)}.`,
        ru: `Проверка умножением: ${fmt(q)} · ${d}${rem ? ` + ${rem}` : ''} = ${fmt(a)}.`,
        en: `Check by multiplying: ${fmt(q)} · ${d}${rem ? ` + ${rem}` : ''} = ${fmt(a)}.`,
      },
      ...(String(q).length > 1 && String(q).includes('0')
        ? [{ lt: 'Dalmenyje yra 0: kiek kartų dalijome, tiek dalmens skaitmenų.', ru: 'В частном есть 0: сколько цифр в частном, столько раз делили.', en: 'The quotient has a 0: there is one quotient digit for every division step.' }]
        : []),
    ],
  };
}

// Checks the input; returns null when it is fine, or the reason it is not.
export function problem(op: Op, a: number, b: number): Tri | null {
  const whole = (n: number) => Number.isInteger(n) && n >= 0;
  if (!whole(a) || !whole(b)) return { lt: 'Reikia sveikųjų skaičių nuo 0.', ru: 'Нужны целые числа от 0.', en: 'Use whole numbers from 0.' };
  if (a > LIMITS.max || b > LIMITS.max) return { lt: `Skaičiai iki ${fmt(LIMITS.max)}.`, ru: `Числа до ${fmt(LIMITS.max)}.`, en: `Numbers up to ${fmt(LIMITS.max)}.` };
  if (op === 'sub' && b > a) return { lt: 'Antrasis skaičius didesnis: sukeisk juos vietomis.', ru: 'Второе число больше первого: поменяй их местами.', en: 'The second number is bigger: swap them.' };
  if (op === 'mul' && b > LIMITS.mulBy) return { lt: `Daugiklis iki ${LIMITS.mulBy}.`, ru: `Второй множитель до ${LIMITS.mulBy}.`, en: `Second factor up to ${LIMITS.mulBy}.` };
  if (op === 'div' && b === 0) return { lt: 'Dalyti iš 0 negalima.', ru: 'На 0 делить нельзя.', en: "You can't divide by 0." };
  if (op === 'div' && b > LIMITS.divBy) return { lt: `Daliklis iki ${LIMITS.divBy}.`, ru: `Делитель до ${LIMITS.divBy}.`, en: `Divisor up to ${LIMITS.divBy}.` };
  return null;
}

export function layout(op: Op, a: number, b: number): Layout {
  const l = op === 'add' ? addition([a, b]) : op === 'sub' ? subtraction(a, b) : op === 'mul' ? multiplication(a, b) : division(a, b);
  l.rows = Math.max(...l.cells.map((c) => c.row), ...l.rules.map((r) => r.row)) + 1;
  return l;
}

// What the grid shows at a step, row by row; for tests and screen readers.
export function textAt(l: Layout, step: number): string[] {
  const rows = Array.from({ length: l.rows }, () => Array<string>(l.cols).fill(' '));
  for (const c of l.cells) {
    if (c.step > step || (c.until !== undefined && step >= c.until)) continue;
    rows[c.row][c.col] = c.struckAt !== undefined && step >= c.struckAt ? '/' : c.text;
  }
  return rows.map((r) => r.join('').trimEnd());
}
