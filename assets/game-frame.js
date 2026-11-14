/* Game pages as a sideways row (Maurice, 2026-11-12: "in all the games, remove the full screen button and make the game,
   leaderboard, everything full width and horizontal scrolling"). Like the Arcade and Links pages: each part of the page is
   a full-width, full-height panel in one row (the game first, then How to play, the leaderboards, How it works, the Key,
   and the Arcade switcher last), and scrolling down moves the row sideways (sideways swipes, trackpads, and the arrow keys
   too, but never while the game has the keys). A bar along the bottom has one segment per panel.
   Nothing in a game is changed: its parts are moved, not rebuilt, and they stay inside the game's own block, so its
   scripts still find them; the game itself is scaled with CSS zoom to fit its panel, and the games read pointer positions
   from getBoundingClientRect, which includes the zoom, so aim and taps still line up.
   Maurice, 2026-11-13: on wide screens every panel is only as wide as what's in it, all in one strip with small gaps:
   the name and How it works first, then the game, the leaderboards, the Key (in as many columns as it needs to fit the
   screen's height), and the Arcade. Phones keep one full-width panel at a time.
   Maurice, 2026-11-13 (later): the boxes meet evenly, one top edge and one bottom edge with the same border, the game in a
   frame of its own with room around it, and the Arcade as full-screen tiles (each game's art under its color) that fly in
   from above and below and meet in the middle as you reach it.
   Maurice, 2026-11-13 (Scroll Bar): the row stops on each section, and a bar along the bottom (the Scroll Bar, scarlet to
   teal to violet to green) fills while it holds there, so it's clear the scroll is still going and there's more to see.
   The Arcade holds for about five scrolls before the page moves on, and its tiles play the game trailers.
   Loaded by hand from each game's page file, next to assets/game-frame.css. DRAFT words: HOW TO PLAY, SCROLL. */
