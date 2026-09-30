/* Maurice Africh site loader.
   Each Squarespace Code Block holds only:
     <div data-ma-page="the-hunt"></div>
     <script src="https://africhmaurice.github.io/site/loader.js"></script>
   This script fetches pages/<slug>.html from GitHub Pages, drops it in, and runs its scripts in order.
   Published edits show up as soon as GitHub Pages has them (each fetch checks for a newer copy).
   Loaded once site-wide from Code Injection (in <head>), it also shows the crest loading screen.
   Every copy after the first only mounts blocks it finds, so a page can include it any number of times. */
(function () {
  if (window.__maLoader) { window.__maLoader(); return; }
  var me = document.currentScript;
  var inHead = !!(me && me.parentNode && me.parentNode.nodeName === 'HEAD');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending = 0;
  // Runs fn once the loading screen has started fading (right away if there isn't one), so animations
  // near the top of a page play where people can see them instead of underneath the crest.
  window.maAfterLoading = function (fn) {
    (function wait() { var ov = document.getElementById('ma-loading'); if (ov && !ov.classList.contains('ma-done')) setTimeout(wait, 80); else fn(); })();
  };
  var BASE = me ? me.src.replace(/loader\.js.*$/, '') : 'https://africhmaurice.github.io/site/';
  // Pages are fetched with cache: 'no-cache': the browser keeps its copy and only asks GitHub Pages whether it
  // changed (a tiny 304 answer when it has not), so a visit re-downloads a page only after a publish.
  var FRESH = { cache: 'no-cache' };

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

  function mount(el) {
    if (el.getAttribute('data-ma-state')) return;
    el.setAttribute('data-ma-state', 'loading');
    var slug = el.getAttribute('data-ma-page');
    pending++;
    fetch(BASE + 'pages/' + slug + '.html', FRESH)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        el.innerHTML = html;
        return runScripts(el);
      })
      .then(function () {
        el.setAttribute('data-ma-state', 'ready');
        pending--; reveal(el); fitNavs();
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
    if (still || gamePage() || !('IntersectionObserver' in window)) return;
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
    // Only things on the page right now: hidden panels, slider slides and embeds are left alone, so nothing
    // can be stuck invisible (they may never "scroll into view" the way the observer sees it).
    var SKIP = '#hunt-nav,#hunt-nav-ov,#ma-loading,nav,header,footer,.ma-rv,[data-ma-page="home-slider"],.instagram-media,[aria-hidden="true"],[class*="slide"],[class*="carousel"],[class*="swiper"],[class*="gallery"]';
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
    }
    // Done when the page and its custom sections have loaded, but shown for at least 0.8s so the fill reads;
    // never longer than 8s, whatever is still loading.
    function check() { if (document.readyState === 'complete' && pending <= 0) setTimeout(finish, Math.max(0, 800 - (Date.now() - t0))); else setTimeout(check, 100); }
    check(); setTimeout(finish, 8000);
  }
  if (inHead || /[?&]ma-loading/.test(location.search)) loadingScreen();

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
      if (/squarespace-cdn\.com/.test(src) && src.indexOf('format=') < 0) src += (src.indexOf('?') < 0 ? '?' : '&') + 'format=2500w';
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
  // The hunt menu (#hunt-nav, in every hunt page) on a screen too narrow for the whole row: Tasks, Riddles,
  // Clues, Games and Contests fold into one EARN POINTS dropdown (Maurice, 2026-09-27). It measures whether the
  // row really fits, so a browser's larger minimum font size counts too. If even that doesn't fit, the phone
  // menu button takes over. Phones and tablets already get the phone menu from each page's own styles.
  var EARN = /\/the-hunt#tasks$|\/the-hunt#riddles$|\/lootbox-clue$|\/games$|\/contests$/;
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
      '#hunt-nav.mn-compact .mn-links{gap:clamp(10px,1vw,18px)}#hunt-nav.mn-compact .mn-right{gap:clamp(12px,1.4vw,24px)}#hunt-nav.mn-compact .mn-row{gap:16px}' +
      '#hunt-nav.mn-burgered .mn-row{display:none!important}#hunt-nav.mn-burgered .mn-burger{display:flex!important}';
    document.head.appendChild(st);
  }
  function navSetup(nav) {
    if (nav.getAttribute('data-fit')) return;
    var links = nav.querySelector('.mn-links'); if (!links) return;
    var eps = Array.prototype.filter.call(links.children, function (a) { return a.tagName === 'A' && EARN.test(a.href); });
    if (eps.length < 2) return;
    nav.setAttribute('data-fit', '1'); navCss();
    eps.forEach(function (a) { a.classList.add('mn-ep'); });
    var caret = nav.querySelector('.mn-caret');
    var d = document.createElement('div'); d.className = 'mn-drop mn-earn';
    d.innerHTML = '<a href="javascript:void(0)" class="mn-link" aria-haspopup="true">EARN POINTS' + (caret ? caret.outerHTML : '') + '</a><div class="mn-dd"><div class="mn-dd-in"></div></div>';
    var list = d.querySelector('.mn-dd-in');
    eps.forEach(function (a) { var c = document.createElement('a'); c.href = a.href; c.textContent = a.textContent; list.appendChild(c); });
    links.insertBefore(d, eps[0]);
  }
  function navFits(nav) {
    var row = nav.querySelector('.mn-row'); if (!row) return true;
    var last = nav.querySelector('.mn-drop-cta') || row.lastElementChild;
    return row.scrollWidth <= row.clientWidth + 1 && (!last || last.getBoundingClientRect().right <= Math.min(row.getBoundingClientRect().right, window.innerWidth) + 1);
  }
  // The hunt menu's dropdowns get the phone menu's look (Maurice, 2026-09-27): one box per dropdown with a small
  // green heading, links centered under it, the profile as a red button. The pre-order list stays as it is.
  function boxDrops(nav) {
    if (nav.getAttribute('data-boxed')) return;
    var drops = nav.querySelectorAll('.mn-links .mn-drop:not(.mn-drop-cta)');
    if (!drops.length) return;
    nav.setAttribute('data-boxed', '1');
    if (!document.getElementById('ma-nav-box')) {
      var st = document.createElement('style'); st.id = 'ma-nav-box';
      st.textContent = '#hunt-nav .mn-dd-in.ma-boxed{padding:12px}' +
        '#hunt-nav .ma-grp{display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid rgba(243,234,217,.3);padding:12px 14px 10px}' +
        '#hunt-nav .ma-grp>span{font-family:\'Almarai\',sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590;text-transform:uppercase;margin-bottom:4px;white-space:nowrap}' +
        '#hunt-nav .ma-grp a{text-align:center;padding:8px 14px!important}' +
        '#hunt-nav .ma-grp a.mn-profile{justify-content:center;border:1.5px solid #f3ead9;margin:4px 0;padding:9px 16px!important}#hunt-nav .ma-grp a.mn-profile svg{display:none}';
      document.head.appendChild(st);
    }
    Array.prototype.forEach.call(drops, function (d) {
      var inner = d.querySelector('.mn-dd-in'), head = d.querySelector('.mn-link');
      if (!inner || !head || inner.querySelector('.ma-grp')) return;
      var g = document.createElement('div'); g.className = 'ma-grp';
      var h = document.createElement('span'); h.textContent = (head.textContent || '').replace(/\s+/g, ' ').trim(); g.appendChild(h);
      while (inner.firstChild) g.appendChild(inner.firstChild);
      inner.appendChild(g); inner.classList.add('ma-boxed');
    });
  }
  function fitNavs() {
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      navSetup(nav);
      boxDrops(nav);
      if (!nav.getAttribute('data-fit')) return;
      nav.classList.remove('mn-compact', 'mn-burgered');
      var row = nav.querySelector('.mn-row');
      if (!row || getComputedStyle(row).display === 'none') return;   // the page's own phone menu is showing
      if (navFits(nav)) return;
      nav.classList.add('mn-compact');
      if (!navFits(nav)) nav.classList.add('mn-burgered');
    });
  }
  var fitTimer;
  window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitNavs, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNavs);
  window.maFitNavs = fitNavs;

  // Main site menu: The Treasure Hunt dropdown is the hunt pages' menu, exactly (Maurice, 2026-09-27). It is built
  // from pages/hunt-menu.html each time, so a change to the hunt menu shows up here too. Desktop: the hunt menu's
  // links in the same order and look, and each of its dropdowns (Submit, Current Progress, Adventure) as a flyout
  // to the side. Phone menu: the hunt phone menu's list and boxed groups. Squarespace's own Adventure folder is
  // hidden from the top level (it can't nest folders); its pages are managed there as before.
  var HUNT = '/new-dropdown-1', ADV = '/adventure-menu', huntBuilt = false;
  function huntCss() {
    var st = document.createElement('style');
    var box = 'background:rgba(9,23,7,.95);border:1px solid rgba(243,234,217,.25);min-width:170px;padding:0;';
    st.textContent =
      '#header .header-display-desktop .ma-hunt-dd{' + box + '}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega{display:grid;grid-template-columns:auto auto;gap:16px;padding:16px;align-items:start}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega-links{display:flex;flex-direction:column}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega-groups{display:flex;flex-direction:column;gap:12px}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-grp{display:flex;flex-direction:column;align-items:center;gap:2px;border:1px solid rgba(243,234,217,.3);padding:12px 14px 10px}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-grp>span{font-family:\'Almarai\',sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590;text-transform:uppercase;margin-bottom:4px}' +
      '#header .header-display-desktop .ma-hunt-dd a.ma-hl{display:block!important;margin:0!important;padding:11px 18px!important;color:#fff!important;background:none!important;font-family:\'Almarai\',sans-serif!important;font-weight:700!important;font-size:clamp(12px,.92vw,14.4px)!important;letter-spacing:.07em!important;text-transform:uppercase!important;text-decoration:none!important;white-space:nowrap;line-height:1.2!important;text-align:left!important;box-sizing:border-box}' +
      '#header .header-display-desktop .ma-hunt-dd a.ma-hl:hover{color:#a2f590!important;background:rgba(255,255,255,.06)!important}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-grp a.ma-hl{text-align:center!important;padding:8px 14px!important}' +
      '#header .header-display-desktop .ma-hunt-dd a.ma-hl.mn-vote{color:#a2f590!important}#header .header-display-desktop .ma-hunt-dd a.ma-hl.mn-vote:hover{color:#ff4c0f!important}' +
      '#header .header-display-desktop .ma-hunt-dd a.ma-hl.mn-profile{background:#c1330a!important;border:1.5px solid #f3ead9;margin:4px 0!important;padding:9px 16px!important}#header .header-display-desktop .ma-hunt-dd a.ma-hl.mn-profile:hover{background:#e04a12!important;color:#fff!important}#header .header-display-desktop .ma-hunt-dd a.ma-hl.mn-profile svg{display:none}' +
      '#header .header-display-desktop .ma-hunt-dd{overflow:visible}' +
      // phone menu: the hunt phone menu's boxed groups
      '#header .header-menu .ma-ovgroup{display:flex;flex-direction:column;align-items:center;gap:12px;border:1px solid rgba(243,234,217,.3);padding:14px 16px 16px;margin:10px auto;width:86%;box-sizing:border-box}' +
      '#header .header-menu .ma-ovgroup>span{font-family:\'Almarai\',sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590}' +
      '#header .header-menu .ma-ovgroup a{font-size:15px!important;line-height:1.3!important;text-align:center;padding:0!important;margin:0!important}#header .header-menu .ma-ovgroup a.mn-profile{background:#c1330a;border:1.5px solid #f3ead9;padding:9px 16px!important;white-space:nowrap;font-size:15px!important}' +
      '#header .header-menu .ma-ovgroup a.mn-profile svg{display:none}#header .header-menu a.mn-vote{color:#a2f590!important}';
    document.head.appendChild(st);
  }
  function plainText(a) { return (a.textContent || '').replace(/\s+/g, ' ').trim(); }
  function huntDropdown() {
    if (huntBuilt || !document.getElementById('header')) return;
    var huntList = document.querySelector('#header .header-display-desktop .header-nav-folder-title[data-href="' + HUNT + '"] + .header-nav-folder-content');
    if (!huntList) return;
    huntBuilt = true;
    // the top-level Adventure folder goes (desktop and phone); its pages now sit in The Treasure Hunt
    var adv = document.querySelector('#header .header-display-desktop .header-nav-folder-title[data-href="' + ADV + '"]');
    if (adv) adv.closest('.header-nav-item').style.display = 'none';
    var advRow = document.querySelector('.header-menu-nav [data-folder="root"] a[data-folder-id="' + ADV + '"]');
    if (advRow) advRow.closest('.header-menu-nav-item').style.display = 'none';
    fetch(BASE + 'pages/hunt-menu.html', FRESH).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var src = doc.querySelector('#hunt-nav .mn-links'), ov = doc.getElementById('hunt-nav-ov');
      if (!src) return;
      huntCss();
      // desktop
      var out = document.createDocumentFragment();
      function link(a, extra) {
        var n = document.createElement('a'); n.href = a.getAttribute('href'); n.className = 'ma-hl' + (extra || '');
        ['mn-vote', 'mn-profile'].forEach(function (c) { if (a.classList.contains(c)) n.classList.add(c); });
        if (a.getAttribute('style')) n.setAttribute('style', a.getAttribute('style'));
        if (a.getAttribute('target')) { n.target = a.getAttribute('target'); n.rel = 'noopener'; }
        var svg = a.classList.contains('mn-profile') && a.querySelector('svg');
        if (svg) n.appendChild(document.importNode(svg, true));
        n.appendChild(document.createTextNode(plainText(a)));
        return n;
      }
      // Desktop looks like the phone menu (Maurice, 2026-09-27): the plain links in a column on the left, and the
      // phone menu's boxed groups (small green heading, links under it) in a column on the right.
      var mega = document.createElement('div'); mega.className = 'ma-mega';
      var left = document.createElement('div'); left.className = 'ma-mega-links';
      var right = document.createElement('div'); right.className = 'ma-mega-groups';
      mega.appendChild(left); mega.appendChild(right);
      Array.prototype.forEach.call((ov || src).children, function (el) {
        if (el.matches('.mn-ovlogo,.mn-x,.mn-cta')) return;
        if (el.tagName === 'A') { if (!el.classList.contains('mn-merch')) left.appendChild(link(el)); return; }
        var box = document.createElement('div'); box.className = 'ma-grp';
        if (el.classList.contains('mn-ovgroup')) {
          Array.prototype.forEach.call(el.children, function (c) {
            if (c.tagName === 'A') box.appendChild(link(c));
            else { var h = document.createElement('span'); h.textContent = plainText(c); box.appendChild(h); }
          });
        } else if (el.classList.contains('mn-drop')) {
          var head = el.querySelector('.mn-link'); if (!head) return;
          var h2 = document.createElement('span'); h2.textContent = plainText(head); box.appendChild(h2);
          Array.prototype.forEach.call(el.querySelectorAll('.mn-dd-in a'), function (x) { box.appendChild(link(x)); });
        } else return;
        right.appendChild(box);
      });
      out.appendChild(mega);
      huntList.innerHTML = ''; huntList.classList.add('ma-hunt-dd'); huntList.appendChild(out);
      // phone menu: the hunt phone menu's list, groups boxed and headed as on the hunt pages
      var panel = document.querySelector('.header-menu-nav [data-folder="' + HUNT + '"] .header-menu-nav-folder-content');
      if (!panel || !ov) return;
      Array.prototype.forEach.call(panel.querySelectorAll('.header-menu-nav-item:not(.header-menu-controls)'), function (r) { r.remove(); });
      Array.prototype.forEach.call(ov.children, function (el) {
        if (el.matches('.mn-ovlogo,.mn-x,.mn-cta,.mn-merch') || (el.tagName !== 'A' && !el.classList.contains('mn-ovgroup'))) return;
        var row = document.createElement('div'); row.className = 'container header-menu-nav-item';
        if (el.tagName === 'A') {
          var a = document.createElement('a'); a.href = el.getAttribute('href'); a.tabIndex = -1;
          if (el.classList.contains('mn-vote')) a.className = 'mn-vote';
          a.innerHTML = '<div class="header-menu-nav-item-content"></div>'; a.firstChild.textContent = plainText(el);
          row.appendChild(a);
        } else {
          var g = document.createElement('div'); g.className = 'ma-ovgroup';
          Array.prototype.forEach.call(el.children, function (c) {
            if (c.tagName === 'A') { var l = link(c, ''); l.className = c.classList.contains('mn-profile') ? 'mn-profile' : ''; l.tabIndex = -1; g.appendChild(l); }
            else { var s = document.createElement('span'); s.textContent = plainText(c); g.appendChild(s); }
          });
          row.appendChild(g);
        }
        panel.appendChild(row);
      });
    }).catch(function () {});
  }

  // Main menu: MERCH (the Trench Market shop) sits right before The Treasure Hunt (Maurice, 2026-09-28). It replaces
  // the old Merch folder, whose partner shops are now listed inside the shop itself.
  var MERCH_URL = 'https://shop.mauriceafrich.com/', OLD_MERCH = '/new-dropdown', merchBuilt = false;
  function mainMerch() {
    if (merchBuilt || !document.getElementById('header')) return;
    var lists = document.querySelectorAll('#header .header-nav-list');
    if (!lists.length) return;
    merchBuilt = true;
    Array.prototype.forEach.call(lists, function (list) {
      var hunt = list.querySelector('.header-nav-folder-title[data-href="' + HUNT + '"]');
      var old = list.querySelector('.header-nav-folder-title[data-href="' + OLD_MERCH + '"]');
      var tpl = list.querySelector('.header-nav-item--external') || list.querySelector('.header-nav-item--collection');
      if (old) old.closest('.header-nav-item').style.display = 'none';
      if (!hunt || !tpl) return;
      var item = tpl.cloneNode(true), a = item.querySelector('a');
      a.href = MERCH_URL; a.removeAttribute('target'); a.textContent = 'Merch';
      hunt.closest('.header-nav-item').parentNode.insertBefore(item, hunt.closest('.header-nav-item'));
    });
    var root = document.querySelector('.header-menu-nav [data-folder="root"]');
    if (!root) return;
    var oldRow = root.querySelector('a[data-folder-id="' + OLD_MERCH + '"]');
    if (oldRow) oldRow.closest('.header-menu-nav-item').style.display = 'none';
    var huntRow = root.querySelector('a[data-folder-id="' + HUNT + '"]');
    var tplRow = root.querySelector('.header-menu-nav-item--external');
    if (!huntRow || !tplRow) return;
    var row = tplRow.cloneNode(true), ra = row.querySelector('a');
    ra.href = MERCH_URL; ra.removeAttribute('target'); ra.textContent = 'Merch';
    huntRow.closest('.header-menu-nav-item').parentNode.insertBefore(row, huntRow.closest('.header-menu-nav-item'));
  }

  function scan() {
    mainMerch();
    huntDropdown();
    fixedBackgrounds();
    nativeReveal();
    Array.prototype.forEach.call(document.querySelectorAll('[data-ma-page]'), mount);
  }
  window.__maLoader = scan;
  if (document.body) fixedBackgrounds();
  // Sections below the first code block aren't parsed yet when this runs near the top of the page.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', fixedBackgrounds);
  Array.prototype.forEach.call(document.querySelectorAll('[data-ma-page]'), mount);
})();
