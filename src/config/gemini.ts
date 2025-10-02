 import { GoogleGenerativeAI } from '@google/generative-ai';

// Cache para reduzir chamadas à API
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 0; // 0 = cache desabilitado para respostas sempre reais

// Contador de requests para monitoramento
let requestCount = 0;
const REQUEST_LIMIT_PER_MINUTE = 10; // Reduzido de 15 para 10 para margem de segurança

export const geminiClient = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateContent(
  systemPrompt: string, 
  userPrompt?: string
): Promise<{ text: string; ok: boolean; error?: string }> {
  try {
    // Combinar system prompt com user prompt se fornecido
    const fullPrompt = userPrompt 
      ? `${systemPrompt}\n\n${userPrompt}`
      : systemPrompt;
    
    // Verificar cache primeiro
    const cacheKey = fullPrompt.substring(0, 100); // Primeiros 100 caracteres como chave
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🔄 Gemini: Usando resposta em cache');
      return { text: cached.response, ok: true };
    }

    // Verificar limite de requests
    if (requestCount >= REQUEST_LIMIT_PER_MINUTE) {
      console.log('⚠️ Gemini: Limite de requests atingido, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Aguardar 1 minuto
      requestCount = 0;
    }

    console.log('Gemini: Iniciando generateContent com system prompt:', systemPrompt.substring(0, 100) + '...');
    
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Incrementar contador
    requestCount++;
    
    // Salvar no cache
    responseCache.set(cacheKey, { response: text, timestamp: Date.now() });
    
    console.log(`✅ Gemini: Resposta gerada (request #${requestCount})`);
    
    return { text, ok: true };
    
  } catch (error: any) {
    console.error('❌ Gemini: Erro na API:', error);
    
    // Se for rate limit, tentar usar cache mesmo que expirado
    if (error.message?.includes('rate limit')) {
      const cacheKey = fullPrompt.substring(0, 100);
      const cached = responseCache.get(cacheKey);
      
      if (cached) {
        console.log('🔄 Gemini: Usando cache expirado devido ao rate limit');
        return { text: cached.response, ok: true };
      }
    }
    
    return { 
      text: "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes.", 
      ok: false, 
      error: error.message 
    };
  }
}

// Função para limpar cache
export function clearGeminiCache(): void {
  responseCache.clear();
  requestCount = 0;
  console.log('🧹 Gemini: Cache limpo');
}

// Função para obter estatísticas
export function getGeminiStats(): { cacheSize: number; requestCount: number } {
  return {
    cacheSize: responseCache.size,
    requestCount
  };
}

// Função de compatibilidade para chamadas antigas
export async function generateContentLegacy(prompt: string): Promise<{ text: string; ok: boolean; error?: string }> {
  return generateContent(prompt);
} 