(function () {
  try { localStorage.removeItem('ma-game-full'); } catch (e) {}   // the old full-screen switch is gone
  var ownAt = 0, nTo = window.scrollTo.bind(window), wBy = window.scrollBy.bind(window);   // the row's own scrolling (a game's is held back, below)
  function wTo() { ownAt = Date.now(); return nTo.apply(window, arguments); }
  var H1 = '.hg-h1,#daily-word h1,.ar-h1,.fl-h1,#ma-chase .ch-wrap > h1,#ma-gauntlet .sg-wrap > h1,#ma-levian .lv-wrap > h1,#ms-stack .ms-head h1,#ma-holdwall header h1,#ma-skyduel .sd-wrap > h1';
  var ABOUT = '.hg-how,#thw-note,.dbd-line,.hg-more,.hg-next,#thw-next,.hg-eyebrow,.m-eyebrow,.ar-eye,' + H1 + ',.hg-tag,.ar-tag,.fl-how,.ch-sub,.sg-maint,.sg-sub,.lv-lede,.ms-lede,.sd-lede,' +
    '.ar-weekly,.fl-weekly,.ch-weekly,.sg-weekly,.lvb-weekly,.ms-weekly,#ma-holdwall header .lede,#ma-holdwall header .weekly';
  // per page: the game's root block, the part to scale and what rides with it, and the page's other parts (each line is one panel)
  var GAMES = {
    'games':               { root: '#daily-word', zoom: '#daily-word main', how: ['#thw-legend'], parts: ['.dbd-panel'] },   // the color key reads with the words, so the board gets the height
    'game-shelf-sort':     { root: '.hg-section', zoom: '.hg-card', fit: ['.ss-lives', '.ss-tools'], parts: ['.dbd-panel'] },
    'game-emoji-reads':    { root: '.hg-section', zoom: '.hg-card', fit: ['.er-form', '.er-tries'], parts: ['.dbd-panel'] },
    'game-blades-brass':   { root: '.hg-section', zoom: '.hg-card', fit: ['.bb-key', '.bb-tools'], parts: ['.dbd-panel'] },
    'game-matching-auras': { root: '.hg-section', zoom: '.hg-card', fit: ['.ma-tools'], parts: ['.dbd-panel'] },
    'game-crest-quest':    { root: '.hg-section', zoom: '.hg-card', fit: ['.cq-key', '.cq-tools'], parts: ['.dbd-panel'] },
    'game-sky-mines':      { root: '.hg-section', zoom: '.hg-card', fit: ['.sm-bar', '.sm-tools'], parts: ['.dbd-panel'] },
    'airship-runner':      { phoneJoin: [['.ar-ctrls', '.ar-hud']], root: '#ma-runner', zoom: '.ar-wrap', box: ['.ar-hud', '.ar-stage'], snug: true, beside: { host: '.ar-game', items: ['.ar-hud', '.ar-ctrls'] },
                             how: ['.ar-side > .ar-panel:has(.ar-how)'], parts: ['.ar-side > .ar-panel:has(.ar-board)', '.ar-key'] },
    'thread-the-needle':   { root: '#ma-flappy', zoom: '.fl-stage', fit: ['.fl-ctl', '.fl-bar'], parts: ['.fl-panel'] },
    'trench-run':          { phoneLift: ['.ch-hud'], root: '#ma-chase', zoom: '.ch-game', box: ['.ch-hud', '.ch-board'],
                             how: ['.ch-howp'], parts: ['.ch-side > .tr-panel:not(.ch-howp)', 'section.tk'] },
    'sky-gauntlet':        { root: '#ma-gauntlet', zoom: '.sg-game', box: ['.sg-hud', '.sg-stage'], snug: true, beside: { host: '.sg-main', items: ['.sg-modes', '.sg-hud', '.sgb-post'] },
                             how: ['.sg-howp'], parts: ['.sg-side > .sgb-panel:not(.sg-howp)', 'section.sgk'] },
    'the-levian':          { root: '#ma-levian', zoom: '.lv-stage', fit: ['.lv-bar', '.wk-champ'],
                             how: ['.lv-side > .lvb-panel:not(.lvb-local):not(.lvb-boardp)'], parts: [{ sel: '.lvb-local, .lvb-boardp', stack: true }] },
    'master-stacker':      { root: '#ms-stack', zoom: '.ms-play', box: ['.ms-hud', '.ms-cv'], how: ['.ms-how'], parts: [{ sel: '.ms-local, .ms-boardp', stack: true }],
                             side: ['.ms-hud', '.ms-ctrls'], snug: true },   // score and buttons sit over Next up, so the board gets the height
    'master-cannoneer':    { root: '#ma-holdwall', zoom: '.wrap', phoneW: 400, phoneHow: ['.wrap > .help'], squeeze: { sel: '.wrap', min: 1100 }, parts: [{ sel: '.hw-boardrow > section.panel', stack: true }] },
    'sky-fishing':         { root: '#ma-skyduel', zoom: '.sd-wrap', snug: true, phoneW: 600, phoneHow: ['.sd-panel', '.sd-help'], headIn: '.sd-wrap', beside: { host: '.sd-wrap', items: ['.sd-msg', '.sd-weapons', '.sd-pad', '.sd-panel'], wide: true },
                             wideParts: [{ sel: '.sd-help', name: 'How to play' }],   // the long how-to gets a box of its own, so the map and the crew picker keep their size
                             parts: [{ sel: '.gb-row > .gb-card', stack: true }, { sel: '.sd-notes', name: 'Your items' }] }
  };
  var mount = null, cfg = null;
  document.querySelectorAll('[data-ma-page]').forEach(function (m) { var k = m.getAttribute('data-ma-page'); if (GAMES[k]) { mount = m; cfg = GAMES[k]; } });
  if (!mount || mount.querySelector('.gs-stage')) return;   // once per page (the page can be mounted again)
  var root = mount.querySelector(cfg.root); if (!root) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('gs-page');
  function q(s, from) { return (from || root).querySelector(s); }
  function qa(s, from) { return Array.prototype.slice.call((from || root).querySelectorAll(s)); }
  function header() {
    var b = 0;
    ['#header', '#hunt-nav'].forEach(function (s) {
      var e = document.querySelector(s); if (!e) return;
      var c = getComputedStyle(e), r = e.getBoundingClientRect();
      if (c.display !== 'none' && c.visibility !== 'hidden' && r.height && r.top < 40 && (c.position === 'fixed' || c.position === 'sticky')) b = Math.max(b, r.bottom);
    });
    return b;
  }

  // built once the page's own scripts have run, so every game starts exactly as it always has
  function build() {
  if (mount.querySelector('.gs-stage')) return;
  // the row: a stage that stays put while the page scrolls, holding the track of panels
  var fix = document.createElement('style'); fix.textContent = 'html,body{overflow-x:clip!important}'; document.head.appendChild(fix);
  var stage = document.createElement('div'), track = document.createElement('div');
  stage.className = 'gs-stage'; track.className = 'gs-track'; stage.appendChild(track);
  function panel(name, cls) {
    var p = document.createElement('div');
    p.className = 'gs-panel' + (cls ? ' ' + cls : ''); p.setAttribute('data-name', name);
    p.setAttribute('role', 'region'); p.setAttribute('aria-label', name);
    track.appendChild(p); return p;
  }
  // wide screens: some games move their score and buttons into the side column (Maurice, 2026-11-13: 'Move the score,
  // shipped, level, best, resume, and restart above the next up so you can expand the game play area')
  if (cfg.side && window.innerWidth >= 700) {
    var sideCol = q('.ms-side');
    if (sideCol) cfg.side.slice().reverse().forEach(function (sel) { var e = q(sel); if (e) sideCol.insertBefore(e, sideCol.firstChild); });
  }
  if (cfg.beside && window.innerWidth >= 700) {
    var bh = q(cfg.beside.host);
    if (bh) {
      var bc = document.createElement('div'); bc.className = 'gs-beside' + (cfg.beside.wide ? ' gs-beside-wide' : '');
      cfg.beside.items.forEach(function (sel) { var e = q(sel); if (e) bc.appendChild(e); });
      bh.classList.add('gs-two'); bh.appendChild(bc);
    }
  }
  var gameHead = null;
  if (cfg.headIn && window.innerWidth >= 700) { var hh0 = q(cfg.headIn); if (hh0) { gameHead = document.createElement('div'); gameHead.className = 'gs-gamehead'; hh0.insertBefore(gameHead, hh0.firstChild); } }
  // phones: some games put their setup (Goma Goons' crew picker) on the screen before the game, so the game gets the screen
  if (cfg.phoneJoin && window.innerWidth < 700) cfg.phoneJoin.forEach(function (j) { var a = q(j[0]), b = q(j[1]); if (a && b) { b.appendChild(a); b.classList.add('gs-joined'); } });
  if (cfg.phoneHow && window.innerWidth < 700) cfg.how = (cfg.how || []).concat(cfg.phoneHow);
  if (cfg.wideParts && window.innerWidth >= 700) cfg.parts = cfg.wideParts.concat(cfg.parts || []);
  // 1. the game: everything the page had, less the parts that get panels of their own
  var h1 = q(H1);
  var game = panel((h1 && (h1.querySelector('.face') || h1).textContent.replace(/\s+/g, ' ').trim()) || 'Game', 'gs-game');
  Array.prototype.slice.call(root.children).forEach(function (c) {
    if (c.classList.contains('ma-plx') || /^(STYLE|SCRIPT|LINK)$/.test(c.tagName)) return;
    game.appendChild(c);
  });
  root.appendChild(stage);
  // 2. how to play: the name and the lines about the game (they were the page's header)
  var about = panel('How to play', 'gs-about'); track.insertBefore(about, game);
  var aboutIn = document.createElement('div'); aboutIn.className = 'gs-col'; about.appendChild(aboutIn);
  var howBox = document.createElement('div'); howBox.className = 'gs-how'; aboutIn.appendChild(howBox);
  function emptyOut(from) {   // a column left with nothing in it steps aside so the game can center
    for (var p = from; p && p !== game; p = p.parentElement) {
      var any = Array.prototype.some.call(p.children, function (c) { return !/^(STYLE|SCRIPT)$/.test(c.tagName) && getComputedStyle(c).display !== 'none'; });
      if (any) break;
      p.classList.add('gs-empty'); if (p.parentElement) p.parentElement.classList.add('gs-solo');
    }
  }
  function adopt() {
    var moved = false;
    qa(ABOUT, game).forEach(function (e) { if (gameHead && gameHead.contains(e)) return; var from = e.parentElement; if (gameHead) gameHead.appendChild(e); else aboutIn.insertBefore(e, howBox); emptyOut(from); moved = true; });
    // the name panel steps aside when everything it held went over the game
    if (gameHead && about.parentNode && !aboutIn.querySelector(':scope > :not(.gs-how)') && !howBox.children.length) { about.parentNode.removeChild(about); }
    (cfg.how || []).forEach(function (sel) { qa(sel, game).forEach(function (e) { var from = e.parentElement; howBox.appendChild(e); emptyOut(from); moved = true; }); });
    (cfg.parts || []).forEach(function (part, i) {
      var sel = part.sel || part, els = qa(sel, game); if (!els.length) return;
      if (part.stack && window.innerWidth < 700) els.reverse();   // phones: Best this week after the leaderboard (Maurice, 2026-11-13)
      var p = track.querySelector('.gs-panel[data-part="' + i + '"]');
      if (!p) {
        var h = els[part.stack ? els.length - 1 : 0].querySelector('h1,h2,h3'), name = part.name || (h && h.textContent.replace(/\s+/g, ' ').trim()) || 'More';
        p = panel(name, 'gs-part'); p.setAttribute('data-part', i);
        var col = document.createElement('div'); col.className = (els.length > 1 && !part.stack ? 'gs-group' : 'gs-col') + (part.stack ? ' gs-stack' : ''); p.appendChild(col);
        // panels keep the order the parts are listed in, after How to play and before the Arcade
        var after = game;
        qa('.gs-panel[data-part]', track).forEach(function (o) { if (+o.getAttribute('data-part') < i) after = o; });
        track.insertBefore(p, after.nextSibling);
      }
      els.forEach(function (e) { var from = e.parentElement; p.firstChild.appendChild(e); emptyOut(from); });
      moved = true;
    });
    // a game's export card (Thread the Needle and the other arcade games): its own panel right after the game
    // a daily puzzle's result and its share card go there too once the puzzle is over (Maurice, 2026-11-14: 'when you win on
    // mobile, this happens'), so the game never grows past its screen
    var RES = '.ac-card, .hg-share, #hg-result.win, #hg-result.lose, #thw-result.win, #thw-result.lose, .thw-result.win, .thw-result.lose';
    var results = qa(RES, game).filter(function (e) { return getComputedStyle(e).display !== 'none' && !e.hidden; });
    var card = results[0];
    if (card) {
      var cp = track.querySelector('.gs-cardp');
      if (!cp) { cp = panel('Your result', 'gs-part gs-cardp'); var cc = document.createElement('div'); cc.className = 'gs-col'; cp.appendChild(cc); }
      track.insertBefore(cp, game.nextSibling);
      results.forEach(function (e) { cp.firstChild.appendChild(e); }); moved = true; toCard = true;
    }
    // the Arcade switcher goes last
    var sw = q('.ma-arcade', game) || q('.hg-tabs', game);
    if (sw) {
      var ap = track.querySelector('.gs-arcade');
      if (!ap) { ap = panel('The Arcade', 'gs-arcade'); var c2 = document.createElement('div'); c2.className = 'gs-col'; ap.appendChild(c2); }
      var tt = q('.hg-arcade', game); if (tt && !sw.contains(tt)) ap.firstChild.appendChild(tt);
      var from = sw.parentElement; ap.firstChild.appendChild(sw); emptyOut(from); moved = true;
    }
    var arc = track.querySelector('.gs-arcade'); if (arc) { track.appendChild(arc); tiles(arc); }
    if (moved) { bar(); size(); }
    // the puzzle is over: on to the result, so the score is the first thing seen (Maurice, 2026-11-14)
    if (toCard) { toCard = false; var ci = qa('.gs-panel', track).indexOf(track.querySelector('.gs-cardp')); if (ci >= 0) setTimeout(function () { gameTouch = 0; var k = at[ci] || 0; var ty = y0 + (starts[k] || 0) + 1; if (still) wTo(0, ty); else glideTo(ty); }, 700); }
  }
  var toCard = false;

  // the Arcade tiles: each game's art under its color (Links tiles), and their places in the two rows for the fly-in
  var ART = 'https://africhmaurice.github.io/site/assets/arcade/', tileList = [];
  function tiles(arc) {
    tileList = qa('.hg-tabs a', arc);
    tileList.forEach(function (a, i) {
      var k = a.getAttribute('data-k'); if (k) a.style.setProperty('--art', 'url(' + ART + k + '.jpg?v=4)');
      a.__row = i < 7 ? 0 : 1; a.__col = i < 7 ? i / 6 : (i - 7) / 7;
    });
  }
  // the trailers play in the tiles while the Arcade is on screen (Maurice, 2026-11-13: 'can we add the trailers playing
  // to the games when we get to the arcade section'); loaded only once you get there, paused when you leave
  var vids = null, playing = false, arcFar = 0;
  function trailers(on) {
    if (still) return;
    if (on && !vids) vids = tileList.map(function (a) {
      var k = a.getAttribute('data-k'); if (!k) return null;
      var v = document.createElement('video'); v.className = 'gs-vid'; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'auto'; v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1; v.src = ART + k + '.mp4?v=4';
      a.insertBefore(v, a.firstChild); return v;
    });
    if (!vids || on === playing) return;
    playing = on;
    vids.forEach(function (v) { if (!v) return; if (on) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); });
  }
  function flyArcade() {
    var arc = track.querySelector('.gs-arcade'); if (!arc || !tileList.length) return;
    var ai = panels.indexOf(arc), aw = widthsOf[ai] || vw;
    trailers(wide && ai >= 0 && lefts[ai] < x + vw - aw * 0.25 && lefts[ai] + aw > x + aw * 0.25);
    var i = panels.indexOf(arc), on = wide && !still && i >= 0;
    var p = on ? Math.max(0, Math.min(1, ((x + vw - lefts[i]) / (widthsOf[i] || vw) - 0.3) / 0.65)) : 1;   // in flight from a third of the way on screen until it's all there
    var far = arcFar || (arcFar = ((arc.querySelector('.hg-tabs') || {}).clientHeight || 545) * 0.55);
    tileList.forEach(function (a) {
      var d = Math.max(0, Math.min(1, (p - a.__col * 0.3) / 0.7)), e = 1 - Math.pow(1 - d, 3);
      a.style.translate = d >= 1 ? '' : '0 ' + ((a.__row ? 1 : -1) * far * (1 - e)).toFixed(1) + 'px';
      a.style.opacity = d >= 1 ? '' : Math.min(1, e * 1.4).toFixed(3);
    });
  }

  // the bar along the bottom: one segment per panel; tap one to go there
  var prog = document.createElement('nav'); prog.className = 'gs-prog'; prog.setAttribute('aria-label', 'Sections');
  var hint = document.createElement('button'); hint.type = 'button'; hint.className = 'gs-hint'; hint.setAttribute('aria-label', 'Scroll to the next section');
  hint.innerHTML = 'Scroll<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  stage.appendChild(hint); stage.appendChild(prog);
  var glideTok = 0;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { addEventListener(ev, function () { glideTok++; clearTimeout(snapT2); }, { passive: true }); });
  var snapT2 = 0;
  function glideTo(ty) {   // our own short glide, so every click moves (the browser's smooth scroll sometimes drops one)
    var y0g = window.scrollY, d = ty - y0g, t0 = performance.now(), dur = Math.min(420, 220 + Math.abs(d) * 0.4);
    if (Math.abs(d) < 1) return;
    var tok = ++glideTok;
    (function step() { if (tok !== glideTok) return; var k = Math.max(0, Math.min(1, (performance.now() - t0) / dur)), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; wTo(0, y0g + d * e); if (k < 1) requestAnimationFrame(step); })();
  }
  // a back arrow, so it's clear the row goes both ways (Maurice, 2026-11-14): over the second segment, the forward arrow over the fourth
  var back = document.createElement('button'); back.type = 'button'; back.className = 'gs-back'; back.setAttribute('aria-label', 'Scroll to the previous section');
  back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'; stage.appendChild(back);
  back.addEventListener('click', function () {
    for (var k = stops.length - 1; k >= 0; k--) if (stops[k] < x - vw * 0.25) { var ty = y0 + starts[k] + 1; if (still) wTo(0, ty); else glideTo(ty); return; }
    if (still) wTo(0, y0); else glideTo(y0);
  });
  function placeArrows() {
    if (wide) { back.style.left = ''; hint.style.left = ''; return; }
    var sg = qa('.gs-seg', prog), sr = stage.getBoundingClientRect(); if (sg.length < 2) return;
    var c = function (i) { var r = sg[Math.min(sg.length - 1, i)].getBoundingClientRect(); return (r.left + r.width / 2 - sr.left) + 'px'; };
    back.style.left = 'calc(50% - 28px)'; hint.style.left = 'calc(50% + 28px)';   // the pair centered at the bottom (Maurice, 2026-11-14)
  }
  hint.addEventListener('click', function () {
    // the next stop at least a quarter screen along (a stop a few pixels away would barely move the row)
    for (var k = 0; k < stops.length; k++) if (stops[k] > x + vw * 0.25) { var ty = y0 + starts[k] + 1; if (still) wTo(0, ty); else glideTo(ty); return; }
    var tl = stops.length - 1; if (tl >= 0) { if (still) wTo(0, y0 + starts[tl] + 1); else glideTo(y0 + starts[tl] + 1); }
  });
  var sbar = document.createElement('div'), sbarIn = document.createElement('i');
  sbar.className = 'gs-sbar'; sbar.setAttribute('aria-hidden', 'true'); sbar.title = 'Scroll Bar'; sbar.appendChild(sbarIn); stage.appendChild(sbar);
  var panels = [], segs = [];
  function bar() {
    panels = qa('.gs-panel', track);
    prog.innerHTML = '';
    segs = panels.map(function (p, i) {
      var b = document.createElement('button'), name = p.getAttribute('data-name');
      b.type = 'button'; b.className = 'gs-seg'; b.title = name; b.setAttribute('aria-label', name); b.innerHTML = '<i></i>';
      b.addEventListener('click', function () { goTo(i); });
      prog.appendChild(b); return b.firstChild;
    });
  }

  // scrolling: the row stops with each panel in the middle of the screen and holds still there for a short stretch (so a
  // game nudging the page a few pixels doesn't slide the row), then moves on to the next stop
  var widthsOf = [], HOLD = 320, HOLD_END = 1040,   /* doubled (Maurice, 2026-11-13: "double the length of the scroll bar") */ starts = [], holds = [], vw = 0, y0 = 0, x = 0, n = 0, wide = false, lefts = [], stops = [], at = [], total = 0, W = 0;
  function pad(p) { var c = getComputedStyle(p); return { x: parseFloat(c.paddingLeft) + parseFloat(c.paddingRight), y: parseFloat(c.paddingTop) + parseFloat(c.paddingBottom) }; }
  // wide screens: each panel as narrow as it can be while what's in it still fits the screen's height
  // nothing in the column pokes past its right edge (a box that clips its own overflow hides it from scrollWidth)
  function inside(col) {
    var r = col.getBoundingClientRect().right + 1, ok = true;
    Array.prototype.forEach.call(col.querySelectorAll('*'), function (e) { if (ok && e.getClientRects().length && e.getBoundingClientRect().right > r) ok = false; });
    return ok;
  }
  function widths() {
    panels.forEach(function (p) { if (p !== game || !wide) p.style.width = vw + 'px'; });
    if (!wide) {   // phones: one panel per screen, each scaled down to fit the screen's height instead of scrolling inside
      panels.forEach(function (p) {
        p.style.zoom = ''; p.style.height = ''; p.style.removeProperty('--gz');
        if (p === game) return;
        var col = p.firstChild; if (!col) return;
        // anything left from the wide layout goes (columns, set widths and heights, stretched boxes)
        col.classList.remove('gs-cols'); col.style.width = ''; col.style.height = '';
        [col, col.firstElementChild].forEach(function (e) { if (e) { e.style.columnWidth = ''; e.style.columnCount = ''; e.style.columnGap = ''; e.style.columnFill = ''; } });
        Array.prototype.forEach.call(col.querySelectorAll('.gs-box'), function (b) { b.style.minHeight = ''; });
        p.classList.remove('gs-mid');
        var d = pad(p), room = p.clientHeight - d.y;
        // the Arcade: big tiles in two rows, as wide as they need to be; you scroll sideways through them (Maurice,
        // 2026-11-13: 'do the same with the arcade, put them like the windows tiles design')
        if (p.classList.contains('gs-arcade')) { col.style.height = room + 'px'; p.style.width = (Math.max(1, Math.ceil((col.scrollWidth + d.x - 1) / vw)) * vw) + 'px'; return; }   // a whole number of screens
        // a long part (the Key): full size in screen-wide columns, scrolled through sideways, instead of shrunk until it
        // can't be read ('make the key bigger and wider so you have to scroll through it but it's readable')
        if (col.scrollHeight > room * 1.15 && !p.classList.contains('gs-about')) {
          col.classList.add('gs-cols'); col.style.height = room + 'px';
          var box = col.children.length === 1 ? col.firstElementChild : col;
          // n columns, one per screen: the gap is the panel's padding plus the box's own padding and border, so every
          // column starts the same distance in from its screen's edge and none is cut where the row stops
          var setCols = function (n) {
            p.style.width = (vw * n) + 'px'; col.style.width = (vw * n - d.x) + 'px';
            var bs = getComputedStyle(box), chrome = box === col ? 0 : parseFloat(bs.paddingLeft) + parseFloat(bs.paddingRight) + parseFloat(bs.borderLeftWidth) + parseFloat(bs.borderRightWidth);
            box.style.columnWidth = 'auto'; box.style.columnCount = n; box.style.columnGap = (d.x + chrome) + 'px'; box.style.columnFill = 'auto';
          };
          for (var n = 1; n <= 12; n++) { setCols(n); if (box.scrollWidth <= box.clientWidth + 1 && col.scrollWidth <= col.clientWidth + 1) break; }
          return;
        }
        shrink(p, col.scrollHeight, room);
      });
      return;
    }
    panels.forEach(function (p) {
      if (p === game) return;
      var col = p.firstChild; if (!col) return;
      p.style.zoom = ''; p.style.height = ''; p.style.removeProperty('--gz');
      var d = pad(p), room = p.clientHeight - d.y, max = vw - d.x, best = 0;
      col.classList.remove('gs-cols'); col.style.height = ''; col.style.width = '';
      Array.prototype.forEach.call(col.querySelectorAll('.gs-box'), function (b) { b.style.minHeight = ''; });
      function set(w) { p.style.width = (w + d.x) + 'px'; col.style.width = w + 'px'; }
      if (p.classList.contains('gs-arcade')) { set(max); col.style.height = room + 'px'; return; }
      if (col.classList.contains('gs-group')) {   // a few boxes (a best score and a board): side by side, each top edge to bottom edge
        var gw = 0; Array.prototype.forEach.call(col.children, function (c) { c.classList.add('gs-box'); gw += 440; });
        gw += 20 * Math.max(0, col.children.length - 1); set(Math.min(gw, max));
        col.style.height = ''; room = shrink(p, col.scrollHeight, room); col.style.height = room + 'px'; return;
      }
      var isAbout = p.classList.contains("gs-about"), wMin = isAbout ? 400 : 360, wMax = Math.min(isAbout ? 520 : 780, max);
      for (var w = wMin; w <= wMax; w += 20) { set(w); if (col.scrollHeight <= room + 1 && col.scrollWidth <= w + 1 && inside(col)) { best = w; break; } }
      if (!best && p.classList.contains('gs-about')) { set(Math.min(520, max)); room = shrink(p, col.scrollHeight, room); best = -1; }   // the name panel never splits into columns; it shrinks
      if (!best && col.children.length > 1) { set(Math.min(600, max)); room = shrink(p, col.scrollHeight, room); best = -1; }   // a stacked panel (Best this week over its board) shrinks rather than splitting
      if (!best) {   // too tall for one column: side-by-side columns, as many as it takes
        col.classList.add('gs-cols'); col.style.height = room + 'px';
        var one = col.children.length === 1 ? col.firstElementChild : null;   // one box (the Key): its columns run inside it
        for (var w2 = 700; w2 <= vw * 3; w2 += 20) { set(w2); if (col.scrollWidth <= col.clientWidth + 1 && (!one || (one.scrollWidth <= one.clientWidth + 1 && one.scrollHeight <= one.clientHeight + 8)) && inside(col)) { best = w2; break; } }
        if (!best) { col.classList.remove('gs-cols'); col.style.height = ''; set(Math.min(780, max)); room = shrink(p, col.scrollHeight, room); }
      }
      if (!p.classList.contains('gs-arcade') && !col.classList.contains('gs-cols')) room = shrink(p, col.scrollHeight, room);
      if (p.classList.contains('gs-about') && !p.style.zoom) room = grow(p, col, room);
      stretch(p, col, room);
      // last check, on screen: if the bottom box still runs past the bottom edge, shrink by exactly that much
      for (var tries = 0; tries < 2; tries++) {
        var lb = col.lastElementChild; if (!lb) break;
        var cb = col.getBoundingClientRect(), over = lb.getBoundingClientRect().bottom - cb.bottom; if (over <= 2) break;
        var z0 = parseFloat(p.style.zoom) || 1, vis = lb.getBoundingClientRect().bottom - cb.top, zz = z0 * (cb.height / vis);
        var hv = p.getBoundingClientRect().height;
        p.style.zoom = zz.toFixed(3); p.style.height = (hv / zz).toFixed(1) + 'px'; p.style.setProperty('--gz', zz.toFixed(3));
        Array.prototype.forEach.call(col.querySelectorAll('.gs-box'), function (b) { b.style.minHeight = ''; });
        room = p.clientHeight - pad(p).y; stretch(p, col, room);
      }
    });
  }
  // the words grow to fill the height, but the panel keeps its width (Maurice, 2026-11-13: 'make the how to play and header
  // section less wide'): the biggest size whose lines still fit at that width
  function grow(p, col, room) {
    var need = col.scrollHeight; if (!need || need >= room * 0.92) return room;
    var h = p.getBoundingClientRect().height, W = p.getBoundingClientRect().width, cw = parseFloat(col.style.width) || col.clientWidth;
    for (var z = Math.min(1.3, room / need); z >= 1.04; z -= 0.03) {
      p.style.zoom = z.toFixed(3); p.style.height = (h / z).toFixed(1) + 'px'; p.style.setProperty('--gz', z.toFixed(3));
      p.style.width = (W / z).toFixed(1) + 'px'; col.style.width = (cw / z).toFixed(1) + 'px';
      var r2 = p.clientHeight - pad(p).y;
      if (col.scrollHeight <= r2 + 1) return r2;
    }
    p.style.zoom = ''; p.style.height = ''; p.style.removeProperty('--gz'); p.style.width = W + 'px'; col.style.width = cw + 'px';
    return room;
  }
  // the box at the bottom of a panel (How it works, a leaderboard) reaches down to the shared bottom edge
  function boxOf(el) {
    for (var e = el; e; e = e.children.length === 1 ? e.firstElementChild : null) { var c = getComputedStyle(e); if (parseFloat(c.borderBottomWidth) > 0 && c.borderBottomStyle !== 'none') return e; }
    return el;
  }
  function shrink(p, need, room) {
    if (need <= room + 1) return room;
    var z = Math.max(wide ? 0.55 : 0.4, room / need), h = p.getBoundingClientRect().height;
    p.style.zoom = z.toFixed(3); p.style.height = (h / z).toFixed(1) + 'px'; p.style.setProperty('--gz', z.toFixed(3));
    if (!wide) p.style.width = (vw / z).toFixed(1) + 'px';   // a phone panel still fills the screen's width
    return p.clientHeight - pad(p).y;
  }
  // the phones' pinned background (loader.js puts an .ma-pfx layer over the whole panel) is not part of the game: it never counts
  // when the game is measured (it made every phone game panel shrink to 85%; QA 2026-11-14)
  function bgLayer(c) { return c.classList.contains('ma-pfx') || c.getAttribute('aria-hidden') === 'true' && getComputedStyle(c).position === 'absolute'; }
  function shrinkGame() {
    game.style.zoom = ''; game.style.height = ''; game.style.removeProperty('--gz');
    var d = pad(game), need = 0, t0 = 1e9, b0 = -1e9;
    Array.prototype.forEach.call(game.children, function (c) { var b = c.getBoundingClientRect(); if (!b.height || !c.offsetParent || bgLayer(c)) return; t0 = Math.min(t0, b.top); b0 = Math.max(b0, b.bottom); });
    need = b0 - t0;
    if (need > 0) shrink(game, need, game.clientHeight - d.y);
  }
  function stretch(p, col, room) {
    var last = null;
    if (p.classList.contains('gs-about')) {   // only a How it works box reaches down; a lone weekly strip stays its own size
      last = howBox.lastElementChild || q('.hg-how', aboutIn);
      if (last && last.nextElementSibling && last.nextElementSibling !== howBox && last.parentElement === aboutIn) last = null;
    } else if (col.children.length >= 1 && !col.classList.contains('gs-cols')) last = col.lastElementChild;
    if (p.classList.contains('gs-about')) p.classList.toggle('gs-mid', !last);
    if (!last) return;
    var grow = p.classList.contains('gs-about') && howBox.children.length > 1 ? howBox.firstElementChild : last;   // Best this week keeps its size under How it works
    var box = boxOf(grow);
    if (p.classList.contains('gs-about') && !(parseFloat(getComputedStyle(box).borderBottomWidth) > 0)) { p.classList.add('gs-mid'); col.style.height = ''; return; }   // no box to reach down (a color key): the words sit in the middle
    box.classList.add('gs-box'); box.style.minHeight = '';
    col.style.height = room + 'px';
    var gap = col.getBoundingClientRect().bottom - (grow === last ? box : boxOf(last)).getBoundingClientRect().bottom;   // the bottom box meets the bottom edge
    var pz = parseFloat(p.style.zoom) || 1;   // measured on screen, set in the panel's own (scaled) pixels
    if (gap > 1) box.style.minHeight = Math.round((box.getBoundingClientRect().height + gap) / pz) + 'px';
  }
  function layout() {
    lefts = []; widthsOf = []; W = 0;
    panels.forEach(function (p) { var pw = p.getBoundingClientRect().width; lefts.push(W); widthsOf.push(pw); W += pw; });
    var end = Math.max(0, W - vw), seen = -1;
    stops = []; at = [];
    if (!wide) {   // phones: a stop every screen width, so a wide part (the Key, the Arcade) is read a screen at a time
      for (var sx = 0; sx < end - 2; sx += vw) stops.push(Math.round(sx));
      stops.push(Math.round(end));
      panels.forEach(function (p, i) { var k = 0; stops.forEach(function (v, j) { if (v <= lefts[i] + 2) k = j; }); at[i] = k; });
    } else panels.forEach(function (p, i) {
      var c = Math.round(Math.max(0, Math.min(end, lefts[i] + p.getBoundingClientRect().width / 2 - vw / 2)));
      if (c !== seen) { stops.push(c); seen = c; }
      at[i] = stops.length - 1;
    });
    // where each hold starts on the scroll, and how long it lasts
    starts = []; holds = []; var acc = 0;
    stops.forEach(function (v, k) {
      if (k) acc += holds[k - 1] + (v - stops[k - 1]);
      starts[k] = acc; holds[k] = k === stops.length - 1 ? HOLD_END : 0;   // no pauses along the way, only at the Arcade (Maurice, 2026-11-13: 'it still pauses on the game')
    });
    total = stops.length ? starts[stops.length - 1] + holds[stops.length - 1] : 0;
  }
  function size() {
    var vh = window.innerHeight, hdr = header();
    // the row is exactly as wide as the window less its scrollbar, whatever width the page's own block has (a block set to
    // 100vw runs under the scrollbar and was cut off at both sides; QA 2026-11-14)
    var cw = document.documentElement.clientWidth;
    ['width', 'min-width', 'max-width'].forEach(function (k) { stage.style.setProperty(k, cw + 'px', 'important'); });
    stage.style.setProperty('margin-left', '0px', 'important');
    var sl = stage.getBoundingClientRect().left; if (Math.abs(sl) > 0.5) stage.style.setProperty('margin-left', (-sl).toFixed(1) + 'px', 'important');
    vw = cw;
    wide = window.innerWidth >= 700;
    if (!wide) game.style.width = '';
    root.setAttribute('data-ma-keep-top', '');
    root.style.setProperty('padding', '0', 'important');
    root.style.setProperty('min-height', '0', 'important');
    stage.style.top = hdr + 'px';
    stage.style.height = (vh - hdr) + 'px';
    stage.style.setProperty('--gsvw', cw + 'px');   // the row's real width (a scrollbar can make it narrower than the window)
    panels = qa('.gs-panel', track); n = panels.length;
    stage.classList.add('gs-measure');   // measure boxes where they rest, not partway through a fade-in
    widths();
    // the page's own wrappers must not clip or scroll, or the stage can't stay put
    for (var p = root; p && p !== document.body; p = p.parentElement) {
      var o = getComputedStyle(p); if (/hidden|auto|scroll/.test(o.overflowX + o.overflowY)) p.style.setProperty('overflow', 'clip', 'important');
    }
    // the row's background is the game's own art, on the stage so it fills the screen
    var bs = getComputedStyle(root);
    if (!stage.__bg && bs.backgroundImage !== 'none') {
      stage.__bg = 1;
      stage.style.backgroundImage = bs.backgroundImage; stage.style.backgroundColor = bs.backgroundColor;
      stage.style.backgroundSize = 'cover'; stage.style.backgroundPosition = 'center';
      root.style.setProperty('background', 'none', 'important');
    }
    game.style.zoom = ''; game.style.height = '';
    if (wide) game.style.width = vw + 'px';   // the game lays itself out with the whole screen first, then the panel closes in on it
    fit(true);
    shrinkGame();
    stage.classList.remove('gs-measure');
    layout();
    root.style.setProperty('height', (total + vh) + 'px', 'important');
    var fe = root.closest('.fluid-engine');
    if (fe) { fe.style.setProperty('grid-template-rows', 'none', 'important'); fe.style.setProperty('grid-auto-rows', 'auto', 'important'); fe.style.setProperty('min-height', (total + vh) + 'px', 'important'); }
    y0 = root.getBoundingClientRect().top + window.scrollY;
    steadyPause(); fitLabels(); alignChamp(); setTimeout(function () { fitLabels(); alignChamp(); }, 400);
    shown = null; arcFar = 0; placeArrows(); paint();
    if (!wide) setTimeout(snapNow, 250);   // the menu bar changing height moves the row's start: settle back onto a whole screen
    if (window.maCiRelines) window.maCiRelines();   // the 3D headings measure again in their new panels
  }
  function posOf(i) { return starts[at[i] || 0] || 0; }   // scroll distance where panel i's stop begins
  // the row glides to where the scroll puts it instead of jumping there (Maurice, 2026-11-13: 'scrolling looks a little
  // glitchy, can you make it smoother?')
  var tx = 0, shown = null, glide = 0;
  function draw() {
    glide = 0;
    // the row follows the scroll exactly, every frame (an eased glide lagged behind, then jumped to its stop; Maurice,
    // 2026-11-13: 'it lags behind, then shifts REALLY quickly to a fixed position')
    shown = tx;
    if (Math.abs(tx - shown) < 0.4) shown = tx;
    x = shown;
    track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    segs.forEach(function (f, i) {
      var v = Math.max(0, Math.min(1, (x + vw - (lefts[i] || 0)) / Math.max(1, widthsOf[i] || vw)));
      f.style.transform = 'scaleX(' + v.toFixed(3) + ')';
    });
    flyArcade();
    if (shown !== tx) glide = requestAnimationFrame(draw);
  }
  function paint() {
    var s = Math.max(0, window.scrollY - y0);
    x = 0;
    var fill = 0;
    for (var k = 0; k < stops.length; k++) {
      // the Scroll Bar only at the last stop, the Arcade (Maurice, 2026-11-13: 'there's a scroll bar that activates at the game
      // screen, there's no need for that'); the other stops still hold, without it
      if (s < starts[k] + holds[k]) { x = stops[k]; fill = k === stops.length - 1 ? Math.max(0, (s - starts[k]) / holds[k]) : 0; break; }
      if (k + 1 < stops.length && s < starts[k + 1]) { x = stops[k] + (s - starts[k] - holds[k]); break; }
      x = stops[k];
    }
    // the Scroll Bar: fills while the row holds on a section; gone while the row is moving
    sbar.style.opacity = fill > 0.01 && fill < 1 ? '1' : '0';
    sbarIn.style.transform = 'scaleX(' + Math.min(1, fill).toFixed(3) + ')';
    tx = x; if (shown !== null) x = shown;
    // the Scroll button: on to the next section; gone at the end (Maurice, 2026-11-13: 'on horizontal scrolls, add a "scroll" button')
    var atEnd = !stops.length || tx >= stops[stops.length - 1] - 1; hint.style.opacity = atEnd ? '0' : ''; hint.style.pointerEvents = atEnd ? 'none' : '';
    var atStart = x < 4; back.style.opacity = atStart ? '0' : ''; back.style.pointerEvents = atStart ? 'none' : '';
    if (!glide) glide = requestAnimationFrame(draw);
  }
  function goTo(i) {
    gameTouch = 0;
    wTo({ top: Math.max(0, y0 + posOf(i) + Math.min(HOLD, holds[at[i] || 0] || 0) / 2), behavior: still ? 'auto' : 'smooth' });   // a little way into the hold, so the Scroll Bar shows it's still going
  }
  function here() { var b = 0; stops.forEach(function (v, k) { if (Math.abs(v - x) < Math.abs(stops[b] - x)) b = k; }); var i = at.indexOf(b); return i < 0 ? 0 : i; }
  function gameShown() { var r = game.getBoundingClientRect(); return r.right > 40 && r.left < window.innerWidth - 40; }
  addEventListener('scroll', paint, { passive: true });
  // phones: when the scrolling stops between two panels, the row settles onto the nearer one (Maurice, 2026-11-13: half
  // panels on a phone screen)
  // a finger still on the screen is never fought: the row only settles after the finger lifts and the scrolling stops
  var touching = false;
  addEventListener('touchstart', function () { touching = true; }, { passive: true });
  ['touchend', 'touchcancel'].forEach(function (ev) { addEventListener(ev, function () { touching = false; window.dispatchEvent(new Event('scroll')); }, { passive: true }); });
  var snapT = 0, snapping = false;
  addEventListener('scroll', function () {
    if (wide || still) return;
    clearTimeout(snapT);
    snapT = snapT2 = setTimeout(snapNow, 140);
  }, { passive: true });
  function snapNow() {
    {
      if (wide || still || !stops.length || touching) return;
      var k = 0; stops.forEach(function (v, i) { if (Math.abs(v - x) < Math.abs(stops[k] - x)) k = i; });
      if (Date.now() - gameTouch < 1500) k = at[panels.indexOf(game)] || 0;   // a game just pressed stays centered (Maurice: 'I pressed play and the screen went off center')
      if (Math.abs(stops[k] - x) < 2) return;
      var ty = y0 + starts[k] + (k === stops.length - 1 ? 1 : 0); glideTo(ty);
    }
  }
  var rt = 0;
  // crossing between the phone and wide layouts (a desktop window narrowed, a tablet turned) rebuilds the page from
  // scratch, since the wide layout moves pieces around; once a game has been touched it stays put and only resizes
  var gameTouch = 0;
  game.addEventListener('pointerdown', function () { gameTouch = Date.now(); }, true);
  game.addEventListener('touchstart', function () { gameTouch = Date.now(); }, { capture: true, passive: true });
  // a game that scrolls the page when it starts (its own "bring the game into view", a focus that scrolls) would slide the
  // row off its stop (QA 2026-11-14: Goma Goons' Continue, Sky Gauntlet's Launch): the page holds still for a game, so its
  // focus never scrolls, scrollIntoView does nothing inside the row, and a window scroll right after a press is undone
  var pressAt = 0, pressY = 0, userAt = 0;
  ['pointerdown', 'click', 'keydown'].forEach(function (ev) { game.addEventListener(ev, function () { if (Date.now() - pressAt > 300 || ev !== 'click') pressY = window.scrollY; pressAt = Date.now(); }, true); });
  addEventListener('wheel', function () { userAt = Date.now(); }, { passive: true, capture: true });
  addEventListener('touchmove', function (e) { if (!inGame(e.target)) userAt = Date.now(); }, { passive: true, capture: true });
  addEventListener('keydown', function (e) { if (!game.contains(e.target) && /^(Arrow|Page|Home|End| )/.test(e.key)) userAt = Date.now(); }, true);
  function held() { return Date.now() - pressAt < 1500 && userAt < pressAt && Date.now() - ownAt > 150; }
  try {
    var nFocus = HTMLElement.prototype.focus, nInto = Element.prototype.scrollIntoView;
    HTMLElement.prototype.focus = function (o) { if (root.contains(this)) { var p = {}; if (o) for (var k in o) p[k] = o[k]; p.preventScroll = true; return nFocus.call(this, p); } return nFocus.apply(this, arguments); };
    Element.prototype.scrollIntoView = function () { if (root.contains(this)) return; return nInto.apply(this, arguments); };
    window.scrollTo = window.scroll = function () { if (held()) return; return nTo.apply(window, arguments); };
    window.scrollBy = function () { if (held()) return; return wBy.apply(window, arguments); };
  } catch (e) {}
  addEventListener('scroll', function () { if (held() && Math.abs(window.scrollY - pressY) > 1) wTo(0, pressY); }, { passive: true });
  // a panel never scrolls inside itself (a focus or a game can scroll a clipped box): it snaps back
  document.addEventListener('scroll', function (e) { var t = e.target; if (t && t.classList && (t.classList.contains('gs-panel') || t === stage) && (t.scrollTop || t.scrollLeft)) { t.scrollTop = 0; t.scrollLeft = 0; } }, true);
  var touched = false, wasWide = window.innerWidth >= 700;
  ['pointerdown', 'keydown'].forEach(function (ev) { game.addEventListener(ev, function () { touched = true; }, true); });
  // a scrollbar that comes or goes changes the window's inner width without a resize event: lay out again for it
  if (window.ResizeObserver) { var cw0 = document.documentElement.clientWidth; new ResizeObserver(function () { var c = document.documentElement.clientWidth; if (c !== cw0) { cw0 = c; clearTimeout(rt); rt = setTimeout(size, 250); } }).observe(document.documentElement); }
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { var nowWide = window.innerWidth >= 700; if (nowWide !== wasWide) { location.reload(); return; } wasWide = nowWide; size(); }, 250);
  });

  // the game's own controls come first: the arrow keys move the row only when the game panel isn't the one on screen and
  // nothing in the game has focus; sideways wheels and swipes are left alone over the game's board
  function inGame(t) {
    if (!t || !t.closest) return false;
    if (t.closest('canvas')) return true;
    return [cfg.zoom].concat(cfg.fit || [], cfg.box || []).some(function (s) { if (!s) return false; var e = q(s, game); return e && e.contains(t); });
  }
  addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (e.defaultPrevented || gameShown() || game.contains(document.activeElement)) return;
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
    var k = here(), d = e.key === 'ArrowRight' ? 1 : -1;
    while (k + d >= 0 && k + d < n && at[k + d] === at[k]) k += d;
    e.preventDefault(); goTo(Math.max(0, Math.min(n - 1, k + d)));
  });
  addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || e.defaultPrevented || inGame(e.target) || !root.contains(e.target)) return;
    e.preventDefault(); wBy(0, e.deltaX);
  }, { passive: false });
  var tx = null, ty = null;
  root.addEventListener('touchstart', function (e) { if (inGame(e.target)) { tx = null; return; } tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchmove', function (e) {
    if (tx === null) return;
    var dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) { e.preventDefault(); wBy(0, -dx * 1.4); tx = e.touches[0].clientX; ty = e.touches[0].clientY; }
  }, { passive: false });
  root.addEventListener('touchend', function () { tx = ty = null; }, { passive: true });

  // the game fills its panel: scaled to fit the panel's width and height, keeping its shape
  var last = 0;
  function clear(el) { el.style.minHeight = ''; el.style.zoom = ''; el.style.width = cfg.snug ? 'fit-content' : ''; if (el.__sqW) el.style.setProperty('width', el.__sqW + 'px', 'important'); el.style.marginLeft = ''; el.style.marginRight = ''; last = 1; }
  // phones (Maurice, 2026-11-13: 'everything should FIT TO SCREEN ... shrinking as it needs to'): the game is scaled to fill
  // the panel's width or height, whichever runs out first; a daily card or a laid-out game (Hold the Wall!, Goma Goons) is
  // first given a width that suits the screen's shape, so it fills the screen instead of a strip of it
  function fitPhone(el) {
    var gs = getComputedStyle(game), innerW = game.clientWidth - parseFloat(gs.paddingLeft) - parseFloat(gs.paddingRight) - 4;
    var roomH = game.clientHeight - parseFloat(gs.paddingTop) - parseFloat(gs.paddingBottom) - 4;
    var flow = el.matches('.hg-card, #daily-word main') || !!cfg.phoneW;
    el.style.zoom = ''; el.style.minHeight = ''; el.style.marginLeft = 'auto'; el.style.marginRight = 'auto';
    el.style.width = flow ? (cfg.phoneW || innerW) + 'px' : (cfg.snug ? 'fit-content' : '');
    function measure() {
      var r = el.getBoundingClientRect(), t0 = 1e9, b0 = -1e9;
      Array.prototype.forEach.call(game.children, function (c) { if (!c.offsetParent || bgLayer(c)) return; var b = c.getBoundingClientRect(); if (!b.height) return; t0 = Math.min(t0, b.top); b0 = Math.max(b0, b.bottom); });
      var extra = Math.max(0, (b0 - t0) - r.height);
      return { w: r.width, h: r.height, z: Math.min(innerW / r.width, (roomH - extra) / r.height) };
    }
    var m = measure();
    // a daily card: try a few widths and keep the one that fills the most of the screen while its words stay readable
    // (drawn at 80% or more, so the words stay readable; QA 2026-11-14); a card whose board grows with its width (Sort the Shelf) keeps its first width
    if (flow && !cfg.phoneW && m.z < 0.98) {
      var best = { w: innerW, m: m };
      [1.15, 1.3, 1.5].forEach(function (k) { el.style.width = (innerW * k).toFixed(1) + 'px'; var mm = measure(); if (Math.min(1, mm.z) >= 0.8 && mm.w * Math.min(1, mm.z) > best.m.w * Math.min(1, best.m.z) + 4) best = { w: innerW * k, m: mm }; });
      el.style.width = best.w.toFixed(1) + 'px'; m = measure();
    }
    var z = Math.max(0.2, Math.min(3, m.z));
    el.style.zoom = z.toFixed(3); last = z;
    lockSize(el);
    try { window.dispatchEvent(new Event('ma-zoom')); } catch (e) {}
  }
  // a daily card keeps the size it was fitted at, so it never grows as the puzzle empties out (Maurice, 2026-11-14:
  // 'a fixed width on this so it doesn't increase in size every time you get one right')
  function lockSize(el) { if (el.matches('.hg-card, #daily-word main')) el.style.minHeight = el.offsetHeight + 'px'; }
  // the Current Champion banner is exactly as wide as the play screen under it and touches it (Maurice, 2026-11-13)
  var BOARD = '.ar-stage,.ch-board,.sg-stage,.ms-cv,.fl-stage,.lv-stage,.sd-stage,#ma-holdwall .stage,.hg-card,#daily-word main';
  function alignChamp() {
    var c = q('.wk-champ, .dbd-champ', game); if (!c || !c.offsetParent || c.closest('.gs-beside')) return;
    var b = null; qa(BOARD, game).forEach(function (e) { if (!b && e.offsetParent && e.getBoundingClientRect().top >= c.getBoundingClientRect().top) b = e; }); if (!b) return;
    var st = function (k, v) { c.style.setProperty(k, v, 'important'); };
    ['width', 'margin-left', 'margin-bottom', 'margin-right'].forEach(function (k) { c.style.removeProperty(k); });
    st('align-self', 'flex-start'); st('box-sizing', 'border-box'); st('max-width', 'none'); st('margin-right', '0px');
    for (var i = 0; i < 2; i++) {
      var cr = c.getBoundingClientRect(), br = b.getBoundingClientRect(), k = cr.width / Math.max(1, c.offsetWidth) || 1;
      st('width', (br.width / k).toFixed(1) + 'px');
      cr = c.getBoundingClientRect();
      st('margin-left', ((parseFloat(getComputedStyle(c).marginLeft) || 0) + (br.left - cr.left) / k).toFixed(1) + 'px');
      st('margin-bottom', ((parseFloat(getComputedStyle(c).marginBottom) || 0) - (br.top - cr.bottom) / k).toFixed(1) + 'px');
    }
  }
  // words too wide for their button or box shrink until they fit (Maurice, 2026-11-13: 'shrink to fit', RESUME wrapping)
  function fitLabels() {
    qa('button, .ms-hud > *, .ar-cell, .sg-stat, .tabs > *, .ch-hud, .sd-bar', game).forEach(function (e) {
      if (!e.offsetParent || !e.clientWidth) return;
      if (e.classList.contains('gs-lifted')) { e.style.fontSize = ''; e.style.zoom = ''; return; }   // a lifted score row wraps instead of shrinking (frame CSS)
      e.style.fontSize = '';
      var f = parseFloat(getComputedStyle(e).fontSize), n = 0;
      e.style.zoom = '';
      while (e.scrollWidth > e.clientWidth + 1 && f > 10 && n++ < 30) { f -= 0.5; e.style.fontSize = f + 'px'; }
      // a browser that won't draw text that small (a smallest-text setting) gets the whole row scaled to fit instead
      if (e.scrollWidth > e.clientWidth + 1) e.style.zoom = (e.clientWidth / e.scrollWidth).toFixed(3);
    });
  }
  function steadyPause() {
    // measured with both words each time the row is laid out (and once the fonts are in), so the button never grows or moves
    qa('button', game).forEach(function (bt) {
      if (!/^(pause|resume)$/i.test(bt.textContent.trim()) || !bt.offsetParent) return;
      var t = bt.textContent, w = 0; bt.style.minWidth = '';
      ['RESUME', 'PAUSE', 'Resume', 'Pause'].forEach(function (s) { bt.textContent = s; w = Math.max(w, bt.getBoundingClientRect().width); });
      bt.textContent = t; var k = bt.getBoundingClientRect().width / Math.max(1, bt.offsetWidth) || 1;
      if (w) bt.style.minWidth = Math.ceil(w / k + 1) + 'px';
    });
  }
  function fit(fresh) {
    var el = cfg.zoom && q(cfg.zoom, game); if (!el) return;
    if (!wide) { if (fresh === true) fitPhone(el); return; }
    if (fresh === true) clear(el);
    var gz = parseFloat(game.style.zoom) || 1, gs = getComputedStyle(game), r, w, h, z, room;
    function calc() {
      var cur = parseFloat(el.style.zoom) || 1; r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
      w = r.width / cur / gz; h = r.height / cur / gz;
      var vh = game.clientHeight - parseFloat(gs.paddingTop) - parseFloat(gs.paddingBottom);
      // everything else in the game panel (score bars, buttons, the champion line) keeps its size; the game takes the rest
      var kids = Array.prototype.filter.call(game.children, function (c) { return !bgLayer(c) && (c.offsetParent || getComputedStyle(c).position === 'fixed'); });
      var t0 = 1e9, b0 = -1e9;
      kids.forEach(function (c) { var b = c.getBoundingClientRect(); if (!b.height) return; t0 = Math.min(t0, b.top); b0 = Math.max(b0, b.bottom); });
      var extra = Math.max(0, (b0 - t0) - r.height) / gz;
      var par = el.parentElement, cs = getComputedStyle(par);
      room = wide ? (vw - 64) / gz : Math.min(par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), game.clientWidth - 32);
      z = Math.min(room / w, (vh - extra) / h);
      return true;
    }
    if (!calc()) return;
    // legible first (Maurice's rule; QA 2026-11-14: Hold the Wall! at 58%, Goma Goons at 88%): a game that would be scaled
    // down past 95% gets a narrower board instead, so its height drops and its words keep their size
    if (wide && fresh === true && cfg.squeeze) {
      var sq = q(cfg.squeeze.sel, game);
      if (sq) {
        var setW = function (v) {
          sq.__sqW = v;
          if (v) { sq.style.setProperty('width', v + 'px', 'important'); if (sq === el) sq.style.setProperty('min-width', '0px', 'important'); }
          else { sq.style.removeProperty('width'); sq.style.removeProperty('min-width'); if (sq === el && cfg.snug) el.style.width = 'fit-content'; }
          return calc();
        };
        if (!setW(0)) return;
        var zBest = z, wBest = 0, from = sq.offsetWidth;
        for (var sw = from - 20; z < 0.95 && sw >= cfg.squeeze.min; sw -= 20) {
          if (!setW(sw)) return;
          if (z > zBest + 0.002) { zBest = z; wBest = sw; } else if (sw < (wBest || from) - 60) break;   // narrowing no longer helps: something else sets the height
        }
        if (sq.__sqW !== wBest) setW(wBest);
      }
    }
    var phone = !wide;
    z = Math.max(0.2, Math.min(el.matches('.hg-card, #daily-word main') ? 1.15 : 2.2, z));   /* a daily card never balloons when there's little left in it */   // as small as it needs to be to fit, never spilling (Maurice, 2026-11-13)   // a daily puzzle card can grow on phones (Maurice, 2026-11-13)
    if (Math.abs(z - 1) < 0.02) z = 1;
    if (fresh !== true && (el.style.minHeight || (Math.abs(z - last) < 0.05 && !(wide && z < last - 0.01)))) z = last;   // (a game that grew past its frame mid-game always shrinks back inside it)   // a locked card keeps its size   // small changes after the first fit are left alone (Book Icons pulsed)
    if (Math.abs(z - last) >= 0.01) {
      if (z === 1) clear(el);
      else { el.style.setProperty('width', w.toFixed(1) + 'px', el.__sqW ? 'important' : ''); el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; el.style.zoom = z.toFixed(3); last = z; }
      try { window.dispatchEvent(new Event('ma-zoom')); } catch (e) {}   // a game that sizes its own words measures again
    }
    // the game grew past its frame after the page was laid out (a card that changed shape mid-game): lay the row out again,
    // at most once every two seconds (Maurice, 2026-11-14: 'it's getting wonky again on desktop')
    if (wide && fresh !== true && game.scrollWidth > game.clientWidth + 2 && Date.now() - (fit.__re || 0) > 2000) { fit.__re = Date.now(); setTimeout(size, 50); return; }
    if (fresh === true) lockSize(el);
    if (wide && fresh === true) {   // the game panel is as wide as the game (set once per layout, never from a refit)
      var card = q('.hg-card, #daily-word main', game);
      var gw = Math.round(Math.max(card === el ? 360 : 480, w * z, card && card !== el ? card.offsetWidth : 0) + parseFloat(gs.paddingLeft) + parseFloat(gs.paddingRight));
      if (Math.abs(game.getBoundingClientRect().width / gz - gw) > 1) { game.style.width = gw + 'px'; if (fresh !== true) { layout(); paint(); } }
    }
  }
  var ft = 0;
  function soon() { clearTimeout(ft); ft = setTimeout(fit, 120); }
  // the start card gives way to the board: scale the game and its panel again for what's showing now
  function refit() {
    if (!wide) { fit(true); fitLabels(); alignChamp(); return; }   // the banner follows the board when the start card gives way
    game.style.zoom = ''; game.style.height = ''; game.style.removeProperty('--gz');
    game.style.width = vw + 'px';   // measured with the whole screen, as at the start, so it never creeps smaller
    fit(true); shrinkGame(); layout(); paint(); alignChamp();
  }
  var rf = 0;
  var hadCover = !!q('.dbd-cover', game);
  function refitSoon() { clearTimeout(rf); rf = setTimeout(function () { if (hadCover && !q('.dbd-cover', game)) { hadCover = false; refit(); } }, 300); }
  game.addEventListener('click', refitSoon);
  game.addEventListener('keydown', function (e) { if (e.key === 'Enter') refitSoon(); });

  adopt();
  // phones: a score row lifted out of the scaled game, so its words keep their size (Maurice, 2026-11-13)
  if (cfg.phoneLift && window.innerWidth < 700) cfg.phoneLift.forEach(function (sel) { var e = q(sel, game); if (e) { game.insertBefore(e, game.firstChild); e.classList.add('gs-lifted'); } });
  // parts that arrive later (the weekly board is added after its data loads) move to their panels too
  if (window.MutationObserver) {
    var mt = 0;
    new MutationObserver(function () { clearTimeout(mt); mt = setTimeout(function () {
      var due = qa('.ac-card, .hg-share, #hg-result.win, #hg-result.lose, #thw-result.win, #thw-result.lose', game).some(function (e) { return getComputedStyle(e).display !== 'none' && !e.hidden; }) || qa(ABOUT, game).length || (cfg.how || []).some(function (s) { return qa(s, game).length; }) || (cfg.parts || []).some(function (s) { return qa(s.sel || s, game).length; }) || q('.ma-arcade', game) || q('.hg-tabs', game);
      if (due) adopt(); else if (hadCover) refitSoon();   // (never refits mid-game: a new piece must not move the board)
    }, 60); }).observe(game, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  }
  if (window.ResizeObserver) { var el0 = cfg.zoom && q(cfg.zoom, game); if (el0) new ResizeObserver(soon).observe(el0); }
  // the board changes size when its start screen gives way (Trench Run on phones grew from 233 to 365 wide): the champion
  // banner follows it, so it is always exactly as wide as the board and touching it (QA 2026-11-14)
  if (window.ResizeObserver) { var bt = 0, bro = new ResizeObserver(function () { clearTimeout(bt); bt = setTimeout(alignChamp, 60); }); qa(BOARD, game).forEach(function (e) { bro.observe(e); }); }
  // a leaderboard that fills in after its data loads can outgrow its panel: measure again, but only then (never for the game itself)
  if (window.MutationObserver) {
    var rt2 = 0;
    new MutationObserver(function (ms) {
      // only the leaderboard panels: the name panel's countdown rebuilds itself every second and must not set this off
      if (!wide || !ms.some(function (m) { var t = m.target.closest ? m.target : m.target.parentElement; return t && t.closest('.gs-part') && Array.prototype.some.call(m.addedNodes, function (n) { return n.nodeType === 1; }); })) return;
      clearTimeout(rt2); rt2 = setTimeout(function () {
        var off = panels.some(function (p) {
          if (p === game || p.classList.contains('gs-arcade')) return false;
          var col = p.firstChild; if (!col || col.classList.contains('gs-cols')) return false;
          var lastBox = col.lastElementChild, over = lastBox && lastBox.getBoundingClientRect().bottom > col.getBoundingClientRect().bottom + 2;
          return !inside(col) || col.scrollWidth > col.clientWidth + 1 || over;   // too wide, or now taller than the screen
        });
        if (off) size();
      }, 400);
    }).observe(track, { childList: true, subtree: true });
  }
  // the menu bar settles after the page (the logo loads, its padding is set): the row sits under it again when it does
  if (window.ResizeObserver) { var hh = -1, ht = 0, ro = new ResizeObserver(function () { var h2 = header(); if (h2 !== hh) { hh = h2; clearTimeout(ht); ht = setTimeout(size, 200); } });
    ['header', 'hunt-nav'].forEach(function (id) { var e = document.getElementById(id); if (e) ro.observe(e); }); }
  // late fonts and late rows can push a box past the bottom edge after the first measure: check again, and measure again if so
  function checkOff() {
    if (!wide) return;
    var off = panels.some(function (p) {
      if (p === game || p.classList.contains('gs-arcade')) return false;
      var col = p.firstChild; if (!col || col.classList.contains('gs-cols')) return false;
      var lb = col.lastElementChild; return lb && lb.getBoundingClientRect().bottom > col.getBoundingClientRect().bottom + 2;
    });
    if (off) size();
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(checkOff, 300); setTimeout(steadyPause, 350); });
  setTimeout(checkOff, 3000); setTimeout(checkOff, 6000);
  setTimeout(size, 200); setTimeout(size, 1500);
  addEventListener('load', size);
  }
  (function ready(k) {
    if (mount.getAttribute('data-ma-state') !== 'ready' && k < 80) { setTimeout(function () { ready(k + 1); }, 100); return; }
    setTimeout(build, 50);
  })(0);
})();
