/* ============================================================
   THE GOLDEN TRAIL (Maurice, 10/31). Loaded on every page by loader.js.
   A hunter with all 151 loot boxes (0 to 150) gets a golden board on their scorecard: 20 empty slots on Ink, with the
   clue for the lowest empty slot at the top. Each clue points to a hidden spot on the site; tapping it drops one golden
   character into its slot. Spots can be found out of order. The 20 characters spell the final clue, which points into
   the hardback, and the nine words there are the password that opens the Golden Loot Box claim.
   Prize (Maurice 11/2): first finder 10,000 points, each finder after that 500 less, never under 1,000.
   Opens 12:00 AM ET on 11/4/26: before then nobody is a finisher on the live site (the local sandbox skips the wait).

   What lives where:
     - The clues, the characters, the password check, and the prize live on the server (web app action "golden"), so
       none of them are in this file or any page.
     - Each spot is installed by its own page: pages push a function onto window.maGoldenQ; it runs only for finishers
       (this browser's scorecard has all 151). It gets this API: G.found(n) records slot n, G.me (email).
     - The board is drawn on /loot by G.board() (called from pages/loot.html once the card has all 151).
   Server answers (all carry ok):
     state  -> {finisher, found:{n:char}, next:{n, clue, style}|null, done, claimed:{place, points}|null}
     find   -> the same state plus {ch, n, fresh}
     claim  -> {ok, place, points} | {ok:false, error:'wrong'|'notdone'|'notfinisher'}
   DRAFT copy (not Maurice's words yet): every line in WORDS below.
   ============================================================ */
