export type CartilhaStatus = 'available' | 'coming_soon';
export type CartilhaTheme = 'pantanal' | 'terracotta' | 'blue' | 'amber' | 'purple';

export interface CartilhaItem {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  audience: string;
  theme: CartilhaTheme;
  status: CartilhaStatus;
  featured: boolean;
  coverUrl?: string | null;
  htmlPath?: string;
}

/** Fallback local se o Supabase ainda não tiver a migration aplicada. */
export const CARTILHAS_FALLBACK: CartilhaItem[] = [
  {
    slug: 'guata-capacita',
    title: 'Guatá Capacita',
    subtitle:
      'Plano de Capacitação Prática para Atendentes dos Centros de Atendimento ao Turista (CATs)',
    audience: 'Atendentes de CAT',
    theme: 'pantanal',
    status: 'available',
    featured: true,
    htmlPath: '/cartilhas/guata-capacita/index.html',
  },
  {
    slug: 'sabores-de-ms',
    title: 'Sabores de MS',
    subtitle: 'Guia de Boas Práticas e Hospitalidade no Atendimento em Bares e Restaurantes',
    audience: 'Gastronomia',
    theme: 'terracotta',
    status: 'coming_soon',
    featured: true,
  },
  {
    slug: 'hotelaria-ms',
    title: 'Recepção de Hotelaria MS',
    subtitle: 'Qualificação em Recepção e Hospitalidade para Pousadas e Hotéis',
    audience: 'Hotelaria',
    theme: 'blue',
    status: 'coming_soon',
    featured: true,
  },
];

export function mapDbCartilha(row: any): CartilhaItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    audience: row.audience || '',
    theme: (row.theme || 'pantanal') as CartilhaTheme,
    status: (row.status || 'available') as CartilhaStatus,
    featured: !!row.is_featured,
    coverUrl: row.cover_url,
    htmlPath: row.html_url || undefined,
  };
}

export function getCartilhaBySlug(
  items: CartilhaItem[],
  slug: string
): CartilhaItem | undefined {
  return items.find((c) => c.slug === slug);
}

export function getFeaturedCartilhas(items: CartilhaItem[]): CartilhaItem[] {
  return items.filter((c) => c.featured);
}
