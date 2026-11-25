import { useMemo, useState } from 'react';
import Icon from './Icon';
import { layout, problem, type Layout, type Op } from '../lib/column';

type Lang = 'ru' | 'en';
interface Props {
  lang: Lang;
  labels: Record<Op, string> & {
    first: string; second: string; show: string; next: string; prev: string; all: string; again: string;
    step: string; check: string; examples: string;
  };
}

const SIGN: Record<Op, string> = { add: '+', sub: '−', mul: '·', div: ':' };
// Examples come from real mistakes: carrying, zeros, a shifted row, a 0 in the quotient.
const EXAMPLES: Record<Op, [number, number][]> = {
  add: [[478, 356], [2657, 1659], [999, 1]],
  sub: [[512, 79], [1003, 8], [5000, 1234]],
  mul: [[45, 7], [45, 19], [84, 25], [123, 105]],
  div: [[136, 4], [4824, 4], [137, 4], [7056, 12]],
};

function Grid({ l, step }: { l: Layout; step: number }) {
  const focus = new Set(l.steps[step].focus);
  const slots = [];
  for (let row = 0; row < l.rows; row++) {
    for (let col = 0; col < l.cols; col++) {
      const cell = l.cells.find(
        (c) => c.row === row && c.col === col && c.step <= step && (c.until === undefined || step < c.until),
      );
      const cls = ['cm__cell'];
      if (l.rules.some((r) => r.row === row && r.step <= step && col >= r.from && col <= r.to)) cls.push('cm__rule');
      if (l.bar && col === l.bar.col && row < l.bar.rows) cls.push('cm__bar');
      if (cell) cls.push(`cm__${cell.kind}`);
      if (cell && cell.struckAt !== undefined && step >= cell.struckAt) cls.push('cm__struck');
      if (cell && focus.has(`${row}:${col}`)) cls.push('cm__focus');
      if (cell && cell.step === step && step > 0) cls.push('pop');
      slots.push(<span key={`${row}:${col}`} className={cls.join(' ')}>{cell?.text ?? ''}</span>);
    }
  }
  return (
    <div className="cm__grid" style={{ gridTemplateColumns: `repeat(${l.cols}, var(--cell))` }} aria-hidden="true">
      {slots}
    </div>
  );
}

export default function ColumnMath({ lang, labels }: Props) {
  const [op, setOp] = useState<Op>('add');
  const [a, setA] = useState('478');
  const [b, setB] = useState('356');
  const [shown, setShown] = useState<{ op: Op; a: number; b: number } | null>({ op: 'add', a: 478, b: 356 });
  const [step, setStep] = useState(0);

  const na = Number(a.replace(/\s/g, ''));
  const nb = Number(b.replace(/\s/g, ''));
  const error = a.trim() && b.trim() ? problem(op, na, nb) : null;
  const l = useMemo(() => (shown ? layout(shown.op, shown.a, shown.b) : null), [shown]);
  const last = l ? l.steps.length - 1 : 0;

  const show = (o: Op, x: number, y: number) => {
    setShown({ op: o, a: x, b: y });
    setStep(0);
  };
  const pick = (o: Op) => {
    const [x, y] = EXAMPLES[o][0];
    setOp(o);
    setA(String(x));
    setB(String(y));
    show(o, x, y);
  };
  const stepLabel = labels.step.replace('{n}', String(step + 1)).replace('{total}', String(last + 1));

  return (
    <div className="cm">
      <div className="tabs" role="group" aria-label={labels.examples}>
        {(Object.keys(SIGN) as Op[]).map((o) => (
          <button key={o} type="button" className="tab" aria-pressed={op === o} onClick={() => pick(o)}>
            <span aria-hidden="true">{SIGN[o]}&nbsp;</span>{labels[o]}
          </button>
        ))}
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!error && a.trim() && b.trim()) show(op, na, nb);
        }}
      >
        <label>
          <span className="sr-only">{labels.first}</span>
          <input type="text" inputMode="numeric" className="cm__input" value={a} onChange={(e) => setA(e.target.value)} />
        </label>
        <span className="cm__op" aria-hidden="true">{SIGN[op]}</span>
        <label>
          <span className="sr-only">{labels.second}</span>
          <input type="text" inputMode="numeric" className="cm__input" value={b} onChange={(e) => setB(e.target.value)} />
        </label>
        <button className="btn" type="submit" disabled={!!error || !a.trim() || !b.trim()}>{labels.show}</button>
      </form>
      {error && <p className="callout callout--hint"><Icon name="bulb" /> {error[lang]}</p>}

      <div className="row">
        <span className="note">{labels.examples}:</span>
        {EXAMPLES[op].map(([x, y]) => (
          <button key={`${x}-${y}`} type="button" className="btn btn--soft cm__ex" onClick={() => { setA(String(x)); setB(String(y)); show(op, x, y); }}>
            {x} {SIGN[op]} {y}
          </button>
        ))}
      </div>

      {l && (
        <div className="cm__board">
          <Grid l={l} step={step} />
          <div className="cm__side">
            <p className="note">{stepLabel}</p>
            <p className="cm__text" aria-live="polite">{l.steps[step].text[lang]}</p>
            <div className="row">
              <button className="btn btn--soft" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>← {labels.prev}</button>
              {step < last ? (
                <>
                  <button className="btn" type="button" onClick={() => setStep(step + 1)}>{labels.next} →</button>
                  <button className="btn btn--soft" type="button" onClick={() => setStep(last)}>{labels.all}</button>
                </>
              ) : (
                <button className="btn btn--soft" type="button" onClick={() => setStep(0)}><Icon name="flip" /> {labels.again}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {l && step === last && (
        <>
          <ul className="cm__legend">
            {l.legend.map((x, i) => (
              <li key={i}><strong>{x.value}</strong> — <span lang="lt">{x.lt}</span> ({x.term[lang]})</li>
            ))}
          </ul>
          <div className="callout callout--ok">
            <h3 className="callout__title"><Icon name="check" /> {labels.check}</h3>
            {l.check.map((c, i) => <p key={i}>{c[lang]}</p>)}
          </div>
        </>
      )}
    </div>
  );
}
