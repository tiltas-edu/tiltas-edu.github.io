import { useState } from 'react';
import Bi from './Bi';
import { rowsOf, visualLt, type visual } from '../i18n/visual';

type Labels = (typeof visual)['ru' | 'en'];
type Tips = Record<'tip1' | 'tip2' | 'tip5' | 'tip9' | 'tip10' | 'tipSquare' | 'tipOther', string>;
const N = Array.from({ length: 10 }, (_, i) => i + 1);
const fill = (s: string, v: Record<string, number>) => s.replace(/\{(\w)\}/g, (_, k) => String(v[k]));

function tip(a: number, b: number, l: Tips) {
  const small = Math.min(a, b);
  const big = Math.max(a, b);
  if (small === 1) return l.tip1;
  if (small === 10 || big === 10) return l.tip10;
  if (small === 9 || big === 9) return l.tip9;
  if (small === 5 || big === 5) return l.tip5;
  if (small === 2) return l.tip2;
  if (a === b) return fill(l.tipSquare, { a });
  return fill(l.tipOther, { a: big, b: small, c: small - 1 });
}

export default function TimesTable({ labels, lang }: { labels: Labels; lang: 'ru' | 'en' }) {
  const [pick, setPick] = useState<[number, number]>([7, 8]);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [a, b] = pick;
  const p = a * b;

  const choose = (r: number, c: number) => {
    setPick([r, c]);
    if (hidden) setOpen((s) => new Set(s).add(`${r}x${c}`));
  };

  return (
    <div className="tt">
      <div className="tt__panel" aria-live="polite">
        <p className="tt__fact"><span>{a} · {b} =</span> <strong>{hidden && !open.has(`${a}x${b}`) ? '?' : p}</strong></p>
        <Bi as="p" lt={rowsOf('lt', a, b)} native={rowsOf(lang, a, b)} />
        <div className="tt__dots" style={{ gridTemplateColumns: `repeat(${b}, 1fr)` }} aria-hidden="true">
          {Array.from({ length: p }, (_, i) => <span key={i} />)}
        </div>
        {a !== b && !(hidden && !open.has(`${a}x${b}`)) && (
          <Bi as="p" lt={fill(visualLt.same, { a, b, p })} native={fill(labels.same, { a, b, p })} />
        )}
        <div className="callout callout--hint"><Bi lt={tip(a, b, visualLt)} native={tip(a, b, labels)} /></div>
      </div>

      <div className="tt__grid">
        <button className="btn btn--soft" type="button" onClick={() => { setHidden(!hidden); setOpen(new Set()); }}>
          {hidden ? labels.showAnswers : labels.hide}
        </button>
        <p className="tt__now" aria-hidden="true">{a} · {b} = <strong>{hidden && !open.has(`${a}x${b}`) ? '?' : p}</strong></p>
        <div className="tt__scroll">
          <table className="tt__table">
            <caption className="sr-only">{labels.timesTable}</caption>
            <thead>
              <tr>
                <th scope="col"><span aria-hidden="true">·</span></th>
                {N.map((c) => <th key={c} scope="col" className={c === b ? 'tt__on' : undefined}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {N.map((r) => (
                <tr key={r}>
                  <th scope="row" className={r === a ? 'tt__on' : undefined}>{r}</th>
                  {N.map((c) => {
                    const cls = [r === a && c === b ? 'tt__pick' : r === a || c === b ? 'tt__line' : '', r === c ? 'tt__diag' : '']
                      .filter(Boolean).join(' ');
                    const show = !hidden || open.has(`${r}x${c}`);
                    return (
                      <td key={c} className={cls || undefined}>
                        <button type="button" aria-label={`${r} · ${c}${show ? ` = ${r * c}` : ''}`} aria-pressed={r === a && c === b} onClick={() => choose(r, c)}>
                          {show ? r * c : '?'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
