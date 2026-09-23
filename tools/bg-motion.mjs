// node tools/bg-motion.mjs : measures how far each page's background actually moves on screen when the page scrolls 120px.
// 0px = fixed (locked in place, like the Hunt page); 120px = scrolls with the page; anything between = a sliding parallax.
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(resolve(ROOT, '../maurice-africh-design-system/.ds-sync/package.json'))('playwright');
// page, selector of the section to test, x of a background-only strip (clear of text)
const TARGETS = (process.argv[2] ? JSON.parse(process.argv[2]) : [
  ['the-hunt', '#points', 20], ['the-hunt', '#act-1', 20], ['contests', '#contests .ct-art', 20], ['games', '#daily-word', 20],
  ['loot', '#loot-boxes', 20], ['lootbox-clue', '#loot-clue', 20], ['home', '.ma-fixed-bg', 20], ['points', '.ma-fixed-bg', 20],
  ['solve', '.ma-fixed-bg', 20], ['newsletter', '[data-controller="BackgroundImageFXParallax"]', 20], ['leaderboard', '#th-leaderboard', 20],
]);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
// LOCAL=1: serve this folder (and the bot's page + leaderboard files) in place of GitHub Pages, to test before publishing.
import { readFileSync as rf, existsSync as ex } from 'node:fs';
import { join as pj, extname as pe } from 'node:path';
const BOT = resolve(ROOT, '../treasure-hunt-leaderboard');
const TY = { '.js': 'text/javascript', '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.css': 'text/css' };
async function localRoutes(ctx) {
  if (process.env.LOCAL !== '1') return;
  await ctx.route('https://africhmaurice.github.io/site/**', (r) => { const u = new URL(r.request().url()); let f = pj(ROOT, u.pathname.replace('/site/', '')); if (u.pathname.endsWith('pages/the-hunt.html')) f = pj(BOT, 'squarespace-hunt.html'); if (!ex(f)) return r.fulfill({ status: 404 }); r.fulfill({ status: 200, headers: { 'content-type': TY[pe(f)] || 'application/octet-stream', 'access-control-allow-origin': '*' }, body: rf(f) }); });
  await ctx.route('https://africhmaurice.github.io/leaderboard/**', (r) => { const u = new URL(r.request().url()); const f = pj(BOT, 'public', u.pathname.replace('/leaderboard/', '') || 'index.html'); if (!ex(f)) return r.continue(); r.fulfill({ status: 200, headers: { 'content-type': TY[pe(f)] || 'application/octet-stream' }, body: rf(f) }); });
}
for (const [page, sel, x] of TARGETS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); await localRoutes(ctx);
  const p = await ctx.newPage();
  await p.goto(`https://www.mauriceafrich.com/${page}?x=${Date.now()}`, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(4500);
  const pos = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const s = e.closest('section') || e; const r = s.getBoundingClientRect(); document.documentElement.style.scrollBehavior = 'auto'; const y = scrollY + r.top + 150; scrollTo(0, y); return { y, h: r.height }; }, sel);
  if (!pos) { console.log(`${page.padEnd(13)} ${sel.padEnd(46)} (section not found)`); await ctx.close(); continue; }
  await p.waitForTimeout(700);
  const clip = { x, y: 200, width: 40, height: 400 };
  const a = await p.screenshot({ clip });
  await p.evaluate(() => scrollBy(0, 120)); await p.waitForTimeout(700);
  const b = await p.screenshot({ clip: { ...clip, y: 80, height: 520 } }); // taller, so a 0..120px shift can be found
  const shift = await p.evaluate(async ([A, B]) => {
    const load = (d) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = d; });
    const [ia, ib] = await Promise.all([load(A), load(B)]);
    const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { d: x.getImageData(0, 0, img.width, img.height).data, w: img.width, h: img.height }; };
    const pa = px(ia), pb = px(ib); const scale = pa.w / 40;
    let best = null;
    for (let s = 0; s <= 120; s += 2) { // strip A (screen y 200..600) vs strip B rows starting at screen y 80+(120-s)
      const off = Math.round((120 - s) * scale); let diff = 0, n = 0;
      for (let y = 0; y < pa.h; y += 3) for (let xx = 0; xx < pa.w; xx += 3) { const i = (y * pa.w + xx) * 4, j = ((y + off) * pb.w + xx) * 4; diff += Math.abs(pa.d[i] - pb.d[j]) + Math.abs(pa.d[i + 1] - pb.d[j + 1]) + Math.abs(pa.d[i + 2] - pb.d[j + 2]); n++; }
      const m = diff / n; if (!best || m < best.m) best = { s, m };
    }
    return best;
  }, ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')]);
  const verdict = shift.s <= 4 ? 'FIXED (locked in place)' : shift.s >= 116 ? 'scrolls with page' : 'SLIDING parallax';
  console.log(`${page.padEnd(13)} ${sel.padEnd(46)} background moved ${String(shift.s).padStart(3)}px of 120  → ${verdict}  (match ${shift.m.toFixed(1)})`);
  await ctx.close();
}
await browser.close();
