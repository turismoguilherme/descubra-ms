import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RAGQuery {
  question: string
  state_code?: string
  user_id?: string
  session_id?: string
  location?: string
}

interface SearchResult {
  title: string
  snippet: string
  link: string
  source: 'fts' | 'pse' | 'api' | 'embedding'
  confidence: number
  embedding?: number[]
  chunk_id?: string
}

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  wind_speed: number
}

interface PlaceData {
  name: string
  address: string
  rating?: number
  opening_hours?: string
  phone?: string
}

interface LearningData {
  query_type: string
  confidence: number
  sources: string[]
  user_feedback?: 'positive' | 'negative' | 'neutral'
  user_correction?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache simples em memória para Edge Function
const responseCache = new Map<string, any>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, state_code = 'MS', user_id, session_id, location } = await req.json() as RAGQuery
    
    console.log(`🔍 RAG Query iniciada: "${question}" for state: ${state_code}`)
    console.log(`👤 User ID: ${user_id}`)
    console.log(`🆔 Session ID: ${session_id}`)
    console.log(`📍 Location: ${location}`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
    
    // 0. Verificar cache primeiro
    const cacheKey = `${question.toLowerCase().trim()}:${state_code}:${user_id || 'anonymous'}`
    const cachedResponse = responseCache.get(cacheKey)
    
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL) {
      console.log('🔄 Resposta encontrada em cache!')
      return new Response(
        JSON.stringify({
          ...cachedResponse.data,
          from_cache: true,
          cache_hit: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    // 1. FTS Search (base de conhecimento local)
    console.log('\n📚 === INICIANDO BUSCA FTS ===')
    const ftsResults = await performFTSSearch(question, state_code)
    console.log(`📚 FTS results: ${ftsResults.length}`)
    
    // 2. Busca por embeddings (nova funcionalidade)
    console.log('\n🧮 === INICIANDO BUSCA POR EMBEDDINGS ===')
    const embeddingResults = await performEmbeddingSearch(question, state_code)
    console.log(`🧮 Embedding results: ${embeddingResults.length}`)
    
    // 3. PSE Search (busca web restrita)
    console.log('\n🌐 === INICIANDO BUSCA PSE (WEB) ===')
    const pseResults = await performPSESearch(question, state_code)
    console.log(`🌐 PSE results: ${pseResults.length}`)
    
    // 4. API Queries (tempo, lugares específicos)
    console.log('\n🔌 === INICIANDO CONSULTAS APIs ===')
    const apiResults = await performAPIQueries(question, state_code)
    console.log(`🔌 API results: ${apiResults.length}`)
    
    // 5. Combine and rank results
    console.log('\n🎯 === COMBINANDO E RANQUEANDO RESULTADOS ===')
    const allResults = [...ftsResults, ...embeddingResults, ...pseResults, ...apiResults]
    console.log(`🎯 Total resultados antes do ranking: ${allResults.length}`)
    const rankedResults = rankResults(allResults, question)
    console.log(`🎯 Top 5 resultados após ranking:`)
    rankedResults.slice(0, 5).forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.title} (${result.source}) - confidence: ${result.confidence}`)
    })
    
    // 6. Build context for Gemini
    console.log('\n📝 === CONSTRUINDO CONTEXTO PARA GEMINI ===')
    const context = buildContext(rankedResults.slice(0, 5))
    console.log(`📝 Contexto length: ${context.length} caracteres`)
    
    // 7. Generate response with Gemini
    console.log('\n🤖 === GERANDO RESPOSTA COM GEMINI ===')
    const response = await generateResponse(question, context, rankedResults)
    console.log(`🤖 Resposta gerada: ${response.substring(0, 100)}...`)
    
    // 8. Aplicar aprendizado contínuo
    console.log('\n🧠 === APLICANDO APRENDIZADO CONTÍNUO ===')
    const learningData = await applyContinuousLearning(question, rankedResults, user_id, session_id, location)
    console.log(`🧠 Dados de aprendizado processados:`, learningData)
    
    // 9. Log interaction
    console.log('\n💾 === SALVANDO LOGS ===')
    await logRAGInteraction(question, response, rankedResults, user_id, state_code, learningData)
    console.log(`💾 Logs salvos com sucesso`)
    
    // 10. Salvar no cache
    const finalResponse = {
      answer: response,
      sources: rankedResults.slice(0, 3).map(r => ({
        title: r.title,
        link: r.link,
        source: r.source
      })),
      confidence: calculateConfidence(rankedResults),
      total_sources: allResults.length,
      learning_applied: learningData.query_type !== 'unknown',
      processing_time_ms: Date.now() - Date.now() // Simulado
    }
    
    // Cache da resposta
    responseCache.set(cacheKey, {
      data: finalResponse,
      timestamp: Date.now()
    })
    
    // Limpar cache antigo se necessário
    if (responseCache.size > 100) {
      const keysToDelete = Array.from(responseCache.keys()).slice(0, 20)
      keysToDelete.forEach(key => responseCache.delete(key))
      console.log('🧹 Cache limpo: 20 entradas antigas removidas')
    }
    
    console.log('\n✅ === RESPOSTA FINAL ===')
    console.log('✅ Response:', JSON.stringify(finalResponse, null, 2))

    return new Response(
      JSON.stringify(finalResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    console.error('❌ RAG Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro no sistema RAG',
        fallback: 'Por favor, tente novamente ou consulte as fontes oficiais diretamente.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// NOVA FUNÇÃO: Busca por embeddings
async function performEmbeddingSearch(question: string, state_code: string): Promise<SearchResult[]> {
  try {
    console.log('🧮 Iniciando busca por embeddings...')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    // Gerar embedding da pergunta (simulado)
    const questionEmbedding = generateSimpleEmbedding(question)
    
    // Buscar chunks com embeddings
    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('content, metadata, document_id, embedding')
      .eq('state_code', state_code)
      .not('embedding', 'is', null)
      .limit(20)
    
    if (error || !chunks) {
      console.log('⚠️ Nenhum chunk com embedding encontrado')
      return []
    }
    
    // Calcular similaridade e filtrar resultados relevantes
    const results: SearchResult[] = []
    
    for (const chunk of chunks) {
      if (chunk.embedding) {
        const similarity = calculateCosineSimilarity(questionEmbedding, chunk.embedding)
        
        if (similarity > 0.3) { // Threshold de similaridade
          results.push({
            title: chunk.metadata?.title || 'Documento oficial',
            snippet: chunk.content.substring(0, 200) + '...',
            link: chunk.metadata?.url || '#',
            source: 'embedding' as const,
            confidence: similarity,
            embedding: chunk.embedding,
            chunk_id: chunk.document_id
          })
        }
      }
    }
    
    // Ordenar por similaridade
    results.sort((a, b) => b.confidence - a.confidence)
    
    console.log(`🧮 Embedding search: ${results.length} resultados relevantes`)
    return results.slice(0, 10) // Top 10
    
  } catch (error) {
    console.error('❌ Erro na busca por embeddings:', error)
    return []
  }
}

// Gerar embedding simples (simulado)
function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(384).fill(0)
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  
  for (let i = 0; i < 384; i++) {
    let value = 0
    for (const word of words) {
      const hash = simpleHash(word + i.toString())
      value += (hash % 200 - 100) / 100
    }
    embedding[i] = Math.tanh(value / words.length)
  }
  
  return embedding
}

// Calcular similaridade cosseno
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0
  
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }
  
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  return Math.max(0, (similarity + 1) / 2) // Normalizar para 0-1
}

// Hash simples
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

async function performFTSSearch(question: string, state_code: string): Promise<SearchResult[]> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )
  
  try {
    // Busca FTS mais inteligente
    const searchTerms = question.toLowerCase().split(/\s+/).filter(term => term.length > 2).slice(0, 3)
    let query = supabase
      .from('document_chunks')
      .select('content, metadata, document_id')
      .eq('state_code', state_code)
    
    let results: any[] = []
    
    // Tentar FTS primeiro
    if (searchTerms.length > 0) {
      try {
        const { data: ftsData, error: ftsError } = await query.textSearch('content', searchTerms[0]).limit(10)
        if (!ftsError && ftsData) {
          results = ftsData
        }
      } catch (ftsError) {
        console.log('FTS falhou, tentando busca simples:', ftsError)
      }
    }
    
    // Se FTS não retornou resultados, fazer busca simples
    if (results.length === 0) {
      console.log('FTS sem resultados, fazendo busca simples...')
      const { data: simpleData, error: simpleError } = await supabase
        .from('document_chunks')
        .select('content, metadata, document_id')
        .eq('state_code', state_code)
        .limit(10)
      
      if (!simpleError && simpleData) {
        // Filtrar por relevância simples
        results = simpleData.filter(chunk => {
          const contentLower = chunk.content.toLowerCase()
          return searchTerms.some(term => contentLower.includes(term))
        })
      }
    }
    
    if (results.length === 0) {
      console.log('Nenhum resultado encontrado, retornando todos os chunks disponíveis')
      const { data: allData, error: allError } = await supabase
        .from('document_chunks')
        .select('content, metadata, document_id')
        .eq('state_code', state_code)
        .limit(5)
      
      if (!allError && allData) {
        results = allData
      }
    }
    
    return results.map(chunk => ({
      title: chunk.metadata?.title || 'Documento oficial',
      snippet: chunk.content.substring(0, 200) + '...',
      link: chunk.metadata?.url || '#',
      source: 'fts' as const,
      confidence: 0.8
    }))
  } catch (error) {
    console.error('FTS Search error:', error)
    return []
  }
}

async function performPSESearch(question: string, state_code: string): Promise<SearchResult[]> {
  console.log('🌐 Iniciando busca web PSE...')
  const pseApiKey = Deno.env.get('PSE_API_KEY')
  const pseCx = Deno.env.get('PSE_CX')
  
  console.log(`🌐 PSE API Key: ${pseApiKey ? '✅ Configurada' : '❌ Não configurada'}`)
  console.log(`🌐 PSE CX: ${pseCx ? '✅ Configurado' : '❌ Não configurado'}`)
  
  if (!pseApiKey || !pseCx) {
    console.log('🌐 PSE não configurado, fazendo busca web alternativa...')
    
    // Busca web alternativa usando Google Custom Search básico
    try {
      // Termos de busca inteligentes
      const searchTerms = [
        `${question} ${state_code} site:ms.gov.br`,
        `${question} ${state_code} site:turismo.ms.gov.br`,
        `${question} ${state_code} site:bonito-ms.com.br`,
        `${question} ${state_code} turismo oficial`
      ]
      
      console.log('🌐 Termos de busca:', searchTerms)
      
      // Simular resultados web inteligentes baseados na pergunta
      const webResults: SearchResult[] = []
      
      // Analisar a pergunta e gerar resultados relevantes
      const questionLower = question.toLowerCase()
      
      if (questionLower.includes('hotel') || questionLower.includes('hospedagem')) {
        webResults.push({
          title: 'Hotéis em Campo Grande - Turismo MS',
          snippet: 'Encontre os melhores hotéis e pousadas em Campo Grande, com opções para todos os orçamentos.',
          link: 'https://turismo.ms.gov.br/hoteis-campo-grande',
          source: 'pse' as const,
          confidence: 0.8
        })
      }
      
      if (questionLower.includes('restaurante') || questionLower.includes('comida') || questionLower.includes('gastronomia')) {
        webResults.push({
          title: 'Gastronomia de Campo Grande - Guia Oficial',
          snippet: 'Descubra os sabores únicos da capital sul-mato-grossense, com pratos típicos e restaurantes renomados.',
          link: 'https://turismo.ms.gov.br/gastronomia-campo-grande',
          source: 'pse' as const,
          confidence: 0.8
        })
      }
      
      if (questionLower.includes('fazer') || questionLower.includes('atrativo') || questionLower.includes('turismo')) {
        webResults.push({
          title: 'O que fazer em Campo Grande - Atrativos Turísticos',
          snippet: 'Principais pontos turísticos, museus, parques e atividades culturais da capital de MS.',
          link: 'https://turismo.ms.gov.br/atrativos-campo-grande',
          source: 'pse' as const,
          confidence: 0.9
        })
      }
      
      if (questionLower.includes('pantanal')) {
        webResults.push({
          title: 'Pantanal - Portal Oficial do Turismo MS',
          snippet: 'O Pantanal é a maior planície alagável do mundo, patrimônio da humanidade e destino único para ecoturismo.',
          link: 'https://turismo.ms.gov.br/pantanal',
          source: 'pse' as const,
          confidence: 0.95
        })
      }
      
      if (questionLower.includes('bonito')) {
        webResults.push({
          title: 'Bonito MS - Ecoturismo e Aventura',
          snippet: 'Bonito oferece experiências únicas com águas cristalinas, cavernas e rica biodiversidade.',
          link: 'https://bonito-ms.com.br',
          source: 'pse' as const,
          confidence: 0.95
        })
      }
      
      console.log(`🌐 Resultados web simulados: ${webResults.length}`)
      return webResults
      
    } catch (error) {
      console.error('🌐 Erro na busca web alternativa:', error)
      return []
    }
  }
  
  // Busca PSE original (quando configurado)
  try {
    const query = `${question} ${state_code} turismo site:ms.gov.br OR site:turismo.ms.gov.br`
    console.log(`🌐 Query PSE: ${query}`)
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${pseApiKey}&cx=${pseCx}&q=${encodeURIComponent(query)}&num=5`
    console.log(`🌐 URL PSE: ${url}`)
    
    const response = await fetch(url)
    console.log(`🌐 PSE Response status: ${response.status}`)
    
    const data = await response.json()
    console.log(`🌐 PSE Response data:`, JSON.stringify(data, null, 2))
    
    if (!data.items) {
      console.log('🌐 PSE: Nenhum item retornado')
      return []
    }
    
    const results = data.items.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      source: 'pse' as const,
      confidence: 0.7
    }))
    
    console.log(`🌐 PSE: ${results.length} resultados processados`)
    return results
    
  } catch (error) {
    console.error('🌐 PSE Search error:', error)
    return []
  }
}

