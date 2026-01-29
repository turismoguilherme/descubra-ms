/**
 * Goals AI Service
 * Serviço de IA para sugerir metas e objetivos de negócio turístico
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusinessGoal } from '../private/goalsTrackingService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface SuggestedGoal {
  title: string;
  description: string;
  category: BusinessGoal['category'];
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string; // ISO date string
  priority: BusinessGoal['priority'];
}

export class GoalsAIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Sugerir metas baseadas no tipo de negócio e categoria
   */
  async suggestGoals(
    businessType: string,
    category: string,
    currentData?: {
      revenue?: number;
      occupancy?: number;
      rating?: number;
    }
  ): Promise<SuggestedGoal[]> {
    // Retornar imediatamente as metas básicas para evitar travamento
    // A IA pode ser adicionada depois quando os modelos estiverem disponíveis
    return this.getBasicGoals(category);
    
    /* Código da IA comentado temporariamente até os modelos estarem disponíveis
    try {
      if (!this.genAI) {
        console.warn('Gemini API não configurada, retornando metas básicas');
        return this.getBasicGoals(category);
      }

      // O SDK do Google Generative AI usa v1beta por padrão
      // Modelos mais novos podem não estar disponíveis na v1beta
      // Vamos tentar gemini-pro que é mais compatível
      // Se falhar, o catch vai usar o fallback de metas básicas
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const currentDataStr = currentData
        ? `Dados atuais: Receita: ${currentData.revenue || 'N/A'}, Ocupação: ${currentData.occupancy || 'N/A'}%, Avaliação: ${currentData.rating || 'N/A'}/5`
        : 'Dados atuais não disponíveis';

      const prompt = `
Você é um consultor especializado em turismo brasileiro. Com base nas informações fornecidas, sugira 3-5 metas realistas e alcançáveis para o negócio.

Tipo de Negócio: ${businessType}
Categoria: ${category}
${currentDataStr}

Forneça uma resposta em JSON com um array de metas:
[
  {
    "title": "Título da meta (ex: Aumentar ocupação para 75%)",
    "description": "Descrição detalhada da meta e como alcançá-la",
    "category": "revenue|occupancy|rating|growth|marketing|operations",
    "targetValue": número da meta,
    "currentValue": valor atual (use dados fornecidos ou estimativa realista),
    "unit": "%|R$|dias|unidades",
    "deadline": "data em formato ISO (ex: 2025-12-31)",
    "priority": "low|medium|high"
  }
]

As metas devem ser:
- Realistas e alcançáveis
- Específicas e mensuráveis
- Com prazos de 3 a 12 meses
- Baseadas em benchmarks do setor turístico brasileiro
- Priorizadas de acordo com impacto no negócio

Seja específico e baseado em conhecimento real sobre turismo no Brasil.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((goal: any) => ({
          title: goal.title || '',
          description: goal.description || '',
          category: goal.category || 'growth',
          targetValue: goal.targetValue || 0,
          currentValue: goal.currentValue || 0,
          unit: goal.unit || '%',
          deadline: goal.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priority: goal.priority || 'medium',
        }));
      }

      return this.getBasicGoals(category);
    } catch (error: unknown) {
      const err = error as { message?: string };
      // Se o erro for de modelo não encontrado, usar fallback silenciosamente
      const isModelNotFound = 
        err?.message?.includes('not found') || 
        err?.message?.includes('404') ||
        err?.message?.includes('is not supported');
      
      if (isModelNotFound) {
        console.log('ℹ️ Modelo Gemini não disponível, usando metas básicas');
      } else {
        console.error('Erro ao sugerir metas com IA:', error);
      }
      
      // Sempre retornar metas básicas como fallback
      return this.getBasicGoals(category);
    }
    */
  }

  /**
   * Fallback básico sem IA
   * Método público para permitir acesso externo quando necessário
   */
  getBasicGoals(category: string): SuggestedGoal[] {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + 6);

    return [
      {
        title: 'Aumentar ocupação para 75%',
        description: 'Meta de ocupação média mensal baseada em benchmarks do setor',
        category: 'occupancy',
        targetValue: 75,
        currentValue: 60,
        unit: '%',
        deadline: baseDate.toISOString().split('T')[0],
        priority: 'high',
      },
      {
        title: 'Aumentar receita em 20%',
        description: 'Crescimento de receita através de melhorias operacionais e marketing',
        category: 'revenue',
        targetValue: 0,
        currentValue: 0,
        unit: 'R$',
        deadline: baseDate.toISOString().split('T')[0],
        priority: 'high',
      },
      {
        title: 'Melhorar avaliação média para 4.5',
        description: 'Foco em qualidade de serviço e experiência do cliente',
        category: 'rating',
        targetValue: 4.5,
        currentValue: 4.0,
        unit: '/5',
        deadline: baseDate.toISOString().split('T')[0],
        priority: 'medium',
      },
    ];
  }
}

export const goalsAIService = new GoalsAIService();

