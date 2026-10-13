// node tools/arcade.mjs [file ...]
// The arcade games (Airship Runner, Thread the Needle) carry two shared pieces (Maurice, 2026-10-13):
//   1. THE ARCADE title and game buttons at the top, copied from the bot's games/_tabs.html (the same row every daily
//      game page has), between ARCADE-TABS markers. Re-run this after adding a game to _tabs.html.
//   2. The export card (tools/arcade-card.js), between ARCADE-CARD markers.
// With no arguments it updates pages/airship-runner.html and pages/thread-the-needle.html; give paths to update other
// copies of those pages (for example a held copy). Idempotent.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TABS = path.resolve(ROOT, '../treasure-hunt-leaderboard/games/_tabs.html');
const CARD = path.join(ROOT, 'tools/arcade-card.js');
const PAGES = { 'airship-runner': { tab: 'airship_runner', section: '<section id="ma-runner"' }, 'thread-the-needle': { tab: 'thread_needle', section: '<section id="ma-flappy"' } };
const files = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES).map((k) => path.join(ROOT, 'pages', k + '.html'));

// the tab row: the style, the title, the buttons, and the script that marks this game and unlocks the Act Two games
const tabsSrc = fs.readFileSync(TABS, 'utf8').replace(/\r\n/g, '\n');
const cut = tabsSrc.indexOf('</script>');
if (cut < 0) throw new Error('_tabs.html: no script');
const tabsBlock = tabsSrc.slice(0, cut + '</script>'.length).trim();
const card = fs.readFileSync(CARD, 'utf8').replace(/\r\n/g, '\n').trimEnd();

for (const file of files) {
  const slug = Object.keys(PAGES).find((k) => path.basename(file).startsWith(k));
  if (!slug) throw new Error('not an arcade page: ' + file);
  const P = PAGES[slug];
  const raw = fs.readFileSync(file, 'utf8'), eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let s = raw.replace(/\r\n/g, '\n');
  const tabs = '<!-- ARCADE-TABS:BEGIN (pasted by tools/arcade.mjs from treasure-hunt-leaderboard/games/_tabs.html; do not edit here) -->\n' +
    '<div class="ma-arcade" style="width:min(100%,760px);margin:0 auto;position:relative;z-index:2">\n' + tabsBlock.replace('{{TAB}}', P.tab) + '\n</div>\n<!-- ARCADE-TABS:END -->';
  if (s.includes('<!-- ARCADE-TABS:BEGIN')) s = s.replace(/<!-- ARCADE-TABS:BEGIN[\s\S]*?<!-- ARCADE-TABS:END -->/, () => tabs);
  else {
    const a = s.indexOf(P.section); if (a < 0) throw new Error(file + ': section not found');
    const b = s.indexOf('>', a) + 1; s = s.slice(0, b) + '\n' + tabs + s.slice(b);
  }
  const cardTag = '<script>/* ARCADE-CARD:BEGIN (pasted by tools/arcade.mjs from tools/arcade-card.js; do not edit here) */\n' + card + '\n/* ARCADE-CARD:END */</script>';
  if (s.includes('/* ARCADE-CARD:BEGIN')) s = s.replace(/<script>\/\* ARCADE-CARD:BEGIN[\s\S]*?\/\* ARCADE-CARD:END \*\/<\/script>/, () => cardTag);
  else {
    // just before the game's own script (the first plain <script> after the section)
    const a = s.indexOf(P.section), b = s.indexOf('\n<script>\n', a); if (b < 0) throw new Error(file + ': game script not found');
    s = s.slice(0, b + 1) + cardTag + '\n' + s.slice(b + 1);
  }
  const out = s.replace(/\n/g, eol);
  if (out !== raw) { fs.writeFileSync(file, out); console.log('updated', path.relative(ROOT, file)); } else console.log('ok already', path.relative(ROOT, file));
}
