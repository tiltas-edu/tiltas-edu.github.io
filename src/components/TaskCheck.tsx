import { useState } from 'react';
import Icon from './Icon';

interface Props {
  accepted: string[];
  labels: { yourAnswer: string; check: string; correct: string; wrong: string };
  unit?: string;
}

const norm = (s: string) => s.replace(/\s| /g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');

export default function TaskCheck({ accepted, labels, unit }: Props) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = accepted.some((a) => Number(norm(a)) === Number(norm(value)) && norm(value) !== '');
    setState(ok ? 'ok' : 'bad');
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
        {state === 'bad' && <p className="callout callout--bad"><Icon name="x" /> {labels.wrong}</p>}
      </div>
    </form>
  );
}
