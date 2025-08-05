// Sistema de Machine Learning Adaptativo - Guatá Inteligente
// APRENDE com cada interação e melhora automaticamente

import { KnowledgeQuery, VerifiedKnowledgeItem } from '../knowledge/verifiedKnowledgeBase';
import { ResponseWithVerification } from '../verification/tripleVerificationService';

export interface InteractionData {
  id: string;
  timestamp: Date;
  query: KnowledgeQuery;
  response: ResponseWithVerification;
  userFeedback?: {
    rating: number; // 1-5
    helpful: boolean;
    comment?: string;
  };
  sessionId: string;
  userId?: string;
}

export interface LearningPattern {
  category: string;
  location?: string;
  queryPatterns: string[];
  popularTerms: string[];
  frequency: number;
  avgSatisfaction: number;
  lastSeen: Date;
}

export interface KnowledgeGap {
  topic: string;
  category: string;
  location?: string;
  frequency: number;
  avgConfidence: number;
  lastRequested: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface SourcePerformance {
  sourceId: string;
  sourceName: string;
  totalQueries: number;
  successRate: number;
  avgConfidence: number;
  avgResponseTime: number;
  reliability: 'high' | 'medium' | 'low';
  categories: string[];
}

export interface LearningInsights {
  topQueries: LearningPattern[];
  knowledgeGaps: KnowledgeGap[];
  sourcePerformance: SourcePerformance[];
  partnerOpportunities: {
    category: string;
    location: string;
    demand: number;
    potentialRevenue: number;
  }[];
  recommendations: {
    type: 'add_source' | 'update_data' | 'new_partnership' | 'improve_coverage';
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: number;
  }[];
}

class AdaptiveLearningService {
  private interactions: InteractionData[] = [];
  private learningPatterns: LearningPattern[] = [];
  private knowledgeGaps: KnowledgeGap[] = [];
  private sourcePerformance: Map<string, SourcePerformance> = new Map();

  // NÍVEL 1: ANÁLISE DE INTERAÇÕES
  async analyzeInteraction(interaction: InteractionData): Promise<void> {
    try {
      // Salvar interação
      this.interactions.push(interaction);
      
      // Analisar padrões de consulta
      await this.updateLearningPatterns(interaction);
      
      // Identificar gaps de conhecimento
      await this.identifyKnowledgeGaps(interaction);
      
      // Avaliar performance das fontes
      await this.updateSourcePerformance(interaction);
      
      // Detectar oportunidades de parceria
      await this.detectPartnershipOpportunities(interaction);

      // Limpar dados antigos para evitar sobrecarga
      this.cleanupOldData();

    } catch (error) {
      console.error('Erro na análise de interação:', error);
    }
  }

  // Atualiza padrões de aprendizado baseado nas consultas
  private async updateLearningPatterns(interaction: InteractionData): Promise<void> {
    const { query } = interaction;
    const key = `${query.category || 'general'}_${query.location || 'any'}`;
    
    // Buscar padrão existente ou criar novo
    let pattern = this.learningPatterns.find(p => 
      p.category === (query.category || 'general') && 
      p.location === query.location
    );

    if (!pattern) {
      pattern = {
        category: query.category || 'general',
        location: query.location,
        queryPatterns: [],
        popularTerms: [],
        frequency: 0,
        avgSatisfaction: 0,
        lastSeen: new Date()
      };
      this.learningPatterns.push(pattern);
    }

    // Atualizar dados do padrão
    pattern.frequency++;
    pattern.lastSeen = new Date();
    
    // Extrair termos populares
    const terms = query.query.toLowerCase().split(' ').filter(term => term.length > 2);
    terms.forEach(term => {
      if (!pattern!.popularTerms.includes(term)) {
        pattern!.popularTerms.push(term);
      }
    });

    // Manter apenas os 10 termos mais relevantes
    pattern.popularTerms = pattern.popularTerms.slice(0, 10);

    // Atualizar satisfação se temos feedback
    if (interaction.userFeedback) {
      const currentSatisfaction = pattern.avgSatisfaction * (pattern.frequency - 1);
      pattern.avgSatisfaction = (currentSatisfaction + interaction.userFeedback.rating) / pattern.frequency;
    }
  }

  // Identifica gaps de conhecimento baseado em consultas mal-sucedidas
  private async identifyKnowledgeGaps(interaction: InteractionData): Promise<void> {
    const { query, response } = interaction;
    
    // Se confiança baixa ou dados insuficientes, é um gap
    if (response.verification.confidence < 70 || 
        response.verification.recommendation === 'insufficient_data') {
      
      let gap = this.knowledgeGaps.find(g => 
        g.topic.toLowerCase() === query.query.toLowerCase() &&
        g.category === (query.category || 'general')
      );

      if (!gap) {
        gap = {
          topic: query.query,
          category: query.category || 'general',
          location: query.location,
          frequency: 0,
          avgConfidence: 0,
          lastRequested: new Date(),
          priority: 'medium'
        };
        this.knowledgeGaps.push(gap);
      }

      gap.frequency++;
      gap.lastRequested = new Date();
      gap.avgConfidence = (gap.avgConfidence + response.verification.confidence) / 2;
      
      // Determinar prioridade baseada na frequência e baixa confiança
      if (gap.frequency >= 5 && gap.avgConfidence < 50) {
        gap.priority = 'high';
      } else if (gap.frequency >= 3 || gap.avgConfidence < 30) {
        gap.priority = 'medium';
      } else {
        gap.priority = 'low';
      }
    }
  }

