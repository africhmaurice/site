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

// a mailto link carries its address reversed and base64-encoded, put together only on tap, so scrapers reading the page miss it
const scramble = (u) => Buffer.from(u.replace(/^mailto:/, '').split('').reverse().join(''), 'utf8').toString('base64');
const socials = D.socials.map((s) => /^mailto:/.test(s.url)
  ? `<a class="lk-soc" href="#email" data-m="${scramble(s.url)}" data-link="${s.id}" data-section="socials" aria-label="${esc(s.label)}" title="${esc(s.label)}"><img src="${asset(s.icon)}" alt=""></a>`
  : `<a class="lk-soc" href="${esc(s.url)}"${ext(s.url)} data-link="${s.id}" data-section="socials" aria-label="${esc(s.label)}" title="${esc(s.label)}"><img src="${asset(s.icon)}" alt=""></a>`).join('');
// the Read Excerpt bar at the very top (Maurice, 2026-10-16)
const X = D.excerpt;
const excerptCard = X ? `<a class="lk-copper lk-excerpt" href="${esc(X.url)}"${ext(X.url)} data-link="${X.id}" data-section="top"><img src="${asset(X.img)}" alt="" width="360" height="360"><span><b>${esc(X.label)}</b><small>${esc(X.sub)}</small></span>${arrow}</a>` : '';
const C = D.copper;
const copperCard = `<a class="lk-copper" href="${esc(C.url)}" data-link="${C.id}" data-section="top"><img src="${asset(C.img)}" alt="" width="360" height="360"><span><b>${esc(C.label)}</b><small>${esc(C.sub)}</small></span>${arrow}</a>`;

// the editions row up top (Maurice, 10/14): each book on its own art, its name, one line, and where to get it.
// A card with 'open' scrolls to a section on this page (the Saga edition is sold everywhere, so it opens the store
// grid); a sold-out card stays tappable but wears a SOLD OUT stamp.
const E = D.editions;
const edCard = (e) => {
  const body = `<span class="lk-edart" style="background-image:url('${bgUrl(e.bg)}')"></span><span class="lk-edov"></span>`
    + `<span class="lk-edin"><img class="lk-edimg${e.frame ? ' lk-edframe' : ''}" src="${asset(e.img)}" alt=""><b>${esc(e.label)}</b><small>${esc(e.note)}</small>`
    + `<span class="lk-edcta">${e.soldOut ? 'Sold Out!' : 'Pre-Order'}</span></span>`
    + (e.soldOut ? '<span class="lk-edstamp" aria-hidden="true">Sold Out</span>' : '');
  const attrs = `class="lk-ed${e.soldOut ? ' lk-ed-out' : ''}" data-link="${e.id}" data-section="editions" aria-label="${esc(e.label)}${e.soldOut ? ' (Sold Out)' : ''}"`;
  return e.open ? `<button type="button" ${attrs} data-open="${e.open}">${body}</button>` : `<a href="${esc(e.url)}"${ext(e.url)} ${attrs}>${body}</a>`;
};
const editions = E ? `<section class="lk-eds" id="lk-editions"><h2 class="lk-h">${esc(E.title)}</h2><div class="lk-edgrid">${E.items.map(edCard).join('')}</div></section>` : '';

