// node tools/clues.mjs : rebuilds the clue boards on pages/lootbox-clue.html from the CLUES list below.
// Text is kept exactly as written (capital letters and line breaks matter for some clues), and HTML-escaped.
// To add a clue: add an entry, run this, then npm run publish.
// A clue can carry options: { flash: an image shown for a split second on click, img: a picture clue, href: the clue is a link,
//   hints: paid hints, bought one step at a time: [{ price, button, pics: [[words, picture], ...] } or { price, button, text }] }.
// A paid hint is recorded by the Loot Boxes web app (action=hint; HINTS in lootbox.gs must list the same prices)
// as a Games-tab row worth minus the price, which the twice-daily run takes off the player's points.
// node tools/clues.mjs --next writes a preview copy (pages/lootbox-clue-next.html) and leaves the live page alone.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NEXT = process.argv.includes('--next');
const LIVE_F = join(ROOT, 'pages', 'lootbox-clue.html');
const F = NEXT ? join(ROOT, 'pages', 'lootbox-clue-next.html') : LIVE_F;
const ART = 'https://africhmaurice.github.io/site/assets/clues/';
// The void (clue #18) is its own Squarespace page; the preview points at its preview copy instead.
// The Loot Boxes web app, read from the claim page so there is one place to change it.
const ENDPOINT = (readFileSync(join(ROOT, '..', 'treasure-hunt-leaderboard', 'squarespace-lootbox.html'), 'utf8').match(/var ENDPOINT = '([^']+)'/) || [])[1];
if (!ENDPOINT) throw new Error('web app address not found in squarespace-lootbox.html');
const VOID = NEXT ? 'https://africhmaurice.github.io/site/preview/the-void.html' : 'https://www.mauriceafrich.com/the-void';

