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
for (const [page, sel, x] of TARGETS) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`https://www.mauriceafrich.com/${page}?x=${Date.now()}`, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(4500);
  const pos = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const s = e.closest('section') || e; const r = s.getBoundingClientRect(); document.documentElement.style.scrollBehavior = 'auto'; const y = scrollY + r.top + 150; scrollTo(0, y); return { y, h: r.height }; }, sel);
  if (!pos) { console.log(`${page.padEnd(13)} ${sel.padEnd(46)} (section not found)`); await p.close(); continue; }
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
  await p.close();
}
await browser.close();
