// node tools/screenrant-slide.mjs : adds the Screen Rant slide (the exclusive excerpt, Maurice 2026-10-30) to
// pages/home-slider.html as the first slide, and widens the slider from 10 slides to 11. Safe to run once; it stops
// if the slide is already there.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const F = join(ROOT, 'pages/home-slider.html');
const IMG = 'https://africhmaurice.github.io/site/assets/img/';
const BG = 'https://africhmaurice.github.io/site/assets/bg/';
const URL = 'https://screenrant.com/exclusive-excerpt-preview-cellos-gate-maruice-africh/';
let h = readFileSync(F, 'utf8');
if (h.includes('SLIDE SR : SCREEN RANT')) { console.log('already there'); process.exit(0); }

function swap(a, b, n = 1) {
  const c = h.split(a).length - 1;
  if (c !== n) throw new Error(`expected ${n} of ${a.slice(0, 60)}, found ${c}`);
  h = h.split(a).join(b);
}

const slide = `    <!-- SLIDE SR : SCREEN RANT EXCLUSIVE EXCERPT (Maurice, 2026-10-30; copy is DRAFT) -->
    <div data-screen-label="SR" style="flex:0 0 9.0909%;height:100%;background:linear-gradient(rgba(11,23,15,.84),rgba(11,23,15,.92)),url(${BG}floating-blocks-city-as311317794.webp) center/cover;display:flex;align-items:center;justify-content:center;gap:4cqw;padding:2.25cqw 6cqw;box-sizing:border-box">
      <img loading="lazy" decoding="async" src="${IMG}679b434d86628027.webp" alt="Cello's Gate hardcover, featured on Screen Rant" style="width:24cqw;height:auto;flex:none;filter:drop-shadow(0.75cqw 0.9cqw 1.2cqw rgba(0,0,0,.45))">
      <div style="text-align:center;max-width:46cqw">
        <div style="font-family:'Almarai',sans-serif;font-weight:800;color:#a2f590;font-size:1.15cqw;letter-spacing:.18em;margin-bottom:1.4cqw;text-shadow:0 .15cqw .35cqw rgba(0,0,0,.45)">SCREEN RANT EXCLUSIVE</div>
        <div style="font-family:'Cracked Imperia',sans-serif;font-weight:700;text-transform:uppercase;color:#fffffe;font-size:4.6cqw;line-height:1.05;letter-spacing:.03em">Read a Sneak Peek of Cello&rsquo;s Gate!</div>
        <p style="color:#fff;font-style:italic;font-size:1.42cqw;line-height:1.55;margin:1.65cqw 0 0;text-shadow:0 0.08cqw 0.22cqw rgba(0,0,0,.35)">&ldquo;Blending witty and poetic prose, Africh&rsquo;s debut is a must-read.&rdquo;</p>
        <div style="font-family:'Almarai',sans-serif;font-weight:800;color:#fff;font-size:1.1cqw;letter-spacing:.12em;margin-top:1.2cqw">&mdash; SCREEN RANT</div>
        <a href="${URL}" target="_blank" rel="noopener" style="display:inline-block;margin-top:2.1cqw;background:#c1330a;border:1px solid #f3ead9;box-shadow:0.22cqw 0.26cqw 0 rgba(0,0,0,.35);color:#fff;font-weight:800;font-size:1.2cqw;letter-spacing:.05em;padding:0.83cqw 3cqw;text-decoration:none" class="hv0">READ THE EXCERPT!</a>
      </div>
    </div>

`;
// Phone: the book on top, the words under it.
const phone = `  /* Screen Rant slide: the book on top, the words under it */
  #ma-track>div[data-screen-label="SR"]>div{max-width:100% !important}
  #ma-track>div[data-screen-label="SR"] img{width:34cqw !important}
  #ma-track>div[data-screen-label="SR"] [style*="Cracked Imperia"]{font-size:9.4cqw !important}
  #ma-track>div[data-screen-label="SR"] div[style*="letter-spacing:.12em"]{font-size:2.6cqw !important;margin-top:3cqw !important}
  #ma-track>div[data-screen-label="SR"] p[style*="italic"]{font-size:3.6cqw !important}
`;
swap('    <!-- SLIDE SE : SPECIAL EDITIONS', slide + '    <!-- SLIDE SE : SPECIAL EDITIONS');
swap('  /* Sky Pirate Quiz slide:', phone + '  /* Sky Pirate Quiz slide:');
swap('flex:0 0 10%', 'flex:0 0 9.0909%', 10);
swap('#ma-track{display:flex;width:1000%;', '#ma-track{display:flex;width:1100%;');
swap('maI=(n+10)%10;', 'maI=(n+11)%11;');
swap('(maI*100/10)', '(maI*100/11)');
const lastDot = h.match(/<div class="ma-dot" onclick="maGo\(9\)"[^>]*><\/div>/);
if (!lastDot) throw new Error('last dot not found');
h = h.replace(lastDot[0], lastDot[0] + '\n    <div class="ma-dot" onclick="maGo(10)" role="button" aria-label="Slide 11"></div>');
writeFileSync(F, h);
console.log('screen rant slide added: 11 slides');
