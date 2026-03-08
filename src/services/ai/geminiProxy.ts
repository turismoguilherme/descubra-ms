/**
 * Proxy centralizado para chamadas Gemini AI.
 * SEGURANÇA: Todas as chamadas passam pela Edge Function (chave protegida no servidor).
 * Nenhuma API key é exposta no client-side.
 */

import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errorUtils';

interface GeminiProxyOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

interface GeminiProxyResult {
  text: string;
  ok: boolean;
  error?: string;
}

const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

let requestCount = 0;
const REQUEST_LIMIT_PER_MINUTE = 10;

/**
 * Chama a Gemini API via Edge Function segura.
 * Substitui qualquer uso direto de VITE_GEMINI_API_KEY no client-side.
 */
export async function callGeminiProxy(
  prompt: string,
  options: GeminiProxyOptions = {}
): Promise<GeminiProxyResult> {
  try {
    // Verificar cache
    const cacheKey = prompt.substring(0, 100);
    const cached = responseCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return { text: cached.response, ok: true };
    }

    // Rate limiting client-side (proteção adicional, o servidor também limita)
    if (requestCount >= REQUEST_LIMIT_PER_MINUTE) {
      await new Promise(resolve => setTimeout(resolve, 60000));
      requestCount = 0;
    }

    const { data, error } = await supabase.functions.invoke('guata-gemini-proxy', {
      body: {
        prompt,
        model: options.model || 'gemini-2.0-flash-exp',
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2000
      }
    });

    if (error) {
      throw new Error(`Edge Function error: ${getErrorMessage(error)}`);
    }

    if (data?.error || !data?.success) {
      throw new Error(data?.error || 'Erro desconhecido na Edge Function');
    }

    if (!data?.text) {
      throw new Error('Resposta da Edge Function não contém texto');
    }

    requestCount++;
    responseCache.set(cacheKey, { response: data.text, timestamp: Date.now() });

    return { text: data.text, ok: true };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('❌ GeminiProxy: Erro:', errorMessage);

    // Tentar cache expirado em caso de rate limit
    const cacheKey = prompt.substring(0, 100);
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return { text: cached.response, ok: true };
    }

    return {
      text: "Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes.",
      ok: false,
      error: errorMessage
    };
  }
}

/**
 * Limpar cache do proxy
 */
export function clearGeminiProxyCache(): void {
  responseCache.clear();
  requestCount = 0;
}
