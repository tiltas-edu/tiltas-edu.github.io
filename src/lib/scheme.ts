// Solution schemes of tasks (the `scheme` field, schema in content.config.ts). Pure helpers, tested in scheme.test.ts.

export interface Lbl { lt: string; ru?: string; en?: string; value: string; find: boolean }
export interface Node { lbl: Lbl; op?: string; kids?: Node[] }
export type Scheme =
  | {
      kind: 'shape'; square: boolean; cols: number; rows: number;
      around?: Lbl; bottom?: Lbl; side?: Lbl; inside?: Lbl; cell?: Lbl; cellSide?: Lbl;
      shade?: [number, number]; shadeLbl?: Lbl; ext?: Lbl;
    }
  | { kind: 'bar'; total: Lbl; parts: { w: number; lbl?: Lbl; mark: boolean }[] }
  | { kind: 'tree'; root: Node }
  | {
      kind: 'road'; len: number;
      arrows: { from: number; to: number; lbl: Lbl; below: boolean }[];
      braces: { from: number; to: number; lbl: Lbl; below: boolean }[];
      notes: Lbl[];
    };

// In a hint the asked value is "?"; in the solution it is filled in.
export const shown = (l: Lbl, solved: boolean) => (l.find && !solved ? '?' : l.value);

export function labels(s: Scheme): Lbl[] {
  const out: Lbl[] = [];
  const walk = (n: Node) => { out.push(n.lbl); n.kids?.forEach(walk); };
  if (s.kind === 'shape') {
    for (const k of ['around', 'bottom', 'side', 'inside', 'cell', 'cellSide', 'shadeLbl', 'ext'] as const) if (s[k]) out.push(s[k]);
  } else if (s.kind === 'bar') {
    out.push(s.total);
    s.parts.forEach((p) => p.lbl && out.push(p.lbl));
  } else if (s.kind === 'road') {
    s.arrows.forEach((a) => out.push(a.lbl));
    s.braces.forEach((b) => out.push(b.lbl));
    out.push(...s.notes);
  } else walk(s.root);
  return out;
}

// "ilgis — длина" pairs under the picture, each Lithuanian word once.
export function legend(s: Scheme, lang: 'ru' | 'en') {
  const seen = new Map<string, string>();
  // Formulas and numbers ("40 : 4", "≈ 50") read the same in every language: no legend line for them.
  for (const l of labels(s)) if (l.lt && l[lang] && l[lang] !== l.lt && !seen.has(l.lt)) seen.set(l.lt, l[lang]!);
  return [...seen].map(([lt, tr]) => ({ lt, tr }));
}
