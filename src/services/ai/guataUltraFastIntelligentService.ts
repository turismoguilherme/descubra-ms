/**
 * 🦦 GUATÁ ULTRA FAST INTELLIGENT - Resposta instantânea com personalidade
 */

export interface UltraFastIntelligentQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface UltraFastIntelligentResponse {
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
}

class GuataUltraFastIntelligentService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo inteligente",
    traits: ["curioso", "amigável", "conhecedor", "apaixonado por MS"],
    speakingStyle: "conversacional e envolvente",
    emotions: ["animado", "interessado", "prestativo", "orgulhoso"]
  };

  private emotionalStates = {
    excited: "🦦 *olhos brilhando*",
    curious: "🤔 *coçando a cabeça pensativamente*",
    proud: "😊 *peito estufado de orgulho*",
    helpful: "💪 *determinado a ajudar*",
    surprised: "😮 *boquiaberto*",
    thoughtful: "🤓 *pensando profundamente*"
  };

  private readonly KNOWLEDGE = {
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental. Os melhores passeios incluem: Rio Sucuri, Gruta do Lago Azul, Gruta da Anhumas, Buraco das Araras, Rio da Prata, Balneário Municipal.',
      category: 'destinos'
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial. Em MS, principais acessos: Corumbá, Miranda e Aquidauana. Melhor época: seca (maio-outubro). Principais atividades: observação de onças-pintadas, mais de 600 espécies de aves, pesca esportiva e passeios de barco.',
      category: 'destinos'
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Capital conhecida como "Cidade Morena". Principais atrações: Feira Central, Parque das Nações Indígenas, Memorial da Cultura Indígena, Museu de Arte Contemporânea, Mercadão Municipal.',
      category: 'destinos'
    },
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá, chipa, churrasco pantaneiro, sopa paraguaia e tereré. Onde comer: Feira Central de Campo Grande, Mercadão Municipal de Campo Grande, restaurantes especializados em culinária regional.',
      category: 'gastronomia'
    },
    'corumbá': {
      title: 'Corumbá - Capital do Pantanal',
      content: 'Corumbá é um importante portal de entrada para o Pantanal, conhecida por sua rica história e cultura. Atrações incluem o Porto Geral, o Casario do Porto, e a Estrada Parque do Pantanal. É um excelente ponto de partida para safáris fotográficos e pesca esportiva.',
      category: 'destinos'
    },
    'rota bioceanica': {
      title: 'Rota Bioceânica - Conexão MS-Chile',
      content: 'A Rota Bioceânica é um corredor rodoviário que conecta Mato Grosso do Sul ao Chile, passando pelo Paraguai e Argentina. Em MS, passa por Campo Grande, Ponta Porã e Porto Murtinho. É uma rota estratégica para o comércio e turismo internacional.',
      category: 'infraestrutura'
    },
    'eventos': {
      title: 'Eventos em Mato Grosso do Sul',
      content: 'MS tem diversos eventos importantes: Festival de Inverno de Bonito, Festa do Peixe de Três Lagoas, Festival América do Sul em Corumbá, Encontro de Carros Antigos em Campo Grande, e muitas outras festividades regionais.',
      category: 'eventos'
    },
    'historia': {
      title: 'História de Mato Grosso do Sul',
      content: 'MS foi criado em 1977, desmembrado de Mato Grosso. Tem forte influência indígena, paraguaia e boliviana. Campo Grande foi fundada em 1899. O estado é rico em cultura, tradições e belezas naturais únicas.',
      category: 'historia'
    }
  };

  async processQuestion(query: UltraFastIntelligentQuery): Promise<UltraFastIntelligentResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Ultra Fast Inteligente: Processando pergunta...');
    
    try {
      const question = query.question.toLowerCase();
      let answer = "";
      let foundKnowledge = null;
      let emotionalState = 'thoughtful';
      let followUpQuestions: string[] = [];

      // 1. DETECÇÃO RÁPIDA DE INTENÇÃO E EMOÇÃO
      if (question.includes('oi') || question.includes('olá') || question.includes('tudo bem')) {
        emotionalState = 'excited';
        answer = `${this.emotionalStates.excited} Oi! Que bom te ver aqui! Eu sou o Guatá, sua capivara guia de turismo! `;
        answer += `Estou super animado para te ajudar a descobrir as maravilhas do Mato Grosso do Sul! `;
        answer += `O que você gostaria de saber hoje?`;
        followUpQuestions = [
          "O que você gostaria de saber sobre o MS?",
          "Posso te ajudar a planejar uma viagem?",
          "Tem alguma curiosidade sobre nosso estado?"
        ];
      } else {
        // 2. BUSCA RÁPIDA NO CONHECIMENTO LOCAL
        if (question.includes('bonito')) {
          foundKnowledge = this.KNOWLEDGE.bonito;
          emotionalState = 'proud';
        } else if (question.includes('pantanal')) {
          foundKnowledge = this.KNOWLEDGE.pantanal;
          emotionalState = 'proud';
        } else if (question.includes('campo grande')) {
          foundKnowledge = this.KNOWLEDGE['campo grande'];
          emotionalState = 'proud';
        } else if (question.includes('comida') || question.includes('gastronomia') || question.includes('restaurante') || question.includes('culinária')) {
          foundKnowledge = this.KNOWLEDGE.gastronomia;
          emotionalState = 'excited';
        } else if (question.includes('corumbá')) {
          foundKnowledge = this.KNOWLEDGE.corumbá;
          emotionalState = 'proud';
        } else if (question.includes('rota bioceanica') || question.includes('bioceanica')) {
          foundKnowledge = this.KNOWLEDGE['rota bioceanica'];
          emotionalState = 'helpful';
        } else if (question.includes('evento') || question.includes('festival')) {
          foundKnowledge = this.KNOWLEDGE.eventos;
          emotionalState = 'excited';
        } else if (question.includes('história') || question.includes('historia')) {
          foundKnowledge = this.KNOWLEDGE.historia;
          emotionalState = 'thoughtful';
        }

        // 3. GERAÇÃO DE RESPOSTA COM PERSONALIDADE
        if (foundKnowledge) {
          const emotionIcon = this.emotionalStates[emotionalState as keyof typeof this.emotionalStates] || "🦦";
          answer = `${emotionIcon} Sobre ${foundKnowledge.title.toLowerCase()}, posso te contar que ${foundKnowledge.content}`;
          
          // Adicionar toques de personalidade
          if (foundKnowledge.category === 'destinos') {
            answer += `\n\n😊 *peito estufado de orgulho* Nossa, falar do MS me deixa todo animado! `;
            answer += `É um lugar tão especial e cheio de belezas naturais incríveis!`;
          } else if (foundKnowledge.category === 'gastronomia') {
            answer += `\n\n🤤 *coçando a cabeça pensativamente* Nossa, só de falar de comida já me deu fome! `;
            answer += `A culinária do MS é uma delícia e tem tanta história por trás!`;
          }
          
          answer += `\n\nO que mais você gostaria de saber sobre Mato Grosso do Sul?`;
          
          followUpQuestions = [
            "Quer saber mais detalhes sobre algum aspecto específico?",
            "Posso te contar sobre outros lugares similares?",
            "Tem alguma dúvida específica sobre isso?"
          ];
        } else {
          emotionalState = 'curious';
          answer = `🤔 *coçando a cabeça pensativamente* Hmm, essa é uma pergunta interessante! `;
          answer += `Posso te ajudar com informações sobre Bonito, Pantanal, Campo Grande, Corumbá, gastronomia, eventos e muito mais! `;
          answer += `Como posso te ajudar hoje?`;
          
          followUpQuestions = [
            "Quer saber sobre algum destino específico?",
            "Posso te ajudar com informações sobre gastronomia?",
            "Tem interesse em eventos ou festivais?"
          ];
        }
      }

      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Ultra Fast Inteligente: Resposta gerada em', processingTime, 'ms');

      return {
        answer: answer,
        confidence: foundKnowledge ? 0.9 : 0.7,
        sources: foundKnowledge ? ['conhecimento_local'] : ['geral'],
        processingTime: processingTime,
        learningInsights: {
          questionType: foundKnowledge ? 'specific_query' : 'general_query',
          userIntent: 'information_seeking',
          knowledgeGaps: foundKnowledge ? [] : ['conhecimento_especifico'],
          improvementSuggestions: foundKnowledge ? [] : ['Expandir base de conhecimento'],
          contextRelevance: foundKnowledge ? 1 : 0.5
        },
        adaptiveImprovements: ['Resposta instantânea', 'Personalidade melhorada'],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: emotionalState,
        followUpQuestions: followUpQuestions
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Ultra Fast Inteligente:', error);
      
      return {
        answer: "🦦 *coçando a cabeça* Ops! Parece que algo deu errado aqui. Deixe-me tentar novamente...",
        confidence: 0.3,
        sources: ['erro'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Melhorar tratamento de erros'],
          contextRelevance: 0
        },
        adaptiveImprovements: ['Melhorar tratamento de erros'],
        memoryUpdates: [],
        personality: 'confused',
        emotionalState: 'confused',
        followUpQuestions: ['Você pode reformular sua pergunta?', 'Posso te ajudar com algo mais específico?']
      };
    }
  }
}

// Exportar instância única
export const guataUltraFastIntelligentService = new GuataUltraFastIntelligentService();
export type { UltraFastIntelligentQuery, UltraFastIntelligentResponse };

