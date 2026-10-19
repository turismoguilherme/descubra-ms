/** Imagem de card/listagem. */
export type EventCardMediaVariant = 'default' | 'featured-home';

export type EventCardMedia = {
  url: string;
  objectFit: 'contain' | 'cover';
  /** Mesma URL em blur atrás (só logo, sem banner). */
  backdropUrl?: string;
};

export function resolveEventCardMedia(
  event: {
    logo_evento?: string | null;
    image_url?: string | null;
    imagem_principal?: string | null;
  },
  variant: EventCardMediaVariant = 'default'
): EventCardMedia {
  const logo = (event.logo_evento || '').trim();
  const banner = (event.image_url || event.imagem_principal || '').trim();

  if (variant === 'featured-home') {
    if (banner) {
      return { url: banner, objectFit: 'cover' };
    }
    if (logo) {
      return { url: logo, objectFit: 'contain', backdropUrl: logo };
    }
    return { url: '', objectFit: 'cover' };
  }

  if (logo) {
    return { url: logo, objectFit: 'contain' };
  }
  if (banner) {
    return { url: banner, objectFit: 'cover' };
  }
  return { url: '', objectFit: 'cover' };
}
