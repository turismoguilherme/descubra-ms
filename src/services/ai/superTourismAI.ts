import { geminiClient } from '@/config/gemini';

interface TourismEntity {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'event' | 'transport' | 'emergency' | 'service';
  description: string;
  location: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
    distance?: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  details: {
    hours: string;
    prices: string;
    accessibility: string;
    languages: string[];
    payment_methods: string[];
    special_info?: string;
  };
  rating: {
    average: number;
    reviews: number;
  };
  tags: string[];
  lastUpdated: string;
  source?: 'static' | 'community' | 'api';
  communityApproved?: boolean;
  votesCount?: number;
}

interface AIResponse {
  answer: string;
  confidence: number;
  sources: TourismEntity[];
  suggestions: string[];
  relatedQuestions: string[];
  isOfflineResponse: boolean;
}

interface QueryContext {
  location: string;
  attendantId: string;
  isOffline: boolean;
  category?: string;
}

class SuperTourismAI {
  private knowledgeBase: TourismEntity[] = [];
  private isInitialized = false;
  private currentLocation = '';
  private currentCoordinates?: { lat: number; lng: number };

  async initialize(location: string, lat?: number, lng?: number) {
    if (this.isInitialized) return;

    this.currentLocation = location;
    if (lat && lng) {
      this.currentCoordinates = { lat, lng };
    }

    console.log('🚀 Inicializando Super IA Turística...');
    
    // Carregar base de conhecimento offline
    this.loadOfflineKnowledgeBase();
    
    // Carregar sugestões aprovadas da comunidade
    await this.loadCommunityKnowledge();
    
    // Tentar carregar dados online se possível
    if (navigator.onLine) {
      try {
        await this.loadOnlineData();
      } catch (error) {
        console.warn('⚠️ Dados online indisponíveis, usando base offline');
      }
    }

    this.isInitialized = true;
    console.log(`✅ Super IA Turística inicializada com ${this.knowledgeBase.length} itens`);
  }

