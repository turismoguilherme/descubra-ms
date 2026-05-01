/**
 * URLs públicas de post/reel do Instagram → iframe embed oficial.
 */

export type InstagramEmbedKind = 'reel' | 'post';

export function parseInstagramVideoUrl(
  url: string | null | undefined
): { shortcode: string; kind: InstagramEmbedKind } | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  const reel = u.match(/instagram\.com\/(?:reel|reels)\/([A-Za-z0-9_-]+)/i);
  if (reel) return { shortcode: reel[1], kind: 'reel' };
  const post = u.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/i);
  if (post) return { shortcode: post[1], kind: 'post' };
  return null;
}

export function getInstagramEmbedUrl(url: string | null | undefined): string | null {
  const parsed = parseInstagramVideoUrl(url);
  if (!parsed) return null;
  const segment = parsed.kind === 'reel' ? 'reel' : 'p';
  return `https://www.instagram.com/${segment}/${parsed.shortcode}/embed/?utm_source=embed`;
}
