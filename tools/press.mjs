// node tools/press.mjs : builds pages/press.html (the Press page) and pages/home-press.html (the home page media section)
// from the lists below. To add a feature or change a contact: edit FEATURES or CONTACTS, run this, then npm run publish.
import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://africhmaurice.github.io/site/';
const HEADSHOT = 'https://images.squarespace-cdn.com/content/v1/68f0178dd88a7e52ec46ae7e/3ca8075d-3c26-4716-8330-52ed5d5b60e9/Maurice+Headshot.jpg';

// Best first. home: true puts it on the home page too. quote: a short pull quote from the piece (keep them short).
const FEATURES = [
  { home: true, outlet: 'Kirkus Reviews', type: 'Review', title: 'Cello’s Gate: The Sky Pirates of Imperia', date: 'Aug 2026',
    quote: 'Readers should enjoy this thinly veiled literary love letter to pop-culture SF.',
    url: 'https://www.kirkusreviews.com/book-reviews/maurice-africh/cellos-gate-the-sky-pirates-of-imperia/' },
  { home: true, outlet: 'Library Journal', type: 'Review', title: 'Cello’s Gate', date: '2026',
    url: 'https://www.libraryjournal.com/review/cellos-gate-100013820' },
  { home: true, outlet: 'Collider', type: 'List', title: '8 Sci-Fi Books That Are Perfect From Cover to Cover', date: 'Aug 2026',
    quote: '…absolutely great read that cannot be missed.',
    url: 'https://collider.com/sci-fi-books-perfect-cover-to-cover/' },
  { home: true, outlet: 'Collider', type: 'List', title: '10 Essential Sci-Fi Books for Beginners', date: 'Aug 2026',
    quote: 'Heart-filled, fun, and filled with great worldbuilding.',
    url: 'https://collider.com/essential-sci-fi-books-beginners/' },
  { home: true, outlet: 'Grimdark Magazine', type: 'Review', title: 'Review: Cello’s Gate by Maurice Africh', date: 'Mar 2025',
    quote: 'Epic yet intimate, dark yet lighthearted.',
    url: 'https://www.grimdarkmagazine.com/review-cellos-gate-by-maurice-africh/' },
  { home: true, outlet: 'Nyrdcast', type: 'Review', title: 'Cello’s Gate by Maurice Africh: A Book Review', date: 'Sep 2026',
    quote: 'An entertaining ride that kept me turning pages.',
    url: 'https://www.nyrdcast.com/cellos-gate-maurice-africh-review/' },
  { home: true, outlet: 'The Smitty Review', type: 'Video', title: 'Cello’s Gate on TikTok', date: '2025',
    quote: 'The most fun I’ve had reading this year.',
    url: 'https://www.tiktok.com/@vinopapi23/video/7550804683011411214' },
  { home: true, outlet: 'On Wednesdays We Read', type: 'Podcast', title: 'Author Highlight: Maurice Africh', date: 'Mar 2025',
    url: 'https://owwrpod.com/2025/03/25/author-highlight-maurice-aufrich/' },
  { outlet: 'This Dad Reads', type: 'Review', title: 'Cello’s Gate Book Review', date: 'Jun 2026',
    quote: 'An impressive debut and exactly the kind of pure popcorn entertainment.',
    url: 'https://thisdadreads.wordpress.com/2026/06/15/cellos-gate-book-review/' },
  { outlet: 'BookMadLibrarian', type: 'Review', title: 'Cello’s Gate by Maurice Africh', date: 'Jul 2025',
    quote: 'One of the best debut novels I’ve read in a while.',
    url: 'https://bookmadlibrarian.wordpress.com/2025/07/07/cellos-gate-by-maurice-africh/' },
  { outlet: 'Dark Shelf of Wonders', type: 'Review', title: 'Cello’s Gate by Maurice Africh', date: 'Apr 2025',
    url: 'https://darkshelfofwonders.com/cellos-gate-maurice-africh-review/' },
  { outlet: 'Fade to Obsidian', type: 'Podcast', title: 'Discussing Cello’s Gate with Maurice Africh', date: '2025',
    url: 'https://www.youtube.com/watch?v=jth1AgyV9ps' },
  { outlet: 'Daniel Coolbaugh', type: 'Interview', title: 'Season 4, Episode 49: Maurice Africh Interview', date: '2025',
    url: 'https://www.youtube.com/watch?v=q2JejVp7lXI' },
  { outlet: 'A Conversation With…', type: 'Interview', title: 'Maurice Africh, Author of Cello’s Gate', date: '2025',
    url: 'https://www.youtube.com/watch?v=YSuh8yYblAU' },
];

