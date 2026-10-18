/** YouTube: embed no hero. Outras URLs: link externo no modal. */

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

export function normalizeHttpUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

/** URL de vídeo que não é YouTube — abrir em nova aba. */
export function getExternalPromoVideoUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  const normalized = normalizeHttpUrl(url);
  if (!normalized) return null;
  if (getYouTubeEmbedUrl(normalized)) return null;
  return normalized;
}
