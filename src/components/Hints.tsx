import { useEffect, useState } from 'react';
import Icon from './Icon';
import Scheme from './Scheme';
import type { Scheme as S } from '../lib/scheme';

type Lang = 'ru' | 'en';
interface Props {
  taskId: string;
  lang: Lang;
  scheme?: S;
  steps: string[];
  answer: string;
  labels: { hint: string; hintOf: string; scheme: string; firstStep: string; solution: string; showSolution: string; answer: string };
}

// Hints one at a time: the scheme with "?", the first step, then the whole solution with the scheme filled in.
// A wrong answer (TaskCheck sends "tiltas:check") opens the scheme by itself.
export default function Hints({ taskId, lang, scheme, steps, answer, labels }: Props) {
  const kinds = [scheme && 'scheme', steps.length > 1 && 'first', 'solution'].filter(Boolean) as string[];
  const [level, setLevel] = useState(0);
  const has = (k: string) => kinds.indexOf(k) > -1 && kinds.indexOf(k) < level;
  const done = has('solution');

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ taskId: string; ok: boolean }>).detail;
      if (d.taskId === taskId && !d.ok && scheme) setLevel((l) => Math.max(l, 1));
    };
    window.addEventListener('tiltas:check', on);
    return () => window.removeEventListener('tiltas:check', on);
  }, [taskId, scheme]);

  const next = kinds[level];
  return (
    <div className="hints">
      {has('scheme') && !done && (
        <section className="hint-card" aria-live="polite">
          <h3 className="callout__title"><Icon name="bulb" /> <span lang="lt">Schema</span> <span className="native">({labels.scheme})</span></h3>
          <Scheme scheme={scheme!} lang={lang} />
        </section>
      )}
      {has('first') && !done && (
        <section className="hint-card" aria-live="polite">
          <h3 className="callout__title"><Icon name="bulb" /> {labels.firstStep}</h3>
          <p>{steps[0]}</p>
        </section>
      )}
      {done && (
        <section className="hint-card hint-card--solution" aria-live="polite">
          <h2>{labels.solution}</h2>
          {scheme && <Scheme scheme={scheme} lang={lang} solved />}
          <ol className="steps">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <p className="answer">{labels.answer}: {answer}</p>
        </section>
      )}
      {next && (
        <button type="button" className="btn btn--soft" onClick={() => setLevel(level + 1)}>
          <Icon name="bulb" />{' '}
          {next === 'solution' ? labels.showSolution : labels.hint}{' '}
          {kinds.length > 1 && <span className="note">({labels.hintOf.replace('{n}', String(level + 1)).replace('{total}', String(kinds.length))})</span>}
        </button>
      )}
    </div>
  );
}
