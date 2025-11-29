/**
 * 🔍 PATTERN DETECTION SERVICE
 * Detecta padrões de perguntas frequentes e otimiza respostas
 */

import { LearningInteraction } from './guataMLService';

export interface DetectedPattern {
  id: string;
  pattern: string;
  question: string;
  frequency: number;
  lastAsked: Date;
  optimizedAnswer?: string;
  createdAt: Date;
}

export class PatternDetectionService {
  private patterns: Map<string, DetectedPattern> = new Map();
  private readonly MIN_FREQUENCY = 3; // Mínimo de ocorrências para considerar padrão
  private readonly SIMILARITY_THRESHOLD = 0.7; // Limiar de similaridade entre perguntas

  /**
   * Detecta padrão de uma interação
   */
  async detectPattern(interaction: LearningInteraction): Promise<boolean> {
    try {
      const question = interaction.question.toLowerCase().trim();
      const normalizedQuestion = this.normalizeQuestion(question);
      
      // Buscar padrão similar existente
      const similarPattern = this.findSimilarPattern(normalizedQuestion);
      
      if (similarPattern) {
        // Atualizar padrão existente
        similarPattern.frequency++;
        similarPattern.lastAsked = new Date();
        similarPattern.question = question; // Atualizar com pergunta mais recente
        
        // Se atingiu frequência mínima, otimizar resposta
        if (similarPattern.frequency >= this.MIN_FREQUENCY && !similarPattern.optimizedAnswer) {
          similarPattern.optimizedAnswer = this.optimizeAnswer(interaction.answer);
        }
        
        this.patterns.set(similarPattern.id, similarPattern);
        // Padrão atualizado (log removido)
        return true;
      } else {
        // Criar novo padrão
        const patternId = this.generatePatternId(normalizedQuestion);
        const newPattern: DetectedPattern = {
          id: patternId,
          pattern: normalizedQuestion,
          question: question,
          frequency: 1,
          lastAsked: new Date(),
          createdAt: new Date()
        };
        
        this.patterns.set(patternId, newPattern);
        console.log(`🔍 Novo padrão criado: ${normalizedQuestion}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao detectar padrão:', error);
      return false;
    }
  }

  /**
   * Atualiza padrão com correção do usuário
   */
  async updatePatternWithCorrection(
    question: string,
    originalAnswer: string,
    correction: string
  ): Promise<void> {
    try {
      const normalizedQuestion = this.normalizeQuestion(question.toLowerCase());
      const pattern = this.findSimilarPattern(normalizedQuestion);
      
      if (pattern) {
        pattern.optimizedAnswer = correction;
        this.patterns.set(pattern.id, pattern);
        // Padrão atualizado (log removido)
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar padrão com correção:', error);
    }
  }

  /**
   * Obtém padrões frequentes
   */
  async getFrequentPatterns(limit: number = 10): Promise<DetectedPattern[]> {
    try {
      const frequentPatterns = Array.from(this.patterns.values())
        .filter(p => p.frequency >= this.MIN_FREQUENCY)
        .sort((a, b) => {
          // Ordenar por frequência e depois por data mais recente
          if (b.frequency !== a.frequency) {
            return b.frequency - a.frequency;
          }
          return b.lastAsked.getTime() - a.lastAsked.getTime();
        })
        .slice(0, limit);

      return frequentPatterns;
    } catch (error) {
      console.error('❌ Erro ao obter padrões frequentes:', error);
      return [];
    }
  }

  /**
   * Obtém resposta otimizada para uma pergunta (se houver padrão)
   */
  async getOptimizedAnswer(question: string): Promise<string | null> {
    try {
      const normalizedQuestion = this.normalizeQuestion(question.toLowerCase());
      const pattern = this.findSimilarPattern(normalizedQuestion);
      
      if (pattern && pattern.optimizedAnswer && pattern.frequency >= this.MIN_FREQUENCY) {
        return pattern.optimizedAnswer;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter resposta otimizada:', error);
      return null;
    }
  }

  /**
   * Normaliza pergunta para extrair padrão
   */
  private normalizeQuestion(question: string): string {
    // Remover pontuação
    let normalized = question.replace(/[^\w\s]/g, ' ');
    
    // Remover palavras comuns
    const stopWords = [
      'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'em', 'no', 'na',
      'para', 'com', 'por', 'que', 'qual', 'quais', 'onde', 'quando', 'como',
      'porque', 'quero', 'gostaria', 'poderia', 'pode', 'me', 'minha', 'meu'
    ];
    
    const words = normalized
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // Retornar palavras-chave principais (máximo 6)
    return words.slice(0, 6).join(' ');
  }

  /**
   * Encontra padrão similar
   */
  private findSimilarPattern(normalizedQuestion: string): DetectedPattern | null {
    const questionWords = normalizedQuestion.split(' ');
    
    for (const pattern of this.patterns.values()) {
      const patternWords = pattern.pattern.split(' ');
      
      // Calcular similaridade
      const similarity = this.calculateSimilarity(questionWords, patternWords);
      
      if (similarity >= this.SIMILARITY_THRESHOLD) {
        return pattern;
      }
    }
    
    return null;
  }

  /**
   * Calcula similaridade entre duas listas de palavras
   */
  private calculateSimilarity(words1: string[], words2: string[]): number {
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    if (totalWords === 0) return 0;
    
    return commonWords.length / totalWords;
  }

  /**
   * Otimiza resposta para padrão frequente
   */
  private optimizeAnswer(answer: string): string {
    // Por enquanto, retorna a resposta original
    // Pode ser melhorado para criar respostas mais concisas e diretas
    return answer;
  }

  /**
   * Gera ID único para padrão
   */
  private generatePatternId(normalizedQuestion: string): string {
    return `pattern-${normalizedQuestion.replace(/\s+/g, '-').substring(0, 50)}-${Date.now()}`;
  }

  /**
   * Obtém todos os padrões
   */
  getAllPatterns(): DetectedPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Limpa padrões antigos (não perguntados há mais de 60 dias)
   */
  cleanOldPatterns(): void {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    for (const [id, pattern] of this.patterns.entries()) {
      if (pattern.lastAsked < sixtyDaysAgo && pattern.frequency < this.MIN_FREQUENCY) {
        this.patterns.delete(id);
      }
    }
  }
}


