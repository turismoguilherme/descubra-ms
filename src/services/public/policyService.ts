// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

export interface Policy {
  id: string;
  key: string;
  title: string;
  content: string;
  platform: 'viajar' | 'descubra_ms' | 'both';
  is_published: boolean;
  version: number;
  last_updated: string;
  terms_pdf_url?: string | null;
}

function normalizePolicyRow(data: Record<string, unknown>): Policy {
  return {
    ...data,
    last_updated:
      (data as { last_updated?: string }).last_updated ||
      (data as { updated_at?: string }).updated_at ||
      new Date().toISOString(),
  } as Policy;
}

/**
 * Entre várias linhas publicadas (ex.: descubra_ms + both), prefere a da plataforma pedida,
 * depois "both"; em empate de versão, prefere quem tem terms_pdf_url.
 */
function pickPublishedPolicyForPlatform(
  rows: Policy[],
  targetPlatform: 'viajar' | 'descubra_ms'
): Policy | null {
  if (!rows?.length) return null;
  const sortCandidates = (list: Policy[]) =>
    [...list].sort((a, b) => {
      const va = a.version || 0;
      const vb = b.version || 0;
      if (vb !== va) return vb - va;
      const pa = a.terms_pdf_url ? 1 : 0;
      const pb = b.terms_pdf_url ? 1 : 0;
      return pb - pa;
    });
  const exact = sortCandidates(rows.filter((r) => r.platform === targetPlatform));
  const bothOnly = sortCandidates(rows.filter((r) => r.platform === 'both'));
  return exact[0] || bothOnly[0] || null;
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
      const { data: rows, error } = await supabase
        .from('platform_policies')
        .select('*')
        .eq('key', policyKey)
        .eq('is_published', true)
        .or(`platform.eq.${platform},platform.eq.both`);

      if (error && error.code !== 'PGRST116') {
        console.warn('Erro ao buscar política do banco:', error);
        // Se falhar, tentar buscar do localStorage como fallback
        return this.getPublishedPolicyFromLocalStorage(policyKey, platform);
      }

      const list = (rows || []) as Policy[];
      const picked = pickPublishedPolicyForPlatform(list, platform);
      if (picked) {
        return normalizePolicyRow(picked as unknown as Record<string, unknown>);
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

      return pickPublishedPolicyForPlatform(matchingPolicies, platform);
    } catch (error) {
      console.warn('Erro ao buscar política do localStorage:', error);
      
      return null;
    }
  },

  /**
   * Converte markdown simples para HTML
   * Suporta: # títulos, ## subtítulos, ### subtítulos, **negrito**, *itálico*
   */
  markdownToHtml(markdown: string): string {
    const md = (markdown || '').trim();
    if (!md) return '';

    const rawHtml = md
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

    // SECURITY: Sanitizar HTML para prevenir XSS
    return DOMPurify.sanitize(rawHtml, { 
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'span'],
      ALLOWED_ATTR: ['class', 'href', 'target', 'rel']
    });
  },
};

