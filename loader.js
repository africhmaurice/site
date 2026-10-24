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
  // Cookie choices and the Meta Pixel (Maurice, 2026-10-07): cookies.js asks visitors in Europe first, loads the
  // Pixel for everyone else, and adds Cookie Preferences to the footer. Squarespace's banner and Pixel are off.
  (function () { var s = document.createElement('script'); s.src = BASE + 'cookies.js'; (document.head || document.documentElement).appendChild(s); })();
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
  var PIN = '0cb0de6b694fb24d18b7c0c75b44ede5e928b224';
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
    list.appendChild(actLink(SITE + '/the-hunt#act2-tasks', 'TASKS'));
    list.appendChild(actLink(SITE + '/the-hunt#act2-riddles', 'RIDDLES & PUZZLES'));
    // Act Three (Maurice, 2026-10-16): its section owns #tasks and #riddles; Act Two's are in its drawer
    list.appendChild(actSub('ACT THREE', 'three'));
    list.appendChild(actLink(SITE + '/the-hunt#tasks', 'TASKS'));
    list.appendChild(actLink(SITE + '/the-hunt#riddles', 'RIDDLES & PUZZLES'));
  }
  function actCss() {
    if (!ACTMENU || document.getElementById('ma-act-menu')) return;
    var st = document.createElement('style'); st.id = 'ma-act-menu';
    var sel = function (x) { return ['#hunt-nav ', '#hunt-nav-ov ', '#header '].map(function (p) { return p + x; }).join(','); };
    st.textContent = sel('span.ma-sub') + '{display:block!important;align-self:stretch;font-family:Almarai,sans-serif!important;font-weight:800!important;font-size:11px!important;letter-spacing:.16em!important;text-transform:uppercase!important;text-align:center!important;color:#fff!important;margin:10px 0 4px!important;padding:4px 10px!important;white-space:nowrap}' +
      sel('span.ma-sub-one') + '{background:#482d85!important}' + sel('span.ma-sub-two') + '{background:#1a5e41!important;outline:1px solid #89fbcb}' + sel('span.ma-sub-all') + '{background:rgba(243,234,217,.14)!important}' + sel('span.ma-sub-three') + '{background:#912501!important;outline:1px solid #fd7547}';
    document.head.appendChild(st);
  }
  function actify(root) {
    if (!ACTMENU || !root || root.getAttribute('data-acts')) return;
    root.setAttribute('data-acts', '1'); actCss();
    var q = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
    // The Games page is THE ARCADE in every menu (Maurice, 2026-10-13); the page address stays /games.
    q('a[href$="/games"]').forEach(function (x) { if (/^\s*games\s*$/i.test(x.textContent)) x.textContent = 'THE ARCADE'; });
    q('.mn-dd-in a[href$="/leaderboard"], .mn-ovgroup a[href$="/leaderboard"]').forEach(function (a) {
      var p = a.parentNode, next = a.nextSibling;
      p.insertBefore(actLink(SITE + '/leaderboard?act=one', 'ACT ONE STANDINGS'), next);
      p.insertBefore(actLink(SITE + '/leaderboard?act=two', 'ACT TWO STANDINGS'), next);
      p.insertBefore(actLink(SITE + '/leaderboard?act=three', 'ACT THREE STANDINGS'), next);
    });
    q('.mn-dd-in a[href$="/the-hunt#rewards"], .mn-ovgroup a[href$="/the-hunt#rewards"]').forEach(function (a) {
      var p = a.parentNode;
      p.insertBefore(actSub('REWARDS', 'all'), a);
      p.insertBefore(actLink(SITE + '/the-hunt#rewards-act-one', 'ACT ONE'), a);
      p.insertBefore(actLink(SITE + '/act-one-winners', 'ACT ONE WINNERS'), a);   // the replayed draws (Maurice, 2026-10-02)
      p.insertBefore(actLink(SITE + '/the-hunt#rewards-act-two', 'ACT TWO'), a);
      p.insertBefore(actLink(SITE + '/act-two-winners', 'ACT TWO WINNERS'), a);   // the replayed Act Two draws (Maurice, 2026-10-19)
      p.insertBefore(actLink(SITE + '/the-hunt#rewards-act-three', 'ACT THREE'), a);
      p.removeChild(a);
    });
    // Questions? (Maurice, 2026-10-09): no longer its own menu item; it closes the Current Progress dropdown instead.
    var cp = q('.mn-dd-in, .mn-ovgroup, .ma-grp').filter(function (g) { return g.querySelector('a[href*="/leaderboard"]'); });
    if (cp.length) {
      q('a[href$="/questions"]').forEach(function (a) { if (!cp.some(function (g) { return g.contains(a); })) a.parentNode.removeChild(a); });
      cp.forEach(function (g) { if (!g.querySelector('a[href$="/questions"]')) g.appendChild(actLink(SITE + '/questions', 'QUESTIONS?')); });
    }
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
      '#hunt-nav.mn-compact .mn-links{gap:clamp(10px,.8vw,18px)}#hunt-nav.mn-compact .mn-links .mn-link{font-size:clamp(10px,.84vw,14px)!important}#hunt-nav.mn-compact .mn-right{gap:clamp(12px,1.4vw,24px)}#hunt-nav.mn-compact .mn-row{gap:16px}' +
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
    huntOne();
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
    if (document.getElementById('ma-hunt-css')) return;
    var st = document.createElement('style'); st.id = 'ma-hunt-css';
    var box = 'background:rgba(9,23,7,.95);border:1px solid rgba(243,234,217,.25);min-width:170px;padding:0;';
    // the same panel opens from the main menu and from the green hunt menu (one menu, Maurice 2026-10-09)
    var desk = function (P) { return (
      '#header .header-display-desktop .ma-hunt-dd{' + box + '}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega{display:grid;grid-template-columns:auto auto;gap:16px;padding:16px;align-items:start}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-mega-links{display:flex;flex-direction:column}' +
      // the boxes flow into three columns so the dropdown fits on a laptop screen; a very short window scrolls inside it
      '#header .header-display-desktop .ma-hunt-dd .ma-mega-groups{display:block;columns:3;column-gap:12px;width:840px}' +
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
      '#header .header-display-desktop .ma-hunt-dd .ma-grp a.ma-hl.mn-profile{white-space:nowrap!important;padding:9px 10px!important}' +
      // three columns: The Treasure Hunt over Earn Points, Submit Points over Current Progress, then Adventure
      '#header .header-display-desktop .ma-hunt-dd .ma-mega.ma-mega3{display:grid;grid-template-columns:repeat(3,minmax(250px,auto));gap:12px;padding:16px;align-items:start}' +
      '#header .header-display-desktop .ma-hunt-dd .ma-col{display:flex;flex-direction:column;gap:12px}' +
      '#header .header-display-desktop .ma-hunt-dd a.ma-hl.ma-top{text-align:center!important;border:1px solid rgba(243,234,217,.3);padding:14px!important;font-weight:800!important;letter-spacing:.12em!important}'
      ).split('#header .header-display-desktop .ma-hunt-dd').join(P); };
    st.textContent = desk('#header .header-display-desktop .ma-hunt-dd') + desk('#hunt-nav .ma-hunt-dd') +
      '#hunt-nav .mn-dd-in.ma-hunt-dd{display:block}' +
      // phone menu: the hunt phone menu's boxed groups
      '#header .header-menu .ma-ovgroup{display:flex;flex-direction:column;align-items:center;gap:12px;border:1px solid rgba(243,234,217,.3);padding:14px 16px 16px;margin:10px auto;width:86%;box-sizing:border-box}' +
      '#header .header-menu .ma-ovgroup>span{font-family:\'Almarai\',sans-serif;font-weight:800;font-size:12px;letter-spacing:.16em;color:#a2f590}' +
      '#header .header-menu .ma-ovgroup a{font-size:15px!important;line-height:1.3!important;text-align:center;padding:0!important;margin:0!important}#header .header-menu .ma-ovgroup a.mn-profile{background:#c1330a;border:1.5px solid #f3ead9;padding:9px 16px!important;white-space:nowrap;font-size:15px!important}' +
      '#header .header-menu .ma-ovgroup a.mn-profile svg{display:none}#header .header-menu a.mn-vote{color:#a2f590!important}';
    document.head.appendChild(st);
  }
  function plainText(a) { return (a.textContent || '').replace(/\s+/g, ' ').trim(); }
  // One menu (Maurice, 2026-10-09). The main menu reads, left to right: THE TREASURE HUNT (dropdown), TRENCH MARKET,
  // LINKS, NEWSLETTER, JOIN THE DISCORD!, and the Pre-Order dropdown, 25px apart. Games and Oracle's Gift live only in
  // The Treasure Hunt panel (Maurice, 10/10).
  // Submit is no longer its own item. The Treasure Hunt dropdown has three columns: THE TREASURE HUNT (the Hunt page)
  // over Earn Points (Games back in it, Maurice 10/10), SUBMIT POINTS over Current Progress, then Adventure with
  // Oracle's Gift under it.
  // The green hunt menu on the hunt pages shows exactly the same menu.
  var MEGA = [[['link', 'THE TREASURE HUNT', '/the-hunt'], ['group', 'EARN POINTS']], [['link', 'SUBMIT POINTS', '/points'], ['group', 'CURRENT PROGRESS']], [['group', 'ADVENTURE'], ['gift']]];
  var DISCORD = 'https://discord.gg/d36Xnj4umU', GAP = 25;
  // Trench Market is a dropdown on every menu (Maurice, 2026-10-10): Shop All and every category in the shop. The shop
  // doesn't share its category list with other sites, so it is listed here; the shop's own menu (shopmenu.js) reads it live.
  var SHOP = 'https://shop.mauriceafrich.com', SHOP_CATS = [['Shop All', '/collections/merch'], ['Stickers', '/collections/stickers'], ['Apparel', '/collections/apparel'], ['Hats', '/collections/hats'],
    ['Beanies', '/collections/beanies'], ['Pins', '/collections/pins'], ['Mugs', '/collections/mugs'], ['Puzzles', '/collections/puzzles'], ['Prints', '/collections/art-prints']];
  var TM = '/trench-market';
  // the main menu's Trench Market dropdown, made from the Oracle's Gift dropdown
  function marketFolder(gift) {
    var item = gift.cloneNode(true), btn = item.querySelector('.header-nav-folder-title');
    btn.setAttribute('data-href', TM); btn.setAttribute('aria-controls', 'trench-market'); btn.setAttribute('aria-expanded', 'false');
    item.querySelector('.header-nav-folder-title-text').textContent = 'Trench Market';
    var box = item.querySelector('.header-nav-folder-content'), tpl = box.querySelector('.header-nav-folder-item').cloneNode(true);
    box.id = 'trench-market'; box.innerHTML = ''; box.classList.remove('ma-boxdd'); item.removeAttribute('data-ma-boxed');
    SHOP_CATS.forEach(function (c) { var row = tpl.cloneNode(true), a = row.querySelector('a'); a.href = SHOP + c[1]; a.removeAttribute('target');
      a.querySelector('.header-nav-folder-item-content').textContent = c[0]; box.appendChild(row); });
    return item;
  }
  function megaLink(a, cls) {
    var n = document.createElement('a'); n.href = a.getAttribute('href'); n.className = cls;
    ['mn-vote', 'mn-profile'].forEach(function (c) { if (a.classList.contains(c)) n.classList.add(c); });
    if (a.getAttribute('style')) n.setAttribute('style', a.getAttribute('style'));
    if (a.getAttribute('target')) { n.target = a.getAttribute('target'); n.rel = 'noopener'; }
    var svg = a.classList.contains('mn-profile') && a.querySelector('svg');
    if (svg) n.appendChild(document.importNode(svg, true));
    n.appendChild(document.createTextNode(plainText(a)));
    return n;
  }
  // a hunt phone menu's boxed groups (after actify), by heading
  function megaModel(ov) {
    var gs = {};
    Array.prototype.forEach.call(ov.children, function (el) {
      if (!el.classList.contains('mn-ovgroup')) return;
      var h = el.firstElementChild; if (h && h.tagName !== 'A') gs[plainText(h).toUpperCase()] = el;
    });
    return gs;
  }
  // a group's heading and links, copied
  function groupKids(g, cls, add) {
    var seen = {};   // each link once, even where a page's copy of the menu got it twice
    Array.prototype.forEach.call(g.children, function (c) {
      if (c.tagName === 'A') { var k = (c.getAttribute('href') || '') + '|' + plainText(c); if (seen[k]) return; seen[k] = 1; add(megaLink(c, cls)); }
      else { var h = document.createElement('span'); h.textContent = plainText(c); if (c.className) h.className = c.className; add(h); }
    });
  }
  // the Oracle's Gift box at the foot of the panel's third column (Maurice, 2026-10-10)
  function giftBox(boxCls, linkCls) {
    var box = document.createElement('div'); box.className = boxCls;
    var h = document.createElement('span'); h.textContent = "ORACLE'S GIFT"; box.appendChild(h);
    var a = document.createElement('a'); a.href = AURA_URL; a.className = linkCls; a.textContent = 'AURA SPECTRUM'; box.appendChild(a);
    var q = document.createElement('a'); q.href = QUIZ_URL; q.className = linkCls; q.textContent = 'THE SKY PIRATE QUIZ'; box.appendChild(q);
    return box;
  }
  function megaPanel(ov) {
    var gs = megaModel(ov), mega = document.createElement('div'); mega.className = 'ma-mega ma-mega3';
    MEGA.forEach(function (col) {
      var c = document.createElement('div'); c.className = 'ma-col';
      col.forEach(function (it) {
        if (it[0] === 'link') { var a = document.createElement('a'); a.href = SITE + it[2]; a.className = 'ma-hl ma-top'; a.textContent = it[1]; c.appendChild(a); return; }
        if (it[0] === 'gift') { c.appendChild(giftBox('ma-grp', 'ma-hl')); return; }
        if (!gs[it[1]]) return;
        var box = document.createElement('div'); box.className = 'ma-grp';
        groupKids(gs[it[1]], 'ma-hl', function (k) { box.appendChild(k); });
        c.appendChild(box);
      });
      mega.appendChild(c);
    });
    return mega;
  }
  // 25px between the links wherever the row fits; on a narrower laptop the spacing tightens just enough to keep the
  // Pre-Order button where the header's right edge has always been.
  var gapT;
  function mainGap() {
    Array.prototype.forEach.call(document.querySelectorAll('#header .header-display-desktop .header-nav-list'), function (list) {
      list.style.removeProperty('--ma-gap');
      var vis = Array.prototype.filter.call(list.children, function (i) { return i.offsetWidth; });
      if (!vis.length) return;
      var wrap = list.closest('.header-nav-wrapper') || list.parentNode, edge = Math.min(wrap.getBoundingClientRect().right, document.documentElement.clientWidth - 16);
      var over = vis[vis.length - 1].getBoundingClientRect().right - edge;
      if (over > 0) list.style.setProperty('--ma-gap', Math.max(6, GAP - Math.ceil(over / vis.length)) + 'px');
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
      if (!t || !box || item.getAttribute('data-ma-boxed') || t.getAttribute('data-href') === HUNT || box.classList.contains('ma-hunt-dd')) return;
      item.setAttribute('data-ma-boxed', '1');
      var g = document.createElement('div'); g.className = 'ma-grp';
      var h = document.createElement('span'); h.textContent = plainText(t.querySelector('.header-nav-folder-title-text') || t); g.appendChild(h);
      Array.prototype.forEach.call(box.querySelectorAll('.header-nav-folder-item'), function (r) { g.appendChild(r); });
      box.appendChild(g); box.classList.add('ma-boxdd');
    });
  }
  // Main menu order and spacing (desktop row and phone menu). Waits until Market, Links, and Oracle's Gift are in.
  function mainOrder() {
    if (!document.getElementById('header')) return;
    if (!document.getElementById('ma-one-gap')) {
      var st = document.createElement('style'); st.id = 'ma-one-gap';
      st.textContent = '#header .header-display-desktop .header-nav-list{gap:0!important}#header .header-display-desktop .header-nav{padding-left:24px!important}' +
        '#header .header-display-desktop .header-nav-item{margin-left:calc(var(--ma-gap,' + GAP + 'px) / 2)!important;margin-right:calc(var(--ma-gap,' + GAP + 'px) / 2)!important}';
      document.head.appendChild(st);
      window.addEventListener('resize', function () { clearTimeout(gapT); gapT = setTimeout(mainGap, 120); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(mainGap);
    }
    mainGap();
    Array.prototype.forEach.call(document.querySelectorAll('#header .header-nav-list'), function (list) {
      if (list.getAttribute('data-ma-order')) return;
      var items = Array.prototype.slice.call(list.children);
      var find = function (sel) { for (var i = 0; i < items.length; i++) if (items[i].querySelector(sel)) return items[i]; return null; };
      var hunt = find('.header-nav-folder-title[data-href="' + HUNT + '"]'), market = find('a[href="' + MERCH_URL + '"]'), links = find('a[href$="/links"]');
      var pre = preOrder(items), gift = find('.header-nav-folder-title[data-href="' + GIFT + '"]');
      if (!hunt || !market || !links || !pre) return;
      list.setAttribute('data-ma-order', '1');
      var submit = find('.header-nav-folder-title[data-href="/submit"]'); if (submit) submit.style.display = 'none';
      var shop = gift ? marketFolder(gift) : market; if (shop !== market) market.style.display = 'none';
      if (gift) gift.style.display = 'none';   // in The Treasure Hunt panel now
      [hunt, shop, links, find('a[href$="/newsletter"]'), find('a[href*="discord"]')].forEach(function (it) { if (it) list.insertBefore(it, pre); });
    });
    mainGap();
    var root = document.querySelector('.header-menu-nav [data-folder="root"]');
    var huntRow = root && root.querySelector('a[data-folder-id="' + HUNT + '"]');
    if (!huntRow || root.getAttribute('data-ma-order')) return;
    var rowList = huntRow.closest('.header-menu-nav-item').parentNode, rows = Array.prototype.slice.call(rowList.children);
    var rfind = function (sel) { for (var i = 0; i < rows.length; i++) if (rows[i].querySelector(sel)) return rows[i]; return null; };
    var rLinks = rfind('a[href$="/links"]'), rPre = preOrder(rows);
    if (!rLinks || !rPre || !rfind('a[href="' + MERCH_URL + '"]')) return;
    root.setAttribute('data-ma-order', '1');
    var rSub = rfind('a[data-folder-id="/submit"]'); if (rSub) rSub.style.display = 'none';
    // the phone menu's Trench Market row opens its own panel of categories, like the Oracle's Gift row
    var rMarket = rfind('a[href="' + MERCH_URL + '"]'), rGift = rfind('a[data-folder-id="' + GIFT + '"]'), gPanel = document.querySelector('.header-menu-nav [data-folder="' + GIFT + '"]');
    if (rGift) rGift.style.display = 'none';   // in The Treasure Hunt panel now
    if (rGift && gPanel) {
      var tmRow = rGift.cloneNode(true), ta = tmRow.querySelector('a'); ta.setAttribute('data-folder-id', TM); ta.setAttribute('href', TM);
      tmRow.style.display = '';   // the Oracle's Gift row it copies is hidden
      tmRow.querySelector('.header-nav-folder-title-text').textContent = 'Trench Market';
      var tmPanel = gPanel.cloneNode(true); tmPanel.setAttribute('data-folder', TM);
      var pRows = tmPanel.querySelectorAll('.header-menu-nav-item:not(.header-menu-controls)'), pTpl = pRows[0], pList = pTpl.parentNode;
      Array.prototype.forEach.call(pRows, function (x) { x.parentNode.removeChild(x); });
      SHOP_CATS.forEach(function (c) { var x = pTpl.cloneNode(true), xa = x.querySelector('a'); xa.href = SHOP + c[1]; xa.querySelector('.header-menu-nav-item-content').textContent = c[0]; pList.appendChild(x); });
      gPanel.parentNode.insertBefore(tmPanel, gPanel.nextSibling);
      if (rMarket) rMarket.style.display = 'none'; rMarket = tmRow;
    }
    [huntRow.closest('.header-menu-nav-item'), rMarket, rLinks, rfind('a[href$="/newsletter"]'), rfind('a[href*="discord"]')]
      .forEach(function (r) { if (r) rowList.insertBefore(r, rPre); });
  }
  // The green hunt menu (copied into each hunt page) becomes the same menu: desktop row and phone menu.
  function huntOne() {
    var ov = document.getElementById('hunt-nav-ov');
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      var links = nav.querySelector('.mn-links'), gift = nav.querySelector('.mn-gift');
      if (nav.getAttribute('data-one') || !links || !gift || !ov) return;
      nav.setAttribute('data-one', '1');
      actify(nav); actify(ov); huntCss(); navCss();   // act links first, so they aren't added again inside the new panel
      if (!document.getElementById('ma-one-nav')) {
        var st = document.createElement('style'); st.id = 'ma-one-nav';
        st.textContent = '#hunt-nav .mn-right .mn-links{gap:' + GAP + 'px}#hunt-nav .mn-row .mn-right{gap:' + GAP + 'px}' +
          '#hunt-nav.mn-compact .mn-right .mn-links{gap:clamp(10px,.9vw,18px)}#hunt-nav.mn-compact .mn-row .mn-right{gap:16px}' +
          '#hunt-nav .ma-th>.mn-dd{z-index:3}#hunt-nav-ov .mn-ovgroup a.mn-profile{white-space:nowrap}';
        document.head.appendChild(st);
      }
      var caret = nav.querySelector('.mn-caret'), cta = nav.querySelector('.mn-drop-cta'), ctaIn = cta && links.contains(cta);
      var mk = function (href, text, cls) { var a = document.createElement('a'); a.href = href; a.className = 'mn-link' + (cls ? ' ' + cls : ''); a.textContent = text;
        if (href === DISCORD) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
      var th = document.createElement('div'); th.className = 'mn-drop ma-th';
      th.innerHTML = '<a href="' + SITE + '/the-hunt" class="mn-link" aria-haspopup="true">THE TREASURE HUNT' + (caret ? caret.outerHTML : '') + '</a><div class="mn-dd"><div class="mn-dd-in ma-hunt-dd"></div></div>';
      th.querySelector('.mn-dd-in').appendChild(megaPanel(ov));
      // the wide panel opens under its link but stays 16px inside the screen
      var dd = th.querySelector('.mn-dd'), place = function () {
        dd.style.transform = '';
        requestAnimationFrame(function () { var r = dd.getBoundingClientRect(), vw = document.documentElement.clientWidth, s = 0;
          if (!r.width) return; if (r.right > vw - 16) s = vw - 16 - r.right; if (r.left + s < 16) s = 16 - r.left;
          if (s) dd.style.transform = 'translateX(calc(-50% + ' + Math.round(s) + 'px))'; }); };
      th.addEventListener('mouseenter', place); th.addEventListener('focusin', place);
      // Trench Market, Oracle's Gift, and Pre-Order: each a box with its title and a line under it, on every menu
      var tm = document.createElement('div'); tm.className = 'mn-drop ma-tm';
      tm.innerHTML = '<a href="' + MERCH_URL + '" class="mn-link" aria-haspopup="true">TRENCH MARKET' + (caret ? caret.outerHTML : '') + '</a><div class="mn-dd"><div class="mn-dd-in"></div></div>';
      SHOP_CATS.forEach(function (c) { var a = document.createElement('a'); a.href = SHOP + c[1]; a.textContent = c[0].toUpperCase(); tm.querySelector('.mn-dd-in').appendChild(a); });
      [[tm, 'TRENCH MARKET'], [gift, "ORACLE'S GIFT"], [cta, "PRE-ORDER CELLO'S GATE"]].forEach(function (d) { if (d[0]) boxDrop(d[0], d[1]); });
      var row = [th, tm, mk(SITE + '/links', 'LINKS', 'mn-linkpage'), mk(SITE + '/newsletter', 'NEWSLETTER'), mk(DISCORD, 'JOIN THE DISCORD!'), gift];
      gift.style.display = 'none';   // kept (huntGift looks for it) but shown only in The Treasure Hunt panel
      while (links.firstChild) links.removeChild(links.firstChild);
      row.forEach(function (el) { links.appendChild(el); });
      if (ctaIn) links.appendChild(cta);
      nav.setAttribute('data-fit', '1');   // no Earn Points fold now; it still tightens or uses the menu button when it doesn't fit
    });
    if (!ov || ov.getAttribute('data-one') || !ov.querySelector('.mn-gift')) return;
    ov.setAttribute('data-one', '1'); actify(ov);
    var gs = megaModel(ov);
    Object.keys(gs).forEach(function (k) { var seen = {}; Array.prototype.forEach.call(gs[k].querySelectorAll('a'), function (a) {
      var key = a.getAttribute('href') + '|' + plainText(a); if (seen[key]) a.parentNode.removeChild(a); seen[key] = 1; }); });
    var ol = function (href, text, cls) { var a = document.createElement('a'); a.href = href; a.textContent = text; if (cls) a.className = cls;
      if (href === DISCORD) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
    var tmGroup = document.createElement('div'); tmGroup.className = 'mn-ovgroup mn-merch-group'; tmGroup.appendChild(document.createElement('span')).textContent = 'TRENCH MARKET';
    SHOP_CATS.forEach(function (c) { tmGroup.appendChild(ol(SHOP + c[1], c[0].toUpperCase())); });
    var order = [ov.querySelector('.mn-x'), ov.querySelector('.mn-ovlogo'), ol(SITE + '/the-hunt', 'THE TREASURE HUNT'), gs['EARN POINTS'], ol(SITE + '/points', 'SUBMIT POINTS'), gs['CURRENT PROGRESS'], gs['ADVENTURE'], ov.querySelector('.mn-gift'),
      tmGroup, ol(SITE + '/links', 'LINKS', 'mn-linkpage'), ol(SITE + '/newsletter', 'NEWSLETTER'), ol(DISCORD, 'JOIN THE DISCORD!'), ov.querySelector(':scope > .mn-cta')];
    while (ov.firstChild) ov.removeChild(ov.firstChild);
    order.forEach(function (el) { if (el) ov.appendChild(el); });
  }
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
      // One menu (Maurice, 2026-10-09): three columns, built the same way for the green hunt menu (megaPanel).
      if (ov) {
        huntList.innerHTML = ''; huntList.classList.add('ma-hunt-dd'); huntList.appendChild(megaPanel(ov));
        var pnl = document.querySelector('.header-menu-nav [data-folder="' + HUNT + '"] .header-menu-nav-folder-content');
        if (!pnl) return;
        Array.prototype.forEach.call(pnl.querySelectorAll('.header-menu-nav-item:not(.header-menu-controls)'), function (r) { r.remove(); });
        var gs = megaModel(ov);
        MEGA.forEach(function (col) { col.forEach(function (it) {
          var row = document.createElement('div'); row.className = 'container header-menu-nav-item';
          if (it[0] === 'link') {
            var a = document.createElement('a'); a.href = SITE + it[2]; a.tabIndex = -1;
            a.innerHTML = '<div class="header-menu-nav-item-content"></div>'; a.firstChild.textContent = it[1]; row.appendChild(a);
          } else if (it[0] === 'gift') {
            var gb = giftBox('ma-ovgroup', ''); gb.querySelector('a').tabIndex = -1; row.appendChild(gb);
          } else {
            if (!gs[it[1]]) return;
            var g = document.createElement('div'); g.className = 'ma-ovgroup';
            groupKids(gs[it[1]], '', function (k) { if (k.tagName === 'A') { k.className = k.classList.contains('mn-profile') ? 'mn-profile' : ''; k.tabIndex = -1; } g.appendChild(k); });
            row.appendChild(g);
          }
          pnl.appendChild(row);
        }); });
        return;
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
      // (centered under its link like every other dropdown: centerDropdowns)
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
  // the Sky Pirate Quiz (the Act Three 300K reward) sits under Aura Spectrum in every Oracle's Gift menu (Maurice, 2026-10-24)
  var QUIZ_URL = SITE + '/sky-pirate-quiz-61748', QUIZ_TEXT = 'The Sky Pirate Quiz';
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
    var qr = rows[0].cloneNode(true), qa = qr.querySelector('a'); qa.href = QUIZ_URL; qa.querySelector('.header-nav-folder-item-content').textContent = QUIZ_TEXT;
    rows[0].parentNode.insertBefore(qr, rows[0].nextSibling);
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
      a.href = MERCH_URL; a.removeAttribute('target'); a.textContent = 'Trench Market';
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
    ra.href = MERCH_URL; ra.removeAttribute('target'); ra.textContent = 'Trench Market';
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
      var pq = prow[0].cloneNode(true), pqa = pq.querySelector('a'); pqa.href = QUIZ_URL; pqa.querySelector('.header-menu-nav-item-content').textContent = QUIZ_TEXT;
      prow[0].parentNode.insertBefore(pq, prow[0].nextSibling);
      subPanel.parentNode.insertBefore(panel, subPanel.nextSibling);
    }
  }

  // The green hunt menu (copied into each hunt page) gets the same Oracle's Gift dropdown, last before Pre-Order.
  // The Adventure dropdown of the green hunt menu (copied into each hunt page) gets FIGHT THE LEVIAN (chapter 5,
  // /the-river) right after CRASH LANDING, on desktop and in the phone menu (Maurice, 2026-10-05).
  function huntRiver() {
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav, #hunt-nav-ov'), function (nav) {
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/the-crash"]'), function (crash) {
        var box = crash.parentNode;
        if (box.querySelector('a[href$="/the-river"]')) return;
        var a = crash.cloneNode(false); a.href = SITE + '/the-river'; a.textContent = 'FIGHT THE LEVIAN';
        box.insertBefore(a, crash.nextSibling);
      });
      // Cross the River (chapter 6, 2026-10-07) follows Fight the Levian
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/the-river"]'), function (river) {
        var box = river.parentNode;
        if (box.querySelector('a[href$="/the-raft"]')) return;
        var a = river.cloneNode(false); a.href = SITE + '/the-raft'; a.textContent = 'CROSS THE RIVER';
        box.insertBefore(a, river.nextSibling);
      });
      // River Mayhem (chapter 7, 2026-10-08) follows Cross the River
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/the-raft"]'), function (raft) {
        var box = raft.parentNode;
        if (box.querySelector('a[href$="/river-mayhem"]')) return;
        var a = raft.cloneNode(false); a.href = SITE + '/river-mayhem'; a.textContent = 'RIVER MAYHEM';
        box.insertBefore(a, raft.nextSibling);
      });
      // Washed Ashore (chapter 8, 2026-10-12) follows River Mayhem
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/river-mayhem"]'), function (mayhem) {
        var box = mayhem.parentNode;
        if (box.querySelector('a[href$="/washed-ashore"]')) return;
        var a = mayhem.cloneNode(false); a.href = SITE + '/washed-ashore'; a.textContent = 'WASHED ASHORE';
        box.insertBefore(a, mayhem.nextSibling);
      });
      // Cerunine Attack (chapter 9, 2026-10-15) follows Washed Ashore
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/washed-ashore"]'), function (ashore) {
        var box = ashore.parentNode;
        if (box.querySelector('a[href$="/cerunine-attack"]')) return;
        var a = ashore.cloneNode(false); a.href = SITE + '/cerunine-attack'; a.textContent = 'CERUNINE ATTACK';
        box.insertBefore(a, ashore.nextSibling);
      });
      // The Reunion (chapter 10, 2026-10-19) follows Cerunine Attack
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/cerunine-attack"]'), function (fight) {
        var box = fight.parentNode;
        if (box.querySelector('a[href$="/the-reunion"]')) return;
        var a = fight.cloneNode(false); a.href = SITE + '/the-reunion'; a.textContent = 'THE REUNION';
        box.insertBefore(a, fight.nextSibling);
      });
      // The Energy Wave (chapter 11, 2026-10-21) follows The Reunion
      Array.prototype.forEach.call(nav.querySelectorAll('a[href$="/the-reunion"]'), function (reunion) {
        var box = reunion.parentNode;
        if (box.querySelector('a[href$="/the-energy-wave"]')) return;
        var a = reunion.cloneNode(false); a.href = SITE + '/the-energy-wave'; a.textContent = 'THE ENERGY WAVE';
        box.insertBefore(a, reunion.nextSibling);
      });
    });
  }
  // The raft hunt (chapter 6, 2026-10-07): raft.js hides the pieces on every page; it checks its own hours.
  // Chapter buttons (2026-10-09): Previous chapter / See the map / Next chapter at the foot of each chapter page.
  function chapterNav() {
    if (window.__chapterNavLoaded) return; window.__chapterNavLoaded = true;
    var s = document.createElement('script'); s.src = GH + 'chapter-nav.js?v=7'; s.async = true; document.head.appendChild(s);
  }
  function raftHunt() {
    if (window.__raftLoaded) return; window.__raftLoaded = true;
    var s = document.createElement('script'); s.src = GH + 'raft.js?v=8'; s.async = true; document.head.appendChild(s);
  }
  function huntGift() {
    huntLinks();
    huntRiver();
    raftHunt();
    chapterNav();
    var caret = '<svg class="mn-caret" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M3 7l8 8 8-8"></path></svg>';
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav'), function (nav) {
      if (nav.querySelector('.mn-gift')) return;
      var cta = nav.querySelector('.mn-drop-cta'), links = nav.querySelector('.mn-links');
      if (!links) return;
      var d = document.createElement('div'); d.className = 'mn-drop mn-gift';
      d.innerHTML = '<a href="javascript:void(0)" class="mn-link" aria-haspopup="true">ORACLE&#39;S GIFT' + caret + '</a><div class="mn-dd"><div class="mn-dd-in"><a href="' + AURA_URL + '">AURA SPECTRUM</a><a href="' + QUIZ_URL + '">THE SKY PIRATE QUIZ</a></div></div>';
      // the plain menu items sit in their own box inside .mn-links, with the Pre-Order dropdown after it
      var box = cta && cta.parentNode === links ? cta.previousElementSibling : null;
      if (box && box.tagName === 'DIV' && !box.classList.contains('mn-drop')) box.appendChild(d);
      else links.insertBefore(d, cta && cta.parentNode === links ? cta : null);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav-ov'), function (ov) {
      if (ov.querySelector('.mn-gift')) return;
      var g = document.createElement('div'); g.className = 'mn-ovgroup mn-gift';
      g.innerHTML = '<span>ORACLE&#39;S GIFT</span><a href="' + AURA_URL + '">AURA SPECTRUM</a><a href="' + QUIZ_URL + '">THE SKY PIRATE QUIZ</a>';
      ov.insertBefore(g, ov.querySelector(':scope > .mn-cta'));
    });
  }

  // The old Linktree menu link becomes LINKS, pointing at /links (Maurice, 2026-10-07; from 10/4 it was hidden and
  // /links stayed off the menus for The Quiet One riddle). Runs after mainMerch, which clones an external menu item
  // as its template.
  function dropLinktree() {
    // With LINKS in it, the header row is a little wider: tighten its spacing on laptop widths so the Pre-Order
    // button stays on screen (items keep 10px or more between them).
    if (!document.getElementById('ma-hdr-fit')) {
      var st = document.createElement('style'); st.id = 'ma-hdr-fit';
      st.textContent = '@media (max-width:1280px){#header .header-display-desktop .header-nav{padding-left:16px!important}' +
        '#header .header-display-desktop .header-nav-item{margin-left:5px!important;margin-right:5px!important}}' +
        '@media (max-width:1060px){#header .header-display-desktop .header-nav{padding-left:8px!important}' +
        '#header .header-display-desktop .header-nav-folder-title[data-href="/preorder-cellos-gate"]{padding-left:9px!important;padding-right:9px!important}}';
      document.head.appendChild(st);
    }
    Array.prototype.forEach.call(document.querySelectorAll('#header a[href*="linktr.ee"], .header-menu-nav a[href*="linktr.ee"]'), function (a) {
      a.href = SITE + '/links'; a.removeAttribute('target'); a.removeAttribute('rel');
      (a.querySelector('.header-menu-nav-item-content') || a).textContent = 'Links';
    });
  }
  // The green hunt menu (desktop row and phone menu) gets LINKS right after MARKET (Maurice, 2026-10-07: in the row,
  // not folded into EARN POINTS).
  function huntLinks() {
    Array.prototype.forEach.call(document.querySelectorAll('#hunt-nav .mn-merch, #hunt-nav-ov .mn-merch'), function (m) {
      if (m.parentNode.querySelector('.mn-linkpage')) return;
      var a = m.cloneNode(false); a.href = SITE + '/links'; a.removeAttribute('target'); a.removeAttribute('rel');
      a.className = m.className.replace('mn-merch', 'mn-linkpage'); a.textContent = 'LINKS';
      m.parentNode.insertBefore(a, m.nextSibling);
    });
  }

  function quietWord() {
    var dec = function (k) { return atob(k).split('').reverse().join(''); };
    var phrase = dec('LGxsZVcgP2hjdGFjIGVoVA=='), tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = tw.nextNode())) {
      var at = n.nodeValue.indexOf(phrase);
      if (at < 0) continue;
      var w = n.splitText(at + phrase.length - 5); w.splitText(4);
      var s = document.createElement('span');
      w.parentNode.replaceChild(s, w); s.appendChild(w);
      s.addEventListener('click', function () { location.href = dec('OTc4MTUtYWVzLW5vY2kvbW9jLmhjaXJmYWVjaXJ1YW0ud3d3Ly86c3B0dGg='); });
      return;
    }
  }

  // Box 53, The Locked Loot Box (Maurice, 2026-10-04): "You find the chest first, when you find the chest, you get the
  // key clue." The chest hides in the teal under the newsletter signup; the key hides in the home page's Meet Maurice
  // social row ("one of these things doesn't belong here"). The key is kept in this browser only.
  // Box 98, "Unhand me!" (Maurice, 2026-10-16): his raised fist in the home page headshot. Click it and the box appears
  // in his hand; click the box to claim it. The spot is set in the photo's own proportions (it is cropped with object-fit:
  // cover), so it follows the fist at every width.
  function handBox98() {
    try {
      if ((location.pathname.replace(/\/+$/, '') || '/') !== '/') return;
      var K98 = 'VVA0N0ZSMkI9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo', HAND = { x0: .69, x1: .875, y0: .33, y1: .47 };
      var img = document.querySelector('img[src*="Maurice+Headshot"],img[data-src*="Maurice+Headshot"]');
      if (!img || img.getAttribute('data-ma98')) return;
      img.setAttribute('data-ma98', '1');
      if (!document.getElementById('ma98-css')) {
        var st = document.createElement('style'); st.id = 'ma98-css';
        st.textContent = '.ma98-spot{position:absolute;z-index:3;display:block;padding:0;margin:0;border:0;border-radius:0;background:transparent;cursor:default;-webkit-tap-highlight-color:transparent}' +
          '.ma98-spot:focus-visible{outline:2px solid #89fbcb;outline-offset:2px}' +
          '.ma98-spot img{display:block;width:100%;height:100%;object-fit:contain;opacity:0;transform:scale(.3);transition:opacity .35s ease,transform .45s cubic-bezier(.2,1.6,.4,1);filter:drop-shadow(0 0 10px #ffd36b)}' +
          '.ma98-spot.ma98-on{cursor:pointer}.ma98-spot.ma98-on img{opacity:1;transform:none}' +
          '@media (prefers-reduced-motion:reduce){.ma98-spot img{transition:none}}';
        document.head.appendChild(st);
      }
      var host = img.parentElement; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ma98-spot'; b.setAttribute('aria-label', 'His hand');
      b.innerHTML = '<img src="https://africhmaurice.github.io/leaderboard/loot/98.png" alt="">';
      host.appendChild(b);
      var place = function () {
        var W = img.clientWidth, H = img.clientHeight, nw = img.naturalWidth, nh = img.naturalHeight; if (!W || !H || !nw || !nh) return;
        var sc = Math.max(W / nw, H / nh), rw = nw * sc, rh = nh * sc, pos = (getComputedStyle(img).objectPosition || '50% 50%').split(' ');
        var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || pos[0]) / 100; if (isNaN(px)) px = .5; if (isNaN(py)) py = .5;
        var ox = (W - rw) * px + img.offsetLeft, oy = (H - rh) * py + img.offsetTop;
        var l = Math.max(img.offsetLeft, ox + HAND.x0 * rw), t = oy + HAND.y0 * rh, r = Math.min(img.offsetLeft + W, ox + HAND.x1 * rw), bt = oy + HAND.y1 * rh;
        b.style.left = l + 'px'; b.style.top = t + 'px'; b.style.width = Math.max(30, r - l) + 'px'; b.style.height = Math.max(30, bt - t) + 'px';
      };
      b.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (!b.classList.contains('ma98-on')) { b.classList.add('ma98-on'); b.setAttribute('aria-label', 'Open loot box 98'); return; }
        location.href = atob(K98).split('').reverse().join('');
      });
      place(); img.addEventListener('load', place); window.addEventListener('resize', place);
      var n = 0, iv = setInterval(function () { place(); if (++n > 20) clearInterval(iv); }, 500);
    } catch (e) {}
  }

  // Box 67, "To Be Or Not to Be" (Maurice, 2026-10-16): the words "ex-theater kid" in the home page bio look like plain
  // text. Click them and the box appears right after them; click the box to claim it.
  function theaterBox67() {
    try {
      if ((location.pathname.replace(/\/+$/, '') || '/') !== '/' || document.querySelector('.ma67-words')) return;
      var K67 = 'NzVLSlVUSzY9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo', W = 'ex-theater kid';
      var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), t = null, n;
      while ((n = tw.nextNode())) { if (n.nodeValue.indexOf(W) >= 0 && !n.parentElement.closest('[data-ma-page],script,style')) { t = n; break; } }
      if (!t) return;
      if (!document.getElementById('ma67-css')) {
        var st = document.createElement('style'); st.id = 'ma67-css';
        st.textContent = '.ma67-words{cursor:text;color:inherit}.ma67-box{display:inline-block;vertical-align:-.35em;width:0;height:1.6em;margin:0;padding:0;border:0;border-radius:0;background:none;cursor:pointer;overflow:hidden;transition:width .4s cubic-bezier(.2,1.6,.4,1),margin .4s ease}' +
          '.ma67-box img{display:block;height:100%;width:auto}.ma67-box.ma67-on{width:1.8em;margin:0 .15em}.ma67-box:focus-visible{outline:2px solid #89fbcb;outline-offset:2px}' +
          '@media (prefers-reduced-motion:reduce){.ma67-box{transition:none}}';
        document.head.appendChild(st);
      }
      var i = t.nodeValue.indexOf(W), after = t.splitText(i); after.splitText(W.length);
      var w = document.createElement('span'); w.className = 'ma67-words'; w.textContent = W; after.parentNode.replaceChild(w, after);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'ma67-box'; b.tabIndex = -1; b.setAttribute('aria-label', 'Open loot box 67');
      b.innerHTML = '<img src="https://africhmaurice.github.io/leaderboard/loot/67.png" alt="">';
      w.parentNode.insertBefore(b, w.nextSibling);
      w.addEventListener('click', function () { b.classList.add('ma67-on'); b.tabIndex = 0; });
      b.addEventListener('click', function (e) { e.preventDefault(); if (!b.classList.contains('ma67-on')) return; location.href = atob(K67).split('').reverse().join(''); });
    } catch (e) {}
  }

  function lockedChest53() {
    try {
      var KEY = 'ma-key53', path = location.pathname.replace(/\/+$/, '') || '/';
      if (path !== '/' && path !== '/newsletter') return;
      var has = function () { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
      var css = function () {
        if (document.getElementById('ma53-css')) return;
        var st = document.createElement('style'); st.id = 'ma53-css';
        st.textContent = '#ma53-chest{position:absolute;top:calc(100% + 16px);right:6%;width:34px;height:34px;z-index:2;transition:width .45s cubic-bezier(.2,.8,.3,1.2),height .45s cubic-bezier(.2,.8,.3,1.2)}#ma53-chest.ma53-shut{width:96px;height:96px}' +
          '#ma53-chest .ma53-box{display:block;position:relative;width:100%;height:100%;padding:0;margin:0;border:0;border-radius:0;background:none;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
          '#ma53-chest .ma53-box:focus-visible{outline:2px solid #89fbcb;outline-offset:4px}' +
          '#ma53-chest img{display:block;width:100%;height:100%;opacity:.5;filter:hue-rotate(105deg) saturate(.85) brightness(.85);transition:opacity .45s ease,filter .45s ease}#ma53-chest.ma53-shut img{opacity:1;filter:none}' +
          '#ma53-chest .ma53-lock{position:absolute;left:-8%;top:-8%;width:116%;height:116%;overflow:visible;pointer-events:none;opacity:0;transition:opacity .25s ease}' +
          '#ma53-chest.ma53-shut .ma53-lock{opacity:1}' +
          '#ma53-chest .ma53-pad{transition:transform .7s cubic-bezier(.5,0,.8,.4),opacity .7s ease}' +
          '#ma53-chest .ma53-chains{transition:opacity .5s ease .25s}' +
          '#ma53-chest.ma53-open .ma53-pad{transform:translateY(60px) rotate(18deg);opacity:0}' +
          '#ma53-chest.ma53-open .ma53-chains{opacity:0}' +
          '#ma53-chest.ma53-open img{opacity:1;mix-blend-mode:normal;filter:drop-shadow(0 0 14px #89fbcb) drop-shadow(0 0 4px #fffffe)}' +
          '#ma53-chest.ma53-rattle .ma53-box{animation:ma53r .5s linear}' +
          '@keyframes ma53r{0%,100%{transform:none}15%{transform:translateX(-4px) rotate(-5deg)}30%{transform:translateX(4px) rotate(4deg)}45%{transform:translateX(-3px) rotate(-3deg)}60%{transform:translateX(3px) rotate(2deg)}80%{transform:translateX(-1px)}}' +
          '#ma53-chest .ma53-note{position:absolute;right:calc(100% + 14px);top:0;box-sizing:border-box;width:max-content;max-width:400px;margin:0;padding:20px 22px;background:#0b170f;color:#f3ead9;border:2px solid #f3ead9;border-radius:0;font-family:Almarai,sans-serif;font-weight:700;font-size:16px;line-height:1.4;letter-spacing:.01em;text-align:left;text-transform:none}' +
          '#ma53-chest .ma53-note[hidden]{display:none}' +
          '#ma53-toast{position:fixed;left:50%;bottom:28px;z-index:2147483000;box-sizing:border-box;max-width:calc(100vw - 32px);padding:20px 26px;background:#0b170f;color:#f3ead9;border:2px solid #89fbcb;border-radius:0;font-family:Almarai,sans-serif;font-weight:700;font-size:17px;line-height:1.4;transform:translate(-50%,16px);opacity:0;transition:opacity .35s ease,transform .35s ease;pointer-events:none}' +
          '#ma53-toast.ma53-on{opacity:1;transform:translate(-50%,0)}' +
          '#ma53-key{transition:background-color .17s ease-in-out,opacity .45s ease}#ma53-key.ma53-got{opacity:0;pointer-events:none}' +
          '@media (max-width:640px){#ma53-chest{width:28px;height:28px;right:4%}#ma53-chest.ma53-shut{width:72px;height:72px}#ma53-chest .ma53-note{font-size:15px;padding:20px}}' +
          '@media (prefers-reduced-motion:reduce){#ma53-chest.ma53-rattle .ma53-box{animation:none}#ma53-chest *,#ma53-toast,#ma53-key{transition-duration:.01s!important;transition-delay:0s!important}}';
        document.head.appendChild(st);
      };
      if (path === '/') {
        // The key: a fourth icon in the Meet Maurice social row (not the footer's), drawn and colored like the others.
        if (has() || document.getElementById('ma53-key')) return;
        var nav = Array.prototype.filter.call(document.querySelectorAll('.sqs-block-socialaccountlinks-content .sqs-svg-icon--list'), function (x) { return !x.closest('footer'); })[0];
        if (!nav) return;
        css();
        var a = document.createElement('a');
        a.id = 'ma53-key'; a.href = '#'; a.className = 'sqs-svg-icon--wrapper'; a.setAttribute('aria-label', 'Key');
        a.innerHTML = '<div><svg class="sqs-svg-icon--social" viewBox="0 0 64 64"><g transform="translate(31.15 31.45) rotate(-45) scale(1) translate(-32 -32)">' +
          '<path class="sqs-use--icon" fill-rule="evenodd" d="M15.5 32a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0zM20.5 32a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0z"/>' +
          '<path class="sqs-use--icon" d="M31.5 30H48.5V34H31.5zM41 34H44V39.5H41zM45.5 34H48.5V38H45.5z"/></g></svg></div>';
        a.addEventListener('click', function (e) {
          e.preventDefault();
          if (a.classList.contains('ma53-got')) return;
          try { localStorage.setItem(KEY, '1'); } catch (er) {}
          a.classList.add('ma53-got');
          setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 480);
          var t = document.createElement('div'); t.id = 'ma53-toast'; t.setAttribute('role', 'status'); t.textContent = 'You found a key.';
          var old = document.getElementById('ma53-toast'); if (old) old.parentNode.removeChild(old);
          document.body.appendChild(t);
          requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('ma53-on'); }); });
          setTimeout(function () { t.classList.remove('ma53-on'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 500); }, 3600);
        });
        nav.appendChild(a);
        return;
      }
      // The chest: under the signup form, inside the form's own grid cell so it follows the form at every width.
      if (document.getElementById('ma53-chest')) return;
      var form = document.querySelector('form.formkit-form'), cell = form && form.closest('.fe-block'), sec = cell && cell.closest('section');
      if (!sec) { lockedChest53.n = (lockedChest53.n || 0) + 1; if (lockedChest53.n < 20) setTimeout(lockedChest53, 500); return; }
      css();
      if (getComputedStyle(cell).position === 'static') cell.style.position = 'relative';
      var k = 'VDUzNkVHU009Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo';
      var c = document.createElement('div'); c.id = 'ma53-chest';
      c.innerHTML = '<button type="button" class="ma53-box" aria-label="A locked chest"><img src="https://africhmaurice.github.io/leaderboard/loot/53.png" alt="Loot box 53" draggable="false">' +
        '<svg class="ma53-lock" viewBox="0 0 100 100" aria-hidden="true"><g class="ma53-chains" fill="none" stroke-linecap="butt">' +
        '<path d="M4 22L96 86M4 86L96 22" stroke="#0b170f" stroke-width="10" stroke-dasharray="11 4"/><path d="M4 22L96 86M4 86L96 22" stroke="#f3ead9" stroke-width="5" stroke-dasharray="11 4"/></g>' +
        '<g class="ma53-pad"><path d="M40 58V46a10 10 0 0 1 20 0V58" fill="none" stroke="#0b170f" stroke-width="8"/><path d="M40 58V46a10 10 0 0 1 20 0V58" fill="none" stroke="#f3ead9" stroke-width="4"/>' +
        '<rect x="32" y="54" width="36" height="28" fill="#c53200" stroke="#0b170f" stroke-width="3"/><circle cx="50" cy="65" r="3.6" fill="#0b170f"/><rect x="48.4" y="66" width="3.2" height="9" fill="#0b170f"/></g></svg></button>' +
        '<p class="ma53-note" role="status" hidden>one of these things doesn’t belong here</p>';
      cell.appendChild(c);
      var box = c.firstChild, note = c.lastChild, extra = 0, busy = false;
      // Breathing room: the note sits left of the chest; if the teal under the form is too short for the chest (and the
      // note, once it shows), the section grows by just enough to keep 16px clear above the footer.
      var fit = function () {
        sec.style.paddingBottom = ''; extra = 0;
        var cr = c.getBoundingClientRect(), sr = sec.getBoundingClientRect(), left = cr.left - 14 - Math.max(16, sr.left + 16);
        note.style.maxWidth = Math.max(160, Math.min(400, left)) + 'px';
        var bottom = Math.max(cr.bottom, note.hidden ? 0 : note.getBoundingClientRect().bottom);
        var need = Math.ceil(bottom + 16 - sr.bottom);
        if (need > 0) { extra = need; sec.style.paddingBottom = 'calc(' + (getComputedStyle(sec).paddingBottom || '0px') + ' + ' + need + 'px)'; }
      };
      fit();
      window.addEventListener('resize', fit);
      window.addEventListener('load', fit);
      box.addEventListener('click', function () {
        if (busy) return;
        if (has()) {
          busy = true;
          c.classList.add('ma53-shut'); note.hidden = true;
          setTimeout(function () { c.classList.add('ma53-open'); box.setAttribute('aria-label', 'An open chest'); }, still ? 0 : 280);
          setTimeout(function () { location.href = atob(k).split('').reverse().join(''); }, still ? 700 : 1500);
          return;
        }
        c.classList.remove('ma53-rattle'); void c.offsetWidth; c.classList.add('ma53-rattle', 'ma53-shut');
        note.hidden = false; fit(); setTimeout(fit, 500);
      });
    } catch (e) {}
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

  // ---- Batch 2 site tricks: loot boxes 87-93 (added at the batch 2 launch) -----------------------------------
  // 87 Secret Phrase: type SKYPIRATE (or SKY PIRATE) on any page, outside a text field, and box 87 drops in from the top.
  //    Phones have no keyboard to listen to, so typing the phrase into any text field on the site works too
  //    (the Questions form, the newsletter box, Submit Points). Nothing is sent: the field is only watched.
  // 88 Move the Comet: the Comet that falls into the U of the header logo can be dragged out. Box 88 sits in the
  //    U's ring behind it (it shows through the hole); click it once the Comet is out of the way. Dragging never goes
  //    home; a normal click on the logo still does.
  // 89 First Minute Only: on /leaderboard, box 89 sits at the end of the button row under the board, but only during
  //    the first minute of every hour by the visitor's own clock (:00:00 to :00:59).
  // 90 High Contrast Only: on /questions, box 90 sits under the intro, shown only when the device is in a high
  //    contrast mode (prefers-contrast: more, or forced colors / Windows contrast themes).
  // 91 Print It: on /lootbox-clue, box 91 and its claim link print right under the intro. The link text is written
  //    just before printing and wiped after, so it is never sitting in the page.
  // 92 Copy Trap: on /lootbox-clue, copying clue #92 adds a line with the box 92 claim link.
  // 93 Deliberate Typo: on /newsletter, "first looks" becomes "frist looks", and "frist" quietly opens box 93.
  var B2 = window.__maB2 || (window.__maB2 = {});
  var B2K = {
    87: 'N0pCRlNENzY9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo',
    88: 'RUEyTUY5M0o9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo',
    89: 'RDY1WFNBWE09Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo',
    90: 'RUZCUFk2V0E9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo',
    91: 'TTdSNzNDRk49Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo',
    92: 'MkNORThHUTQ9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo',
    93: 'VjJNQkJQNEU9Yz90b29sL21vYy5oY2lyZmFlY2lydWFtLnd3dy8vOnNwdHRo'
  };
  var b2url = function (n) { return atob(B2K[n]).split('').reverse().join(''); };
  var b2open = function (n) { location.href = b2url(n); };
  var b2art = function (n) { return 'https://africhmaurice.github.io/leaderboard/loot/' + n + '.png'; };
  var b2path = function () { return location.pathname.replace(/\/+$/, '') || '/'; };
  // Tries fn now and every half second until it says it is done (true), up to about 15 seconds.
  var b2wait = function (name, fn) {
    if (B2[name]) return; B2[name] = 'trying';
    var tries = 0, go = function () { var ok = false; try { ok = fn(); } catch (e) { ok = true; } if (ok) B2[name] = 'done'; else if (++tries < 30) setTimeout(go, 500); };
    go();
  };
  function b2css() {
    if (document.getElementById('ma-b2-css')) return;
    var st = document.createElement('style'); st.id = 'ma-b2-css';
    st.textContent =
      '.ma-b2-drop{position:fixed;inset:0;z-index:2147482000;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:28px;padding:clamp(110px,22vh,220px) 20px 20px;background:rgba(11,23,15,0);transition:background .35s ease}' +
      '.ma-b2-drop.ma-b2-on{background:rgba(11,23,15,.86)}' +
      '.ma-b2-drop .ma-b2-box,.ma-b2-drop .ma-b2-box:hover{display:block;width:min(58vw,240px);height:auto;min-width:0;min-height:0;padding:0!important;margin:0;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;cursor:pointer;transform:translateY(-130vh);-webkit-tap-highlight-color:transparent}' +
      '.ma-b2-drop.ma-b2-on .ma-b2-box{transform:none;transition:transform .9s cubic-bezier(.3,1.3,.5,1)}' +
      '.ma-b2-drop .ma-b2-box img{display:block;width:100%;height:auto;filter:drop-shadow(0 0 30px rgba(137,251,203,.45))}' +
      '.ma-b2-drop .ma-b2-box:focus-visible{outline:3px solid #89fbcb;outline-offset:8px}' +
      '.ma-b2-drop .ma-b2-x{position:static;flex:none;width:48px;height:48px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;padding:0!important;margin:0;border:2px solid #f3ead9!important;border-radius:0;background:#0b170f!important;color:#f3ead9!important;box-shadow:none!important;cursor:pointer}' +
      '.ma-b2-drop .ma-b2-x:hover,.ma-b2-drop .ma-b2-x:focus-visible{background:#f3ead9!important;color:#0b170f!important}' +
      '.ma-b2-drop .ma-b2-x svg{width:20px;height:20px}' +
      '.ma-b2-logo{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;isolation:isolate}' +
      '.ma-b2-cm{position:absolute;pointer-events:none;margin:0;padding:0}' +
      '.ma-b2-cm img{position:absolute;display:block;max-width:none;margin:0;padding:0;border:0;-webkit-user-drag:none;user-select:none}' +
      '.ma-b2-cm-under{z-index:-1}.ma-b2-cm-over{z-index:2}' +
      '.ma-b2-cm-over span{position:absolute;box-sizing:content-box;pointer-events:auto;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent}' +
      '.ma-b2-cm-over span.ma-b2-held{cursor:grabbing}' +
      '.ma-b2-cm-over span img{position:static;width:100%;height:100%}' +
      '#lb-more .ma-b2-89,#lb-more .ma-b2-89:hover{display:block;align-self:center;width:72px;height:72px;min-width:0;min-height:0;padding:0!important;margin:0;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;cursor:pointer}' +
      '#lb-more .ma-b2-89[hidden]{display:none}' +
      '#lb-more .ma-b2-89 img{display:block;width:100%;height:100%;filter:drop-shadow(0 4px 0 rgba(0,0,0,.35))}' +
      '#lb-more .ma-b2-89:hover{transform:scale(1.06)}' +
      '.ma-b2-hc{display:none}' +
      '@media (prefers-contrast:more),(forced-colors:active){.ma-b2-hc{display:flex;justify-content:center;margin:24px 0 0;forced-color-adjust:none}}' +
      '.ma-b2-hc button,.ma-b2-hc button:hover{display:block;width:120px;height:auto;min-width:0;min-height:0;padding:0!important;margin:0;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;cursor:pointer;forced-color-adjust:none}' +
      '.ma-b2-hc img{display:block;width:100%;height:auto;forced-color-adjust:none}' +
      '.ma-b2-hc button:focus-visible{outline:3px solid CanvasText;outline-offset:6px}' +
      '.ma-b2-print{display:none}' +
      '@media print{.ma-b2-print{display:block!important;box-sizing:border-box;max-width:560px;margin:28px auto;padding:24px;border:3px solid #000;background:#fff;color:#000;text-align:center;font-family:Almarai,sans-serif;break-inside:avoid;page-break-inside:avoid}' +
      '.ma-b2-print img{display:block;width:170px;height:auto;margin:0 auto 16px}.ma-b2-print p{margin:0 0 10px!important;padding:0!important;color:#000!important;opacity:1!important;transform:none!important;text-shadow:none!important;font-family:Almarai,sans-serif!important;font-size:15px!important;font-weight:400!important;line-height:1.5!important;letter-spacing:0!important;text-transform:none!important}' +
      '.ma-b2-print p.ma-b2-u{margin:0!important;font-weight:700!important;font-size:16px!important;word-break:break-all}}' +
      '@media (prefers-reduced-motion:reduce){.ma-b2-drop,.ma-b2-drop.ma-b2-on .ma-b2-box{transition:none}}';
    document.head.appendChild(st);
  }
  // The shared reveal: the box falls in from the top of the screen. Click it to claim; the X, Escape, or a click
  // outside it puts it away.
  function b2drop(n) {
    try {
      if (document.querySelector('.ma-b2-drop')) return;
      b2css();
      var d = document.createElement('div'); d.className = 'ma-b2-drop'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Loot box ' + n);
      d.innerHTML = '<button type="button" class="ma-b2-box" aria-label="Open loot box ' + n + '"><img src="' + b2art(n) + '" alt="Loot box ' + n + '" draggable="false"></button>' +
        '<button type="button" class="ma-b2-x" aria-label="Close"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true"><path d="M3 3l14 14M17 3L3 17"/></svg></button>';
      var shut = function () { document.removeEventListener('keydown', esc, true); if (d.parentNode) d.parentNode.removeChild(d); };
      var esc = function (e) { if (e.key === 'Escape') shut(); };
      // Only a click that starts and ends on the dark backdrop closes it (letting go of a long press over it does not).
      var downOnBack = false;
      d.addEventListener('pointerdown', function (e) { downOnBack = e.target === d; });
      d.addEventListener('click', function (e) { if (e.target === d && downOnBack) shut(); downOnBack = false; });
      d.querySelector('.ma-b2-x').addEventListener('click', shut);
      d.querySelector('.ma-b2-box').addEventListener('click', function () { b2open(n); });
      document.addEventListener('keydown', esc, true);
      document.body.appendChild(d);
      requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('ma-b2-on'); }); });
    } catch (e) {}
  }

  // 87
  function b2phrase() {
    if (B2.phrase) return; B2.phrase = 1;
    var said = function (s) { return /SKYPIRATE$/.test(String(s || '').toUpperCase().replace(/[^A-Z]/g, '')); };
    var buf = '';
    document.addEventListener('keydown', function (e) {
      try {
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
        // the space in SKY PIRATE should not scroll the page
        if (e.key === ' ' && /SKY$/.test(buf.toUpperCase().replace(/[^A-Z]/g, ''))) e.preventDefault();
        buf = (buf + e.key).slice(-24);
        if (said(buf)) { buf = ''; b2drop(87); }
      } catch (er) {}
    }, true);
    document.addEventListener('input', function (e) {
      try {
        var t = e.target;
        if (!t || !/^(INPUT|TEXTAREA)$/.test(t.tagName) || t.type === 'password') return;
        if (said(t.value)) b2drop(87);
      } catch (er) {}
    }, true);
  }

  // 88
  // Where the Comet sits in the 640 x 396 logo, and where box 88 hides behind it (center x, center y, size).
  var CM = { box: [207, 4, 84, 146], loot: [263, 122, 74], w: 640 };
  var CMBASE = 'https://africhmaurice.github.io/site/assets/img/';
  function b2comet() {
    var found = false;
    Array.prototype.forEach.call(document.querySelectorAll('.header-title-logo img[data-ma-logo], .header-mobile-logo img[data-ma-logo], #hunt-nav .mn-logo img[data-ma-logo]'), function (img) {
      found = true;
      if (img.__maComet) return; img.__maComet = 1;
      var a = img.closest('a') || img.parentElement; if (!a) return;
      b2css(); a.classList.add('ma-b2-logo'); img.setAttribute('draggable', 'false');
      if (getComputedStyle(a).position === 'static') a.style.position = 'relative';
      var under = document.createElement('span'), over = document.createElement('span');
      under.className = 'ma-b2-cm ma-b2-cm-under'; over.className = 'ma-b2-cm ma-b2-cm-over';
      under.innerHTML = '<img src="' + b2art(88) + '" alt="" draggable="false">';
      over.innerHTML = '<span role="img" aria-label="The Comet"><img src="' + CMBASE + 'logo-comet.png" alt="" draggable="false"></span>';
      a.appendChild(under); a.appendChild(over);
      var loot = under.firstChild, grip = over.firstChild, dx = 0, dy = 0, moved = false, drag = null, ate = 0;
      // The logo without its Comet stays in place; box 88 sits behind it (showing through the U's hole) and the
      // Comet sits on top, both laid exactly over the logo picture.
      var place = function () {
        var r = img.getBoundingClientRect(), p = a.getBoundingClientRect(); if (!r.width) return;
        [under, over].forEach(function (o) { o.style.left = (r.left - p.left) + 'px'; o.style.top = (r.top - p.top) + 'px'; o.style.width = r.width + 'px'; o.style.height = r.height + 'px'; });
        var k = r.width / CM.w, L = CM.loot, B = CM.box, pad = 6;   // pad: a few pixels of extra grip around the thin Comet
        // The header's own image rules size every picture in the logo, so these sizes are set as important.
        var set = function (el, prop, v) { el.style.setProperty(prop, v, 'important'); };
        set(loot, 'width', L[2] * k + 'px'); set(loot, 'height', L[2] * k + 'px'); set(loot, 'max-height', 'none'); set(loot, 'left', (L[0] - L[2] / 2) * k + 'px'); set(loot, 'top', (L[1] - L[2] / 2) * k + 'px');
        set(grip, 'left', (B[0] * k - pad) + 'px'); set(grip, 'top', (B[1] * k - pad) + 'px'); set(grip, 'width', B[2] * k + 'px'); set(grip, 'height', B[3] * k + 'px'); set(grip, 'padding', pad + 'px');
        var ci = grip.firstChild; set(ci, 'width', B[2] * k + 'px'); set(ci, 'height', B[3] * k + 'px'); set(ci, 'max-height', 'none'); set(ci, 'max-width', 'none');
        grip.style.transform = 'translate(' + dx * r.width + 'px,' + dy * r.width + 'px)';
        // The box stays out of sight until the Comet has been pulled clear of the ring.
        set(loot, 'visibility', Math.sqrt(dx * dx + dy * dy) > 0.07 ? 'visible' : 'hidden');
      };
      var swap = function () { if (!/nocomet/.test(img.src)) img.src = CMBASE + 'logo-2026-white-nocomet.webp'; };
      swap(); place();
      img.addEventListener('load', function () { swap(); place(); });
      window.addEventListener('resize', place); setTimeout(place, 600); setTimeout(place, 2500);
      grip.addEventListener('pointerdown', function (e) {
        if (e.button) return; e.preventDefault(); e.stopPropagation();
        var r = img.getBoundingClientRect(); drag = { x: e.clientX, y: e.clientY, dx: dx, dy: dy, w: r.width };
        try { grip.setPointerCapture(e.pointerId); } catch (er) {} grip.classList.add('ma-b2-held');
      });
      grip.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var mx = e.clientX - drag.x, my = e.clientY - drag.y; if (Math.abs(mx) + Math.abs(my) > 3) moved = true;
        dx = drag.dx + mx / drag.w; dy = drag.dy + my / drag.w; place();
      });
      var drop = function () { if (!drag) return; drag = null; grip.classList.remove('ma-b2-held'); if (moved) ate = Date.now(); };
      grip.addEventListener('pointerup', drop); grip.addEventListener('pointercancel', drop);
      grip.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
      grip.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
      // Clicks on the logo: on the Comet or right after a drag, nothing happens. With the Comet out of the way, a
      // click on the hole where it was opens box 88. Any other click still goes home.
      a.addEventListener('click', function (e) {
        if (Date.now() - ate < 400 || (e.target && e.target.closest && e.target.closest('.ma-b2-cm-over'))) { e.preventDefault(); e.stopPropagation(); return; }
        if (!moved) return;
        var lr = loot.getBoundingClientRect(), gr = grip.getBoundingClientRect();
        var inLoot = e.clientX >= lr.left && e.clientX <= lr.right && e.clientY >= lr.top && e.clientY <= lr.bottom;
        var covered = e.clientX >= gr.left && e.clientX <= gr.right && e.clientY >= gr.top && e.clientY <= gr.bottom;
        if (inLoot && !covered) { e.preventDefault(); e.stopPropagation(); b2drop(88); }
      }, true);
      a.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
    return found;
  }

  // 89
  function b2minute() {
    if (b2path() !== '/leaderboard') return true;
    var row = document.getElementById('lb-more');
    if (!row) return false;
    if (row.querySelector('.ma-b2-89')) return true;
    b2css();
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ma-b2-89'; b.hidden = true; b.setAttribute('aria-label', 'Open loot box 89');
    b.innerHTML = '<img src="' + b2art(89) + '" alt="Loot box 89" draggable="false">';
    b.addEventListener('click', function () { if (new Date().getMinutes() === 0) b2open(89); });
    row.appendChild(b);
    var tick = function () { var on = new Date().getMinutes() === 0; if (b.hidden === on) b.hidden = !on; };
    tick(); setInterval(tick, 1000);
    return true;
  }

  // 90
  function b2contrast() {
    if (b2path() !== '/questions') return true;
    var head = document.querySelector('#hq .hq-head');
    if (!head) return false;
    if (head.querySelector('.ma-b2-hc')) return true;
    b2css();
    var w = document.createElement('div'); w.className = 'ma-b2-hc';
    w.innerHTML = '<button type="button" aria-label="Open loot box 90"><img src="' + b2art(90) + '" alt="Loot box 90" draggable="false"></button>';
    w.firstChild.addEventListener('click', function () { b2open(90); });
    head.appendChild(w);
    return true;
  }

  // 91
  function b2print() {
    if (b2path() !== '/lootbox-clue') return true;
    var intro = document.querySelector('#loot-clue .lc-intro');
    if (!intro) return false;
    if (document.querySelector('.ma-b2-print')) return true;
    b2css();
    var p = document.createElement('div'); p.className = 'ma-b2-print'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<img src="' + b2art(91) + '" alt="Loot box 91"><p>You printed the clues. Very old school. This one only shows up on paper:</p><p class="ma-b2-u"></p>';
    intro.parentNode.insertBefore(p, intro.nextSibling);
    var u = p.querySelector('.ma-b2-u');
    var fill = function () { try { u.textContent = b2url(91); } catch (e) {} };
    var wipe = function () { u.textContent = ''; };
    window.addEventListener('beforeprint', fill);
    window.addEventListener('afterprint', wipe);
    try { var mq = matchMedia('print'), ch = function (m) { if (m.matches) fill(); else wipe(); }; if (mq.addEventListener) mq.addEventListener('change', ch); else mq.addListener(ch); } catch (e) {}
    return true;
  }

  // 92
  function b2copy() {
    if (b2path() !== '/lootbox-clue') return true;
    if (B2.copyOn) return true; B2.copyOn = 1;
    document.addEventListener('copy', function (e) {
      try {
        var card = document.querySelector('#loot-clue .lc-board[data-clue="92"]'), sel = window.getSelection();
        if (!card || !sel || !sel.rangeCount || sel.isCollapsed || !e.clipboardData) return;
        var r = sel.getRangeAt(0);
        if (!card.contains(r.startContainer) && !card.contains(r.endContainer) && !r.intersectsNode(card)) return;
        e.clipboardData.setData('text/plain', sel.toString() + '\n\nP.S. Clippy saw that. Here is loot box 92 for your trouble: ' + b2url(92));
        e.preventDefault();
      } catch (er) {}
    });
    return true;
  }

  // 93
  function b2typo() {
    if (b2path() !== '/newsletter') return true;
    if (document.querySelector('.ma-b2-typo')) return true;
    var phrase = 'exclusive first looks', tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = tw.nextNode())) {
      var at = n.nodeValue.indexOf(phrase);
      if (at < 0) continue;
      var w = n.splitText(at + 10); w.splitText(5);
      var s = document.createElement('span'); s.className = 'ma-b2-typo'; s.textContent = 'frist';
      w.parentNode.replaceChild(s, w);
      s.addEventListener('click', function () { b2open(93); });
      return true;
    }
    return false;
  }

  function b2Tricks() {
    try { b2phrase(); } catch (e) {}
    b2wait('comet', b2comet);
    // Header logos inside pages the loader mounts (the hunt menu) arrive later: look again once they have.
    if (!B2.cometAgain) { B2.cometAgain = 1; setTimeout(function () { try { b2comet(); } catch (e) {} }, 4000); setTimeout(function () { try { b2comet(); } catch (e) {} }, 9000); }
    b2wait('minute', b2minute);
    b2wait('contrast', b2contrast);
    b2wait('print', b2print);
    b2wait('copy', b2copy);
    b2wait('typo', b2typo);
  }
  // ---- end of batch 2 site tricks ----

  // The new special editions sit right after Walmart's in every Pre-Order list (Maurice, 2026-10-12): the Waterstones
  // Exclusive Edition and the Broken Binding edition. Added here so the Squarespace, hunt, and shop menus all match.
  var SPECIAL = [['Waterstones Exclusive Edition', 'https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399766227'],
    ['Broken Binding Special Edition', 'https://thebrokenbindingsub.com/products/cellos-gate']];
  // "Read Excerpt" first in the Pre-Order dropdown (Maurice, 2026-10-16): Chapter One on the Simon & Schuster page,
  // which opens its excerpt section straight away. Copies the Walmart link's wrapper so it lines up with the others.
  function readExcerpt() {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="Walmart-Exclusive-Hardcover"]'), function (a) {
      if (a.__maRX || a.querySelector('img') || !a.closest('#header, #hunt-nav, #hunt-nav-ov, .header-menu, .tm-header')) return;
      a.__maRX = true;
      var unit = a.parentNode.children.length === 1 && /header-nav-folder-item|header-menu-nav-item/.test(a.parentNode.className) ? a.parentNode : a;
      var box = unit.parentNode, caps = a.textContent.trim() === a.textContent.trim().toUpperCase();
      if (box.querySelector('a[href="https://www.simonandschuster.com/books/Cellos-Gate/Maurice-Africh/The-Sky-Pirates-of-Imperia/9781668242834#excerpt"]')) return;
      var n = unit.cloneNode(true), link = n.tagName === 'A' ? n : n.querySelector('a');
      link.href = 'https://www.simonandschuster.com/books/Cellos-Gate/Maurice-Africh/The-Sky-Pirates-of-Imperia/9781668242834#excerpt'; link.textContent = caps ? 'READ EXCERPT' : 'Read Excerpt'; link.__maSE = true; link.__maRX = true;
      link.target = '_blank'; link.rel = 'noopener';
      box.insertBefore(n, box.firstElementChild);
    });
  }

  function specialEditions() {
    Array.prototype.forEach.call(document.querySelectorAll('a[href*="Walmart-Exclusive-Hardcover"]'), function (a) {
      if (a.__maSE || a.querySelector('img') || !a.closest('#header, #hunt-nav, #hunt-nav-ov, .header-menu, .tm-header')) return;
      a.__maSE = true;
      // a link alone in its own wrapper (Squarespace's folder items) gets its wrapper copied, so the new ones line up
      var unit = a.parentNode.children.length === 1 && /header-nav-folder-item|header-menu-nav-item/.test(a.parentNode.className) ? a.parentNode : a;
      var box = unit.parentNode, after = unit, caps = a.textContent.trim() === a.textContent.trim().toUpperCase();
      SPECIAL.forEach(function (s) {
        if (box.querySelector('a[href="' + s[1] + '"]')) return;
        var n = unit.cloneNode(true), link = n.tagName === 'A' ? n : n.querySelector('a');
        link.href = s[1]; link.textContent = caps ? s[0].toUpperCase() : s[0]; link.__maSE = true;
        box.insertBefore(n, after.nextSibling); after = n;
      });
    });
  }

  function scan() {
    specialEditions(); readExcerpt();
    headRule();
    lockedChest53();
    handBox98();
    theaterBox67();
    if (document.body) quietWord();
    b2Tricks();
    huntGift();
    huntOne();
    mainMerch();
    dropLinktree();
    huntDropdown();
    mainOrder();
    if (document.querySelector('#header .header-nav-list[data-ma-order]')) boxMainDrops();
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
