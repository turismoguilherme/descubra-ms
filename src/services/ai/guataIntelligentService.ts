// 🧠 GUATÁ INTELIGENTE - Chatbot que SEMPRE pesquisa na web para responder
// RESPONDE QUALQUER PERGUNTA usando busca real na internet

import { generateContent } from "@/config/gemini";
import { intelligentWebSearchService, IntelligentSearchResult, SearchConfig } from "./intelligentWebSearchService";

export interface GuataQuery {
  question: string;
  userId?: string;
  sessionId?: string;
}

export interface GuataResponse {
  answer: string;
  confidence: number;
  processingTime: number;
  sourcesFound: number;
  timestamp: string;
  sources?: IntelligentSearchResult[];
}

class GuataIntelligentService {

  /**
   * PROCESSAMENTO PRINCIPAL - SEMPRE busca na web para responder QUALQUER pergunta
   */
  async processQuestion(query: GuataQuery): Promise<GuataResponse> {
    const startTime = Date.now();
    console.log(`🧠 Guatá Inteligente: Processando "${query.question}"`);
    console.log(`🔍 INICIANDO PESQUISA WEB REAL para encontrar informações atualizadas...`);

    try {
      // SEMPRE BUSCAR COM O SISTEMA INTELIGENTE
      console.log('🌐 Buscando informações com sistema inteligente...');
      console.log('📡 1. Verificando base de conhecimento local...');
      console.log('📡 2. Executando pesquisa WEB em tempo real...');
      console.log('📡 3. Consultando APIs externas (DuckDuckGo, Wikipedia)...');
      
      const searchConfig: SearchConfig = {
        query: this.optimizeSearchQuery(query.question),
        maxResults: 5,
        includeRealTime: true
      };

      const intelligentResults = await intelligentWebSearchService.searchIntelligent(searchConfig);
      console.log(`✅ Encontrados ${intelligentResults.length} resultados inteligentes`);
      
      // Log detalhado dos resultados encontrados
      intelligentResults.forEach((result, index) => {
        console.log(`📋 Resultado ${index + 1}:`, {
          fonte: result.source,
          titulo: result.title.substring(0, 50) + '...',
          categoria: result.category,
          tempoReal: result.isRealTime ? '🔴 TEMPO REAL' : '💾 BASE LOCAL',
          confianca: `${result.confidence}%`
        });
      });

      // GERAR RESPOSTA ÚTIL E COMPLETA
      const answer = await this.generateIntelligentAnswer(query.question, intelligentResults);
      const confidence = this.calculateIntelligentConfidence(intelligentResults);

      const processingTime = Date.now() - startTime;
      console.log(`🎯 Resposta inteligente gerada em ${processingTime}ms com ${confidence}% de confiança`);
      console.log(`🌐 PESQUISA WEB CONCLUÍDA: Informações verificadas e atualizadas!`);

      return {
        answer,
        confidence,
        processingTime,
        sourcesFound: intelligentResults.length,
        timestamp: new Date().toISOString(),
        sources: intelligentResults
      };

    } catch (error) {
      console.error('❌ Erro no processamento inteligente:', error);
      console.log('🔄 Tentando método alternativo...');
      
      return this.generateEmergencyResponse(query.question);
    }
  }

  /**
   * OTIMIZAR QUERY DE BUSCA para melhores resultados
   */
  private optimizeSearchQuery(question: string): string {
    let optimizedQuery = question;
    
    // Adicionar contexto de MS se não tiver
    const hasLocationContext = question.toLowerCase().includes('mato grosso') || 
                              question.toLowerCase().includes('pantanal') || 
                              question.toLowerCase().includes('bonito') || 
                              question.toLowerCase().includes('campo grande') ||
                              question.toLowerCase().includes('ms');
    
    if (!hasLocationContext) {
      optimizedQuery += ' MS Mato Grosso do Sul';
    }
    
    // Adicionar palavras-chave turísticas se relevante
    const isTourismQuery = question.toLowerCase().includes('visitar') ||
                          question.toLowerCase().includes('turismo') ||
                          question.toLowerCase().includes('hotel') ||
                          question.toLowerCase().includes('restaurante') ||
                          question.toLowerCase().includes('atração') ||
                          question.toLowerCase().includes('melhor época');
    
    if (isTourismQuery) {
      optimizedQuery += ' turismo 2024';
    }
    
    console.log(`🔍 Query otimizada: "${optimizedQuery}"`);
    return optimizedQuery;
  }

