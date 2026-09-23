// npm run preview [-- slug,slug] : for each live page, screenshots the real Squarespace page ("before") and the same page
// with its code blocks replaced by the loader snippet pointed at this folder ("after"), then diffs them.
// Needs playwright (from ../maurice-africh-design-system/.ds-sync) and Chrome.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(resolve(ROOT, '../maurice-africh-design-system/.ds-sync/package.json'));
const { chromium } = req('playwright');
const OUT = join(ROOT, '.preview'); mkdirSync(OUT, { recursive: true });

// Live page -> the site.json slugs its code blocks load, in DOM order.
const LAYOUT = {
  home: ['home-slider', 'home-widget-1', 'home-widget-2'], 'the-hunt': ['the-hunt'], points: ['hunt-menu'], solve: ['hunt-menu'],
  leaderboard: ['leaderboard', 'hunt-menu'], contests: ['contests'], 'lootbox-clue': ['lootbox-clue'], games: ['games'],
  loot: ['loot'], rules: ['rules'], 'privacy-policy': ['privacy-policy'],
};
const only = (process.argv[2] || '').split(',').filter(Boolean);

const types = { '.js': 'text/javascript', '.html': 'text/html; charset=utf-8', '.json': 'application/json' };
const server = createServer((q, r) => {
  const f = join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !existsSync(f)) { r.writeHead(404).end(); return; }
  r.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' }).end(readFileSync(f));
}).listen(0, '127.0.0.1');
await new Promise((ok) => server.once('listening', ok));
const LOCAL = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8')).publicBase; // served from disk via route below

// Replace each code block's .sqs-block-content body in the raw HTML, skipping <script>/<style> bodies while matching divs.
function swapBlocks(html, slugs) {
  let i = 0, out = '', n = 0;
  const marker = 'data-definition-name="website.components.code"';
  while (true) {
    const at = html.indexOf(marker, i); if (at < 0) break;
    const contentAt = html.indexOf('class="sqs-block-content"', at); const open = html.indexOf('>', contentAt) + 1;
    let depth = 1, j = open;
    while (depth > 0 && j < html.length) {
      const m = /<(\/?)(div|script|style)\b/gi; m.lastIndex = j; const hit = m.exec(html); if (!hit) break;
      const tag = hit[2].toLowerCase();
      if (!hit[1] && (tag === 'script' || tag === 'style')) { j = html.toLowerCase().indexOf(`</${tag}>`, hit.index) + tag.length + 3; continue; }
      depth += hit[1] ? -1 : 1; j = hit.index + hit[0].length;
    }
    const close = html.lastIndexOf('</div', j);
    const slug = slugs[n++] || 'missing';
    out += html.slice(i, open) + `<div data-ma-page="${slug}"></div><script src="${LOCAL}loader.js"></script>`;
    i = close;
  }
  return { html: out + html.slice(i), swapped: n };
}

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];
for (const [page, slugs] of Object.entries(LAYOUT)) {
  if (only.length && !only.includes(page)) continue;
  for (const [vw, vh, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
    const shots = {};
    for (const mode of ['before', 'after']) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' });
      const p = await ctx.newPage();
      const errors = []; p.on('pageerror', (e) => errors.push(e.message));
      let swapped = 0;
      if (mode === 'after') await p.route(`https://www.mauriceafrich.com/${page}`, async (route) => {
        const res = await route.fetch(); const s = swapBlocks(await res.text(), slugs); swapped = s.swapped;
        await route.fulfill({ response: res, body: s.html, headers: { ...res.headers(), 'content-security-policy': '' } });
      });
      await p.route(LOCAL + '**', async (route) => { const u = new URL(route.request().url()); const f = join(ROOT, u.pathname.replace('/site/', '')); if (!existsSync(f)) return route.fulfill({ status: 404 }); await route.fulfill({ status: 200, headers: { 'content-type': types[extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' }, body: readFileSync(f) }); });
      await p.goto(`https://www.mauriceafrich.com/${page}`, { waitUntil: 'load', timeout: 60000 });
      await p.waitForTimeout(4000);
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
      await p.waitForTimeout(1500);
      const state = await p.evaluate(() => [...document.querySelectorAll('[data-ma-page]')].map((e) => `${e.dataset.maPage}:${e.dataset.maState}`));
      const height = await p.evaluate(() => document.documentElement.scrollHeight);
      const file = join(OUT, `${page}.${tag}.${mode}.png`);
      await p.screenshot({ path: file, fullPage: true });
      shots[mode] = { file, height, errors, state, swapped };
      await ctx.close();
    }
    // pixel diff in the browser
    const ctx = await browser.newContext(); const p = await ctx.newPage();
    const diff = await p.evaluate(async ([a, b]) => {
      const load = (d) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = d; });
      const [A, B] = await Promise.all([load(a), load(b)]);
      const w = Math.min(A.width, B.width), h = Math.min(A.height, B.height);
      const c = (img) => { const k = document.createElement('canvas'); k.width = w; k.height = h; const x = k.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
      const da = c(A), db = c(B); let bad = 0;
      for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 60) bad++;
      return { pct: +(100 * bad / (w * h)).toFixed(2), hA: A.height, hB: B.height };
    }, ['before', 'after'].map((m) => 'data:image/png;base64,' + readFileSync(shots[m].file).toString('base64')));
    await ctx.close();
    const r = { page, tag, diffPct: diff.pct, heights: `${diff.hA}/${diff.hB}`, swapped: shots.after.swapped, state: shots.after.state.join(' '),
      newErrors: shots.after.errors.filter((e) => !shots.before.errors.includes(e)) };
    results.push(r);
    console.log(`${page.padEnd(15)} ${tag.padEnd(7)} diff ${String(diff.pct).padStart(6)}%  height ${r.heights.padEnd(11)} blocks ${r.swapped} [${r.state}]${r.newErrors.length ? '  NEW ERRORS: ' + r.newErrors.join(' | ') : ''}`);
  }
}
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 2));
await browser.close(); server.close();
