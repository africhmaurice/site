// node tools/hunt-graphic.mjs [format,format] [--video]
// Builds the Treasure Hunt overview graphic in every size from one design: five art panels split by brush slashes,
// the first four showing a real page from the hunt over its background art at 90%.
// Stills go to Documents/Hunt Media/Hunt Graphic/, and the 16:9 one is also copied to assets/press/ for the Press Room.
// Update NUMBERS (and AS_OF) before rendering. Page captures live in Hunt Media/Hunt Graphic/sources/ (see SOURCES).
import { mkdirSync, copyFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = resolve(ROOT, '..');
const OUT = join(DOCS, 'Hunt Media', 'Hunt Graphic');
const SRC = join(OUT, 'sources');
const BG = join(DOCS, 'maurice-africh-design-system', 'assets', 'backgrounds');
const FONT = join(DOCS, 'maurice-africh-design-system', 'fonts', 'AtomicMarker-Regular.otf');
const url = (p) => 'file:///' + p.split('\\').join('/');
const req = createRequire(join(DOCS, 'maurice-africh-design-system', '.ds-sync', 'package.json'));
const { chromium } = req('playwright');

const AS_OF = 'AS OF SEPTEMBER 29, 2026';
const NUMBERS = [['220', 'SKY PIRATES'], ['173,820', 'CREW POINTS'], ['2,850', 'SWEEPSTAKES ENTRIES']];
// Maurice's copy (2026-09-29). title: lines stacked when there is more than one.
const PANELS = [
  { title: ['Sweepstakes'], sub: '3 sweepstakes, 10 winners each!', bg: 'ice-cavern-bridge-as180137594.webp', page: 'sweepstakes.png', tint: '72,45,133' },
  { title: ['Rewards'], sub: '20+ rewards unlocked by collective points for all hunters.', bg: 'neon-rain-street-as439051128.webp', page: 'rewards.png', tint: '26,94,65' },
  { title: ['Tasks & Riddles'], sub: 'To earn points and unlock secret rewards.', bg: 'energy-gate-as555671153.webp', page: 'tasks.png', tint: '44,96,33' },
  { title: ['Loot Boxes'], sub: '101 loot boxes hidden all over the internet.', bg: 'red-tree-palace-as461430569.webp', page: 'loot.png', tint: '145,37,1' },
  { title: ['Choose', 'Your Own', 'Adventure'], sub: 'Vote on where the crew goes and roll the dice!', bg: 'world-map-imperia.webp', page: null, tint: '26,94,65', pos: '72% 38%' },
];

// cols = slanted columns (wide sizes); rows = slanted bands (square and tall sizes).
// zone = where the words sit (YouTube channel art must keep them in the middle strip every device shows).
const FORMATS = {
  'press-16x9':          { W: 2400, H: 1350, mode: 'cols', title: 150, label: 64, sub: 27, footer: 150 },
  'youtube-thumbnail':   { W: 1280, H: 720,  mode: 'cols', title: 92,  label: 36, sub: 0,  footer: 0 },
  'banner-3x1':          { W: 3000, H: 1000, mode: 'cols', title: 130, label: 58, sub: 24, footer: 120 },
  'x-header':            { W: 1500, H: 500,  mode: 'cols', title: 70,  label: 30, sub: 0,  footer: 0 },
  'facebook-cover':      { W: 1640, H: 624,  mode: 'cols', title: 80,  label: 32, sub: 0,  footer: 0 },
  'youtube-channel-art': { W: 2560, H: 1440, mode: 'cols', title: 110, label: 40, sub: 0,  footer: 0, zone: [507, 930] },
  'square':              { W: 1080, H: 1080, mode: 'rows', title: 92,  label: 40, sub: 21, footer: 96 },
  'instagram-4x5':       { W: 1080, H: 1350, mode: 'rows', title: 100, label: 46, sub: 23, footer: 110 },
  'story-9x16':          { W: 1080, H: 1920, mode: 'rows', title: 112, label: 54, sub: 27, footer: 130 },
  'video-16x9':          { W: 1920, H: 1080, mode: 'cols', title: 120, label: 50, sub: 22, footer: 120, video: true },
  'video-9x16':          { W: 1080, H: 1920, mode: 'rows', title: 112, label: 54, sub: 27, footer: 130, video: true },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function html(f) {
  const { W, H } = f;
  const zy0 = f.zone ? f.zone[0] : 0, zy1 = f.zone ? f.zone[1] : H, Z = zy1 - zy0;
  const panels = [], seams = [], labels = [];
  let head = '', foot = '';
  const titleH = f.title * 2.05; // kicker + title + date pill
  if (f.mode === 'cols') {
    const lean = 0.111 * H, cw = W / 5;
    const x = (i, y) => i * cw + lean * (1 - 2 * y / H); // seam i at height y
    for (let i = 0; i < 5; i++) {
      const L = i === 0 ? `0 0,0 ${H}px` : `${x(i, 0)}px 0,${x(i, H)}px ${H}px`;
      const R = i === 4 ? `${W}px 0,${W}px ${H}px` : `${x(i + 1, 0)}px 0,${x(i + 1, H)}px ${H}px`;
      const poly = i === 0 ? `0 0,${x(1, 0)}px 0,${x(1, H)}px ${H}px,0 ${H}px`
        : i === 4 ? `${x(4, 0)}px 0,${W}px 0,${W}px ${H}px,${x(4, H)}px ${H}px`
        : `${x(i, 0)}px 0,${x(i + 1, 0)}px 0,${x(i + 1, H)}px ${H}px,${x(i, H)}px ${H}px`;
      void L; void R;
      const p = PANELS[i];
      const top = zy0 + titleH * 0.82;
      const pl = Math.max(0, i * cw - lean), pr = Math.min(W, (i + 1) * cw + lean); void top;
      const pageBox = `left:${pl}px;width:${pr - pl}px;top:0;height:${H}px`;
      panels.push({ poly, p, pageBox, pageW: cw * 1.02, pageLeft: i * cw + cw * -0.01 + (lean * (1 - 2 * (top + (H - top) / 2) / H)) - (i * cw - lean) });
      if (i > 0) seams.push([x(i, -20), -20, x(i, H + 20), H + 20]);
    }
    // Labels are sized and placed in the page (fitLabels) so each one stays inside its own lane.
    const ly = f.footer ? zy1 - f.footer - (f.sub ? f.label * 5.6 : f.label * 4.2) : zy1 - f.label * (f.zone ? 3.6 : 4.1);
    f.lanes = { mode: 'cols', W, H, cw, lean, top: ly, bottom: (f.footer ? zy1 - f.footer : zy1) - cw * 0.05 };
    PANELS.forEach((p) => labels.push({ p }));
    head = `<div class="top" style="top:${zy0}px;height:${titleH * 1.35}px;padding-top:${f.title * 0.3}px">${headInner(f)}</div>`;
  } else {
    // rows: header on top, five bands, footer at the bottom
    const hTop = titleH + f.title * 0.45, hBot = f.footer, bandH = (H - hTop - hBot) / 5, lean = 0.028 * W;
    const y = (i, xx) => hTop + i * bandH + lean * (1 - 2 * xx / W); // seam i across
    for (let i = 0; i < 5; i++) {
      const poly = `0 ${y(i, 0)}px,${W}px ${y(i, W)}px,${W}px ${y(i + 1, W)}px,0 ${y(i + 1, 0)}px`;
      const p = PANELS[i];
      const pageBox = `left:0;width:${W}px;top:${y(i, W)}px;height:${y(i + 1, 0) - y(i, W)}px`;
      panels.push({ poly, p, pageBox, rows: true });
      seams.push([-20, y(i, -20), W + 20, y(i, W + 20)]);
    }
    seams.push([-20, y(5, -20), W + 20, y(5, W + 20)]);
    f.lanes = { mode: 'rows', W, H, hTop, bandH, lean };
    PANELS.forEach((p) => labels.push({ p }));
    head = `<div class="top rowsTop" style="top:0;height:${hTop}px;padding-top:${f.title * 0.32}px">${headInner(f)}</div>`;
  }
  if (f.footer) foot = `<div class="foot" style="height:${f.footer}px">${NUMBERS.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}<div class="free">FREE TO PLAY<br>PRIZES FOR U.S. AND U.K. RESIDENTS 18+<br><span class="asof">${AS_OF}</span></div></div>`;

  const panelHtml = panels.map(({ poly, p, pageBox, rows }, i) => `
<div class="panel" data-i="${i}" style="clip-path:polygon(${poly})">
  <div class="art" style="background-image:url('${url(join(BG, p.bg))}');background-position:${p.pos || 'center'}"></div>
  ${p.page ? `<div class="page${rows ? ' pr' : ''}" style="${pageBox}"><img src="${url(join(SRC, p.page))}"></div>` : ''}
  <div class="shade${rows ? ' sr' : ''}" style="--t:${p.tint}"></div>
</div>`).join('');
  const lines = (p) => (f.mode === 'rows' ? [p.title.join(' ')] : p.title);
  const labelHtml = labels.map(({ p }, i) => `
<div class="label" data-i="${i}" style="text-align:${f.mode === 'cols' ? 'center' : 'left'}">
  <h2>${lines(p).map((l) => `<span>${esc(l)}</span>`).join('')}</h2>${f.sub ? `<p>${esc(p.sub)}</p>` : ''}
</div>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">
<style>
@font-face{font-family:'Atomic Marker';src:url('${url(FONT)}') format('opentype')}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;position:relative;background:#0b170f;font-family:'Almarai',sans-serif;color:#fffffe}
.panel{position:absolute;inset:0}
.art{position:absolute;inset:0;background-size:cover}
.page{position:absolute;overflow:hidden;opacity:.9}
.page img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.page.pr img{object-position:center 12%}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.05) 30%,rgba(0,0,0,.6) 44%,rgba(0,0,0,.9) 60%),linear-gradient(rgba(var(--t),.25),rgba(var(--t),.25))}
.shade.sr{background:linear-gradient(90deg,rgba(0,0,0,.92) 0%,rgba(0,0,0,.86) 54%,rgba(0,0,0,.35) 76%,rgba(0,0,0,.12) 100%),linear-gradient(rgba(var(--t),.25),rgba(var(--t),.25))}
svg.seams{position:absolute;inset:0;z-index:2;overflow:visible}
.seam{font-family:'Atomic Marker';fill:#ff4c0f}
.top{position:absolute;left:0;right:0;z-index:3;text-align:center;display:flex;flex-direction:column;align-items:center;gap:${f.title * 0.16}px;background:linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,.6) 70%,rgba(0,0,0,0))}
.rowsTop{background:#0b170f}
.kicker{line-height:1;font-weight:800;font-size:${f.title * 0.2}px;letter-spacing:.24em;color:#a2f590}
h1{font-family:'Atomic Marker',cursive;font-weight:400;font-size:${f.title}px;line-height:.8;padding-top:${f.title * 0.15}px;text-shadow:0 6px 30px rgba(0,0,0,.7)}
h1 span{color:#ff4c0f}
.when{display:inline-block;padding:${f.title * 0.07}px ${f.title * 0.22}px;background:rgba(0,0,0,.85);border:2px solid #ff4c0f;font-weight:800;font-size:${f.title * 0.21}px;letter-spacing:.12em;line-height:1.35}
.when b{color:#3adb97;font-weight:800;margin-left:.6em}
.label{position:absolute;z-index:3}
.label h2{font-family:'Atomic Marker',cursive;font-weight:400;font-size:${f.label}px;line-height:.98;text-shadow:0 4px 18px rgba(0,0,0,.9)}
.label h2 span{display:block;white-space:nowrap}
.label p{text-wrap:balance}
.label p{margin-top:${f.label * 0.22}px;font-weight:700;font-size:${f.sub}px;line-height:1.35;text-shadow:0 2px 10px rgba(0,0,0,1)}
.foot{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;align-items:center;justify-content:center;gap:${W * 0.035}px;background:rgba(0,0,0,.9);border-top:3px solid #ff4c0f;padding:0 ${W * 0.03}px}
.stat{text-align:center}
.stat b{display:block;font-family:'Atomic Marker',cursive;font-weight:400;font-size:${f.footer * 0.4}px;line-height:1}
.stat span{display:block;margin-top:${f.footer * 0.04}px;font-weight:800;font-size:${f.footer * 0.13}px;letter-spacing:.16em;color:#89fbcb}
.free{font-weight:800;font-size:${f.footer * 0.13}px;letter-spacing:.12em;line-height:1.6;color:#fffffe;border-left:2px solid rgba(255,255,254,.3);padding-left:${W * 0.03}px}
.asof{font-weight:700;color:rgba(255,255,254,.6)}
</style></head><body>
${panelHtml}
<svg class="seams" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${Math.max(4, W * 0.004)}" result="b"/><feFlood flood-color="#ff4c0f" flood-opacity=".7"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  ${seams.map(([x1, y1, x2, y2], i) => `<g class="sg" data-i="${i}" data-seam="${x1},${y1},${x2},${y2}" filter="url(#glow)"><text class="seam" font-size="400" x="0" y="0">/</text></g>`).join('')}
</svg>
${head}
${labelHtml}
${foot}
<script>
// Stretch the Atomic Marker slash so it runs along each seam, thick enough to cover the panel edge.
// Measures the slash's real ink (the text box includes empty space) and its stroke width at mid-height.
function inkBox(){
  const c = document.createElement('canvas'); c.width = 900; c.height = 900; const x = c.getContext('2d');
  x.font = "400px 'Atomic Marker'"; x.fillText('/', 200, 600);
  const d = x.getImageData(0, 0, 900, 900).data, on = (xx, yy) => d[(yy * 900 + xx) * 4 + 3] > 40;
  let a = 900, t = 900, e = 0, g = 0;
  for (let yy = 0; yy < 900; yy++) for (let xx = 0; xx < 900; xx++) if (on(xx, yy)) { if (xx < a) a = xx; if (xx > e) e = xx; if (yy < t) t = yy; if (yy > g) g = yy; }
  const mid = Math.round((t + g) / 2); let n = 0; for (let xx = 0; xx < 900; xx++) if (on(xx, mid)) n++;
  return { x: a - 200, y: t - 600, w: e - a + 1, h: g - t + 1, thick: n };
}
let INK;
// Lays the slash along a seam: its length runs the seam, its stroke is T wide, and a skew sets the lean.
function placeSeams(){
  INK = INK || inkBox();
  const T = ${f.mode === 'cols' ? W * 0.011 : H * 0.009};
  document.querySelectorAll('.sg').forEach((g) => {
    const t = g.querySelector('text');
    const [x1, y1, x2, y2] = g.dataset.seam.split(',').map(Number);
    const vertical = Math.abs(y2 - y1) >= Math.abs(x2 - x1);
    const L = vertical ? Math.abs(y2 - y1) : Math.abs(x2 - x1);
    const R = vertical ? (y1 < y2 ? x1 - x2 : x2 - x1) : (x1 < x2 ? y2 - y1 : y1 - y2);
    const A = T / INK.thick, D = (L * 1.04) / INK.h, runG = INK.w - INK.thick;
    const C = (A * runG - R) / INK.h;
    const cx = INK.x + INK.w / 2, cy = INK.y + INK.h / 2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const m = [A, 0, C, D, -A * cx - C * cy, -D * cy];
    t.setAttribute('transform', 'translate(' + mx + ',' + my + ')' + (vertical ? '' : ' rotate(-90)') + ' matrix(' + m.join(',') + ')');
  });
}
// Animation for the video versions; stills use setT(99).
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
window.setT = function (t) {
  document.querySelectorAll('.panel').forEach((el, i) => { const k = ease((t - 0.2 - i * 0.28) / 0.7); el.style.opacity = k; el.style.transform = '${f.mode === 'cols' ? 'translateY' : 'translateX'}(' + ((1 - k) * ${f.mode === 'cols' ? 60 : -80}) + 'px)'; });
  document.querySelectorAll('.sg').forEach((el, i) => { const k = ease((t - 0.5 - i * 0.28) / 0.5); el.style.opacity = k; });
  const h = document.querySelector('.top'); const kh = ease((t - 1.6) / 0.8); h.style.opacity = kh; h.style.transform = 'translateY(' + ((1 - kh) * -30) + 'px)';
  document.querySelectorAll('.label').forEach((el, i) => { const k = ease((t - 2.4 - i * 0.18) / 0.6); el.style.opacity = k; el.style.marginTop = ((1 - k) * 24) + 'px'; });
  const ft = document.querySelector('.foot'); if (ft) { const k = ease((t - 3.5) / 0.6); ft.style.opacity = k; ft.style.transform = 'translateY(' + ((1 - k) * 40) + 'px)'; }
  const ao = document.querySelector('.asof'); if (ao) ao.style.opacity = ease((t - 3.8) / 0.6);
};
// Fit the labels: every title on one line (the stacked one line per line), every description on exactly two lines,
// the same sizes and the same padding in every lane, and nothing crossing a slash.
const LANES = ${JSON.stringify(f.lanes)}, SUB = ${f.sub}, TITLE = ${f.label};
function fitLabels(){
  const els = [...document.querySelectorAll('.label')], L = LANES;
  const pad = L.mode === 'cols' ? L.cw * 0.07 : L.H * 0.022;
  const boxFor = (i, h, cwid) => {
    if (L.mode === 'cols') {
      const xs = (k, y) => k * L.cw + L.lean * (1 - 2 * y / L.H);
      const top = L.top, bot = top + h;
      const left = i === 0 ? 0 : xs(i, top), right = i === 4 ? L.W : xs(i + 1, bot);
      return { x: left + pad, y: top, w: right - left - 2 * pad };
    }
    const w = L.W * 0.62, x0 = pad, x1 = x0 + Math.min(w, cwid || w);
    const ys = (k, x) => L.hTop + k * L.bandH + L.lean * (1 - 2 * x / L.W);
    const top = ys(i, x0) + pad, bot = ys(i + 1, x1) - pad;
    return { x: x0, y: top + Math.max(0, (bot - top - h) / 2), w, room: bot - top };
  };
  const measure = (el, t, s, w) => {
    const h2 = el.querySelector('h2'), p = el.querySelector('p');
    h2.style.fontSize = t + 'px'; el.style.width = w + 'px';
    const titleW = Math.max(...[...h2.children].map((c) => { c.style.display = 'inline-block'; const wd = c.getBoundingClientRect().width; c.style.display = ''; return wd; }));
    let twoLines = true;
    if (p) {
      p.style.fontSize = s + 'px'; p.style.maxWidth = 'none'; p.style.whiteSpace = 'nowrap'; p.style.display = 'inline-block';
      const one = p.getBoundingClientRect().width; p.style.whiteSpace = ''; p.style.display = '';
      p.style.maxWidth = Math.min(w, one * 0.62) + 'px';
      twoLines = Math.round(p.offsetHeight / (s * 1.35)) === 2;
    }
    const subW = p ? p.getBoundingClientRect().width : 0; return { fits: titleW <= w && twoLines, h: el.offsetHeight, cw: Math.max(titleW, subW) };
  };
  let t = TITLE, s = SUB;
  for (let guard = 0; guard < 200; guard++) {
    let ok = true;
    els.forEach((el, i) => {
      let b = boxFor(i, 0), m = measure(el, t, s, b.w);
      b = boxFor(i, m.h, m.cw); m = measure(el, t, s, b.w);
      if (!m.fits) ok = false;
      if (L.mode === 'cols' && L.top + m.h > L.bottom) ok = false;
      if (L.mode === 'rows' && m.h > b.room) ok = false;
    });
    if (ok) break;
    t *= 0.97; if (s) s = Math.max(s * 0.985, t * 0.36);
  }
  els.forEach((el, i) => {
    const b0 = boxFor(i, 0); const m = measure(el, t, s, b0.w); const b = boxFor(i, m.h, m.cw); measure(el, t, s, b.w);
    el.style.left = b.x + 'px'; el.style.top = b.y + 'px';
    const p = el.querySelector('p'); if (p && L.mode === 'cols') { p.style.marginLeft = 'auto'; p.style.marginRight = 'auto'; }
  });
}
document.fonts.ready.then(() => { placeSeams(); fitLabels(); setT(99); window.__ready = true; });
</script>
</body></html>`;
}

function headInner(f) {
  return `<div class="kicker">CELLO’S GATE · THE SKY PIRATES OF IMPERIA</div><h1>The <span>Treasure</span> Hunt</h1><div class="when">SEPTEMBER 20 – NOVEMBER 1, 2026<b>MAURICEAFRICH.COM/THE-HUNT</b></div>`;
}

const only = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2].split(',') : Object.keys(FORMATS);
const wantVideo = process.argv.includes('--video');
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
for (const name of only) {
  const f = FORMATS[name]; if (!f) { console.log('unknown format', name); continue; }
  if (f.video && !wantVideo) continue;
  const page = await browser.newPage({ viewport: { width: f.W, height: f.H } });
  const tmp = join(OUT, '.render-' + name + '.html'); writeFileSync(tmp, html(f)); await page.goto(url(tmp), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  if (!f.video) {
    const file = join(OUT, `hunt-${name}-${f.W}x${f.H}.png`);
    await page.screenshot({ path: file });
    console.log('✓', file.split('\\').pop());
    if (name === 'press-16x9') copyFileSync(file, join(ROOT, 'assets', 'press', 'hunt-overview.png'));
  } else {
    const ffmpeg = process.env.FFMPEG; if (!ffmpeg) { console.log('set FFMPEG to an ffmpeg binary for videos'); await page.close(); continue; }
    const frames = join(OUT, `.frames-${name}`); rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
    const fps = 30, secs = 8;
    for (let n = 0; n < fps * secs; n++) {
      await page.evaluate((t) => window.setT(t), n / fps);
      await page.screenshot({ path: join(frames, `f${String(n).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
    }
    const file = join(OUT, `hunt-${name}-${f.W}x${f.H}.mp4`);
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(frames, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', file]);
    rmSync(frames, { recursive: true, force: true });
    console.log('✓', file.split('\\').pop());
  }
  await page.close(); rmSync(join(OUT, '.render-' + name + '.html'), { force: true });
}
await browser.close();
void readdirSync;
