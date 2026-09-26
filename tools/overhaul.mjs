// The Hunt overhaul (September 2026): new hunt menu, new Hunt page layout, The Treasure and Questions pages,
// and the "what next" buttons after every way to earn points.
//
//   node tools/overhaul.mjs --stage    builds next/ and preview-next/ (a full preview; nothing live changes)
//   node tools/overhaul.mjs --launch   applies the same edits to the real sources (pages/ and the hunt bot files)
//
// Every edit is a plain text replacement that must find its target, so a page that changed underneath
// stops the run instead of half-applying.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LAYOUT, swapBlocks } from './lib.mjs';
import { profilePage } from './profile-page.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BOT = resolve(ROOT, '../treasure-hunt-leaderboard');
const site = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8'));
const LIVE = 'https://www.mauriceafrich.com';
const U = (p) => LIVE + p;
const DISCORD = 'https://discord.gg/TV8SNnSGdb';
const LOGO = 'https://images.squarespace-cdn.com/content/v1/68f0178dd88a7e52ec46ae7e/743ed1bd-4964-478d-9fd0-b278d0f39565/Maurice+Africh+Logo+-+White.png?format=500w';
const ENDPOINT = 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';

function swap(s, from, to, what) {
  if (!s.includes(from)) throw new Error(`Could not find ${what}`);
  return s.split(from).join(to);
}
function cut(s, start, end, what) {
  const a = s.indexOf(start); if (a < 0) throw new Error(`Could not find the start of ${what}`);
  const b = s.indexOf(end, a); if (b < 0) throw new Error(`Could not find the end of ${what}`);
  return [a, b];
}

// ---------------------------------------------------------------- the hunt menu
const NAV_CSS = `<style>
html body{text-wrap:pretty}
h1,h2,h3{text-wrap:balance}
/* Date endings (21st, 30th) small and tucked up, not as big as the numbers */
sup{font-size:.42em !important;line-height:0 !important;vertical-align:.95em !important;letter-spacing:.04em}
/* The hunt menu matches the main site header: same green, logo size, type, spacing and outlined pre-order button */
#hunt-nav{background:#1a5e41;backdrop-filter:none;-webkit-backdrop-filter:none;padding:9px clamp(24px,4vw,58px)}
#hunt-nav .mn-row{max-width:none;display:flex;align-items:center;justify-content:space-between;gap:24px}
#hunt-nav .mn-logo{display:flex;align-items:center;flex:none}
#hunt-nav .mn-logo img{width:clamp(88px,8.3vw,120px);height:auto;display:block}
#hunt-nav .mn-right{display:flex;align-items:center;gap:clamp(14px,1.9vw,32px)}
#hunt-nav .mn-links{display:flex;align-items:center;gap:clamp(9px,1.2vw,29px)}
#hunt-nav .mn-link{font-family:'Almarai',sans-serif;font-weight:700;font-size:clamp(10.5px,.88vw,14.4px);letter-spacing:.07em;line-height:48px;text-shadow:none;color:#fff;white-space:nowrap}
#hunt-nav .mn-link:hover,#hunt-nav .mn-drop:hover>.mn-link{color:#a2f590}
#hunt-nav .mn-caret{display:inline-block;width:11px;height:11px;margin-left:8px;vertical-align:1px;transition:transform .15s ease}
#hunt-nav .mn-drop:hover .mn-caret,#hunt-nav .mn-drop:focus-within .mn-caret{transform:rotate(180deg)}
#hunt-nav .mn-cta{line-height:17px;padding:8px clamp(12px,1.3vw,20px);border:2px solid #f3ead9;background:rgba(12,26,8,.35)}
#hunt-nav .mn-drop-cta>.mn-link.mn-cta:hover,#hunt-nav .mn-drop-cta:hover>.mn-link.mn-cta{color:#a2f590;background:rgba(12,26,8,.35);transform:none}
#hunt-nav .mn-dd{padding-top:6px}
#hunt-nav .mn-dd-in a{font-size:clamp(12px,.92vw,14.4px);letter-spacing:.07em;padding:13px 18px}
#hunt-nav .mn-dd-in a.mn-profile{background:#c1330a;color:#fff;border-bottom:1px solid rgba(243,234,217,.35);display:flex;align-items:center;gap:10px}
#hunt-nav .mn-dd-in a.mn-profile:hover{background:#e04a12;color:#fff}
#hunt-nav .mn-dd-in a.mn-profile svg{width:16px;height:16px;flex:none}
@media (max-width:1240px){
  #hunt-nav{padding:10px 0;background:none}
  #hunt-nav .mn-row{display:none}
  #hunt-nav .mn-burger{display:flex}
}
#hunt-nav-ov{gap:14px;overflow-y:auto;justify-content:flex-start;padding-top:88px}
#hunt-nav-ov a{font-size:17px}
#hunt-nav-ov .mn-ovlogo{position:absolute;top:16px;left:20px}
#hunt-nav-ov .mn-ovlogo img{width:96px;height:auto;display:block}
#hunt-nav-ov .mn-ovgroup{display:flex;flex-direction:column;align-items:center;gap:12px;border:1px solid rgba(243,234,217,.3);padding:14px 26px 16px}
#hunt-nav-ov .mn-ovgroup span{font-family:'Almarai',sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590}
#hunt-nav-ov .mn-ovgroup a{font-size:15px}
#hunt-nav-ov .mn-ovgroup a.mn-profile{background:#c1330a;border:1.5px solid #f3ead9;padding:9px 16px}
@media (min-height:860px){#hunt-nav-ov{justify-content:center;padding-top:32px}}
</style>
`;
const LINKS = [
  ['THE HUNT', '/the-hunt'], ['TASKS', '/the-hunt#tasks'], ['RIDDLES', '/the-hunt#riddles'], ['CLUES', '/lootbox-clue'],
  ['GAMES', '/games'], ['CONTESTS', '/contests'], 'PROGRESS', ['QUESTIONS?', '/questions'], ['VOTE NOW!', '/red-city'],
];
// The Current Progress dropdown; the profile is its highlighted first item.
const PROGRESS = [['TREASURE HUNTER PROFILE', '/profile', 'mn-profile'], ['LEADERBOARD', '/leaderboard'], ['LOOT BOX SCORECARD', '/loot'], ['REWARDS', '/the-hunt#rewards']];
const STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"></path></svg>';
// The same open chevron the main header uses on its dropdowns
const CARET = '<svg class="mn-caret" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M3 7l8 8 8-8"></path></svg>';
// Pre-order retailers in this order; the Walmart link is the special edition. [label, link, label in the old menu]
const RETAIL = [['WALMART SPECIAL EDITION', 'https://www.walmart.com/ip/Cello-s-Gate-Walmart-Exclusive-Hardcover-9781668266922/20417514704'], ['WATERSTONES'], ['BARNES &amp; NOBLE', null, 'BARNES &AMP; NOBLE'], ['AMAZON'], ['AUDIBLE']];
const vote = (label) => label === 'VOTE NOW!' ? ' style="color:#a2f590"' : '';
const deskLink = (item) => item === 'PROGRESS'
  ? `      <div class="mn-drop">
        <a href="javascript:void(0)" class="mn-link" aria-haspopup="true">CURRENT PROGRESS${CARET}</a>
        <div class="mn-dd"><div class="mn-dd-in">
${PROGRESS.map(([l, h, c]) => `          <a href="${U(h)}"${c ? ` class="${c}"` : ''}>${c ? STAR : ''}${l}</a>`).join('\n')}
        </div></div>
      </div>`
  : `      <a href="${U(item[1])}" class="mn-link"${vote(item[0])}>${item[0]}</a>`;
const ovLink = (item) => item === 'PROGRESS'
  ? `  <div class="mn-ovgroup"><span>CURRENT PROGRESS</span>\n${PROGRESS.map(([l, h, c]) => `    <a href="${U(h)}"${c ? ` class="${c}"` : ''}>${l}</a>`).join('\n')}\n  </div>`
  : `  <a href="${U(item[1])}"${vote(item[0])}>${item[0]}</a>`;

