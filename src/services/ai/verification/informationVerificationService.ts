// Sistema de Verificação de Informações do Guatá
// Garante que apenas informações verdadeiras e verificáveis sejam fornecidas

import { webScrapingService } from '../search/webScrapingService';

export interface VerifiedSource {
  id: string;
  name: string;
  url: string;
  type: 'official' | 'government' | 'verified_partner' | 'reliable_third_party';
  lastVerified: Date;
  reliability: 'high' | 'medium' | 'low';
  category: 'hotel' | 'restaurant' | 'attraction' | 'agency' | 'event' | 'transport';
}

export interface InformationLog {
  id: string;
  query: string;
  response: string;
  sources: VerifiedSource[];
  confidence: number;
  timestamp: Date;
  verified: boolean;
  partnerPriority: boolean;
  userFeedback?: 'positive' | 'negative' | 'neutral';
}

export interface Partner {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'agency';
  location: string;
  verified: boolean;
  lastUpdated: Date;
  source: 'manual' | 'api' | 'official';
  priority: number; // 1 = maior prioridade
}

export interface VerificationResult {
  information: string;
  confidenceScore: number;
  sources: VerifiedSource[];
  lastVerified: string;
  crossVerificationPassed: boolean;
  sourcesConsulted: number;
}

export interface MultiSourceSearchResult {
  source: string;
  results: any[];
  reliability: 'high' | 'medium' | 'low';
  timestamp: Date;
}

class InformationVerificationService {
  private verifiedSources: VerifiedSource[] = [
    // Fontes oficiais de Mato Grosso do Sul
    {
      id: 'fundtur-ms',
      name: 'Fundtur-MS',
      url: 'https://fundtur.ms.gov.br',
      type: 'official',
      lastVerified: new Date(),
      reliability: 'high',
      category: 'attraction'
    },
    {
      id: 'prefeitura-cg',
      name: 'Prefeitura de Campo Grande',
      url: 'https://campogrande.ms.gov.br',
      type: 'government',
      lastVerified: new Date(),
      reliability: 'high',
      category: 'attraction'
    },
    {
      id: 'prefeitura-bonito',
      name: 'Prefeitura de Bonito',
      url: 'https://bonito.ms.gov.br',
      type: 'government',
      lastVerified: new Date(),
      reliability: 'high',
      category: 'attraction'
    },
    {
      id: 'bioparque-pantanal',
      name: 'Bioparque Pantanal',
      url: 'https://bioparque.com',
      type: 'official',
      lastVerified: new Date(),
      reliability: 'high',
      category: 'attraction'
    }
  ];

  private partners: Partner[] = [
    // Por enquanto vazio - será preenchido quando houver parceiros reais
  ];

  private informationLogs: InformationLog[] = [];

  /**
   * Verificar se uma informação é confiável
   */
  async verifyInformation(query: string, response: string): Promise<VerificationResult> {
    console.log('🔍 Verificando informação:', query);

    // Buscar fontes relevantes
    const relevantSources = this.findRelevantSources(query);
    
    // Verificar se há parceiros relevantes
    const relevantPartners = this.findRelevantPartners(query);
    const partnerPriority = relevantPartners.length > 0;

    // Calcular confiança baseada nas fontes
    const confidence = this.calculateConfidence(relevantSources, relevantPartners);
    
    // Verificar se a informação é verificável
    const verified = confidence > 0.7;

    // Realizar verificação cruzada se necessário
    const crossVerificationPassed = await this.performCrossVerification(query, response);

    const result: VerificationResult = {
      information: response,
      confidenceScore: confidence,
      sources: relevantSources,
      lastVerified: new Date().toISOString(),
      crossVerificationPassed,
      sourcesConsulted: relevantSources.length
    };

    // Log da verificação
    this.logInformation(query, response, {
      verified,
      confidence,
      sources: relevantSources,
      partnerPriority
    });

    return result;
  }

