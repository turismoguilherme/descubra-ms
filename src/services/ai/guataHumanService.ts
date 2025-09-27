// Guatá Human Service - Sistema Integrado e Humano
// Combina persona, memória, feedback, sites oficiais, banco e APIs externas

import { generateContent } from "@/config/gemini";
import { guataPersonaService, PromptTemplate } from "./guataPersonaService";
import { sessionMemoryService, SessionMemory } from "./memory/sessionMemoryService";
import { persistentMemoryService, UserPreferences, TravelHistory, ConversationPatterns } from "./memory/persistentMemoryService";
import { feedbackService } from "./feedback/feedbackService";
import { msOfficialSitesScraper, OfficialSiteData } from "./search/msOfficialSitesScraper";
import { guataDatabaseService, TouristAttraction, Itinerary, Event, VerifiedPartner } from "@/services/database/guataDatabaseService";
import { guataExternalAPIsService, WeatherInfo, PlaceInfo, TransportationInfo } from "./external/guataExternalAPIsService";
import { MSKnowledgeBase } from "./search/msKnowledgeBase";

export interface GuataHumanQuery {
  question: string;
  userId?: string;
  sessionId: string;
  context?: any;
  includeWeather?: boolean;
  includePlaces?: boolean;
  includeTransportation?: boolean;
}

export interface GuataHumanResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    title: string;
    url?: string;
    type: 'official_site' | 'ms_knowledge' | 'database' | 'web_search' | 'user_feedback' | 'weather' | 'places' | 'transportation';
    reliability: 'high' | 'medium' | 'low';
    data?: any;
  }>;
  metadata: {
    processingTime: number;
    sessionContext: string;
    userPreferences: any;
    feedbackApplied: boolean;
    learningPatterns: number;
    weatherInfo?: WeatherInfo;
    placesInfo?: PlaceInfo[];
    transportationInfo?: TransportationInfo[];
    attractions?: TouristAttraction[];
    itineraries?: Itinerary[];
    events?: Event[];
    partners?: VerifiedPartner[];
  };
  suggestions?: string[];
  followUpQuestions?: string[];
}

export class GuataHumanService {
  
