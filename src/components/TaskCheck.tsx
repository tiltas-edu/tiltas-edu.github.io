import { useState } from 'react';
import Icon from './Icon';

interface Props {
  /** Remembered in this browser once solved, so the subject page can mark it. */
  taskId: string;
  accepted: string[];
  /** Typical wrong answers with a hint in the page language. */
  mistakes?: { value: string; hint: string }[];
  labels: { yourAnswer: string; check: string; correct: string; wrong: string; tryAgain: string };
  unit?: string;
  /** Answer options (Lithuanian). Without them the child types a number. */
  choices?: string[];
}

// First number in the input, so a unit typed after it ("216 m2", "5 000 cm²") is ignored.
const norm = (s: string) => (s.match(/-?\d[\d\s ]*(?:[.,]\d+)?/)?.[0] ?? '').replace(/[\s ]/g, '').replace(',', '.');
const text = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
// Numbers are compared as numbers; a text answer (a chosen option) must match exactly, ignoring case.
const same = (a: string, b: string) =>
  norm(a) !== '' ? norm(b) !== '' && Number(norm(a)) === Number(norm(b)) : text(a) === text(b);

export const solvedKey = (id: string) => `tiltas:solved:${id}`;

export default function TaskCheck({ taskId, accepted, mistakes = [], labels, unit, choices }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [hint, setHint] = useState<string | null>(null);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const ok = accepted.some((a) => same(a, value));
    setState(ok ? 'ok' : 'bad');
    if (ok) {
      try { localStorage.setItem(solvedKey(taskId), '1'); } catch { /* private mode: nothing to remember */ }
    }
    setHint(ok ? null : (mistakes.find((m) => same(m.value, value))?.hint ?? null));
  };

  return (
    <form onSubmit={submit}>
      {choices ? (
        <fieldset className="choices">
          <legend className="sr-only">{labels.yourAnswer}</legend>
          {choices.map((c) => (
            <label key={c} className="choice" lang="lt">
              <input type="radio" name="answer" value={c} checked={value === c}
                onChange={() => { setValue(c); setState('idle'); }} />
              <span>{c}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <div className="row">
        {!choices && <label>
          <span className="sr-only">{labels.yourAnswer}</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder={labels.yourAnswer}
            value={value}
            onChange={(e) => { setValue(e.target.value); setState('idle'); }}
          />
        </label>}
        {unit && <strong>{unit}</strong>}
        <button className="btn" type="submit" disabled={!value}><Icon name="check" /> {labels.check}</button>
      </div>
      <div aria-live="polite">
        {state === 'ok' && <p className="callout callout--ok pop"><Icon name="check" /> <strong>{labels.correct}</strong></p>}
        {state === 'bad' && hint && (
          <p className="callout callout--hint"><Icon name="bulb" /> {hint} {labels.tryAgain}</p>
        )}
        {state === 'bad' && !hint && <p className="callout callout--bad"><Icon name="x" /> {labels.wrong}</p>}
      </div>
    </form>
  );
}
