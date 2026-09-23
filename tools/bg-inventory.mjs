// node tools/bg-inventory.mjs : lists every background image on the site, fingerprints each one, and groups
// look-alikes, so duplicates and unused library images are easy to see. Writes .preview/bg-inventory.json.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BOT = resolve(ROOT, '../treasure-hunt-leaderboard');
const LIB = resolve(ROOT, '../maurice-africh-design-system/assets/backgrounds');
const { chromium } = createRequire(resolve(ROOT, '../maurice-africh-design-system/.ds-sync/package.json'))('playwright');

const sources = { 'the-hunt': join(BOT, 'squarespace-hunt.html'), contests: 'pages/contests.html', games: join(BOT, 'squarespace-wordle.html'), loot: join(BOT, 'squarespace-lootbox.html'), 'lootbox-clue': 'pages/lootbox-clue.html', rules: 'pages/rules.html', 'hunt-menu': 'pages/hunt-menu.html', 'home-slider': 'pages/home-slider.html' };
const used = [];
for (const [page, f] of Object.entries(sources)) {
  const html = readFileSync(resolve(ROOT, f), 'utf8');
  const re = /url\((['"]?)(data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^'")\s]+\.(?:jpe?g|png|webp)[^'")\s]*)\1\)/g;
  let m;
  while ((m = re.exec(html))) {
    const before = html.slice(Math.max(0, m.index - 600), m.index);
    const id = (before.match(/(?:id="|#)([a-z0-9-]+)[^]*$/i) || [])[1] || '?';
    const label = (before.match(/data-screen-label="([^"]+)"[^]*$/) || [])[1];
    const kb = Math.round(m[2].length * 0.75 / 1024);
    if (kb < 30 && m[2].startsWith('data:')) continue; // icons, not backgrounds
    used.push({ page, where: label || id, src: m[2], kb, offset: m.index });
  }
}
used.push({ page: 'leaderboard (frame)', where: 'page background', src: 'file:///' + join(BOT, 'public/leaderboard-bg.jpg').replace(/\\/g, '/') });
// Squarespace-native backgrounds (pages built in the Squarespace editor)
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--disable-web-security'] });
const page = await browser.newPage();
for (const pg of ['home', 'points', 'solve', 'newsletter', 'privacy-policy', 'leaderboard', 'rules']) {
  await page.goto(`https://www.mauriceafrich.com/${pg}`, { waitUntil: 'load' }); await page.waitForTimeout(2500);
  const found = await page.evaluate(() => [...document.querySelectorAll('.section-background img, .section-background')].map((e) => e.tagName === 'IMG' ? (e.getAttribute('data-src') || e.src) : (getComputedStyle(e).backgroundImage.match(/url\("([^"]+)"/) || [])[1]).filter((s) => s && /squarespace-cdn/.test(s)));
  for (const s of new Set(found.map((s) => s.split('?')[0]))) used.push({ page: pg + ' (Squarespace section)', where: 'section background', src: s + '?format=750w' });
}
const lib = readdirSync(LIB).filter((f) => f.endsWith('.webp')).map((f) => ({ name: f, src: 'file:///' + join(LIB, f).replace(/\\/g, '/') }));
await page.goto('file:///' + join(LIB, lib[0].name).replace(/\\/g, '/'));
const hash = (src) => page.evaluate(async (src) => {
  const i = new Image(); i.crossOrigin = 'anonymous'; i.src = src; await i.decode();
  const c = document.createElement('canvas'); c.width = 17; c.height = 16; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 17, 16);
  const d = x.getImageData(0, 0, 17, 16).data; let bits = '';
  for (let y = 0; y < 16; y++) for (let xx = 0; xx < 16; xx++) { const a = (y * 17 + xx) * 4, b = a + 4; bits += (d[a] + d[a + 1] + d[a + 2]) > (d[b] + d[b + 1] + d[b + 2]) ? '1' : '0'; }
  return { bits, w: i.naturalWidth, h: i.naturalHeight };
}, src).catch((e) => ({ bits: null, err: String(e).slice(0, 80) }));
for (const u of used) Object.assign(u, await hash(u.src));
for (const l of lib) Object.assign(l, await hash(l.src));
await browser.close();
const dist = (a, b) => { if (!a || !b) return 999; let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };
for (const u of used) { const best = lib.map((l) => ({ l: l.name, d: dist(u.bits, l.bits) })).sort((a, b) => a.d - b.d)[0]; u.library = best.d <= 40 ? best.l : null; u.libDist = best.d; }
// group look-alikes among used
const groups = []; for (const u of used) { const g = groups.find((g) => dist(g[0].bits, u.bits) <= 40); if (g) g.push(u); else groups.push([u]); }
const usedLib = new Set(used.map((u) => u.library).filter(Boolean));
console.log('BACKGROUNDS IN USE:');
groups.forEach((g, i) => { console.log(`#${i + 1}${g.length > 1 ? '  DUPLICATE ×' + g.length : ''}  ${g[0].library ? 'library: ' + g[0].library : '(not in library)'}  ${g[0].w}x${g[0].h}`); for (const u of g) console.log(`     ${u.page} → ${u.where}${u.err ? '  ' + u.err : ''}`); });
console.log('\nLIBRARY IMAGES NOT USED ANYWHERE:'); for (const l of lib) if (!usedLib.has(l.name)) console.log('   ' + l.name);
const cell=(src,t)=>`<div style="width:230px;font:11px sans-serif;color:#fff"><div style="height:130px;background:#333 url('${src}') center/cover"></div>${t}</div>`;
writeFileSync(join(ROOT,'.preview/bg-sheet.html'),'<body style="margin:0;background:#556;padding:8px"><h3 style="color:#fff;font:bold 14px sans-serif">IN USE</h3><div style="display:flex;flex-wrap:wrap;gap:8px">'+groups.map((g,i)=>cell(g[0].src,'#'+(i+1)+' '+g.map(u=>u.page.replace(' (Squarespace section)',' (sqs)')+': '+u.where).join(' / '))).join('')+'</div><h3 style="color:#fff;font:bold 14px sans-serif">LIBRARY</h3><div style="display:flex;flex-wrap:wrap;gap:8px">'+lib.map(l=>cell(l.src,l.name)).join('')+'</div></body>');
writeFileSync(join(ROOT, '.preview/bg-inventory.json'), JSON.stringify({ used: used.map(({ src, ...r }) => ({ ...r, src: src.startsWith('data:') ? 'data:(inline)' : src })), groups: groups.map((g) => g.map((u) => `${u.page} → ${u.where}`)), unused: lib.filter((l) => !usedLib.has(l.name)).map((l) => l.name) }, null, 1));
