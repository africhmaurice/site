// node tools/links-stats.mjs : the link page's numbers (mauriceafrich.com/links). Asks the Loot Boxes web app for
// the totals in the "Link Clicks" tab (needs the export key in ../treasure-hunt-leaderboard/private/secrets.json)
// and writes .preview/link-stats.html (kept off the site) with visits, taps, top links, sources, and days.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = JSON.parse(readFileSync(join(ROOT, '../treasure-hunt-leaderboard/private/secrets.json'), 'utf8')).autoExport.key;
const ENDPOINT = 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';
const D = JSON.parse(readFileSync(join(ROOT, 'tools/links.json'), 'utf8'));
const names = {};
for (const s of D.socials) names[s.id] = s.label + ' (icon)';
for (const f of D.feature) names[f.id] = f.label + ' (big button)';
for (const s of D.sections) if (s.promo) names[s.promo.id] = s.promo.label;
for (const s of D.sections) for (const l of s.links) names[l.id] = l.label;
names[D.quiet.id] = D.quiet.label;
names[D.newsletter.id] = 'Newsletter signups';

const res = await (await fetch(ENDPOINT, { method: 'POST', body: JSON.stringify({ action: 'linkstats', key: KEY }) })).json();
if (!res.ok) { console.error('The web app said: ' + res.error); process.exit(1); }
const S = res.stats, fmt = (n) => Number(n || 0).toLocaleString('en-US'), pct = (a, b) => (b ? Math.round(a / b * 100) : 0) + '%';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const links = Object.entries(S.byLink).sort((a, b) => b[1].clicks - a[1].clicks);
const sources = Object.entries(S.bySource).sort((a, b) => b[1].views - a[1].views);
const days = Object.entries(S.byDay).sort().slice(-30);
const top = Math.max(1, ...days.map(([, d]) => d.views));
const bar = (n, max, color) => `<i style="display:block;height:12px;width:${Math.max(2, n / max * 100)}%;background:${color}"></i>`;
const maxLink = Math.max(1, ...links.map(([, v]) => v.clicks));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link Page Stats</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap"><style>
*{box-sizing:border-box;border-radius:0}body{margin:0;background:#0b170f;color:#fffffe;font-family:Almarai,sans-serif;padding:40px 16px}main{max-width:900px;margin:0 auto;display:grid;gap:22px}
h1{margin:0;font-size:34px;letter-spacing:.04em}p{margin:0;color:#a2f590;font-weight:700;letter-spacing:.06em}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.tile{background:#213226;border:2px solid #2c6021;padding:20px}.tile b{display:block;font-size:40px;line-height:1.2}.tile span{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a2f590}
section{background:#132219;border:2px solid #213226;padding:22px}h2{margin:0 0 14px;font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:#a2f590}
table{width:100%;border-collapse:collapse;font-size:15px}td{padding:8px 6px;border-top:1px solid #213226;vertical-align:middle}td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;width:80px}td.b{width:38%}
</style></head><body><main>
<h1>Link page stats</h1><p>mauriceafrich.com/links · as of ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
<div class="tiles"><div class="tile"><b>${fmt(S.views)}</b><span>Visits</span></div><div class="tile"><b>${fmt(S.clicks)}</b><span>Taps</span></div>
<div class="tile"><b>${pct(S.clicks, S.views)}</b><span>Taps per visit</span></div><div class="tile"><b>${pct(S.byDevice.phone || 0, S.views)}</b><span>On phones</span></div></div>
<section><h2>Top links</h2><table>${links.map(([id, v]) => `<tr><td>${esc(names[id] || id)}</td><td class="b">${bar(v.clicks, maxLink, '#c53200')}</td><td class="n">${fmt(v.clicks)}</td></tr>`).join('') || '<tr><td>No taps yet.</td></tr>'}</table></section>
<section><h2>Where visitors came from</h2><table><tr><td></td><td class="n">Visits</td><td class="n">Taps</td></tr>${sources.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(v.views)}</td><td class="n">${fmt(v.clicks)}</td></tr>`).join('')}</table></section>
<section><h2>Last 30 days</h2><table>${days.map(([d, v]) => `<tr><td style="width:110px">${d}</td><td class="b" style="width:auto">${bar(v.views, top, '#268e62')}</td><td class="n">${fmt(v.views)} visits</td><td class="n">${fmt(v.clicks)} taps</td></tr>`).join('') || '<tr><td>No visits yet.</td></tr>'}</table></section>
</main></body></html>`;
mkdirSync(join(ROOT, '.preview'), { recursive: true });
writeFileSync(join(ROOT, '.preview/link-stats.html'), html);
console.log(`${fmt(S.views)} visits, ${fmt(S.clicks)} taps. Wrote .preview/link-stats.html`);
