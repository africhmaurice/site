/* Chapter frame (Maurice, 2026-11-12): the shared look for every adventure chapter page. Loaded by each chapter page
   file right after its own markup, with chapter-frame.css. It only adds: the chapter's color and art on #rc, the
   chapter tag and place over the hero (the same words as the chapter's line on The Adventure So Far), and a tile back
   to The Adventure So Far in the chapter strip at the bottom. It never touches the votes, rolls, or counters. DRAFT. */
(function () {
  var me = document.currentScript, BASE = me && me.src ? me.src.replace(/[^\/]*$/, '') : 'https://africhmaurice.github.io/site/assets/chapters/';
  // path: [chapter, place, color, art] (chapter and place as they read on The Adventure So Far; the art is each page's own)
  var CH = {
    '/red-city': ['2', 'PONTUNE · THE RED CITY', 'red', 'red-sun-ruins-as360866146'],
    '/the-crew': ['3', 'THE GRESNICK OCEAN', 'teal', 'crystal-towers-lake-as395045722'],
    '/the-crash': ['4', 'DE’GATÉ · THE GATE OF DEATH', 'purple', 'nebula-glow-as332921866'],
    '/the-river': ['5', 'DE’GATÉ · THE RIVER', 'bone', 'dome-city-mist-as159145789'],
    '/the-raft': ['6', 'DE’GATÉ · THE RIVER', 'olive', 'monolith-canyon-as444233611'],
    '/river-mayhem': ['7', 'DE’GATÉ · THE RIVER', 'green', 'overgrown-sphere-as470076105'],
    '/washed-ashore': ['8', 'DE’GATÉ · THE RIVERBANK', 'red', 'red-sun-ruins-as360866146'],
    '/cerunine-attack': ['9', 'DE’GATÉ · THE RIVERBANK', 'teal', 'crystal-towers-lake-as395045722'],
    '/the-reunion': ['10', 'DE’GATÉ · THE RIVERBANK', 'purple', 'nebula-glow-as332921866'],
    '/the-energy-wave': ['11', 'DE’GATÉ · THE RIVERBANK', 'bone', 'dome-city-mist-as159145789'],
    '/finding-scarlett': ['12', 'DE’GATÉ · THE SOUTHERN SHORE', 'olive', 'cavern-ruins-as581365050'],
    '/light-on-her-feet': ['13', 'DE’GATÉ · THE SOUTHERN SHORE', 'green', 'overgrown-sphere-as470076105'],
    '/pull-her-out': ['14', 'DE’GATÉ · THE SOUTHERN SHORE', 'red', 'desert-ruins-as500884178'],
    '/the-source': ['15', 'DE’GATÉ · DEEP IN THE JUNGLE', 'teal', 'crystal-towers-lake-as395045722'],
    '/the-break-in': ['16', 'DE’GATÉ · INSIDE THE BUILDING', 'purple', 'nebula-glow-as332921866'],
    '/search-the-building': ['17', 'DE’GATÉ · INSIDE THE BUILDING', 'bone', 'dome-city-mist-as159145789'],
    '/the-captains-request': ['18', 'DE’GATÉ · INSIDE THE BUILDING', 'olive', 'monolith-canyon-as444233611'],
    '/saving-scarlett': ['19', 'DE’GATÉ · THE SOUTHERN WOODS', 'green', 'overgrown-sphere-as470076105'],
    '/back-to-the-hunt': ['20', 'DE’GATÉ · THE SOUTHERN WOODS', 'red', 'red-sun-ruins-as360866146'],
    '/the-crew-decides': ['21', 'DE’GATÉ · THE SOUTHERN WOODS', 'teal', 'crystal-towers-lake-as395045722']
  };
  var RGB = { red: '145,37,1', teal: '26,94,65', purple: '45,28,83', green: '27,59,21', olive: '33,50,38', bone: '33,50,38' };
  var phone = window.matchMedia && matchMedia('(max-width:760px)').matches;
  function art(name) { return 'url("' + BASE + '../bg/' + (phone ? 'm/' : 'd/') + name + '.webp")'; }
  function key(href) { try { return new URL(href, location.href).pathname.replace(/\/+$/, ''); } catch (e) { return ''; } }

  var path = (window.CHAPTER_PATH || location.pathname).replace(/\/+$/, ''), me2 = CH[path];
  if (!me2) return;

  function frame() {
    var rc = document.getElementById('rc'); if (!rc) return false;
    rc.setAttribute('data-cf', me2[2]);
    // the hero sets its own room under the menu, so loader.js leaves the top gap alone
    rc.setAttribute('data-ma-keep-top', '');
    rc.style.setProperty('--cf-art', art(me2[3]));
    var hero = rc.querySelector('.rc-hero'), col = hero && hero.firstElementChild;
    if (col && !col.querySelector('.cf-ch')) {
      var tag = document.createElement('p');
      tag.className = 'cf-ch';
      tag.innerHTML = '<span class="cf-no">Chapter ' + me2[0] + '</span><span class="cf-place">' + me2[1] + '</span>';
      col.insertBefore(tag, col.firstChild);
    }
    if (hero && !hero.querySelector('.cf-art')) {
      var layer = document.createElement('div');
      layer.className = 'cf-art'; layer.setAttribute('aria-hidden', 'true');
      layer.setAttribute('data-ma-par', phone ? '0.12' : '0.25');   // the art drifts slower than the page
      hero.appendChild(layer);
    }
    marks(rc);
    return true;
  }

  // Motion (Maurice, 2026-11-12: "i'm not seeing animations"): motion.js's shared marks. Each panel is uncovered left to
  // right as it comes in; the stats, choices, kits, rolls, and bars inside it pop in one after another. motion.js
  // never runs for people who ask for less motion, so for them everything simply sits in place.
  var MOVE = 'data-ma-fly';   // fly works now that motion.js measures where a tile rests (11/12)
  var POP = '.rc-stats,.rc-opts,.rc-grid,.rc-qs,.rc-rcrew,.rc-lm,.cr-kits,.cr-res-kits,.cr-bars,.cr-chart';
  function marks(rc) {
    Array.prototype.forEach.call(rc.querySelectorAll('.rc-step'), function (s) { if (!s.hasAttribute('data-ma-wipe')) s.setAttribute('data-ma-wipe', ''); });
    Array.prototype.forEach.call(rc.querySelectorAll(POP), function (g) { if (!g.hasAttribute('data-ma-pop')) g.setAttribute('data-ma-pop', ''); });
  }
  function rescan() { try { window.dispatchEvent(new Event('resize')); } catch (e) {} }
  addEventListener('load', function () { var rc = document.getElementById('rc'); if (rc) { marks(rc); rescan(); } });

  // The strip at the bottom: each tile shows the art and color of the chapter it leads to, plus a tile for The Adventure.
  function strip() {
    var nav = document.getElementById('ma-chapters'); if (!nav) return false;
    var row = nav.querySelector('.mc-in'); if (!row) return false;
    Array.prototype.forEach.call(row.querySelectorAll('a'), function (a) {
      var c = CH[key(a.getAttribute('href'))];
      if (c) { a.style.setProperty('--t', RGB[c[2]]); a.style.setProperty('--t-art', art(c[3])); }
      else if (key(a.getAttribute('href')) === '/adventure') { a.style.setProperty('--t', '45,28,83'); a.style.setProperty('--t-art', art('city-skyline-panorama-as348070597')); }
      else if (a.classList.contains('mc-map')) { a.style.setProperty('--t', '11,23,15'); a.style.setProperty('--t-art', 'url("' + BASE + '../maps/treasure-map-degate.jpg")'); }
    });
    var toAdv = Array.prototype.some.call(row.querySelectorAll('a'), function (a) { return key(a.getAttribute('href')) === '/adventure'; });
    if (!toAdv && !row.querySelector('.mc-adv')) {
      var adv = document.createElement('a');
      adv.className = 'mc-adv'; adv.href = '/adventure';
      adv.style.setProperty('--t', '45,28,83');
      adv.style.setProperty('--t-art', art('city-skyline-panorama-as348070597'));
      adv.innerHTML = '<span class="mc-k">Every chapter</span><span class="mc-t">The Adventure So Far</span>' +
        '<img src="' + BASE + '../icons/adventure-scroll.png" alt="" width="72" height="72">';
      row.appendChild(adv);
    }
    if (toAdv) { var map = row.querySelector('.mc-map'); if (map) map.style.gridColumn = '1 / -1'; }

    // the tiles fly in from above and below by turns and meet in the strip
    if (!row.hasAttribute(MOVE)) { row.setAttribute(MOVE, ''); rescan(); }
    return true;
  }

  // Dice (Maurice, 2026-11-12: "have all the dice spin into existence like they're being rolled"): each result die
  // tumbles in as it comes on screen, several turns with a small bounce, and settles on its number. The dice people
  // roll themselves (.rc-die) keep their own roll. Nothing is hidden or spun for people who ask for less motion.
  var DICE = '.cr-d20,.cw-d20,.cr-tie-die,.cr-cer-die,.cr-pre-die,.rc-rdie';
  var still = !window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dio = !still && 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var d = e.target; dio.unobserve(d);
      d.style.animationDelay = Math.min(d.__cfI || 0, 6) * 110 + 'ms';
      d.classList.remove('cf-die-wait'); d.classList.add('cf-die-roll');
      d.addEventListener('animationend', function () { d.classList.remove('cf-die-roll'); d.style.animationDelay = ''; }, { once: true });
    });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  function dice(rc) {
    if (!dio) return;
    Array.prototype.forEach.call(rc.querySelectorAll(DICE), function (d) {
      if (d.__cfDie) return; d.__cfDie = 1;
      var g = d.closest('.rc-step') || rc; g.__cfN = (g.__cfN || 0) + 1; d.__cfI = g.__cfN - 1;
      d.classList.add('cf-die-wait'); dio.observe(d);
    });
  }

  // Panel rows (Maurice, 2026-11-12: "put the cards in rows of one, two, or three if there's enough room and empty
  // space"): a short panel whose cards fill only part of its width sits beside the short panels next to it, two or
  // three to a row when the screen has room; one on its own puts its heading beside its cards. Phones keep one per row.
  function textRight(e) {
    var right = 0;
    Array.prototype.forEach.call(e.childNodes, function (n) {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      var g = document.createRange(); g.selectNodeContents(n);
      Array.prototype.forEach.call(g.getClientRects(), function (q) { right = Math.max(right, q.right); });
    });
    return right;
  }
  function compact(s) {
    var r = s.getBoundingClientRect();
    if (!r.height || r.height > 640 || s.querySelector('video,iframe,audio,form,input,select,textarea,details,.rc-player,.rc-rec,.rc-whobox')) return false;
    var cs = getComputedStyle(s), left = r.left + parseFloat(cs.paddingLeft), inner = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), right = left, any = false;
    Array.prototype.forEach.call(s.children, function (c) {
      if (c.tagName === 'HEADER' || !c.offsetHeight) return;
      [c].concat(Array.prototype.slice.call(c.querySelectorAll('*'))).forEach(function (e) {
        var er = e.getBoundingClientRect(); if (!er.width || !er.height) return;
        any = true;
        right = Math.max(right, er.width < inner * 0.95 ? er.right : textRight(e));
      });
    });
    return any && right - left <= inner * 0.55;
  }
  function shown(e) { return e.offsetHeight > 0; }
  function nextShown(e) { var n = e.nextElementSibling; while (n && !shown(n)) n = n.nextElementSibling; return n; }
  var laidW = 0;
  function layout(force) {
    var rc = document.getElementById('rc'); if (!rc) return;
    if (!force && innerWidth === laidW) return;
    laidW = innerWidth;
    Array.prototype.forEach.call(rc.querySelectorAll('.cf-row'), function (row) { while (row.firstChild) row.parentNode.insertBefore(row.firstChild, row); row.remove(); });
    Array.prototype.forEach.call(rc.querySelectorAll('.cf-split'), function (s) { s.classList.remove('cf-split'); });
    if (innerWidth < 760) return;
    var most = innerWidth >= 1100 ? 3 : 2;
    rc.classList.add('cf-measuring');   // measured at rest, not mid-animation
    var runs = [], run = [];
    Array.prototype.forEach.call(rc.querySelectorAll('.rc-step'), function (s) {
      if (!shown(s)) return;
      var c = compact(s), prev = run[run.length - 1];
      if (c && prev && nextShown(prev) === s) run.push(s);
      else { if (run.length) runs.push(run); run = c ? [s] : []; }
    });
    if (run.length) runs.push(run);
    rc.classList.remove('cf-measuring');
    runs.forEach(function (rn) {
      var rows = Math.ceil(rn.length / most), per = Math.ceil(rn.length / rows);
      for (var i = 0; i < rn.length; i += per) {
        var part = rn.slice(i, i + per);
        if (part.length === 1) { if (innerWidth >= 900) part[0].classList.add('cf-split'); continue; }
        var row = document.createElement('div');
        row.className = 'cf-row'; row.style.setProperty('--n', part.length);
        part[0].parentNode.insertBefore(row, part[0]);
        part.forEach(function (p) { row.appendChild(p); });
      }
    });
  }
  function settle() { var rc = document.getElementById('rc'); if (!rc) return; dice(rc); layout(true); }
  addEventListener('load', function () { settle(); setTimeout(settle, 1500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  addEventListener('resize', function () { clearTimeout(layout.t); layout.t = setTimeout(function () { layout(false); }, 200); });

  if (!frame()) { var n = 0, t = setInterval(function () { if (frame() || ++n > 40) clearInterval(t); }, 250); }
  setTimeout(settle, 0);
  if (!strip()) { var m = 0, u = setInterval(function () { if (strip() || ++m > 80) clearInterval(u); }, 400); }
})();
