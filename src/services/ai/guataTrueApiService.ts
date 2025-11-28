/**
 * 🦦 GUATÁ TRUE API SERVICE - Usando Supabase Edge Functions (Gemini + Google Search)
 * NÃO inventa parceiros - só sugere quando existem na plataforma
 */

import { supabase } from "@/integrations/supabase/client";

export interface TrueApiQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
  isTotemVersion?: boolean; // true = /chatguata (pode usar "Olá"), false = /guata (não usa "Olá" após primeira mensagem)
}

export interface TrueApiResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
  personality: string;
  emotionalState: string;
  followUpQuestions: string[];
  usedWebSearch: boolean;
  knowledgeSource: 'local' | 'web' | 'hybrid';
  partnerSuggestion?: string;
  partnersFound: any[];
  partnerPriority: number;
}

class GuataTrueApiService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS", "curioso", "amigável"],
    speakingStyle: "conversacional, natural e envolvente",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso", "curioso", "empolgado"]
  };

  async processQuestion(query: TrueApiQuery): Promise<TrueApiResponse> {
    const startTime = Date.now();
    // Garantir que question seja sempre uma string
    const question = String(query.question || '').trim();
    console.log('🦦 Guatá True API: Processando pergunta...');
    console.log('📝 Query:', question);
    
    try {
      // NOVO: Usar o sistema inteligente de turismo
      const { guataIntelligentTourismService } = await import('./guataIntelligentTourismService');
      
      console.log('🚀 Usando Guatá Intelligent Tourism Service...');
      
      const intelligentResponse = await guataIntelligentTourismService.processQuestion({
        question: question,
        userId: query.userId,
        sessionId: query.sessionId,
        userLocation: query.userLocation,
        conversationHistory: query.conversationHistory,
        userPreferences: query.userPreferences,
        isTotemVersion: query.isTotemVersion ?? true // Passar flag para controlar uso de "Olá"
      });
      
      console.log('✅ Guatá Intelligent Tourism: Resposta gerada em', intelligentResponse.processingTime, 'ms');
      console.log('📊 Fontes utilizadas:', intelligentResponse.sources);
      console.log('🌐 Usou web search:', intelligentResponse.usedRealSearch);
      console.log('🔍 Método de busca:', intelligentResponse.searchMethod);
      console.log('🏨 Dados de turismo:', Object.keys(intelligentResponse.tourismData).length, 'categorias');
      
      // Converter resposta para formato compatível
      return {
        answer: intelligentResponse.answer,
        confidence: intelligentResponse.confidence,
        sources: intelligentResponse.sources,
        processingTime: intelligentResponse.processingTime,
        learningInsights: intelligentResponse.learningInsights,
        adaptiveImprovements: intelligentResponse.adaptiveImprovements,
        memoryUpdates: intelligentResponse.memoryUpdates,
        personality: intelligentResponse.personality,
        emotionalState: intelligentResponse.emotionalState,
        followUpQuestions: intelligentResponse.followUpQuestions,
        usedWebSearch: intelligentResponse.usedRealSearch,
        knowledgeSource: intelligentResponse.usedRealSearch ? 'web' : 'local',
        partnerSuggestion: undefined,
        partnersFound: [],
        partnerPriority: 0
      };

    } catch (error) {
      console.error('❌ Erro no Guatá True API:', error);
      
      // Fallback para sistema local
      console.log('🔄 Usando fallback local...');
      const lowerQuestion = question.toLowerCase();
      
      return {
        answer: this.generateIntelligentLocalResponse(question),
        confidence: 0.7,
        sources: ['conhecimento_local'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: this.detectQuestionType(question),
          userIntent: 'information_seeking',
          behaviorPattern: 'explorer',
          conversationFlow: 'natural',
          predictiveAccuracy: 0.7,
          proactiveSuggestions: 0
        },
        adaptiveImprovements: ['Sistema com APIs reais', 'Busca web verdadeira', 'Parceiros reais apenas'],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: 'helpful',
        followUpQuestions: this.getFollowUpQuestions(question),
        usedWebSearch: false,
        knowledgeSource: 'local',
        partnerSuggestion: undefined,
        partnersFound: [],
        partnerPriority: 0
      };
    }
  }

  private generateIntelligentLocalResponse(questionStr: string): string {
    const question = String(questionStr || '').trim();
    const lowerQuestion = question.toLowerCase();
    
    // Apresentação
    if (lowerQuestion.includes('oi') || lowerQuestion.includes('olá') || lowerQuestion.includes('quem é') || lowerQuestion.includes('você é')) {
      return `Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! 🦦 Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Posso te contar sobre destinos incríveis como Bonito, o Pantanal, Campo Grande e muito mais. O que você gostaria de saber?`;
    }
    
    // Bonito
    if (lowerQuestion.includes('bonito')) {
      return `Bonito é mundialmente reconhecida como a Capital do Ecoturismo! 🌊 É um lugar mágico com águas cristalinas que parecem de outro mundo. As principais atrações são o Rio Sucuri, Gruta do Lago Azul, Gruta da Anhumas, Buraco das Araras e Rio da Prata. Cada lugar tem sua própria magia! Quer saber mais sobre algum passeio específico?`;
    }
    
    // Pantanal
    if (lowerQuestion.includes('pantanal')) {
      return `O Pantanal é um santuário ecológico, a maior área úmida contínua do planeta! 🐊 É um lugar de biodiversidade incrível, perfeito para quem ama a natureza e quer ver de perto jacarés, capivaras, aves e, com sorte, até onças-pintadas. A melhor época para visitar é na estação seca (maio a setembro) para observação da vida selvagem.`;
    }
    
    // Campo Grande
    if (lowerQuestion.includes('campo grande') || lowerQuestion.includes('capital')) {
      return `Campo Grande é nossa capital, conhecida como "Cidade Morena"! 🏙️ É um lugar cheio de história e cultura. As principais atrações são a Feira Central (que é um espetáculo à parte), Parque das Nações Indígenas, Memorial da Cultura Indígena, Mercadão Municipal e Praça do Rádio. Tem muita coisa legal para fazer!`;
    }
    
    // Rota Bioceânica
    if (lowerQuestion.includes('rota bioceânica') || lowerQuestion.includes('bioceanica')) {
      return `A Rota Bioceânica é um projeto de integração rodoviária que conecta o Brasil ao Chile, passando por Mato Grosso do Sul, Paraguai e Argentina. É uma rota estratégica que visa facilitar o comércio, o turismo e a integração cultural entre os países da América do Sul, ligando o Oceano Atlântico ao Pacífico. Para MS, significa um grande potencial de desenvolvimento e novas oportunidades!`;
    }
    
    // Resposta padrão inteligente
    return `Que pergunta interessante! 🤔 Posso te ajudar com informações sobre destinos, gastronomia, eventos, cultura, hospedagem, transporte, clima e muito mais sobre Mato Grosso do Sul. Temos lugares incríveis como Bonito, Pantanal, Campo Grande, Corumbá, Dourados e muito mais. Sobre o que você gostaria de saber mais especificamente?`;
  }

  private detectQuestionType(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) return 'accommodation';
    if (lowerQuestion.includes('restaurante') || lowerQuestion.includes('comida')) return 'dining';
    if (lowerQuestion.includes('evento') || lowerQuestion.includes('festa')) return 'events';
    if (lowerQuestion.includes('passeio') || lowerQuestion.includes('turismo')) return 'tourism';
    if (lowerQuestion.includes('clima') || lowerQuestion.includes('tempo')) return 'weather';
    
    return 'general';
  }

  private getFollowUpQuestions(question: string): string[] {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('bonito')) {
      return [
        "Quer saber sobre o Rio Sucuri?",
        "Interessado na Gruta do Lago Azul?",
        "Posso te contar sobre outras atrações?"
      ];
    }
    
    if (lowerQuestion.includes('pantanal')) {
      return [
        "Quer saber sobre safáris?",
        "Interessado em pesca?",
        "Posso te contar sobre a biodiversidade?"
      ];
    }
    
    return [
      "Quer saber mais sobre esse assunto?",
      "Posso te ajudar com outras informações?",
      "Tem outras dúvidas sobre MS?"
    ];
  }
}

// Exportar instância única
export const guataTrueApiService = new GuataTrueApiService();