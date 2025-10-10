/**
 * 🧠 GUATÁ GEMINI SERVICE - Integração com Gemini AI
 * Processa respostas inteligentes e empolgantes
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiQuery {
  question: string;
  context?: string;
  userLocation?: string;
  conversationHistory?: string[];
  searchResults?: any[];
}

export interface GeminiResponse {
  answer: string;
  confidence: number;
  processingTime: number;
  usedGemini: boolean;
  personality: string;
  emotionalState: string;
}

class GuataGeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private isConfigured: boolean = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.isConfigured = !!this.apiKey;
    
    if (this.isConfigured) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        console.log('🧠 Guatá Gemini Service: CONFIGURADO com biblioteca oficial');
      } catch (error) {
        console.error('❌ Erro ao inicializar Gemini:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('🧠 Guatá Gemini Service: NÃO CONFIGURADO - API Key ausente');
    }
  }

  async processQuestion(query: GeminiQuery): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    console.log('🧠 Gemini Service: Processando pergunta...');
    console.log('🔑 API Key configurada:', this.isConfigured);
    
    if (!this.isConfigured) {
      console.log('❌ Gemini não configurado, usando fallback');
      return this.generateFallbackResponse(query);
    }

    try {
      const prompt = this.buildPrompt(query);
      console.log('🧠 Prompt construído, chamando Gemini API...');
      
      const response = await this.callGeminiAPI(prompt);
      console.log('✅ Gemini respondeu com sucesso');
      
      return {
        answer: response,
        confidence: 0.9,
        processingTime: Date.now() - startTime,
        usedGemini: true,
        personality: 'Guatá',
        emotionalState: 'excited'
      };
    } catch (error) {
      console.error('❌ Erro no Gemini:', error);
      return this.generateFallbackResponse(query);
    }
  }

  private buildPrompt(query: GeminiQuery): string {
    const { question, context, userLocation, searchResults } = query;
    
    let prompt = `Você é o Guatá, uma capivara guia de turismo de Mato Grosso do Sul. 

DIRETRIZES DE RESPOSTA:
- Seja um guia de turismo empolgante e hospitaleiro
- Mostre paixão genuína por Mato Grosso do Sul
- Seja específico e detalhado sobre destinos, atrações e experiências
- Use linguagem clara e acessível, sem jargões técnicos
- Personalize cada resposta baseada na pergunta específica
- Seja empolgante e genuíno, como um guia apaixonado
- Forneça informações práticas e úteis
- Sugira experiências únicas e autênticas
- Use formatação mínima e limpa
- NUNCA mencione que "pesquisou" ou "encontrou" informações
- Responda como se já soubesse tudo sobre MS
- Use os dados da pesquisa web para enriquecer sua resposta com informações atuais
- Transforme os dados em uma resposta conversacional e natural
- Seja hospitaleiro e acolhedor, como um anfitrião orgulhoso

PERGUNTA: ${question}`;

    if (userLocation) {
      prompt += `\n\nLOCALIZAÇÃO DO USUÁRIO: ${userLocation}`;
    }

    if (context) {
      prompt += `\n\nCONTEXTO: ${context}`;
    }

    if (searchResults && searchResults.length > 0) {
      prompt += `\n\nINFORMAÇÕES ENCONTRADAS:\n`;
      searchResults.forEach((result, index) => {
        prompt += `${index + 1}. ${result.title}\n${result.snippet}\n\n`;
      });
    }

    prompt += `\n\nINSTRUÇÕES:
- Responda de forma empolgante mas natural
- Seja específico sobre destinos de MS
- Use informações encontradas se disponíveis
- Incentive a explorar mais
- Seja hospitaleiro e acolhedor
- Use emojis moderadamente
- Mantenha o tom de capivara guia de turismo

Responda em português brasileiro:`;

    return prompt;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini não configurado');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('❌ Erro na chamada do Gemini:', error);
      throw error;
    }
  }

  private generateFallbackResponse(query: GeminiQuery): GeminiResponse {
    const { question, searchResults } = query;
    const lowerQuestion = question.toLowerCase();
    
    let answer = "🦦 Que alegria te ver aqui! Eu sou o Guatá, sua capivara guia de Mato Grosso do Sul! 😊\n\n";
    
    // Se temos resultados de pesquisa, usar eles de forma inteligente
    if (searchResults && searchResults.length > 0) {
      console.log('🔄 Usando resultados de pesquisa no fallback');
      const firstResult = searchResults[0];
      answer += `${firstResult.snippet.substring(0, 200)}...\n\n`;
      answer += "Posso te dar mais detalhes específicos sobre o que você quer saber!";
    } else if (lowerQuestion.includes('bonito')) {
      answer += "Bonito é a capital do ecoturismo no Brasil! Com suas águas cristalinas, grutas e cachoeiras, é um destino único no mundo. Principais atrativos: Rio da Prata, Gruta do Lago Azul, Buraco das Araras e Aquário Natural. É uma experiência que vai te marcar para sempre! 🌊✨";
    } else if (lowerQuestion.includes('pantanal')) {
      answer += "O Pantanal é o maior santuário ecológico do mundo! Aqui você vai ver jacarés, capivaras, ariranhas e centenas de espécies de aves em seu habitat natural. A melhor época é de maio a outubro, quando as águas baixam e a vida selvagem fica mais visível. É uma experiência única! 🐊🦆";
    } else if (lowerQuestion.includes('campo grande')) {
      answer += "Campo Grande é nossa capital, a 'Cidade Morena'! 🏛️\n\nPrincipais atrações:\n• Bioparque Pantanal - Maior aquário de água doce do mundo\n• Parque das Nações Indígenas - Cultura e natureza juntas\n• Feira Central - Comida boa, artesanato, música\n• Parque Horto Florestal - Um pedacinho da Amazônia no coração da cidade\n• Orla Morena - Perfeita para ver o pôr do sol\n\nÉ uma cidade que combina urbanização com natureza de forma única! O que mais te interessa conhecer?";
    } else {
      answer += "Mato Grosso do Sul é um estado incrível com destinos únicos! Temos o Pantanal (maior área úmida do mundo), Bonito (águas cristalinas), Campo Grande (nossa capital), Corumbá (portal do Pantanal) e muito mais! O que você gostaria de descobrir? 🌟";
    }
    
    return {
      answer,
      confidence: 0.8,
      processingTime: 0,
      usedGemini: false,
      personality: 'Guatá',
      emotionalState: 'excited'
    };
  }
}

// Exportar instância única
export const guataGeminiService = new GuataGeminiService();
export type { GeminiQuery, GeminiResponse };
