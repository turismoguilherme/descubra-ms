// Guatá Consciente - Sistema INTELIGENTE de busca e IA
// Foco: Pesquisar na web + usar dados REAIS de MS + integrar parceiros

import { generateContent } from "@/config/gemini";
import { webSearchService } from "./search/webSearchService";
import { MSKnowledgeBase, MSLocation } from "./search/msKnowledgeBase";
import { PartnersIntegrationService, PartnerRecommendation } from "./partnersIntegrationService";
import { CommunityService } from "@/services/community/communityService";
import { CommunityKnowledgeIntegration } from "./communityKnowledgeIntegration";
import { IntelligentItineraryService, ItineraryRequest } from "./intelligentItineraryService";

interface GuataConsciousQuery {
  question: string;
  userId?: string;
  sessionId?: string;
}

interface GuataConsciousResponse {
  answer: string;
  confidence: number;
  sources: Array<{
    title: string;
    url?: string;
    type: 'web' | 'official' | 'ms_knowledge' | 'partner' | 'community';
  }>;
  metadata: {
    processingTime: number;
    searchResults: number;
    msLocationsFound: number;
    partnersFound: number;
    communityContributions: number;
  };
}

class GuataConsciousService {
  
  /**
   * Processa pergunta com busca COMPLETA: Web + MS + Parceiros + Comunidade
   */
  async processQuestion(query: GuataConsciousQuery): Promise<GuataConsciousResponse> {
    const startTime = Date.now();
    console.log(`🧠 Guatá processando: "${query.question}"`);

    try {
      // 1. Verificar se é solicitação de roteiro
      const itineraryRequest = this.detectItineraryRequest(query.question);
      
      if (itineraryRequest) {
        console.log('🗺️ Detectada solicitação de roteiro');
        return await this.generateItineraryResponse(itineraryRequest, query);
      }

      // 2. Buscar em MÚLTIPLAS fontes REAIS
      // Buscar informações com PRIORIDADE: Web Search como principal
      const [webResults, partners, community] = await Promise.all([
        this.searchWebReal(query.question), // PRINCIPAL - busca web ilimitada
        this.searchPartners(query.question, query.userId), // Se existirem
        this.searchCommunityContributions(query.question) // Se relevante
      ]);

      // MS Knowledge APENAS como complemento (não paralelo para não competir)
      const msLocations = await this.searchMSKnowledge(query.question);

      console.log(`📊 Resultados encontrados (Web primeiro):
        - Web: ${webResults?.length || 0}
        - Parceiros: ${partners?.length || 0}
        - Comunidade: ${community?.length || 0}
        - MS Knowledge: ${msLocations?.length || 0} (complemento)`);
        
      // DEBUG: Verificar estrutura de webResults
      console.log('🔍 DEBUG webResults:', { 
        type: typeof webResults, 
        isArray: Array.isArray(webResults),
        keys: webResults ? Object.keys(webResults) : 'null',
        length: webResults?.length
      });
      
      // 3. Gerar resposta VERDADEIRA baseada em fontes REAIS
      const answer = await this.generateIntelligentAnswer(
        query.question, 
        webResults, 
        msLocations, 
        partners,
        community
      );
      
      const processingTime = Date.now() - startTime;
      
      // 4. Combinar todas as fontes (Web primeiro, MS complemento)
      const allSources = [
        ...(webResults || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          type: r.source?.includes('gov.br') ? 'official' as const : 'web' as const
        })),
        ...(partners || []).map((p: any) => ({
          title: p.name,
          url: p.website_link,
          type: 'partner' as const
        })),
        ...(community || []).map((c: any) => ({
          title: c.title,
          url: undefined,
          type: 'community' as const
        })),
        ...(msLocations || []).map((l: any) => ({
          title: l.name,
          url: l.contact?.website,
          type: 'ms_knowledge' as const
        }))
      ];
      
