// node tools/copy-bot-pages.mjs <slug> [<slug> ...] : does step 1 of npm run publish (copy bot:… pages from the
// treasure-hunt-leaderboard project, then move embedded images out) for the named pages only, so another page's
// unfinished bot work isn't swept into a publish. Commit the pages it reports yourself.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractImages } from './extract-images.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8'));
const want = process.argv.slice(2);
if (!want.length) { console.error('name the page slugs to copy'); process.exit(1); }
for (const slug of want) {
  const p = site.pages.find((x) => x.slug === slug);
  if (!p || !p.source.startsWith('bot:')) { console.error(`✗ ${slug}: not a bot page in site.json`); process.exit(1); }
  const src = resolve(ROOT, site.botRepo, p.source.slice(4)), target = join(ROOT, 'pages', `${slug}.html`);
  if (!existsSync(src)) { console.error(`✗ ${slug}: bot file missing at ${src}`); process.exit(1); }
  const banner = `<!-- Generated copy of ${p.source.slice(4)} from the treasure-hunt-leaderboard project. Edit it there, then run npm run publish. -->\n`;
  const out = extractImages(banner + readFileSync(src, 'utf8'), { root: ROOT, publicBase: site.publicBase });
  const before = existsSync(target) ? readFileSync(target, 'utf8') : '';
  if (out.html !== before) { writeFileSync(target, out.html); console.log(`↻ ${slug} ← bot ${p.source.slice(4)}${out.moved ? ` (${out.moved} image(s) moved)` : ''}`); }
  else console.log(`= ${slug} unchanged`);
}
