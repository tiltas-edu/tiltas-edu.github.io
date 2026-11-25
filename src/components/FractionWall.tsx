import { useState, type CSSProperties } from 'react';
import Bi from './Bi';
import { MAX_DEN, MAX_WHOLE, equal, meaning, name, partOf } from '../lib/fraction';
import { visualLt, type visual } from '../i18n/visual';

type Labels = (typeof visual)['ru' | 'en'];
type Lang = 'ru' | 'en';
const ROWS = Array.from({ length: MAX_DEN }, (_, i) => i + 1);

function Stepper({ value, min, max, set, label }: { value: number; min: number; max: number; set: (v: number) => void; label: string }) {
  return (
    <span className="fw__stepper" role="group" aria-label={label}>
      <button type="button" className="btn btn--soft" disabled={value <= min} onClick={() => set(value - 1)} aria-label={`${label} −`}>−</button>
      <button type="button" className="btn btn--soft" disabled={value >= max} onClick={() => set(value + 1)} aria-label={`${label} +`}>+</button>
    </span>
  );
}

export default function FractionWall({ lang, labels }: { lang: Lang; labels: Labels }) {
  const [a, setA] = useState(3);
  const [n, setN] = useState(4);
  const [whole, setWhole] = useState('12');
  const eq = equal(a, n);
  const eqDen = new Map(eq.map(([b, m]) => [m, b]));
  const N = Number(whole);
  const okWhole = Number.isInteger(N) && N > 0 && N <= MAX_WHOLE;
  const split = okWhole && N % n === 0;
  const m = meaning(a, n);
  const part = okWhole ? partOf(N, a, n) : null;

  const setDen = (v: number) => {
    setN(v);
    setA(Math.min(a, v));
  };

  return (
    <div className="fw">
      <div className="fw__top">
        <div className="fw__frac" aria-live="polite">
          <div className="fw__num">
            <span className="fw__big">{a}</span>
            <Stepper value={a} min={1} max={n} set={setA} label={labels.numerator} />
            <span className="fw__term"><span lang="lt">{visualLt.numerator}</span> <span className="native">({labels.numerator})</span></span>
          </div>
          <div className="fw__line"><span className="fw__term"><span lang="lt">{visualLt.bar}</span> <span className="native">({labels.bar})</span></span></div>
          <div className="fw__num">
            <span className="fw__big">{n}</span>
            <Stepper value={n} min={1} max={MAX_DEN} set={setDen} label={labels.denominator} />
            <span className="fw__term"><span lang="lt">{visualLt.denominator}</span> <span className="native">({labels.denominator})</span></span>
          </div>
        </div>
        <div className="fw__about">
          <Bi as="p" lt={name('lt', a, n)} native={name(lang, a, n)} />
          <Bi as="p" lt={m.lt} native={m[lang]} />
          {eq.length > 0 ? (
            <>
              <Bi as="p" lt={visualLt.equal} native={labels.equal} />
              <p className="fw__eq">{[[a, n], ...eq].map(([b, d]) => `${b}/${d}`).join(' = ')}</p>
            </>
          ) : (
            <Bi as="p" lt={visualLt.noEqual} native={labels.noEqual} />
          )}
        </div>
      </div>

      <div className="fw__wall" style={{ '--at': a / n } as CSSProperties}>
        <span className="fw__mark" aria-hidden="true" />
        {ROWS.map((r) => (
          <div key={r} className={`fw__row${r >= 9 ? ' fw__row--tight' : ''}`} role="group" aria-label={`1/${r}`}>
            {Array.from({ length: r }, (_, k) => {
              const cls = ['fw__seg', r === n && k < a ? 'fw__on' : '', r !== n && k < (eqDen.get(r) ?? 0) ? 'fw__same' : '']
                .filter(Boolean).join(' ');
              return (
                <button key={k} type="button" className={cls} aria-pressed={r === n && k < a}
                  aria-label={`${k + 1}/${r}`} onClick={() => { setN(r); setA(k + 1); }}>
                  {r === 1 ? '1' : `1/${r}`}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="callout callout--hint"><Bi lt={visualLt.fracTip} native={labels.fracTip} /></div>

      <h2><span lang="lt">{visualLt.part}</span> <span className="native note">({labels.part})</span></h2>
      <Bi as="p" lt={visualLt.partHow} native={labels.partHow} />
      <div className="row fw__part">
        <label className="ul__field">
          <span className="note">{labels.whole} (≤ {MAX_WHOLE})</span>
          <input type="text" inputMode="numeric" className="cm__input" value={whole} onChange={(e) => setWhole(e.target.value.replace(/\D/g, ''))} />
        </label>
        <p className="fw__big">{a}/{n} · {okWhole ? N : '?'}</p>
      </div>
      {part && (
        <div className={`callout ${split ? 'callout--ok' : 'callout--hint'}`} aria-live="polite">
          <Bi lt={part.lt} native={part[lang]} />
        </div>
      )}
      {split && (
        <div className="fw__groups" aria-hidden="true">
          {Array.from({ length: n }, (_, g) => (
            <span key={g} className={`fw__group${g < a ? ' fw__group--on' : ''}`}>
              {Array.from({ length: N / n }, (_, d) => <span key={d} />)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
