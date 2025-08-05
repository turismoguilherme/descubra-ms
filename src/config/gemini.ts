// Configuração da API Gemini

export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', // Lê a chave do .env
  baseUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent',
  rateLimit: {
    requestsPerMinute: 15,
    requestsPerDay: 1500
  },
  models: {
    geminiPro: 'gemini-1.5-pro',
    geminiProVision: 'gemini-1.5-pro'
  }
};

// Cliente Gemini com rate limiting e cache
export class GeminiClient {
  private apiKey: string;
  private baseUrl: string;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private dailyRequestCount: number = 0;
  private lastDailyReset: number = Date.now();

  constructor() {
    this.apiKey = GEMINI_CONFIG.apiKey;
    this.baseUrl = GEMINI_CONFIG.baseUrl;
    console.log("Guatá Config: Chave da API Gemini carregada: ", this.apiKey ? "[CHAVE CARREGADA]" : "[VAZIA]", " Primeiros 5 caracteres: ", this.apiKey.substring(0, 5)); // NOVO LOG
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset daily count if it's a new day
    if (now - this.lastDailyReset > 24 * 60 * 60 * 1000) {
      this.dailyRequestCount = 0;
      this.lastDailyReset = now;
    }

    // Check daily limit
    if (this.dailyRequestCount >= GEMINI_CONFIG.rateLimit.requestsPerDay) {
      console.warn('⚠️ Gemini: Daily rate limit exceeded');
      return false;
    }

    // Check per-minute limit
    if (now - this.lastRequestTime < 60000) { // 1 minute
      if (this.requestCount >= GEMINI_CONFIG.rateLimit.requestsPerMinute) {
        console.warn('⚠️ Gemini: Per-minute rate limit exceeded');
        return false;
      }
    } else {
      this.requestCount = 0;
    }

    return true;
  }

  async generateContent(prompt: string): Promise<{ok: boolean, text?: string, error?: string}> {
    console.log("🔍 Gemini: Iniciando generateContent com prompt:", prompt.substring(0, 100) + "...");
    
    if (!this.apiKey) {
      console.error("❌ Gemini: API Key está vazia!");
      return {
        ok: false,
        error: "API Key não configurada"
      };
    }

    if (!this.checkRateLimit()) {
      return {
        ok: false,
        error: 'Rate limit exceeded. Please try again later.'
      };
    }

    try {
      console.log("🔍 Gemini: Fazendo requisição para:", this.baseUrl);
      console.log("🔍 Gemini: API Key (primeiros 10 chars):", this.apiKey.substring(0, 10) + "...");
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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

      console.log("🔍 Gemini: Status da resposta:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Gemini: Erro na resposta:", response.status, errorText);
        return {
          ok: false,
          error: `Gemini API error: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log("🔍 Gemini: Resposta recebida:", data);
      
      // Update rate limiting counters
      this.requestCount++;
      this.dailyRequestCount++;
      this.lastRequestTime = Date.now();

      const text = data.candidates[0].content.parts[0].text;
      console.log("✅ Gemini: Texto extraído com sucesso:", text.substring(0, 100) + "...");
      
      return {
        ok: true,
        text: text
      };
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  // Método específico para análise turística
  async analyzeTourismData(data: any, context: string = 'MS'): Promise<string> {
    const prompt = `
      Analise os seguintes dados turísticos do ${context} e forneça insights estratégicos:
      
      Dados: ${JSON.stringify(data, null, 2)}
      
      Por favor, forneça:
      1. Análise das tendências principais
      2. Oportunidades identificadas
      3. Recomendações estratégicas
      4. Comparação com períodos anteriores (se disponível)
      
      Responda em português brasileiro de forma clara e objetiva.
    `;

    return this.generateContent(prompt);
  }
}

// Instância global do cliente Gemini
export const geminiClient = new GeminiClient(); 