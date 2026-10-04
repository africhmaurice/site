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
  var BASE = me ? me.src.replace(/loader[\w-]*\.js.*$/, '') : 'https://africhmaurice.github.io/site/';
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
  var PIN = '09997f4bbed660a544caba53be5ec8018db9dd5f';
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
        pending--; reveal(el); huntGift(); fitNavs();
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
  // Act menus (Maurice, 2026-10-01): Current Progress adds the Act One and Act Two standings and splits Rewards by
  // act; Earn Points splits Tasks and Riddles & Puzzles by act. Done here so every page's copy of the menu changes at
  // once.
  var ACTMENU = true;   // approved and live (Maurice, 2026-10-01)
  var SITE = 'https://www.mauriceafrich.com';
  function actSub(text, act) { var sp = document.createElement('span'); sp.className = 'ma-sub ma-sub-' + act; sp.textContent = text; return sp; }
  function actLink(href, text) { var a = document.createElement('a'); a.href = href; a.textContent = text; return a; }
  function earnActs(list) {
    list.appendChild(actSub('ACT ONE', 'one'));
    list.appendChild(actLink(SITE + '/the-hunt#act1-tasks', 'TASKS'));
    list.appendChild(actLink(SITE + '/the-hunt#act1-riddles', 'RIDDLES & PUZZLES'));
    list.appendChild(actSub('ACT TWO', 'two'));
    list.appendChild(actLink(SITE + '/the-hunt#tasks', 'TASKS'));
    list.appendChild(actLink(SITE + '/the-hunt#riddles', 'RIDDLES & PUZZLES'));
  }
  function actCss() {
    if (!ACTMENU || document.getElementById('ma-act-menu')) return;
    var st = document.createElement('style'); st.id = 'ma-act-menu';
    var sel = function (x) { return ['#hunt-nav ', '#hunt-nav-ov ', '#header '].map(function (p) { return p + x; }).join(','); };
    st.textContent = sel('span.ma-sub') + '{display:block!important;align-self:stretch;font-family:Almarai,sans-serif!important;font-weight:800!important;font-size:11px!important;letter-spacing:.16em!important;text-transform:uppercase!important;text-align:center!important;color:#fff!important;margin:10px 0 4px!important;padding:4px 10px!important;white-space:nowrap}' +
      sel('span.ma-sub-one') + '{background:#482d85!important}' + sel('span.ma-sub-two') + '{background:#1a5e41!important;outline:1px solid #89fbcb}' + sel('span.ma-sub-all') + '{background:rgba(243,234,217,.14)!important}';
    document.head.appendChild(st);
  }
  function actify(root) {
    if (!ACTMENU || !root || root.getAttribute('data-acts')) return;
    root.setAttribute('data-acts', '1'); actCss();
    var q = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
    q('.mn-dd-in a[href$="/leaderboard"], .mn-ovgroup a[href$="/leaderboard"]').forEach(function (a) {
      var p = a.parentNode, next = a.nextSibling;
      p.insertBefore(actLink(SITE + '/leaderboard?act=one', 'ACT ONE STANDINGS'), next);
      p.insertBefore(actLink(SITE + '/leaderboard?act=two', 'ACT TWO STANDINGS'), next);
    });
    q('.mn-dd-in a[href$="/the-hunt#rewards"], .mn-ovgroup a[href$="/the-hunt#rewards"]').forEach(function (a) {
      var p = a.parentNode;
      p.insertBefore(actSub('REWARDS', 'all'), a);
      p.insertBefore(actLink(SITE + '/the-hunt#rewards-act-one', 'ACT ONE'), a);
      p.insertBefore(actLink(SITE + '/act-one-winners', 'ACT ONE WINNERS'), a);   // the replayed draws (Maurice, 2026-10-02)
      p.insertBefore(actLink(SITE + '/the-hunt#rewards-act-two', 'ACT TWO'), a);
      p.removeChild(a);
    });
    // the phone menu: Tasks, Riddles, Clues, Games and Contests become one Earn Points group, split by act
    var ov = root.id === 'hunt-nav-ov' ? root : root.querySelector('#hunt-nav-ov');
    var first = ov && Array.prototype.filter.call(ov.children, function (el) { return el.tagName === 'A' && EARN.test(el.href); });
    if (first && first.length) {
      var g = root.ownerDocument.createElement('div'); g.className = 'mn-ovgroup';
      var h = root.ownerDocument.createElement('span'); h.textContent = 'EARN POINTS'; g.appendChild(h);
      ov.insertBefore(g, first[0]);
      first.forEach(function (el) { if (/#tasks$|#riddles$/.test(el.href)) el.parentNode.removeChild(el); else g.appendChild(el); });
      earnActs(g);
    }
  }
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
    eps.forEach(function (a) { if (ACTMENU && /#tasks$|#riddles$/.test(a.href)) return; var c = document.createElement('a'); c.href = a.href; c.textContent = a.textContent; list.appendChild(c); });
    if (ACTMENU) earnActs(list);
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
    actify(document.getElementById('hunt-nav-ov'));
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      actify(nav);
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
      // the boxes flow into three columns so the dropdown fits on a laptop screen; a very short window scrolls inside it
      '#header .header-display-desktop .ma-hunt-dd .ma-mega-groups{display:block;columns:3;column-gap:12px;width:900px}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-grp a.ma-hl{max-width:100%;white-space:normal!important}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega-groups>.ma-grp{break-inside:avoid;margin:0 0 12px}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega{width:max-content;max-height:calc(100vh - 120px);overflow-y:auto;overscroll-behavior:contain}' +
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
      actify(doc.body);
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
            else { var h = document.createElement('span'); h.textContent = plainText(c); if (c.className) h.className = c.className; box.appendChild(h); }
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
      // The dropdown opens from the menu item's right edge and grows left; on a narrower screen it is nudged back
      // so it never runs off the left side.
      var item = huntList.closest('.header-nav-item');
      var keepOn = function () {
        huntList.style.transform = '';
        requestAnimationFrame(function () { var r = huntList.getBoundingClientRect(); if (r.width && r.left < 16) huntList.style.transform = 'translateX(' + Math.ceil(16 - r.left) + 'px)'; });
      };
      if (item) { item.addEventListener('mouseenter', keepOn); item.addEventListener('focusin', keepOn); }
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
            else { var s = document.createElement('span'); s.textContent = plainText(c); if (c.className) s.className = c.className; g.appendChild(s); }
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
  // Last in the menu, just before Pre-Order: an Oracle's Gift dropdown with the Aura Spectrum (the Aura Color Search
  // Database) under it (Maurice, 2026-10-03; the Act Two reward at 80k). It is a copy of the Submit dropdown, renamed.
  var AURA_URL = SITE + '/oracles-gift/aura-spectrum', GIFT = '/oracles-gift', GIFT_TEXT = "Oracle's Gift", AURA_TEXT = 'Aura Spectrum';
  // the Pre-Order menu item in a list of menu items (null puts a new item at the end)
  function preOrder(items) {
    for (var i = 0; i < items.length; i++) if (/^\s*(Folder:\s*)?Pre-Order/i.test(items[i].textContent)) return items[i];
    return null;
  }
  function giftFolder(list) {
    var src = list.querySelector('.header-nav-folder-title[data-href="/submit"]');
    if (!src) return null;
    var item = src.closest('.header-nav-item').cloneNode(true), btn = item.querySelector('.header-nav-folder-title');
    btn.setAttribute('data-href', GIFT); btn.setAttribute('aria-controls', 'oracles-gift'); btn.setAttribute('aria-expanded', 'false');
    item.querySelector('.header-nav-folder-title-text').textContent = GIFT_TEXT;
    var box = item.querySelector('.header-nav-folder-content'); box.id = 'oracles-gift';
    var rows = box.querySelectorAll('.header-nav-folder-item');
    for (var i = 1; i < rows.length; i++) rows[i].parentNode.removeChild(rows[i]);
    var a = rows[0].querySelector('a'); a.href = AURA_URL; a.removeAttribute('target');
    a.querySelector('.header-nav-folder-item-content').textContent = AURA_TEXT;
    return item;
  }
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
      a.href = MERCH_URL; a.removeAttribute('target'); a.textContent = 'Market';
      hunt.closest('.header-nav-item').parentNode.insertBefore(item, hunt.closest('.header-nav-item'));
      var gift = giftFolder(list);
      if (gift) { var pre = preOrder(list.children); list.insertBefore(gift, pre); }
    });
    var root = document.querySelector('.header-menu-nav [data-folder="root"]');
    if (!root) return;
    var oldRow = root.querySelector('a[data-folder-id="' + OLD_MERCH + '"]');
    if (oldRow) oldRow.closest('.header-menu-nav-item').style.display = 'none';
    var huntRow = root.querySelector('a[data-folder-id="' + HUNT + '"]');
    var tplRow = root.querySelector('.header-menu-nav-item--external');
    if (!huntRow || !tplRow) return;
    var row = tplRow.cloneNode(true), ra = row.querySelector('a');
    ra.href = MERCH_URL; ra.removeAttribute('target'); ra.textContent = 'Market';
    huntRow.closest('.header-menu-nav-item').parentNode.insertBefore(row, huntRow.closest('.header-menu-nav-item'));
    // the phone menu: an Oracle's Gift row that opens its own panel, like the Submit row does
    var subRow = root.querySelector('a[data-folder-id="/submit"]'), subPanel = document.querySelector('.header-menu-nav [data-folder="/submit"]');
    if (subRow && subPanel) {
      var giftRow = subRow.closest('.header-menu-nav-item').cloneNode(true), ga = giftRow.querySelector('a');
      ga.setAttribute('data-folder-id', GIFT); ga.setAttribute('href', GIFT);
      giftRow.querySelector('.header-nav-folder-title-text').textContent = GIFT_TEXT;
      var rowList = huntRow.closest('.header-menu-nav-item').parentNode;
      rowList.insertBefore(giftRow, preOrder(rowList.children));
      var panel = subPanel.cloneNode(true); panel.setAttribute('data-folder', GIFT);
      var prow = panel.querySelectorAll('.header-menu-nav-item:not(.header-menu-controls)');
      for (var j = 1; j < prow.length; j++) prow[j].parentNode.removeChild(prow[j]);
      var pa = prow[0].querySelector('a'); pa.href = AURA_URL; pa.querySelector('.header-menu-nav-item-content').textContent = AURA_TEXT;
      subPanel.parentNode.insertBefore(panel, subPanel.nextSibling);
    }
  }

  // The green hunt menu (copied into each hunt page) gets the same Oracle's Gift dropdown, last before Pre-Order.
  function huntGift() {
    var caret = '<svg class="mn-caret" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M3 7l8 8 8-8"></path></svg>';
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      if (nav.querySelector('.mn-gift')) return;
      var cta = nav.querySelector('.mn-drop-cta'), links = nav.querySelector('.mn-links');
      if (!links) return;
      var d = document.createElement('div'); d.className = 'mn-drop mn-gift';
      d.innerHTML = '<a href="javascript:void(0)" class="mn-link" aria-haspopup="true">ORACLE&#39;S GIFT' + caret + '</a><div class="mn-dd"><div class="mn-dd-in"><a href="' + AURA_URL + '">AURA SPECTRUM</a></div></div>';
      // the plain menu items sit in their own box inside .mn-links, with the Pre-Order dropdown after it
      var box = cta && cta.parentNode === links ? cta.previousElementSibling : null;
      if (box && box.tagName === 'DIV' && !box.classList.contains('mn-drop')) box.appendChild(d);
      else links.insertBefore(d, cta && cta.parentNode === links ? cta : null);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav-ov'), function (ov) {
      if (ov.querySelector('.mn-gift')) return;
      var g = document.createElement('div'); g.className = 'mn-ovgroup mn-gift';
      g.innerHTML = '<span>ORACLE&#39;S GIFT</span><a href="' + AURA_URL + '">AURA SPECTRUM</a>';
      ov.insertBefore(g, ov.querySelector(':scope > .mn-cta'));
    });
  }

  // The old Linktree menu link goes (Maurice, 2026-10-04): his bios now point at /links, which stays off the menus
  // on purpose (The Quiet One riddle: "no branches linking it to the imperia"). Runs after mainMerch, which clones
  // an external menu item as its template.
  function dropLinktree() {
    Array.prototype.forEach.call(document.querySelectorAll('#header a[href*="linktr.ee"], .header-menu-nav a[href*="linktr.ee"]'), function (a) {
      var item = a.closest('.header-nav-item, .header-menu-nav-item'); if (item) item.style.display = 'none';
    });
  }

  function scan() {
    huntGift();
    mainMerch();
    dropLinktree();
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
