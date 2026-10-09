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
    "@font-face{font-family:'CI Extrude';src:url('" + FONTS + "CrackedImperia-ExtrudeFlush.woff2') format('woff2');font-weight:100 900;font-display:block;size-adjust:" + SIZE + "}" +
    "[data-ci-x]{isolation:isolate}" +
    // The 3D: the heading's words again, in the Extrude font, behind the face, on the same lines.
    "[data-ci-x]::before{content:attr(data-ci-x);position:absolute;inset:0;padding:inherit;border:0 solid transparent;border-width:inherit;box-sizing:border-box;font-family:'CI Extrude';font-size:inherit;line-height:var(--ci-lh,1.05);letter-spacing:inherit;word-spacing:inherit;text-align:inherit;text-transform:inherit;text-indent:inherit;white-space:pre;-webkit-text-stroke:0;color:var(--ci-depth);-webkit-text-fill-color:var(--ci-depth);background:none;filter:none;z-index:-1;pointer-events:none}";
  (document.head || document.documentElement).appendChild(st);
  var pre = document.createElement('link'); pre.rel = 'preload'; pre.as = 'font'; pre.type = 'font/woff2'; pre.crossOrigin = 'anonymous';
  pre.href = FONTS + 'CrackedImperia-Bold.woff2'; (document.head || document.documentElement).appendChild(pre);

  // A color counts as dark below this brightness; dark headings get the light 3D.
  function dark(c) { var m = c.match(/[\d.]+/g); if (!m) return false; return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] <= 110; }
  // The heading's text with a line break wherever the heading itself breaks, so the 3D copy wraps identically.
  function lines(el) { var out = [], top = null, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, r = document.createRange();
    while ((n = w.nextNode())) { var re = /\S+/g, m; while ((m = re.exec(n.textContent))) { r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
      var rc = r.getClientRects()[0]; if (!rc) continue; if (top === null || Math.abs(rc.top - top) > rc.height / 2) { out.push([]); top = rc.top; } out[out.length - 1].push(m[0]); } }
    return out.map(function (l) { return l.join(' '); }).join('\n'); }
  function relines() { document.querySelectorAll('[data-ci-x]').forEach(function (e) { var t = lines(e); if (t && t !== e.getAttribute('data-ci-x')) e.setAttribute('data-ci-x', t); }); }
  var rt; function later() { clearTimeout(rt); rt = setTimeout(relines, 200); }
  // The 3D copy only lines up when all the text inside is heading text at one size, in one flow of lines.
  function uniform(el, size) { var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; var p = n.parentElement, s = getComputedStyle(p);
      if (!/atomic.?marker|cinzel|CI Face/i.test(s.fontFamily) || s.fontSize !== size) return false;
      for (var q = p; q && q !== el; q = q.parentElement) if (getComputedStyle(q).display !== 'inline') return false; }
    return true; }
  function scan() { var all = document.body ? document.body.getElementsByTagName('*') : [];
    for (var i = 0; i < all.length; i++) { var el = all[i]; if (el.dataset && el.dataset.ci) continue;
      var cs = getComputedStyle(el), ff = cs.fontFamily; if (!HEAD.test(ff)) continue;
      el.dataset.ci = '1';
      el.style.setProperty('font-family', "'CI Face'," + ff, 'important'); el.style.setProperty('font-weight', '400', 'important');
      var keep = kept(el);
      if (!keep) el.style.setProperty('text-transform', 'uppercase', 'important');
      var c = cs.color;
      el.style.setProperty('--ci-depth', dark(c) ? 'color-mix(in srgb, ' + c + ' 35%, #fff)' : 'color-mix(in srgb, ' + c + ' 42%, #000)');
      // One 3D layer per heading: on the outermost heading element, so pieces inside it aren't doubled.
      var p = el.parentElement, inner = false; while (p) { if (p.hasAttribute && p.hasAttribute('data-ci-d')) { inner = true; break; } p = p.parentElement; }
      if (inner) continue;
      el.setAttribute('data-ci-d', '');
      if (keep) el.style.setProperty('--ci-lh', cs.lineHeight === 'normal' ? '1.2' : cs.lineHeight);
      else { el.style.setProperty('line-height', '1.05', 'important'); el.style.setProperty('letter-spacing', '0.03em', 'important'); el.style.setProperty('text-wrap', 'balance'); }
      if (cs.display !== 'inline' && (el.innerText || '').trim() && uniform(el, cs.fontSize)) {
        if (cs.position === 'static') el.style.setProperty('position', 'relative');
        el.setAttribute('data-ci-x', lines(el)); } } }
  var t; function soon() { clearTimeout(t); t = setTimeout(function () { scan(); later(); }, 120); }
  // New sections get scanned; text that changes in place (counters) only refreshes the 3D lines.
  function start() { scan(); later(); new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) if (ms[i].type === 'childList' && ms[i].addedNodes.length) return soon();
    later(); }).observe(document.body, { childList: true, subtree: true, characterData: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('load', soon); window.addEventListener('resize', later);
  if (document.fonts) { document.fonts.addEventListener('loadingdone', later); document.fonts.ready.then(later); }
})();
