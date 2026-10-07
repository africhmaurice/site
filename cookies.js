/* Cookie choices for mauriceafrich.com (Maurice, 2026-10-07).
   Squarespace's own banner asked everyone first, so the Meta Pixel missed most visits. This replaces it:
   - Visitors in Europe (UK, EU, and the rest, told apart by the phone or computer's time zone) are asked first,
     and the Pixel loads only after they accept.
   - Everyone else gets the Pixel right away, unless their browser sends Global Privacy Control.
   - A "Cookie Preferences" link at the bottom of every page (or any link to #cookie-preferences) lets anyone
     change their mind. The choice is remembered in this browser.
   Loaded by loader.js. Squarespace's banner and its Facebook Pixel setting are switched off, so this file is the
   only place the Pixel comes from. Testing: ?cookies=eu or ?cookies=us pretends to be there, ?cookies=reset
   forgets the saved choice. */
(function () {
  if (window.__maCookies) return;
  window.__maCookies = true;
  var PIXEL = '28680387211605164', KEY = 'ma-cookies';
  var test = (location.search.match(/[?&]cookies=(eu|us|reset)(&|$)/) || [])[1] || '';
  function saved() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function save(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
  if (test === 'reset') save('');

  // Europe by time zone: no outside lookup, instant, and people traveling in Europe are asked too.
  function inEurope() {
    if (test === 'eu' || test === 'us') return test === 'eu';
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (!tz) return true;
    return /^Europe\//.test(tz) || /^(Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe|Faeroe)|Asia\/(Nicosia|Famagusta)|Arctic\/Longyearbyen)$/.test(tz);
  }
  var EU = inEurope(), GPC = navigator.globalPrivacyControl === true;
  function allowed() { var c = saved(); return c === 'yes' || (c !== 'no' && !EU && !GPC); }

  // The Meta Pixel, Meta's standard snippet. If an older Squarespace Pixel is still on the page, it is reused.
  var on = false;
  function start() {
    if (on) return;
    on = true;
    if (typeof window.fbq === 'function') { try { window.fbq('consent', 'grant'); } catch (e) {} return; }
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL);
    window.fbq('track', 'PageView');
  }
  function stop() { on = false; try { if (typeof window.fbq === 'function') window.fbq('consent', 'revoke'); } catch (e) {} }
  if (allowed()) start(); else stop();

  // ---- The choice box (the Europe banner, and the panel the footer link opens) ----
  var CSS = '#ma-ck{position:fixed;left:16px;right:16px;bottom:16px;margin:0 auto;max-width:600px;box-sizing:border-box;z-index:2147483000;' +
    'background:#0b170f;border:2px solid #2c6021;border-radius:0;padding:22px 24px;color:#fff;font-family:Almarai,sans-serif;' +
    'font-size:15px;line-height:1.55;text-align:left;box-shadow:0 12px 40px rgba(0,0,0,.55);display:grid;gap:16px}' +
    '#ma-ck p{margin:0;color:#fff;font-size:15px;line-height:1.55;letter-spacing:0}' +
    '#ma-ck .ma-ck-now{color:#a2f590;font-weight:700}' +
    '#ma-ck a{color:#89fbcb;text-decoration:underline}' +
    '#ma-ck .ma-ck-row{display:flex;flex-wrap:wrap;gap:12px}' +
    '#ma-ck button{appearance:none;border-radius:0;cursor:pointer;font:700 15px/1.2 Almarai,sans-serif;letter-spacing:.04em;padding:12px 22px;margin:0}' +
    '#ma-ck .ma-ck-yes{background:#c53200;border:2px solid #c53200;color:#fff}' +
    '#ma-ck .ma-ck-yes:hover{background:#912501;border-color:#912501}' +
    '#ma-ck .ma-ck-no{background:transparent;border:2px solid #a2f590;color:#a2f590}' +
    '#ma-ck .ma-ck-no:hover{background:#1b3b15}' +
    '#ma-ck button:focus-visible,#ma-ck-bar a:focus-visible{outline:2px solid #3adb97;outline-offset:3px}' +
    '#ma-ck .ma-ck-x{position:absolute;top:8px;right:8px;width:36px;height:36px;padding:0;background:transparent;border:0;color:#a2f590;font-size:22px;line-height:36px}' +
    '#ma-ck.ma-ck-panel{padding-right:52px}' +
    '#ma-ck-bar{background:#0b170f;padding:16px 20px 20px;text-align:center;font-family:Almarai,sans-serif;font-size:14px;line-height:1.4}' +
    '#ma-ck-bar a{color:#a2f590;text-decoration:none;letter-spacing:.04em}' +
    '#ma-ck-bar a:hover{text-decoration:underline}' +
    '.manage-cookies-bar,.cookie-banner-mount-point,.cookie-banner-manager{display:none!important}' +
    '@media (max-width:600px){#ma-ck{left:12px;right:12px;bottom:12px;padding:20px}#ma-ck.ma-ck-panel{padding-right:48px}#ma-ck .ma-ck-row button{flex:1 1 0}}';

  function box(panel) {
    var old = document.getElementById('ma-ck');
    if (old) old.remove();
    var el = document.createElement('div');
    el.id = 'ma-ck';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie Preferences');
    if (panel) el.className = 'ma-ck-panel';
    el.innerHTML =
      '<p>I use cookies to see which of my posts and ads bring readers here, through Meta (Facebook and Instagram). ' +
      'Are you OK with that? You can change your mind anytime under Cookie Preferences at the bottom of the page, ' +
      'and my <a href="/privacy-policy">Privacy Policy</a> has the details.</p>' +
      (panel ? '<p class="ma-ck-now">Right now: ' + (allowed() ? 'cookies are on.' : 'cookies are off.') + '</p>' : '') +
      '<div class="ma-ck-row"><button type="button" class="ma-ck-yes">Accept</button><button type="button" class="ma-ck-no">Decline</button></div>' +
      (panel ? '<button type="button" class="ma-ck-x" aria-label="Close">&#x2715;</button>' : '');
    el.querySelector('.ma-ck-yes').onclick = function () { save('yes'); start(); el.remove(); };
    el.querySelector('.ma-ck-no').onclick = function () { save('no'); stop(); el.remove(); };
    if (panel) {
      el.querySelector('.ma-ck-x').onclick = function () { el.remove(); };
      el.addEventListener('keydown', function (e) { if (e.key === 'Escape') el.remove(); });
    }
    document.body.appendChild(el);
    if (panel) el.querySelector('.ma-ck-yes').focus();
  }

  function footerLink() {
    if (document.getElementById('ma-ck-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'ma-ck-bar';
    bar.innerHTML = '<a href="#cookie-preferences" role="button">Cookie Preferences</a>';
    var foot = document.getElementById('footer-sections') || document.querySelector('footer');
    var shown = foot && foot.offsetHeight > 0 && getComputedStyle(foot).display !== 'none';
    (shown ? foot : document.body).appendChild(bar);
  }

  function ready() {
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    footerLink();
    // Any link to #cookie-preferences opens the panel (the footer link, or one in the Privacy Policy).
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href$="#cookie-preferences"]');
      if (!a) return;
      e.preventDefault();
      box(true);
    }, true);
    if (location.hash === '#cookie-preferences') box(true);
    else if (EU && !saved()) {
      // Wait for the crest loading screen so the question shows up where people can see it.
      if (window.maAfterLoading) window.maAfterLoading(function () { box(false); }); else box(false);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
