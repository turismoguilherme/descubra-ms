import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔑 Gemini API Key:', Deno.env.get('GEMINI_API_KEY') ? '✅ Configurada' : '❌ Não configurada')
    
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada')
    }
    
    console.log('🔑 API Key length:', apiKey.length)
    console.log('🔑 API Key preview:', apiKey.substring(0, 10) + '...')
    console.log('🔑 API Key completa:', apiKey)
    
    const prompt = "Olá! Você é o Guatá, assistente de turismo do Mato Grosso do Sul. Responda em português brasileiro de forma amigável: 'Qual é a capital do Mato Grosso do Sul?'"
    
    console.log('📝 Enviando prompt para Gemini...')
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
    
    console.log('📤 Headers sendo enviados:', JSON.stringify(headers, null, 2))
    console.log('📤 URL da API:', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent')
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    }
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    
    console.log('📡 Response Status:', response.status)
    console.log('📡 Response OK:', response.ok)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Error response:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('📡 Response Data:', JSON.stringify(data, null, 2))
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (generatedText) {
      console.log('✅ Success! Generated text:', generatedText)
      return new Response(
        JSON.stringify({
          success: true,
          text: generatedText,
          api_key_status: '✅ Configurada',
          response_status: response.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      console.log('❌ No text generated')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No text generated',
          data: data
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        api_key_status: Deno.env.get('GEMINI_API_KEY') ? '✅ Configurada' : '❌ Não configurada'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
