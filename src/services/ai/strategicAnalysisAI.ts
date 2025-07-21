import { geminiClient } from '@/config/gemini';

interface AnalysisData {
  visitorData?: any;
  alumiaData?: any;
  communityData?: any;
  economicData?: any;
}

export class StrategicAnalysisAI {
  async analyzeData(data: AnalysisData) {
    try {
      // Preparar o prompt com os dados disponíveis
      const prompt = this.preparePrompt(data);
      
      // Gerar análise usando Gemini
      const analysis = await this.generateAnalysis(prompt);
      
      // Gerar recomendações práticas
      const recommendations = await this.generateRecommendations(analysis); // Passar a análise gerada

      return {
        analysis,
        recommendations,
        timestamp: new Date(),
        dataSource: {
          hasAlumia: !!data.alumiaData,
          hasCommunity: !!data.communityData,
          hasEconomic: !!data.economicData
        }
      };
    } catch (error) {
      console.error('Erro na análise estratégica:', error);
      throw error;
    }
  }

  private preparePrompt(data: AnalysisData): string {
    let dataString = '';

    if (data.visitorData) {
      dataString += `\nDados de Visitantes:\n${JSON.stringify(data.visitorData, null, 2)}\n`;
    }
    if (data.alumiaData) {
      dataString += `\nDados Alumia (ex: Tendências de Mercado, Perfil Turístico, etc.):\n${JSON.stringify(data.alumiaData, null, 2)}\n`;
    }
    if (data.communityData) {
      dataString += `\nDados da Comunidade (ex: Feedback, Engajamento, etc.):\n${JSON.stringify(data.communityData, null, 2)}\n`;
    }
    if (data.economicData) {
      dataString += `\nDados Econômicos (ex: Gastos, Empregos, Investimentos):\n${JSON.stringify(data.economicData, null, 2)}\n`;
    }

    return `
      Analise os seguintes dados turísticos de Campo Grande, MS, considerando seu papel como cidade-sede da Rota Bioceânica:
      
      ${dataString || 'Nenhum dado dinâmico fornecido.'}

      Contexto específico:
      1. Campo Grande é vista como cidade de passagem
      2. É a capital da Rota Bioceânica
      3. Tem potencial turístico subaproveitado
      4. Precisa aumentar tempo de permanência dos visitantes
      
      Foque em:
      1. Como transformar "cidade de passagem" em "destino turístico"
      2. Oportunidades relacionadas à Rota Bioceânica
      3. Integração com roteiros regionais
      4. Engajamento da comunidade local
      5. Desenvolvimento de produtos turísticos únicos
      
      Considere atrativos locais como:
      - Parque das Nações Indígenas
      - Centro Histórico
      - Gastronomia local
      - Eventos culturais
      - Turismo de negócios
      
      Formato:
      - Insights principais (3-5 pontos)
      - Oportunidades identificadas
      - Desafios a serem endereçados
      - Recomendações práticas
    `;
  }

  private async generateAnalysis(prompt: string) {
    const response = await geminiClient.generateContent(prompt, {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    });

    return response;
  }

  private async generateRecommendations(analysis: string) {
    const recommendationPrompt = `
      Com base na análise anterior, que é:
      """${analysis}"""

      Sugira ações práticas para Campo Grande, considerando:
      
      Contexto:
      - Cidade-sede da Rota Bioceânica
      - Principal hub logístico da região
      - Centro de eventos e negócios
      - Rica gastronomia e cultura
      
      Sugira:
      1. Ações Imediatas (próximos 30 dias)
         - Foco em quick wins
         - Aproveitamento de estrutura existente
         - Engajamento rápido da comunidade
      
      2. Ações de Médio Prazo (2-6 meses)
         - Desenvolvimento de produtos turísticos
         - Capacitação do trade
         - Melhorias de infraestrutura
      
      3. Ações de Longo Prazo (6-12 meses)
         - Projetos estruturantes
         - Integração regional
         - Posicionamento estratégico
      
      Para cada ação, inclua:
      - Descrição clara e objetiva
      - Recursos necessários
      - Impacto esperado
      - Métricas de sucesso
      - Envolvimento da comunidade
    `;

    const response = await geminiClient.generateContent(recommendationPrompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    return response;
  }
} 