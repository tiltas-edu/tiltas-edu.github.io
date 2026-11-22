# Tiltas design system

Audience: schoolchildren in grades 1–8 (and their parents). Tone: friendly, like a soft game. No mascot: logo and icons only.

## Principles
- **Two bands.** `data-band="junior"` (grades 1–4): larger type, bigger tap targets (56px), rounder, chunkier. `senior` (5–8): denser and calmer (44px). Chosen by the 1–4 / 5–8 switch, remembered in `localStorage` (`tiltas-band`). Everything is driven by CSS tokens, so components never branch on band.
- **Accessible by default.** All text/background pairs are WCAG AA (≥ 4.5:1); the `/design/` page recomputes ratios at build time. Colour is never the only signal (icon + text). Visible focus ring. Respects `prefers-reduced-motion`. Dark mode follows the device.
- **Private.** Nunito Variable is self-hosted (`@fontsource-variable/nunito`): no requests to third parties, which matters for children. Supports Lithuanian diacritics and Cyrillic.
- **Most needed first.** The home page leads to `/words/`: words ranked by the number of real tasks they occur in, grouped by part of speech so that function words do not hide verbs. Show "in 15 of 20", not percentages.
- **Encouraging.** Praise correct answers; wrong answers get a calm hint, never shame.

## Tokens
`src/styles/tokens.css`: colours (`--c-*`), spacing (`--s-*`), type scale (`--fs-*`), radii, tap size, motion. Subject colours: maths blue, physics violet, science green, social studies raspberry, Lithuanian orange. Subjects that are not ready stay on the home page as dashed tiles with a "soon" badge, never dimmed (dimming breaks AA).
Language chips: LT / RU / EN.

## Files
- `tokens.css`, `base.css`, `components.css`: styles. `components/icons.ts`: inline SVG icon paths (`Icon.astro` / `Icon.tsx`). `Logo.astro`: bridge mark.
- Live reference: `/ru/design/` and `/en/design/` (noindex).

## Adding content
- Tasks: `src/content/tasks/*.json` (original wording; do not copy Eduka text verbatim).
- Glossary: `src/content/glossary/*.json`.
- Links: `src/content/resources/*.json`. Set `checked: "YYYY-MM-DD"` after opening the link yourself. `node scripts/check-links.mjs` and the weekly workflow `links.yml` test availability.
