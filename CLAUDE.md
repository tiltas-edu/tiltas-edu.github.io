# Tiltas: project rules for Claude Code

Open-source site (Astro 7 + React islands, GitHub Pages) that helps RU/EN-speaking schoolchildren (grades 1–8, Lithuania first) with the school curriculum, vocabulary and understanding Eduka-style tasks.

## Commands
- `npm install`, `npx astro dev` (preview), `npx astro build` (must pass before finishing).
- Subpath build check: `SITE=https://<owner>.github.io BASE=/<repo> npx astro build`.
- `node scripts/check-links.mjs`: checks links in `src/content/resources/`.

## Content rules
- Tasks are ORIGINAL, written for Tiltas in the same wording patterns as Eduka. Never paste Eduka text verbatim (copyright).
- Task JSON: lt text, ru/en translation, step-by-step solution, answer, check values, keywords, group (section on the subject page), level 1–3 and `mistakes` (typical wrong numbers, each with a calm ru/en hint). Glossary terms: lt/ru/en + optional note.
- Every user-facing string exists in ru and en (`src/i18n/ui.ts`, content `{ru,en}` fields).
- Add a `checked: YYYY-MM-DD` to a resource only after a human opened the link.
- Math example logic: rectangle b = P:2 − a, S = a·b; square side = P:4; 4 notebook cells = 1 cm².

## Design rules (see DESIGN.md)
- Use tokens from `src/styles/tokens.css`; no hard-coded colours or sizes in components.
- Friendly "soft game" style, no mascot, logo and icons only (`components/icons.ts`, no emoji in UI).
- Two bands via `data-band` (junior 1–4, senior 5–8); components must not branch on band.
- Keep WCAG AA contrast (see `/ru/design/`), visible focus, tap targets ≥ 44px, respect reduced motion.
- Wrong answers: calm hint, never shaming.

## Deploy
- GitHub Actions `deploy.yml` computes SITE/BASE: `/` for `<owner>.github.io` repos, otherwise `/<repo>`.
- Always use the `base` helper from `src/i18n/ui.ts` for internal links.

## Open items
- Confirm "Tako" = TAMO; verify external links by hand.
- Decide repo home: org `tiltas-edu` (preferred) or `born-to-be-mad`.
