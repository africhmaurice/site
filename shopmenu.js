// Trench Market's menu is the website's menu (Maurice, 2026-10-10; the post-hunt menu, 2026-11-11): THE HUNT,
// MARKET (dropdown: Shop All and every category in the shop), LINKS, GAMES (dropdown), NEWSLETTER, EXTRAS
// (dropdown), JOIN TRENCH!, and the ORDER CELLO'S GATE dropdown, 25px apart. The lists below are loader.js's MENU and
// RETAIL; a change to the website's menu is made in both. Loaded by the shop theme (layout/theme.liquid) after its own tm.js.
(function () {
  if (window.__maShopMenu) return; window.__maShopMenu = true;
  var SITE = 'https://www.mauriceafrich.com', DISCORD = 'https://discord.gg/d36Xnj4umU', GAP = 25;
  // categories in the order the shop page shows them; any new category follows, A to Z
  var CAT_ORDER = ['stickers', 'apparel', 'hats', 'beanies', 'pins', 'mugs', 'puzzles', 'art-prints'];
  var ALL = '/collections/merch', AURA = SITE + '/oracles-gift/aura-spectrum', QUIZ = SITE + '/sky-pirate-quiz-61748';   // the quiz under Aura Spectrum (Maurice, 2026-10-24)
  var ORDER_URL = SITE + '/order', ORDER_TEXT = "ORDER CELLO'S GATE";
  var HUNT = [['TREASURE HUNTER PROFILE', SITE + '/profile'], ['LEADERBOARD', SITE + '/leaderboard'], ['ACT ONE', SITE + '/act-one-winners'], ['ACT TWO', SITE + '/act-two-winners'],
    ['ACT THREE', SITE + '/act-three-winners'], ['ACT FOUR', SITE + '/act-four-winners'], ['THE TREASURE', SITE + '/the-treasure']];
  // Maurice, 2026-11-12: Arcade and Adventure under Games, Bookshelf under Extras, then Contests moved to Extras
  var GAMES = [['ARCADE', SITE + '/arcade'], ['ADVENTURE', SITE + '/adventure']];
  var EXTRAS = [['AURA SPECTRUM', AURA], ['TAKE THE QUIZ!', QUIZ], ['CREW DOSSIERS', SITE + '/crew-dossier'], ['BOOKSHELF', SITE + '/bookshelf'], ['CONTESTS', SITE + '/contests']];
  var RETAIL = [['Amazon', 'https://www.amazon.com/Cellos-Gate-Sky-Pirates-Imperia/dp/1668242834/ref=sr_1_1?crid=279A8MV3ZYP0T&dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&dib_tag=se&keywords=cellos+gate&qid=1770340593&sprefix=cellos%27+gate%2Caps%2C179&sr=8-1&ascsubtag=srctok-f7d285c3c39c18b3&btn_ref=srctok-f7d285c3c39c18b3'],
    ['Audible', 'https://www.amazon.com/Audible-Cellos-Gate/dp/B0GKZWW416/ref=tmm_aud_swatch_0?_encoding=UTF8&dib_tag=se&dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&qid=1770340593&sr=8-1&ascsubtag=srctok-d4f496760f7c524a&btn_ref=srctok-d4f496760f7c524a'],
    ['Walmart Special Edition', 'https://www.walmart.com/ip/Cello-s-Gate-Walmart-Exclusive-Hardcover-9781668266922/20417514704'],
    ['Waterstones Exclusive Edition', 'https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399766227'],
    ['Broken Binding (Sold Out!)', 'https://thebrokenbindingsub.com/products/cellos-gate'],
    ['Barnes & Noble', 'https://www.barnesandnoble.com/w/cellos-gate-maurice-africh/1146753302?ean=9781668242834'],
    ['All Retailers', ORDER_URL]];

  var css = document.createElement('style'); css.id = 'ma-shop-menu';
  css.textContent =
    '.tm-nav.ma-one{gap:var(--ma-gap,' + GAP + 'px)!important}' +
    '.tm-nav.ma-one .tm-nav__link{font-size:clamp(10.5px,.88vw,14.4px)}' +   // the website's menu size
    '.tm-nav.ma-one.ma-fs .tm-nav__link{font-size:var(--ma-fs)!important}' +
    '.tm-header.ma-burger .tm-nav{display:none!important}.tm-header.ma-burger .tm-burger{display:inline-flex!important}' +
    // the icon tab: small, square, in the header's green, hanging from the bar's right edge (desktop menu only)
    '@media (min-width:1101px){.tm-header:not(.ma-burger) .tm-header__row{position:relative}' +
    '.tm-header:not(.ma-burger) .tm-header__icons{position:absolute;top:100%;right:var(--ma-pad,4vw);z-index:4;display:flex;gap:2px;padding:0 6px 3px;background:var(--ma-hbg,#1a5e41);border-radius:0}' +
    '.tm-header:not(.ma-burger) .tm-header__icons .tm-icon-btn{width:30px;height:30px}' +
    '.tm-header:not(.ma-burger) .tm-header__icons svg{width:16px;height:16px}}' +
    '.tm-grp>span:first-child{align-self:stretch;display:block;text-align:center;border-bottom:2px solid rgba(243,234,217,.45);padding-bottom:5px;margin-bottom:10px;line-height:1.3}' +
    '.tm-drop__in.ma-boxed{padding:12px}.tm-drop__in.ma-boxed .tm-grp a{text-align:center}';
  (document.head || document.documentElement).appendChild(css);

  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var link = function (href, text, cls) { var a = el('a', cls, text); a.href = href; if (href === DISCORD) { a.target = '_blank'; a.rel = 'noopener'; } return a; };

  // ---- the row ----
  var caret = function () { var s = document.querySelector('.tm-nav .tm-nav__link svg'); return s ? s.cloneNode(true) : null; };
  function drop(label, href, extra) {
    var d = el('div', 'tm-drop' + (extra ? ' ' + extra : '')); d.setAttribute('data-tm-drop', '');
    var t = link(href, label, 'tm-nav__link'); t.setAttribute('aria-haspopup', 'true'); t.setAttribute('aria-expanded', 'false');
    var c = caret(); if (c) t.appendChild(c);
    var p = el('div', 'tm-drop__panel'), inn = el('div', 'tm-drop__in'); p.appendChild(inn); d.appendChild(t); d.appendChild(p);
    bind(d); return d;
  }
  // the same open and close behavior tm.js gives the theme's own dropdowns
  function bind(d) {
    var trigger = d.firstElementChild;
    var close = function () { d.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); };
    trigger.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: none)').matches && !d.classList.contains('is-open')) {
        e.preventDefault();
        document.querySelectorAll('[data-tm-drop].is-open').forEach(function (x) { x.classList.remove('is-open'); });
        d.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true');
      }
    });
    d.addEventListener('mouseenter', function () { trigger.setAttribute('aria-expanded', 'true'); keepIn(d); });
    d.addEventListener('mouseleave', close);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); trigger.focus(); } });
  }
  // a wide panel stays 16px inside the screen
  function keepIn(d) {
    var p = d.querySelector('.tm-drop__panel'); if (!p) return; p.style.marginLeft = '';
    requestAnimationFrame(function () { var r = p.getBoundingClientRect(), vw = document.documentElement.clientWidth, s = 0;
      if (!r.width) return; if (r.right > vw - 16) s = vw - 16 - r.right; if (r.left + s < 16) s = 16 - r.left; if (s) p.style.marginLeft = Math.round(s) + 'px'; });
  }
  // 25px between links, like the website: the search and cart icons hang in a small tab under the bar (Maurice, 10/10),
  // so the row is the website's row. If it still doesn't fit, the spacing tightens (to 12px), then the words shrink a
  // little (to 11px), and past that the menu button takes over (the icons go back into the bar beside it).
  function fitGap(nav) {
    var hdr = nav.closest('.tm-header') || document.body, row = nav.parentNode;
    hdr.classList.remove('ma-burger'); nav.style.removeProperty('--ma-gap'); nav.style.removeProperty('--ma-fs'); nav.classList.remove('ma-fs');
    // the tab takes the bar's own green and lines up with its right padding
    var bg = getComputedStyle(hdr).backgroundColor; if (/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) bg = getComputedStyle(row).backgroundColor;
    if (!/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) hdr.style.setProperty('--ma-hbg', bg);
    hdr.style.setProperty('--ma-pad', getComputedStyle(row).paddingRight);
    if (!nav.offsetWidth) return;
    var over = function () { var rs = getComputedStyle(row), last = nav.lastElementChild; return last.getBoundingClientRect().right - (row.getBoundingClientRect().right - parseFloat(rs.paddingRight)); };
    var o = over(), n = nav.children.length - 1;
    if (o <= 0.5 || n < 1) return;
    nav.style.setProperty('--ma-gap', Math.max(12, GAP - Math.ceil(o / n)) + 'px');
    var first = nav.querySelector('.tm-nav__link'), fs = first ? parseFloat(getComputedStyle(first).fontSize) : 0;
    if (over() > 0.5 && fs) { nav.classList.add('ma-fs'); while (over() > 0.5 && fs > 11) { fs -= 0.25; nav.style.setProperty('--ma-fs', fs + 'px'); } }
    if (over() > 0.5) { nav.style.removeProperty('--ma-gap'); nav.style.removeProperty('--ma-fs'); nav.classList.remove('ma-fs'); hdr.classList.add('ma-burger'); }
  }

  // wraps a dropdown's links in a titled box; returns the box, where its links go
  function boxed(d, title) {
    var inn = d.querySelector('.tm-drop__in'); if (!inn) return el('div');
    var have = inn.querySelector('.tm-grp'); if (have) return have;
    var g = el('div', 'tm-grp'); g.appendChild(el('span', '', title));
    while (inn.firstChild) g.appendChild(inn.firstChild);
    inn.appendChild(g); inn.classList.add('ma-boxed'); inn.classList.remove('tm-drop__in--mega'); return g;
  }
  function cats(list, addTo, phone) {
    var a = link(ALL, 'SHOP ALL', phone ? '' : ''); addTo(a);
    fetch('/collections.json?limit=250').then(function (r) { return r.json(); }).then(function (j) {
      var cs = (j.collections || []).filter(function (c) { return c.products_count > 0 && c.handle !== 'merch' && c.handle !== 'all' && c.handle !== 'frontpage'; });
      cs.sort(function (x, y) { var i = CAT_ORDER.indexOf(x.handle), k = CAT_ORDER.indexOf(y.handle); if (i < 0) i = 99; if (k < 0) k = 99; return i - k || x.title.localeCompare(y.title); });
      cs.forEach(function (c) { addTo(link('/collections/' + c.handle, c.title.toUpperCase())); });
    }).catch(function () {
      [['stickers', 'STICKERS'], ['apparel', 'APPAREL'], ['hats', 'HATS'], ['beanies', 'BEANIES'], ['pins', 'PINS'], ['mugs', 'MUGS'], ['puzzles', 'PUZZLES'], ['art-prints', 'PRINTS']].forEach(function (c) { addTo(link('/collections/' + c[0], c[1])); });
    });
  }

  function build() {
    var nav = document.querySelector('.tm-nav'), list = document.querySelector('.tm-mnav__list');
    if (!nav || nav.classList.contains('ma-one')) return;
    var pre = [].filter.call(nav.children, function (c) { return c.querySelector && c.querySelector('.tm-nav__cta'); })[0] || nav.querySelector('.tm-nav__cta');
    if (pre && pre.parentNode !== nav) pre = pre.closest('.tm-drop');
    nav.classList.add('ma-one');

    // each dropdown is a box with its title and a line under it, as on the website
    var fill = function (d, title, items) { var b = boxed(d, title); items.forEach(function (it) { b.appendChild(link(it[1], it[0])); }); return d; };
    // The Hunt is a plain link to the one-page hunt recap, no dropdown (Maurice, 2026-11-12)
    var th = link(SITE + '/the-hunt', 'THE HUNT', 'tm-nav__link'), ex = fill(drop('FUN STUFF', EXTRAS[0][1]), 'FUN STUFF', EXTRAS);
    var tm = drop('MARKET', '/'), tmIn = boxed(tm, 'MARKET');
    cats(tmIn, function (a) { tmIn.appendChild(a); });
    var gm = fill(drop('GAMES', GAMES[0][1]), 'GAMES', GAMES);
    // Home first, above The Hunt (Maurice, 2026-11-13)
    var row = [link(SITE + '/', 'HOME', 'tm-nav__link'), th, tm, link(SITE + '/links', 'LINKS', 'tm-nav__link'), gm, link(SITE + '/newsletter', 'NEWSLETTER', 'tm-nav__link'), ex, link(DISCORD, 'JOIN TRENCH!', 'tm-nav__link')];
    while (nav.firstChild) nav.removeChild(nav.firstChild);
    row.forEach(function (n) { nav.appendChild(n); });
    if (pre) {
      // the theme's own Order dropdown, with the website's retailers
      var cta = pre.querySelector('.tm-nav__cta'), inn = pre.querySelector('.tm-drop__in');
      if (cta) { cta.href = ORDER_URL; if (cta.firstChild && cta.firstChild.nodeType === 3) cta.firstChild.nodeValue = ORDER_TEXT; else cta.insertBefore(document.createTextNode(ORDER_TEXT), cta.firstChild); }
      if (inn) { while (inn.firstChild) inn.removeChild(inn.firstChild); RETAIL.forEach(function (r) { inn.appendChild(shopLink(r)); }); }
      nav.appendChild(pre); boxed(pre, ORDER_TEXT);
    }
    fitGap(nav); addEventListener('resize', function () { fitGap(nav); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitGap(nav); });

    // phone menu
    if (list) {
      var sum = function (text, items) { var d = el('details'), s = el('summary', '', text), c = caret(); if (c) s.appendChild(c); d.appendChild(s);
        (items || []).forEach(function (it) { d.appendChild(it.nodeType ? it : link(it[1], it[0])); }); return d; };
      var mShop = sum('MARKET');
      cats(mShop, function (a) { mShop.appendChild(a); }, true);
      var mrow = [link(SITE + '/', 'HOME'), link(SITE + '/the-hunt', 'THE HUNT'), mShop, link(SITE + '/links', 'LINKS'), sum('GAMES', GAMES),
        link(SITE + '/newsletter', 'NEWSLETTER'), sum('FUN STUFF', EXTRAS), link(DISCORD, 'JOIN TRENCH!'), sum(ORDER_TEXT, RETAIL.map(shopLink))];
      while (list.firstChild) list.removeChild(list.firstChild);
      mrow.forEach(function (n) { list.appendChild(n); });
    }
  }
  // a retailer link; the stores open in a new tab, All Retailers stays on the website
  function shopLink(r) { var a = link(r[1], r[0].toUpperCase()); if (r[1] !== ORDER_URL) { a.target = '_blank'; a.rel = 'noopener'; } return a; }
  // Built once the theme's own scripts have run (tm.js wires up the theme's dropdowns), so they never double up on
  // these: at DOMContentLoaded, or at load if this arrives later.
  if (document.readyState === 'complete') build();
  else { document.addEventListener('DOMContentLoaded', build); window.addEventListener('load', build); }
})();
