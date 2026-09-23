// npm run mirror : builds preview/<page>.html, a full copy of each live Squarespace page (header menu, footer,
// native sections, forms), with its code blocks swapped for the loader so the custom sections come from this repo.
// It's a review copy only: forms are disabled, links stay inside the preview, search engines are told to skip it.
// Re-run whenever the live Squarespace page changes (header links, native blocks) — publish runs it automatically.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUT, swapBlocks } from './lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8'));
const LIVE = 'https://www.mauriceafrich.com';
const PREVIEW = site.publicBase + 'preview/';
mkdirSync(join(ROOT, 'preview'), { recursive: true });

const pages = Object.keys(LAYOUT);
const banner = (page) => `
<div id="ma-preview-bar" style="position:fixed;left:12px;bottom:12px;z-index:2147483647;display:flex;gap:8px;align-items:center;background:rgba(11,23,15,.94);color:#fff;border:1px solid rgba(162,245,144,.35);border-radius:999px;padding:6px 8px 6px 14px;font:600 12px/1.2 system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 6px 20px rgba(0,0,0,.4)">
  PREVIEW
  <a href="${LIVE}/${page}" target="_blank" rel="noopener" style="color:#0b170f;background:#3adb97;border-radius:999px;padding:5px 10px;text-decoration:none">Compare with live ↗</a>
  <button type="button" onclick="this.parentNode.remove()" aria-label="Hide" style="background:none;border:0;color:#8fa596;font-size:16px;cursor:pointer;padding:0 4px">×</button>
</div>
<script>
// Preview only: stop form submissions so nothing reaches the real hunt pipeline.
document.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); alert('Preview only: this form is switched off here. Nothing was sent.'); }, true);
document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.form-submit-button, button[type=submit], input[type=submit]'); if (b) { e.preventDefault(); e.stopImmediatePropagation(); alert('Preview only: this form is switched off here. Nothing was sent.'); } }, true);
</script>`;

for (const page of pages) {
  const res = await fetch(`${LIVE}/${page}`, { headers: { 'user-agent': 'Mozilla/5.0 (site preview builder)' } });
  if (!res.ok) { console.error(`✗ ${page}: live page returned ${res.status}`); process.exitCode = 1; continue; }
  let html = await res.text();
  const { html: swapped, swapped: n } = swapBlocks(html, LAYOUT[page], site.publicBase + 'loader.js');
  html = swapped;
  if (n !== LAYOUT[page].length) console.warn(`! ${page}: expected ${LAYOUT[page].length} code blocks, found ${n} (did the live page change?)`);
  // Links between site pages stay inside the preview; everything else resolves against the live site.
  html = html.replace(/href="\/([a-z0-9-]*)"(?=[\s>])/gi, (m, slug) => {
    const target = slug === '' ? 'home' : slug;
    return pages.includes(target) ? `href="${PREVIEW}${target}.html"` : `href="${LIVE}/${slug}"`;
  });
  html = html.replace(/href="\/#([a-z0-9-]+)"/gi, `href="${PREVIEW}home.html#$1"`);
  html = html.replace(/<head([^>]*)>/i, `<head$1>\n<base href="${LIVE}/">\n<meta name="robots" content="noindex,nofollow">`);
  html = html.replace(/<\/body>/i, `${banner(page)}\n</body>`);
  writeFileSync(join(ROOT, 'preview', `${page}.html`), html);
  console.log(`✓ preview/${page}.html  (${n} block${n === 1 ? '' : 's'} from this repo)`);
}
