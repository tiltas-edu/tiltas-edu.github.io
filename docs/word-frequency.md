# Word frequency from real tasks

Goal: find the verbs, nouns, adjectives, prepositions and other words a child needs most,
ranked by how often they occur in real textbook tasks. The ranking decides what goes into
the glossary and flashcards first.

**Real task text never enters git.** It lives in `corpus/`, which is ignored. The repository
is public and textbooks are copyrighted. Back up `corpus/` privately.

## Adding a task

1. Transcribe the task exactly into `corpus/tasks/<id>.json`. Do not include pupil names,
   answers written by the child, or school details.
2. List every word of the text in order, with its dictionary form (lemma):

   ```json
   {
     "source": "textbook, page, task number",
     "subject": "math",
     "grade": 4,
     "text": "Apskaičiuok plotą.",
     "words": [
       { "form": "Apskaičiuok", "lemma": "apskaičiuoti", "pos": "verb", "ru": "вычислить", "en": "calculate" },
       { "form": "plotą", "lemma": "plotas", "pos": "noun", "ru": "площадь", "en": "area" }
     ]
   }
   ```

3. Run `npm run words`. It writes two files:
   - `corpus/frequency.md`: private report.
   - `src/data/word-frequency.json`: **public**, shown on `/<lang>/words/`. It holds only lemma,
     part of speech, translation, forms and the number of tasks, overall and per `subject`
     (the words page filters by it).
4. Read the diff of the public file before committing it. Anything that identifies a child must be
   marked `name` in the task, which keeps it out of the ranking.

The public file is rebuilt from the local `corpus/` alone: run it only where the whole corpus is.

## Rules

- `pos`: verb, noun, adj, adv, prep, pron, num, conj, part, intj. `name` and `unit` are not ranked.
- Lemma: infinitive for verbs and participles, nominative singular for nouns,
  masculine nominative singular for adjectives. Keep reflexive verbs separate (`mokytis`).
- Reuse the lemma and translation already in `corpus/frequency.md`.
- Digits are not words and are not listed.
- Rank = number of tasks containing the word, then total occurrences. An identical task counts once.
- Only real tasks go into the corpus. The site's own tasks would skew the ranking.
