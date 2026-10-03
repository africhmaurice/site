// node tools/aura-spectrum.mjs : builds pages/aura-spectrum.html, The Oracle's Gift: Aura Color Spectrum.
// The colors and words come straight from Maurice's chart (Desktop/Writing/Novels/The Sky Pirates of Imperia/
// 0 - Oracle Magic - Aura Spectrum HTML.html, made 2026-03-10) and are never changed. Everything around them
// follows the site: dark violet over the nebula (parallax), Atomic Marker headings, Almarai body, 0px corners.
// It is the Act Two crew reward at 80,000 points: locked until the leaderboard's Act Two total gets there.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(homedir(), 'OneDrive/Desktop/Writing/Novels/The Sky Pirates of Imperia/0 - Oracle Magic - Aura Spectrum HTML.html');
const line = readFileSync(SRC, 'utf8').split('\n').find((l) => l.startsWith('const colorData = '));
const COLORS = JSON.parse(line.replace(/^const colorData = /, '').replace(/;\s*$/, ''));
const GOAL = 80000;
// Added words (tools/aura-additions.json) go after his, never in two colors and never repeating one of his.
const ADD = JSON.parse(readFileSync(join(ROOT, 'tools/aura-additions.json'), 'utf8'));
const owner = new Map();
for (const c of COLORS) for (const w of c.words) owner.set(w.toLowerCase(), c.name);
let added = 0;
for (const c of COLORS) for (const w of ADD[c.name] || []) {
  const k = w.toLowerCase();
  if (owner.has(k)) { if (owner.get(k) !== c.name) console.log(`  skipped "${w}" for ${c.name}: already in ${owner.get(k)}`); continue; }
  owner.set(k, c.name); c.words.push(w); added++;
}