function nav(s, file) {
  const [a] = cut(s, '<nav id="hunt-nav">', '</nav>', `the hunt menu in ${file}`);
  const ov = s.indexOf('<div id="hunt-nav-ov"', a);
  const ovEnd = s.indexOf('</div>', s.indexOf('class="mn-cta">PRE-ORDER', ov)) + 6;
  const old = s.slice(a, ovEnd);
  const burger = old.slice(old.indexOf('<div class="mn-burger"'), old.indexOf('</nav>'));
  const ovHead = old.slice(old.indexOf('<div id="hunt-nav-ov"'), old.indexOf('<a href=', old.indexOf('<div id="hunt-nav-ov"')));
  // Retailer links come from the old menu (they carry their tracking codes), in the new order
  const hrefOf = (name) => { const m = new RegExp('<a href="([^"]+)"[^>]*>' + name + '</a>').exec(old); if (!m) throw new Error(`No ${name} link in ${file}`); return m[1]; };
  const retail = RETAIL.map(([label, href, was]) => `          <a href="${href || hrefOf(was || label)}" target="_blank" rel="noopener">${label}</a>`).join('\n');
  const fresh = `<nav id="hunt-nav">
  <div class="mn-row">
    <a href="${LIVE}" class="mn-logo" aria-label="Maurice Africh home"><img src="${LOGO}" alt="Maurice Africh"></a>
    <div class="mn-right">
      <div class="mn-links">
${LINKS.map(deskLink).join('\n')}
      </div>
      <div class="mn-drop mn-drop-cta">
        <a href="${U('/preorder')}" class="mn-link mn-cta" aria-haspopup="true">PRE-ORDER CELLO'S GATE${CARET}</a>
        <div class="mn-dd"><div class="mn-dd-in">
${retail}
          <a href="${U('/preorder')}" class="mn-all">ALL RETAILERS &rarr;</a>
        </div></div>
      </div>
    </div>
  </div>
  ${burger.trim()}
</nav>
${ovHead.trimEnd()}
  <a href="${LIVE}" class="mn-ovlogo" aria-label="Maurice Africh home"><img src="${LOGO}" alt="Maurice Africh"></a>
${LINKS.map(ovLink).join('\n')}
  <a href="${U('/preorder')}" class="mn-cta">PRE-ORDER CELLO'S GATE</a>
</div>`;
  return s.slice(0, a) + NAV_CSS + fresh + s.slice(ovEnd);
}

// ---------------------------------------------------------------- the Hunt page
const HB = `display:flex;align-items:center;justify-content:center;text-align:center`;
const heroCopy = `<h1 style="font-family:'Atomic Marker',cursive;font-weight:400;color:#fff;font-size:clamp(48px,7.4vw,160px);line-height:1.15;margin:20px 0 28px">WELCOME TO<br>THE HUNT!</h1>
        <div class="h-3ways" style="font-family:'Atomic Marker',cursive;font-weight:400;color:#a2f590;font-size:clamp(28px,3.1vw,50px);line-height:1.15;margin:0 0 26px">THERE ARE 3 WAYS TO WIN!</div>
        <div class="h-ways" style="display:flex;flex-direction:column;gap:20px;max-width:820px">
          <p style="font-size:21px;line-height:1.55;color:#fff;margin:0"><b style="color:#a2f590">Enter the Sweepstakes:</b> 1 Completed Task = 1 Entry into the Sky Pirate Sweepstakes. All you have to do is participate in the hunt, and you will be entered for a chance to win incredible prizes!</p>
          <p style="font-size:21px;line-height:1.55;color:#fff;margin:0"><b style="color:#a2f590">Climb the Leaderboard:</b> Compete against other sky pirates for a spot on the <a href="${U('/leaderboard')}" style="color:#fff;font-weight:700;text-decoration:underline" class="hv0">leaderboard</a>! The top three sky pirates at the end of the hunt will win <a href="${U('/the-treasure')}" style="color:#fff;font-weight:700;text-decoration:underline" class="hv0">the Treasure</a>!</p>
          <p style="font-size:21px;line-height:1.55;color:#fff;margin:0"><b style="color:#a2f590">Join the Crew:</b> If you participate in the hunt (even once), you will be rewarded with all of the rewards unlocked by the crew! Help them rack up points and earn as many rewards as possible! <span style="white-space:nowrap;font-weight:700">Current Unlocked Rewards: <span id="hero-rewards" style="font-weight:700;color:#fff">&hellip;</span></span></p>
        </div>
        `;

const BTN_CSS = `<style>
.h-ways b,.h-ways a,.h-ways p>span{text-transform:uppercase;letter-spacing:.03em}
.h-btns{max-width:1180px;margin:72px auto 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.h-btn{min-width:0;display:flex;align-items:center;justify-content:center;text-align:center;background:#0f2e0a;border:1px solid #f3ead9;box-shadow:4px 5px 0 rgba(0,0,0,.4);color:#fff !important;font-family:'Almarai',sans-serif;font-weight:700;font-size:clamp(13px,1.02vw,16px);letter-spacing:.06em;white-space:nowrap;padding:18px 16px;text-decoration:none !important;transition:transform .15s ease,background .15s ease}
.h-btn:hover{transform:scale(1.04);background:#1a4512}
.h-btn.h-red{background:#c1330a}
.h-btn.h-red:hover{background:#e04a12}
.h-sweep{max-width:1240px;margin:72px auto 0;text-align:center}
.h-sweep>p{font-size:21px;line-height:1.55;color:#fff;max-width:1200px;margin:0 auto 32px;text-wrap:balance}
.h-acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.h-act{text-decoration:none !important;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,background .2s ease;background:rgba(8,34,6,.55);border:1px solid rgba(243,234,217,.6);padding:26px 18px 24px;display:flex;flex-direction:column;align-items:center;gap:10px}
.h-act b{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(22px,2vw,30px);color:#fff;line-height:1.15}
.h-act span{font-family:'Almarai',sans-serif;font-weight:700;font-size:16px;letter-spacing:.08em;color:#a2f590}
.h-act i{display:none;font-style:normal;font-family:'Almarai',sans-serif;font-weight:800;font-size:12px;letter-spacing:.14em;color:#fff;background:#c1330a;border:1px solid #f3ead9;padding:5px 10px}
.h-act.h-now{border-color:#ff4c0f;box-shadow:0 0 0 2px #ff4c0f}
.h-act.h-now i{display:inline-block}
.h-act:hover{transform:scale(1.05);background:rgba(8,34,6,.75);box-shadow:0 10px 24px rgba(0,0,0,.35)}
.h-act.h-now:hover{box-shadow:0 0 0 2px #ff4c0f,0 10px 24px rgba(0,0,0,.35)}
@media (max-width:900px){.h-btns{grid-template-columns:repeat(2,minmax(0,1fr))}.h-btn{font-size:14px;white-space:normal}.h-acts{grid-template-columns:1fr}.h-sweep>p{font-size:19px}}
@media (max-width:420px){.h-btns{grid-template-columns:1fr}}
</style>
`;
const heroButtons = `<div class="h-btns">
      <a href="${U('/preorder')}" class="h-btn h-red">PRE-ORDER CELLO’S GATE</a>
      <a href="${U('/the-hunt#tasks')}" class="h-btn">COMPLETE A TASK</a>
      <a href="${U('/the-hunt#riddles')}" class="h-btn">SOLVE A RIDDLE</a>
      <a href="${U('/lootbox-clue')}" class="h-btn">FIND A LOOT BOX</a>
      <a href="${U('/games')}" class="h-btn">PLAY A GAME</a>
      <a href="${U('/the-hunt#map')}" class="h-btn h-red">CHOOSE YOUR OWN ADVENTURE</a>
    </div>
    <div class="h-sweep">
      <p>During the hunt, there will be three different sweepstakes, each with better/more prizes than the last. All you have to do to enter each sweepstakes is complete 1 task during the allotted time period for that sweepstakes.</p>
      <div class="h-acts">
        <a class="h-act" href="#rewards" data-from="2026-09-21" data-to="2026-09-30"><b>Sweepstakes (Act One)</b><span>SEPTEMBER 21<sup style="font-size:.6em">ST</sup> – SEPTEMBER 30<sup style="font-size:.6em">TH</sup></span><i>OPEN NOW</i></a>
        <a class="h-act" href="#rewards" data-from="2026-10-01" data-to="2026-10-15"><b>Sweepstakes (Act Two)</b><span>OCTOBER 1<sup style="font-size:.6em">ST</sup> – OCTOBER 15<sup style="font-size:.6em">TH</sup></span><i>OPEN NOW</i></a>
        <a class="h-act" href="#rewards" data-from="2026-10-16" data-to="2026-11-01"><b>Sweepstakes (Act Three)</b><span>OCTOBER 16<sup style="font-size:.6em">TH</sup> – NOVEMBER 1<sup style="font-size:.6em">ST</sup></span><i>OPEN NOW</i></a>
      </div>
    </div>
    <script>(function(){
      // Marks the sweepstakes that is open today (New York calendar day).
      var d = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
      var acts = document.querySelectorAll('.h-act');
      // Each sweepstakes box glides down to Rewards Unlocked (Squarespace swallows plain #links).
      for (var j = 0; j < acts.length; j++) acts[j].addEventListener('click', function (e) { var t = document.getElementById('rewards'); if (!t) return; e.preventDefault(); var m = parseFloat(getComputedStyle(t).scrollMarginTop) || 0, go = function () { window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - m, behavior: 'smooth' }); }, n = 0, settle = function () { if (Math.abs(t.getBoundingClientRect().top - m) > 24) go(); if (++n < 6) setTimeout(settle, 700); }; go(); setTimeout(settle, 900); });
      for (var i = 0; i < acts.length; i++) if (d >= acts[i].getAttribute('data-from') && d <= acts[i].getAttribute('data-to')) acts[i].classList.add('h-now');
      // Current Reward Count: the digital rewards the crew has unlocked so far, from the live leaderboard total.
      var el = document.getElementById('hero-rewards'); if (!el || !window.fetch) return;
      var GOAL = 40000, TIERS = [20, 40, 60, 75, 80], BONUS = [{ at: 50000, named: true }, { at: 75000, named: false }];
      fetch('https://africhmaurice.github.io/leaderboard/leaderboard.json?t=' + Math.floor(Date.now() / 300000))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (b) {
          if (!b || typeof b.crewTotal !== 'number') { el.textContent = '?'; return; }
          var pct = b.crewTotal / GOAL * 100, n = 0;
          TIERS.forEach(function (t) { if (pct >= t) n++; });
          BONUS.forEach(function (t) { if (t.named && b.crewTotal >= t.at) n++; });
          var show = function (v) { el.textContent = Math.round(v); };
          if (window.maFillOnView && window.maAnimate) window.maFillOnView(el, function () { window.maAnimate(0, n, 1400, show); });
          else show(n);
        }).catch(function () { el.textContent = '?'; });
    })();</script>`;