const CLUES = [
  [0, 'CLICK IT'],
  [1, `The Quiet One waits
hanging, listless and forgotten
at the base of a
tree without leaves
no branches linking it
to the imperia
but carrying it out
into the world
far and away.
Within a liminal space
the Quiet One waits.`],
  [2, `“I would have lived in war
but my enemies brought me loot.”
— RR's #1 Fan`],
  [3, 'If you like this game, open this loot box!'],
  [4, `Down the
rabbit hole you
eager heathens!
Remember to
eat your veggies
and
drown your enemies in the
slow-cooked abyss!`],
  [5, 'WINE DADDY 45'],
  [6, 'NEEWWWW ACHIEVEMENT! This loot box is shaped like a cat girl, you dirty little lynx! I bet you like that, don\'t you?'],
  [7, 'Keep yapping and you never know.'],
  [9, 'Destination X'],
  [10, 'nuh ay thuh nuh sih buh oof kuh tuh ock'],
  [11, `the clock says tik.
the clock says tok.
a certaiN guy has hidden a prize.
no dragon’s hoard, no kings chest.
but a clever doom scroller might do bEst.
start with the clock.
fInd the guy.
only his personaL story
holds the key,
to the room for fans of fiction
(some might say addict),
to find their prize.`],
  [12, 'Samuel Chastain Rogers aka "Pops"', { hints: [{ price: 25, button: 'Pay 25 points for a hint.', shape: 'wide', pics: [['', ART + 'clue-12-hint-1.jpg'], ['', ART + 'clue-12-hint-2.jpg']] }] }],
  [13, 'In the Dark (Visually)', { flash: ART + 'clue-13-flash.webp', hints: [
    { price: 10, button: 'Pay 10 points for a hint.', text: 'click it' },
    { price: 15, button: 'Sacrifice 15 additional points for another clue.', text: 'emaN CM' },
  ] }],
  [14, 'Them: "As an author, you\'re not supposed to do this!"', { hints: [{ price: 25, button: 'Pay 25 points for a hint.', text: 'At least I didn\u2019t make it five stars.' }] }],
  [15, `“You're doing great, kid. I love your passion, your work ethic, your commitment to always being you. And that's what's important to me because *you're* important to me. I couldn't be more proud to be your dad.”`],
  [17, '', { img: ART + 'clue-17.webp', alt: 'A barrel smoker with a coffee can on its chimney', flash: ART + 'clue-17-flash.webp', flashFill: true, hints: [{ price: 10, button: 'Pay 10 points for a hint.', text: 'click it' }] }],
  [18, 'click this', { href: VOID }],
  [19, 'A DUDE WHO LIKES BOOKS PREDOMINANTLY LIKED BY LADIES BUT ALSO LOTS OF DUDES, SO...'],
  [20, 'Princess (with an H) + Wei Shi Capaldi', { hints: [
    { price: 25, button: 'Pay 25 points for a hint.', pics: [
      ['Princess (with an H)', ART + 'clue-20-hint-1.jpg'],
      ['Wei Shi', ART + 'clue-20-hint-2.jpg'],
      ['Capaldi', ART + 'clue-20-hint-3.jpg'],
    ] },
    { price: 15, button: 'Sacrifice 15 additional points for another clue.', text: '5:00' },
  ] }],
  [21, "It's in my linktree"],
  [22, '"The Angel Sun" by Pinkman, Daughter of Arathorn and Gilrean'],
  [23, 'Telekinetic Swords & 12ish Children'],
  [24, 'Getting the Band Back Together', { hints: [{ price: 25, button: 'Pay 25 points for a hint.', shape: 'book', pics: [['', ART + 'clue-24-hint-1b.jpg']] }] }],
  // After sunset (Eastern time) this clue wakes up: click it and "/in-the-dark" flashes for a split second.
  [25, '“In the dark”', { night: '/in-the-dark', hints: [{ price: 25, button: 'Pay 25 points for a hint.', shape: 'icon', pics: [['', ART + 'clue-25-hint-1c.png']] }] }],
  [26, "It'll come to you."],
  [27, "Your Loot Box"],
  [28, '', { img: ART + 'clue-28.webp', alt: 'A wedge of cheese', sticker: true, hints: [{ price: 25, button: 'Pay 25 points for a hint.', shape: 'icon', pics: [['', ART + 'clue-28-hint-1c.png'], ['', ART + 'clue-28-hint-2c.png']] }] }],
  [29, 'Catch Me If You Can'],
  [30, "I'm stuck!"],
  // The shop's "Find a loot box" button is box 31, and the button literally says it.
  [31, 'IT LITERALLY SAYS IT', { img: ART + 'clue-31.webp', alt: 'The confused side-eye meme', sticker: true, hints: [{ price: 25, button: 'Pay 25 points for a hint.', link: 'https://shop.mauriceafrich.com/', text: 'shop.mauriceafrich.com' }] }],
  [32, 'Okay? Byyyyeee!'],
  [34, '', { fill: '#482d85', hints: [{ price: 25, button: 'Pay 25 points for a hint.', text: 'the votes are in!' }] }],
  [36, 'Slide & Find'],
];

