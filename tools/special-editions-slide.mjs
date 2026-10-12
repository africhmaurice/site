// node tools/special-editions-slide.mjs : adds the Special Editions slide (the Broken Binding edition and the
// Waterstones Exclusive Edition, Maurice 2026-10-12) to pages/home-slider.html, right after the Walmart slide,
// and widens the slider from 8 slides to 9. Safe to run once; it stops if the slide is already there.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const F = join(ROOT, 'pages/home-slider.html');
const IMG = 'https://africhmaurice.github.io/site/assets/img/';
let h = readFileSync(F, 'utf8');
if (h.includes('SLIDE SE : SPECIAL EDITIONS')) { console.log('already there'); process.exit(0); }

function swap(a, b, n = 1) {
  const c = h.split(a).length - 1;
  if (c !== n) throw new Error(`expected ${n} of ${a.slice(0, 60)}, found ${c}`);
  h = h.split(a).join(b);
}
const btn = (href, text) => `<a href="${href}" target="_blank" rel="noopener" style="display:inline-block;background:#132e15;border:1px solid #f3ead9;box-shadow:0.22cqw 0.26cqw 0 rgba(0,0,0,.35);color:#fff;font-weight:800;font-size:1.2cqw;letter-spacing:.05em;padding:0.83cqw 1.8cqw;text-decoration:none;text-align:center" class="hv2">${text}</a>`;

const slide = `    <!-- SLIDE SE : SPECIAL EDITIONS (Broken Binding + Waterstones Exclusive, 2026-10-12; copy is DRAFT) -->
    <div data-screen-label="SE" style="flex:0 0 11.1111%;height:100%;background:linear-gradient(rgba(26,94,65,.80),rgba(15,58,39,.86)),url(${IMG}ef80affe30140e01.jpg) center/cover;position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;justify-items:center;column-gap:2.25cqw;padding:2.25cqw 4cqw;box-sizing:border-box;overflow:hidden">
      <img loading="lazy" decoding="async" src="${IMG}special-broken-binding.webp" alt="The Broken Binding special edition of Cello's Gate, with digital edges" style="height:30cqw;width:auto;max-width:100%;flex:none;filter:drop-shadow(0.75cqw 0.9cqw 1.2cqw rgba(0,0,0,.45))">
      <div style="text-align:center;max-width:40cqw;position:relative">
        <div style="font-family:'Almarai',sans-serif;font-weight:800;color:#a2f590;font-size:1.15cqw;letter-spacing:.18em;margin-bottom:1.2cqw;text-shadow:0 .15cqw .35cqw rgba(0,0,0,.45)">NEW SPECIAL EDITIONS</div>
        <div style="font-family:'Cinzel',serif;font-weight:900;color:#fff;font-size:3.4cqw;line-height:1.35;text-shadow:0 0.19cqw 0.38cqw rgba(0,0,0,.5)">Two New Special Editions of &ldquo;Cello&rsquo;s Gate!&rdquo;</div>
        <p style="color:#fff;font-size:1.31cqw;line-height:1.55;margin:1.35cqw 0 0;text-shadow:0 0.08cqw 0.22cqw rgba(0,0,0,.35)">The Broken Binding edition is signed, with foil on the boards and digital edges. The Waterstones Exclusive Edition has a sprayed edge and special endpapers.</p>
        <div style="display:inline-flex;flex-direction:column;align-items:stretch;gap:1.2cqw;margin-top:1.95cqw">
          ${btn('https://thebrokenbindingsub.com/products/cellos-gate', 'THE BROKEN BINDING')}
          ${btn('https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399766227', 'WATERSTONES EXCLUSIVE')}
        </div>
      </div>
      <img loading="lazy" decoding="async" src="${IMG}special-waterstones.webp" alt="The Waterstones Exclusive Edition of Cello's Gate, with a sprayed edge" style="height:30cqw;width:auto;max-width:100%;flex:none;filter:drop-shadow(0.75cqw 0.9cqw 1.2cqw rgba(0,0,0,.45))">
    </div>

`;
swap('    <!-- SLIDE 4 : DISCORD -->', slide + '    <!-- SLIDE 4 : DISCORD -->');
swap('flex:0 0 12.5%', 'flex:0 0 11.1111%', 8);
swap('#ma-track{display:flex;width:800%;', '#ma-track{display:flex;width:900%;');
swap('maI=(n+8)%8;', 'maI=(n+9)%9;');
swap('(maI*100/8)', '(maI*100/9)');
const lastDot = h.match(/<div class="ma-dot" onclick="maGo\(7\)"[^>]*><\/div>/);
if (!lastDot) throw new Error('last dot not found');
h = h.replace(lastDot[0], lastDot[0] + '\n      <div class="ma-dot" onclick="maGo(8)" role="button" aria-label="Slide 9"></div>');
writeFileSync(F, h);
console.log('special editions slide added: 9 slides');
