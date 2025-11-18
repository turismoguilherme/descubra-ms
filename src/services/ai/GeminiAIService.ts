/**
 * Serviço de IA com Google Gemini API
 * Processa diagnósticos e gera recomendações
 */

export interface DiagnosticAnswers {
  business_type: string;
  experience_years: string;
  revenue_monthly: string;
  occupancy_rate: string;
  marketing_channels: string[];
  digital_presence: string;
  customer_service: string;
  main_challenges: string[];
  technology_usage: string[];
  sustainability: string;
}

export interface DiagnosticResult {
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  action_plan: string[];
  estimated_roi: number;
  analysis: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiAIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  private async makeRequest(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async analyzeDiagnostic(answers: DiagnosticAnswers): Promise<DiagnosticResult> {
    try {
      const prompt = this.buildDiagnosticPrompt(answers);
      
      const data = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      const response = await this.makeRequest('/models/gemini-1.5-flash:generateContent', data);
      
      if (!response.candidates || !response.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      const analysis = response.candidates[0].content.parts[0].text;
      return this.parseDiagnosticResponse(analysis, answers);
    } catch (error) {
      console.error('Error analyzing diagnostic:', error);
      // Fallback para análise simulada
      return this.generateFallbackAnalysis(answers);
    }
  }

  async generateChatResponse(message: string, context: string = ''): Promise<string> {
    try {
      const prompt = this.buildChatPrompt(message, context);
      
      const data = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await this.makeRequest('/models/gemini-1.5-flash:generateContent', data);
      
      if (!response.candidates || !response.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error generating chat response:', error);
      return this.generateFallbackChatResponse(message);
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `Traduza o seguinte texto para ${targetLanguage}: "${text}"`;
      
      const data = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      };

      const response = await this.makeRequest('/models/gemini-1.5-flash:generateContent', data);
      
      if (!response.candidates || !response.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from Gemini API');
      }

      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // Retorna o texto original em caso de erro
    }
  }

  private buildDiagnosticPrompt(answers: DiagnosticAnswers): string {
    return `
Analise o seguinte diagnóstico de negócio de turismo e forneça uma análise detalhada:

Tipo de Negócio: ${answers.business_type}
Experiência no Ramo: ${answers.experience_years}
Receita Mensal: ${answers.revenue_monthly}
Taxa de Ocupação: ${answers.occupancy_rate}
Canais de Marketing: ${answers.marketing_channels.join(', ')}
Presença Digital: ${answers.digital_presence}/5
Atendimento ao Cliente: ${answers.customer_service}/5
Principais Desafios: ${answers.main_challenges.join(', ')}
Tecnologias Utilizadas: ${answers.technology_usage.join(', ')}
Práticas de Sustentabilidade: ${answers.sustainability}

Forneça uma análise estruturada em JSON com:
1. score: pontuação de 0-100
2. recommendations: array de 4-6 recomendações específicas
3. strengths: array de 3-4 pontos fortes
4. weaknesses: array de 3-4 pontos de melhoria
5. action_plan: array de 4-6 ações práticas com prazos
6. estimated_roi: percentual estimado de aumento na receita
7. analysis: análise detalhada em texto

Responda APENAS com o JSON válido, sem texto adicional.
    `.trim();
  }

  private buildChatPrompt(message: string, context: string): string {
    return `
Você é um assistente de IA especializado em turismo para Centros de Atendimento ao Turista (CATs).
Contexto: ${context}
Pergunta do turista: ${message}

Forneça uma resposta útil, amigável e informativa sobre turismo, atrativos, hospedagem, gastronomia, transporte e eventos.
Seja conciso mas completo, e sempre ofereça informações práticas e úteis.
    `.trim();
  }

  private parseDiagnosticResponse(response: string, answers: DiagnosticAnswers): DiagnosticResult {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.score || 75,
          recommendations: parsed.recommendations || [],
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          action_plan: parsed.action_plan || [],
          estimated_roi: parsed.estimated_roi || 25,
          analysis: parsed.analysis || 'Análise gerada com sucesso.'
        };
      }
    } catch (error) {
      console.error('Error parsing diagnostic response:', error);
    }

    // Fallback se não conseguir parsear
    return this.generateFallbackAnalysis(answers);
  }

  private generateFallbackAnalysis(answers: DiagnosticAnswers): DiagnosticResult {
    const score = this.calculateScore(answers);
    
    return {
      score,
      recommendations: [
        'Implementar sistema de reservas online',
        'Melhorar presença nas redes sociais',
        'Criar programa de fidelidade',
        'Otimizar preços baseado na demanda'
      ],
      strengths: [
        'Experiência no ramo',
        'Localização privilegiada',
        'Qualidade do atendimento'
      ],
      weaknesses: [
        'Presença digital limitada',
        'Falta de sistema de reservas',
        'Marketing passivo'
      ],
      action_plan: [
        'Criar site responsivo (30 dias)',
        'Implementar sistema de reservas (45 dias)',
        'Lançar campanhas digitais (15 dias)',
        'Treinar equipe em vendas (60 dias)'
      ],
      estimated_roi: 35,
      analysis: 'Análise baseada nas respostas fornecidas. Recomenda-se focar na digitalização e marketing ativo.'
    };
  }

  private calculateScore(answers: DiagnosticAnswers): number {
    let score = 50; // Base score

    // Ajustar baseado nas respostas
    if (answers.digital_presence >= '4') score += 15;
    if (answers.customer_service >= '4') score += 15;
    if (answers.marketing_channels.length >= 3) score += 10;
    if (answers.technology_usage.length >= 3) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private generateFallbackChatResponse(message: string): string {
    const responses = [
      'Entendi sua pergunta. Posso ajudá-lo com informações sobre atrativos turísticos, hospedagem, gastronomia ou transporte.',
      'Como posso ajudá-lo com informações turísticas? Posso fornecer detalhes sobre pontos turísticos, restaurantes, hotéis e eventos.',
      'Estou aqui para ajudá-lo! Posso fornecer informações sobre a região, atrativos, serviços e muito mais.',
      'Ótima pergunta! Posso orientá-lo sobre os melhores atrativos, restaurantes, hospedagem e atividades na região.'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const geminiAIService = new GeminiAIService();
