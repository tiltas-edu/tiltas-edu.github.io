import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Defaults match an organisation page (https://tiltas-edu.github.io).
// For a project page set SITE and BASE, e.g.
//   SITE=https://born-to-be-mad.github.io BASE=/tiltas npm run build
// (the GitHub Actions workflow does this automatically).
export default defineConfig({
  site: process.env.SITE || 'https://tiltas-edu.github.io',
  base: process.env.BASE || '/',
  integrations: [react()],
  trailingSlash: 'always',
});
