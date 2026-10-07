/* The raft hunt (chapter 6): raft pieces hidden across mauriceafrich.com. Built by scripts/build-raft.mjs
   from config/raft.json and published as raft.js; loader.js loads it on every page while the hunt is open.
   Each piece sits in empty space on its page (never over text or pictures), can be taken once by the first
   fren to click it, and pays 20 points. A fren carries 5. The sheet keeps the count (raftstate, raftclaim). */
(function () {
  if (window.__raft) return; window.__raft = true;
  var R = {"opens":"2026-10-07T16:12:00Z","closes":"2026-10-08T19:00:00Z","total":100,"perFren":5,"points":20,"kinds":[["plank","a plank"],["rope","a coil of rope"],["barrel","a barrel"],["oar","an oar"],["sail","a patch of sailcloth"]],"pages":{"/home":[5,10,13,29,54,56,57,67,90],"/the-hunt":[3,14,19,20,41,43,46,47,49,70,76,80,96],"/adventure":[24,33,40,48,58,69,73,75,77,99],"/leaderboard":[1,39,44,72],"/contests":[2,62,85,93],"/lootbox-clue":[16,17,18,64,71],"/rules":[25,31,37,38,65,95],"/preorder":[15,42,45,84,87,92],"/newsletter":[4,8,74],"/questions":[7,83,89],"/profile":[21,50,79],"/the-treasure":[6,28,32,34],"/red-city":[11,12,22,68],"/the-crew":[9,52,55,97],"/the-crash":[60,81,86,98],"/the-river":[36,51,61,66,94],"/links":[23,30,59],"/press-kit":[26,27,35],"/act-one-winners":[78,82,91],"/points":[88,100],"/privacy-policy":[53,63]},"names":{"/home":"Home","/the-hunt":"The Hunt","/adventure":"The Adventure So Far","/leaderboard":"Leaderboard","/contests":"Contests","/lootbox-clue":"Clues","/rules":"Official Rules","/preorder":"Pre-Order","/newsletter":"Newsletter","/questions":"Questions?","/profile":"Treasure Hunter Profile","/the-treasure":"The Treasure","/red-city":"Shopping in the Red City","/the-crew":"Meet the Crew","/the-crash":"Crash Landing","/the-river":"Fight the Levian","/links":"Links","/press-kit":"Press Room","/act-one-winners":"Act One Winners","/points":"Submit Points","/privacy-policy":"Privacy Policy"}};
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';
  var RAFT_URL = 'https://www.mauriceafrich.com/the-raft';
  // github.io previews, or ?raft-preview on the live site: every piece shows, and grabbing one is make-believe
  var PREVIEW = /github\.io$/.test(location.hostname) || /[?&]raft-preview/.test(location.search);
  var now = Date.now();
  if (!PREVIEW && (!R.opens || now < Date.parse(R.opens) || (R.closes && now > Date.parse(R.closes)))) return;
  var path = (window.RAFT_PATH || location.pathname).replace(/\/+$/, '') || '/home';
  if (path === '/the-raft') return;
  var here = R.pages[path] || [];
  if (!here.length) return;

  var ME = 'thLoot:me', MINE = 'thRaft:mine';
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var me = load(ME) || {}, mineSaved = load(MINE) || {};
  var mine = me.email && mineSaved.email === me.email ? mineSaved.ids || [] : [];
  var taken = {}, found = 0;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function jsonp(payload, done) {
    var name = 'raftcb' + Math.random().toString(36).slice(2), q = ['callback=' + name];
    for (var k in payload) if (payload[k] != null && payload[k] !== '') q.push(encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]));
    var s = document.createElement('script');
    var timer = setTimeout(function () { cleanup(); done({ ok: false, error: 'network' }); }, 30000);
    function cleanup() { clearTimeout(timer); delete window[name]; if (s.parentNode) s.parentNode.removeChild(s); }
    window[name] = function (res) { cleanup(); done(res); };
    s.onerror = function () { cleanup(); done({ ok: false, error: 'network' }); };
    s.src = ENDPOINT + '?' + q.join('&');
    document.body.appendChild(s);
  }

  // ---- the pieces --------------------------------------------------------------------
  var ART = {
    plank: '<rect x="6" y="17" width="36" height="14" fill="#f3ead9" stroke="#0b170f" stroke-width="2.5"/><path d="M10 22h12M26 26h12M14 27h6" stroke="#0b170f" stroke-width="1.6" fill="none"/><circle cx="9.5" cy="24" r="1.4" fill="#0b170f"/><circle cx="38.5" cy="24" r="1.4" fill="#0b170f"/>',
    rope: '<circle cx="24" cy="24" r="15" fill="#f3ead9" stroke="#0b170f" stroke-width="2.5"/><circle cx="24" cy="24" r="9.5" fill="none" stroke="#0b170f" stroke-width="1.8"/><circle cx="24" cy="24" r="4.5" fill="#1a5e41" stroke="#0b170f" stroke-width="1.8"/><path d="M37 30l6 7" stroke="#0b170f" stroke-width="2.5"/>',
    barrel: '<path d="M14 8h20c3 5 4 10 4 16s-1 11-4 16H14c-3-5-4-10-4-16s1-11 4-16z" fill="#f3ead9" stroke="#0b170f" stroke-width="2.5"/><path d="M11 17h26M11 31h26" stroke="#1a5e41" stroke-width="3.5"/><path d="M20 9v30M28 9v30" stroke="#0b170f" stroke-width="1.4"/>',
    oar: '<path d="M8 40L30 18" stroke="#0b170f" stroke-width="6.5" stroke-linecap="square"/><path d="M8 40L30 18" stroke="#f3ead9" stroke-width="3"/><path d="M28 12l8-6 6 6-6 8-8 0z" fill="#1a5e41" stroke="#0b170f" stroke-width="2.5" stroke-linejoin="round"/>',
    sail: '<path d="M10 8h28l-4 32H14z" fill="#f3ead9" stroke="#0b170f" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 16h18M16 24h16M17 32h14" stroke="#0b170f" stroke-width="1.4"/><path d="M24 8v32" stroke="#1a5e41" stroke-width="2"/>'
  };
  function kindOf(id) { return R.kinds[(id - 1) % R.kinds.length]; }
  function art(id) { return '<svg viewBox="0 0 48 48" aria-hidden="true">' + ART[kindOf(id)[0]] + '</svg>'; }

  var css = document.createElement('style');
  css.textContent =
    '#raft-layer{position:absolute;left:0;top:0;width:100%;height:0;z-index:40;pointer-events:none}' +
    '.raft-piece{position:absolute;width:48px;height:48px;padding:4px;margin:0;border:0;border-radius:0;background:none;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 0 6px rgba(137,251,203,.95)) drop-shadow(0 3px 4px rgba(11,23,15,.45));animation:raftBob 2.6s ease-in-out infinite;transition:transform .35s ease,opacity .35s ease}' +
    '.raft-piece svg{display:block;width:40px;height:40px}' +
    '.raft-piece:hover,.raft-piece:focus-visible{transform:scale(1.15);outline:none}' +
    '.raft-piece.raft-gone{opacity:0;transform:translateY(-40px) scale(.6);pointer-events:none}' +
    '@keyframes raftBob{0%,100%{translate:0 0;rotate:-6deg}50%{translate:0 -5px;rotate:6deg}}' +
    '@media (prefers-reduced-motion:reduce){.raft-piece{animation:none}}' +
    '#raft-pop{position:fixed;left:50%;bottom:24px;z-index:2147483000;box-sizing:border-box;width:min(440px,calc(100vw - 32px));transform:translateX(-50%);background:#0b170f;color:#f3ead9;border:2px solid #89fbcb;border-radius:0;padding:22px 24px;font-family:Almarai,sans-serif;font-size:16px;line-height:1.5;box-shadow:0 18px 40px rgba(0,0,0,.45);display:grid;gap:14px}' +
    '#raft-pop[hidden]{display:none}' +
    '#raft-pop .rp-k{margin:0;font-weight:800;font-size:12px;letter-spacing:.16em;color:#89fbcb;text-transform:uppercase}' +
    '#raft-pop .rp-h{margin:0;font-family:"Atomic Marker",Almarai,sans-serif;font-weight:400;font-size:28px;line-height:1.25;letter-spacing:.03em;color:#fffffe}' +
    '#raft-pop p{margin:0}' +
    '#raft-pop .rp-row{display:flex;gap:12px;align-items:center}' +
    '#raft-pop .rp-row svg{flex:none;width:52px;height:52px}' +
    '#raft-pop form{display:grid;gap:10px}' +
    '#raft-pop input{box-sizing:border-box;width:100%;font:inherit;font-size:16px;color:#fffffe;background:rgba(255,255,255,.08);border:1px solid rgba(243,234,217,.35);border-radius:0;padding:10px 12px}' +
    '#raft-pop input:focus{outline:2px solid #3adb97;outline-offset:1px}' +
    '#raft-pop .rp-btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '#raft-pop .rp-btn{font:inherit;font-weight:800;font-size:14px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;padding:11px 18px;border:2px solid #f3ead9;border-radius:0;background:#1a5e41;color:#fffffe;cursor:pointer}' +
    '#raft-pop .rp-btn.ghost{background:none;border-color:rgba(243,234,217,.4)}' +
    '#raft-pop .rp-err{color:#fd7547;font-weight:700}' +
    '#raft-pop .rp-x{position:absolute;top:8px;right:8px;width:36px;height:36px;border:0;background:none;color:#f3ead9;font-size:22px;line-height:1;cursor:pointer}';
  document.head.appendChild(css);

  var layer = document.createElement('div'); layer.id = 'raft-layer';
  var pop = document.createElement('div'); pop.id = 'raft-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-live', 'polite');
  var buttons = {};

  // Where the words and pictures are, so a piece can sit in the gaps between them.
  function busyRects() {
    var out = [], sx = scrollX, sy = scrollY;
    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (!p || p.closest('#raft-layer,#raft-pop,script,style,noscript')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    var range = document.createRange(), n;
    while ((n = walk.nextNode())) {
      range.selectNodeContents(n);
      var rs = range.getClientRects();
      for (var i = 0; i < rs.length; i++) if (rs[i].width && rs[i].height) out.push([rs[i].left + sx, rs[i].top + sy, rs[i].right + sx, rs[i].bottom + sy]);
    }
    Array.prototype.forEach.call(document.querySelectorAll('img,svg,video,iframe,input,select,textarea,button,canvas,[role="button"]'), function (el) {
      if (el.closest('#raft-layer,#raft-pop')) return;
      var r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
      out.push([r.left + sx, r.top + sy, r.right + sx, r.bottom + sy]);
    });
    return out;
  }
  function hash(n, salt) { var x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); }
  function place() {
    var docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), vw = document.documentElement.clientWidth;
    var head = document.querySelector('#header,header'), top0 = head ? head.getBoundingClientRect().bottom + scrollY + 24 : 120;
    var foot = document.querySelector('#footer-sections,footer'), bottom0 = foot ? foot.getBoundingClientRect().top + scrollY - 60 : docH - 200;
    if (bottom0 - top0 < 300) bottom0 = docH - 60;
    // the busy spots go on an 8px grid, so checking a spot is quick even on a long page
    var S = 48, pad = 10, placed = [], C = 8, cols = Math.ceil(vw / C) + 1, rows = Math.ceil(docH / C) + 1, grid = new Uint8Array(cols * rows);
    busyRects().forEach(function (b) {
      var x0 = Math.max(0, Math.floor(b[0] / C)), x1 = Math.min(cols - 1, Math.floor(b[2] / C)), y0 = Math.max(0, Math.floor(b[1] / C)), y1 = Math.min(rows - 1, Math.floor(b[3] / C));
      for (var gy = y0; gy <= y1; gy++) for (var gx = x0; gx <= x1; gx++) grid[gy * cols + gx] = 1;
    });
    function free(x, y) {
      var x0 = Math.max(0, Math.floor((x - pad) / C)), x1 = Math.min(cols - 1, Math.floor((x + S + pad) / C)), y0 = Math.max(0, Math.floor((y - pad) / C)), y1 = Math.min(rows - 1, Math.floor((y + S + pad) / C));
      for (var gy = y0; gy <= y1; gy++) for (var gx = x0; gx <= x1; gx++) if (grid[gy * cols + gx]) return false;
      for (var j = 0; j < placed.length; j++) { var c = placed[j]; if (Math.abs(c[0] - x) < 140 && Math.abs(c[1] - y) < 140) return false; }
      return true;
    }
    here.forEach(function (id, k) {
      var b = buttons[id]; if (!b) return;
      // each piece aims for its own stretch of the page, then looks outward for an empty spot
      var aimY = top0 + (bottom0 - top0) * ((k + 0.15 + hash(id, 1) * 0.7) / here.length), aimX = 16 + (vw - 32 - S) * hash(id, 2);
      var spot = null;
      for (var dy = 0; dy < 900 && !spot; dy += 24) {
        for (var side = 0; side < 2 && !spot; side++) {
          var y = aimY + (side ? -dy : dy); if (y < top0 || y > bottom0) continue;
          for (var dx = 0; dx < vw && !spot; dx += 32) {
            var xs = [aimX + dx, aimX - dx];
            for (var t = 0; t < 2; t++) { var x = xs[t]; if (x >= 16 && x <= vw - 16 - S && free(x, y)) { spot = [x, y]; break; } }
          }
        }
      }
      if (!spot) { b.hidden = true; return; }
      b.hidden = false; placed.push(spot);
      b.style.left = Math.round(spot[0]) + 'px'; b.style.top = Math.round(spot[1]) + 'px';
    });
  }

  function addPieces() {
    here.forEach(function (id) {
      if (taken[id] || buttons[id]) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'raft-piece'; b.hidden = true;
      b.setAttribute('aria-label', 'A raft piece: ' + kindOf(id)[1]);
      b.innerHTML = art(id);
      b.onclick = function () { grab(id); };
      buttons[id] = b; layer.appendChild(b);
    });
  }
  function drop(id) { var b = buttons[id]; if (!b) return; b.classList.add('raft-gone'); setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400); delete buttons[id]; }

  // ---- the popup: who are you, what you found ----------------------------------------
  function show(html) {
    pop.innerHTML = '<button type="button" class="rp-x" aria-label="Close">×</button>' + html; pop.hidden = false;
    pop.querySelector('.rp-x').onclick = function () { pop.hidden = true; };
  }
  function line() { return '<p>You have <b>' + mine.length + ' of ' + R.perFren + '</b> pieces. The frens have found <b>' + found + ' of ' + R.total + '</b>.</p>'; }
  var LINK = '<a class="rp-btn" href="' + RAFT_URL + '">SEE THE RAFT</a>';
  function askWho(id) {
    show('<p class="rp-k">YOU FOUND A RAFT PIECE</p><div class="rp-row">' + art(id) + '<p class="rp-h">' + esc(kindOf(id)[1].replace(/^\w/, function (c) { return c.toUpperCase(); })) + '!</p></div>' +
      '<p>Tell me who you are so the piece, and its ' + R.points + ' points, go to you. You only do this once.</p>' +
      '<form><input id="rp-first" autocomplete="given-name" placeholder="First name" aria-label="First name"><input id="rp-email" type="email" autocomplete="email" placeholder="Email" aria-label="Email">' +
      '<input id="rp-handle" placeholder="Social handle (@you)" aria-label="Social handle"><input id="rp-country" autocomplete="country-name" placeholder="Country" aria-label="Country">' +
      '<p class="rp-err" id="rp-err"></p><div class="rp-btns"><button class="rp-btn" type="submit">GRAB IT</button></div></form>');
    var f = pop.querySelector('form');
    f.onsubmit = function (e) {
      e.preventDefault();
      var p = { first_name: f.querySelector('#rp-first').value.trim(), email: f.querySelector('#rp-email').value.trim(), handle: f.querySelector('#rp-handle').value.trim(), platform: '', country: f.querySelector('#rp-country').value.trim() };
      var err = !p.first_name ? 'A first name, please.' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email) ? 'That email does not look right.' : !p.country ? 'Which country are you hunting from?' : '';
      if (err) { f.querySelector('#rp-err').textContent = err; return; }
      me = p; save(ME, me); grab(id);
    };
  }
  var grabbing = false;
  function grab(id) {
    if (grabbing) return;
    if (!me.email) return askWho(id);
    if (mine.length >= R.perFren) {
      show('<p class="rp-k">YOUR ARMS ARE FULL</p><p class="rp-h">You have all ' + R.perFren + ' pieces</p><p>Leave this one for another fren, and tell them where it is. The frens have found <b>' + found + ' of ' + R.total + '</b>.</p><div class="rp-btns">' + LINK + '</div>');
      return;
    }
    grabbing = true;
    show('<p class="rp-k">GRABBING IT…</p><div class="rp-row">' + art(id) + '<p>Hold on.</p></div>');
    var done = function (res) {
      grabbing = false;
      if (res && res.mine) { mine = res.mine; save(MINE, { email: me.email, ids: mine }); }
      if (res && res.found != null) found = res.found;
      if (res && res.ok) {
        drop(id);
        var full = mine.length >= R.perFren;
        show('<p class="rp-k">+' + R.points + ' POINTS</p><div class="rp-row">' + art(id) + '<p class="rp-h">You found ' + esc(kindOf(id)[1]) + '!</p></div>' + line() +
          (full ? '<p>That’s all ' + R.perFren + '. Head to the raft and roll for the crossing.</p>' : '<p>Keep looking. Pieces are hidden all over this website.</p>') +
          '<div class="rp-btns">' + (full ? LINK : '<button type="button" class="rp-btn ghost" id="rp-ok">KEEP LOOKING</button>' + LINK) + '</div>');
        var ok = pop.querySelector('#rp-ok'); if (ok) ok.onclick = function () { pop.hidden = true; };
      } else if (res && res.error === 'taken') {
        drop(id);
        show('<p class="rp-k">TOO SLOW</p><p class="rp-h">A fren beat you to it</p><p>Someone else grabbed that one. Keep looking.</p>');
      } else if (res && res.error === 'full') {
        show('<p class="rp-k">YOUR ARMS ARE FULL</p><p class="rp-h">You have all ' + R.perFren + ' pieces</p><div class="rp-btns">' + LINK + '</div>');
      } else if (res && (res.error === 'closed' || res.error === 'notopen')) {
        show('<p class="rp-k">THE RAFT HUNT</p><p class="rp-h">' + (res.error === 'closed' ? 'Time’s up' : 'Not yet') + '</p><p>' + (res.error === 'closed' ? 'The raft hunt is over.' : 'The raft hunt hasn’t started yet.') + '</p>');
      } else {
        show('<p class="rp-k">THE PIECE SLIPPED</p><p>That didn’t go through. Give it another click.</p>');
      }
    };
    if (PREVIEW) setTimeout(function () { found++; done({ ok: true, mine: mine.concat([id]), found: found }); }, 700);
    else jsonp({ action: 'raftclaim', piece: id, email: me.email, first_name: me.first_name, handle: me.handle, platform: me.platform, country: me.country }, done);
  }

  function start() {
    document.body.appendChild(layer); document.body.appendChild(pop);
    var ready = function (res) {
      if (res && res.ok) {
        (res.taken || []).forEach(function (t) { taken[t] = true; });
        found = (res.taken || []).length;
        if (res.mine) { mine = res.mine; if (me.email) save(MINE, { email: me.email, ids: mine }); }
      }
      addPieces(); place();
      // the page keeps settling as code blocks and pictures load, so look again a few times
      var n = 0, t = setInterval(function () { place(); if (++n >= 8) clearInterval(t); }, 2000);
      var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(place, 250); });
    };
    if (PREVIEW) ready({ ok: true, taken: [], mine: mine });
    else jsonp({ action: 'raftstate', email: me.email || '' }, ready);
  }
  if (document.readyState === 'complete') setTimeout(start, 1500);
  else addEventListener('load', function () { setTimeout(start, 1500); });
})();
