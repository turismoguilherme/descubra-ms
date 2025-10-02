import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"; // Atualizado para 0.177.0
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3' // Atualizado para 2.39.3
import { generateTouristPrompt, generateCATPrompt } from "./prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_PER_MIN = parseInt(Deno.env.get('RATE_LIMIT_PER_MIN') ?? '8')
const DAILY_BUDGET_CALLS = parseInt(Deno.env.get('DAILY_BUDGET_CALLS') ?? '200')
const GEMINI_MAX_OUTPUT_TOKENS = parseInt(Deno.env.get('GEMINI_MAX_OUTPUT_TOKENS') ?? '400')
const GEMINI_TEMPERATURE = parseFloat(Deno.env.get('GEMINI_TEMPERATURE') ?? '0.6')
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-1.5-flash-002'

const minuteWindow: Map<string, { count: number; ts: number }> = new Map()
const dailyWindow: Map<string, { count: number; day: string }> = new Map()

function checkRate(key: string): { ok: boolean; reason?: string } {
  const now = Date.now()
  const currentMinute = Math.floor(now / 60000)
  const m = minuteWindow.get(key)
  if (!m || m.ts !== currentMinute) minuteWindow.set(key, { count: 1, ts: currentMinute })
  else if (++m.count > RATE_LIMIT_PER_MIN) return { ok: false, reason: 'MIN' }
  const day = new Date().toISOString().slice(0, 10)
  const d = dailyWindow.get(key)
  if (!d || d.day !== day) dailyWindow.set(key, { count: 1, day })
  else if (++d.count > DAILY_BUDGET_CALLS) return { ok: false, reason: 'DAY' }
  return { ok: true }
}

// Envolver o serve em um try/catch para capturar erros de inicialização
try {
  serve(async (req) => {
    console.log("🔵 guata-ai: request received", { method: req.method, url: req.url })
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      console.log("🔵 guata-ai: parsing body json")
      const contentType = req.headers.get('content-type') || ''
      const raw = await req.text()
      if (!raw || !contentType.includes('application/json')) {
        console.error('❌ guata-ai: invalid body', { contentType, hasBody: !!raw })
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body', details: 'Expect application/json with {"prompt": "..."}' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      let parsed: any
      try {
        parsed = JSON.parse(raw)
      } catch (e) {
        console.error('❌ guata-ai: JSON.parse failed', { rawPreview: raw.slice(0, 100) })
        return new Response(
          JSON.stringify({ error: 'Invalid JSON body', details: 'Malformed JSON' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { prompt, knowledgeBase, userContext, mode = "tourist" } = parsed || {}
      if (!prompt || typeof prompt !== 'string') {
        console.error('❌ guata-ai: missing prompt')
        return new Response(
          JSON.stringify({ error: 'Missing field: prompt' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log("🔵 guata-ai: payload", {
        mode,
        promptPreview: typeof prompt === 'string' ? String(prompt).slice(0, 80) : typeof prompt,
        kbItems: Array.isArray(knowledgeBase) ? knowledgeBase.length : 0,
        hasUserContext: !!userContext
      })

      // Simple ping test
      if (prompt === "ping") {
        return new Response(
          JSON.stringify({ response: "pong" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || ''
      console.log("🔵 guata-ai: GEMINI_API_KEY present?", { present: !!geminiApiKey, length: geminiApiKey ? geminiApiKey.length : 0 })
      if (!geminiApiKey) {
        console.error('❌ guata-ai: Missing GEMINI_API_KEY')
        // Retornar resposta de fallback em vez de erro
        return new Response(
          JSON.stringify({ 
            response: 'Desculpe, o sistema está temporariamente indisponível. Tente novamente em alguns instantes.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Construir contexto baseado na base de conhecimento
      let contextContent = "";
      if (knowledgeBase && Array.isArray(knowledgeBase)) {
        contextContent = knowledgeBase.map((item: any) => {
          return `${item.title}: ${item.content} (Fonte: ${item.source}, Atualizado: ${item.lastUpdated})`;
        }).join('\n\n');
      }
      console.log("🔵 guata-ai: context length", contextContent.length)

      // Gerar prompt apropriado baseado no modo
      let systemPrompt;
      if (mode === "cat") {
        systemPrompt = generateCATPrompt(contextContent, userContext);
      } else {
        systemPrompt = generateTouristPrompt(contextContent, userContext, parsed?.chatHistory || "");
      }

      console.log("🔵 guata-ai: systemPrompt length", systemPrompt.length)

      const reqKey = (parsed?.userContext || '').slice(0, 32) || req.headers.get('x-forwarded-for') || 'anon'
      const rl = checkRate(String(reqKey))
      if (!rl.ok) {
        return new Response(JSON.stringify({ error: rl.reason === 'MIN' ? 'Muitas requisições em um minuto. Aguarde alguns segundos.' : 'Limite diário atingido. Tente novamente amanhã.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Usar API Gemini em vez de OpenAI
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`
      console.log("🔵 guata-ai: calling Gemini", { url: url.replace(geminiApiKey, '***') })
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nPergunta do usuário: ${prompt}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
            temperature: GEMINI_TEMPERATURE,
          }
        }),
      })

      console.log("🔵 guata-ai: Gemini status", { ok: response.ok, status: response.status })
      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ guata-ai: Gemini API error:', errorData)
        // Retornar resposta de fallback em vez de erro
        return new Response(
          JSON.stringify({ 
            response: 'Desculpe, o sistema está temporariamente indisponível. Tente novamente em alguns instantes.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await response.json()
      console.log("🔵 guata-ai: Gemini ok, candidates?", Array.isArray(data?.candidates) ? data.candidates.length : 0)

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      console.log("🔵 guata-ai: response length", aiResponse.length)

      // Se a resposta estiver vazia, retornar fallback
      if (!aiResponse || aiResponse.trim().length === 0) {
        console.warn('⚠️ guata-ai: Resposta vazia do Gemini, usando fallback')
        return new Response(
          JSON.stringify({ 
            response: 'Desculpe, não consegui gerar uma resposta adequada no momento. Tente reformular sua pergunta ou perguntar sobre outro tópico.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ response: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error: any) {
      console.error('❌ guata-ai: handler error:', { message: error?.message, stack: error?.stack })
      return new Response(
        JSON.stringify({ 
          error: 'Erro interno do servidor',
          details: error?.message || String(error) 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  })
} catch (error) {
  console.error('❌ guata-ai: init error:', error)
  Deno.exit(1)
}