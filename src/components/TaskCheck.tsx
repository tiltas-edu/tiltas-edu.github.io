import { useState } from 'react';
import Icon from './Icon';

interface Props {
  accepted: string[];
  /** Typical wrong answers with a hint in the page language. */
  mistakes?: { value: string; hint: string }[];
  labels: { yourAnswer: string; check: string; correct: string; wrong: string; tryAgain: string };
  unit?: string;
}

// First number in the input, so a unit typed after it ("216 m2", "5 000 cm²") is ignored.
const norm = (s: string) => (s.match(/-?\d[\d\s ]*(?:[.,]\d+)?/)?.[0] ?? '').replace(/[\s ]/g, '').replace(',', '.');
const same = (a: string, b: string) => norm(b) !== '' && Number(norm(a)) === Number(norm(b));

export default function TaskCheck({ accepted, mistakes = [], labels, unit }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [hint, setHint] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = accepted.some((a) => same(a, value));
    setState(ok ? 'ok' : 'bad');
    setHint(ok ? null : (mistakes.find((m) => same(m.value, value))?.hint ?? null));
  };

  return (
    <form onSubmit={submit}>
      <div className="row">
        <label>
          <span className="sr-only">{labels.yourAnswer}</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder={labels.yourAnswer}
            value={value}
            onChange={(e) => { setValue(e.target.value); setState('idle'); }}
          />
        </label>
        {unit && <strong>{unit}</strong>}
        <button className="btn" type="submit"><Icon name="check" /> {labels.check}</button>
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