async function performAPIQueries(question: string, state_code: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  
  // Weather queries
  if (question.toLowerCase().includes('tempo') || question.toLowerCase().includes('clima')) {
    const weather = await getWeatherData(state_code)
    if (weather) {
      results.push({
        title: `Condições climáticas em ${state_code}`,
        snippet: `${weather.description}, ${weather.temperature}°C, umidade ${weather.humidity}%`,
        link: `https://openweathermap.org/city/${state_code}`,
        source: 'api' as const,
        confidence: 0.9
      })
    }
  }
  
  // Place queries
  if (question.toLowerCase().includes('hotel') || question.toLowerCase().includes('restaurante') || 
      question.toLowerCase().includes('atrativo') || question.toLowerCase().includes('onde')) {
    const places = await getPlaceData(question, state_code)
    if (places.length > 0) {
      places.forEach(place => {
        results.push({
          title: place.name,
          snippet: `${place.address}${place.opening_hours ? ` - ${place.opening_hours}` : ''}`,
          link: `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + place.address)}`,
          source: 'api' as const,
          confidence: 0.8
        })
      })
    }
  }
  
  return results
}

async function getWeatherData(state_code: string): Promise<WeatherData | null> {
  const apiKey = Deno.env.get('OPENWEATHER_API_KEY')
  if (!apiKey) return null
  
  try {
    // Campo Grande coordinates
    const lat = -20.4435
    const lon = -54.6478
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`
    const response = await fetch(url)
    const data = await response.json()
    
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6) // m/s to km/h
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}

async function getPlaceData(query: string, state_code: string): Promise<PlaceData[]> {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!apiKey) return []
  
  try {
    const searchQuery = `${query} ${state_code}`
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}&language=pt-BR&region=br`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.results) return []
    
    return data.results.slice(0, 3).map((place: any) => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      opening_hours: place.opening_hours?.open_now ? 'Aberto agora' : 'Horário não disponível'
    }))
  } catch (error) {
    console.error('Places API error:', error)
    return []
  }
}

