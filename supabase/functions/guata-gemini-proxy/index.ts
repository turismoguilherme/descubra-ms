import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getDailyBudgetMax, tryConsumeGeminiBudget } from "../_shared/guataGeminiBudget.ts";
import {
  persistSharedGuataCache,
  proxyMemoryCacheGet,
  proxyMemoryCacheKey,
  proxyMemoryCacheSet,
} from "../_shared/guataGeminiProxyCache.ts";

const RATE_LIMIT_PER_MIN = parseInt(Deno.env.get("GUATA_GEMINI_RATE_PER_MIN") ?? "6");
const minuteWindow = new Map<string, { count: number; ts: number }>();

function checkMinuteRateLimit(key: string): boolean {
  const currentMinute = Math.floor(Date.now() / 60000);
  const entry = minuteWindow.get(key);
  if (!entry || entry.ts !== currentMinute) {
    minuteWindow.set(key, { count: 1, ts: currentMinute });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT_PER_MIN;
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input: string, maxLength: number = 100000): string {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  // Limit length
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
    'https://descubrams.com',
    'https://www.descubrams.com',
    'https://descubra-ms.vercel.app',
    'https://descubra-ms.lovable.app'
  ];
  
  // Check exact match, Vercel subdomain, or Lovable preview
  return allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.lovable.app');
}

