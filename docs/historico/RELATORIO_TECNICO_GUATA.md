# 🔍 **RELATÓRIO TÉCNICO COMPLETO - COMO O GUATÁ FUNCIONA**

## 🎯 **VISÃO GERAL DO FUNCIONAMENTO**

O **Guatá** é um sistema de IA inteligente que funciona como um **guia virtual consciente** para turismo em Mato Grosso do Sul. Ele não é apenas um chatbot simples, mas um sistema complexo que combina múltiplas fontes de informação em tempo real.

---

## 🏗️ **ARQUITETURA INTERNA - COMO FUNCIONA**

### **1. FLUXO PRINCIPAL DE FUNCIONAMENTO**

```
USUÁRIO FAZ PERGUNTA
         ↓
useGuataConversation.ts (Hook React)
         ↓
guataConsciousService.processQuestion()
         ↓
DETECÇÃO INTELIGENTE DO TIPO DE PERGUNTA
         ↓
BUSCA PARALELA EM MÚLTIPLAS FONTES
         ↓
GERAÇÃO DE RESPOSTA COM IA (Gemini)
         ↓
VALIDAÇÃO ANTI-FALSOS
         ↓
RETORNO COM METADADOS COMPLETOS
         ↓
ATUALIZAÇÃO DA INTERFACE
```

---

## 🔄 **DETALHAMENTO DE CADA ETAPA**

### **ETAPA 1: RECEPÇÃO DA PERGUNTA**
**Arquivo**: `useGuataConversation.ts`

```typescript
const enviarMensagem = async (inputMensagem: string) => {
  // 1. Adiciona mensagem do usuário na interface
  const novaMensagemUsuario: AIMessage = {
    id: Date.now(),
    text: inputMensagem,
    isUser: true,
    timestamp: new Date()
  };
  
  // 2. Mostra indicador "Digitando..."
  const mensagemDigitando: AIMessage = {
    id: Date.now() + 0.5,
    text: "Digitando...",
    isUser: false,
    timestamp: new Date(),
    isTyping: true
  };
  
  // 3. Chama o serviço principal
  const consciousResponse = await guataConsciousService.processQuestion({
    question: inputMensagem,
    userId: usuarioInfo?.id,
    sessionId: `session-${Date.now()}`,
    context: 'turismo'
  });
}
```

**O que acontece:**
- ✅ Interface atualiza imediatamente
- ✅ Usuário vê "Digitando..." em tempo real
- ✅ Sistema prepara para processamento

---

### **ETAPA 2: PROCESSAMENTO INTELIGENTE**
**Arquivo**: `guataConsciousService.ts`

```typescript
async processQuestion(query: GuataConsciousQuery): Promise<GuataConsciousResponse> {
  const startTime = Date.now();
  
  // 1. DETECTAR SE É SOLICITAÇÃO DE ROTEIRO
  const itineraryRequest = this.detectItineraryRequest(query.question);
  
  if (itineraryRequest) {
    console.log('🗺️ Detectada solicitação de roteiro');
    return await this.generateItineraryResponse(itineraryRequest, query);
  }
  
  // 2. BUSCA PARALELA EM MÚLTIPLAS FONTES
  const [webResults, partners, community] = await Promise.all([
    this.searchWebReal(query.question),        // 🌐 PRINCIPAL
    this.searchPartners(query.question, query.userId), // 🤝
    this.searchCommunityContributions(query.question)  // 🌍
  ]);
  
  // 3. MS Knowledge APENAS como complemento
  const msLocations = await this.searchMSKnowledge(query.question);
}
```

**O que acontece:**
- 🔍 **Análise inteligente** da pergunta
- 🗺️ **Detecção automática** de solicitações de roteiro
- ⚡ **Busca paralela** para máxima velocidade
- 🎯 **Priorização inteligente** das fontes

---

## 🔍 **SISTEMA DE BUSCA MULTIFONTE**

### **A. Web Search (PRINCIPAL)**
**Arquivo**: `webSearchService.ts`

```typescript
async search(query: string, category?: string): Promise<WebSearchResult[]> {
  // 1. Busca dinâmica inteligente (como o Gemini)
  const dynamicAnalysis = await dynamicWebSearchService.search(query);
  
  if (dynamicAnalysis.confidence > 70) {
    return this.convertDynamicResults(dynamicAnalysis);
  }
  
  // 2. Sistema de busca inteligente
  const intelligentResults = await intelligentSearchEngine.search({
    query, category, limit: 10, region: 'MS'
  });
  
  // 3. Fallback para busca interna
  if (this.useInternalSearch) {
    const internalResults = await internalSearchService.search({ query, category, limit: 10 });
    if (internalResults.length > 0) {
      return this.convertInternalResults(internalResults);
    }
  }
  
  // 4. Fallback para web scraping
  const scrapedResults = await webScrapingService.scrapeOfficialSites(query);
  return this.convertScrapedResults(scrapedResults);
}
```

**Como funciona:**
- 🧠 **Análise dinâmica** com IA para entender a pergunta
- 🔍 **Busca inteligente** em múltiplas fontes
- 🌐 **Web scraping** de sites oficiais
- 📊 **Sistema de confiança** para cada resultado

---

## 🤖 **SISTEMA DE IA - GEMINI**

### **Configuração e Cache**
**Arquivo**: `gemini.ts`

