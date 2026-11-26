import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { isCorrect, hintFor } from '../lib/answer';
import { load, record, save, type State } from '../lib/progress';

interface Props {
  /** Remembered in this browser once solved, so the subject page can mark it. */
  taskId: string;
  accepted: string[];
  /** Typical wrong answers with a hint in the page language. */
  mistakes?: { value: string; hint: string }[];
  labels: { yourAnswer: string; check: string; correct: string; wrong: string; tryAgain: string; recheckNote: string; fixed: string };
  unit?: string;
  /** Answer options (Lithuanian). Without them the child types a number. */
  choices?: string[];
}

export default function TaskCheck({ taskId, accepted, mistakes = [], labels, unit, choices }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [hint, setHint] = useState<string | null>(null);
  const [after, setAfter] = useState<{ state: State; fixed: boolean } | null>(null);
  // A hint opened or a wrong answer on this visit: the task then has to be solved again on another day.
  const helped = useRef(false);

  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent<{ taskId: string }>).detail.taskId === taskId) helped.current = true; };
    window.addEventListener('tiltas:hint', on);
    return () => window.removeEventListener('tiltas:hint', on);
  }, [taskId]);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const ok = isCorrect(accepted, value);
    setState(ok ? 'ok' : 'bad');
    // Remembered in this browser: the subject page marks the task, "My mistakes" lists it until it is solved without help.
    const prev = load(taskId);
    const next = record(prev, { ok, value, helped: helped.current, now: Date.now() });
    save(taskId, next);
    if (!ok) helped.current = true;
    setAfter(ok ? { state: next.state, fixed: next.state === 'solved' && prev !== null && prev.state !== 'solved' } : null);
    setHint(ok ? null : hintFor(mistakes, value));
    // Hints opens the solution scheme after a wrong answer.
    window.dispatchEvent(new CustomEvent('tiltas:check', { detail: { taskId, ok } }));
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
        {state === 'ok' && (
          <p className="callout callout--ok pop">
            <Icon name="check" /> <strong>{labels.correct}</strong>
            {after?.fixed && <> {labels.fixed}</>}
            {after?.state === 'recheck' && <> {labels.recheckNote}</>}
          </p>
        )}
        {state === 'bad' && hint && (
          <p className="callout callout--hint"><Icon name="bulb" /> {hint} {labels.tryAgain}</p>
        )}
        {state === 'bad' && !hint && <p className="callout callout--bad"><Icon name="x" /> {labels.wrong}</p>}
      </div>
    </form>
  );
}