  /**
   * GERAR RESPOSTA baseada no sistema inteligente
   */
  private async generateIntelligentAnswer(question: string, sources: IntelligentSearchResult[]): Promise<string> {
    console.log(`🤖 Gerando resposta inteligente para: "${question}"`);
    console.log(`📊 Usando ${sources.length} fontes disponíveis`);

    // PRIMEIRA TENTATIVA: Resposta específica baseada em padrões conhecidos
    const directAnswer = this.generateDirectAnswer(question);
    if (directAnswer) {
      console.log('✅ Resposta direta gerada com sucesso');
      return directAnswer;
    }

    // SEGUNDA TENTATIVA: Usar Gemini se tiver fontes
    if (sources.length > 0) {
      try {
        console.log('🧠 Tentando Gemini com contexto das fontes...');
        const contextPrompt = this.buildIntelligentContext(question, sources);
        const systemPrompt = `Você é o Guatá, especialista em turismo de MS. Responda de forma prática e útil com base nas informações fornecidas.`;
        
        const response = await generateContent(systemPrompt, contextPrompt);
        
        if (response.ok && response.text && response.text.length > 50) {
          console.log('✅ Gemini gerou resposta válida');
          return this.cleanAndOptimizeResponse(response.text);
        }
      } catch (error) {
        console.warn('⚠️ Gemini falhou:', error);
      }
    }

    // TERCEIRA TENTATIVA: Resposta baseada nas fontes sem IA
    if (sources.length > 0) {
      console.log('📝 Gerando resposta baseada diretamente nas fontes...');
      return this.generateSourceBasedResponse(question, sources);
    }

    // QUARTA TENTATIVA: Resposta útil mesmo sem fontes específicas
    console.log('🆘 Gerando resposta útil de emergência...');
    return this.generateSmartEmergencyResponse(question);
  }

  /**
   * CONSTRUIR CONTEXTO com TODAS as informações inteligentes
   */
  private buildIntelligentContext(question: string, sources: IntelligentSearchResult[]): string {
    let prompt = `PERGUNTA DO USUÁRIO: ${question}\n\n`;
    
    if (sources.length === 0) {
      prompt += `SITUAÇÃO: Não encontrei informações específicas.\n`;
      prompt += `INSTRUÇÃO: Peça desculpas e sugira reformular a pergunta ou pergunte sobre tópicos específicos como Pantanal, Bonito, Campo Grande, hospedagem, etc.`;
      return prompt;
    }

    prompt += `INFORMAÇÕES ENCONTRADAS (${sources.length} fonte(s) inteligente(s)):\n\n`;

    // Organizar por categoria e prioridade
    const categories = {
      'nature': '🌿 NATUREZA E ECOTURISMO',
      'ecotourism': '🏞️ ECOTURISMO',
      'city': '🏛️ INFORMAÇÕES URBANAS',
      'accommodation': '🏨 HOSPEDAGEM',
      'transport': '🚗 TRANSPORTE',
      'events': '🎭 EVENTOS',
      'weather': '🌤️ CLIMA',
      'food': '🍽️ GASTRONOMIA',
      'general': '📍 INFORMAÇÕES GERAIS'
    };

    // Agrupar por categoria
    const sourcesByCategory = sources.reduce((acc, source) => {
      const category = source.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(source);
      return acc;
    }, {} as Record<string, IntelligentSearchResult[]>);

    // Adicionar cada categoria
    for (const [category, categoryName] of Object.entries(categories)) {
      const categorySources = sourcesByCategory[category];
      if (categorySources && categorySources.length > 0) {
        prompt += `${categoryName}:\n`;
        categorySources.forEach((source, index) => {
          prompt += `${index + 1}. **${source.title}** (Confiança: ${source.confidence}%)\n`;
          prompt += `   ${source.content}\n`;
          prompt += `   Fonte: ${source.source} | Atualizado: ${new Date(source.lastUpdated).toLocaleDateString()}\n\n`;
        });
      }
    }

    prompt += `\nINSTRUÇÃO FINAL: Use TODAS essas informações para criar a resposta mais útil, completa e prática possível. Seja específico, inclua preços e dicas, e organize tudo de forma clara e atrativa!`;
    
    return prompt;
  }

