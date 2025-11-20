/**
 * Adaptive Diagnostic Service
 * Serviço inteligente para diagnóstico adaptativo que identifica quando precisa de mais informações
 */

import { QuestionnaireAnswers } from '@/types/diagnostic';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AdaptiveQuestion {
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'slider' | 'text';
  options?: { value: string; label: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  labels?: string[];
  reason: string; // Por que esta pergunta está sendo feita
  priority: 'high' | 'medium' | 'low';
}

export interface AnswerQuality {
  isComplete: boolean;
  confidence: number; // 0-1
  needsClarification: boolean;
  missingInfo: string[];
  ambiguousAnswers: string[];
  suggestedFollowUps: AdaptiveQuestion[];
}

export class AdaptiveDiagnosticService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Analisa qualidade das respostas e identifica se precisa de mais informações
   */
  async analyzeAnswerQuality(
    currentAnswers: Partial<QuestionnaireAnswers>,
    questionId: string,
    answer: any
  ): Promise<AnswerQuality> {
    try {
      if (!this.genAI) {
        // Fallback: análise básica sem IA
        return this.basicQualityAnalysis(currentAnswers, questionId, answer);
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = this.buildQualityAnalysisPrompt(currentAnswers, questionId, answer);
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.parseQualityResponse(response, currentAnswers);
    } catch (error) {
      console.error('Erro ao analisar qualidade da resposta:', error);
      return this.basicQualityAnalysis(currentAnswers, questionId, answer);
    }
  }

  /**
   * Identifica perguntas de follow-up necessárias baseado nas respostas
   */
  async identifyFollowUpQuestions(
    answers: Partial<QuestionnaireAnswers>
  ): Promise<AdaptiveQuestion[]> {
    const followUps: AdaptiveQuestion[] = [];

    // Análise baseada em regras + IA
    const analysis = await this.analyzeAnswersForGaps(answers);

    // Se resposta for vaga ou ambígua
    if (analysis.needsClarification) {
      followUps.push(...this.generateClarificationQuestions(analysis));
    }

    // Se faltar informação crítica
    if (analysis.missingInfo.length > 0) {
      followUps.push(...this.generateMissingInfoQuestions(analysis));
    }

    // Perguntas específicas baseadas no tipo de negócio
    if (answers.business_type) {
      followUps.push(...this.generateBusinessTypeSpecificQuestions(answers));
    }

    return followUps;
  }

  /**
   * Analisa respostas para identificar gaps
   */
  private async analyzeAnswersForGaps(
    answers: Partial<QuestionnaireAnswers>
  ): Promise<{
    needsClarification: boolean;
    missingInfo: string[];
    ambiguousAnswers: string[];
    confidence: number;
  }> {
    const missingInfo: string[] = [];
    const ambiguousAnswers: string[] = [];
    let confidence = 1.0;

    // Verificar respostas vagas
    if (answers.digital_presence === '1' || answers.digital_presence === '2') {
      ambiguousAnswers.push('digital_presence');
      confidence -= 0.1;
    }

    if (answers.customer_service === '1' || answers.customer_service === '2') {
      ambiguousAnswers.push('customer_service');
      confidence -= 0.1;
    }

    // Verificar se selecionou "outros" sem especificar
    if (answers.marketing_channels?.includes('outros') && !answers.marketing_channels_other) {
      missingInfo.push('marketing_channels_other');
      confidence -= 0.15;
    }

    // Verificar se tem muitos desafios mas não especificou prioridades
    if (answers.main_challenges && answers.main_challenges.length > 3) {
      missingInfo.push('challenge_priorities');
      confidence -= 0.1;
    }

    // Verificar se não usa tecnologia mas não explicou por quê
    if (answers.technology_usage?.includes('nenhuma')) {
      missingInfo.push('technology_barriers');
      confidence -= 0.1;
    }

    // Verificar receita vs ocupação (inconsistência)
    if (answers.revenue_monthly && answers.occupancy_rate) {
      const revenue = this.parseRevenueRange(answers.revenue_monthly);
      const occupancy = this.parseOccupancyRange(answers.occupancy_rate);
      
      // Se receita alta mas ocupação baixa, precisa esclarecer
      if (revenue > 50000 && occupancy < 50) {
        ambiguousAnswers.push('revenue_occupancy_mismatch');
        confidence -= 0.2;
      }
    }

    return {
      needsClarification: ambiguousAnswers.length > 0 || missingInfo.length > 0,
      missingInfo,
      ambiguousAnswers,
      confidence: Math.max(0, confidence)
    };
  }

  /**
   * Gera perguntas de esclarecimento
   */
  private generateClarificationQuestions(analysis: any): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (analysis.ambiguousAnswers.includes('digital_presence')) {
      questions.push({
        id: 'digital_presence_details',
        question: 'Você mencionou que sua presença digital é baixa. Quais são os principais obstáculos?',
        type: 'checkbox',
        options: [
          { value: 'sem_site', label: 'Não tenho site' },
          { value: 'site_desatualizado', label: 'Site desatualizado' },
          { value: 'sem_redes_sociais', label: 'Não uso redes sociais' },
          { value: 'sem_conhecimento', label: 'Falta de conhecimento técnico' },
          { value: 'sem_orcamento', label: 'Falta de orçamento' },
          { value: 'sem_tempo', label: 'Falta de tempo' }
        ],
        reason: 'Entender barreiras para melhorar presença digital',
        priority: 'high'
      });
    }

    if (analysis.ambiguousAnswers.includes('customer_service')) {
      questions.push({
        id: 'customer_service_details',
        question: 'Você mencionou que seu atendimento precisa melhorar. Em quais aspectos?',
        type: 'checkbox',
        options: [
          { value: 'tempo_resposta', label: 'Tempo de resposta' },
          { value: 'qualidade_atendimento', label: 'Qualidade do atendimento' },
          { value: 'disponibilidade', label: 'Disponibilidade 24/7' },
          { value: 'multilinguagem', label: 'Atendimento multilíngue' },
          { value: 'treinamento_equipe', label: 'Treinamento da equipe' },
          { value: 'ferramentas', label: 'Ferramentas de atendimento' }
        ],
        reason: 'Identificar áreas específicas de melhoria no atendimento',
        priority: 'high'
      });
    }

    if (analysis.ambiguousAnswers.includes('revenue_occupancy_mismatch')) {
      questions.push({
        id: 'revenue_occupancy_clarification',
        question: 'Notamos que sua receita é alta mas a ocupação é baixa. Isso significa que:',
        type: 'radio',
        options: [
          { value: 'precos_altos', label: 'Meus preços são altos (alto ticket médio)' },
          { value: 'sazonalidade', label: 'Tenho alta sazonalidade (poucos meses com alta ocupação)' },
          { value: 'eventos', label: 'Recebo muitos eventos/grupos (ocupação baixa mas receita alta)' },
          { value: 'servicos_premium', label: 'Ofereço serviços premium (menos clientes, mais receita)' }
        ],
        reason: 'Entender modelo de negócio para recomendações precisas',
        priority: 'high'
      });
    }

    return questions;
  }

  /**
   * Gera perguntas para informações faltantes
   */
  private generateMissingInfoQuestions(analysis: any): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (analysis.missingInfo.includes('marketing_channels_other')) {
      questions.push({
        id: 'marketing_channels_other',
        question: 'Você selecionou "Outros" canais de marketing. Quais são?',
        type: 'text',
        reason: 'Completar informações sobre canais de marketing',
        priority: 'medium'
      });
    }

    if (analysis.missingInfo.includes('challenge_priorities')) {
      questions.push({
        id: 'challenge_priorities',
        question: 'Dos desafios que você mencionou, qual é o mais crítico no momento?',
        type: 'radio',
        options: analysis.missingInfo.map((challenge: string) => ({
          value: challenge,
          label: this.formatChallengeLabel(challenge)
        })),
        reason: 'Priorizar recomendações baseadas no desafio mais crítico',
        priority: 'high'
      });
    }

    if (analysis.missingInfo.includes('technology_barriers')) {
      questions.push({
        id: 'technology_barriers',
        question: 'Por que você não utiliza tecnologia no seu negócio?',
        type: 'checkbox',
        options: [
          { value: 'custo', label: 'Custo elevado' },
          { value: 'complexidade', label: 'Muito complexo' },
          { value: 'nao_vejo_necessidade', label: 'Não vejo necessidade' },
          { value: 'falta_conhecimento', label: 'Falta de conhecimento' },
          { value: 'resistencia_mudanca', label: 'Resistência à mudança' },
          { value: 'nao_encontrei_solucao', label: 'Não encontrei solução adequada' }
        ],
        reason: 'Entender barreiras para implementar tecnologia',
        priority: 'medium'
      });
    }

    return questions;
  }

  /**
   * Gera perguntas específicas por tipo de negócio
   */
  private generateBusinessTypeSpecificQuestions(
    answers: Partial<QuestionnaireAnswers>
  ): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (answers.business_type === 'hospedagem') {
      // Se não especificou capacidade
      if (!answers.capacity) {
        questions.push({
          id: 'capacity',
          question: 'Quantos quartos/camas você tem?',
          type: 'text',
          reason: 'Informação essencial para hotéis/pousadas',
          priority: 'high'
        });
      }

      // Se ocupação baixa
      if (answers.occupancy_rate && this.parseOccupancyRange(answers.occupancy_rate) < 50) {
        questions.push({
          id: 'low_occupancy_reasons',
          question: 'Quais são as principais razões para a baixa ocupação?',
          type: 'checkbox',
          options: [
            { value: 'localizacao', label: 'Localização' },
            { value: 'precos', label: 'Preços não competitivos' },
            { value: 'marketing', label: 'Falta de marketing' },
            { value: 'qualidade', label: 'Qualidade do serviço' },
            { value: 'sazonalidade', label: 'Sazonalidade forte' },
            { value: 'concorrencia', label: 'Muita concorrência' }
          ],
          reason: 'Identificar causas da baixa ocupação para recomendações específicas',
          priority: 'high'
        });
      }
    }

    if (answers.business_type === 'gastronomia') {
      // Se não especificou capacidade
      if (!answers.capacity) {
        questions.push({
          id: 'capacity',
          question: 'Quantas mesas/lugares você tem?',
          type: 'text',
          reason: 'Informação essencial para restaurantes',
          priority: 'high'
        });
      }
    }

    if (answers.business_type === 'servicos') {
      // Se não especificou tipo de serviço
      if (!answers.service_type) {
        questions.push({
          id: 'service_type',
          question: 'Que tipo de serviço você oferece?',
          type: 'radio',
          options: [
            { value: 'agencia_viagem', label: 'Agência de Viagem' },
            { value: 'guia_turistico', label: 'Guia Turístico' },
            { value: 'transporte', label: 'Transporte' },
            { value: 'outros', label: 'Outros' }
          ],
          reason: 'Personalizar recomendações para tipo específico de serviço',
          priority: 'high'
        });
      }
    }

    return questions;
  }

  /**
   * Prompt para análise de qualidade com IA
   */
  private buildQualityAnalysisPrompt(
    currentAnswers: Partial<QuestionnaireAnswers>,
    questionId: string,
    answer: any
  ): string {
    return `
Analise a qualidade desta resposta em um questionário de diagnóstico de negócio turístico:

Pergunta: ${questionId}
Resposta: ${JSON.stringify(answer)}

Contexto das respostas anteriores:
${JSON.stringify(currentAnswers, null, 2)}

Avalie:
1. A resposta é completa e clara?
2. Há ambiguidade ou falta de detalhes?
3. A resposta é consistente com as respostas anteriores?
4. Há informações críticas faltando?

Responda em JSON:
{
  "isComplete": boolean,
  "confidence": number (0-1),
  "needsClarification": boolean,
  "missingInfo": string[],
  "ambiguousAnswers": string[],
  "suggestedFollowUps": [
    {
      "id": string,
      "question": string,
      "type": "radio" | "checkbox" | "text",
      "reason": string,
      "priority": "high" | "medium" | "low"
    }
  ]
}
`;
  }

  /**
   * Parse da resposta da IA
   */
  private parseQualityResponse(
    response: string,
    currentAnswers: Partial<QuestionnaireAnswers>
  ): AnswerQuality {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isComplete: parsed.isComplete || false,
          confidence: parsed.confidence || 0.5,
          needsClarification: parsed.needsClarification || false,
          missingInfo: parsed.missingInfo || [],
          ambiguousAnswers: parsed.ambiguousAnswers || [],
          suggestedFollowUps: parsed.suggestedFollowUps || []
        };
      }
    } catch (error) {
      console.error('Erro ao parsear resposta da IA:', error);
    }

    // Fallback
    return this.basicQualityAnalysis(currentAnswers, '', null);
  }

  /**
   * Análise básica sem IA (fallback)
   */
  private basicQualityAnalysis(
    currentAnswers: Partial<QuestionnaireAnswers>,
    questionId: string,
    answer: any
  ): AnswerQuality {
    const missingInfo: string[] = [];
    const ambiguousAnswers: string[] = [];
    let confidence = 0.8;

    // Verificar se resposta está vazia
    if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
      confidence = 0.3;
      missingInfo.push(questionId);
    }

    // Verificar respostas vagas
    if (typeof answer === 'string' && (answer === 'nao_sei' || answer === 'outros')) {
      confidence = 0.5;
      ambiguousAnswers.push(questionId);
    }

    return {
      isComplete: confidence > 0.7,
      confidence,
      needsClarification: ambiguousAnswers.length > 0 || missingInfo.length > 0,
      missingInfo,
      ambiguousAnswers,
      suggestedFollowUps: []
    };
  }

  // Helpers
  private parseRevenueRange(value: string): number {
    const ranges: Record<string, number> = {
      'ate_5k': 2500,
      '5k_15k': 10000,
      '15k_50k': 32500,
      '50k_100k': 75000,
      'acima_100k': 150000
    };
    return ranges[value] || 0;
  }

  private parseOccupancyRange(value: string): number {
    const ranges: Record<string, number> = {
      'ate_30': 15,
      '30_50': 40,
      '50_70': 60,
      '70_90': 80,
      'acima_90': 95
    };
    return ranges[value] || 0;
  }

  private formatChallengeLabel(challenge: string): string {
    const labels: Record<string, string> = {
      'baixa_ocupacao': 'Baixa Ocupação',
      'precos': 'Preços',
      'marketing': 'Marketing',
      'qualidade': 'Qualidade',
      'concorrencia': 'Concorrência',
      'sazonalidade': 'Sazonalidade',
      'tecnologia': 'Tecnologia',
      'recursos': 'Recursos'
    };
    return labels[challenge] || challenge;
  }
}

export const adaptiveDiagnosticService = new AdaptiveDiagnosticService();