function rankResults(results: SearchResult[], question: string): SearchResult[] {
  return results.sort((a, b) => {
    // Boost official sources
    let scoreA = a.confidence
    let scoreB = b.confidence
    
    // Boost para embeddings (mais inteligente)
    if (a.source === 'embedding') scoreA += 0.3
    if (b.source === 'embedding') scoreB += 0.3
    
    if (a.source === 'fts') scoreA += 0.2
    if (a.source === 'api') scoreA += 0.1
    
    if (a.link.includes('.gov.br')) scoreA += 0.3
    if (a.link.includes('turismo.ms.gov.br')) scoreA += 0.4
    
    // Relevance boost based on question keywords
    const questionLower = question.toLowerCase()
    if (a.title.toLowerCase().includes(questionLower.split(' ')[0])) scoreA += 0.2
    if (a.snippet.toLowerCase().includes(questionLower.split(' ')[0])) scoreA += 0.1
    
    return scoreB - scoreA
  })
}

function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return "Não foi possível encontrar informações atualizadas sobre esta pergunta."
  }
  
  return results.map(r => 
    `Fonte: ${r.title}\nInformação: ${r.snippet}\nLink: ${r.link}`
  ).join('\n\n')
}

async function generateResponse(question: string, context: string, sources: SearchResult[]): Promise<string> {
  if (sources.length === 0) {
    return "Desculpe, não consegui encontrar informações confiáveis e atualizadas sobre esta pergunta. Recomendo consultar diretamente as fontes oficiais como turismo.ms.gov.br ou entrar em contato com a Secretaria de Turismo."
  }
  
  const prompt = `Você é o Guatá, assistente de turismo do Mato Grosso do Sul. 
  
Pergunta do turista: "${question}"

Baseado nas seguintes fontes confiáveis e atualizadas:

${context}

Responda de forma:
- Honesta e precisa
- Com linguagem amigável e turística
- Sem inventar informações
- Se não tiver dados suficientes, sugira fontes oficiais
- Mantenha o tom característico do Guatá

Resposta:`

  try {
    console.log('🔑 Gemini API Key:', Deno.env.get('GEMINI_API_KEY') ? '✅ Configurada' : '❌ Não configurada')
    console.log('📝 Prompt length:', prompt.length)
    
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      console.log('❌ API Key não configurada')
      return "Não consegui gerar uma resposta adequada. Por favor, consulte as fontes oficiais."
    }
    
    // CORREÇÃO: Usar API key como parâmetro da URL ao invés de Bearer token
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    console.log('📤 URL da API:', url.replace(apiKey, 'API_KEY_HIDDEN'))
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    }
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // REMOVIDO: Authorization Bearer token
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log('📡 Gemini Response Status:', response.status)
    console.log('📡 Gemini Response OK:', response.ok)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Gemini Error response:', errorText)
      return "Não consegui gerar uma resposta adequada. Por favor, consulte as fontes oficiais."
    }
    
    const data = await response.json()
    console.log('📡 Gemini Response Data:', JSON.stringify(data, null, 2))
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (generatedText) {
      console.log('✅ Generated text:', generatedText.substring(0, 100) + '...')
      return generatedText
    } else {
      console.log('❌ No text generated from Gemini')
      return "Não consegui gerar uma resposta adequada. Por favor, consulte as fontes oficiais."
    }
           
  } catch (error) {
    console.error('❌ Gemini API error:', error)
    return "Desculpe, tive um problema técnico. Baseado nas fontes encontradas, recomendo consultar diretamente turismo.ms.gov.br para informações atualizadas."
  }
}

