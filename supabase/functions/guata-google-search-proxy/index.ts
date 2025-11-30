import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
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
  console.log("🔵 guata-google-search-proxy: request received", { method: req.method, url: req.url });
  
  // Handle CORS preflight requests - IMPORTANTE: retornar 200 OK
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

    const { query, maxResults = 5, location = 'Mato Grosso do Sul' } = body;
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid query field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API keys from environment (server-side only - never exposed to client)
    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const engineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    console.log('🔵 guata-google-search-proxy: API Key present:', !!apiKey, 'Engine ID present:', !!engineId);
    
    if (!apiKey || !engineId) {
      console.error('❌ Google Search API keys não configuradas no Supabase');
      console.error('   GOOGLE_SEARCH_API_KEY:', apiKey ? 'present' : 'missing');
      console.error('   GOOGLE_SEARCH_ENGINE_ID:', engineId ? 'present' : 'missing');
      // Retornar status 200 com erro para que o cliente possa ver os detalhes
      return new Response(
        JSON.stringify({ 
          error: 'API keys not configured',
          message: 'GOOGLE_SEARCH_API_KEY e GOOGLE_SEARCH_ENGINE_ID não estão configuradas nas variáveis de ambiente do Supabase',
          results: [],
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🔵 guata-google-search-proxy: searching for:", query);

    // Build search query with location context
    const searchQuery = `${query} ${location} turismo`;
    
    // Call Google Custom Search API
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(searchQuery)}&num=${maxResults}`;

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
    
    // Transform Google Search results to our format
    const results: GoogleSearchResult[] = (data.items || []).map((item: any) => ({
      title: item.title || '',
      snippet: item.snippet || item.htmlSnippet || '',
      url: item.link || '',
      source: 'google',
      description: item.snippet || ''
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
      success: false,
      ...(import.meta.env.DEV && { stack: error?.stack })
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

