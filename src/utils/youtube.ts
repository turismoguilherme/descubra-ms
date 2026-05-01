/**
 * Utilitários para lidar com URLs do YouTube.
 */

const YT_REGEX =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/\s]{11})/;

export function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(YT_REGEX);
  return m ? m[1] : null;
}

export function getYoutubeThumbnail(
  url: string | null | undefined,
  quality: 'maxres' | 'hq' | 'mq' = 'maxres'
): string | null {
  const id = extractYoutubeId(url);
  if (!id) return null;
  const map = { maxres: 'maxresdefault', hq: 'hqdefault', mq: 'mqdefault' };
  return `https://img.youtube.com/vi/${id}/${map[quality]}.jpg`;
}

export function getYoutubeEmbedUrl(
  url: string | null | undefined,
  options: { autoplay?: boolean; mute?: boolean; controls?: boolean } = {}
): string | null {
  const id = extractYoutubeId(url);
  if (!id) return null;
  const { autoplay = true, mute = false, controls = true } = options;
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