// the art behind a tile and its brand-color wash
const backing = (bg, tone) => `<span class="lk-bgimg" style="background-image:url('${bgUrl(bg)}')"></span><span class="lk-ov lk-ov-${tone}"></span>`;
// 'spin' is a strip of 32 frames (one half-turn of the Izzy coin, the Fog Maze art), played as a loop (Maurice, 10/18).
const feature = D.feature.map((f) => {
  const inner = (f.spin ? `<span class="lk-fimg lk-spin" style="background-image:url('${asset(f.spin)}')" aria-hidden="true"></span>` : f.img ? `<img class="lk-fimg" src="${asset(f.img)}" alt="">` : '') + `<span class="lk-flabel">${esc(f.label)}</span>`;
  const attrs = `class="lk-tile lk-feat${f.img || f.spin ? '' : ' lk-feat-text'}" data-link="${f.id}" data-section="buttons" aria-label="${esc(f.label)}"`;
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
// a section with "top": true sits right under the editions row (Maurice, 10/15: the launch events
// "beneath the new edition preorder links")
const section = (s) => `<section class="lk-sec" id="lk-${s.id}"><h2 class="lk-h">${esc(s.title)}</h2>`
  + (s.badge ? `<img class="lk-badge" src="${asset(s.badge)}" alt=""${lazy}>` : '')
  + `<div class="lk-grid lk-${s.layout || 'three'}">${s.links.map((l) => tile(l, s)).join('')}</div>`
  + (s.promo ? promo(s.promo, s) : '') + '</section>';
const sections = D.sections.filter((s) => !s.top).map(section).join('\n');
const topSections = D.sections.filter((s) => s.top).map(section).join('\n');
// the newsletter signup posts straight to the Kit form the /newsletter page uses
const N = D.newsletter;
const signup = `<form class="lk-news" data-kit="${N.form}" novalidate><h2 class="lk-h">${esc(N.title)}</h2>
      <div class="lk-nrow"><input type="text" name="fields[first_name]" placeholder="First Name" aria-label="First Name" autocomplete="given-name"><input type="email" name="email_address" placeholder="Email Address" aria-label="Email Address" autocomplete="email" required><button type="submit">${esc(N.button)}</button></div>
      <div aria-hidden="true" style="position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden"><label for="lk-hp">Leave this empty</label><input type="text" id="lk-hp" tabindex="-1" autocomplete="off"></div>
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
#ma-links .lk-top{position:relative}
#ma-links .lk-cover{position:relative;z-index:2;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#ma-links .lk-bk{position:absolute;top:0;left:50%;z-index:1;width:min(64vw,250px);aspect-ratio:1;transform:translateX(-50%);display:flex;align-items:center;justify-content:center}
#ma-links .lk-bk img{display:block;width:60%;height:auto;cursor:pointer;filter:drop-shadow(0 10px 16px rgba(0,0,0,.55))}
#ma-links h1{margin:0;font-family:'Atomic Marker',Impact,sans-serif;font-weight:400;font-size:clamp(44px,12vw,64px);line-height:1.2;letter-spacing:.03em;color:var(--parch)!important}
#ma-links .lk-line{margin:0;font-weight:800;font-size:clamp(15px,4.2vw,18px);line-height:1.45;letter-spacing:.02em;color:var(--parch)!important}
#ma-links .lk-line + .lk-line{color:var(--green)!important;margin-top:-6px}
#ma-links .lk-socs{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;margin-top:6px}
#ma-links .lk-soc{width:36px;height:36px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,.6));transition:transform .15s ease}
#ma-links .lk-soc img{display:block;max-width:26px;max-height:26px;width:auto;height:auto}
#ma-links .lk-soc:hover{transform:scale(1.15)}
#ma-links .lk-copper{display:flex;align-items:center;gap:16px;padding:14px 18px 14px 12px;border:2px solid #fd7547;background:linear-gradient(90deg,rgba(145,37,1,.94),rgba(197,50,0,.9));color:var(--parch)!important;text-decoration:none!important;transition:transform .15s ease}
#ma-links .lk-excerpt{border-color:#9e74fd;background:linear-gradient(90deg,rgba(45,28,83,.95),rgba(72,45,133,.92));margin-bottom:8px}
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
#ma-links .lk-spin{--s:118px;flex:none;width:var(--s);height:var(--s);max-width:none;background-repeat:no-repeat;background-size:calc(var(--s) * 32) var(--s);background-position:0 0;animation:lk-spin 1.6s steps(32) infinite}
@keyframes lk-spin{to{background-position:calc(var(--s) * -32) 0}}
#ma-links .lk-flabel{font-weight:800;font-size:clamp(11px,3.3vw,15px);line-height:1.3;letter-spacing:.06em;text-transform:uppercase;text-wrap:balance;text-shadow:0 2px 8px rgba(0,0,0,.55)}
#ma-links .lk-feat-text .lk-flabel{font-size:clamp(13px,4vw,18px)}
/* phones: the three big tiles stack as wide rows, picture beside the words */
@media (max-width:519px){
  #ma-links .lk-feats{grid-template-columns:1fr;gap:10px}
  #ma-links .lk-feat{aspect-ratio:auto;height:128px}
  #ma-links .lk-feat .lk-tin,#ma-links .lk-feat-text .lk-tin{flex-direction:row;justify-content:center;gap:14px;padding:24px}
  #ma-links .lk-fimg{flex:none;height:64px;max-width:22%}
  #ma-links .lk-spin{--s:72px;max-width:none}
  #ma-links .lk-flabel,#ma-links .lk-feat-text .lk-flabel{font-size:clamp(12px,3.7vw,17px);text-align:left;white-space:nowrap;letter-spacing:.02em}
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
#ma-links .lk-eds{display:flex;flex-direction:column;gap:14px}
#ma-links .lk-edgrid{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
#ma-links .lk-ed{position:relative;flex:0 0 calc((100% - 8px)/2);display:block;overflow:hidden;padding:0;margin:0;border:1px solid rgba(255,255,254,.18);background:none;font:inherit;color:var(--parch)!important;text-decoration:none!important;text-align:center;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}
@media (min-width:520px){#ma-links .lk-ed{flex-basis:calc((100% - 16px)/3)}}
#ma-links .lk-ed:hover{transform:scale(1.03);z-index:2;box-shadow:0 10px 24px rgba(0,0,0,.5)}
#ma-links .lk-edart,#ma-links .lk-edov{position:absolute;inset:0}
#ma-links .lk-edart{background-size:cover;background-position:center}
#ma-links .lk-edov{background:linear-gradient(180deg,rgba(11,23,15,.55),rgba(11,23,15,.9) 62%)}
#ma-links .lk-edin{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;height:100%;padding:20px 12px 20px}
#ma-links .lk-edimg{display:block;height:clamp(150px,40vw,190px);width:auto;max-width:100%;object-fit:contain;filter:drop-shadow(0 10px 14px rgba(0,0,0,.6))}
#ma-links .lk-edin b{display:flex;align-items:center;justify-content:center;min-height:3.9em;font-weight:800;font-size:clamp(13px,3.6vw,15px);line-height:1.3;letter-spacing:.06em;text-transform:uppercase;text-wrap:balance}
#ma-links .lk-edin small{min-height:4.2em;font-weight:700;font-size:clamp(11px,3vw,12px);line-height:1.4;opacity:.85;text-wrap:balance}
#ma-links .lk-edcta{margin-top:auto;padding:8px 14px;background:var(--green);color:var(--ink);font-weight:800;font-size:12px;line-height:1;letter-spacing:.1em;text-transform:uppercase}
#ma-links .lk-edframe{border:1px solid var(--parch)}
#ma-links .lk-ed-out .lk-edimg{filter:grayscale(.75) brightness(.7) drop-shadow(0 10px 14px rgba(0,0,0,.6))}
#ma-links .lk-ed-out .lk-edcta{background:rgba(255,255,254,.18);color:var(--parch)}
#ma-links .lk-edstamp{position:absolute;top:58px;left:50%;transform:translateX(-50%) rotate(-12deg);padding:8px 14px;border:3px solid #fd7547;background:rgba(145,37,1,.9);color:var(--parch);font-family:'Atomic Marker',Impact,sans-serif;font-size:20px;line-height:1.2;letter-spacing:.06em;white-space:nowrap;pointer-events:none}
#ma-links .lk-quiet{display:block;width:28px;height:28px;margin:4px auto 0;opacity:.35;transition:opacity .15s ease,transform .15s ease}
#ma-links .lk-quiet img{display:block;width:100%;height:100%;object-fit:contain}
#ma-links .lk-quiet:hover{opacity:1;transform:scale(1.15)}
/* his logo in Parchment at the very bottom (Maurice, 10/18) */
#ma-links .lk-flogo{display:block;width:min(48vw,180px);margin:0 auto;opacity:.92;transition:opacity .15s ease}
#ma-links .lk-flogo img{display:block;width:100%;height:auto}
#ma-links .lk-flogo:hover{opacity:1}
#ma-links .lk-foot{margin:0;text-align:center;font-size:13px;letter-spacing:.06em;color:var(--moss)!important}
@media (prefers-reduced-motion:reduce){#ma-links .lk-spin{animation:none}#ma-links .lk-ed,#ma-links .lk-tile,#ma-links .lk-copper,#ma-links .lk-soc,#ma-links .lk-promo,#ma-links .lk-quiet{transition:none}}
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
    ${excerptCard}
    ${editions}
    ${topSections}
    ${copperCard}
    <div class="lk-feats">${feature}</div>
    ${signup}
    <div class="lk-secs">
${sections}
    </div>
    <a class="lk-quiet" href="${esc(D.quiet.url)}" data-link="${D.quiet.id}" data-section="quiet" aria-label="${esc(D.quiet.label)}" title="${esc(D.quiet.label)}"><img src="${asset(D.quiet.icon)}" alt=""${lazy}></a>
    <p class="lk-foot">mauriceafrich.com</p>
    <a class="lk-flogo" href="https://www.mauriceafrich.com/" data-link="footer-logo" data-section="footer" aria-label="Maurice Africh"><img src="${BASE}assets/img/logo-2026-white.webp" alt="Maurice Africh" width="640" height="396"${lazy}></a>
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
      // A tap on a store (the editions row, the Pre-Order grid, or the Amazon icon) is the pre-order signal ads
      // optimize for: the sale itself happens on the store's site, where the Pixel can't see it. PreOrderTap is the
      // same tap as a custom event, which an Engagement campaign can optimize for (Maurice, 10/14).
      if (/^(preorder|editions)$/.test(a.getAttribute('data-section')) || a.getAttribute('data-link') === 'amazon') {
        px('track', 'InitiateCheckout', { content_name: "Cello's Gate", content_category: a.getAttribute('data-link'), campaign: CMP });
        px('trackCustom', 'PreOrderTap', { link: a.getAttribute('data-link'), section: a.getAttribute('data-section'), campaign: CMP });
      }
    }, true);
  }
  // Tile words shrink to fit their tile (a long name like BeeristheMindKiller), never running past its padding.
  function fit() {
    Array.prototype.forEach.call(root.querySelectorAll('.lk-note,.lk-name,.lk-flabel'), function (el) {
      el.style.fontSize = '';
      var box = el.parentElement, cs = getComputedStyle(box), size = parseFloat(getComputedStyle(el).fontSize);
      function over() {
        var b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
        return el.scrollWidth > el.clientWidth + 1 || r.left < b.left + parseFloat(cs.paddingLeft) - 1 || r.right > b.right - parseFloat(cs.paddingRight) + 1;
      }
      while (size > 8 && over()) { size -= 0.5; el.style.fontSize = size + 'px'; }
    });
    // the three big buttons share one size, the smallest that fits all of them
    var big = root.querySelectorAll('.lk-flabel'), min = Infinity;
    Array.prototype.forEach.call(big, function (el) { min = Math.min(min, parseFloat(getComputedStyle(el).fontSize)); });
    Array.prototype.forEach.call(big, function (el) { el.style.fontSize = min + 'px'; });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var fitT; window.addEventListener('resize', function () { clearTimeout(fitT); fitT = setTimeout(fit, 150); });
  // The newsletter signup sends the name and email to Kit, then says what Kit's own form says.
  var news = root.querySelector('.lk-news'), OPENED = Date.now();
  if (news) news.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = news.querySelector('[name="email_address"]'), btn = news.querySelector('button'), msg = news.querySelector('.lk-nmsg');
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email.value.trim())) { msg.hidden = false; msg.textContent = 'Please enter your email address.'; email.focus(); return; }
    // Spam guards: a person never fills the hidden field, and never signs up within 3 seconds of the page opening.
    // A bot sees the usual thank-you, but nothing is sent to Kit.
    var hp = news.querySelector('#lk-hp');
    if ((hp && hp.value) || Date.now() - OPENED < 3000) { news.querySelector('.lk-nrow').hidden = true; msg.hidden = false; msg.textContent = ${JSON.stringify(N.done)}; return; }
    btn.disabled = true;
    fetch('https://app.kit.com/forms/' + news.getAttribute('data-kit') + '/subscriptions', { method: 'POST', body: new FormData(news), mode: 'no-cors' })
      .then(function () {
        news.querySelector('.lk-nrow').hidden = true; msg.hidden = false; msg.textContent = ${JSON.stringify(N.done)};
        if (counting) hit('signup', 'newsletter', 'newsletter');
        px('track', 'Lead', { content_name: 'Newsletter', campaign: CMP });
      })
      .catch(function () { btn.disabled = false; msg.hidden = false; msg.textContent = 'That did not go through. Please try again.'; });
  });
  // The email icon: its address is unscrambled only when tapped.
  Array.prototype.forEach.call(root.querySelectorAll('a[data-m]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      try { location.href = 'mailto:' + atob(a.getAttribute('data-m')).split('').reverse().join(''); } catch (err) {}
    });
  });
  // The Pre-Order tile and the Saga edition card scroll to the store grid (every section is open).
  Array.prototype.forEach.call(root.querySelectorAll('[data-open]'), function (b) {
    b.addEventListener('click', function () {
      var s = document.getElementById('lk-' + b.getAttribute('data-open')); if (!s) return;
      if (counting) hit('click', b.getAttribute('data-link'), b.getAttribute('data-section') || 'buttons');
      s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  // The book up top slides aside, but only to the left, and only for someone who tries.
  (function () {
    var bk = root.querySelector('.lk-cover'); if (!bk) return;
    var top = bk.parentElement, k = 'WUpXN01XNEc9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo';
    var id = null, mode = 0, x0 = 0, y0 = 0, dx = 0, W = 0, done = false, tm;
    bk.setAttribute('draggable', 'false');
    bk.addEventListener('dragstart', function (e) { e.preventDefault(); });
    function set(v) { bk.style.transform = v ? 'translateX(' + v + ')' : ''; }
    function ease(v) { clearTimeout(tm); bk.style.transition = 'transform .35s ease'; set(v); tm = setTimeout(function () { bk.style.transition = ''; }, 400); }
    function show() {
      var spot = document.createElement('div'), img = document.createElement('img');
      spot.className = 'lk-bk';
      function go() { location.href = atob(k).split('').reverse().join(''); }
      img.alt = 'Loot box 64'; img.tabIndex = 0; img.setAttribute('role', 'link');
      img.addEventListener('click', go);
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      img.src = 'https://africhmaurice.github.io/leaderboard/loot/64.png';
      spot.appendChild(img); top.insertBefore(spot, top.firstChild);
    }
    function end(e) {
      if (e.pointerId !== id) return;
      id = null;
      if (mode !== 1) { mode = 0; return; }
      mode = 0;
      if (e.type === 'pointerup' && -dx > W * 0.45) { done = true; ease('-90%'); show(); }
      else ease('');
    }
    bk.addEventListener('pointerdown', function (e) {
      if (done || id !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; mode = 0; W = bk.offsetWidth;
      if (e.pointerType === 'mouse') e.preventDefault();
    });
    bk.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var mx = e.clientX - x0, my = e.clientY - y0;
      if (mode === 0) {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        if (Math.abs(mx) <= Math.abs(my)) { id = null; return; }
        mode = 1; clearTimeout(tm); bk.style.transition = '';
        try { bk.setPointerCapture(id); } catch (er) {}
      }
      e.preventDefault();
      dx = Math.max(-W, Math.min(0, mx));
      set(dx + 'px');
    });
    bk.addEventListener('pointerup', end);
    bk.addEventListener('pointercancel', end);
  })();
})();
</script>
`;
writeFileSync(join(ROOT, 'pages/links.html'), page);
const n = D.sections.reduce((a, s) => a + s.links.length + (s.promo ? 1 : 0), 0) + D.socials.length + D.feature.length + (D.editions ? D.editions.items.length : 0) + 2;
console.log('pages/links.html: ' + n + ' links in ' + D.sections.length + ' sections (' + (page.length / 1024).toFixed(0) + ' KB)');
