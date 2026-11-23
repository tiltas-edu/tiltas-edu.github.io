// Checks every URL in src/content/resources/*.json. Run: node scripts/check-links.mjs
// A page behind a bot check (Cloudflare "cf-mitigated: challenge") is reported as SKIP, not a failure:
// it opens for people, and the check must not try to get past it.
import { readdirSync, readFileSync } from 'node:fs';
const dir = new URL('../src/content/resources/', import.meta.url);
let bad = 0;
for (const f of readdirSync(dir)) {
  const { items } = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
  for (const it of items) {
    try {
      const r = await fetch(it.url, { redirect: 'follow', headers: { 'user-agent': 'tiltas-link-check' }, signal: AbortSignal.timeout(20000) });
      if (r.headers.get('cf-mitigated') === 'challenge') {
        console.log(`SKIP ${r.status} ${it.url} (bot check, open it by hand)`);
        continue;
      }
      const ok = r.status < 400;
      if (!ok) bad++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${r.status} ${it.url}`);
    } catch (e) {
      bad++;
      console.log(`FAIL ERR ${it.url} (${e.cause?.code || e.message})`);
    }
  }
}
process.exit(bad ? 1 : 0);
