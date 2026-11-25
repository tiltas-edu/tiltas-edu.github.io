import { useState } from 'react';
import Icon from './Icon';
import Marked from './Marked';
import { entryWords } from '../lib/confusable';

interface Term { lt: string; ru: string; en: string; like?: string[]; note?: { ru: string; en: string }; hint?: string; forms?: string }
interface Props {
  terms: Term[];
  lang: 'ru' | 'en';
  labels: { flip: string; know: string; again: string; done: string; restart: string; card: string };
}

export default function Flashcards({ terms, lang, labels }: Props) {
  const other = lang === 'ru' ? 'en' : 'ru';
  const [queue, setQueue] = useState(() => terms.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [tick, setTick] = useState(0); // re-triggers the pop animation

  const restart = () => {
    setQueue(terms.map((_, i) => i));
    setKnown(0);
    setFlipped(false);
  };

  if (queue.length === 0) {
    return (
      <div className="flash pop" style={{ cursor: 'default' }}>
        <div>
          <div><Icon name="party" /> {labels.done}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={restart}>{labels.restart}</button>
          </div>
        </div>
      </div>
    );
  }

  const term = terms[queue[0]];
  const next = (isKnown: boolean) => {
    setFlipped(false);
    setTick((n) => n + 1);
    setQueue((q) => (isKnown ? q.slice(1) : [...q.slice(1), q[0]]));
    if (isKnown) setKnown((k) => k + 1);
  };

  return (
    <div>
      <div className="note" aria-live="polite">
        {labels.card} {known + 1} / {terms.length}
      </div>
      <div
        key={tick}
        className="flash pop"
        role="button"
        tabIndex={0}
        aria-label={labels.flip}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), setFlipped((f) => !f))}
      >
        {flipped ? (
          <div>
            <strong>{term[lang]}</strong>
            <small>{term[other]}</small>
            {term.forms && <small lang="lt">{term.lt}: {term.forms}</small>}
            {term.note && <small><Icon name="bulb" /> <Marked text={term.note[lang]} like={term.like && [...term.like, ...entryWords(term.lt)]} /></small>}
          </div>
        ) : (
          <div>
            <span lang="lt"><Marked text={term.lt} like={term.like} /></span>
            {term.hint && <small>{term.hint}</small>}
          </div>
        )}
      </div>
      <div className="row">
        <button className="btn btn--soft" onClick={() => setFlipped((f) => !f)}><Icon name="flip" /> {labels.flip}</button>
        <button className="btn btn--soft" onClick={() => next(false)}>{labels.again}</button>
        <button className="btn" onClick={() => next(true)}><Icon name="check" /> {labels.know}</button>
      </div>
    </div>
  );
}
