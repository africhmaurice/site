// node tools/links.mjs : builds pages/links.html, the link page at mauriceafrich.com/links, from tools/links.json.
// Cello's Gate up top with the socials floating over the background, the Copper Loot Box, three big tiles, then
// every section open as a grid of tiles (a logo or a title over art, under the section's brand color). Every visit
// and tap is counted (anonymous) in the hunt sheet's "Link Clicks" tab through the Loot Boxes web app;
// node tools/links-stats.mjs shows the totals.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const D = JSON.parse(readFileSync(join(ROOT, 'tools/links.json'), 'utf8'));
const BASE = 'https://africhmaurice.github.io/site/';
const ENDPOINT = 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ext = (u) => /^mailto:/.test(u) ? '' : ' target="_blank" rel="noopener"';
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg>';

// a file in assets/links/ ('../img/x' reaches the other asset folders); a background is a site backdrop by name
// (the loader picks the phone or desktop copy) or an art file in assets/links/
const asset = (f) => BASE + (f.startsWith('../') ? 'assets/' + f.slice(3) : 'assets/links/' + f);
const bgUrl = (b) => /\.(jpe?g|png|webp)$/.test(b) ? asset(b) : BASE + 'assets/bg/' + b + '.webp';
const lazy = ' loading="lazy" decoding="async"';

const socials = D.socials.map((s) => `<a class="lk-soc" href="${esc(s.url)}"${ext(s.url)} data-link="${s.id}" data-section="socials" aria-label="${esc(s.label)}" title="${esc(s.label)}"><img src="${asset(s.icon)}" alt=""></a>`).join('');
const C = D.copper;
const copperCard = `<a class="lk-copper" href="${esc(C.url)}" data-link="${C.id}" data-section="top"><img src="${asset(C.img)}" alt="" width="360" height="360"><span><b>${esc(C.label)}</b><small>${esc(C.sub)}</small></span>${arrow}</a>`;

// the art behind a tile and its brand-color wash
const backing = (bg, tone) => `<span class="lk-bgimg" style="background-image:url('${bgUrl(bg)}')"></span><span class="lk-ov lk-ov-${tone}"></span>`;
const feature = D.feature.map((f) => {
  const inner = (f.img ? `<img class="lk-fimg" src="${asset(f.img)}" alt="">` : '') + `<span class="lk-flabel">${esc(f.label)}</span>`;
  const attrs = `class="lk-tile lk-feat${f.img ? '' : ' lk-feat-text'}" data-link="${f.id}" data-section="buttons" aria-label="${esc(f.label)}"`;
  const body = `${backing(f.bg, f.tone)}<span class="lk-tin">${inner}</span>`;
  return f.open ? `<button type="button" ${attrs} data-open="${f.open}">${body}</button>` : `<a href="${esc(f.url)}"${ext(f.url)} ${attrs}>${body}</a>`;
}).join('');
function tile(l, s) {
  const inner = l.logo
    ? `<img class="lk-logo" src="${asset(l.logo)}" alt="${esc(l.label)}"${lazy}>` + (l.note ? `<span class="lk-note">${esc(l.note)}</span>` : '')
    : `<span class="lk-name">${esc(l.label)}</span>`;
  return `<a class="lk-tile" href="${esc(l.url)}"${ext(l.url)} data-link="${l.id}" data-section="${s.id}" aria-label="${esc(l.label)}" title="${esc(l.label)}">${backing(l.bg, s.tone)}<span class="lk-tin">${inner}</span></a>`;
}
const promo = (l, s) => `<a class="lk-promo" href="${esc(l.url)}"${ext(l.url)} data-link="${l.id}" data-section="${s.id}" aria-label="${esc(l.label)}" title="${esc(l.label)}"><img src="${asset(l.promo)}" alt="${esc(l.label)}"${lazy}></a>`;
const sections = D.sections.map((s) => `<section class="lk-sec" id="lk-${s.id}"><h2 class="lk-h">${esc(s.title)}</h2>`
  + (s.badge ? `<img class="lk-badge" src="${asset(s.badge)}" alt=""${lazy}>` : '')
  + `<div class="lk-grid lk-${s.layout || 'three'}">${s.links.map((l) => tile(l, s)).join('')}</div>`
  + (s.promo ? promo(s.promo, s) : '') + '</section>').join('\n');
