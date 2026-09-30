// "Act Two has begun" slide for the home page slider (Maurice, 2026-09-30), first in the rotation.
//   node tools/act-two-slide.mjs          writes pages/home-slider-next.html + preview/home-next.html (preview)
//   node tools/act-two-slide.mjs --live   patches pages/home-slider.html itself
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = process.argv.includes('--live');
let h = readFileSync(join(ROOT, 'pages/home-slider.html'), 'utf8');
if (h.includes('SLIDE A2')) throw new Error('the Act Two slide is already in pages/home-slider.html');
const swap = (a, b, n = 1) => { const c = h.split(a).length - 1; if (c !== n) throw new Error(`expected ${n} of "${a}", found ${c}`); h = h.split(a).join(b); };

const slide = `    <!-- SLIDE A2 : ACT TWO HAS BEGUN -->
    <div data-screen-label="A2" style="flex:0 0 14.2857%;height:100%;background:linear-gradient(rgba(26,94,65,.84),rgba(16,62,41,.9)),url(https://africhmaurice.github.io/site/assets/bg/floating-blocks-city-as311317794.webp) center/cover;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3cqw 9cqw;box-sizing:border-box">
      <div style="font-family:'Almarai',sans-serif;font-weight:800;color:#89fbcb;font-size:1.15cqw;letter-spacing:.18em;margin-bottom:1cqw;text-shadow:0 .15cqw .35cqw rgba(0,0,0,.45)">THE TREASURE HUNT &bull; OCTOBER 1<sup style="font-size:.6em">ST</sup> &ndash; 15<sup style="font-size:.6em">TH</sup></div>
      <div style="font-family:'Atomic Marker',cursive;color:#fff;font-size:5.4cqw;line-height:1;text-shadow:0 0.22cqw 0.45cqw rgba(0,0,0,.25)">ACT TWO HAS BEGUN!</div>
      <p style="color:#fff;font-weight:800;font-size:1.42cqw;line-height:1.55;margin:1.65cqw 0 0;max-width:42cqw;text-shadow:0 0.08cqw 0.22cqw rgba(0,0,0,.35)">New rewards to unlock and a brand-new sweepstakes! Five sky pirates will win a signed Deluxe Edition and a signed Walmart Special Edition of Cello&rsquo;s Gate, plus three Kickstarter foil bookmarks.</p>
      <p style="color:#fff;font-style:italic;font-size:1.01cqw;line-height:1.6;margin:1.8cqw 0 0;max-width:37.5cqw;text-shadow:0 0.08cqw 0.22cqw rgba(0,0,0,.35)">*Sweepstakes open to U.S. residents. A UK prize draw is coming soon. See the Official Rules.</p>
      <a href="https://www.mauriceafrich.com/the-hunt" style="display:inline-block;margin-top:2.25cqw;background:#c1330a;border:1px solid #f3ead9;box-shadow:0.22cqw 0.26cqw 0 rgba(0,0,0,.35);color:#fff;font-weight:800;font-size:1.2cqw;letter-spacing:.04em;padding:0.83cqw 2.55cqw;text-decoration:none" class="hv0">JOIN ACT TWO!</a>
    </div>

`;
swap('    <!-- SLIDE 0 ', slide + '    <!-- SLIDE 0 ');
swap('flex:0 0 16.6667%', 'flex:0 0 14.2857%', 6);
swap('#ma-track{display:flex;width:600%;', '#ma-track{display:flex;width:700%;');
swap('(n+6)%6', '(n+7)%7');
swap('100/6', '100/7');
// One more dot for the seventh slide.
const lastDot = h.match(/<div class="ma-dot" onclick="maGo\(5\)"[^>]*><\/div>/);
if (!lastDot) throw new Error('last dot not found');
h = h.replace(lastDot[0], lastDot[0] + '\n      <div class="ma-dot" onclick="maGo(6)" role="button" aria-label="Slide 7"></div>');

writeFileSync(join(ROOT, LIVE ? 'pages/home-slider.html' : 'pages/home-slider-next.html'), h);
if (!LIVE) {
  let p = readFileSync(join(ROOT, 'preview/home.html'), 'utf8');
  if (!p.includes('data-ma-page="home-slider"')) throw new Error('slider block not found in preview/home.html');
  writeFileSync(join(ROOT, 'preview/home-next.html'), p.replace('data-ma-page="home-slider"', 'data-ma-page="home-slider-next"'));
}
console.log(LIVE ? 'patched pages/home-slider.html' : 'wrote pages/home-slider-next.html and preview/home-next.html');
