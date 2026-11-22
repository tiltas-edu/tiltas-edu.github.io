// Tiltas icon set: 24x24, 2px round stroke, drawn to be read at small sizes.
// Used by Icon.astro (static pages) and Icon.tsx (React islands).
export const icons = {
  math: '<path d="M4 20V4l16 16z"/><path d="M4 14h3M4 9h2"/>',
  physics: '<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  nature: '<path d="M5 19C5 10 10 5 20 5c0 10-5 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>',
  society: '<path d="M3 9l9-5 9 5z"/><path d="M6 12v5M10 12v5M14 12v5M18 12v5M3 20h18"/>',
  lithuanian: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>',
  tasks: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>',
  link: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  flip: '<path d="M4 9a8 8 0 0 1 14-3l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M4 20v-4h4"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  family: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M15 15c2.7-.3 5.5 1.3 6 5"/>',
  flag: '<path d="M5 21V4"/><path d="M5 5h11l-2 3.5 2 3.5H5"/>',
  party: '<path d="M4 20l5-14 9 9z"/><path d="M14 4l1 2M19 8l2-1M17 3v2"/>',
} as const;
export type IconName = keyof typeof icons;