  /**
   * Processa pergunta com sistema humano integrado
   */
  async processQuestion(query: GuataHumanQuery): Promise<GuataHumanResponse> {
    const startTime = Date.now();
    console.log(`🧠 Guatá Human: Processando "${query.question}"`);
    
    try {
      // 1. Gerenciar sessão e memória
      const session = sessionMemoryService.createOrGetSession(query.sessionId, query.userId);
      
      // 2. Adicionar pergunta à memória
      sessionMemoryService.addConversationEntry(
        query.sessionId,
        'user',
        query.question,
        { questionType: this.analyzeQuestionType(query.question) }
      );
      
      // 3. Buscar informações em fontes oficiais (PRIORIDADE)
      const officialData = await this.searchOfficialSources(query.question);
      
      // 4. Buscar no banco de dados PostgreSQL
      const databaseData = await this.searchDatabase(query.question);
      
      // 5. Complementar com base de conhecimento MS
      const msKnowledge = await this.searchMSKnowledge(query.question);
      
      // 6. Buscar APIs externas se solicitado
      const externalData = await this.searchExternalAPIs(query);
      
      // 7. Gerar resposta com persona humana
      const answer = await this.generateHumanAnswer(
        query.question,
        officialData,
        databaseData,
        msKnowledge,
        externalData,
        session
      );
      
      // 8. Aplicar correções aprendidas
      const correctedAnswer = feedbackService.applyLearningCorrections(answer);
      
      // 9. Adicionar resposta à memória
      sessionMemoryService.addConversationEntry(
        query.sessionId,
        'assistant',
        correctedAnswer,
        { confidence: this.calculateConfidence(officialData, databaseData, msKnowledge, externalData) }
      );
      
      // 10. Salvar estatísticas de busca
      await this.saveSearchStats(query, startTime, officialData, databaseData, msKnowledge, externalData);
      
      // 11. Gerar sugestões e perguntas de acompanhamento
      const suggestions = this.generateSuggestions(query.question, officialData, databaseData, session);
      const followUpQuestions = this.generateFollowUpQuestions(query.question, session);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Guatá Human: Resposta gerada em ${processingTime}ms`);
      
      return {
        answer: correctedAnswer,
        confidence: this.calculateConfidence(officialData, databaseData, msKnowledge, externalData),
        sources: this.formatSources(officialData, databaseData, msKnowledge, externalData),
        metadata: {
          processingTime,
          sessionContext: sessionMemoryService.generateSessionSummary(query.sessionId),
          userPreferences: sessionMemoryService.getUserPreferences(query.sessionId),
          feedbackApplied: correctedAnswer !== answer,
          learningPatterns: feedbackService.getFeedbackStats().learningPatterns,
          weatherInfo: externalData.weather,
          placesInfo: externalData.places,
          transportationInfo: externalData.transportation,
          attractions: databaseData.attractions,
          itineraries: databaseData.itineraries,
          events: databaseData.events,
          partners: databaseData.partners
        },
        suggestions,
        followUpQuestions
      };
      
    } catch (error) {
      console.error('❌ Erro no Guatá Human:', error);
      return this.generateFallbackResponse(query.question, error);
    }
  }

  /**
   * Busca em fontes oficiais (PRIORIDADE)
   */
  private async searchOfficialSources(question: string): Promise<OfficialSiteData[]> {
    console.log('🔍 Buscando em fontes oficiais de MS...');
    
    try {
      const results = await msOfficialSitesScraper.searchAllOfficialSites(question);
      const allData: OfficialSiteData[] = [];
      
      results.forEach(result => {
        if (result.success) {
          allData.push(...result.data);
        }
      });
      
      console.log(`✅ Fontes oficiais: ${allData.length} resultados encontrados`);
      return allData;
      
    } catch (error) {
      console.error('❌ Erro na busca de fontes oficiais:', error);
      return [];
    }
  }

  /**
   * Busca no banco de dados PostgreSQL
   */
  private async searchDatabase(question: string): Promise<{
    attractions: TouristAttraction[];
    itineraries: Itinerary[];
    events: Event[];
    partners: VerifiedPartner[];
  }> {
    try {
      console.log('🗄️ Buscando no banco de dados PostgreSQL...');
      
      const [attractions, itineraries, events, partners] = await Promise.all([
        guataDatabaseService.searchAttractions(question),
        guataDatabaseService.getItineraries(),
        guataDatabaseService.getUpcomingEvents(30),
        guataDatabaseService.getVerifiedPartners()
      ]);
      
      console.log(`✅ Banco de dados: ${attractions.length} atrativos, ${itineraries.length} roteiros, ${events.length} eventos, ${partners.length} parceiros`);
      
      return {
        attractions,
        itineraries,
        events,
        partners
      };
    } catch (error) {
      console.error('❌ Erro na busca no banco de dados:', error);
      return {
        attractions: [],
        itineraries: [],
        events: [],
        partners: []
      };
    }
  }

  /**
   * Busca na base de conhecimento MS (COMPLEMENTO)
   */
  private async searchMSKnowledge(question: string): Promise<any[]> {
    try {
      console.log('🏛️ Buscando na base de conhecimento MS...');
      const locations = MSKnowledgeBase.searchLocations(question);
      console.log(`✅ MS Knowledge: ${locations.length} locais encontrados`);
      return locations;
    } catch (error) {
      console.error('❌ Erro na busca MS Knowledge:', error);
      return [];
    }
  }

  /**
   * Busca em APIs externas (clima, lugares, transporte)
   */
  private async searchExternalAPIs(query: GuataHumanQuery): Promise<{
    weather: WeatherInfo | null;
    places: PlaceInfo[];
    transportation: TransportationInfo[];
  }> {
    try {
      console.log('🌐 Buscando em APIs externas...');
      
      const questionType = this.analyzeQuestionType(query.question);
      const results = {
        weather: null as WeatherInfo | null,
        places: [] as PlaceInfo[],
        transportation: [] as TransportationInfo[]
      };
      
      // Buscar clima se solicitado ou se a pergunta for sobre clima
      if (query.includeWeather || questionType === 'weather') {
        const city = this.extractCityFromQuestion(query.question);
        if (city) {
          results.weather = await guataExternalAPIsService.getWeatherInfo(city);
        }
      }
      
      // Buscar lugares se solicitado ou se a pergunta for sobre hospedagem/comida
      if (query.includePlaces || ['accommodation', 'food'].includes(questionType)) {
        const location = this.extractLocationFromQuestion(query.question);
        if (location) {
          const searchTerm = this.extractSearchTermFromQuestion(query.question, questionType);
          results.places = await guataExternalAPIsService.searchPlaces(searchTerm, location);
        }
      }
      
      // Buscar transporte se solicitado ou se a pergunta for sobre transporte
      if (query.includeTransportation || questionType === 'transport') {
        const { from, to } = this.extractTransportationFromQuestion(query.question);
        if (from && to) {
          results.transportation = await guataExternalAPIsService.getTransportationInfo(from, to);
        }
      }
      
      console.log(`✅ APIs externas: clima=${!!results.weather}, lugares=${results.places.length}, transporte=${results.transportation.length}`);
      return results;
      
    } catch (error) {
      console.error('❌ Erro na busca em APIs externas:', error);
      return {
        weather: null,
        places: [],
        transportation: []
      };
    }
  }

  /**
   * Gera resposta com persona humana
   */
  private async generateHumanAnswer(
    question: string,
    officialData: OfficialSiteData[],
    databaseData: {
      attractions: TouristAttraction[];
      itineraries: Itinerary[];
      events: Event[];
      partners: VerifiedPartner[];
    },
    msKnowledge: any[],
    externalData: {
      weather: WeatherInfo | null;
      places: PlaceInfo[];
      transportation: TransportationInfo[];
    },
    session: SessionMemory
  ): Promise<string> {
    // 1. Gerar prompt contextual com persona
    const promptTemplate = guataPersonaService.generateContextualPrompt(question, {
      session,
      officialData,
      databaseData,
      msKnowledge,
      externalData
    });
    
    // 2. Construir prompt do usuário com contexto
    const userPrompt = this.buildUserPrompt(question, officialData, databaseData, msKnowledge, externalData, session);
    
    // 3. Gerar resposta com Gemini
    const geminiResponse = await generateContent(promptTemplate.system, userPrompt);
    
    if (!geminiResponse.ok) {
      throw new Error(`Erro na API Gemini: ${geminiResponse.error}`);
    }
    
    return geminiResponse.text;
  }

  /**
   * Constrói prompt do usuário com contexto completo
   */
  private buildUserPrompt(
    question: string,
    officialData: OfficialSiteData[],
    databaseData: {
      attractions: TouristAttraction[];
      itineraries: Itinerary[];
      events: Event[];
      partners: VerifiedPartner[];
    },
    msKnowledge: any[],
    externalData: {
      weather: WeatherInfo | null;
      places: PlaceInfo[];
      transportation: TransportationInfo[];
    },
    session: SessionMemory
  ): string {
    let prompt = `## 🎯 PERGUNTA DO USUÁRIO:\n${question}\n\n`;
    
    // Adicionar contexto da sessão
    if (session.conversationHistory.length > 0) {
      prompt += `## 📋 CONTEXTO DA CONVERSA:\n`;
      prompt += `Esta é a ${session.conversationHistory.length}ª pergunta nesta sessão.\n`;
      
      if (session.context.mentionedDestinations.length > 0) {
        prompt += `**Destinos mencionados:** ${session.context.mentionedDestinations.join(', ')}\n`;
      }
      
      if (session.context.mentionedActivities.length > 0) {
        prompt += `**Atividades mencionadas:** ${session.context.mentionedActivities.join(', ')}\n`;
      }
      
      prompt += `**Humor do usuário:** ${session.context.userMood}\n\n`;
    }
    
    // Adicionar dados oficiais (PRIORIDADE)
    if (officialData.length > 0) {
      prompt += `## 🌐 INFORMAÇÕES OFICIAIS ATUALIZADAS:\n`;
      officialData.slice(0, 3).forEach(data => {
        prompt += `**${data.title}**\n`;
        prompt += `${data.content}\n`;
        prompt += `📍 Fonte: ${data.source} - ${data.url}\n`;
        prompt += `📅 Atualizado: ${data.lastUpdated.toLocaleDateString()}\n\n`;
      });
    }
    
    // Adicionar dados do banco PostgreSQL
    if (databaseData.attractions.length > 0) {
      prompt += `## 🗄️ ATRATIVOS VERIFICADOS:\n`;
      databaseData.attractions.slice(0, 3).forEach(attraction => {
        prompt += `**${attraction.name}**\n`;
        prompt += `${attraction.description}\n`;
        prompt += `📍 ${attraction.city}, ${attraction.address}\n`;
        if (attraction.average_price) prompt += `💰 Preço médio: R$ ${attraction.average_price}\n`;
        if (attraction.tags.length > 0) prompt += `🏷️ Tags: ${attraction.tags.join(', ')}\n\n`;
      });
    }
    
    if (databaseData.itineraries.length > 0) {
      prompt += `## 🗺️ ROTEIROS DISPONÍVEIS:\n`;
      databaseData.itineraries.slice(0, 2).forEach(itinerary => {
        prompt += `**${itinerary.title}**\n`;
        prompt += `${itinerary.description}\n`;
        prompt += `⏱️ ${itinerary.duration_days} dias\n`;
        if (itinerary.total_cost_estimate) prompt += `💰 Custo estimado: R$ ${itinerary.total_cost_estimate}\n\n`;
      });
    }
    
    // Adicionar dados de APIs externas
    if (externalData.weather) {
      prompt += `## 🌤️ INFORMAÇÕES DO CLIMA:\n`;
      prompt += `**${externalData.weather.city}:** ${externalData.weather.temperature}°C, ${externalData.weather.description}\n`;
      prompt += `💨 Vento: ${externalData.weather.wind_speed} km/h\n`;
      prompt += `💧 Umidade: ${externalData.weather.humidity}%\n`;
      prompt += `📅 Fonte: ${externalData.weather.source}\n\n`;
    }
    
    if (externalData.places.length > 0) {
      prompt += `## 🏪 LUGARES ENCONTRADOS:\n`;
      externalData.places.slice(0, 2).forEach(place => {
        prompt += `**${place.name}**\n`;
        prompt += `📍 ${place.address}\n`;
        if (place.rating) prompt += `⭐ ${place.rating}/5 (${place.review_count} avaliações)\n`;
        if (place.phone) prompt += `📞 ${place.phone}\n`;
        prompt += `🌐 Fonte: ${place.source}\n\n`;
      });
    }
    
    // Adicionar conhecimento MS (COMPLEMENTO)
    if (msKnowledge.length > 0) {
      prompt += `## 🏛️ DADOS VERIFICADOS DE MS:\n`;
      msKnowledge.slice(0, 2).forEach(loc => {
        prompt += `**${loc.name}**\n`;
        prompt += `📍 ${loc.address}\n`;
        if (loc.hours) prompt += `🕒 ${loc.hours}\n`;
        if (loc.contact) prompt += `📞 ${loc.contact}\n\n`;
      });
    }
    
    // Adicionar preferências do usuário
    const preferences = session.userPreferences;
    if (preferences.interests.length > 0 || preferences.travelStyle !== 'cultural') {
      prompt += `## 👤 PREFERÊNCIAS DO USUÁRIO:\n`;
      prompt += `**Estilo de viagem:** ${preferences.travelStyle}\n`;
      prompt += `**Orçamento:** ${preferences.budget}\n`;
      prompt += `**Grupo:** ${preferences.groupSize} pessoa(s)\n`;
      if (preferences.interests.length > 0) {
        prompt += `**Interesses:** ${preferences.interests.join(', ')}\n`;
      }
      prompt += `\n`;
    }
    
    prompt += `## 💡 INSTRUÇÕES:\n`;
    prompt += `Responda de forma humana, acolhedora e específica. Use as informações oficiais como fonte principal. Seja entusiasta sobre MS e sugira experiências únicas. Adapte sua resposta ao contexto da conversa e às preferências do usuário.`;
    
    return prompt;
  }

  /**
   * Analisa o tipo de pergunta
   */
  private analyzeQuestionType(question: string): string {
    const text = question.toLowerCase();
    
    if (text.includes('roteiro') || text.includes('itinerário')) return 'itinerary';
    if (text.includes('hotel') || text.includes('hospedagem')) return 'accommodation';
    if (text.includes('restaurante') || text.includes('comida')) return 'food';
    if (text.includes('transporte') || text.includes('ônibus')) return 'transport';
    if (text.includes('preço') || text.includes('custo')) return 'price';
    if (text.includes('clima') || text.includes('tempo')) return 'weather';
    
    return 'general';
  }

  /**
   * Calcula confiança da resposta
   */
  private calculateConfidence(
    officialData: OfficialSiteData[],
    databaseData: {
      attractions: TouristAttraction[];
      itineraries: Itinerary[];
      events: Event[];
      partners: VerifiedPartner[];
    },
    msKnowledge: any[],
    externalData: {
      weather: WeatherInfo | null;
      places: PlaceInfo[];
      transportation: TransportationInfo[];
    }
  ): number {
    let confidence = 0.3; // Base mínima
    
    // Fontes oficiais (PRIORIDADE)
    if (officialData.length > 0) {
      confidence += Math.min(officialData.length * 0.25, 0.6);
      
      // Bonus para fontes governamentais
      const govSources = officialData.filter(data => data.source.includes('.gov.br'));
      if (govSources.length > 0) {
        confidence += 0.2;
      }
    }
    
    // Banco de dados PostgreSQL
    if (databaseData.attractions.length > 0) {
      confidence += Math.min(databaseData.attractions.length * 0.15, 0.3);
    }
    
    if (databaseData.itineraries.length > 0) {
      confidence += Math.min(databaseData.itineraries.length * 0.1, 0.2);
    }
    
    // APIs externas
    if (externalData.weather) confidence += 0.1;
    if (externalData.places.length > 0) confidence += Math.min(externalData.places.length * 0.05, 0.15);
    if (externalData.transportation.length > 0) confidence += 0.1;
    
    // Base MS (COMPLEMENTO)
    if (msKnowledge.length > 0) {
      confidence += Math.min(msKnowledge.length * 0.15, 0.3);
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Formata fontes para resposta
   */
  private formatSources(
    officialData: OfficialSiteData[],
    databaseData: {
      attractions: TouristAttraction[];
      itineraries: Itinerary[];
      events: Event[];
      partners: VerifiedPartner[];
    },
    msKnowledge: any[],
    externalData: {
      weather: WeatherInfo | null;
      places: PlaceInfo[];
      transportation: TransportationInfo[];
    }
  ): GuataHumanResponse['sources'] {
    const sources: GuataHumanResponse['sources'] = [];
    
    // Fontes oficiais
    officialData.slice(0, 3).forEach(data => {
      sources.push({
        title: data.title,
        url: data.url,
        type: 'official_site',
        reliability: 'high'
      });
    });
    
    // Banco de dados
    databaseData.attractions.slice(0, 2).forEach(attraction => {
      sources.push({
        title: attraction.name,
        url: attraction.website,
        type: 'database',
        reliability: 'high',
        data: attraction
      });
    });
    
    // APIs externas
    if (externalData.weather) {
      sources.push({
        title: `Clima em ${externalData.weather.city}`,
        url: undefined,
        type: 'weather',
        reliability: 'high',
        data: externalData.weather
      });
    }
    
    if (externalData.places.length > 0) {
      externalData.places.slice(0, 2).forEach(place => {
        sources.push({
          title: place.name,
          url: place.website,
          type: 'places',
          reliability: 'medium',
          data: place
        });
      });
    }
    
    // Base MS
    msKnowledge.slice(0, 2).forEach(loc => {
      sources.push({
        title: loc.name,
        url: loc.contact?.website,
        type: 'ms_knowledge',
        reliability: 'medium'
      });
    });
    
    return sources;
  }

  /**
   * Gera sugestões para o usuário
   */
  private generateSuggestions(
    question: string,
    officialData: OfficialSiteData[],
    databaseData: {
      attractions: TouristAttraction[];
      itineraries: Itinerary[];
      events: Event[];
      partners: VerifiedPartner[];
    },
    session: SessionMemory
  ): string[] {
    const suggestions: string[] = [];
    
    // Sugestões baseadas no tipo de pergunta
    const questionType = this.analyzeQuestionType(question);
    
    switch (questionType) {
      case 'itinerary':
        suggestions.push('🗺️ Quer que eu monte um roteiro detalhado?');
        suggestions.push('📅 Quantos dias você tem disponíveis?');
        suggestions.push('🎯 Tem alguma atividade específica em mente?');
        break;
      case 'accommodation':
        suggestions.push('🏨 Qual sua faixa de preço preferida?');
        suggestions.push('📍 Prefere ficar no centro ou mais afastado?');
        suggestions.push('👥 Quantas pessoas vão viajar?');
        break;
      case 'food':
        suggestions.push('🍽️ Quer experimentar pratos típicos de MS?');
        suggestions.push('🌶️ Tem preferência por sabores?');
        suggestions.push('💰 Qual faixa de preço?');
        break;
      case 'weather':
        suggestions.push('🌤️ Quer previsão para outros dias?');
        suggestions.push('🌡️ Precisa de informações sobre melhor época para visitar?');
        break;
      case 'transport':
        suggestions.push('🚌 Quer informações sobre outras opções de transporte?');
        suggestions.push('🚗 Precisa de rota de carro?');
        break;
      default:
        suggestions.push('🗺️ Quer conhecer outros destinos de MS?');
        suggestions.push('📅 Tem alguma data específica em mente?');
        suggestions.push('🎯 Que tipo de experiência busca?');
    }
    
    // Sugestões baseadas nos dados do banco
    if (databaseData.attractions.length > 0) {
      suggestions.push(`🏞️ Que tal conhecer ${databaseData.attractions[0].name}?`);
    }
    
    if (databaseData.itineraries.length > 0) {
      suggestions.push(`🗺️ Temos roteiros prontos! Quer ver o "${databaseData.itineraries[0].title}"?`);
    }
    
    // Sugestões baseadas no contexto da sessão
    if (session.context.mentionedDestinations.length > 0) {
      suggestions.push(`📍 Que tal explorar mais sobre ${session.context.mentionedDestinations[0]}?`);
    }
    
    return suggestions.slice(0, 4);
  }

  /**
   * Gera perguntas de acompanhamento
   */
  private generateFollowUpQuestions(question: string, session: SessionMemory): string[] {
    const questions: string[] = [];
    
    // Perguntas baseadas no contexto
    if (session.context.userMood === 'planning') {
      questions.push('📅 Quando você planeja fazer essa viagem?');
      questions.push('👥 Vai viajar sozinho ou em grupo?');
      questions.push('💰 Qual seu orçamento aproximado?');
    } else if (session.context.userMood === 'urgent') {
      questions.push('⏰ Precisa dessa informação para quando?');
      questions.push('🚨 É algo que posso ajudar a resolver agora?');
    } else {
      questions.push('🤔 Tem mais alguma dúvida sobre MS?');
      questions.push('💡 Quer que eu sugira outras experiências?');
    }
    
    return questions.slice(0, 2);
  }

  /**
   * Gera resposta de fallback em caso de erro
   */
  private generateFallbackResponse(question: string, error: any): GuataHumanResponse {
    console.log('🔄 Gerando resposta de fallback...');
    
    const fallbackAnswer = `Olá! 😊 Estou com algumas dificuldades técnicas no momento, mas posso te ajudar com informações básicas sobre turismo em MS.

Para sua pergunta sobre "${question}", recomendo:

🌐 **Consultar sites oficiais:**
• turismo.ms.gov.br - Portal oficial de turismo
• visitms.com.br - Visit MS oficial

📞 **Contatar diretamente:**
• Fundtur-MS: (67) 3318-5000
• Email: fundtur@ms.gov.br

💡 **Dica:** Tente reformular sua pergunta ou me pergunte sobre outros destinos de MS. Estou aqui para ajudar! 🚀`;

    return {
      answer: fallbackAnswer,
      confidence: 0.3,
      sources: [{
        title: 'Sites oficiais de turismo MS',
        url: 'https://turismo.ms.gov.br',
        type: 'official_site',
        reliability: 'high'
      }],
      metadata: {
        processingTime: 0,
        sessionContext: 'Erro técnico - usando fallback',
        userPreferences: null,
        feedbackApplied: false,
        learningPatterns: 0
      }
    };
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Extrai cidade da pergunta
   */
  private extractCityFromQuestion(question: string): string | null {
    const cities = ['Campo Grande', 'Bonito', 'Corumbá', 'Dourados', 'Três Lagoas', 'Ponta Porã'];
    const questionLower = question.toLowerCase();
    
    for (const city of cities) {
      if (questionLower.includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return null;
  }

  /**
   * Extrai localização da pergunta
   */
  private extractLocationFromQuestion(question: string): string | null {
    const cities = ['Campo Grande', 'Bonito', 'Corumbá', 'Dourados', 'Três Lagoas', 'Ponta Porã'];
    const questionLower = question.toLowerCase();
    
    for (const city of cities) {
      if (questionLower.includes(city.toLowerCase())) {
        return city;
      }
    }
    
    return 'Campo Grande'; // Padrão
  }

  /**
   * Extrai termo de busca da pergunta
   */
  private extractSearchTermFromQuestion(question: string, questionType: string): string {
    const questionLower = question.toLowerCase();
    
    if (questionType === 'accommodation') {
      if (questionLower.includes('hotel')) return 'hotel';
      if (questionLower.includes('pousada')) return 'pousada';
      if (questionLower.includes('hospedagem')) return 'hospedagem';
      return 'hotel';
    }
    
    if (questionType === 'food') {
      if (questionLower.includes('restaurante')) return 'restaurante';
      if (questionLower.includes('comida')) return 'comida';
      if (questionLower.includes('gastronomia')) return 'gastronomia';
      return 'restaurante';
    }
    
    return 'estabelecimento';
  }

  /**
   * Extrai informações de transporte da pergunta
   */
  private extractTransportationFromQuestion(question: string): { from: string | null; to: string | null } {
    const questionLower = question.toLowerCase();
    const cities = ['Campo Grande', 'Bonito', 'Corumbá', 'Dourados', 'Três Lagoas', 'Ponta Porã'];
    
    let from: string | null = null;
    let to: string | null = null;
    
    for (const city of cities) {
      if (questionLower.includes(`de ${city.toLowerCase()}`) || questionLower.includes(`da ${city.toLowerCase()}`)) {
        from = city;
      }
      if (questionLower.includes(`para ${city.toLowerCase()}`) || questionLower.includes(`em ${city.toLowerCase()}`)) {
        to = city;
      }
    }
    
    return { from, to };
  }

  /**
   * Salva estatísticas de busca
   */
  private async saveSearchStats(
    query: GuataHumanQuery,
    startTime: number,
    officialData: OfficialSiteData[],
    databaseData: {
      attractions: TouristAttraction[];
      itineraries: Itinerary[];
      events: Event[];
      partners: VerifiedPartner[];
    },
    msKnowledge: any[],
    externalData: {
      weather: WeatherInfo | null;
      places: PlaceInfo[];
      transportation: TransportationInfo[];
    }
  ): Promise<void> {
    try {
      const responseTime = Date.now() - startTime;
      const totalResults = officialData.length + databaseData.attractions.length + 
                          databaseData.itineraries.length + msKnowledge.length + 
                          externalData.places.length;
      
      await guataDatabaseService.saveSearchStats({
        session_id: query.sessionId,
        user_id: query.userId,
        query: query.question,
        query_category: this.analyzeQuestionType(query.question),
        results_count: totalResults,
        response_time_ms: responseTime,
        confidence_score: this.calculateConfidence(officialData, databaseData, msKnowledge, externalData),
        sources_used: {
          official_sites: officialData.length,
          database: databaseData.attractions.length + databaseData.itineraries.length,
          ms_knowledge: msKnowledge.length,
          external_apis: externalData.places.length + (externalData.weather ? 1 : 0)
        }
      });
    } catch (error) {
      console.error('❌ Erro ao salvar estatísticas de busca:', error);
    }
  }

  /**
   * Registra feedback do usuário
   */
  registerFeedback(
    sessionId: string,
    questionId: string,
    originalQuestion: string,
    originalAnswer: string,
    rating: 'positive' | 'negative' | 'neutral',
    comment?: string,
    correction?: string
  ): string {
    return feedbackService.registerFeedback(
      sessionId,
      questionId,
      originalQuestion,
      originalAnswer,
      rating,
      comment,
      correction
    );
  }

  /**
   * Obtém estatísticas do sistema
   */
  getSystemStats(): {
    sessions: any;
    feedback: any;
    officialSites: any;
    database: any;
    externalAPIs: any;
    persistentMemory: any;
  } {
    return {
      sessions: sessionMemoryService.getSessionStats(),
      feedback: feedbackService.getFeedbackStats(),
      officialSites: msOfficialSitesScraper.getSearchStats(),
      database: guataDatabaseService.getDatabaseStats(),
      externalAPIs: guataExternalAPIsService.getServiceStatus(),
      persistentMemory: persistentMemoryService.getMemoryStats()
    };
  }

  /**
   * Gera relatório de aprendizado
   */
  generateLearningReport(): string {
    return feedbackService.generateLearningReport();
  }
}

// Instância singleton
export const guataHumanService = new GuataHumanService();
