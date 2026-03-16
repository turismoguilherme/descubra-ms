import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
  
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate request origin - verifica tanto Origin quanto Referer
 */
function validateOrigin(origin: string | null, referer: string | null): boolean {
  console.log('🔍 [validateOrigin] Verificando:', { origin: origin || '(null)', referer: referer || '(null)' });
  
  // Extrair origem do referer se não houver origin header
  let effectiveOrigin = origin;
  if (!effectiveOrigin && referer) {
    try {
      const refererUrl = new URL(referer);
      effectiveOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      console.log('📌 [validateOrigin] Origin extraída do Referer:', effectiveOrigin);
    } catch (e) {
      console.warn('⚠️ [validateOrigin] Erro ao extrair origin do Referer:', e);
    }
  }
  
  // SEMPRE permitir localhost (qualquer porta) - para desenvolvimento
  if (effectiveOrigin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(effectiveOrigin)) {
    console.log('✅ [validateOrigin] Localhost permitido:', effectiveOrigin);
    return true;
  }
  
  // Permitir requisições sem origin/referer (pode ser requisição interna do Supabase)
  if (!effectiveOrigin) {
    console.log('⚠️ [validateOrigin] Sem origin/referer - permitindo (pode ser requisição interna do Supabase)');
    return true; // Mais permissivo - permitir requisições internas
  }
  
  // Origins permitidas em produção
  const allowedOrigins = [
    'https://www.viajartur.com',
    'https://viajartur.com',
    'https://descubrams.com',
    'https://www.descubrams.com',
    'https://descubra-ms.vercel.app'
  ];
  
  // Verificar match exato ou subdomínio Vercel
  const isAllowed = allowedOrigins.includes(effectiveOrigin) || effectiveOrigin.endsWith('.vercel.app');
  
  if (isAllowed) {
    console.log('✅ [validateOrigin] Origin permitida:', effectiveOrigin);
  } else {
    console.log('❌ [validateOrigin] Origin NÃO permitida:', effectiveOrigin);
    console.log('   Origins permitidas:', allowedOrigins);
  }
  
  return isAllowed;
}

interface GoogleSearchRequest {
  query: string;
  maxResults?: number;
  location?: string;
  category?: string;
}

interface GoogleSearchResult {
  title: string;
  snippet: string;
  url: string;
  source?: string;
  description?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const userAgent = req.headers.get('user-agent');
  
  console.log('📥 [guata-google-search-proxy] Request recebida:', {
    method: req.method,
    url: req.url,
    origin: origin || '(null)',
    referer: referer || '(null)',
    userAgent: userAgent?.substring(0, 50) || '(null)',
    allHeaders: Object.fromEntries(req.headers.entries())
  });
  
  const corsHeaders = getCorsHeaders(origin);
  