const page = `<!-- ============================================================
     THE ORACLE'S GIFT: AURA COLOR SPECTRUM. BUILT by tools/aura-spectrum.mjs; edit that, not this.
     The Act Two crew reward at ${GOAL.toLocaleString('en-US')} points (?preview shows it early).
     ============================================================ -->
<style>
#ma-aura{width:100vw;position:relative;left:50%;margin-left:-50vw;overflow:hidden;clip-path:inset(0);background:#1a0f33;font-family:'Almarai',sans-serif;color:#fffffe;box-sizing:border-box;padding:clamp(56px,8vw,96px) 16px clamp(64px,8vw,104px);isolation:isolate}
#ma-aura *{box-sizing:border-box;border-radius:0}
#ma-aura .au-grid,#ma-aura .au-head,#ma-aura .au-lock{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#ma-aura .au-search input{-webkit-user-select:text;user-select:text}
.au-sky{position:fixed;left:0;right:0;top:0;height:100vh;z-index:-2;background:url('https://africhmaurice.github.io/site/assets/bg/nebula-glow-as332921866.webp') center/cover no-repeat}
.au-wash{position:fixed;inset:0;z-index:-1;background:rgba(26,15,51,.9)}
#ma-aura .au-in{max-width:1200px;margin:0 auto}
#ma-aura .au-head{display:grid;gap:14px;text-align:center;margin:0 0 clamp(28px,4vw,40px)}
#ma-aura .au-eyebrow{margin:0;font-weight:800;font-size:13px;line-height:1.3;letter-spacing:.2em;text-transform:uppercase;color:#a2f590}
#ma-aura .au-title{margin:0;font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:clamp(40px,7vw,84px);line-height:1.2;letter-spacing:.03em;color:#fffffe;text-wrap:balance}
#ma-aura .au-search{position:relative;width:100%;max-width:460px;margin:8px auto 0}
#ma-aura .au-search svg{position:absolute;left:16px;top:50%;width:18px;height:18px;transform:translateY(-50%);pointer-events:none;stroke:#c3a6ff}
#ma-aura .au-search input{width:100%;padding:14px 46px;border:2px solid #9e74fd;background:rgba(26,15,51,.75);color:#fffffe;font-family:'Almarai',sans-serif;font-size:16px;font-weight:700;letter-spacing:.02em;outline:none;transition:border-color .2s ease,background .2s ease}
#ma-aura .au-search input::placeholder{color:rgba(255,255,254,.5);font-weight:400}
#ma-aura .au-search input:focus{border-color:#a2f590;background:rgba(26,15,51,.92)}
#ma-aura .au-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:none;width:34px;height:34px;border:0;background:none;color:#c3a6ff;font-size:24px;line-height:1;cursor:pointer}
#ma-aura .au-clear:hover{color:#fffffe}
#ma-aura .au-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
#ma-aura .au-card{position:relative;overflow:hidden;padding:clamp(28px,4vw,48px);border:2px solid rgba(255,255,254,.14);box-shadow:0 6px 26px rgba(0,0,0,.35);transition:transform .2s ease,box-shadow .2s ease}
#ma-aura .au-card:hover{transform:translateY(-3px);box-shadow:0 12px 34px rgba(0,0,0,.45)}
#ma-aura .au-card h2,#ma-aura .au-card p,#ma-aura .au-card span{color:inherit!important}
#ma-aura .au-title,#ma-aura .au-lock p{color:#fffffe!important}
#ma-aura .au-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 20% 10%,rgba(255,255,255,.12) 0%,transparent 60%);pointer-events:none}
#ma-aura .au-root{position:relative;margin:0 0 6px;font-weight:800;font-size:14px;letter-spacing:.18em;text-transform:uppercase;opacity:.62}
#ma-aura .au-name{position:relative;margin:0 0 14px;font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:clamp(40px,5.6vw,66px);line-height:1.2;letter-spacing:.03em;overflow-wrap:anywhere}
#ma-aura .au-words{position:relative;margin:0;font-size:17px;line-height:2}
#ma-aura .au-word{opacity:.9;white-space:nowrap}
#ma-aura .au-dot{opacity:.4}
#ma-aura mark{background:rgba(255,255,255,.3);color:inherit;font-weight:800;padding:0;box-shadow:0 0 0 2px rgba(255,255,255,.3)}
#ma-aura .au-none{grid-column:1/-1;text-align:center;padding:72px 20px;font-family:'Atomic Marker',Impact,sans-serif;font-size:clamp(26px,4vw,36px);line-height:1.2;letter-spacing:.03em;color:rgba(255,255,254,.45)}
#ma-aura .au-lock{max-width:720px;margin:0 auto;display:grid;gap:16px;text-align:center;background:rgba(26,15,51,.82);border:3px solid #9e74fd;padding:clamp(28px,5vw,48px) clamp(20px,4vw,40px)}
#ma-aura .au-lock h2{margin:0;font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:clamp(34px,5vw,54px);line-height:1.2;letter-spacing:.03em;color:#a2f590}
#ma-aura .au-lock p{margin:0;font-size:clamp(16px,2vw,19px);line-height:1.6}
#ma-aura .au-bar{height:18px;background:rgba(255,255,254,.14);border:2px solid #fffffe}
#ma-aura .au-bar i{display:block;height:100%;width:0;background:#a2f590;transition:width 1.2s ease}
#ma-aura .au-left{font-weight:700;letter-spacing:.06em;color:#c3a6ff}
#ma-aura [hidden]{display:none!important}
@media (max-width:760px){#ma-aura .au-grid{grid-template-columns:1fr}#ma-aura .au-words{font-size:16px}}
@media (prefers-reduced-motion:reduce){#ma-aura .au-card,#ma-aura .au-bar i{transition:none}}
</style>
<section id="ma-aura" aria-labelledby="au-title">
  <div class="au-sky" aria-hidden="true"></div><div class="au-wash" aria-hidden="true"></div>
  <div class="au-in">
    <header class="au-head">
      <p class="au-eyebrow">The Oracle's Gift</p>
      <h1 class="au-title" id="au-title">Aura Color Spectrum</h1>
    </header>
    <div class="au-lock" id="au-lock" hidden>
      <h2>Unlocks at ${GOAL.toLocaleString('en-US')}</h2>
      <p>This is a crew reward. It opens for everyone when the crew reaches ${GOAL.toLocaleString('en-US')} Act Two points.</p>
      <div class="au-bar" aria-hidden="true"><i id="au-fill"></i></div>
      <p class="au-left" id="au-left"></p>
    </div>
    <div id="au-open" hidden>
      <div class="au-head">
        <div class="au-search">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5L21 21"></path></svg>
          <input type="text" id="au-q" placeholder="Search any emotion, feeling, or vibe..." aria-label="Search the aura colors" autocomplete="off" spellcheck="false">
          <button type="button" class="au-clear" id="au-clear" aria-label="Clear the search">&times;</button>
        </div>
      </div>
      <div class="au-grid" id="au-grid"></div>
    </div>
  </div>
</section>
<script>
(function () {
  var root = document.getElementById('ma-aura'); if (!root) return;
  var GOAL = ${GOAL};
  // The sky covers the whole Squarespace section, its top and bottom margins included: the section takes the
  // dark violet, its own background and the block boxes inside it go clear, and the sky layers move into it.
  var sec = root.parentElement && root.parentElement.closest('section');
  if (sec) {
    sec.style.setProperty('background', '#1a0f33', 'important'); sec.style.position = 'relative'; sec.style.isolation = 'isolate'; sec.style.clipPath = 'inset(0)';
    var clear = sec.querySelectorAll('.section-border, .section-background, .section-background-overlay, .fe-block, .sqs-block, .sqs-block-content, .sqs-block-code');
    for (var ci = 0; ci < clear.length; ci++) clear[ci].style.setProperty('background', 'transparent', 'important');
    root.style.setProperty('background', 'transparent', 'important'); root.style.clipPath = 'none';
    // The page under the section (a short page on a tall screen) shows the same washed galaxy, never red, and the
    // menu bar keeps the dark violet once it shrinks on scroll instead of turning red.
    document.body.style.setProperty('background', "linear-gradient(rgba(26,15,51,.9),rgba(26,15,51,.9)), url('https://africhmaurice.github.io/site/assets/bg/nebula-glow-as332921866.webp') center/cover fixed #1a0f33", 'important');
    var hs = document.createElement('style');
    hs.textContent = 'header#header.shrink,header#header.shrink .header-background{background-color:rgba(26,15,51,.96)!important}';
    document.head.appendChild(hs);
    var layers = root.querySelectorAll('.au-sky, .au-wash');
    for (var li = layers.length - 1; li >= 0; li--) sec.insertBefore(layers[li], sec.firstChild);
  }
  var span = sec || root;
  // Maurice's aura colors, exactly as he made them.
  var COLORS = ${JSON.stringify(COLORS)};
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function mark(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q); if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function render() {
    var q = $('au-q').value.trim().toLowerCase(), words = 0, shown = 0, html = '';
    COLORS.forEach(function (c) {
      var hit = !q || c.name.toLowerCase().indexOf(q) >= 0;
      var list = q ? c.words.filter(function (w) { return w.toLowerCase().indexOf(q) >= 0; }) : c.words;
      if (q && !hit && !list.length) return;
      if (q && hit && !list.length) list = c.words;
      shown++; words += list.length;
      html += '<article class="au-card" style="background:linear-gradient(180deg,' + c.hex + ' 0%,' + c.hex2 + ' 100%);color:' + c.tc + '">' +
        '<div class="au-glow"></div><p class="au-root">' + esc(c.root) + '</p>' +
        '<h2 class="au-name"' + (c.tc === '#ffffff' ? ' style="text-shadow:0 1px 4px rgba(0,0,0,.3)"' : '') + '>' + mark(c.name.toUpperCase(), q) + '</h2>' +
        '<p class="au-words">' + list.map(function (w, i) { return '<span class="au-word">' + mark(w, q) + (i < list.length - 1 ? '<span class="au-dot">&nbsp;&middot;</span>' : '') + '</span>'; }).join(' ') + '</p></article>';
    });
    $('au-grid').innerHTML = html || '<div class="au-none">No colors match that one</div>';
    $('au-clear').style.display = q ? 'block' : 'none';
  }
  // A crew reward to look at, not to take: no right-click or long-press menu, no dragging, no copying the words.
  ['contextmenu', 'dragstart', 'copy', 'cut'].forEach(function (ev) {
    root.addEventListener(ev, function (e) { if (e.target && e.target.id === 'au-q') return; e.preventDefault(); });
  });
  $('au-q').addEventListener('input', render);
  $('au-clear').addEventListener('click', function () { $('au-q').value = ''; render(); $('au-q').focus(); });
  // Fixed parallax: the galaxy holds still behind the screen while the page scrolls over it (a fixed layer,
  // clipped to this section, so it also works on phones where background-attachment: fixed does not).
  function open() { $('au-lock').hidden = true; $('au-open').hidden = false; render(); }
  function locked(n) {
    $('au-lock').hidden = false; $('au-open').hidden = true;
    requestAnimationFrame(function () { $('au-fill').style.width = Math.min(100, n / GOAL * 100) + '%'; });
    $('au-left').textContent = 'The crew is at ' + n.toLocaleString('en-US') + ' Act Two points. ' + Math.max(0, GOAL - n).toLocaleString('en-US') + ' to go!';
  }
  if (/[?&]preview(&|$)/.test(location.search)) return open();
  fetch('https://africhmaurice.github.io/leaderboard/leaderboard.json?t=' + Math.floor(Date.now() / 300000)).then(function (r) { return r.json(); })
    .then(function (d) { var n = +((d.acts || {}).two) || 0; if (n >= GOAL) open(); else locked(n); })
    .catch(function () { locked(0); $('au-left').textContent = 'Check back soon!'; });
})();
</script>
`;
writeFileSync(join(ROOT, 'pages/aura-spectrum.html'), page);
console.log(`pages/aura-spectrum.html: ${COLORS.length} colors, ${COLORS.reduce((n, c) => n + c.words.length, 0)} words, ${added} added (${(page.length / 1024).toFixed(0)} KB)`);
