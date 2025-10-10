/**
 * 🦦 GUATÁ INSTANT SERVICE - Resposta instantânea e confiável
 * Sem web search, apenas conhecimento local expandido
 */

export interface InstantQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface InstantResponse {
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

class GuataInstantService {
  private personality = {
    name: "Guatá",
    species: "capivara",
    role: "guia de turismo especializado",
    traits: ["conhecedor", "prestativo", "confiável", "apaixonado por MS"],
    speakingStyle: "conversacional e natural",
    emotions: ["interessado", "prestativo", "confiável", "orgulhoso"]
  };

  // Base de conhecimento local expandida do MS
  private readonly LOCAL_KNOWLEDGE = {
    // DESTINOS PRINCIPAIS
    'bonito': {
      title: 'Bonito - Capital Mundial do Ecoturismo',
      content: 'Bonito é mundialmente reconhecida como a Capital do Ecoturismo, famosa por suas águas cristalinas e preservação ambiental. Principais atrativos: Rio Sucuri (flutuação), Gruta do Lago Azul (mergulho), Gruta da Anhumas (rapel), Buraco das Araras (observação de aves), Rio da Prata (flutuação), Balneário Municipal. Melhor época: abril a outubro (período seco).',
      category: 'destinos',
      keywords: ['bonito', 'ecoturismo', 'águas cristalinas', 'flutuação', 'gruta', 'rio sucuri', 'lago azul']
    },
    'pantanal': {
      title: 'Pantanal - Patrimônio Mundial da UNESCO',
      content: 'O Pantanal é a maior planície alagada do mundo, reconhecido pela UNESCO como Patrimônio Mundial. Em MS, principais portais: Corumbá, Miranda e Aquidauana. Atividades: observação de onças-pintadas, safáris fotográficos, mais de 600 espécies de aves, pesca esportiva, passeios de barco. Melhor época: seca (maio a outubro).',
      category: 'destinos',
      keywords: ['pantanal', 'unesco', 'onça-pintada', 'safári', 'pesca', 'corumbá', 'miranda', 'aquidauana']
    },
    'campo grande': {
      title: 'Campo Grande - Portal de Entrada do MS',
      content: 'Capital conhecida como "Cidade Morena". Principais atrações: Feira Central (gastronomia local), Parque das Nações Indígenas, Memorial da Cultura Indígena, Museu de Arte Contemporânea, Mercadão Municipal, Praça do Rádio. Centro de convenções e eventos.',
      category: 'destinos',
      keywords: ['campo grande', 'cidade morena', 'feira central', 'parque nações indígenas', 'mercadão']
    },
    'corumbá': {
      title: 'Corumbá - Capital do Pantanal',
      content: 'Portal principal do Pantanal, conhecida por sua rica história e cultura. Atrações: Porto Geral, Casario do Porto, Estrada Parque do Pantanal, Forte Coimbra, Museu de História do Pantanal. Ponto de partida para safáris e pesca esportiva.',
      category: 'destinos',
      keywords: ['corumbá', 'porto geral', 'casario', 'estrada parque', 'forte coimbra']
    },
    'três lagoas': {
      title: 'Três Lagoas - Portal do Pantanal Sul',
      content: 'Conhecida como "Cidade das Águas", importante centro industrial e turístico. Atrações: Lagoa Maior, Lagoa Menor, Lagoa do Sapo, Festa do Peixe, Catedral de São Carlos, Museu Histórico. Acesso ao Pantanal Sul.',
      category: 'destinos',
      keywords: ['três lagoas', 'lagoa maior', 'festa do peixe', 'catedral são carlos']
    },
    'dourados': {
      title: 'Dourados - Capital do Agronegócio',
      content: 'Segunda maior cidade do MS, importante centro do agronegócio. Atrações: Parque Antenor Martins, Museu Histórico, Catedral Nossa Senhora da Candelária, Feira Central, Universidade Federal da Grande Dourados.',
      category: 'destinos',
      keywords: ['dourados', 'agronegócio', 'parque antenor martins', 'catedral candelária']
    },

    // GASTRONOMIA
    'gastronomia': {
      title: 'Gastronomia Sul-Mato-Grossense',
      content: 'A culinária mistura influências paraguaias, bolivianas e indígenas. Pratos típicos: sobá (macarrão japonês adaptado), chipa (pão de queijo paraguaio), churrasco pantaneiro, sopa paraguaia, tereré (erva-mate gelada), pacu assado, arroz carreteiro. Onde comer: Feira Central de Campo Grande, Mercadão Municipal, restaurantes especializados.',
      category: 'gastronomia',
      keywords: ['comida', 'gastronomia', 'culinária', 'sobá', 'chipa', 'churrasco pantaneiro', 'sopa paraguaia', 'tereré', 'pacu', 'comida típica']
    },

    // INFRAESTRUTURA
    'rota bioceanica': {
      title: 'Rota Bioceânica - Conexão MS-Chile',
      content: 'Corredor rodoviário estratégico que conecta Mato Grosso do Sul ao Chile, passando pelo Paraguai e Argentina. Em MS, passa por Campo Grande, Ponta Porã e Porto Murtinho. Importante para comércio e turismo internacional. Facilita acesso ao Oceano Pacífico.',
      category: 'infraestrutura',
      keywords: ['rota bioceanica', 'bioceanica', 'corredor', 'chile', 'paraguai', 'argentina', 'porto murtinho', 'ponta porã']
    },

    // EVENTOS
    'eventos': {
      title: 'Eventos e Festivais em MS',
      content: 'Principais eventos: Festival de Inverno de Bonito (julho), Festa do Peixe de Três Lagoas (setembro), Festival América do Sul em Corumbá (abril), Encontro de Carros Antigos em Campo Grande, Festa do Divino Espírito Santo em Miranda, Festa de São João em Aquidauana.',
      category: 'eventos',
      keywords: ['eventos', 'festivais', 'festa do peixe', 'festival inverno', 'américa do sul', 'são joão']
    },

    // CULTURA E HISTÓRIA
    'cultura': {
      title: 'Cultura e História de MS',
      content: 'MS foi criado em 1977, desmembrado de Mato Grosso. Forte influência indígena (Terena, Guarani-Kaiowá), paraguaia e boliviana. Campo Grande fundada em 1899. Rico em tradições, artesanato indígena, música regional e festas populares.',
      category: 'cultura',
      keywords: ['cultura', 'história', 'indígena', 'terena', 'guarani', 'artesanato', 'música regional']
    },

    // ROTEIROS E PLANEJAMENTO
    'roteiro': {
      title: 'Roteiros de Viagem em MS',
      content: 'Posso te ajudar a montar roteiros personalizados! Para Campo Grande (3 dias): Dia 1 - Feira Central, Parque das Nações Indígenas, Memorial da Cultura; Dia 2 - Mercadão Municipal, Museu de Arte Contemporânea, Praça do Rádio; Dia 3 - Passeio cultural, compras, gastronomia local. Para Bonito (3 dias): Dia 1 - Rio Sucuri, Gruta do Lago Azul; Dia 2 - Gruta da Anhumas, Buraco das Araras; Dia 3 - Rio da Prata, Balneário Municipal.',
      category: 'roteiros',
      keywords: ['roteiro', 'roteiros', 'montar', 'planejar', 'viagem', 'dias', 'itinerário', 'programação', 'cidade', 'campo grande', 'bonito']
    },
    'planejamento': {
      title: 'Planejamento de Viagem',
      content: 'Para planejar sua viagem ao MS, preciso saber: quantos dias, qual cidade (Campo Grande, Bonito, Corumbá, etc.), seu perfil (aventura, cultura, gastronomia), orçamento aproximado. Posso sugerir hospedagem, restaurantes, passeios e roteiros personalizados.',
      category: 'planejamento',
      keywords: ['planejar', 'planejamento', 'viagem', 'ajudar', 'sugerir', 'montar', 'organizar']
    }
  };

