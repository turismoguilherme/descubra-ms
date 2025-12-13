import { supabase } from '@/integrations/supabase/client';

export interface Policy {
  id: string;
  key: string;
  title: string;
  content: string;
  platform: 'viajar' | 'descubra_ms' | 'both';
  is_published: boolean;
  version: number;
  last_updated: string;
}

export const policyService = {
  /**
   * Busca uma política publicada do banco de dados
   * @param policyKey - Chave da política (ex: 'terms_of_use', 'privacy_policy')
   * @param platform - Plataforma ('viajar' ou 'descubra_ms')
   * @returns Conteúdo da política ou null se não encontrada
   */
  async getPublishedPolicy(
    policyKey: string,
    platform: 'viajar' | 'descubra_ms'
  ): Promise<Policy | null> {
    try {
      const { data, error } = await supabase
        .from('platform_policies')
        .select('*')
        .eq('key', policyKey)
        .eq('is_published', true)
        .or(`platform.eq.${platform},platform.eq.both`)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Erro ao buscar política do banco:', error);
        // Se falhar, tentar buscar do localStorage como fallback
        return this.getPublishedPolicyFromLocalStorage(policyKey, platform);
      }

      if (data) {
        // Normalizar campo de data (pode vir como updated_at do banco)
        const normalizedData = {
          ...data,
          last_updated: (data as any).last_updated || (data as any).updated_at || new Date().toISOString(),
        };
        return normalizedData as Policy;
      }

      // Se não encontrou no banco, tentar localStorage
      return this.getPublishedPolicyFromLocalStorage(policyKey, platform);
    } catch (error) {
      console.warn('Erro ao buscar política do banco:', error);
      // Se falhar, tentar buscar do localStorage como fallback
      return this.getPublishedPolicyFromLocalStorage(policyKey, platform);
    }
  },

  /**
   * Busca uma política publicada do localStorage como fallback
   * @param policyKey - Chave da política
   * @param platform - Plataforma ('viajar' ou 'descubra_ms')
   * @returns Conteúdo da política ou null se não encontrada
   */
  getPublishedPolicyFromLocalStorage(
    policyKey: string,
    platform: 'viajar' | 'descubra_ms'
  ): Policy | null {
    try {
      const cached = localStorage.getItem('platform_policies');
      if (!cached) return null;

      const policies: Policy[] = JSON.parse(cached);
      
      // Filtrar por key, is_published e platform
      // Suporta is_published como boolean true ou string "true"
      const matchingPolicies = policies.filter(p => {
        const keyMatch = p.key === policyKey;
        const publishedMatch = p.is_published === true || p.is_published === 'true' || String(p.is_published).toLowerCase() === 'true';
        const platformMatch = p.platform === platform || p.platform === 'both';
        return keyMatch && publishedMatch && platformMatch;
      });

      if (matchingPolicies.length === 0) return null;

      // Ordenar por versão (maior primeiro) e retornar a mais recente
      matchingPolicies.sort((a, b) => (b.version || 0) - (a.version || 0));
      
      return matchingPolicies[0];
    } catch (error) {
      console.warn('Erro ao buscar política do localStorage:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'policyService.ts:95',message:'getPublishedPolicyFromLocalStorage ERROR',data:{policyKey,platform,errorMessage:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return null;
    }
  },

  /**
   * Converte markdown simples para HTML
   * Suporta: # títulos, ## subtítulos, ### subtítulos, **negrito**, *itálico*
   */
  markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    return markdown
      // Títulos
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
      // Negrito e itálico
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Parágrafos (linhas vazias viram novos parágrafos)
      .split(/\n\n+/)
      .map(para => {
        para = para.trim();
        if (!para) return '';
        // Se já é um título, não envolver em <p>
        if (para.startsWith('<h')) return para;
        // Quebras de linha simples dentro do parágrafo
        para = para.replace(/\n/gim, '<br />');
        return `<p class="mb-4 leading-relaxed">${para}</p>`;
      })
      .join('');
  },
};

