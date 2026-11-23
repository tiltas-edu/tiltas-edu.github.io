# Tiltas

**Школьная программа без языкового барьера · School curriculum without the language barrier**

*Tiltas* (лит. «мост») помогает русско- и англоговорящим школьникам в Литве понимать задания:
исходный текст на литовском → перевод → решение по шагам → словарь терминов и карточки.
Сайт: https://tiltas-edu.github.io (или `https://<owner>.github.io/<repo>/`, если репозиторий не `<owner>.github.io`: адрес и base-путь подставляет workflow)

## Стек

- [Astro](https://astro.build) (статический сайт) + React-«острова» для интерактива (карточки, проверка ответа)
- Контент в `src/content/` (JSON), схема проверяется при сборке
- Деплой в GitHub Pages через GitHub Actions (`.github/workflows/deploy.yml`)

## Запуск

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # статика в dist/
```

## Как добавить контент

**Словарь** — файл `src/content/glossary/<тема>.json`:

```json
{
  "subject": "math",
  "title": { "ru": "Название темы", "en": "Topic title" },
  "terms": [
    { "lt": "plotas", "ru": "площадь", "en": "area",
      "note": { "ru": "Подсказка", "en": "Hint" } }
  ]
}
```

**Задание** — файл `src/content/tasks/<id>.json` (см. примеры рядом): текст на литовском,
перевод ru/en, шаги решения, ответ и список допустимых числовых ответов (`check`).
`topic` — id файла словаря, из которого подтягиваются слова задания.

### Важно про авторские права

Не копируйте тексты заданий с платформ (Eduka и др.) и учебников дословно.
Пишите **собственные задания** в том же формате и с той же лексикой — учим язык формулировок, а не публикуем чужой контент.

## Языки интерфейса

`ru`, `en` — файл `src/i18n/ui.ts`. Чтобы добавить язык, добавьте его в `ui.ts`, в схемы `src/content.config.ts`
(`tri`) и переведите поля в JSON-файлах.

## Релизы

Версия — в `package.json` и в подвале сайта. Выпустить: GitHub → **Actions → Release → Run workflow**, выбрать
`patch` (исправления), `minor` (новые задания, функции) или `major` (большие изменения). Workflow поднимет версию,
поставит тег `vX.Y.Z`, создаст [релиз](https://github.com/tiltas-edu/tiltas-edu.github.io/releases) с заметками
из смерженных PR и задеплоит сайт.

## Лицензия

Код — [MIT](LICENSE). Контент (`src/content/`: задания, словари, описания ссылок; `src/data/`: рейтинг слов) — [CC BY 4.0](LICENSE-CONTENT.md).
