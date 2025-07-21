import { geminiClient } from '@/config/gemini';

export class StrategicAdvisorService {
  async analyzeAndAdvise(data: any) {
    try {
      // Análise dos dados
      const insights = await this.generateInsights(data);
      
      // Geração de recomendações práticas
      const recommendations = await this.generateRecommendations(insights);
      
      // Criação de plano de ação
      const actionPlan = await this.createActionPlan(recommendations);

      return {
        insights: {
          title: "Entendendo os Dados",
          summary: "Explicação clara do que os números significam",
          keyPoints: insights.mainPoints || "Não especificado",
          opportunities: insights.opportunities || "Não especificado",
          challenges: insights.challenges || "Não especificado"
        },
        recommendations: {
          title: "O Que Pode Ser Feito",
          immediate: recommendations.shortTerm || "Não especificado",
          mediumTerm: recommendations.mediumTerm || "Não especificado",
          longTerm: recommendations.longTerm || "Não especificado",
          priority: recommendations.priorityActions || "Não especificado"
        },
        actionPlan: {
          title: "Como Fazer",
          steps: actionPlan.steps || "Não especificado",
          timeline: actionPlan.timeline || "Não especificado",
          resources: actionPlan.requiredResources || "Não especificado",
          expectedResults: actionPlan.projectedOutcomes || "Não especificado"
        }
      };
    } catch (error) {
      console.error('Erro ao gerar análise estratégica:', error);
      throw error;
    }
  }

  private async generateInsights(data: any) {
    // Usa IA para interpretar dados e gerar insights em linguagem clara
    const dataString = JSON.stringify(data, null, 2);
    const prompt = `
      Analise os seguintes dados turísticos e explique de forma clara:
      Dados: """${dataString}"""
      - O que estes números significam na prática?
      - Quais são as principais oportunidades?
      - Quais são os desafios mais importantes?
      - Como isso afeta o desenvolvimento do turismo?
      
      Formato esperado (JSON ou texto estruturado):
      {
        "mainPoints": [],
        "opportunities": [],
        "challenges": []
      }
    `;

    const response = await geminiClient.generateContent(prompt);
    // Tentar parsear JSON, ou retornar texto bruto se falhar
    try {
      return JSON.parse(response);
    } catch (e) {
      return { mainPoints: [response], opportunities: [], challenges: [] };
    }
  }

  private async generateRecommendations(insights: any) {
    // Gera recomendações práticas baseadas nos insights
    const insightsString = JSON.stringify(insights, null, 2);
    const prompt = `
      Com base nos seguintes insights:
      Insights: """${insightsString}"""

      Sugira ações práticas:
      - O que pode ser feito imediatamente (curto prazo)?
      - Quais ações devem ser planejadas para médio prazo?
      - Quais são as iniciativas estratégicas de longo prazo?
      - Quais ações devem ser priorizadas?
      
      Formato esperado (JSON ou texto estruturado):
      {
        "shortTerm": [],
        "mediumTerm": [],
        "longTerm": [],
        "priorityActions": []
      }
    `;

    const response = await geminiClient.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      return { shortTerm: [response], mediumTerm: [], longTerm: [], priorityActions: [] };
    }
  }

  private async createActionPlan(recommendations: any) {
    // Cria um plano de ação detalhado
    const recommendationsString = JSON.stringify(recommendations, null, 2);
    const prompt = `
      Desenvolva um plano de ação detalhado com base nas seguintes recomendações:
      Recomendações: """${recommendationsString}"""

      Para o plano de ação, inclua:
      - Quais são os passos específicos?
      - Qual é a linha do tempo realista?
      - Quais recursos são necessários?
      - Quais resultados podem ser esperados?
      
      Formato esperado (JSON ou texto estruturado):
      {
        "steps": [],
        "timeline": "",
        "requiredResources": [],
        "projectedOutcomes": []
      }
    `;

    const response = await geminiClient.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      return { steps: [response], timeline: "", requiredResources: [], projectedOutcomes: [] };
    }
  }
} 