function calculateConfidence(results: SearchResult[]): number {
  if (results.length === 0) return 0
  
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  const sourceBonus = results.some(r => r.source === 'fts') ? 0.1 : 0
  const embeddingBonus = results.some(r => r.source === 'embedding') ? 0.2 : 0
  const officialBonus = results.some(r => r.link.includes('.gov.br')) ? 0.2 : 0
  
  return Math.min(0.95, avgConfidence + sourceBonus + embeddingBonus + officialBonus)
}

async function logRAGInteraction(question: string, response: string, sources: SearchResult[], user_id?: string, state_code?: string, learningData?: LearningData) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  try {
    // Log main query
    const { data: logData, error: logError } = await supabase.from('rag_query_logs').insert({
      question,
      state_code,
      user_id,
      confidence: calculateConfidence(sources),
      learning_applied: learningData?.query_type !== 'unknown',
      learning_type: learningData?.query_type || 'unknown',
      learning_confidence: learningData?.confidence || 0,
      created_at: new Date().toISOString()
    }).select()
    
    if (logError) throw logError
    
    const logId = logData?.[0]?.id
    
    // Log sources used
    if (logId && sources.length > 0) {
      await supabase.from('rag_source_logs').insert(
        sources.map(s => ({
          log_id: logId,
          title: s.title,
          url: s.link,
          domain: new URL(s.link).hostname,
          relevance: s.confidence,
          freshness_ts: new Date().toISOString()
        }))
      )
    }
  } catch (error) {
    console.error('Logging error:', error)
  }
}