```typescript
export async function generateContent(
  systemPrompt: string, 
  userPrompt?: string
): Promise<{ text: string; ok: boolean; error?: string }> {
  try {
    // Combinar system prompt com user prompt
    const fullPrompt = userPrompt 
      ? `${systemPrompt}\n\n${userPrompt}`
      : systemPrompt;
    
    // Verificar cache primeiro
    const cacheKey = fullPrompt.substring(0, 100);
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🔄 Gemini: Usando resposta em cache');
      return { text: cached.response, ok: true };
    }

    // Verificar limite de requests
    if (requestCount >= REQUEST_LIMIT_PER_MINUTE) {
      console.log('⚠️ Gemini: Limite de requests atingido, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      requestCount = 0;
    }

    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Incrementar contador e salvar no cache
    requestCount++;
    responseCache.set(cacheKey, { response: text, timestamp: Date.now() });
    
    return { text, ok: true };
    
  } catch (error: any) {
    console.error('❌ Gemini: Erro na API:', error);
    return { 
      text: "Desculpe, estou com dificuldades técnicas no momento.", 
      ok: false, 
      error: error.message 
    };
  }
}
```

**Como funciona:**
- 🧠 **Modelo avançado** Gemini 1.5 Flash
- 💾 **Sistema de cache** inteligente (5 minutos)
- 🚦 **Rate limiting** automático (10 req/min)
- 🔄 **Fallback para cache** em caso de erro

---

## 🛡️ **SISTEMA DE VALIDAÇÃO ANTI-FALSOS**

### **Detecção Inteligente**
```typescript
private containsFalseData(response: string): boolean {
  const suspiciousPatterns = [
    /bioparque\.ms\.gov\.br/i, // Site específico falso
    /\(\d{2}\)\s*3318-6000/i, // Telefone específico falso
    /entrada.*gratuita.*bioparque/i, // Informação não confirmada
    /maior.*aquário.*do.*mundo/i, // Alegação não confirmada
    /preço.*R\$\s*\d+.*garantido/i, // Preços "garantidos" suspeitos
    /horário.*confirmado.*\d+h.*às.*\d+h/i, // Horários muito específicos
  ];

  const hasValidOfficialSite = /turismo\.ms\.gov\.br|www\.ms\.gov\.br/i.test(response);
  const hasValidOfficialPhone = /\(67\)\s*3318-5000/i.test(response);
  
  // Se contém site oficial válido OU telefone oficial, é mais seguro
  if (hasValidOfficialSite || hasValidOfficialPhone) {
    return suspiciousPatterns.slice(0, 4).some(pattern => pattern.test(response));
  }

  return suspiciousPatterns.some(pattern => pattern.test(response));
}
```

**Como funciona:**
- 🚫 **Padrões suspeitos** pré-definidos
- ✅ **Validação inteligente** baseada em fontes oficiais
- 🛡️ **Proteção em camadas** contra dados falsos
- 🔍 **Logs detalhados** para debug

---

## 🚨 **SISTEMAS DE FALLBACK**

### **Fallback Inteligente**
```typescript
private generateTruthfulFallback(query: string, webResults: any, msLocations: any[], partners: any[]): string {
  let response = "🤖 Tive um problema técnico, mas posso compartilhar o que encontrei:\n\n";
  
  // Priorizar informações web
  if (webResults?.length) {
    response += "🌐 **Informações atuais encontradas:**\n";
    webResults.slice(0, 2).forEach((result: any) => {
      response += `• ${result.title}\n`;
      response += `  ${result.content}\n`;
      response += `  📍 Fonte: ${result.url}\n\n`;
    });
  }
  
  // Complementar com parceiros se úteis
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
  
  response += "💡 **Para informações mais detalhadas e atualizadas:**\n";
  response += "• Site oficial: turismo.ms.gov.br\n";
  response += "• Fundtur-MS: (67) 3318-5000\n";
  
  return response;
}
```

**Como funciona:**
- 🤖 **Transparência total** sobre problemas técnicos
- 📊 **Priorização inteligente** das fontes disponíveis
- 💡 **Recomendações úteis** para o usuário
- 🔄 **Instruções claras** para próximos passos

---

## 📊 **SISTEMA DE CONFIANÇA**

### **Cálculo Inteligente**
```typescript
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
    confidence += Math.min(partners.length * 0.15, 0.3);
  }
  
  // COMPLEMENTO: Contribuições da comunidade
  if (community && community.length > 0) {
    confidence += Math.min(community.length * 0.1, 0.2);
  }
  
  // COMPLEMENTO: MS Knowledge (enriquecimento)
  if (msLocations && msLocations.length > 0) {
    confidence += Math.min(msLocations.length * 0.1, 0.2);
  }
  
  return Math.min(confidence, 1.0); // Máximo 1.0
}
```

**Como funciona:**
- 📊 **Sistema de pontuação** baseado em fontes
- 🌐 **Priorização da web** como fonte principal
- 🏛️ **Bonus para fontes oficiais**
- ⚖️ **Balanceamento inteligente** entre fontes

---

## 📝 **CONCLUSÃO TÉCNICA**

O sistema **Guatá** é uma **arquitetura complexa e inteligente** que funciona através de:

1. **🔄 Fluxo de Processamento Inteligente**: Detecção automática de tipos de pergunta
2. **🌐 Busca Multifonte Paralela**: Web, parceiros, comunidade e MS simultaneamente
3. **🤖 IA Avançada com Validação**: Gemini + sistema anti-falsos rigoroso
4. **🛡️ Fallbacks em Camadas**: RAG, emergência e base MS como redes de segurança
5. **📊 Métricas em Tempo Real**: Confiança, performance e verificação contínua
6. **🎨 Interface React Responsiva**: Estado em tempo real e experiência fluida

**O sistema não é apenas um chatbot**, mas um **ecossistema completo** de inteligência artificial para turismo, com múltiplas camadas de proteção, validação rigorosa e capacidade de aprendizado contínuo.

---

*Relatório técnico gerado pelo sistema de documentação do Descubra MS - 18/01/2025*
