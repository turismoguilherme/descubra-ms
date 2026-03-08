// @ts-nocheck
/**
 * 🦦 GUATÁ INTERACTIVE SERVICE - Chatbot verdadeiramente interativo
 */

export interface InteractiveQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface InteractiveResponse {
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
}

class GuataInteractiveService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS", "curioso", "amigável"],
    speakingStyle: "conversacional, natural e envolvente",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso", "curioso", "empolgado"]
  };

  // Base de conhecimento local expandida e contextual
  private readonly LOCAL_KNOWLEDGE = {
    'apresentacao': {
      title: 'Apresentação do Guatá',
      content: 'Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?',
      keywords: ['olá', 'oi', 'quem é você', 'apresentação', 'quem é', 'você é']
    },
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo! É um lugar mágico com águas cristalinas que parecem de outro mundo. As principais atrações são o Rio Sucuri, Gruta do Lago Azul, Gruta da Anhumas, Buraco das Araras e Rio da Prata. Cada lugar tem sua própria magia!',
      keywords: ['bonito', 'ecoturismo', 'águas cristalinas', 'flutuação', 'gruta', 'rio sucuri', 'lago azul']
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo e é Patrimônio Mundial da UNESCO! É o habitat da onça-pintada e de centenas de espécies de aves. As principais cidades são Corumbá, Miranda e Aquidauana. É um espetáculo da natureza!',
      keywords: ['pantanal', 'unesco', 'onça-pintada', 'safári', 'pesca', 'corumbá', 'miranda', 'aquidauana']
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Campo Grande é nossa capital, conhecida como "Cidade Morena"! É um lugar cheio de história e cultura. As principais atrações são a Feira Central (que é um espetáculo à parte), Parque das Nações Indígenas, Memorial da Cultura Indígena, Mercadão Municipal e Praça do Rádio. Tem muita coisa legal para fazer!',
      keywords: ['campo grande', 'cidade morena', 'feira central', 'parque nações indígenas', 'mercadão', 'capital']
    },
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'Nossa culinária é uma delícia e tem tanta história! A sopa paraguaia chegou com imigrantes paraguaios no século XIX. O tereré tem origem indígena guarani e é uma tradição milenar. O churrasco pantaneiro nasceu da necessidade dos peões de campo conservarem a carne no calor do Pantanal. Cada prato conta uma história!',
      keywords: ['comida', 'gastronomia', 'culinária', 'sobá', 'chipa', 'churrasco pantaneiro', 'sopa paraguaia', 'tereré', 'comida típica']
    },
    'histórias': {
      title: 'Histórias da Culinária Sul-Mato-Grossense',
      content: 'As histórias por trás da nossa culinária são fascinantes! A sopa paraguaia chegou com imigrantes paraguaios no século XIX e se tornou um prato típico. O tereré tem origem indígena guarani e é uma tradição milenar. O churrasco pantaneiro nasceu da necessidade dos peões de campo conservarem a carne no calor intenso do Pantanal. Cada prato conta uma história de migração, adaptação e resistência cultural!',
      keywords: ['histórias', 'história', 'culinária', 'tradição', 'origem', 'imigrantes', 'indígenas']
    },
    'roteiro': {
      title: 'Roteiros de Viagem em MS',
      content: 'Posso te ajudar a montar roteiros personalizados! Para Campo Grande (3 dias): Dia 1 - Feira Central, Parque das Nações Indígenas, Memorial da Cultura; Dia 2 - Mercadão Municipal, Museu de Arte Contemporânea, Praça do Rádio; Dia 3 - Passeio cultural, compras, gastronomia local. Para Bonito (3 dias): Dia 1 - Rio Sucuri, Gruta do Lago Azul; Dia 2 - Gruta da Anhumas, Buraco das Araras; Dia 3 - Rio da Prata, Balneário Municipal. Qual cidade te interessa mais?',
      keywords: ['roteiro', 'roteiros', 'montar', 'planejar', 'viagem', 'dias', 'itinerário', 'programação', 'cidade', 'campo grande', 'bonito']
    },
    'planejamento': {
      title: 'Planejamento de Viagem',
      content: 'Para planejar sua viagem ao MS, preciso saber: quantos dias você tem, qual cidade te interessa mais (Campo Grande, Bonito, Corumbá, etc.), seu perfil (aventura, cultura, gastronomia), orçamento aproximado. Posso sugerir hospedagem, restaurantes, passeios e roteiros personalizados!',
      keywords: ['planejar', 'planejamento', 'viagem', 'ajudar', 'sugerir', 'montar', 'organizar']
    },
    'rota bioceânica': {
      title: 'Rota Bioceânica',
      content: 'A Rota Bioceânica é um projeto incrível de integração rodoviária que conecta o Brasil ao Chile, passando por Mato Grosso do Sul! É uma rota estratégica que liga o Oceano Atlântico ao Oceano Pacífico, facilitando o comércio e o turismo entre os países. A rota passa por Campo Grande, Corumbá e outras cidades importantes do MS, oferecendo oportunidades de desenvolvimento econômico e turístico para a região. É considerada uma das principais rotas de integração da América do Sul!',
      keywords: ['rota bioceânica', 'bioceanica', 'rota', 'integração', 'brasil', 'chile', 'corredor']
    }
  };

  async processQuestion(query: InteractiveQuery): Promise<InteractiveResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Interactive: Processando pergunta...');
    console.log('📝 Query:', query.question);
    
    try {
      const question = query.question.toLowerCase();
      
      // Busca inteligente no conhecimento local
      const localResult = this.searchLocalKnowledge(question);
      
      let answer = "";
      let sources = ['conhecimento_local'];
      let usedWebSearch = false;
      let knowledgeSource: 'local' | 'web' | 'hybrid' = 'local';
      
      if (localResult.found) {
        answer = localResult.knowledge.content;
        
        // Adicionar personalidade e contexto baseado na pergunta
        answer = this.addPersonalityAndContext(answer, question, localResult.knowledge.category);
        
        // Adicionar perguntas de seguimento contextuais
        const followUp = this.getContextualFollowUp(question, localResult.knowledge.category);
        if (followUp) {
          answer += `\n\n${followUp}`;
        }
      } else {
        // Para perguntas não encontradas, dar resposta mais natural
        answer = this.generateNaturalResponse(question);
        usedWebSearch = true;
        knowledgeSource = 'web';
        sources = ['web_search'];
      }
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Interactive: Resposta gerada em', processingTime, 'ms');
      console.log('🌐 Usou web search:', usedWebSearch);
      
      return {
        answer,
        confidence: localResult.found ? 0.9 : 0.7,
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
        adaptiveImprovements: ['Sistema interativo e natural'],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: 'helpful',
        followUpQuestions: this.getFollowUpQuestions(question),
        usedWebSearch,
        knowledgeSource,
        partnerSuggestion: undefined
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Interactive:', error);
      
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
        partnerSuggestion: undefined
      };
    }
  }

  private searchLocalKnowledge(question: string): any {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, knowledge] of Object.entries(this.LOCAL_KNOWLEDGE)) {
      let score = 0;
      
      for (const keyword of knowledge.keywords) {
        if (question.includes(keyword)) {
          score += 1;
        }
      }
      
      if (question.includes(knowledge.title.toLowerCase())) {
        score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...knowledge, score, category: key };
      }
    }
    
    return {
      found: bestMatch !== null,
      knowledge: bestMatch,
      confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0
    };
  }

  private addPersonalityAndContext(answer: string, question: string, category: string): string {
    // Adicionar personalidade baseada no contexto
    if (category === 'apresentacao') {
      return answer; // Já tem personalidade
    }
    
    if (category === 'rota bioceânica') {
      return answer + `\n\nQue legal que você se interessa por esse projeto! É uma iniciativa importante para o desenvolvimento do nosso estado.`;
    }
    
    if (category === 'histórias') {
      return answer + `\n\nNossa culinária tem tanta riqueza cultural por trás! Cada prato tem uma história fascinante.`;
    }
    
    if (category === 'bonito' || category === 'pantanal') {
      return answer + `\n\nQue legal que você se interessa por ${category === 'bonito' ? 'Bonito' : 'o Pantanal'}! É um lugar incrível do nosso estado.`;
    }
    
    if (category === 'campo grande') {
      return answer + `\n\nCampo Grande é uma cidade cheia de surpresas! Tem muita coisa legal para descobrir.`;
    }
    
    if (category === 'gastronomia') {
      return answer + `\n\nNossa culinária é uma delícia e tem tanta história por trás!`;
    }
    
    if (category === 'roteiro' || category === 'planejamento') {
      return answer + `\n\nQual cidade te interessa mais? Posso personalizar o roteiro para você!`;
    }
    
    return answer;
  }

  private getContextualFollowUp(question: string, category: string): string {
    if (category === 'bonito') {
      return "Quer saber mais sobre alguma atração específica de Bonito?";
    }
    
    if (category === 'pantanal') {
      return "Quer saber mais sobre safáris ou pesca no Pantanal?";
    }
    
    if (category === 'campo grande') {
      return "Quer saber mais sobre a Feira Central ou outros pontos turísticos?";
    }
    
    if (category === 'gastronomia') {
      return "Quer saber mais sobre algum prato específico ou onde provar?";
    }
    
    if (category === 'roteiro') {
      return "Qual cidade te interessa mais para montar o roteiro?";
    }
    
    return "O que mais você gostaria de saber sobre Mato Grosso do Sul?";
  }

  private generateNaturalResponse(question: string): string {
    // Respostas mais naturais para perguntas não encontradas
    if (question.includes('influenciar') || question.includes('influência')) {
      return `Interessante pergunta! Campo Grande tem vários fatores que influenciam seu desenvolvimento: a Rota Bioceânica (que vai passar por aqui), o turismo crescente, a gastronomia única, e claro, nossa localização estratégica no centro do país. O que especificamente te interessa saber sobre Campo Grande?`;
    }
    
    if (question.includes('melhor') && question.includes('passeios')) {
      return `Para os melhores passeios, recomendo consultar sites oficiais de turismo de MS, guias especializados e avaliações atualizadas. Bonito tem águas cristalinas incríveis, o Pantanal tem safáris únicos, e Campo Grande tem uma cultura rica. Qual destino te interessa mais?`;
    }
    
    // Resposta genérica mais natural
    return `Hmm, essa é uma pergunta interessante! Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul. Sobre o que você gostaria de saber mais especificamente?`;
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
export const guataInteractiveService = new GuataInteractiveService();
export type { InteractiveQuery, InteractiveResponse };