  /**
   * 🧠 Carrega sugestões aprovadas da comunidade na base de conhecimento
   */
  private async loadCommunityKnowledge() {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { CommunityKnowledgeIntegration } = await import('./communityKnowledgeIntegration');
      
      const { data: approvedSuggestions, error } = await supabase
        .from('community_suggestions')
        .select('*')
        .eq('status', 'approved')
        .order('votes_count', { ascending: false });

      if (error) {
        console.warn('⚠️ Erro ao carregar sugestões da comunidade:', error);
        return;
      }

      if (approvedSuggestions && approvedSuggestions.length > 0) {
        const communityEntities = approvedSuggestions.map(suggestion => 
          CommunityKnowledgeIntegration.convertSuggestionToKnowledge(suggestion)
        );
        
        this.knowledgeBase.push(...communityEntities);
        console.log(`✨ ${communityEntities.length} sugestões da comunidade carregadas na base de conhecimento`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao integrar conhecimento da comunidade:', error);
    }
  }

  /**
   * 🔄 Adiciona nova sugestão aprovada à base de conhecimento em tempo real
   */
  async addCommunityKnowledge(suggestion: any) {
    try {
      const { CommunityKnowledgeIntegration } = await import('./communityKnowledgeIntegration');
      const entity = CommunityKnowledgeIntegration.convertSuggestionToKnowledge(suggestion);
      
      this.knowledgeBase.push(entity);
      console.log(`✨ Nova sugestão da comunidade adicionada: "${entity.name}"`);
    } catch (error) {
      console.error('❌ Erro ao adicionar conhecimento da comunidade:', error);
    }
  }

  private loadOfflineKnowledgeBase() {
    // Base de conhecimento offline completa de MS
    this.knowledgeBase = [
      // PONTOS TURÍSTICOS - BONITO
      {
        id: 'gruta-lago-azul',
        name: 'Gruta do Lago Azul',
        type: 'attraction',
        description: 'Uma das atrações mais famosas de Bonito, a Gruta do Lago Azul é uma caverna com um lago subterrâneo de águas azul-turquesa cristalinas.',
        location: {
          address: 'Rodovia Bonito-Bodoquena, Km 20, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.1619, lng: -56.5264 }
        },
        contact: {
          phone: '(67) 3255-1212',
          website: 'www.grutalagodazul.com.br'
        },
        details: {
          hours: '7:00 às 17:00 (todos os dias)',
          prices: 'R$ 45,00 (adulto) | R$ 22,50 (criança até 12 anos)',
          accessibility: 'Acesso limitado para cadeirantes',
          languages: ['Português', 'Inglês', 'Espanhol'],
          payment_methods: ['Dinheiro', 'Cartão', 'PIX'],
          special_info: 'Requer agendamento. Descida de 100m por escadaria. Temperatura interna: 21°C.'
        },
        rating: { average: 4.8, reviews: 2450 },
        tags: ['gruta', 'lago', 'azul', 'caverna', 'natureza', 'bonito'],
        lastUpdated: '2025-01-26'
      },
      {
        id: 'aquario-natural',
        name: 'Aquário Natural',
        type: 'attraction',
        description: 'Nascente cristalina com peixes coloridos, ideal para flutuação e mergulho contemplativo.',
        location: {
          address: 'Rodovia Bonito-Anastácio, Km 7, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.0847, lng: -56.4875 }
        },
        contact: {
          phone: '(67) 3255-1085'
        },
        details: {
          hours: '8:00 às 17:00',
          prices: 'R$ 120,00 (flutuação) | R$ 80,00 (contemplação)',
          accessibility: 'Acessível para cadeirantes na área de contemplação',
          languages: ['Português', 'Inglês'],
          payment_methods: ['Dinheiro', 'Cartão', 'PIX'],
          special_info: 'Inclui equipamentos de flutuação. Água cristalina 24°C.'
        },
        rating: { average: 4.7, reviews: 1890 },
        tags: ['aquario', 'flutuacao', 'peixes', 'nascente', 'cristalina'],
        lastUpdated: '2025-01-26'
      },
      {
        id: 'rio-sucuri',
        name: 'Rio Sucuri',
        type: 'attraction',
        description: 'Rio de águas cristalinas perfeito para flutuação, com visibilidade de até 50 metros.',
        location: {
          address: 'Estrada do Rio Sucuri, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.0234, lng: -56.5123 }
        },
        contact: {
          phone: '(67) 3255-1074'
        },
        details: {
          hours: '8:00 às 16:00',
          prices: 'R$ 150,00 (flutuação completa)',
          accessibility: 'Acesso limitado',
          languages: ['Português', 'Inglês', 'Espanhol'],
          payment_methods: ['Dinheiro', 'Cartão', 'PIX'],
          special_info: 'Percurso de 1.800m de flutuação. Inclui equipamentos e guia.'
        },
        rating: { average: 4.9, reviews: 3200 },
        tags: ['rio', 'sucuri', 'flutuacao', 'cristalino', 'natureza'],
        lastUpdated: '2025-01-26'
      },

      // RESTAURANTES - BONITO
      {
        id: 'casa-do-joao',
        name: 'Casa do João',
        type: 'restaurant',
        description: 'Restaurante especializado em peixes de água doce, especialmente pintado e pacu.',
        location: {
          address: 'Rua Cel. Pilad Rebuá, 1918, Centro, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.1294, lng: -56.4929 }
        },
        contact: {
          phone: '(67) 3255-1212',
          website: 'www.casadojoao.com.br'
        },
        details: {
          hours: '11:00 às 15:00 e 18:00 às 23:00',
          prices: 'R$ 45,00 a R$ 80,00 por prato',
          accessibility: 'Totalmente acessível',
          languages: ['Português', 'Inglês', 'Espanhol'],
          payment_methods: ['Dinheiro', 'Cartão', 'PIX'],
          special_info: 'Especialidade: Pintado pintado na telha e Pacu assado.'
        },
        rating: { average: 4.6, reviews: 1250 },
        tags: ['restaurante', 'peixe', 'pintado', 'pacu', 'regional'],
        lastUpdated: '2025-01-26'
      },
      {
        id: 'restaurante-tapera',
        name: 'Restaurante Tapera',
        type: 'restaurant',
        description: 'Culinária regional com pratos típicos do Pantanal e ambiente rústico.',
        location: {
          address: 'Rua Santana do Paraíso, 1011, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.1285, lng: -56.4901 }
        },
        contact: {
          phone: '(67) 3255-1720'
        },
        details: {
          hours: '11:30 às 14:30 e 18:30 às 22:30',
          prices: 'R$ 35,00 a R$ 70,00',
          accessibility: 'Parcialmente acessível',
          languages: ['Português'],
          payment_methods: ['Dinheiro', 'Cartão'],
          special_info: 'Pratos típicos: Farofa de banana, Piranha assada, Jacaré.'
        },
        rating: { average: 4.4, reviews: 890 },
        tags: ['regional', 'pantanal', 'tipico', 'rustico', 'jacare'],
        lastUpdated: '2025-01-26'
      },

      // HOTÉIS - BONITO
      {
        id: 'pousada-galeria-bonito',
        name: 'Pousada Galeria Bonito',
        type: 'hotel',
        description: 'Pousada boutique com design moderno e localização central em Bonito.',
        location: {
          address: 'Rua Coronel Pilad Rebuá, 1448, Centro, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.1287, lng: -56.4918 }
        },
        contact: {
          phone: '(67) 3255-1430',
          website: 'www.galeriabonito.com.br',
          email: 'reservas@galeriabonito.com.br'
        },
        details: {
          hours: 'Check-in: 14:00 | Check-out: 12:00',
          prices: 'R$ 280,00 a R$ 450,00 (diária)',
          accessibility: 'Totalmente acessível',
          languages: ['Português', 'Inglês', 'Espanhol'],
          payment_methods: ['Cartão', 'PIX', 'Transferência'],
          special_info: 'Piscina, WiFi, café da manhã incluso, estacionamento.'
        },
        rating: { average: 4.7, reviews: 680 },
        tags: ['pousada', 'boutique', 'centro', 'piscina', 'moderno'],
        lastUpdated: '2025-01-26'
      },

      // TRANSPORTES
      {
        id: 'bonito-campo-grande-onibus',
        name: 'Linha Bonito - Campo Grande',
        type: 'transport',
        description: 'Transporte rodoviário entre Bonito e Campo Grande.',
        location: {
          address: 'Terminal Rodoviário, Bonito/MS',
          city: 'Bonito'
        },
        contact: {
          phone: '(67) 3255-1234'
        },
        details: {
          hours: 'Saídas: 6:00, 13:00 e 18:00',
          prices: 'R$ 65,00 (convencional) | R$ 85,00 (executivo)',
          accessibility: 'Veículos adaptados disponíveis',
          languages: ['Português'],
          payment_methods: ['Dinheiro', 'Cartão'],
          special_info: 'Viagem: 4h30min. Empresas: Andorinha, Cruzeiro do Sul.'
        },
        rating: { average: 4.1, reviews: 340 },
        tags: ['onibus', 'campo grande', 'viagem', 'rodoviario'],
        lastUpdated: '2025-01-26'
      },

      // EMERGÊNCIAS
      {
        id: 'hospital-bonito',
        name: 'Hospital Regional de Bonito',
        type: 'emergency',
        description: 'Hospital público com atendimento de emergência 24 horas.',
        location: {
          address: 'Rua Luís da Costa Leite, 2011, Centro, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.1301, lng: -56.4887 }
        },
        contact: {
          phone: '(67) 3255-1500',
          email: 'hospital.bonito@saude.ms.gov.br'
        },
        details: {
          hours: '24 horas (emergência)',
          prices: 'Atendimento SUS gratuito',
          accessibility: 'Totalmente acessível',
          languages: ['Português'],
          payment_methods: ['SUS', 'Particular', 'Convênios'],
          special_info: 'Emergência, clínica geral, pediatria, ginecologia.'
        },
        rating: { average: 3.8, reviews: 150 },
        tags: ['hospital', 'emergencia', 'saude', '24h', 'sus'],
        lastUpdated: '2025-01-26'
      },
      {
        id: 'policia-bonito',
        name: 'Delegacia de Polícia Civil de Bonito',
        type: 'emergency',
        description: 'Delegacia responsável pelo atendimento policial na região.',
        location: {
          address: 'Rua Santana do Paraíso, 1540, Bonito/MS',
          city: 'Bonito',
          coordinates: { lat: -21.1275, lng: -56.4912 }
        },
        contact: {
          phone: '(67) 3255-1424',
          email: 'dp.bonito@pc.ms.gov.br'
        },
        details: {
          hours: '24 horas',
          prices: 'Serviço público gratuito',
          accessibility: 'Acessível',
          languages: ['Português'],
          payment_methods: ['Não se aplica'],
          special_info: 'Emergência: 190. B.O., ocorrências, investigação.'
        },
        rating: { average: 3.5, reviews: 45 },
        tags: ['policia', 'delegacia', 'seguranca', 'emergencia', '190'],
        lastUpdated: '2025-01-26'
      },

      // EVENTOS (exemplos sazonais)
      {
        id: 'festival-inverno-bonito',
        name: 'Festival de Inverno de Bonito',
        type: 'event',
        description: 'Festival anual com shows musicais, gastronomia e atividades culturais.',
        location: {
          address: 'Centro de Bonito/MS',
          city: 'Bonito'
        },
        contact: {
          phone: '(67) 3255-1000'
        },
        details: {
          hours: 'Julho - datas variam anualmente',
          prices: 'Gratuito a R$ 120,00 (shows pagos)',
          accessibility: 'Espaços acessíveis',
          languages: ['Português'],
          payment_methods: ['Dinheiro', 'Cartão', 'PIX'],
          special_info: 'Shows nacionais, praça gastronômica, artesanato local.'
        },
        rating: { average: 4.6, reviews: 780 },
        tags: ['festival', 'inverno', 'musica', 'cultura', 'julho'],
        lastUpdated: '2025-01-26'
      }
    ];

    // Adicionar dados do localStorage se existirem
    const savedData = localStorage.getItem('tourism_offline_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.knowledgeBase.push(...parsed);
      } catch (e) {
        console.warn('Erro ao carregar dados salvos');
      }
    }
  }

