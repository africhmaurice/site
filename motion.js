// Site motion (Maurice, 2026-11-12): a tech-forward motion style after myfrida.com. Smooth weighted scrolling,
// a progress line across the top, the first section easing back as you scroll past it, blocks that tilt up into
// place (tied to the scroll, so they play backward when you scroll up), headings that decode in letter by
// letter, rows of cards that flip in one after another, a floating cover that drifts and tilts toward the
// pointer, and buttons that lean toward the cursor. loader.js decides which pages get it (the home page first)
// and never loads it for people whose device asks for less motion, or on game pages.
(function () {
  if (window.__maMotionOn) return;
  window.__maMotionOn = true;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(v) { return v * v * (3 - 2 * v); }

  var css = document.createElement('style');
  css.id = 'ma-motion-css';
  css.textContent =
    'html.lenis,html.lenis body{height:auto}html.lenis.lenis-smooth{scroll-behavior:auto!important}' +
    '.lenis:not(.lenis-autoToggle).lenis-stopped{overflow:clip}.lenis [data-lenis-prevent]{overscroll-behavior:contain}' +
    '#ma-progress{position:fixed;left:0;top:0;width:100%;height:3px;z-index:2147483000;pointer-events:none;' +
    'background:linear-gradient(90deg,#3adb97,#ff4c0f);transform-origin:0 50%;transform:scaleX(0)}' +
    // anything flying past the edges of the page (falling icons) is cut off there instead of making the page longer
    '#siteWrapper{overflow:clip}' +
    '.ma-ul,.ma-ul *,.ma-ulh{text-decoration:none!important}' +
    '.ma-ul,.ma-ulh{background-image:linear-gradient(currentColor,currentColor);background-repeat:no-repeat;background-position:0 100%;background-size:0% 1.5px}' +
    '.ma-ul{transition:background-size .8s cubic-bezier(.2,.7,.2,1)}.ma-ul.ma-ul-on{background-size:100% 1.5px}' +
    '.ma-ul.ma-ul-on:hover{animation:ma-swipe .7s cubic-bezier(.6,0,.2,1)}' +
    '@keyframes ma-swipe{0%{background-position:100% 100%;background-size:100% 1.5px}45%{background-position:100% 100%;background-size:0% 1.5px}46%{background-position:0 100%;background-size:0% 1.5px}100%{background-position:0 100%;background-size:100% 1.5px}}' +
    '.ma-ulh{background-position:100% 100%;transition:background-size .45s cubic-bezier(.6,0,.2,1)}.ma-ulh:hover,.ma-ulh:focus-visible{background-position:0 100%;background-size:100% 1.5px}' +
    '.mrv.ma-spin .mrv-slide{transition-duration:var(--ma-spd,.6s)!important;transition-timing-function:linear!important;filter:blur(var(--ma-blur,0px))}' +
    '.ma-mq{overflow:hidden}.ma-mq-track{display:flex;width:max-content;will-change:transform}.ma-mq-set{display:flex;align-items:center;flex:none}' +
    '.ma-dw{white-space:nowrap}.ma-dlock .ma-dc{display:inline-block;text-align:center}' +
    // the 3D depth layer copies the heading's words, so it steps out while the letters decode and fades back in after
    '.ma-dh::before,.ma-dh::after{transition:opacity .45s ease}.ma-dh.ma-dec::before,.ma-dh.ma-dec::after{opacity:0!important;transition:none}';
  document.head.appendChild(css);

  // game pages load this for the footer alone: no smooth scrolling, no progress line, nothing else moves
  var fonly = !!window.MA_MOTION_FOOTER_ONLY;
  // Smooth scrolling for mouse wheels and trackpads; touch screens keep their own scrolling.
  if (fine && !fonly) {
    var ls = document.createElement('script');
    ls.src = 'https://cdn.jsdelivr.net/npm/lenis@1.3.23/dist/lenis.min.js';
    ls.onload = function () {
      if (typeof window.Lenis !== 'function' || window.maLenis) return;
      window.maLenis = new window.Lenis({ autoRaf: true, autoToggle: true, anchors: true, allowNestedScroll: true,
        smoothWheel: true, syncTouch: false, lerp: 0.07, wheelMultiplier: 0.85 });   // a little longer glide (Maurice, 2026-11-12: smoother)
    };
    document.head.appendChild(ls);
  }

  var bar = document.createElement('div');
  bar.id = 'ma-progress';
  bar.setAttribute('aria-hidden', 'true');
  if (!fonly) document.body.appendChild(bar);

  var items = [], heads = [], magnets = [], seen = typeof WeakSet === 'function' ? new WeakSet() : null;
  function mark(el) { if (seen) { if (seen.has(el)) return false; seen.add(el); return true; } if (el.__maM) return false; el.__maM = 1; return true; }
  function out(x) { return !!x.closest('header,footer,nav,#hunt-nav,#hunt-nav-ov,#ma-loading,#ma-foot'); }
  function words(el) { return (el.innerText || '').replace(/\s+/g, '').length; }

  // Finds what to move. Safe to run again: anything already found is left alone.
  function scan() {
    if (fonly) { footer(); return; }
    var secs = document.querySelectorAll('#page section.page-section, #sections > section');
    Array.prototype.forEach.call(secs, function (sec, si) {
      if (out(sec)) return;
      var r = sec.getBoundingClientRect(), loading = sec.querySelector('[data-ma-state]:not([data-ma-state="ready"])');
      if (si === 0 && loading) return;   // looked at again once its page arrives
      // a page that runs its own motion ([data-ma-own], like The Hunt) only gets the pieces it marks [data-ma-rise]:
      // the mark stays still and is measured, its first child rises
      if (sec.querySelector('[data-ma-own]')) {
        Array.prototype.forEach.call(sec.querySelectorAll('[data-ma-rise]'), function (w) {
          var inner = w.firstElementChild || w;
          if (mark(w)) items.push({ type: 'rise', sec: w.closest('section') || sec, el: inner, ref: w, i: 0 });
        });
        return;
      }
      if (si === 0 && r.height > innerHeight * 0.6 && sec.querySelector('#ma-slider')) {
        // a slider eases back on its own, so a band under it (the icons) stays put
        var cw = sec.querySelector('#ma-slider');
        if (cw && mark(cw)) items.push({ type: 'hero', el: cw, ref: sec });
        return;
      }
      var blocks = Array.prototype.filter.call(sec.querySelectorAll('.fe-block'), function (b) {
        var br = b.getBoundingClientRect();
        return br.width > 0 && br.height > 0 && !out(b);
      });
      // three or more blocks side by side make a row of cards
      var lefts = [];
      blocks.forEach(function (b) {
        var x = Math.round(b.getBoundingClientRect().left / 6);
        if (lefts.indexOf(x) < 0) lefts.push(x);
      });
      lefts.sort(function (a, b) { return a - b; });
      // cards: three or more blocks starting at the same height, side by side without overlapping
      var rows = {}, cards = false;
      blocks.forEach(function (b) {
        var br = b.getBoundingClientRect(), k = Math.round(br.top / 10);
        (rows[k] = rows[k] || []).push(br);
      });
      Object.keys(rows).forEach(function (k) {
        var row = rows[k].sort(function (a, b) { return a.left - b.left; }), n = 0, edge = -1e9;
        row.forEach(function (br) { if (br.left >= edge - 1) { n++; edge = br.right; } });
        if (n >= 3) cards = true;
      });
      blocks.forEach(function (b, bi) {
        var inner = b.querySelector('.sqs-block') || b.firstElementChild;
        if (!inner || !mark(b)) return;
        // a block taller than the screen is a whole page in one block: tipping it in tilts the entire page, menu and
        // all (Maurice, 2026-11-12: "the arcade looks wild and off putting at a slant"). It stays still; its own
        // pieces move instead (data-ma-fly, data-ma-pop, data-ma-par, data-ma-wipe, or data-ma-own with data-ma-rise).
        if (b.getBoundingClientRect().height > innerHeight * 1.2) return;
        var img = b.querySelector('img');
        if (cards) {
          var col = lefts.indexOf(Math.round(b.getBoundingClientRect().left / 6));
          items.push({ type: 'card', sec: sec, el: inner, ref: sec, b: b, i: col, key: si + ':' + col });
          return;
        }
        // a plain colored panel has no words, pictures, links, or icons (a row of social icons is not a panel)
        if (!img && !words(b) && !b.querySelector('a,svg,video,iframe')) { items.push({ type: 'panel', sec: sec, el: b, ref: b }); return; }
        if (img) {
          var ir = img.getBoundingClientRect(), br = b.getBoundingClientRect();
          // a picture that does not fill its block (a cover on its own) floats; a picture that fills it drifts inside its frame
          if (ir.height < br.height * 0.9) { items.push({ type: 'float', sec: sec, el: inner, ref: b, tx: 0, ty: 0, x: 0, y: 0 }); return; }
          items.push({ type: 'rise', sec: sec, el: inner, ref: b, i: bi, img: img });
          return;
        }
        items.push({ type: 'rise', sec: sec, el: inner, ref: b, i: bi });
      });
    });
    // section background photos drift slower than the page, like a window onto a fixed scene
    Array.prototype.forEach.call(document.querySelectorAll('#page .section-background img'), function (img) {
      var sec = img.closest('section');
      if (!sec || !mark(img)) return;
      img.parentElement.style.overflow = 'hidden';
      items.push({ type: 'bgpar', el: img, ref: sec });
    });
    flourish();
    footer();
    socials();
    reviews();
    var hsel = '#page h1, #page h2, #page h3, #footer-sections h1, #footer-sections h2, #footer-sections h3, #footer-sections h4, #ma-foot h3';
    Array.prototype.forEach.call(document.querySelectorAll(hsel), function (h) {
      if ((out(h) && !h.closest('#footer-sections,#ma-foot')) || h.closest('[data-ma-page="home-slider"]') || h.querySelector('a,button,img,svg,input')) return;
      if (!h.textContent.trim() || !mark(h)) return;
      h.classList.add('ma-dh');
      heads.push(h);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-ma-marquee]'), marquee);
    links();
    if (fine) Array.prototype.forEach.call(document.querySelectorAll('#page .sqs-block-button-element, #page .mrv-btn'), function (a) {
      if (out(a) || !mark(a)) return;
      magnets.push({ el: a, tx: 0, ty: 0, x: 0, y: 0 });
    });
    kick();
  }

  // Shared moves any page can switch on with a mark (Maurice, 2026-11-12: "i'm not seeing any animations on these pages").
  // They use the separate translate / rotate / scale properties, so a page's own hover or press transform still works.
  //   data-ma-fly   on a group: each child comes in from outside the screen (top rows from above, bottom rows from
  //                 below; one row takes turns) and they meet in the middle as the group scrolls in
  //   data-ma-par="0.3"  drifts slower (or, negative, faster) than the page
  //   data-ma-pop   on a group: each child pops in one after another
  //   data-ma-wipe  the piece is uncovered left to right as it comes in
  function flourish() {
    Array.prototype.forEach.call(document.querySelectorAll('#page [data-ma-fly]'), function (g) {
      var kids = Array.prototype.filter.call(g.children, function (c) { return c.offsetWidth > 0 && !/^(SCRIPT|STYLE|TEMPLATE)$/.test(c.tagName); });
      var gr = g.getBoundingClientRect(), rows = {};
      kids.forEach(function (c) { rows[Math.round(c.getBoundingClientRect().top / 8)] = 1; });
      var one = Object.keys(rows).length < 2, side = g.getAttribute('data-ma-fly') === 'x';
      kids.forEach(function (c, i) {
        if (!mark(c)) return;
        var r = c.getBoundingClientRect(), mid = (r.top + r.height / 2 - gr.top) / Math.max(1, gr.height);
        var dir = one ? (i % 2 ? 1 : -1) : mid < 0.45 ? -1 : mid > 0.55 ? 1 : (i % 2 ? 1 : -1);
        // data-ma-fly="x": sideways instead, left columns from the left and right columns from the right, so nothing
        // crosses the heading above the group on its way in
        if (side) { var cx = (r.left + r.width / 2 - gr.left) / Math.max(1, gr.width); dir = cx < 0.47 ? -1 : cx > 0.53 ? 1 : (i % 2 ? 1 : -1); }
        // already on screen when the page opens: it starts in place (Maurice, 2026-11-13: 'make the aura cards at the top in place')
        var home = window.scrollY < 10 && r.top + r.height / 2 < innerHeight;
        items.push({ type: 'fly', el: c, ref: c, dir: dir, i: i, x: side, home: home });
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#page [data-ma-pop]'), function (g) {
      var slow = g.getAttribute('data-ma-pop') === 'slow', n = g.children.length;
      Array.prototype.forEach.call(g.children, function (c, i) { if (c.offsetWidth > 0 && mark(c)) items.push({ type: 'pop', el: c, ref: c, i: i, slow: slow, n: n }); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#page [data-ma-par]'), function (el) {
      if (mark(el)) items.push({ type: 'par', el: el, ref: el.parentElement || el, k: parseFloat(el.getAttribute('data-ma-par')) || 0.25 });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#page [data-ma-wipe]'), function (el) {
      if (mark(el)) items.push({ type: 'wipe', el: el, ref: el });
    });
  }

  // Footer: the icons pop up one after another; each box's frame traces itself around clockwise (Maurice,
  // 2026-11-12: new box motion), the line under its title draws out from the middle, the book slides in, and the
  // links and legal links wipe in left to right. All tied to the scroll like the page.
  function footer() {
    var f = document.getElementById('ma-foot');
    if (!f || !mark(f)) return;
    var soc = f.querySelector('.ma-foot-social'), inner = f.querySelector('.ma-foot-in'), legal = f.querySelector('.ma-foot-legal');
    if (soc) Array.prototype.forEach.call(soc.children, function (a, i) { items.push({ type: 'stag', kind: 'pop', el: a, ref: soc, i: i, step: 0.05 }); });
    if (inner) Array.prototype.forEach.call(inner.querySelectorAll('.ma-foot-col'), function (c, i) {
      var cs = getComputedStyle(c), edge = cs.borderTopColor, bw = cs.borderTopWidth, g = 'linear-gradient(' + edge + ',' + edge + ')';
      if (parseFloat(bw)) {
        c.style.borderColor = 'transparent';
        c.style.backgroundImage = [g, g, g, g].join(',');
        c.style.backgroundRepeat = 'no-repeat';
        c.style.backgroundOrigin = 'border-box';
        c.style.backgroundPosition = '0 0,100% 0,100% 100%,0 100%';
        items.push({ type: 'stag', kind: 'trace', el: c, ref: inner, i: i, step: 0.15, w: bw });
      }
      var bk = c.querySelector('.ma-foot-book img');
      if (bk) items.push({ type: 'stag', kind: 'book', el: bk, ref: inner, i: i + 2, step: 0.15 });
      var h = c.querySelector('h3');
      if (h) {
        var line = getComputedStyle(h).borderBottomColor, w = getComputedStyle(h).borderBottomWidth;
        h.style.borderBottomColor = 'transparent';
        h.style.backgroundImage = 'linear-gradient(' + line + ',' + line + ')';
        h.style.backgroundRepeat = 'no-repeat';
        h.style.backgroundPosition = '50% 100%';
        items.push({ type: 'stag', kind: 'line', el: h, ref: inner, i: i, step: 0.12, w: w });
      }
      Array.prototype.forEach.call(c.querySelectorAll('.ma-foot-list a'), function (a, j) {
        items.push({ type: 'stag', kind: 'wipe', el: a, ref: inner, i: 3 + i + j, step: 0.06 });
      });
    });
    if (legal) Array.prototype.forEach.call(legal.children, function (a, i) { items.push({ type: 'stag', kind: 'wipe', el: a, ref: legal, i: i, step: 0.1 }); });
  }

  // Social icons in the page (Meet Maurice, 2026-11-12): scrolling down into the section, they fly in from the top
  // of the screen, spinning, and land in their row; scrolling down past it, they scatter down off the bottom of the
  // screen. Both run backward when scrolling up. Each icon keeps its own random spread and spin.
  function socials() {
    Array.prototype.forEach.call(document.querySelectorAll('#page .sqs-svg-icon--list'), function (list) {
      Array.prototype.forEach.call(list.children, function (a, i) {
        if (!mark(a)) return;
        var spread = fine ? 300 : 150;
        items.push({ type: 'scatter', sec: list.closest('section'), el: a, ref: list, i: i,
          inX: (Math.random() - 0.5) * 2 * spread, inY: 40 + Math.random() * 140, outX: (Math.random() - 0.5) * 2 * spread, outY: 40 + Math.random() * 160,
          rotIn: (Math.random() - 0.5) * 900, rotOut: (Math.random() - 0.5) * 900 });
      });
      // icons out past the edge never make the page scroll sideways
      var sec = list.closest('section');
      if (sec) { sec.style.overflowX = 'clip'; sec.style.position = 'relative'; sec.style.zIndex = '5'; }   // and over the sections they cross
      // and they fly in front of the words and button above them, so they're seen the whole way in
      var blk = list.closest('.fe-block');
      if (blk) { blk.style.position = 'relative'; blk.style.zIndex = '20'; }
    });
  }

  // Review cards (.mrv): they turn like a revolver's cylinder as they scroll in, tied to the scroll like the icon
  // band: they run through the whole set of reviews twice on the way in (landing where they started) and settle
  // once they're in place; scrolling back up turns them back (Maurice, 2026-11-12).
  var spins = [], LAPS = 2;
  function spinCheck(vh) {
    spins.forEach(function (s) {
      var m = s.root;
      if (!m.offsetParent) return;
      var r = m.getBoundingClientRect();
      var e = ease(clamp((vh - r.top) / (vh * 0.62)));
      var want = Math.round(e * s.steps);
      if (want === s.done) return;
      m.classList.add('ma-spin');
      m.style.setProperty('--ma-spd', '110ms');
      m.style.setProperty('--ma-blur', '1.6px');
      while (s.done < want) { s.next.click(); s.done++; }
      while (s.done > want) { s.prev.click(); s.done--; }
      clearTimeout(s.t);
      s.t = setTimeout(function () { m.classList.remove('ma-spin'); m.style.removeProperty('--ma-spd'); m.style.removeProperty('--ma-blur'); }, 450);
    });
  }
  function reviews() {
    Array.prototype.forEach.call(document.querySelectorAll('.mrv'), function (m) {
      var next = m.querySelector('[data-mrv="1"]'), prev = m.querySelector('[data-mrv="-1"]');
      if (!next || !prev || !mark(m)) return;
      // pages that open already scrolled down start with the cards settled
      var r = m.getBoundingClientRect(), steps = LAPS * Math.max(1, m.querySelectorAll('.mrv-slide').length);
      spins.push({ root: m, next: next, prev: prev, steps: steps, done: Math.round(ease(clamp((innerHeight - r.top) / (innerHeight * 0.62))) * steps) });
    });
  }

  // Links: links inside the text draw their underline in when they come on screen and swipe it on hover;
  // footer links draw one in on hover.
  var ulIo = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { ulIo.unobserve(e.target); e.target.classList.add('ma-ul-on'); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  function links() {
    Array.prototype.forEach.call(document.querySelectorAll('#page .sqs-html-content a'), function (a) {
      if (a.classList.contains('ma-ul') || a.querySelector('img,svg') || !(a.textContent || '').trim()) return;
      a.classList.add('ma-ul');
      if (ulIo) ulIo.observe(a); else a.classList.add('ma-ul-on');
    });
    Array.prototype.forEach.call(document.querySelectorAll('#ma-foot .ma-foot-list a, #ma-foot .ma-foot-legal a'), function (a) { a.classList.add('ma-ulh'); });
  }

  // Bands ([data-ma-marquee]): the row runs sideways on its own, speeds up while the page scrolls, and turns
  // around when the scrolling does, leaning a little with the speed. Copies fill the band so it never runs out.
  function marquee(row) {
    if (!mark(row) || !row.children.length) return;
    var gap = parseFloat(getComputedStyle(row).columnGap) || 24;
    var track = document.createElement('div'), first = document.createElement('div');
    track.className = 'ma-mq-track';
    first.className = 'ma-mq-set';
    while (row.firstChild) first.appendChild(row.firstChild);
    track.appendChild(first);
    row.appendChild(track);
    row.classList.add('ma-mq');
    // data-ma-marquee="one": a single set travels across and comes back in from the other side, no copies
    var one = row.getAttribute('data-ma-marquee') === 'one', rw = 0;
    var w = 0, x = 0, speed = 0, lean = 0, dir = 1, lastY = scrollY, lastT = 0, on = true, id = 0;
    function fill() {
      Array.prototype.forEach.call(track.querySelectorAll('.ma-mq-copy'), function (c) { c.remove(); });
      first.style.gap = gap + 'px';
      first.style.paddingRight = one ? '0' : gap + 'px';
      w = first.getBoundingClientRect().width;
      rw = row.clientWidth;
      if (one) { if (!x) x = (rw - w) / 2; return; }
      if (!w) return;
      for (var n = Math.ceil(row.clientWidth / w) + 1; n > 0; n--) {
        var c = first.cloneNode(true);
        c.classList.add('ma-mq-copy');
        c.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(c.querySelectorAll('a,button'), function (a) { a.tabIndex = -1; });
        track.appendChild(c);
      }
    }
    // one set (Maurice, 2026-11-12): the icons only move on the way in and out. They slide in from the right as the
    // band comes on screen, sit still and centered while it's there, and slide off to the left as it leaves.
    function stepOne() {
      id = 0;
      if (!on) return;
      var r = row.getBoundingClientRect(), vh = innerHeight, cx = (rw - w) / 2;
      var e = ease(clamp((vh - r.top) / (r.height + vh * 0.25)));
      var u = ease(clamp((vh * 0.15 - r.top) / (vh * 0.15 + r.height)));
      var to = cx + (1 - e) * (rw - cx) - u * (cx + w);
      x += (to - x) * 0.2;
      if (Math.abs(to - x) < 0.3) x = to;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      if (x !== to) id = requestAnimationFrame(stepOne);
    }
    if (one) {
      var go1 = function () { if (!id && on) id = requestAnimationFrame(stepOne); };
      fill();
      addEventListener('scroll', go1, { passive: true });
      addEventListener('resize', function () { gap = parseFloat(getComputedStyle(row).columnGap) || gap; fill(); go1(); });
      addEventListener('load', function () { fill(); go1(); });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; go1(); }).observe(row);
      go1();
      return;
    }
    function step(t) {
      id = 0;
      if (!on) return;
      var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
      lastT = t;
      var dy = scrollY - lastY;
      lastY = scrollY;
      if (dy) dir = dy > 0 ? 1 : -1;
      var v = dt ? dy / dt : 0;
      speed += (dir * (45 + Math.min(1400, Math.abs(v) * 0.5)) - speed) * 0.08;
      lean += (Math.max(-7, Math.min(7, -v * 0.004)) - lean) * 0.1;
      x -= speed * dt;
      if (one && w) { while (x < -w) x += rw + w; while (x > rw) x -= rw + w; }
      else if (w) { while (x <= -w) x += w; while (x > 0) x -= w; }
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0) skewX(' + lean.toFixed(2) + 'deg)';
      id = requestAnimationFrame(step);
    }
    function run() { if (!id && on) { lastT = 0; id = requestAnimationFrame(step); } }
    fill();
    addEventListener('resize', function () { gap = parseFloat(getComputedStyle(row).columnGap) || gap; fill(); });
    addEventListener('load', fill);
    // stops when the band is off screen or the tab is hidden
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { on = es[0].isIntersecting; run(); }).observe(row);
    document.addEventListener('visibilitychange', function () { on = !document.hidden; run(); });
    run();
  }

  // Headings: letters cycle through random ones and settle left to right, then the original heading comes back.
  var LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', DIG = '0123456789';
  function decode(h) {
    var orig = h.innerHTML, style = h.getAttribute('style'), label = h.textContent.replace(/\s+/g, ' ').trim(), cells = [];
    var walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    var held = h.offsetHeight;
    h.classList.add('ma-dec');
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.className = 'ma-dw'; w.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(part, function (ch) {
          var c = document.createElement('span'); c.className = 'ma-dc'; c.textContent = ch;
          w.appendChild(c);
          if (/[A-Za-z0-9]/.test(ch)) cells.push({ el: c, ch: ch, set: /[0-9]/.test(ch) ? DIG : LET });
        });
        frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
    h.setAttribute('aria-label', label);
    // keep every line exactly where it was: break the lines by hand, then hold each letter's width
    var top = null;
    Array.prototype.forEach.call(h.querySelectorAll('.ma-dw'), function (w) {
      var t = w.getBoundingClientRect().top;
      if (top !== null && t > top + 2) {
        var prev = w.previousSibling, br = document.createElement('br');
        if (prev && prev.nodeType === 3 && /^\s+$/.test(prev.nodeValue)) prev.parentNode.replaceChild(br, prev);
        else w.parentNode.insertBefore(br, w);
      }
      top = t;
    });
    cells.forEach(function (c) { c.w = c.el.getBoundingClientRect().width; });
    cells.forEach(function (c) { c.el.style.width = c.w + 'px'; });
    h.style.whiteSpace = 'nowrap';
    h.style.boxSizing = 'border-box';
    h.style.height = held + 'px';
    h.classList.add('ma-dlock');
    var start = performance.now(), span = Math.min(900, 300 + cells.length * 22), last = 0;
    (function tick(now) {
      var t = now - start, done = true;
      if (now - last > 45) {
        last = now;
        cells.forEach(function (c, i) {
          if (t >= 120 + (i / Math.max(1, cells.length)) * span) { if (!c.ok) { c.el.textContent = c.ch; c.ok = 1; } return; }
          done = false;
          c.el.textContent = c.set.charAt(Math.floor(Math.random() * c.set.length));
        });
      } else done = false;
      if (!done) { requestAnimationFrame(tick); return; }
      h.innerHTML = orig;
      h.removeAttribute('aria-label');
      if (style === null) h.removeAttribute('style'); else h.setAttribute('style', style);
      h.classList.remove('ma-dec', 'ma-dlock');
      // the scroll motion may have moved this heading meanwhile: forget what it last wrote so it writes again
      for (var k in h) if (k.indexOf('__ma_') === 0) h[k] = null;
      kick();
      // the 3D copy behind the heading is measured again now that the real letters are back
      if (window.maCiRelines) window.maCiRelines();
    })(start);
  }

  var px = -1e4, py = -1e4;
  function spring(o, tx, ty) {
    o.tx = tx; o.ty = ty;
    o.x += (o.tx - o.x) * 0.16; o.y += (o.ty - o.y) * 0.16;
    if (Math.abs(o.tx - o.x) < 0.02 && Math.abs(o.ty - o.y) < 0.02) { o.x = o.tx; o.y = o.ty; return false; }
    return true;
  }
  function put(el, prop, v) { if (el['__ma_' + prop] !== v) { el['__ma_' + prop] = v; el.style[prop] = v; } }

  // One pass: read every position first, then write, so the page never measures something it just moved.
  function paint() {
    var vh = innerHeight, moving = false, doc = document.documentElement;
    var max = doc.scrollHeight - vh;
    put(bar, 'transform', 'scaleX(' + (max > 0 ? clamp(scrollY / max) : 0).toFixed(4) + ')');
    var rects = items.map(function (it) { return it.ref.getBoundingClientRect(); });
    // how far something has come in, from s (where it starts) over span; anything that can't scroll that far up
    // (the end of the page) finishes as the page bottoms out
    function prog(r, s, span) {
      var end = Math.max(s - span, r.top - (max - scrollY));
      return s - end <= 1 ? 1 : clamp((s - r.top) / (s - end));
    }
    // everything in a section is in place by the time the whole section is on screen, or fills the screen when
    // it's taller than that (Maurice, 2026-11-12)
    // phones (Maurice, 2026-11-13: 'the animations are still based on the desktop sections, not the mobile sections'): a
    // phone section is many screens tall, so each piece moves with its own place on the screen, never the section's
    function full(it) {
      if (!it.sec || window.innerWidth < 768) return 0;
      var s = it.sec.getBoundingClientRect();
      return clamp((vh - s.top) / Math.max(1, Math.min(s.height, vh)));
    }
    // a card's picture and the words over it turn around the same center, so they move as one card
    var own = {}, cols = {};
    items.forEach(function (it, k) {
      if (it.type !== 'card') return;
      var r = own[k] = it.b.getBoundingClientRect(), c = cols[it.key];
      if (!c) cols[it.key] = { l: r.left, t: r.top, r: r.right, b: r.bottom };
      else { c.l = Math.min(c.l, r.left); c.t = Math.min(c.t, r.top); c.r = Math.max(c.r, r.right); c.b = Math.max(c.b, r.bottom); }
    });
    items.forEach(function (it, k) {
      var r = rects[k], p, q;
      if (it.type === 'hero') {
        p = clamp(-r.top / r.height);
        // it used to shrink as the page scrolled, which opened a dark gap around it that looked like a mistake
        // (Maurice, 2026-11-12: 'remove this separation as you scroll down'); it now only dims a little
        put(it.el, 'transform', '');
        put(it.el, 'opacity', p > 0 ? (1 - 0.3 * p).toFixed(3) : '');
        return;
      }
      if (it.type === 'scatter') {
        // they come in over the time the whole section takes to scroll into view, landing as it fills the screen
        var inn = ease(clamp((window.innerWidth < 768 ? prog(r, vh * 1.0, vh * 0.45) : full(it)) * 1.06 - it.i * 0.006));
        var away = ease(clamp((vh * 0.35 - r.top) / (vh * 0.35 + r.height) - it.i * 0.02));
        var k1 = 1 - inn;
        // coming in: from just above the top of the screen; going out: to just below the bottom of the screen
        var sx = it.inX * k1 + it.outX * away, sy = -(r.top + it.inY) * k1 + (vh - r.top + it.outY) * away, sr = it.rotIn * k1 + it.rotOut * away;
        put(it.el, 'transform', k1 > 0.001 || away > 0.001 ? 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0) rotate(' + sr.toFixed(1) + 'deg)' : '');
        put(it.el, 'opacity', '');
        return;
      }
      if (it.type === 'fly') {
        // comes in from the bottom edge of the screen and is in place by the time it is halfway up
        // (Maurice, 2026-11-13: 'let's do halfway instead'). A tile on screen
        // when the page opened stays put until it has scrolled out once; a group marked data-ma-rest (a search showing
        // its results) holds every tile in place.
        // a small stagger by column, scaled so every tile still lands exactly in place
        var st = (it.i % 3) * 0.04;
        // measured where it rests, not where it was last moved to (reading its own offset back made a tile coming in
        // from above jump between two places every frame)
        var rest = { top: r.top - (it.cur || 0), height: r.height };
        if (it.home && rest.top + rest.height < 0) it.home = false;
        var held = it.home || (it.el.parentElement && it.el.parentElement.hasAttribute('data-ma-rest'));
        p = held ? 1 : ease(clamp((prog(rest, vh * 1.02, vh * 0.5) - st) / (1 - st)));
        var fd = (1 - p) * (it.x ? Math.min(innerWidth * 0.6, 560) : Math.min(vh * 0.7, 520)) * it.dir;
        it.cur = it.x || p >= 1 ? 0 : fd;
        put(it.el, 'translate', p < 1 ? (it.x ? fd.toFixed(1) + 'px 0' : '0 ' + fd.toFixed(1) + 'px') : '');
        put(it.el, 'rotate', p < 1 ? ((1 - p) * 5 * it.dir).toFixed(2) + 'deg' : '');
        put(it.el, 'opacity', p < 1 ? (0.15 + 0.85 * p).toFixed(3) : '');
        // while it's flying it can't take a tap meant for the tile it's passing over
        // a piece takes taps as soon as it is mostly on screen (Maurice, 2026-11-13: 'make the dossier so you can click on them
        // when they're visible on the screen'); only while it is still far out can it not
        put(it.el, 'pointerEvents', p < 0.35 ? 'none' : '');
        return;
      }
      if (it.type === 'pop' && it.slow) {
        // data-ma-pop="slow" (Maurice, 2026-11-13, the edition cards on the order page: "the speed is WAY too fast, make
        // it slower, much slower, and make it so that they aren't there until the halfway point"): nothing shows until
        // the piece reaches the middle of the screen; then the pieces pop in one after another on a slow clock, not with
        // the scroll. Scrolled back down below the middle, they go away again, ready to come in once more.
        var tw2 = 18 * Math.min(1, 160 / Math.max(1, r.width));
        var top = r.top + r.height / 2 - it.el.offsetHeight / 2;   // its real top, whatever size it is drawn at
        // they start as the row comes up into the screen and are all in by the time it is halfway up (Maurice,
        // 2026-11-13: 'they should start coming in sooner but BE in at the halfway point')
        // a touch sooner and faster (Maurice, 2026-11-13, phones: "these appear really slow"); the stagger runs along a
        // row only, so a card alone on its row (one column on a phone) starts straight away
        if (!it.on && top < vh * 1.02) it.on = true;
        else if (it.on && top > vh * 1.08) it.on = false;
        if (it.on !== it.was) {
          it.was = it.on;
          var pg = it.el.parentElement, nc = pg ? getComputedStyle(pg).gridTemplateColumns.split(' ').filter(Boolean).length || 1 : 1, dl = (it.i % nc) * 0.15;
          it.el.style.transition = it.on ? 'scale .8s cubic-bezier(.2,.8,.2,1) ' + dl + 's,rotate .8s cubic-bezier(.2,.8,.2,1) ' + dl + 's,opacity .6s ease ' + dl + 's'
            : 'scale .4s ease,rotate .4s ease,opacity .3s ease';
        }
        put(it.el, 'scale', it.on ? '' : '0.4');
        put(it.el, 'rotate', it.on ? '' : (it.i % 2 ? -tw2 : tw2).toFixed(2) + 'deg');
        put(it.el, 'opacity', it.on ? '' : '0');
        put(it.el, 'pointerEvents', it.on ? '' : 'none');
        return;
      }
      if (it.type === 'pop') {
        p = ease(clamp((prog(r, vh * 0.98, vh * 0.4) - Math.min(it.i * 0.07, 0.6)) / 0.4));
        put(it.el, 'scale', p < 1 ? (0.4 + 0.6 * p).toFixed(3) : '');
        // small pieces turn as they pop; wide ones (bars, rows) barely turn, so they never swing across each other
        var tw = 18 * Math.min(1, 160 / Math.max(1, r.width));
        put(it.el, 'rotate', p < 1 ? ((1 - p) * (it.i % 2 ? -tw : tw)).toFixed(2) + 'deg' : '');
        put(it.el, 'opacity', p < 1 ? p.toFixed(3) : '');
        return;
      }
      if (it.type === 'par') {
        q = clamp((vh - r.top) / (vh + r.height)) - 0.5;
        put(it.el, 'translate', '0 ' + (q * it.k * -2 * Math.min(r.height, vh)).toFixed(1) + 'px');
        return;
      }
      if (it.type === 'wipe') {
        p = ease(prog(r, vh * 0.95, vh * 0.45));
        put(it.el, 'clipPath', p < 1 ? 'inset(0 ' + ((1 - p) * 100).toFixed(1) + '% 0 0)' : '');
        return;
      }
      if (it.type === 'bgpar') {
        q = clamp((vh - r.top) / (vh + r.height)) - 0.5;
        put(it.el, 'transform', 'translate3d(0,' + (q * -14).toFixed(2) + '%,0) scale(1.2)');
        return;
      }
      if (it.type === 'stag') {
        // one after another, but the last one still finishes by the time the page bottoms out (Maurice, 2026-11-12)
        var off = Math.min(it.i * it.step, 0.7);
        p = ease(clamp((prog(r, vh * 0.98, vh * 0.5) - off) / Math.min(0.6, 1 - off)));
        if (it.kind === 'line') { put(it.el, 'backgroundSize', (p * 100).toFixed(1) + '% ' + it.w); return; }
        if (it.kind === 'trace') {
          // four sides drawn in turn: top left to right, right side down, bottom right to left, left side up
          var s4 = [0, 1, 2, 3].map(function (n) { return (clamp(p * 4 - n) * 100).toFixed(1) + '%'; });
          put(it.el, 'backgroundSize', s4[0] + ' ' + it.w + ',' + it.w + ' ' + s4[1] + ',' + s4[2] + ' ' + it.w + ',' + it.w + ' ' + s4[3]);
          return;
        }
        if (it.kind === 'wipe') {
          put(it.el, 'clipPath', p < 1 ? 'inset(0 ' + ((1 - p) * 100).toFixed(1) + '% 0 0)' : '');
          put(it.el, 'transform', p < 1 ? 'translate3d(' + ((1 - p) * -10).toFixed(1) + 'px,0,0)' : '');
          return;
        }
        var tf = p >= 1 ? '' :
          it.kind === 'pop' ? 'translate3d(0,' + ((1 - p) * 26).toFixed(1) + 'px,0) scale(' + (0.6 + 0.4 * p).toFixed(3) + ') rotate(' + ((1 - p) * (it.i % 2 ? -14 : 14)).toFixed(1) + 'deg)' :
          it.kind === 'tilt' ? 'perspective(1000px) translate3d(0,' + ((1 - p) * 50).toFixed(1) + 'px,0) rotateX(' + ((1 - p) * 14).toFixed(2) + 'deg) scale(' + (0.95 + 0.05 * p).toFixed(4) + ')' :
          it.kind === 'slide' ? 'translate3d(' + ((1 - p) * -28).toFixed(1) + 'px,0,0)' :
          it.kind === 'slidein' ? 'translate3d(' + ((1 - p) * -80).toFixed(1) + 'px,0,0)' :
          it.kind === 'book' ? 'translate3d(' + ((1 - p) * -70).toFixed(1) + 'px,0,0) rotate(' + ((1 - p) * -10).toFixed(2) + 'deg)' : 'translate3d(0,' + ((1 - p) * 18).toFixed(1) + 'px,0)';
        if (it.kind === 'tilt') put(it.el, 'transformOrigin', '50% 0');
        put(it.el, 'transform', tf);
        put(it.el, 'opacity', p < 1 ? p.toFixed(3) : '');
        return;
      }
      if (it.type === 'panel') {
        p = ease(Math.max(prog(r, vh, vh * 0.6), full(it)));
        put(it.el, 'clipPath', p < 1 ? 'inset(' + ((1 - p) * 100).toFixed(2) + '% 0 0 0)' : '');
        return;
      }
      if (it.type === 'card') {
        q = Math.max(prog(r, vh * 0.95, vh * 0.45), full(it));
        p = ease(clamp((q - it.i * 0.08) / 0.62));
        var cc = cols[it.key], o = own[k];
        put(it.el, 'transformOrigin', ((cc.l + cc.r) / 2 - o.left).toFixed(1) + 'px ' + ((cc.t + cc.b) / 2 - o.top).toFixed(1) + 'px');
        put(it.el, 'transform', p < 1 ? 'perspective(700px) translate3d(0,' + ((1 - p) * 40).toFixed(1) + 'px,0) rotateX(' + ((1 - p) * 18).toFixed(2) +
          'deg) rotate(' + ((1 - p) * (it.i % 2 ? 8 : -8)).toFixed(2) + 'deg) scale(' + (0.86 + 0.14 * p).toFixed(4) + ')' : '');
        put(it.el, 'opacity', p < 1 ? p.toFixed(3) : '');
        return;
      }
      p = ease(Math.max(prog(r, vh * 0.96, vh * 0.42), full(it)));
      var rise = p < 1 ? 'perspective(1100px) translate3d(0,' + ((1 - p) * 56).toFixed(1) + 'px,0) rotateX(' + ((1 - p) * 12).toFixed(2) + 'deg) scale(' + (0.94 + 0.06 * p).toFixed(4) + ') ' : '';
      if (it.type === 'float') {
        // drifts with the scroll and tilts toward the pointer
        var c = clamp((vh - r.top) / (vh + r.height)) - 0.5;
        var near = fine && px > r.left - 80 && px < r.right + 80 && py > r.top - 80 && py < r.bottom + 80;
        var tx = near ? ((px - (r.left + r.width / 2)) / r.width) * 16 : 0, ty = near ? ((py - (r.top + r.height / 2)) / r.height) * -12 : 0;
        if (spring(it, tx, ty)) moving = true;
        put(it.el, 'transformOrigin', '50% 50%');
        put(it.el, 'transform', (rise || 'perspective(1100px) ') + 'translate3d(0,' + (c * -60).toFixed(1) + 'px,0) rotate(' + (c * -5).toFixed(2) + 'deg) rotateY(' + it.x.toFixed(2) + 'deg) rotateX(' + it.y.toFixed(2) + 'deg)');
        put(it.el, 'opacity', p < 1 ? p.toFixed(3) : '');
        return;
      }
      put(it.el, 'transformOrigin', '50% 0');
      put(it.el, 'transform', rise);
      put(it.el, 'opacity', p < 1 ? p.toFixed(3) : '');
      if (it.img) {
        q = clamp((vh - r.top) / (vh + r.height)) - 0.5;
        put(it.img, 'transform', 'translate3d(0,' + (q * -7).toFixed(2) + '%,0) scale(1.12)');
      }
    });
    if (spins.length) spinCheck(vh);
    heads.forEach(function (h) {
      if (h.__maDone) return;
      var r = h.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0 && r.width > 0) {
        h.__maDone = 1;
        if (window.maAfterLoading) window.maAfterLoading(function () { decode(h); }); else decode(h);
      }
    });
    magnets.forEach(function (m) {
      var r = m.el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = px - cx, dy = py - cy, near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
      if (spring(m, near ? Math.max(-10, Math.min(10, dx * 0.22)) : 0, near ? Math.max(-8, Math.min(8, dy * 0.3)) : 0)) moving = true;
      put(m.el, 'transform', m.x || m.y ? 'translate3d(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px,0)' : '');
    });
    return moving;
  }

  var raf = 0, quiet = 0;
  function frame() { raf = 0; if (paint() || quiet++ < 20) raf = requestAnimationFrame(frame); }
  function kick() { quiet = 0; if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true });
  if (fine) addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; kick(); }, { passive: true });
  document.addEventListener('mouseleave', function () { px = py = -1e4; kick(); });
  // loader.js fires resize each time a section of the page arrives, so new sections are picked up here
  var later = 0;
  addEventListener('resize', function () { clearTimeout(later); later = setTimeout(scan, 120); kick(); });
  addEventListener('load', scan);
  scan();
})();
