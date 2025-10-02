/**
 * 🤝 Serviço de Integração de Parceiros
 * 
 * Integra parceiros REAIS da plataforma com o chatbot Guatá
 * Só sugere parceiros que existem e estão aprovados
 */

import { supabase } from '@/integrations/supabase/client';

export interface Partner {
  id: string;
  name: string;
  city: string;
  segment: string;
  category: string;
  tier: string;
  status: 'pending' | 'approved' | 'rejected';
  website_link?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  message?: string;
  created_at: string;
  approved_at?: string;
}

export interface PartnerRecommendation {
  partner: Partner;
  relevance_score: number;
  recommendation_reason: string;
  contact_info: string;
}

export class PartnersIntegrationService {

  /**
   * Buscar parceiros aprovados por categoria/segmento
   */
  static async getApprovedPartners(filters?: {
    category?: string;
    segment?: string;
    city?: string;
    tier?: string;
  }): Promise<Partner[]> {
    try {
      let query = supabase
        .from('institutional_partners')
        .select('*')
        .eq('status', 'approved') // Só parceiros aprovados
        .order('tier', { ascending: true }) // Priorizar tiers superiores
        .order('approved_at', { ascending: false }); // Mais recentes primeiro

      // Aplicar filtros se fornecidos
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.segment) {
        query = query.eq('segment', filters.segment);
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.tier) {
        query = query.eq('tier', filters.tier);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar parceiros:', error);
        return [];
      }

      console.log(`✅ Encontrados ${data?.length || 0} parceiros aprovados`);
      return data || [];

    } catch (error) {
      console.error('❌ Erro na busca de parceiros:', error);
      return [];
    }
  }

  /**
   * Buscar parceiros relevantes para uma consulta específica
   */
  static async searchRelevantPartners(query: string, userLocation?: string): Promise<PartnerRecommendation[]> {
    try {
      console.log(`🔍 Buscando parceiros para: "${query}"`);

      // Extrair palavras-chave da consulta
      const keywords = this.extractKeywords(query);
      console.log(`🎯 Palavras-chave extraídas:`, keywords);

      // Buscar parceiros que correspondem às palavras-chave
      const partners = await this.getApprovedPartners();
      
      if (partners.length === 0) {
        console.log('⚠️ Nenhum parceiro aprovado encontrado na plataforma');
        return [];
      }

      // Calcular relevância para cada parceiro
      const recommendations: PartnerRecommendation[] = [];

      for (const partner of partners) {
        const relevanceScore = this.calculateRelevance(partner, keywords, userLocation);
        
        if (relevanceScore > 0.3) { // Só incluir se relevante
          recommendations.push({
            partner,
            relevance_score: relevanceScore,
            recommendation_reason: this.generateRecommendationReason(partner, keywords),
            contact_info: this.formatContactInfo(partner)
          });
        }
      }

      // Ordenar por relevância
      recommendations.sort((a, b) => b.relevance_score - a.relevance_score);

      console.log(`✅ ${recommendations.length} parceiros relevantes encontrados`);
      return recommendations.slice(0, 5); // Máximo 5 recomendações

    } catch (error) {
      console.error('❌ Erro na busca de parceiros relevantes:', error);
      return [];
    }
  }

  /**
   * Extrair palavras-chave da consulta do usuário
   */
  private static extractKeywords(query: string): string[] {
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Mapear palavras para categorias/segmentos conhecidos
    const mappedKeywords: string[] = [];
    
    for (const word of words) {
      // Mapeamentos de turismo
      if (['hotel', 'pousada', 'hospedagem', 'dormir', 'ficar'].includes(word)) {
        mappedKeywords.push('hospedagem');
      }
      if (['restaurante', 'comida', 'comer', 'gastronomia', 'jantar', 'almoço'].includes(word)) {
        mappedKeywords.push('gastronomia');
      }
      if (['passeio', 'tour', 'atracao', 'visitar', 'conhecer'].includes(word)) {
        mappedKeywords.push('turismo');
      }
      if (['transporte', 'transfer', 'carro', 'van', 'onibus'].includes(word)) {
        mappedKeywords.push('transporte');
      }
      // Adicionar palavra original também
      mappedKeywords.push(word);
    }

    return [...new Set(mappedKeywords)]; // Remover duplicatas
  }

  /**
   * Calcular relevância de um parceiro para a consulta
   */
  private static calculateRelevance(partner: Partner, keywords: string[], userLocation?: string): number {
    let score = 0;

    // Texto completo do parceiro para busca
    const partnerText = `
      ${partner.name} 
      ${partner.category} 
      ${partner.segment} 
      ${partner.city}
      ${partner.message || ''}
    `.toLowerCase();

    // Pontuação por palavra-chave encontrada
    for (const keyword of keywords) {
      if (partnerText.includes(keyword)) {
        score += 0.2;
      }
    }

    // Bonus por proximidade de localização
    if (userLocation && partner.city.toLowerCase().includes(userLocation.toLowerCase())) {
      score += 0.3;
    }

    // Bonus por tier do parceiro
    const tierBonus = {
      'premium': 0.3,
      'gold': 0.2,
      'silver': 0.1,
      'bronze': 0.05
    };
    score += tierBonus[partner.tier as keyof typeof tierBonus] || 0;

    // Bonus por ter informações de contato completas
    if (partner.website_link) score += 0.1;
    if (partner.contact_whatsapp) score += 0.1;
    if (partner.contact_email) score += 0.1;

    return Math.min(score, 1.0); // Máximo 1.0
  }

  /**
   * Gerar razão da recomendação
   */
  private static generateRecommendationReason(partner: Partner, keywords: string[]): string {
    const reasons = [];

    if (keywords.some(k => partner.category.toLowerCase().includes(k))) {
      reasons.push(`especializado em ${partner.category}`);
    }
    if (keywords.some(k => partner.segment.toLowerCase().includes(k))) {
      reasons.push(`atua no segmento ${partner.segment}`);
    }
    
    reasons.push(`parceiro oficial da plataforma`);
    
    if (partner.tier !== 'bronze') {
      reasons.push(`parceiro ${partner.tier}`);
    }

    return reasons.join(', ');
  }

  /**
   * Formatar informações de contato
   */
  private static formatContactInfo(partner: Partner): string {
    const contact = [];

    if (partner.contact_whatsapp) {
      contact.push(`📱 WhatsApp: ${partner.contact_whatsapp}`);
    }
    if (partner.contact_email) {
      contact.push(`📧 E-mail: ${partner.contact_email}`);
    }
    if (partner.website_link) {
      contact.push(`🌐 Site: ${partner.website_link}`);
    }

    return contact.join(' | ') || 'Contato disponível através da plataforma';
  }

  /**
   * Formatar recomendação de parceiro para o chat
   */
  static formatPartnerRecommendation(recommendation: PartnerRecommendation): string {
    const { partner } = recommendation;
    
    return `🤝 **${partner.name}** - ${partner.city}
📝 **Categoria:** ${partner.category} | **Segmento:** ${partner.segment}
⭐ **Parceiro ${partner.tier}** da plataforma Descubra MS
💡 **Por que recomendo:** ${recommendation.recommendation_reason}
📞 **Contato:** ${recommendation.contact_info}
✅ **Parceiro verificado e aprovado**`;
  }

  /**
   * Verificar se há parceiros disponíveis na plataforma
   */
  static async hasApprovedPartners(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('institutional_partners')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (error) {
        console.error('❌ Erro ao verificar parceiros:', error);
        return false;
      }

      const hasPartners = (count || 0) > 0;
      console.log(`📊 Parceiros aprovados na plataforma: ${count || 0}`);
      
      return hasPartners;

    } catch (error) {
      console.error('❌ Erro na verificação de parceiros:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas de parceiros por categoria
   */
  static async getPartnerStats(): Promise<Record<string, number>> {
    try {
      const partners = await this.getApprovedPartners();
      const stats: Record<string, number> = {};

      for (const partner of partners) {
        stats[partner.category] = (stats[partner.category] || 0) + 1;
      }

      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return {};
    }
  }
}