  // Atualiza performance das fontes
  private async updateSourcePerformance(interaction: InteractionData): Promise<void> {
    const { response } = interaction;
    
    response.verification.sources.forEach(source => {
      let performance = this.sourcePerformance.get(source.id);
      
      if (!performance) {
        performance = {
          sourceId: source.id,
          sourceName: source.name,
          totalQueries: 0,
          successRate: 0,
          avgConfidence: 0,
          avgResponseTime: 0,
          reliability: 'medium',
          categories: []
        };
      }

      performance.totalQueries++;
      
      // Atualizar taxa de sucesso
      const wasSuccessful = response.verification.verified ? 1 : 0;
      performance.successRate = (performance.successRate * (performance.totalQueries - 1) + wasSuccessful) / performance.totalQueries;
      
      // Atualizar confiança média
      performance.avgConfidence = (performance.avgConfidence * (performance.totalQueries - 1) + response.verification.confidence) / performance.totalQueries;
      
      // Atualizar categorias
      if (source.category && !performance.categories.includes(source.category)) {
        performance.categories.push(source.category);
      }

      // Determinar confiabilidade
      if (performance.successRate >= 0.9 && performance.avgConfidence >= 80) {
        performance.reliability = 'high';
      } else if (performance.successRate >= 0.7 && performance.avgConfidence >= 60) {
        performance.reliability = 'medium';
      } else {
        performance.reliability = 'low';
      }

      this.sourcePerformance.set(source.id, performance);
    });
  }

  // NÍVEL 2: EVOLUÇÃO DE FONTES
  async optimizeSources(): Promise<void> {
    // Analisar performance das fontes e sugerir melhorias
    const poorPerformingSources = Array.from(this.sourcePerformance.values())
      .filter(source => source.reliability === 'low' || source.successRate < 0.6);

    // Identificar categorias que precisam de melhores fontes
    const categoriesNeedingBetterSources = this.identifyCategoriesNeedingImprovement();

    // Log para dashboard administrativo
    console.log('Fontes com baixa performance:', poorPerformingSources);
    console.log('Categorias precisando melhores fontes:', categoriesNeedingBetterSources);
  }

  // NÍVEL 3: EXPANSÃO GEOGRÁFICA
  async expandCoverage(): Promise<void> {
    // Identificar localizações frequentemente consultadas mas com pouca cobertura
    const locationDemand = this.interactions.reduce((acc, interaction) => {
      const location = interaction.query.location || 'unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sugerir expansão baseada na demanda
    const expansionOpportunities = Object.entries(locationDemand)
      .filter(([location, demand]) => demand >= 5 && location !== 'unknown')
      .sort(([,a], [,b]) => b - a);

    console.log('Oportunidades de expansão geográfica:', expansionOpportunities);
  }

  // NÍVEL 4: MELHORIA DE PRECISÃO
  async improvePrecision(): Promise<void> {
    // Analisar consultas com baixa satisfação
    const lowSatisfactionQueries = this.interactions.filter(interaction => 
      interaction.userFeedback && interaction.userFeedback.rating < 3
    );

    // Identificar padrões de problemas
    const problemPatterns = this.identifyProblemPatterns(lowSatisfactionQueries);

    console.log('Padrões de problemas identificados:', problemPatterns);
  }

  // NÍVEL 5: PREDIÇÃO DE NECESSIDADES
  async predictNeeds(): Promise<void> {
    // Analisar tendências temporais
    const recentPatterns = this.learningPatterns.filter(pattern => 
      (new Date().getTime() - pattern.lastSeen.getTime()) < 7 * 24 * 60 * 60 * 1000 // Última semana
    );

    // Predizer consultas futuras baseado em padrões
    const predictedNeeds = recentPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    console.log('Necessidades preditas:', predictedNeeds);
  }

  // Detecta oportunidades de parceria baseado na demanda
  private async detectPartnershipOpportunities(interaction: InteractionData): Promise<void> {
    const { query, response } = interaction;
    
    // Se não temos parceiros nesta categoria/localização mas há demanda
    if (!response.hasPartners && query.category && 
        ['hotel', 'restaurant', 'attraction', 'agency'].includes(query.category)) {
      
      // Incrementar contador de oportunidade
      const opportunityKey = `${query.category}_${query.location || 'MS'}`;
      // Aqui salvaria dados de oportunidade para análise posterior
    }
  }

  // Identifica categorias que precisam de melhores fontes
  private identifyCategoriesNeedingImprovement(): string[] {
    const categoryStats = this.knowledgeGaps.reduce((acc, gap) => {
      if (!acc[gap.category]) {
        acc[gap.category] = { gaps: 0, totalConfidence: 0 };
      }
      acc[gap.category].gaps++;
      acc[gap.category].totalConfidence += gap.avgConfidence;
      return acc;
    }, {} as Record<string, { gaps: number; totalConfidence: number }>);

    return Object.entries(categoryStats)
      .filter(([category, stats]) => stats.gaps >= 3 || (stats.totalConfidence / stats.gaps) < 60)
      .map(([category]) => category);
  }

  // Identifica padrões de problemas
  private identifyProblemPatterns(lowSatisfactionQueries: InteractionData[]): any[] {
    // Agrupa por categoria e identifica problemas comuns
    const patterns = lowSatisfactionQueries.reduce((acc, interaction) => {
      const key = interaction.query.category || 'general';
      if (!acc[key]) acc[key] = [];
      acc[key].push(interaction);
      return acc;
    }, {} as Record<string, InteractionData[]>);

    return Object.entries(patterns).map(([category, interactions]) => ({
      category,
      count: interactions.length,
      commonIssues: interactions.map(i => i.userFeedback?.comment).filter(Boolean)
    }));
  }

  // Limpa dados antigos para otimizar performance
  private cleanupOldData(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Manter apenas interações dos últimos 30 dias
    this.interactions = this.interactions.filter(interaction => 
      interaction.timestamp > thirtyDaysAgo
    );

    // Limpar padrões não utilizados
    this.learningPatterns = this.learningPatterns.filter(pattern => 
      pattern.lastSeen > thirtyDaysAgo
    );
  }

  // Gera insights para dashboard administrativo
  async generateInsights(): Promise<LearningInsights> {
    // Top consultas
    const topQueries = this.learningPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Gaps de conhecimento priorizados
    const prioritizedGaps = this.knowledgeGaps
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority] || b.frequency - a.frequency;
      })
      .slice(0, 10);

