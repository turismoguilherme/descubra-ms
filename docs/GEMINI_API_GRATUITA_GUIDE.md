# 🤖 GUIA COMPLETO - API GEMINI GRATUITA

## 📅 **Data de Criação**: Janeiro 2025
## 🎯 **Objetivo**: Como usar a API do Gemini gratuitamente na plataforma FlowTrip

---

## 🆓 **PLANO GRATUITO DO GEMINI**

### **1. Limites Gratuitos**
```typescript
interface GeminiFreePlan {
  // Limites Diários
  daily_limits: {
    requests_per_day: 1500;
    characters_per_day: "15M characters";
    model: "gemini-pro";
  };
  
  // Limites por Minuto
  rate_limits: {
    requests_per_minute: 15;
    concurrent_requests: 1;
  };
  
  // Recursos Disponíveis
  features: [
    "Text generation",
    "Code generation", 
    "Data analysis",
    "Strategic insights",
    "Multi-language support",
    "Context understanding"
  ];
}
```

### **2. Como Obter API Key Gratuita**
```typescript
interface APISetup {
  steps: [
    "1. Acesse https://makersuite.google.com/app/apikey",
    "2. Faça login com sua conta Google",
    "3. Clique em 'Create API Key'",
    "4. Copie a chave gerada",
    "5. Adicione ao arquivo .env"
  ];
  
  environment_variable: "GEMINI_API_KEY=your_api_key_here";
}
```

---

## 🔧 **IMPLEMENTAÇÃO TÉCNICA**

### **1. Configuração da API**
```typescript
// config/gemini.ts
interface GeminiConfig {
  api_key: string;
  base_url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  model: "gemini-pro";
  max_tokens: 2048;
  temperature: 0.7;
}

export const geminiConfig: GeminiConfig = {
  api_key: process.env.GEMINI_API_KEY || "",
  base_url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  model: "gemini-pro",
  max_tokens: 2048,
  temperature: 0.7
};
```

### **2. Cliente da API**
```typescript
// services/geminiClient.ts
interface GeminiClient {
  async generateContent(prompt: string): Promise<string> {
    const response = await fetch(`${geminiConfig.base_url}?key=${geminiConfig.api_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
```

### **3. Rate Limiting**
```typescript
// utils/rateLimiter.ts
interface RateLimiter {
  requests: number = 0;
  lastReset: number = Date.now();
  
  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Reset counter every minute
    if (now - this.lastReset >= 60000) {
      this.requests = 0;
      this.lastReset = now;
    }
    
    // Check if under limit
    if (this.requests >= 15) {
      return false; // Rate limit exceeded
    }
    
    this.requests++;
    return true;
  }
}
```

---

## 🎯 **CASOS DE USO ESPECÍFICOS**

### **1. Análise de Dados Turísticos**
```typescript
interface TourismAnalysis {
  // Prompt para análise de dados
  analysis_prompt: `
    Analise os seguintes dados turísticos do Mato Grosso do Sul:
    
    Dados de visitantes: ${visitorData}
    Dados de receita: ${revenueData}
    Dados de satisfação: ${satisfactionData}
    
    Forneça:
    1. Análise das tendências principais
    2. Identificação de padrões
    3. Recomendações estratégicas
    4. Insights acionáveis
  `;
  
  // Exemplo de uso
  async analyzeTourismData(data: TourismData): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(data);
    const analysis = await this.geminiClient.generateContent(prompt);
    return this.parseAnalysis(analysis);
  }
}
```

### **2. Chat Interativo para Gestores**
```typescript
interface InteractiveChat {
  // Prompt para chat
  chat_prompt: `
    Você é um consultor especializado em turismo para gestores públicos.
    
    Contexto: ${context}
    Pergunta do usuário: ${userQuestion}
    
    Responda de forma:
    - Profissional e acionável
    - Baseada em dados
    - Com recomendações específicas
    - Em português brasileiro
  `;
  
  // Exemplo de uso
  async chatWithManager(question: string, context: string): Promise<string> {
    const prompt = this.buildChatPrompt(question, context);
    return await this.geminiClient.generateContent(prompt);
  }
}
```

### **3. Geração de Relatórios**
```typescript
interface ReportGeneration {
  // Prompt para relatórios
  report_prompt: `
    Gere um relatório executivo de turismo com base nos dados:
    
    ${data}
    
    O relatório deve incluir:
    1. Resumo executivo
    2. Análise de performance
    3. Tendências identificadas
    4. Recomendações estratégicas
    5. Próximos passos
    
    Formato: Markdown estruturado
  `;
  
  // Exemplo de uso
  async generateReport(data: ReportData): Promise<string> {
    const prompt = this.buildReportPrompt(data);
    return await this.geminiClient.generateContent(prompt);
  }
}
```

---

## 📊 **OTIMIZAÇÃO DE USO**

### **1. Cache de Respostas**
```typescript
interface ResponseCache {
  // Cache para evitar requisições repetidas
  cache: Map<string, string> = new Map();
  
  async getCachedResponse(prompt: string): Promise<string | null> {
    const hash = this.hashPrompt(prompt);
    return this.cache.get(hash) || null;
  }
  
