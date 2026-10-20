// ---- the arcade card (Airship Runner, Thread the Needle; Maurice 2026-10-13) ----
// Built on the daily games' share card (treasure-hunt-leaderboard/games/share.js): a 1200x600 PNG in one of the six brand
// colors with the run's score, time, and place on this week's board. tools/arcade.mjs pastes this file into each arcade
// page between ARCADE-CARD markers; edit it here, then run node tools/arcade.mjs.
//   ArcadeCard.show(o)  after a run: o.game 'Thread the Needle', o.after (element the panel goes under), o.label 'GAPS',
//                       o.stat '312', o.line 'TIME 4:51' (optional), o.name '@handle', o.site 'mauriceafrich.com/...',
//                       o.icon (image url of the player's ship)
//   ArcadeCard.update(o) when the board answers: o.rank (place this week), o.best (best this week)
var ArcadeCard = (function () {
  var DISCORD = 'https://discord.gg/TV8SNnSGdb', url = null, opts = null, panel = null;
  var THEMES = {
    violet: { bg: '#482d85', band: '#2d1c53', text: '#fffffe', soft: 'rgba(255,255,254,.72)', stat: '#fffffe', frame: 'rgba(255,255,254,.3)' },
    scarlet: { bg: '#c53200', band: '#912501', text: '#fffffe', soft: 'rgba(255,255,254,.75)', stat: '#fffffe', frame: 'rgba(255,255,254,.3)' },
    green: { bg: '#2c6021', band: '#1b3b15', text: '#fffffe', soft: 'rgba(255,255,254,.72)', stat: '#a2f590', frame: 'rgba(162,245,144,.4)' },
    teal: { bg: '#268e62', band: '#1a5e41', text: '#fffffe', soft: 'rgba(255,255,254,.75)', stat: '#fffffe', frame: 'rgba(255,255,254,.3)' },
    ink: { bg: '#0b170f', band: '#213226', text: '#fffffe', soft: '#607667', stat: '#3adb97', frame: 'rgba(162,245,144,.35)' },
    parchment: { bg: '#fffffe', band: '#c53200', text: '#0b170f', soft: '#607667', stat: '#c53200', frame: 'rgba(11,23,15,.25)' }
  };
  var NAMES = { violet: 'Violet', scarlet: 'Scarlet', green: 'Green', teal: 'Teal', ink: 'Ink', parchment: 'Parchment' };
  var css = document.createElement('style');
  css.textContent = '.ac-card{width:min(100%,640px);margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:16px;padding:clamp(22px,4vw,30px) clamp(18px,3vw,28px);background:#132219;border:2px solid rgba(243,234,217,.18);color:#fffffe;text-align:center;box-sizing:border-box}' +
    '.ac-card *{box-sizing:border-box;border-radius:0}' +
    '.ac-h{font-family:"Cracked Imperia",Impact,sans-serif;font-weight:400;font-size:clamp(26px,4.4vw,38px);line-height:1.25;letter-spacing:.03em;color:#a2f590;margin:0}' +
    '.ac-img{display:block;width:100%;max-width:560px;aspect-ratio:2/1;background:#0b170f;border:2px solid rgba(162,245,144,.35)}' +
    '.ac-sw{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0;padding:0;border:0}' +
    '.ac-sw legend{width:100%;padding:0;margin:0 0 10px;font-family:"Almarai",sans-serif;font-weight:700;font-size:14px;letter-spacing:.08em;color:#fffffe;text-align:center}' +
    '.ac-swatch{width:34px;height:34px;margin:0;border:2px solid rgba(255,255,254,.55);padding:0;cursor:pointer;transition:transform .12s ease}' +
    '.ac-swatch:hover{transform:scale(1.1)}.ac-swatch[aria-pressed="true"]{outline:3px solid #a2f590;outline-offset:3px}' +
    '.ac-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}' +
    '.ac-btns button{margin:0;min-width:200px;font-family:"Almarai",sans-serif;font-weight:800;font-size:15px;letter-spacing:.08em;color:#fffffe;background:#c53200;border:2px solid #fffffe;padding:12px 20px;cursor:pointer;transition:background .15s ease,transform .15s ease}' +
    '.ac-btns button:hover,.ac-btns button:focus-visible{background:#ff4c0f;transform:scale(1.04);outline:none}' +
    '.ac-how{font-family:"Almarai",sans-serif;font-size:clamp(14px,1.8vw,16px);line-height:1.6;margin:0;max-width:480px;color:#f3ead9}.ac-how a{color:#a2f590}' +
    '@media (prefers-reduced-motion:reduce){.ac-swatch,.ac-btns button{transition:none}}';
  document.head.appendChild(css);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function key() { return 'thArcadeColor:' + opts.game; }
  function weekLine() {
    // the Friday that ends this week, New York time (the board's week)
    var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(new Date()), o = {};
    f.forEach(function (p) { o[p.type] = p.value; });
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), add = (5 - wd + 7) % 7;
    var d = new Date(Date.UTC(+o.year, +o.month - 1, +o.day + add, 12));
    return 'WEEK ENDING ' + d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  }
  function show(o) {
    opts = o; o.theme = 'ink';
    try { var saved = localStorage.getItem(key()); if (saved && THEMES[saved]) o.theme = saved; } catch (e) {}
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    var d = document.createElement('div');
    d.innerHTML = '<div class="ac-card" id="ac-card"><p class="ac-h">Export your card</p>' +
      '<img loading="lazy" decoding="async" class="ac-img" alt="My ' + esc(o.game) + ' card: ' + esc(o.label.toLowerCase()) + ' ' + esc(o.stat) + '">' +
      '<fieldset class="ac-sw"><legend>PICK YOUR COLOR</legend>' + Object.keys(THEMES).map(function (k) {
        return '<button type="button" class="ac-swatch" data-theme="' + k + '" aria-pressed="' + (k === o.theme) + '" aria-label="' + NAMES[k] + '" title="' + NAMES[k] + '" style="background:' + THEMES[k].bg + '"></button>';
      }).join('') + '</fieldset>' +
      '<div class="ac-btns"><button type="button" class="ac-save">SAVE MY CARD</button><button type="button" class="ac-copy">COPY MY SCORE</button></div>' +
      '<p class="ac-how">Post your card in <b>#🎯DAILY_GAMES</b> in the <a href="' + DISCORD + '" target="_blank" rel="noopener">Trench Community Discord</a> and see who can beat it.</p></div>';
    panel = d.firstChild;
    o.after.parentNode.insertBefore(panel, o.after.nextSibling);
    panel.querySelector('.ac-sw').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.ac-swatch') : null; if (!b) return;
      opts.theme = b.getAttribute('data-theme');
      try { localStorage.setItem(key(), opts.theme); } catch (er) {}
      [].forEach.call(panel.querySelectorAll('.ac-swatch'), function (s) { s.setAttribute('aria-pressed', String(s === b)); });
      draw();
    });
    panel.querySelector('.ac-save').addEventListener('click', function () { save(this); });
    panel.querySelector('.ac-copy').addEventListener('click', function () { copy(this); });
    draw();
    return panel;
  }
  function update(o) { if (!opts) return; for (var k in o) if (o[k] != null) opts[k] = o[k]; draw(); }
  function load(src) { return new Promise(function (ok) { if (!src) return ok(null); var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function fit(x, s, px, py, max) {
    var m = /^(.*?)(\d+)px\s*(.*)$/.exec(x.font), size = +m[2];
    while (x.measureText(s).width > max && size > 12) { size -= 1; x.font = m[1] + size + 'px ' + m[3]; }
    x.fillText(s, px, py);
  }
  function spaced(x, s, px, py, gap, max) {
    if ('letterSpacing' in x) x.letterSpacing = gap + 'px';
    if (max) fit(x, s, px, py, max); else x.fillText(s, px, py);
    if ('letterSpacing' in x) x.letterSpacing = '0px';
  }
  function draw() {
    var o = opts;
    var fonts = document.fonts ? Promise.all([document.fonts.load('84px "Cracked Imperia"'), document.fonts.load('700 28px Almarai'), document.fonts.load('800 150px Almarai')]).catch(function () {}) : Promise.resolve();
    return fonts.then(function () { return load(o.icon); }).then(function (icon) {
      var W = 1200, H = 600, c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d'), T = THEMES[o.theme] || THEMES.ink;
      x.fillStyle = T.bg; x.fillRect(0, 0, W, H);
      x.fillStyle = T.band; x.fillRect(0, 0, W, 14); x.fillRect(0, H - 14, W, 14);
      x.strokeStyle = T.frame; x.lineWidth = 2; x.strokeRect(40, 54, W - 80, H - 108);
      x.textBaseline = 'alphabetic'; x.textAlign = 'left';
      // left: whose run, which game, which week, and their ship
      x.fillStyle = T.soft; x.font = '800 22px Almarai, sans-serif'; spaced(x, "THE ARCADE · CELLO'S GATE TREASURE HUNT", 80, 122, 3, 620);
      x.fillStyle = T.text; x.font = '84px "Cracked Imperia", Impact, sans-serif'; spaced(x, o.game.toUpperCase(), 80, 230, 2, 600);
      if (o.name) { x.fillStyle = T.text; x.font = '700 28px Almarai, sans-serif'; spaced(x, String(o.name).toUpperCase(), 80, 292, 2, 600); }
      x.fillStyle = T.soft; x.font = '700 24px Almarai, sans-serif'; spaced(x, weekLine(), 80, o.name ? 336 : 300, 2, 600);
      if (icon) {
        var ih = 120, iw = Math.min(260, ih * icon.naturalWidth / icon.naturalHeight), px = 86, py = 380;
        var m = document.createElement('canvas'); m.width = Math.ceil(iw); m.height = ih; var mx = m.getContext('2d');
        mx.drawImage(icon, 0, 0, iw, ih); mx.globalCompositeOperation = 'source-in'; mx.fillStyle = T.text; mx.fillRect(0, 0, iw, ih);
        for (var a = 0; a < 16; a++) x.drawImage(m, px + Math.cos(a / 8 * Math.PI) * 3, py + Math.sin(a / 8 * Math.PI) * 3);
        x.drawImage(icon, px, py, iw, ih);
      }
      // right: the result, the time, the place on the board
      x.textAlign = 'center';
      x.fillStyle = T.text; x.font = '800 26px Almarai, sans-serif'; spaced(x, o.label.toUpperCase(), 930, 178, 4, 380);
      x.fillStyle = T.stat; x.font = '800 150px Almarai, sans-serif'; fit(x, String(o.stat), 930, 330, 380);
      var y = 384;
      if (o.line) { x.fillStyle = T.text; x.font = '800 28px Almarai, sans-serif'; spaced(x, o.line.toUpperCase(), 930, y, 3, 380); y += 44; }
      var place = o.rank ? '#' + o.rank + ' ON THIS WEEK’S BOARD' : (o.best ? 'BEST THIS WEEK: ' + o.best : '');
      if (place) { x.fillStyle = T.stat; x.font = '800 26px Almarai, sans-serif'; spaced(x, place, 930, y, 2, 380); }
      x.fillStyle = T.text; x.font = '700 21px Almarai, sans-serif'; fit(x, o.site.toUpperCase(), 930, 506, 360);
      x.textAlign = 'left';
      url = c.toDataURL('image/png');
      var im = panel && panel.querySelector('.ac-img'); if (im) im.src = url;
      return url;
    });
  }
  function text() {
    return opts.game + ': ' + opts.label.toLowerCase() + ' ' + opts.stat + (opts.line ? ' (' + opts.line.toLowerCase() + ')' : '') +
      (opts.rank ? ', #' + opts.rank + ' on this week’s board' : '') + '. Play at ' + opts.site;
  }
  function save(btn) {
    if (!url) return;
    fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
      var name = opts.game.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + opts.stat + '.png';
      var file = typeof File === 'function' ? new File([b], name, { type: 'image/png' }) : null;
      // phones: the share sheet, so it can go straight into Discord. Everywhere else: a download.
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        return navigator.share({ files: [file], text: text() }).catch(function () {});
      }
      var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      btn.textContent = 'SAVED!'; setTimeout(function () { btn.textContent = 'SAVE MY CARD'; }, 2200);
    });
  }
  function copy(btn) {
    var done = function () { btn.textContent = 'COPIED!'; setTimeout(function () { btn.textContent = 'COPY MY SCORE'; }, 2200); };
    try { navigator.clipboard.writeText(text()).then(done, function () { window.prompt('Copy your score:', text()); }); }
    catch (e) { window.prompt('Copy your score:', text()); }
  }
  return { show: show, update: update, scrollTo: function () { if (panel) try { panel.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} } };
})();
