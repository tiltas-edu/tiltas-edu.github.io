import { useEffect, useRef, useState } from 'react';
import Flashcards from './Flashcards';
import Icon from './Icon';
import { GROUPS, inGroup, studyDeck, type Filter, type Group, type RankedWord } from '../lib/pos';

const PREVIEW = 3;

interface Props {
  words: RankedWord[];
  total: number;
  lang: 'ru' | 'en';
  labels: Record<Filter, string> & { inTasks: string; more: string; study: string; back: string };
  cardLabels: React.ComponentProps<typeof Flashcards>['labels'];
}

export default function WordRanking({ words, total, lang, labels, cardLabels }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [studying, setStudying] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // Changing the view removes the pressed button, so move focus and scroll to the new content.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    top.current?.focus();
    top.current?.scrollIntoView();
  }, [filter, studying]);

  const inTasks = (w: RankedWord) => labels.inTasks.replace('{count}', String(w.tasks)).replace('{total}', String(total));
  const deck = studyDeck(words, filter);
  const groups = GROUPS.filter((g) => inGroup(words, g).length > 0);

  const list = (group: Group, limit?: number) => (
    <ol className="words">
      {inGroup(words, group).slice(0, limit).map((w, i) => (
        <li className="word" key={`${w.pos}:${w.lemma}`}>
          <span className="word__rank">{i + 1}</span>
          <span>
            <strong lang="lt">{w.lemma}</strong>
            {w.forms.some((f) => f !== w.lemma) && <small lang="lt">{w.forms.join(', ')}</small>}
          </span>
          <span>{w[lang]}</span>
          <span className="word__freq">
            <span className="bar" aria-hidden="true">
              <span style={{ width: `${(100 * w.tasks) / total}%` }} />
            </span>
            {inTasks(w)}
          </span>
        </li>
      ))}
    </ol>
  );

  if (studying) {
    const terms = deck.map((w) => ({ lt: w.lemma, ru: w.ru, en: w.en, hint: inTasks(w), forms: w.forms.join(', ') }));
    return (
      <div className="ranking" ref={top} tabIndex={-1}>
        <button className="btn btn--soft" type="button" onClick={() => { moved.current = true; setStudying(false); }}>
          ← {labels.back}
        </button>
        <Flashcards terms={terms} lang={lang} labels={cardLabels} />
      </div>
    );
  }

  return (
    <div className="ranking" ref={top} tabIndex={-1}>
      <button className="btn" type="button" onClick={() => { moved.current = true; setStudying(true); }}>
        <Icon name="flip" /> {labels.study}: {deck.length}
      </button>
      <div className="tabs tabs--scroll">
        {(['all', ...groups] as Filter[]).map((f) => (
          <button key={f} className="tab" type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {labels[f]}
          </button>
        ))}
      </div>
      {filter !== 'all'
        ? list(filter)
        : groups.map((group) => (
            <section key={group}>
              <h2>{labels[group]}</h2>
              {list(group, PREVIEW)}
              {inGroup(words, group).length > PREVIEW && (
                <button className="btn btn--soft words__more" type="button" onClick={() => { moved.current = true; setFilter(group); }}>
                  {labels.more}<span className="sr-only">: {labels[group]}</span>
                </button>
              )}
            </section>
          ))}
    </div>
  );
}
