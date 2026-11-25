import { useState, type CSSProperties } from 'react';
import Bi from './Bi';
import { LADDERS, KIND_NAME, chain, convert, fmt, parse, stepText, type Kind } from '../lib/units';
import { visualLt, type visual } from '../i18n/visual';

type Labels = (typeof visual)['ru' | 'en'];
type Lang = 'ru' | 'en';

// Examples from typical tasks: going down, going up with a remainder, the 1000 and 60 steps.
const EXAMPLES: Record<Kind, [number, string, string][]> = {
  length: [[350, 'cm', 'm'], [2, 'm', 'cm'], [3, 'km', 'm'], [45, 'mm', 'cm']],
  mass: [[2, 'kg', 'g'], [3500, 'g', 'kg'], [3, 'cnt', 'kg'], [2, 't', 'cnt'], [2500, 'mg', 'g']],
  capacity: [[3, 'l', 'ml'], [1500, 'ml', 'l'], [2, 'm3', 'l']],
  time: [[2, 'h', 'min'], [90, 'min', 'h'], [1, 'para', 'h'], [3, 'min', 's']],
};
const KINDS = Object.keys(LADDERS) as Kind[];

export default function UnitLadder({ lang, labels }: { lang: Lang; labels: Labels }) {
  const [kind, setKind] = useState<Kind>('length');
  const [text, setText] = useState('350');
  const [from, setFrom] = useState('cm');
  const [to, setTo] = useState('m');
  const L = LADDERS[kind];
  const value = parse(text);
  const r = value === null ? null : convert(kind, value, from, to);
  const fi = L.findIndex((x) => x.id === from);
  const ti = L.findIndex((x) => x.id === to);
  const [lo, hi] = [Math.min(fi, ti), Math.max(fi, ti)];

  const pick = (k: Kind, [v, f, t] = EXAMPLES[k][0]) => {
    setKind(k);
    setText(String(v));
    setFrom(f);
    setTo(t);
  };

  return (
    <div className="ul">
      <div className="tabs" role="group" aria-label={labels.kinds}>
        {KINDS.map((k) => (
          <button key={k} type="button" className="tab" aria-pressed={kind === k} onClick={() => pick(k)}>
            <span lang="lt">{KIND_NAME[k].lt}</span>&nbsp;<span className="native">({KIND_NAME[k][lang]})</span>
          </button>
        ))}
      </div>

      <div className="row">
        <span className="note">{labels.examples}:</span>
        {EXAMPLES[kind].map((e) => (
          <button key={e.join()} type="button" className="btn btn--soft cm__ex" onClick={() => pick(kind, e)}>
            {e[0]} {e[1]} → {e[2]}
          </button>
        ))}
      </div>

      <div className="ul__board">
        <ol className="ul__ladder" aria-label={labels.unitsTitle}>
          {L.map((x, i) => {
            const cls = ['ul__rung', i === fi ? 'ul__from' : '', i === ti ? 'ul__to' : '', i > lo && i < hi ? 'ul__path' : '']
              .filter(Boolean).join(' ');
            const next = L[i + 1];
            return (
              <li key={x.id} style={{ '--i': i } as CSSProperties}>
                <div className={cls}>
                  <strong>{x.sym.lt}</strong>
                  <span><span lang="lt">{x.name.lt}</span> <span className="native">({x.name[lang]})</span></span>
                </div>
                {next && (
                  <div className={`ul__gap${i >= lo && i < hi ? ' ul__gap--on' : ''}`}>
                    <span>↓ · {fmt('lt', x.size / next.size)}</span>
                    <span>↑ : {fmt('lt', x.size / next.size)}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="ul__side">
          <form className="row" onSubmit={(e) => e.preventDefault()}>
            <label className="ul__field">
              <span className="note">{labels.value}</span>
              <input type="text" inputMode="decimal" className="cm__input" value={text} onChange={(e) => setText(e.target.value)} />
            </label>
          </form>
          <div className="ul__pick">
            <span className="note">{labels.from}</span>
            <div className="tabs" role="group" aria-label={labels.from}>
              {L.map((x) => (
                <button key={x.id} type="button" className="tab" aria-pressed={from === x.id} onClick={() => setFrom(x.id)}>{x.sym[lang]}</button>
              ))}
            </div>
            <span className="note">{labels.to}</span>
            <div className="tabs" role="group" aria-label={labels.to}>
              {L.map((x) => (
                <button key={x.id} type="button" className="tab" aria-pressed={to === x.id} onClick={() => setTo(x.id)}>{x.sym[lang]}</button>
              ))}
            </div>
          </div>

          {r && value !== null && (
            <div aria-live="polite">
              <p className="ul__answer">
                {fmt('lt', value)} {L[fi].sym.lt} = <strong>{fmt('lt', r.value)} {L[ti].sym.lt}</strong>
                {r.mixed && <> = <strong>{r.mixed.whole} {r.mixed.to.sym.lt} {fmt('lt', r.mixed.rest)} {r.mixed.from.sym.lt}</strong></>}
              </p>
              {r.steps.length > 0 && (
                <ol className="ul__steps">
                  {r.steps.map((s, i) => {
                    const t = stepText(s);
                    return <li key={i}><Bi lt={t.lt} native={t[lang]} /></li>;
                  })}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="callout callout--hint">
        <Bi as="p" lt={`${visualLt.down}, ${visualLt.up.toLowerCase()}.`} native={`${labels.down}, ${labels.up.toLowerCase()}.`} />
        <h3 className="callout__title"><span lang="lt">{visualLt.remember}</span> <span className="native">({labels.remember})</span></h3>
        {L.slice(0, -1).map((x, i) => <p key={x.id} className="ul__chain">{chain(kind, 'lt', i)}</p>)}
      </div>
    </div>
  );
}