// email: null shows the card with a "coming soon" note instead of a button.
const CONTACTS = [
  { role: 'Literary Agent', name: '[AGENT NAME]', org: '[AGENCY]', note: 'Rights, film and TV, and foreign editions.', email: null },
  { role: 'Publicity, U.S.', name: 'Saga Press Publicity', org: 'Simon & Schuster', note: 'Review copies, interviews and events in North America.', email: 'SagaPressPublicity@SimonandSchuster.com' },
  { role: 'Publicity, UK', name: '[PUBLICIST NAME]', org: 'Hodderscape', note: 'Review copies, interviews and events in the UK and Commonwealth.', email: null },
  { role: 'Maurice', name: 'Maurice Africh', org: 'Author', note: 'Podcasts, blogs, BookTok and everything else.', email: null },
];
const SUBJECT = 'Press inquiry: Cello’s Gate';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const host = (u) => new URL(u).hostname.replace(/^www\./, '');

const card = (f) => `
      <a class="pr-card" href="${esc(f.url)}" target="_blank" rel="noopener">
        <span class="pr-meta"><span class="pr-type pr-${f.type.toLowerCase()}">${esc(f.type)}</span><span>${esc(f.date)}</span></span>
        <span class="pr-outlet">${esc(f.outlet)}</span>
        <span class="pr-title">${esc(f.title)}</span>${f.quote ? `
        <span class="pr-quote">“${esc(f.quote)}”</span>` : ''}
        <span class="pr-go">${{ Podcast: 'Listen', Video: 'Watch', Interview: 'Watch' }[f.type] || 'Read'} on ${esc(host(f.url))} →</span>
      </a>`;

// Shared card styles, scoped by the wrapper id.
const cardCss = (id) => `
${id} .pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
${id} .pr-card{display:flex;flex-direction:column;gap:10px;padding:22px 22px 20px;background:rgba(11,23,15,.62);border:1px solid rgba(255,255,254,.16);color:#fffffe;text-decoration:none;transition:transform .18s ease,border-color .18s ease,background .18s ease}
${id} .pr-card:hover{transform:translateY(-4px);border-color:#3adb97;background:rgba(26,94,65,.55)}
${id} .pr-meta{display:flex;justify-content:space-between;align-items:center;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,254,.6)}
${id} .pr-type{font-weight:800;padding:4px 9px;border:1px solid currentColor}
${id} .pr-review{color:#fd7547}${id} .pr-list{color:#a2f590}${id} .pr-podcast,${id} .pr-interview{color:#9e74fd}${id} .pr-video{color:#89fbcb}
${id} .pr-outlet{font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#3adb97}
${id} .pr-title{font-weight:700;font-size:18px;line-height:1.35}
${id} .pr-quote{font-size:15px;line-height:1.55;color:rgba(255,255,254,.82);font-style:italic}
${id} .pr-go{margin-top:auto;padding-top:6px;font-size:13px;font-weight:700;letter-spacing:.05em;color:#fd7547}`;

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">`;

// ---------- Home page media section ----------
const homeList = FEATURES.filter((f) => f.home);
const home = `<!-- Generated by tools/press.mjs; edit the lists there, not this file. -->
${fonts}
<style>
#home-press{box-sizing:border-box;font-family:'Almarai',sans-serif;letter-spacing:.03em;color:#fffffe;max-width:1180px;margin:0 auto;padding:8px 0}
#home-press *,#home-press *::before,#home-press *::after{box-sizing:border-box}
#home-press .hp-head{text-align:center;margin:0 0 26px}
#home-press .hp-kicker{font-weight:800;font-size:13px;letter-spacing:.18em;color:#a2f590;margin:0}
${cardCss('#home-press')}
#home-press .hp-more{text-align:center;margin:28px 0 0}
#home-press .hp-btn{display:inline-block;color:#fffffe;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.08em;text-transform:uppercase;border:1.5px solid #fffffe;padding:13px 26px;background:rgba(11,23,15,.5);transition:background .15s ease,transform .15s ease}
#home-press .hp-btn:hover{background:#c53200;transform:scale(1.04)}
@media (max-width:640px){#home-press .pr-grid{grid-template-columns:1fr}#home-press .pr-card{padding:18px}}
</style>
<div id="home-press">
  <div class="hp-head"><p class="hp-kicker">AS FEATURED IN</p></div>
  <div class="pr-grid">${homeList.map(card).join('')}
  </div>
  <p class="hp-more"><a class="hp-btn" href="/press">All press and media contacts →</a></p>
</div>
`;

