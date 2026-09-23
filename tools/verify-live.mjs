// npm run verify -- page[,page]  : after a Squarespace swap, loads the LIVE page as a logged-out visitor and
// compares it with the pre-switch screenshot in .preview/<page>.<size>.before.png (made by npm run preview).
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { LAYOUT } from './lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(resolve(ROOT, '../maurice-africh-design-system/.ds-sync/package.json'))('playwright');
const pages = (process.argv[2] || '').split(',').filter(Boolean);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
let bad = 0;
for (const page of pages) for (const [vw, vh, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`https://www.mauriceafrich.com/${page}?nocache=${Date.now()}`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(1500);
  const state = await p.evaluate(() => [...document.querySelectorAll('[data-ma-page]')].map((e) => `${e.dataset.maPage}:${e.dataset.maState}`));
  const shot = await p.screenshot({ fullPage: true });
  await ctx.close();
  const before = join(ROOT, '.preview', `${page}.${tag}.before.png`);
  let diff = 'n/a';
  if (existsSync(before)) {
    const c = await browser.newContext(); const q = await c.newPage();
    diff = await q.evaluate(async ([a, b]) => {
      const load = (d) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = d; });
      const [A, B] = await Promise.all([load(a), load(b)]); const w = Math.min(A.width, B.width), h = Math.min(A.height, B.height);
      const px = (img) => { const k = document.createElement('canvas'); k.width = w; k.height = h; const x = k.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
      const da = px(A), db = px(B); let n = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 60) n++;
      return `${(100 * n / (w * h)).toFixed(2)}% (heights ${A.height}/${B.height})`;
    }, ['data:image/png;base64,' + readFileSync(before).toString('base64'), 'data:image/png;base64,' + shot.toString('base64')]);
    await c.close();
  }
  const ok = state.length === (LAYOUT[page] || []).length && state.every((s) => s.endsWith(':ready'));
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${page.padEnd(15)} ${tag.padEnd(7)} blocks [${state.join(' ')}]  diff vs before ${diff}${errors.length ? '  errors: ' + errors.slice(0, 2).join(' | ') : ''}`);
}
await browser.close();
process.exit(bad ? 1 : 0);
