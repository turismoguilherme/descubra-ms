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

/**
 * Embed oficial. Parâmetro autoplay=1 é tentativa (opção A): o Instagram/navegador
 * pode ainda exigir interação — não há garantia contratual da Meta.
 */
export function getInstagramEmbedUrl(
  url: string | null | undefined,
  opts: { autoplay?: boolean } = {}
): string | null {
  const parsed = parseInstagramVideoUrl(url);
  if (!parsed) return null;
  const segment = parsed.kind === 'reel' ? 'reel' : 'p';
  const { autoplay = true } = opts;
  const params = new URLSearchParams({ utm_source: 'embed' });
  if (autoplay) params.set('autoplay', '1');
  return `https://www.instagram.com/${segment}/${parsed.shortcode}/embed/?${params.toString()}`;
}
