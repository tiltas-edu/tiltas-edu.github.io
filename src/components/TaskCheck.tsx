import { useState } from 'react';
import Icon from './Icon';
import { isCorrect, hintFor, solvedKey, mistakeKey } from '../lib/answer';

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

export default function TaskCheck({ taskId, accepted, mistakes = [], labels, unit, choices }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [hint, setHint] = useState<string | null>(null);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const ok = isCorrect(accepted, value);
    setState(ok ? 'ok' : 'bad');
    try {
      // Solved tasks get a badge; a wrong answer puts the task on the "My mistakes" page until it is solved.
      if (ok) {
        localStorage.setItem(solvedKey(taskId), '1');
        localStorage.removeItem(mistakeKey(taskId));
      } else if (!localStorage.getItem(solvedKey(taskId))) {
        localStorage.setItem(mistakeKey(taskId), JSON.stringify({ value, at: Date.now() }));
      }
    } catch { /* private mode: nothing to remember */ }
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
        {state === 'ok' && <p className="callout callout--ok pop"><Icon name="check" /> <strong>{labels.correct}</strong></p>}
        {state === 'bad' && hint && (
          <p className="callout callout--hint"><Icon name="bulb" /> {hint} {labels.tryAgain}</p>
        )}
        {state === 'bad' && !hint && <p className="callout callout--bad"><Icon name="x" /> {labels.wrong}</p>}
      </div>
    </form>
  );
}