// The How to Earn Points table, rebuilt in the new order from the rows it already has.
const T = 'style="color:#c11212;font-weight:700;text-decoration:underline" class="hv7"';
const cell = (title, desc, attr = '') => `<div${attr} style="border:1px solid #111;padding:26px 28px;text-align:left"><div style="font-weight:700;font-size:21px;margin-bottom:8px">${title}</div><div style="font-size:16px;line-height:1.5;font-weight:400">${desc}</div></div>`;
const pts = (html) => `<div style="border:1px solid #111;padding:26px 20px;display:flex;align-items:center;justify-content:center;font-weight:700;letter-spacing:.03em;text-align:center">${html}</div>`;

function pointsTable(s) {
  const open = s.indexOf('<div class="m-table"'); if (open < 0) throw new Error('Could not find the points table');
  const st = s.indexOf('>', open) + 1;
  const end = s.indexOf('\n      </div>\n    </div>\n    <div class="m-ptsnote"', st); if (end < 0) throw new Error('Could not find the end of the points table');
  const lines = s.slice(st, end).split('\n').map((l) => l.trim()).filter(Boolean);
  const rows = {};
  for (let i = 0; i < lines.length; i += 2) {
    const title = lines[i].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    rows[title.slice(0, 18)] = [lines[i], lines[i + 1]];
  }
  const get = (start) => { const k = Object.keys(rows).find((t) => t.startsWith(start)); if (!k) throw new Error(`Points table row "${start}" is missing`); return rows[k]; };
  const retitle = ([d, p], from, to) => [swap(d, from, to, `the title "${from}"`), p];
  const withDesc = ([d, p], from, to) => [swap(d, from, to, `the text "${from.slice(0, 30)}"`), p];

  const order = [
    get('Buy the Book'),
    withDesc(get('Complete a Task'), 'tasks listed below', `<a href="#tasks" ${T}>tasks listed below</a>`),
    withDesc(get('Solve a Riddle'), 'riddles listed below', `<a href="#riddles" ${T}>riddles listed below</a>`),
    [cell(`<a href="${U('/games')}" ${T}>Play a Game</a>`,
      `Play the daily games: <a href="${U('/games')}" ${T}>Skyword</a>, <a href="${U('/sort-the-shelf')}" ${T}>Sort the Shelf</a>, <a href="${U('/book-icons')}" ${T}>Book Icons</a>, and <a href="${U('/crossword')}" ${T}>The Bookish Crossword</a>! Solve today’s puzzle and claim your points right on the game page, no screenshot needed. New puzzles appear every day at midnight EDT.`),
     pts('10–40 POINTS PER GAME<br>(LIMIT: ONCE PER GAME, PER DAY)')],
    retitle(get('Secret Loot Boxes'), '>Secret Loot Boxes<', '>Find a Loot Box<'),
    get('Choose Your Own Ad'),
    retitle(get('Stay in the Know'), '>Stay in the Know<', '>Sign Up for Maurice’s Newsletter<'),
    get('Reading Apps'), get('Libraries'), get('Indie Bookstores'),
    [...withDesc(get('Share the Hunt'), 'to your IG or TikTok story and spread the word!', 'on your social media and spread the word! Accepted accounts: Instagram, TikTok, YouTube, Reddit, X, Threads, and Facebook.').slice(0, 1), pts('25 POINTS<br>(LIMIT: ONCE PER DAY, PER SOCIAL MEDIA ACCOUNT)')],
    retitle(get('Show Off Your Scor'), '>Show Off Your Scorecard<', '>Show Off Your Loot Box Scorecard<'),
    [cell(`<a href="${U('/contests')}" ${T}>Enter a Contest</a>`,
      `Enter the <a href="${U('/contests')}" ${T}>Fan Fiction Contest</a> or the <a href="${U('/contests')}" ${T}>Fan Art Contest</a>! Write a “Sky Pirate” story (500 word minimum, 3,000 word limit, any subgenre, set in the Sky Pirates world), or make “Sky Pirate” fan art: draw a character, sketch a goma, build a model ship. Just make it an honest effort, and you might win a $100 cash prize! Enter as many times as you like.`),
     pts('100 POINTS PER ENTRY')],
    withDesc(retitle(get('Crew Roll Call'), '>Crew Roll Call<', '>Join the Discord Community<'),
      /<a href="#map"[^>]*>Follow Along on the Map<\/a>/.exec(get('Crew Roll Call')[0])?.[0] || 'Follow Along on the Map',
      `<a href="#map" ${T}>Choose Your Own Adventure</a>`),
    [cell(`Reach Level 10, 25, &amp; 50 (Become a Crest Knight)`,
      `Join the <a href="${DISCORD}" target="_blank" rel="noopener" ${T}><i>Trench</i> Community Discord</a> and level up by joining the daily tournament, talking about books, answering daily questions, and more! Reach Level 10 for 50 points, Level 25 for another 100, and Level 50 to become a Crest Knight for another 100 (<a href="${DISCORD}" target="_blank" rel="noopener" ${T}>learn how</a>).<br><br>Or you can cheat your way to Crest Knight: get the Mark of the Crest tattoo, and the title is yours! You’ll have to put some real skin in the game, though. It’s not for everyone! If you’ve already earned your mark, submit proof for points.`),
     pts('LEVEL 10: 50 POINTS<br>LEVEL 25: 100 POINTS<br>LEVEL 50: 100 POINTS')],
  ];
  const body = '\n        ' + order.map(([d, p]) => d + '\n        ' + p).join('\n        ');
  return s.slice(0, st) + body + s.slice(end);
}

