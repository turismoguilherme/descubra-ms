import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

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

    const { prompt: rawPrompt, model = 'gemini-2.0-flash-exp', temperature = 0.3, maxOutputTokens = 2000 } = body;
    
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
    const allowedModels = ['gemini-2.0-flash-exp', 'gemini-2.0-flash', 'gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    const safeModel = allowedModels.includes(model) ? model : 'gemini-2.0-flash-exp';
    
    // Validate temperature and maxOutputTokens
    const safeTemperature = Math.max(0, Math.min(1, temperature || 0.3));
    const safeMaxOutputTokens = Math.max(1, Math.min(8192, maxOutputTokens || 2000));

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

    console.log("🔵 guata-gemini-proxy: calling Gemini API with model:", safeModel, "prompt length:", prompt.length);

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: safeTemperature,
        maxOutputTokens: safeMaxOutputTokens,
        topP: 0.8,
        topK: 40
      }
    };

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
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

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

    console.log('✅ Gemini response generated:', generatedText.substring(0, 100) + '...');
    
    // Sanitize response before sending
    const sanitizedText = sanitizeInput(generatedText, 50000);
    
    return new Response(
      JSON.stringify({ 
        text: sanitizedText,
        model: safeModel,
        usage: data.usageMetadata || {},
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ guata-gemini-proxy: handler error:', { 
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