  private async loadOnlineData() {
    try {
      // Simular carregamento de dados online
      // Na implementação real, faria requests para APIs
      console.log('🌐 Carregando dados online...');
      
      // Salvar dados atualizados no localStorage
      localStorage.setItem('tourism_offline_data_timestamp', new Date().toISOString());
      
    } catch (error) {
      console.warn('⚠️ Falha ao carregar dados online:', error);
    }
  }

  async askQuestion(question: string, context: QueryContext): Promise<AIResponse> {
    console.log('🔍 Processando pergunta:', question);
    
    // Buscar na base de conhecimento
    const relevantEntities = this.searchKnowledgeBase(question, context.category);
    
    let answer = '';
    let confidence = 0;
    let suggestions: string[] = [];
    let relatedQuestions: string[] = [];

    if (context.isOffline || !navigator.onLine) {
      // Modo offline - usar base local
      const offlineResponse = this.generateOfflineResponse(question, relevantEntities, context);
      answer = offlineResponse.answer;
      confidence = offlineResponse.confidence;
      suggestions = offlineResponse.suggestions;
      relatedQuestions = offlineResponse.relatedQuestions;
    } else {
      // Modo online - usar IA generativa
      try {
        const onlineResponse = await this.generateOnlineResponse(question, relevantEntities, context);
        answer = onlineResponse.answer;
        confidence = onlineResponse.confidence;
        suggestions = onlineResponse.suggestions;
        relatedQuestions = onlineResponse.relatedQuestions;
      } catch (error) {
        console.warn('⚠️ Falha na IA online, usando resposta offline');
        const fallback = this.generateOfflineResponse(question, relevantEntities, context);
        answer = fallback.answer;
        confidence = fallback.confidence * 0.8; // Reduzir confiança do fallback
      }
    }

    return {
      answer,
      confidence,
      sources: relevantEntities.slice(0, 5), // Top 5 fontes
      suggestions,
      relatedQuestions,
      isOfflineResponse: context.isOffline || !navigator.onLine
    };
  }

