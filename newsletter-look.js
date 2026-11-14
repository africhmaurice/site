// Newsletter page look (Maurice, 2026-11-12). /newsletter is a plain Squarespace page with the Kit form in an embed
// block, so this script gives it today's look: one full-screen section over his moonrise art (ink veil, so the art
// shows faintly), the heading big, the line of copy under it, and the form's boxes floating right over the art
// (Maurice 2026-11-12, round 2: "remove the red box and just have the boxes floating there"). loader.js loads this only on /newsletter. The Kit form itself is moved, never rebuilt: the same <form>
// element, inputs, button, and Kit script keep working. Its own header and subheader stay inside it, hidden, and
// are shown again above the form as the page's H1 and line of copy (same words). The no-spam line is his round-2
// wording: "I won't spam you--I promise. Unsubscribe at any time." (his -- set as an em dash).
(function () {
  if (window.__maNewsletterLook) return; window.__maNewsletterLook = true;
  var HEAD = "Don't Miss A Single Chapter!";   // the form's own heading, used if its text can't be read cleanly

  var css = document.createElement('style'); css.id = 'ma-nl-css';
  css.textContent = [
    // the section fills the screen; the ink veil lightens to 82% so his art shows behind at low strength
    'section.ma-nl-sec{min-height:100vh!important;min-height:100svh!important;display:flex!important;flex-direction:column;justify-content:center}',
    'section.ma-nl-sec .section-background-overlay{opacity:.82!important;background-color:#0b170f!important}',
    'section.ma-nl-sec .content-wrapper{padding:0!important;max-width:none!important;width:100%}',
    'section.ma-nl-sec .content-wrapper>.content>*:not(#ma-nl){display:none!important}',
    '#ma-nl{box-sizing:border-box;width:100%;padding:clamp(124px,14vh,160px) clamp(16px,5vw,80px) clamp(56px,8vh,100px);font-family:"Almarai",sans-serif;color:#fff}',
    '#ma-nl *{box-sizing:border-box}',
    '#ma-nl .nl-in{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:clamp(32px,4.4vh,52px);text-align:center}',
    '#ma-nl .nl-copy{display:flex;flex-direction:column;align-items:center;gap:24px;max-width:1080px}',
    '#ma-nl h1{margin:0;font-family:"CI Face","Atomic Marker",Impact,sans-serif;font-weight:400;font-size:clamp(46px,8.4vw,128px);line-height:1.05;letter-spacing:.03em;text-transform:uppercase;color:#fffffe;text-wrap:balance}',
    '#ma-nl .nl-lede{margin:0;max-width:44ch;font-size:clamp(17px,1.5vw,21px);line-height:1.6;font-weight:700;color:rgba(255,255,255,.88);text-wrap:pretty}',
    // no panel: the boxes float over the art in a row as wide as the old panel's inside
    '#ma-nl .nl-panel{width:100%;max-width:800px}',
    '#ma-nl .formkit-form{background:transparent!important;border:0!important;border-radius:0!important;max-width:none!important;width:100%!important;margin:0!important;padding:0!important;box-shadow:none!important;font-family:"Almarai",sans-serif!important}',
    '#ma-nl .formkit-form>div{padding:0!important;margin:0!important;display:flex;flex-direction:column;gap:20px}',
    '#ma-nl .formkit-form .formkit-background{display:none!important}',
    '#ma-nl .formkit-form .formkit-header,#ma-nl .formkit-form .formkit-subheader{display:none!important}',
    '#ma-nl .formkit-form .formkit-fields{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr) auto;gap:12px!important;margin:0!important;padding:0!important}',
    '#ma-nl .formkit-form .formkit-field{margin:0!important;padding:0!important;flex:none!important;min-width:0}',
    '#ma-nl .formkit-form .formkit-input{width:100%!important;height:58px!important;margin:0!important;padding:0 18px!important;border:2px solid #fff!important;border-radius:0!important;background:#fff!important;color:#0b170f!important;font-family:"Almarai",sans-serif!important;font-size:17px!important;font-weight:700!important;line-height:1.2!important;box-shadow:4px 5px 0 rgba(11,23,15,.55)!important}',
    '#ma-nl .formkit-form .formkit-input::placeholder{color:rgba(11,23,15,.62)!important;opacity:1}',
    '#ma-nl .formkit-form .formkit-input:focus{outline:3px solid #3adb97!important;outline-offset:2px!important}',
    '#ma-nl .formkit-form .formkit-submit{height:58px!important;margin:0!important;padding:0 34px!important;border:2px solid #fff!important;border-radius:0!important;background:#c53200!important;color:#fff!important;font-family:"Almarai",sans-serif!important;font-weight:800!important;font-size:16px!important;letter-spacing:.1em!important;text-transform:uppercase;white-space:nowrap;transition:background .15s ease,border-color .15s ease}',
    '#ma-nl .formkit-form .formkit-submit>span{padding:0!important;display:block}',
    '#ma-nl .formkit-form .formkit-submit:hover,#ma-nl .formkit-form .formkit-submit:focus-visible{background:#268e62!important;border-color:#fff!important}#ma-nl .formkit-form .formkit-submit:focus-visible{outline:3px solid #3adb97!important;outline-offset:2px!important}',
    '#ma-nl .formkit-form .formkit-guarantee{margin:0!important;padding:0!important;color:rgba(255,255,255,.88)!important;font-family:"Almarai",sans-serif!important;font-weight:700!important;font-size:15px!important;line-height:1.5!important;text-align:center}',
    '#ma-nl .formkit-form .formkit-guarantee p{margin:0!important;text-align:center!important;text-wrap:balance}',
    '#ma-nl .formkit-form .formkit-alert{margin:0!important;padding:14px 18px!important;border-radius:0!important;list-style:none;font-family:"Almarai",sans-serif!important;font-size:16px!important;line-height:1.5!important}',
    '#ma-nl .formkit-form .formkit-alert:empty{display:none!important}',
    '#ma-nl .formkit-form .formkit-alert-error{background:#fff!important;border:0!important;color:#912501!important}',
    '#ma-nl .formkit-form .formkit-alert-success{background:#0b170f!important;border:0!important;color:#fff!important;font-weight:700}',
    '@media (max-width:760px){#ma-nl .formkit-form .formkit-fields{grid-template-columns:minmax(0,1fr)}#ma-nl .formkit-form .formkit-submit{width:100%!important}}',
    // a short rise once the loading screen lifts; nothing moves for people who ask for less motion
    '@keyframes ma-nl-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}',
    '#ma-nl.nl-wait .nl-copy,#ma-nl.nl-wait .nl-panel{opacity:0}',
    '#ma-nl.nl-go .nl-copy{animation:ma-nl-rise .8s cubic-bezier(.2,.7,.2,1) both}',
    '#ma-nl.nl-go .nl-panel{animation:ma-nl-rise .8s .15s cubic-bezier(.2,.7,.2,1) both}',
    '@media (prefers-reduced-motion:reduce){#ma-nl.nl-wait .nl-copy,#ma-nl.nl-wait .nl-panel{opacity:1}#ma-nl.nl-go .nl-copy,#ma-nl.nl-go .nl-panel{animation:none}}'
  ].join('');
  (document.head || document.documentElement).appendChild(css);

  function build() {
    var form = document.querySelector('form.formkit-form');
    if (!form) return false;
    if (document.getElementById('ma-nl')) return true;
    var sec = form.closest('section.page-section'), content = sec && sec.querySelector('.content-wrapper > .content');
    if (!content) return false;
    sec.classList.add('ma-nl-sec');
    var h2 = form.querySelector('.formkit-header h2, .formkit-header'), sub = form.querySelector('.formkit-subheader');
    var head = h2 && !h2.classList.contains('ma-dec') ? (h2.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (!head || head.toLowerCase() !== HEAD.toLowerCase()) head = HEAD;
    var lede = sub ? (sub.textContent || '').replace(/[​\s]+/g, ' ').trim() : '';

    var wrap = document.createElement('div'); wrap.id = 'ma-nl'; wrap.className = 'nl-wait';
    // the page sets its own room under the menu; the site's top-gap rule leaves it alone (it pulled the heading up under the menu, Maurice 2026-11-12)
    wrap.setAttribute('data-ma-keep-top', '');
    var inn = document.createElement('div'); inn.className = 'nl-in';
    var copy = document.createElement('div'); copy.className = 'nl-copy';
    var h1 = document.createElement('h1'); h1.textContent = head; copy.appendChild(h1);
    if (lede) { var p = document.createElement('p'); p.className = 'nl-lede'; p.textContent = lede; copy.appendChild(p); }
    var panel = document.createElement('div'); panel.className = 'nl-panel';
    inn.appendChild(copy); inn.appendChild(panel); wrap.appendChild(inn);
    content.insertBefore(wrap, content.firstChild);
    panel.appendChild(form);   // the same form element, moved: its inputs, button, and Kit handlers come with it
    // his no-spam line (round 2): only the words in Kit's own guarantee element change; the element stays
    var g = form.querySelector('.formkit-guarantee p') || form.querySelector('.formkit-guarantee');
    if (g) g.textContent = 'I won’t spam you—I promise. Unsubscribe at any time.';
    var go = function () { wrap.classList.remove('nl-wait'); wrap.classList.add('nl-go'); };
    if (window.maAfterLoading) window.maAfterLoading(go); else go();
    setTimeout(go, 4000);   // never leave it hidden
    return true;
  }
  function tryBuild(n) { if (!build() && n < 200) setTimeout(function () { tryBuild(n + 1); }, 50); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { tryBuild(0); }); else tryBuild(0);
})();