// the newsletter signup posts straight to the Kit form the /newsletter page uses
const N = D.newsletter;
const signup = `<form class="lk-news" data-kit="${N.form}" novalidate><h2 class="lk-h">${esc(N.title)}</h2>
      <div class="lk-nrow"><input type="text" name="fields[first_name]" placeholder="First Name" aria-label="First Name" autocomplete="given-name"><input type="email" name="email_address" placeholder="Email Address" aria-label="Email Address" autocomplete="email" required><button type="submit">${esc(N.button)}</button></div>
      <p class="lk-nmsg" role="status" hidden></p></form>`;

const page = `<!-- ============================================================
     THE LINK PAGE (mauriceafrich.com/links). BUILT by tools/links.mjs from tools/links.json; edit those, not this.
     ============================================================ -->
<style>
#ma-links{--ink:#0b170f;--ink7:#213226;--moss:#607667;--green:#a2f590;--green7:#2c6021;--teal:#268e62;--scarlet:#c53200;--violet:#482d85;--parch:#fffffe;
  --ov-scarlet:rgba(197,50,0,.75);--ov-green:rgba(44,96,33,.75);--ov-violet:rgba(72,45,133,.75);--ov-teal:rgba(38,142,98,.75);--ov-ink:rgba(11,23,15,.78);
  width:100vw;position:relative;left:50%;margin-left:-50vw;min-height:100vh;box-sizing:border-box;padding:40px 16px 56px;font-family:'Almarai',sans-serif;color:var(--parch);isolation:isolate;overflow:hidden}
#ma-links *{box-sizing:border-box;border-radius:0}
#ma-links [hidden]{display:none!important}
#ma-links .lk-sky{position:fixed;inset:0;z-index:-2;background:url('${BASE}assets/bg/garden-city-towers.webp') center/cover no-repeat}
#ma-links .lk-wash{position:fixed;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(11,23,15,.84),rgba(11,23,15,.92) 40%,rgba(11,23,15,.95))}
#ma-links .lk-in{max-width:620px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
#ma-links .lk-top{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px}
#ma-links .lk-cover{display:block;width:min(64vw,250px);height:auto;margin:0 auto -4px;filter:drop-shadow(0 14px 22px rgba(0,0,0,.55))}
#ma-links h1{margin:0;font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:clamp(44px,12vw,64px);line-height:1.2;letter-spacing:.03em;color:var(--parch)!important}
#ma-links .lk-line{margin:0;font-weight:800;font-size:clamp(15px,4.2vw,18px);line-height:1.45;letter-spacing:.02em;color:var(--parch)!important}
#ma-links .lk-line + .lk-line{color:var(--green)!important;margin-top:-6px}
#ma-links .lk-socs{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;margin-top:6px}
#ma-links .lk-soc{width:36px;height:36px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,.6));transition:transform .15s ease}
#ma-links .lk-soc img{display:block;max-width:26px;max-height:26px;width:auto;height:auto}
#ma-links .lk-soc:hover{transform:scale(1.15)}
#ma-links .lk-copper{display:flex;align-items:center;gap:16px;padding:14px 18px 14px 12px;border:2px solid #fd7547;background:linear-gradient(90deg,rgba(145,37,1,.94),rgba(197,50,0,.9));color:var(--parch)!important;text-decoration:none!important;transition:transform .15s ease}
#ma-links .lk-copper img{flex:none;width:78px;height:78px;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))}
#ma-links .lk-copper span{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
#ma-links .lk-copper b{font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:clamp(18px,5vw,22px);line-height:1.2;letter-spacing:.03em}
#ma-links .lk-copper small{font-weight:700;font-size:14px;line-height:1.4;opacity:.92}
#ma-links .lk-copper svg{flex:none;width:20px;height:20px}
#ma-links .lk-copper:hover{transform:scale(1.03)}
#ma-links .lk-feats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#ma-links .lk-secs{display:flex;flex-direction:column;gap:30px;margin-top:8px}
#ma-links .lk-sec{display:flex;flex-direction:column;gap:12px}
#ma-links .lk-h{margin:0;font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:28px;line-height:1.2;letter-spacing:.03em;color:var(--parch)!important;text-align:center;text-wrap:balance}
#ma-links .lk-badge{display:block;width:110px;height:110px;margin:0 auto;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
#ma-links .lk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
@media (min-width:520px){#ma-links .lk-three{grid-template-columns:repeat(3,minmax(0,1fr))}#ma-links .lk-four{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (min-width:520px){#ma-links .lk-two>.lk-tile{aspect-ratio:3/2}}
#ma-links .lk-five{display:flex;flex-wrap:wrap;justify-content:center}
#ma-links .lk-five>.lk-tile{flex:0 0 calc((100% - 16px)/3)}
@media (min-width:520px){#ma-links .lk-five>.lk-tile{flex-basis:calc((100% - 32px)/5)}}
#ma-links .lk-tile{position:relative;display:block;width:100%;aspect-ratio:1;max-width:100%;overflow:hidden;padding:0;margin:0;border:1px solid rgba(255,255,254,.16);background:none;font:inherit;color:var(--parch)!important;text-decoration:none!important;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}
#ma-links .lk-tile:hover{transform:scale(1.04);z-index:2;box-shadow:0 10px 24px rgba(0,0,0,.5)}
#ma-links .lk-bgimg,#ma-links .lk-ov,#ma-links .lk-tin{position:absolute;inset:0}
#ma-links .lk-bgimg{background-size:cover;background-position:center}
#ma-links .lk-ov-scarlet{background:var(--ov-scarlet)}#ma-links .lk-ov-green{background:var(--ov-green)}#ma-links .lk-ov-violet{background:var(--ov-violet)}#ma-links .lk-ov-teal{background:var(--ov-teal)}#ma-links .lk-ov-ink{background:var(--ov-ink)}
#ma-links .lk-tin{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;text-align:center}
#ma-links .lk-logo{display:block;max-width:68%;max-height:44%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45))}
#ma-links .lk-five .lk-logo{max-width:56%;max-height:40%}
#ma-links .lk-five .lk-note{font-size:clamp(9px,2.6vw,11px);letter-spacing:.04em}
#ma-links .lk-two .lk-note{font-size:clamp(10px,2.6vw,12px);letter-spacing:.02em}
#ma-links .lk-note{max-width:100%;overflow-wrap:normal;word-break:normal;hyphens:none;font-weight:800;font-size:12px;line-height:1.3;letter-spacing:.1em;text-transform:uppercase;text-wrap:balance}
#ma-links .lk-name{max-width:100%;font-weight:800;font-size:clamp(13px,3.8vw,16px);line-height:1.3;letter-spacing:.08em;text-transform:uppercase;text-wrap:balance;text-shadow:0 2px 8px rgba(0,0,0,.45)}
#ma-links .lk-feat{aspect-ratio:3/4}
@media (min-width:520px){#ma-links .lk-feat{aspect-ratio:1}}
#ma-links .lk-feat .lk-tin{justify-content:flex-end;gap:8px;padding:10px}
#ma-links .lk-feat-text .lk-tin{justify-content:center}
#ma-links .lk-fimg{display:block;flex:1;min-height:0;max-width:92%;width:auto;object-fit:contain;filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))}
#ma-links .lk-flabel{font-weight:800;font-size:clamp(11px,3.3vw,15px);line-height:1.3;letter-spacing:.06em;text-transform:uppercase;text-wrap:balance;text-shadow:0 2px 8px rgba(0,0,0,.55)}
#ma-links .lk-feat-text .lk-flabel{font-size:clamp(13px,4vw,18px)}
/* phones: the three big tiles stack as wide rows, picture beside the words */
@media (max-width:519px){
  #ma-links .lk-feats{grid-template-columns:1fr;gap:10px}
  #ma-links .lk-feat{aspect-ratio:auto;height:128px}
  #ma-links .lk-feat .lk-tin,#ma-links .lk-feat-text .lk-tin{flex-direction:row;justify-content:center;gap:20px;padding:24px 40px}
  #ma-links .lk-fimg{flex:none;height:100%;max-width:36%}
  #ma-links .lk-flabel,#ma-links .lk-feat-text .lk-flabel{font-size:clamp(12px,3.7vw,17px);text-align:left;white-space:nowrap;letter-spacing:.04em}
  #ma-links .lk-feat-text .lk-flabel{text-align:center}
}
#ma-links .lk-promo{display:block;max-width:100%;margin-top:16px;border:1px solid rgba(255,255,254,.16);transition:transform .18s ease,box-shadow .18s ease}
#ma-links .lk-promo img{display:block;width:100%;height:auto;aspect-ratio:3/2}
#ma-links .lk-promo:hover{transform:scale(1.02);box-shadow:0 10px 24px rgba(0,0,0,.5)}
#ma-links .lk-news{display:flex;flex-direction:column;gap:14px;margin:0;padding:22px 20px;border:2px solid var(--green);background:rgba(27,59,21,.82)}
#ma-links .lk-nrow{display:grid;grid-template-columns:1fr;gap:8px}
@media (min-width:520px){#ma-links .lk-nrow{grid-template-columns:1fr 1.4fr auto}}
#ma-links .lk-news input{width:100%;min-width:0;height:48px;padding:0 14px;border:1px solid rgba(255,255,254,.35);background:rgba(11,23,15,.7);color:var(--parch);font:700 16px/1.2 'Almarai',sans-serif}
#ma-links .lk-news input::placeholder{color:rgba(255,255,254,.6)}
#ma-links .lk-news input:focus{outline:2px solid var(--green);outline-offset:0}
#ma-links .lk-news button{height:48px;padding:0 22px;border:0;background:var(--green);color:var(--ink);font:800 15px/1 'Almarai',sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:transform .15s ease}
#ma-links .lk-news button:hover{transform:scale(1.04)}
#ma-links .lk-news button[disabled]{opacity:.6;cursor:default;transform:none}
#ma-links .lk-nmsg{margin:0;font-weight:700;font-size:15px;line-height:1.45;text-align:center;color:var(--parch)!important}
#ma-links .lk-quiet{display:block;width:28px;height:28px;margin:4px auto 0;opacity:.35;transition:opacity .15s ease,transform .15s ease}
#ma-links .lk-quiet img{display:block;width:100%;height:100%;object-fit:contain}
#ma-links .lk-quiet:hover{opacity:1;transform:scale(1.15)}
#ma-links .lk-foot{margin:0;text-align:center;font-size:13px;letter-spacing:.06em;color:var(--moss)!important}
@media (prefers-reduced-motion:reduce){#ma-links .lk-tile,#ma-links .lk-copper,#ma-links .lk-soc,#ma-links .lk-promo,#ma-links .lk-quiet{transition:none}}
</style>
<div id="ma-links">
  <div class="lk-sky" aria-hidden="true"></div><div class="lk-wash" aria-hidden="true"></div>
  <div class="lk-in">
    <header class="lk-top">
      <img class="lk-cover" src="${BASE}assets/press/cover-saga-floating.webp" alt="Cello's Gate by Maurice Africh" width="1600" height="1600">
      <h1>${esc(D.title)}</h1>
      ${D.lines.map((l) => `<p class="lk-line">${esc(l)}</p>`).join('')}
      <nav class="lk-socs" aria-label="Find Maurice">${socials}</nav>
    </header>
    ${copperCard}
    <div class="lk-feats">${feature}</div>
    ${signup}
    <div class="lk-secs">
${sections}
    </div>
    <a class="lk-quiet" href="${esc(D.quiet.url)}" data-link="${D.quiet.id}" data-section="quiet" aria-label="${esc(D.quiet.label)}" title="${esc(D.quiet.label)}"><img src="${asset(D.quiet.icon)}" alt=""${lazy}></a>
    <p class="lk-foot">mauriceafrich.com</p>
  </div>
</div>
<script>
(function () {
  var root = document.getElementById('ma-links'); if (!root) return;
  var ENDPOINT = '${ENDPOINT}';
  // A page of its own: no site menu or footer, nothing wider than the screen, and the Squarespace section around it goes clear.
  var css = document.createElement('style');
  css.textContent = 'header#header,footer#footer-sections,.sqs-announcement-bar-dropzone{display:none!important}html,body{overflow-x:hidden!important}body{background:#0b170f!important}';
  document.head.appendChild(css);
  var sec = root.parentElement && root.parentElement.closest('section');
  if (sec) {
    sec.style.setProperty('padding', '0', 'important'); sec.style.setProperty('background', '#0b170f', 'important');
    var clear = sec.querySelectorAll('.section-border, .section-background, .content-wrapper, .fe-block, .sqs-block, .sqs-block-content');
    for (var i = 0; i < clear.length; i++) { clear[i].style.setProperty('background', 'transparent', 'important'); if (/content-wrapper|sqs-block$|sqs-block /.test(clear[i].className + ' ')) clear[i].style.setProperty('padding', '0', 'important'); }
  }
  // Where the visitor came from: the tag on the link, the page before, or the app they are in.
  function source() {
    var q = (location.search.match(/[?&](?:utm_source|src)=([^&]+)/) || [])[1];
    if (q) return decodeURIComponent(q).toLowerCase().slice(0, 30);
    var r = document.referrer, ua = navigator.userAgent;
    if (/Instagram/i.test(ua) || /instagram\\.com/.test(r)) return 'instagram';
    if (/musical_ly|BytedanceWebview|TikTok/i.test(ua) || /tiktok\\.com/.test(r)) return 'tiktok';
    if (/FBAN|FBAV/i.test(ua) || /facebook\\.com|fb\\.me/.test(r)) return 'facebook';
    if (/youtube\\.com|youtu\\.be/.test(r)) return 'youtube';
    if (/threads\\.(net|com)/.test(r)) return 'threads';
    if (/discord/.test(r)) return 'discord';
    if (/mauriceafrich\\.com/.test(r)) return 'website';
    if (/google\\./.test(r)) return 'google';
    return r ? r.replace(/^https?:\\/\\/(www\\.)?/, '').split('/')[0].slice(0, 30) : 'direct';
  }
  var SRC = source(), DEV = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'phone' : 'computer';
  // Which ad or post sent them (utm_campaign on the link), kept for the rest of the visit.
  var CMP = '';
  try {
    var cq = (location.search.match(/[?&]utm_campaign=([^&]+)/) || [])[1];
    CMP = cq ? decodeURIComponent(cq).toLowerCase().slice(0, 60) : (sessionStorage.getItem('lk-cmp') || '');
    if (cq) sessionStorage.setItem('lk-cmp', CMP);
  } catch (e) {}
  function hit(ev, link, section) {
    var body = JSON.stringify({ action: 'link', event: ev, link: link || '', section: section || '', source: SRC, device: DEV, campaign: CMP });
    try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return; } catch (e) {}
    try { fetch(ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' }); } catch (e) {}
  }
  var counting = !/[?&]nostats(&|$)/.test(location.search);
  // The site's Meta Pixel (added by Squarespace, and only after a visitor accepts cookies) also hears about taps
  // and signups, so ads can be measured on them. Nothing is sent to Meta when the visitor has not accepted.
  function px(kind, name, data) { try { if (counting && typeof window.fbq === 'function') window.fbq(kind, name, data || {}); } catch (e) {} }
  if (counting) {
    hit('view');
    root.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-link]'); if (!a) return;
      hit('click', a.getAttribute('data-link'), a.getAttribute('data-section'));
      px('trackCustom', 'LinkTap', { link: a.getAttribute('data-link'), section: a.getAttribute('data-section'), campaign: CMP });
      // A tap on a store (the Pre-Order grid or the Amazon icon) is the pre-order signal ads optimize for: the sale
      // itself happens on the store's site, where the Pixel can't see it.
      if (a.getAttribute('data-section') === 'preorder' || a.getAttribute('data-link') === 'amazon')
        px('track', 'InitiateCheckout', { content_name: "Cello's Gate", content_category: a.getAttribute('data-link'), campaign: CMP });
    }, true);
  }
  // The newsletter signup sends the name and email to Kit, then says what Kit's own form says.
  var news = root.querySelector('.lk-news');
  if (news) news.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = news.querySelector('[name="email_address"]'), btn = news.querySelector('button'), msg = news.querySelector('.lk-nmsg');
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email.value.trim())) { msg.hidden = false; msg.textContent = 'Please enter your email address.'; email.focus(); return; }
    btn.disabled = true;
    fetch('https://app.kit.com/forms/' + news.getAttribute('data-kit') + '/subscriptions', { method: 'POST', body: new FormData(news), mode: 'no-cors' })
      .then(function () {
        news.querySelector('.lk-nrow').hidden = true; msg.hidden = false; msg.textContent = ${JSON.stringify(N.done)};
        if (counting) hit('signup', 'newsletter', 'newsletter');
        px('track', 'Lead', { content_name: 'Newsletter', campaign: CMP });
      })
      .catch(function () { btn.disabled = false; msg.hidden = false; msg.textContent = 'That did not go through. Please try again.'; });
  });
  // The Pre-Order tile scrolls to the store grid (every section is open).
  Array.prototype.forEach.call(root.querySelectorAll('[data-open]'), function (b) {
    b.addEventListener('click', function () {
      var s = document.getElementById('lk-' + b.getAttribute('data-open')); if (!s) return;
      if (counting) hit('click', b.getAttribute('data-link'), 'buttons');
      s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
</script>
`;
writeFileSync(join(ROOT, 'pages/links.html'), page);
const n = D.sections.reduce((a, s) => a + s.links.length + (s.promo ? 1 : 0), 0) + D.socials.length + D.feature.length + 2;
console.log('pages/links.html: ' + n + ' links in ' + D.sections.length + ' sections (' + (page.length / 1024).toFixed(0) + ' KB)');
