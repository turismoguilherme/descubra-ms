// Sistema de Aprendizado Contínuo - Guatá Super Inteligente
// Permite que o Guatá aprenda com cada interação e melhore continuamente

export interface LearningInteraction {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  userFeedback: 'positive' | 'negative' | 'neutral';
  userCorrection?: string;
  timestamp: Date;
  metadata: {
    user_id?: string;
    session_id?: string;
    location?: string;
    query_type: 'tourism' | 'hotel' | 'restaurant' | 'attraction' | 'event' | 'transport' | 'other';
  };
}

export interface LearningInsight {
  pattern: string;
  frequency: number;
  avgConfidence: number;
  avgSatisfaction: number;
  commonCorrections: string[];
  suggestedImprovements: string[];
  lastUpdated: Date;
}

export interface KnowledgeGap {
  category: string;
  question: string;
  frequency: number;
  currentConfidence: number;
  suggestedSources: string[];
  priority: 'high' | 'medium' | 'low';
}

export class ContinuousLearningService {
  private learningInteractions: LearningInteraction[] = [];
  private learningInsights: LearningInsight[] = [];
  private knowledgeGaps: KnowledgeGap[] = [];

  // Aprender com cada interação
  async learnFromInteraction(interaction: LearningInteraction): Promise<void> {
    try {
      console.log('🧠 Guatá aprendendo com nova interação:', interaction.question);
      
      // 1. Armazenar interação
      this.learningInteractions.push(interaction);
      
      // 2. Analisar padrões
      await this.analyzePatterns(interaction);
      
      // 3. Identificar lacunas de conhecimento
      await this.identifyKnowledgeGaps(interaction);
      
      // 4. Sugerir melhorias
      await this.suggestImprovements(interaction);
      
      // 5. Salvar no banco de dados
      await this.saveLearningData(interaction);
      
      console.log('✅ Aprendizado concluído para:', interaction.question);
      
    } catch (error) {
      console.error('❌ Erro no aprendizado:', error);
    }
  }

  // Analisar padrões de perguntas e respostas
  private async analyzePatterns(interaction: LearningInteraction): Promise<void> {
    const questionLower = interaction.question.toLowerCase();
    
    // Identificar tipo de pergunta
    let queryType: string = 'other';
    if (questionLower.includes('hotel') || questionLower.includes('hospedagem')) queryType = 'hotel';
    else if (questionLower.includes('restaurante') || questionLower.includes('comida')) queryType = 'restaurant';
    else if (questionLower.includes('fazer') || questionLower.includes('atrativo')) queryType = 'attraction';
    else if (questionLower.includes('evento') || questionLower.includes('festival')) queryType = 'event';
    else if (questionLower.includes('ônibus') || questionLower.includes('transporte')) queryType = 'transport';
    else if (questionLower.includes('turismo') || questionLower.includes('viagem')) queryType = 'tourism';

    // Atualizar insights existentes ou criar novos
    let insight = this.learningInsights.find(i => i.pattern === queryType);
    
    if (!insight) {
      insight = {
        pattern: queryType,
        frequency: 0,
        avgConfidence: 0,
        avgSatisfaction: 0,
        commonCorrections: [],
        suggestedImprovements: [],
        lastUpdated: new Date()
      };
      this.learningInsights.push(insight);
    }

    // Atualizar estatísticas
    insight.frequency++;
    insight.avgConfidence = (insight.avgConfidence * (insight.frequency - 1) + interaction.confidence) / insight.frequency;
    
    const satisfactionScore = interaction.userFeedback === 'positive' ? 1 : interaction.userFeedback === 'negative' ? 0 : 0.5;
    insight.avgSatisfaction = (insight.avgSatisfaction * (insight.frequency - 1) + satisfactionScore) / insight.frequency;
    
    // Adicionar correções do usuário
    if (interaction.userCorrection) {
      if (!insight.commonCorrections.includes(interaction.userCorrection)) {
        insight.commonCorrections.push(interaction.userCorrection);
      }
    }

    insight.lastUpdated = new Date();
  }

  // Identificar lacunas de conhecimento
  private async identifyKnowledgeGaps(interaction: LearningInteraction): Promise<void> {
    // Se confiança baixa ou feedback negativo, pode ser uma lacuna
    if (interaction.confidence < 0.7 || interaction.userFeedback === 'negative') {
      const existingGap = this.knowledgeGaps.find(gap => 
        gap.category === interaction.metadata.query_type &&
        gap.question.toLowerCase().includes(interaction.question.toLowerCase().split(' ')[0])
      );

      if (existingGap) {
        existingGap.frequency++;
        existingGap.currentConfidence = Math.min(existingGap.currentConfidence, interaction.confidence);
      } else {
        const newGap: KnowledgeGap = {
          category: interaction.metadata.query_type,
          question: interaction.question,
          frequency: 1,
          currentConfidence: interaction.confidence,
          suggestedSources: this.suggestSourcesForGap(interaction),
          priority: interaction.confidence < 0.5 ? 'high' : interaction.confidence < 0.7 ? 'medium' : 'low'
        };
        
        this.knowledgeGaps.push(newGap);
      }
    }
  }

