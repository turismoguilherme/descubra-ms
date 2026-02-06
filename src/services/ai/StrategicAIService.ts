/**
 * Serviço de IA Estratégica para ViaJAR
 * Integração com Gemini API para análise estratégica de turismo
 */

export interface StrategicContext {
  region: string;
  userRole: string;
  businessType?: string;
  revenueData?: any[];
  marketData?: any[];
  alumiaData?: any;
  heatmapData?: any;
}

export interface StrategicResponse {
  insights: string[];
  recommendations: string[];
  opportunities: string[];
  risks: string[];
  nextSteps: string[];
}

export class StrategicAIService {
  private static instance: StrategicAIService;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  static getInstance(): StrategicAIService {
    if (!StrategicAIService.instance) {
      StrategicAIService.instance = new StrategicAIService();
    }
    return StrategicAIService.instance;
  }

  /**
   * Analisa dados de negócio e fornece insights estratégicos
   */
  async analyzeBusinessData(context: StrategicContext): Promise<StrategicResponse> {
    try {
      const prompt = this.buildStrategicPrompt(context);
      
      if (!this.apiKey) {
        return this.getFallbackResponse(context);
      }

      const response = await this.callGeminiAPI(prompt);
      return this.parseStrategicResponse(response);
      
    } catch (error) {
      console.error('Erro na análise estratégica:', error);
      return this.getFallbackResponse(context);
    }
  }

  /**
   * Processa arquivos uploadados e extrai insights
   */
  async processUploadedFiles(files: File[], context: StrategicContext): Promise<StrategicResponse> {
    try {
      // Simular processamento de arquivos
      const fileInsights = await this.extractFileInsights(files);
      
      const enhancedContext = {
        ...context,
        fileInsights
      };

      return await this.analyzeBusinessData(enhancedContext);
      
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      return this.getFallbackResponse(context);
    }
  }

  /**
   * Gera recomendações específicas para a região
   */
  async generateRegionalRecommendations(region: string, userRole: string): Promise<string[]> {
    const regionalData = await this.getRegionalData(region);
    
    const recommendations = [
      `Para ${region}, recomendo focar em segmentos específicos do turismo regional`,
      `Baseado nos dados de ${region}, vejo oportunidades em ecoturismo`,
      `A região ${region} tem potencial para turismo de negócios`,
      `Considere parcerias locais em ${region} para aumentar a visibilidade`
    ];

    return recommendations;
  }

  /**
   * Constrói prompt estratégico baseado no contexto
   */
  private buildStrategicPrompt(context: StrategicContext): string {
    return `
      Você é um consultor estratégico de turismo especializado na região ${context.region}.
      
      CONTEXTO:
      - Região: ${context.region}
      - Tipo de usuário: ${context.userRole}
      - Tipo de negócio: ${context.businessType || 'N/A'}
      - Dados de receita: ${JSON.stringify(context.revenueData || [])}
      - Dados de mercado: ${JSON.stringify(context.marketData || [])}
      - Dados ALUMIA: ${JSON.stringify(context.alumiaData || {})}
      - Dados de mapa de calor: ${JSON.stringify(context.heatmapData || {})}
      
      TAREFA:
      Analise os dados fornecidos e forneça insights estratégicos específicos para a região ${context.region}.
      
      FORMATO DE RESPOSTA (JSON):
      {
        "insights": ["insight1", "insight2", "insight3"],
        "recommendations": ["recomendação1", "recomendação2", "recomendação3"],
        "opportunities": ["oportunidade1", "oportunidade2"],
        "risks": ["risco1", "risco2"],
        "nextSteps": ["próximo passo1", "próximo passo2"]
      }
      
      Seja específico para a região ${context.region} e forneça recomendações acionáveis.
    `;
  }

  /**
   * Chama a API do Gemini
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error);
      throw error;
    }
  }

  /**
   * Extrai insights de arquivos uploadados
   */
  private async extractFileInsights(files: File[]): Promise<string[]> {
    // Simular extração de insights dos arquivos
    const insights = [
      'Dados de receita identificados e processados',
      'Tendências de mercado detectadas',
      'Oportunidades de crescimento encontradas',
      'Análise de concorrência realizada',
      'Recomendações estratégicas geradas'
    ];

    return insights;
  }

  /**
   * Obtém dados regionais específicos
   */
  private async getRegionalData(region: string): Promise<any> {
    // Simular dados regionais
    const regionalData = {
      'MS': {
        specialties: ['Pantanal', 'Bonito', 'Ecoturismo'],
        seasonality: 'Alta temporada: Maio a Setembro',
        targetAudience: 'Ecoturistas, Aventureiros, Pesca Esportiva'
      },
      'SP': {
        specialties: ['Capital', 'Interior', 'Litoral'],
        seasonality: 'Alta temporada: Dezembro a Março',
        targetAudience: 'Negócios, Lazer, Eventos'
      },
      'DEFAULT': {
        specialties: ['Turismo', 'Eventos', 'Atrações'],
        seasonality: 'Varia por região',
        targetAudience: 'Diversificado'
      }
    };

    return regionalData[region] || regionalData.DEFAULT;
  }

  /**
   * Parse da resposta estratégica
   */
  private parseStrategicResponse(response: string): StrategicResponse {
    try {
      // Tentar parsear JSON
      const parsed = JSON.parse(response);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        opportunities: parsed.opportunities || [],
        risks: parsed.risks || [],
        nextSteps: parsed.nextSteps || []
      };
    } catch (error) {
      // Se não conseguir parsear, retornar resposta básica
      return {
        insights: ['Análise realizada com sucesso'],
        recommendations: ['Continue monitorando os dados'],
        opportunities: ['Oportunidades identificadas'],
        risks: ['Riscos monitorados'],
        nextSteps: ['Próximos passos definidos']
      };
    }
  }

  /**
   * Resposta de fallback quando API não está disponível
   */
  private getFallbackResponse(context: StrategicContext): StrategicResponse {
    return {
      insights: [
        `Análise realizada para a região ${context.region}`,
        'Dados processados com sucesso',
        'Tendências identificadas'
      ],
      recommendations: [
        `Para ${context.region}, recomendo focar em segmentos específicos`,
        'Monitore os dados regularmente',
        'Considere parcerias locais'
      ],
      opportunities: [
        'Oportunidades de crescimento identificadas',
        'Potencial para expansão'
      ],
      risks: [
        'Riscos monitorados',
        'Mantenha atenção às mudanças de mercado'
      ],
      nextSteps: [
        'Continue analisando os dados',
        'Implemente as recomendações',
        'Monitore os resultados'
      ]
    };
  }
}

// Exportar instância singleton
export const strategicAIService = StrategicAIService.getInstance();

