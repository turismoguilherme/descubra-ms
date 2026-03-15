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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'searchService.ts:12',message:'searchAll called',data:{query},timestamp:Date.now(),hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  if (!query || query.length < 2) return [];

  const searchTerm = `%${query}%`;
  const results: SearchResult[] = [];

  // Buscar em paralelo
  const [destinationsRes, eventsRes, partnersRes] = await Promise.all([
    supabase
      .from('destinations')
      .select('id, name, location')
      .ilike('name', searchTerm)
      .limit(5),
    supabase
      .from('events')
      .select('id, name, location')
      .eq('is_visible', true)
      .ilike('name', searchTerm)
      .limit(5),
    supabase
      .from('commercial_partners')
      .select('id, company_name, city')
      .eq('status', 'approved')
      .ilike('company_name', searchTerm)
      .limit(5),
  ]);

  // Destinos
  destinationsRes.data?.forEach(d => {
    results.push({
      id: d.id,
      title: d.name,
      subtitle: d.location || undefined,
      category: 'destino',
      path: `/ms/destinos/${d.id}`,
    });
  });

  // Eventos
  eventsRes.data?.forEach(e => {
    results.push({
      id: e.id,
      title: e.name,
      subtitle: e.location || undefined,
      category: 'evento',
      path: `/ms/eventos/${e.id}`,
    });
  });

  // Parceiros
  partnersRes.data?.forEach(p => {
    results.push({
      id: p.id,
      title: p.company_name,
      subtitle: p.city || undefined,
      category: 'parceiro',
      path: `/ms/parceiros/${p.id}`,
    });
  });

  // Regiões turísticas (dados locais)
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'searchService.ts:87',message:'searchAll returning results',data:{query,resultsCount:results.length,results:results.map(r=>({id:r.id,title:r.title,category:r.category}))},timestamp:Date.now(),hypothesisId:'F'})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'searchService.ts:104',message:'isNaturalLanguageQuery called',data:{rawQuery},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (!rawQuery) return false;

  const query = rawQuery.toLowerCase().trim();
  if (!query) return false;

  // Palavras que indicam perguntas
  const questionStarters = ['o que', 'onde', 'como', 'qual', 'quando', 'por que', 'porque', 'pra que', 'quem', 'quantos', 'quantas'];

  // Se começa com palavra de pergunta, é pergunta
  if (questionStarters.some((start) => query.startsWith(start + ' '))) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'searchService.ts:114',message:'Detected question starter',data:{query,matched:true},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return true;
  }

  // Se termina com ?, é pergunta
  if (query.endsWith('?')) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'searchService.ts:119',message:'Detected question mark',data:{query,matched:true},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return true;
  }

  // Não considerar apenas número de palavras - isso era muito permissivo
  // Exemplo: "hotel em bonito campo grande" (4 palavras) não é pergunta
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'searchService.ts:125',message:'Not a question',data:{query,matched:false},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return false;
}