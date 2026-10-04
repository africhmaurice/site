// node tools/links-weekly.mjs [--end yyyy-mm-dd] [--meta file.json] : the weekly link page report.
// Compares the last 7 days (ending yesterday, or --end) with the 7 before: visits, taps, newsletter signups, top
// links, where visitors came from, and which ad campaigns (utm_campaign) sent them. --meta adds the ad numbers
// from Meta's weekly Ads Manager email: { "spend": 0, "impressions": 0, "clicks": 0, "results": 0,
// "campaigns": [{ "name": "", "spend": 0, "results": 0 }] }. Writes .preview/weekly/link-report-<end>.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = JSON.parse(readFileSync(join(ROOT, '../treasure-hunt-leaderboard/private/secrets.json'), 'utf8')).autoExport.key;
const ENDPOINT = 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';
const D = JSON.parse(readFileSync(join(ROOT, 'tools/links.json'), 'utf8'));
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const day = (d) => d.toISOString().slice(0, 10);
const end = arg('--end') ? new Date(arg('--end') + 'T12:00:00Z') : new Date(Date.now() - 864e5);
const back = (d, n) => new Date(d.getTime() - n * 864e5);
const W = { since: day(back(end, 6)), until: day(end) }, P = { since: day(back(end, 13)), until: day(back(end, 7)) };
const meta = arg('--meta') ? JSON.parse(readFileSync(arg('--meta'), 'utf8')) : null;

const names = {};
for (const s of D.socials) names[s.id] = s.label + ' (icon)';
for (const f of D.feature) names[f.id] = f.label;
for (const s of D.sections) { for (const l of s.links) names[l.id] = l.label + ' (' + s.title + ')'; if (s.promo) names[s.promo.id] = s.promo.label; }
names[D.copper.id] = D.copper.label; names[D.quiet.id] = D.quiet.label;

async function stats(r) {
  const res = await (await fetch(ENDPOINT, { method: 'POST', body: JSON.stringify({ action: 'linkstats', key: KEY, since: r.since, until: r.until }) })).json();
  if (!res.ok) throw new Error('The web app said: ' + res.error);
  const s = res.stats; s.signups = (s.byLink.newsletter || { clicks: 0 }).clicks; s.taps = s.clicks - s.signups;
  return s;
}
const [S, Q] = await Promise.all([stats(W), stats(P)]);
const fmt = (n) => Number(n || 0).toLocaleString('en-US'), pct = (a, b) => (b ? Math.round(a / b * 100) : 0) + '%';
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const change = (a, b) => { if (!b) return a ? 'new this week' : 'no change'; const c = Math.round((a - b) / b * 100); return (c > 0 ? '+' : '') + c + '% vs the week before'; };
const nice = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
const tile = (n, label, prev) => `<div class="tile"><b>${n}</b><span>${label}</span>${prev !== undefined ? `<i>${prev}</i>` : ''}</div>`;
const rows = (list, cols) => list.length ? list.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols}">Nothing yet this week.</td></tr>`;
const links = Object.entries(S.byLink).filter(([k]) => k !== 'newsletter').sort((a, b) => b[1].clicks - a[1].clicks).slice(0, 10);
const sources = Object.entries(S.bySource).sort((a, b) => b[1].views - a[1].views);
const camps = Object.entries(S.byCampaign || {}).sort((a, b) => b[1].views - a[1].views);
const metaHtml = meta ? `<section><h2>Meta ads (from Ads Manager)</h2><div class="tiles">${tile(money(meta.spend), 'Spent')}${tile(fmt(meta.impressions), 'Impressions')}${tile(fmt(meta.clicks), 'Link clicks')}${tile(fmt(meta.results), 'Results')}</div>
<table><tr><td></td><td class="n">Spent</td><td class="n">Results</td><td class="n">Cost per result</td></tr>${rows((meta.campaigns || []).map((c) => [esc(c.name), money(c.spend), fmt(c.results), c.results ? money(c.spend / c.results) : '-']), 4)}</table>
${meta.spend && S.signups ? `<p class="note">Cost per newsletter signup on the link page this week: ${money(meta.spend / S.signups)} (all ad spend divided by all signups, so it is a rough number).</p>` : ''}</section>`
  : `<section><h2>Meta ads</h2><p class="note">No Ads Manager report was found for this week. Once the weekly Ads Manager email is set up, its spend and results show here.</p></section>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link Page Weekly Report</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap"><style>
*{box-sizing:border-box;border-radius:0}body{margin:0;background:#0b170f;color:#fffffe;font-family:Almarai,sans-serif;padding:40px 16px}main{max-width:900px;margin:0 auto;display:grid;gap:22px}
h1{margin:0;font-size:34px;line-height:1.2;letter-spacing:.04em}p{margin:0}.sub{color:#a2f590;font-weight:700;letter-spacing:.06em}.note{margin-top:12px;color:#c9d6cc;font-size:14px;line-height:1.5}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.tile{background:#213226;border:2px solid #2c6021;padding:20px;display:flex;flex-direction:column;gap:6px}.tile b{font-size:36px;line-height:1.2}.tile span{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a2f590}.tile i{font-style:normal;font-size:13px;color:#c9d6cc}
section{background:#132219;border:2px solid #213226;padding:22px}h2{margin:0 0 14px;font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:#a2f590}section .tiles{margin-bottom:14px}
table{width:100%;border-collapse:collapse;font-size:15px}td{padding:8px 6px;border-top:1px solid #213226;vertical-align:middle}td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;width:110px}
</style></head><body><main>
<h1>Link page weekly report</h1><p class="sub">mauriceafrich.com/links · ${nice(W.since)} to ${nice(W.until)}</p>
<div class="tiles">${tile(fmt(S.views), 'Visits', change(S.views, Q.views))}${tile(fmt(S.taps), 'Taps', change(S.taps, Q.taps))}${tile(fmt(S.signups), 'Newsletter signups', change(S.signups, Q.signups))}${tile(pct(S.taps, S.views), 'Taps per visit')}${tile(pct(S.byDevice.phone || 0, S.views), 'On phones')}</div>
${metaHtml}
<section><h2>Ad campaigns on the link page</h2><table><tr><td></td><td class="n">Visits</td><td class="n">Taps</td><td class="n">Signups</td></tr>${rows(camps.map(([k, v]) => [esc(k), fmt(v.views), fmt(v.clicks), fmt(v.signups)]), 4)}</table><p class="note">Counted from links tagged with utm_campaign, for example mauriceafrich.com/links?utm_source=meta&amp;utm_campaign=hunt.</p></section>
<section><h2>Top links</h2><table>${rows(links.map(([id, v]) => [esc(names[id] || id), fmt(v.clicks)]), 2)}</table></section>
<section><h2>Where visitors came from</h2><table><tr><td></td><td class="n">Visits</td><td class="n">Taps</td></tr>${rows(sources.map(([k, v]) => [esc(k), fmt(v.views), fmt(v.clicks)]), 3)}</table></section>
</main></body></html>`;
mkdirSync(join(ROOT, '.preview/weekly'), { recursive: true });
const out = join(ROOT, '.preview/weekly/link-report-' + W.until + '.html');
writeFileSync(out, html);
console.log(`${W.since} to ${W.until}: ${fmt(S.views)} visits, ${fmt(S.taps)} taps, ${fmt(S.signups)} signups${meta ? ', ' + money(meta.spend) + ' ad spend' : ''}. Wrote ${out}`);