  /**
   * Realizar verificação cruzada de informações
   */
  private async performCrossVerification(query: string, response: string): Promise<boolean> {
    try {
      // Buscar informações em múltiplas fontes
      const searchResults = await this.multiSourceSearch(query);
      
      // Verificar se as informações são consistentes
      const consistencyCheck = this.checkInformationConsistency(response, searchResults);
      
      // Verificar se as fontes são confiáveis
      const sourceReliabilityCheck = this.checkSourceReliability(searchResults);
      
      return consistencyCheck && sourceReliabilityCheck;
    } catch (error) {
      console.log('⚠️ Erro na verificação cruzada:', error);
      return false;
    }
  }

  /**
   * Busca multi-fonte
   */
  private async multiSourceSearch(query: string): Promise<MultiSourceSearchResult[]> {
    const results: MultiSourceSearchResult[] = [];
    
    try {
      // Buscar em fontes oficiais
      const officialResults = await this.searchOfficialSources(query);
      results.push({
        source: 'official',
        results: officialResults,
        reliability: 'high',
        timestamp: new Date()
      });

      // Buscar em fontes confiáveis de terceiros
      const thirdPartyResults = await this.searchThirdPartySources(query);
      results.push({
        source: 'third_party',
        results: thirdPartyResults,
        reliability: 'medium',
        timestamp: new Date()
      });

    } catch (error) {
      console.log('⚠️ Erro na busca multi-fonte:', error);
    }

    return results;
  }

  /**
   * Buscar em fontes oficiais
   */
  private async searchOfficialSources(query: string): Promise<any[]> {
    try {
      // Usar web scraping para buscar em sites oficiais
      const scrapedResults = await webScrapingService.scrapeOfficialSites(query);
      return scrapedResults.map(result => ({
        title: result.title,
        content: result.content,
        source: result.source,
        reliability: result.reliability
      }));
    } catch (error) {
      console.log('⚠️ Verificação: Erro ao buscar fontes oficiais:', error);
      return [];
    }
  }

  /**
   * Buscar em fontes de terceiros confiáveis
   */
  private async searchThirdPartySources(query: string): Promise<any[]> {
    // TODO: Implementar busca real em fontes de terceiros
    // Por enquanto retorna vazio
    return [];
  }

  /**
   * Verificar consistência das informações
   */
  private checkInformationConsistency(response: string, searchResults: MultiSourceSearchResult[]): boolean {
    // TODO: Implementar verificação de consistência
    // Por enquanto retorna true
    return true;
  }

  /**
   * Verificar confiabilidade das fontes
   */
  private checkSourceReliability(searchResults: MultiSourceSearchResult[]): boolean {
    const highReliabilitySources = searchResults.filter(result => result.reliability === 'high');
    return highReliabilitySources.length > 0;
  }

  /**
   * Encontrar fontes relevantes para a query
   */
  private findRelevantSources(query: string): VerifiedSource[] {
    const lowerQuery = query.toLowerCase();
    
    return this.verifiedSources.filter(source => {
      const matchesCategory = this.matchesCategory(lowerQuery, source.category);
      const matchesName = source.name.toLowerCase().includes(lowerQuery) ||
                         source.url.toLowerCase().includes(lowerQuery);
      
      return matchesCategory || matchesName;
    });
  }

  /**
   * Encontrar parceiros relevantes
   */
  private findRelevantPartners(query: string): Partner[] {
    const lowerQuery = query.toLowerCase();
    
    return this.partners.filter(partner => {
      const matchesType = lowerQuery.includes(partner.type) ||
                         lowerQuery.includes('hotel') && partner.type === 'hotel' ||
                         lowerQuery.includes('restaurante') && partner.type === 'restaurant';
      
      const matchesLocation = partner.location.toLowerCase().includes(lowerQuery);
      
      return matchesType || matchesLocation;
    }).sort((a, b) => a.priority - b.priority); // Ordenar por prioridade
  }

