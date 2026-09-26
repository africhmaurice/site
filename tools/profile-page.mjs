// The Treasure Hunter Profile page (built into pages/profile.html by tools/overhaul.mjs).
// One player's rank, points, entries, days and finds, looked up by email. The data file holds no emails:
// each player sits under a hash of theirs (scripts/profiles.mjs in the hunt bot writes it at each tally).
export function profilePage(menu) {
  return `${menu.trim()}
<style>
@font-face{font-family:'Atomic Marker';src:url('https://static1.squarespace.com/static/68f0178dd88a7e52ec46ae7e/t/6aa9db35bc4f704c9378c402/1789516598919/Set+Sail+Studios+-+Atomic+Marker+Regular.otf') format('opentype');font-display:block}
html,body{margin:0 !important;padding:0 !important}
#hp{--ink:#0b170f;--violet:#482d85;--lav:#c3a6ff;--ember:#ff4c0f;--red:#c53200;--hi:#c53200;--hitext:#fd7547;--cream:#f3ead9;
  background:linear-gradient(rgba(29,16,58,.9),rgba(29,16,58,.93)),url(https://africhmaurice.github.io/site/assets/bg/overgrown-sphere-as470076105.webp) center/cover;background-attachment:fixed;
  padding:150px 24px 72px;font-family:'Almarai',sans-serif;color:#fff}
#hp .hp-in{max-width:810px;margin:0 auto}
#hp .hp-eyebrow{font-family:'Atomic Marker',cursive;font-size:clamp(22px,2.4vw,34px);color:var(--lav);text-align:center;margin:0 0 6px}
#hp h1{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(46px,6.6vw,96px);line-height:1.05;margin:0 0 36px;text-align:center}
#hp .hp-example{display:none;max-width:680px;margin:-12px auto 30px;text-align:center;font-weight:800;font-size:13px;letter-spacing:.12em;color:#fff;background:var(--hi);padding:10px 14px}
#hp.is-example .hp-example{display:block}
#hp .hp-find{max-width:560px;margin:0 auto;background:rgba(11,23,15,.55);border:1px solid rgba(195,166,255,.5);padding:30px 30px 26px;text-align:center;box-shadow:6px 7px 0 rgba(0,0,0,.35)}
#hp .hp-find p{font-size:18px;line-height:1.5;margin:0 0 18px}
#hp .hp-find form{display:flex;gap:10px;flex-wrap:wrap}
#hp .hp-find input{flex:1 1 240px;font:inherit;font-size:17px;color:var(--ink);background:#fffffe;border:2px solid var(--ink);padding:12px 14px;border-radius:0}
#hp .hp-find button,#hp .hp-btn{font:inherit;font-weight:800;font-size:15px;letter-spacing:.1em;color:#fff;background:var(--red);border:1.5px solid var(--cream);box-shadow:4px 5px 0 rgba(0,0,0,.4);padding:13px 24px;cursor:pointer;text-decoration:none;display:inline-block;transition:transform .15s ease,background .15s ease}
#hp .hp-find button:hover,#hp .hp-btn:hover{transform:scale(1.04);background:#e04a12}
#hp .hp-find small{display:block;margin-top:14px;font-size:13px;color:rgba(255,255,255,.7);line-height:1.5}
#hp .hp-err{color:#ffc0ab;font-weight:700;min-height:1.3em;margin:12px 0 0}
#hp .hp-card[hidden],#hp .hp-find[hidden]{display:none}
#hp .hp-head{display:flex;align-items:center;gap:22px;margin:0 0 26px}
#hp .hp-name{font-family:'Atomic Marker',cursive;font-size:clamp(34px,4vw,54px);line-height:1}
#hp .hp-sub{margin-top:8px;font-weight:700;font-size:15px;letter-spacing:.08em;color:var(--lav)}
#hp .hp-sub b{display:inline-block;margin-left:10px;color:#fff;background:var(--hi);padding:3px 9px;font-size:12px;letter-spacing:.12em}
#hp .hp-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:0 0 18px}
#hp .hp-tile{background:rgba(11,23,15,.55);border:1px solid rgba(195,166,255,.45);padding:20px 18px;text-align:center}
#hp .hp-tile i{display:block;font-style:normal;font-weight:800;font-size:12px;letter-spacing:.14em;color:var(--lav);margin-bottom:8px}
#hp .hp-tile b{display:block;font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(38px,4vw,58px);line-height:1;color:#fff}
#hp .hp-tile span{display:block;margin-top:8px;font-size:14px;color:rgba(255,255,255,.8)}
#hp .hp-tile.hp-hot{background:var(--red);border-color:var(--cream)}
#hp .hp-tile.hp-hot i{color:#ffd9c4}
#hp .hp-race{background:rgba(11,23,15,.55);border:1px solid rgba(195,166,255,.45);padding:20px 22px;margin:0 0 18px}
#hp .hp-race p{margin:0 0 12px;font-size:17px;line-height:1.5}
#hp .hp-race p a{color:var(--hitext);font-weight:700}
#hp .hp-bar{height:16px;background:rgba(255,255,255,.12);position:relative}
#hp .hp-bar>div{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--red),var(--ember))}
#hp .hp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:0 0 18px}
#hp .hp-stat{background:rgba(72,45,133,.55);border:1px solid rgba(195,166,255,.45);padding:18px 18px 16px;display:flex;flex-direction:column;gap:6px}
#hp .hp-stat i{font-style:normal;font-weight:800;font-size:12px;letter-spacing:.14em;color:var(--lav)}
#hp .hp-stat b{font-family:'Atomic Marker',cursive;font-weight:400;font-size:40px;line-height:1}
#hp .hp-stat b small{font-family:'Almarai',sans-serif;font-weight:700;font-size:18px;color:rgba(255,255,255,.7)}
#hp .hp-stat>small{font-size:14px;color:rgba(255,255,255,.7)}
#hp .hp-stat .hp-bar{height:8px;margin-top:4px}
#hp h2{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(26px,2.6vw,36px);margin:34px 0 14px}
#hp .hp-days{display:grid;grid-template-columns:repeat(21,minmax(0,1fr));gap:6px}
#hp .hp-day{aspect-ratio:1;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14)}
#hp .hp-day.on{background:var(--hi);border-color:#fd7547}
#hp .hp-day.today{outline:2px solid #fff;outline-offset:1px}
#hp .hp-day.later{opacity:.35}
#hp .hp-daykey{margin-top:12px;font-size:14px;color:rgba(255,255,255,.75)}
#hp .hp-daykey b{color:var(--hitext)}
#hp .hp-recent{list-style:none;margin:0;padding:0;border-top:1px solid rgba(195,166,255,.35)}
#hp .hp-recent li{display:flex;gap:16px;align-items:baseline;padding:12px 4px;border-bottom:1px solid rgba(195,166,255,.2);font-size:16px}
#hp .hp-recent time{flex:none;width:92px;color:var(--lav);font-weight:700;font-size:14px;letter-spacing:.04em}
#hp .hp-recent span{flex:1}
#hp .hp-recent b{color:var(--hitext)}
#hp .hp-crew{margin:26px 0 0;text-align:center;font-size:18px;line-height:1.6}
#hp .hp-crew b{color:var(--hitext)}
#hp .hp-more{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin:30px 0 0}
#hp .hp-btn.alt{background:var(--violet)}
#hp .hp-btn.alt:hover{background:#5b3aa6}
#hp .hp-foot{text-align:center;margin:22px 0 0;font-size:13px;color:rgba(255,255,255,.65)}
#hp .hp-foot a{color:#fff;cursor:pointer;text-decoration:underline}
@media (max-width:900px){#hp{background-attachment:scroll}#hp .hp-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}#hp .hp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#hp .hp-days{grid-template-columns:repeat(14,minmax(0,1fr))}}
@media (max-width:560px){#hp{padding:110px 16px 56px}#hp .hp-head{gap:16px}#hp .hp-tile b{font-size:36px}#hp .hp-days{grid-template-columns:repeat(7,minmax(0,1fr))}#hp .hp-recent time{width:74px}}
</style>
<section id="hp" data-screen-label="Treasure Hunter Profile">
  <div class="hp-in">
    <div class="hp-eyebrow">THE TREASURE HUNT</div>
    <h1>TREASURE HUNTER PROFILE</h1>
    <div class="hp-example">EXAMPLE PROFILE: MADE-UP NUMBERS TO SHOW THE DESIGN</div>
    <div class="hp-find" id="hp-find">
      <p>See your rank, points, sweepstakes entries, and everything you’ve found so far.</p>
      <form id="hp-form"><input id="hp-email" type="email" inputmode="email" autocomplete="email" placeholder="The email you use for the hunt" required><button type="submit">SHOW MY PROFILE</button></form>
      <p class="hp-err" id="hp-err" role="alert"></p>
      <small>Your stats update at each tally (10 AM and 7 PM ET). I’ll remember your email on this device.</small>
    </div>
    <div class="hp-card" id="hp-card" hidden></div>
  </div>
</section>
<script>
(function () {
  var DATA = 'https://africhmaurice.github.io/leaderboard/profiles.json', BOARD = 'https://africhmaurice.github.io/leaderboard/leaderboard.json';
  var SALT = 'thp1:', KEY = 'thProfile:email', U = 'https://www.mauriceafrich.com';
  var root = document.getElementById('hp'), card = document.getElementById('hp-card'), find = document.getElementById('hp-find'), err = document.getElementById('hp-err');
  var EXAMPLE = /\\/preview-next\\//.test(location.pathname), BOXES = 51;
  var fmt = function (n) { return Number(n || 0).toLocaleString('en-US'); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (u) { return fetch(u + '?t=' + Math.floor(Date.now() / 300000)).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
  var remember = function (e) { try { e ? localStorage.setItem(KEY, e) : localStorage.removeItem(KEY); } catch (x) {} };
  var saved = function () { try { return localStorage.getItem(KEY) || (JSON.parse(localStorage.getItem('thLoot:me') || '{}').email) || ''; } catch (x) { return ''; } };
  function hash(email) {
    var bytes = new TextEncoder().encode(SALT + email.trim().toLowerCase());
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('').slice(0, 32); });
  }
  function day(iso) { return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  function render(p, crewTotal, board) {
    var today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    var idx = Math.round((Date.parse(today + 'T00:00:00Z') - Date.UTC(2026, 8, 21)) / 86400000);
    var active = (p.days.match(/1/g) || []).length, sofar = Math.max(1, Math.min(42, idx + 1));
    var third = 0, reg = board && board.regions ? board.regions.filter(function (r) { return r.key === p.r; })[0] : null;
    if (reg && reg.top && reg.top[2]) third = reg.top[2].points;
    var race = !p.tr ? 'Keep climbing! The more points you earn, the more rewards the whole crew unlocks.'
      : p.rank <= 3 ? '<b>You’re in Treasure position!</b> The top 3 at the end of the hunt win <a href="' + U + '/the-treasure">The Treasure</a>. Hold on to it!'
      : '<b>' + fmt(p.next) + ' points</b> to pass #' + (p.rank - 1) + (third ? ', and ' + fmt(third - p.pts + 1) + ' to crack the top 3' : '') + '. The top 3 at the end of the hunt win <a href="' + U + '/the-treasure">The Treasure</a>!';
    var pct = third ? Math.min(100, p.pts / third * 100) : 100;
    var days = '';
    for (var i = 0; i < 42; i++) days += '<div class="hp-day' + (p.days.charAt(i) === '1' ? ' on' : '') + (i === idx ? ' today' : '') + (i > idx ? ' later' : '') + '" title="' + day(new Date(Date.UTC(2026, 8, 21 + i)).toISOString().slice(0, 10)) + '"></div>';
    var acts = ['Act One', 'Act Two', 'Act Three'], actNow = today <= '2026-09-30' ? 0 : today <= '2026-10-15' ? 1 : 2;
    card.innerHTML =
      '<div class="hp-head"><div><div class="hp-name">' + esc(p.n || p.h) + '</div>' +
      '<div class="hp-sub">' + esc(p.h) + '<b>' + esc(p.rl).toUpperCase() + ' BOARD</b></div></div></div>' +
      '<div class="hp-tiles">' +
        '<div class="hp-tile hp-hot"><i>RANK</i><b>#' + p.rank + '</b><span>of ' + fmt(p.of) + ' on the board</span></div>' +
        '<div class="hp-tile"><i>POINTS</i><b>' + fmt(p.pts) + '</b><span>and counting</span></div>' +
        '<div class="hp-tile"><i>SWEEPSTAKES ENTRIES</i><b>' + fmt(p.ent) + '</b><span>' + fmt(p.act[actNow]) + ' in ' + acts[actNow] + '</span></div>' +
        '<div class="hp-tile"><i>DAYS ACTIVE</i><b>' + active + '</b><span>of ' + sofar + ' days so far</span></div>' +
      '</div>' +
      '<div class="hp-race"><p>' + race + '</p>' + (p.tr ? '<div class="hp-bar"><div style="width:' + pct.toFixed(1) + '%"></div></div>' : '') + '</div>' +
      '<div class="hp-grid">' +
        '<div class="hp-stat"><i>SECRET LOOT BOXES</i><b>' + p.loot + ' <small>/ ' + BOXES + '</small></b><div class="hp-bar"><div style="width:' + (p.loot / BOXES * 100).toFixed(1) + '%"></div></div></div>' +
        '<div class="hp-stat"><i>DAILY GAME WINS</i><b>' + p.games + '</b><small>Skyword, Sort the Shelf, Book Icons, Crossword</small></div>' +
        '<div class="hp-stat"><i>RIDDLES SOLVED</i><b>' + p.riddles + '</b><small>Every solve is an entry</small></div>' +
        '<div class="hp-stat"><i>ADVENTURE VOTES SEALED</i><b>' + p.votes + '</b><small>Choose Your Own Adventure</small></div>' +
        '<div class="hp-stat"><i>PRE-ORDERS</i><b>' + p.pre + '</b><small>100 points each</small></div>' +
        '<div class="hp-stat"><i>TASKS COMPLETED</i><b>' + p.tasks + '</b><small>Shares, apps, libraries, and more</small></div>' +
      '</div>' +
      '<h2>DAYS ON THE HUNT</h2><div class="hp-days">' + days + '</div><div class="hp-daykey"><span>One square for each day of the hunt, Sept 21 to Nov 1. <b>Red</b> means you earned points that day.</span></div>' +
      '<h2>LATEST LOOT</h2><ul class="hp-recent">' + p.recent.map(function (r) { return '<li><time>' + esc(day(r[0])) + '</time><span>' + esc(r[1]) + '</span><b>+' + fmt(r[2]) + '</b></li>'; }).join('') + '</ul>' +
      '<p class="hp-crew">You’ve earned <b>' + (crewTotal ? (p.pts / crewTotal * 100).toFixed(1) : '0') + '%</b> of the crew’s ' + fmt(crewTotal) + ' points. Every one of them helps unlock rewards for everyone!</p>' +
      '<div class="hp-more"><a class="hp-btn" href="' + U + '/the-hunt#tasks">EARN MORE POINTS</a><a class="hp-btn alt" href="' + U + '/leaderboard">GLOBAL LEADERBOARD</a><a class="hp-btn alt" href="' + U + '/loot">LOOT BOX SCORECARD</a></div>' +
      '<p class="hp-foot">Stats update at each tally (10 AM and 7 PM ET).' + (EXAMPLE ? '' : ' Not you? <a id="hp-switch">Use a different email</a>') + '</p>';
    card.hidden = false; find.hidden = true;
    var sw = document.getElementById('hp-switch');
    if (sw) sw.onclick = function () { remember(''); card.hidden = true; find.hidden = false; document.getElementById('hp-email').value = ''; };
  }
  function lookup(email) {
    err.textContent = 'Looking you up...';
    Promise.all([hash(email), get(DATA), get(BOARD)]).then(function (r) {
      if (!r[1]) { err.textContent = 'The ship is slow today. Give it another go in a moment.'; return; }
      var p = r[1].players && r[1].players[r[0]];
      if (!p) { err.textContent = 'I can’t find that email on the board yet. Points show up after the next tally, so check that it’s the email you used on the forms.'; remember(''); return; }
      if (r[1].boxes) BOXES = r[1].boxes;
      err.textContent = ''; remember(email); render(p, r[1].crewTotal, r[2]);
    });
  }
  document.getElementById('hp-form').addEventListener('submit', function (e) {
    e.preventDefault(); e.stopImmediatePropagation();
    var v = document.getElementById('hp-email').value.trim();
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v)) { err.textContent = 'That email does not look right.'; return; }
    lookup(v);
  });
  if (EXAMPLE) {
    root.classList.add('is-example');
    get(BOARD).then(function (b) {
      render({ n: 'Rosa', h: '@example_pirate', r: 'us', rl: 'United States', tr: true, rank: 7, of: 63, pts: 1780, next: 95, ent: 41, act: [41, 0, 0],
        loot: 23, games: 12, riddles: 5, votes: 1, pre: 2, tasks: 9, days: '111101000000000000000000000000000000000000',
        recent: [['2026-09-26', 'Red City Vote', 50], ['2026-09-26', 'Secret Loot Box', 50], ['2026-09-25', 'Sort the Shelf', 40], ['2026-09-25', 'Book Icons', 25], ['2026-09-24', 'Daily Word Game', 25], ['2026-09-24', 'Solve a Riddle', 25]] },
        (b && b.crewTotal) || 51170, b);
    });
  } else if (saved()) lookup(saved());
  // On a tall screen Squarespace stretches a short page and paints the rest in its own colour; grow this section instead.
  function fit() {
    var foot = document.querySelector('footer, #footer-sections'); if (!root || !foot) return;
    root.style.minHeight = '';
    var gap = foot.getBoundingClientRect().top - root.getBoundingClientRect().bottom;
    if (gap > 1) root.style.minHeight = (root.offsetHeight + gap) + 'px';
  }
  fit(); addEventListener('load', fit); addEventListener('resize', fit); setTimeout(fit, 1500);
  new MutationObserver(function () { setTimeout(fit, 50); }).observe(card, { childList: true });
})();
</script>
`;
}
