// Configuração da API Gemini
export const GEMINI_CONFIG = {
  apiKey: 'AIzaSyCX7Cmid7hQDDucWtNoP5zJ4uDsDgmPJmw',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  rateLimit: {
    requestsPerMinute: 15,
    requestsPerDay: 1500
  },
  models: {
    geminiPro: 'gemini-pro',
    geminiProVision: 'gemini-pro-vision'
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

  async generateContent(prompt: string): Promise<string> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
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

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update rate limiting counters
      this.requestCount++;
      this.dailyRequestCount++;
      this.lastRequestTime = Date.now();

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      throw error;
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