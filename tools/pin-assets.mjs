// node tools/pin-assets.mjs : points loader.js's image pin (PIN) at the newest published commit, so images come
// from the year-cached CDN copy of that publish. Run it after a publish that adds or changes images; anything
// newer than the pin still loads, straight from GitHub Pages, until the pin moves.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = (c) => execSync(`git ${c}`, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
const files = process.argv.slice(2).length ? process.argv.slice(2) : ['loader.js'];
git('fetch -q origin');
const sha = git('rev-parse origin/main');
let changed = [];
for (const f of files) {
  const p = join(ROOT, f), t = readFileSync(p, 'utf8');
  const next = t.replace(/var PIN = '[0-9a-f]*';/, `var PIN = '${sha}';`);
  if (next !== t) { writeFileSync(p, next); changed.push(f); }
}
if (!changed.length) { console.log('pin already at', sha.slice(0, 7)); process.exit(0); }
git(`add ${changed.join(' ')}`);
git(`commit -q -m "Pin images to ${sha.slice(0, 7)}"`);
git('push -q origin HEAD');
console.log('pinned images to', sha.slice(0, 7), 'in', changed.join(', '));