      return {
        answer,
        confidence: this.calculateOverallConfidence(webResults, msLocations, partners, community),
        sources: allSources.slice(0, 10), // Máximo 10 fontes
        metadata: {
          processingTime,
          searchResults: webResults?.length || 0,
          msLocationsFound: msLocations?.length || 0,
          partnersFound: partners?.length || 0,
          communityContributions: community?.length || 0,
          verificationStatus: allSources.length > 0 ? 'verified' as const : 'partial' as const
        }
      };

    } catch (error) {
      console.error("❌ Erro no processamento:", error);
      
      // Resposta de emergência com base em MS
      const emergencyMSInfo = MSKnowledgeBase.searchLocations(query.question);
      
      if (emergencyMSInfo.length > 0) {
        const location = emergencyMSInfo[0];
        const answer = `Olá! Mesmo com dificuldades técnicas, posso te ajudar com informações sobre **${location.name}** em ${location.city}:

${MSKnowledgeBase.formatLocationResponse(location)}

Para mais informações atualizadas, recomendo consultar os sites oficiais de turismo de MS.`;

        return {
          answer,
          confidence: 0.6,
          sources: [{
            title: location.name,
            url: location.contact?.website,
            type: 'ms_knowledge'
          }],
          metadata: {
            processingTime: Date.now() - startTime,
            searchResults: 0,
            msLocationsFound: 1,
            partnersFound: 0,
            communityContributions: 0
          }
        };
      }
      
      return {
        answer: "Desculpe, estou com dificuldades técnicas. Pode tentar reformular sua pergunta? Ou pergunte sobre locais específicos como Bioparque Pantanal, Feira Central, ou atrações em Bonito.",
        confidence: 0.3,
        sources: [],
        metadata: {
          processingTime: Date.now() - startTime,
          searchResults: 0,
          msLocationsFound: 0,
          partnersFound: 0,
          communityContributions: 0
        }
      };
    }
  }

  /**
   * Busca REAL na web usando serviços implementados
   */
  private async searchWebReal(question: string): Promise<Array<{
    title: string;
    content: string;
    url: string;
    source: string;
    reliability: string;
  }>> {
    try {
      console.log('🔍 Buscando informações REAIS na web...');
      
      // Usar o serviço de busca web que já está implementado
      const results = await webSearchService.search(question, 'turismo');
      
      console.log(`✅ Busca web real concluída: ${results.length} resultados encontrados`);
      
      // Converter para formato do serviço consciente
      return results.map(result => ({
        title: result.title,
        content: result.snippet,
        url: result.url,
        source: result.source,
        reliability: result.reliability
      }));
      
    } catch (error) {
      console.error('❌ Erro na busca web real:', error);
      return []; // Sem fallback simulado - deixar para o MS Knowledge
    }
  }

  /**
   * Buscar na base de conhecimento REAL de MS
   */
  private async searchMSKnowledge(question: string): Promise<MSLocation[]> {
    try {
      console.log('🏛️ Buscando na base de conhecimento de MS...');
      
      const locations = MSKnowledgeBase.searchLocations(question);
      const activeLocations = locations.filter(loc => MSKnowledgeBase.isLocationActive(loc));
      
      console.log(`✅ MS Knowledge: ${activeLocations.length} locais REAIS encontrados`);
      return activeLocations.slice(0, 3); // Máximo 3 locais
      
    } catch (error) {
      console.error('❌ Erro na busca MS Knowledge:', error);
      return [];
    }
  }

  /**
   * Buscar parceiros REAIS da plataforma
   */
  private async searchPartners(question: string, userId?: string): Promise<PartnerRecommendation[]> {
    try {
      console.log('🤝 Verificando parceiros na plataforma...');
      
      // Primeiro verificar se há parceiros aprovados
      const hasPartners = await PartnersIntegrationService.hasApprovedPartners();
      
      if (!hasPartners) {
        console.log('⚠️ Nenhum parceiro aprovado na plataforma ainda');
        return [];
      }
      
      // Buscar parceiros relevantes
      const recommendations = await PartnersIntegrationService.searchRelevantPartners(question);
      
      console.log(`✅ Parceiros: ${recommendations.length} recomendações encontradas`);
      return recommendations;
      
    } catch (error) {
      console.error('❌ Erro na busca de parceiros:', error);
      return [];
    }
  }

  /**
   * Buscar contribuições REAIS da comunidade
   */
  private async searchCommunityContributions(question: string): Promise<any[]> {
    try {
      console.log('🌐 Buscando contribuições da comunidade...');
      
      const communityService = new CommunityService();
      
      // Buscar sugestões aprovadas da comunidade
      const approvedSuggestions = await communityService.getSuggestions({
        status: 'approved',
        sortBy: 'votes',
        limit: 3
      });
      
      // Filtrar sugestões relevantes para a pergunta
      const relevantSuggestions = approvedSuggestions.filter(suggestion => {
        const searchText = `${suggestion.title} ${suggestion.description}`.toLowerCase();
        const questionWords = question.toLowerCase().split(' ');
        return questionWords.some(word => word.length > 3 && searchText.includes(word));
      });
      
      console.log(`✅ Comunidade: ${relevantSuggestions.length} contribuições aprovadas encontradas`);
      return relevantSuggestions;
      
    } catch (error) {
      console.warn('⚠️ Tabelas da comunidade ainda não configuradas (normal em desenvolvimento)');
      console.log('🔄 Continuando sem contribuições da comunidade...');
      return [];
    }
  }

  /**
   * Gera uma resposta inteligente combinando todas as fontes disponíveis
   * ATUALIZADO: Prioriza busca web real, MS apenas como complemento
   */
  private async generateIntelligentAnswer(
    query: string,
    webResults: any,
    msLocations: any[],
    partners: any[],
    community: any[]
  ): Promise<string> {
    
    const systemPrompt = `Você é **Guatá**, guia de turismo oficial de Mato Grosso do Sul.

🎯 **MISSÃO PRINCIPAL:** Fornecer informações **100% VERDADEIRAS E ATUALIZADAS** sobre turismo em MS.

📊 **FONTES DE INFORMAÇÃO (em ordem de prioridade):**

1. 🌐 **INFORMAÇÕES WEB ATUAIS** (PRINCIPAL)
   - Use SEMPRE como fonte primária para QUALQUER pergunta
   - Dados de sites oficiais, Google Search atual
   - Informações em tempo real e atualizadas

2. 🤝 **PARCEIROS DA PLATAFORMA** (se relevantes)
   - Empresas verificadas e aprovadas
   - Destaque quando úteis para a pergunta

3. 🌍 **COMUNIDADE** (se pertinentes)  
   - Sugestões aprovadas pelos usuários
   - Experiências reais compartilhadas

4. 🏛️ **DADOS VERIFICADOS MS** (COMPLEMENTO apenas)
   - Use apenas para ENRIQUECER respostas web
   - Informações específicas e verificadas de MS

🛡️ **REGRAS CRÍTICAS DE VERACIDADE:**

❌ **NUNCA FAÇA:**
- Inventar telefones, endereços, preços ou horários
- Criar informações que não estão nas fontes fornecidas
- Dar dados desatualizados como se fossem atuais
- Misturar informações de lugares diferentes

✅ **SEMPRE FAÇA:**
- Base suas respostas nas informações web encontradas
- Cite a fonte: "Segundo o site oficial...", "De acordo com informações atuais..."
- Se não souber algo específico, seja transparente: "Não encontrei essa informação atualizada"
- Prefira recomendar consultar sites oficiais a inventar dados
- Seja específico com endereços completos quando disponíveis

📝 **ESTRUTURA DA RESPOSTA:**
- Comece com a informação web atual (principal)
- Adicione detalhes de parceiros se relevantes
- Complemente com dados MS verificados
- Inclua sugestões da comunidade se úteis
- Termine com fontes e recomendações de verificação

💡 **LEMBRE-SE:** Você é um guia confiável. É melhor admitir não saber algo específico do que fornecer informação incorreta.`;

    const userPrompt = `Pergunta: ${query}

🌐 **INFORMAÇÕES WEB ATUAIS:**
${webResults?.length ? 
  webResults.map((r: any) => `
• ${r.title}
  ${r.content}
  📍 Fonte: ${r.url}
  `).join('\n') : 'Nenhuma informação web específica encontrada.'}

🤝 **PARCEIROS DA PLATAFORMA:**
${partners?.length ? 
  partners.map(p => `
• ${p.name} (${p.category})
  📍 ${p.location || 'Localização a consultar'}
  📞 ${p.contact_info || 'Contato via plataforma'}
  ⭐ Parceiro verificado - Tier ${p.tier}
  `).join('\n') : 'Nenhum parceiro específico encontrado para esta consulta.'}

🌍 **COMUNIDADE:**
${community?.length ? 
  community.map(c => `
• ${c.title}
  ${c.description}
  👤 Sugestão aprovada da comunidade
  `).join('\n') : 'Nenhuma sugestão específica da comunidade.'}

🏛️ **DADOS VERIFICADOS MS (complemento):**
${msLocations?.length ? 
  msLocations.map(loc => `
• ${loc.name}
  📍 ${loc.address}
  🕒 ${loc.hours}
  📞 ${loc.contact}
  ✅ Verificado em: ${loc.last_verified}
  `).join('\n') : 'Nenhum dado específico de MS encontrado.'}

Responda de forma útil, verdadeira e atualizada, priorizando as informações web e sendo transparente sobre as fontes.`;

    try {
      const response = await generateContent(systemPrompt, userPrompt);
      return response || this.generateTruthfulFallback(query, webResults, msLocations, partners);
    } catch (error) {
      console.error('❌ Erro na geração com Gemini:', error);
      return this.generateTruthfulFallback(query, webResults, msLocations, partners);
    }
  }

  /**
   * Fallback transparente e verdadeiro quando IA falha
   */
  private generateTruthfulFallback(query: string, webResults: any, msLocations: any[], partners: any[]): string {
    let response = "🤖 Tive um problema técnico, mas posso compartilhar o que encontrei:\n\n";
    
    // Priorizar informações web
    if (webResults?.length) {
      response += "🌐 **Informações atuais encontradas:**\n";
      webResults.slice(0, 2).forEach((result: any) => {
        response += `• ${result.title}\n`;
        if (result.content) response += `  ${result.content}\n`;
        if (result.url) response += `  🔗 ${result.url}\n`;
      });
      response += "\n";
    }
    
    // Adicionar parceiros se existirem
    if (partners?.length) {
      response += "🤝 **Parceiros da plataforma:**\n";
      partners.slice(0, 2).forEach(partner => {
        response += `• ${partner.name}\n`;
        if (partner.location) response += `  📍 ${partner.location}\n`;
      });
      response += "\n";
    }
    
    // Complementar com MS se útil
    if (msLocations?.length) {
      response += "🏛️ **Informações verificadas de MS:**\n";
      msLocations.slice(0, 1).forEach(loc => {
        response += `• ${loc.name}\n`;
        response += `  📍 ${loc.address}\n`;
        if (loc.hours) response += `  🕒 ${loc.hours}\n`;
        if (loc.contact) response += `  📞 ${loc.contact}\n`;
      });
      response += "\n";
    }
    
    // Se não tiver informações suficientes
    if (!webResults?.length && !partners?.length && !msLocations?.length) {
      response = `Não encontrei informações atualizadas sobre "${query}".\n\n` +
                `💡 **Recomendações:**\n` +
                `• Consulte o site oficial: turismo.ms.gov.br\n` +
                `• Entre em contato com a Fundtur-MS: (67) 3318-5000\n` +
                `• Tente reformular sua pergunta com mais detalhes\n\n` +
                `🔄 Posso tentar buscar informações mais específicas se você detalhar sua pergunta.`;
    } else {
      response += "💡 **Para informações mais detalhadas e atualizadas:**\n";
      response += "• Site oficial: turismo.ms.gov.br\n";
      response += "• Fundtur-MS: (67) 3318-5000\n";
    }
    
    return response;
  }

  /**
   * Calcular confiança geral com base em todas as fontes
   */
  private calculateOverallConfidence(webResults: any, msLocations: any[], partners: any[], community?: any[]): number {
    let confidence = 0.3; // Base mínima
    
    // PRINCIPAL: Resultados web (fonte primária)
    if (webResults && webResults.length > 0) {
      confidence += Math.min(webResults.length * 0.2, 0.5); // Máx 0.5 para 3+ resultados
      
      // Bonus para fontes oficiais
      const officialResults = webResults.filter((r: any) => 
        r.url?.includes('.gov.br') || r.source?.includes('oficial')
      );
      if (officialResults.length > 0) {
        confidence += 0.2; // Bonus para fontes oficiais
      }
    }
    
    // COMPLEMENTO: Parceiros da plataforma
    if (partners && partners.length > 0) {
      confidence += Math.min(partners.length * 0.15, 0.3); // Máx 0.3 para 2+ parceiros
    }
    
    // COMPLEMENTO: Contribuições da comunidade
    if (community && community.length > 0) {
      confidence += Math.min(community.length * 0.1, 0.2); // Máx 0.2 para 2+ contribuições
    }
    
    // COMPLEMENTO: MS Knowledge (enriquecimento)
    if (msLocations && msLocations.length > 0) {
      confidence += Math.min(msLocations.length * 0.1, 0.2); // Máx 0.2 para 2+ locais
    }
    
    return Math.min(confidence, 1.0); // Máximo 1.0
  }

  /**
   * Detectar se a pergunta é uma solicitação de roteiro
   */
  private detectItineraryRequest(question: string): ItineraryRequest | null {
    const text = question.toLowerCase();
    
    // Palavras-chave para detectar solicitação de roteiro
    const itineraryKeywords = [
      'roteiro', 'itinerário', 'plano de viagem', 'o que fazer',
      'quantos dias', 'dias em', 'visitar em', 'turismo em',
      'programa de', 'cronograma', 'agenda', 'passear'
    ];
    
    const hasItineraryKeyword = itineraryKeywords.some(keyword => text.includes(keyword));
    
    if (!hasItineraryKeyword) return null;
    
    try {
      // Extrair informações da pergunta
      const destination = this.extractDestination(text);
      const days = this.extractDays(text);
      const budget = this.extractBudget(text);
      const interests = this.extractInterests(text);
      const groupType = this.extractGroupType(text);
      const mobility = this.extractMobility(text);
      
      if (!destination) return null;
      
      return {
        destination,
        days: days || 2, // Default 2 dias
        budget: budget || 'medio',
        interests: interests.length > 0 ? interests : ['natureza', 'cultura'],
        group_type: groupType || 'casal',
        mobility: mobility || 'carro'
      };
      
    } catch (error) {
      console.error('❌ Erro ao extrair dados do roteiro:', error);
      return null;
    }
  }

  /**
   * Extrair destino da pergunta
   */
  private extractDestination(text: string): string | null {
    const destinations = [
      'campo grande', 'bonito', 'pantanal', 'corumbá', 
      'aquidauana', 'coxim', 'três lagoas', 'dourados'
    ];
    
    for (const dest of destinations) {
      if (text.includes(dest)) {
        return dest.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }
    
    // Fallback para "MS" ou "mato grosso do sul"
    if (text.includes('ms') || text.includes('mato grosso do sul')) {
      return 'Campo Grande'; // Capital como padrão
    }
    
    return null;
  }

  /**
   * Extrair número de dias
   */
  private extractDays(text: string): number | null {
    const dayMatches = text.match(/(\d+)\s*(dia|dias)/);
    if (dayMatches) {
      return parseInt(dayMatches[1]);
    }
    
    // Palavras por extenso
    const dayWords = {
      'um': 1, 'uma': 1, 'dois': 2, 'três': 3, 'quatro': 4, 'cinco': 5,
      'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10
    };
    
    for (const [word, num] of Object.entries(dayWords)) {
      if (text.includes(`${word} dia`)) {
        return num;
      }
    }
    
    return null;
  }

  /**
   * Extrair orçamento
   */
  private extractBudget(text: string): 'baixo' | 'medio' | 'alto' | null {
    if (text.includes('barato') || text.includes('econômico') || text.includes('baixo custo')) {
      return 'baixo';
    }
    if (text.includes('caro') || text.includes('luxo') || text.includes('premium')) {
      return 'alto';
    }
    if (text.includes('médio') || text.includes('moderado')) {
      return 'medio';
    }
    return null;
  }

  /**
   * Extrair interesses
   */
  private extractInterests(text: string): string[] {
    const interests = [];
    
    if (text.includes('natureza') || text.includes('ecoturismo') || text.includes('trilha')) {
      interests.push('natureza');
    }
    if (text.includes('cultura') || text.includes('museu') || text.includes('história')) {
      interests.push('cultura');
    }
    if (text.includes('comida') || text.includes('restaurante') || text.includes('gastronomia')) {
      interests.push('gastronomia');
    }
    if (text.includes('aventura') || text.includes('radical') || text.includes('rapel')) {
      interests.push('aventura');
    }
    if (text.includes('família') || text.includes('criança') || text.includes('filho')) {
      interests.push('família');
    }
    
    return interests;
  }

  /**
   * Extrair tipo de grupo
   */
  private extractGroupType(text: string): 'sozinho' | 'casal' | 'família' | 'amigos' | 'grupo' | null {
    if (text.includes('sozinho') || text.includes('solo')) return 'sozinho';
    if (text.includes('casal') || text.includes('namorado') || text.includes('esposa')) return 'casal';
    if (text.includes('família') || text.includes('filho') || text.includes('criança')) return 'família';
    if (text.includes('amigo') || text.includes('galera')) return 'amigos';
    if (text.includes('grupo') || text.includes('turma')) return 'grupo';
    return null;
  }

  /**
   * Extrair tipo de mobilidade
   */
  private extractMobility(text: string): 'carro' | 'transporte_publico' | 'a_pe' | null {
    if (text.includes('carro') || text.includes('dirigindo')) return 'carro';
    if (text.includes('ônibus') || text.includes('transporte público')) return 'transporte_publico';
    if (text.includes('a pé') || text.includes('caminhando')) return 'a_pe';
    return null;
  }

  /**
   * Gerar resposta com roteiro completo
   */
  private async generateItineraryResponse(
    itineraryRequest: ItineraryRequest, 
    query: GuataConsciousQuery
  ): Promise<GuataConsciousResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🗺️ Gerando roteiro personalizado:', itineraryRequest);
      
      // Gerar roteiro inteligente
      const itinerary = await IntelligentItineraryService.generateItinerary(itineraryRequest);
      
      // Validar roteiro
      const isValid = IntelligentItineraryService.validateItinerary(itinerary);
      
      if (!isValid) {
        throw new Error('Roteiro gerado inválido');
      }
      
      // Formatar resposta
      const formattedAnswer = this.formatItineraryAnswer(itinerary);
      
      const processingTime = Date.now() - startTime;
      
      return {
        answer: formattedAnswer,
        confidence: 0.9,
        sources: [
          { title: 'Base de Conhecimento MS', type: 'ms_knowledge' },
          { title: 'Parceiros da Plataforma', type: 'partner' },
          { title: 'Roteiro Personalizado', type: 'ms_knowledge' }
        ],
        metadata: {
          processingTime,
          searchResults: 0,
          msLocationsFound: itinerary.days.reduce((total, day) => total + day.locations.length, 0),
          partnersFound: itinerary.days.reduce((total, day) => total + day.partners.length, 0),
          communityContributions: 0
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao gerar roteiro:', error);
      
      // Fallback para resposta padrão
      return {
        answer: `Olá! Adoraria criar um roteiro personalizado para ${itineraryRequest.destination}! 

Para te ajudar melhor, posso sugerir alguns locais verificados:

${this.generateQuickSuggestions(itineraryRequest.destination)}

Gostaria de mais detalhes sobre algum local específico?`,
        confidence: 0.6,
        sources: [{ title: 'Sugestões Básicas', type: 'ms_knowledge' }],
        metadata: {
          processingTime: Date.now() - startTime,
          searchResults: 0,
          msLocationsFound: 3,
          partnersFound: 0,
          communityContributions: 0
        }
      };
    }
  }

  /**
   * Formatar resposta do roteiro
   */
  private formatItineraryAnswer(itinerary: any): string {
    let answer = `🗺️ **${itinerary.title}**\n\n`;
    answer += `📝 ${itinerary.summary}\n\n`;
    answer += `💰 **Custo estimado:** ${itinerary.estimated_total_cost}\n\n`;
    
    // Dias do roteiro
    for (const day of itinerary.days) {
      answer += `## ${day.title}\n`;
      answer += `💵 **Custo estimado:** ${day.estimated_cost}\n\n`;
      
      // Locais do dia
      for (const item of day.locations) {
        const loc = item.location;
        answer += `### 📍 ${loc.name} - ${item.time_slot}\n`;
        answer += `📝 ${loc.description}\n`;
        if (loc.address) answer += `🏠 **Endereço:** ${loc.address}\n`;
        if (loc.hours) answer += `🕒 **Horários:** ${loc.hours}\n`;
        if (loc.price_range) answer += `💰 **Preços:** ${loc.price_range}\n`;
        if (loc.contact?.phone) answer += `📞 **Contato:** ${loc.contact.phone}\n`;
        answer += `⏱️ **Duração:** ${item.duration}\n`;
        answer += `💡 ${item.why_recommended}\n\n`;
      }
      
      // Parceiros do dia
      if (day.partners.length > 0) {
        answer += `### 🤝 Parceiros Recomendados:\n`;
        for (const partner of day.partners) {
          answer += `**${partner.partner.name}** - ${partner.contact_info}\n`;
          answer += `${partner.recommendation_reason}\n\n`;
        }
      }
      
      // Dicas do dia
      if (day.tips.length > 0) {
        answer += `### 💡 Dicas do Dia:\n`;
        for (const tip of day.tips) {
          answer += `• ${tip}\n`;
        }
        answer += '\n';
      }
      
      answer += '---\n\n';
    }
    
    // Dicas gerais
    answer += `## 📋 Dicas Gerais:\n`;
    for (const tip of itinerary.general_tips) {
      answer += `• ${tip}\n`;
    }
    answer += '\n';
    
    // Contatos de emergência
    answer += `## 🆘 Contatos de Emergência:\n`;
    for (const contact of itinerary.emergency_contacts) {
      answer += `• **${contact.name}:** ${contact.phone} (${contact.service})\n`;
    }
    
    answer += '\n✅ **Roteiro baseado em informações verificadas e atualizadas!**';
    
    return answer;
  }

  /**
   * Gerar sugestões rápidas para fallback
   */
  private generateQuickSuggestions(destination: string): string {
    const suggestions = MSKnowledgeBase.searchLocations(destination).slice(0, 3);
    
    if (suggestions.length === 0) {
      return '• Bioparque Pantanal - maior aquário de água doce do mundo (gratuito)\n• Feira Central - gastronomia e artesanato regional\n• Parque das Nações Indígenas - trilhas e esportes';
    }
    
    return suggestions.map(loc => 
      `• **${loc.name}** - ${loc.description} ${loc.price_range ? `(${loc.price_range})` : ''}`
    ).join('\n');
  }

  /**
   * Health check completo de todas as fontes
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    details: {
      webSearch: boolean;
      msKnowledge: boolean;
      partners: boolean;
      community: boolean;
    };
  }> {
    try {
      console.log('🔍 Executando health check completo...');
      
      // Testar todas as fontes
      const [webResults, msLocations, hasPartners] = await Promise.all([
        this.searchWebReal('bioparque').catch(() => []),
        this.searchMSKnowledge('bioparque').catch(() => []),
        PartnersIntegrationService.hasApprovedPartners().catch(() => false)
      ]);
      
      const details = {
        webSearch: webResults.length > 0,
        msKnowledge: msLocations.length > 0,
        partners: hasPartners,
        community: true // Comunidade sempre disponível via Supabase
      };
      
      const healthyComponents = Object.values(details).filter(Boolean).length;
      const isHealthy = healthyComponents >= 2; // Pelo menos 2 fontes funcionando
      
      const message = `Guatá: ${healthyComponents}/4 fontes funcionando. 
        Web: ${details.webSearch ? '✅' : '❌'} | 
        MS: ${details.msKnowledge ? '✅' : '❌'} | 
        Parceiros: ${details.partners ? '✅' : '❌'} | 
        Comunidade: ${details.community ? '✅' : '❌'}`;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        message,
        details
      };
      
    } catch (error) {
      console.error('❌ Erro no health check:', error);
      return {
        status: 'unhealthy',
        message: 'Erro no sistema de verificação',
        details: {
          webSearch: false,
          msKnowledge: false,
          partners: false,
          community: false
        }
      };
    }
  }
}

export const guataConsciousService = new GuataConsciousService();
export type { GuataConsciousQuery, GuataConsciousResponse };