  private searchKnowledgeBase(question: string, category?: string): TourismEntity[] {
    const queryLower = question.toLowerCase();
    const words = queryLower.split(' ').filter(w => w.length > 2);
    
    return this.knowledgeBase
      .map(entity => {
        let score = 0;
        
        // Score por categoria
        if (category && this.categoryMatches(entity.type, category)) {
          score += 30;
        }
        
        // Score por nome
        if (entity.name.toLowerCase().includes(queryLower)) {
          score += 50;
        }
        
        // Score por tags
        entity.tags.forEach(tag => {
          if (words.some(word => tag.includes(word))) {
            score += 20;
          }
        });
        
        // Score por descrição
        words.forEach(word => {
          if (entity.description.toLowerCase().includes(word)) {
            score += 10;
          }
        });
        
        // Score por localização
        if (entity.location.city.toLowerCase().includes(queryLower)) {
          score += 15;
        }
        
        return { entity, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.entity);
  }

  private categoryMatches(entityType: string, category: string): boolean {
    const categoryMap: Record<string, string[]> = {
      'pontos-turisticos': ['attraction'],
      'eventos': ['event'],
      'restaurantes': ['restaurant'],
      'hoteis': ['hotel'],
      'transporte': ['transport'],
      'precos': ['attraction', 'restaurant', 'hotel'],
      'emergencias': ['emergency']
    };
    
    return categoryMap[category]?.includes(entityType) || false;
  }

  private generateOfflineResponse(
    question: string, 
    entities: TourismEntity[], 
    context: QueryContext
  ): { answer: string; confidence: number; suggestions: string[]; relatedQuestions: string[] } {
    
    if (entities.length === 0) {
      return {
        answer: `Desculpe, não encontrei informações específicas sobre "${question}" na minha base de dados offline. Posso te ajudar com informações sobre pontos turísticos de Bonito, restaurantes, hotéis, transporte ou emergências. Tente ser mais específico na sua pergunta.`,
        confidence: 0.3,
        suggestions: [
          'Tente perguntas sobre: Gruta do Lago Azul, Aquário Natural, restaurantes de peixe',
          'Para emergências: Hospital, Polícia, Bombeiros',
          'Para transporte: Como chegar de Bonito a Campo Grande'
        ],
        relatedQuestions: [
          'Quais são os principais pontos turísticos de Bonito?',
          'Onde posso comer peixe pintado em Bonito?',
          'Como chegar ao centro de Bonito?'
        ]
      };
    }

    const primaryEntity = entities[0];
    const questionLower = question.toLowerCase();
    
    let answer = '';
    let confidence = 0.85;
    
    // Diferentes tipos de resposta baseados na pergunta
    if (questionLower.includes('onde') || questionLower.includes('localização') || questionLower.includes('endereço')) {
      answer = this.generateLocationAnswer(primaryEntity, entities);
    } else if (questionLower.includes('preço') || questionLower.includes('quanto custa') || questionLower.includes('valor')) {
      answer = this.generatePriceAnswer(primaryEntity, entities);
    } else if (questionLower.includes('horário') || questionLower.includes('funciona') || questionLower.includes('abre')) {
      answer = this.generateHoursAnswer(primaryEntity, entities);
    } else if (questionLower.includes('como chegar') || questionLower.includes('transporte')) {
      answer = this.generateTransportAnswer(primaryEntity, entities);
    } else if (questionLower.includes('melhor') || questionLower.includes('recomenda')) {
      answer = this.generateRecommendationAnswer(entities);
    } else {
      answer = this.generateGeneralAnswer(primaryEntity, entities);
    }

    const suggestions = this.generateSuggestions(primaryEntity);
    const relatedQuestions = this.generateRelatedQuestions(primaryEntity, context);

    return { answer, confidence, suggestions, relatedQuestions };
  }

  private generateLocationAnswer(primary: TourismEntity, entities: TourismEntity[]): string {
    let answer = `📍 **${primary.name}**\n\n`;
    answer += `**Endereço:** ${primary.location.address}\n`;
    answer += `**Cidade:** ${primary.location.city}\n\n`;
    
    if (primary.contact.phone) {
      answer += `📞 **Telefone:** ${primary.contact.phone}\n`;
    }
    
    if (primary.details.special_info) {
      answer += `\n💡 **Informação importante:** ${primary.details.special_info}`;
    }

    if (entities.length > 1) {
      answer += `\n\n**Outras opções próximas:**\n`;
      entities.slice(1, 4).forEach(entity => {
        answer += `• ${entity.name} - ${entity.location.address}\n`;
      });
    }

    return answer;
  }

  private generatePriceAnswer(primary: TourismEntity, entities: TourismEntity[]): string {
    let answer = `💰 **Preços - ${primary.name}**\n\n`;
    answer += `**Valores:** ${primary.details.prices}\n`;
    answer += `**Formas de pagamento:** ${primary.details.payment_methods.join(', ')}\n\n`;
    
    if (primary.details.special_info) {
      answer += `💡 **Informações importantes:** ${primary.details.special_info}\n\n`;
    }

    if (entities.length > 1) {
      answer += `**Comparação de preços:**\n`;
      entities.slice(0, 3).forEach(entity => {
        answer += `• ${entity.name}: ${entity.details.prices}\n`;
      });
    }

    answer += `\n📞 **Contato:** ${primary.contact.phone || 'Não informado'}`;
    
    return answer;
  }

  private generateHoursAnswer(primary: TourismEntity, entities: TourismEntity[]): string {
    let answer = `🕐 **Horários - ${primary.name}**\n\n`;
    answer += `**Funcionamento:** ${primary.details.hours}\n\n`;
    
    if (primary.details.special_info) {
      answer += `💡 **Observações:** ${primary.details.special_info}\n\n`;
    }

    answer += `📞 **Contato:** ${primary.contact.phone || 'Não informado'}\n`;
    answer += `📍 **Local:** ${primary.location.address}`;

    return answer;
  }

  private generateTransportAnswer(primary: TourismEntity, entities: TourismEntity[]): string {
    const transportEntities = entities.filter(e => e.type === 'transport');
    
    let answer = `🚌 **Como chegar em ${primary.name}**\n\n`;
    answer += `📍 **Localização:** ${primary.location.address}\n\n`;
    
    if (transportEntities.length > 0) {
      answer += `**Opções de transporte:**\n`;
      transportEntities.forEach(transport => {
        answer += `• ${transport.name}\n`;
        answer += `  - Horários: ${transport.details.hours}\n`;
        answer += `  - Preços: ${transport.details.prices}\n`;
        answer += `  - Contato: ${transport.contact.phone}\n\n`;
      });
    } else {
      answer += `**Opções de transporte:**\n`;
      answer += `• Táxi/Uber: Disponível no centro de Bonito\n`;
      answer += `• Carro próprio: Estacionamento disponível\n`;
      answer += `• Agências de turismo: Transporte incluso nos passeios\n\n`;
    }
    
    if (primary.contact.phone) {
      answer += `💡 **Dica:** Ligue para ${primary.contact.phone} para confirmar disponibilidade e agendar sua visita.`;
    }

    return answer;
  }

  private generateRecommendationAnswer(entities: TourismEntity[]): string {
    const topRated = entities.sort((a, b) => b.rating.average - a.rating.average).slice(0, 3);
    
    let answer = `⭐ **Melhores recomendações:**\n\n`;
    
    topRated.forEach((entity, index) => {
      answer += `**${index + 1}. ${entity.name}** ⭐ ${entity.rating.average}/5 (${entity.rating.reviews} avaliações)\n`;
      answer += `${entity.description}\n`;
      answer += `📍 ${entity.location.address}\n`;
      answer += `💰 ${entity.details.prices}\n`;
      answer += `📞 ${entity.contact.phone || 'Contato não informado'}\n\n`;
    });

    return answer;
  }

  private generateGeneralAnswer(primary: TourismEntity, entities: TourismEntity[]): string {
    let answer = `ℹ️ **${primary.name}**\n\n`;
    answer += `${primary.description}\n\n`;
    answer += `📍 **Localização:** ${primary.location.address}\n`;
    answer += `🕐 **Horários:** ${primary.details.hours}\n`;
    answer += `💰 **Preços:** ${primary.details.prices}\n`;
    answer += `📞 **Contato:** ${primary.contact.phone || 'Não informado'}\n\n`;
    
    if (primary.details.special_info) {
      answer += `💡 **Informações importantes:** ${primary.details.special_info}\n\n`;
    }
    
    answer += `⭐ **Avaliação:** ${primary.rating.average}/5 (${primary.rating.reviews} avaliações)`;
    
    return answer;
  }

  private generateSuggestions(entity: TourismEntity): string[] {
    const suggestions = [
      `Ligue para ${entity.contact.phone || 'o estabelecimento'} para confirmar horários`,
      `Verifique a localização: ${entity.location.address}`,
    ];
    
    if (entity.type === 'attraction') {
      suggestions.push('Leve protetor solar e água');
      suggestions.push('Recomenda-se agendamento antecipado');
    } else if (entity.type === 'restaurant') {
      suggestions.push('Experimente os pratos típicos regionais');
      suggestions.push('Verifique se aceita sua forma de pagamento');
    } else if (entity.type === 'hotel') {
      suggestions.push('Confirme as políticas de check-in/check-out');
      suggestions.push('Pergunte sobre café da manhã incluso');
    }
    
    return suggestions;
  }

  private generateRelatedQuestions(entity: TourismEntity, context: QueryContext): string[] {
    const questions = [];
    
    if (entity.type === 'attraction') {
      questions.push(
        `Quais outros pontos turísticos próximos a ${entity.name}?`,
        `Quanto tempo leva para visitar ${entity.name}?`,
        `Precisa de agendamento para ${entity.name}?`
      );
    } else if (entity.type === 'restaurant') {
      questions.push(
        'Quais são os pratos típicos da região?',
        'Há outros restaurantes de comida regional em Bonito?',
        'Qual o melhor horário para jantar?'
      );
    } else if (entity.type === 'hotel') {
      questions.push(
        'Quais são as melhores pousadas de Bonito?',
        'Há hotéis com piscina na região?',
        'Como é o transporte do hotel para os pontos turísticos?'
      );
    }
    
    return questions.slice(0, 3);
  }

  private async generateOnlineResponse(
    question: string, 
    entities: TourismEntity[], 
    context: QueryContext
  ): Promise<{ answer: string; confidence: number; suggestions: string[]; relatedQuestions: string[] }> {
    try {
      const entityInfo = entities.slice(0, 3).map(e => 
        `${e.name}: ${e.description} - ${e.location.address} - Tel: ${e.contact.phone} - Preços: ${e.details.prices}`
      ).join('\n');

      const prompt = `
Como assistente turístico especializado em Mato Grosso do Sul, responda à pergunta do turista de forma clara e útil.

PERGUNTA: ${question}

INFORMAÇÕES DISPONÍVEIS:
${entityInfo}

CONTEXTO:
- Local do atendimento: ${context.location}
- Categoria: ${context.category || 'Geral'}

INSTRUÇÕES:
1. Responda de forma clara e direta
2. Inclua informações práticas (endereço, telefone, preços, horários)
3. Use emojis para tornar a resposta mais amigável
4. Seja específico sobre Mato Grosso do Sul
5. Máximo 300 palavras

Formato da resposta: texto corrido, amigável e informativo.
`;

      const response = await geminiClient.generateText(prompt);
      
      return {
        answer: response,
        confidence: 0.95,
        suggestions: this.generateSuggestions(entities[0]),
        relatedQuestions: this.generateRelatedQuestions(entities[0], context)
      };
    } catch (error) {
      throw error;
    }
  }

  getStats() {
    return {
      totalEntities: this.knowledgeBase.length,
      byType: this.knowledgeBase.reduce((acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdate: new Date().toISOString(),
      isOfflineCapable: true
    };
  }
}

export const superTourismAI = new SuperTourismAI(); 