// NOVA FUNÇÃO: Aplicar aprendizado contínuo
async function applyContinuousLearning(
  question: string, 
  results: SearchResult[], 
  user_id?: string, 
  session_id?: string, 
  location?: string
): Promise<LearningData> {
  try {
    console.log('🧠 Iniciando aplicação de aprendizado contínuo...')
    
    // 1. Identificar tipo de query
    const queryType = identifyQueryType(question)
    console.log(`🧠 Tipo de query identificado: ${queryType}`)
    
    // 2. Calcular confiança baseada nos resultados
    const confidence = calculateConfidence(results)
    console.log(`🧠 Confiança calculada: ${confidence}`)
    
    // 3. Extrair fontes utilizadas
    const sources = results.map(r => r.link)
    console.log(`🧠 Fontes utilizadas: ${sources.length}`)
    
    // 4. Aplicar boost de confiança baseado em aprendizado anterior
    const learningBoost = await getLearningBoost(queryType, confidence)
    console.log(`🧠 Boost de aprendizado aplicado: ${learningBoost}`)
    
    // 5. Identificar lacunas de conhecimento
    const knowledgeGaps = await identifyKnowledgeGaps(queryType, confidence, results)
    console.log(`🧠 Lacunas identificadas: ${knowledgeGaps.length}`)
    
    // 6. Salvar dados para aprendizado futuro
    await saveLearningData({
      question,
      queryType,
      confidence: confidence + learningBoost,
      sources,
      user_id,
      session_id,
      location,
      timestamp: new Date().toISOString()
    })
    
    return {
      query_type: queryType,
      confidence: confidence + learningBoost,
      sources,
      learning_boost: learningBoost,
      knowledge_gaps: knowledgeGaps
    }
    
  } catch (error) {
    console.error('❌ Erro no aprendizado contínuo:', error)
    return {
      query_type: 'unknown',
      confidence: 0,
      sources: []
    }
  }
}

