/**
 * GUATÁ INTELLIGENT SERVICE - VERSÃO SIMPLIFICADA E FUNCIONAL
 * 
 * Solução baseada em diagnóstico completo:
 * - UM serviço principal
 * - Base de conhecimento híbrida
 * - APIs via proxy
 * - Prompts sem contradições
 * - Fallbacks sempre úteis
 */

export interface GuataResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  reasoning: string[];
  isFromCache?: boolean;
}

class GuataNewIntelligentService {
  private cache = new Map<string, GuataResponse>();
  private readonly CONFIDENCE_HIGH = 95;
  private readonly CONFIDENCE_MEDIUM = 80;
  private readonly CONFIDENCE_LOW = 65;

  /**
   * PROCESSAMENTO PRINCIPAL - ENTRY POINT
   */
  async processMessage(
    userMessage: string, 
    sessionId: string, 
    userId: string
  ): Promise<GuataResponse> {
    const startTime = Date.now();
    const reasoning: string[] = [];
    
    console.log('🧠 GUATÁ INTELIGENTE: Processando:', userMessage);
    
    // 1. VERIFICAR CACHE
    const cached = this.checkCache(userMessage);
    if (cached) {
      console.log('💾 Resposta encontrada no cache');
      return { ...cached, isFromCache: true };
    }
    
    reasoning.push('1. Cache verificado - consultando base de conhecimento');
    
    // 2. BUSCAR NA BASE DE CONHECIMENTO LOCAL
    const localKnowledge = this.searchLocalKnowledge(userMessage);
    reasoning.push(`2. Base local: ${localKnowledge.length} resultados encontrados`);

    // 2.1 TENTAR RAG EDGE FUNCTION COMO FONTE PRINCIPAL (SEM EXIBIR FONTES NO CHAT)
    try {
      const ragResult = await this.callRAG(userMessage, userId, sessionId);
      if (ragResult && ragResult.answer) {
        reasoning.push('3. Resposta gerada via RAG (web atual)');
        const processingTime = Date.now() - startTime;
        const finalResponse: GuataResponse = {
          answer: ragResult.answer,
          confidence: Math.round((ragResult.confidence ?? 0.8) * 100),
          sources: ['RAG Web Atual'],
          processingTime,
          reasoning
        };
        this.saveToCache(userMessage, finalResponse);
        console.log(`✅ Resposta RAG entregue em ${processingTime}ms`);
        return finalResponse;
      }
    } catch (ragError) {
      console.warn('⚠️ RAG indisponível, seguindo para fallback inteligente:', ragError);
    }
    
    // 3. TENTAR APIs VIA PROXY (se necessário)
    let apiResults: any[] = [];
    if (this.needsRealTimeData(userMessage)) {
      apiResults = await this.searchViaProxy(userMessage);
      reasoning.push(`3. APIs via proxy: ${apiResults.length} resultados`);
    } else {
      reasoning.push('3. APIs não necessárias para esta consulta');
    }
    
    // 4. GERAR RESPOSTA INTELIGENTE
    const response = await this.generateIntelligentResponse(
      userMessage, 
      localKnowledge, 
      apiResults,
      reasoning
    );
    
    const processingTime = Date.now() - startTime;
    
    const finalResponse: GuataResponse = {
      answer: response.answer,
      confidence: response.confidence,
      sources: response.sources,
      processingTime,
      reasoning
    };
    
    // 5. SALVAR NO CACHE
    this.saveToCache(userMessage, finalResponse);
    
    console.log(`✅ Resposta gerada em ${processingTime}ms com ${response.confidence}% confiança`);
    return finalResponse;
  }

