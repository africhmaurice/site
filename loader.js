/* Maurice Africh site loader.
   Each Squarespace Code Block holds only:
     <div data-ma-page="the-hunt"></div>
     <script src="https://africhmaurice.github.io/site/loader.js"></script>
   This script fetches pages/<slug>.html from GitHub Pages, drops it in, and runs its scripts in order.
   Published edits show up as soon as GitHub Pages has them (each fetch checks for a newer copy).
   Loaded once site-wide from Code Injection (in <head>), it also shows the crest loading screen.
   Every copy after the first only mounts blocks it finds, so a page can include it any number of times. */
// The Hunt Is Over (Maurice, 2026-11-10). From midnight ET on Nov 11 the whole site shows the closed screen, except the
// link page, the Arcade (with every game in it), and the current Adventure vote. On those pages the menus are gone and a slim bar
// links only the two of them. Set MAINT to false and publish to reopen the site.
// ?ma-open=1 lets this browser see the site anyway; ?ma-open=0 undoes that. ?ma-maint=1 shows the closed state early.
var MAINT_AT = Date.parse('2026-11-11T05:00:00Z');
var MAINT = Date.now() >= MAINT_AT || /[?&]ma-maint=1/.test(location.search);
(function () {
  // Locked down 2026-11-14 (Maurice: "Lock everything"): every page shows the closed screen while the new site goes up behind it.
  var VOTE ='https://www.mauriceafrich.com/the-first-guardian', ARCADE = 'https://www.mauriceafrich.com/arcade';
  var FONT = '@font-face{font-family:"Cracked Imperia";src:url(https://africhmaurice.github.io/site/assets/fonts/CrackedImperia-Bold.woff2) format("woff2");font-weight:100 900;font-display:swap;size-adjust:109.5%}';
  var kept = false && /^\/(the-first-guardian|through-the-mountains|adventure|order|preorder|the-crew-decides|arcade|games|sort-the-shelf|book-icons|blades-and-brass|matching-auras|crest-quest|sky-mines|airship-runner|thread-the-needle|trench-run|sky-gauntlet|the-levian-30527|master-stacker-32368|hold-the-wall-13212|goma-goons-43216)\/?$/i.test(location.pathname);
  if (!MAINT) {
    // a closed page left open reloads itself at midnight; games and the vote are never interrupted
    var left = MAINT_AT - Date.now();
    if (!kept && !window.__maMidnight && left > 0 && left < 864e5) { window.__maMidnight = true; setTimeout(function () { location.reload(); }, left + 1500); }
    return;
  }
  if (window.__maClosed || window.__maBare) return;
  var open = false, q = /[?&]ma-open=([01])/.exec(location.search);
  try { if (q) { if (q[1] === '1') localStorage.setItem('ma-open', '1'); else localStorage.removeItem('ma-open'); } open = localStorage.getItem('ma-open') === '1'; } catch (e) {}
  if (open) return;
  function fonts() { var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap'; (document.head || document.documentElement).appendChild(l); }
  function style(css) { var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st); }
  if (kept) {
    // the Arcade, its games, and the vote stay open, without any menu
    window.__maBare = true;
    var here = /^\/the-first-guardian\/?$/i.test(location.pathname) ? 'vote' : /^\/arcade\/?$/i.test(location.pathname) ? 'arcade' : /^\/adventure\/?$/i.test(location.pathname) ? 'adventure' : /^\/(pre)?order\/?$/i.test(location.pathname) ? 'order' : /^\/links\/?$/i.test(location.pathname) ? 'links' : '';
    fonts();
    style('header#header,.header-menu,#hunt-nav,#hunt-nav-ov,#ma-chapters{display:none!important}' +
      '#ma-bare{position:fixed;top:0;left:0;right:0;z-index:2147483000;box-sizing:border-box;min-height:56px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;padding:8px 16px;background:#0b170f;border-bottom:2px solid #1a5e41}' +
      '#ma-bare a{box-sizing:border-box;display:inline-block;padding:10px 18px;border:1.5px solid #f3ead9;border-radius:0;background:transparent;color:#fffffe;font-family:Almarai,sans-serif;font-weight:800;font-size:14px;line-height:1.2;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;text-align:center}' +
      '#ma-bare a:hover,#ma-bare a:focus-visible{background:#f3ead9;color:#0b170f;outline:none}' +
      '#ma-bare a[aria-current]{background:#1a5e41;border-color:#1a5e41;color:#fffffe}' +
      '@media (max-width:1100px){#ma-bare{gap:8px 10px;padding:8px 12px}#ma-bare a{padding:9px 14px}}' +
      // phones: the three story buttons on the first row, Order and Links on the second
      '@media (max-width:600px){#ma-bare{gap:8px;padding:8px 10px}#ma-bare a{flex:1 1 calc(33% - 8px);min-width:0;align-self:stretch;display:flex;align-items:center;justify-content:center;font-size:12px;padding:8px 6px;letter-spacing:.04em}#ma-bare a:nth-child(n+4){flex-basis:calc(50% - 8px)}}' +
      '#ma-bare-pad{display:block;width:100%;pointer-events:none}');
    var bar = function () {
      if (document.getElementById('ma-bare') || !document.body) return;
      var n = document.createElement('nav'); n.id = 'ma-bare'; n.setAttribute('aria-label', 'Open pages');
      [[ARCADE, 'The Arcade', 'arcade'], ['https://www.mauriceafrich.com/adventure', 'The Adventure So Far', 'adventure'], [VOTE, 'Vote in the Adventure', 'vote'], ['https://www.mauriceafrich.com/order', 'Order Cello’s Gate', 'order'], ['https://www.mauriceafrich.com/links', 'Links', 'links']].forEach(function (x) {
        var l = document.createElement('a'); l.href = x[0]; l.textContent = x[1]; if (x[2] === here) l.setAttribute('aria-current', 'page'); n.appendChild(l);
      });
      document.body.appendChild(n);
      // when the bar wraps taller than one row (57px), push the page down by the difference so nothing sits under it
      var pad = document.createElement('div'); pad.id = 'ma-bare-pad'; pad.setAttribute('aria-hidden', 'true'); document.body.insertBefore(pad, document.body.firstChild);
      var fit = function () { pad.style.height = Math.max(0, n.offsetHeight - 57) + 'px'; };
      fit(); window.addEventListener('resize', fit); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    };
    if (document.body) bar(); else document.addEventListener('DOMContentLoaded', bar);
    return;
  }
  window.__maClosed = true;
  var HEAD = 'The Hunt Is Over';
  var css = FONT +
    'html,body{overflow:hidden!important;background:#0b170f!important}' +
    'body>*{visibility:hidden!important}' +
    '#ma-closed{position:fixed;inset:0;z-index:2147483647;overflow-y:auto;box-sizing:border-box;background:#0b170f;text-align:center}' +
    '#ma-closed .in{box-sizing:border-box;min-height:100%;max-width:820px;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:48px 24px}' +
    '#ma-closed h1{margin:0;font-family:"Cracked Imperia",Impact,sans-serif;font-weight:400;font-size:clamp(40px,7vw,84px);line-height:1.2;letter-spacing:.03em;text-transform:uppercase;color:#f2cf5b;text-wrap:balance;text-shadow:0 0 28px rgba(242,207,91,.4)}' +
    '#ma-closed p{margin:0;font-family:Almarai,sans-serif;font-weight:400;font-size:clamp(17px,2vw,21px);line-height:1.6;letter-spacing:.01em;color:#fffffe;text-wrap:pretty}' +
    '#ma-closed .go{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:8px;max-width:760px}' +
    '#ma-closed .go a{box-sizing:border-box;display:inline-block;padding:16px 28px;border:1.5px solid #f3ead9;border-radius:0;background:#c1330a;color:#fffffe;font-family:Almarai,sans-serif;font-weight:800;font-size:16px;line-height:1.2;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;box-shadow:4px 5px 0 rgba(0,0,0,.35)}' +
    '#ma-closed .go a:hover,#ma-closed .go a:focus-visible{background:#f3ead9;color:#0b170f;outline:none}' +
    '@media (max-width:480px){#ma-closed .go{flex-direction:column;align-self:stretch}#ma-closed .go a{width:100%}}';
  function paint() {
    if (document.getElementById('ma-closed')) return;
    fonts(); style(css);
    var o = document.createElement('div'); o.id = 'ma-closed'; o.style.visibility = 'visible';
    // fully locked (2026-11-14): only the heading and his first paragraph; the vote, Arcade, Order, and Links buttons pointed at closed pages
    o.innerHTML = '<div class="in"><h1></h1><p></p></div>';
    var p = o.querySelectorAll('p'), a = [];
    o.querySelector('h1').textContent = HEAD;
    p[0].textContent = 'Thank you all so much for making the insane amount of work this required so worth it. Go sleep now. You deserve it.';
    if (p[1]) p[1].textContent = 'But also, don\u2019t forget to vote in the Adventure! Where are the crew of the Second Wind going next? And the Arcade is still open for your enjoyment!';
    if (a[0]) { a[0].href = VOTE; a[0].textContent = 'Vote in the Adventure'; }
    if (a[1]) { a[1].href = 'https://www.mauriceafrich.com/adventure'; a[1].textContent = 'The Adventure So Far'; }
    if (a[2]) { a[2].href = ARCADE; a[2].textContent = 'Visit the Arcade'; }
    if (a[3]) { a[3].href = 'https://www.mauriceafrich.com/order'; a[3].textContent = 'Order Cello’s Gate'; }
    if (a[4]) { a[4].href = 'https://www.mauriceafrich.com/links'; a[4].textContent = 'Links'; }
    document.documentElement.appendChild(o);
    document.title = HEAD;
  }
  paint();
})();
if (MAINT && window.__maClosed) { window.maAfterLoading = function () {}; }
(function () {
  if (window.__maClosed) return;
  if (window.__maLoader) { window.__maLoader(); return; }
  var me = document.currentScript;
  var inHead = !!(me && me.parentNode && me.parentNode.nodeName === 'HEAD');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The new motion style (Maurice, 2026-11-12): motion.js on these pages, in place of the fade-in below.
  // The home page first; more pages join this list as they are checked. The shop never loads loader.js.
  // Maurice, 2026-11-12: then every page under Fun Stuff and Games, the order page, and the adventure chapters. The game
  // pages get the dark look but no motion, so nothing moves while people play.
  var NEW_PAGES = ['the-hunt', 'newsletter', 'oracles-gift/aura-spectrum', 'sky-pirate-quiz-61748', 'crew-dossier', 'bookshelf', 'contests', 'arcade',
    'order', 'preorder', 'adventure', 'red-city', 'the-crew', 'the-crash', 'the-river', 'the-raft', 'river-mayhem', 'washed-ashore', 'cerunine-attack',
    'the-reunion', 'the-energy-wave', 'finding-scarlett', 'light-on-her-feet', 'pull-her-out', 'the-source', 'the-break-in', 'search-the-building',
    'the-captains-request', 'saving-scarlett', 'back-to-the-hunt', 'the-crew-decides'];
  var GAME_PAGES = ['games', 'sort-the-shelf', 'book-icons', 'blades-and-brass', 'matching-auras', 'crest-quest', 'sky-mines', 'airship-runner',
    'thread-the-needle', 'trench-run', 'sky-gauntlet', 'the-levian-30527', 'master-stacker-32368', 'hold-the-wall-13212', 'goma-goons-43216'];
  var HERE = location.pathname.split('/').filter(Boolean).join('/'), ON_GAME = GAME_PAGES.indexOf(HERE) >= 0;
  var NEWLOOK = HERE === '' || NEW_PAGES.indexOf(HERE) >= 0 || ON_GAME, MOTION = !still && NEWLOOK && !ON_GAME;   // home and The Hunt first (11/12)
  var pending = 0;
  // Runs fn once the loading screen has started fading (right away if there isn't one), so animations
  // near the top of a page play where people can see them instead of underneath the crest.
  window.maAfterLoading = function (fn) {
    (function wait() { var ov = document.getElementById('ma-loading'); if (ov && !ov.classList.contains('ma-done')) setTimeout(wait, 80); else fn(); })();
  };
  var BASE = me ? me.src.replace(/loader[\w-]*\.js.*$/, '') : 'https://africhmaurice.github.io/site/';
  // Pages are fetched with cache: 'no-cache': the browser keeps its copy and only asks GitHub Pages whether it
  // changed (a tiny 304 answer when it has not), so a visit re-downloads a page only after a publish.
  var FRESH = { cache: 'no-cache' };
  // Cookie choices and the Meta Pixel (Maurice, 2026-10-07): cookies.js asks visitors in Europe first, loads the
  // Pixel for everyone else, and adds Cookie Preferences to the footer. Squarespace's banner and Pixel are off.
  (function () { var s = document.createElement('script'); s.src = BASE + 'cookies.js'; (document.head || document.documentElement).appendChild(s); })();
  // Search titles, descriptions, share text, and the book's details for Google (seo.js, Maurice 2026-11-12)
  (function () { var s = document.createElement('script'); s.src = BASE + 'seo.js'; (document.head || document.documentElement).appendChild(s); })();
  // The Newsletter page is a plain Squarespace page (no page file), so its new look lives in newsletter-look.js (Maurice 2026-11-12)
  if (HERE === 'newsletter') (function () { var s = document.createElement('script'); s.src = BASE + 'newsletter-look.js'; (document.head || document.documentElement).appendChild(s); })();
  // Pistol pointer (Maurice, 2026-11-12): the mouse pointer is his gloved-hand pistol everywhere on the site, links
  // and buttons too; it clicks from the muzzle. Typing fields keep their text cursor, and game pages keep their own.
  // His white pointer art with its black outline (Maurice, 2026-11-12: "Brass Point Mouse Click 2", kept as
  // gun-source-white.png); the old color one is gun-color-*.png.
  // On the daily puzzles the board itself keeps its own pointers; the rest of the page, the Arcade tiles too, gets the
  // pistol (Maurice, 2026-11-13: 'make the shooting white gun used on the rest of the site on the arcade too').
  (function () {
    var NOT = /^\/(games|game-)/.test(location.pathname) ? ':not(.gs-game):not(.gs-game *)' : '';
    var g = BASE + 'assets/cursor/gun-', c = '-webkit-image-set(url(' + g + '48.png) 1x,url(' + g + '96.png) 2x) 5 7,url(' + g + '48.png) 5 7,auto';
    var s = document.createElement('style'); s.id = 'ma-cursor';
    s.textContent = '@media (pointer:fine){html,body,*:not(input):not(textarea):not(select):not([contenteditable]):not(iframe)' + NOT + '{cursor:' + c + '!important}' +
      'input[type=button],input[type=submit],input[type=checkbox],input[type=radio],select{cursor:' + c + '!important}' + (NOT ? '.gs-game{cursor:auto!important}' : '') + '}';
    (document.head || document.documentElement).appendChild(s);
  })();
  // Back to the top (Maurice, 2026-11-12: "a button on the bottom right that takes you back up to the top of the page,
  // one of the new icons"): his licensed triple chevron on an ink square, shown once the page has been scrolled a screen.
  (function top() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', top); return; }
    var css = document.createElement('style');
    css.textContent = '#ma-top{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(20px + env(safe-area-inset-bottom));z-index:2147483000;width:52px;height:52px;padding:0;border:2px solid #fffffe;border-radius:0;background:#0b170f;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transform:translateY(12px);transition:opacity .3s ease,transform .3s ease,visibility 0s linear .3s,background-color .2s ease;cursor:pointer}' +
      '#ma-top.on{opacity:1;visibility:visible;transform:none;transition:opacity .3s ease,transform .3s ease,background-color .2s ease}' +
      '#ma-top:hover,#ma-top:focus-visible{background:#c53200}#ma-top:focus-visible{outline:2px solid #a2f590;outline-offset:3px}' +
      '#ma-top img{height:28px;width:auto;display:block;pointer-events:none}' +
      // the sideways sliders keep a bar along the bottom; the button sits above it there
      'body:has(.lk-prog,.ac-prog,.gs-prog,[data-ma-hz]) #ma-top{bottom:calc(max(18px,3svh) + 34px)}' +
      '@media (prefers-reduced-motion:reduce){#ma-top{transition:none}}';
    document.head.appendChild(css);
    var b = document.createElement('button');
    b.id = 'ma-top'; b.type = 'button'; b.setAttribute('aria-label', 'Back to the top'); b.title = 'Back to the top';
    b.innerHTML = '<img src="' + BASE + 'assets/icons/back-to-top.png" alt="">';
    b.addEventListener('click', function () {
      if (window.maLenis && !still) window.maLenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
    });
    document.body.appendChild(b);
    var on = false;
    // phones: it shows only while scrolling back up (or at the very bottom) and tucks away 1.6 s after scrolling stops,
    // so it never sits on the page's words (Maurice's no-overlap rule; QA 2026-11-14)
    var lastY = window.scrollY, hideT = 0;
    function check() {
      var y = window.scrollY, s = y > Math.min(700, innerHeight * 0.9);
      if (s && innerWidth < 700) {
        var bottom = y + innerHeight >= document.documentElement.scrollHeight - 8;
        s = bottom || y < lastY - 2 || (on && y <= lastY + 2);
        clearTimeout(hideT); if (s && !bottom) hideT = setTimeout(function () { on = false; b.classList.remove('on'); }, 1600);
      }
      lastY = y;
      if (s !== on) { on = s; b.classList.toggle('on', s); }
    }
    addEventListener('scroll', check, { passive: true }); check();
  })();
  // A golden bullet (Maurice, 2026-11-12: "when you click something that isn't clickable or a button, the gun shoots a
  // little golden bullet that flies up over the screen"): from the pistol's muzzle, up and off the top, with a small
  // flash. Mouse and trackpad only, never on game pages, and not for people who ask for less motion.
  // on the game pages it fires anywhere but over the game itself
  if (!still) (function () {
    var PASS = 'a,button,input,select,textarea,label,summary,option,video,audio,iframe,canvas,[role="button"],[role="link"],[role="tab"],[onclick],[contenteditable],[tabindex]:not([tabindex="-1"]),.lk-mt,#ma-top';
    var css = document.createElement('style');
    css.textContent = '.ma-shot{position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;width:5px;height:16px;margin:-8px 0 0 -2.5px;border-radius:2.5px 2.5px 1px 1px;background:linear-gradient(#fff6c8,#f2c94c 35%,#b8860b);box-shadow:0 0 6px 2px rgba(242,201,76,.7),0 0 14px 4px rgba(242,201,76,.35)}' +
      '.ma-flash{position:fixed;left:0;top:0;z-index:2147483001;pointer-events:none;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:radial-gradient(circle,#fffbe6 0,#f2c94c 40%,rgba(242,201,76,0) 70%)}';
    (document.head || document.documentElement).appendChild(css);
    document.addEventListener('click', function (e) {
      if (e.button !== 0 || e.defaultPrevented || !matchMedia('(pointer:fine)').matches) return;
      if (e.target.closest && (e.target.closest(PASS) || e.target.closest('.gs-game'))) return;
      var sel = window.getSelection && String(window.getSelection()); if (sel && sel.length) return;
      if (getComputedStyle(e.target).cursor === 'text') return;
      var x = e.clientX, y = e.clientY, ang = -46 + Math.random() * 4;   // straight out of the barrel: up and to the left at about 45 degrees (Maurice, 2026-11-13)
      var rad = ang * Math.PI / 180, dist = y + 80, dx = Math.tan(rad) * dist, ty = -80;
      if (x + dx < -80) { dx = -80 - x; ty = y - dx / Math.tan(rad); dist = y - ty; }   // leaves by the left edge first
      var f = document.createElement('div'); f.className = 'ma-flash'; f.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      var s = document.createElement('div'); s.className = 'ma-shot';
      document.body.appendChild(f); document.body.appendChild(s);
      f.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) scale(.4)', opacity: 1 }, { transform: 'translate(' + x + 'px,' + y + 'px) scale(1.6)', opacity: 0 }],
        { duration: 220, easing: 'ease-out' }).onfinish = function () { f.remove(); };
      s.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + ang + 'deg) scale(.6)', opacity: 1 },
        { transform: 'translate(' + (x + dx) + 'px,' + ty + 'px) rotate(' + ang + 'deg) scale(1)', opacity: 1 }],
        { duration: 420 + dist * 0.25, easing: 'cubic-bezier(.2,.6,.3,1)' }).onfinish = function () { s.remove(); };
    });
  })();
  // Dark site (Maurice, 2026-11-12): pages on the new look sit on the dark ink that was behind the icon row
  // (#0b170f), with white headings and soft white text. It follows the same page list as the motion, and people
  // who ask for less motion still get the dark look. Sections listed in KEEP keep their own colors (the home
  // page's Cello's Gate and Meet Maurice sections stay parchment with ink text, Maurice 2026-11-12). Photo backgrounds get a dark
  // veil instead of a light one so white words read over them.
  if (NEWLOOK) (function () {
    var KEEP = ['68f02305a607472bc166989f', '68f11b87e56b4f29961710f1'];   // home: Cello's Gate, Meet Maurice
    var S = '#page .page-section' + KEEP.map(function (id) { return ':not([data-section-id="' + id + '"])'; }).join('');
    var s = document.createElement('style'); s.id = 'ma-dark';
    s.textContent = S + '{--siteBackgroundColor:#0b170f!important;' +
      '--headingExtraLargeColor:#fff!important;--headingLargeColor:#fff!important;--headingMediumColor:#fff!important;--headingSmallColor:#fff!important;' +
      '--paragraphLargeColor:rgba(255,255,255,.86)!important;--paragraphMediumColor:rgba(255,255,255,.86)!important;--paragraphSmallColor:rgba(255,255,255,.86)!important;' +
      '--paragraphLinkColor:#3adb97!important}' +
      S + ' .section-background{background-color:#0b170f!important}' + S + ' .section-background-overlay{background-color:#0b170f!important}' +
      'html,body,#siteWrapper{background-color:#0b170f!important}' +
      // green words and social icons that were dark green on white turn bright emerald so they read on the dark
      S + ' .sqsrte-text-color--darkAccent,' + S + ' .sqsrte-text-color--accent{color:#3adb97!important}' + S + ' .sqsrte-text-color--black{color:#fff!important}' +
      S + ' .sqs-svg-icon--social .sqs-use--icon{fill:#3adb97!important}';
    (document.head || document.documentElement).appendChild(s);
  })();
  // The page's social rows (Maurice, 2026-11-12): every icon from the footer row joins the page's own social links
  // (Meet Maurice has Instagram, TikTok, and YouTube), drawn in that row's color. Walmart is its yellow spark's shape.
  if (NEWLOOK) (function more(tries) {
    var lists = document.querySelectorAll('#page .sqs-svg-icon--list'), foot = document.querySelectorAll('#ma-foot .ma-foot-social a');
    if (!lists.length || !foot.length) { if ((tries || 0) < 80) setTimeout(function () { more((tries || 0) + 1); }, 250); return; }
    // all on one line: the row may run wider than the button above it, and phones get slightly smaller icons
    if (!document.getElementById('ma-more-css')) {
      var cs = document.createElement('style'); cs.id = 'ma-more-css';
      cs.textContent = '#page .sqs-svg-icon--list[data-ma-more]{flex-wrap:nowrap!important;justify-content:center!important;gap:16px!important}#page .sqs-svg-icon--list[data-ma-more]>a{flex:none!important}' +
        '@media (max-width:640px){#page .sqs-svg-icon--list[data-ma-more]{gap:9px!important}#page .sqs-svg-icon--list[data-ma-more]>a{width:28px!important;height:28px!important;flex:none}}';
      document.head.appendChild(cs);
    }
    Array.prototype.forEach.call(lists, function (list) {
      if (list.getAttribute('data-ma-more')) return;
      list.setAttribute('data-ma-more', '1');
      var have = Array.prototype.map.call(list.querySelectorAll('a'), function (a) { return a.hostname.replace(/^www\./, ''); });
      var first = list.querySelector('.sqs-use--icon'), tint = first ? getComputedStyle(first).fill : '#1a5e41';
      Array.prototype.forEach.call(foot, function (f) {
        if (have.indexOf(f.hostname.replace(/^www\./, '')) >= 0) return;
        var a = document.createElement('a'), svg = f.querySelector('svg'), img = f.querySelector('img');
        a.href = f.href; a.target = '_blank'; a.rel = 'noopener'; a.className = 'ma-more-icon';
        a.setAttribute('aria-label', f.getAttribute('aria-label') || f.title || '');
        a.style.cssText = 'display:block;width:32px;height:32px';
        if (svg) {
          var s = svg.cloneNode(true);
          s.setAttribute('fill', tint);
          Array.prototype.forEach.call(s.querySelectorAll('[fill]'), function (p) { p.setAttribute('fill', tint); });
          s.style.cssText = 'display:block;width:100%;height:100%';
          a.appendChild(s);
        } else if (img) {
          var src = /walmart/i.test(f.href) ? BASE + 'assets/img/walmart-spark.png' : (img.currentSrc || img.src), m = document.createElement('span');
          m.style.cssText = 'display:block;width:100%;height:100%;background:' + tint + ';-webkit-mask:url("' + src + '") center/contain no-repeat;mask:url("' + src + '") center/contain no-repeat';
          a.appendChild(m);
        }
        list.appendChild(a);
      });
    });
  })();
  // Main menu (Maurice, 2026-11-12): the header's links and dropdown links draw an underline in on hover, like the
  // footer links. The boxed Order Cello's Gate button stays as it is.
  (function () {
    // (html body #header ...: the header's own style clears these links' background, so this has to outrank it)
    var s = document.createElement('style'), M = 'html body #header .header-nav-item:not(:last-child)>a,html body #header .header-nav-item:not(:last-child)>.header-nav-folder-title,html body #header .header-nav-folder-item a';
    var H = M.split(',').map(function (x) { return '@@:hover,@@:focus-visible'.replace(/@@/g, x); }).join(',');
    s.textContent = '@media (hover:hover){' + M + '{background-image:linear-gradient(currentColor,currentColor)!important;background-repeat:no-repeat!important;background-position:100% 100%!important;background-size:0% 1.5px!important;text-decoration:none!important;transition:background-size .45s cubic-bezier(.6,0,.2,1)!important}' +
      H + '{background-position:0 100%!important;background-size:100% 1.5px!important}}';
    (document.head || document.documentElement).appendChild(s);
  })();
  // game pages get the footer's motion only (Maurice, 2026-11-13: the footer animation went away on the games); the
  // smooth scrolling and the rest would fight the sideways row
  if (!still && ON_GAME) window.MA_MOTION_FOOTER_ONLY = true;
  if (MOTION || (!still && ON_GAME)) (function go() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', go); return; }
    var s = document.createElement('script'); s.src = BASE + 'motion.js'; document.head.appendChild(s);
  })();
  // Phones (Maurice, 2026-11-04): the hunt menu gets a solid bar, so its button never floats over the page's text.
  // The menu bar keeps one size from the first moment (Maurice, 2026-11-13: 'when I scroll at the beginning, the menu changes
  // sizes and it causes a glitch'): the page builder's shrink-on-scroll class is taken off every time it is put on.
  (function hold() {
    var h = document.getElementById('header');
    if (!h) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hold); return; }
    if (h.classList.contains('shrink')) h.classList.remove('shrink');
    if (window.MutationObserver) new MutationObserver(function () { if (h.classList.contains('shrink')) h.classList.remove('shrink'); }).observe(h, { attributes: true, attributeFilter: ['class'] });
  })();
  // A game page whose page builder still shows its own menu bar under the game menu (Sky Mines: a 145px bar with the logo
  // peeking out under the 88px menu on phones; QA 2026-11-14) keeps only the game menu, like every other game page
  if (ON_GAME) (function () { var s = document.createElement('style'); s.textContent = 'body:has(#hunt-nav) header#header{display:none!important}'; (document.head || document.documentElement).appendChild(s); })();
  (function () { var s = document.createElement('style'); s.textContent = '@media (max-width:900px){#hunt-nav{background:#1a5e41!important;padding:5px 0!important}}' +
    // phones and tablets: the logo on the left and the menu button on the right, like every other page's menu bar (Maurice,
    // 2026-11-13: the logo was missing on Contests, the Arcade, and The Adventure)
    'html body #hunt-nav,html body #header,html body #header .header-background,html body #header.shrink .header-background{background:#0b170f!important;background-color:#0b170f!important;opacity:1!important;backdrop-filter:none!important}' +   // the menu bar is ink from the start, on every screen (Maurice, 2026-11-13: 'always active ... easier on the eyes')
    '@media (max-width:1100px){html body #hunt-nav{display:flex!important;align-items:center;justify-content:space-between;padding:10px 20px!important}' +
    'html body #hunt-nav .mn-row{display:flex!important;flex:none;max-width:none;margin:0!important;justify-content:flex-start!important}html body #hunt-nav .mn-row .mn-logo{margin:0!important}html body #hunt-nav .mn-row .mn-right{display:none!important}' +
    'html body #hunt-nav .mn-logo img{width:clamp(84px,24vw,112px)!important}html body #hunt-nav .mn-burger{display:flex!important;margin:0!important}}'; (document.head || document.documentElement).appendChild(s); })();
  // No strip above the footer (Maurice, 2026-11-12): on wide screens Squarespace stretches a page's one code block
  // taller than the page inside it, and the section color showed as a band above the footer. The block now ends
  // where the page ends.
  (function () { var s = document.createElement('style'); s.textContent = '#page .fluid-engine:has(> .fe-block:only-child .sqs-block-code){grid-template-rows:none!important;grid-auto-rows:auto!important}' +
    '#page .page-section:has(.fluid-engine > .fe-block:only-child .sqs-block-code) > .content-wrapper{padding-bottom:0!important}'; (document.head || document.documentElement).appendChild(s); })();
  // Headings (Maurice, 2026-10-09): heads.js turns every Atomic Marker and Cinzel heading into Cracked Imperia Bold
  // with its 3D (Extrude Flush). Clue and puzzle text keeps its own capitals and line breaks.
  (function () { var s = document.createElement('script'); s.src = BASE + 'heads.js'; (document.head || document.documentElement).appendChild(s); })();

  function runScripts(root) {
    var scripts = Array.prototype.slice.call(root.querySelectorAll('script'));
    return scripts.reduce(function (chain, old) {
      return chain.then(function () {
        return new Promise(function (done) {
          var s = document.createElement('script');
          for (var i = 0; i < old.attributes.length; i++) s.setAttribute(old.attributes[i].name, old.attributes[i].value);
          if (old.src) { s.onload = s.onerror = done; } else { s.text = old.textContent; }
          old.parentNode.replaceChild(s, old);
          if (!old.src) done();
        });
      });
    }, Promise.resolve());
  }

  function scrollToHash(el) {
    var id = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (!id) return;
    var target = document.getElementById(id);
    if (!target || !el.contains(target)) return;
    var margin = function () { return parseFloat(getComputedStyle(target).scrollMarginTop) || 0; };
    var y = function () { return target.getBoundingClientRect().top + window.pageYOffset - margin(); };
    // The moment the reader scrolls, taps or presses a key, the page is theirs: no more jumping back.
    var theirs = false, EV = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    var mine = function () { theirs = true; EV.forEach(function (e) { window.removeEventListener(e, mine, true); }); };
    EV.forEach(function (e) { window.addEventListener(e, mine, { capture: true, passive: true }); });
    window.maAfterLoading(function () {
      setTimeout(function () {
        if (theirs) return;
        window.scrollTo({ top: y(), behavior: 'smooth' });
        // Images above it can still be loading and push it down; check back a few times and nudge it into place.
        var tries = 0, settle = function () { if (theirs) return; if (Math.abs(target.getBoundingClientRect().top - margin()) > 24) window.scrollTo({ top: y(), behavior: 'smooth' }); if (++tries < 5) setTimeout(settle, 900); else mine(); };
        setTimeout(settle, 1300);
      }, 300);
    });
  }

  // ---- Speed (Maurice, 2026-10-02). Every page goes through here, so the fixes live here once. ----------
  // 1. Atomic Marker: the pages ask for an 847 KB OTF; Squarespace already serves the same font as a 424 KB WOFF2.
  var MARKER = 'https://file.squarespace-cdn.com/content/v2/namespaces/fonts/libraries/68f0178dd88a7e52ec46ae7e/assets/fcf5195a-5d29-4ff1-9122-8c51374e01cb/font.woff2';
  var MARKER_OTF = /url\((['"]?)[^)'"]*Atomic\+Marker\+Regular\.otf\1\)\s*format\((['"])opentype\2\)/g;
  // 2. Almarai: Squarespace already loads 400 and 700 site-wide; only 800 comes from Google Fonts.
  function sqspAlmarai() {
    var has = false;
    try { document.fonts.forEach(function (f) { if (/almarai/i.test(f.family) && String(f.weight) === '400') has = true; }); } catch (e) {}
    return has;
  }
  // 3. Backgrounds: lighter copies made from the originals, one for big screens (d/) and one for phones (m/).
  var BGV = ['cavern-ruins-as581365050', 'city-skyline-panorama-as348070597', 'crystal-towers-lake-as395045722', 'dome-city-mist-as159145789',
    'floating-blocks-city-as311317794', 'garden-city-towers', 'gyroscope-foundry-as401944302', 'monolith-canyon-as444233611',
    'nebula-glow-as332921866', 'neon-street-as1928158052', 'neon-tunnel-arch-as468986961', 'overgrown-sphere-as470076105', 'red-sun-ruins-as360866146'];
  var phone = Math.min(window.innerWidth || 9999, (window.screen && screen.width) || 9999) <= 900;
  // 4. Images come from a copy of this site pinned to one publish, cached for a year (GitHub Pages only allows
  // 10 minutes, and every publish makes visitors download everything again). Anything newer than the pin
  // falls back to GitHub Pages by itself. tools/pin-assets.mjs moves the pin after a publish.
  var PIN = 'bfb88c6a11f8b61c49d62be42fa4605e0e27c067';
  var GH = 'https://africhmaurice.github.io/site/', CDN = PIN ? 'https://cdn.jsdelivr.net/gh/africhmaurice/site@' + PIN + '/' : '';
  function cdn(u) { return CDN && u.indexOf(GH + 'assets/') === 0 ? CDN + u.slice(GH.length) : u; }
  function prep(html) {
    html = html.replace(MARKER_OTF, "url('" + MARKER + "') format('woff2')");
    html = html.replace(/(['"]Atomic Marker['"]\s*,\s*)cursive/g, "$1Impact,sans-serif");
    if (sqspAlmarai()) html = html.replace(/(fonts\.googleapis\.com\/css2\?family=Almarai:wght@)400;700;800/g, '$1' + '800');
    html = html.replace(/https:\/\/africhmaurice\.github\.io\/site\/assets\/bg\/([\w-]+)\.webp/g, function (all, name) {
      return BGV.indexOf(name) < 0 ? all : GH + 'assets/bg/' + (phone ? 'm/' : 'd/') + name + '.webp';
    });
    return html;
  }
  // 6. Fonts on every page, whatever the page itself declares (Maurice, 2026-10-02: a page with no @font-face showed a
  // script fallback in Estonia). Atomic Marker from Squarespace's WOFF2, Almarai 400/700/800 from Google Fonts when
  // Squarespace hasn't loaded it, and a plain bold fallback instead of the browser's "cursive" while the font arrives.
  if (!document.getElementById('ma-fonts')) {
    var ff = document.createElement('style'); ff.id = 'ma-fonts';
    ff.textContent = "@font-face{font-family:'Atomic Marker';src:url('" + MARKER + "') format('woff2');font-weight:400;font-style:normal;font-display:swap}";
    (document.head || document.documentElement).appendChild(ff);
    if (!document.querySelector('link[href*="family=Almarai"]')) {
      var gf = document.createElement('link'); gf.rel = 'stylesheet'; gf.href = 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap';
      (document.head || document.documentElement).appendChild(gf);
    }
  }
  if (!document.getElementById('ma-marker-pre')) {
    var pre = document.createElement('link'); pre.id = 'ma-marker-pre'; pre.rel = 'preload'; pre.as = 'font'; pre.type = 'font/woff2'; pre.crossOrigin = 'anonymous'; pre.href = MARKER;
    (document.head || document.documentElement).appendChild(pre);
  }
  // 5. Lazy backgrounds: a background image waits until its section is on screen. The first screen loads right
  // away; once it's ready, anything within about a screen and a half of where you are loads ahead of you, slides
  // in the home slider included, so nothing pops in late.
  var lazy = [], firstScreen = [];
  var BGPROP = /(^|;)\s*((?:--[\w-]+)|background(?:-image)?)\s*:\s*([^;]*url\((?!['"]?data:)[^;]*)/g;
  function holdBackgrounds(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[style*="url("]'), function (x) {
      var st = x.getAttribute('style'), keep = [];
      st.replace(BGPROP, function (all, lead, prop, val) { keep.push([prop, val.trim()]); return all; });
      if (!keep.length) return;
      // background-attachment:fixed (the parallax) and the other background settings written after the image:
      // putting the image back resets them, so they go back on after it
      var after = [];
      st.replace(/(^|;)\s*(background-[\w-]+)\s*:\s*([^;]+)/g, function (all, lead, prop, val) { if (!/url\(/.test(val)) after.push([prop, val.trim()]); return all; });
      x.setAttribute('style', st.replace(BGPROP, function (all, lead, prop, val) { return lead + prop + ':' + val.replace(/url\([^)]*\)/g, 'none'); }));
      lazy.push({ el: x, keep: keep, after: after });
    });
    Array.prototype.forEach.call(root.querySelectorAll('img'), function (img) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      var src = img.getAttribute('src');
      if (src && CDN && src.indexOf(GH + 'assets/') === 0) {
        img.setAttribute('src', cdn(src));
        img.setAttribute('onerror', "this.onerror=null;this.src='" + src + "'");
      }
    });
  }
  function loadBg(item) {
    return new Promise(function (done) {
      var urls = [], RX = /url\((['"]?)([^)'"]+)\1\)/g;
      item.keep.forEach(function (k) { k[1].replace(RX, function (a, q, u) { urls.push(u); return a; }); });
      var left = urls.length, swap = {};
      function apply() {
        item.keep.forEach(function (k) {
          var v = k[1].replace(RX, function (a, q, u) { return 'url("' + (swap[u] || u) + '")'; });
          var imp = /!important\s*$/.test(v);
          item.el.style.setProperty(k[0], v.replace(/\s*!important\s*$/, ''), imp ? 'important' : '');
        });
        (item.after || []).forEach(function (k) {
          var imp = /!important\s*$/.test(k[1]);
          item.el.style.setProperty(k[0], k[1].replace(/\s*!important\s*$/, ''), imp ? 'important' : '');
        });
        done();
      }
      if (!left) return apply();
      urls.forEach(function (u) {
        var c = cdn(u), im = new Image();
        im.onload = function () { swap[u] = c; if (!--left) apply(); };
        im.onerror = function () {
          if (c === u) { if (!--left) apply(); return; }
          var g = new Image(); g.onload = g.onerror = function () { if (!--left) apply(); }; g.src = u;
        };
        im.src = c;
      });
    });
  }
  function onScreen(x, ahead) {
    var r = x.getBoundingClientRect(), h = window.innerHeight || 800, w = document.documentElement.clientWidth;
    if (!r.width || !r.height) return false;
    if (ahead) return r.bottom > -h * 3 && r.top < h * 4;
    return r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
  }
  var aheadOn = false, sweepT = 0;
  function sweep() {
    for (var i = lazy.length - 1; i >= 0; i--) {
      var it = lazy[i];
      if (!it.el.isConnected) continue;
      if (onScreen(it.el, false) || (aheadOn && onScreen(it.el, true))) { lazy.splice(i, 1); var p = loadBg(it); if (!aheadOn) firstScreen.push(p); }
    }
  }
  function sweepSoon() { if (!sweepT) sweepT = requestAnimationFrame(function () { sweepT = 0; sweep(); }); }
  window.addEventListener('scroll', sweepSoon, { passive: true });
  window.addEventListener('resize', sweepSoon);
  // panels that open later (popups, tabs, slides) are picked up by a light check twice a second
  setInterval(function () { if (lazy.length) sweep(); }, 500);
  // Once the first screen is up: the map's images (the world map and the treasure map) load right away, and
  // after a short pause every background still waiting loads too, one at a time, so a fast scroll or a jump
  // down the page never finds an empty section.
  function startAhead() {
    if (aheadOn) return; aheadOn = true; sweep();
    Array.prototype.forEach.call(document.querySelectorAll('#map img[loading="lazy"]'), function (im) { im.loading = 'eager'; });
    setTimeout(function next() {
      var it = null;
      for (var i = 0; i < lazy.length; i++) if (lazy[i].el.isConnected) { it = lazy.splice(i, 1)[0]; break; }
      if (it) loadBg(it).then(next);
    }, 2500);
  }

  function mount(el) {
    if (el.getAttribute('data-ma-state')) return;
    el.setAttribute('data-ma-state', 'loading');
    var slug = el.getAttribute('data-ma-page');
    pending++;
    fetch(BASE + 'pages/' + slug + '.html', FRESH)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var t = document.createElement('template');
        t.innerHTML = prep(html);
        holdBackgrounds(t.content);
        el.innerHTML = '';
        el.appendChild(t.content);
        sweep();
        return runScripts(el);
      })
      .then(function () {
        el.setAttribute('data-ma-state', 'ready');
        pending--; topGap(); reveal(el); huntGift(); fitNavs();
        // Pages that size themselves on window load get a second chance now that they exist.
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
        // A link like /the-hunt#rewards arrives before its section exists; scroll once it does.
        scrollToHash(el);
      })
      .catch(function () {
        el.setAttribute('data-ma-state', 'error'); pending--;
        el.innerHTML = '<p style="text-align:center;padding:40px 16px;font-family:sans-serif">This section didn’t load. Please refresh the page.</p>';
      });
  }

  // Scroll animations: headings, cards, boards, text and images rise and fade in as they come on screen.
  // Long reading pages (Official Rules, Privacy Policy) keep their body text still so it reads easily.
  var longRead = /^\/(rules|privacy-policy)/.test(location.pathname);
  var REVEAL = 'h1,h2,h3,h4,.tm-card,.lc-board,.po-hero,.po-region,.m-list,.m-ptsnote,[data-reveal]' + (longRead ? '' : ',p,ul,ol,blockquote,img,table');
  var io;
  // Game pages stay still: a board that fades in as you scroll can look like an empty page.
  function gamePage() { return !!document.querySelector('[data-ma-page="games"],[data-ma-page^="game-"]') || /^\/(games|game-)/.test(location.pathname); }
  function reveal(root) {
    if (still || MOTION || gamePage() || !('IntersectionObserver' in window)) return;
    if (!document.getElementById('ma-reveal-css')) {
      var css = document.createElement('style'); css.id = 'ma-reveal-css';
      css.textContent = '.ma-rv{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .8s cubic-bezier(.2,.7,.2,1)}.ma-rv.ma-in{opacity:1;transform:none}';
      document.head.appendChild(css);
    }
    io = io || new IntersectionObserver(function (es) {
      var n = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, d = Math.min(n++, 5) * 90;
        window.maAfterLoading(function () {
          el.style.transitionDelay = d + 'ms';
          el.classList.add('ma-in');
          setTimeout(function () { el.style.transitionDelay = ''; }, 1400);
        });
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    // Only things on the page right now: hidden panels, slider slides, embeds, and the link page are left alone, so nothing
    // can be stuck invisible (they may never "scroll into view" the way the observer sees it).
    var SKIP = '#hunt-nav,#hunt-nav-ov,#ma-loading,#ma-links,nav,header,footer,.ma-rv,[data-ma-page="home-slider"],.instagram-media,[aria-hidden="true"],[class*="slide"],[class*="carousel"],[class*="swiper"],[class*="gallery"]';
    // Like x.closest(SKIP), but stops below <body>: Squarespace's body classes contain words like "gallery".
    function skipped(x) {
      for (var a = x; a && a !== document.body && a !== document.documentElement; a = a.parentElement) if (a.matches(SKIP)) return true;
      return false;
    }
    function placed(x) {
      var r = x.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.right > 0 && r.left < document.documentElement.clientWidth;
    }
    // Boxes: any panel, card or board (it has a fill, border or shadow and isn't full width) rises in as one piece.
    var vw = document.documentElement.clientWidth;
    Array.prototype.forEach.call(root.querySelectorAll('div,article,aside,figure,form,iframe'), function (x) {
      if (skipped(x) || !placed(x)) return;
      var cs = getComputedStyle(x);
      if (cs.position === 'fixed' || cs.position === 'absolute' || cs.display === 'none') return;
      var r = x.getBoundingClientRect();
      if (r.width < 160 || r.height < 90 || r.width > vw * 0.92) return;
      var bg = cs.backgroundColor.match(/rgba?\(([^)]+)\)/), a = bg ? bg[1].split(',') : [];
      var filled = (a.length === 3 || (a.length === 4 && parseFloat(a[3]) >= 0.25)) || cs.backgroundImage !== 'none';
      var edged = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
      if (!(filled || edged || cs.boxShadow !== 'none' || x.nodeName === 'IFRAME')) return;
      x.classList.add('ma-rv');
      io.observe(x);
    });
    Array.prototype.forEach.call(root.querySelectorAll(REVEAL), function (x) {
      // skip menus, fixed bars and anything already animated or nested in something that animates
      if (skipped(x) || !placed(x) || getComputedStyle(x).position === 'fixed') return;
      if (x.nodeName === 'IMG' && x.getBoundingClientRect().width && x.getBoundingClientRect().width < 90) return; // icons
      x.classList.add('ma-rv');
      io.observe(x);
    });
  }

  // Loading screen: the crest in white on dark red fills with a lighter red while the page loads, then fades away.
  // Only when this script is installed site-wide in <head>; add ?ma-loading to any page URL to preview it.
  function loadingScreen() {
    var ov = document.createElement('div');
    ov.id = 'ma-loading'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<style>#ma-loading{position:fixed;inset:0;z-index:2147483600;background:#912501;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease,visibility .5s}' +
      '#ma-loading.ma-done{opacity:0;visibility:hidden}' +
      '#ma-loading .ma-crest{position:relative;width:min(60vw,340px);aspect-ratio:2/1;background:#fffffe;-webkit-mask:url(' + BASE + 'assets/img/crest-mask.png) center/contain no-repeat;mask:url(' + BASE + 'assets/img/crest-mask.png) center/contain no-repeat}' +
      '#ma-loading .ma-red{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#fd7547,#ff4c0f 55%,#ff4c0f);transition:height .35s ease-out}</style>' +
      '<div class="ma-crest"><div class="ma-red"></div></div>';
    document.documentElement.appendChild(ov);
    var red = ov.querySelector('.ma-red'), t0 = Date.now(), p = 0, finished = false;
    var tick = setInterval(function () { p += (0.9 - p) * 0.08; red.style.height = p * 100 + '%'; }, 60);
    function finish() {
      if (finished) return; finished = true; clearInterval(tick);
      red.style.height = '100%';
      setTimeout(function () { ov.classList.add('ma-done'); setTimeout(function () { ov.remove(); }, 600); }, still ? 0 : 420);
      startAhead();
    }
    // Done once the first screen is ready: the custom sections are in, the fonts have arrived, and the images you
    // can see right now have loaded. Everything further down loads as you get near it. Shown for at least 0.8s so
    // the fill reads; never longer than 5s, whatever is still loading.
    function firstReady() {
      if (pending > 0 || document.readyState === 'loading') return false;
      sweep();
      return !Array.prototype.some.call(document.images, function (im) { return !im.complete && onScreen(im, false); });
    }
    var waiting = false;
    function check() {
      if (finished || waiting) return;
      if (!firstReady()) { setTimeout(check, 100); return; }
      waiting = true;
      var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      Promise.all([fonts, Promise.all(firstScreen)]).then(function () { setTimeout(finish, Math.max(0, 800 - (Date.now() - t0))); });
    }
    check(); setTimeout(finish, 5000);
  }
  if (inHead || /[?&]ma-loading/.test(location.search)) loadingScreen();
  else setTimeout(function wait() { if (pending > 0 || document.readyState === 'loading') setTimeout(wait, 200); else setTimeout(startAhead, 600); }, 200);

  // Site-wide background style: Squarespace's own "Parallax" image effect (the image slides) becomes the
  // Hunt page's fixed background (the image holds still while the page scrolls over it). Like the Hunt page,
  // screens 900px and narrower get a plain scrolling background, since phones don't support fixed ones.
  function fixedBackgrounds() {
    if (!document.getElementById('ma-fixed-bg-css')) {
    var css = document.createElement('style'); css.id = 'ma-fixed-bg-css';
    css.textContent =
      '.ma-fixed-bg{background-size:cover!important;background-repeat:no-repeat!important;background-attachment:fixed!important}' +
      '.ma-fixed-bg img,.ma-fixed-bg canvas,.ma-fixed-bg .section-background-canvas{display:none!important}' +
      '@media (max-width:900px),(hover:none){.ma-fixed-bg{background-attachment:scroll!important}}' +
      // Sharp corners only, site-wide (Maurice, 2026-09-30): the Kit newsletter form draws its own rounded ones.
      '.formkit-form,.formkit-form *{border-radius:0!important}';
    document.head.appendChild(css);
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-controller="BackgroundImageFXParallax"]'), function (fx) {
      var bg = fx.closest('.section-background') || fx;
      var img = bg.querySelector('img');
      if (!img) return;
      var src = img.getAttribute('data-src') || img.currentSrc || img.getAttribute('src');
      if (!src) return;
      // these sit under a heavy color wash, so 1500 wide is plenty unless the screen has far more pixels than that
      var px = (window.innerWidth || 0) * (window.devicePixelRatio || 1);
      if (/squarespace-cdn\.com/.test(src) && src.indexOf('format=') < 0) src += (src.indexOf('?') < 0 ? '?' : '&') + 'format=' + (px > 2200 ? '2500w' : '1500w');
      fx.removeAttribute('data-controller'); // stop Squarespace animating it
      var fp = (img.getAttribute('data-image-focal-point') || '0.5,0.5').split(',');
      bg.style.backgroundImage = 'url("' + src + '")';
      bg.style.backgroundPosition = (parseFloat(fp[0]) * 100) + '% ' + (parseFloat(fp[1]) * 100) + '%';
      bg.classList.add('ma-fixed-bg');
      // A transformed container (Squarespace puts one on .section-border) silently turns "fixed" back into scrolling.
      var sec = bg.closest('section');
      for (var a = bg.parentElement; a && sec && sec.contains(a); a = a.parentElement) {
        var cs = getComputedStyle(a);
        if (cs.transform !== 'none' || cs.willChange.indexOf('transform') >= 0 || cs.filter !== 'none') {
          a.style.setProperty('transform', 'none', 'important');
          a.style.setProperty('will-change', 'auto', 'important');
          a.style.setProperty('filter', 'none', 'important');
        }
      }
    });
    phoneFixed();
  }

  // Fixed backgrounds on phones (Maurice, 2026-11-07): phones ignore background-attachment:fixed, and most pages turn it
  // off at 900px, so there the picture moves to its own layer pinned to the screen (position:fixed), inside a box clipped
  // to the section so it only shows behind that section. Same picture and wash as desktop. Any rule on the page that
  // sets a fixed background counts, ::before ones too, so every page gets this without editing the page.
  var PFX = window.matchMedia && matchMedia('(max-width:900px),(hover:none)');
  var pfxSheets = typeof WeakSet === 'function' ? new WeakSet() : null, pfxItems = [], pfxOn = false, pfxPos = {};
  // these scroll on desktop too, but Maurice wants every phone background held still
  var pfxSel = { '#av .av-hero': 1, '#av .av-band': 1, '#golden-trail': 1 };
  function pfxRules(rules) {
    Array.prototype.forEach.call(rules, function (r) {
      if (r.cssRules && !r.selectorText) return pfxRules(r.cssRules);
      if (r.selectorText && r.style && /fixed/.test(r.style.backgroundAttachment)) r.selectorText.split(',').forEach(function (s) { pfxSel[s.trim()] = 1; });
      if (r.selectorText && r.style && r.style.position === 'fixed') r.selectorText.split(',').forEach(function (s) { if (s.indexOf('::') < 0) pfxPos[s.trim()] = 1; });
    });
  }
  function pfxPinnable(el) {
    var sec = el.closest('section');
    for (var a = el; a && a !== document.documentElement; a = a.parentElement) {
      var cs = getComputedStyle(a), bad = cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none' || /transform|filter|perspective/.test(cs.willChange) || /paint|layout|strict|content/.test(cs.contain || '');
      if (!bad) continue;
      if (!sec || !sec.contains(a) || a === sec) return false;
      a.style.setProperty('transform', 'none', 'important');
      a.style.setProperty('will-change', 'auto', 'important');
      a.style.setProperty('filter', 'none', 'important');
    }
    return true;
  }
  // Pinning makes each section its own stack, so a menu bar or popup inside it would slide under the next section.
  // A section holding one sits as high as that menu or popup, but stays under the site header.
  function pfxLift(el) {
    var top = 0, hd = document.getElementById('header'), hz = hd ? parseInt(getComputedStyle(hd).zIndex, 10) || 0 : 0;
    function see(k) { if (!k.closest('.ma-pfx')) top = Math.max(top, parseInt(getComputedStyle(k).zIndex, 10) || 1); }
    Object.keys(pfxPos).forEach(function (s) { try { Array.prototype.forEach.call(el.querySelectorAll(s), see); } catch (e) {} });
    Array.prototype.forEach.call(el.querySelectorAll('[style*="position:fixed"],[style*="position: fixed"]'), see);
    if (top) el.style.zIndex = hz ? Math.max(1, Math.min(top, hz - 1)) : top;
  }
  function pfxPin(el, pseudo) {
    if (el === document.body || el === document.documentElement || !el.isConnected) return;
    var item = pfxItems.filter(function (x) { return x.el === el; })[0];
    if (item && !item.box.isConnected) el.appendChild(item.box);
    var cs = getComputedStyle(el, pseudo || null);
    if (!/url\(/.test(cs.backgroundImage) || !pfxPinnable(el)) return;
    if (!item) {
      var box = document.createElement('div'); box.className = 'ma-pfx'; box.setAttribute('aria-hidden', 'true');
      box.style.cssText = 'position:absolute;top:0;right:0;bottom:0;left:0;z-index:-1;pointer-events:none;clip-path:inset(0);-webkit-clip-path:inset(0)';
      var im = document.createElement('div');
      im.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100vh;height:100lvh';
      box.appendChild(im);
      item = { el: el, box: box, im: im }; pfxItems.push(item);
    }
    item.im.style.backgroundImage = cs.backgroundImage;
    item.im.style.backgroundSize = cs.backgroundSize;
    item.im.style.backgroundPosition = cs.backgroundPosition;
    item.im.style.backgroundRepeat = cs.backgroundRepeat;
    if (pseudo) el.classList.add('ma-pfx-' + pseudo.replace(/:/g, ''));
    else {
      el.style.backgroundImage = 'none';
      if (/url\(/.test(getComputedStyle(el).backgroundImage)) el.style.setProperty('background-image', 'none', 'important');
    }
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.isolation = 'isolate';
    pfxLift(el);
    if (!item.box.isConnected) el.appendChild(item.box);
  }
  function phoneFixed() {
    if (!PFX || !PFX.matches || !document.body) return;
    if (!pfxOn) {
      pfxOn = true; setInterval(phoneFixed, 1000);
      var css = document.createElement('style');
      css.textContent = '.ma-pfx-before::before,.ma-pfx-after::after{background-image:none!important}';
      document.head.appendChild(css);
    }
    Array.prototype.forEach.call(document.styleSheets, function (sh) {
      if (pfxSheets && pfxSheets.has(sh)) return;
      try { pfxRules(sh.cssRules); if (pfxSheets) pfxSheets.add(sh); } catch (e) {}  // another site's stylesheet can't be read
    });
    Object.keys(pfxSel).forEach(function (s) {
      var m = s.match(/::?(before|after)$/), base = m ? s.slice(0, m.index) : s;
      try { Array.prototype.forEach.call(document.querySelectorAll(base || '*'), function (el) { pfxPin(el, m ? '::' + m[1] : ''); }); } catch (e) {}
    });
    Array.prototype.forEach.call(document.querySelectorAll('[style*="fixed"],[style*="attachment"]'), function (el) {
      if (/fixed/.test(el.style.backgroundAttachment)) pfxPin(el, '');
    });
  }

  var nativeDone = false;
  function nativeReveal() {
    // wait for the whole page: a code block near the top runs this before later sections exist
    if (nativeDone || !document.body || document.readyState === 'loading') return; nativeDone = true;
    var blocks = document.querySelectorAll('#sections .sqs-block, #page .sqs-block');
    Array.prototype.forEach.call(blocks, function (b) {
      if (b.querySelector('[data-ma-page]')) return;   // custom sections animate their own pieces
      if (longRead && b.classList.contains('sqs-block-html')) return;
      b.setAttribute('data-reveal', '');
    });
    reveal(document.body.querySelector('#sections') || document.body.querySelector('#page') || document.body);
  }
  // The green menu (#hunt-nav, in every hunt-type page) on a screen too narrow for the whole row: it sits tighter,
  // and if even that does not fit, the phone menu button takes over. It measures whether the row really fits.
  var SITE = 'https://www.mauriceafrich.com';
  function navCss() {
    if (document.getElementById('ma-nav-fit')) return;
    var st = document.createElement('style'); st.id = 'ma-nav-fit';
    // Pages switch to the phone menu below 1240px; with the fold the full row can stay down to 1100px,
    // where the pages' own phone layout starts, so a narrow laptop never gets a phone menu over a desktop page.
    st.textContent = '@media (min-width:1101px) and (max-width:1240px){#hunt-nav{background:#1a5e41!important;padding:9px clamp(24px,4vw,58px)!important}' +
      '#hunt-nav .mn-row{display:flex!important}#hunt-nav .mn-burger{display:none!important}}' +
      '#hunt-nav .mn-links>.mn-drop.mn-earn{display:none}#hunt-nav.mn-compact .mn-links>.mn-drop.mn-earn{display:flex}#hunt-nav.mn-compact .mn-links>a.mn-ep{display:none}' +
      // folded, the row also sits a little tighter, so it still fits at larger font sizes
      '#hunt-nav.mn-compact{padding-left:clamp(16px,2.4vw,40px)!important;padding-right:clamp(16px,2.4vw,40px)!important}' +
      '#hunt-nav.mn-compact .mn-links{gap:clamp(10px,.8vw,18px)}#hunt-nav.mn-compact .mn-links .mn-link{font-size:clamp(10px,.84vw,14px)!important}#hunt-nav.mn-compact .mn-right{gap:clamp(12px,1.4vw,24px)}#hunt-nav.mn-compact .mn-row{gap:16px}' +
      '#hunt-nav.mn-burgered .mn-row{display:none!important}#hunt-nav.mn-burgered .mn-burger{display:flex!important}';
    document.head.appendChild(st);
  }
  function navFits(nav) {
    var row = nav.querySelector('.mn-row'); if (!row) return true;
    var last = nav.querySelector('.mn-drop-cta') || row.lastElementChild;
    return row.scrollWidth <= row.clientWidth + 1 && (!last || last.getBoundingClientRect().right <= Math.min(row.getBoundingClientRect().right, window.innerWidth) + 1);
  }
  function fitNavs() {
    newHunt();
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      if (!nav.getAttribute('data-fit')) return;
      nav.classList.remove('mn-compact', 'mn-burgered'); nav.removeAttribute('data-ma-tight'); nav.style.removeProperty('--mn-gap'); nav.style.removeProperty('--mn-fs');
      var row = nav.querySelector('.mn-row');
      if (!row || getComputedStyle(row).display === 'none') return;   // the page's own phone menu is showing
      if (navFits(nav)) return;
      nav.classList.add('mn-compact');
      if (navFits(nav)) return;
      // still too wide: the spacing steps down to 8px, then the type to 11px, before the phone menu button takes over
      var lk = nav.querySelector('.mn-links'), g = Math.floor(parseFloat(getComputedStyle(lk).columnGap)) || 12, f = parseFloat(getComputedStyle(lk.querySelector('.mn-link')).fontSize) || 12;
      nav.setAttribute('data-ma-tight', '1'); nav.style.setProperty('--mn-gap', g + 'px'); nav.style.setProperty('--mn-fs', f + 'px');
      while (!navFits(nav) && g > 8) { g -= 1; nav.style.setProperty('--mn-gap', g + 'px'); }
      while (!navFits(nav) && f > 11) { f -= 0.5; nav.style.setProperty('--mn-fs', f + 'px'); }
      if (!navFits(nav)) nav.classList.add('mn-burgered');
    });
  }
  var fitTimer;
  window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitNavs, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNavs);
  window.maFitNavs = fitNavs;

  function plainText(a) { return (a.textContent || '').replace(/\s+/g, ' ').trim(); }
  // 25px between the links wherever the row fits. On a narrower screen the spacing tightens first (never under 12px
  // while the type can still shrink), then the type steps down to 11px, then the spacing goes to 8px; if the row still
  // does not fit, the header switches to the phone menu so nothing ever touches or runs off the edge.
  var gapT;
  function mainGap() {
    var hdr = document.getElementById('header'); if (!hdr) return;
    hdr.classList.remove('ma-burger');
    Array.prototype.forEach.call(hdr.querySelectorAll('.header-display-desktop .header-nav-list'), function (list) {
      list.style.removeProperty('--ma-gap'); list.style.removeProperty('--ma-fs'); list.removeAttribute('data-ma-fs');
      var vis = Array.prototype.filter.call(list.children, function (i) { return i.offsetWidth; });
      if (!vis.length) return;
      var wrap = list.closest('.header-nav-wrapper') || list.parentNode, edge = Math.min(wrap.getBoundingClientRect().right, document.documentElement.clientWidth - 16);
      var over = function () { return vis[vis.length - 1].getBoundingClientRect().right - edge; }, o = over();
      if (o <= 0) return;
      var g = Math.max(12, GAP - Math.ceil(o / vis.length)), f = parseFloat(getComputedStyle(list.querySelector('a')).fontSize) || 14;
      list.style.setProperty('--ma-gap', g + 'px');
      while (over() > 0 && f > 11) { f -= 0.5; list.setAttribute('data-ma-fs', '1'); list.style.setProperty('--ma-fs', f + 'px'); }
      while (over() > 0 && g > 8) { g -= 1; list.style.setProperty('--ma-gap', g + 'px'); }
      while (over() <= -vis.length && g < GAP) { g += 1; list.style.setProperty('--ma-gap', g + 'px'); }   // give back what the type step freed
      if (over() > 0) hdr.classList.add('ma-burger');
    });
  }
  // Every dropdown is a box with its title and a line under it (Maurice, 2026-10-10): the hunt menu's way, now on
  // every menu. The Treasure Hunt panel already has its own boxes.
  function boxDrop(drop, title) {
    var inn = drop.querySelector('.mn-dd-in'); if (!inn || inn.querySelector('.ma-grp')) return;
    var g = document.createElement('div'); g.className = 'ma-grp';
    var h = document.createElement('span'); h.textContent = title; g.appendChild(h);
    while (inn.firstChild) g.appendChild(inn.firstChild);
    inn.appendChild(g); inn.classList.add('ma-boxed');
  }
  function boxMainDrops() {
    if (!document.getElementById('ma-boxdd')) {
      var st = document.createElement('style'); st.id = 'ma-boxdd';
      var P = '#header .header-display-desktop .header-nav-folder-content.ma-boxdd';
      st.textContent = P + '{padding:12px!important}' +
        P + ' .ma-grp{display:flex;flex-direction:column;align-items:stretch;gap:2px;border:1px solid rgba(243,234,217,.3);padding:12px 14px 10px}' +
        P + ' .ma-grp>span{font-family:Almarai,sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590;text-transform:uppercase;white-space:nowrap}' +
        P + ' .header-nav-folder-item,' + P + ' .header-nav-folder-item a,' + P + ' .header-nav-folder-item-content{text-align:center!important;justify-content:center!important}' + P + ' .header-nav-folder-item a{display:block!important;padding-left:14px!important;padding-right:14px!important}';
      document.head.appendChild(st);
    }
    Array.prototype.forEach.call(document.querySelectorAll('#header .header-display-desktop .header-nav-item--folder'), function (item) {
      var t = item.querySelector('.header-nav-folder-title'), box = item.querySelector('.header-nav-folder-content');
      if (!t || !box || item.getAttribute('data-ma-boxed') || box.classList.contains('ma-hunt-dd')) return;
      item.setAttribute('data-ma-boxed', '1');
      var g = document.createElement('div'); g.className = 'ma-grp';
      var h = document.createElement('span'); h.textContent = plainText(t.querySelector('.header-nav-folder-title-text') || t); g.appendChild(h);
      Array.prototype.forEach.call(box.querySelectorAll('.header-nav-folder-item'), function (r) { g.appendChild(r); });
      box.appendChild(g); box.classList.add('ma-boxdd');
    });
  }
  // Chapter buttons (2026-10-09): Previous chapter / See the map / Next chapter at the foot of each chapter page.
  function chapterNav() {
    if (window.__chapterNavLoaded) return; window.__chapterNavLoaded = true;
    var s = document.createElement('script'); s.src = GH + 'chapter-nav.js?v=19'; s.async = true; document.head.appendChild(s);
  }
  // "Cello's Gate" is out (Maurice, 2026-11-02): every menu says ORDER, not PRE-ORDER. The Squarespace folder keeps
  // its old name, so the text is swapped in the header, the green hunt menu, its phone menu, and the footer.
  function orderText() {
    ['#header', '#hunt-nav', '#hunt-nav-ov', 'footer'].forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (root) {
        var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), t;
        while ((t = w.nextNode())) if (/pre-order/i.test(t.data)) t.data = t.data.replace(/PRE-ORDER/g, 'ORDER').replace(/Pre-Order/g, 'Order').replace(/Pre-order/g, 'Order').replace(/pre-order/g, 'order');
        Array.prototype.forEach.call(root.querySelectorAll('[aria-label*="re-order" i],[title*="re-order" i]'), function (el) {
          ['aria-label', 'title'].forEach(function (k) { var v = el.getAttribute(k); if (v) el.setAttribute(k, v.replace(/pre-order/gi, function (m) { return m.charAt(0) === 'P' ? 'Order' : 'order'; })); });
        });
      });
    });
  }
  function huntGift() {
    orderText(); setTimeout(orderText, 1200); setTimeout(orderText, 4000);
    chapterNav();
    newHunt();
  }

  // The post-hunt menu (Maurice, 2026-11-11). One list feeds every menu: the main header (desktop row and phone
  // menu) and the green menu copied into the hunt-type pages (desktop row and phone menu). It reads, left to right:
  // THE HUNT, MARKET, LINKS, GAMES (dropdown), NEWSLETTER, FUN STUFF (dropdown; was Extras until Maurice 2026-11-12), JOIN TRENCH!, and the
  // ORDER CELLO'S GATE dropdown. Maurice, 2026-11-12: Arcade and Adventure under the new Games dropdown, Bookshelf
  // under Extras; later that day Contests moved from The Hunt to Extras.
  var MERCH_URL = 'https://shop.mauriceafrich.com/', DISCORD = 'https://discord.gg/d36Xnj4umU', GAP = 25;
  var AURA_URL = SITE + '/oracles-gift/aura-spectrum', QUIZ_URL = SITE + '/sky-pirate-quiz-61748';
  var ORDER_URL = SITE + '/order', ORDER_TEXT = "Order Cello's Gate";
  var MENU = [
    ['Home', SITE + '/'],   // Home above The Hunt (Maurice, 2026-11-13)
    ['The Hunt', SITE + '/the-hunt'],   // no dropdown: the one-page hunt recap (Maurice, 2026-11-12)
    ['Market', MERCH_URL], ['Links', SITE + '/links'],
    ['Games', '/ma-games', [['Arcade', SITE + '/arcade'], ['Adventure', SITE + '/adventure']]],
    ['Newsletter', SITE + '/newsletter'],
    ['Fun Stuff', '/ma-extras', [['Aura Spectrum', AURA_URL], ['Take the Quiz!', QUIZ_URL], ['Crew Dossiers', SITE + '/crew-dossier'], ['Bookshelf', SITE + '/bookshelf'], ['Contests', SITE + '/contests']]],
    ['Join Trench!', DISCORD]
  ];
  var RETAIL = [['Amazon', 'https://www.amazon.com/Cellos-Gate-Sky-Pirates-Imperia/dp/1668242834/ref=sr_1_1?crid=279A8MV3ZYP0T&dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&dib_tag=se&keywords=cellos+gate&qid=1770340593&sprefix=cellos%27+gate%2Caps%2C179&sr=8-1&ascsubtag=srctok-f7d285c3c39c18b3&btn_ref=srctok-f7d285c3c39c18b3'],
    ['Audible', 'https://www.amazon.com/Audible-Cellos-Gate/dp/B0GKZWW416/ref=tmm_aud_swatch_0?_encoding=UTF8&dib_tag=se&dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&qid=1770340593&sr=8-1&ascsubtag=srctok-d4f496760f7c524a&btn_ref=srctok-d4f496760f7c524a'],
    ['Walmart Special Edition', 'https://www.walmart.com/ip/Cello-s-Gate-Walmart-Exclusive-Hardcover-9781668266922/20417514704'],
    ['Waterstones Exclusive Edition', 'https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399766227'],
    ['Broken Binding (Sold Out!)', 'https://thebrokenbindingsub.com/products/cellos-gate'],
    ['Barnes & Noble', 'https://www.barnesandnoble.com/w/cellos-gate-maurice-africh/1146753302?ean=9781668242834'],
    ['All Retailers', ORDER_URL]];
  // the Order menu item in a list of menu items
  function preOrder(items) {
    for (var i = 0; i < items.length; i++) if (/^\s*(Folder:\s*)?(Pre-)?Order\b/i.test(items[i].textContent)) return items[i];
    return null;
  }
  // links that leave the site (not the shop) open in a new tab
  function setLink(a, href, text, holder) {
    a.href = href; a.removeAttribute('aria-current');
    if (href.indexOf(SITE) !== 0 && href !== MERCH_URL) { a.target = '_blank'; a.rel = 'noopener'; } else { a.removeAttribute('target'); a.removeAttribute('rel'); }
    ((holder && a.querySelector(holder)) || a).textContent = text;
  }
  function menuCss() {
    if (document.getElementById('ma-menu-css')) return;
    var st = document.createElement('style'); st.id = 'ma-menu-css';
    st.textContent = '#header .header-display-desktop .header-nav-list{gap:0!important;flex-wrap:nowrap!important}#header .header-display-desktop .header-nav{padding-left:24px!important}' +
      '#header .header-display-desktop .header-nav-item{margin-left:calc(var(--ma-gap,' + GAP + 'px) / 2)!important;margin-right:calc(var(--ma-gap,' + GAP + 'px) / 2)!important;white-space:nowrap}' +
      '@media (max-width:1280px){#header .header-display-desktop .header-nav{padding-left:16px!important}}' +
      '#header .header-display-desktop .header-nav-list[data-ma-fs] .header-nav-item>a,#header .header-display-desktop .header-nav-list[data-ma-fs] .header-nav-folder-title{font-size:var(--ma-fs)!important}' +
      '#header.ma-burger .header-display-desktop{display:none!important}#header.ma-burger .header-display-mobile{display:flex!important}#header.ma-burger .header-burger{display:flex!important}#header.ma-burger .header-display-mobile .header-nav{display:none!important}' +
      'body.header--menu-open #header.ma-burger .header-menu{visibility:visible!important;opacity:1!important}' +
      '@media (max-width:1060px){#header .header-display-desktop .header-nav{padding-left:8px!important}' +
      '#header .header-display-desktop .header-nav-folder-title[data-href="/preorder-cellos-gate"]{padding-left:9px!important;padding-right:9px!important}}' +
      // the green menu: its spacing, and each dropdown as a box with its title
      '#hunt-nav .mn-right .mn-links{gap:' + GAP + 'px}#hunt-nav .mn-row .mn-right{gap:' + GAP + 'px}' +
      '#hunt-nav.mn-compact .mn-right .mn-links{gap:clamp(10px,.9vw,18px)}#hunt-nav.mn-compact .mn-row .mn-right{gap:16px}' +
      '#hunt-nav[data-ma-tight] .mn-right .mn-links{gap:var(--mn-gap)!important}#hunt-nav[data-ma-tight] .mn-row .mn-right{gap:max(12px,var(--mn-gap))!important}#hunt-nav[data-ma-tight] .mn-links .mn-link,#hunt-nav[data-ma-tight] .mn-drop-cta .mn-link{font-size:var(--mn-fs)!important}' +
      '#hunt-nav .mn-dd-in.ma-boxed{padding:12px}' +
      '#hunt-nav .ma-grp{display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid rgba(243,234,217,.3);padding:12px 14px 10px}' +
      '#hunt-nav .ma-grp>span{font-family:\'Almarai\',sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590;text-transform:uppercase;margin-bottom:4px;white-space:nowrap}' +
      '#hunt-nav .ma-grp a{text-align:center;padding:8px 14px!important;white-space:nowrap}';
    document.head.appendChild(st);
    window.addEventListener('resize', function () { clearTimeout(gapT); gapT = setTimeout(mainGap, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(mainGap);
  }
  // The main header: desktop row, then the phone menu. Every old item goes; the new ones are made from the header's
  // own items, so they keep its look and its hover and tap behavior.
  function newMain() {
    if (!document.getElementById('header')) return;
    menuCss();
    Array.prototype.forEach.call(document.querySelectorAll('#header .header-nav-list'), function (list) {
      if (list.getAttribute('data-ma-menu')) return;
      var items = Array.prototype.slice.call(list.children), pre = preOrder(items), fTpl = null;
      items.forEach(function (i) { if (i !== pre && !fTpl && i.classList.contains('header-nav-item--folder')) fTpl = i; });
      var lTpl = list.querySelector('.header-nav-item--external') || list.querySelector('.header-nav-item--collection'), rTpl = list.querySelector('.header-nav-folder-item');
      if (!pre || !fTpl || !lTpl || !rTpl) return;
      list.setAttribute('data-ma-menu', '1');
      fTpl = fTpl.cloneNode(true); lTpl = lTpl.cloneNode(true); rTpl = rTpl.cloneNode(true);
      var fill = function (box, set) {
        box.innerHTML = '';
        set.forEach(function (r) { var row = rTpl.cloneNode(true); row.classList.remove('header-nav-folder-item--active'); setLink(row.querySelector('a'), r[1], r[0], '.header-nav-folder-item-content'); box.appendChild(row); });
      };
      items.forEach(function (i) { if (i !== pre) list.removeChild(i); });
      MENU.forEach(function (m) {
        var it;
        if (m[2]) {
          it = fTpl.cloneNode(true);
          var b = it.querySelector('.header-nav-folder-title'), id = m[1].slice(1), box = it.querySelector('.header-nav-folder-content');
          b.setAttribute('data-href', m[1]); b.setAttribute('aria-controls', id); b.setAttribute('aria-expanded', 'false');
          if (b.tagName === 'A') b.setAttribute('href', (m[2] && m[2][0] && m[2][0][1]) || m[1]);   // the folder title opens its first page, never the dead /ma-games or /ma-extras (QA 2026-11-14)
          it.querySelector('.header-nav-folder-title-text').textContent = m[0];
          box.id = id; fill(box, m[2]);
        } else { it = lTpl.cloneNode(true); setLink(it.querySelector('a'), m[1], m[0]); }
        it.classList.remove('header-nav-item--active'); it.style.display = '';
        list.insertBefore(it, pre);
      });
      pre.querySelector('.header-nav-folder-title-text').textContent = ORDER_TEXT;
      fill(pre.querySelector('.header-nav-folder-content'), RETAIL);
    });
    boxMainDrops();
    mainGap();
    var root = document.querySelector('.header-menu-nav [data-folder="root"]');
    if (!root || root.getAttribute('data-ma-menu')) return;
    var all = Array.prototype.filter.call(root.querySelectorAll('.header-menu-nav-item'), function (r) { return r.querySelector('a[data-folder-id]'); }), rPre = preOrder(all), fRow = null, lRow = null;
    if (!rPre) return;
    var rowList = rPre.parentNode, rows = Array.prototype.filter.call(rowList.children, function (r) { return r.classList.contains('header-menu-nav-item') && !r.classList.contains('header-menu-controls'); });
    rows.forEach(function (r) {
      if (r === rPre) return;
      if (r.querySelector('a[data-folder-id]')) { if (!fRow) fRow = r; } else if (r.querySelector('a') && (!lRow || (!lRow.querySelector('.header-menu-nav-item-content') && r.querySelector('.header-menu-nav-item-content')))) lRow = r;
    });
    var panelOf = function (row) { var a = row && row.querySelector('a[data-folder-id]'); return a && document.querySelector('.header-menu-nav [data-folder="' + a.getAttribute('data-folder-id') + '"]'); };
    var fPanel = panelOf(fRow), oPanel = panelOf(rPre), pTpl = oPanel && oPanel.querySelector('.header-menu-nav-item:not(.header-menu-controls)');
    if (!rPre || !fRow || !lRow || !fPanel || !pTpl) return;
    root.setAttribute('data-ma-menu', '1');
    fRow = fRow.cloneNode(true); lRow = lRow.cloneNode(true); fPanel = fPanel.cloneNode(true); pTpl = pTpl.cloneNode(true);
    var pFill = function (panel, set) {
      Array.prototype.forEach.call(panel.querySelectorAll('.header-menu-nav-item:not(.header-menu-controls)'), function (x) { x.parentNode.removeChild(x); });
      var ctl = panel.querySelector('.header-menu-controls'), host = ctl ? ctl.parentNode : (panel.querySelector('.header-menu-nav-folder-content') || panel);
      set.forEach(function (r) { var x = pTpl.cloneNode(true); x.classList.remove('header-menu-nav-item--active'); setLink(x.querySelector('a'), r[1], r[0], '.header-menu-nav-item-content'); host.appendChild(x); });
    };
    rows.forEach(function (r) { if (r !== rPre) rowList.removeChild(r); });
    Array.prototype.forEach.call(root.querySelectorAll('[data-folder]'), function (p) { if (p !== oPanel) p.parentNode.removeChild(p); });
    MENU.forEach(function (m) {
      var r;
      if (m[2]) {
        r = fRow.cloneNode(true);
        var a = r.querySelector('a'); a.setAttribute('data-folder-id', m[1]); a.setAttribute('href', m[1]);
        (r.querySelector('.header-nav-folder-title-text') || a).textContent = m[0];
        var p = fPanel.cloneNode(true); p.setAttribute('data-folder', m[1]); pFill(p, m[2]);
        oPanel.parentNode.insertBefore(p, oPanel);
      } else { r = lRow.cloneNode(true); setLink(r.querySelector('a'), m[1], m[0], '.header-menu-nav-item-content'); }
      r.classList.remove('header-menu-nav-item--active'); r.style.display = '';
      rowList.insertBefore(r, rPre);
    });
    (rPre.querySelector('.header-nav-folder-title-text') || rPre.querySelector('a')).textContent = ORDER_TEXT;
    pFill(oPanel, RETAIL);
  }
  // The green menu copied into the hunt-type pages becomes the same menu: desktop row and phone menu.
  function newHunt() {
    var caret = '<svg class="mn-caret" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M3 7l8 8 8-8"></path></svg>';
    var mk = function (href, text, cls) { var a = document.createElement('a'); if (cls) a.className = cls; setLink(a, href, text.toUpperCase()); return a; };
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      var links = nav.querySelector('.mn-links');
      if (!links || nav.getAttribute('data-ma-menu')) return;
      nav.setAttribute('data-ma-menu', '1'); nav.setAttribute('data-fit', '1'); navCss(); menuCss();
      var cta = nav.querySelector('.mn-drop-cta'), ctaIn = cta && links.contains(cta);
      while (links.firstChild) links.removeChild(links.firstChild);
      MENU.forEach(function (m) {
        if (!m[2]) { links.appendChild(mk(m[1], m[0], 'mn-link')); return; }
        var d = document.createElement('div'); d.className = 'mn-drop';
        d.innerHTML = '<a href="javascript:void(0)" class="mn-link" aria-haspopup="true"></a><div class="mn-dd"><div class="mn-dd-in"></div></div>';
        d.firstChild.textContent = m[0].toUpperCase(); d.firstChild.insertAdjacentHTML('beforeend', caret);
        m[2].forEach(function (r) { d.querySelector('.mn-dd-in').appendChild(mk(r[1], r[0])); });
        boxDrop(d, m[0].toUpperCase());
        links.appendChild(d);
      });
      if (!cta) return;
      var inn = cta.querySelector('.mn-dd-in'), top = cta.querySelector('.mn-link');
      if (top) top.href = ORDER_URL;
      if (inn) { inn.innerHTML = ''; RETAIL.forEach(function (r) { inn.appendChild(mk(r[1], r[0])); }); boxDrop(cta, ORDER_TEXT.toUpperCase()); }
      if (ctaIn) links.appendChild(cta);
    });
    var ov = document.getElementById('hunt-nav-ov');
    if (!ov || ov.getAttribute('data-ma-menu')) return;
    ov.setAttribute('data-ma-menu', '1');
    var keep = [ov.querySelector('.mn-x'), ov.querySelector('.mn-ovlogo')];
    var group = function (title, set) {
      var g = document.createElement('div'); g.className = 'mn-ovgroup';
      g.appendChild(document.createElement('span')).textContent = title.toUpperCase();
      set.forEach(function (r) { g.appendChild(mk(r[1], r[0])); });
      return g;
    };
    while (ov.firstChild) ov.removeChild(ov.firstChild);
    keep.forEach(function (el) { if (el) ov.appendChild(el); });
    MENU.forEach(function (m) { ov.appendChild(m[2] ? group(m[0], m[2]) : mk(m[1], m[0])); });
    ov.appendChild(group(ORDER_TEXT, RETAIL));
  }
  // The home page's green button under "A race to find them all" (a Squarespace button) now sells the book.
  function homeOrder() {
    Array.prototype.forEach.call(document.querySelectorAll('a.sqs-block-button-element[href$="/the-hunt"]'), function (a) {
      var caps = a.textContent.trim() === a.textContent.trim().toUpperCase();
      a.href = ORDER_URL; a.textContent = caps ? ORDER_TEXT.toUpperCase() : ORDER_TEXT;
    });
  }

  // The footer carries every important link (Maurice, 2026-11-11), in one centered footer (his note, same day):
  // the book and where to buy it (with the floating book), and the Trench. Explore and Follow came out on his third note.
  // The site's own heading stays on top; under it sit the home page's icon row, the two lists in boxes, and one small row
  // with the policy links and Cookie Preferences. The site's second footer row and the cookie bar are folded in.
  var FOOT = [
    ['The Book', [RETAIL[6], RETAIL[0], RETAIL[1], RETAIL[2], RETAIL[3], RETAIL[5]]],
    ['The Trench', [['Home', SITE + '/'], ['Join Trench!', DISCORD], ['Market', MERCH_URL], ['Newsletter', SITE + '/newsletter'], ['Press Room', SITE + '/press-kit'], ['Links', SITE + '/links']]]
  ];
  // The footer icon row is the home page's icon row (his note 11/11): label, link, width, then an SVG path (p) or an image file (i).
  var FOOT_ICONS = [
    ['TikTok', 'https://www.tiktok.com/@mauriceafrich', 26, 'p', 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z'],
    ['Instagram', 'https://www.instagram.com/mauriceafrich', 26, 'p', 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z'],
    ['YouTube', 'https://www.youtube.com/@africhmaurice', 29, 'p', 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z'],
    ['Facebook', 'https://www.facebook.com/profile.php?id=61573491875476', 26, 'p', 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z'],
    ['Amazon', 'https://www.amazon.com/Cellos-Gate-Sky-Pirates-Imperia/dp/1668242834/ref=sr_1_1?crid=279A8MV3ZYP0T&dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&dib_tag=se&keywords=cellos+gate&qid=1770340593&sprefix=cellos%27+gate%2Caps%2C179&sr=8-1&ascsubtag=srctok-e98445806c42f65a&btn_type=pt&btn_ref=srctok-e98445806c42f65a', 29, 'i', 'assets/foot/amazon.webp'],
    ['Audible', 'https://www.amazon.com/Audible-Cellos-Gate/dp/B0GKZWW416/ref=tmm_aud_swatch_0?_encoding=UTF8&dib_tag=se&dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwGwPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&qid=1770340593&sr=8-1', 29, 'i', 'assets/foot/audible.webp'],
    ['Walmart', 'https://www.walmart.com/ip/Cello-s-Gate-Walmart-Exclusive-Hardcover-9781668266922/20417514704?classType=REGULAR&from=/search', 29, 'i', 'assets/foot/walmart.webp'],
    ['Trench Discord', 'https://discord.gg/d36Xnj4umU', 33, 'i', 'assets/img/7bf9c98ba157d33f.webp'],
    ['All my links', 'https://www.mauriceafrich.com/links', 30, 'i', 'assets/foot/comet.webp']
  ];
  function footLinks() {
    var foot = document.getElementById('footer-sections');
    if (!foot || document.getElementById('ma-foot')) return;
    if (!document.getElementById('ma-foot-css')) {
      var st = document.createElement('style'); st.id = 'ma-foot-css';
      st.textContent = '#footer-sections{background:#0b170f}#ma-ck-bar{display:none!important}' +
        '#ma-foot{background:#0b170f;padding:16px 24px 40px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:32px;text-align:center}' +
        '#ma-foot *{box-sizing:border-box}' +
        '#ma-foot .ma-foot-social{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;width:100%}' +
        '#ma-foot .ma-foot-social a{display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;opacity:.85;transition:transform .2s ease,opacity .2s}' +
        '#ma-foot .ma-foot-social a:hover,#ma-foot .ma-foot-social a:focus-visible{opacity:1;transform:scale(1.18)}' +
        '#ma-foot .ma-foot-social svg,#ma-foot .ma-foot-social img{display:block;height:auto;fill:#fff}' +
        '#ma-foot .ma-foot-in{width:100%;max-width:860px;display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:20px}' +
        '#ma-foot .ma-foot-col{display:flex;flex-direction:column;align-items:center;gap:16px;min-width:0;padding:28px 24px;border:2px solid #fff;border-radius:0}' +
        '#ma-foot .ma-foot-body{flex:1;display:flex;align-items:center;justify-content:center;gap:32px;width:100%}' +
        '#ma-foot .ma-foot-list{display:flex;flex-direction:column;align-items:center;gap:12px;min-width:0}' +
        '#ma-foot .ma-foot-book{flex:none;display:block;width:150px;padding:12px 0;animation:ma-foot-float 3.6s ease-in-out infinite alternate}' +
        '#ma-foot .ma-foot-book img{display:block;width:100%;height:auto;filter:drop-shadow(0 14px 14px rgba(0,0,0,.6))}' +
        '@keyframes ma-foot-float{from{transform:translateY(6px)}to{transform:translateY(-6px)}}' +
        '@media (prefers-reduced-motion:reduce){#ma-foot .ma-foot-book{animation:none}}' +
        '#ma-foot h3{font-family:\'CI Face\',\'Cracked Imperia\',\'Almarai\',sans-serif;font-weight:400;font-size:22px;line-height:1.2;letter-spacing:.03em;text-transform:uppercase;text-align:center;color:#a2f590;margin:0;padding:0 0 12px;border-bottom:2px solid rgba(243,234,217,.3);align-self:stretch}' +
        '#ma-foot a{font-family:\'Almarai\',sans-serif;font-weight:700;font-size:15px;line-height:1.35;color:#f3ead9;text-decoration:none;border-radius:0;padding:2px 0;overflow-wrap:anywhere}' +
        '#ma-foot a:hover,#ma-foot a:focus-visible{color:#a2f590;text-decoration:underline;text-underline-offset:4px}' +
        '#ma-foot .ma-foot-legal{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 32px;width:100%}' +
        '#ma-foot .ma-foot-legal a{font-weight:800;font-size:12px;line-height:1.5;letter-spacing:.16em;text-transform:uppercase;padding:6px 0}' +
        '@media (max-width:760px){#ma-foot{padding:12px 20px 32px;gap:28px}#ma-foot .ma-foot-social{max-width:268px}#ma-foot .ma-foot-in{grid-template-columns:minmax(0,1fr);gap:16px}#ma-foot .ma-foot-col{padding:24px 20px}#ma-foot .ma-foot-body{flex-direction:column;gap:20px}#ma-foot .ma-foot-book{width:140px}#ma-foot h3{font-size:19px}#ma-foot .ma-foot-list a{padding:4px 0}}';
      document.head.appendChild(st);
    }
    var nav = document.createElement('nav'); nav.id = 'ma-foot'; nav.setAttribute('aria-label', 'Footer links');
    // The site's second row (policy links around three social icons) is rebuilt here and hidden.
    var rows = foot.querySelectorAll(':scope > section'), old = null, top = null;
    Array.prototype.forEach.call(rows, function (r) { if (r.querySelector('a[href$="/privacy-policy"]')) old = r; else if (!top) top = r; });
    if (old) old.style.display = 'none';
    var soc = nav.appendChild(document.createElement('div')); soc.className = 'ma-foot-social';
    FOOT_ICONS.forEach(function (r) {
      var a = soc.appendChild(document.createElement('a')); setLink(a, r[1], '');
      a.setAttribute('aria-label', r[0]); a.title = r[0];
      a.innerHTML = r[3] === 'p' ? '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:' + r[2] + 'px"><path d="' + r[4] + '"></path></svg>'
        : '<img loading="lazy" decoding="async" alt="" src="' + BASE + r[4] + '" style="width:' + r[2] + 'px">';
    });
    var inn = nav.appendChild(document.createElement('div')); inn.className = 'ma-foot-in';
    FOOT.forEach(function (g, i) {
      var col = inn.appendChild(document.createElement('div')); col.className = 'ma-foot-col';
      col.appendChild(document.createElement('h3')).textContent = g[0];
      var body = col.appendChild(document.createElement('div')); body.className = 'ma-foot-body';
      if (!i) {
        // the floating book sits beside the retailers and goes to the Order page
        var bk = body.appendChild(document.createElement('a')); setLink(bk, ORDER_URL, ''); bk.className = 'ma-foot-book'; bk.setAttribute('aria-label', ORDER_TEXT);
        bk.innerHTML = '<img loading="lazy" decoding="async" alt="" src="' + BASE + 'assets/img/cellos-gate-book.webp">';
      }
      var list = body.appendChild(document.createElement('div')); list.className = 'ma-foot-list';
      g[1].forEach(function (r) { setLink(list.appendChild(document.createElement('a')), r[1], r[0]); });
    });
    var legal = nav.appendChild(document.createElement('div')); legal.className = 'ma-foot-legal';
    setLink(legal.appendChild(document.createElement('a')), SITE + '/privacy-policy', 'Privacy Policy');
    // Official Rules left the footer on every page; it's only at the bottom of The Hunt now (Maurice, 2026-11-12)
    // cookies.js opens the preferences from any link to #cookie-preferences
    var ck = legal.appendChild(document.createElement('a')); ck.href = '#cookie-preferences'; ck.setAttribute('role', 'button'); ck.textContent = 'Cookie Preferences';
    if (top) foot.insertBefore(nav, top.nextSibling); else foot.insertBefore(nav, foot.firstChild);
  }

  // Every main-menu dropdown opens centered under the link that opens it (Maurice, 2026-10-05), then is nudged
  // back inside the screen (16px clear of each edge) when it is wider than the room around its link, like the big
  // Treasure Hunt panel on a narrower screen.
  function centerDropdowns() {
    Array.prototype.forEach.call(document.querySelectorAll('#header .header-display-desktop .header-nav-item--folder'), function (item) {
      if (item.__maCentered) return;
      var title = item.querySelector('.header-nav-folder-title'), box = item.querySelector('.header-nav-folder-content');
      if (!title || !box) return;
      item.__maCentered = true;
      var place = function () {
        box.style.transform = '';
        requestAnimationFrame(function () {
          var t = title.getBoundingClientRect(), r = box.getBoundingClientRect(), vw = document.documentElement.clientWidth;
          if (!r.width) return;
          var shift = (t.left + t.width / 2) - (r.left + r.width / 2);
          if (r.left + shift + r.width > vw - 16) shift -= r.left + shift + r.width - (vw - 16);
          if (r.left + shift < 16) shift += 16 - (r.left + shift);
          if (Math.abs(shift) >= 1) box.style.transform = 'translateX(' + Math.round(shift) + 'px)';
        });
      };
      item.addEventListener('mouseenter', place); item.addEventListener('focusin', place);
    });
  }

  // Menu words never spill out of their buttons (Maurice, 2026-10-07): a link or button whose words are wider than
  // its box shrinks its type until they fit. Checked whenever a menu opens (they have no size while hidden).
  var FIT_MENU = '#header .header-nav-folder-content a, #header .header-menu .ma-ovgroup a, #hunt-nav .mn-dd-in a, #hunt-nav .mn-cta, #hunt-nav-ov a';
  function fitMenuText() {
    Array.prototype.forEach.call(document.querySelectorAll(FIT_MENU), function (a) {
      if (!a.offsetWidth || getComputedStyle(a).display === 'inline') return;
      a.style.removeProperty('font-size'); a.style.removeProperty('white-space');
      // measure the words themselves against the room inside the padding (scrollWidth misses words running into the padding)
      var cs = getComputedStyle(a), size = parseFloat(cs.fontSize), n = 0, range = document.createRange();
      var wide = function () { range.selectNodeContents(a); return range.getBoundingClientRect().width > a.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) + 0.5; };
      while (wide() && size > 9 && n++ < 40) { size -= 0.5; a.style.setProperty('font-size', size + 'px', 'important'); }
      // a browser with a large minimum font size won't shrink the words, so they wrap onto two lines instead
      if (wide()) { a.style.removeProperty('font-size'); a.style.setProperty('white-space', 'normal', 'important'); }
    });
  }
  var fitQueued = false;
  function queueFit() { if (fitQueued) return; fitQueued = true; requestAnimationFrame(function () { requestAnimationFrame(function () { fitQueued = false; fitMenuText(); }); }); }
  function menuFit() {
    if (window.__maMenuFit) return; window.__maMenuFit = true;
    ['mouseover', 'focusin', 'click', 'touchend'].forEach(function (ev) { document.addEventListener(ev, function (e) {
      if (e.target && e.target.closest && e.target.closest('#header, #hunt-nav, #hunt-nav-ov, .mn-burger')) { queueFit(); setTimeout(queueFit, 350); }
    }, true); });
    addEventListener('resize', queueFit);
  }

  // Box headings in the menus (Earn Points, Current Progress, Adventure, Oracle's Gift) aren't links, so a line
  // under each one sets it apart from the links below it (Maurice, 2026-10-10). Desktop panels and phone menus.
  function headRule() {
    if (document.getElementById('ma-head-rule')) return;
    var st = document.createElement('style'); st.id = 'ma-head-rule';
    st.textContent = ['#header .ma-grp>span:first-child', '#hunt-nav .ma-grp>span:first-child', '#header .header-menu .ma-ovgroup>span:first-child', '#hunt-nav-ov .mn-ovgroup>span:first-child']
      .join(',') + '{align-self:stretch!important;display:block!important;text-align:center!important;border-bottom:2px solid rgba(243,234,217,.45)!important;padding-bottom:5px!important;margin-bottom:10px!important;line-height:1.3!important}';
    (document.head || document.documentElement).appendChild(st);
  }

  // One gap between the menu and the first thing on every page (Maurice, 2026-11-11): the first words or picture
  // start the same distance under the menu everywhere. The home slider and the games stay as they are.
  var GAP_SKIP = '#header,#hunt-nav,#hunt-nav-ov,#ma-loading,#sb-note,footer,script,style,noscript,template,.section-background,[hidden],[aria-hidden="true"]';
  function gapSeen(e, root) {
    for (var a = e; a && a !== root; a = a.parentElement) {
      var c = getComputedStyle(a);
      if (c.display === 'none' || c.visibility === 'hidden' || c.position === 'fixed' || (c.opacity === '0' && !a.classList.contains('ma-rv'))) return false;
    }
    return true;
  }
  function gapNow() {
    var mb = 0, root = document.querySelector('#sections') || document.querySelector('#page');
    if (!root) return null;
    ['#header', '#hunt-nav'].forEach(function (s) {
      var e = document.querySelector(s); if (!e) return;
      var c = getComputedStyle(e), r = e.getBoundingClientRect();
      if (c.display !== 'none' && c.visibility !== 'hidden' && r.height && r.top < 40) mb = Math.max(mb, r.bottom);
    });
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT), n, best = null, seen = 0;
    while ((n = tw.nextNode()) && seen < 25) {
      var el = n.nodeType === 3 ? n.parentElement : n, r;
      if (n.nodeType === 3) {
        if (n.nodeValue.trim().length < 2) continue;
        var rg = document.createRange(); rg.selectNodeContents(n); r = rg.getBoundingClientRect();
      } else {
        if (!/^(IMG|IFRAME|VIDEO|CANVAS|INPUT|BUTTON|SELECT|TEXTAREA)$/.test(n.tagName)) continue;
        r = n.getBoundingClientRect(); if (r.height < 24 || r.width < 24) continue;
      }
      if (!r.height || !r.width || !el || el.closest(GAP_SKIP) || !gapSeen(el, root)) continue;
      seen++;
      // things waiting to rise into view sit 28px low until they do
      var top = r.top + window.scrollY;
      for (var a = el; a && a !== root; a = a.parentElement) if (a.classList.contains('ma-rv') && !a.classList.contains('ma-in')) { top -= 28; break; }
      if (!best || top < best.top) best = { top: top, el: el };
    }
    if (!best) return null;
    // a framed board ([data-ma-flush]) sits right under the menu; the board inside keeps the gap to its own first words
    var fl = best.el.closest('[data-ma-flush]');
    if (fl) return { el: fl, gap: fl.getBoundingClientRect().top + window.scrollY - mb, root: root, flush: true };
    return { el: best.el, gap: best.top - mb, root: root };
  }
  function gapSet(e, prop, px) { e.style.setProperty(prop, Math.round(px * 10) / 10 + 'px', 'important'); }
  function gapShift(m, d) {
    var chain = [], a;
    for (a = m.el; a && a !== m.root; a = a.parentElement) chain.unshift(a);
    if (d > 0) {
      // more room: the page's own outer box grows at the top, so its background grows with it
      var mount = m.el.closest('[data-ma-page]'), box = mount ? chain[chain.indexOf(mount) + 1] || mount : chain[0];
      // on the first section inside it, so that section's art reaches the top too (a pad on the outer box showed as a
      // dark line above the art; Maurice, 2026-11-13: 'do you see that line at the top of the page? can we remove that for ALL pages?')
      Array.prototype.some.call(box.children, function (c) { if (c.contains(m.el) && c !== m.el) { box = c; return true; } });
      // padding the page builder put above the page (room for the menu) moves inside it as well, so it's art, not a dark band
      if (mount) chain.slice(0, chain.indexOf(mount)).forEach(function (e) { var v = parseFloat(getComputedStyle(e).paddingTop) || 0; if (v > 0.5) { gapSet(e, 'padding-top', 0); d += v; } });
      return gapSet(box, 'padding-top', parseFloat(getComputedStyle(box).paddingTop) + d);
    }
    var need = -d;
    ['padding-top', 'margin-top'].forEach(function (prop) {
      chain.forEach(function (e) {
        var v = parseFloat(getComputedStyle(e).getPropertyValue(prop)) || 0, take = Math.min(v, need);
        if (take > 0.5) { gapSet(e, prop, v - take); need -= take; }
      });
    });
    // space that is not padding (empty layout rows): the block itself moves up
    if (need > 1) {
      var blk = m.el.closest('.fe-block') || chain[0];
      gapSet(blk, 'margin-top', (parseFloat(getComputedStyle(blk).marginTop) || 0) - need);
    }
  }
  function topGap() {
    if (!document.body || pending || window.scrollY > 4 || location.pathname === '/' || /^\/home\b/.test(location.pathname)) return;
    if (gamePage() || document.querySelector('#hg-page,[data-ma-keep-top]')) return;
    var want = Math.round(Math.max(40, Math.min(88, window.innerWidth * .06)));
    for (var pass = 0; pass < 6; pass++) {
      var m = gapNow(); if (!m) return;
      var d = (m.flush ? 0 : want) - m.gap;
      if (Math.abs(d) < 1.5) break;
      // a framed board that starts behind the menu comes down by padding on its section, which stays hidden behind the menu
      // (inside the page, on its first piece, so that piece's art fills the space and no dark line shows above it)
      if (m.flush && d > 0) {
        var sec = m.el.closest('section') || m.el.parentElement, mnt = m.el.closest('[data-ma-page]');
        if (mnt) Array.prototype.some.call(mnt.children, function (c) { if (c.contains(m.el) && c !== m.el) { sec = c; return true; } });
        gapSet(sec, 'padding-top', parseFloat(getComputedStyle(sec).paddingTop) + d); continue;
      }
      gapShift(m, d);
    }
    gapWatch(m);
  }
  // the page builder writes its own top padding on the first section whenever it likes; set the gap again when it does
  var gapT, gapMO;
  function gapWatch(m) {
    var sec = m && m.el.closest('section.page-section') || m && m.el.closest('section');
    if (!sec || sec.__maGap || !window.MutationObserver) return;
    sec.__maGap = 1;
    gapMO = gapMO || new MutationObserver(function () { clearTimeout(gapT); gapT = setTimeout(topGap, 250); });
    gapMO.observe(sec, { attributes: true, attributeFilter: ['style'] });
    var cw = sec.querySelector('.content-wrapper');
    if (cw) gapMO.observe(cw, { attributes: true, attributeFilter: ['style'] });
  }
  window.addEventListener('load', function () { topGap(); setTimeout(topGap, 1500); });
  // after a resize the page builder sets its own top padding again, so the gap is set once more when that has settled
  window.addEventListener('resize', function () { clearTimeout(gapT); gapT = setTimeout(function () { topGap(); setTimeout(topGap, 900); }, 200); });

  // Phones (Maurice, 2026-11-13: 'add padding'): the page builder's phone layout stacks blocks with no space between them
  // and runs text close to the screen edges. Text gets more room at the sides, and any block that starts less than 12px
  // under the one above it (a heading sitting on a button) is moved down to leave 12px; the section grows to match.
  (function () { var st = document.createElement('style'); st.textContent = '@media (max-width:767px){#page .fe-block .sqs-html-content{padding-left:8px;padding-right:8px;box-sizing:border-box}' +
    // a row of social icons goes on two lines, five over four, like the footer (Maurice, 2026-11-13)
    'html body #page .sqs-svg-icon--list[class]{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:22px 28px!important;max-width:calc(5 * 36px + 4 * 28px)!important;margin-left:auto!important;margin-right:auto!important}html body #page .sqs-svg-icon--list[class]>*{margin:0!important;width:36px!important;height:36px!important;flex:none!important}}'; (document.head || document.documentElement).appendChild(st); })();
  function phoneGaps() {
    if (window.innerWidth > 767 || !document.body) return;
    Array.prototype.forEach.call(document.querySelectorAll('#page .fluid-engine'), function (fe) {
      if (fe.querySelector('[data-ma-page]') && fe.children.length < 3) return;
      var bs = Array.prototype.filter.call(fe.children, function (b) { return b.classList.contains('fe-block'); });
      bs.forEach(function (b) { if (b.__maGap) { b.style.marginTop = ''; b.__maGap = 0; } });
      if (fe.__maPad) { fe.style.paddingBottom = ''; fe.__maPad = 0; }
      var maxB = function () { var m = -1e9; bs.forEach(function (b) { var br = b.getBoundingClientRect(); if (br.height) m = Math.max(m, br.bottom); }); return m; }, fb0 = maxB();
      var items = bs.map(function (b) { return { b: b, r: b.getBoundingClientRect() }; }).filter(function (o) { return o.r.height > 0 && o.r.width > 0; });
      items.sort(function (x, y) { return x.r.top - y.r.top; });
      var done = [];
      items.forEach(function (o) {
        var r = o.b.getBoundingClientRect(), above = -1e9;
        done.forEach(function (q) { var qr = q.getBoundingClientRect(), ov = Math.min(qr.right, r.right) - Math.max(qr.left, r.left);
          if (ov > Math.min(qr.width, r.width) * 0.5 && qr.top < r.top - 2) above = Math.max(above, qr.bottom); });
        var gap = r.top - above;
        if (above > -1e9 && gap > -4 && gap < 12) { o.b.style.marginTop = (12 - gap) + 'px'; o.b.__maGap = 1; }
        done.push(o.b);
      });
      var grow = maxB() - fb0;   // only what the moves added
      if (grow > 1) { fe.style.paddingBottom = Math.ceil(grow) + 'px'; fe.__maPad = 1; }
    });
  }
  var pgT = 0; window.addEventListener('resize', function () { clearTimeout(pgT); pgT = setTimeout(phoneGaps, 400); });
  window.addEventListener('load', function () { setTimeout(phoneGaps, 600); setTimeout(phoneGaps, 2500); });
  function scan() {
    headRule();
    huntGift();
    newMain();
    homeOrder();
    footLinks();
    fixedBackgrounds();
    nativeReveal();
    centerDropdowns();
    menuFit();
    Array.prototype.forEach.call(document.querySelectorAll('[data-ma-page]'), mount);
  }
  window.__maLoader = scan;
  if (document.body) fixedBackgrounds();
  // Sections below the first code block aren't parsed yet when this runs near the top of the page.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', fixedBackgrounds);
  Array.prototype.forEach.call(document.querySelectorAll('[data-ma-page]'), mount);
})();
