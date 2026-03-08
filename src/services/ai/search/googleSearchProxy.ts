/**
 * Google Search Proxy - Chamadas via Edge Function
 * Todas as buscas Google passam pelo servidor para proteger API keys
 */

import { supabase } from '@/integrations/supabase/client';

export interface GoogleSearchProxyResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

export interface GoogleSearchProxyResponse {
  success: boolean;
  results: GoogleSearchProxyResult[];
  error?: string;
}

/**
 * Executa busca Google via Edge Function (chaves protegidas no servidor)
 */
export async function callGoogleSearchProxy(
  query: string,
  options: { maxResults?: number; location?: string } = {}
): Promise<GoogleSearchProxyResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('guata-google-search-proxy', {
      body: {
        query,
        maxResults: options.maxResults || 10,
        location: options.location || 'Mato Grosso do Sul'
      }
    });

    if (error) {
      console.warn('[GoogleSearchProxy] Edge Function error:', error);
      return { success: false, results: [], error: String(error) };
    }

    if (data?.error || !data?.success) {
      return { success: false, results: [], error: data?.error || 'Erro desconhecido' };
    }

    return {
      success: true,
      results: Array.isArray(data.results) ? data.results : []
    };
  } catch (err) {
    console.warn('[GoogleSearchProxy] Erro:', err);
    return { success: false, results: [], error: String(err) };
  }
}