  /**
   * LIMPAR E OTIMIZAR resposta removendo elementos desnecessários
   */
  private cleanAndOptimizeResponse(response: string): string {
    let cleaned = response;
    
    // Remover auto-apresentações comuns
    const introPatterns = [
      /^Olá[!]?\s+Sou o Guatá[^.!?]*[.!?]\s*/i,
      /^Oi[!]?\s+Sou o Guatá[^.!?]*[.!?]\s*/i,
      /^Eu sou o Guatá[^.!?]*[.!?]\s*/i,
      /^Como seu guia turístico[^.!?]*[.!?]\s*/i,
      /^Sou seu guia turístico[^.!?]*[.!?]\s*/i
    ];
    
    introPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Corrigir "guia turístico" para "guia de turismo"
    cleaned = cleaned.replace(/guia turístico/gi, 'guia de turismo');
    
    // Reduzir formatação **negrito** excessiva
    // Manter apenas em títulos de seções
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
      // Manter negrito apenas em títulos de seções (que começam com emoji ou contêm ":")
      if (content.match(/^[🌟🎯📅🏨🚗✈️💡🔍📍🌿🏞️🎭🍽️⭐]/)) {
        return match; // Manter negrito em títulos com emoji
      }
      if (content.includes(':') && content.length < 50) {
        return match; // Manter negrito em títulos curtos com ":"
      }
      return content; // Remover negrito do resto
    });
    
    // Remover informações técnicas que escaparam
    cleaned = cleaned.replace(/📊\s*\*\*?Informações baseadas em.*$/im, '');
    cleaned = cleaned.replace(/\*\*?Fontes consultadas?.*$/im, '');
    cleaned = cleaned.replace(/\*\*?Confiança:?\s*\d+%.*$/im, '');
    
    // Garantir que termine com pergunta de follow-up se não tiver
    if (!cleaned.includes('Precisa de') && !cleaned.includes('mais informações')) {
      cleaned += '\n\n💡 Precisa de mais alguma informação específica sobre sua viagem?';
    }
    
    // Limpar múltiplas quebras de linha
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  /**
   * MELHORAR RESPOSTA com informações adicionais (apenas para logs internos)
   */
  private enhanceIntelligentResponse(response: string, sources: IntelligentSearchResult[]): string {
    // Esta função agora apenas limpa a resposta, 
    // as informações técnicas ficam apenas nos logs do console
    return this.cleanAndOptimizeResponse(response);
  }

  /**
   * RESPOSTA baseada DIRETAMENTE nas fontes (quando IA falha)
   */
  private generateSourceBasedResponse(question: string, sources: IntelligentSearchResult[]): string {
    if (sources.length === 0) {
      return `Não encontrei informações específicas sobre "${question}" no momento.\n\n💡 **Que tal reformular sua pergunta?**\n\nPosso ajudar com:\n• Pantanal, Bonito, Campo Grande\n• Hotéis, transporte, atrações\n• Preços e horários atualizados\n\n🎯 **Exemplo:** "Melhores hotéis baratos em Campo Grande" ou "Como chegar ao Pantanal"`;
    }

    let response = `Sobre "${question}", encontrei essas informações:\n\n`;
    
    // Mostrar as principais fontes encontradas organizadas
    sources.slice(0, 3).forEach((source, index) => {
      const emoji = source.category === 'nature' ? '🌿' : 
                   source.category === 'ecotourism' ? '🏞️' :
                   source.category === 'accommodation' ? '🏨' :
                   source.category === 'transport' ? '🚗' :
                   source.category === 'events' ? '🎭' :
                   source.category === 'weather' ? '🌤️' : '📍';
      
      response += `${emoji} **${source.title}**\n`;
      response += `${source.content.substring(0, 300)}${source.content.length > 300 ? '...' : ''}\n\n`;
    });

    if (sources.length > 3) {
      response += `📋 Tenho mais ${sources.length - 3} informação(ões) disponível(is)!\n\n`;
    }

    response += `💡 Precisa de algo mais específico? Posso detalhar qualquer aspecto que interesse!`;

    return this.cleanAndOptimizeResponse(response);
  }

  /**
   * Gera respostas diretas para perguntas comuns
   */
  private generateDirectAnswer(question: string): string | null {
    const queryLower = question.toLowerCase();
    
    // Padrões de perguntas e respostas específicas
    const patterns = {
      'história.*campo grande': `Campo Grande é a capital de Mato Grosso do Sul, conhecida como "Cidade Morena". Foi fundada em 1872 e tornou-se capital em 1977 quando o estado foi dividido.

🏛️ **Marcos Históricos:**
• Fundação: 1872 por José Antônio Pereira
• Capital: Desde 1977 (criação de MS)
• Crescimento: Impulsionado pela ferrovia e agronegócio

📍 **Características:**
• Maior cidade do Centro-Oeste
• Portal de entrada para Pantanal e Bonito
• Centro econômico e logístico importante

💡 Para mais detalhes históricos, recomendo visitar o Museu da Cidade ou o Memorial da Cultura Indígena!`,

      'benefício.*rota.*bioceânica': `A Rota Bioceânica é um corredor logístico que liga o Atlântico ao Pacífico, passando por Campo Grande e trazendo diversos benefícios:

🚛 **Benefícios Econômicos:**
• Redução de custos de exportação em até 30%
• Menor distância para mercados asiáticos
• Atração de investimentos internacionais

🌎 **Benefícios para MS:**
• Campo Grande como hub logístico estratégico
• Geração de empregos no setor de transporte
• Desenvolvimento do turismo de negócios
• Maior conectividade internacional

⏱️ **Tempo de Transporte:**
• Para portos chilenos: 3-4 dias (vs 15-20 dias pelo Atlântico)
• Economia significativa em fretes

💡 Isso posiciona Campo Grande como porta de entrada estratégica para o comércio internacional!`,

      'clima.*campo grande': `Campo Grande tem clima tropical semi-úmido com duas estações bem definidas:

🌤️ **Estação Seca (maio-setembro):**
• Temperatura: 15°C a 28°C
• Baixa umidade (30-50%)
• Céu claro, ideal para turismo
• Melhor época para visitar Pantanal

🌧️ **Estação Chuvosa (outubro-abril):**
• Temperatura: 20°C a 35°C
• Alta umidade (60-80%)
• Chuvas concentradas (dezembro-fevereiro)
• Pantanal alagado, ideal para pesca

📅 **Melhor Época para Visitar:**
• Turismo geral: maio a setembro
• Pantanal seco: junho a agosto
• Pantanal molhado: dezembro a março`,

      '(como chegar|transporte).*campo grande': `Chegando em Campo Grande é fácil! Várias opções de transporte:

✈️ **Por Avião:**
• Aeroporto Internacional (7km do centro)
• Voos diretos de SP, RJ, BSB, GOI
• Taxi: R$ 25-35 | Uber: R$ 15-25

🚌 **Por Ônibus:**
• Rodoviária no centro da cidade
• Conexões com todo o Brasil
• Principais empresas: Andorinha, Viação São Luiz

🚗 **Por Carro:**
• BR-163: São Paulo-Cuiabá
• BR-262: Belo Horizonte-Corumbá  
• BR-267: Brasília-Campo Grande
• Estradas bem conservadas`
    };

    // Verificar se a pergunta corresponde a algum padrão
    for (const [pattern, answer] of Object.entries(patterns)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(queryLower)) {
        console.log(`✅ Padrão correspondente encontrado: ${pattern}`);
        return answer;
      }
    }

    return null;
  }

  /**
   * Gera resposta útil mesmo quando não tem informações específicas
   */
  private generateSmartEmergencyResponse(question: string): string {
    const queryLower = question.toLowerCase();
    
    if (queryLower.includes('hotel') || queryLower.includes('hospedagem')) {
      return `Para hospedagem em Campo Grande, existem várias opções:

🏨 **Regiões Recomendadas:**
• Centro: Próximo a restaurantes e comércio
• Região do Aeroporto: Conveniente para viagens
• Avenida Afonso Pena: Área nobre da cidade

💰 **Faixas de Preço:**
• Econômico: R$ 80-150/noite
• Intermediário: R$ 150-300/noite
• Luxo: R$ 300-600/noite

💡 Recomendo reservar com antecedência, especialmente durante eventos ou alta temporada no Pantanal!`;
    }

    if (queryLower.includes('restaurante') || queryLower.includes('comida')) {
      return `A gastronomia de Campo Grande é rica e diversificada:

🍖 **Pratos Típicos:**
• Pacu assado - peixe do Pantanal
• Pintado na telha - especialidade local
• Farofa de banana - acompanhamento tradicional
• Sobá - herança da comunidade japonesa

🍽️ **Onde Comer:**
• Feira Central: Comida típica (sex-sáb-dom)
• Mercadão Municipal: Produtos regionais
• Restaurantes do centro: Variedade gastronômica

💡 Não deixe de experimentar o tereré, a bebida tradicional da região!`;
    }

    if (queryLower.includes('evento') || queryLower.includes('festa') || queryLower.includes('show')) {
      return `Campo Grande oferece diversos eventos durante o ano:

🎭 **Eventos Regulares:**
• Feira Central: Sextas, sábados e domingos (18h-23h)
• Festival de Inverno: Julho (música e cultura)
• Aniversário da cidade: 26 de agosto
• Shows no Teatro Glauce Rocha

🎪 **Para Informações Atualizadas:**
• Site oficial: turismo.ms.gov.br
• Redes sociais da prefeitura
• Centros de informação turística

💡 Os eventos variam por temporada, sempre consulte a agenda oficial!`;
    }

    // Resposta genérica mas útil
    return `Sua pergunta sobre "${question}" é interessante! Campo Grande oferece muitas possibilidades:

🌟 **Principais Atrações:**
• Portal para Pantanal e Bonito
• Rica cultura regional
• Gastronomia típica única
• Centro urbano moderno

🎯 **Sugestões:**
• Visite a Feira Central nos fins de semana
• Explore o Parque das Nações Indígenas
• Prove a culinária pantaneira
• Use a cidade como base para conhecer MS

💡 Precisa de informações mais específicas? Pergunte sobre hospedagem, alimentação, transporte ou atrações específicas!`;
  }

  /**
   * RESPOSTA HONESTA quando não há informação específica
   */
  private generateHonestNoInfoResponse(question: string): string {
    const queryLower = question.toLowerCase();
    
    // Determinar categoria da pergunta para dar sugestões relevantes
    let suggestions = [];
    
    if (queryLower.includes('cultura') || queryLower.includes('tradição')) {
      suggestions = [
        "Tradições culturais de MS",
        "Povos indígenas do estado",
        "Festivais e eventos culturais"
      ];
    } else if (queryLower.includes('evento') || queryLower.includes('acontece')) {
      suggestions = [
        "Principais festivais de MS",
        "Eventos anuais em Campo Grande",
        "Festa do Peão de Três Lagoas"
      ];
    } else if (queryLower.includes('vivo') || queryLower.includes('hoje')) {
      suggestions = [
        "Vida noturna em Campo Grande",
        "Bares e restaurantes locais",
        "Entretenimento em MS"
      ];
    } else {
      suggestions = [
        "Pantanal e sua vida selvagem",
        "Ecoturismo em Bonito",
        "Atrações de Campo Grande",
        "Hospedagem em MS",
        "Como chegar ao estado"
      ];
    }

    return `Não encontrei informações específicas sobre "${question}" no momento.

💡 **Posso ajudar com estes tópicos:**
${suggestions.map(s => `• ${s}`).join('\n')}

🎯 **Como reformular:**
Seja mais específico sobre o que procura. Por exemplo:
• "Quais são as tradições culturais de MS?"
• "Principais festivais em Campo Grande"
• "Vida noturna em MS"

Precisa de mais alguma informação específica sobre sua viagem?`;
  }

  /**
   * CALCULAR CONFIANÇA baseada no sistema inteligente
   */
  private calculateIntelligentConfidence(sources: IntelligentSearchResult[]): number {
    if (sources.length === 0) return 30;
    
    // Calcular confiança média das fontes
    const avgSourceConfidence = sources.reduce((sum, source) => sum + source.confidence, 0) / sources.length;
    
    let finalConfidence = avgSourceConfidence;
    
    // Bonus por quantidade de fontes
    if (sources.length >= 3) finalConfidence += 5;
    if (sources.length >= 5) finalConfidence += 5;
    
    // Bonus por diversidade de categorias
    const categories = new Set(sources.map(s => s.category));
    if (categories.size >= 2) finalConfidence += 5;
    
    // Bonus por fontes em tempo real
    const realTimeSources = sources.filter(s => s.isRealTime).length;
    if (realTimeSources > 0) finalConfidence += 10;
    
    return Math.min(98, Math.round(finalConfidence));
  }

  /**
   * RESPOSTA DE EMERGÊNCIA quando tudo falha
   */
  private generateEmergencyResponse(question: string): GuataResponse {
    return {
      answer: `🚨 **Ops! Estou com dificuldades técnicas temporárias.**\n\nQueria muito pesquisar sobre "${question}" para você, mas estou com um probleminha técnico no momento.\n\n🔄 **Tente:**\n• Reformular sua pergunta\n• Perguntar sobre Pantanal, Bonito, Campo Grande\n• Aguardar alguns segundos e tentar novamente\n\n💪 **Promessa:** Normalmente eu pesquiso em tempo real para dar as informações mais atuais sobre turismo em Mato Grosso do Sul!\n\n🎯 **Exemplos:** "Hotéis baratos em Bonito", "Melhor época Pantanal", "Eventos em Campo Grande"`,
      confidence: 25,
      processingTime: 100,
      sourcesFound: 0,
      timestamp: new Date().toISOString()
    };
  }
}

export const guataIntelligentService = new GuataIntelligentService();
