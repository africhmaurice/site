/* Chapter buttons (Maurice, 2026-10-08): a strip at the foot of every Choose Your Own Adventure page with the
   previous chapter, the treasure map, and the next chapter. loader.js loads this on every page; it only acts on
   the chapter pages below. Add a chapter here when its page goes live. */
(function () {
  if (window.__chapterNav) return; window.__chapterNav = true;
  var SITE = 'https://www.mauriceafrich.com';
  var CH = [
    ['/red-city', 'Shopping in the Red City'],
    ['/the-crew', 'Meet the Crew'],
    ['/the-crash', 'Crash Landing'],
    ['/the-river', 'Fight the Levian'],
    ['/the-raft', 'Cross the River']
  ];
  var path = (window.CHAPTER_PATH || location.pathname).replace(/\/+$/, '');
  var at = -1;
  for (var i = 0; i < CH.length; i++) if (CH[i][0] === path) at = i;
  if (at < 0) return;
  var prev = CH[at - 1], next = CH[at + 1];

  var css = document.createElement('style');
  css.textContent =
    '#ma-chapters{box-sizing:border-box;width:100%;background:#0b170f;border-top:2px solid #f3ead9;padding:40px 24px;font-family:Almarai,sans-serif}' +
    '#ma-chapters .mc-in{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:stretch}' +
    '#ma-chapters a{box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:8px;min-height:96px;padding:20px 24px;border:2px solid #f3ead9;border-radius:0;background:rgba(243,234,217,.04);color:#fffffe;text-decoration:none;transition:background .15s ease,color .15s ease}' +
    '#ma-chapters a:hover,#ma-chapters a:focus-visible{background:#f3ead9;color:#0b170f;outline:none}' +
    '#ma-chapters .mc-k{font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#a2f590}' +
    '#ma-chapters a:hover .mc-k,#ma-chapters a:focus-visible .mc-k{color:#2c6021}' +
    '#ma-chapters .mc-t{font-weight:800;font-size:18px;line-height:1.3;letter-spacing:.04em;text-transform:uppercase}' +
    '#ma-chapters .mc-prev{text-align:left}#ma-chapters .mc-map{text-align:center;align-items:center}#ma-chapters .mc-next{text-align:right;align-items:flex-end}' +
    '#ma-chapters .mc-gap{min-height:96px}' +
    '@media (max-width:760px){#ma-chapters{padding:32px 16px}#ma-chapters .mc-in{grid-template-columns:minmax(0,1fr);gap:12px}#ma-chapters .mc-gap{display:none}#ma-chapters a{min-height:0;text-align:left!important;align-items:flex-start!important}}';
  document.head.appendChild(css);

  function link(cls, k, t, href) { return '<a class="' + cls + '" href="' + href + '"><span class="mc-k">' + k + '</span><span class="mc-t">' + t + '</span></a>'; }
  function build() {
    if (document.getElementById('ma-chapters')) return true;
    var mount = document.querySelector('[data-ma-page]');
    if (!mount || !mount.children.length) return false;
    var strip = document.createElement('nav');
    strip.id = 'ma-chapters'; strip.setAttribute('aria-label', 'Chapters');
    strip.innerHTML = '<div class="mc-in">' +
      (prev ? link('mc-prev', '← Previous chapter', prev[1], SITE + prev[0]) : '<span class="mc-gap"></span>') +
      link('mc-map', 'The treasure map', 'See the map', SITE + '/the-hunt#map') +
      (next ? link('mc-next', 'Next chapter →', next[1], SITE + next[0]) : link('mc-next', 'The story so far →', 'The Adventure So Far', SITE + '/adventure')) +
      '</div>';
    mount.parentNode.insertBefore(strip, mount.nextSibling);
    return true;
  }
  if (!build()) { var n = 0, t = setInterval(function () { if (build() || ++n > 60) clearInterval(t); }, 500); }
})();