  setCachedResponse(prompt: string, response: string): void {
    const hash = this.hashPrompt(prompt);
    this.cache.set(hash, response);
  }
}
```

### **2. Batching de Requisições**
```typescript
interface RequestBatching {
  // Agrupar requisições para otimizar uso
  batchRequests(requests: string[]): string[] {
    // Agrupar requisições similares
    const batches = this.groupSimilarRequests(requests);
    return batches.map(batch => this.combinePrompts(batch));
  }
}
```

### **3. Fallback Strategy**
```typescript
interface FallbackStrategy {
  // Estratégia de fallback quando API falha
  async generateWithFallback(prompt: string): Promise<string> {
    try {
      return await this.geminiClient.generateContent(prompt);
    } catch (error) {
      // Fallback para respostas pré-definidas
      return this.getFallbackResponse(prompt);
    }
  }
}
```

---

## 🚀 **IMPLEMENTAÇÃO NA PLATAFORMA**

### **1. Integração com IA Consultora**
```typescript
interface AIConsultantIntegration {
  // Componente de IA Consultora
  class AIConsultant {
    private geminiClient: GeminiClient;
    private rateLimiter: RateLimiter;
    private cache: ResponseCache;
    
    async analyzeData(data: any): Promise<AnalysisResult> {
      // Verificar rate limit
      if (!await this.rateLimiter.checkLimit()) {
        throw new Error("Rate limit exceeded");
      }
      
      // Verificar cache
      const cached = await this.cache.getCachedResponse(JSON.stringify(data));
      if (cached) return JSON.parse(cached);
      
      // Gerar análise
      const prompt = this.buildAnalysisPrompt(data);
      const response = await this.geminiClient.generateContent(prompt);
      
      // Cache da resposta
      this.cache.setCachedResponse(JSON.stringify(data), response);
      
      return this.parseAnalysis(response);
    }
  }
}
```

### **2. Chat Interativo**
```typescript
interface InteractiveChatImplementation {
  // Componente de Chat
  class TourismChat {
    private geminiClient: GeminiClient;
    private conversationHistory: string[] = [];
    
    async sendMessage(message: string, context: string): Promise<string> {
      const prompt = this.buildChatPrompt(message, context, this.conversationHistory);
      const response = await this.geminiClient.generateContent(prompt);
      
      // Atualizar histórico
      this.conversationHistory.push(`User: ${message}`);
      this.conversationHistory.push(`Assistant: ${response}`);
      
      return response;
    }
  }
}
```

---

## 📈 **MONITORAMENTO DE USO**

### **1. Métricas de Uso**
```typescript
interface UsageMetrics {
  // Métricas para monitorar uso da API
  metrics: {
    requests_per_day: number;
    requests_per_minute: number;
    cache_hit_rate: number;
    error_rate: number;
    average_response_time: number;
  };
  
  // Alertas
  alerts: {
    rate_limit_warning: "80% do limite diário atingido";
    rate_limit_exceeded: "Limite diário excedido";
    high_error_rate: "Taxa de erro > 5%";
  };
}
```

### **2. Dashboard de Monitoramento**
```typescript
interface MonitoringDashboard {
  // Dashboard para gestores
  dashboard: {
    current_usage: "Requests hoje: 234/1500";
    rate_limit_status: "Status: Normal";
    cache_performance: "Cache hit rate: 67%";
    response_times: "Tempo médio: 1.2s";
  };
}
```

---

## 💡 **DICAS DE OTIMIZAÇÃO**

### **1. Prompts Eficientes**
```typescript
interface PromptOptimization {
  tips: [
    "Seja específico e direto",
    "Use contexto relevante",
    "Limite o tamanho do prompt",
    "Use exemplos quando possível",
    "Estruture a resposta desejada"
  ];
  
  examples: {
    good: "Analise os dados de turismo de Bonito e forneça 3 recomendações específicas para aumentar a permanência média dos turistas.";
    bad: "Analise esses dados e me diga o que você acha.";
  };
}
```

### **2. Gestão de Rate Limits**
```typescript
interface RateLimitManagement {
  strategies: [
    "Implementar cache inteligente",
    "Usar batching de requisições",
    "Priorizar requisições críticas",
    "Implementar filas de requisições",
    "Usar fallbacks quando necessário"
  ];
}
```

---

## 🎯 **RESULTADOS ESPERADOS**

### **1. Com IA Gratuita**
- ✅ **Análise de dados**: Sem custo
- ✅ **Chat interativo**: Sem custo
- ✅ **Relatórios automáticos**: Sem custo
- ✅ **Insights estratégicos**: Sem custo

### **2. Limitações**
- ⚠️ **Rate limits**: 15 requests/minute
- ⚠️ **Daily limits**: 1500 requests/day
- ⚠️ **Response time**: 1-3 segundos
- ⚠️ **Concurrent requests**: 1 por vez

### **3. Vantagens**
- ✅ **Totalmente gratuito**
- ✅ **Qualidade alta**
- ✅ **Fácil implementação**
- ✅ **Suporte oficial Google**

---

## 📝 **PRÓXIMOS PASSOS**

### **1. Implementação**
- [ ] Configurar API key
- [ ] Implementar cliente
- [ ] Adicionar rate limiting
- [ ] Implementar cache
- [ ] Testar funcionalidades

### **2. Otimização**
- [ ] Otimizar prompts
- [ ] Implementar batching
- [ ] Adicionar fallbacks
- [ ] Monitorar uso

### **3. Expansão**
- [ ] Adicionar mais casos de uso
- [ ] Implementar análise avançada
- [ ] Criar dashboards de monitoramento

---

**Status**: ✅ **GUIA COMPLETO CRIADO**  
**Próximo Passo**: Implementação da API do Gemini  
**Custo**: Gratuito  
**Tempo de Implementação**: 1-2 semanas  

---

**Documento Criado**: Janeiro 2025  
**Versão**: 1.0  
**Autor**: Cursor AI Agent  
**Status**: ✅ **PRONTO PARA IMPLEMENTAÇÃO** 