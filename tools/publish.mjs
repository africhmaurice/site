// npm run publish [-- "commit message"] [--dry]
// 1. Copies the hunt bot's three pages (bot:… sources in site.json) into pages/, so the bot project stays their single home.
// 2. Checks every page in site.json exists and is non-empty.
// 3. Commits and pushes to GitHub; GitHub Pages serves it at site.json → publicBase within about a minute.
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractImages } from './extract-images.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8'));
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const msg = args.filter((a) => !a.startsWith('--'))[0] || `Publish ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;

let problems = 0;
for (const p of site.pages) {
  const target = join(ROOT, 'pages', `${p.slug}.html`);
  if (p.source.startsWith('bot:')) {
    const src = resolve(ROOT, site.botRepo, p.source.slice(4));
    if (!existsSync(src)) { console.error(`✗ ${p.slug}: bot file missing at ${src}`); problems++; continue; }
    const body = readFileSync(src, 'utf8');
    const banner = `<!-- Generated copy of ${p.source.slice(4)} from the treasure-hunt-leaderboard project. Edit it there, then run npm run publish. -->\n`;
    const next = banner + body;
    if (!existsSync(target) || readFileSync(target, 'utf8') !== next) { writeFileSync(target, next); console.log(`↻ ${p.slug} ← bot ${p.source.slice(4)}`); }
  }
  if (!existsSync(target) || statSync(target).size < 20) { console.error(`✗ ${p.slug}: pages/${p.slug}.html is missing or empty`); problems++; continue; }
  // Move embedded images out into cached files (identical bytes). Site-owned sources are rewritten once and stay that way.
  const before = readFileSync(target, 'utf8');
  const out = extractImages(before, { root: ROOT, publicBase: site.publicBase });
  if (out.html !== before) { writeFileSync(target, out.html); console.log(`⇢ ${p.slug}: ${out.moved} image(s), ${(out.bytes / 1048576).toFixed(1)} MB moved to assets/img (${(before.length / 1048576).toFixed(1)} → ${(out.html.length / 1048576).toFixed(2)} MB page)`); }
}
if (problems) { console.error(`\n${problems} problem(s); nothing published.`); process.exit(1); }

const git = (c) => execSync(`git ${c}`, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
git('add -A');
const changed = git('status --porcelain');
if (!changed) { console.log('✓ nothing changed since the last publish.'); process.exit(0); }
console.log(changed.split('\n').map((l) => '  ' + l).join('\n'));
if (dry) { console.log('(dry run: not committed)'); git('reset -q'); process.exit(0); }
git(`commit -q -m ${JSON.stringify(msg)}`);
git('push -q origin HEAD');
console.log(`✓ published. Live at ${site.publicBase} in about a minute.`);