  // Sugerir fontes para lacunas de conhecimento
  private suggestSourcesForGap(interaction: LearningInteraction): string[] {
    const suggestions: string[] = [];
    
    switch (interaction.metadata.query_type) {
      case 'hotel':
        suggestions.push('https://turismo.ms.gov.br/hoteis', 'https://www.ms.gov.br/hospedagem');
        break;
      case 'restaurant':
        suggestions.push('https://turismo.ms.gov.br/gastronomia', 'https://visitms.com.br/restaurantes');
        break;
      case 'attraction':
        suggestions.push('https://turismo.ms.gov.br/atrativos', 'https://visitms.com.br/atracoes');
        break;
      case 'event':
        suggestions.push('https://turismo.ms.gov.br/eventos', 'https://secult.ms.gov.br/agenda');
        break;
      case 'transport':
        suggestions.push('https://www.ms.gov.br/transporte', 'https://www.ms.gov.br/viagem');
        break;
      default:
        suggestions.push('https://turismo.ms.gov.br', 'https://www.ms.gov.br');
    }
    
    return suggestions;
  }

  // Sugerir melhorias baseadas no aprendizado
  private async suggestImprovements(interaction: LearningInteraction): Promise<void> {
    const insight = this.learningInsights.find(i => i.pattern === interaction.metadata.query_type);
    
    if (!insight) return;

    // Se satisfação baixa, sugerir melhorias
    if (insight.avgSatisfaction < 0.7) {
      const improvements: string[] = [];
      
      if (insight.avgConfidence < 0.7) {
        improvements.push('Expandir base de conhecimento para esta categoria');
      }
      
      if (insight.commonCorrections.length > 0) {
        improvements.push(`Corrigir informações incorretas: ${insight.commonCorrections.join(', ')}`);
      }
      
      if (insight.frequency > 10 && insight.avgSatisfaction < 0.6) {
        improvements.push('Revisar completamente respostas para esta categoria');
      }
      
      insight.suggestedImprovements = improvements;
    }
  }

  // Salvar dados de aprendizado no banco
  private async saveLearningData(interaction: LearningInteraction): Promise<void> {
    try {
      // Aqui você pode salvar no Supabase
      // Por enquanto, apenas log
      console.log('💾 Salvando dados de aprendizado:', {
        question: interaction.question,
        confidence: interaction.confidence,
        feedback: interaction.userFeedback,
        timestamp: interaction.timestamp
      });
    } catch (error) {
      console.error('❌ Erro ao salvar dados de aprendizado:', error);
    }
  }

  // Obter insights de aprendizado
  getLearningInsights(): LearningInsight[] {
    return this.learningInsights.sort((a, b) => b.frequency - a.frequency);
  }

  // Obter lacunas de conhecimento prioritárias
  getPriorityKnowledgeGaps(): KnowledgeGap[] {
    return this.knowledgeGaps
      .filter(gap => gap.priority === 'high')
      .sort((a, b) => b.frequency - a.frequency);
  }

  // Obter estatísticas gerais
  getLearningStats() {
    const totalInteractions = this.learningInteractions.length;
    const positiveFeedback = this.learningInteractions.filter(i => i.userFeedback === 'positive').length;
    const avgConfidence = this.learningInteractions.reduce((sum, i) => sum + i.confidence, 0) / totalInteractions;
    
    return {
      totalInteractions,
      positiveFeedback,
      negativeFeedback: this.learningInteractions.filter(i => i.userFeedback === 'negative').length,
      satisfactionRate: totalInteractions > 0 ? (positiveFeedback / totalInteractions) * 100 : 0,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      knowledgeGaps: this.knowledgeGaps.length,
      insights: this.learningInsights.length
    };
  }

  // Aplicar aprendizado para melhorar respostas futuras
  async applyLearning(question: string, queryType: string): Promise<{
    suggestedSources: string[];
    confidenceBoost: number;
    warnings: string[];
  }> {
    const insights = this.learningInsights.filter(i => i.pattern === queryType);
    const gaps = this.knowledgeGaps.filter(g => g.category === queryType);
    
    let confidenceBoost = 0;
    const warnings: string[] = [];
    const suggestedSources: string[] = [];

    // Aplicar boost baseado em insights positivos
    insights.forEach(insight => {
      if (insight.avgSatisfaction > 0.8) {
        confidenceBoost += 0.1;
      }
      
      if (insight.avgSatisfaction < 0.6) {
        warnings.push(`Categoria ${insight.pattern} tem baixa satisfação (${Math.round(insight.avgSatisfaction * 100)}%)`);
      }
    });

    // Adicionar fontes sugeridas para lacunas
    gaps.forEach(gap => {
      if (gap.priority === 'high') {
        suggestedSources.push(...gap.suggestedSources);
        warnings.push(`Lacuna de conhecimento identificada: ${gap.question}`);
      }
    });

    return {
      suggestedSources: [...new Set(suggestedSources)],
      confidenceBoost: Math.min(confidenceBoost, 0.3), // Máximo de 30% de boost
      warnings
    };
  }

  // Limpar dados antigos (manter apenas últimos 30 dias)
  cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.learningInteractions = this.learningInteractions.filter(
      i => i.timestamp > thirtyDaysAgo
    );
    
    console.log('🧹 Dados de aprendizado antigos removidos');
  }
}

export const continuousLearningService = new ContinuousLearningService();