// The few lines above the cards that say what they are.
const INTRO = `  <div class="lc-intro">
    <h1 class="lc-title">The Clues</h1>
    <p>Loot boxes are hidden all over the internet. On social media, reading apps, author websites, and more! Every card below is a clue that leads to one of them. Some are riddles, some are pictures, and some are hiding in plain sight.</p>
    <p>When you find a box, click it to claim it and earn points. Every loot box found earns you an extra entry into the sweepstakes!</p>
  </div>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const boards = CLUES.map(([n, text, o = {}]) => {
  // *word* in a clue is shown in italics.
  const rich = (t) => esc(t).replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  let body = text ? `<div class="lc-text">${rich(text)}</div>` : '';
  if (o.href) body = `<a class="lc-text lc-link" href="${esc(o.href)}">${esc(text)}</a>`;
  if (o.img) body += `<img class="lc-img${o.sticker ? ' lc-sticker' : ''}" src="${esc(o.img)}" alt="${esc(o.alt || '')}" loading="lazy">`;
  // Paid hints: each step's button shows once the step before it is bought. Pictures load only once
  // paid for (data-src), and a text hint is kept out of the page source (base64) until then.
  if (o.hints) body += `
    <div class="lc-hint" data-clue="${n}">${o.hints.map((h, k) => `
      <div class="lc-step" data-step="${k + 1}" data-price="${h.price}" data-total="${o.hints.slice(0, k + 1).reduce((t, x) => t + x.price, 0)}"${k ? ' hidden' : ''}>
        <button type="button" class="lc-hint-btn">${esc(h.button)}</button>
        <div class="lc-hint-msg" aria-live="polite"></div>
        <div class="lc-hint-out" hidden>${h.pics
          ? `<div class="lc-hint-pics lc-${h.shape || 'tall'}" style="grid-template-columns:repeat(${Math.min(h.pics.length, 3)},minmax(0,1fr))${h.pics.length === 1 ? ';max-width:' + (h.shape === 'wide' ? '100%' : '300px') : ''}">${h.pics.map(([w, src]) => `<figure>${w ? `<figcaption>${esc(w)}</figcaption>` : ''}<img data-src="${esc(src)}" alt="${w ? 'Hint picture for ' + esc(w) : 'Hint picture'}"></figure>`).join('')}</div>`
          : h.link ? `<a class="lc-hint-text lc-hint-link" target="_blank" rel="noopener" data-h="${Buffer.from(h.link, 'utf8').toString('base64')}" data-t="${Buffer.from(h.text, 'utf8').toString('base64')}"></a>`
          : `<div class="lc-hint-text" data-t="${Buffer.from(h.text, 'utf8').toString('base64')}"></div>`}</div>
      </div>`).join('')}
    </div>`;
  if (o.night) return `  <div class="lc-board lc-night" data-clue="${n}" data-night="${esc(o.night)}">
    <div class="lc-num">#${n}</div>
    ${body}
  </div>`;
  // fill: the whole card is one color (the clue is the color itself).
  return `  <div class="lc-board${o.flash ? ' lc-flash' : ''}" data-clue="${n}"${o.fill ? ` style="background:${esc(o.fill)};min-height:220px"` : ''}${o.flash ? ` data-flash="${esc(o.flash)}"${o.flashFill ? ' data-fill' : ''} role="button" tabindex="0"` : ''}>
    <div class="lc-num">#${n}</div>
    ${body}
  </div>`;
}).join('\n');

// A flash clue: one click shows its image full screen for a split second, then it's gone.
// flashFill: the image covers the whole screen (a photo) instead of sitting centred on white (a logo).
const flashJs = `  <script>(function(){var s=document.getElementById('loot-clue');if(!s)return;
    Array.prototype.forEach.call(s.querySelectorAll('.lc-flash'),function(b){var src=b.getAttribute('data-flash');new Image().src=src;
      function go(){var o=document.createElement('div');o.className='lc-flash-ov'+(b.hasAttribute('data-fill')?' fill':'');o.innerHTML='<img alt="" src="'+src+'">';document.body.appendChild(o);setTimeout(function(){o.remove();},110);}
      b.addEventListener('click',go);b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});})();</script>`;

// Paid hints: find the player (the email the loot box page saved, or one they type), check the public profiles
// file shows enough points for this step and the ones before it, ask once more, then record it with the web app
// and show it. A player who has paid sees it again on every visit (localStorage); the sheet refuses paying twice.
const hintJs = `  <script>(function(){var s=document.getElementById('loot-clue');if(!s)return;
    var EP='${ENDPOINT}',DATA='https://africhmaurice.github.io/leaderboard/profiles.json';
    function me(){try{return JSON.parse(localStorage.getItem('thLoot:me')||'{}')||{};}catch(e){return {};}}
    function saved(){var m=me();try{return m.email||localStorage.getItem('thProfile:email')||'';}catch(e){return m.email||'';}}
    function hash(email){var bytes=new TextEncoder().encode('thp1:'+email.trim().toLowerCase());return crypto.subtle.digest('SHA-256',bytes).then(function(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return ('0'+b.toString(16)).slice(-2);}).join('').slice(0,32);});}
    var OK=/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;
    Array.prototype.forEach.call(s.querySelectorAll('.lc-hint'),function(h){var clue=h.getAttribute('data-clue'),steps=h.querySelectorAll('.lc-step');
      ['click','keydown'].forEach(function(ev){h.addEventListener(ev,function(e){e.stopPropagation();});});
      Array.prototype.forEach.call(steps,function(st,k){var step=k+1,price=+st.getAttribute('data-price'),total=+st.getAttribute('data-total'),KEY='thClueHint:'+clue+':'+step;
        var btn=st.querySelector('.lc-hint-btn'),msg=st.querySelector('.lc-hint-msg'),out=st.querySelector('.lc-hint-out');
        function say(html){msg.innerHTML=html;}
        function show(note){Array.prototype.forEach.call(out.querySelectorAll('img[data-src]'),function(i){i.src=i.getAttribute('data-src');i.removeAttribute('data-src');});
          var t=out.querySelector('.lc-hint-text[data-t]');if(t){t.textContent=decodeURIComponent(escape(atob(t.getAttribute('data-t'))));t.removeAttribute('data-t');if(t.hasAttribute('data-h')){t.href=atob(t.getAttribute('data-h'));t.removeAttribute('data-h');}}
          out.hidden=false;btn.hidden=true;say(note||'');if(steps[k+1])steps[k+1].hidden=false;}
        try{if(localStorage.getItem(KEY))show();}catch(e){}
        function ask(){say('<label>The email you hunt with<input type="email" autocomplete="email"></label><button type="button" class="lc-hint-go">Next</button>');
          var i=msg.querySelector('input');i.focus();msg.querySelector('.lc-hint-go').onclick=function(){var e=i.value.trim();if(!OK.test(e)){i.focus();return;}check(e);};}
        function check(email){say('Checking your points\\u2026');
          Promise.all([hash(email),fetch(DATA+'?t='+Date.now()).then(function(r){return r.json();})]).then(function(v){var p=(v[1].players||{})[v[0]],pts=p?(p.pts||0):0;
            if(!p){say('No hunter with that email yet. Use the email you use for loot boxes and the hunt forms. <button type="button" class="lc-hint-again">Try another email</button>');msg.querySelector('.lc-hint-again').onclick=ask;btn.hidden=true;return;}
            if(pts<total){say('This costs '+price+' points'+(total>price?' (on top of the '+(total-price)+' you already spent)':'')+', and you have '+pts.toLocaleString('en-US')+'. Earn a few more and come back!');return;}
            say('This takes <b>'+price+' points</b> off your total. Reveal it? <button type="button" class="lc-hint-yes">Yes, reveal it</button><button type="button" class="lc-hint-no">Cancel</button>');
            msg.querySelector('.lc-hint-no').onclick=function(){say('');btn.hidden=false;};
            msg.querySelector('.lc-hint-yes').onclick=function(){buy(email);};
          }).catch(function(){say('Something went wrong. Please try again in a minute.');btn.hidden=false;});}
        // The web app sometimes takes thirty seconds. Buying is safe to repeat (the sheet answers 'already'),
        // so a slow or lost answer is simply asked again, by JSONP if the POST itself is blocked.
        function send(q,done){var over=false,fin=function(d){if(!over){over=true;done(d);}};
          fetch(EP,{method:'POST',body:new URLSearchParams(q)}).then(function(r){return r.json();}).then(fin).catch(function(){
            var name='lchcb'+Math.random().toString(36).slice(2),sc=document.createElement('script');
            var t=setTimeout(function(){end();fin(null);},45000);
            function end(){clearTimeout(t);delete window[name];if(sc.parentNode)sc.parentNode.removeChild(sc);}
            window[name]=function(d){end();fin(d);};sc.onerror=function(){end();fin(null);};
            sc.src=EP+'?'+new URLSearchParams(q).toString()+'&callback='+name;document.body.appendChild(sc);});}
        function buy(email){var m=me(),tries=0;say('Unlocking\\u2026');
          var slow=setTimeout(function(){say('Still working\\u2026 the airship is slow right now. Please keep this page open.');},6000);
          var q={action:'hint',clue:clue,step:String(step),email:email,first_name:m.first_name||'',handle:m.handle||'',platform:m.platform||'',country:m.country||''};
          (function go(){tries++;send(q,function(d){
            if((!d||d.error==='busy'||d.error==='server')&&tries<4)return setTimeout(go,1500*tries);
            clearTimeout(slow);
            if(!d||!d.ok){say(d&&d.error==='closed'?'The hunt is closed.':'That didn\\u2019t go through. Please try again in a minute.');btn.hidden=false;return;}
            try{localStorage.setItem(KEY,'1');}catch(e){}
            show(d.status==='already'&&tries===1?'You already unlocked this one.':price+' points will come off your total at the next scoring update.');
          });})();}
        btn.addEventListener('click',function(){btn.hidden=true;var e=saved();if(e)check(e);else ask();});
      });
    });})();</script>`;

// Night clues and the /in-the-dark page: awake only between sunset and sunrise in Asheville, NC (Eastern time).
// ?night=1 or ?night=0 on the page address forces one or the other, for checking.
export const NIGHT_JS = `function maIsNight(){var pv=/github\.io$/.test(location.hostname);if(pv&&/[?&]night=1/.test(location.search))return true;if(pv&&/[?&]night=0/.test(location.search))return false;
  var r=Math.PI/180,lat=35.595*r,lng=-82.551,now=Date.now(),n0=Math.round(now/864e5+2440587.5-2451545);
  function sun(n){var J=n-lng/360,M=(357.5291+.98560028*J)%360,C=1.9148*Math.sin(M*r)+.02*Math.sin(2*M*r)+.0003*Math.sin(3*M*r),L=(M+C+282.9372)%360,
    Jt=2451545+J+.0053*Math.sin(M*r)-.0069*Math.sin(2*L*r),d=Math.asin(Math.sin(L*r)*Math.sin(23.4397*r)),
    w=Math.acos((Math.sin(-.833*r)-Math.sin(lat)*Math.sin(d))/(Math.cos(lat)*Math.cos(d)))/r,ms=function(j){return (j-2440587.5)*864e5;};
    return {rise:ms(Jt-w/360),set:ms(Jt+w/360)};}
  for(var k=-2;k<=1;k++){if(now>=sun(n0+k).set&&now<sun(n0+k+1).rise)return true;}return false;}`;
const nightJs = `  <script>(function(){${NIGHT_JS}var s=document.getElementById('loot-clue');if(!s)return;
    Array.prototype.forEach.call(s.querySelectorAll('.lc-night'),function(b){var said=b.getAttribute('data-night');
      function wake(){var on=maIsNight();b.classList.toggle('on',on);if(on){b.setAttribute('role','button');b.tabIndex=0;}else{b.removeAttribute('role');b.removeAttribute('tabindex');}}
      function go(){if(!b.classList.contains('on'))return;var o=document.createElement('div');o.className='lc-flash-ov lc-say';o.textContent=said;document.body.appendChild(o);setTimeout(function(){o.remove();},160);}
      wake();setInterval(wake,60000);b.addEventListener('click',go);b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});})();</script>`;

// "Hide the ones I've found" (Maurice, 2026-09-30): a clue #n leads to loot box n, so a hunter's scorecard says
// which cards they no longer need. Their email comes from the loot box page (thLoot:me) or the profile page, or
// they type it once. The card last saved by the loot box page shows the hidden ones straight away; the web app's
// scorecard ('card') then brings it up to date. The switch is remembered in this browser.
const findsJs = `  <script>(function(){var s=document.getElementById('loot-clue');if(!s)return;
    var EP='${ENDPOINT}',ON='thClues:hideFound',bar=s.querySelector('.lc-finds');if(!bar)return;
    var btn=bar.querySelector('.lc-finds-btn'),msg=bar.querySelector('.lc-finds-msg'),found=[],on=false,OK=/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;
    function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
    function put(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}}
    function email(){try{var m=JSON.parse(get('thLoot:me')||'{}')||{};return m.email||get('thProfile:email')||'';}catch(e){return get('thProfile:email')||'';}}
    try{var c=JSON.parse(get('thLoot:card')||'null');if(c&&c.found)found=c.found.map(Number);}catch(e){}
    function paint(){var n=0;Array.prototype.forEach.call(s.querySelectorAll('.lc-board'),function(b){var hide=on&&found.indexOf(+b.getAttribute('data-clue'))>=0;b.hidden=hide;if(hide)n++;});
      btn.textContent=on?'Show all clues':'Hide the clues I\\u2019ve found';btn.setAttribute('aria-pressed',on?'true':'false');
      msg.textContent=on?(n?n+(n===1?' clue is':' clues are')+' hidden. You found '+(n===1?'that box':'those boxes')+' already.':'None of these boxes are on your scorecard yet.'):'';}
    function load(e,done){var name='lcf'+Math.random().toString(36).slice(2),sc=document.createElement('script'),t=setTimeout(function(){fin(null);},30000);
      function fin(r){clearTimeout(t);delete window[name];if(sc.parentNode)sc.parentNode.removeChild(sc);done(r);}
      window[name]=fin;sc.onerror=function(){fin(null);};sc.src=EP+'?action=card&email='+encodeURIComponent(e)+'&callback='+name;document.body.appendChild(sc);}
    function turnOn(e){on=true;put(ON,'1');paint();msg.textContent=found.length?msg.textContent:'Checking your scorecard...';
      load(e,function(r){if(r&&r.ok){found=(r.found||[]).map(Number);try{localStorage.setItem('thLoot:card',JSON.stringify({found:r.found,count:r.count,at:Date.now()}));}catch(x){}}
        else if(!found.length){msg.textContent='Couldn\\u2019t reach your scorecard just now. Try again in a minute.';return;}paint();});}
    function ask(){msg.innerHTML='<label>The email you claim loot boxes with<input type="email" autocomplete="email" placeholder="you@example.com"></label><button type="button" class="lc-finds-go">Hide them</button>';
      var i=msg.querySelector('input');i.focus();function go(){var e=i.value.trim();if(!OK.test(e)){i.focus();return;}put('thProfile:email',e);turnOn(e);}
      msg.querySelector('.lc-finds-go').onclick=go;i.onkeydown=function(ev){if(ev.key==='Enter')go();};}
    btn.onclick=function(){if(on){on=false;put(ON,null);paint();return;}var e=email();if(e)turnOn(e);else ask();};
    if(get(ON)==='1'&&email())turnOn(email());})();</script>`;

let h = readFileSync(NEXT ? LIVE_F : F, 'utf8');
const a = h.indexOf('<section id="loot-clue">'); const b = h.indexOf('</section>', a);
if (a < 0 || b < 0) throw new Error('clue section not found');
const FINDS = `  <div class="lc-finds"><button type="button" class="lc-finds-btn" aria-pressed="false">Hide the clues I’ve found</button><div class="lc-finds-msg" aria-live="polite"></div></div>`;
h = h.slice(0, a) + `<section id="loot-clue">\n${INTRO}\n${FINDS}\n  <div class="lc-grid">\n${boards}\n  </div>\n${flashJs}\n${nightJs}\n${hintJs}\n${findsJs}\n` + h.slice(b);
// Background: the darkest Green at 90% over the art, held still while the page scrolls (Maurice, 2026-09-30).
h = h.replace(/(#loot-clue\{min-height:80vh;[^}]*background:)linear-gradient\(rgba\([^)]*\),rgba\([^)]*\)\)/, '$1linear-gradient(rgba(27,59,21,.9),rgba(27,59,21,.9))');

// Styles: number in Atomic Marker, clue in Almarai (no forced capitals), two boards per row.
const css = `#loot-clue .lc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;max-width:1240px;width:100%;align-items:stretch}
#loot-clue .lc-intro{max-width:760px;width:100%;text-align:center}
#loot-clue .lc-finds{display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:-12px;font-family:'Almarai',sans-serif;color:#fffffe;text-align:center}
#loot-clue .lc-finds button{font-family:'Almarai',sans-serif;font-weight:800;font-size:15px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;border-radius:0;padding:13px 26px;border:2px solid #fffffe;background:transparent;color:#fffffe}
#loot-clue .lc-finds button:hover,#loot-clue .lc-finds-btn[aria-pressed="true"]{background:#fffffe;color:#1b3b15}
#loot-clue .lc-finds-msg{font-size:16px;line-height:1.5;max-width:460px}
#loot-clue .lc-finds-msg:empty{display:none}
#loot-clue .lc-finds-msg label{display:block;font-weight:700;margin-bottom:10px}
#loot-clue .lc-finds-msg input{display:block;width:100%;box-sizing:border-box;margin-top:6px;font:inherit;font-size:16px;padding:10px 12px;border-radius:0;border:2px solid #fffffe;background:rgba(11,23,15,.35);color:#fffffe}
#loot-clue .lc-board[hidden]{display:none!important}
#loot-clue .lc-title{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(44px,5.4vw,76px);line-height:1.1;color:#89fbcb;margin:0 0 22px;text-wrap:balance}
#loot-clue .lc-intro p{text-transform:none;letter-spacing:.02em;font-size:clamp(17px,1.5vw,21px);line-height:1.6;text-wrap:pretty;margin:0 auto 14px}
#loot-clue .lc-board{box-sizing:border-box;max-width:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 44px 52px}
#loot-clue .lc-num{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(34px,3.4vw,52px);line-height:1;color:#89fbcb;margin:0 0 22px}
#loot-clue .lc-text{font-family:'Almarai',sans-serif;font-weight:700;font-size:clamp(18px,1.6vw,23px);line-height:1.55;letter-spacing:.02em;color:#fffffe;white-space:pre-line;text-transform:none;margin:0}
#loot-clue .lc-link{text-decoration:underline;text-underline-offset:4px;cursor:default}#loot-clue .lc-link:hover{color:#fffffe}
#loot-clue .lc-flash,#loot-clue .lc-flash *{cursor:default}
#loot-clue .lc-img{display:block;width:100%;max-width:420px;height:auto;border:3px solid #0b170f;box-shadow:4px 5px 0 rgba(0,0,0,.35)}#loot-clue .lc-img.lc-sticker{border:0;box-shadow:none;max-width:300px;margin-top:14px}
.lc-flash-ov{position:fixed;inset:0;z-index:2147483646;background:#fffffe;display:flex;align-items:center;justify-content:center;pointer-events:none}.lc-flash-ov img{width:min(60vw,448px);height:auto}.lc-flash-ov.fill{background:#0b170f}.lc-flash-ov.fill img{width:100%;height:100%;object-fit:cover}
.lc-flash-ov.lc-say{background:#0b170f;color:#fffffe;font-family:'Atomic Marker',cursive;font-size:clamp(44px,9vw,120px);letter-spacing:.02em}
#loot-clue .lc-hint{width:100%;margin-top:26px;display:flex;flex-direction:column;align-items:center;gap:18px;font-family:'Almarai',sans-serif;text-transform:none;letter-spacing:.02em}
#loot-clue .lc-step{width:100%;display:flex;flex-direction:column;align-items:center;gap:12px}
#loot-clue .lc-hint [hidden]{display:none!important}
#loot-clue .lc-hint button{font-family:'Almarai',sans-serif;font-weight:800;font-size:15px;letter-spacing:.04em;cursor:pointer;border-radius:0;padding:10px 20px;border:2px solid #fffffe;background:transparent;color:#fffffe;margin:4px}
#loot-clue .lc-hint button:hover,#loot-clue .lc-hint .lc-hint-yes{background:#fffffe;color:#0b170f}
#loot-clue .lc-hint-msg{color:#fffffe;font-size:16px;line-height:1.55;text-align:center;max-width:460px}
#loot-clue .lc-hint-msg:empty{display:none}
#loot-clue .lc-hint-msg label{display:block;font-weight:700;margin-bottom:8px}
#loot-clue .lc-hint-msg input{display:block;width:100%;box-sizing:border-box;margin-top:6px;font:inherit;font-size:16px;padding:10px 12px;border-radius:0;border:2px solid #fffffe;background:rgba(11,23,15,.35);color:#fffffe}
#loot-clue .lc-hint-out{width:100%}
#loot-clue .lc-hint-pics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;width:100%}
#loot-clue .lc-hint-pics figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:8px}
#loot-clue .lc-hint-pics figcaption{font-family:'bebas-neue-pro','Almarai',sans-serif;font-weight:700;text-transform:uppercase;color:#fffffe;font-size:21px;letter-spacing:.02em;line-height:1.3;text-align:center;min-height:2.6em;display:flex;align-items:flex-end;justify-content:center}
#loot-clue .lc-hint-pics{margin:0 auto}
#loot-clue .lc-hint-pics.lc-wide img{aspect-ratio:16/10}
#loot-clue .lc-hint-pics.lc-square img{aspect-ratio:1/1}
#loot-clue .lc-hint-pics.lc-book img{aspect-ratio:252/396}
#loot-clue .lc-hint-pics.lc-icon img{aspect-ratio:1/1;object-fit:contain;border:0;box-shadow:none;background:transparent}
#loot-clue .lc-hint-text.lc-hint-link{display:inline-block;font-family:'Almarai',sans-serif;font-weight:800;font-size:17px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;line-height:1.2;word-break:break-word;border-radius:0;padding:14px 30px;border:2px solid #fffffe;background:#fffffe;color:#0b170f;transition:background .15s,color .15s}
#loot-clue .lc-hint-text.lc-hint-link:hover{background:transparent;color:#fffffe}
#loot-clue .lc-hint-pics img{width:100%;aspect-ratio:3/4;object-fit:cover;border:3px solid #0b170f;box-shadow:4px 5px 0 rgba(0,0,0,.35)}
#loot-clue .lc-hint-text{font-family:'bebas-neue-pro','Almarai',sans-serif;font-weight:700;text-transform:uppercase;font-size:clamp(44px,5.4vw,70px);line-height:1;letter-spacing:.01em;color:#89fbcb;text-align:center}
@media (max-width:860px){#loot-clue .lc-grid{grid-template-columns:1fr;gap:24px}#loot-clue .lc-board{padding:44px 26px 40px}#loot-clue .lc-hint-pics{gap:10px}}`;
h = h.replace(/#loot-clue \.lc-grid\{[\s\S]*?@media \(max-width:860px\)\{[^\n]*\}\}\n?/, '');
h = h.replace('@media (max-width:760px){#loot-clue{padding:130px 20px 70px}', css + '\n@media (max-width:760px){#loot-clue{padding:130px 20px 70px}');
// Paid hint text is set in Bebas Neue Pro, from Maurice's Adobe Fonts kit (never the demo files).
if (!h.includes('use.typekit.net/hfm0eub.css')) h = h.replace('<style', '<link rel="stylesheet" href="https://use.typekit.net/hfm0eub.css">\n<style');
writeFileSync(F, h);
console.log(`${CLUES.length} clues written to ${NEXT ? 'the preview copy' : 'the live page'}: #${CLUES.map((c) => c[0]).join(', #')}`);
