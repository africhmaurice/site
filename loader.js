/* Maurice Africh site loader.
   Each Squarespace Code Block holds only:
     <div data-ma-page="the-hunt"></div>
     <script src="https://africhmaurice.github.io/site/loader.js"></script>
   This script fetches pages/<slug>.html from GitHub Pages, drops it in, and runs its scripts in order.
   Edits published from Claude Code show up within about a minute (the fetch is cache-busted per minute).
   Loaded once site-wide from Code Injection (in <head>), it also shows the crest loading screen.
   Every copy after the first only mounts blocks it finds, so a page can include it any number of times. */
(function () {
  if (window.__maLoader) { window.__maLoader(); return; }
  var me = document.currentScript;
  var inHead = !!(me && me.parentNode && me.parentNode.nodeName === 'HEAD');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending = 0;
  var BASE = me ? me.src.replace(/loader\.js.*$/, '') : 'https://africhmaurice.github.io/site/';
  var stamp = Math.floor(Date.now() / 60000);

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
    var go = function () { target.scrollIntoView({ block: 'start' }); };
    go();
    setTimeout(go, 400); setTimeout(go, 1500); // again after late images and fonts settle the layout
  }

  function mount(el) {
    if (el.getAttribute('data-ma-state')) return;
    el.setAttribute('data-ma-state', 'loading');
    var slug = el.getAttribute('data-ma-page');
    pending++;
    fetch(BASE + 'pages/' + slug + '.html?v=' + stamp)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        el.innerHTML = html;
        return runScripts(el);
      })
      .then(function () {
        el.setAttribute('data-ma-state', 'ready');
        pending--; reveal(el);
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

  // Scroll animations: headings, cards and boards in a custom section rise and fade in as they come on screen.
  var REVEAL = 'h1,h2,h3,.tm-card,.lc-board,.po-hero,.po-region,.m-list,.m-ptsnote,[data-reveal]';
  var io;
  function reveal(root) {
    if (still || !('IntersectionObserver' in window)) return;
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
        e.target.style.transitionDelay = Math.min(n++, 5) * 90 + 'ms';
        e.target.classList.add('ma-in');
        setTimeout(function () { e.target.style.transitionDelay = ''; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(root.querySelectorAll(REVEAL), function (x) {
      // skip menus, fixed bars and anything already animated or nested in something that animates
      if (x.closest('#hunt-nav,#hunt-nav-ov,nav,header,.ma-rv') || getComputedStyle(x).position === 'fixed') return;
      x.classList.add('ma-rv');
      io.observe(x);
    });
  }

  // Loading screen: the crest in white on dark green fills with red while the page loads, then fades away.
  // Only when this script is installed site-wide in <head>; add ?ma-loading to any page URL to preview it.
  function loadingScreen() {
    var ov = document.createElement('div');
    ov.id = 'ma-loading'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<style>#ma-loading{position:fixed;inset:0;z-index:2147483600;background:#0b170f;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease,visibility .5s}' +
      '#ma-loading.ma-done{opacity:0;visibility:hidden}' +
      '#ma-loading .ma-crest{position:relative;width:min(60vw,340px);aspect-ratio:2/1;background:#fffffe;-webkit-mask:url(' + BASE + 'assets/img/crest-mask.png) center/contain no-repeat;mask:url(' + BASE + 'assets/img/crest-mask.png) center/contain no-repeat}' +
      '#ma-loading .ma-red{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#e0301e,#c11212 40%,#8e0e0e);transition:height .35s ease-out}</style>' +
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
      '@media (max-width:900px),(hover:none){.ma-fixed-bg{background-attachment:scroll!important}}';
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

  function scan() {
    fixedBackgrounds();
    Array.prototype.forEach.call(document.querySelectorAll('[data-ma-page]'), mount);
  }
  window.__maLoader = scan;
  if (document.body) fixedBackgrounds();
  // Sections below the first code block aren't parsed yet when this runs near the top of the page.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', fixedBackgrounds);
  Array.prototype.forEach.call(document.querySelectorAll('[data-ma-page]'), mount);
})();
