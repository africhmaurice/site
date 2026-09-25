// node tools/clues.mjs : rebuilds the clue boards on pages/lootbox-clue.html from the CLUES list below.
// Text is kept exactly as written (capital letters and line breaks matter for some clues), and HTML-escaped.
// To add a clue: add an entry, run this, then npm run publish.
// A clue can carry options: { flash: an image shown for a split second on click, img: a picture clue, href: the clue is a link }.
// node tools/clues.mjs --next writes a preview copy (pages/lootbox-clue-next.html) and leaves the live page alone.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NEXT = process.argv.includes('--next');
const LIVE_F = join(ROOT, 'pages', 'lootbox-clue.html');
const F = NEXT ? join(ROOT, 'pages', 'lootbox-clue-next.html') : LIVE_F;
const ART = 'https://africhmaurice.github.io/site/assets/clues/';
// The void (clue #18) is its own Squarespace page; the preview points at its preview copy instead.
const VOID = NEXT ? 'https://africhmaurice.github.io/site/preview/the-void.html' : 'https://www.mauriceafrich.com/the-void';

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
  [13, 'In the Dark (Visually)', { flash: ART + 'clue-13-flash.webp' }],
  [14, 'Them: "As an author, you\'re not supposed to do this!"'],
  [15, `You're doing great, kid. I love your passion, your work ethic, your commitment to always being you. And that's what's important to me because *you're* important to me. I couldn't be more proud to be your dad.`],
  [17, '', { img: ART + 'clue-17.webp', alt: 'A barrel smoker with a coffee can on its chimney' }],
  [18, 'click this', { href: VOID }],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const boards = CLUES.map(([n, text, o = {}]) => {
  let body = text ? `<div class="lc-text">${esc(text)}</div>` : '';
  if (o.href) body = `<a class="lc-text lc-link" href="${esc(o.href)}">${esc(text)}</a>`;
  if (o.img) body += `<img class="lc-img" src="${esc(o.img)}" alt="${esc(o.alt || '')}" loading="lazy">`;
  return `  <div class="lc-board${o.flash ? ' lc-flash' : ''}" data-clue="${n}"${o.flash ? ` data-flash="${esc(o.flash)}" role="button" tabindex="0"` : ''}>
    <div class="lc-num">#${n}</div>
    ${body}
  </div>`;
}).join('\n');

// A flash clue: one click shows its image full screen for a split second, then it's gone.
const flashJs = `  <script>(function(){var s=document.getElementById('loot-clue');if(!s)return;
    Array.prototype.forEach.call(s.querySelectorAll('.lc-flash'),function(b){var src=b.getAttribute('data-flash');new Image().src=src;
      function go(){var o=document.createElement('div');o.className='lc-flash-ov';o.innerHTML='<img alt="" src="'+src+'">';document.body.appendChild(o);setTimeout(function(){o.remove();},110);}
      b.addEventListener('click',go);b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});})();</script>`;

let h = readFileSync(NEXT ? LIVE_F : F, 'utf8');
const a = h.indexOf('<section id="loot-clue">'); const b = h.indexOf('</section>', a);
if (a < 0 || b < 0) throw new Error('clue section not found');
h = h.slice(0, a) + `<section id="loot-clue">\n  <div class="lc-grid">\n${boards}\n  </div>\n${flashJs}\n` + h.slice(b);

// Styles: number in Atomic Marker, clue in Almarai (no forced capitals), two boards per row.
const css = `#loot-clue .lc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;max-width:1240px;width:100%;align-items:stretch}
#loot-clue .lc-board{box-sizing:border-box;max-width:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 44px 52px}
#loot-clue .lc-num{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(34px,3.4vw,52px);line-height:1;color:#89fbcb;margin:0 0 22px}
#loot-clue .lc-text{font-family:'Almarai',sans-serif;font-weight:700;font-size:clamp(18px,1.6vw,23px);line-height:1.55;letter-spacing:.02em;color:#fffffe;white-space:pre-line;text-transform:none;margin:0}
#loot-clue .lc-link{text-decoration:underline;text-underline-offset:4px}#loot-clue .lc-link:hover{color:#a2f590}
#loot-clue .lc-flash{cursor:pointer}
#loot-clue .lc-img{display:block;width:100%;max-width:420px;height:auto;border:3px solid #0b170f;box-shadow:4px 5px 0 rgba(0,0,0,.35)}
.lc-flash-ov{position:fixed;inset:0;z-index:2147483646;background:#fffffe;display:flex;align-items:center;justify-content:center;pointer-events:none}.lc-flash-ov img{width:min(60vw,448px);height:auto}
@media (max-width:860px){#loot-clue .lc-grid{grid-template-columns:1fr;gap:24px}#loot-clue .lc-board{padding:44px 26px 40px}}`;
h = h.replace(/#loot-clue \.lc-grid\{[\s\S]*?@media \(max-width:860px\)\{[^\n]*\}\}\n?/, '');
h = h.replace('@media (max-width:760px){#loot-clue{padding:130px 20px 70px}', css + '\n@media (max-width:760px){#loot-clue{padding:130px 20px 70px}');
writeFileSync(F, h);
console.log(`${CLUES.length} clues written to ${NEXT ? 'the preview copy' : 'the live page'}: #${CLUES.map((c) => c[0]).join(', #')}`);