  // Validate origin for security (passa tanto origin quanto referer)
  if (req.method !== 'OPTIONS' && !validateOrigin(origin, referer)) {
    console.error('🚫 [guata-google-search-proxy] Origin bloqueada:', origin);
    console.error('   Referer:', referer);
    console.error('   User-Agent:', userAgent);
    
    return new Response(
      JSON.stringify({ 
        error: 'Origin not allowed', 
        message: `Origin "${origin || 'null'}" não está na lista de permitidas`,
        debug: {
          origin,
          referer,
          allowedOrigins: [
            'http://localhost:*',
            'https://www.viajartur.com',
            'https://viajartur.com',
            'https://descubrams.com',
            'https://www.descubrams.com',
            'https://descubra-ms.vercel.app',
            '*.vercel.app'
          ]
        },
        results: [],
        success: false
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log("✅ [guata-google-search-proxy] Origin validada, processando request");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Parse body
    let body: GoogleSearchRequest;
    try {
      const raw = await req.text();
      if (!raw) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      body = JSON.parse(raw);
    } catch (parseError) {
      console.error('❌ guata-google-search-proxy: JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query: rawQuery, maxResults = 5, location: rawLocation = 'Mato Grosso do Sul' } = body;
    
    if (!rawQuery || typeof rawQuery !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid query field', results: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Sanitize inputs
    const query = sanitizeInput(rawQuery, 500);
    const location = sanitizeInput(rawLocation, 100);
    
    console.log('🔵 guata-google-search-proxy: Query recebida:', query.substring(0, 100));
    console.log('🔵 guata-google-search-proxy: Location:', location);
    
    if (query.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query cannot be empty after sanitization', results: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate and limit maxResults
    const safeMaxResults = Math.max(1, Math.min(10, maxResults || 5));

    // Get API keys from Supabase Secrets (server-side only)
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
    const engineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID') || Deno.env.get('GOOGLE_CSE_ID');
    
    console.log('🔵 guata-google-search-proxy: Verificando configuração...');
    console.log('   GOOGLE_SEARCH_API_KEY:', apiKey ? '✅ present' : '❌ missing');
    console.log('   GOOGLE_SEARCH_ENGINE_ID:', engineId ? '✅ present' : '❌ missing');
    
    if (!apiKey) {
      console.error('❌ Google Search API Key não configurada no Supabase');
      console.error('💡 Configure o secret: GOOGLE_SEARCH_API_KEY');
      console.error('   Dashboard → Settings → Edge Functions → Secrets');
      // Retornar status 200 com erro para que o cliente possa ver os detalhes
      return new Response(
        JSON.stringify({ 
          error: 'API keys not configured',
          message: 'GOOGLE_SEARCH_API_KEY não está configurada nas variáveis de ambiente do Supabase. Configure em: Settings → Edge Functions → Secrets',
          results: [],
          success: false,
          help: 'Acesse o Supabase Dashboard → Settings → Edge Functions → Secrets e adicione GOOGLE_SEARCH_API_KEY'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!engineId) {
      console.error('❌ Google Search Engine ID não configurado no Supabase');
      console.error('💡 Configure o secret: GOOGLE_SEARCH_ENGINE_ID');
      return new Response(
        JSON.stringify({ 
          error: 'Engine ID not configured',
          message: 'GOOGLE_SEARCH_ENGINE_ID não está configurado. Usando fallback.',
          results: [],
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🔵 guata-google-search-proxy: searching for:", query);

    // Build search query with location context (already sanitized)
    const searchQuery = `${query} ${location} turismo`;
    
    // Call Google Custom Search API
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(searchQuery)}&num=${safeMaxResults}`;

    console.log('🔵 guata-google-search-proxy: Calling Google Search API with URL:', url.replace(apiKey, '***'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('🔵 guata-google-search-proxy: Google Search API response status:', response.status);

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      console.error('❌ Google Search API error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 403) {
        let errorDetails = '';
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error?.message || errorText;
        } catch {
          errorDetails = errorText;
        }
        
        console.error('❌ Google Search API 403 - Detalhes:', errorDetails);
        
        // Verificar tipo de erro 403
        let errorType = 'API_NOT_ENABLED';
        let errorMessage = 'API não habilitada ou chave inválida';
        
        if (errorDetails.includes('API key not valid') || errorDetails.includes('invalid API key')) {
          errorType = 'INVALID_API_KEY';
          errorMessage = 'Chave de API inválida. Verifique se a chave está correta no Google Cloud Console.';
        } else if (errorDetails.includes('API has not been used') || errorDetails.includes('not enabled')) {
          errorType = 'API_NOT_ENABLED';
          errorMessage = 'Custom Search API não está habilitada. Ative em: Google Cloud Console → APIs & Services → Library → Custom Search API';
        } else if (errorDetails.includes('leaked') || errorDetails.includes('vazada')) {
          errorType = 'API_KEY_LEAKED';
          errorMessage = 'API key foi reportada como vazada. Gere uma nova chave no Google Cloud Console.';
        } else if (errorDetails.includes('invalid cx') || errorDetails.includes('invalid search engine')) {
          errorType = 'INVALID_ENGINE_ID';
          errorMessage = 'Search Engine ID inválido. Verifique se o ID está correto: a1a3bd0b75c7d46bf';
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorType,
            message: errorMessage,
            details: errorDetails,
            results: [],
            success: false,
            help: 'Verifique: 1) Se a Custom Search API está habilitada no Google Cloud Console, 2) Se a API Key está correta, 3) Se o Engine ID está correto'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Limite de requisições excedido',
            results: []
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Google Search API error',
          status: response.status,
          message: errorText,
          results: []
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ guata-google-search-proxy: Failed to parse JSON response:', jsonError);
      // Retornar status 200 com erro para que o cliente possa ver os detalhes
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON response from Google Search API',
          message: String(jsonError),
          results: [],
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform Google Search results to our format (sanitize all fields)
    const results: GoogleSearchResult[] = (data.items || []).map((item: any) => ({
      title: sanitizeInput(item.title || '', 200),
      snippet: sanitizeInput(item.snippet || item.htmlSnippet || '', 500),
      url: sanitizeInput(item.link || '', 500),
      source: 'google',
      description: sanitizeInput(item.snippet || '', 500)
    }));

    console.log('✅ Google Search results:', results.length, 'results found');
    
    return new Response(
      JSON.stringify({ 
        results,
        totalResults: data.searchInformation?.totalResults || results.length,
        searchTime: data.searchInformation?.searchTime || 0,
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ guata-google-search-proxy: handler error:', { 
      message: error?.message, 
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    
    // Retornar erro detalhado para debug (status 200 para que o cliente possa ver)
    const errorDetails = {
      error: 'Internal server error',
      message: error?.message || String(error),
      type: error?.name || 'UnknownError',
      results: [],
      success: false
    };
    
    return new Response(
      JSON.stringify(errorDetails),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

