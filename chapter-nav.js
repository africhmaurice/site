/* Chapter buttons (Maurice, 2026-10-08): a strip at the foot of every Choose Your Own Adventure page with the
   previous chapter, the treasure map, and the next chapter. loader.js loads this on every page; it only acts on
   the chapter pages below. Add a chapter here when its page goes live. */
(function () {
  if (window.__chapterNav) return; window.__chapterNav = true;
  var SITE = 'https://www.mauriceafrich.com';
  // each chapter's own colors: its panels, its accent for the small labels, and the fill on hover
  var CH = [
    ['/red-city', 'Shopping in the Red City', ['rgba(12,26,8,.55)', '#fd7547', '#c53200']],
    ['/the-crew', 'Meet the Crew', ['rgba(11,23,15,.6)', '#89fbcb', '#268e62']],
    ['/the-crash', 'Crash Landing', ['rgba(21,13,40,.78)', '#c3a6ff', '#7b4ee1']],
    ['/the-river', 'Fight the Levian', ['rgba(11,23,15,.9)', '#89fbcb', '#1a5e41']],
    ['/the-raft', 'Cross the River', ['rgba(11,23,15,.88)', '#a2f590', '#607667']]
  ];
  var path = (window.CHAPTER_PATH || location.pathname).replace(/\/+$/, '');
  var at = -1;
  for (var i = 0; i < CH.length; i++) if (CH[i][0] === path) at = i;
  if (at < 0) return;
  var prev = CH[at - 1], next = CH[at + 1], C = CH[at][2];

  var css = document.createElement('style');
  css.textContent =
    '#ma-chapters{box-sizing:border-box;max-width:1180px;margin:56px auto 0;padding:0 0 64px;font-family:Almarai,sans-serif}' +
    '#ma-chapters .mc-in{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:stretch}' +
    '#ma-chapters a{box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:8px;min-height:96px;padding:20px 24px;border:2px solid #f3ead9;border-radius:0;background:' + C[0] + ';color:#fffffe;text-decoration:none;transition:background .15s ease,color .15s ease}' +
    '#ma-chapters a:hover,#ma-chapters a:focus-visible{background:' + C[2] + ';color:#fffffe;outline:none}' +
    '#ma-chapters .mc-k{font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:' + C[1] + '}' +
    '#ma-chapters a:hover .mc-k,#ma-chapters a:focus-visible .mc-k{color:#fffffe}' +
    '#ma-chapters .mc-t{font-weight:800;font-size:18px;line-height:1.3;letter-spacing:.04em;text-transform:uppercase}' +
    '#ma-chapters .mc-prev{text-align:left}#ma-chapters .mc-map{text-align:center;align-items:center}#ma-chapters .mc-next{text-align:right;align-items:flex-end}' +
    '#ma-chapters .mc-gap{min-height:96px}' +
    '@media (max-width:760px){#ma-chapters{margin-top:40px;padding:0 0 48px}#ma-chapters .mc-in{grid-template-columns:minmax(0,1fr);gap:12px}#ma-chapters .mc-gap{display:none}#ma-chapters a{min-height:0;text-align:left!important;align-items:flex-start!important}}';
  document.head.appendChild(css);

  function link(cls, k, t, href) { return '<a class="' + cls + '" href="' + href + '"><span class="mc-k">' + k + '</span><span class="mc-t">' + t + '</span></a>'; }
  function build() {
    if (document.getElementById('ma-chapters')) return true;
    var mount = document.querySelector('[data-ma-page]');
    if (!mount || !mount.children.length) return false;
    var page = mount.querySelector('#rc');
    if (!page) return false;
    var strip = document.createElement('nav');
    strip.id = 'ma-chapters'; strip.setAttribute('aria-label', 'Chapters');
    strip.innerHTML = '<div class="mc-in">' +
      (prev ? link('mc-prev', '← Previous chapter', prev[1], SITE + prev[0]) : '<span class="mc-gap"></span>') +
      link('mc-map', 'The treasure map', 'See the map', SITE + '/the-hunt#map') +
      (next ? link('mc-next', 'Next chapter →', next[1], SITE + next[0]) : link('mc-next', 'The story so far →', 'The Adventure So Far', SITE + '/adventure')) +
      '</div>';
    page.appendChild(strip);
    return true;
  }
  if (!build()) { var n = 0, t = setInterval(function () { if (build() || ++n > 60) clearInterval(t); }, 500); }
})();
