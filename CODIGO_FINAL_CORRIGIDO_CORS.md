# 🔧 Código Final Corrigido - CORS Funcionando

## ⚠️ Problema

O Supabase pode estar usando `Deno.serve` em vez de `serve` do std, e o OPTIONS precisa retornar a string 'ok'.

## ✅ Código Corrigido para `guata-gemini-proxy`

**Cole este código EXATO no Supabase Dashboard:**

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface GeminiRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight - PRIMEIRA COISA
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const raw = await req.text();
    if (!raw) {
      return new Response(
        JSON.stringify({ error: 'Empty request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GeminiRequest = JSON.parse(raw);
    const { prompt, model = 'gemini-1.5-flash', temperature = 0.7, maxOutputTokens = 2000 } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid prompt field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'GEMINI_API_KEY não está configurada nas variáveis de ambiente do Supabase'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP: 0.9,
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
      return new Response(
        JSON.stringify({ 
          error: 'No text generated',
          message: 'Gemini não retornou texto na resposta'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        text: generatedText,
        model: model,
        usage: data.usageMetadata || {}
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error?.message || String(error) 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

---

## ✅ Código Corrigido para `guata-google-search-proxy`

**Cole este código EXATO no Supabase Dashboard:**

```typescript
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface GoogleSearchRequest {
  query: string;
  maxResults?: number;
  location?: string;
}

interface GoogleSearchResult {
  title: string;
  snippet: string;
  url: string;
  source?: string;
  description?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight - PRIMEIRA COISA
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const raw = await req.text();
    if (!raw) {
      return new Response(
        JSON.stringify({ error: 'Empty request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: GoogleSearchRequest = JSON.parse(raw);
    const { query, maxResults = 5, location = 'Mato Grosso do Sul' } = body;
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid query field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const engineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !engineId) {
      return new Response(
        JSON.stringify({ 
          error: 'API keys not configured',
          message: 'GOOGLE_SEARCH_API_KEY e GOOGLE_SEARCH_ENGINE_ID não estão configuradas nas variáveis de ambiente do Supabase',
          results: []
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchQuery = `${query} ${location} turismo`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(searchQuery)}&num=${maxResults}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      
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

    const data = await response.json();
    
    const results: GoogleSearchResult[] = (data.items || []).map((item: any) => ({
      title: item.title || '',
      snippet: item.snippet || item.htmlSnippet || '',
      url: item.link || '',
      source: 'google',
      description: item.snippet || ''
    }));
    
    return new Response(
      JSON.stringify({ 
        results,
        totalResults: data.searchInformation?.totalResults || results.length,
        searchTime: data.searchInformation?.searchTime || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error?.message || String(error),
        results: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

## 🔑 Mudanças Importantes

1. **Usa `Deno.serve`** em vez de `serve` do std
2. **OPTIONS retorna `'ok'`** como string (não `null`)
3. **Removido import do serve** do std
4. **Código simplificado** e mais direto

## 📋 Passos

1. **Edite `guata-gemini-proxy`** no Supabase Dashboard
2. **Cole o primeiro código** acima
3. **Deploy**
4. **Edite `guata-google-search-proxy`**
5. **Cole o segundo código** acima
6. **Deploy**
7. **Teste novamente**

Isso deve resolver o problema de CORS! 🎯



