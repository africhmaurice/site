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
  // (instant: the page's own smooth scrolling cut the row's glides short, a few pixels off its stop)
  function wTo(a, b) { ownAt = Date.now(); if (typeof a === 'number') { try { return nTo({ left: a, top: b, behavior: 'instant' }); } catch (e) {} } return nTo.apply(window, arguments); }
  var H1 = '.hg-h1,#daily-word h1,.ar-h1,.fl-h1,#ma-chase .ch-wrap > h1,#ma-gauntlet .sg-wrap > h1,#ma-levian .lv-wrap > h1,#ms-stack .ms-head h1,#ma-holdwall header h1,#ma-skyduel .sd-wrap > h1';
  var ABOUT = '.hg-how,#thw-note,.dbd-line,.hg-more,.hg-next,#thw-next,.hg-eyebrow,.m-eyebrow,.ar-eye,' + H1 + ',.hg-tag,.ar-tag,.fl-how,.ch-sub,.sg-maint,.sg-sub,.lv-lede,.ms-lede,.sd-lede,' +
    '.ar-weekly,.fl-weekly,.ch-weekly,.sg-weekly,.lvb-weekly,.ms-weekly,#ma-holdwall header .lede,#ma-holdwall header .weekly';
  // per page: the game's root block, the part to scale and what rides with it, and the page's other parts (each line is one panel)
  var GAMES = {
    'games':               { root: '#daily-word', zoom: '#daily-word main', how: ['#thw-legend'], parts: ['.dbd-panel'] },   // the color key reads with the words, so the board gets the height
    // phones: the four boxes on a screen of their own right after the books, so the books get the screen and every title reads at 11px
    // or more, a long one too (QA 2026-11-14: 5.6px on a 360x640 screen, 8.8px at 390x844)
    'game-shelf-sort':     { phoneParts: [{ sel: '.ss-case', name: 'Bookcase', fit: true }], root: '.hg-section', zoom: '.hg-card', fit: ['.ss-lives', '.ss-tools'], parts: ['.dbd-panel'] },
    'game-emoji-reads':    { phoneAbout: ['#hg-stamp', '.dbd-champ'], root: '.hg-section', zoom: '.hg-card', fit: ['.er-form', '.er-tries'], parts: ['.dbd-panel'] },
    'game-blades-brass':   { root: '.hg-section', zoom: '.hg-card', fit: ['.bb-key', '.bb-tools'], parts: ['.dbd-panel'] },
    // (phones: the Oracle's Gift line goes to How to play, so the colors and the words get the room; QA 2026-11-14: 55%, words 8.1px)
    'game-matching-auras': { phoneHow: ['.ma-hint'], root: '.hg-section', zoom: '.hg-card', fit: ['.ma-tools'], parts: ['.dbd-panel'] },
    'game-crest-quest':    { root: '.hg-section', zoom: '.hg-card', fit: ['.cq-key', '.cq-tools'], parts: ['.dbd-panel'] },
    // phones (Maurice's players, 2026-11-15: 'everything is so small', 'I keep mistakenly hitting a square next to the one I was
    // actually going for'): the field as wide as the screen, the date and champion on the name's screen (section 20, 'tap')
    'game-sky-mines':      { tap: true, phoneAbout: ['#hg-stamp', '.dbd-champ'], root: '.hg-section', zoom: '.hg-card', fit: ['.sm-bar', '.sm-tools'], parts: ['.dbd-panel'] },
    // arcade games on phones (Maurice's players, 2026-11-15: 'the screen is stretched wider but seems like it's lost length'): the
    // board keeps its own shape as wide as the screen allows, the champion banner goes to the name's screen, and a board whose height
    // is free (Airship Runner's, Thread the Needle's) fills the rest of the screen (section 20: 'board', 'phoneAbout', 'phoneFill')
    'airship-runner':      { board: true, phoneAbout: ['.wk-champ'], phoneFill: { sel: '.ar-stage', min: 300, max: 700 }, phoneJoin: [['.ar-ctrls', '.ar-hud']], root: '#ma-runner', zoom: '.ar-wrap', box: ['.ar-hud', '.ar-stage'], snug: true, beside: { host: '.ar-game', items: ['.ar-hud', '.ar-ctrls'] },
                             how: ['.ar-side > .ar-panel:has(.ar-how)'], parts: ['.ar-side > .ar-panel:has(.ar-board)', '.ar-key'] },
    'thread-the-needle':   { board: true, phoneAbout: ['.wk-champ'], phoneFill: { sel: '.fl-stage', min: 300, max: 600 }, root: '#ma-flappy', zoom: '.fl-stage', fit: ['.fl-ctl', '.fl-bar'], parts: ['.fl-panel'] },
    // phones: the arrow pad lifted out of the scaled game too, under the board at a size a thumb can use (Maurice, 2026-11-14:
    // it was drawn at 24px inside the scaled game)
    'trench-run':          { board: true, phoneAbout: ['.wk-champ'], presize: true, phoneLift: ['.ch-hud'], phoneDrop: ['.ch-pad'], phoneSnug: true, root: '#ma-chase', zoom: '.ch-game', box: ['.ch-hud', '.ch-board'],
                             how: ['.ch-howp'], parts: ['.ch-side > .tr-panel:not(.ch-howp)', 'section.tk'] },
    // phones: Normal/Easy on a screen of their own just before the game and the score row lifted out of the scaled game, so the board gets the screen and
    // the score reads at full size (QA 2026-11-14: the game was scaled to 62% on a 360x640 screen, its score row at 8px)
    'sky-gauntlet':        { board: true, phoneAbout: ['.wk-champ'], phoneLift: ['.sg-hud'], phoneParts: [{ sel: '.sg-modes', pre: true, name: 'Normal or Easy' }], root: '#ma-gauntlet', zoom: '.sg-game', box: ['.sg-hud', '.sg-stage'], snug: true, beside: { host: '.sg-main', items: ['.sg-modes', '.sg-hud', '.sgb-post'] },
                             how: ['.sg-howp'], parts: ['.sg-side > .sgb-panel:not(.sg-howp)', 'section.sgk'] },
    // phones: How to play on a screen of its own after the game, so the row goes the name, the game, How to play (Maurice, 2026-11-14:
    // one press from the name skipped the game), and the score row fitted on one line over the board
    'the-levian':          { board: true, phoneAbout: ['.wk-champ'], phoneHowAfter: true, phoneRow: '.lv-bar', root: '#ma-levian', zoom: '.lv-stage', fit: ['.lv-bar', '.wk-champ'],
                             how: ['.lv-side > .lvb-panel:not(.lvb-local):not(.lvb-boardp)'], parts: [{ sel: '.lvb-local, .lvb-boardp', stack: true }] },
    'master-stacker':      { phoneAbout: ['.wk-champ'], root: '#ms-stack', zoom: '.ms-play', box: ['.ms-hud', '.ms-cv'], how: ['.ms-how'], parts: [{ sel: '.ms-local, .ms-boardp', stack: true }],
                             side: ['.ms-hud', '.ms-ctrls'], snug: true,   // score and buttons sit over Next up, so the board gets the height
                             // short phones: Next up with Pause and Restart in a bar over the board and the arrow pad under it, both at
                             // full size, and the score boxes on a screen of their own right after the game, so every word reads at
                             // 11px or more (QA 2026-11-14, pass 8: the whole game scaled to 53% on a 360x640 screen, its words 8-9px)
                             short: { maxH: 760, bar: ['.ms-slip', '.ms-ctrls'], drop: ['.ms-pad'], parts: [{ sel: '.ms-hud', name: 'Score', fit: true }] } },
    // short phones: the fighters and upgrades on a screen of their own right after the battlefield, so both read at full size (QA
    // 2026-11-14: on a 360x640 screen the whole game was scaled to 55%, its words 8-9px)
    // (pass 8: phones up to 900px tall too: at 390x844 the tab row ran past its boxes, and with room kept for the score row's third
    // line and the gaps fixed, the game under it would have been scaled to 63%, its words 10px)
    // (2026-11-15: every phone, 412x915 too: kept in the game there, they scaled the battlefield to 71%, 283px wide)
    'master-cannoneer':    { board: true, phoneAbout: ['.wk-champ'], phoneParts: [{ sel: '#hw-ctl', name: 'Fighters and upgrades', maxH: 1000, fit: true }], root: '#ma-holdwall', zoom: '.wrap', phoneW: 400, phoneHow: ['.wrap > .help'], squeeze: { sel: '.wrap', min: 1100 }, parts: [{ sel: '.hw-boardrow > section.panel', stack: true }] },
    // (phones: the crew picker's how-to line goes to How to play, so the picker fits its screen at full size; QA 2026-11-14: 61%)
    'sky-fishing':         { board: true, phoneAbout: ['.wk-champ'], phoneHow: ['.sd-panel .sd-note'], root: '#ma-skyduel', zoom: '.sd-wrap', snug: true, phoneW: 420, phoneMinW: 360, headIn: '.sd-wrap', beside: { host: '.sd-wrap', items: ['.sd-msg', '.sd-weapons', '.sd-pad', '.sd-panel'], wide: true },
                             wideParts: [{ sel: '.sd-help', name: 'How to play' }],   // the long how-to gets a box of its own, so the map and the crew picker keep their size
                             // phones: the crew picker gets a screen of its own just before the game (it was squeezed under the name to
                             // 7px words; QA 2026-11-14), and the row follows it: on to the game when it starts, back when it opens again
                             phoneParts: [{ sel: '.sd-panel', pre: true, follow: true }, { sel: '.sd-help', name: 'How to play' }],
                             parts: [{ sel: '.gb-row > .gb-card', stack: true }, { sel: '.sd-notes', name: 'Your items' }],
                             // short phones: the score row with Pause and New run over the battlefield, the weapons, the move buttons, and the
                             // turn message under it, all at full size outside the scaled game, and the view buttons on a screen of their own
                             // right after it, so the battlefield keeps the screen's width and every word reads at 11px or more (QA 2026-11-14,
                             // pass 8: the whole game scaled to 62% on a 360x640 screen, its words 10.5px)
                             // (2026-11-15: every phone, not only short ones: at 390x844 the battlefield was scaled to 85%, 303px wide; now 350px)
                             short: { maxH: 1000, flow: true, bar: ['.sd-bar', ['.sd-pause', '.sd-new']], drop: ['.sd-weapons', '.sd-pad', '.sd-msg'], parts: [{ sel: '.sd-view', name: 'View' }] } }
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
  if (cfg.phoneHowAfter && window.innerWidth < 700 && cfg.how && cfg.how.length) { cfg.parts = [{ sel: cfg.how.join(', '), name: 'How to play' }].concat(cfg.parts || []); cfg.how = []; }
  if (cfg.wideParts && window.innerWidth >= 700) cfg.parts = cfg.wideParts.concat(cfg.parts || []);
  if (cfg.phoneParts && window.innerWidth < 700) cfg.parts = cfg.phoneParts.filter(function (p) { return !p.maxH || window.innerHeight < p.maxH; }).concat(cfg.parts || []);
  var short = cfg.short && window.innerWidth < 700 && window.innerHeight < cfg.short.maxH ? cfg.short : null;
  if (short && short.parts) cfg.parts = short.parts.concat(cfg.parts || []);
  if (short && short.flow) { cfg.phoneW = 0; cfg.phoneMinW = 0; cfg.phoneFlow = true; }   // (the scaled game is as wide as the screen's room)
  // 1. the game: everything the page had, less the parts that get panels of their own
  var h1 = q(H1);
  var game = panel((h1 && (h1.querySelector('.face') || h1).textContent.replace(/\s+/g, ' ').trim()) || 'Game', 'gs-game');
  Array.prototype.slice.call(root.children).forEach(function (c) {
    if (c.classList.contains('ma-plx') || /^(STYLE|SCRIPT|LINK)$/.test(c.tagName)) return;
    game.appendChild(c);
  });
  root.appendChild(stage);
  // 2. how to play: the name and the lines about the game (they were the page's header)
  var about = panel(cfg.phoneHowAfter && window.innerWidth < 700 ? 'About' : 'How to play', 'gs-about'); track.insertBefore(about, game);
  var aboutIn = document.createElement('div'); aboutIn.className = 'gs-col'; about.appendChild(aboutIn);
  var howBox = document.createElement('div'); howBox.className = 'gs-how'; aboutIn.appendChild(howBox);
  function emptyOut(from) {   // a column left with nothing in it steps aside so the game can center
    // (never a box that holds the game itself: a daily puzzle's card can be empty for a moment while it starts, and hiding it then
    // hid the game for good; QA 2026-11-14)
    var zr = cfg.zoom && q(cfg.zoom, game);
    for (var p = from; p && p !== game; p = p.parentElement) {
      if (zr && (p === zr || p.contains(zr))) break;
      if (p.matches && p.matches('canvas, .hg-card, main, [class*="board"], [class*="stage"]')) break;
      var any = Array.prototype.some.call(p.children, function (c) { return !/^(STYLE|SCRIPT)$/.test(c.tagName) && getComputedStyle(c).display !== 'none'; });
      if (any) break;
      p.classList.add('gs-empty'); if (p.parentElement) p.parentElement.classList.add('gs-solo');
    }
  }
  function unEmpty() {
    var back = false;
    qa('.gs-empty', game).forEach(function (p) {
      var any = Array.prototype.some.call(p.children, function (c) { return !/^(STYLE|SCRIPT)$/.test(c.tagName) && getComputedStyle(c).display !== 'none'; });
      if (any) { p.classList.remove('gs-empty'); back = true; }
    });
    if (back) qa('.gs-solo', game).forEach(function (s) { if (!s.querySelector(':scope > .gs-empty')) s.classList.remove('gs-solo'); });
    return back;
  }
  function adopt() {
    var moved = false;
    qa(ABOUT, game).forEach(function (e) { if (gameHead && gameHead.contains(e)) return; var from = e.parentElement; if (gameHead) gameHead.appendChild(e); else aboutIn.insertBefore(e, howBox); emptyOut(from); moved = true; });
    // the daily puzzles' tagline (from the old header) and their how-to (from the card) now sit one under the other, and most
    // open with the same sentence (Book Icons: 'A famous book, told in icons.' then 'A famous book, told only in icons.'; QA
    // 2026-11-14): when they do, the how-to is shown and the tagline steps aside, so it's said once
    var tag = q('.hg-tag', aboutIn), howP = q('.hg-how', aboutIn);
    if (tag && howP) {
      var words = function (s) { return (s.split(/[.!?](\s|$)/)[0] || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && !/^(and|the|for)$/.test(w); }); };
      var a = words(tag.textContent), b = words(howP.textContent), same = a.filter(function (w) { return b.indexOf(w) >= 0; }).length;
      tag.classList.toggle('gs-dup', a.length > 0 && same / Math.min(a.length, b.length || 1) >= 0.75);
    }
    if (toAbout()) moved = true;
    // the name panel steps aside when everything it held went over the game
    if (gameHead && about.parentNode && !aboutIn.querySelector(':scope > :not(.gs-how)') && !howBox.children.length) { about.parentNode.removeChild(about); }
    (cfg.how || []).forEach(function (sel) { qa(sel, game).forEach(function (e) { var from = e.parentElement; howBox.appendChild(e); emptyOut(from); moved = true; }); });
    (cfg.parts || []).forEach(function (part, i) {
      var sel = part.sel || part, els = qa(sel, game); if (!els.length) return;
      if (part.stack && window.innerWidth < 700) els.reverse();   // phones: Best this week after the leaderboard (Maurice, 2026-11-13)
      var p = track.querySelector('.gs-panel[data-part="' + i + '"]');
      if (!p) {
        var h = els[part.stack ? els.length - 1 : 0].querySelector('h1,h2,h3'), name = part.name || (h && h.textContent.replace(/\s+/g, ' ').trim()) || 'More';
        p = panel(name, 'gs-part' + (part.pre ? ' gs-pre' : '') + (part.fit ? ' gs-fit' : '')); p.setAttribute('data-part', i);
        var col = document.createElement('div'); col.className = (els.length > 1 && !part.stack ? 'gs-group' : 'gs-col') + (part.stack ? ' gs-stack' : ''); p.appendChild(col);
        if (part.pre) track.insertBefore(p, game);   // a setup screen: just before the game
        else {
          // panels keep the order the parts are listed in, after How to play and before the Arcade
          var after = game;
          qa('.gs-panel[data-part]:not(.gs-pre)', track).forEach(function (o) { if (+o.getAttribute('data-part') < i) after = o; });
          track.insertBefore(p, after.nextSibling);
        }
        if (part.follow) follow(p, els[0]);
      }
      els.forEach(function (e) { var from = e.parentElement; p.firstChild.appendChild(e); emptyOut(from); });
      moved = true;
    });
    // a game's export card (Thread the Needle and the other arcade games): its own panel right after the game
    // a daily puzzle's result and its share card go there too once the puzzle is over (Maurice, 2026-11-14: 'when you win on
    // mobile, this happens'), so the game never grows past its screen
    // an arcade game's score form and the 100 XP box go there too: a game panel is never shrunk to make room for them (QA
    // 2026-11-14: Sky Gauntlet's game over scaled the board to 27% on a phone, Airship Runner's to 63%)
    var results = resultsIn(game), cpOn = track.querySelector('.gs-cardp'); cpOn = !!cpOn && cpOn.style.display !== 'none';
    var card = results[0];
    if (card) {
      if (fsOn) exitFs(true);   // the result is on its own screen: full screen steps aside so it's seen (section 20)
      var cp = track.querySelector('.gs-cardp');
      if (!cp) { cp = panel('Your result', 'gs-part gs-cardp'); var cc = document.createElement('div'); cc.className = 'gs-col'; cp.appendChild(cc); watchCard(cp); }
      track.insertBefore(cp, game.nextSibling);
      results.forEach(function (e) { cp.firstChild.appendChild(e); });
      // the export card leads, so the result's first screen shows it, never a lone line over an empty screen (QA 2026-11-14: Goma
      // Goons' 'Practice game.' line sat alone on the first screen, the card and the XP box on the next)
      var ac0 = cp.querySelector('.ac-card'); if (ac0 && ac0.parentElement === cp.firstChild && cp.firstChild.firstChild !== ac0) cp.firstChild.insertBefore(ac0, cp.firstChild.firstChild);
      cp.style.display = ''; cardCols(cp); moved = true; toCard = true;
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
    if (moved) { var hold = !!card && stops.length > 0; bar(); size(hold); if (hold && toCard && !cpOn) holdGame(); }   // (a result after the row was laid out: the game holds still until the row moves on)
    // the puzzle is over: on to the result, so the score is the first thing seen (Maurice, 2026-11-14)
    if (toCard) { toCard = false; setTimeout(function () { goPanel(track.querySelector('.gs-cardp')); }, 700); }
  }
  var toCard = false;
  // phones: the champion banner (and a daily puzzle's date) go to the name's screen just before the game, so the board gets the
  // game's screen (section 20; Maurice's players, 2026-11-15)
  function toAbout() {
    if (!cfg.phoneAbout || window.innerWidth >= 700) return false;
    var moved = false;
    cfg.phoneAbout.forEach(function (sel) { qa(sel, game).forEach(function (e) { var from = e.parentElement; e.classList.add('gs-abouted'); aboutIn.insertBefore(e, howBox); emptyOut(from); moved = true; }); });
    return moved;
  }
  var RES = '.ac-card, .hg-share, #hg-result.win, #hg-result.lose, #thw-result.win, #thw-result.lose, .thw-result.win, .thw-result.lose, .txp, ' +
    '.sgb-post, .tr-post, .lvb-post, .ms-post, .fl-post, .hw-post, .gb-post';
  // the result panel after the next run: a score form shown again there brings the row back to it, and the panel steps out
  // of the row while nothing in it is showing (a new run hides the form)
  function watchCard(cp) {
    if (!window.MutationObserver) return;
    var ct = 0, seen = '';
    new MutationObserver(function () { clearTimeout(ct); ct = setTimeout(function () {
      var shown = resultsIn(cp), on = shown.length > 0, was = cp.style.display !== 'none';
      var sig = shown.map(function (e) { return e.className.split(' ')[0]; }).join(',');
      if (sig === seen && on === was) return;   // (a box redrawing its own words is left alone)
      seen = sig; cardCols(cp);
      if (on !== was) { cp.style.display = on ? '' : 'none'; bar(); }
      size(true);   // (the game keeps its size: its result changed, not the game)
      if (on && !was) { if (fsOn) exitFs(true); setTimeout(function () { goPanel(cp); }, 400); }
    }, 80); }).observe(cp, { attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true });
  }
  // wide screens: a score form and the XP box side by side, each its full size (stacked, they were scaled to 80%)
  function cardCols(cp) { var c = cp.firstChild; if (c) c.className = window.innerWidth >= 700 && resultsIn(cp).length > 1 ? 'gs-group' : 'gs-col'; }
  // what's showing of the result (a box inside another one, the XP box in a daily win box, rides along with it)
  function resultsIn(from) {
    var all = qa(RES, from).filter(function (e) { return !e.hidden && getComputedStyle(e).display !== 'none'; });
    return all.filter(function (e) { return !all.some(function (o) { return o !== e && o.contains(e); }); });
  }
  // a setup screen that comes and goes with the game (Goma Goons' crew picker on phones): its panel is in the row only while
  // the game shows it, and the row glides to the game when it starts and back to the setup when it opens again (QA 2026-11-14:
  // 'Start Free-for-All' started the game while the row stayed on the picker)
  function follow(p, el) {
    var shownNow = !el.hidden;
    p.style.display = shownNow ? '' : 'none';
    if (!window.MutationObserver) return;
    new MutationObserver(function () {
      var on = !el.hidden; if (on === shownNow) return; shownNow = on;
      if (on && fsOn) exitFs(true);   // (the setup screen came back: out of full screen to it)
      // the game is over and its result is on the way: the row holds still on the game, which keeps its size, and then goes on to
      // the result, never back to the setup first (QA 2026-11-14: Goma Goons' Pause jumped for 23 frames before the row moved)
      var res = on && resultsIn(game).length > 0;
      p.style.display = on ? '' : 'none';
      bar(); size(res);   // (the bar gets one segment per panel again: it lit the wrong ones; QA 2026-11-14)
      if (res) { holdGame(); return; }
      setTimeout(function () { goPanel(on ? p : game); }, 320);   // after the row has settled onto its new stops
    }).observe(el, { attributes: true, attributeFilter: ['hidden'] });
  }
  // ...and what's left in it stays where it was: a game that hides its controls at game over would be centered again, its score row and
  // Pause dropping 60px (QA 2026-11-14), so it keeps the top it was fitted at until the next fit
  var gameTop = null;
  function topIn() { var t = 1e9, gr = game.getBoundingClientRect(); Array.prototype.forEach.call(game.children, function (c) { if (!c.offsetParent || bgLayer(c)) return; var b = c.getBoundingClientRect(); if (b.height) t = Math.min(t, b.top); }); return t < 1e9 ? (t - gr.top) / (gr.height / Math.max(1, game.offsetHeight) || 1) : null; }
  function letGo() { game.style.removeProperty('justify-content'); if (fsOn) game.style.setProperty('padding-top', FS_CSS['padding-top'], 'important'); else game.style.removeProperty('padding-top'); }   // (full screen keeps its own top: section 20)
  // (where the game sat a moment before its result came in: the top it was fitted at goes stale when the game changes its own
  // height once play starts; QA 2026-11-14, pass 6: Goma Goons' Free-for-All dropped 17px at START, so holding it at the fitted
  // top lifted the whole game 17px at game over)
  var topLog = [];
  setInterval(function () {
    if (game.style.justifyContent || resultsIn(game).length) return;
    var t = topIn(); if (t === null) return; topLog.push({ at: Date.now(), t: t }); if (topLog.length > 8) topLog.shift();
  }, 150);
  function topBefore() {
    for (var i = topLog.length - 1; i >= 0; i--) if (Date.now() - topLog[i].at >= 300) return topLog[i].t;
    return gameTop;
  }
  function holdGame() {
    var gi = panels.indexOf(game); if (gi < 0) return; gameTouch = 0; glideTok++; wTo(0, stopY(at[gi] || 0)); paint(); draw();
    var tb = topBefore(); if (tb !== null && tb !== undefined) gameTop = tb;
    var t = topIn(); if (gameTop === null || t === null || Math.abs(t - gameTop) < 1) return;
    game.style.setProperty('justify-content', 'flex-start', 'important');
    var t2 = topIn(), pt = parseFloat(getComputedStyle(game).paddingTop) || 0;
    if (t2 !== null) game.style.setProperty('padding-top', Math.max(0, pt + gameTop - t2).toFixed(1) + 'px', 'important');
  }
  function goPanel(p) {
    var i = panels.indexOf(p); if (i < 0) return;
    gameTouch = 0; var ty = stopY(at[i] || 0);
    if (still) wTo(0, ty); else glideTo(ty);
  }
  function rowPanels() { return qa('.gs-panel', track).filter(function (p) { return p.style.display !== 'none'; }); }

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
    var i = panels.indexOf(arc), on = false;   // no fly-in: nothing in the row fades or moves on its own (Maurice, 2026-11-14: 'I don't want the previous modules to disappear')
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
  function prevStop() {
    for (var k = stops.length - 1; k >= 0; k--) if (stops[k] < x - vw * 0.25) { snap.glide(stopY(k)); return; }
    snap.glide(y0);
  }
  back.addEventListener('click', prevStop);
  // at the last stop, a down arrow: on past the row, the same glide a forward swipe there makes (Maurice, 2026-11-14)
  var down = document.createElement('button'); down.type = 'button'; down.className = 'gs-hint gs-down'; down.setAttribute('aria-label', 'Scroll down');
  down.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>'; stage.appendChild(down);
  down.addEventListener('click', function () { snap.exit(1); });
  function placeArrows() {
    if (wide) { back.style.left = ''; hint.style.left = ''; return; }
    var sg = qa('.gs-seg', prog), sr = stage.getBoundingClientRect(); if (sg.length < 2) return;
    var c = function (i) { var r = sg[Math.min(sg.length - 1, i)].getBoundingClientRect(); return (r.left + r.width / 2 - sr.left) + 'px'; };
    back.style.left = 'calc(50% - 28px)'; hint.style.left = 'calc(50% + 28px)';   // the pair centered at the bottom (Maurice, 2026-11-14)
  }
  function nextStop() {
    // the next stop at least a quarter screen along (a stop a few pixels away would barely move the row)
    for (var k = 0; k < stops.length; k++) if (stops[k] > x + vw * 0.25) { snap.glide(stopY(k)); return; }
    var tl = stops.length - 1; if (tl >= 0 && stops[tl] > x + 1) snap.glide(stopY(tl));
  }
  hint.addEventListener('click', nextStop);
  var sbar = document.createElement('div'), sbarIn = document.createElement('i');
  sbar.className = 'gs-sbar'; sbar.setAttribute('aria-hidden', 'true'); sbar.title = 'Scroll Bar'; sbar.appendChild(sbarIn); stage.appendChild(sbar);
  var panels = [], segs = [];
  function bar() {
    panels = rowPanels();
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
  var widthsOf = [], HOLD = 320, HOLD_END = 200,   /* a short settle at the end (QA 2026-11-14: a hold of 1040 left a long stretch of scrolling that moved nothing) */ starts = [], holds = [], vw = 0, y0 = 0, x = 0, n = 0, wide = false, lefts = [], stops = [], at = [], total = 0, W = 0;
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
        col.classList.remove('gs-cols'); col.style.width = ''; col.style.height = ''; frames(p);
        [col, col.firstElementChild].forEach(function (e) { if (e) { e.style.columnWidth = ''; e.style.columnCount = ''; e.style.columnGap = ''; e.style.columnFill = ''; } });
        Array.prototype.forEach.call(col.querySelectorAll('.gs-box'), function (b) { b.style.minHeight = ''; });
        p.classList.remove('gs-mid');
        var d = pad(p), room = p.clientHeight - d.y;
        // the Arcade: big tiles in two rows, as wide as they need to be; you scroll sideways through them (Maurice,
        // 2026-11-13: 'do the same with the arcade, put them like the windows tiles design')
        if (p.classList.contains('gs-arcade')) { col.style.height = room + 'px'; p.style.width = (Math.max(1, Math.ceil((col.scrollWidth + d.x - 1) / vw)) * vw) + 'px'; return; }   // a whole number of screens
        // the result panel: a box a little taller than the screen (the export card) is scaled down to fit its screen whole, instead of
        // running its last lines onto the next screen and leaving that one near empty (QA 2026-11-14: Goma Goons at 360x640)
        if (p.classList.contains('gs-cardp')) { var tall = 0; Array.prototype.forEach.call(col.children, function (c) { tall = Math.max(tall, c.offsetHeight); }); if (tall > room && room / tall >= 0.8) { shrink(p, tall + 2, room); d = pad(p); room = p.clientHeight - d.y; } }
        // a long part (the Key): full size in screen-wide columns, scrolled through sideways, instead of shrunk until it
        // can't be read ('make the key bigger and wider so you have to scroll through it but it's readable')
        // (a setup screen shrinks instead: its buttons never split across screens; the name panel shrinks down to 80% and no
        // further, then runs on to a second screen, so its words stay readable: QA 2026-11-14, Trench Run's at 72% on a phone)
        if (col.scrollHeight > room * (p.classList.contains('gs-about') ? 1.25 : 1.15) && !p.classList.contains('gs-pre') && !p.classList.contains('gs-fit')) {
          col.classList.add('gs-cols'); col.style.height = room + 'px';
          var box = col.children.length === 1 ? col.firstElementChild : col;
          // n columns, one per screen: the gap is the panel's padding plus the box's own padding and border, so every
          // column starts the same distance in from its screen's edge and none is cut where the row stops
          var setCols = function (n) {
            var sw = vw / (parseFloat(p.style.zoom) || 1);   // a screen, in the panel's own (scaled) pixels
            p.style.width = (sw * n) + 'px'; col.style.width = (sw * n - d.x) + 'px';
            var bs = getComputedStyle(box), chrome = box === col ? 0 : parseFloat(bs.paddingLeft) + parseFloat(bs.paddingRight) + parseFloat(bs.borderLeftWidth) + parseFloat(bs.borderRightWidth);
            box.style.columnWidth = 'auto'; box.style.columnCount = n; box.style.columnGap = (d.x + chrome) + 'px'; box.style.columnFill = 'auto';
          };
          // (as many screens as it takes: at 12 the Key's last column ran past the panel's last stop and was cut off; QA 2026-11-14)
          for (var n = 1; n <= 40; n++) { setCols(n); if (box.scrollWidth <= box.clientWidth + 1 && col.scrollWidth <= col.clientWidth + 1 && inside(col)) break; }
          if (box !== col && n > 1) frames(p, box, n);
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
      col.classList.remove('gs-cols'); col.style.height = ''; col.style.width = ''; frames(p);
      [col, col.firstElementChild].forEach(function (e) { if (e) { e.style.columnWidth = ''; e.style.columnCount = ''; e.style.columnGap = ''; e.style.columnFill = ''; } });
      Array.prototype.forEach.call(col.querySelectorAll('.gs-box'), function (b) { b.style.minHeight = ''; });
      function set(w) { p.style.width = (w + d.x) + 'px'; col.style.width = w + 'px'; }
      if (p.classList.contains('gs-arcade')) { set(max); col.style.height = room + 'px'; return; }
      if (col.classList.contains('gs-group')) {   // a few boxes (a best score and a board): side by side, each top edge to bottom edge
        var gw = 0, gn = 0; Array.prototype.forEach.call(col.children, function (c) { if (c.hidden || getComputedStyle(c).display === 'none') return; c.classList.add('gs-box'); gw += 440; gn++; });
        gw += 20 * Math.max(0, gn - 1); set(Math.min(gw, max));
        col.style.height = ''; room = shrink(p, col.scrollHeight, room); col.style.height = room + 'px'; return;
      }
      var isAbout = p.classList.contains("gs-about"), wMin = isAbout ? 400 : 360, wMax = Math.min(isAbout ? 520 : 780, max);
      for (var w = wMin; w <= wMax; w += 20) { set(w); if (col.scrollHeight <= room + 1 && col.scrollWidth <= w + 1 && inside(col)) { best = w; break; } }
      if (!best && p.classList.contains('gs-about')) { set(Math.min(520, max)); room = shrink(p, col.scrollHeight, room); best = -1; }   // the name panel never splits into columns; it shrinks
      if (!best && col.children.length > 1) { set(Math.min(600, max)); room = shrink(p, col.scrollHeight, room); best = -1; }   // a stacked panel (Best this week over its board) shrinks rather than splitting
      if (!best) {   // too tall for one column: side-by-side columns, as many as it takes
        col.classList.add('gs-cols'); col.style.height = room + 'px';
        var one = col.children.length === 1 ? col.firstElementChild : null;   // one box (the Key): its columns run inside it
        var fits = function () { return col.scrollWidth <= col.clientWidth + 1 && (!one || (one.scrollWidth <= one.clientWidth + 1 && one.scrollHeight <= one.clientHeight + 8)) && inside(col); };
        for (var w2 = 700; w2 <= max; w2 += 20) { set(w2); if (fits()) { best = w2; break; } }
        // wider than the screen: a whole number of screens, the columns lined up so each screen shows whole columns and the row's
        // stops never cut one (QA 2026-11-14: stops between panels sliced the Key and the boards at the screen's edge)
        if (!best) {
          var kb = one || col, kc = getComputedStyle(kb), chrome = kb === col ? 0 : parseFloat(kc.paddingLeft) + parseFloat(kc.paddingRight) + parseFloat(kc.borderLeftWidth) + parseFloat(kc.borderRightWidth);
          var per = Math.max(1, Math.floor((vw + d.x + chrome) / (300 + d.x + chrome)));   // columns of 300px or more on each screen
          for (var ns = 2; ns <= 8 && !best; ns++) {
            p.style.width = (vw * ns) + 'px'; col.style.width = (vw * ns - d.x) + 'px';
            kb.style.columnWidth = 'auto'; kb.style.columnCount = ns * per; kb.style.columnGap = (d.x + chrome) + 'px'; kb.style.columnFill = 'auto';
            if (fits()) { best = -2; if (one) frames(p, one, ns); }
          }
          if (!best) { kb.style.columnWidth = ''; kb.style.columnCount = ''; kb.style.columnGap = ''; kb.style.columnFill = ''; }
        }
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
  // a Key that runs on across screens gets a frame on each screen instead of one box whose top and bottom edges run off the
  // screen's side (QA 2026-11-14: Sky Gauntlet's Key at 1440: its right border was a screen away); its columns already sit one
  // set to a screen, the same distance in from each screen's edges, so each frame holds that screen's columns
  function frames(p, box, ns) {
    Array.prototype.slice.call(p.children).forEach(function (f) { if (f.classList.contains('gs-frame')) p.removeChild(f); });
    Array.prototype.forEach.call(p.querySelectorAll('.gs-framed'), function (b) { b.classList.remove('gs-framed'); });
    if (!box || !(ns > 1)) return;
    box.classList.add('gs-framed');
    var pr = p.getBoundingClientRect(), br = box.getBoundingClientRect(), z = parseFloat(p.style.zoom) || 1, sw = vw / z;
    var l = (br.left - pr.left) / z, r = (pr.right - br.right) / z, t = (br.top - pr.top) / z, h = br.height / z;
    for (var k = 0; k < ns; k++) {
      var f = document.createElement('i'); f.className = 'gs-frame'; f.setAttribute('aria-hidden', 'true');
      f.style.left = (k * sw + l).toFixed(1) + 'px'; f.style.width = (sw - l - r).toFixed(1) + 'px'; f.style.top = t.toFixed(1) + 'px'; f.style.height = h.toFixed(1) + 'px';
      p.appendChild(f);
    }
  }
  // a Key whose words outgrew its columns after it was laid out (a late font, Easy Mode's extra lines) runs past its last screen
  function colsOff() {
    return panels.some(function (p) {
      var col = p.firstChild; if (!col || !col.classList || !col.classList.contains('gs-cols')) return false;
      var box = col.children.length === 1 ? col.firstElementChild : col;
      return box.scrollWidth > box.clientWidth + 1 || col.scrollWidth > col.clientWidth + 1;
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
    var z = +Math.max(wide ? 0.55 : 0.4, room / need).toFixed(3), h = p.getBoundingClientRect().height;   // (the scale as set, so the width below matches it)
    p.style.zoom = z.toFixed(3); p.style.height = (h / z).toFixed(1) + 'px'; p.style.setProperty('--gz', z.toFixed(3));
    // a phone panel still fills the screen's width, exactly (QA 2026-11-14, pass 6: 390.11px wide at 98%, so each stop after it
    // showed a 0.1px sliver of the panel before)
    if (!wide) p.style.width = (vw / z).toFixed(4) + 'px';
    return p.clientHeight - pad(p).y;
  }
  // the phones' pinned background (loader.js puts an .ma-pfx layer over the whole panel) is not part of the game: it never counts
  // when the game is measured (it made every phone game panel shrink to 85%; QA 2026-11-14)
  function bgLayer(c) { return c.classList.contains('ma-pfx') || c.classList.contains('gs-fsx') || c.getAttribute('aria-hidden') === 'true' && getComputedStyle(c).position === 'absolute'; }
  function shrinkGame() {
    game.style.zoom = ''; game.style.height = ''; game.style.removeProperty('--gz');
    if (signIn()) { capGate(); return; }   // the sign-in questions keep their full size: the start card scrolls inside itself if it must
    if (game.classList.contains('gs-scrolly')) return;   // (Sky Mines on a short phone: what runs on under the field scrolls instead; section 20)
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
  // wide screens: the panels go in screens of their own, as many whole panels to a screen as fit, with the room left over
  // shared out between them, so every stop of the row shows whole panels and never a slice of one (QA 2026-11-14: stops
  // centered on a panel cut the next one at the screen's edge); a panel a screen or wider takes a whole number of screens
  function screens() {
    panels.forEach(function (p) { p.style.marginLeft = ''; p.style.marginRight = ''; });
    if (!wide) return;
    var ws = panels.map(function (p) { return p.getBoundingClientRect().width; }), zs = panels.map(function (p) { return parseFloat(p.style.zoom) || 1; });
    for (var i = 0; i < panels.length;) {
      if (ws[i] > vw - 1) { var fill = Math.ceil(ws[i] / vw - 0.002) * vw - ws[i]; if (fill > 0.5) panels[i].style.marginRight = (fill / zs[i]).toFixed(2) + 'px'; i++; continue; }
      var j = i, sum = ws[i];
      while (j + 1 < panels.length && ws[j + 1] <= vw - 1 && sum + ws[j + 1] <= vw + 0.5) { j++; sum += ws[j]; }
      var gap = Math.max(0, vw - sum) / (j - i + 2);
      for (var k = i; k <= j; k++) panels[k].style.marginLeft = (gap / zs[k]).toFixed(2) + 'px';
      panels[j].style.marginRight = (gap / zs[j]).toFixed(2) + 'px';
      i = j + 1;
    }
  }
  function setLen() {
    var vh = window.innerHeight;
    root.style.setProperty('height', (total + vh) + 'px', 'important');
    var fe = root.closest('.fluid-engine');
    if (fe) { fe.style.setProperty('grid-template-rows', 'none', 'important'); fe.style.setProperty('grid-auto-rows', 'auto', 'important'); fe.style.setProperty('min-height', (total + vh) + 'px', 'important'); }
  }
  function layout() {
    screens();
    lefts = []; widthsOf = []; W = 0;
    var t0 = track.getBoundingClientRect().left;
    panels.forEach(function (p) { var r = p.getBoundingClientRect(), mr = (parseFloat(p.style.marginRight) || 0) * (parseFloat(p.style.zoom) || 1); lefts.push(r.left - t0); widthsOf.push(r.width); W = r.left - t0 + r.width + mr; });
    var end = Math.max(0, W - vw), seen = -1;
    stops = []; at = [];
    // a stop every screen width (phones: one panel a screen; wide screens: the screens laid out above), so a wide part (the Key,
    // the Arcade) is read a screen at a time
    for (var sx = 0; sx < end - 2; sx += vw) stops.push(Math.round(sx));
    stops.push(Math.round(end));
    panels.forEach(function (p, i) { var k = 0; stops.forEach(function (v, j) { if (v <= lefts[i] + 2) k = j; }); at[i] = k; });
    // where each hold starts on the scroll, and how long it lasts
    starts = []; holds = []; var acc = 0;
    stops.forEach(function (v, k) {
      if (k) acc += holds[k - 1] + (v - stops[k - 1]);
      starts[k] = acc; holds[k] = k === stops.length - 1 ? HOLD_END : 0;   // no pauses along the way, only at the Arcade (Maurice, 2026-11-13: 'it still pauses on the game')
    });
    total = stops.length ? starts[stops.length - 1] + holds[stops.length - 1] : 0;
    setLen();   // the page is always as long as the row needs, whichever path laid it out (QA 2026-11-14: Sort the Shelf at 1920 grew a screen on START and the arrows ran into the footer)
  }
  function size(keep) {
    if (fsOn) { fsFit(); return; }   // full screen: only the game is fitted again (section 20)
    // (a browser with a smallest-text setting of 13px or more: the frame CSS scales a few tight rows of buttons instead; QA pass 8)
    document.documentElement.classList.toggle('gs-floor', floorPx() >= 13);
    document.documentElement.classList.toggle('gs-floor16', floorPx() >= 16);
    // ...scaled only so far that the floor's words still read at 11px or more (pass 9: 13px x 0.78 read as 10.1px)
    if (floorPx() >= 13) document.documentElement.style.setProperty('--gs-fz', Math.max(0.78, Math.min(1, 11.3 / floorPx())).toFixed(3)); else document.documentElement.style.removeProperty('--gs-fz');
    keep = keep === true;   // the game keeps its size and place: its result is on the way (Goma Goons' Pause jumped at game over; QA 2026-11-14)
    var restK = -1; stops.forEach(function (v, k) { if (Math.abs(v - x) < 3) restK = k; });
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
    panels = rowPanels(); n = panels.length;
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
    if (!keep) {
      letGo();
      game.style.zoom = ''; game.style.height = '';
      if (wide) game.style.width = vw + 'px';   // the game lays itself out with the whole screen first, then the panel closes in on it
      fit(true);
      shrinkGame();
    }
    stage.classList.remove('gs-measure');
    if (!keep) gameTop = topIn();
    layout();
    setLen();
    y0 = Math.round(root.getBoundingClientRect().top + window.scrollY);   // (whole pixels, as the scroll lands)
    steadyPause(); fitLabels(); alignChamp(); setTimeout(function () { fitLabels(); alignChamp(); }, 400);
    shown = null; arcFar = 0; placeArrows(); paint();
    if (!wide) setTimeout(snapNow, 250);   // the menu bar changing height moves the row's start: settle back onto a whole screen
    // wide screens: a panel that changed size (a leaderboard filled in, a result came in) moves the stops; the row stays on the
    // screen it was resting on instead of being left partway between two
    else if (restK >= 0 && Date.now() - userAt > 400 && !touching) { var rk = Math.min(restK, stops.length - 1); if (Math.abs(stops[rk] - x) > 1) wTo(0, stopY(rk)); }
    if (window.maCiRelines) window.maCiRelines();   // the 3D headings measure again in their new panels
    presize();
  }
  // where the scroll puts the row exactly on stop k (the last stop a pixel into its hold)
  function stopY(k) { return y0 + (starts[k] || 0) + (k === stops.length - 1 ? 1 : 0); }
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
    // a row within a pixel of a stop rests exactly on it (QA 2026-11-14, pass 6: phones stopped 0.2-0.6px past a whole screen,
    // a sliver of the next panel showing and the text at the edge 15.4px in): the scroll lands on whole pixels, the page's top may not
    for (var sk = 0; sk < stops.length; sk++) if (Math.abs(x - stops[sk]) < 1) { x = stops[sk]; break; }
    // the Scroll Bar: fills while the row holds on a section; gone while the row is moving
    sbar.style.opacity = fill > 0.01 && fill < 1 ? '1' : '0';
    sbarIn.style.transform = 'scaleX(' + Math.min(1, fill).toFixed(3) + ')';
    tx = x; if (shown !== null) x = shown;
    // the Scroll button: on to the next section; gone at the end (Maurice, 2026-11-13: 'on horizontal scrolls, add a "scroll" button')
    var atEnd = !stops.length || tx >= stops[stops.length - 1] - 1; hint.style.opacity = atEnd ? '0' : ''; hint.style.pointerEvents = atEnd ? 'none' : ''; /* (none once the page is at its bottom) */ down.classList.toggle('on', stops.length > 0 && atEnd && document.documentElement.scrollHeight - innerHeight - scrollY > 4);
    if (fsGo) { var gi9 = panels.indexOf(game); fsGo.classList.toggle('on', !fsOn && gi9 >= 0 && Math.abs(tx - (stops[at[gi9] || 0] || 0)) < 2); }
    var atStart = tx < 4; back.style.opacity = atStart ? '0' : ''; back.style.pointerEvents = atStart ? 'none' : '';
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
  function snapNow() { if (!still && stops.length && !touching) snap.settle(0); }
  function rowY(tx) {   // the page's scroll for a spot on the row
    var L = stops.length - 1; if (L < 0) return y0;
    if (tx >= stops[L]) return stopY(L);
    var k = 0; while (k < L && stops[k + 1] <= tx) k++;
    return y0 + (starts[k] || 0) + (holds[k] || 0) + (tx - stops[k]);
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
  // a finger that moves the page is the visitor scrolling, never the game: the hold lets it through, and the row no longer
  // keeps the game centered for it (Maurice, 2026-11-14: a phone screen filled by the game left no way to scroll on)
  var fy = null;
  addEventListener('touchstart', function (e) { fy = e.touches.length === 1 ? e.touches[0].clientY : null; }, { passive: true, capture: true });
  addEventListener('touchmove', function (e) {
    if (!inGame(e.target)) { userAt = Date.now(); return; }
    if (fy !== null && e.touches.length === 1 && Math.abs(e.touches[0].clientY - fy) > 10 && pans(e.target, 'y')) { userAt = Date.now(); gameTouch = 0; }
  }, { passive: true, capture: true });
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
  document.addEventListener('scroll', function (e) { var t = e.target; if (t && t.classList && (t.classList.contains('gs-panel') || t === stage) && !t.classList.contains('gs-scrolly') && (t.scrollTop || t.scrollLeft)) { t.scrollTop = 0; t.scrollLeft = 0; } }, true);
  // every size watcher here reads and changes the page only in the next frame, never while the browser is still delivering size
  // changes (QA 2026-11-14: 'ResizeObserver loop completed with undelivered notifications' on the game pages)
  function later(fn) { var on = 0; return function () { if (on) return; on = requestAnimationFrame(function () { on = 0; fn(); }); }; }
  var touched = false, wasWide = window.innerWidth >= 700;
  ['pointerdown', 'keydown'].forEach(function (ev) { game.addEventListener(ev, function () { touched = true; }, true); });
  // a scrollbar that comes or goes changes the window's inner width without a resize event: lay out again for it
  if (window.ResizeObserver) { var cw0 = document.documentElement.clientWidth; new ResizeObserver(later(function () { var c = document.documentElement.clientWidth; if (c !== cw0) { cw0 = c; clearTimeout(rt); rt = setTimeout(size, 250); } })).observe(document.documentElement); }
  addEventListener('resize', function () {
    clearTimeout(rt);
    if (kbEl && window.innerWidth === kbW) { kbStale = true; kbLift(); return; }   // the on-screen keyboard came or went: the row holds still (section 20)
    rt = setTimeout(function () { var nowWide = window.innerWidth >= 700; if (nowWide !== wasWide && !fsOn) { location.reload(); return; } if (!fsOn) wasWide = nowWide; size(); }, 250);
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
    if (fsOn || e.defaultPrevented || gameShown() || game.contains(document.activeElement)) return;
    if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
    var k = here(), d = e.key === 'ArrowRight' ? 1 : -1;
    while (k + d >= 0 && k + d < n && at[k + d] === at[k]) k += d;
    e.preventDefault(); goTo(Math.max(0, Math.min(n - 1, k + d)));
  });
  // can the page pan this way from here? Each game claims the gestures it plays with in its own CSS (touch-action: none on a
  // live board or canvas, on Sort the Shelf's books), so whatever it leaves free belongs to the page
  function pans(t, ax) {
    for (var e = t; e && e !== stage && e.nodeType === 1; e = e.parentElement) {
      var ta = getComputedStyle(e).touchAction || 'auto';
      if (ta === 'auto' || ta === 'manipulation') continue;
      if (ta.indexOf('none') >= 0 || ta.indexOf('pan-' + ax) < 0) return false;
    }
    return true;
  }
  // a sideways swipe moves the row unless it starts on something that needs it: a field, a button, or a part the game has
  // claimed for its own drags and swipes (Maurice, 2026-11-14: the banner, the title, the start card's margins, and empty space
  // all move the row now); a daily board's tiles only take taps, so a swipe across them moves the row
  function inPlay(t) {
    if (!t || !t.closest) return false;
    if (t.closest('input, textarea, select, button, [contenteditable], [role="button"], [role="slider"]')) return true;
    return !pans(t, 'x');
  }
  // smooth and snapping at once (Maurice, 2026-11-14: 'I like snapping to section, but I don't want to lose the smoothness for
  // it. So can we have both?'): the row follows a finger, a wheel, or a trackpad exactly, and once the input stops it eases onto
  // the nearest stop, starting at the speed it was already going so it never jumps; a flick lands on the next stop the way it
  // was going. Sideways swipes move the row the same way ('scroll up/down & left/right'); up and down scroll as before.
  // One glide at a time: any new wheel, touch, key, or press stops it.
  // o: stage, x() where the row is, stops() its stops in order, yOf(rowX) the page's scroll for a spot on the row, on() the row
  //    is in play, set(y) scroll there at once, skip(target, 'wheel' or 'touch') an input the row leaves alone, wait() something else is moving it,
  //    still reduced motion, took() a swipe or a settle took over, prefer() a stop that wins over the nearest
  function snapRow(o) {
    var R = { tok: 0, busy: false, ownAt: 0, idleT: 0, wheelAt: 0, down: false, eat: 0 };
    function now() { return performance.now(); }
    function set(y) { R.ownAt = now(); o.set(y); }
    R.stop = function () { R.tok++; R.busy = false; R.exiting = 0; };
    // a curve from here to the stop that starts at speed v0 (page px per ms) and comes to rest without passing it
    R.glide = function (ty, v0, T) {
      var ys = window.scrollY, d = ty - ys, my = ++R.tok;
      clearTimeout(R.idleT);
      if (Math.abs(d) < 0.5) { R.busy = false; return; }
      if (o.still) { set(ty); R.busy = false; return; }
      T = T || 440;
      var m = (v0 || 0) * T; if (m * d <= 0) m = 0; else if (Math.abs(m) > Math.abs(3 * d)) m = 3 * d;
      var t0 = now(); R.busy = true;
      (function step() {
        if (my !== R.tok) return;
        var k = Math.min(1, (now() - t0) / T), k2 = k * k, k3 = k2 * k;
        set(ys + m * (k3 - 2 * k2 + k) + d * (3 * k2 - 2 * k3));
        if (k < 1) requestAnimationFrame(step); else { R.busy = false; R.exiting = 0; }
      })();
    };
    // the stop nearest a spot on the row; with a direction, the nearest one past it that way
    R.nearest = function (px, dir) {
      var b = null;
      o.stops().forEach(function (v) { if (dir > 0 ? v > px + 2 : dir < 0 ? v < px - 2 : true) if (b === null || Math.abs(v - px) < Math.abs(b - px)) b = v; });
      return b;
    };
    // past the ends (Maurice, 2026-11-14: 'scrolling right on the horizontal pages should scroll down when you get to the end as
    // well'): going on from the last stop glides the page down to what comes after the row, as if scrolled down; going back from
    // the first stop glides up to what's above it, if anything is
    R.exiting = 0;
    R.exit = function (dir, v0) {
      var st = o.stops(); if (!st.length) return false;
      // (the box the stage stays pinned in: the first one around it that is taller than the stage)
      var top = parseFloat(getComputedStyle(o.stage).top) || 0, bx = o.stage.parentElement, ty;
      while (bx && bx.parentElement && bx.offsetHeight < o.stage.offsetHeight + 50) bx = bx.parentElement;
      var box = bx.getBoundingClientRect();
      if (dir > 0) ty = Math.min(document.documentElement.scrollHeight - window.innerHeight, box.bottom + window.scrollY - top);
      else { var y0 = o.yOf(st[0]); if (y0 < 2) return false; ty = Math.max(0, y0 - (window.innerHeight - top)); }
      if ((ty - window.scrollY) * dir < 2) return false;
      if (o.took) o.took();
      R.glide(ty, v0 || 0, 520); R.exiting = dir;
      return true;
    };
    function atEnd(dir, x) { var st = o.stops(); return st.length > 0 && (dir > 0 ? x >= st[st.length - 1] - 2 : x <= st[0] + 2); }
    R.go = function (tx) { if (tx === null || tx === undefined) return; R.glide(o.yOf(tx)); };
    // ease onto a stop; v is the row's speed (row px per ms, more than zero going on); a swipe of 40px or more that is still
    // moving when the finger lifts goes on to the next stop that way, a drag that stopped first settles on the nearest
    R.settle = function (v, at, moved) {
      if (!o.on()) return;
      var x = at === undefined ? o.x() : at, dir = Math.abs(v) > 0.3 || (Math.abs(moved || 0) >= 40 && v * moved > 0 && Math.abs(v) > 0.08) ? (v > 0 ? 1 : -1) : 0, tx = dir ? R.nearest(x, dir) : null;
      if (tx === null) tx = R.nearest(x, 0);
      if (!dir && o.prefer) { var pf = o.prefer(); if (pf !== null && pf !== undefined) tx = pf; }
      if (tx === null || Math.abs(tx - x) < 1) return;
      var ty = o.yOf(tx), dy = ty - window.scrollY, k = Math.abs(tx - x) > 1 ? dy / (tx - x) : 1;
      var T = Math.abs(v) > 0.05 ? Math.max(320, Math.min(520, 3 * Math.abs(tx - x) / Math.abs(v))) : 440;
      if (o.took) o.took();
      R.glide(ty, v * k, T);
    };
    function idle() {
      if (R.down || R.busy || wraf || (o.wait && o.wait()) || (window.maLenis && window.maLenis.isScrolling === 'smooth')) { R.idleT = setTimeout(idle, 90); return; }
      // a scroll that went a good way (a quarter of the way to the next stop, or 120px) carries on to that stop; a small one
      // settles back on the nearest
      var x = o.x(), g = R.gx; R.gx = null;
      var near = R.nearest(x, 0);
      if (g !== null && near !== null && Math.abs(near - x) > 2) { var mv = x - g, nx = R.nearest(x, mv > 0 ? 1 : -1), pv = R.nearest(x, mv > 0 ? -1 : 1);
        if (nx !== null && Math.abs(mv) >= Math.min(120, 0.25 * Math.abs(nx - (pv === null ? x : pv)))) { R.settle(mv > 0 ? 0.1 : -0.1, x, mv > 0 ? 40 : -40); return; } }
      R.settle(0, x);
    }
    // where the row was when a scroll began, to tell which way it went (R.lx: where it was last seen at rest or under the row's own control)
    R.gx = null; R.lx = 0; setInterval(function () { if (R.gx === null) R.lx = o.x(); }, 100);
    function soon() { clearTimeout(R.idleT); R.idleT = setTimeout(idle, now() - R.wheelAt < 300 ? 220 : 150); }
    addEventListener('scroll', function () { if (R.busy || now() - R.ownAt < 40) return; if (R.gx === null) R.gx = R.lx; soon(); }, { passive: true });
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
      addEventListener(ev, function (e) {
        if (ev === 'wheel') {
          R.newWheel = now() - R.wheelAt > 250; R.wheelAt = now();
          // the rest of a sideways wheel that already sent the page past the row doesn't stop that glide
          if (R.exiting && (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey)) return;
        }
        R.stop(); clearTimeout(R.idleT); if (ev === 'wheel' && R.gx !== null) soon();
      }, { passive: true, capture: true });
    });
    addEventListener('touchstart', function () { R.down = true; }, { passive: true, capture: true });
    ['touchend', 'touchcancel'].forEach(function (ev) { addEventListener(ev, function (e) { if (!e.touches || !e.touches.length) { R.down = false; if (sw.on !== 1) soon(); } }, { passive: true }); });
    // sideways wheels, trackpads, and shift + wheel move the row as they go, eased a little so a wheel's steps don't jump (the
    // page's smooth scrolling is told to leave a sideways wheel alone, so the two never pull the page two ways)
    var wt = null, wraf = 0;
    function follow(d, lo, hi) {
      wt = Math.max(lo, Math.min(hi, (wt === null ? window.scrollY : wt) + d));
      if (!wraf) wraf = requestAnimationFrame(function fl() {
        var y = window.scrollY, dd = wt - y;
        if (Math.abs(dd) < 2 || o.still) { set(wt); wt = null; wraf = 0; soon(); return; }
        set(y + (dd > 0 ? Math.max(1, dd * 0.3) : Math.min(-1, dd * 0.3))); wraf = requestAnimationFrame(fl);
      });
    }
    addEventListener('wheel', function (e) {
      if (e.defaultPrevented || e.ctrlKey || !o.stage.contains(e.target) || (o.skip && o.skip(e.target, 'wheel'))) return;
      var ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY), d = ax > ay ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!d) return;
      if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      e.preventDefault(); e.lenisStopPropagation = true;   // (the page's smooth scrolling leaves this one to the row)
      if (R.exiting) return;
      // a sideways wheel that starts with the row at its end goes on past it
      if (R.newWheel) R.wEdge = atEnd(d > 0 ? 1 : -1, o.x()) ? (d > 0 ? 1 : -1) : 0;
      if (R.wEdge && R.wEdge * d > 0 && R.exit(R.wEdge)) return;
      var lo = o.yOf(o.stops()[0] || 0), hi = o.yOf(o.stops()[o.stops().length - 1] || 0), L = window.maLenis;
      if (L && L.isScrolling === 'smooth' && L.scrollTo && wt === null) L.scrollTo(Math.max(lo, Math.min(hi, L.targetScroll + d)));
      else follow(d, lo, hi);
      if (R.gx === null) R.gx = R.lx;
      soon();
    }, { passive: false, capture: true });
    // touch: a drag more sideways than up or down moves the row with the finger; letting go eases it onto a stop
    var sw = { on: -1, x: 0, y: 0, lx: 0, rx: 0, pts: [] };
    // (what is really under the finger: the browser hands a touch that lands in the empty room next to a button to the button, so a
    // swipe started in the gap beside The Levian's Pause never moved the row; QA 2026-11-14, pass 8)
    function under(e) {
      var t = e.target, p = e.touches && e.touches[0]; if (!p || !t || !t.getBoundingClientRect) return t;
      var r = t.getBoundingClientRect();
      if (p.clientX >= r.left && p.clientX <= r.right && p.clientY >= r.top && p.clientY <= r.bottom) return t;
      var f = document.elementFromPoint(p.clientX, p.clientY); return f && o.stage.contains(f) ? f : t;
    }
    o.stage.addEventListener('touchstart', function (e) {
      var u = under(e);
      sw.on = e.touches.length === 1 && !(o.skip && o.skip(u, 'touch')) ? 0 : -1;
      if (sw.on < 0) return;
      sw.x = sw.lx = e.touches[0].clientX; sw.y = sw.ly = e.touches[0].clientY;
      // ...and the browser won't scroll for such a touch when that button keeps its drags (Master Stacker's arrow pad): the page is
      // scrolled up and down here instead (QA 2026-11-14, pass 8: an up or down swipe just under the pad did nothing)
      sw.adj = u !== e.target && typeof pans === 'function' && !pans(e.target, 'y');
    }, { passive: true });
    o.stage.addEventListener('touchmove', function (e) {
      if (sw.on < 0) return;
      if (e.touches.length !== 1) { if (sw.on === 1) R.settle(0, sw.rx); sw.on = -1; return; }
      var cx = e.touches[0].clientX, dx = cx - sw.x, dy = e.touches[0].clientY - sw.y;
      if (!sw.on) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        sw.on = Math.abs(dx) > Math.abs(dy) * 1.2 ? 1 : sw.adj ? 2 : -1;
        if (sw.on < 0) return;
        if (sw.on === 2) { R.stop(); R.down = true; if (o.took) o.took(); }
        else { R.stop(); sw.rx = sw.rx0 = o.x(); sw.pts = []; sw.edge = 0; sw.lx = sw.x; if (o.took) o.took(); }   // (from where the finger went down: the row stays under it)
      }
      if (sw.on === 2) {
        if (e.cancelable) e.preventDefault();
        var cy = e.touches[0].clientY; set(window.scrollY - (cy - sw.ly)); sw.ly = cy; return;
      }
      if (e.cancelable) e.preventDefault();
      var st = o.stops(), lo = st[0] || 0, hi = st[st.length - 1] || 0;
      sw.rx = Math.max(lo, Math.min(hi, sw.rx - (cx - sw.lx))); sw.lx = cx;
      set(o.yOf(sw.rx));
      var t = now(); sw.pts.push([t, sw.rx, cx]); while (sw.pts.length > 2 && t - sw.pts[0][0] > 100) sw.pts.shift();
    }, { passive: false });
    o.stage.addEventListener('touchend', function (e) {
      var was = sw.on; sw.on = -1;
      if (was === 2) { R.eat = now(); R.down = false; R.settle(0); return; }   // (the page scrolled by hand above: settles on a stop as a scroll does)
      if (was !== 1) return;
      R.eat = now(); R.down = false;
      var p = sw.pts, v = 0;
      if (p.length > 1 && now() - p[p.length - 1][0] < 80) v = (p[p.length - 1][1] - p[0][1]) / Math.max(8, p[p.length - 1][0] - p[0][0]);
      // a swipe that started with the row at its end and went on that way: past the row
      var fx = e.changedTouches && e.changedTouches.length ? e.changedTouches[0].clientX - sw.x : 0, fv = 0, dir = fx < 0 ? 1 : -1;
      if (p.length > 1 && now() - p[p.length - 1][0] < 80) fv = -(p[p.length - 1][2] - p[0][2]) / Math.max(8, p[p.length - 1][0] - p[0][0]);
      if (atEnd(dir, sw.rx0) && atEnd(dir, sw.rx) && (Math.abs(fx) >= 40 || Math.abs(fv) > 0.3) && R.exit(dir, Math.abs(fv) > 0.05 && fv * dir > 0 ? fv : 0)) return;
      R.settle(v, sw.rx, sw.rx - sw.rx0);
    }, { passive: true });
    o.stage.addEventListener('touchcancel', function () { if (sw.on === 1) R.settle(0, sw.rx); sw.on = -1; }, { passive: true });
    // a swipe never counts as a tap on what it started on
    o.stage.addEventListener('click', function (e) { if (now() - R.eat < 450) { e.preventDefault(); e.stopPropagation(); } }, true);
    return R;
  }
  var snap = snapRow({
    stage: stage, still: still,
    x: function () { return x; },
    stops: function () { return stops; },
    yOf: rowY,
    on: function () { return stops.length > 0 && window.scrollY >= y0 - 1 && window.scrollY <= stopY(stops.length - 1) + 1; },
    set: function (y) { wTo(0, y); },
    skip: function (t, how) { return !!fsOn || (how === 'wheel' ? inGame(t) : inPlay(t)); },   // (full screen: the row never moves)
    wait: function () { return held(); },
    took: function () { gameTouch = 0; userAt = Date.now(); },
    // a game just pressed stays centered (Maurice: 'I pressed play and the screen went off center')
    prefer: function () { return Date.now() - gameTouch < 1500 ? stops[at[panels.indexOf(game)] || 0] : null; }
  });

  // the game fills its panel: scaled to fit the panel's width and height, keeping its shape
  var last = 0;
  function clear(el) { el.style.minHeight = ''; el.style.zoom = ''; el.style.removeProperty('--gsz'); el.style.width = cfg.snug ? 'fit-content' : ''; if (el.__sqW) el.style.setProperty('width', el.__sqW + 'px', 'important'); el.style.marginLeft = ''; el.style.marginRight = ''; last = 1; }
  // phones (Maurice, 2026-11-13: 'everything should FIT TO SCREEN ... shrinking as it needs to'): the game is scaled to fill
  // the panel's width or height, whichever runs out first; a daily card or a laid-out game (Hold the Wall!, Goma Goons) is
  // first given a width that suits the screen's shape, so it fills the screen instead of a strip of it
  function fitPhone(el) {
    var gs = getComputedStyle(game), innerW = game.clientWidth - parseFloat(gs.paddingLeft) - parseFloat(gs.paddingRight) - 4;
    var roomH = game.clientHeight - parseFloat(gs.paddingTop) - parseFloat(gs.paddingBottom) - 4;
    var flow = el.matches('.hg-card, #daily-word main') || !!cfg.phoneW || !!cfg.phoneFlow;
    el.style.zoom = ''; el.style.removeProperty('--gsz'); el.style.minHeight = ''; el.style.marginLeft = 'auto'; el.style.marginRight = 'auto';
    el.style.width = flow ? (cfg.phoneW || innerW) + 'px' : (cfg.snug ? 'fit-content' : '');
    // a visitor with no saved player gets the sign-in questions before START: they keep their full size, one column the
    // screen's width, instead of being scaled down with the board (QA 2026-11-14: 6-10px on phones)
    if (signIn()) { last = 1; capGate(); try { window.dispatchEvent(new Event('ma-zoom')); } catch (e) {} return; }
    if (cfg.tap) {
      game.classList.remove('gs-scrolly'); var cov = !!q('.dbd-cover', game); game.classList.toggle('gs-tapon', !cov);
      if (!cov) { var gs2 = getComputedStyle(game); tapFit(el, game.clientWidth - parseFloat(gs2.paddingLeft) - parseFloat(gs2.paddingRight), game.clientHeight - parseFloat(gs2.paddingTop) - parseFloat(gs2.paddingBottom)); return; }
    }
    function measure() {
      var r = el.getBoundingClientRect(), t0 = 1e9, b0 = -1e9;
      Array.prototype.forEach.call(game.children, function (c) { if (!c.offsetParent || bgLayer(c)) return; var b = c.getBoundingClientRect(); if (!b.height) return; t0 = Math.min(t0, b.top); b0 = Math.max(b0, b.bottom); });
      var extra = Math.max(0, (b0 - t0) - r.height);
      // anything poking out past its right edge counts too (Master Stacker's Pause ran 4px off the screen; QA 2026-11-14)
      var rw = Math.max(r.width, el.scrollWidth * (r.width / Math.max(1, el.offsetWidth)));
      // a game box that is always the panel's full width (Trench Run's) is measured by its board, so it is not shrunk again
      // and again for the 4px it is wider than the room (QA 2026-11-14: Trench Run's board at 85% of a 390 screen)
      var bd = cfg.phoneSnug && q(BOARD, el); if (bd && bd.offsetWidth) rw = Math.max(bd.getBoundingClientRect().width, bd.scrollWidth * (r.width / Math.max(1, el.offsetWidth)));
      return { w: rw, h: r.height, extra: extra, z: Math.min(innerW / rw, (roomH - extra) / r.height) };
    }
    var m = measure();
    // an arcade game (section 20): its board as large as the screen allows in its own shape. Laid out at the screen's width and
    // scaled down only if it must, instead of laid out wider and scaled down (that drew it wider and shorter than it is; Maurice's
    // players, 2026-11-15: 'stretched wider but seems like it's lost length'), whichever draws the board larger
    if (cfg.board && !flow && m.h >= 40) {
      var wA = el.style.width, areaOf = function (mm) { var b = el.matches(BOARD) ? el : q(BOARD, el); if (!b || !b.offsetWidth) return 0; var k = Math.min(3, mm.z); return b.offsetWidth * b.offsetHeight * k * k; };
      var aA = areaOf(m);
      el.style.width = innerW + 'px';
      if (cfg.phoneFill) fillBoard(el, roomH, measure);
      var mB = measure(), aB = areaOf(mB);
      if (aB >= aA * 0.98 || cfg.phoneFill) m = mB; else { el.style.width = wA; m = measure(); }
    }
    // a daily card: try a few widths and keep the one drawn widest at 85% or more, so its words stay readable, else the one drawn
    // at the largest scale (QA 2026-11-14)
    if (flow && !cfg.phoneW && !cfg.phoneFlow && m.z < 0.98) {
      var zOf = function (mm) { return Math.min(1, mm.z); }, cands = [{ w: innerW, m: m }], best = null;
      [1.15, 1.3, 1.5].forEach(function (k) { el.style.width = (innerW * k).toFixed(1) + 'px'; var mm = measure(); if (mm.h > 40) cands.push({ w: innerW * k, m: mm }); });
      var ok = cands.filter(function (c) { return zOf(c.m) >= 0.85; });
      if (ok.length) ok.forEach(function (c) { if (!best || c.m.w * zOf(c.m) > best.m.w * zOf(best.m) + 4) best = c; });
      else { var zMax = Math.max.apply(null, cands.map(function (c) { return zOf(c.m); })); cands.forEach(function (c) { if (zOf(c.m) >= zMax - 0.01 && (!best || c.m.w * zOf(c.m) > best.m.w * zOf(best.m) + 4)) best = c; }); }   // (at the same scale, the wider card: Skyword's keys get room)
      el.style.width = best.w.toFixed(1) + 'px'; m = measure();
    }
    // a laid-out game with room to narrow (Goma Goons): on a screen narrower than its layout, the width between its own and its
    // narrowest that draws it largest, so its words stay 11px or more on a 360 screen (QA 2026-11-14: 10.3px)
    if (cfg.phoneW && cfg.phoneMinW && m.z < 0.98) {
      var bw = cfg.phoneW, bm = m;
      for (var pw = cfg.phoneW - 10; pw >= cfg.phoneMinW; pw -= 10) { el.style.width = pw + 'px'; var pm = measure(); if (pm.z > bm.z + 0.005) { bw = pw; bm = pm; } }
      el.style.width = bw + 'px'; m = measure();
    }
    if (m.h < 40) return;   // (measured mid-change, with nothing showing: left as it is)
    var z = Math.max(0.2, Math.min(flow && !cfg.phoneW && !cfg.phoneFlow ? 1.15 : 3, m.z));   // a daily card never balloons
    el.style.zoom = z.toFixed(3); el.style.setProperty('--gsz', z.toFixed(3)); last = z;
    // words that keep 11px inside the scaled card grow as it shrinks: measured again until it fits
    for (var it = 0, z0 = z; it < 4; it++) { var m2 = measure(); if (m2.z >= 0.995) break; z = Math.max(0.2, z0 * 0.8, z * m2.z * 0.995); el.style.zoom = z.toFixed(3); el.style.setProperty('--gsz', z.toFixed(3)); last = z; }
    lockSize(el);
    try { window.dispatchEvent(new Event('ma-zoom')); } catch (e) {}
  }
  // a board whose height is free (Airship Runner's sky, Thread the Needle's river): as tall as the game's screen has room for at
  // the screen's width, between its smallest and tallest, so the whole game fits at full size (section 20); the game redraws for it
  var fillT = 0;
  function fillBoard(el, roomH, measure) {
    var f = el.matches(cfg.phoneFill.sel) ? el : q(cfg.phoneFill.sel, el); if (!f || !f.offsetHeight) return;
    var cur = f.offsetHeight, mm = measure(), slack = roomH - mm.extra - mm.h;
    var to = Math.round(Math.max(cfg.phoneFill.min, Math.min(cfg.phoneFill.max, cur + slack - 1)));
    if (Math.abs(to - cur) <= 1) return;
    f.style.setProperty('height', to + 'px', 'important'); f.style.setProperty('min-height', '0px', 'important');
    clearTimeout(fillT); fillT = setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 30);
  }
  // Sky Mines on phones (section 20; Maurice's players, 2026-11-15: 'everything is so small', 'my fingers are too fat'): the card as
  // wide as the screen and never scaled up or out, so the field is the screen's width less 16px at each side (cells 30px at 360,
  // 33px at 390, 35px at 412); scaled down a little only if the field and what's over it can't fit the screen's height, and the
  // clock and the message under the field may run on below it, where the game's screen scrolls (the one game screen that does)
  function tapFit(el, W, H) {
    el.style.width = W + 'px'; el.style.zoom = ''; el.style.removeProperty('--gsz'); el.style.minHeight = '';
    var bd = q('.sm-board', el); if (!bd || !bd.offsetWidth) { last = 1; return; }
    var span = function () { var t = 1e9, b = -1e9; Array.prototype.forEach.call(game.children, function (c) { if (!c.offsetParent || bgLayer(c)) return; var r = c.getBoundingClientRect(); if (!r.height) return; t = Math.min(t, r.top); b = Math.max(b, r.bottom); }); return { t: t, b: b }; };
    var s0 = span(), need = bd.getBoundingClientRect().bottom - s0.t + 12;
    var z = need > H ? Math.max(0.8, H / need) : 1;
    if (z < 1) { el.style.zoom = z.toFixed(3); el.style.setProperty('--gsz', z.toFixed(3)); }
    last = z;
    var s1 = span(); game.classList.toggle('gs-scrolly', s1.b - s1.t > H + 1);
    try { window.dispatchEvent(new Event('ma-zoom')); } catch (e) {}
  }
  // a daily card keeps the size it was fitted at, so it never grows as the puzzle empties out (Maurice, 2026-11-14:
  // 'a fixed width on this so it doesn't increase in size every time you get one right')
  function lockSize(el) { if (el.matches('.hg-card, #daily-word main')) el.style.minHeight = el.offsetHeight + 'px'; }
  // the sign-in questions on a daily puzzle's start card (shown only to a visitor with no saved player)
  function signIn() { var w = q('.dbd-cover .dbd-who', game); return w && w.offsetParent ? w : null; }
  // they never run onto the arrows: on a screen too short for them at full size, the start card scrolls inside itself
  // (frame CSS) instead of being scaled down
  // (QA 2026-11-14, pass 5: a scrollbar inside the card is gone: a card too tall for the screen, as it is once 'A first name,
  // please.' shows under the boxes, is scaled down a little instead, its smallest words kept at 11px or more (frame CSS raises
  // the labels by as much) and the boxes at 16px as drawn; only past that does it still scroll, as a last resort)
  function capGate() {
    var w = signIn(), gt = w && w.closest('.dbd-gate'); if (!gt) return;
    var cv = w.closest('.dbd-cover') || gt;
    function over() {
      var gr = game.getBoundingClientRect(), k = gr.height / Math.max(1, game.offsetHeight) || 1;
      var bottom = gr.bottom - (parseFloat(getComputedStyle(game).paddingBottom) || 0) * k, top = gr.top + (parseFloat(getComputedStyle(game).paddingTop) || 0) * k, low = -1e9, high = 1e9;
      Array.prototype.forEach.call(game.children, function (c) { if (!c.offsetParent || bgLayer(c)) return; var b = c.getBoundingClientRect(); if (b.height) { low = Math.max(low, b.bottom); high = Math.min(high, b.top); } });
      return Math.max(low - bottom, (low - high) - (bottom - top));
    }
    gt.style.removeProperty('--gs-gate-max'); cv.style.zoom = ''; cv.style.removeProperty('--gs-cz');
    // (measured again after each step: the panel centers what's in it, so a shorter card also moves down)
    var z = 1;
    for (var i = 0; i < 4; i++) {
      var o = over(); if (o <= 1) break;
      var h = cv.getBoundingClientRect().height; if (!h) break;
      var nz = Math.max(0.84, z * (h - o - 2) / h); if (nz >= z - 0.002) break;
      z = nz; cv.style.zoom = z.toFixed(3); cv.style.setProperty('--gs-cz', z.toFixed(3));
    }
    for (var j = 0; j < 4; j++) {   // the last resort
      var o2 = over(); if (o2 <= 1) break;
      var tr = gt.getBoundingClientRect(), kk = tr.height / Math.max(1, gt.offsetHeight) || 1;
      gt.style.setProperty('--gs-gate-max', Math.max(160, (tr.height - o2 * (j ? 2 : 1)) / kk).toFixed(0) + 'px');
    }
  }
  // phones: a score row that stays on one line (The Levian's Segments, Best, Pause, Restart; Maurice, 2026-11-14: 'the top row
  // should stay on one row and adjust'): as wide as the board, its pieces scaled together if they run long, never under 11px on screen
  function fitRow() {
    var r = !wide && cfg.phoneRow && q(cfg.phoneRow, game); if (!r || !r.offsetParent) return;
    Array.prototype.forEach.call(r.children, function (e) { e.style.zoom = ''; });
    var b = q(BOARD, game), k = zOf(r) || 1;
    r.style.width = b && b.offsetParent ? (b.getBoundingClientRect().width / k).toFixed(1) + 'px' : '';
    if (r.scrollWidth <= r.clientWidth + 1) return;
    var fs = 1e9; qa('span, b, button', r).forEach(function (e) { fs = Math.min(fs, parseFloat(getComputedStyle(e).fontSize) * zOf(e)); });
    var gap = parseFloat(getComputedStyle(r).columnGap) || 0, n = r.children.length, need = r.scrollWidth - gap * (n - 1), room = r.clientWidth - gap * (n - 1);
    // (too long for the board's width even at 11px: as wide as the game's own room instead)
    if (fs < 1e9 && room / Math.max(1, need) < 11.2 / fs) { r.style.width = '100%'; if (r.scrollWidth <= r.clientWidth + 1) return; need = r.scrollWidth - gap * (n - 1); room = r.clientWidth - gap * (n - 1); }
    var zz = Math.max(fs < 1e9 ? 11.2 / fs : 0.6, room / Math.max(1, need) * 0.995);
    Array.prototype.forEach.call(r.children, function (e) { e.style.zoom = zz.toFixed(3); });
  }
  // the Current Champion banner is exactly as wide as the play screen under it and touches it (Maurice, 2026-11-13)
  var BOARD = '.ar-stage,.ch-board,.sg-stage,.ms-stage,.ms-cv,.fl-stage,.lv-stage,.sd-stage,#ma-holdwall .stage,.hg-card,#daily-word main';
  function alignChamp() {
    fitRow();
    var c = q('.wk-champ, .dbd-champ', game); if (!c || !c.offsetParent || c.closest('.gs-beside')) return;
    var b = null; qa(BOARD, game).forEach(function (e) { if (!b && e.offsetParent && e.getBoundingClientRect().top >= c.getBoundingClientRect().top) b = e; }); if (!b) return;
    var st = function (k, v) { c.style.setProperty(k, v, 'important'); };
    ['width', 'margin-left', 'margin-bottom', 'margin-right', 'margin-top', 'white-space', 'font-size', 'padding-left', 'padding-right'].forEach(function (k) { c.style.removeProperty(k); });
    Array.prototype.forEach.call(c.children, function (e) { e.style.zoom = ''; e.style.removeProperty('white-space'); });
    st('align-self', 'flex-start'); st('box-sizing', 'border-box'); st('max-width', 'none'); st('margin-right', '0px');
    var k = 1;
    for (var i = 0; i < 2; i++) {
      var cr = c.getBoundingClientRect(), br = b.getBoundingClientRect(); k = cr.width / Math.max(1, c.offsetWidth) || 1;
      st('width', (br.width / k).toFixed(1) + 'px');
      cr = c.getBoundingClientRect();
      st('margin-left', ((parseFloat(getComputedStyle(c).marginLeft) || 0) + (br.left - cr.left) / k).toFixed(1) + 'px');
    }
    // phones: 12px on screen above it, however far the game is scaled (Sky Gauntlet's Pause sat 10px over it at 83%)
    if (!wide && parseFloat(getComputedStyle(c).marginTop) >= 12) st('margin-top', (12 / k).toFixed(1) + 'px');
    // one line, the win count beside the name (QA 2026-11-14: Master Stacker's banner wrapped and its '2' dropped to a line of
    // its own): less room at the sides, then smaller words, then (a browser with a smallest-text setting) the words scaled
    st('white-space', 'nowrap'); Array.prototype.forEach.call(c.children, function (e) { e.style.setProperty('white-space', 'nowrap', 'important'); });
    var over = function () { return c.scrollWidth > c.clientWidth + 1; };
    if (over()) { st('padding-left', '8px'); st('padding-right', '8px'); }
    // (the banner can sit inside a scaled game, as Master Stacker's does on phones: the floor is 11px as drawn on screen)
    var f = parseFloat(getComputedStyle(c).fontSize), n = 0, fMin = 11.3 / Math.max(0.2, k);
    // the win count's small raised number too (QA 2026-11-14: 9.4px in Master Stacker's banner on a 360 screen)
    qa('sup, .wk-wins', c).forEach(function (e) { e.style.removeProperty('font-size'); e.style.setProperty('font-size', 'max(.75em, ' + fMin.toFixed(2) + 'px)', 'important'); });
    if (f < fMin) { f = fMin; st('font-size', f.toFixed(2) + 'px'); }   // a banner in a scaled game is drawn at 11px or more (Trench Run's: 9.6px on a phone)
    while (over() && f > fMin && n++ < 40) { f -= 0.5; st('font-size', f + 'px'); }
    // still too long at that size (the smallest phones): two lines, split after 'Current Champion:', the win count staying
    // with the name, instead of words scaled past legible (QA 2026-11-14: Master Stacker's banner at 9.5px on a 360 screen)
    if (over()) {
      st('font-size', Math.max(f, fMin).toFixed(1) + 'px'); st('white-space', 'normal'); st('text-wrap', 'balance');
      Array.prototype.forEach.call(c.children, function (e) { e.style.removeProperty('white-space'); e.style.setProperty('white-space', 'nowrap', 'important'); });
    }
    if (over()) { var zz = (c.clientWidth - 16) / Math.max(1, c.scrollWidth - 16); Array.prototype.forEach.call(c.children, function (e) { e.style.zoom = zz.toFixed(3); }); }
    // then it touches the board: measured where everything rests (nothing in the row fades or slides in), so the board can never
    // be pulled up over it
    for (var j = 0; j < 2; j++) {
      var cr2 = c.getBoundingClientRect(), br2 = b.getBoundingClientRect();
      st('margin-bottom', ((parseFloat(getComputedStyle(c).marginBottom) || 0) - (br2.top - cr2.bottom) / k).toFixed(1) + 'px');
    }
    if (signIn()) capGate();
  }
  // words too wide for their button or box shrink until they fit (Maurice, 2026-11-13: 'shrink to fit', RESUME wrapping)
  // (QA 2026-11-14, pass 5: never under 11px as drawn: a word scaled on its own past that (Hold the Wall!'s Gunslinger at 8.8px,
  // Goma Goons' Galaxy at 10.8px) wraps between words instead, and a label that still can't fit is scaled only down to 11px)
  function zOf(e) { var z = 1; for (var x = e; x && x.nodeType === 1; x = x.parentElement) z *= parseFloat(getComputedStyle(x).zoom) || 1; return z; }
  function smallestText(e) {   // the smallest words in a label, as drawn on screen
    var m = 1e9; [e].concat(Array.prototype.slice.call(e.querySelectorAll('*'))).forEach(function (x) {
      if (!x.getClientRects().length || !Array.prototype.some.call(x.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })) return;
      m = Math.min(m, parseFloat(getComputedStyle(x).fontSize) * zOf(x));
    });
    return m < 1e9 ? m : 0;
  }
  // the browser's smallest-text setting (Maurice's Chrome: 16px), 0 when there is none (QA 2026-11-14, pass 6)
  var textFloor = -1;
  function floorPx() {
    if (textFloor < 0) { var t = document.createElement('span'); t.style.cssText = 'position:absolute;visibility:hidden;font-size:1px'; t.textContent = 'x'; document.body.appendChild(t); textFloor = parseFloat(getComputedStyle(t).fontSize) || 0; document.body.removeChild(t); if (textFloor < 2) textFloor = 0; }
    return textFloor;
  }
  // a row of names that belong together (Goma Goons' crew) is fitted as one: the longest name sets one scale for every name, so
  // they line up and each stays 4px or more inside its box (QA 2026-11-14, pass 6: Galaxy, Pebble, and Goldie each scaled on
  // their own sat higher than the rest and touched their edges; only in a browser that draws text at 16px or more)
  function fitGroups() {
    qa('.sd-gomas', document).forEach(function (g) {
      var bs = qa('.sd-goma', g).filter(function (b) { return b.offsetParent && b.clientWidth; }), z = 1, F = floorPx();
      bs.forEach(function (b) { b.style.zoom = ''; Array.prototype.forEach.call(b.querySelectorAll('span'), function (s) { s.style.zoom = ''; s.style.removeProperty('font-size'); }); });
      bs.forEach(function (b) {
        var s = b.querySelector('span'); if (!s) return;
        var rg = document.createRange(); rg.selectNodeContents(s); var k = zOf(s) || 1, tw = rg.getBoundingClientRect().width / k;
        if (tw) z = Math.min(z, (b.clientWidth - 8) / tw);
      });
      if (z >= 0.995) return;
      var s0 = bs[0] && bs[0].querySelector('span'), d = s0 ? parseFloat(getComputedStyle(s0).fontSize) * (zOf(s0) || 1) : 0;
      z = Math.max(d ? Math.min(1, 11.2 / d) : 0.5, z);
      bs.forEach(function (b) {
        var s = b.querySelector('span'); if (!s) return; s.style.zoom = z.toFixed(3);
        // (its own size set to 11px or more as scaled, below the browser's floor, so nothing on screen moves)
        var need = 11.2 / (zOf(s) || 1); if (F && need <= F && parseFloat(getComputedStyle(s).fontSize) <= F + 0.01) s.style.setProperty('font-size', need.toFixed(2) + 'px', 'important');
      });
    });
  }
  function fitLabels() {
    qa('[data-gs-ff]', game).forEach(function (x) { x.style.removeProperty('font-size'); x.removeAttribute('data-gs-ff'); });
    var F = floorPx();
    fitGroups();
    qa('button, .ms-hud > *, .ar-cell, .sg-stat, .tabs > *, .ch-hud, .sd-bar', game).forEach(function (e) {
      if (!e.offsetParent || !e.clientWidth || e.classList.contains('sd-goma')) return;
      if (e.classList.contains('gs-lifted')) { e.style.fontSize = ''; e.style.zoom = ''; return; }   // a lifted score row wraps instead of shrinking (frame CSS)
      e.style.fontSize = ''; e.style.zoom = ''; e.style.removeProperty('white-space'); e.classList.remove('gs-wrap');
      var over = function () { return e.scrollWidth > e.clientWidth + 1 || Array.prototype.some.call(e.children, function (c) { return c.clientWidth && c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).overflowX === 'visible'; }); };   // (a word running past its own line inside the label counts too)
      if (!over()) return;
      var f = parseFloat(getComputedStyle(e).fontSize), n = 0, k = zOf(e) || 1;
      // (never under the browser's own smallest size: there a smaller size draws nothing smaller, it only reads smaller)
      while (over() && f > 10 && f - 0.5 >= F && f * k > 11.6 && n++ < 30) { f -= 0.5; e.style.fontSize = f + 'px'; }
      if (!over()) return;
      // two lines, broken between words (a name like Crest Knight), when the label has a space to break at
      if (/\s/.test(e.textContent.trim())) { e.classList.add('gs-wrap'); if (!over()) return; }
      // a browser that won't draw text that small (a smallest-text setting) gets the label scaled to fit instead, never past 11px
      var s = smallestText(e), zMin = s ? Math.min(1, 11.2 / s) : 0.5;
      e.style.zoom = Math.max(zMin, e.clientWidth / e.scrollWidth).toFixed(3);
      // ...and there each word's own size is set to 11px or more as scaled (Hold the Wall!'s Gunslinger: set at 12px, scaled to 87%,
      // read as 10.1px though Chrome drew it at its 16px floor, 13.3px): below the floor, so nothing on screen moves
      if (F && parseFloat(e.style.zoom) < 1) [e].concat(Array.prototype.slice.call(e.querySelectorAll('*'))).forEach(function (x) {
        if (!x.getClientRects().length || !Array.prototype.some.call(x.childNodes, function (nd) { return nd.nodeType === 3 && nd.textContent.trim(); })) return;
        var need = 11.2 / (zOf(x) || 1), cur = parseFloat(getComputedStyle(x).fontSize), own = parseFloat(x.style.fontSize) || 0;
        if (need > F + 0.25 || cur > F + 0.01 || own >= need) return;
        var w0 = x.getBoundingClientRect().width; x.style.setProperty('font-size', need.toFixed(2) + 'px', 'important'); x.setAttribute('data-gs-ff', '');
        if (Math.abs(x.getBoundingClientRect().width - w0) > 0.5) { x.style.removeProperty('font-size'); x.removeAttribute('data-gs-ff'); if (x === e && f) e.style.fontSize = f + 'px'; }
      });
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
    if (!wide) {
      if (fresh === true) fitPhone(el);
      else {   // phones: a board that grew once the game started (Trench Run's maze after SET SAIL) is fitted again, 16px in from the edges
        var gr = game.getBoundingClientRect(), er = el.getBoundingClientRect(), rw = Math.max(er.width, el.scrollWidth * (er.width / Math.max(1, el.offsetWidth)));
        if (er.width && (er.left < gr.left + 14 || er.left + rw > gr.right - 14) && Date.now() - (fit.__pr || 0) > 1500) { fit.__pr = Date.now(); fitPhone(el); setTimeout(alignChamp, 60); }
      }
      return;
    }
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
      room = wide ? (vw - 80) / gz : Math.min(par.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), game.clientWidth - 32);
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
    if (signIn()) z = 1;   // the sign-in questions keep their full size (the start card is only as tall as they are)
    if (fresh !== true && (el.style.minHeight || (Math.abs(z - last) < 0.05 && !(wide && z < last - 0.01)))) z = last;   // (a game that grew past its frame mid-game always shrinks back inside it)   // a locked card keeps its size   // small changes after the first fit are left alone (Book Icons pulsed)
    if (Math.abs(z - last) >= 0.01) {
      if (z === 1) clear(el);
      else { el.style.setProperty('width', w.toFixed(1) + 'px', el.__sqW ? 'important' : ''); el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; el.style.zoom = z.toFixed(3); el.style.setProperty('--gsz', z.toFixed(3)); last = z; }
      try { window.dispatchEvent(new Event('ma-zoom')); } catch (e) {}   // a game that sizes its own words measures again
    }
    // the game grew past its frame after the page was laid out (a card that changed shape mid-game): lay the row out again,
    // at most once every two seconds (Maurice, 2026-11-14: 'it's getting wonky again on desktop')
    if (wide && !fsOn && fresh !== true && game.scrollWidth > game.clientWidth + 2 && Date.now() - (fit.__re || 0) > 2000) { fit.__re = Date.now(); setTimeout(size, 50); return; }
    if (fresh === true) lockSize(el);
    if (signIn()) setTimeout(capGate, 60);
    if (wide && fresh === true && !fsOn) {   // the game panel is as wide as the game (set once per layout, never from a refit)
      var card = q('.hg-card, #daily-word main', game);
      var gw = Math.round(Math.max(card === el ? 360 : 480, w * z, card && card !== el ? card.offsetWidth : 0) + parseFloat(gs.paddingLeft) + parseFloat(gs.paddingRight));
      gw = Math.min(gw, Math.floor(vw / gz));   // never wider than the screen, so it's always seen whole at a stop
      if (Math.abs(game.getBoundingClientRect().width / gz - gw) > 1) { game.style.width = gw + 'px'; if (fresh !== true) { layout(); paint(); } }
    }
  }
  var ft = 0;
  // (the labels are measured again with it: a game scaled further down after a tab switch left Hold the Wall!'s Shield sized for
  // the old scale, at 10.9px; QA 2026-11-14, pass 6)
  function soon() { clearTimeout(ft); ft = setTimeout(function () { fit(); fitLabels(); }, 120); }
  // the start card gives way to the board: scale the game and its panel again for what's showing now
  function refit() {
    if (fsOn) { fsFit(); return; }
    letGo();
    if (!wide) { fit(true); fitLabels(); alignChamp(); gameTop = topIn(); return; }   // the banner follows the board when the start card gives way
    game.style.zoom = ''; game.style.height = ''; game.style.removeProperty('--gz');
    game.style.width = vw + 'px';   // measured with the whole screen, as at the start, so it never creeps smaller
    fit(true); shrinkGame(); layout(); paint(); alignChamp(); gameTop = topIn();
  }
  var rf = 0;
  var hadCover = !!q('.dbd-cover', game);
  function refitSoon() { clearTimeout(rf); rf = setTimeout(function () { if (hadCover && !q('.dbd-cover', game)) { hadCover = false; refit(); } }, 300); }
  game.addEventListener('click', refitSoon);
  game.addEventListener('click', function () { if (signIn()) setTimeout(capGate, 30); });   // a sign-in line that appears under the boxes ('A first name, please.') is fitted at once
  // phones: a tab inside a panel of its own (Hold the Wall!'s Fighters and Tower) changes its height: that panel is fitted again
  var pt = 0; track.addEventListener('click', function (e) { if (wide || fsOn || !e.target.closest || !e.target.closest('.gs-fit')) return; clearTimeout(pt); pt = setTimeout(function () { widths(); layout(); paint(); }, 150); });
  game.addEventListener('keydown', function (e) { if (e.key === 'Enter') refitSoon(); });

  // ---------- 20. Full screen and the on-screen keyboard (Maurice, 2026-11-15) ----------
  // 'Is there a way to add a full screen button before you start each game?': a Full screen button beside the start button on the
  // game's start card, and a small one at the bottom left of the game's screen while it's on screen. The game's own screen fills the
  // whole screen (the browser's full screen where it has one; on an iPhone, which has none for a page, the game's screen is laid over
  // the page instead), the game is fitted again to the bigger room, and an X at the top right brings it back to its place in the row.
  // The choice is kept for the visit: after Full screen, the next start goes full screen too. Words: DRAFT ('Full screen', 'Exit full screen').
  var fsOn = '', FSK = 'ma-game-fs', html = document.documentElement;
  var START = /^(start|play|set sail|launch|cast off|start wave 1|start level 1|start free-for-all|start campaign)$/i;
  var FS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  function fsPref() { try { return sessionStorage.getItem(FSK) === '1'; } catch (e) { return false; } }
  function fsSave(v) { try { sessionStorage.setItem(FSK, v ? '1' : '0'); } catch (e) {} }
  function fsApi() { return !!((document.fullscreenEnabled || document.webkitFullscreenEnabled) && (game.requestFullscreen || game.webkitRequestFullscreen)); }
  function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  var fsX = document.createElement('button'); fsX.type = 'button'; fsX.className = 'gs-fsx'; fsX.setAttribute('aria-label', 'Exit full screen'); fsX.title = 'Exit full screen';
  fsX.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  fsX.addEventListener('click', function () { exitFs(); });
  game.appendChild(fsX);
  var fsGo = document.createElement('button'); fsGo.type = 'button'; fsGo.className = 'gs-fsgo'; fsGo.setAttribute('aria-label', 'Full screen'); fsGo.title = 'Full screen';
  fsGo.innerHTML = FS_SVG; fsGo.addEventListener('click', function () { enterFs(); }); stage.appendChild(fsGo);
  // the game's screen, set over everything (inline, so no page or game rule outweighs it)
  var FS_CSS = { position: 'fixed', top: '0', right: '0', bottom: '0', left: '0', width: '100%', height: '100%', 'max-width': 'none', 'max-height': 'none', 'min-height': '0',
    margin: '0', border: '0', transform: 'none', zoom: '1', 'z-index': '2147483000', overflow: 'hidden', 'box-sizing': 'border-box',
    'padding-top': 'calc(env(safe-area-inset-top, 0px) + 72px)', 'padding-right': 'max(16px, env(safe-area-inset-right, 0px))',
    'padding-bottom': 'max(16px, env(safe-area-inset-bottom, 0px))', 'padding-left': 'max(16px, env(safe-area-inset-left, 0px))' };
  function fsStyle(on) {
    var col = on ? getComputedStyle(game).color : '';   // (its own color: a screen laid over the page takes the browser's plain text color otherwise)
    Object.keys(FS_CSS).forEach(function (k) { if (on) game.style.setProperty(k, FS_CSS[k], 'important'); else game.style.removeProperty(k); });
    // (Sky Mines: the card runs the screen's width there too, the field 16px in from each side)
    if (on && cfg.tap && !wide) { game.style.setProperty('padding-left', '0px', 'important'); game.style.setProperty('padding-right', '0px', 'important'); }
    if (on) game.style.setProperty('color', col, 'important'); else game.style.removeProperty('color');
    if (on) {
      var sc = getComputedStyle(stage), bi = sc.backgroundImage, bc = sc.backgroundColor;
      if (!bc || /rgba\(.*,\s*0\)$|transparent/.test(bc)) bc = '#0b170f';   // (always solid: nothing of the page shows through)
      game.style.setProperty('background-color', bc, 'important');
      game.style.setProperty('background-image', bi && bi !== 'none' ? bi : 'none', 'important');
      game.style.setProperty('background-size', 'cover', 'important'); game.style.setProperty('background-position', 'center', 'important'); game.style.setProperty('background-repeat', 'no-repeat', 'important');
    } else ['background-color', 'background-image', 'background-size', 'background-position', 'background-repeat'].forEach(function (k) { game.style.removeProperty(k); });
  }
  var fsAt = -1;
  function enterFs() {
    if (fsOn) return;
    fsSave(true);
    var gi = panels.indexOf(game); fsAt = gi;
    game.style.zoom = ''; game.style.height = ''; game.style.removeProperty('--gz');
    fsStyle(true); html.classList.add('gs-fs'); game.classList.add('gs-fsel');
    var api = fsApi(), pr = null;
    if (api) { fsOn = 'api'; try { pr = (game.requestFullscreen || game.webkitRequestFullscreen).call(game, { navigationUI: 'hide' }); } catch (e) { api = false; } }
    if (!api) pseudo();
    if (pr && pr.catch) pr.catch(function () { if (fsOn === 'api') pseudo(); });
    fsLabels(); fsFit(); setTimeout(fsFit, 120); setTimeout(fsFit, 500);
  }
  // no full screen for a page here (iPhone): the game's screen is laid over the page, which holds still under it
  function pseudo() {
    fsOn = 'pseudo'; html.classList.add('gs-fs-p');
    try { if (game.showPopover) { game.setAttribute('popover', 'manual'); game.showPopover(); } } catch (e) {}
    fsFit();
  }
  function exitFs(keep) {
    if (!fsOn) return;
    var was = fsOn; fsOn = '';
    if (keep !== true) fsSave(false);
    if (was === 'api' && fsEl()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} }
    try { if (game.hidePopover && game.matches(':popover-open')) game.hidePopover(); } catch (e) {}
    game.removeAttribute('popover');
    fsStyle(false); html.classList.remove('gs-fs', 'gs-fs-p'); game.classList.remove('gs-fsel');
    fsLabels();
    var back = function () { size(); var gi = panels.indexOf(game); if (gi >= 0 && keep !== true) wTo(0, stopY(at[gi] || 0)); paint(); };
    back(); setTimeout(back, 400);   // (again once the browser's own way out of full screen has settled)
  }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) { document.addEventListener(ev, function () { if (fsOn === 'api' && !fsEl()) exitFs(); else if (fsOn) setTimeout(fsFit, 60); }); });
  addEventListener('keydown', function (e) { if (fsOn === 'pseudo' && e.key === 'Escape') exitFs(); });
  // the page under it never scrolls (a swipe that the game doesn't use would scroll it on a phone)
  game.addEventListener('touchmove', function (e) {
    if (fsOn !== 'pseudo' || !e.cancelable) return;
    for (var t = e.target; t && t !== game; t = t.parentElement) { var o = getComputedStyle(t).overflowY; if ((o === 'auto' || o === 'scroll') && t.scrollHeight > t.clientHeight + 1) return; }
    e.preventDefault();
  }, { passive: false });
  function fsFit() {
    if (!fsOn) return;
    letGo(); game.style.zoom = ''; game.style.height = ''; game.style.removeProperty('--gz');
    var el = cfg.zoom && q(cfg.zoom, game);
    if (signIn()) capGate();
    else if (el) { if (!wide) fitPhone(el); else fit(true); }
    steadyPause(); fitLabels(); alignChamp();
  }
  function fsLabels() {
    qa('.gs-fsbtn', document).forEach(function (b) { b.textContent = fsOn ? 'Exit full screen' : 'Full screen'; b.setAttribute('aria-pressed', fsOn ? 'true' : 'false'); });
    if (fsGo) fsGo.classList.toggle('on', false);
    if (!fsOn) paint();
  }
  // the button on the start card, beside or under the start button, in the game's own words' font and a plain outline
  function fsButtons() {
    qa('button', stage).forEach(function (b) {
      if (!b.offsetParent || b.classList.contains('gs-fsbtn') || !START.test(b.textContent.trim())) return;
      var nx = b.nextElementSibling; if (nx && nx.classList.contains('gs-fsbtn')) return;
      var c = getComputedStyle(b), f = document.createElement('button');
      f.type = 'button'; f.className = 'gs-fsbtn'; f.textContent = fsOn ? 'Exit full screen' : 'Full screen';
      f.style.fontFamily = c.fontFamily; f.style.fontWeight = c.fontWeight; f.style.letterSpacing = c.letterSpacing; f.style.textTransform = c.textTransform;
      f.style.fontSize = Math.max(12, parseFloat(c.fontSize) * 0.85).toFixed(1) + 'px';
      var tp = Array.prototype.filter.call(b.parentNode.children, function (x) { return x.tagName === 'P' && x.offsetParent && x.textContent.trim(); })[0];   // (the card's own words' color: a dark card's buttons may set none of their own)
      f.style.setProperty('color', getComputedStyle(tp || b.parentNode).color, 'important');
      f.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (fsOn) exitFs(); else enterFs(); });
      b.parentNode.insertBefore(f, b.nextSibling);
    });
  }
  // a start pressed after Full screen was chosen this visit goes full screen with it (the press is what lets the browser do it)
  stage.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button'); if (!b || fsOn || !fsPref() || b.classList.contains('gs-fsbtn')) return;
    if (START.test(b.textContent.trim()) && (game.contains(b) || b.closest('.gs-pre'))) enterFs();
  }, true);
  setTimeout(fsButtons, 300);
  if (window.MutationObserver) { var fbT = 0; new MutationObserver(function () { if (fbT) return; fbT = setTimeout(function () { fbT = 0; fsButtons(); }, 250); }).observe(stage, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'style'] }); }

  // phones: the on-screen keyboard (Book Icons' answer box; Maurice's players, 2026-11-15: 'wonky on mobile'): while a box in the
  // game is being typed in, the row holds still (no new layout for the shorter screen, no sideways scroll from the browser bringing
  // the box into view), and the game slides up just enough that the box and its button sit 12px over the keyboard
  var kbEl = null, kbW = 0, kbY = 0, kbStale = false;
  function kbLift() {
    var vv = window.visualViewport, lift = 0;
    if (kbEl && vv) {
      // (where it sits with no slide: measured less the slide it has right now, which may be partway through its glide)
      var top0 = kbEl; while (top0 && top0.parentElement !== game) top0 = top0.parentElement;
      var cur = 0; try { cur = -new DOMMatrixReadOnly(getComputedStyle(top0).transform).m42 || 0; } catch (e) {}
      var box = kbEl.closest('form') || kbEl, r = box.getBoundingClientRect();
      var bottom = r.bottom + cur, top = r.top + cur, vis = vv.offsetTop + vv.height - 12, ceil = Math.max(vv.offsetTop, header()) + 12;   // (never up under the menu bar)
      lift = Math.max(0, Math.min(bottom - vis, top - ceil));
    }
    game.style.setProperty('--gs-kb', lift.toFixed(0) + 'px'); game.classList.toggle('gs-kb', lift > 0);
  }
  game.addEventListener('focusin', function (e) {
    if (wide || !/^(INPUT|TEXTAREA)$/.test(e.target.tagName) || /^(button|submit|checkbox|radio|range)$/.test(e.target.type || '')) return;
    if (!kbEl) { kbW = window.innerWidth; kbY = window.scrollY; }
    kbEl = e.target; kbLift(); setTimeout(kbLift, 350);
  });
  game.addEventListener('focusout', function () {
    setTimeout(function () {
      var a = document.activeElement; if (a && a !== document.body && game.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName)) { kbEl = a; return; }
      kbEl = null; kbLift(); if (kbStale) { kbStale = false; size(true); }
    }, 150);
  });
  if (window.visualViewport) ['resize', 'scroll'].forEach(function (ev) { visualViewport.addEventListener(ev, function () { if (kbEl || game.classList.contains('gs-kb')) kbLift(); }); });
  addEventListener('scroll', function () { if (kbEl && !fsOn && Math.abs(window.scrollY - kbY) > 1 && Date.now() - userAt > 400) wTo(0, kbY); }, { passive: true });

  adopt();
  // a game that sizes its board from its box when the page loads (Trench Run) is told once the row has laid the box out, so the
  // board waiting for Set sail is already its playing size and nothing jumps when the run starts (QA 2026-11-14: 278 to 326px)
  var psT = 0, psN = 0, psW = -1;
  function presize() {
    if (!cfg.presize) return;
    clearTimeout(psT); psT = setTimeout(function () {
      var ov = q('.ch-ov', game), w = (q(cfg.zoom, game) || game).clientWidth;
      if (!ov || getComputedStyle(ov).display === 'none' || w === psW || psN > 5) return;   // (only while the start card shows)
      psW = w; psN = (psN || 0) + 1; window.dispatchEvent(new Event('resize'));
    }, 200);
  }
  presize(); addEventListener('load', presize);
  // phones: a score row lifted out of the scaled game, so its words keep their size (Maurice, 2026-11-13)
  if (cfg.phoneLift && window.innerWidth < 700) cfg.phoneLift.forEach(function (sel) { var e = q(sel, game); if (e) { game.insertBefore(e, game.firstChild); e.classList.add('gs-lifted'); } });
  // phones: an arrow pad lifted out of the scaled game to just under it, so its buttons keep their size (Trench Run's were 24px)
  if (cfg.phoneDrop && window.innerWidth < 700) {
    var zTop = cfg.zoom && q(cfg.zoom, game); while (zTop && zTop.parentElement !== game) zTop = zTop.parentElement;
    if (zTop) cfg.phoneDrop.slice().reverse().forEach(function (sel) { var e = q(sel, game); if (e) { game.insertBefore(e, zTop.nextSibling); e.classList.add('gs-dropped'); } });
  }
  // short phones (Master Stacker, Goma Goons): a bar over the scaled game and the rows under it, all at full size (QA 2026-11-14, pass 8)
  if (short) {
    var zTop2 = cfg.zoom && q(cfg.zoom, game); while (zTop2 && zTop2.parentElement !== game) zTop2 = zTop2.parentElement;
    if (zTop2) {
      game.classList.add('gs-short');
      if (short.bar) {
        var tb = document.createElement('div'); tb.className = 'gs-topbar';
        short.bar.forEach(function (sel) {
          if (typeof sel === 'string') { var e = q(sel, game); if (e) tb.appendChild(e); return; }
          var bc2 = document.createElement('div'); bc2.className = 'gs-barcol'; sel.forEach(function (s2) { var e2 = tb.querySelector(s2) || q(s2, game); if (e2) bc2.appendChild(e2); }); tb.appendChild(bc2);   // (buttons in a column of their own at the bar's right)
        });
        game.insertBefore(tb, zTop2);
      }
      (short.drop || []).slice().reverse().forEach(function (sel) { var e = q(sel, game); if (e) { game.insertBefore(e, zTop2.nextSibling); e.classList.add('gs-dropped'); } });
      // the room left for the scaled game once the bar and the rows under it have theirs, for a game that sizes its own board
      // to the screen (Goma Goons' battlefield is drawn taller or shorter to fit): measured, never guessed
      if (short.flow) window.maGameRoom = function () {
        if (!game.offsetParent && !game.getClientRects().length) return 0;
        var gs = getComputedStyle(game), k = game.getBoundingClientRect().height / Math.max(1, game.offsetHeight) || 1, used = 0;
        Array.prototype.forEach.call(game.children, function (c) {
          if (c === zTop2 || !c.getClientRects().length || bgLayer(c)) return;
          var cs = getComputedStyle(c), cz = parseFloat(cs.zoom) || 1;
          used += c.getBoundingClientRect().height / k + ((parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0)) * cz;
        });
        return Math.max(0, game.clientHeight - parseFloat(gs.paddingTop) - parseFloat(gs.paddingBottom) - used - 6);
      };
    }
  }
  // phones, daily puzzles: the date line goes over the champion banner at full size, out of the scaled card (QA 2026-11-14:
  // 12px words drawn at 7 to 10.5px inside the card, and its two lines took room from the board)
  if (window.innerWidth < 700) { var stp = q('#hg-stamp, #thw-stamp', game), crd = q('.hg-card, #daily-word main', game); if (stp && crd && crd.parentElement === game) { var chp = q('.dbd-champ, .wk-champ', game); game.insertBefore(stp, chp && chp.parentElement === game ? chp : crd); stp.classList.add('gs-stamp'); } if (toAbout()) setTimeout(size, 0); }
  // parts that arrive later (the weekly board is added after its data loads) move to their panels too
  if (window.MutationObserver) {
    var mt = 0;
    new MutationObserver(function () { clearTimeout(mt); mt = setTimeout(function () {
      var due = resultsIn(game).length || qa(ABOUT, game).length || (cfg.phoneAbout && window.innerWidth < 700 && cfg.phoneAbout.some(function (s) { return qa(s, game).length; })) || (cfg.how || []).some(function (s) { return qa(s, game).length; }) || (cfg.parts || []).some(function (s) { return qa(s.sel || s, game).length; }) || q('.ma-arcade', game) || q('.hg-tabs', game);
      if (due) adopt(); else if (hadCover) refitSoon();   // (never refits mid-game: a new piece must not move the board)
    }, 60); }).observe(game, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    // a box that was stepped aside comes back as soon as something in it shows again (checked at most every 200ms, so a game
    // that changes its looks every frame never holds this up)
    var ueT = 0; new MutationObserver(function () { if (ueT || !game.querySelector('.gs-empty')) return; ueT = setTimeout(function () { ueT = 0; if (unEmpty()) size(true); }, 200); })
      .observe(game, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
    // a button whose words change mid-game (Goma Goons' Next crew, which reads Upgrades in Free-for-All) is fitted again, checked at
    // most every 300ms and only when some button's words are new (pass 9: UPGRADES ran past its box at 1440 in a browser that draws
    // text at 16px)
    var blT = 0, blSig = '';
    var btnSig = function () { return qa('button', game).map(function (b) { return b.textContent; }).join('|'); };
    new MutationObserver(function () { if (blT) return; blT = setTimeout(function () { blT = 0; var sg = btnSig(); if (sg !== blSig) { blSig = sg; fitLabels(); } }, 300); })
      .observe(game, { childList: true, subtree: true, characterData: true });
  }
  if (window.ResizeObserver) { var el0 = cfg.zoom && q(cfg.zoom, game); if (el0) new ResizeObserver(later(soon)).observe(el0); }
  // the board changes size when its start screen gives way (Trench Run on phones grew from 233 to 365 wide): the champion
  // banner follows it, so it is always exactly as wide as the board and touching it (QA 2026-11-14)
  if (window.ResizeObserver) { var bt = 0, bro = new ResizeObserver(later(function () { clearTimeout(bt); bt = setTimeout(alignChamp, 60); })); qa(BOARD, game).forEach(function (e) { bro.observe(e); }); }
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
  // a panel that changes size (Sort the Shelf's game widens once it starts) lays the row out again, as a resize would, but the
  // game keeps its size and place; the page's scroll length follows, so the arrows never run past the row (QA 2026-11-14)
  if (window.ResizeObserver) {
    var pzT = 0, pro = new ResizeObserver(later(function () {
      clearTimeout(pzT); pzT = setTimeout(function () {
        var ch = panels.some(function (p, i) { return Math.abs(p.getBoundingClientRect().width - (widthsOf[i] || 0)) > 2; });
        if (ch) size(true);
      }, 150);
    }));
    var watchPanels = function () { panels.forEach(function (p) { if (!p.__pro) { p.__pro = 1; pro.observe(p); } }); };
    watchPanels(); setInterval(watchPanels, 2000);
  }
  // the menu bar settles after the page (the logo loads, its padding is set): the row sits under it again when it does
  if (window.ResizeObserver) { var hh = -1, ht = 0, ro = new ResizeObserver(later(function () { var h2 = header(); if (h2 !== hh) { hh = h2; clearTimeout(ht); ht = setTimeout(size, 200); } }));
    ['header', 'hunt-nav'].forEach(function (id) { var e = document.getElementById(id); if (e) ro.observe(e); }); }
  // late fonts and late rows can push a box past the bottom edge after the first measure: check again, and measure again if so
  function checkOff() {
    if (!wide) { if (colsOff()) size(); return; }
    var off = colsOff() || panels.some(function (p) {
      if (p === game || p.classList.contains('gs-arcade')) return false;
      var col = p.firstChild; if (!col || col.classList.contains('gs-cols')) return false;
      var lb = col.lastElementChild; return lb && lb.getBoundingClientRect().bottom > col.getBoundingClientRect().bottom + 2;
    });
    if (off) size();
  }
  // something that arrives after the row was laid out (a game's 100 XP and Discord box under the board, an export card whose
  // picture loads late) must never push a panel's words past its top or bottom edge, onto the arrows (QA 2026-11-14: Sky
  // Gauntlet's game over, Airship Runner's card): checked once a second on screen, and a panel that runs over is fitted again
  // (the game panel on its own, any other by laying the row out again); the same overflow is never chased twice, and at
  // most three refits run in ten seconds
  var overTried = {}, overLog = [];
  function overCheck() {
    if (fsOn || !stops.length || !panels.length || document.hidden) return;
    if (signIn()) capGate();   // the champion banner or the date can arrive after the start card was measured
    if (colsOff()) { var cs0 = 'cols:' + Math.round(W); if (!overTried[cs0]) { overTried[cs0] = 1; size(); return; } }
    var hit = null, sig = '';
    panels.forEach(function (p, i) {
      if (hit || p.classList.contains('gs-arcade') || p.classList.contains('gs-scrolly')) return;
      var pr = p.getBoundingClientRect(); if (pr.right < 0 || pr.left > window.innerWidth || !pr.height) return;   // only what's on screen
      var cs = getComputedStyle(p), z = pr.height / Math.max(1, p.offsetHeight) || 1;
      var top = pr.top + parseFloat(cs.paddingTop) * z - 4, bot = pr.bottom - parseFloat(cs.paddingBottom) * z + 4;
      var box = p === game ? game : p.firstChild; if (!box || !box.children || (box.classList && box.classList.contains('gs-cols'))) return;
      var t0 = 1e9, b0 = -1e9;
      Array.prototype.forEach.call(box.children, function (c) { if (bgLayer(c) || !c.getClientRects().length) return; var b = c.getBoundingClientRect(); if (!b.height) return; t0 = Math.min(t0, b.top); b0 = Math.max(b0, b.bottom); });
      if (t0 < top || b0 > bot) { hit = p; sig = i + ':' + Math.round(t0 - top) + ':' + Math.round(b0 - bot) + ':' + Math.round(pr.width); }
    });
    if (!hit || overTried[sig]) return;
    var now = Date.now(); overLog = overLog.filter(function (t) { return now - t < 10000; }); if (overLog.length >= 3) return;
    overTried[sig] = 1; overLog.push(now);
    if (hit === game) refit(); else size();
  }
  setInterval(overCheck, 1000);
  // a picture that loads after the row was laid out (the export card's) changes its panel's height: lay the row out again
  var imgT = 0;
  track.addEventListener('load', function (e) { var t = e.target; if (!t || t.tagName !== 'IMG' || game.contains(t)) return; clearTimeout(imgT); imgT = setTimeout(function () { size(true); }, 120); }, true);   // (the game keeps its size: the picture is outside it)
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
