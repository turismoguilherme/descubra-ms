import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { runGuataWebSearchPipeline } from "../_shared/guataWebSearchPipeline.ts";

const SEARCH_CACHE_MS = 30 * 60 * 1000;
const SEARCH_CACHE_MAX = 80;
const searchCache = new Map<string, { at: number; body: string }>();

function cacheGet(key: string): string | null {
  const e = searchCache.get(key);
  if (!e || Date.now() - e.at > SEARCH_CACHE_MS) {
    if (e) searchCache.delete(key);
    return null;
  }
  return e.body;
}

function cacheSet(key: string, body: string) {
  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const first = searchCache.keys().next().value;
    if (first) searchCache.delete(first);
  }
  searchCache.set(key, { at: Date.now(), body });
}

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
    // Parse request JSON
    let requestBody: GoogleSearchRequest;
    try {
      const raw = await req.text();
      if (!raw) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestBody = JSON.parse(raw);
    } catch (parseError) {
      console.error('❌ guata-google-search-proxy: JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query: rawQuery, maxResults = 5, location: rawLocation = 'Mato Grosso do Sul' } =
      requestBody;
    
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

    const cacheKey =
      `${query.toLowerCase().trim()}|${location.toLowerCase().trim()}|${safeMaxResults}`;
    const cachedBody = cacheGet(cacheKey);
    if (cachedBody) {
      console.log('🔄 guata-google-search-proxy: cache hit');
      return new Response(cachedBody, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const saJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    const gcpProject = Deno.env.get('GOOGLE_CLOUD_PROJECT') || Deno.env.get('GCP_PROJECT_ID');
    const vertexLocation = Deno.env.get('VERTEX_SEARCH_LOCATION') || 'global';
    const vertexServingFull = Deno.env.get('VERTEX_SEARCH_SERVING_CONFIG') || undefined;
    const vertexDataStoreId = Deno.env.get('VERTEX_SEARCH_DATA_STORE_ID') || undefined;
    const vertexEngineId = Deno.env.get('VERTEX_SEARCH_ENGINE_ID') || undefined;
    const vertexServingConfigId = Deno.env.get('VERTEX_SEARCH_SERVING_CONFIG_ID') ||
      undefined;
    const geminiModel =
      Deno.env.get('GUATA_WEB_SEARCH_GEMINI_MODEL') || 'gemini-2.5-flash';
    const vertexMin = Math.max(
      1,
      Math.min(
        10,
        Number(Deno.env.get('GUATA_WEB_SEARCH_VERTEX_MIN_BEFORE_GEMINI') || '3') || 3,
      ),
    );

    const legacyApiKey =
      Deno.env.get('GOOGLE_SEARCH_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
    const legacyEngineId =
      Deno.env.get('GOOGLE_SEARCH_ENGINE_ID') || Deno.env.get('GOOGLE_CSE_ID');

    console.log('🔵 guata-google-search-proxy: provedores');
    console.log('   GEMINI_API_KEY:', geminiKey ? 'present' : 'missing');
    console.log('   GOOGLE_SERVICE_ACCOUNT_JSON:', saJson ? 'present' : 'missing');
    console.log('   GOOGLE_CLOUD_PROJECT:', gcpProject ? 'present' : 'missing');
    console.log('   VERTEX_SEARCH_SERVING_CONFIG / DATA_STORE / ENGINE:', {
      full: !!vertexServingFull,
      dataStore: !!vertexDataStoreId,
      engine: !!vertexEngineId,
    });
    console.log('   Legacy CSE key+cx:', {
      key: !!legacyApiKey,
      cx: !!legacyEngineId,
    });

    console.log('🔵 guata-google-search-proxy: searching for:', query);

    const pipelineResult = await runGuataWebSearchPipeline(
      query,
      location,
      safeMaxResults,
      sanitizeInput,
      {
        geminiApiKey: geminiKey || undefined,
        geminiModel,
        vertexMinBeforeSkipGemini: vertexMin,
        serviceAccountJson: saJson || undefined,
        gcpProject: gcpProject || undefined,
        vertexLocation,
        vertexServingConfigResource: vertexServingFull,
        vertexDataStoreId,
        vertexEngineId,
        vertexServingConfigId,
        legacyApiKey: legacyApiKey || undefined,
        legacyEngineId: legacyEngineId || undefined,
      },
    );

    const payload = {
      results: pipelineResult.results as GoogleSearchResult[],
      success: pipelineResult.success,
      sourcesUsed: pipelineResult.sourcesUsed,
      ...(pipelineResult.error
        ? {
          error: pipelineResult.error,
          message: pipelineResult.message,
          help: pipelineResult.help,
        }
        : {
          totalResults: pipelineResult.results.length,
          searchTime: 0,
        }),
    };

    const jsonBody = JSON.stringify(payload);
    if (pipelineResult.success && pipelineResult.results.length > 0) {
      cacheSet(cacheKey, jsonBody);
    }

    console.log(
      '✅ guata-google-search-proxy:',
      pipelineResult.results.length,
      'results | sources:',
      pipelineResult.sourcesUsed.join(',') || '(none)',
    );

    return new Response(jsonBody, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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