function huntPage(s) {
  s = nav(s, 'the Hunt page');

  // Hero: welcome, three ways to win, seven buttons, the three sweepstakes
  const h1 = s.indexOf('<h1 style="font-family:\'Atomic Marker\'');
  const legal = s.indexOf('<p style="font-size:15px;line-height:1.55;color:#0b170f;font-weight:700;font-style:italic;margin:14px 0 0;max-width:820px">The Treasure and Act prizes');
  if (h1 < 0 || legal < 0 || legal < h1) throw new Error('Could not find the hero copy');
  s = s.slice(0, h1) + heroCopy + s.slice(legal).replace('margin:14px 0 0;max-width:820px">The Treasure', 'margin:26px 0 0;max-width:820px">The Treasure');
  const [c1] = cut(s, '<div class="m-ctas"', '<div class="m-prog"', 'the hero buttons');
  const c2 = s.indexOf('<div class="m-prog"', c1);
  s = s.slice(0, c1) + BTN_CSS + heroButtons + '\n    ' + s.slice(c2);

  // How does it work: no tutorial video, new copy, new last box, no "What do points do?"
  const [v1] = cut(s, '<style>\n/* Our play button sits exactly over Loom', '</script>', 'the tutorial video');
  const v2 = s.indexOf('</script>', s.indexOf('id="hunt-video-overlay"', v1)) + '</script>'.length;
  s = s.slice(0, v1) + s.slice(v2).replace(/^\s*\n/, '\n');
  const p1 = s.indexOf('<p style="font-size:26px;line-height:1.6;max-width:1140px;margin:0 auto 40px;color:#111">Assemble a crew');
  const p2 = s.indexOf('<div style="margin:-8px 0 56px;display:flex;justify-content:center">', p1);
  if (p1 < 0 || p2 < 0) throw new Error('Could not find the How does it work copy');
  s = s.slice(0, p1) + `<p style="font-size:26px;line-height:1.6;max-width:1140px;margin:0 auto 56px;color:#111">Join the crew and go on an adventure! There are dozens of ways to earn points. Everyone who enters the hunt is <strong>guaranteed</strong> to win a reward.</p>\n    ` + s.slice(p2);
  s = swap(s, 'Every pre-order receipt, completed task, secret loot box uncovered, and solved riddle will help you unlock rewards, reveal new milestones, and get us one step closer to finding the treasure!',
    'Every pre-order received, completed task, secret loot box found, riddle solved, and game played will help you unlock rewards, reveal new milestones, and get us one step closer to finding the stone!', 'the mechanics copy');
  s = s.replace(/<span>The <strong style="color:#c53200">3 SKY PIRATES<\/strong> with the most points by the end of the hunt will earn <a href="#grand-prize"[^>]*>THE TREASURE<\/a>!<\/span>/,
    () => '<span><strong style="color:#c53200">Complete 1 task and win!</strong><br>It really is that simple.</span>');
  if (!s.includes('Complete 1 task and win!')) throw new Error('Could not find the third mechanics box');
  const [b1] = cut(s, '<div class="m-pointsbox"', '</ul>', 'the What do points do box');
  const b2 = s.indexOf('</div>', s.indexOf('</ul>', b1)) + 6;
  s = s.slice(0, b1).replace(/\s*$/, '\n') + s.slice(b2).replace(/^\s*\n/, '');

  // How to earn points
  s = pointsTable(s);

  // The Share the Hunt task card: once a day on each social media account
  s = swap(s, '50 POINTS PER POST<br>(Limit: Once Per Day)', '50 POINTS PER POST<br>(Limit: Once Per Day, Per Social Media Account)', 'the Share the Hunt card limit');
  s = swap(s, 'hyping up <b>THE TREASURE HUNT</b> and post it on social media.', 'hyping up <b>THE TREASURE HUNT</b> and post it on social media. Accepted accounts: Instagram, TikTok, YouTube, Reddit, X, Threads, and Facebook.', 'the Share the Hunt card text');

  // Build a crew
  s = s.replace(/<p style="margin:0 0 36px">Invite your frens![\s\S]*?<\/p>/, () =>
    `<p style="margin:0 0 36px">Invite your frens, spread the word, make a post on social media, or start a phone bank! The more people who get involved, the more points you earn, and <strong>the more <a href="#rewards" style="color:#c53200;font-weight:700;text-decoration:underline" class="hv7">rewards</a> you unlock.</strong></p>`);
  s = swap(s, '*THERE ARE 13-20 POTENTIAL REWARDS AVAILABLE DURING THE HUNT', '*THERE ARE 20+ POTENTIAL REWARDS AVAILABLE DURING THE HUNT', 'the rewards count line');

  // Follow along -> Choose your own adventure
  s = swap(s, 'data-screen-label="Follow along on the map"', 'data-screen-label="Choose your own adventure"', 'the map section');
  s = swap(s, 'line-height:1.15">FOLLOW ALONG</h2>', 'line-height:1.15">CHOOSE YOUR OWN ADVENTURE</h2>', 'the map heading');
  s = swap(s, 'max-width:1180px;margin:0 auto 90px">The map updates as the crew moves through the hunt. Earn as many points as you can to explore the map, unlock secret paths, discover areas yet unexplored, and find the treasure!</p>',
    `max-width:1180px;margin:0 auto 36px">As you progress through the hunt, you will be presented with choices, votes, dice rolls, games of chance, and more! The maps update as you progress through the hunt.</p>
    <div style="margin:0 0 90px"><a href="${U('/red-city')}" class="mh-cta mh-vote" style="margin-top:0;font-size:18px;padding:18px clamp(70px,10vw,140px)">VOTE NOW!</a></div>`, 'the map copy');

  // The map: white frame bars, and a white VOTE NOW! button with dark red lettering and outline
  {
    const m1 = s.indexOf('<section id="map"'), m2 = s.indexOf('</section>', m1);
    if (m1 < 0 || m2 < 0) throw new Error('Could not find the map section');
    const sec = s.slice(m1, m2), bars = sec.split('#eac9a4').join('#fff');
    if (bars === sec) throw new Error('Could not find the map frame bars');
    s = s.slice(0, m1) + bars + s.slice(m2);
    s = swap(s, '.mh-cta:hover{transform:scale(1.04)}', '.mh-cta:hover{transform:scale(1.04)}\n#map .mh-vote{background:#fff !important;color:#912501 !important;border:2px solid #912501 !important}\n#map .mh-vote:hover{background:#912501 !important;color:#fff !important;border-color:#fff !important}', 'the map button style');
  }

  // Rewards unlocked: dates over each act, new notes
  const ACTS = { 'ACT ONE': 'SEPTEMBER 21<sup style="font-size:.6em">ST</sup> – SEPTEMBER 30<sup style="font-size:.6em">TH</sup>', 'ACT TWO': 'OCTOBER 1<sup style="font-size:.6em">ST</sup> – OCTOBER 15<sup style="font-size:.6em">TH</sup>', 'ACT THREE': 'OCTOBER 16<sup style="font-size:.6em">TH</sup> – NOVEMBER 1<sup style="font-size:.6em">ST</sup>' };
  for (const [act, when] of Object.entries(ACTS)) {
    s = swap(s, `<div class="m-acttitle" style="font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(22px,2.78vw,40px);letter-spacing:.04em;color:#111;text-align:center;margin-bottom:70px">${act}</div>`,
      `<div class="m-acttitle" style="font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(22px,2.78vw,40px);letter-spacing:.04em;color:#111;text-align:center;margin:20px 0 10px">${act}</div>\n        <div class="m-actdate" style="font-family:'Almarai',sans-serif;font-weight:700;font-size:17px;letter-spacing:.08em;color:#c53200;text-align:center;margin:0 0 110px">${when}</div>`, `the ${act} title`);
  }
  // The progress bars: every "reward unlocked" label at the same angle, Acts Two and Three marked every 20%,
  // and no separate "bonus unlock" flag on the stretch-goal bar (its "Next bonus" label says it).
  {
    const r1 = s.indexOf('<section id="rewards"'), r2 = s.indexOf('<!-- ============ THE TREASURE', r1);
    if (r1 < 0 || r2 < 0) throw new Error('Could not find the rewards section');
    let r = s.slice(r1, r2);
    r = r.split('transform:rotate(24deg);transform-origin:right bottom;').join('transform:rotate(40deg);transform-origin:right bottom;');
    const flag = /<div style="position:absolute;top:0;left:100%;width:3px;height:10px;margin-left:-3px;background:#912501"><\/div><div style="position:absolute;bottom:100%;right:0;transform:rotate\(40deg\)[^>]*>BONUS UNLOCK[^<]*<\/div>/;
    if (!flag.test(r)) throw new Error('Could not find the bonus unlock flag');
    r = r.replace(flag, '');
    r = swap(r, '<div class="m-prog" style="display:flex;align-items:center;gap:36px;margin:64px 0 0">', '<div class="m-prog" style="display:flex;align-items:center;gap:36px;margin:30px 0 0">', 'the bonus bar spacing');
    const LAB = (at, cls) => `<div style="position:absolute;top:0;left:${at}%;width:3px;height:12px;background:#c1330a"></div><div${cls ? ' class="rw-tlab"' : ''} style="position:absolute;bottom:100%;left:${at}%;width:0;display:flex;justify-content:flex-end;margin-bottom:8px"><div style="transform:rotate(40deg);transform-origin:right bottom;font-family:'Atomic Marker',cursive;font-size:14px;letter-spacing:.03em;color:#c1330a;white-space:nowrap">REWARD UNLOCKED!</div></div>`;
    for (const act of ['>ACT TWO</div>', '>ACT THREE</div>']) {
      const a = r.indexOf(act);
      const first = r.indexOf('<div style="position:absolute;top:0;left:25%;width:3px;height:12px;background:#c1330a">', a);
      const end = r.indexOf('<div style="position:absolute;top:0;left:100%;width:3px;height:12px;margin-left:-3px;background:#c1330a">', a);
      if (a < 0 || first < 0 || end < first) throw new Error(`Could not find the ${act} markers`);
      r = r.slice(0, first) + LAB(20) + LAB(40) + LAB(60) + LAB(80, true) + r.slice(end);
      // Five markers, so five locked slots
      const list = r.indexOf('<div class="m-list"', a), listEnd = r.indexOf('\n        </div>', list);
      const slots = r.slice(list, listEnd).match(/\n          <div style="width:min\(560px,100%\)[^\n]*/g) || [];
      if (slots.length !== 4) throw new Error(`Expected four locked slots under ${act}`);
      r = r.slice(0, listEnd) + slots[3] + r.slice(listEnd);
    }
    s = s.slice(0, r1) + r + s.slice(r2);
  }
  // The small print under the rewards: two even lines, not one long line and a few stray words
  s = s.replace('<div id="rw-disc" style="font-size:12px;color:#111;max-width:720px;margin:80px auto 0;text-align:center">', '<div id="rw-disc" style="font-size:12px;color:#111;max-width:980px;margin:80px auto 0;text-align:center;text-wrap:balance">');
  if (!s.includes('max-width:980px;margin:80px auto 0;text-align:center;text-wrap:balance')) throw new Error('Could not find the rewards small print');
  s = s.replace(/(<div id="rw-note"[^>]*>)[^<]*(<\/div>)/, (m, a, b) => a + '*Every successful task completed will earn an entry into the sweepstakes!' + b);
  s = s.replace(/<div id="act1-release"[^>]*>[^<]*<\/div>/, () =>
    '<div id="act1-release" style="font-family:\'Almarai\',sans-serif;font-size:16px;color:#111;text-align:center;margin-top:12px">*All rewards will be released at the conclusion of the hunt!</div>');
  if (!s.includes('*All rewards will be released')) throw new Error('Could not find the rewards release note');

  // The Treasure moves to its own page; the book pop-up the hero uses stays here
  const [t1] = cut(s, '  <!-- ============ THE TREASURE ============ -->', '  <!-- ============ ACT 1', 'the Treasure section');
  const t2 = s.indexOf('  <!-- ============ ACT 1', t1);
  const book = /<div id="book-lb"[\s\S]*?<\/div>/.exec(s.slice(t1, t2))[0];
  s = s.slice(0, t1) + '  ' + book + '\n' + s.slice(t2);
  s = s.split('href="#grand-prize"').join(`href="${U('/the-treasure')}"`);

  // Anchors the menu and buttons scroll to
  s = s.replace('<h3 class="m-taskhead" style', '<h3 class="m-taskhead" id="tasks" style');
  s = s.replace('<h3 class="m-taskhead" style', '<h3 class="m-taskhead" id="riddles" style');
  if (!s.includes('id="riddles"')) throw new Error('Could not find the Riddles heading');
  s = s.replace('<style>\n#hunt-nav{', '<style>\n#tasks,#riddles{scroll-margin-top:110px}\n#map,#rewards,#points{scroll-margin-top:90px}\n#hunt-nav{');
  return s;
}

// The Treasure page: the section that left the Hunt page, under the hunt menu.
function treasurePage(hunt, menu) {
  const head = hunt.slice(hunt.indexOf('<style>'), hunt.indexOf('</style>') + 8);
  const [t1] = cut(hunt, '  <!-- ============ THE TREASURE ============ -->', '  <!-- ============ ACT 1', 'the Treasure section');
  let sec = hunt.slice(t1, hunt.indexOf('  <!-- ============ ACT 1', t1));
  sec = sec.replace('padding:110px 72px 100px;text-align:center">', 'padding:150px 72px 80px;text-align:center">');
  // Its own backdrop (one no other page uses) under the brand red at 90%
  const bg = sec.replace(/background:#c9440c url\([^)]*\) center\/cover;/,"background:linear-gradient(rgba(197,50,0,.9),rgba(197,50,0,.9)),url('https://africhmaurice.github.io/site/assets/bg/city-skyline-panorama-as348070597.webp') center/cover;");
  if (bg === sec) throw new Error('Could not find the Treasure background');
  sec = bg;
  sec = sec.replace(/\n  <\/section>\s*$/, `
    <div class="tr-more" style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin:48px 0 0">
      <a href="${U('/leaderboard')}" class="hv1" style="display:inline-block;background:#0f2e0a;border:1px solid #f3ead9;box-shadow:4px 5px 0 rgba(0,0,0,.4);color:#fff;font-family:'Almarai',sans-serif;font-weight:700;font-size:16px;letter-spacing:.08em;padding:18px 34px;text-decoration:none;transition:transform .15s ease">SEE THE LEADERBOARD</a>
      <a href="${U('/the-hunt#tasks')}" class="hv1" style="display:inline-block;background:#0f2e0a;border:1px solid #f3ead9;box-shadow:4px 5px 0 rgba(0,0,0,.4);color:#fff;font-family:'Almarai',sans-serif;font-weight:700;font-size:16px;letter-spacing:.08em;padding:18px 34px;text-decoration:none;transition:transform .15s ease">EARN MORE POINTS</a>
    </div>
  </section>
`);
  const script = hunt.slice(hunt.lastIndexOf('<script>\nwindow.__openBook'), hunt.indexOf('</script>', hunt.lastIndexOf('<script>\nwindow.__openBook')) + 9);
  return `${menu.trim()}\n${head}\n<style>@media (max-width:760px){#grand-prize{padding:120px 22px 80px !important}}</style>\n<div id="hunt-page">\n<div data-screen-label="The Treasure" style="width:100%;overflow-x:hidden">\n${sec}\n</div>\n</div>\n${script}\n${FOOTER_FILL}\n${BLEED('grand-prize')}\n`;
}

// The Questions page: a short form that lands in the Questions tab of the hunt sheet.
function questionsPage(menu) {
  return `${menu.trim()}
<style>
@font-face{font-family:'Atomic Marker';src:url('https://static1.squarespace.com/static/68f0178dd88a7e52ec46ae7e/t/6aa9db35bc4f704c9378c402/1789516598919/Set+Sail+Studios+-+Atomic+Marker+Regular.otf') format('opentype');font-display:block}
html,body{margin:0 !important;padding:0 !important}
#hq{background:linear-gradient(178deg,rgba(10,35,8,.92) 0%,rgba(30,100,23,.9) 60%,rgba(63,163,47,.9) 100%),url(https://africhmaurice.github.io/site/assets/bg/floating-blocks-city-as311317794.webp) center/cover;background-attachment:fixed;padding:150px 24px 48px;font-family:'Almarai',sans-serif;color:#fff}
#hq .hq-in{max-width:720px;margin:0 auto;width:100%}
#hq h1{color:#fff !important}
#hq h1{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(54px,8vw,110px);line-height:1.1;margin:0 0 18px;text-align:center}
#hq .hq-lede{font-size:21px;line-height:1.55;text-align:center;margin:0 auto 44px;max-width:620px}
#hq .hq-lede a{color:#a2f590;font-weight:700}
#hq form{background:rgba(8,34,6,.6);border:1px solid rgba(243,234,217,.5);box-shadow:6px 7px 0 rgba(0,0,0,.35);padding:36px 34px 32px;display:flex;flex-direction:column;gap:8px}
#hq label{font-weight:700;font-size:14px;letter-spacing:.1em;color:#a2f590;margin-top:14px}
#hq label:first-child{margin-top:0}
#hq label small{color:rgba(255,255,255,.65);font-weight:400;letter-spacing:.02em;font-size:13px}
#hq input,#hq textarea{font:inherit;font-size:17px;color:#0b170f;background:#fffffe;border:2px solid #0b170f;padding:12px 14px;border-radius:0;box-sizing:border-box;width:100%}
#hq textarea{min-height:170px;resize:vertical;line-height:1.5}
#hq input:focus,#hq textarea:focus{outline:3px solid #ff4c0f;outline-offset:1px}
#hq button{margin-top:26px;align-self:center;font:inherit;font-weight:800;font-size:17px;letter-spacing:.1em;color:#fff;background:#c1330a;border:1.5px solid #f3ead9;box-shadow:4px 5px 0 rgba(0,0,0,.4);padding:16px 44px;cursor:pointer;transition:transform .15s ease,background .15s ease}
#hq button:hover:not(:disabled){background:#e04a12;transform:scale(1.04)}
#hq button:disabled{opacity:.7;cursor:wait}
#hq .hq-err{margin:12px 0 0;text-align:center;color:#ffc0ab;font-weight:700}
#hq .hq-err:empty{display:none}
#hq .hq-done{text-align:center;padding:24px 0 8px}
#hq .hq-done b{display:block;font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(34px,5vw,54px);margin-bottom:12px}
#hq .hq-done a{display:inline-block;margin-top:22px;color:#fff;background:#c1330a;border:1.5px solid #f3ead9;padding:14px 30px;font-weight:800;letter-spacing:.1em;text-decoration:none}
@media (max-width:900px){#hq{background-attachment:scroll}}
@media (max-width:560px){#hq{padding:110px 16px 48px}#hq form{padding:26px 18px 24px}#hq .hq-lede{font-size:18px}}
</style>
<section id="hq" data-screen-label="Questions">
  <div class="hq-in">
    <h1>QUESTIONS?</h1>
    <p class="hq-lede">Stuck on a task, a riddle, a loot box, or your points? Ask me anything about the hunt and I’ll get back to you by email. You might also find the answer in the <a href="${U('/rules')}">Official Rules</a>.</p>
    <form id="hq-form" novalidate>
      <label for="hq-name">NAME</label>
      <input id="hq-name" autocomplete="given-name" required>
      <label for="hq-email">EMAIL <small>(so I can reply)</small></label>
      <input id="hq-email" type="email" inputmode="email" autocomplete="email" required>
      <label for="hq-handle">HUNT USERNAME <small>(optional)</small></label>
      <input id="hq-handle" placeholder="@yourname" autocomplete="off">
      <label for="hq-q">YOUR QUESTION</label>
      <textarea id="hq-q" required maxlength="4000"></textarea>
      <button type="submit" id="hq-send">SEND MY QUESTION</button>
      <p class="hq-err" id="hq-err" role="alert"></p>
    </form>
  </div>
</section>
<script>
(function () {
  var ENDPOINT = '${ENDPOINT}';
  var form = document.getElementById('hq-form'), err = document.getElementById('hq-err'), btn = document.getElementById('hq-send');
  var val = function (id) { return document.getElementById(id).value.trim(); };
  try { var me = JSON.parse(localStorage.getItem('thLoot:me') || '{}'); if (me.first_name) document.getElementById('hq-name').value = me.first_name; if (me.email) document.getElementById('hq-email').value = me.email; if (me.handle) document.getElementById('hq-handle').value = me.handle; } catch (e) {}
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = { action: 'question', name: val('hq-name'), email: val('hq-email'), handle: val('hq-handle'), question: val('hq-q') };
    if (!p.name) { err.textContent = 'Tell me your name.'; return; }
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(p.email)) { err.textContent = 'That email does not look right.'; return; }
    if (p.question.length < 5) { err.textContent = 'What would you like to ask?'; return; }
    err.textContent = ''; btn.disabled = true; btn.textContent = 'SENDING...';
    send(p, function (res) {
      if (res && res.ok) {
        form.innerHTML = '<div class="hq-done"><b>GOT IT!</b>Thanks, ' + p.name.replace(/[<>&]/g, '') + '. I’ll reply to ' + p.email.replace(/[<>&]/g, '') + ' as soon as I can.<br><a href="${U('/the-hunt#tasks')}">BACK TO THE HUNT</a></div>';
        return;
      }
      btn.disabled = false; btn.textContent = 'TRY AGAIN';
      err.textContent = res && res.error === 'email' ? 'That email does not look right.' : res && res.error === 'question' ? 'What would you like to ask?' : 'The ship is slow today. Give it another go in a moment.';
    });
  });
  // A simple POST, JSONP if that is blocked, and one quiet retry because Apps Script is sometimes slow.
  function send(payload, done, attempt) {
    attempt = attempt || 1;
    var settled = false;
    var finish = function (res) {
      if (settled) return; settled = true;
      var flaky = !res || (!res.ok && (res.error === 'network' || res.error === 'server'));
      if (flaky && attempt < 2) return setTimeout(function () { send(payload, done, attempt + 1); }, 1500);
      done(res);
    };
    try {
      fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(payload) }).then(function (r) { return r.json(); }).then(finish).catch(function () { jsonp(payload, finish); });
    } catch (e) { jsonp(payload, finish); }
  }
  function jsonp(payload, done) {
    var name = 'hqcb' + Math.random().toString(36).slice(2), q = ['callback=' + name];
    for (var k in payload) if (payload[k]) q.push(encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]));
    var s = document.createElement('script');
    var timer = setTimeout(function () { cleanup(); done({ ok: false, error: 'network' }); }, 30000);
    function cleanup() { clearTimeout(timer); delete window[name]; if (s.parentNode) s.parentNode.removeChild(s); }
    window[name] = function (res) { cleanup(); done(res); };
    s.onerror = function () { cleanup(); done({ ok: false, error: 'network' }); };
    s.src = ENDPOINT + '?' + q.join('&');
    document.body.appendChild(s);
  }
})();
</script>
${FOOTER_FILL}
${BLEED('hq')}
`;
}

// On a tall screen Squarespace stretches a short page to the window and paints the rest in its own colour.
// These pages hand that leftover space to the dark footer instead, so there is no big empty band.
const FOOTER_FILL = '<style>#siteWrapper{display:flex !important;flex-direction:column !important}#siteWrapper>*{flex:none}#siteWrapper>#footer-sections{flex:1 0 auto}</style>';
// The Squarespace block around a page keeps the height of its grid cell; let it shrink to the page (as the game pages do).
const BLEED = (id) => `<script>(function(){var p=document.getElementById('${id}'),cw=p&&p.closest('.content-wrapper'),sec=p&&p.closest('.page-section');if(cw){cw.style.paddingTop='0';cw.style.paddingBottom='0';}if(sec)sec.style.minHeight='0';var fe=p&&p.closest('.fluid-engine');if(fe)fe.style.display='block';})();</script>`;

// ---------------------------------------------------------------- the other pages

const EDITS = {
  // mauriceafrich-site pages
  'hunt-menu': (s) => nav(s, 'the hunt menu'),
  'lootbox-clue': (s) => tighten(nav(s, 'the clues page'), 'padding:150px 32px 110px', 'padding:150px 32px 64px', 'the clues page padding'),
  contests: (s) => {
    s = nav(s, 'the contests page');
    // A mood board for the fan art contest: genre inspiration, clearly not Sky Pirates of Imperia artwork
    s = swap(s, '#contests .ct-btn:hover{transform:scale(1.04)}', `#contests .ct-btn:hover{transform:scale(1.04)}
#contests .ct-inspo{max-width:560px;margin:-24px 0 56px;border:1.5px dashed rgba(162,245,144,.6);padding:26px 28px 28px;text-align:center}
#contests .ct-inspo b{display:block;font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(24px,2.2vw,32px);color:#a2f590;margin:0 0 10px}
#contests .ct-inspo p{font-size:16px;line-height:1.55;margin:0 0 18px}
#contests .ct-inspo small{display:block;font-size:13px;line-height:1.5;color:rgba(255,255,255,.75);margin:14px 0 0}
#contests .ct-inspo a{display:inline-block;font-weight:800;font-size:14px;letter-spacing:.1em;color:#0c2308;background:#a2f590;padding:13px 26px;text-decoration:none;box-shadow:4px 5px 0 rgba(0,0,0,.4);transition:transform .15s ease}
#contests .ct-inspo a:hover{transform:scale(1.04)}`, 'the contests button style');
    return swap(s, '    <div><a href="https://www.mauriceafrich.com/points" class="ct-btn">SUBMIT FAN ART</a></div>', `    <div class="ct-inspo">
      <b>NEED SOME INSPIRATION?</b>
      <p>I made a Pinterest board of science fantasy art and illustrations to get your creative juices flowing.</p>
      <a href="https://www.pinterest.com/africhmaurice/science-fantasy-artillustrations/" target="_blank" rel="noopener">SEE THE INSPIRATION BOARD</a>
      <small>Heads up: this isn&rsquo;t Sky Pirates of Imperia artwork. It&rsquo;s inspiration from the genre the sky pirates live in.</small>
    </div>
    <div><a href="https://www.mauriceafrich.com/points" class="ct-btn">SUBMIT FAN ART</a></div>`, 'the fan art submit button');
  },
  rules: (s) => {
    s = nav(s, 'the rules page');
    s = swap(s, "(a) Entries. During each Act, every verified form submission and every correctly solved riddle earns one entry into that Act's sweepstakes.",
      "(a) Entries. During each Act, every verified task completion earns one entry into that Act's sweepstakes. Task completions include verified form submissions, correctly solved riddles, secret loot boxes found, daily game wins, and sealed Choose Your Own Adventure votes.", 'the US entries rule');
    s = swap(s, "(a) Entries. During each Act, every verified form submission and every correctly solved riddle earns one entry into that Act's UK prize draw.",
      "(a) Entries. During each Act, every verified task completion earns one entry into that Act's UK prize draw. Task completions include verified form submissions, correctly solved riddles, secret loot boxes found, daily game wins, and sealed Choose Your Own Adventure votes.", 'the UK entries rule');
    return swap(s, 'treasure box as shown on the Hunt page', `treasure box as shown on <a href="${U('/the-treasure')}">The Treasure page</a>`, 'the Treasure description in the rules');
  },
  // Three buttons under the board, on the same red: teal, green and purple
  leaderboard: (s) => swap(s, '</iframe>', `</iframe>
  <style>
  #lb-more{position:relative;z-index:3;display:flex;flex-wrap:wrap;justify-content:center;gap:20px;padding:8px 16px 64px;background:rgba(193,51,10,.9)}
  #lb-more a{display:inline-block;font-family:'Almarai',sans-serif;font-weight:800;font-size:15px;letter-spacing:.1em;color:#fff;background:#912501;text-decoration:none;border:2px solid #912501;box-shadow:4px 5px 0 rgba(0,0,0,.35);padding:16px 32px;transition:transform .15s ease,background .15s ease,color .15s ease}
  #lb-more a:hover{transform:scale(1.04);background:#fff;color:#912501}
  @media (max-width:560px){#lb-more a{flex:1 1 100%;text-align:center}}
  </style>
  <div id="lb-more">
    <a href="${U('/games')}">PLAY GAMES</a>
    <a href="${U('/lootbox-clue')}">FIND A LOOT BOX</a>
    <a href="${U('/the-treasure')}">SEE THE TREASURE</a>
  </div>`, 'the leaderboard frame'),
  // hunt bot pages (the same edits work on the bot sources and on their published copies)
  'the-hunt': huntPage,
  loot: (s) => swap(tighten(nav(s, 'the loot page'), 'id="loot-boxes" style="padding:150px 72px 100px"', 'id="loot-boxes" style="padding:150px 72px 64px"', 'the loot page padding'), '<a class="lb-btn" href="https://www.mauriceafrich.com/lootbox-clue">See the clues</a>', '<a class="lb-btn" href="https://www.mauriceafrich.com/lootbox-clue">Find another loot box</a>', 'the loot box button'),
  games: (s) => swap(tighten(nav(s, 'the Skyword page'), 'id="daily-word" style="position:relative;overflow-x:hidden;padding:150px 72px 100px', 'id="daily-word" style="position:relative;overflow-x:hidden;padding:150px 72px 64px', 'the Skyword padding'),
    "        : 'Claimed! No screenshot needed. Points land on the leaderboard at the next tally.') + '</p>';\n  }",
    "        : 'Claimed! No screenshot needed. Points land on the leaderboard at the next tally.') + '</p>' +\n      '<a class=\"thw-go\" href=\"https://www.mauriceafrich.com/sort-the-shelf\">CONGRATS! PLAY SORT THE SHELF</a>';\n  }", 'the Skyword claimed message')
    .replace('</style>', '.thw-go{display:inline-block;margin-top:18px;font-family:\'Almarai\',sans-serif;font-weight:800;font-size:15px;letter-spacing:.08em;color:#fffffe !important;background:#c53200;border:2px solid #fffffe;padding:13px 24px;text-decoration:none !important;transition:transform .15s ease}.thw-go:hover{transform:scale(1.04);background:#ff4c0f}\n</style>'),
  redcity: (s) => swap(tighten(s, 'padding-top:clamp(140px,12vw,180px);padding-bottom:110px;', 'padding-top:clamp(140px,12vw,180px);padding-bottom:64px;', 'the vote page padding'), `var NEXT = '<div class="rc-next"><p>Want to find more loot boxes? Follow the clues!</p><a class="rc-cta" href="https://www.mauriceafrich.com/lootbox-clue">SEE THE CLUES</a></div>';`,
    `var NEXT = '<div class="rc-next"><a class="rc-cta" style="white-space:normal;max-width:560px;line-height:1.4" href="${DISCORD}" target="_blank" rel="noopener">JOIN THE DISCORD TO TALK TO OTHER ADVENTURERS AND DISCUSS YOUR VOTE!</a></div>';`, 'the vote page follow-up button'),
};
// The same bottom breathing room on every hunt page (about 64px of padding under the last thing on it).
const tighten = (s, from, to, what) => swap(s, from, to, what);

// The daily games share one script and one frame.
const GAME_NEXT = `var NEXT_GAME = { shelf_sort: ['CONGRATS! PLAY BOOK ICONS', 'https://www.mauriceafrich.com/book-icons'], emoji_reads: ['CONGRATS! PLAY BOOKISH CROSSWORD', 'https://www.mauriceafrich.com/crossword'], crossword: ['CONGRATS! PLAY SKYWORD', 'https://www.mauriceafrich.com/games'] };\n`;
function gameCommon(s) {
  s = swap(s, "  var ME = 'thLoot:me';\n", "  var ME = 'thLoot:me';\n  // After a claimed win: the next game in the rotation.\n  " + GAME_NEXT, 'the games setup');
  return swap(s, "            : 'Claimed! No screenshot needed. Points land on the leaderboard at the next tally.') + '</p>';\n        }",
    "            : 'Claimed! No screenshot needed. Points land on the leaderboard at the next tally.') + '</p>' +\n            (NEXT_GAME[o.key] ? '<a class=\"hg-claim hg-go\" href=\"' + NEXT_GAME[o.key][1] + '\">' + NEXT_GAME[o.key][0] + '</a>' : '');\n        }", 'the games claimed message');
}
const gameFrame = (s) => tighten(nav(s, 'the games frame'), '.hg-section{position:relative;overflow-x:hidden;padding:150px 72px 100px;', '.hg-section{position:relative;overflow-x:hidden;padding:150px 72px 64px;', 'the games padding').replace('.hg-claim:hover{', '.hg-go{text-decoration:none;color:#fffffe !important}\n.hg-claim:hover{');
for (const g of ['game-shelf-sort', 'game-emoji-reads', 'game-crossword', 'game-word-search', 'game-first-lines', 'game-title-scramble']) EDITS[g] = (s) => gameCommon(gameFrame(s));

// ---------------------------------------------------------------- the Apps Script side (Questions tab)
function lootboxGs(s) {
  s = swap(s, "var TAB = { boxes: 'Boxes', claims: 'Claims', card: 'Scorecard', exp: 'Export', games: 'Games', votes: 'Votes', rolls: 'Rolls' };",
    "var TAB = { boxes: 'Boxes', claims: 'Claims', card: 'Scorecard', exp: 'Export', games: 'Games', votes: 'Votes', rolls: 'Rolls', questions: 'Questions' };", 'the tab list');
  s = swap(s, "p.action === 'votecount' ? voteCount_() : p.action === 'roll' ? roll_(p) : claim_(p);",
    "p.action === 'votecount' ? voteCount_() : p.action === 'roll' ? roll_(p) :\n          p.action === 'question' ? question_(p) : claim_(p);", 'the action switch');
  return swap(s, 'function tab_(name) {', `// The Questions page: one row per question, newest at the bottom. Nothing is sent back but ok.
function question_(p) {
  var email = String(p.email || '').trim().toLowerCase();
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) return { ok: false, error: 'email' };
  var q = String(p.question || '').trim().slice(0, 4000);
  if (q.length < 5) return { ok: false, error: 'question' };
  var sheet = tab_(TAB.questions);
  if (sheet.getLastRow() === 0) sheet.appendRow(['asked_at', 'name', 'email', 'handle', 'question', 'answered']);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { sheet.appendRow([stamp_(), String(p.name || '').trim().slice(0, 120), email, normHandle_(p.handle), q, '']); } finally { lock.releaseLock(); }
  return { ok: true };
}

function tab_(name) {`, 'the sheet helpers');
}

// ---------------------------------------------------------------- the loader
// Arriving from another page on a link like /the-hunt#tasks: wait for the loading screen, then glide down to the
// section (stopping clear of the menu), and nudge once more if late images moved it.
function glide(s) {
  const a = s.indexOf('    // Jump, don\'t glide:'), b = s.indexOf('  function mount(el)', a);
  if (a < 0 || b < 0) throw new Error('Could not find the loader scroll');
  return s.slice(0, a) + `    var margin = function () { return parseFloat(getComputedStyle(target).scrollMarginTop) || 0; };
    var y = function () { return target.getBoundingClientRect().top + window.pageYOffset - margin(); };
    window.maAfterLoading(function () {
      setTimeout(function () {
        window.scrollTo({ top: y(), behavior: 'smooth' });
        // Images above it can still be loading and push it down; check back a few times and nudge it into place.
        var tries = 0, settle = function () { if (Math.abs(target.getBoundingClientRect().top - margin()) > 24 && Math.abs(window.pageYOffset - y()) < 4000) window.scrollTo({ top: y(), behavior: 'smooth' }); if (++tries < 5) setTimeout(settle, 900); };
        setTimeout(settle, 1300);
      }, 300);
    });
  }

` + s.slice(b);
}

// ---------------------------------------------------------------- the main site header
// One row: logo, links and the pre-order button side by side; the type shrinks with the window instead of wrapping.
function oneRow(css) {
  if (css.includes('/* One row */')) return css;
  return css + `
/* Date endings (21st, 30th) small and tucked up */
sup { font-size: .42em !important; line-height: 0 !important; vertical-align: .95em !important; }

/* One row (from 1000px wide; narrower desktop windows wrap to two rows) */
@media (min-width: 1000px) {
  #header .header-display-desktop .header-title-nav-wrapper { flex-wrap: nowrap !important; align-items: center !important; }
  #header .header-display-desktop .header-nav, #header .header-display-desktop .header-nav-wrapper { flex: 1 1 auto !important; min-width: 0 !important; }
  #header .header-display-desktop .header-nav-list { flex-wrap: nowrap !important; justify-content: flex-end !important; align-items: center !important; row-gap: 0 !important; }
  #header .header-display-desktop .header-nav-item { margin: 0 clamp(4px, .7vw, 14px) !important; flex: none !important; }
  #header .header-display-desktop .header-nav-item:last-child { margin-right: 0 !important; }
  #header .header-display-desktop .header-nav-item > a,
  #header .header-display-desktop .header-nav-folder-title { font-size: clamp(10.5px, .88vw, 14.4px) !important; white-space: nowrap !important; }
  #header .header-display-desktop .header-title-logo img { max-height: none !important; width: clamp(88px, 8.3vw, 120px) !important; height: auto !important; }
}
`;
}

// ---------------------------------------------------------------- run
const mode = process.argv.includes('--launch') ? 'launch' : process.argv.includes('--stage') ? 'stage' : null;
if (!mode) { console.error('Pass --stage (build the preview) or --launch (apply to the real site).'); process.exit(1); }

if (mode === 'stage') {
  const NEXT = join(ROOT, 'next'), PAGES = join(NEXT, 'pages');
  mkdirSync(PAGES, { recursive: true });
  writeFileSync(join(NEXT, 'loader.js'), glide(readFileSync(join(ROOT, 'loader.js'), 'utf8')));
  writeFileSync(join(NEXT, 'site.css'), oneRow(readFileSync(join(ROOT, 'site.css'), 'utf8')));
  for (const f of readdirSync(join(ROOT, 'pages')).filter((f) => f.endsWith('.html'))) copyFileSync(join(ROOT, 'pages', f), join(PAGES, f));
  const huntSrc = readFileSync(join(ROOT, 'pages/the-hunt.html'), 'utf8');
  for (const [slug, edit] of Object.entries(EDITS)) {
    const f = join(PAGES, slug + '.html');
    if (!existsSync(f)) { console.warn(`! no pages/${slug}.html, skipped`); continue; }
    writeFileSync(f, edit(readFileSync(f, 'utf8')));
    console.log(`✓ next/pages/${slug}.html`);
  }
  const menu = readFileSync(join(PAGES, 'hunt-menu.html'), 'utf8');
  writeFileSync(join(PAGES, 'the-treasure.html'), treasurePage(huntSrc, menu));
  writeFileSync(join(PAGES, 'questions.html'), questionsPage(menu));
  writeFileSync(join(PAGES, 'profile.html'), profilePage(menu));
  console.log('✓ next/pages/the-treasure.html, questions.html, profile.html');
  // Keep clicks inside the preview: live links become their preview pages.
  const PV = site.publicBase + 'preview-next/';
  const SHELLS = { ...LAYOUT, 'red-city': ['redcity'], 'sort-the-shelf': ['game-shelf-sort'], 'book-icons': ['game-emoji-reads'], crossword: ['game-crossword'], 'the-treasure': ['the-treasure'], questions: ['questions'], profile: ['profile'] };
  const inPreview = (slug) => Object.prototype.hasOwnProperty.call(SHELLS, slug === '' ? 'home' : slug);
  const relink = (html) => html.replace(/https:\/\/www\.mauriceafrich\.com(\/[a-z0-9-]*)?(#[a-z0-9-]+)?(?=["'])/gi, (m, path = '/', hash = '') => {
    const slug = path.slice(1);
    return inPreview(slug) ? PV + (slug || 'home') + '.html' + hash : m;
  });
  for (const f of readdirSync(PAGES)) writeFileSync(join(PAGES, f), relink(readFileSync(join(PAGES, f), 'utf8')));
  mkdirSync(join(ROOT, 'preview-next'), { recursive: true });
  const banner = `<div id="ma-preview-bar" style="position:fixed;left:12px;bottom:12px;z-index:2147483647;display:flex;gap:8px;align-items:center;background:rgba(11,23,15,.94);color:#fff;border:1px solid rgba(255,76,15,.6);border-radius:999px;padding:6px 8px 6px 14px;font:600 12px/1.2 system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 6px 20px rgba(0,0,0,.4)">PREVIEW: NEW VERSION<button type="button" onclick="this.parentNode.remove()" aria-label="Hide" style="background:none;border:0;color:#8fa596;font-size:16px;cursor:pointer;padding:0 4px">×</button></div>
<script>document.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); alert('Preview only: forms are switched off here. Nothing was sent.'); }, true);</script>`;
  for (const [page, slugs] of Object.entries(SHELLS)) {
    const from = ['the-treasure', 'questions', 'profile'].includes(page) ? 'contests' : page;
    const res = await fetch(`${LIVE}/${from === 'home' ? '' : from}`, { headers: { 'user-agent': 'Mozilla/5.0 (site preview builder)' } });
    if (!res.ok) { console.error(`✗ ${page}: live page returned ${res.status}`); continue; }
    let html = await res.text();
    const { html: swapped, swapped: n } = swapBlocks(html, slugs, site.publicBase + 'next/loader.js');
    html = swapped.replace(/href="\/([a-z0-9-]*)"(?=[\s>])/gi, (m, slug) => inPreview(slug) ? `href="${PV}${slug || 'home'}.html"` : `href="${LIVE}/${slug}"`);
    html = relink(html).split(site.publicBase + 'loader.js').join(site.publicBase + 'next/loader.js').split(site.publicBase + 'site.css').join(site.publicBase + 'next/site.css');
    // Preview only: hide the three main-menu links that come out in Squarespace at launch (Sky Pirates, About, Press)
    html = html.replace('</head>', '<style>#header .header-nav-item:has(a[href$="#cello"]),#header .header-nav-item:has(a[href$="#about"]),#header .header-nav-item:has(a[href$="#press"]){display:none !important}</style></head>');
    if (page === 'the-treasure') html = html.replace(/<title>[^<]*<\/title>/, '<title>The Treasure — Maurice Africh</title>');
    if (page === 'profile') html = html.replace(/<title>[^<]*<\/title>/,'<title>Treasure Hunter Profile — Maurice Africh</title>');
    if (page === 'questions') html = html.replace(/<title>[^<]*<\/title>/, '<title>Questions — Maurice Africh</title>');
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n<base href="${LIVE}/">\n<meta name="robots" content="noindex,nofollow">`).replace(/<\/body>/i, `${banner}\n</body>`);
    writeFileSync(join(ROOT, 'preview-next', `${page}.html`), html);
    console.log(`✓ preview-next/${page}.html (${n} block${n === 1 ? '' : 's'})`);
  }
  // The Apps Script change, staged next to the real file for pasting at launch
  writeFileSync(join(BOT, 'private', 'lootbox.next.gs'), lootboxGs(readFileSync(join(BOT, 'apps-script/lootbox.gs'), 'utf8')));
  console.log('✓ lootbox.gs with the Questions tab staged in the bot folder (private/lootbox.next.gs)');
}

if (mode === 'launch') {
  const edit = (file, fn) => { const f = resolve(file); writeFileSync(f, fn(readFileSync(f, 'utf8'))); console.log(`✓ ${file.replace(ROOT, '').replace(BOT, 'bot')}`); };
  const huntBefore = readFileSync(join(BOT, 'squarespace-hunt.html'), 'utf8');
  edit(join(ROOT, 'loader.js'), glide);
  edit(join(ROOT, 'site.css'), oneRow);
  for (const slug of ['hunt-menu', 'lootbox-clue', 'contests', 'rules', 'leaderboard']) edit(join(ROOT, 'pages', slug + '.html'), EDITS[slug]);
  edit(join(BOT, 'squarespace-hunt.html'), EDITS['the-hunt']);
  edit(join(BOT, 'squarespace-lootbox.html'), EDITS.loot);
  edit(join(BOT, 'squarespace-wordle.html'), EDITS.games);
  edit(join(BOT, 'squarespace-redcity.html'), EDITS.redcity);
  edit(join(BOT, 'games/redcity.template.html'), EDITS.redcity);
  edit(join(BOT, 'games/_frame.html'), gameFrame);
  edit(join(BOT, 'games/common.js'), gameCommon);
  edit(join(BOT, 'apps-script/lootbox.gs'), lootboxGs);
  // Share the Hunt and the hype post: once per day on each social media account, not once per day in total.
  edit(join(BOT, 'config/rules.json'), (s) => { const r = JSON.parse(s); for (const k of ['share_hunt', 'social_post']) r.categories[k].limit = 'per_item'; return JSON.stringify(r, null, 2) + '\n'; });
  edit(join(BOT, 'scripts/import.mjs'), (s) => swap(s, "  if (rule?.limit === 'per_day') item = dayOf(sub.timestamp);",
    "  if (rule?.limit === 'per_day') item = dayOf(sub.timestamp);\n" +
    "  // Shares count once a day per social media account: the day plus the platform named in the submission\n" +
    "  // (or, when none is named, the proof image, so a second account's share goes to review instead of being refused).\n" +
    "  if (['share_hunt', 'social_post'].includes(category)) {\n" +
    "    const said = norm(`${sub.raw_type} ${sub.raw_item}`);\n" +
    "    const where = [['instagram', /insta|\\big\\b/], ['tiktok', /tik ?tok/], ['youtube', /youtube|\\byt\\b/], ['reddit', /reddit/], ['x', /twitter|\\bx\\b/], ['threads', /threads/], ['facebook', /facebook|\\bfb\\b/]].find(([, re]) => re.test(said));\n" +
    "    item = dayOf(sub.timestamp) + '|' + (where ? where[0] : sub.proof_file || '');\n" +
    "  }", 'the per-day limit in the importer'));
  const menu = readFileSync(join(ROOT, 'pages/hunt-menu.html'), 'utf8');
  writeFileSync(join(ROOT, 'pages/the-treasure.html'), treasurePage(huntBefore, menu));
  writeFileSync(join(ROOT, 'pages/questions.html'), questionsPage(menu));
  writeFileSync(join(ROOT, 'pages/profile.html'), profilePage(menu));
  console.log('✓ pages/the-treasure.html, pages/questions.html, pages/profile.html');
  // The profile data: written next to leaderboard.json at every build
  const LIBLINE = "import { P, ROOT, readJson, readCsvObjects, writeCsvObjects, loadPeople, isExcluded } from './lib.mjs';";
  const WRITE = "  fs.writeFileSync(P.board, JSON.stringify(board, null, 2) + '\\n');";
  edit(join(BOT, 'scripts/build.mjs'), (s) => swap(swap(s, LIBLINE, LIBLINE + "\nimport { profiles } from './profiles.mjs';", 'the build imports'),
    WRITE, WRITE + '\n  profiles();   // the Treasure Hunter Profile data, one entry per player under a hash of their email', 'the board write'));
  console.log('\nNext: rebuild the games (node scripts/build-games.mjs in the bot folder), add the-treasure, questions and profile to site.json and tools/lib.mjs, then npm run publish.');
}