(function () {
  if (window.maGolden) return;
  var API = window.MA_GOLDEN_API || 'https://script.google.com/macros/s/AKfycby34PKiGYVbQezaoq9aQ2zXV86qDZ3G7OIzfx7cFsElDpY8YAwT2dPhRf6LAwqBw3UyRA/exec';
  var SITE = 'https://www.mauriceafrich.com';
  var FONT = 'https://africhmaurice.github.io/site/assets/fonts/CrackedImperia-Bold.woff2';
  var WORDS = {
    got: 'Golden character', onBoard: 'It’s on your golden board.', open: 'Open my board', keep: 'Keep looking',
    already: 'You found this one already.', notMe: 'Open your loot box scorecard on this device first, then come back.',
    slow: 'The ship’s log is answering slowly. Tap it again in a moment.',
    eyebrow: 'The Golden Trail', clue: 'Clue', allFound: 'All twenty found. Read them in order.',
    pwLabel: 'The password', pwGo: 'Open the Golden Loot Box', pwWrong: 'That isn’t it.',
    won: 'The gold is yours.', place: function (p) { return p === 1 ? 'First to find it.' : 'Finder number ' + p + '.'; },
    showCard: 'Show my scorecard', showBoard: 'Show the golden trail', loading: 'Opening the board...',
    // DRAFT (11/2): shown to a hunter with all 151 boxes before the trail opens
    waitHead: 'You found every loot box!', waitWhen: 'The Golden Trail opens November 4 at 12:00 AM ET.',
    waitLead: 'Until then, climb the Act Four leaderboard: every game in the Arcade earns 100 points a day.', waitGo: 'Play the Arcade'
  };
  var OPENS = Date.UTC(2026, 10, 4, 5, 0, 0);   // 11/4/26 12:00 AM ET (EST); ?goldenwait=1 previews the waiting card

  function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function keep(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var me = load('thLoot:me') || {}, card = load('thLoot:card') || {};
  var count = Math.max(Number(card.count) || 0, (card.found && card.found.length) || 0);
  var G = {
    me: String(me.email || '').toLowerCase(),
    finisher: !!(me.email && count >= 151 && (Date.now() >= Date.UTC(2026, 10, 4, 5, 0, 0) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))),
    state: load('thGolden:state') || null,
    words: WORDS
  };
  window.maGolden = G;

  function post(payload, done) {
    var settled = false, fin = function (r) { if (!settled) { settled = true; done(r || { ok: false, error: 'network' }); } };
    try {
      fetch(API, { method: 'POST', body: JSON.stringify(payload) }).then(function (r) { return r.json(); }).then(fin, function () { fin(null); });
    } catch (e) { fin(null); }
    setTimeout(function () { fin({ ok: false, error: 'network' }); }, 40000);
  }
  G.ask = function (op, extra, done) {
    var p = { action: 'golden', op: op, email: G.me };
    for (var k in extra || {}) p[k] = extra[k];
    post(p, function (r) {
      if (r && r.ok && r.found) { G.state = r; keep('thGolden:state', r); }
      done && done(r);
    });
  };

  // ---- styles (0px corners, 20px+ padding, gaps of 12px or more) ----
  var css = '@font-face{font-family:"Cracked Imperia";src:url(' + FONT + ') format("woff2");font-weight:100 900;font-display:block;size-adjust:109.5%}' +
    '.gd-toast{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,10,7,.78)}' +
    '.gd-toast *{box-sizing:border-box;border-radius:0}' +
    '.gd-tb{width:min(100%,420px);background:#0b170f;border:2px solid #f2cf5b;box-shadow:0 0 60px rgba(242,207,91,.28);padding:28px 24px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;color:#f3ead9;font-family:Almarai,Arial,sans-serif}' +
    '.gd-ch{text-transform:uppercase;font-family:"Cracked Imperia",Impact,sans-serif;font-size:96px;line-height:1.2;letter-spacing:.03em;color:#f2cf5b;text-shadow:0 0 28px rgba(242,207,91,.65);animation:gdPop .7s cubic-bezier(.2,1.6,.4,1)}' +
    '.gd-k{margin:0;font-weight:800;font-size:13px;line-height:1.4;letter-spacing:.2em;text-transform:uppercase;color:#f2cf5b}' +
    '.gd-p{margin:0;font-size:16px;line-height:1.5;max-width:34ch}' +
    '.gd-row{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}' +
    '.gd-btn{font:800 14px/1.2 Almarai,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#0b170f;background:#f2cf5b;border:2px solid #f2cf5b;padding:12px 20px;cursor:pointer;text-decoration:none;display:inline-block}' +
    '.gd-wait{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}.gd-wait .gd-wt{margin:0;max-width:52ch;font:700 15px/1.5 Almarai,Arial,sans-serif;color:#f3ead9}.gd-wait a.gd-btn{display:inline-block;text-decoration:none;margin-top:8px}' +
    '.gd-btn.gd-2{background:transparent;color:#f3ead9;border-color:rgba(243,234,217,.55)}' +
    '.gd-btn:focus-visible{outline:3px solid #ff4c0f;outline-offset:3px}.gd-btn[disabled]{opacity:.55;cursor:default}' +
    '@keyframes gdPop{0%{transform:scale(.2) translateY(30px);opacity:0}100%{transform:none;opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){.gd-ch,.gd-slot.gd-new b{animation:none}}' +
    /* the board */
    '.gd-board{position:relative;background:#0b170f;border:2px solid #f2cf5b;box-shadow:0 0 50px rgba(242,207,91,.18);padding:28px 24px;display:flex;flex-direction:column;gap:20px;color:#f3ead9;font-family:Almarai,Arial,sans-serif;text-align:center}' +
    '.gd-board *{box-sizing:border-box;border-radius:0}' +
    '.gd-board .gd-k{text-align:center}' +
    '.gd-clue{margin:0;font-size:clamp(20px,3.4vw,28px);line-height:1.4;color:#fffffe;text-wrap:balance}' +
    '.gd-clue:empty{display:none}' +
    /* Clue 3: the bottom half of the letters is missing (Maurice 10/31), so the word is big enough to see that at a glance. */
    '.gd-clue .gd-half{display:block;width:max-content;max-width:100%;margin:16px auto 0;height:.5em;overflow:hidden;line-height:1;font-weight:800;font-size:clamp(46px,10vw,96px);font-size:clamp(46px,14cqw,96px);letter-spacing:.06em;text-transform:uppercase;color:#f2cf5b}' +
    '.gd-clue .gd-flip{display:inline-flex;align-items:center;gap:10px;transform:rotate(180deg)}' +
    '.gd-clue svg{width:.9em;height:1.2em;flex:none}' +
    '.gd-slots{flex:1 1 0;min-height:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(5,minmax(0,1fr));gap:12px}' +
    '.gd-slot{position:relative;min-width:0;min-height:0;background:#101f16;border:1px solid rgba(242,207,91,.4);display:flex;align-items:center;justify-content:center}' +
    '.gd-slot i{position:absolute;top:10px;left:12px;font-style:normal;font-size:14px;line-height:1.2;font-weight:700;color:#9fb3a5;font-variant-numeric:tabular-nums}' +
    '.gd-slot b{font-family:"Cracked Imperia",Impact,sans-serif;font-weight:400;font-size:clamp(36px,10vw,96px);font-size:clamp(36px,14cqw,96px);line-height:1.2;letter-spacing:.03em;color:#f2cf5b;min-height:1.2em}' +
    '.gd-slot.gd-on{border-color:#f2cf5b;background:#1a2a14}' +
    '.gd-slot.gd-next{border-color:#ff4c0f}' +
    '.gd-slot.gd-new b{animation:gdPop .8s cubic-bezier(.2,1.6,.4,1)}' +
    '.gd-pw{display:flex;flex-direction:column;align-items:center;gap:12px}.gd-pw[hidden]{display:none}' +
    '.gd-pw label{font-weight:800;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#f2cf5b}' +
    '.gd-pw input{width:min(100%,560px);font:16px/1.4 Almarai,Arial,sans-serif;color:#fffffe;background:#101f16;border:1px solid rgba(242,207,91,.6);padding:12px 14px;text-align:center}' +
    '.gd-msg{margin:0;min-height:1.5em;font-weight:700;font-size:16px;line-height:1.5}' +
    '.gd-msg.gd-bad{color:#ff4c0f}.gd-msg.gd-good{color:#89fbcb}' +
    '.gd-won{text-transform:uppercase;font-family:"Cracked Imperia",Impact,sans-serif;font-size:clamp(32px,6vw,52px);line-height:1.2;letter-spacing:.03em;color:#f2cf5b;margin:0}' +
    /* the cupboard: the scorecard splits down the middle and its two halves swing on hinges at the outer edges (Maurice 11/3).
       Open, the doors stay out at the sides and the board fills the scorecard's footprint. The real grid stays in the layout
       (hidden while open) so the stage never changes height; shut, the real grid takes over from the door copies. */
    '.gd-stage{position:relative}' +
    '.gd-stage.gd-cup{perspective-origin:50% 50%}' +
    '.gd-inside{position:absolute;inset:0;z-index:1;overflow:hidden;container-type:inline-size;background:#050b07}' +
    '.gd-inside .gd-board{position:absolute;inset:0}' +
    '.gd-door{position:absolute;top:0;bottom:0;width:50%;z-index:3;pointer-events:none;transform-style:preserve-3d;transition:transform 1.6s cubic-bezier(.5,.02,.2,1)}' +
    '.gd-door-l{left:0;transform-origin:0 50%}.gd-door-r{right:0;transform-origin:100% 50%}' +
    '.gd-face,.gd-back,.gd-knob{backface-visibility:hidden;-webkit-backface-visibility:hidden}' +
    '.gd-face,.gd-back{position:absolute;inset:0}' +
    '.gd-face{overflow:hidden}' +
    '.gd-face .lb-grid{position:absolute;top:0;margin:0;max-width:none}.gd-face .lb-cell img{animation:none!important}' +
    '.gd-back{transform:rotateY(180deg);background:#16241a;border:2px solid #f2cf5b;box-shadow:inset 0 0 60px rgba(0,0,0,.65)}' +
    '.gd-knob{position:absolute;top:50%;width:16px;height:16px;margin-top:-8px;border-radius:50%!important;background:#f2cf5b;border:2px solid #0b170f;opacity:0;transition:opacity .3s ease}' +
    '.gd-door-l .gd-knob{right:12px}.gd-door-r .gd-knob{left:12px}' +
    '.gd-door-l .gd-face{box-shadow:inset -1px 0 0 #0b170f}.gd-door-r .gd-face{box-shadow:inset 1px 0 0 #0b170f}' +
    '.gd-cup.gd-ajar .gd-knob{opacity:1}' +
    '.gd-cup.gd-ajar .gd-door-l{transform:rotateY(-4deg);transition-duration:.35s}.gd-cup.gd-ajar .gd-door-r{transform:rotateY(4deg);transition-duration:.35s}' +
    '.gd-cup.gd-open .gd-door-l{transform:rotateY(-114deg);transition-duration:1.6s}.gd-cup.gd-open .gd-door-r{transform:rotateY(114deg);transition-duration:1.6s}' +
    '.gd-cup.gd-shut .gd-door,.gd-cup.gd-shut .gd-inside{visibility:hidden}' +
    '.gd-cup.gd-still .gd-door{transition:none}' +
    '.gd-switch{display:flex;justify-content:center;margin:0 0 20px;scroll-margin-top:110px}' +
    '.gd-switch .gd-btn.gd-2{color:#0b170f;border-color:#0b170f}' +
    '@media (prefers-reduced-motion:reduce){.gd-door,.gd-knob{transition:none!important}}' +
    '@media (max-width:640px){.gd-board{padding:24px 20px}.gd-tb{padding:24px 20px}}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---- the found-it moment ----
  G.toast = function (opts) {
    var old = document.querySelector('.gd-toast'); if (old) old.remove();
    var o = el('div', 'gd-toast'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    var b = el('div', 'gd-tb');
    if (opts.ch) { b.appendChild(el('p', 'gd-k', WORDS.got + ' #' + opts.n)); var c = el('div', 'gd-ch', opts.ch); c.setAttribute('aria-hidden', 'true'); b.appendChild(c); }
    b.appendChild(el('p', 'gd-p', opts.text));
    var row = el('div', 'gd-row');
    if (opts.board) { var a = el('a', 'gd-btn', WORDS.open); a.href = SITE + '/loot#golden'; row.appendChild(a); }
    var x = el('button', 'gd-btn gd-2', WORDS.keep); x.type = 'button'; x.onclick = function () { o.remove(); }; row.appendChild(x);
    b.appendChild(row); o.appendChild(b);
    o.addEventListener('click', function (e) { if (e.target === o) o.remove(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { o.remove(); document.removeEventListener('keydown', esc); } });
    document.body.appendChild(o); x.focus();
  };

  var busy = {};
  G.found = function (n, after) {
    n = Number(n);
    if (!G.finisher) return;
    if (!G.me) return G.toast({ text: WORDS.notMe });
    if (busy[n]) return; busy[n] = 1;
    G.ask('find', { n: n }, function (r) {
      busy[n] = 0;
      if (!r || !r.ok) return G.toast({ text: WORDS.slow });
      G.toast({ n: r.n, ch: r.ch, text: r.fresh ? WORDS.onBoard : WORDS.already, board: !/\/loot\b/.test(location.pathname) });
      if (G.paint) G.paint(r, r.fresh ? r.n : 0);
      after && after(r);
    });
  };

  // ---- spots: pages queue installers; only finishers run them ----
  var Q = window.maGoldenQ || [];
  function run(fn) { if (!G.finisher) return; try { fn(G); } catch (e) { if (window.console) console.warn('golden spot', e); } }
  window.maGoldenQ = { push: run };
  Q.forEach(run);
  // A link from off the site (the shop) carries ?golden=N; the find is recorded here, on the scorecard page.
  var gq = (location.search.match(/[?&]golden=(\d{1,2})\b/) || [])[1];
  if (gq && G.finisher) { var go = function () { G.found(+gq); }, later = window.maAfterLoading || function (f) { f(); }; later(function () { setTimeout(go, 300); }); }   // after the loading screen, so the popup is never behind it

  // ---- the board on /loot ----
  var PHONE = '<svg viewBox="0 0 14 22" aria-hidden="true"><rect x="1" y="1" width="12" height="20" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="5" y="17" width="4" height="1.8" fill="currentColor"/></svg>';
  function clueHtml(next) {
    var t = String(next.clue || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    var head = WORDS.clue + ' #' + next.n + ': ';
    if (next.style === 'half') { var m = t.match(/^(.*\s)?(\S+)$/) || ['', '', t]; return head + (m[1] || '') + '<span class="gd-half">' + m[2] + '</span>'; }
    if (next.style === 'flip') return head + '<span class="gd-flip">' + PHONE + '<span>' + t + '</span></span>';
    return head + t;
  }
  var SWING = 1650;   // ms: the door transition plus a beat
  function calm() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  // Builds the doors and the inside around the grid. Starts shut, showing the real grid. Returns set(open, animate, after) and first(after).
  function cupboard(stage, grid, cardBox, board) {
    var bg = getComputedStyle(cardBox).backgroundColor, drawn = null;
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') bg = '#faf3ef';
    function door(side) {
      var d = el('div', 'gd-door gd-door-' + side), f = el('div', 'gd-face');
      f.style.background = bg; d.appendChild(f); d.appendChild(el('div', 'gd-back')); d.appendChild(el('span', 'gd-knob'));
      d.setAttribute('aria-hidden', 'true'); d.setAttribute('inert', ''); stage.appendChild(d); return d;
    }
    var inside = el('div', 'gd-inside'); inside.appendChild(board); stage.appendChild(inside);
    var l = door('l'), r = door('r');
    // The door faces are copies of the card, lined up with the real grid so the swap can't be seen.
    function fit() {
      var R = stage.getBoundingClientRect(), g = grid.getBoundingClientRect(), left = g.left - R.left;
      stage.style.perspective = Math.max(900, R.width * 2.4) + 'px';
      [[l, left], [r, left - R.width / 2]].forEach(function (p) { var c = p[0].firstChild.firstChild; if (c) { c.style.width = g.width + 'px'; c.style.left = p[1] + 'px'; } });
    }
    function dress() {
      Array.prototype.forEach.call(grid.querySelectorAll('img'), function (m) { m.loading = 'eager'; });
      [l, r].forEach(function (d) {
        var f = d.firstChild, c = grid.cloneNode(true); c.removeAttribute('id'); c.removeAttribute('aria-label'); c.style.visibility = 'visible';
        Array.prototype.forEach.call(c.querySelectorAll('[data-n]'), function (m) { m.removeAttribute('data-n'); });
        f.textContent = ''; f.appendChild(c);
      });
      drawn = grid.firstElementChild; fit();
    }
    function show(open) {
      stage.classList.toggle('gd-open', open); stage.classList.toggle('gd-shut', !open);
      grid.style.visibility = open ? 'hidden' : '';
    }
    stage.classList.add('gd-cup', 'gd-shut'); dress();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage); else window.addEventListener('resize', fit);
    // A swung door reaches past the card; on a phone that must not widen the page.
    var wrap = stage.closest('section') || document.body;
    wrap.style.overflowX = window.CSS && CSS.supports && CSS.supports('overflow-x', 'clip') ? 'clip' : 'hidden';
    function unhide() {   // doors flat over the board, ready to swing
      if (grid.firstElementChild !== drawn) dress();
      stage.classList.remove('gd-shut'); grid.style.visibility = 'hidden'; void stage.offsetWidth;
    }
    return {
      set: function (open, animate, after) {
        if (!animate) {
          stage.classList.add('gd-still'); if (open && grid.firstElementChild !== drawn) dress();
          show(open); void stage.offsetWidth; stage.classList.remove('gd-still');
          return after && after();
        }
        if (open) { unhide(); stage.classList.add('gd-open'); }
        else stage.classList.remove('gd-open');
        setTimeout(function () { if (!open) show(false); after && after(); }, SWING);
      },
      // The very first time: the doors come ajar, knobs and all, then swing wide.
      first: function (after) {
        unhide(); stage.classList.add('gd-ajar');
        setTimeout(function () { stage.classList.add('gd-open'); }, 500);
        setTimeout(function () { stage.classList.remove('gd-ajar'); after && after(); }, 500 + SWING);
      }
    };
  }
  G.board = function (cardBox, grid, sure) {
    // Before the trail opens, a hunter with every box gets the waiting card instead of the board.
    var early = Date.now() < OPENS && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    if (/[?&]goldenwait=1\b/.test(location.search)) early = true;
    if (sure && early) {
      if (!grid || document.getElementById('gd-wait')) return;
      var wait = el('section', 'gd-board gd-wait'); wait.id = 'gd-wait'; wait.setAttribute('aria-label', WORDS.eyebrow);
      wait.innerHTML = '<p class="gd-k">' + WORDS.eyebrow + '</p><p class="gd-clue">' + WORDS.waitHead + '</p><p class="gd-wt">' + WORDS.waitWhen + '</p><p class="gd-wt">' + WORDS.waitLead + '</p>' +
        '<a class="gd-btn" href="https://www.mauriceafrich.com/games">' + WORDS.waitGo + '</a>';
      grid.parentNode.insertBefore(wait, grid);
      return;
    }
    // The card on /loot is the newest word on how many boxes this hunter has, so it can make them a finisher here.
    if (sure && (Date.now() >= Date.UTC(2026, 10, 4, 5, 0, 0) || /^(localhost|127.0.0.1)$/.test(location.hostname))) { G.finisher = true; G.me = G.me || String((load('thLoot:me') || {}).email || '').toLowerCase(); }
    if (!G.finisher || !cardBox || !grid || document.getElementById('gd-board')) return;
    var stage = el('div', 'gd-stage'); grid.parentNode.insertBefore(stage, grid); stage.appendChild(grid);
    var board = el('section', 'gd-board'); board.id = 'gd-board'; board.setAttribute('aria-label', 'The golden board');
    board.innerHTML = '<p class="gd-k">' + WORDS.eyebrow + '</p><p class="gd-clue" aria-live="polite">' + WORDS.loading + '</p><div class="gd-slots"></div><div class="gd-pw" hidden></div>';
    var slots = board.querySelector('.gd-slots'), clue = board.querySelector('.gd-clue'), pw = board.querySelector('.gd-pw');
    for (var i = 1; i <= 20; i++) { var s = el('div', 'gd-slot'); s.innerHTML = '<i>' + i + '</i><b></b>'; slots.appendChild(s); }
    var sw = el('div', 'gd-switch'), swb = el('button', 'gd-btn gd-2', WORDS.showCard); swb.type = 'button'; sw.appendChild(swb);
    stage.parentNode.insertBefore(sw, stage);
    var cup = cupboard(stage, grid, cardBox, board), open = true, turning = false;
    swb.onclick = function () {
      if (turning) return;
      var to = !open, focused = document.activeElement === swb;
      turning = true; swb.disabled = true;
      if (to) { at = 0; clear(); }   // back to the board: a half-tapped spiral starts over
      cup.set(to, !calm(), function () {
        open = to; swb.textContent = to ? WORDS.showCard : WORDS.showBoard;
        turning = false; swb.disabled = false; if (focused) swb.focus();
      });
    };
    // The first time, the card opens by itself with the view brought to it. After that the board is simply there, doors open.
    if (!load('thGolden:opened')) {
      var toCard = function (how) { window.scrollTo({ top: sw.getBoundingClientRect().top + window.pageYOffset - 110, behavior: how }); };
      if (calm()) { keep('thGolden:opened', 1); cup.set(true, false); setTimeout(function () { toCard('auto'); }, 300); }
      else {
        sw.style.visibility = 'hidden';
        var later = window.maAfterLoading || function (f) { f(); };
        later(function () { setTimeout(function () {
          toCard('smooth');
          setTimeout(function () { keep('thGolden:opened', 1); cup.first(function () { sw.style.visibility = ''; }); }, 800);
        }, 900); });
      }
    } else cup.set(true, false);
    if (/#golden/.test(location.hash)) (window.maAfterLoading || function (f) { f(); })(function () { setTimeout(function () { sw.scrollIntoView({ block: 'start' }); }, 300); });

    G.paint = function (s, fresh) {
      var f = s.found || {};
      Array.prototype.forEach.call(slots.children, function (c, k) {
        var n = k + 1, ch = f[n] || '';
        c.querySelector('b').textContent = ch; c.classList.toggle('gd-on', !!ch);
        c.classList.toggle('gd-next', !!(s.next && s.next.n === n));
        c.classList.toggle('gd-new', n === fresh);
        c.setAttribute('aria-label', 'Slot ' + n + (ch ? ': ' + ch : ': empty'));
      });
      if (s.claimed) {
        clue.innerHTML = ''; pw.hidden = false;
        pw.innerHTML = '<p class="gd-won">' + WORDS.won + '</p><p class="gd-msg gd-good">' + WORDS.place(s.claimed.place) + ' +' + Number(s.claimed.points).toLocaleString('en-US') + ' points</p>';
        return;
      }
      clue.innerHTML = s.next ? clueHtml(s.next) : WORDS.allFound;
      pw.hidden = !s.done;
      if (s.done && !pw.firstChild) {
        pw.innerHTML = '<label for="gd-pwin">' + WORDS.pwLabel + '</label><input id="gd-pwin" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="gd-btn">' + WORDS.pwGo + '</button><p class="gd-msg" aria-live="polite"></p>';
        var inp = pw.querySelector('input'), btn = pw.querySelector('button'), msg = pw.querySelector('.gd-msg');
        inp.addEventListener('paste', function (e) { e.preventDefault(); });
        var tryIt = function () {
          if (!inp.value.trim()) return;
          btn.disabled = true; msg.className = 'gd-msg'; msg.textContent = '...';
          G.ask('claim', { pw: inp.value }, function (r) {
            btn.disabled = false;
            if (r && r.ok) { G.ask('state', {}, function (s2) { if (s2 && s2.ok) G.paint(s2, 0); }); return; }
            msg.className = 'gd-msg gd-bad'; msg.textContent = r && r.error === 'wrong' ? WORDS.pwWrong : WORDS.slow;
          });
        };
        btn.onclick = tryIt; inp.onkeydown = function (e) { if (e.key === 'Enter') tryIt(); };
      }
    };
    if (G.state && G.state.found) G.paint(G.state, 0);
    G.ask('state', {}, function (s) { if (s && s.ok) G.paint(s, 0); else if (!G.state) clue.textContent = WORDS.slow; });

    // Slot 6 lives on the card itself: tap the boxes in Fibonacci order (1, 2, 3, 5, 8 ... 144).
    var FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144], at = 0;
    grid.addEventListener('click', function (e) {
      var cell = e.target.closest && e.target.closest('.lb-cell'); if (!cell) return;
      var n = Array.prototype.indexOf.call(grid.children, cell);
      if (n === FIB[at]) { at++; cell.style.outline = '2px solid #f2cf5b'; cell.style.outlineOffset = '-2px'; if (at === FIB.length) { at = 0; G.found(6); clear(); } }
      else { at = n === FIB[0] ? 1 : 0; clear(); if (at) { cell.style.outline = '2px solid #f2cf5b'; cell.style.outlineOffset = '-2px'; } }
    });
    function clear() { Array.prototype.forEach.call(grid.children, function (c) { c.style.outline = ''; }); }
  };
  // /loot drew its card before this file arrived.
  if (window.maGoldenBoardWait) G.board(window.maGoldenBoardWait[0], window.maGoldenBoardWait[1], true);
})();
