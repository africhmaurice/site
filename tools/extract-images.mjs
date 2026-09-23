// Moves images (and audio/video) that are embedded inside page code (data:image/...;base64,...) out into real files under
// assets/img/, byte-for-byte identical (no resizing, no re-compression, so zero quality change), and points the
// page at them. Small pages arrive fast; images download in parallel and are cached by the browser.
// Also adds loading="lazy" to <img> tags after the first one on a page, so offscreen pictures wait until needed.
import { createHash } from 'node:crypto';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const MIN_BYTES = 8 * 1024; // tiny icons stay inline (one request each would cost more than it saves)
const EXT = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg', 'video/mp4': 'mp4' };

export function extractImages(html, { root, publicBase }) {
  const dir = join(root, 'assets', 'img');
  mkdirSync(dir, { recursive: true });
  let moved = 0, bytes = 0;
  html = html.replace(/data:((?:image|audio|video)\/[a-z0-9+]+);base64,([A-Za-z0-9+/=]+)/g, (whole, type, b64) => {
    const ext = EXT[type];
    const buf = Buffer.from(b64, 'base64');
    if (!ext || buf.length < MIN_BYTES) return whole;
    const name = createHash('sha1').update(buf).digest('hex').slice(0, 16) + '.' + ext;
    const file = join(dir, name);
    if (!existsSync(file)) writeFileSync(file, buf);
    moved++; bytes += buf.length;
    return `${publicBase}assets/img/${name}`;
  });
  // Lazy-load every <img> except the first on the page (usually the hero), unless it already says how to load.
  let seen = 0;
  html = html.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, (tag, rest) => (seen++ === 0 ? tag : `<img loading="lazy" decoding="async"${rest}>`));
  return { html, moved, bytes };
}
