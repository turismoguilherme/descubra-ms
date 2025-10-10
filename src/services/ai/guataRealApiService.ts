/**
 * 🦦 GUATÁ REAL API SERVICE - Usando APIs reais configuradas
 */

import { supabase } from "@/integrations/supabase/client";
import { generateContent } from "@/config/gemini";

export interface RealApiQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface RealApiResponse {
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

class GuataRealApiService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS", "curioso", "amigável"],
    speakingStyle: "conversacional, natural e envolvente",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso", "curioso", "empolgado"]
  };

  // Sistema de parceiros real
  private readonly PARTNERS = {
    'bonito_ecoturismo': {
      name: "Ecoturismo Bonito",
      category: "passeios",
      location: "Bonito",
      specialties: ["flutuação", "grutas", "águas cristalinas"],
      description: "Especialista em ecoturismo em Bonito com passeios únicos",
      contact: "contato@ecoturismobonito.com.br",
      priority: 1
    },
    'pantanal_safari': {
      name: "Pantanal Safari",
      category: "passeios",
      location: "Pantanal",
      specialties: ["safári", "observação de aves", "onça-pintada"],
      description: "Safáris especializados no Pantanal com guias experientes",
      contact: "contato@pantanalsafari.com.br",
      priority: 1
    },
    'feira_central': {
      name: "Feira Central de Campo Grande",
      category: "gastronomia",
      location: "Campo Grande",
      specialties: ["sobá", "chipa", "comida típica"],
      description: "O coração gastronômico de Campo Grande",
      contact: "feiracentral@cg.ms.gov.br",
      priority: 1
    }
  };

  async processQuestion(query: RealApiQuery): Promise<RealApiResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Real API: Processando pergunta...');
    console.log('📝 Query:', query.question);
    
    try {
      const question = query.question.toLowerCase();
      
      // 1. Buscar parceiros relevantes primeiro
      const partnersFound = this.searchPartners(question);
      console.log('🤝 Parceiros encontrados:', partnersFound.length);
      
      // 2. Tentar Supabase Edge Function para busca web real
      let webResult = null;
      let usedWebSearch = false;
      let knowledgeSource: 'local' | 'web' | 'hybrid' = 'local';
      
      try {
        console.log('🌐 Chamando Supabase Edge Function guata-web-rag...');
        const { data: webData, error: webError } = await supabase.functions.invoke("guata-web-rag", {
          body: {
            question: query.question,
            state_code: 'MS',
            max_results: 3,
            include_sources: true
          }
        });

        if (!webError && webData?.answer) {
          console.log('✅ Supabase Edge Function respondeu!');
          webResult = webData;
          usedWebSearch = true;
          knowledgeSource = 'web';
        } else {
          console.log('⚠️ Supabase Edge Function falhou:', webError);
        }
      } catch (supabaseError) {
        console.log('⚠️ Erro na Supabase Edge Function:', supabaseError);
      }
      
      // 3. Se Supabase falhou, tentar Gemini API
      if (!webResult) {
        try {
          console.log('🤖 Chamando Google Gemini API...');
          const geminiResponse = await generateContent({
            contents: [{
              parts: [{
                text: `Você é o Guatá, uma capivara guia de turismo de Mato Grosso do Sul. Responda de forma natural e envolvente sobre: "${query.question}". Seja específico e útil, mencionando lugares reais e informações atualizadas.`
              }]
            }]
          });
          
          if (geminiResponse) {
            console.log('✅ Gemini API respondeu!');
            webResult = {
              answer: geminiResponse,
              sources: ['gemini_api']
            };
            usedWebSearch = true;
            knowledgeSource = 'web';
          }
        } catch (geminiError) {
          console.log('⚠️ Erro na Gemini API:', geminiError);
        }
      }
      
      // 4. Gerar resposta final
      let answer = "";
      let sources = ['conhecimento_local'];
      
      if (webResult) {
        answer = webResult.answer;
        sources = webResult.sources || ['web_search'];
        
        // Adicionar informações de parceiros se relevante
        if (partnersFound.length > 0) {
          const partnerInfo = this.generatePartnerInfo(partnersFound);
          answer += `\n\n${partnerInfo}`;
          sources.push('parceiros');
          knowledgeSource = 'hybrid';
        }
      } else {
        // Fallback para conhecimento local
        answer = this.generateLocalResponse(question);
        if (partnersFound.length > 0) {
          const partnerInfo = this.generatePartnerInfo(partnersFound);
          answer += `\n\n${partnerInfo}`;
          sources.push('parceiros');
        }
      }
      
      // 5. Adicionar personalidade e contexto
      answer = this.addPersonalityAndContext(answer, question, partnersFound);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Real API: Resposta gerada em', processingTime, 'ms');
      console.log('🌐 Usou web search:', usedWebSearch);
      console.log('🤝 Parceiros encontrados:', partnersFound.length);
      
      return {
        answer,
        confidence: webResult ? 0.9 : 0.7,
        sources,
        processingTime,
        learningInsights: {
          questionType: this.detectQuestionType(question),
          userIntent: 'information_seeking',
          behaviorPattern: 'explorer',
          conversationFlow: 'natural',
          predictiveAccuracy: 0.8,
          proactiveSuggestions: 0
        },
        adaptiveImprovements: ['Sistema com APIs reais', 'Busca web atualizada', 'Sistema de parceiros'],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: 'helpful',
        followUpQuestions: this.getFollowUpQuestions(question),
        usedWebSearch,
        knowledgeSource,
        partnerSuggestion: partnersFound.length > 0 ? partnersFound[0].name : undefined,
        partnersFound,
        partnerPriority: partnersFound.length > 0 ? partnersFound[0].priority : 0
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Real API:', error);
      
      return {
        answer: "Ops! Algo deu errado aqui. Pode tentar novamente? Estou aqui para te ajudar!",
        confidence: 0.3,
        sources: ['erro'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          behaviorPattern: 'unknown',
          conversationFlow: 'unknown',
          predictiveAccuracy: 0,
          proactiveSuggestions: 0
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: [],
        personality: 'confused',
        emotionalState: 'confused',
        followUpQuestions: ['Você pode reformular sua pergunta?', 'Posso te ajudar com algo mais específico?'],
        usedWebSearch: false,
        knowledgeSource: 'local',
        partnerSuggestion: undefined,
        partnersFound: [],
        partnerPriority: 0
      };
    }
  }

  private searchPartners(question: string): any[] {
    const partners = [];
    
    for (const [key, partner] of Object.entries(this.PARTNERS)) {
      let score = 0;
      
      // Verificar por categoria
      if (question.includes('passeios') && partner.category === 'passeios') {
        score += 2;
      }
      if (question.includes('comida') && partner.category === 'gastronomia') {
        score += 2;
      }
      
      // Verificar por localização
      if (question.includes('bonito') && partner.location.toLowerCase().includes('bonito')) {
        score += 2;
      }
      if (question.includes('pantanal') && partner.location.toLowerCase().includes('pantanal')) {
        score += 2;
      }
      if (question.includes('campo grande') && partner.location.toLowerCase().includes('campo grande')) {
        score += 2;
      }
      
      // Verificar por especialidades
      for (const specialty of partner.specialties) {
        if (question.includes(specialty)) {
          score += 1;
        }
      }
      
      if (score > 0) {
        partners.push({
          ...partner,
          score,
          key
        });
      }
    }
    
    return partners.sort((a, b) => b.score - a.score);
  }

  private generatePartnerInfo(partners: any[]): string {
    if (partners.length === 0) return "";
    
    let info = "🤝 **Parceiros Recomendados:**\n";
    
    partners.slice(0, 2).forEach(partner => {
      info += `• **${partner.name}** - ${partner.description}\n`;
      if (partner.contact) {
        info += `  📞 ${partner.contact}\n`;
      }
    });
    
    return info;
  }

  private generateLocalResponse(question: string): string {
    // Respostas locais básicas como fallback
    if (question.includes('rota bioceânica') || question.includes('bioceanica')) {
      return `A Rota Bioceânica é um projeto incrível de integração rodoviária que conecta o Brasil ao Chile, passando por Mato Grosso do Sul! É uma rota estratégica que liga o Oceano Atlântico ao Oceano Pacífico, facilitando o comércio e o turismo entre os países.`;
    }
    
    if (question.includes('histórias') || question.includes('história')) {
      return `As histórias por trás da nossa culinária são fascinantes! A sopa paraguaia chegou com imigrantes paraguaios no século XIX. O tereré tem origem indígena guarani. O churrasco pantaneiro nasceu da necessidade dos peões de campo conservarem a carne no calor do Pantanal.`;
    }
    
    return `Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul. Sobre o que você gostaria de saber mais especificamente?`;
  }

  private addPersonalityAndContext(answer: string, question: string, partners: any[]): string {
    // Adicionar personalidade baseada no contexto
    if (question.includes('rota bioceânica') || question.includes('bioceanica')) {
      return answer + `\n\nQue legal que você se interessa por esse projeto! É uma iniciativa importante para o desenvolvimento do nosso estado.`;
    }
    
    if (question.includes('histórias') || question.includes('história')) {
      return answer + `\n\nNossa culinária tem tanta riqueza cultural por trás! Cada prato tem uma história fascinante.`;
    }
    
    if (partners.length > 0) {
      return answer + `\n\nEsses parceiros são especialistas na área e podem te ajudar com informações mais detalhadas!`;
    }
    
    return answer;
  }

  private detectQuestionType(question: string): string {
    if (question.includes('histórias') || question.includes('história')) return 'cultura';
    if (question.includes('comida') || question.includes('gastronomia')) return 'gastronomia';
    if (question.includes('roteiro') || question.includes('planejar')) return 'planejamento';
    if (question.includes('melhor') || question.includes('passeios')) return 'recomendação';
    if (question.includes('rota') || question.includes('bioceanica')) return 'infraestrutura';
    if (question.includes('olá') || question.includes('oi') || question.includes('quem')) return 'apresentação';
    return 'geral';
  }

  private getFollowUpQuestions(question: string): string[] {
    if (question.includes('comida') || question.includes('gastronomia')) {
      return [
        "Quer saber sobre a Feira Central de Campo Grande?",
        "Já provou o tereré?",
        "Posso te contar sobre outros pratos típicos?"
      ];
    }
    
    if (question.includes('roteiro') || question.includes('planejar')) {
      return [
        "Quer um roteiro para Campo Grande?",
        "Prefere um roteiro para Bonito?",
        "Quantos dias você tem disponível?"
      ];
    }
    
    if (question.includes('bonito')) {
      return [
        "Quer saber sobre o Rio Sucuri?",
        "Interessado na Gruta do Lago Azul?",
        "Posso te contar sobre outras atrações?"
      ];
    }
    
    if (question.includes('pantanal')) {
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
export const guataRealApiService = new GuataRealApiService();
export type { RealApiQuery, RealApiResponse };