  /**
   * BASE DE CONHECIMENTO LOCAL REAL SOBRE MS
   */
  private searchLocalKnowledge(query: string): any[] {
    const queryLower = query.toLowerCase();
    const results: any[] = [];
    
    const knowledgeBase = {
      // HOTÉIS PRÓXIMOS AO AEROPORTO (REAIS)
      hotels_airport: {
        keywords: ['hotel', 'aeroporto', 'campo grande', 'hospedagem', 'próximo', 'ficar'],
        content: {
          type: 'hotels_near_airport',
          data: [
            {
              name: 'Região do Aeroporto de Campo Grande',
              info: 'Diversas opções de hospedagem em raio de 5km do aeroporto',
              types: ['hotéis econômicos', 'hotéis executivos', 'pousadas'],
              services: ['transfer gratuito', 'estacionamento', 'wifi'],
              price_range: 'R$ 120-350/noite',
              location: 'Bairros: Aero Rancho, Vila Sobrinho, proximidades'
            }
          ],
          practical_info: 'A maioria dos hotéis da região oferece transfer gratuito. Táxi do aeroporto custa cerca de R$ 25-40. Uber/99 disponíveis.'
        },
        confidence: this.CONFIDENCE_HIGH
      },
      
      // EVENTOS EM CAMPO GRANDE
      events_cg: {
        keywords: ['evento', 'festa', 'show', 'campo grande', 'semana', 'fim de semana'],
        content: {
          type: 'events_info',
          data: 'Para eventos atualizados em Campo Grande, os principais locais são: Centro de Convenções Arquiteto Rubens Gil de Camillo, Teatro Glauce Rocha, Casa do Artesão, Feira Central (aos domingos). Eventos regulares incluem: Feira da Rua 14 de Julho (noites), apresentações no Mercadão Municipal.',
          tip: 'Para agenda atualizada: consulte redes sociais da Prefeitura de Campo Grande ou Fundação de Cultura.'
        },
        confidence: this.CONFIDENCE_MEDIUM
      },
      
      // GASTRONOMIA MS
      food_ms: {
        keywords: ['comer', 'restaurante', 'comida', 'gastronomia', 'pratos', 'típico'],
        content: {
          type: 'gastronomy',
          data: [
            'Pacu pintado - peixe típico do Pantanal',
            'Pintado na telha - especialidade regional',
            'Sobá - sopa de origem japonesa adaptada',
            'Farofa de banana - acompanhamento tradicional',
            'Chipa - pão de queijo paraguaio',
            'Tereré - bebida gelada com erva-mate'
          ],
          restaurants_info: 'Campo Grande possui diversos restaurantes especializados em culinária pantaneira, churrascarias tradicionais e opções internacionais.'
        },
        confidence: this.CONFIDENCE_HIGH
      },
      
      // BONITO
      bonito_info: {
        keywords: ['bonito', 'gruta', 'lago azul', 'ecoturismo', 'flutuação'],
        content: {
          type: 'destination_bonito',
          data: {
            distance: '295km de Campo Grande (3h30 de carro)',
            main_attractions: [
              'Gruta do Lago Azul - lago subterrâneo cristalino',
              'Rio Sucuri - flutuação em águas transparentes',
              'Abismo Anhumas - rapel e mergulho',
              'Balneário Municipal - águas termais'
            ],
            best_season: 'Maio a setembro (estação seca)',
            important: 'Necessário agendamento prévio e voucher para a maioria dos passeios'
          }
        },
        confidence: this.CONFIDENCE_HIGH
      },
      
      // PANTANAL
      pantanal_info: {
        keywords: ['pantanal', 'safári', 'animais', 'fauna', 'natureza', 'onça'],
        content: {
          type: 'destination_pantanal',
          data: {
            description: 'Maior planície alagável do mundo - Patrimônio da Humanidade UNESCO',
            entry_points: ['Corumbá', 'Miranda', 'Aquidauana'],
            best_seasons: {
              dry: 'Maio-setembro: animais concentrados, estradas acessíveis',
              wet: 'Dezembro-março: paisagens alagadas, ideal para pesca'
            },
            wildlife: ['onças-pintadas', 'capivaras', 'jacarés', '650+ espécies de aves']
          }
        },
        confidence: this.CONFIDENCE_HIGH
      },
      
      // TRANSPORTE
      transport_info: {
        keywords: ['como ir', 'transporte', 'ônibus', 'carro', 'viagem'],
        content: {
          type: 'transportation',
          data: {
            from_airport: 'Táxi R$25-40, Uber/99 disponíveis, ônibus público conecta ao centro',
            car_rental: 'Recomendado para interior do estado',
            distances: {
              'Campo Grande - Bonito': '295km (3h30)',
              'Campo Grande - Corumbá': '420km (5h)',
              'Campo Grande - Aquidauana': '140km (2h)'
            }
          }
        },
        confidence: this.CONFIDENCE_HIGH
      }
    };
    
    // Buscar por relevância
    for (const [key, info] of Object.entries(knowledgeBase)) {
      const relevance = this.calculateRelevance(queryLower, info.keywords);
      if (relevance > 0.3) {
        results.push({
          source: key,
          content: info.content,
          confidence: info.confidence,
          relevance
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * VERIFICAR SE PRECISA DE DADOS EM TEMPO REAL
   * AGORA BUSCA PARA PRATICAMENTE TUDO!
   */
  private needsRealTimeData(query: string): boolean {
    const queryLower = query.toLowerCase();
    
    // SEMPRE buscar dados em tempo real para ser COMPLETO E ILIMITADO
    const shouldSearch = [
      // Eventos e agenda
      'evento', 'festa', 'show', 'festival', 'agenda', 'semana', 'fim de semana',
      'ruraltour', 'ruratur', 'feira', 'exposição', 'concert', 'teatro',
      
      // Informações específicas e atualizadas
      'preço', 'valor', 'horário', 'disponível', 'aberto', 'funcionando',
      'telefone', 'contato', 'endereço', 'como chegar',
      
      // Hospedagem e serviços
      'hotel', 'pousada', 'hospedagem', 'restaurante', 'onde comer',
      'reserva', 'booking', 'disponibilidade',
      
      // Turismo e atividades
      'passeio', 'tour', 'atividade', 'atração', 'visitar', 'fazer',
      'trilha', 'ecoturismo', 'aventura', 'mergulho', 'flutuação',
      
      // Clima e condições
      'tempo', 'clima', 'chuva', 'temperatura', 'melhor época',
      
      // Transporte
      'ônibus', 'voo', 'viagem', 'distância', 'como ir', 'transporte',
      
      // Informações comerciais
      'comprar', 'shopping', 'loja', 'mercado', 'artesanato',
      
      // Vida noturna e entretenimento
      'bar', 'balada', 'noite', 'música', 'dança'
    ];
    
    return shouldSearch.some(keyword => queryLower.includes(keyword));
  }

  /**
   * BUSCAR VIA PROXY SUPABASE
   */
  private async searchViaProxy(query: string): Promise<any[]> {
    try {
      console.log('🌐 Buscando via proxy Supabase...');
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("guata-web-rag", {
        body: { 
          question: `${query}`,
          state_code: 'MS',
          user_id: 'web-client',
          session_id: `sess_${Date.now()}`
        }
      });

      if (!error && data && Array.isArray(data.sources)) {
        console.log(`✅ Proxy RAG OK (fontes: ${data.sources.length})`);
        // Normalizar para a camada de contexto local
        return data.sources.map((s: any) => ({
          title: s.title,
          content: s.snippet || s.content || '',
          url: s.link || s.url,
          source: s.source || 'rag',
          confidence: s.relevance || s.confidence || 0.7,
          lastUpdated: new Date().toISOString(),
          isRealTime: true,
          category: 'general'
        }));
      }

      console.log('⚠️ Proxy falhou, usando fallback');
      return [];
      
    } catch (error) {
      console.log('❌ Erro no proxy:', error);
      return [];
    }
  }

  /**
   * CHAMAR EDGE FUNCTION RAG E USAR A RESPOSTA DIRETA QUANDO DISPONÍVEL
   */
  private async callRAG(
    question: string,
    userId: string,
    sessionId: string
  ): Promise<{ answer?: string; sources?: any[]; confidence?: number } | null> {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("guata-web-rag", {
        body: {
          question,
          state_code: 'MS',
          user_id: userId,
          session_id: sessionId
        }
      });
      if (error) return null;
      return data || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * GERAR RESPOSTA INTELIGENTE COM GEMINI
   */
  private async generateIntelligentResponse(
    userMessage: string,
    localKnowledge: any[],
    apiResults: any[],
    reasoning: string[]
  ): Promise<{ answer: string; confidence: number; sources: string[] }> {
    
    const hasLocalKnowledge = localKnowledge.length > 0;
    const hasApiResults = apiResults.length > 0;
    
    // DETERMINAR CONFIANÇA
    let confidence = this.CONFIDENCE_LOW;
    if (hasLocalKnowledge && hasApiResults) confidence = this.CONFIDENCE_HIGH;
    else if (hasLocalKnowledge) confidence = this.CONFIDENCE_MEDIUM;
    
    // PREPARAR CONTEXTO
    const context = this.buildContext(localKnowledge, apiResults);
    
         // PROMPT NATURAL E DIRETO
     const prompt = `Você é Guatá, guia de turismo de Mato Grosso do Sul.

ESTILO DE RESPOSTA:
- Tom natural e direto, como um amigo local
- SEM formatação excessiva (evite muitos ** e ###)
- SEM apresentações repetitivas
- Direto ao ponto, mas sempre útil
- Use apenas emojis moderadamente

REGRAS:
- Use as informações fornecidas para dar respostas completas
- SEMPRE forneça orientações práticas e específicas
- Se não souber detalhes exatos, oriente como descobrir
- NUNCA invente nomes específicos de estabelecimentos
- Seja genuinamente útil e acolhedor

INFORMAÇÕES DISPONÍVEIS:
${context}

PERGUNTA: ${userMessage}

RESPONDA de forma:
- Natural e conversacional
- Com informações úteis e práticas
- Oferecendo orientações específicas
- Perguntando como pode ajudar mais no final`;

    try {
      const { generateContent } = await import("@/config/gemini");
      const response = await generateContent(prompt, '');
      
      if (response.ok && response.text) {
        reasoning.push('4. Resposta gerada via Gemini com sucesso');
        return {
          answer: response.text,
          confidence,
          sources: this.extractSources(localKnowledge, apiResults)
        };
      }
    } catch (error) {
      console.warn('Gemini falhou, usando fallback inteligente');
      reasoning.push('4. Gemini falhou - usando fallback inteligente');
    }

    // FALLBACK INTELIGENTE
    return this.generateIntelligentFallback(userMessage, localKnowledge, apiResults);
  }

  /**
   * FALLBACK INTELIGENTE - SEMPRE ÚTIL
   */
  private generateIntelligentFallback(
    userMessage: string,
    localKnowledge: any[],
    apiResults: any[]
  ): { answer: string; confidence: number; sources: string[] } {
    
    const queryLower = userMessage.toLowerCase();
    
    // HOTEL AEROPORTO
    if (queryLower.includes('hotel') && queryLower.includes('aeroporto')) {
      return {
        answer: `Na região do aeroporto de Campo Grande você encontra várias opções de hospedagem! 🏨

Tipos disponíveis:
• Hotéis econômicos (R$ 120-200/noite)
• Hotéis executivos (R$ 200-350/noite)  
• Pousadas familiares

Diferenciais da região:
• Maioria oferece transfer gratuito para o aeroporto
• Distância: 1-5km do terminal
• Bairros principais: Aero Rancho e Vila Sobrinho

Como chegar do aeroporto:
• Táxi: R$ 25-40 (15-20 min)
• Uber/99: sempre disponível
• Transfer do hotel (consulte na reserva)

Que tipo de acomodação você prefere? Posso te orientar sobre outras opções na cidade! 😊`,
        confidence: this.CONFIDENCE_MEDIUM,
        sources: ['Base Local MS', 'Conhecimento Turístico']
      };
    }
    
    // EVENTOS
    if (queryLower.includes('evento') || queryLower.includes('festa')) {
      return {
        answer: `Campo Grande sempre tem algo interessante acontecendo! 🎉

Locais com eventos regulares:
• Centro de Convenções Arquiteto Rubens Gil de Camillo
• Teatro Glauce Rocha  
• Casa do Artesão
• Mercadão Municipal (apresentações culturais)

Eventos regulares:
• Feira da Rua 14 de Julho (noites de sexta e sábado)
• Feira Central (domingos pela manhã)
• Shows no Memorial da Cultura

Para agenda atualizada:
• Siga a Prefeitura de Campo Grande nas redes sociais
• Consulte a Fundação de Cultura - FUNDAC
• Apps de eventos locais

Que tipo de evento você procura? Shows, cultura, gastronomia? Posso te orientar melhor! 🎭`,
        confidence: this.CONFIDENCE_MEDIUM,
        sources: ['Conhecimento Local', 'Eventos MS']
      };
    }
    
    // GASTRONOMIA
    if (queryLower.includes('comer') || queryLower.includes('restaurante')) {
      return {
        answer: `A gastronomia de MS é incrível! Você vai se deliciar! 🍽️

Pratos que precisa experimentar:
• Pacu pintado - peixe símbolo do Pantanal
• Pintado na telha - especialidade regional
• Sobá - sopa japonesa que virou tradição em MS
• Farofa de banana - acompanhamento único

Bebidas típicas:
• Tereré - mate gelado (tradição local)
• Raspadinha - bebida gelada refrescante

Onde encontrar:
• Centro de Campo Grande: muitos restaurantes especializados
• Mercadão Municipal: comidas típicas
• Feira Central: pratos regionais aos domingos

Dica especial: Peça sempre o "prato feito pantaneiro" - é garantia de experimentar o melhor da região!

Tem algum tipo de comida que prefere? Posso indicar melhor! 😋`,
        confidence: this.CONFIDENCE_HIGH,
        sources: ['Gastronomia MS', 'Conhecimento Regional']
      };
    }
    
    // RESPOSTA GENÉRICA MAS ÚTIL
    return {
      answer: `Posso te ajudar com informações sobre:
• Hospedagem em Campo Grande e interior
• Pontos turísticos (Bonito, Pantanal, etc.)
• Gastronomia típica de MS
• Eventos e cultura local
• Transporte e como se locomover
• Melhores épocas para visitar cada região

Mato Grosso do Sul é um destino incrível com o Pantanal (maior planície alagável do mundo), Bonito (capital do ecoturismo) e uma cultura rica que mistura influências indígenas, paraguaias e pantaneiras.

O que você gostaria de saber sobre MS? 🌟`,
      confidence: this.CONFIDENCE_MEDIUM,
      sources: ['Guia Turístico MS']
    };
  }

  /**
   * UTILITÁRIOS
   */
  private buildContext(localKnowledge: any[], apiResults: any[]): string {
    let context = '';
    
    if (localKnowledge.length > 0) {
      context += 'CONHECIMENTO LOCAL:\n';
      localKnowledge.forEach(item => {
        context += `- ${JSON.stringify(item.content)}\n`;
      });
    }
    
    if (apiResults.length > 0) {
      context += '\nDADOS EM TEMPO REAL:\n';
      apiResults.forEach(item => {
        context += `- ${item.content || item.text}\n`;
      });
    }
    
    return context || 'Usando conhecimento geral sobre turismo em MS';
  }

  private calculateRelevance(query: string, keywords: string[]): number {
    const queryWords = query.split(' ');
    let score = 0;
    
    for (const keyword of keywords) {
      for (const word of queryWords) {
        if (word.includes(keyword) || keyword.includes(word)) {
          score += 0.3;
        }
      }
    }
    
    return Math.min(score, 1);
  }

  private extractSources(localKnowledge: any[], apiResults: any[]): string[] {
    const sources = [];
    if (localKnowledge.length > 0) sources.push('Base Conhecimento MS');
    if (apiResults.length > 0) sources.push('APIs Tempo Real');
    return sources.length > 0 ? sources : ['Conhecimento Geral'];
  }

  private checkCache(query: string): GuataResponse | null {
    const normalizedQuery = query.toLowerCase().trim();
    return this.cache.get(normalizedQuery) || null;
  }

  private saveToCache(query: string, response: GuataResponse): void {
    const normalizedQuery = query.toLowerCase().trim();
    this.cache.set(normalizedQuery, response);
    
    // Limitar cache a 100 entradas
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

export const guataNewIntelligentService = new GuataNewIntelligentService();