// ---------- Press page ----------
const contact = (c) => `
      <div class="pp-contact">
        <p class="pp-role">${esc(c.role)}</p>
        <p class="pp-name">${esc(c.name)}</p>
        <p class="pp-org">${esc(c.org)}</p>
        <p class="pp-note">${esc(c.note)}</p>
        ${c.email
          ? `<a class="pp-btn" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(SUBJECT)}">Email ${esc(c.role === 'Maurice' ? 'me' : c.name.split(' ')[0])}</a><span class="pp-addr">${esc(c.email)}</span>`
          : `<span class="pp-soon">Email coming soon</span>`}
      </div>`;

const FACTS = [
  ['Title', 'Cello’s Gate'],
  ['Series', 'The Sky Pirates of Imperia, Book One'],
  ['Genre', 'Sci-fi fantasy adventure'],
  ['Release', 'November 3, 2026'],
  ['U.S.', 'Saga Press · Hardcover ISBN 9781668242834'],
  ['UK', 'Hodderscape · Hardback ISBN 9781399763073'],
  ['Audio', 'Simon Maverick'],
  ['Home', 'Asheville, North Carolina'],
];

const press = `<!-- Generated by tools/press.mjs; edit the lists there, not this file. -->
${fonts}
<style>
#press{box-sizing:border-box;position:relative;width:100vw;overflow-x:hidden;background:linear-gradient(rgba(9,23,7,.74),rgba(9,23,7,.86)),url(${BASE}assets/bg/city-skyline-panorama-as348070597.webp) center/cover no-repeat fixed;padding-top:clamp(140px,12vw,180px);color:#fffffe;font-family:'Almarai',sans-serif;letter-spacing:.03em;padding-bottom:110px}
#press *,#press *::before,#press *::after{box-sizing:border-box}
#press .pp-wrap{max-width:1180px;margin:0 auto;padding:0 32px}
#press .pp-kicker{font-weight:700;font-size:14px;letter-spacing:.14em;color:#a2f590;margin:0 0 14px}
#press h1{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(34px,4.4vw,64px);line-height:1;margin:0 0 20px;color:#fffffe;text-transform:none}
#press h2{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(28px,2.6vw,40px);line-height:1.1;color:#89fbcb;margin:0 0 26px;text-transform:none}
#press .pp-lede{font-size:clamp(16px,1.4vw,19px);line-height:1.6;color:#ede9dc;margin:0;max-width:640px}
#press .pp-section{margin-top:56px;padding:44px 48px 40px;background:rgba(38,142,98,.16);border:1px solid rgba(243,234,217,.18);scroll-margin-top:120px}
#press .pp-contacts{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
#press .pp-contact{display:flex;flex-direction:column;padding:24px;background:rgba(11,23,15,.62);border:1px solid rgba(255,255,254,.16)}
#press .pp-contact p{margin:0}
#press .pp-role{font-weight:800;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#fd7547;margin-bottom:12px!important}
#press .pp-name{font-weight:800;font-size:20px;line-height:1.3}
#press .pp-org{font-size:15px;color:#3adb97;margin-top:2px!important}
#press .pp-note{font-size:15px;line-height:1.55;color:rgba(255,255,254,.78);margin:14px 0 20px!important}
#press .pp-btn{margin-top:auto;display:block;text-align:center;color:#fffffe;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.06em;border:1.5px solid #fffffe;padding:12px 16px;background:rgba(12,26,8,.35);transition:background .15s ease,transform .15s ease}
#press .pp-btn:hover{background:#c53200;transform:scale(1.03)}
#press .pp-addr{display:block;margin-top:10px;font-size:12px;color:rgba(255,255,254,.6);word-break:break-all;text-align:center}
#press .pp-soon{margin-top:auto;display:block;text-align:center;font-size:14px;font-weight:700;letter-spacing:.06em;padding:12px 16px;border:1.5px dashed rgba(255,255,254,.35);color:rgba(255,255,254,.6)}
#press .pp-kit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:48px;align-items:start}
#press .pp-imgs{display:grid;grid-template-columns:1fr 1fr;gap:18px}
#press .pp-img{display:flex;flex-direction:column;gap:10px;color:#fffffe;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.06em}
#press .pp-img img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;border:1px solid rgba(255,255,254,.16);background:rgba(11,23,15,.5)}
#press .pp-img.book img{object-fit:contain;padding:14px}
#press .pp-img span{color:#fd7547}
#press .pp-img:hover span{color:#3adb97}
#press .pp-facts{margin:0;display:grid;grid-template-columns:110px minmax(0,1fr);gap:0}
#press .pp-facts dt,#press .pp-facts dd{margin:0;padding:12px 0;border-top:1px solid rgba(243,234,217,.12);font-size:15px;line-height:1.5}
#press .pp-facts dt{font-weight:800;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a2f590;padding-top:14px}
#press .pp-bio{font-size:16px;line-height:1.65;color:#ede9dc;margin:26px 0 0}
${cardCss('#press')}
@media (max-width:860px){
  #press{padding-top:120px}
  #press .pp-wrap{padding:0 16px}
  #press .pp-section{margin-top:36px;padding:32px 20px 28px}
  #press .pp-kit{grid-template-columns:1fr;gap:32px}
  #press .pr-grid{grid-template-columns:1fr}
}
</style>
<div id="press">
  <div class="pp-wrap">
    <p class="pp-kicker">PRESS AND MEDIA</p>
    <h1>Press Room</h1>
    <p class="pp-lede">Reviews, interviews, and who to talk to about Cello’s Gate. For review copies and interviews, reach out to the right person below.</p>

    <section class="pp-section" id="pp-contacts">
      <h2>Contacts</h2>
      <div class="pp-contacts">${CONTACTS.map(contact).join('')}
      </div>
    </section>

    <section class="pp-section" id="pp-kit">
      <h2>Press Kit</h2>
      <div class="pp-kit">
        <div class="pp-imgs">
          <a class="pp-img book" href="${BASE}assets/img/cellos-gate-book.webp" target="_blank" rel="noopener"><img src="${BASE}assets/img/cellos-gate-book.webp" alt="Cello's Gate hardcover" loading="lazy"><span>Book cover ↓</span></a>
          <a class="pp-img" href="${HEADSHOT}?format=2500w" target="_blank" rel="noopener"><img src="${HEADSHOT}?format=750w" alt="Maurice Africh" loading="lazy"><span>Author photo ↓</span></a>
        </div>
        <div>
          <dl class="pp-facts">${FACTS.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
          <p class="pp-bio">With a wit to rival Matt Dinniman’s Dungeon Crawler Carl, action on par with Pierce Brown’s Red Rising, and the scope of Tamsyn Muir’s Gideon the Ninth, Cello’s Gate is a rollicking, edge-of-your-seat sci-fi fantasy epic about a ragtag crew of rogues on the hunt for mythic treasure. They did not, however, sign up to save the world.</p>
          <p class="pp-bio">Maurice Africh is an ex-theater kid with a passion for tasty food, semi-luxurious travel, reality competition television shows, D&amp;D, and fantasy novels. He currently lives in Asheville, North Carolina with his beautiful wife, Rachel, and his cute, albeit cranky chihuahua, Toby.</p>
        </div>
      </div>
    </section>

    <section class="pp-section" id="pp-features">
      <h2>Features and Reviews</h2>
      <div class="pr-grid">${FEATURES.map(card).join('')}
      </div>
    </section>
  </div>
</div>
<script>
// Stretch edge to edge, wherever the Squarespace block sits and however wide it is.
(function () {
  function fit() {
    var e = document.getElementById('press'); if (!e) return;
    var sec = e.closest('section:not(.pp-section)');
    if (sec) Array.prototype.forEach.call(sec.querySelectorAll('.content-wrapper, .fluid-engine'), function (x) { x.style.setProperty('padding-top', '0', 'important'); x.style.setProperty('padding-bottom', '0', 'important'); });
    if (sec) { sec.style.setProperty('padding-top', '0', 'important'); sec.style.setProperty('padding-bottom', '0', 'important'); }
    e.style.marginLeft = '0px';
    e.style.marginLeft = -e.getBoundingClientRect().left + 'px';
    e.style.width = document.documentElement.clientWidth + 'px';
  }
  fit(); addEventListener('resize', fit); addEventListener('load', fit); setTimeout(fit, 600);
})();
</script>
`;

writeFileSync(join(ROOT, 'pages', 'home-press.html'), home);
writeFileSync(join(ROOT, 'pages', 'press.html'), press);
console.log(`press.html: ${FEATURES.length} features, ${CONTACTS.length} contacts; home-press.html: ${homeList.length} features`);
