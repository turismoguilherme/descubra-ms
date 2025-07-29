import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/integrations/supabase/client';
// PredictiveAnalytics removido - funcionalidade integrada no superTourismAI
import { proactiveAlertsService } from './ProactiveAlertsService';

export interface PersonalizedRecommendation {
  id: string;
  category: 'marketing' | 'infrastructure' | 'events' | 'pricing' | 'partnerships' | 'capacity' | 'experience';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: string;
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  resources: string[];
  kpis: string[];
  confidence: number;
  createdAt: string;
  cityId?: string;
  regionId?: string;
}

export interface UserProfile {
  role: string;
  cityId?: string;
  regionId?: string;
  interests: string[];
  previousActions: string[];
  preferredTimeframes: string[];
  budgetConstraints?: string;
}

class PersonalizedRecommendationsService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  /**
   * Gera recomendações personalizadas para um gestor
   */
  async generatePersonalizedRecommendations(userProfile: UserProfile): Promise<PersonalizedRecommendation[]> {
    console.log('🎯 Gerando recomendações personalizadas...');

    try {
      // Coletar contexto completo
      const context = await this.collectContextData(userProfile);
      
      // Gerar recomendações baseadas no perfil
      const recommendations = await this.generateContextualRecommendations(userProfile, context);
      
      // Ordenar por prioridade e relevância
      const sortedRecommendations = this.prioritizeRecommendations(recommendations, userProfile);
      
      return sortedRecommendations;

    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error);
      return this.generateFallbackRecommendations(userProfile);
    }
  }

  /**
   * Coleta dados contextuais para personalização
   */
  private async collectContextData(userProfile: UserProfile) {
    const [
      insights,
      alerts,
      demandForecast,
      seasonality,
      checkIns,
      events
    ] = await Promise.all([
      // predictiveAnalyticsService removido - funcionalidade integrada no superTourismAI  
      Promise.resolve([]), // Placeholder para insights estratégicos
      proactiveAlertsService.getActiveAlerts(userProfile.cityId, userProfile.regionId),
      Promise.resolve([]), // Placeholder para previsão de demanda (3 meses)
      Promise.resolve([]), // Placeholder para análise de sazonalidade
      this.getRecentCheckIns(userProfile.cityId, userProfile.regionId),
      this.getRecentEvents(userProfile.cityId, userProfile.regionId)
    ]);

    return {
      insights,
      alerts,
      demandForecast,
      seasonality,
      checkIns,
      events,
      currentMetrics: {
        totalVisitors: checkIns.length,
        eventCount: events.length,
        alertCount: alerts.length,
        avgConfidence: insights.length > 0 
          ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
          : 0
      }
    };
  }

  /**
   * Gera recomendações contextuais usando IA
   */
  private async generateContextualRecommendations(
    userProfile: UserProfile, 
    context: any
  ): Promise<PersonalizedRecommendation[]> {
    
    if (this.model) {
      return this.generateAIRecommendations(userProfile, context);
    } else {
      return this.generateRuleBasedRecommendations(userProfile, context);
    }
  }

  /**
   * Gera recomendações usando Gemini AI
   */
  private async generateAIRecommendations(
    userProfile: UserProfile, 
    context: any
  ): Promise<PersonalizedRecommendation[]> {
    
    const prompt = this.buildPersonalizedPrompt(userProfile, context);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseAIRecommendations(response, userProfile);
    } catch (error) {
      console.error('❌ Erro na geração com IA:', error);
      return this.generateRuleBasedRecommendations(userProfile, context);
    }
  }

  /**
   * Constrói prompt personalizado para a IA
   */
  private buildPersonalizedPrompt(userProfile: UserProfile, context: any): string {
    return `
Como especialista em turismo e gestão pública, analise o perfil do gestor e contexto atual para gerar recomendações estratégicas personalizadas.

PERFIL DO GESTOR:
- Cargo: ${userProfile.role}
- Interesses: ${userProfile.interests.join(', ')}
- Ações Anteriores: ${userProfile.previousActions.join(', ')}
- Preferências de Prazo: ${userProfile.preferredTimeframes.join(', ')}

CONTEXTO ATUAL:
- Total de Visitantes: ${context.currentMetrics.totalVisitors}
- Eventos Ativos: ${context.currentMetrics.eventCount}
- Alertas Pendentes: ${context.currentMetrics.alertCount}
- Insights Disponíveis: ${context.insights.length}

ALERTAS CRÍTICOS:
${context.alerts.filter((a: any) => a.priority === 'high' || a.priority === 'critical')
  .map((a: any) => `- ${a.title}: ${a.description}`)
  .join('\n')}

PREVISÕES:
${context.demandForecast.slice(0, 2)
  .map((f: any) => `- ${f.period}: ${f.predictedVisitors} visitantes previstos`)
  .join('\n')}

Gere 5-7 recomendações personalizadas seguindo este formato JSON:
{
  "recommendations": [
    {
      "category": "marketing|infrastructure|events|pricing|partnerships|capacity|experience",
      "priority": "low|medium|high|urgent",
      "title": "Título da recomendação",
      "description": "Descrição detalhada",
      "reasoning": "Por que esta recomendação é relevante",
      "expectedImpact": "Impacto esperado",
      "timeframe": "immediate|short_term|medium_term|long_term",
      "resources": ["recurso1", "recurso2"],
      "kpis": ["kpi1", "kpi2"],
      "confidence": 0.8
    }
  ]
}

Foque em recomendações acionáveis, específicas para o perfil do gestor e baseadas no contexto atual.
    `;
  }

  /**
   * Processa resposta da IA para extrair recomendações
   */
  private parseAIRecommendations(
    aiResponse: string, 
    userProfile: UserProfile
  ): PersonalizedRecommendation[] {
    try {
      // Extrair JSON da resposta
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON não encontrado');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return parsed.recommendations.map((rec: any, index: number) => ({
        id: `rec_${Date.now()}_${index}`,
        category: rec.category,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        reasoning: rec.reasoning,
        expectedImpact: rec.expectedImpact,
        timeframe: rec.timeframe,
        resources: rec.resources || [],
        kpis: rec.kpis || [],
        confidence: rec.confidence || 0.8,
        createdAt: new Date().toISOString(),
        cityId: userProfile.cityId,
        regionId: userProfile.regionId
      }));

    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      return this.generateRuleBasedRecommendations(userProfile, {});
    }
  }

  /**
   * Gera recomendações baseadas em regras (fallback)
   */
  private generateRuleBasedRecommendations(
    userProfile: UserProfile, 
    context: any
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];
    const baseId = Date.now();

    // Recomendações baseadas em alertas
    if (context.alerts?.length > 0) {
      const criticalAlert = context.alerts.find((a: any) => a.priority === 'critical');
      if (criticalAlert) {
        recommendations.push({
          id: `rec_alert_${baseId}`,
          category: this.mapAlertToCategory(criticalAlert.type),
          priority: 'urgent',
          title: `Ação Urgente: ${criticalAlert.affectedArea}`,
          description: `Resolver imediatamente: ${criticalAlert.description}`,
          reasoning: 'Alerta crítico detectado pelo sistema de monitoramento',
          expectedImpact: 'Prevenção de problemas maiores e melhoria da experiência',
          timeframe: 'immediate',
          resources: criticalAlert.recommendations,
          kpis: ['Resolução do alerta', 'Melhoria da métrica afetada'],
          confidence: 0.95,
          createdAt: new Date().toISOString(),
          cityId: userProfile.cityId,
          regionId: userProfile.regionId
        });
      }
    }

    // Recomendações baseadas em sazonalidade
    if (context.seasonality?.length > 0) {
      const peakMonth = context.seasonality.sort((a: any, b: any) => b.expectedVisitors - a.expectedVisitors)[0];
      recommendations.push({
        id: `rec_seasonal_${baseId}`,
        category: 'marketing',
        priority: 'medium',
        title: `Preparação para Pico em ${peakMonth.monthName}`,
        description: `Prepare-se para o pico de visitação em ${peakMonth.monthName} com ${peakMonth.expectedVisitors} visitantes esperados`,
        reasoning: 'Análise de sazonalidade indica pico de demanda',
        expectedImpact: 'Maximização da receita e satisfação dos visitantes',
        timeframe: 'medium_term',
        resources: ['Infraestrutura adicional', 'Campanhas de marketing', 'Coordenação de equipes'],
        kpis: ['Visitantes atendidos', 'Satisfação média', 'Receita gerada'],
        confidence: peakMonth.confidenceLevel,
        createdAt: new Date().toISOString(),
        cityId: userProfile.cityId,
        regionId: userProfile.regionId
      });
    }

    // Recomendações baseadas em previsões
    if (context.demandForecast?.length > 0) {
      const nextMonthForecast = context.demandForecast[0];
      recommendations.push({
        id: `rec_forecast_${baseId}`,
        category: 'capacity',
        priority: 'medium',
        title: 'Preparação para Demanda Prevista',
        description: `Prepare-se para ${nextMonthForecast.predictedVisitors} visitantes em ${nextMonthForecast.period}`,
        reasoning: 'Previsão de demanda baseada em análise preditiva',
        expectedImpact: 'Melhor preparação e experiência otimizada',
        timeframe: 'short_term',
        resources: ['Planejamento de capacidade', 'Recursos humanos', 'Logística'],
        kpis: ['Capacidade utilizada', 'Tempo de espera', 'Satisfação'],
        confidence: 0.85,
        createdAt: new Date().toISOString(),
        cityId: userProfile.cityId,
        regionId: userProfile.regionId
      });
    }

    // Recomendações baseadas no perfil do usuário
    if (userProfile.interests.includes('marketing')) {
      recommendations.push({
        id: `rec_marketing_${baseId}`,
        category: 'marketing',
        priority: 'medium',
        title: 'Otimização de Campanhas Digitais',
        description: 'Implemente campanhas de marketing digital direcionadas baseadas nos dados de visitação',
        reasoning: 'Interesse declarado em marketing e oportunidades identificadas',
        expectedImpact: 'Aumento de 15-25% na atração de visitantes',
        timeframe: 'short_term',
        resources: ['Orçamento de marketing', 'Ferramentas digitais', 'Conteúdo criativo'],
        kpis: ['Alcance das campanhas', 'Taxa de conversão', 'Custo por visitante'],
        confidence: 0.8,
        createdAt: new Date().toISOString(),
        cityId: userProfile.cityId,
        regionId: userProfile.regionId
      });
    }

    return recommendations.slice(0, 6); // Limitar a 6 recomendações
  }

  /**
   * Mapeia tipo de alerta para categoria de recomendação
   */
  private mapAlertToCategory(alertType: string): PersonalizedRecommendation['category'] {
    const mapping: Record<string, PersonalizedRecommendation['category']> = {
      'capacity_overload': 'capacity',
      'satisfaction_drop': 'experience',
      'infrastructure_issue': 'infrastructure',
      'marketing_opportunity': 'marketing',
      'demand_spike': 'capacity',
      'revenue_drop': 'pricing'
    };
    return mapping[alertType] || 'experience';
  }

  /**
   * Prioriza recomendações baseado no perfil do usuário
   */
  private prioritizeRecommendations(
    recommendations: PersonalizedRecommendation[], 
    userProfile: UserProfile
  ): PersonalizedRecommendation[] {
    return recommendations.sort((a, b) => {
      // Prioridade urgente primeiro
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      
      // Depois por interesse do usuário
      const aRelevant = userProfile.interests.some(interest => 
        a.category.toLowerCase().includes(interest.toLowerCase()) ||
        a.title.toLowerCase().includes(interest.toLowerCase())
      );
      const bRelevant = userProfile.interests.some(interest => 
        b.category.toLowerCase().includes(interest.toLowerCase()) ||
        b.title.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (aRelevant && !bRelevant) return -1;
      if (bRelevant && !aRelevant) return 1;
      
      // Por fim, por confiança
      return b.confidence - a.confidence;
    });
  }

  /**
   * Gera recomendações de fallback
   */
  private generateFallbackRecommendations(userProfile: UserProfile): PersonalizedRecommendation[] {
    return [
      {
        id: `fallback_${Date.now()}`,
        category: 'experience',
        priority: 'medium',
        title: 'Melhoria da Experiência do Visitante',
        description: 'Implemente melhorias básicas na experiência do visitante baseadas em boas práticas',
        reasoning: 'Recomendação padrão para melhoria contínua',
        expectedImpact: 'Aumento na satisfação e retorno de visitantes',
        timeframe: 'medium_term',
        resources: ['Treinamento de equipe', 'Sinalização', 'Infraestrutura básica'],
        kpis: ['Avaliação média', 'Taxa de retorno', 'Reclamações'],
        confidence: 0.7,
        createdAt: new Date().toISOString(),
        cityId: userProfile.cityId,
        regionId: userProfile.regionId
      }
    ];
  }

  // Métodos auxiliares
  private async getRecentCheckIns(cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('passport_stamps')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);
    return data || [];
  }

  private async getRecentEvents(cityId?: string, regionId?: string) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(20);
    return data || [];
  }

  /**
   * Gera recomendações por categoria específica
   */
  async getRecommendationsByCategory(
    category: PersonalizedRecommendation['category'],
    userProfile: UserProfile
  ): Promise<PersonalizedRecommendation[]> {
    const allRecommendations = await this.generatePersonalizedRecommendations(userProfile);
    return allRecommendations.filter(rec => rec.category === category);
  }

  /**
   * Marca recomendação como implementada
   */
  async markAsImplemented(recommendationId: string): Promise<void> {
    // Implementar salvamento no banco
    console.log(`✅ Recomendação implementada: ${recommendationId}`);
  }

  /**
   * Obtém feedback sobre recomendação
   */
  async submitFeedback(recommendationId: string, rating: number, comments?: string): Promise<void> {
    // Implementar sistema de feedback
    console.log(`📝 Feedback recebido para ${recommendationId}: ${rating}/5`);
  }
}

export const personalizedRecommendationsService = new PersonalizedRecommendationsService(); 