  async processQuestion(query: InstantQuery): Promise<InstantResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Instant: Processando pergunta...');
    
    try {
      const question = query.question.toLowerCase();
      let answer = "";
      let foundKnowledge = null;
      let emotionalState = 'neutral';
      let followUpQuestions: string[] = [];

      // 1. DETECÇÃO RÁPIDA DE INTENÇÃO
      if (question.includes('oi') || question.includes('olá') || question.includes('tudo bem')) {
        emotionalState = 'friendly';
        answer = `Olá! ${answer}`;
        followUpQuestions = [
          "O que você gostaria de saber sobre Mato Grosso do Sul?",
          "Posso te ajudar a planejar uma viagem?",
          "Tem interesse em algum destino específico?"
        ];
      } else {
        // 2. BUSCA NO CONHECIMENTO LOCAL
        for (const [key, knowledge] of Object.entries(this.LOCAL_KNOWLEDGE)) {
          let score = 0;
          
          // Verificar palavras-chave
          for (const keyword of knowledge.keywords) {
            if (question.includes(keyword)) {
              score += 1;
            }
          }
          
          // Verificar título
          if (question.includes(knowledge.title.toLowerCase())) {
            score += 2;
          }
          
          // Detecção especial para roteiros
          if (question.includes('roteiro') || question.includes('montar') || question.includes('dias') || question.includes('cidade')) {
            if (knowledge.category === 'roteiros' || knowledge.category === 'planejamento') {
              score += 3; // Prioridade alta para roteiros
            }
          }
          
          if (score > 0) {
            foundKnowledge = { ...knowledge, score };
            break; // Usar o primeiro match
          }
        }

        // 3. GERAÇÃO DE RESPOSTA
        if (foundKnowledge) {
          emotionalState = 'helpful';
          
          // Resposta especial para roteiros
          if (foundKnowledge.category === 'roteiros' || foundKnowledge.category === 'planejamento') {
            answer = foundKnowledge.content;
            answer += `\n\nQual cidade você gostaria de visitar? Posso personalizar o roteiro para você!`;
            
            followUpQuestions = [
              "Quer um roteiro para Campo Grande?",
              "Prefere um roteiro para Bonito?",
              "Quantos dias você tem disponível?",
              "Qual seu perfil de viagem (cultura, aventura, gastronomia)?"
            ];
          } else {
            answer = `Sobre ${foundKnowledge.title.toLowerCase()}, posso te contar que ${foundKnowledge.content}`;
            
            // Adicionar toques de personalidade natural
            if (foundKnowledge.category === 'destinos') {
              answer += `\n\nQue legal que você se interessa por ${foundKnowledge.title.split(' - ')[0]}! É um lugar incrível do nosso estado.`;
            } else if (foundKnowledge.category === 'gastronomia') {
              answer += `\n\nNossa culinária é uma delícia e tem tanta história por trás!`;
            }
            
            answer += `\n\nO que mais você gostaria de saber sobre Mato Grosso do Sul?`;
            
            followUpQuestions = [
              "Quer saber mais detalhes sobre esse assunto?",
              "Posso te contar sobre outros lugares similares?",
              "Tem outras dúvidas sobre MS?"
            ];
          }
        } else {
          emotionalState = 'curious';
          answer = `Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul. `;
          answer += `Sobre o que você gostaria de saber mais especificamente?`;
          
          followUpQuestions = [
            "Quer saber sobre algum destino específico?",
            "Posso te ajudar com informações sobre gastronomia?",
            "Tem interesse em eventos ou festivais?"
          ];
        }
      }

      const processingTime = Date.now() - startTime;
      console.log('✅ Guatá Instant: Resposta gerada em', processingTime, 'ms');

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
        adaptiveImprovements: ['Resposta instantânea', 'Personalidade natural'],
        memoryUpdates: [],
        personality: this.personality.name,
        emotionalState: emotionalState,
        followUpQuestions: followUpQuestions
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Instant:', error);
      
      return {
        answer: "Desculpe, não consegui processar sua pergunta no momento. Pode tentar novamente?",
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
export const guataInstantService = new GuataInstantService();
export type { InstantQuery, InstantResponse };
