/**
 * ⭐ QUALITY LEARNING SERVICE
 * Melhora qualidade de respostas baseado em feedback
 */

import { FeedbackData } from './guataMLService';

export interface QualityImprovement {
  id: string;
  pattern: string;
  suggestion: string;
  confidence: number;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}

export class QualityLearningService {
  private improvements: Map<string, QualityImprovement> = new Map();
  private readonly MIN_CONFIDENCE = 0.7;
  private readonly MIN_FEEDBACK_COUNT = 2; // Mínimo de feedbacks para aplicar melhoria

  /**
   * Aprende de feedback do usuário
   */
  async learnFromFeedback(feedback: FeedbackData): Promise<boolean> {
    try {
      console.log('⭐ Quality Learning: Processando feedback...');

      if (feedback.rating === 'negative' && feedback.correction) {
        // Extrair padrão da pergunta
        const pattern = this.extractPattern(feedback.question);
        
        // Criar ou atualizar melhoria
        const improvementId = this.generateImprovementId(pattern);
        const existing = this.improvements.get(improvementId);

        if (existing) {
          // Atualizar melhoria existente
          existing.confidence = Math.min(0.95, existing.confidence + 0.1);
          existing.usageCount++;
          existing.lastUsed = new Date();
          
          // Atualizar sugestão se a correção for mais específica
          if (feedback.correction.length > existing.suggestion.length) {
            existing.suggestion = feedback.correction;
          }
        } else {
          // Criar nova melhoria
          const improvement: QualityImprovement = {
            id: improvementId,
            pattern,
            suggestion: feedback.correction,
            confidence: 0.7,
            usageCount: 1,
            lastUsed: new Date(),
            createdAt: new Date()
          };
          this.improvements.set(improvementId, improvement);
        }

        console.log('✅ Quality Learning: Melhoria criada/atualizada');
        return true;
      }

      if (feedback.rating === 'positive') {
        // Reforçar melhorias existentes
        const pattern = this.extractPattern(feedback.question);
        const improvementId = this.generateImprovementId(pattern);
        const existing = this.improvements.get(improvementId);

        if (existing) {
          existing.confidence = Math.min(0.95, existing.confidence + 0.05);
          existing.usageCount++;
          console.log('✅ Quality Learning: Melhoria reforçada');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao aprender de feedback:', error);
      return false;
    }
  }

  /**
   * Obtém melhorias aplicáveis para uma pergunta
   */
  async getImprovementsForQuestion(question: string): Promise<QualityImprovement[]> {
    try {
      const pattern = this.extractPattern(question);
      const improvements: QualityImprovement[] = [];

      // Buscar melhorias que correspondem ao padrão
      for (const improvement of this.improvements.values()) {
        if (this.patternMatches(improvement.pattern, pattern) && 
            improvement.confidence >= this.MIN_CONFIDENCE &&
            improvement.usageCount >= this.MIN_FEEDBACK_COUNT) {
          improvements.push(improvement);
        }
      }

      // Ordenar por confiança e uso
      return improvements.sort((a, b) => {
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return b.usageCount - a.usageCount;
      });
    } catch (error) {
      console.error('❌ Erro ao obter melhorias:', error);
      return [];
    }
  }

  /**
   * Extrai padrão de uma pergunta
   */
  private extractPattern(question: string): string {
    // Normalizar pergunta: remover pontuação, converter para minúsculas
    let pattern = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Remover palavras comuns que não são relevantes para o padrão
    const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'no', 'na', 'para', 'com', 'por', 'que', 'qual', 'quais', 'onde', 'quando', 'como', 'porque'];
    const words = pattern.split(' ').filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );

    // Retornar palavras-chave principais (máximo 5)
    return words.slice(0, 5).join(' ');
  }

  /**
   * Verifica se um padrão corresponde a outro
   */
  private patternMatches(pattern1: string, pattern2: string): boolean {
    const words1 = pattern1.split(' ');
    const words2 = pattern2.split(' ');
    
    // Contar palavras em comum
    const commonWords = words1.filter(word => words2.includes(word));
    
    // Considerar correspondência se houver pelo menos 2 palavras em comum
    return commonWords.length >= 2;
  }

  /**
   * Gera ID único para melhoria
   */
  private generateImprovementId(pattern: string): string {
    return `improvement-${pattern.replace(/\s+/g, '-').substring(0, 50)}`;
  }

  /**
   * Obtém todas as melhorias
   */
  getAllImprovements(): QualityImprovement[] {
    return Array.from(this.improvements.values());
  }

  /**
   * Limpa melhorias antigas (não usadas há mais de 30 dias)
   */
  cleanOldImprovements(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [id, improvement] of this.improvements.entries()) {
      if (improvement.lastUsed < thirtyDaysAgo && improvement.usageCount < 3) {
        this.improvements.delete(id);
      }
    }
  }
}