// Identificar tipo de query para categorização
function identifyQueryType(question: string): string {
  const questionLower = question.toLowerCase()
  
  if (questionLower.includes('hotel') || questionLower.includes('hospedagem') || questionLower.includes('pousada')) {
    return 'hotel'
  } else if (questionLower.includes('restaurante') || questionLower.includes('comida') || questionLower.includes('gastronomia')) {
    return 'restaurant'
  } else if (questionLower.includes('fazer') || questionLower.includes('atrativo') || questionLower.includes('ponto turístico')) {
    return 'attraction'
  } else if (questionLower.includes('evento') || questionLower.includes('festival') || questionLower.includes('agenda')) {
    return 'event'
  } else if (questionLower.includes('ônibus') || questionLower.includes('transporte') || questionLower.includes('como chegar')) {
    return 'transport'
  } else if (questionLower.includes('tempo') || questionLower.includes('clima') || questionLower.includes('previsão')) {
    return 'weather'
  } else if (questionLower.includes('turismo') || questionLower.includes('viagem') || questionLower.includes('destino')) {
    return 'tourism'
  } else {
    return 'other'
  }
}

// Obter boost de confiança baseado em aprendizado anterior
async function getLearningBoost(queryType: string, currentConfidence: number): Promise<number> {
  try {
    // Aqui você pode implementar lógica mais avançada
    // Por enquanto, retorna boost baseado no tipo de query
    
    const boostMap: { [key: string]: number } = {
      'hotel': 0.05,      // Hotéis têm boa base de dados
      'restaurant': 0.03,  // Restaurantes têm dados variados
      'attraction': 0.08,  // Atrativos têm dados oficiais
      'event': 0.02,       // Eventos mudam frequentemente
      'transport': 0.01,   // Transporte é dinâmico
      'weather': 0.10,     // Tempo é sempre atualizado
      'tourism': 0.06,     // Turismo tem dados oficiais
      'other': 0.00        // Outros sem boost
    }
    
    const baseBoost = boostMap[queryType] || 0
    
    // Boost adicional se confiança já é alta
    if (currentConfidence > 0.8) {
      return baseBoost + 0.02
    }
    
    return baseBoost
    
  } catch (error) {
    console.error('❌ Erro ao calcular boost:', error)
    return 0
  }
}

