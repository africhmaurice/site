// Cracked Imperia headings (Maurice, 2026-10-09): every heading drawn in Atomic Marker or Cinzel (the code blocks'
// 'Atomic Marker', Squarespace's 'atomic-marker-xxxx', and the theme's Cinzel) becomes Cracked Imperia Bold, all caps,
// in its own color, with the 3D from Cracked Imperia Extrude Flush right behind it. Light headings get a darker 3D
// (42% of the face color); dark headings get a light 3D (35% face color, 65% white). No texture, no outline.
// The fonts are SIL Open Font License (assets/fonts/OFL.txt). A watcher catches sections that load in later.
(function () {
  if (window.__maHeads) return; window.__maHeads = true;
  var me = document.currentScript;
  var BASE = me ? me.src.replace(/heads\.js.*$/, '') : 'https://africhmaurice.github.io/site/';
  var FONTS = BASE + 'assets/fonts/';
  var SIZE = '109.5%'; // Cracked Imperia is 9.5% narrower than Atomic Marker; this keeps every line the same width.
  var HEAD = /atomic.?marker|cinzel/i;
  // Puzzle text: clue poems and titles, the clue flash, and game words. Capital letters and line breaks can be part of
  // a clue (tools/clues.mjs), so these keep their own case, spacing, and line height; only the font changes.
  var KEEP = '#loot-clue .lc-clue,#loot-clue .lc-poem,#loot-clue .lc-said,.lc-flash-ov,#ma-longword .lw-word,.cw-clues,[data-ci-keep]';
  function kept(el) { try { return !!el.closest(KEEP); } catch (e) { return false; } }

  var st = document.createElement('style'); st.id = 'ma-heads';
  st.textContent =
    "@font-face{font-family:'CI Face';src:url('" + FONTS + "CrackedImperia-Bold.woff2') format('woff2');font-weight:100 900;font-display:block;size-adjust:" + SIZE + "}" +
    "@font-face{font-family:'CI Extrude';src:url('" + FONTS + "CrackedImperia-ExtrudeFlush.woff2?v=2') format('woff2');font-weight:100 900;font-display:block;size-adjust:" + SIZE + "}" +
    "[data-ci-x]{isolation:isolate}" +
    // The 3D: the heading's words again, in the Extrude font, behind the face, on the same lines.
    "[data-ci-x]::before{content:attr(data-ci-x);position:absolute;left:var(--ci-x,0);top:var(--ci-y,0);width:var(--ci-w,auto);padding:0;border:0;box-sizing:content-box;font-family:'CI Extrude';font-size:inherit;line-height:var(--ci-lh,1.05);letter-spacing:inherit;word-spacing:inherit;text-align:inherit;text-transform:inherit;text-indent:inherit;white-space:pre;-webkit-text-stroke:0;color:var(--ci-depth);-webkit-text-fill-color:var(--ci-depth);background:none;filter:none;z-index:-1;pointer-events:none}";
  (document.head || document.documentElement).appendChild(st);
  var pre = document.createElement('link'); pre.rel = 'preload'; pre.as = 'font'; pre.type = 'font/woff2'; pre.crossOrigin = 'anonymous';
  pre.href = FONTS + 'CrackedImperia-Bold.woff2'; (document.head || document.documentElement).appendChild(pre);

  // Drawn graphics (the game share cards and anything else painted on a canvas): text drawn in Atomic Marker is drawn in
  // Cracked Imperia instead, with the Extrude Flush 3D painted underneath in the same color rule as the headings.
  (function () {
    var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype; if (!P) return;
    var d = Object.getOwnPropertyDescriptor(P, 'font'); if (!d || !d.set) return;
    try { document.fonts.load('40px "CI Face"'); document.fonts.load('40px "CI Extrude"'); } catch (e) {}
    // Pages wait for Atomic Marker before drawing; make that wait cover the new fonts too.
    try { var load = document.fonts.load.bind(document.fonts);
      document.fonts.load = function (f, t) { var p = load(f, t); if (!/atomic.?marker/i.test(f)) return p;
        return Promise.all([p, load('40px "CI Face"'), load('40px "CI Extrude"')]).then(function (r) { return r[0]; }); }; } catch (e) {}
    Object.defineProperty(P, 'font', { configurable: true, get: d.get, set: function (v) {
      var s = String(v); this.__ci = /atomic.?marker/i.test(s);
      d.set.call(this, this.__ci ? s.replace(/(["']?)atomic.?marker\1/i, '"CI Face"') : s); } });
    var fill = P.fillText;
    P.fillText = function (t, x, y, w) {
      if (this.__ci && typeof this.fillStyle === 'string') {
        var c = this.fillStyle, f = this.font;
        this.save(); d.set.call(this, f.replace('"CI Face"', '"CI Extrude"'));
        this.fillStyle = cdark(c) ? mix(c, 0.35, 255) : mix(c, 0.42, 0);
        if (w === undefined) fill.call(this, t, x, y); else fill.call(this, t, x, y, w);
        this.restore(); }
      return w === undefined ? fill.call(this, t, x, y) : fill.call(this, t, x, y, w); };
    function rgb(c) { var m; if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16)];
      if ((m = c.match(/[\d.]+/g)) && m.length >= 3) return [+m[0], +m[1], +m[2]]; return [255, 255, 255]; }
    function cdark(c) { var v = rgb(c); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2] <= 110; }
    function mix(c, k, to) { var v = rgb(c); return 'rgb(' + v.map(function (n) { return Math.round(n * k + to * (1 - k)); }).join(',') + ')'; }
  })();

  // A color counts as dark below this brightness; dark headings get the light 3D.
  function dark(c) { var m = c.match(/[\d.]+/g); if (!m) return false; return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] <= 110; }
  // The heading's text with a line break wherever the heading itself breaks, so the 3D copy wraps identically.
  function lines(el) { var out = [], top = null, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, r = document.createRange();
    while ((n = w.nextNode())) { var re = /\S+/g, m; while ((m = re.exec(n.textContent))) { r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
      var rc = r.getClientRects()[0]; if (!rc) continue; if (top === null || Math.abs(rc.top - top) > rc.height / 2) { out.push([]); top = rc.top; } out[out.length - 1].push(m[0]); } }
    return out.map(function (l) { return l.join(' '); }).join('\n'); }
  // Where the letters really are inside the heading: the 3D copy is placed on that box. A turned or scaled heading
  // (the rotated stamps) can't be measured this way, so it keeps the 3D at the box corner.
  function place(el) { var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, r = document.createRange(), L = 1e9, T = 1e9, R = -1e9, h = 0;
    while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; r.selectNodeContents(n); var rs = r.getClientRects();
      for (var i = 0; i < rs.length; i++) { var q = rs[i]; if (!q.width) continue; if (q.left < L) L = q.left; if (q.right > R) R = q.right; if (q.top < T) { T = q.top; h = q.height; } } }
    var b = el.getBoundingClientRect(); if (R < L || !b.width) return;
    if (Math.abs(b.width - el.offsetWidth) > 2 || Math.abs(b.height - el.offsetHeight) > 2) return;
    var s = getComputedStyle(el), lh = parseFloat(s.lineHeight) || h;
    el.style.setProperty('--ci-lh', lh + 'px');
    // A plain block heading lays its lines out in its own content box, so the 3D gets exactly that box and lines up
    // line for line at any width. Only flex and grid headings (centered by the layout, not by text-align) use the
    // measured letters.
    if (!/flex|grid/.test(s.display)) {
      el.style.setProperty('--ci-x', parseFloat(s.paddingLeft) + 'px');
      el.style.setProperty('--ci-y', parseFloat(s.paddingTop) + 'px');
      el.style.setProperty('--ci-w', (el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)) + 'px');
      return; }
    el.style.setProperty('--ci-x', (L - b.left - el.clientLeft) + 'px');
    el.style.setProperty('--ci-y', (T - b.top - el.clientTop - (lh - h) / 2) + 'px');
    el.style.setProperty('--ci-w', (R - L + 0.5) + 'px'); }
  function relines() { document.querySelectorAll('[data-ci-x]').forEach(function (e) { var t = lines(e); if (t && t !== e.getAttribute('data-ci-x')) e.setAttribute('data-ci-x', t); place(e); }); }
  var rt; function later() { clearTimeout(rt); rt = setTimeout(relines, 200); }
  // The 3D copy only lines up when all the text inside is heading text at one size, in one flow of lines.
  function uniform(el, size) { var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; var p = n.parentElement, s = getComputedStyle(p);
      if (!/atomic.?marker|cinzel|CI Face/i.test(s.fontFamily) || s.fontSize !== size) return false;
      for (var q = p; q && q !== el; q = q.parentElement) if (getComputedStyle(q).display !== 'inline') return false; }
    return true; }
  // Turned or scaled text (the rotated "Reward Unlocked!" stamps) gets the new font without the 3D layer.
  function turned(el) { for (var q = el; q && q !== document.body; q = q.parentElement) { var tf = getComputedStyle(q).transform; if (tf && tf !== 'none' && !/^matrix\(1, 0, 0, 1,/.test(tf)) return true; } return false; }
  // The new logo (Maurice, 10/9): every copy of the old white wordmark, in the Squarespace header, the hunt menu, and the
  // game pages, becomes the new cracked logo.
  var LOGO = BASE + 'assets/img/logo-2026-white.webp?v=2';
  function logos() { var im = document.getElementsByTagName('img');
    for (var i = 0; i < im.length; i++) { var g = im[i], s = g.getAttribute('src') || g.getAttribute('data-src') || '';
      if (g.dataset.maLogo || !/Maurice\+Africh\+Logo\+-\+White|\/tm-wordmark\./i.test(s + (g.currentSrc || ''))) continue;
      g.dataset.maLogo = '1'; g.removeAttribute('srcset'); g.removeAttribute('data-srcset'); g.removeAttribute('sizes'); g.src = LOGO; } }
  function scan() { logos(); var all = document.body ? document.body.getElementsByTagName('*') : [];
    for (var i = 0; i < all.length; i++) { var el = all[i]; if (el.dataset && el.dataset.ci) continue;
      var cs = getComputedStyle(el), ff = cs.fontFamily; if (!HEAD.test(ff)) continue;
      el.dataset.ci = '1';
      el.style.setProperty('font-family', "'CI Face'," + ff, 'important'); el.style.setProperty('font-weight', '400', 'important');
      var keep = kept(el);
      if (!keep) el.style.setProperty('text-transform', 'uppercase', 'important');
      var c = cs.color;
      // The footer sign-off ("This website was designed by sky pirates", Maurice 10/9): lighter, with double the room.
      var foot = /designed by sky pirates/i.test(el.textContent || '') && el.closest('footer, .sqs-block');
      if (foot) { c = '#b3c2b8'; el.style.setProperty('color', c, 'important'); el.style.setProperty('-webkit-text-fill-color', c, 'important'); }
      el.style.setProperty('--ci-depth', dark(c) ? 'color-mix(in srgb, ' + c + ' 35%, #fff)' : 'color-mix(in srgb, ' + c + ' 42%, #000)');
      // Aura Spectrum cards (Maurice, 10/9): the 3D takes the card's own color instead of a gray: a darker shade of
      // it behind light lettering, a lighter shade behind dark lettering.
      var card = el.closest && el.closest('#ma-aura .au-card');
      if (card) { var cb = getComputedStyle(card), m = (cb.backgroundImage.match(/rgba?\([^)]*\)/) || [cb.backgroundColor])[0];
        if (m && !/rgba\(0, 0, 0, 0\)/.test(m)) el.style.setProperty('--ci-depth', dark(c) ? 'color-mix(in srgb, ' + m + ' 55%, #fff)' : 'color-mix(in srgb, ' + m + ' 50%, #000)'); }
      // One 3D layer per heading: on the outermost heading element, so pieces inside it aren't doubled.
      var p = el.parentElement, inner = false; while (p) { if (p.hasAttribute && p.hasAttribute('data-ci-d')) { inner = true; break; } p = p.parentElement; }
      if (inner) continue;
      el.setAttribute('data-ci-d', '');
      if (keep) el.style.setProperty('--ci-lh', cs.lineHeight === 'normal' ? '1.2' : cs.lineHeight);
      else { var h0 = el.offsetHeight;
        el.style.setProperty('line-height', '1.05', 'important'); el.style.setProperty('letter-spacing', '0.03em', 'important'); el.style.setProperty('text-wrap', 'balance');
        var lost = h0 - el.offsetHeight;
        // Only for headings in normal page flow; labels inside bars, badges, and positioned boxes keep their size.
        var pd = el.parentElement ? getComputedStyle(el.parentElement).display : '';
        if (lost > 1 && cs.display === 'block' && cs.position === 'static' && !/flex|grid/.test(pd)) { el.style.setProperty('padding-top', 'calc(' + cs.paddingTop + ' + ' + (lost / 2) + 'px)', 'important'); el.style.setProperty('padding-bottom', 'calc(' + cs.paddingBottom + ' + ' + (lost / 2) + 'px)', 'important'); } }
      if (foot) { var fb = el.closest('h1,h2,h3,h4,h5,h6,p') || el, fs2 = getComputedStyle(fb);
        el.style.removeProperty('padding-top'); el.style.removeProperty('padding-bottom');
        fb.style.setProperty('padding-top', (parseFloat(fs2.paddingTop) * 2 + 6) + 'px', 'important'); fb.style.setProperty('padding-bottom', (parseFloat(fs2.paddingBottom) * 2 + 6) + 'px', 'important');
        fb.style.setProperty('margin-top', (parseFloat(fs2.marginTop) * 2) + 'px', 'important'); fb.style.setProperty('margin-bottom', (parseFloat(fs2.marginBottom) * 2) + 'px', 'important'); }
      if (cs.display !== 'inline' && (el.innerText || '').trim() && uniform(el, cs.fontSize) && !turned(el)) {
        if (cs.position === 'static') el.style.setProperty('position', 'relative');
        el.setAttribute('data-ci-x', lines(el)); place(el); } } }
  var t; function soon() { clearTimeout(t); t = setTimeout(function () { scan(); later(); }, 120); }
  // New sections get scanned; text that changes in place (counters) only refreshes the 3D lines.
  function start() { scan(); later(); new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) if (ms[i].type === 'childList' && ms[i].addedNodes.length) return soon();
    later(); }).observe(document.body, { childList: true, subtree: true, characterData: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('load', soon); window.addEventListener('resize', later);
  if (document.fonts) { document.fonts.addEventListener('loadingdone', later); document.fonts.ready.then(later); }
})();
