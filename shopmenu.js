// Trench Market's menu is the website's menu (Maurice, 2026-10-10): THE TREASURE HUNT (dropdown), TRENCH MARKET
// (dropdown: Shop All and every category in the shop), LINKS, NEWSLETTER, JOIN THE DISCORD!, and the Pre-Order
// dropdown, 25px apart. Games sits in The Treasure Hunt panel under Earn Points, and Oracle's Gift is the last box of
// its third column. The panel's words and spacing match the website's exactly. The Treasure Hunt panel is built from the same
// pages/hunt-menu.html as the website's (the act links work like loader.js actify), in the same three columns,
// with a line under each box heading. Loaded by the shop theme (layout/theme.liquid) after its own tm.js.
(function () {
  if (window.__maShopMenu) return; window.__maShopMenu = true;
  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/shopmenu\.js.*$/, '') : 'https://africhmaurice.github.io/site/';
  var SITE = 'https://www.mauriceafrich.com', DISCORD = 'https://discord.gg/d36Xnj4umU', GAP = 25;
  var MEGA = [[['link', 'THE TREASURE HUNT', '/the-hunt'], ['group', 'EARN POINTS']], [['link', 'SUBMIT POINTS', '/points'], ['group', 'CURRENT PROGRESS']], [['group', 'ADVENTURE'], ['gift']]];
  // categories in the order the shop page shows them; any new category follows, A to Z
  var CAT_ORDER = ['stickers', 'apparel', 'hats', 'beanies', 'pins', 'mugs', 'puzzles', 'art-prints'];
  var ALL = '/collections/merch', AURA = SITE + '/oracles-gift/aura-spectrum';

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
    '.tm-th .tm-drop__panel{left:0;transform:none}' +
    '.tm-drop__in.tm-mega3{display:grid;grid-template-columns:repeat(3,minmax(262px,auto));gap:12px;padding:16px;align-items:start;width:max-content;max-height:calc(100vh - 120px);overflow-y:auto}' +
    '.tm-mega3 .tm-col{display:flex;flex-direction:column;gap:12px}' +
    '.tm-drop__in a.tm-top{display:block;text-align:center;border:1px solid rgba(243,234,217,.3);padding:14px!important;font-weight:800;letter-spacing:.12em}' +
    '.tm-grp>span:first-child,.tm-mnav .ma-mgrp>span:first-child{align-self:stretch;display:block;text-align:center;border-bottom:2px solid rgba(243,234,217,.45);padding-bottom:5px;margin-bottom:10px;line-height:1.3}' +
    '.tm-grp span.ma-sub,.tm-mnav span.ma-sub{display:block;align-self:stretch;font:800 11px/1.3 Almarai,sans-serif;letter-spacing:.16em;text-transform:uppercase;text-align:center;color:#fff;margin:10px 0 4px;padding:4px 10px;white-space:nowrap}' +
    'span.ma-sub-one{background:#482d85}span.ma-sub-two{background:#1a5e41;outline:1px solid #89fbcb}span.ma-sub-all{background:rgba(243,234,217,.14)}' +
    // the panel's sizes are the website's (loader.js huntCss), so it looks the same on both
    '.tm-mega3 a{font:700 clamp(12px,.92vw,14.4px)/1.2 Almarai,sans-serif!important;letter-spacing:.07em!important;padding:8px 14px!important}' +
    '.tm-mega3 a.tm-top{padding:14px!important;font-weight:800!important;letter-spacing:.12em!important}' +
    '.tm-mega3 a.tm-drop__btn{white-space:nowrap;padding:9px 10px!important;margin:4px 0}' +
    '.tm-drop__in.ma-boxed{padding:12px}.tm-drop__in.ma-boxed .tm-grp a{text-align:center}' +
    // phone menu: the hunt groups boxed like the website's phone menu
    '.tm-mnav .ma-mgrp{display:flex;flex-direction:column;align-items:center;border:1px solid rgba(243,234,217,.3);padding:12px 14px 10px;margin:8px 0}' +
    '.tm-mnav .ma-mgrp>span:first-child{font:800 12px/1.3 Almarai,sans-serif;letter-spacing:.16em;color:#a2f590;text-transform:uppercase}' +
    '.tm-mnav .ma-mgrp a{text-align:center}.tm-mnav .ma-mgrp a.tm-drop__btn{background:#c1330a;border:1.5px solid #f3ead9;margin:4px 0;color:#fff}' +
    '.tm-mnav details a.tm-top{text-align:center;border:1px solid rgba(243,234,217,.3);margin:8px 0;font-weight:800}';
  (document.head || document.documentElement).appendChild(css);

  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var link = function (href, text, cls) { var a = el('a', cls, text); a.href = href; if (href === DISCORD) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
  var plain = function (n) { return (n.textContent || '').replace(/\s+/g, ' ').trim(); };

  // ---- the hunt menu, shaped like the website's (mirrors loader.js actify, megaModel, and groupKids) ----
  var EARN = /\/the-hunt#tasks$|\/the-hunt#riddles$|\/lootbox-clue$|\/games$|\/contests$/;
  function sub(text, act) { return el('span', 'ma-sub ma-sub-' + act, text); }
  function shape(doc) {
    var ov = doc.getElementById('hunt-nav-ov'); if (!ov) return {};
    var q = function (s) { return [].slice.call(ov.querySelectorAll(s)); };
    q('.mn-ovgroup a[href$="/leaderboard"]').forEach(function (a) {
      a.parentNode.insertBefore(link(SITE + '/leaderboard?act=one', 'ACT ONE STANDINGS'), a.nextSibling);
      a.parentNode.insertBefore(link(SITE + '/leaderboard?act=two', 'ACT TWO STANDINGS'), a.nextSibling.nextSibling);
    });
    q('.mn-ovgroup a[href$="/the-hunt#rewards"]').forEach(function (a) {
      var p = a.parentNode;
      [sub('REWARDS', 'all'), link(SITE + '/the-hunt#rewards-act-one', 'ACT ONE'), link(SITE + '/act-one-winners', 'ACT ONE WINNERS'), link(SITE + '/the-hunt#rewards-act-two', 'ACT TWO')].forEach(function (n) { p.insertBefore(n, a); });
      p.removeChild(a);
    });
    var gs = {};
    [].forEach.call(ov.children, function (g) { if (g.classList.contains('mn-ovgroup') && g.firstElementChild && g.firstElementChild.tagName !== 'A') gs[plain(g.firstElementChild).toUpperCase()] = g; });
    if (gs['CURRENT PROGRESS'] && !gs['CURRENT PROGRESS'].querySelector('a[href$="/questions"]')) gs['CURRENT PROGRESS'].appendChild(link(SITE + '/questions', 'QUESTIONS?'));
    var earn = doc.createElement('div'); earn.appendChild(el('span', '', 'EARN POINTS'));
    [].filter.call(ov.children, function (a) { return a.tagName === 'A' && EARN.test(a.href) && !/#tasks$|#riddles$/.test(a.href); }).forEach(function (a) { earn.appendChild(link(a.getAttribute('href'), plain(a))); });
    [sub('ACT ONE', 'one'), link(SITE + '/the-hunt#act1-tasks', 'TASKS'), link(SITE + '/the-hunt#act1-riddles', 'RIDDLES & PUZZLES'),
      sub('ACT TWO', 'two'), link(SITE + '/the-hunt#tasks', 'TASKS'), link(SITE + '/the-hunt#riddles', 'RIDDLES & PUZZLES')].forEach(function (n) { earn.appendChild(n); });
    gs['EARN POINTS'] = earn;
    return gs;
  }
  // a group's heading and links, copied, without repeats
  function kids(g, add) {
    var seen = {};
    [].forEach.call(g.children, function (c) {
      if (c.tagName === 'A') {
        var href = c.getAttribute('href') || '', k = href + '|' + plain(c);
        if (seen[k]) return; seen[k] = 1;
        add(link(href, plain(c), c.classList.contains('mn-profile') ? 'tm-drop__btn' : ''));
      } else { var s = el('span', c.className && /ma-sub/.test(c.className) ? c.className : '', plain(c)); add(s); }
    });
  }
  function panel(gs) {
    var box = el('div', 'tm-drop__in tm-mega3');
    MEGA.forEach(function (col) {
      var c = el('div', 'tm-col');
      col.forEach(function (it) {
        if (it[0] === 'link') { c.appendChild(link(SITE + it[2], it[1], 'tm-top')); return; }
        if (it[0] === 'gift') { var gb = el('div', 'tm-grp'); gb.appendChild(el('span', '', "ORACLE'S GIFT")); gb.appendChild(link(AURA, 'AURA SPECTRUM')); c.appendChild(gb); return; }
        if (!gs[it[1]]) return;
        var g = el('div', 'tm-grp'); kids(gs[it[1]], function (k) { g.appendChild(k); }); c.appendChild(g);
      });
      box.appendChild(c);
    });
    return box;
  }
  function phoneHunt(gs, into) {
    MEGA.forEach(function (col) { col.forEach(function (it) {
      if (it[0] === 'link') { into.appendChild(link(SITE + it[2], it[1], 'tm-top')); return; }
      if (it[0] === 'gift') { var gb = el('div', 'ma-mgrp'); gb.appendChild(el('span', '', "ORACLE'S GIFT")); gb.appendChild(link(AURA, 'AURA SPECTRUM')); into.appendChild(gb); return; }
      if (!gs[it[1]]) return;
      var g = el('div', 'ma-mgrp'); kids(gs[it[1]], function (k) { g.appendChild(k); }); into.appendChild(g);
    }); });
  }

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

  // The new special editions sit right after Walmart's in every Pre-Order list (Maurice, 2026-10-12): the Waterstones
  // Exclusive Edition and the Broken Binding edition. Added here so the Squarespace, hunt, and shop menus all match.
  var SPECIAL = [['Waterstones Exclusive Edition', 'https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399766227'],
    ['Broken Binding Special Edition', 'https://thebrokenbindingsub.com/products/cellos-gate']];
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

  function build() {
    specialEditions();
    var nav = document.querySelector('.tm-nav'), list = document.querySelector('.tm-mnav__list');
    if (!nav || nav.classList.contains('ma-one')) return;
    var pre = [].filter.call(nav.children, function (c) { return c.querySelector && c.querySelector('.tm-nav__cta'); })[0] || nav.querySelector('.tm-nav__cta');
    if (pre && pre.parentNode !== nav) pre = pre.closest('.tm-drop');
    nav.classList.add('ma-one');

    var th = drop('THE TREASURE HUNT', SITE + '/the-hunt', 'tm-th'), thIn = th.querySelector('.tm-drop__in');
    // Trench Market, Oracle's Gift, and Pre-Order: each a box with its title and a line under it, as on the website
    var tm = drop('TRENCH MARKET', '/'), tmIn = boxed(tm, 'TRENCH MARKET');
    cats(tmIn, function (a) { tmIn.appendChild(a); });
    var gift = drop("ORACLE'S GIFT", SITE + '/oracles-gift/aura-spectrum'); boxed(gift, "ORACLE'S GIFT").appendChild(link(SITE + '/oracles-gift/aura-spectrum', 'AURA SPECTRUM'));
    var row = [th, tm, link(SITE + '/links', 'LINKS', 'tm-nav__link'), link(SITE + '/newsletter', 'NEWSLETTER', 'tm-nav__link'), link(DISCORD, 'JOIN THE DISCORD!', 'tm-nav__link')];
    while (nav.firstChild) nav.removeChild(nav.firstChild);
    row.forEach(function (n) { nav.appendChild(n); });
    if (pre) { nav.appendChild(pre); boxed(pre, "PRE-ORDER CELLO'S GATE"); }
    fitGap(nav); addEventListener('resize', function () { fitGap(nav); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitGap(nav); });

    // phone menu
    var mPre = null, mHunt = el('details'), mShop = el('details'), mGift = el('details');
    if (list) {
      mPre = [].filter.call(list.children, function (c) { return /pre-?order/i.test(plain(c)); })[0] || null;
      var sum = function (d, text) { var s = el('summary', '', text); var c = caret(); if (c) s.appendChild(c); d.appendChild(s); };
      sum(mHunt, 'THE TREASURE HUNT'); sum(mShop, 'TRENCH MARKET'); sum(mGift, "ORACLE'S GIFT");
      cats(mShop, function (a) { mShop.appendChild(a); }, true);
      mGift.appendChild(link(SITE + '/oracles-gift/aura-spectrum', 'AURA SPECTRUM'));
      var mrow = [mHunt, mShop, link(SITE + '/links', 'LINKS'), link(SITE + '/newsletter', 'NEWSLETTER'), link(DISCORD, 'JOIN THE DISCORD!')];
      while (list.firstChild) list.removeChild(list.firstChild);
      mrow.forEach(function (n) { list.appendChild(n); });
      if (mPre) list.appendChild(mPre);
    }
    specialEditions(); setTimeout(specialEditions, 1500);

    fetch(BASE + 'pages/hunt-menu.html', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (html) {
      var gs = shape(new DOMParser().parseFromString(html, 'text/html'));
      th.querySelector('.tm-drop__panel').replaceChild(panel(gs), thIn);
      if (list) phoneHunt(gs, mHunt);
    }).catch(function () {
      thIn.appendChild(link(SITE + '/the-hunt', 'THE TREASURE HUNT')); thIn.appendChild(link(SITE + '/points', 'SUBMIT POINTS'));
      if (list) { mHunt.appendChild(link(SITE + '/the-hunt', 'THE TREASURE HUNT')); mHunt.appendChild(link(SITE + '/points', 'SUBMIT POINTS')); }
    });
  }
  // Built once the theme's own scripts have run (tm.js wires up the theme's dropdowns), so they never double up on
  // these: at DOMContentLoaded, or at load if this arrives later.
  if (document.readyState === 'complete') build();
  else { document.addEventListener('DOMContentLoaded', build); window.addEventListener('load', build); }
})();
