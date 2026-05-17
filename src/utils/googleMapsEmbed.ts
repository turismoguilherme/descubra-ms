/**
 * Normaliza links do Google My Maps para URL de iframe (embed).
 * Aceita: URL embed, URL viewer/compartilhar, ou HTML do iframe.
 */
export function normalizeGoogleMapsEmbedUrl(
  input: string | null | undefined
): string | null {
  if (!input?.trim()) return null;

  let url = input.trim();

  const iframeSrc = url.match(/src=["']([^"']+)["']/i);
  if (iframeSrc?.[1]) {
    url = iframeSrc[1];
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'google.com' && host !== 'maps.google.com') {
      return null;
    }
  } catch {
    return null;
  }

  if (url.includes('/maps/d/viewer')) {
    url = url.replace('/maps/d/viewer', '/maps/d/embed');
  }

  if (url.includes('/maps/d/u/')) {
    url = url.replace(/\/maps\/d\/u\/\d+\//, '/maps/d/');
  }

  if (url.includes('google.com/maps/d/') && !url.includes('/embed')) {
    const mid = url.match(/[?&]mid=([^&]+)/)?.[1];
    if (mid) {
      return `https://www.google.com/maps/d/embed?mid=${decodeURIComponent(mid)}`;
    }
    return null;
  }

  if (!url.includes('/maps/d/embed')) {
    return null;
  }

  return url.split('"')[0].trim();
}
