import { extractYoutubeId, getYoutubeEmbedUrl, getYoutubeThumbnail } from '@/utils/youtube';
import { getInstagramEmbedUrl, parseInstagramVideoUrl } from '@/utils/instagram';

export type GuataVideoProvider = 'youtube' | 'instagram';

export function getGuataVideoProvider(url: string | null | undefined): GuataVideoProvider | null {
  if (!url?.trim()) return null;
  if (extractYoutubeId(url)) return 'youtube';
  if (parseInstagramVideoUrl(url)) return 'instagram';
  return null;
}

/** Miniatura do carrossel: capa manual > YouTube automático > null (placeholder na UI). */
export function getGuataCarouselThumbnail(
  videoUrl: string | null | undefined,
  thumbnailUrl: string | null | undefined,
  quality: 'maxres' | 'hq' | 'mq' = 'maxres'
): string | null {
  const manual = thumbnailUrl?.trim();
  if (manual) return manual;
  return getYoutubeThumbnail(videoUrl, quality);
}

export function getGuataEmbedSrc(
  videoUrl: string | null | undefined,
  youtubeOpts: { autoplay?: boolean; mute?: boolean; controls?: boolean } = {}
): string | null {
  const provider = getGuataVideoProvider(videoUrl);
  if (provider === 'youtube') return getYoutubeEmbedUrl(videoUrl, youtubeOpts);
  if (provider === 'instagram') {
    return getInstagramEmbedUrl(videoUrl, { autoplay: youtubeOpts.autoplay !== false });
  }
  return null;
}