    // Performance das fontes
    const sourcesList = Array.from(this.sourcePerformance.values())
      .sort((a, b) => b.avgConfidence - a.avgConfidence);

    // Oportunidades de parceria
    const partnerOpportunities = this.calculatePartnershipOpportunities();

    // Recomendações automáticas
    const recommendations = this.generateRecommendations();

    return {
      topQueries,
      knowledgeGaps: prioritizedGaps,
      sourcePerformance: sourcesList,
      partnerOpportunities,
      recommendations
    };
  }

  // Calcula oportunidades de parceria
  private calculatePartnershipOpportunities(): LearningInsights['partnerOpportunities'] {
    const demand = this.learningPatterns
      .filter(pattern => ['hotel', 'restaurant', 'attraction'].includes(pattern.category))
      .map(pattern => ({
        category: pattern.category,
        location: pattern.location || 'MS',
        demand: pattern.frequency,
        potentialRevenue: pattern.frequency * 10 // Estimativa simples
      }))
      .sort((a, b) => b.demand - a.demand);

    return demand.slice(0, 5);
  }

  // Gera recomendações automáticas
  private generateRecommendations(): LearningInsights['recommendations'] {
    const recommendations: LearningInsights['recommendations'] = [];

    // Recomendar melhorar cobertura para gaps de alta prioridade
    const highPriorityGaps = this.knowledgeGaps.filter(gap => gap.priority === 'high');
    if (highPriorityGaps.length > 0) {
      recommendations.push({
        type: 'improve_coverage',
        priority: 'high',
        description: `Melhorar cobertura para: ${highPriorityGaps.map(g => g.topic).join(', ')}`,
        expectedImpact: 80
      });
    }

    // Recomendar novas parcerias baseado na demanda
    const topDemandCategories = this.learningPatterns
      .filter(p => ['hotel', 'restaurant'].includes(p.category))
      .sort((a, b) => b.frequency - a.frequency);

    if (topDemandCategories.length > 0) {
      recommendations.push({
        type: 'new_partnership',
        priority: 'medium',
        description: `Buscar parceiros para ${topDemandCategories[0].category} em ${topDemandCategories[0].location}`,
        expectedImpact: 60
      });
    }

    return recommendations;
  }

  // Métricas para dashboard
  getMetrics() {
    const totalInteractions = this.interactions.length;
    const avgSatisfaction = this.interactions
      .filter(i => i.userFeedback)
      .reduce((sum, i) => sum + (i.userFeedback?.rating || 0), 0) / 
      this.interactions.filter(i => i.userFeedback).length || 0;

    const gapsByPriority = this.knowledgeGaps.reduce((acc, gap) => {
      acc[gap.priority] = (acc[gap.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInteractions,
      avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
      learningPatterns: this.learningPatterns.length,
      knowledgeGaps: gapsByPriority,
      sourcePerformance: this.sourcePerformance.size,
      lastAnalysis: new Date().toISOString()
    };
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();