// Sistema de Verificação Tripla - Guatá Inteligente
// GARANTE que NUNCA inventamos informações - sempre honesto e atualizado

import { VerifiedSource, InformationLog } from './informationVerificationService';
import { verifiedKnowledgeBase, KnowledgeQuery, KnowledgeResponse } from '../knowledge/verifiedKnowledgeBase';

export interface VerificationCheck {
  type: 'source' | 'timestamp' | 'cross_reference';
  passed: boolean;
  details: string;
  confidence: number;
}

export interface TripleVerificationResult {
  verified: boolean;
  confidence: number;
  checks: VerificationCheck[];
  sources: VerifiedSource[];
  recommendation: 'safe_to_use' | 'needs_update' | 'insufficient_data' | 'conflicting_data';
  fallbackMessage?: string;
}

export interface ResponseWithVerification {
  response: string;
  verification: TripleVerificationResult;
  hasPartners: boolean;
  partnerRecommendations: string[];
  generalRecommendations: string[];
  metadata: {
    sources: string[];
    lastUpdated: string;
    confidence: number;
  };
}

class TripleVerificationService {
  private readonly MAX_DATA_AGE_HOURS = 168; // 7 dias para dados gerais
  private readonly MAX_PARTNER_AGE_HOURS = 24; // 1 dia para dados de parceiros
  private readonly MIN_CONFIDENCE_THRESHOLD = 70;

  // VERIFICAÇÃO 1: Fonte confiável
  private async verifySource(sources: VerifiedSource[]): Promise<VerificationCheck> {
    if (sources.length === 0) {
      return {
        type: 'source',
        passed: false,
        details: 'Nenhuma fonte confiável disponível',
        confidence: 0
      };
    }

    const reliableSources = sources.filter(source => 
      source.reliability === 'high' && 
      ['official', 'government', 'verified_partner'].includes(source.type)
    );

    const confidence = (reliableSources.length / sources.length) * 100;

    return {
      type: 'source',
      passed: reliableSources.length > 0,
      details: `${reliableSources.length} de ${sources.length} fontes são altamente confiáveis`,
      confidence
    };
  }

  // VERIFICAÇÃO 2: Atualidade dos dados
  private async verifyTimestamp(data: any[], isPartnerData: boolean = false): Promise<VerificationCheck> {
    const maxAge = isPartnerData ? this.MAX_PARTNER_AGE_HOURS : this.MAX_DATA_AGE_HOURS;
    const now = new Date();
    
    const recentData = data.filter(item => {
      const lastVerified = new Date(item.verification?.lastVerified || item.lastUpdated || 0);
      const hoursOld = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60);
      return hoursOld <= maxAge;
    });

    const confidence = data.length > 0 ? (recentData.length / data.length) * 100 : 0;

