# mauriceafrich.com: page content, managed from Claude Code

Squarespace hosts www.mauriceafrich.com (domain, header, footer, navigation, forms, newsletter, cookie banner). Every custom **Code Block** on the site contains only a two-line snippet that loads its content from this folder via GitHub Pages:

```html
<div data-ma-page="SLUG"></div>
<script src="https://africhmaurice.github.io/site/loader.js"></script>
```

So editing a page = edit `pages/SLUG.html` here, then `npm run publish`. It is live about a minute later (GitHub Pages rebuild; `loader.js` cache-busts page fetches once per minute). No Squarespace editing needed.

## Map
`site.json` lists every slug, which live page it appears on, and its source.
- `pages/*.html`: the page content, exactly what used to be pasted into each Code Block.
- Sources marked `bot:` (the-hunt, games, loot) live in `../treasure-hunt-leaderboard/squarespace-*.html` and are owned by that project. `npm run publish` copies them in with a "generated copy" banner. **Never edit pages/the-hunt.html, games.html or loot.html directly**; edit the bot file and publish. (The bot's `pull` script reads the loot box endpoint from `squarespace-lootbox.html`, one more reason it stays the source.)
- `loader.js`: fetches `pages/<slug>.html`, inserts it, re-runs its `<script>`s in order, then fires a `resize` event. Changing it affects every page; run the full preview after any edit.

## Commands
- `npm run check`: dry run; shows what would publish, publishes nothing.
- `npm run preview [-- page,page]`: opens each LIVE Squarespace page twice in headless Chrome (as-is, and with its Code Blocks swapped for the loader serving *this folder's* files), screenshots desktop 1440 and mobile 390, and pixel-diffs. Output in `.preview/` (`results.json`, `*.before.png` / `*.after.png`). Run it before publishing any change you want to compare against what's live. Known noise: home 10 to 20% (slider and testimonial carousel rotate), games ~0.1% (daily word), privacy ~0.3%.
- `npm run mirror`: rebuilds `preview/<page>.html`, full copies of each live Squarespace page (header menu, footer, native sections, forms) with the code blocks loading from this repo. Forms are disabled and links stay inside the preview. This is what Rachel reviews: https://africhmaurice.github.io/site/preview/
- `npm run publish [-- "message"]`: runs mirror, syncs bot pages, checks every page exists, commits, pushes.

## Stays in Squarespace (don't try to move these here)
Points and Solve forms (feed the Google Sheets the hunt bot's `npm run pull` reads), the Newsletter embed, home page native image, text and button blocks, header, footer, navigation, domain, SEO titles, cookie banner. Editing those still happens in the Squarespace editor, or via Claude in Chrome with the user's OK per change.

## Rules
- **Live since 2026-09-22:** all 15 code blocks on 11 pages hold the loader snippet. Publishing here changes the live site. Never paste full page code back into a Squarespace code block; that would detach the page from this repo. Pre-switch backups: `backups/2026-09-22-before-switch/` (gitignored).
- After any change that matters, run `node tools/verify-live.mjs page,page` (logged-out check that every block loads).
- Everything here is public (GitHub Pages). Never put answer keys, emails or anything from `../treasure-hunt-leaderboard/private/` in `pages/`.
- Brand rules and assets: the Claude Design system "Maurice Africh - Author Branding - 2026" (source in `../maurice-africh-design-system`). New sections should use its tokens and components.
- The hunt runs Sept 20 to Nov 1, 2026. Preview before publishing anything on hunt pages.
