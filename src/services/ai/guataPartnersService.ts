// @ts-nocheck
/**
 * 🦦 GUATÁ PARTNERS SERVICE - Sistema de parceiros real
 * Integra com a tabela institutional_partners do Supabase
 */

export interface PartnersQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface PartnersResponse {
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
  nonPartnerAlternatives: any[];
}

class GuataPartnersService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS"],
    speakingStyle: "conversacional e natural",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso"]
  };

  // Alternativas não parceiras (para quando não houver parceiros)
  private readonly NON_PARTNER_ALTERNATIVES = {
    'hospedagem': {
      name: 'Opções de Hospedagem em Bonito',
      description: 'Bonito oferece diversas opções de hospedagem, desde pousadas charmosas até hotéis mais estruturados. Você pode encontrar opções no centro ou mais próximas aos atrativos naturais.',
      category: 'hospedagem'
    },
    'passeios': {
      name: 'Passeios em Bonito',
      description: 'Bonito é famoso por seus rios de águas cristalinas e grutas. Há diversas opções de flutuação, mergulho, trilhas e cachoeiras para todos os gostos.',
      category: 'passeios'
    }
  };

  // Base de conhecimento local
  private readonly LOCAL_KNOWLEDGE_BASE = {
    'gastronomia': {
      info: 'A culinária de Mato Grosso do Sul é rica e diversificada, com influências indígenas, paraguaias e pantaneiras. Pratos como sobá, chipa, espetinho e o tradicional churrasco pantaneiro são imperdíveis.',
      keywords: ['comida', 'gastronomia', 'culinária', 'sobá', 'chipa', 'churrasco pantaneiro', 'sopa paraguaia', 'tereré', 'comida típica']
    }
  };

  async processQuestion(query: PartnersQuery): Promise<PartnersResponse> {
    const startTime = Date.now();
    console.log('🤝 Guatá Partners: Processando pergunta...');
    console.log('📝 Query:', query.question);

    const partnersFound: any[] = [];
    let partnerSuggestion: string | undefined;
    let partnerPriority = 0;
    const nonPartnerAlternatives: any[] = [];

    // Carregar parceiros reais da tabela institutional_partners
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: partners, error } = await supabase
        .from('institutional_partners')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        console.error('❌ Erro ao carregar parceiros:', error);
      } else if (partners && partners.length > 0) {
        console.log('✅ Parceiros carregados:', partners.length);
        
        // Detectar parceiros relevantes baseado na pergunta
        const lowerQuestion = query.question.toLowerCase();
        
        for (const partner of partners) {
          let isRelevant = false;
          
          // Detectar por segmento
          if (partner.segment) {
            const segment = partner.segment.toLowerCase();
            if ((lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) && segment.includes('hotel')) {
              isRelevant = true;
            }
            if ((lowerQuestion.includes('restaurante') || lowerQuestion.includes('comida') || lowerQuestion.includes('gastronomia')) && segment.includes('gastronomia')) {
              isRelevant = true;
            }
            if ((lowerQuestion.includes('passeio') || lowerQuestion.includes('turismo') || lowerQuestion.includes('roteiro')) && segment.includes('operadora')) {
              isRelevant = true;
            }
          }
          
          // Detectar por cidade
          if (partner.city && lowerQuestion.includes(partner.city.toLowerCase())) {
            isRelevant = true;
          }
          
          // Detectar por nome
          if (partner.name && lowerQuestion.includes(partner.name.toLowerCase())) {
            isRelevant = true;
          }
          
          if (isRelevant) {
            partnersFound.push({
              id: partner.id,
              name: partner.name,
              description: partner.description,
              city: partner.city,
              segment: partner.segment,
              contact_email: partner.contact_email,
              contact_whatsapp: partner.contact_whatsapp,
              website_link: partner.website_link,
              category: partner.category,
              isPartner: true,
              priority: partner.category === 'estadual' ? 9 : partner.category === 'regional' ? 7 : 5
            });
          }
        }
        
        // Ordenar por prioridade
        partnersFound.sort((a, b) => b.priority - a.priority);
        partnerPriority = partnersFound.length > 0 ? Math.max(...partnersFound.map(p => p.priority)) : 0;
      }
    } catch (error) {
      console.error('❌ Erro ao acessar parceiros:', error);
    }

    if (partnersFound.length > 0) {
      partnerSuggestion = `Encontrei nossos parceiros oficiais para sua pergunta!`;
    } else {
      // Se não encontrou parceiros, sugerir alternativas não parceiras
      const lowerQuestion = query.question.toLowerCase();
      if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
        nonPartnerAlternatives.push(this.NON_PARTNER_ALTERNATIVES['hospedagem']);
      }
      if (lowerQuestion.includes('passeio') || lowerQuestion.includes('turismo')) {
        nonPartnerAlternatives.push(this.NON_PARTNER_ALTERNATIVES['passeios']);
      }
      partnerSuggestion = "Não encontrei parceiros específicos para esta busca no momento, mas posso te dar algumas sugestões gerais.";
    }

    const processingTime = Date.now() - startTime;
    console.log(`🤝 Guatá Partners: Concluído em ${processingTime}ms`);

    return {
      answer: partnerSuggestion || "Não encontrei informações de parceiros para sua pergunta.",
      confidence: partnersFound.length > 0 ? 0.9 : 0.6,
      sources: partnersFound.length > 0 ? ['partner_database'] : ['local_knowledge'],
      processingTime,
      learningInsights: {
        questionType: 'partners',
        userIntent: 'service_seeking',
        behaviorPattern: 'explorer',
        conversationFlow: 'natural',
        predictiveAccuracy: partnersFound.length > 0 ? 0.9 : 0.6
      },
      adaptiveImprovements: [
        'Sistema de parceiros integrado com institutional_partners',
        'Detecção inteligente de parceiros relevantes',
        'Priorização por categoria e localização'
      ],
      memoryUpdates: [
        {
          type: 'partners_request',
          data: { question: query.question, partnersFound: partnersFound.length }
        }
      ],
      personality: this.personality.name,
      emotionalState: partnersFound.length > 0 ? 'excited' : 'helpful',
      followUpQuestions: this.getFollowUpQuestions(query.question),
      usedWebSearch: false,
      knowledgeSource: partnersFound.length > 0 ? 'local' : 'hybrid',
      partnerSuggestion,
      partnersFound,
      partnerPriority,
      nonPartnerAlternatives
    };
  }

  private getFollowUpQuestions(question: string): string[] {
    const lowerQuestion = question.toLowerCase();
    const followUps: string[] = [];

    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
      followUps.push('Quais hotéis aceitam pets em Bonito?');
      followUps.push('Qual a média de preço de hospedagem no Pantanal?');
    } else if (lowerQuestion.includes('passeio') || lowerQuestion.includes('turismo')) {
      followUps.push('Quais passeios são ideais para crianças em Bonito?');
      followUps.push('Como chegar no Pantanal?');
    } else if (lowerQuestion.includes('comida') || lowerQuestion.includes('restaurante')) {
      followUps.push('Onde comer sobá em Campo Grande?');
      followUps.push('Quais restaurantes têm opções vegetarianas?');
    } else {
      followUps.push('O que mais você gostaria de saber sobre Mato Grosso do Sul?');
      followUps.push('Posso te ajudar a planejar sua viagem?');
    }

    return followUps.slice(0, 2); // Limita a 2 perguntas de seguimento
  }
}

// Exportar instância única
export const guataPartnersService = new GuataPartnersService();
export type { PartnersQuery, PartnersResponse };