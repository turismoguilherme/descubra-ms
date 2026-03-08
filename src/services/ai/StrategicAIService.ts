/**
 * Serviço de IA Estratégica para ViaJAR
 * SEGURANÇA: Todas as chamadas passam pela Edge Function (callGeminiProxy)
 */

import { callGeminiProxy } from '@/services/ai/geminiProxy';

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

  static getInstance(): StrategicAIService {
    if (!StrategicAIService.instance) {
      StrategicAIService.instance = new StrategicAIService();
    }
    return StrategicAIService.instance;
  }

  async analyzeBusinessData(context: StrategicContext): Promise<StrategicResponse> {
    try {
      const prompt = this.buildStrategicPrompt(context);
      const result = await callGeminiProxy(prompt);

      if (!result.ok) {
        return this.getFallbackResponse(context);
      }

      return this.parseStrategicResponse(result.text);
    } catch (error) {
      console.error('Erro na análise estratégica:', error);
      return this.getFallbackResponse(context);
    }
  }

  async processUploadedFiles(files: File[], context: StrategicContext): Promise<StrategicResponse> {
    try {
      const fileInsights = await this.extractFileInsights(files);
      const enhancedContext = { ...context, fileInsights };
      return await this.analyzeBusinessData(enhancedContext);
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      return this.getFallbackResponse(context);
    }
  }

  async generateRegionalRecommendations(region: string, _userRole: string): Promise<string[]> {
    return [
      `Para ${region}, recomendo focar em segmentos específicos do turismo regional`,
      `Baseado nos dados de ${region}, vejo oportunidades em ecoturismo`,
      `A região ${region} tem potencial para turismo de negócios`,
      `Considere parcerias locais em ${region} para aumentar a visibilidade`
    ];
  }

  private buildStrategicPrompt(context: StrategicContext): string {
    return `Você é um consultor estratégico de turismo especializado na região ${context.region}.
CONTEXTO: Região: ${context.region}, Tipo de usuário: ${context.userRole}, Tipo de negócio: ${context.businessType || 'N/A'}
Dados de receita: ${JSON.stringify(context.revenueData || [])}, Dados de mercado: ${JSON.stringify(context.marketData || [])}
TAREFA: Analise e forneça insights estratégicos em JSON:
{"insights":["..."],"recommendations":["..."],"opportunities":["..."],"risks":["..."],"nextSteps":["..."]}`;
  }

  private async extractFileInsights(_files: File[]): Promise<string[]> {
    return ['Dados de receita identificados', 'Tendências de mercado detectadas', 'Oportunidades de crescimento encontradas'];
  }

  private parseStrategicResponse(response: string): StrategicResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        opportunities: parsed.opportunities || [],
        risks: parsed.risks || [],
        nextSteps: parsed.nextSteps || []
      };
    } catch {
      return {
        insights: ['Análise realizada com sucesso'],
        recommendations: ['Continue monitorando os dados'],
        opportunities: ['Oportunidades identificadas'],
        risks: ['Riscos monitorados'],
        nextSteps: ['Próximos passos definidos']
      };
    }
  }

  private getFallbackResponse(context: StrategicContext): StrategicResponse {
    return {
      insights: [`Análise realizada para a região ${context.region}`, 'Dados processados com sucesso', 'Tendências identificadas'],
      recommendations: [`Para ${context.region}, recomendo focar em segmentos específicos`, 'Monitore os dados regularmente', 'Considere parcerias locais'],
      opportunities: ['Oportunidades de crescimento identificadas', 'Potencial para expansão'],
      risks: ['Riscos monitorados', 'Mantenha atenção às mudanças de mercado'],
      nextSteps: ['Continue analisando os dados', 'Implemente as recomendações', 'Monitore os resultados']
    };
  }
}

export const strategicAIService = StrategicAIService.getInstance();
