// node tools/preorder.mjs : builds pages/preorder.html (the "All retailers" pre-order page) from the list below.
// To add or change a store: edit RETAILERS, run this, then npm run publish.
// Sources and checks: notes/preorder-retailers-2026-09-23.md. Avoid the old self-published 2025 listings noted there.
import { writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://africhmaurice.github.io/site/';

// [region, format, store, url]
const RETAILERS = [
  ['us', 'Hardcover', 'Amazon', 'https://www.amazon.com/dp/1668242834'],
  ['us', 'Hardcover', 'Barnes & Noble', 'https://www.barnesandnoble.com/w/cellos-gate-maurice-africh/1146753302?ean=9781668242834'],
  ['us', 'Hardcover', 'Bookshop.org', 'https://bookshop.org/p/books/cello-s-gate-maurice-africh/867e45638f69e94f?ean=9781668242834&next=t'],
  ['us', 'Hardcover', 'Target', 'https://www.target.com/p/cello-s-gate-the-sky-pirates-of-imperia-by-maurice-africh-hardcover/-/A-1009427866'],
  ['us', 'Hardcover', 'Walmart Exclusive Edition', 'https://www.walmart.com/ip/Cello-s-Gate-Walmart-Exclusive-Hardcover-9781668266922/20417514704'],
  ['us', 'Hardcover', 'Walmart', 'https://www.walmart.com/ip/The-Sky-Pirates-of-Imperia-Cello-s-Gate-Hardcover-9781668242834/19454961128'],
  ['us', 'Hardcover', 'Books-A-Million', 'https://www.booksamillion.com/p/9781668242834'],
  ['us', 'Hardcover', "Powell's", 'https://www.powells.com/book/cellos-gate-9781668242834'],
  ['us', 'Hardcover', 'Kinokuniya', 'https://united-states.kinokuniya.com/bw/9781668242834'],
  ['us', 'Hardcover', 'Hudson Booksellers', 'https://hudsonbooksellers.com/book/9781668242834'],
  ['us', 'Hardcover', 'Simon & Schuster', 'https://www.simonandschuster.com/books/Cellos-Gate/Maurice-Africh/The-Sky-Pirates-of-Imperia/9781668242834'],
  ['us', 'Ebook', 'Apple Books', 'https://books.apple.com/us/book/cellos-gate/id6758616524'],
  ['us', 'Ebook', 'Kobo', 'https://www.kobo.com/us/en/ebook/cello-s-gate-3'],
  ['us', 'Ebook', 'NOOK', 'https://www.barnesandnoble.com/w/cellos-gate-maurice-africh/1146753302?ean=9781668242858'],
  ['us', 'Ebook', 'Google Play', 'https://play.google.com/store/books/details/Maurice_Africh_Cello_s_Gate?id=fM28EQAAQBAJ'],
  ['us', 'Audiobook', 'Audible', 'https://www.audible.com/pd/Cellos-Gate-Audiobook/B0GL147D7S'],
  ['us', 'Audiobook', 'Libro.fm', 'https://libro.fm/audiobooks/9781668179703-cello-s-gate'],
  ['us', 'Audiobook', 'Apple Books', 'https://books.apple.com/us/audiobook/cellos-gate-unabridged/id1873854740'],
  ['us', 'Audiobook', 'Google Play', 'https://play.google.com/store/audiobooks/details/Maurice_Africh_Cello_s_Gate?id=AQAAAEAaORN5GM'],
  ['us', 'Audiobook', 'Audiobooks.com', 'https://www.audiobooks.com/audiobook/cellos-gate/1014560'],

  ['uk', 'Hardcover', 'Waterstones', 'https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399763073'],
  ['uk', 'Hardcover', 'Amazon UK', 'https://www.amazon.co.uk/s?k=9781399763073'],
  ['uk', 'Hardcover', 'Bookshop.org UK', 'https://uk.bookshop.org/p/books/cello-s-gate-maurice-africh/8f39e20930ef9b5f?ean=9781399763073&affiliate=10403'],
  ['uk', 'Hardcover', "Blackwell's", 'https://blackwells.co.uk/bookshop/product/9781399763073'],
  ['uk', 'Hardcover', 'Foyles', 'https://www.foyles.co.uk/book/cellos-gate/maurice-africh/9781399763073'],
  ['uk', 'Hardcover', 'Hive', 'https://www.hive.co.uk/product/maurice-africh/cellos-gate--the-exhilarating-first-book-in-an-action-packed-must-read-fantasy-adventure-sky-pirates-of-imperia-1/33461300'],
  ['uk', 'Hardcover', 'Forbidden Planet', 'https://forbiddenplanet.com/512636-the-sky-pirates-of-imperia-book-1-cellos-gate-hardcover/'],
  ['uk', 'Hardcover', 'TG Jones', 'https://www.tgjonesonline.co.uk/product/maurice-africh/cellos-gate--the-exhilarating-first-book-in-an-action-packed-must-read-fantasy-adventure-sky-pirates-of-imperia-1/16142838'],
  ['uk', 'Hardcover', 'Hodderscape', 'https://hodderscape.co.uk/products/cellos-gate'],
  ['uk', 'Hardcover', 'Hachette UK', 'https://www.hachette.co.uk/titles/maurice-africh/cellos-gate/9781399763073/'],
  ['uk', 'Ebook', 'Apple Books', 'https://books.apple.com/gb/book/cellos-gate/id6758547211'],
  ['uk', 'Audiobook', 'Audible UK', 'https://www.audible.co.uk/pd/Cellos-Gate-Audiobook/B0GL11HMKC'],

  ['ca', 'Hardcover', 'Indigo', 'https://www.indigo.ca/products/cellos-gate-1'],
  ['ca', 'Hardcover', 'Amazon Canada', 'https://www.amazon.ca/dp/1668242834'],
  ['ca', 'Hardcover', 'booksellers.ca', 'https://www.booksellers.ca/books/cello-s-gate-9781668242834'],
  ['ca', 'Hardcover', 'Simon & Schuster Canada', 'https://www.simonandschuster.ca/books/Cellos-Gate/Maurice-Africh/The-Sky-Pirates-of-Imperia/9781668242834'],
  ['ca', 'Ebook', 'Apple Books', 'https://books.apple.com/ca/book/cellos-gate/id6758616524'],
  ['ca', 'Audiobook', 'Audible Canada', 'https://www.audible.ca/pd/Cellos-Gate-Audiobook/B0GKZWP1MX'],

  ['au', 'Hardcover', 'Amazon Australia', 'https://www.amazon.com.au/dp/1399763075'],
  ['au', 'Hardcover', 'Booktopia', 'https://www.booktopia.com.au/cello-s-gate-maurice-africh/book/9781399763073.html'],
  ['au', 'Hardcover', 'Hachette Australia', 'https://www.hachette.com.au/maurice-africh/cellos-gate'],
  ['au', 'Paperback', 'Amazon Australia', 'https://www.amazon.com.au/dp/1399763083'],
  ['au', 'Paperback', 'QBD', 'https://www.qbd.com.au/cellos-gate/maurice-africh/9781399763080/'],
  ['au', 'Paperback', 'Dymocks', 'https://www.dymocks.com.au/9781399763080'],
  ['au', 'Ebook', 'Apple Books', 'https://books.apple.com/au/book/cellos-gate/id6758547211'],
  ['au', 'Audiobook', 'Audible Australia', 'https://www.audible.com.au/pd/Cellos-Gate-Audiobook/B0GKZXQLLW'],

  ['nz', 'Paperback', 'The Nile', 'https://www.thenile.co.nz/books/maurice-africh/cellos-gate/9781399763080'],
  ['nz', 'Hardcover', 'Hachette NZ', 'https://www.hachette.co.nz/maurice-africh/cellos-gate'],
];
const REGIONS = [['us', 'United States'], ['uk', 'United Kingdom'], ['ca', 'Canada'], ['au', 'Australia'], ['nz', 'New Zealand']];
const FORMATS = ['Hardcover', 'Paperback', 'Ebook', 'Audiobook'];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const btn = (store, url) => `<a class="po-btn" href="${esc(url)}" target="_blank" rel="noopener">${esc(store)}</a>`;

const regions = REGIONS.map(([id, name]) => {
  const rows = FORMATS.map((f) => {
    const list = RETAILERS.filter((r) => r[0] === id && r[1] === f);
    return list.length ? `
        <div class="po-format"><h3>${f}</h3><div class="po-btns">${list.map((r) => btn(r[2], r[3])).join('')}</div></div>` : '';
  }).join('');
  return `
    <section class="po-region" id="po-${id}">
      <h2>${name}</h2>${rows}
    </section>`;
}).join('');

const html = `<!-- Generated by tools/preorder.mjs; edit the list there, not this file. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">
<style>
#preorder{box-sizing:border-box;background:linear-gradient(rgba(9,23,7,.72),rgba(9,23,7,.82)),url(${BASE}assets/bg/overgrown-sphere-as470076105.webp) center/cover no-repeat fixed;padding-top:clamp(120px,12vw,170px);color:#fffffe;font-family:'Almarai',sans-serif;letter-spacing:.03em;padding-bottom:110px}
#preorder *,#preorder *::before,#preorder *::after{box-sizing:border-box}
#preorder .po-hero{max-width:1180px;margin:0 auto;padding:0 32px;display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:56px;align-items:center;position:relative}
#preorder .po-book{width:100%;height:auto;display:block;filter:drop-shadow(0 22px 34px rgba(0,0,0,.6))}
#preorder .po-kicker{font-weight:700;font-size:14px;letter-spacing:.14em;color:#a2f590;margin:0 0 14px}
#preorder h1{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(28px,3.9vw,60px);white-space:nowrap;line-height:1;margin:0 0 20px;color:#fffffe;text-transform:none}
#preorder .po-lede{font-size:clamp(16px,1.4vw,19px);line-height:1.6;color:#ede9dc;margin:0 0 28px;max-width:560px}
#preorder .po-jump{max-width:1180px;margin:64px auto 0;padding:0 32px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
#preorder .po-jump a{color:#fff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:.08em;border:1px solid rgba(243,234,217,.4);border-radius:999px;padding:10px 20px;transition:color .15s ease,border-color .15s ease}
#preorder .po-jump a:hover{color:#a2f590;border-color:#a2f590}
#preorder .po-region{max-width:1180px;margin:40px auto 0;padding:44px 48px 36px;background:rgba(38,142,98,.16);border:1px solid rgba(243,234,217,.18);scroll-margin-top:120px}
#preorder .po-region h2{font-family:'Atomic Marker',cursive;font-weight:400;font-size:clamp(28px,2.6vw,40px);line-height:1.1;color:#89fbcb;margin:0 0 26px;text-transform:none}
#preorder .po-format{display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;align-items:start;padding:16px 0;border-top:1px solid rgba(243,234,217,.12)}
#preorder .po-format h3{font-family:'Almarai',sans-serif!important;font-weight:800;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#c3a6ff;margin:12px 0 0}
#preorder .po-btns{display:flex;flex-wrap:wrap;gap:10px}
#preorder .po-btn{display:inline-block;color:#fff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:.05em;border:1.5px solid #f3ead9;padding:11px 18px;background:rgba(12,26,8,.35);transition:background .15s ease,transform .15s ease}
#preorder .po-btn:hover{background:#c1330a;transform:scale(1.04)}
#preorder .po-foot{max-width:1180px;margin:34px auto 0;padding:0 32px;text-align:center;font-size:14px;line-height:1.6;color:rgba(237,233,220,.75)}
@media (max-width:860px){
  #preorder{padding-top:110px}
  #preorder .po-hero{grid-template-columns:1fr;gap:28px;text-align:center;padding:0 20px}
  #preorder .po-book{max-width:230px;margin:0 auto}
  #preorder .po-lede{margin-left:auto;margin-right:auto}
  #preorder .po-jump{margin-top:44px;padding:0 16px}
  #preorder .po-region{margin:28px 16px 0;padding:32px 20px 24px}
  #preorder .po-format{grid-template-columns:1fr;gap:10px}
  #preorder .po-format h3{margin:0}
}
</style>
<div id="preorder">
  <div class="po-hero">
    <img class="po-book" src="${BASE}assets/img/cellos-gate-book.webp" width="760" height="1301" alt="Cello's Gate hardcover, The Sky Pirates of Imperia book one, by Maurice Africh">
    <div>
      <p class="po-kicker">THE SKY PIRATES OF IMPERIA · BOOK ONE</p>
      <h1>Pre-order Cello’s Gate</h1>
      <p class="po-lede">The deluxe hardcover, ebook and audiobook arrive November 3, 2026. Pick your region below, then your favorite store. In the U.S.? Look for the Walmart Exclusive Edition!</p>
    </div>
  </div>
  <nav class="po-jump" aria-label="Jump to region">${REGIONS.map(([id, name]) => `<a href="#po-${id}">${name}</a>`).join('')}</nav>
${regions}
  <p class="po-foot">Store not listed? Ask your local bookshop to order it in: U.S. ISBN 9781668242834, UK ISBN 9781399763073.</p>
</div>
`;
writeFileSync(join(ROOT, 'pages', 'preorder.html'), html);
console.log(`preorder.html: ${RETAILERS.length} links across ${REGIONS.length} regions`);