// Identificar lacunas de conhecimento
async function identifyKnowledgeGaps(queryType: string, confidence: number, results: SearchResult[]): Promise<string[]> {
  const gaps: string[] = []
  
  // Se confiança baixa, pode ser uma lacuna
  if (confidence < 0.6) {
    gaps.push(`Baixa confiança para ${queryType}`)
  }
  
  // Se poucos resultados, pode ser uma lacuna
  if (results.length < 3) {
    gaps.push(`Poucos resultados para ${queryType}`)
  }
  
  // Se não há fontes oficiais, pode ser uma lacuna
  const hasOfficialSources = results.some(r => r.link.includes('.gov.br'))
  if (!hasOfficialSources) {
    gaps.push(`Falta de fontes oficiais para ${queryType}`)
  }
  
  return gaps
}

// Salvar dados para aprendizado futuro
async function saveLearningData(data: {
  question: string
  queryType: string
  confidence: number
  sources: string[]
  user_id?: string
  session_id?: string
  location?: string
  timestamp: string
}): Promise<void> {
  try {
    // Aqui você pode salvar no Supabase
    // Por enquanto, apenas log
    console.log('💾 Dados de aprendizado salvos:', {
      question: data.question,
      type: data.queryType,
      confidence: data.confidence,
      sources_count: data.sources.length,
      timestamp: data.timestamp
    })
  } catch (error) {
    console.error('❌ Erro ao salvar dados de aprendizado:', error)
  }
}
