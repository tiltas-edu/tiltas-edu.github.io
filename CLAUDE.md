# Tiltas: project rules for Claude Code

Open-source site (Astro 7 + React islands, GitHub Pages) that helps RU/EN-speaking schoolchildren (grades 1–8, Lithuania first) with the school curriculum, vocabulary and understanding Eduka-style tasks.

## Commands
- `npm install`, `npx astro dev` (preview), `npm run check`, `npm test` and `npm run build` (all must pass before finishing; CI runs them on every PR). `npm test` also checks every task: its answer passes, its listed mistakes do not, and choice tasks offer them all.
- Subpath build check: `SITE=https://<owner>.github.io BASE=/<repo> npx astro build`.
- `node scripts/check-links.mjs`: checks links in `src/content/resources/`. SKIP means a bot check (Cloudflare) blocked it: open that link by hand.

## Content rules
- Tasks are ORIGINAL, written for Tiltas in the same wording patterns as Eduka. Never paste Eduka text verbatim (copyright).
- Task JSON: lt text, ru/en translation, step-by-step solution, answer, check values, keywords, group (section on the subject page), level 1–3 and `mistakes` (typical wrong answers, each with a calm ru/en hint). Optional `choices` (Lithuanian options) turns the task into a pick-one; `check` and `mistakes` then hold option texts. Maths tasks also need `scheme` (shape / bar / tree / road, see `src/lib/scheme.ts`; `find: true` marks what is asked, shown as "?" in the hint) and `see` (visual pages that show the idea). Hints open one at a time: scheme, first step, solution; a wrong answer opens the scheme. Glossary terms: lt/ru/en + optional note and `like` (look-alike words such as plotas / plotis; the differing letters get marked, and `npm test` fails if two look-alike words in one glossary are not linked).
- Subjects with tasks and their groups live in `src/lib/subjects.ts`; each group needs a `group_<id>` title in `src/i18n/ui.ts`.
- Every user-facing string exists in ru and en (`src/i18n/ui.ts`, content `{ru,en}` fields); the visual maths pages use `src/i18n/visual.ts`).
- Visual maths (`/<lang>/math/column|formulas|times-table|units|fractions/`): column layouts come from `src/lib/column.ts`, the units ladder from `src/lib/units.ts`, fraction names and parts from `src/lib/fraction.ts` (all pure and tested); keep the Lithuanian term names (dėmuo, dalmuo, …) next to every part. Every explanation there is Lithuanian first with the ru/en translation under it (`Bi`, `lt` in `column.ts` texts, `visualLt`); the "Hide translation" button (`NativeToggle`) hides `.native` site-wide.
- Add a `checked: YYYY-MM-DD` to a resource only after a human opened the link.
- Math example logic: rectangle b = P:2 − a, S = a·b; square side = P:4; 4 notebook cells = 1 cm².

## Design rules (see DESIGN.md)
- Use tokens from `src/styles/tokens.css`; no hard-coded colours or sizes in components.
- Friendly "soft game" style, no mascot, logo and icons only (`components/icons.ts`, no emoji in UI).
- Two bands via `data-band` (junior 1–4, senior 5–8); components must not branch on band.
- Keep WCAG AA contrast (see `/ru/design/`), visible focus, tap targets ≥ 44px, respect reduced motion.
- Wrong answers: calm hint, never shaming.

## Deploy
- Releases: run the `Release` workflow (patch/minor/major). Do not edit the version in `package.json` by hand.
- GitHub Actions `deploy.yml` computes SITE/BASE: `/` for `<owner>.github.io` repos, otherwise `/<repo>`.
- Always use the `base` helper from `src/i18n/ui.ts` for internal links.

## Open items
- Confirm "Tako" = TAMO; verify external links by hand.
