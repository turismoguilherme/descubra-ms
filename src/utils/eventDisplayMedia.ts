/** Imagem de card/listagem: prioriza logo (object-contain) sobre banner (object-cover). */
export function resolveEventCardMedia(event: {
  logo_evento?: string | null;
  image_url?: string | null;
  imagem_principal?: string | null;
}): { url: string; objectFit: 'contain' | 'cover' } {
  const logo = (event.logo_evento || '').trim();
  const banner = (event.image_url || event.imagem_principal || '').trim();
  if (logo) {
    return { url: logo, objectFit: 'contain' };
  }
  if (banner) {
    return { url: banner, objectFit: 'cover' };
  }
  return { url: '', objectFit: 'cover' };
}
