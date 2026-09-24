// node tools/preorder-menu.mjs : turns the hunt menu's "PRE-ORDER CELLO'S GATE" button (on every page that has
// the hunt menu) into a dropdown matching the main site menu: the retailers, then "All Retailers →" (/preorder).
// Phones get the button linking straight to /preorder. Safe to re-run; edit STORES and run again to change the list.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BOT = resolve(ROOT, '../treasure-hunt-leaderboard');
const FILES = [join(ROOT, 'pages/hunt-menu.html'), join(ROOT, 'pages/contests.html'), join(ROOT, 'pages/lootbox-clue.html'), join(ROOT, 'pages/rules.html'),
  join(BOT, 'squarespace-hunt.html'), join(BOT, 'squarespace-lootbox.html'), join(BOT, 'squarespace-wordle.html'), join(BOT, 'games/_frame.html')];

// Same stores and links, in the same order, as the main menu's Pre-Order folder.
const STORES = [
  ['Barnes &amp; Noble', 'https://www.barnesandnoble.com/w/cellos-gate-maurice-africh/1146753302?ean=9781668242834'],
  ['Waterstones', 'https://www.waterstones.com/book/cellos-gate/maurice-africh/9781399763073'],
  ['Audible', 'https://www.amazon.com/Audible-Cellos-Gate/dp/B0GKZWW416/ref=tmm_aud_swatch_0?_encoding=UTF8&amp;dib_tag=se&amp;dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&amp;qid=1770340593&amp;sr=8-1&amp;ascsubtag=srctok-d4f496760f7c524a&amp;btn_ref=srctok-d4f496760f7c524a'],
  ['Amazon', 'https://www.amazon.com/Cellos-Gate-Sky-Pirates-Imperia/dp/1668242834/ref=sr_1_1?crid=279A8MV3ZYP0T&amp;dib=eyJ2IjoiMSJ9.RBX2LzKjSJiNUWTqmNKtS75WGKoRJIDr7LrYojLn1a7OJ-VKrLzE7_KGvq2QdIBq-PMve7-kIS5x7P0LX7pLXQXqXw7rm9JyqHzVf0Uujj1FDAqiGnSlEN0YwgWPkZX7KtiGUStagN0Lv_Mzbxkx1A.bAa6jbgYADzwequhA3uY18cTabBf0XksaeGD6jgY2ps&amp;dib_tag=se&amp;keywords=cellos+gate&amp;qid=1770340593&amp;sprefix=cellos%27+gate%2Caps%2C179&amp;sr=8-1&amp;ascsubtag=srctok-f7d285c3c39c18b3&amp;btn_ref=srctok-f7d285c3c39c18b3'],
  ['Bookshop.org', 'https://bookshop.org/p/books/cello-s-gate-maurice-africh/867e45638f69e94f?ean=9781668242834&amp;next=t'],
];
const ALL = 'https://www.mauriceafrich.com/preorder';

const OLD_DESKTOP = `<a href="https://linktr.ee/mauriceafrich" target="_blank" rel="noopener" class="mn-link mn-cta">PRE-ORDER CELLO'S GATE</a>`;
const OLD_PHONE = `<a href="https://linktr.ee/mauriceafrich" target="_blank" rel="noopener" class="mn-cta">PRE-ORDER CELLO'S GATE</a>`;
const DESKTOP = `<div class="mn-drop mn-drop-cta">
      <a href="${ALL}" class="mn-link mn-cta" aria-haspopup="true">PRE-ORDER CELLO'S GATE &#9662;</a>
      <div class="mn-dd"><div class="mn-dd-in">
${STORES.map(([n, u]) => `        <a href="${u}" target="_blank" rel="noopener">${n.toUpperCase()}</a>`).join('\n')}
        <a href="${ALL}" class="mn-all">ALL RETAILERS &rarr;</a>
      </div></div>
    </div>`;
const PHONE = `<a href="${ALL}" class="mn-cta">PRE-ORDER CELLO'S GATE</a>`;
const CSS_AFTER = `#hunt-nav .mn-drop:hover .mn-dd,#hunt-nav .mn-drop:focus-within .mn-dd{display:block}`;
const CSS = `\n#hunt-nav .mn-drop-cta .mn-dd{left:auto;right:0;transform:none}\n#hunt-nav .mn-dd-in a.mn-all{border-top:1px solid rgba(243,234,217,.25)}`;

for (const f of FILES) {
  let h = readFileSync(f, 'utf8'), n = 0;
  if (h.includes(OLD_DESKTOP)) { h = h.replace(OLD_DESKTOP, DESKTOP); n++; }
  else h = h.replace(/<div class="mn-drop mn-drop-cta">[\s\S]*?<\/div><\/div>\n    <\/div>/, () => (n++, DESKTOP)); // re-run: refresh the list
  if (h.includes(OLD_PHONE)) { h = h.replace(OLD_PHONE, PHONE); n++; }
  if (!h.includes('.mn-drop-cta .mn-dd{')) h = h.replace(CSS_AFTER, CSS_AFTER + CSS);
  writeFileSync(f, h);
  console.log(f.split(/[\/]/).slice(-1)[0], n ? `updated (${n})` : 'no change');
}
