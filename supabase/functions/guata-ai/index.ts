import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateTouristPrompt, generateCATPrompt } from "./prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, knowledgeBase, userContext, mode = "tourist" } = await req.json()

    console.log(`Recebida solicitação no modo: ${mode}`)
    console.log(`Prompt: ${prompt}`)
    
    // Simple ping test
    if (prompt === "ping") {
      return new Response(
        JSON.stringify({ response: "pong" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construir contexto baseado na base de conhecimento
    let contextContent = "";
    if (knowledgeBase && Array.isArray(knowledgeBase)) {
      contextContent = knowledgeBase.map((item: any) => {
        return `${item.title}: ${item.content} (Fonte: ${item.source}, Atualizado: ${item.lastUpdated})`;
      }).join('\n\n');
    }

    // Gerar prompt apropriado baseado no modo
    let systemPrompt;
    if (mode === "cat") {
      systemPrompt = generateCATPrompt(contextContent, userContext);
    } else {
      systemPrompt = generateTouristPrompt(contextContent, userContext);
    }

    console.log("System prompt gerado:", systemPrompt.substring(0, 200) + "...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    console.log("Resposta da OpenAI recebida com sucesso")
    
    const aiResponse = data.choices[0].message.content

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in guata-ai function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})