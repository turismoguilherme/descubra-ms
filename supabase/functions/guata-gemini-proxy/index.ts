import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
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
  console.log("🔵 guata-gemini-proxy: request received", { method: req.method, url: req.url });
  
  // Handle CORS preflight requests - IMPORTANTE: retornar 200 OK
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

    const { prompt, model = 'gemini-2.0-flash-exp', temperature = 0.3, maxOutputTokens = 2000 } = body;
    
    if (!prompt) {
      console.error('❌ guata-gemini-proxy: Missing prompt field');
      return new Response(
        JSON.stringify({ error: 'Missing prompt field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof prompt !== 'string') {
      console.error('❌ guata-gemini-proxy: Invalid prompt type:', typeof prompt);
      return new Response(
        JSON.stringify({ error: 'Invalid prompt field - must be a string', receivedType: typeof prompt }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length === 0) {
      console.error('❌ guata-gemini-proxy: Empty prompt string');
      return new Response(
        JSON.stringify({ error: 'Prompt cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log("🔵 guata-gemini-proxy: calling Gemini API with model:", model, "prompt length:", prompt.length);

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: temperature || 0.5, // Default mais baixo para seguir instruções melhor
        maxOutputTokens,
        topP: 0.8, // Reduzido de 0.9 para ser mais determinístico
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

      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error',
          status: response.status,
          message: errorText
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    return new Response(
      JSON.stringify({ 
        text: generatedText,
        model: model,
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