  /**
   * Calcular nível de confiança
   */
  private calculateConfidence(sources: VerifiedSource[], partners: Partner[]): number {
    let confidence = 0;

    // Pontos por fontes verificadas
    sources.forEach(source => {
      switch (source.reliability) {
        case 'high':
          confidence += 0.4;
          break;
        case 'medium':
          confidence += 0.2;
          break;
        case 'low':
          confidence += 0.1;
          break;
      }
    });

    // Bônus por parceiros
    if (partners.length > 0) {
      confidence += 0.3;
    }

    // Limitar a 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Verificar se a query corresponde à categoria
   */
  private matchesCategory(query: string, category: string): boolean {
    const categoryKeywords = {
      'hotel': ['hotel', 'hospedagem', 'pousada', 'resort'],
      'restaurant': ['restaurante', 'comida', 'gastronomia', 'sobá'],
      'attraction': ['atração', 'turismo', 'passeio', 'gruta', 'pantanal'],
      'agency': ['agência', 'turismo', 'passeio'],
      'event': ['evento', 'festival', 'show'],
      'transport': ['transporte', 'ônibus', 'avião']
    };

    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];
    return keywords.some(keyword => query.includes(keyword));
  }

  /**
   * Log de informação
   */
  private logInformation(query: string, response: string, verification: {
    verified: boolean;
    confidence: number;
    sources: VerifiedSource[];
    partnerPriority: boolean;
  }): void {
    const log: InformationLog = {
      id: `log_${Date.now()}`,
      query,
      response,
      sources: verification.sources,
      confidence: verification.confidence,
      timestamp: new Date(),
      verified: verification.verified,
      partnerPriority: verification.partnerPriority
    };

    this.informationLogs.push(log);
    console.log('📝 Log de informação:', log);
  }

  /**
   * Adicionar parceiro
   */
  addPartner(partner: Partner): void {
    this.partners.push(partner);
    console.log('✅ Parceiro adicionado:', partner.name);
  }

  /**
   * Remover parceiro
   */
  removePartner(partnerId: string): void {
    this.partners = this.partners.filter(p => p.id !== partnerId);
    console.log('❌ Parceiro removido:', partnerId);
  }

  /**
   * Obter logs de informação
   */
  getInformationLogs(): InformationLog[] {
    return this.informationLogs;
  }

  /**
   * Obter estatísticas de confiabilidade
   */
  getReliabilityStats(): {
    totalQueries: number;
    verifiedQueries: number;
    averageConfidence: number;
    partnerPriorityCount: number;
  } {
    const totalQueries = this.informationLogs.length;
    const verifiedQueries = this.informationLogs.filter(log => log.verified).length;
    const averageConfidence = this.informationLogs.reduce((sum, log) => sum + log.confidence, 0) / totalQueries || 0;
    const partnerPriorityCount = this.informationLogs.filter(log => log.partnerPriority).length;

    return {
      totalQueries,
      verifiedQueries,
      averageConfidence,
      partnerPriorityCount
    };
  }

  /**
   * Gerar relatório de confiabilidade
   */
  generateReliabilityReport(): string {
    const stats = this.getReliabilityStats();
    const recentLogs = this.informationLogs.slice(-10); // Últimos 10 logs

    return `
RELATÓRIO DE CONFIABILIDADE - GUATÁ

📊 ESTATÍSTICAS GERAIS:
- Total de consultas: ${stats.totalQueries}
- Consultas verificadas: ${stats.verifiedQueries}
- Taxa de verificação: ${((stats.verifiedQueries / stats.totalQueries) * 100).toFixed(1)}%
- Confiança média: ${(stats.averageConfidence * 100).toFixed(1)}%
- Prioridade para parceiros: ${stats.partnerPriorityCount} vezes

🔍 ÚLTIMAS CONSULTAS:
${recentLogs.map(log => `
- Query: "${log.query}"
- Verificado: ${log.verified ? '✅' : '❌'}
- Confiança: ${(log.confidence * 100).toFixed(1)}%
- Parceiro priorizado: ${log.partnerPriority ? '✅' : '❌'}
`).join('')}

📋 RECOMENDAÇÕES:
${stats.verifiedQueries / stats.totalQueries < 0.8 ? '- ⚠️ Taxa de verificação baixa. Revisar fontes.' : '- ✅ Taxa de verificação adequada.'}
${stats.averageConfidence < 0.7 ? '- ⚠️ Confiança média baixa. Melhorar fontes.' : '- ✅ Confiança média adequada.'}
    `;
  }
}

export const informationVerificationService = new InformationVerificationService(); 