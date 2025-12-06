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
 * Validate request origin
 */
function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Allow any localhost origin (any port) for development
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  
  const allowedOrigins = [
    'https://www.viajartur.com',
    'https://viajartur.com',
    'https://descubra-ms.vercel.app'
  ];
  
  // Check exact match or Vercel subdomain
  return allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
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
  const corsHeaders = getCorsHeaders(origin);
  
  // Validate origin for security (mais permissivo para debug)
  if (req.method !== 'OPTIONS' && !validateOrigin(origin)) {
    console.warn('⚠️ guata-google-search-proxy: Origin não permitida:', origin);
    console.warn('   Origins permitidas:', [
      'https://www.viajartur.com',
      'https://viajartur.com',
      'https://descubra-ms.vercel.app',
      'http://localhost:*',
      '*.vercel.app'
    ]);
    // Em desenvolvimento, permitir mesmo com origem inválida (mas logar)
    const isDev = Deno.env.get('ENVIRONMENT') === 'development' || !origin;
    if (!isDev) {
      return new Response(
        JSON.stringify({ 
          error: 'Origin not allowed', 
          message: `Origin "${origin}" não está na lista de permitidas`,
          results: [],
          success: false
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  console.log("🔵 guata-google-search-proxy: request received", { method: req.method, url: req.url, origin });
  
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

    // Get API keys from environment (server-side only - never exposed to client)
    // Tentar múltiplos nomes de variáveis para compatibilidade
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY') || 
                   Deno.env.get('GOOGLE_API_KEY') || 
                   Deno.env.get('VITE_GOOGLE_SEARCH_API_KEY');
    const engineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID') || 
                     Deno.env.get('GOOGLE_CSE_ID') || 
                     Deno.env.get('VITE_GOOGLE_SEARCH_ENGINE_ID') ||
                     'a3641e1665f7b4909'; // Fallback para engine ID hardcoded
    
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
        return new Response(
          JSON.stringify({ 
            error: 'API_KEY_LEAKED',
            message: 'API key foi reportada como vazada',
            results: []
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

