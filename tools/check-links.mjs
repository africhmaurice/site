// npm run links : opens every live page as a visitor, collects every link (menus, footer, page content),
// then checks each: same-page anchors must exist, other links must answer (following redirects).
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUT } from './lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(resolve(ROOT, '../maurice-africh-design-system/.ds-sync/package.json'))('playwright');
const LIVE = 'https://www.mauriceafrich.com';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const links = new Map(); // url -> Set(pages)
const anchors = []; // {page, href, ok}
const idsByPage = {};
for (const page of Object.keys(LAYOUT)) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`${LIVE}/${page}`, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(4000);
  const found = await p.evaluate(() => ({ ids: [...document.querySelectorAll('[id]')].map((e) => e.id), hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')) }));
  idsByPage[page] = new Set(found.ids);
  for (const raw of found.hrefs) {
    if (!raw || raw.startsWith('javascript:') || raw.startsWith('mailto:') || raw.startsWith('tel:')) continue;
    if (raw.startsWith('#')) { if (raw.length > 1) anchors.push({ page, href: raw }); continue; }
    const u = new URL(raw, `${LIVE}/${page}`);
    const key = u.href;
    if (!links.has(key)) links.set(key, new Set()); links.get(key).add(page);
  }
  await p.close();
}
// same-page anchors
const badAnchors = anchors.filter((a) => !idsByPage[a.page].has(a.href.slice(1)));
// cross-page anchors on our own site
const results = [];
for (const [url, pages] of links) {
  const u = new URL(url);
  let status, note = '';
  if (u.hostname.endsWith('mauriceafrich.com') && u.hash) {
    const slug = u.pathname.replace(/^\//, '') || 'home';
    if (idsByPage[slug] && !idsByPage[slug].has(u.hash.slice(1))) note = `anchor ${u.hash} missing on /${slug}`;
  }
  try {
    const r = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140 Safari/537.36', accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
    status = r.status; if (r.url !== url && !note) note = `→ ${r.url.slice(0, 90)}`;
  } catch (e) { status = 'ERR ' + (e.cause?.code || e.name); }
  results.push({ status, url, pages: [...pages], note });
}
await browser.close();
const bad = results.filter((r) => !(typeof r.status === 'number' && r.status < 400) || r.note.startsWith('anchor'));
console.log(`${results.length} unique links on ${Object.keys(LAYOUT).length} pages, ${anchors.length} same-page anchors.`);
for (const r of bad) console.log(`✗ ${r.status}  ${r.url}  ${r.note}  (on: ${r.pages.join(', ')})`);
for (const a of badAnchors) console.log(`✗ missing anchor ${a.href} on /${a.page}`);
if (!bad.length && !badAnchors.length) console.log('✓ every link answered and every anchor exists');
console.log('\nALL:'); for (const r of results) console.log(`${String(r.status).padEnd(4)} ${r.url.slice(0, 110)} ${r.note}`);
