// Shared helpers.
// LAYOUT: live page -> the site.json slugs its Squarespace code blocks load, in DOM order.
export const LAYOUT = {
  home: ['home-slider', 'home-widget-1', 'home-widget-2'], 'the-hunt': ['the-hunt'], points: ['hunt-menu'], solve: ['hunt-menu'],
  leaderboard: ['leaderboard', 'hunt-menu'], contests: ['contests'], 'lootbox-clue': ['lootbox-clue'], games: ['games'],
  loot: ['loot'], rules: ['rules'], 'privacy-policy': ['privacy-policy'], newsletter: [],
};

// Replace each code block's .sqs-block-content body in the raw HTML, skipping <script>/<style> bodies while matching divs.
export function swapBlocks(html, slugs, loaderUrl) {
  let i = 0, out = '', n = 0;
  const marker = 'data-definition-name="website.components.code"';
  while (true) {
    const at = html.indexOf(marker, i); if (at < 0) break;
    const contentAt = html.indexOf('class="sqs-block-content"', at); const open = html.indexOf('>', contentAt) + 1;
    let depth = 1, j = open;
    while (depth > 0 && j < html.length) {
      const m = /<(\/?)(div|script|style)\b/gi; m.lastIndex = j; const hit = m.exec(html); if (!hit) break;
      const tag = hit[2].toLowerCase();
      if (!hit[1] && (tag === 'script' || tag === 'style')) { j = html.toLowerCase().indexOf(`</${tag}>`, hit.index) + tag.length + 3; continue; }
      depth += hit[1] ? -1 : 1; j = hit.index + hit[0].length;
    }
    const close = html.lastIndexOf('</div', j);
    const slug = slugs[n++] || 'missing';
    out += html.slice(i, open) + `<div data-ma-page="${slug}"></div><script src="${loaderUrl}"></script>`;
    i = close;
  }
  return { html: out + html.slice(i), swapped: n };
}