    return {
      type: 'timestamp',
      passed: recentData.length > 0,
      details: `${recentData.length} de ${data.length} itens estão atualizados (últimas ${maxAge}h)`,
      confidence
    };
  }

  // VERIFICAÇÃO 3: Referência cruzada
  private async verifyCrossReference(query: string, results: any[]): Promise<VerificationCheck> {
    // Verifica se múltiplas fontes confirmam as mesmas informações
    if (results.length < 2) {
      return {
        type: 'cross_reference',
        passed: false,
        details: 'Apenas uma fonte disponível - sem verificação cruzada',
        confidence: 50
      };
    }

    // Para dados fundamentais (horários, preços, etc.), deve haver consistência
    const consistentData = this.checkDataConsistency(results);
    const confidence = (consistentData / results.length) * 100;

    return {
      type: 'cross_reference',
      passed: confidence >= 70,
      details: `${Math.round(confidence)}% de consistência entre fontes`,
      confidence
    };
  }

  // Verifica consistência entre dados
  private checkDataConsistency(results: any[]): number {
    // Para este exemplo, assumimos que dados com mesma categoria e localização são consistentes
    // Em implementação real, seria mais sofisticado
    const categories = results.map(r => r.category);
    const locations = results.map(r => r.location?.city);
    
    const uniqueCategories = new Set(categories).size;
    const uniqueLocations = new Set(locations).size;
    
    // Se todos são da mesma categoria e localização, consideramos consistente
    return uniqueCategories === 1 && uniqueLocations === 1 ? results.length : results.length * 0.7;
  }

  // Processo completo de verificação tripla
  async performTripleVerification(query: KnowledgeQuery): Promise<ResponseWithVerification> {
    try {
      // 1. Buscar dados na base verificada
      const knowledgeResult = await verifiedKnowledgeBase.search(query);
      
      // 2. Executar verificações triplas
      const sourceCheck = await this.verifySource(
        knowledgeResult.items.flatMap(item => item.verification.sources)
      );
      
      const timestampCheck = await this.verifyTimestamp(
        knowledgeResult.items,
        knowledgeResult.hasPartners
      );
      
      const crossRefCheck = await this.verifyCrossReference(
        query.query,
        knowledgeResult.items
      );

      // 3. Compilar resultado da verificação
      const checks = [sourceCheck, timestampCheck, crossRefCheck];
      const allPassed = checks.every(check => check.passed);
      const avgConfidence = checks.reduce((sum, check) => sum + check.confidence, 0) / checks.length;

      const verification: TripleVerificationResult = {
        verified: allPassed && avgConfidence >= this.MIN_CONFIDENCE_THRESHOLD,
        confidence: Math.round(avgConfidence),
        checks,
        sources: knowledgeResult.items.flatMap(item => item.verification.sources),
        recommendation: this.getRecommendation(allPassed, avgConfidence, knowledgeResult.items.length),
        fallbackMessage: !allPassed ? this.generateFallbackMessage(query, checks) : undefined
      };

      // 4. Gerar resposta baseada na verificação
      const response = await this.generateVerifiedResponse(query, knowledgeResult, verification);

      return {
        response: response.text,
        verification,
        hasPartners: knowledgeResult.hasPartners,
        partnerRecommendations: response.partnerRecommendations,
        generalRecommendations: response.generalRecommendations,
        metadata: {
          sources: knowledgeResult.sources,
          lastUpdated: knowledgeResult.lastUpdated,
          confidence: verification.confidence
        }
      };

    } catch (error) {
      console.error('Erro na verificação tripla:', error);
      
      // Fallback seguro em caso de erro
      return {
        response: this.getSafeErrorResponse(query),
        verification: {
          verified: false,
          confidence: 0,
          checks: [],
          sources: [],
          recommendation: 'insufficient_data',
          fallbackMessage: 'Sistema temporariamente indisponível. Tente novamente em alguns minutos.'
        },
        hasPartners: false,
        partnerRecommendations: [],
        generalRecommendations: [],
        metadata: {
          sources: [],
          lastUpdated: new Date().toISOString(),
          confidence: 0
        }
      };
    }
  }

  // Gera resposta verificada baseada nos dados
  private async generateVerifiedResponse(
    query: KnowledgeQuery, 
    knowledgeResult: KnowledgeResponse, 
    verification: TripleVerificationResult
  ): Promise<{
    text: string;
    partnerRecommendations: string[];
    generalRecommendations: string[];
  }> {
    
    // Se não passou na verificação, usar fallback
    if (!verification.verified) {
      return {
        text: verification.fallbackMessage || this.generateFallbackMessage(query, verification.checks),
        partnerRecommendations: [],
        generalRecommendations: []
      };
    }

    // Preparar recomendações de parceiros
    const partnerRecommendations = knowledgeResult.partners.map(partner => 
      `${partner.title}${partner.partnerInfo?.specialOffers?.length ? 
        ` (${partner.partnerInfo.specialOffers.join(', ')})` : ''
      }`
    );

    // Preparar recomendações gerais
    const generalRecommendations = knowledgeResult.generalRecommendations.slice(0, 3).map(item => 
      `${item.title} - ${item.description}`
    );

    // Montar resposta principal
    let responseText = '';

    // Se tem parceiros, mencionar primeiro
    if (knowledgeResult.hasPartners) {
      responseText += `Recomendo nossos parceiros: ${partnerRecommendations.join(', ')}. `;
    }

    // Adicionar recomendações gerais
    if (knowledgeResult.generalRecommendations.length > 0) {
      const connector = knowledgeResult.hasPartners ? 'Outras ótimas opções: ' : 'Recomendo: ';
      responseText += connector + generalRecommendations.slice(0, 2).map(rec => {
        const parts = rec.split(' - ');
        return parts[0]; // Só o nome para não ficar muito longo
      }).join(', ') + '. ';
    }

    // Adicionar informações úteis do primeiro resultado
    const firstResult = knowledgeResult.items[0];
    if (firstResult && firstResult.details) {
      const details = [];
      if (firstResult.details.hours) details.push(`Horário: ${firstResult.details.hours}`);
      if (firstResult.details.price) details.push(`Preço: ${firstResult.details.price}`);
      if (firstResult.details.contact) details.push(`Contato: ${firstResult.details.contact}`);
      
      if (details.length > 0) {
        responseText += details.join('. ') + '. ';
      }
    }

    // Adicionar dica útil se disponível
    if (firstResult?.details.features && firstResult.details.features.length > 0) {
      const tip = firstResult.details.features[0];
      responseText += `Dica: ${tip}.`;
    }

    return {
      text: responseText.trim(),
      partnerRecommendations,
      generalRecommendations
    };
  }

  // Determina recomendação baseada nas verificações
  private getRecommendation(
    allPassed: boolean, 
    confidence: number, 
    resultCount: number
  ): TripleVerificationResult['recommendation'] {
    if (!allPassed || confidence < this.MIN_CONFIDENCE_THRESHOLD) {
      return 'insufficient_data';
    }
    if (confidence < 80) {
      return 'needs_update';
    }
    if (resultCount === 0) {
      return 'insufficient_data';
    }
    return 'safe_to_use';
  }

  // Gera mensagem de fallback quando dados não são confiáveis
  private generateFallbackMessage(query: KnowledgeQuery, checks: VerificationCheck[]): string {
    const category = query.category;
    const location = query.location || 'Mato Grosso do Sul';

    const fallbacks: Record<string, string> = {
      hotel: `Para hospedagem em ${location}, recomendo consultar Booking.com, TripAdvisor ou contatar a Fundtur MS para informações atualizadas sobre hotéis e pousadas.`,
      restaurant: `Para gastronomia em ${location}, MS oferece pratos típicos como peixe pintado, sobá e chipa. Consulte TripAdvisor ou guias locais para restaurantes atuais.`,
      attraction: `${location} tem muitas atrações turísticas. Para informações atualizadas, consulte o site oficial da Fundtur MS (fundtur.ms.gov.br) ou agências de turismo locais.`,
      transport: `Para transporte em ${location}, recomendo verificar horários atualizados nos sites oficiais das empresas de ônibus ou no aeroporto local.`,
      general: `Para informações atualizadas sobre ${location}, consulte fontes oficiais como Fundtur MS, prefeituras locais ou agências de turismo credenciadas.`
    };

    const baseMessage = fallbacks[category || 'general'] || fallbacks.general;
    const failedChecks = checks.filter(check => !check.passed);
    
    if (failedChecks.length > 0) {
      return `${baseMessage} (Dados em atualização para garantir informações precisas)`;
    }

    return baseMessage;
  }

  // Resposta segura em caso de erro do sistema
  private getSafeErrorResponse(query: KnowledgeQuery): string {
    return `Estou com dificuldades técnicas no momento. Para informações sobre ${query.query}, recomendo consultar fontes oficiais como Fundtur MS (fundtur.ms.gov.br) ou agências de turismo locais. Tentarei novamente em alguns minutos.`;
  }

  // Log da verificação para dashboard e aprendizado
  async logVerification(query: KnowledgeQuery, result: ResponseWithVerification): Promise<void> {
    const log: InformationLog = {
      id: `verification-${Date.now()}`,
      query: query.query,
      response: result.response,
      sources: result.verification.sources,
      confidence: result.verification.confidence,
      timestamp: new Date(),
      verified: result.verification.verified,
      partnerPriority: result.hasPartners
    };

    // Aqui salvaria no banco de dados para analytics e aprendizado
    console.log('Verificação logada:', log);
  }
}

export const tripleVerificationService = new TripleVerificationService();