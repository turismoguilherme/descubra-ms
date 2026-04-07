import { supabase } from '@/integrations/supabase/client';
import { touristRegions2025 } from '@/data/touristRegions2025';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: 'destino' | 'evento' | 'regiao' | 'parceiro';
  path: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const searchTerm = `%${query}%`;
  const results: SearchResult[] = [];

  const [destinationsRes, eventsRes, partnersRes] = await Promise.all([
    supabase
      .from('destinations')
      .select('id, name, location')
      .ilike('name', searchTerm)
      .limit(5),
    supabase
      .from('events')
      .select('id, titulo, local')
      .eq('is_visible', true)
      .ilike('titulo', searchTerm)
      .limit(5),
    supabase
      .from('commercial_partners')
      .select('id, company_name, city')
      .eq('status', 'approved')
      .ilike('company_name', searchTerm)
      .limit(5),
  ]);

  destinationsRes.data?.forEach(d => {
    results.push({
      id: d.id,
      title: d.name,
      subtitle: d.location || undefined,
      category: 'destino',
      path: `/ms/destinos/${d.id}`,
    });
  });

  (eventsRes.data as any[] || []).forEach((e: any) => {
    results.push({
      id: e.id,
      title: e.titulo,
      subtitle: e.local || undefined,
      category: 'evento',
      path: `/ms/eventos/${e.id}`,
    });
  });

  partnersRes.data?.forEach(p => {
    results.push({
      id: p.id,
      title: p.company_name,
      subtitle: p.city || undefined,
      category: 'parceiro',
      path: `/ms/parceiros/${p.id}`,
    });
  });

  const lowerQuery = query.toLowerCase();
  touristRegions2025
    .filter(r => r.name.toLowerCase().includes(lowerQuery) || r.cities.some(c => c.toLowerCase().includes(lowerQuery)))
    .slice(0, 5)
    .forEach(r => {
      results.push({
        id: r.id,
        title: r.name,
        subtitle: r.cities.slice(0, 3).join(', '),
        category: 'regiao',
        path: `/ms/regioes/${r.slug}`,
    });
  });
  return results;
}

export const categoryLabels: Record<SearchResult['category'], string> = {
  destino: 'Destinos',
  evento: 'Eventos',
  regiao: 'Regiões Turísticas',
  parceiro: 'Parceiros',
};

export const categoryIcons: Record<SearchResult['category'], string> = {
  destino: 'MapPin',
  evento: 'Calendar',
  regiao: 'Globe',
  parceiro: 'Building2',
};

export function isNaturalLanguageQuery(rawQuery: string): boolean {
  if (!rawQuery) return false;

  const query = rawQuery.toLowerCase().trim();
  if (!query) return false;

  const questionStarters = ['o que', 'onde', 'como', 'qual', 'quando', 'por que', 'porque', 'pra que', 'quem', 'quantos', 'quantas'];

  if (questionStarters.some((start) => query.startsWith(start + ' '))) {
    return true;
  }

  if (query.endsWith('?')) {
    return true;
  }

  return false;
}
