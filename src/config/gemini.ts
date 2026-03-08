import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errorUtils';

// SECURITY: geminiClient removido - todas as chamadas devem usar generateContent() via Edge Function

// Cache para reduzir chamadas à API
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 0; // 0 = cache desabilitado para respostas sempre reais

// Contador de requests para monitoramento
let requestCount = 0;
const REQUEST_LIMIT_PER_MINUTE = 10; // Reduzido de 15 para 10 para margem de segurança

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
    
    // Usar Edge Function (chaves protegidas no servidor)
    const { data, error } = await supabase.functions.invoke('guata-gemini-proxy', {
      body: {
        prompt: fullPrompt,
        model: 'gemini-2.0-flash-exp', // Modelo que funciona na Edge Function
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    });

    // Verificar se há erro na resposta
    if (error) {
      const errorMessage = getErrorMessage(error, 'Erro desconhecido na Edge Function');
      throw new Error(`Edge Function error: ${errorMessage}`);
    }

    if (data?.error || !data?.success) {
      throw new Error(data?.error || 'Erro desconhecido na Edge Function');
    }

    if (!data?.text) {
      throw new Error('Resposta da Edge Function não contém texto');
    }

    const text = data.text;
    
    // Incrementar contador
    requestCount++;
    
    // Salvar no cache
    responseCache.set(cacheKey, { response: text, timestamp: Date.now() });
    
    console.log(`✅ Gemini: Resposta gerada via Edge Function (request #${requestCount})`);
    
    return { text, ok: true };
    
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('❌ Gemini: Erro na API:', errorMessage);
    
    // Se for rate limit, tentar usar cache mesmo que expirado
    const errorObj = error && typeof error === 'object' && 'message' in error
      ? (error as { message?: string })
      : null;
    
    if (errorObj?.message?.includes('rate limit') || errorMessage.includes('rate limit')) {
      const fullPrompt = userPrompt 
        ? `${systemPrompt}\n\n${userPrompt}`
        : systemPrompt;
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
      error: errorMessage 
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