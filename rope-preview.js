/* The rope hunt (chapter 14): strands of rope hidden across mauriceafrich.com, to pull Scarlett out of the
   quicksand. The raft hunt again (raft.site.js). Built by scripts/build-rope.mjs from config/rope.json and
   published as rope.js; loader.js loads it on every page while the hunt is open. Each strand sits in empty space
   on its page (never over text or pictures), can be taken once by the first fren to click it, and pays 20 points.
   A fren carries 5. The sheet keeps the count (ropestate, ropeclaim). */
(function () {
  if (window.__rope) return; window.__rope = true;
  var R = {"url":"/pull-her-out","art":["https://africhmaurice.github.io/site/assets/rope/strand.png"],"foundAtLeast":0,"spots":{},"opens":null,"closes":null,"total":100,"perFren":5,"points":20,"kinds":[["strand","a strand of rope"]],"pages":{"/home":[4,38,39,44,47,76,93,95],"/the-hunt":[10,16,17,19,20,30,49,66,81,87],"/adventure":[1,2,22,24,25,41,55,58],"/leaderboard":[54,60,74,83],"/contests":[18,23,35],"/lootbox-clue":[6,40,48,98],"/rules":[8,29,61,67],"/preorder":[5,46,62,68,88,97],"/newsletter":[3,91,92],"/questions":[9,82,85],"/profile":[72,89,100],"/the-treasure":[37,56,96],"/red-city":[15,86],"/the-crew":[12,36,79],"/the-crash":[14,33],"/the-river":[45,51],"/the-raft":[28,80],"/river-mayhem":[71,84,99],"/washed-ashore":[7,34],"/cerunine-attack":[32,53,75],"/the-reunion":[11,77,90],"/the-energy-wave":[13,27,78],"/finding-scarlett":[31,57,63],"/light-on-her-feet":[21,65,73],"/links":[42,59,94],"/press-kit":[26,43],"/act-one-winners":[50,70],"/points":[52,69],"/privacy-policy":[64]},"names":{"/home":"Home","/the-hunt":"The Hunt","/adventure":"The Adventure So Far","/leaderboard":"Leaderboard","/contests":"Contests","/lootbox-clue":"Clues","/rules":"Official Rules","/preorder":"Pre-Order","/newsletter":"Newsletter","/questions":"Questions?","/profile":"Treasure Hunter Profile","/the-treasure":"The Treasure","/red-city":"Shopping in the Red City","/the-crew":"Meet the Crew","/the-crash":"Crash Landing","/the-river":"Fight the Levian","/the-raft":"Cross the River","/river-mayhem":"River Mayhem","/washed-ashore":"Washed Ashore","/cerunine-attack":"Cerunine Attack","/the-reunion":"The Reunion","/the-energy-wave":"The Energy Wave","/finding-scarlett":"Finding Scarlett","/light-on-her-feet":"Light on Her Feet","/links":"Links","/press-kit":"Press Room","/act-one-winners":"Act One Winners","/points":"Submit Points","/privacy-policy":"Privacy Policy"}};
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';
  var ROPE_URL = 'https://www.mauriceafrich.com' + R.url;
  // github.io previews, or ?rope-preview on the live site: every piece shows, and grabbing one is make-believe
  var PREVIEW = /github\.io$/.test(location.hostname) || /[?&]rope-preview/.test(location.search);
  var now = Date.now();
  if (!PREVIEW && (!R.opens || now < Date.parse(R.opens) || (R.closes && now > Date.parse(R.closes)))) return;
  var path = (window.ROPE_PATH || location.pathname).replace(/\/+$/, '') || '/home';
  if (path === R.url) return;
  var here = R.pages[path] || [];
  if (!here.length) return;

  var ME = 'thLoot:me', MINE = 'thRope:mine';
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var me = load(ME) || {}, mineSaved = load(MINE) || {};
  var mine = me.email && mineSaved.email === me.email ? mineSaved.ids || [] : [];
  var taken = {}, found = 0;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function jsonp(payload, done) {
    var name = 'ropecb' + Math.random().toString(36).slice(2), q = ['callback=' + name];
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
  // a placeholder strand (a short length of twisted rope, frayed at both ends) until Maurice's drawings are in
  var STRAND = '<path d="M7 35C14 28 20 31 25 24S35 13 41 12" fill="none" stroke="#0b170f" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M7 35C14 28 20 31 25 24S35 13 41 12" fill="none" stroke="#e2c58f" stroke-width="5.5" stroke-linecap="round"/>' +
    '<path d="M10 30l4 4M15 27l3 5M20 26l3 4M24 21l3 4M28 17l3 4M32 14l3 4M36 12l2 4" stroke="#7a4e1d" stroke-width="1.6"/>' +
    '<path d="M5 37l-2 3M7 38l0 3M41 12l3-2M41 10l2-3" stroke="#0b170f" stroke-width="1.6"/>';
  function kindOf(id) { return R.kinds[(id - 1) % R.kinds.length]; }
  function art(id) { return R.art && R.art.length ? '<img src="' + R.art[(id - 1) % R.art.length] + '" alt="" draggable="false">' : '<svg viewBox="0 0 48 48" aria-hidden="true">' + STRAND + '</svg>'; }

  var css = document.createElement('style');
  css.textContent =
    '#rope-layer{position:absolute;left:0;top:0;width:100%;height:0;z-index:40;pointer-events:none}' +
    // super tiny (Maurice, 2026-10-28): a 16px strand in a 20px button, centered in the 48px spot the placer keeps clear
    '.rope-piece{position:absolute;width:20px;height:20px;padding:2px;margin:14px 0 0 14px;border:0;border-radius:0;background:none;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 0 3px rgba(255,214,140,.95)) drop-shadow(0 3px 4px rgba(11,23,15,.45));animation:ropeBob 2.6s ease-in-out infinite;transition:transform .35s ease,opacity .35s ease}' +
    '.rope-piece svg,.rope-piece img{display:block;width:16px;height:16px;object-fit:contain}' +
    '.rope-piece:hover,.rope-piece:focus-visible{transform:scale(1.3);outline:none}' +
    // a fren with all 5 still sees the pieces left, but can't take them (Maurice, 2026-10-07)
    '.rope-full .rope-piece{cursor:default;pointer-events:none}' +
    // the more the frens find, the harder the rest are to see (Maurice, 2026-10-07): at 50 found no glow and no bobbing,
    // with 25 left the pieces fade to 25%, and with the final 10 left, to 10%
    '.rope-hard .rope-piece{filter:none;animation:none;rotate:0deg;translate:0 0}' +
    '.rope-faint .rope-piece{opacity:.25}' +
    '.rope-ghost .rope-piece{opacity:.1}' +
    '.rope-full .rope-piece:hover{transform:none}' +
    '.rope-piece.rope-gone{opacity:0;transform:translateY(-40px) scale(.6);pointer-events:none}' +
    '@keyframes ropeBob{0%,100%{translate:0 0;rotate:-6deg}50%{translate:0 -5px;rotate:6deg}}' +
    '@media (prefers-reduced-motion:reduce){.rope-piece{animation:none}}' +
    '#rope-pop{position:fixed;left:50%;bottom:24px;z-index:2147483000;box-sizing:border-box;width:min(440px,calc(100vw - 32px));transform:translateX(-50%);background:#0b170f;color:#f3ead9;border:2px solid #89fbcb;border-radius:0;padding:22px 24px;font-family:Almarai,sans-serif;font-size:16px;line-height:1.5;box-shadow:0 18px 40px rgba(0,0,0,.45);display:grid;gap:14px}' +
    '#rope-pop[hidden]{display:none}' +
    '#rope-pop .rp-k{margin:0;font-weight:800;font-size:12px;letter-spacing:.16em;color:#89fbcb;text-transform:uppercase}' +
    '#rope-pop .rp-h{margin:0;font-family:"Atomic Marker",Almarai,sans-serif;font-weight:400;font-size:28px;line-height:1.25;letter-spacing:.03em;color:#fffffe}' +
    '#rope-pop p{margin:0}' +
    '#rope-pop .rp-row{display:flex;gap:12px;align-items:center}' +
    '#rope-pop .rp-row svg,#rope-pop .rp-row img{flex:none;width:52px;height:52px;object-fit:contain}' +
    '#rope-pop form{display:grid;gap:10px}' +
    '#rope-pop input{box-sizing:border-box;width:100%;font:inherit;font-size:16px;color:#fffffe;background:rgba(255,255,255,.08);border:1px solid rgba(243,234,217,.35);border-radius:0;padding:10px 12px}' +
    '#rope-pop input:focus{outline:2px solid #3adb97;outline-offset:1px}' +
    '#rope-pop .rp-btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '#rope-pop .rp-btn{font:inherit;font-weight:800;font-size:14px;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;padding:11px 18px;border:2px solid #f3ead9;border-radius:0;background:#1a5e41;color:#fffffe;cursor:pointer}' +
    '#rope-pop .rp-btn.ghost{background:none;border-color:rgba(243,234,217,.4)}' +
    '#rope-pop .rp-err{color:#fd7547;font-weight:700}' +
    '#rope-pop .rp-x{position:absolute;top:8px;right:8px;width:36px;height:36px;border:0;background:none;color:#f3ead9;font-size:22px;line-height:1;cursor:pointer}';
  document.head.appendChild(css);

  var layer = document.createElement('div'); layer.id = 'rope-layer';
  var pop = document.createElement('div'); pop.id = 'rope-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-live', 'polite');
  var buttons = {};

  // Where the words and pictures are, so a piece can sit in the gaps between them.
  function busyRects() {
    var out = [], sx = scrollX, sy = scrollY;
    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      var p = n.parentElement; if (!p || p.closest('#rope-layer,#rope-pop,script,style,noscript')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    var range = document.createRange(), n;
    while ((n = walk.nextNode())) {
      range.selectNodeContents(n);
      var rs = range.getClientRects();
      for (var i = 0; i < rs.length; i++) if (rs[i].width && rs[i].height) out.push([rs[i].left + sx, rs[i].top + sy, rs[i].right + sx, rs[i].bottom + sy]);
    }
    Array.prototype.forEach.call(document.querySelectorAll('img,svg,video,iframe,input,select,textarea,button,canvas,[role="button"]'), function (el) {
      if (el.closest('#rope-layer,#rope-pop')) return;
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
    // the busy map is only drawn when a piece still needs an empty spot (hand-placed pieces don't)
    var mapped = !here.some(function (id) { return buttons[id] && !(R.spots || {})[id]; });
    function map() {
      mapped = true;
      busyRects().forEach(function (b) {
        var x0 = Math.max(0, Math.floor(b[0] / C)), x1 = Math.min(cols - 1, Math.floor(b[2] / C)), y0 = Math.max(0, Math.floor(b[1] / C)), y1 = Math.min(rows - 1, Math.floor(b[3] / C));
        for (var gy = y0; gy <= y1; gy++) for (var gx = x0; gx <= x1; gx++) grid[gy * cols + gx] = 1;
      });
    }
    function free(x, y) {
      if (!mapped) map();
      var x0 = Math.max(0, Math.floor((x - pad) / C)), x1 = Math.min(cols - 1, Math.floor((x + S + pad) / C)), y0 = Math.max(0, Math.floor((y - pad) / C)), y1 = Math.min(rows - 1, Math.floor((y + S + pad) / C));
      for (var gy = y0; gy <= y1; gy++) for (var gx = x0; gx <= x1; gx++) if (grid[gy * cols + gx]) return false;
      for (var j = 0; j < placed.length; j++) { var c = placed[j]; if (Math.abs(c[0] - x) < 90 && Math.abs(c[1] - y) < 90) return false; }
      return true;
    }
    here.forEach(function (id, k) {
      var b = buttons[id]; if (!b) return;
      // a hand-placed piece (R.spots) sits on the line of a white box: the last five, moved by Maurice on 2026-10-07
      var pin = (R.spots || {})[id], el = pin && document.querySelectorAll(pin.sel)[pin.i || 0];
      if (el) {
        var r = el.getBoundingClientRect(), L = r.left + scrollX, T = r.top + scrollY, h = S / 2;
        var px = pin.edge === 'left' ? L - h : pin.edge === 'right' ? L + r.width - h : L + r.width * pin.f - h;
        var py = pin.edge === 'top' ? T - h : pin.edge === 'top-in' ? T + 6 : pin.edge === 'bottom' ? T + r.height - h : T + r.height * pin.f - h;
        px = Math.max(16, Math.min(vw - 16 - S, px));
        b.hidden = false; b.style.left = Math.round(px) + 'px'; b.style.top = Math.round(py) + 'px'; placed.push([px, py]);
        return;
      }
      // each piece aims for its own stretch of the page, then looks outward for an empty spot
      var aimY = top0 + (bottom0 - top0) * ((k + 0.15 + hash(id, 1) * 0.7) / here.length), aimX = 16 + (vw - 32 - S) * hash(id, 2);
      var spot = null;
      for (var dy = 0; dy < 4000 && !spot; dy += 24) {
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
      b.type = 'button'; b.className = 'rope-piece'; b.hidden = true;
      b.setAttribute('aria-label', 'A strand of rope');
      b.innerHTML = art(id);
      b.onclick = function () { grab(id); };
      buttons[id] = b; layer.appendChild(b);
    });
  }
  function lockFull() {
    layer.classList.toggle('rope-hard', found >= 50); layer.classList.toggle('rope-faint', found >= R.total - 25); layer.classList.toggle('rope-ghost', found >= R.total - 10);
    layer.classList.toggle('rope-full', mine.length >= R.perFren); Array.prototype.forEach.call(layer.querySelectorAll('.rope-piece'), function (b) { b.tabIndex = mine.length >= R.perFren ? -1 : 0; }); }
  function drop(id) { var b = buttons[id]; if (!b) return; b.classList.add('rope-gone'); setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400); delete buttons[id]; }

  // ---- the popup: who are you, what you found ----------------------------------------
  function show(html) {
    pop.innerHTML = '<button type="button" class="rp-x" aria-label="Close">×</button>' + html; pop.hidden = false;
    pop.querySelector('.rp-x').onclick = function () { pop.hidden = true; };
  }
  function line() { return '<p>You have <b>' + mine.length + ' of ' + R.perFren + '</b> strands. The frens have found <b>' + found + ' of ' + R.total + '</b>.</p>'; }
  var LINK = '<a class="rp-btn" href="' + ROPE_URL + '">SEE THE RESCUE</a>';
  function askWho(id) {
    show('<p class="rp-k">YOU FOUND A STRAND OF ROPE</p><div class="rp-row">' + art(id) + '<p class="rp-h">Strand ' + id + '!</p></div>' +
      '<p>Tell me who you are so the strand, and its ' + R.points + ' points, go to you. You only do this once.</p>' +
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
      show('<p class="rp-k">YOUR ARMS ARE FULL</p><p class="rp-h">You have all ' + R.perFren + ' strands</p><p>Leave this one for another fren, and tell them where it is. The frens have found <b>' + found + ' of ' + R.total + '</b>.</p><div class="rp-btns">' + LINK + '</div>');
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
        var full = mine.length >= R.perFren; lockFull();
        show('<p class="rp-k">+' + R.points + ' POINTS</p><div class="rp-row">' + art(id) + '<p class="rp-h">You found strand ' + id + '!</p></div>' + line() +
          (full ? '<p>That’s all ' + R.perFren + '. Head to the rescue and roll for the pull.</p>' : '<p>Keep looking. Strands are hidden all over this website.</p>') +
          '<div class="rp-btns">' + (full ? LINK : '<button type="button" class="rp-btn ghost" id="rp-ok">KEEP LOOKING</button>' + LINK) + '</div>');
        var ok = pop.querySelector('#rp-ok'); if (ok) ok.onclick = function () { pop.hidden = true; };
      } else if (res && res.error === 'taken') {
        drop(id);
        show('<p class="rp-k">TOO SLOW</p><p class="rp-h">A fren beat you to it</p><p>Someone else grabbed that one. Keep looking.</p>');
      } else if (res && res.error === 'full') {
        show('<p class="rp-k">YOUR ARMS ARE FULL</p><p class="rp-h">You have all ' + R.perFren + ' strands</p><div class="rp-btns">' + LINK + '</div>');
      } else if (res && (res.error === 'closed' || res.error === 'notopen')) {
        show('<p class="rp-k">THE ROPE HUNT</p><p class="rp-h">' + (res.error === 'closed' ? 'Time’s up' : 'Not yet') + '</p><p>' + (res.error === 'closed' ? 'The rope hunt is over.' : 'The rope hunt hasn’t started yet.') + '</p>');
      } else {
        show('<p class="rp-k">THE STRAND SLIPPED</p><p>That didn’t go through. Give it another click.</p>');
      }
    };
    if (PREVIEW) setTimeout(function () { found++; done({ ok: true, mine: mine.concat([id]), found: found }); }, 700);
    else jsonp({ action: 'ropeclaim', piece: id, email: me.email, first_name: me.first_name, handle: me.handle, platform: me.platform, country: me.country }, done);
  }

  function start() {
    document.body.appendChild(layer); document.body.appendChild(pop);
    // The pieces go out straight away, from what this browser last heard; the sheet answers slowly (20 s or more),
    // and when it does, any piece a fren has taken since drops away (Maurice, 2026-10-07).
    var cached = load('thRope:taken');
    if (cached && cached.ids && Date.now() - cached.at < 6 * 3600000) { cached.ids.forEach(function (t) { taken[t] = true; }); found = cached.ids.length; }
    // the count at the last publish (R.foundAtLeast), so a first visit starts at the right difficulty before the sheet answers
    found = Math.max(found, R.foundAtLeast || 0);
    addPieces(); place(); lockFull();
    // the page keeps settling as code blocks and pictures load, so look again a few times
    var n = 0, t = setInterval(function () { place(); if (++n >= 8) clearInterval(t); }, 2000);
    // a hand-placed piece keeps to its line as the page shifts (pictures and sections load late on the long pages)
    if (here.some(function (id) { return (R.spots || {})[id]; })) setInterval(place, 4000);
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(place, 250); });
    var tries = 0, ready = function (res) {
      // a slow or failed answer is asked again, a few times
      if (!res || !res.ok) { if (++tries < 4) setTimeout(function () { jsonp({ action: 'ropestate', email: me.email || '' }, ready); }, 15000); return; }
      (res.taken || []).forEach(function (id) { if (!taken[id]) { taken[id] = true; drop(id); } });
      found = Math.max((res.taken || []).length, R.foundAtLeast || 0);
      save('thRope:taken', { at: Date.now(), ids: res.taken || [] });
      if (res.mine) { mine = res.mine; if (me.email) save(MINE, { email: me.email, ids: mine }); }
      lockFull(); place();
    };
    if (!PREVIEW) jsonp({ action: 'ropestate', email: me.email || '' }, ready);
  }
  if (document.readyState === 'complete') setTimeout(start, 1500);
  else addEventListener('load', function () { setTimeout(start, 1500); });
})();
