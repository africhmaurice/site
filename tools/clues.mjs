// node tools/clues.mjs : rebuilds the clue boards on pages/lootbox-clue.html from the CLUES list below.
// Text is kept exactly as written (capital letters and line breaks matter for some clues), and HTML-escaped.
// To add a clue: add an entry, run this, then npm run publish.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const F = join(ROOT, 'pages', 'lootbox-clue.html');

const CLUES = [
  [0, 'CLICK IT'],
  [1, `The Quiet One waits
hanging, listless and forgotten
at the base of a
tree without leaves
no branches linking it
to the imperia
but carrying it out
into the world
far and away.
Within a liminal space
the Quiet One waits.`],
  [2, `“I would have lived in war
but my enemies brought me loot.”
— RR's #1 Fan`],
  [3, 'If you like this game, open this loot box!'],
  [4, `Down the
rabbit hole you
eager heathens!
Remember to
eat your veggies
and
drown your enemies in the
slow-cooked abyss!`],
  [5, 'WINE DADDY 45'],
  [6, 'NEEWWWW ACHIEVEMENT! This loot box is shaped like a cat girl, you dirty little lynx! I bet you like that, don\'t you?'],
  [7, 'Keep yapping and you never know.'],
  [9, 'Destination X'],
  [10, 'nuh ay thuh nuh sih buh oof kuh tuh ock'],
  [11, `the clock says tik.
the clock says tok.
a certaiN guy has hidden a prize.
no dragon’s hoard, no kings chest.
but a clever doom scroller might do bEst.
start with the clock.
fInd the guy.
only his personaL story
holds the key,
to the room for fans of fiction
(some might say addict),
to find their prize.`],
  [12, 'Samuel Chastain Rogers aka "Pops"'],
  [13, 'In the Dark'],
  [14, 'Them: "As an author, you\'re not supposed to do this!"'],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const boards = CLUES.map(([n, text]) => `  <div class="lc-board" data-clue="${n}">
    <div class="lc-num">#${n}</div>
    <div class="lc-text">${esc(text)}</div>
  </div>`).join('\n');

let h = readFileSync(F, 'utf8');
const a = h.indexOf('<section id="loot-clue">'); const b = h.indexOf('</section>', a);
if (a < 0 || b < 0) throw new Error('clue section not found');
h = h.slice(0, a) + `<section id="loot-clue">\n  <div class="lc-grid">\n${boards}\n  </div>\n` + h.slice(b);

// Styles: number in Atomic Marker, clue in Almarai (no forced capitals), two boards per row.
const css = `#loot-clue .lc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;max-width:1240px;width:100%;align-items:stretch}
#loot-clue .lc-board{box-sizing:border-box;max-width:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 44px 52px}
#loot-clue .lc-num{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(34px,3.4vw,52px);line-height:1;color:#89fbcb;margin:0 0 22px}
#loot-clue .lc-text{font-family:'Almarai',sans-serif;font-weight:700;font-size:clamp(18px,1.6vw,23px);line-height:1.55;letter-spacing:.02em;color:#fffffe;white-space:pre-line;text-transform:none;margin:0}
@media (max-width:860px){#loot-clue .lc-grid{grid-template-columns:1fr;gap:24px}#loot-clue .lc-board{padding:44px 26px 40px}}`;
h = h.replace(/#loot-clue \.lc-grid\{[\s\S]*?@media \(max-width:860px\)\{[^\n]*\}\}\n?/, '');
h = h.replace('@media (max-width:760px){#loot-clue{padding:130px 20px 70px}', css + '\n@media (max-width:760px){#loot-clue{padding:130px 20px 70px}');
writeFileSync(F, h);
console.log(`${CLUES.length} clues written: #${CLUES.map((c) => c[0]).join(', #')}`);