interface GeminiRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  context?: any;
  conversationHistory?: string[];
  searchResults?: any[];
  partnersInfo?: any[];
  userLocation?: string;
  isTotemVersion?: boolean;
  isFirstUserMessage?: boolean;
  /** Quando true, ativa Google Search grounding no Gemini (fallback se busca web falhou). */
  enableGoogleSearch?: boolean;
  /** Pergunta original do usuário (para cache compartilhado). */
  cacheQuestion?: string;
  sessionId?: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Validate origin for security
  if (req.method !== 'OPTIONS' && !validateOrigin(origin)) {
    console.warn('⚠️ guata-gemini-proxy: Invalid origin:', origin);
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log("🔵 guata-gemini-proxy: request received", { method: req.method, url: req.url, origin });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Parse body
    let body: GeminiRequest;
    try {
      const raw = await req.text();
      if (!raw) {
        console.error('❌ guata-gemini-proxy: Empty request body');
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      body = JSON.parse(raw);
      console.log('🔵 guata-gemini-proxy: Body parsed successfully, prompt length:', body.prompt?.length || 0);
    } catch (parseError) {
      console.error('❌ guata-gemini-proxy: JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: String(parseError) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      prompt: rawPrompt,
      model = 'gemini-2.5-flash',
      temperature = 0.3,
      maxOutputTokens = 2048,
      enableGoogleSearch = false,
      userLocation,
      cacheQuestion,
      sessionId,
    } = body;
    
    if (!rawPrompt) {
      console.error('❌ guata-gemini-proxy: Missing prompt field');
      return new Response(
        JSON.stringify({ error: 'Missing prompt field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof rawPrompt !== 'string') {
      console.error('❌ guata-gemini-proxy: Invalid prompt type:', typeof rawPrompt);
      return new Response(
        JSON.stringify({ error: 'Invalid prompt field - must be a string', receivedType: typeof rawPrompt }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize prompt input
    const prompt = sanitizeInput(rawPrompt, 100000);
    
    if (prompt.length === 0) {
      console.error('❌ guata-gemini-proxy: Empty prompt string after sanitization');
      return new Response(
        JSON.stringify({ error: 'Prompt cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate model name to prevent injection
    const allowedModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ];
    const safeModel = allowedModels.includes(model) ? model : 'gemini-2.5-flash';
    
    // Validate temperature and maxOutputTokens
    const safeTemperature = Math.max(0, Math.min(1, temperature || 0.3));
    const safeMaxOutputTokens = Math.max(1, Math.min(8192, maxOutputTokens || 2048));

    // Get API key from environment (server-side only - never exposed to client)
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY não configurada no Supabase');
      // Retornar status 200 com erro para que o cliente possa ver os detalhes
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'GEMINI_API_KEY não está configurada nas variáveis de ambiente do Supabase',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar tamanho do prompt (limite do Gemini é ~1M tokens, mas vamos limitar a 100k caracteres para segurança)
    if (prompt.length > 100000) {
      console.error('❌ guata-gemini-proxy: Prompt too large:', prompt.length, 'characters');
      return new Response(
        JSON.stringify({ 
          error: 'Prompt too large',
          message: `Prompt excede o limite de 100.000 caracteres (recebido: ${prompt.length})`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const useGoogleSearch = Boolean(enableGoogleSearch);
    const cacheQ = cacheQuestion ? sanitizeInput(String(cacheQuestion), 500) : "";
    const memKey = cacheQ
      ? proxyMemoryCacheKey(cacheQ, safeModel, useGoogleSearch)
      : "";

    if (memKey) {
      const cached = proxyMemoryCacheGet(memKey);
      if (cached) {
        console.log("🔄 guata-gemini-proxy: memory cache hit");
        return new Response(cached, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const budget = await tryConsumeGeminiBudget();
    if (!budget.ok) {
      console.warn("⛔ guata-gemini-proxy: daily budget exceeded", budget);
      return new Response(
        JSON.stringify({
          error: "DAILY_BUDGET_EXCEEDED",
          message:
            "O Guatá atingiu o limite de consultas com IA de hoje. Tente amanhã ou veja turismo.ms.gov.br e o mapa de destinos no Descubra MS.",
          success: false,
          budget: { count: budget.count, max: budget.max ?? getDailyBudgetMax() },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(
      "🔵 guata-gemini-proxy: calling Gemini API with model:",
      safeModel,
      "prompt length:",
      prompt.length,
      "google_search:",
      useGoogleSearch,
      "budget:",
      `${budget.count}/${budget.max}`,
    );

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${apiKey}`;

    const locationHint = userLocation
      ? sanitizeInput(String(userLocation), 100)
      : "Mato Grosso do Sul";
    const groundedPrompt = useGoogleSearch
      ? `Contexto: turismo em ${locationHint}, Brasil. Use pesquisa na web para informações atualizadas e cite fontes confiáveis (.gov.br quando existir).\n\n${prompt}`
      : prompt;
    
    const requestBody: Record<string, unknown> = {
      contents: [{ parts: [{ text: groundedPrompt }] }],
      generationConfig: {
        temperature: safeTemperature,
        maxOutputTokens: safeMaxOutputTokens,
        topP: 0.8,
        topK: 40
      }
    };

    if (useGoogleSearch) {
      requestBody.tools = [{ google_search: {} }];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', response.status, errorText);
      
      // Handle specific errors
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: 'API_KEY_LEAKED',
            message: 'API key foi reportada como vazada'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ 
            error: 'API_KEY_EXPIRED',
            message: 'API key inválida ou expirada'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle rate limit / quota exceeded with friendly message
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'QUOTA_EXCEEDED',
            message: 'Estou com muitas consultas no momento. Tente novamente em alguns instantes.',
            success: false
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error',
          status: response.status,
          message: 'Erro temporário no serviço de IA. Tente novamente.',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const parts = (data.candidates?.[0]?.content?.parts ?? []) as Array<{ text?: string }>;
    const generatedText = parts.map((p) => p.text ?? '').join('').trim() || undefined;

    if (!generatedText) {
      console.error('❌ Nenhum texto gerado pelo Gemini');
      return new Response(
        JSON.stringify({ 
          error: 'No text generated',
          message: 'Gemini não retornou texto na resposta'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groundingChunks = (
      data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
    ) as Array<{ web?: { uri?: string; title?: string } }>;
    const webSourcesUsed = groundingChunks
      .map((c) => c.web?.uri)
      .filter((uri): uri is string => Boolean(uri));

    console.log(
      '✅ Gemini response generated:',
      generatedText.substring(0, 100) + '...',
      useGoogleSearch ? `| web sources: ${webSourcesUsed.length}` : '',
    );
    
    // Sanitize response before sending
    const sanitizedText = sanitizeInput(generatedText, 50000);
    
    const payload = JSON.stringify({
      text: sanitizedText,
      model: safeModel,
      usage: data.usageMetadata || {},
      success: true,
      ...(useGoogleSearch
        ? { usedGoogleSearch: true, webSourcesUsed }
        : {}),
    });

    if (memKey) {
      proxyMemoryCacheSet(memKey, payload);
    }
    if (cacheQ) {
      persistSharedGuataCache(cacheQ, sanitizedText).catch((e) =>
        console.warn("guata-gemini-proxy: cache persist failed", e)
      );
    }

    return new Response(payload, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error('❌ guata-gemini-proxy: handler error:', { 
      message: error?.message, 
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    
    const errorDetails = {
      error: 'Internal server error',
      message: error?.message ?? String(error),
      success: false,
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

