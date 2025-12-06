import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from "../_shared/cors.ts"

// Limites (plano gratuito) - mais restritivos para segurança
const RATE_LIMIT_PER_MIN = parseInt(Deno.env.get('RATE_LIMIT_PER_MIN') ?? '5') // Reduzido de 8 para 5
const DAILY_BUDGET_CALLS = parseInt(Deno.env.get('DAILY_BUDGET_CALLS') ?? '100') // Reduzido de 200 para 100
const MAX_QUESTION_LENGTH = 5000 // Limite de caracteres para perguntas

// Memória local (edge) – suficiente para conter picos
const minuteWindow: Map<string, { count: number; ts: number }> = new Map()
const dailyWindow: Map<string, { count: number; day: string }> = new Map()

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input: string, maxLength: number = MAX_QUESTION_LENGTH): string {
  if (typeof input !== 'string') return '';
  
  let sanitized = input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
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
    'https://descubra-ms.vercel.app'
  ];
  
  // Check exact match or Vercel subdomain
  return allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
}

function checkRateLimit(key: string): { ok: boolean; reason?: string } {
  const now = Date.now()
  const minuteKey = key
  const currentMinute = Math.floor(now / 60000)

  const m = minuteWindow.get(minuteKey)
  if (!m || m.ts !== currentMinute) {
    minuteWindow.set(minuteKey, { count: 1, ts: currentMinute })
  } else {
    m.count += 1
    if (m.count > RATE_LIMIT_PER_MIN) return { ok: false, reason: 'RATE_MIN' }
  }

  const dayStr = new Date().toISOString().slice(0, 10)
  const d = dailyWindow.get(key)
  if (!d || d.day !== dayStr) {
    dailyWindow.set(key, { count: 1, day: dayStr })
  } else {
    d.count += 1
    if (d.count > DAILY_BUDGET_CALLS) return { ok: false, reason: 'RATE_DAY' }
  }

  return { ok: true }
}

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

// Cache simples em memória para Edge Function
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutos
const EVENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos (eventos)

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Validate origin for security
  if (req.method !== 'OPTIONS' && !validateOrigin(origin)) {
    console.warn('⚠️ guata-web-rag: Invalid origin:', origin);
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as RAGQuery
    const ip = req.headers.get('x-forwarded-for') || 'ip-unknown'
    const userKey = body.user_id || body.session_id || ip
    
    // Rate limiting
    const rl = checkRateLimit(userKey)
    if (!rl.ok) {
      const msg = rl.reason === 'RATE_MIN'
        ? 'Muitas requisições em um minuto. Aguarde alguns segundos.'
        : 'Limite diário atingido. Tente novamente amanhã.'
      return new Response(JSON.stringify({ error: msg }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Sanitize inputs
    const rawQuestion = body.question || '';
    const question = sanitizeInput(rawQuestion, MAX_QUESTION_LENGTH);
    
    if (question.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Question cannot be empty after sanitization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate state_code (only allow valid state codes)
    const validStateCodes = ['MS', 'MT', 'SP', 'RJ', 'PR', 'SC', 'RS', 'MG', 'BA', 'GO', 'DF'];
    const state_code = validStateCodes.includes(body.state_code || 'MS') ? (body.state_code || 'MS') : 'MS';
    
    // Sanitize other inputs
    const user_id = body.user_id ? sanitizeInput(body.user_id, 100) : undefined;
    const session_id = body.session_id ? sanitizeInput(body.session_id, 100) : undefined;
    const location = body.location ? sanitizeInput(body.location, 200) : undefined;
    
    console.log(`🔍 RAG Query iniciada: "${question}" for state: ${state_code}`)
    console.log(`👤 User ID: ${user_id}`)
    console.log(`🆔 Session ID: ${session_id}`)
    console.log(`📍 Location: ${location}`)
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
    
    // 0. Verificar cache primeiro
    const cacheKey = `${question.toLowerCase().trim()}:${state_code}:${user_id || 'anonymous'}`
    const cachedResponse = responseCache.get(cacheKey)
    
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < cachedResponse.ttl) {
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
    const topResults = rankedResults.slice(0, 8)
const context = buildContext(topResults)
    console.log(`📝 Contexto length: ${context.length} caracteres`)
    
// 6.1 Se a pergunta for de eventos, tentar parser rápido por regex
let quickAgenda: string | null = null
if (/evento|agenda|programa[çc][aã]o|show|shows/i.test(question)) {
  // janela dinâmica: padrão 30 dias
  const windowDays = /hoje|amanh[ãa]|fim de semana/i.test(question) ? 3 : 30
  quickAgenda = tryParseEvents(topResults, windowDays)
}
    
// 7. Generate response with Gemini (ou usar agenda rápida quando fizer sentido)
    console.log('\n🤖 === GERANDO RESPOSTA COM GEMINI ===')
const response = quickAgenda ? `${quickAgenda}\n\nQuer que eu detalhe horários ou como chegar?` : await generateResponse(question, context, topResults)
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
        snippet: r.snippet,
        link: r.link,
        source: r.source
      })),
      confidence: calculateConfidence(rankedResults),
      total_sources: allResults.length,
      learning_applied: learningData.query_type !== 'unknown',
      processing_time_ms: Date.now() - Date.now() // Simulado
    }
    
    const ttl = learningData.query_type === 'event' ? EVENT_CACHE_TTL : DEFAULT_CACHE_TTL
    
    // Cache da resposta
    responseCache.set(cacheKey, {
      data: finalResponse,
      timestamp: Date.now(),
      ttl
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
    // Busca FTS com boost para MS/CG (sem filtro rígido)
    const searchTerms = question.toLowerCase().split(/\s+/).filter(term => term.length > 2).slice(0, 3)
    let baseQuery = supabase
      .from('document_chunks')
      .select('content, metadata, document_id, state_code')
    
    let results: any[] = []
    
    if (searchTerms.length > 0) {
      try {
        const { data: ftsData, error: ftsError } = await baseQuery.textSearch('content', searchTerms[0]).limit(20)
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
        .select('content, metadata, document_id, state_code')
        .limit(20)
      
      if (!simpleError && simpleData) {
        // Filtrar por relevância simples
        results = simpleData.filter(chunk => {
          const contentLower = chunk.content.toLowerCase()
          return searchTerms.some(term => contentLower.includes(term))
        })
      }
    }
    
    if (results.length === 0) {
      console.log('Nenhum resultado encontrado, retornando alguns chunks disponíveis (sem filtro rígido)')
      const { data: allData, error: allError } = await supabase
        .from('document_chunks')
        .select('content, metadata, document_id, state_code')
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
      confidence: 0.8 + (chunk.state_code === state_code ? 0.1 : 0) // boost para MS/CG
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
  
  if (!pseApiKey) console.warn('⚠️ PSE_API_KEY não configurada em guata-web-rag.');
  if (!pseCx) console.warn('⚠️ PSE_CX não configurada em guata-web-rag.');
  
  if (!pseApiKey || !pseCx) {
    console.log('🌐 PSE não configurado. Para garantir veracidade, não serão simulados resultados. Retornando vazio.')
      return []
  }
  
  // Multi-query expansion com datas e fontes prioritárias
  try {
    const now = new Date()
    const dd = String(now.getDate()).padStart(2, '0')
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const yyyy = now.getFullYear()
    const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
    const mesExtenso = meses[now.getMonth()]

    const variants = buildQueryVariants(question)

const queries = [
  // prioritárias por fonte
  `${variants[0]} site:campogrande.ms.gov.br OR site:turismo.ms.gov.br OR site:ms.gov.br`,
  `${variants[0]} site:sympla.com.br OR site:eventbrite.com.br`,
  `${variants[0]} site:campograndenews.com.br OR site:correiodoestado.com.br OR site:midiamax.com.br`,
  // variantes abertas
  ...variants.slice(0, 3)
]

const limitedQueries = queries.slice(0, 6)

    const fetchQuery = async (q: string) => {
      try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${pseApiKey}&cx=${pseCx}&q=${encodeURIComponent(q)}&num=5`;
        const response = await fetch(url)
        if (!response.ok) return [] as SearchResult[]
        const data = await response.json()
        const results = (data.items || []).map((item: any) => ({
              title: item.title,
              snippet: item.snippet,
              link: item.link,
              source: 'pse' as const,
          confidence: 0.6
        })) as SearchResult[]
        return results
      } catch (e) {
        console.log('🌐 Erro em query PSE:', e)
        return [] as SearchResult[]
      }
    }

    const resultsArrays = await Promise.all(limitedQueries.map(fetchQuery))
    const flat = resultsArrays.flat()
    console.log(`🌐 PSE multi-query total: ${flat.length}`)
    return flat
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

async function getNearbyHotelsAtCGR(): Promise<PlaceData[]> {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
  if (!apiKey) return []
  // Coordenadas aproximadas do Aeroporto Internacional de Campo Grande (CGR)
  const lat = -20.4689
  const lon = -54.6726
  const radius = 3000 // 3 km
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=lodging&key=${apiKey}&language=pt-BR`
    console.log('🔍 Places Nearby (CGR):', url.replace(apiKey, 'API_KEY_HIDDEN'))
    const response = await fetch(url)
    const data = await response.json()
    let results = Array.isArray(data.results) ? data.results : []

    // Fallback: se Nearby não retornar, tentar Text Search focado
    if (!results || results.length === 0) {
      const q = 'hoteis perto do Aeroporto Internacional de Campo Grande'
      const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&type=lodging&key=${apiKey}&language=pt-BR&region=br`
      console.log('🔎 Places TextSearch fallback (CGR):', textUrl.replace(apiKey, 'API_KEY_HIDDEN'))
      const tr = await fetch(textUrl)
      const tj = await tr.json()
      results = Array.isArray(tj.results) ? tj.results : []
    }

    if (!results || results.length === 0) return []

    return results.slice(0, 5).map((p: any) => ({
      name: p.name,
      address: p.vicinity || p.formatted_address || '',
      rating: p.rating,
      opening_hours: p.opening_hours?.open_now ? 'Aberto agora' : 'Horário não disponível'
    }))
  } catch (e) {
    console.error('❌ Places Nearby CGR error:', e)
    return []
  }
}

function rankResults(results: SearchResult[], question: string): SearchResult[] {
  // Boost/penalidades com base em feedback histórico (placeholder)
  const domainScore: Record<string, number> = {}

  const weightDomain = (url: string): number => {
    try {
      const host = new URL(url).hostname
      if (host.endsWith('.ms.gov.br') || host.includes('campogrande.ms.gov.br') || host.includes('turismo.ms.gov.br')) return 0.6 // Prefeitura/SECTUR
      if (host.includes('sympla.com.br') || host.includes('eventbrite.com.br')) return 0.4 // Sympla/Eventbrite
      if (host.includes('campograndenews.com.br') || host.includes('midiamax.com.br') || host.includes('correiodoestado.com.br')) return 0.25 // jornais locais
      return 0.1 // blogs/portais
    } catch { return 0 }
  }

  return results
    // deduplicar por link
    .filter((r, i, arr) => arr.findIndex(x => x.link === r.link) === i)
    .sort((a, b) => {
    let scoreA = a.confidence
    let scoreB = b.confidence
    
      // prioridade por domínio
      scoreA += weightDomain(a.link)
      scoreB += weightDomain(b.link)

      // fonte local/fts/api
      if (a.source === 'embedding') scoreA += 0.2
      if (b.source === 'embedding') scoreB += 0.2
      if (a.source === 'fts') scoreA += 0.15
    if (a.source === 'api') scoreA += 0.1
    
      // feedback histórico
      try {
        const domainA = new URL(a.link).hostname; const domainB = new URL(b.link).hostname
        scoreA += domainScore[domainA] || 0
        scoreB += domainScore[domainB] || 0
      } catch {}

      // leve match com a pergunta
      const first = question.toLowerCase().split(' ')[0]
      if (a.title.toLowerCase().includes(first)) scoreA += 0.1
      if (a.snippet.toLowerCase().includes(first)) scoreA += 0.05
    
    return scoreB - scoreA
  })
}

function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return "NO_CONTEXT" // força política no-source na geração
  }
  
  return results.map(r => 
    `Fonte: ${r.title}\nInformação: ${r.snippet}\nLink: ${r.link}`
  ).join('\n\n')
}

async function generateResponse(question: string, context: string, sources: SearchResult[]): Promise<string> {
  // Política MUITO mais permissiva: usar qualquer fonte disponível
  const hasOfficial = sources.some(s => s.link.includes('.ms.gov.br') || s.link.includes('turismo.ms.gov.br') || s.link.includes('campogrande.ms.gov.br'))
  const distinctDomains = new Set(sources.map(s => { try { return new URL(s.link).hostname } catch { return s.link } }))
  const hasConsensus = distinctDomains.size >= 2
  const hasAnySource = sources.length > 0
  const hasWebContent = context && context.length > 50 // Se há conteúdo web significativo

  // Se não há fontes, usar fallback mais inteligente
  if (!hasAnySource && !hasWebContent) {
    return "Não encontrei informações específicas sobre isso agora, mas posso te ajudar com outras informações sobre Mato Grosso do Sul! Que tal falarmos sobre destinos como Bonito, Pantanal ou Campo Grande? O que te interessa mais?"
  }
  
  const prompt = `Você é o Guatá, uma capivara guia de turismo de Mato Grosso do Sul. 

PERSONALIDADE HUMANA:
- Fale como um humano real, não como um chatbot
- Seja conversacional, caloroso e acolhedor
- Use emojis ocasionalmente (🦦 🌊 🏙️ 🎉)
- Faça perguntas de acompanhamento naturais
- Demonstre conhecimento local e paixão por MS
- Seja específico e detalhado quando possível

INSTRUÇÕES:
- Baseie-se no CONTEXTO abaixo para informações atualizadas
- Se não souber algo específico, seja honesto mas útil
- Faça perguntas de acompanhamento relevantes
- Use conhecimento local quando apropriado
- Mantenha o tom conversacional e amigável
- NÃO se apresente como chatbot
- NÃO mostre fontes ou links

CONHECIMENTO LOCAL MS:
- Bonito: Capital do Ecoturismo, águas cristalinas, Rio Sucuri, Gruta do Lago Azul
- Pantanal: Maior área úmida do planeta, biodiversidade, jacarés, onças-pintadas
- Campo Grande: Cidade Morena, Feira Central, Parque das Nações Indígenas
- Corumbá: Capital do Pantanal, Forte Coimbra, Porto Geral
- Gastronomia: Sopa paraguaia, sobá, tereré, chipa

Pergunta do usuário: "${question}"

CONTEXTO ATUALIZADO DA WEB:
${context}

Responda como o Guatá de forma natural e humana:`

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
        temperature: 0.25,
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

function tryParseEvents(results: SearchResult[], windowDays: number = 30): string | null {
  // Extrai possíveis "Titulo – data – local" de snippets
  const events: { title: string; date?: string; place?: string }[] = []
  const dateRx = /\b(\d{1,2}\s+de\s+[a-zç]+|\d{1,2}\/\d{1,2}\/\d{2,4}|hoje|amanhã|fim de semana|próximo fim de semana)\b/i
  const sepRx = /\s[-–—]\s/

  for (const r of results) {
    const text = `${r.title} — ${r.snippet}`
    const parts = text.split(sepRx)
    if (parts.length >= 2) {
      const title = parts[0].trim()
      const right = parts.slice(1).join(' - ')
      const dateMatch = right.match(dateRx)?.[0]
      const placeMatch = right.replace(dateRx, '').split(/\s-\s|\s\|\s|\.\s/).map(s => s.trim()).find(s => s.length > 3)
      events.push({ title, date: dateMatch || undefined, place: placeMatch || undefined })
    }
  }

  const unique = events.filter((e, i, arr) => arr.findIndex(x => x.title.toLowerCase() === e.title.toLowerCase()) === i)
  if (unique.length === 0) return null

  // Filtrar por janela de frescor (default 30 dias)
  const now = new Date()
  const toDate = (raw?: string): Date | null => {
    if (!raw) return null
    const lower = raw.toLowerCase()
    if (lower.includes('hoje')) return now
    if (lower.includes('amanhã')) { const d = new Date(now); d.setDate(d.getDate()+1); return d }
    if (lower.includes('fim de semana')) {
      const d = new Date(now); const day = d.getDay(); const diff = (6 - day + 7) % 7; d.setDate(d.getDate()+diff); return d
    }
    if (lower.includes('próximo fim de semana')) { const d = new Date(now); const day = d.getDay(); const diff = (6 - day + 7) % 7 + 7; d.setDate(d.getDate()+diff); return d }
    // formatos dd/mm/yyyy ou dd/mm/yy
    const m1 = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
    if (m1) { const [_, dd, mm, yyyy] = m1; const year = parseInt(yyyy.length===2?('20'+yyyy):yyyy); return new Date(year, parseInt(mm)-1, parseInt(dd)) }
    // formato "d de mês"
    const m2 = raw.match(/(\d{1,2})\s+de\s+([a-zç]+)/i)
    if (m2) { const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']; const idx = meses.indexOf(m2[2].toLowerCase()); if (idx>=0){ return new Date(now.getFullYear(), idx, parseInt(m2[1])) }}
    return null
  }

  const fresh = unique.filter(e => { const d = toDate(e.date); if (!d) return false; const diff = (d.getTime()-now.getTime())/(1000*60*60*24); return diff>=0 && diff<=windowDays })
  if (fresh.length === 0) return null

  const lines = fresh.slice(0, 5).map(e => `• ${e.title}${e.date ? ` – ${e.date}` : ''}${e.place ? ` – ${e.place}` : ''}`)
  return `Agenda sugerida (próximos ${windowDays} dias):\n${lines.join('\n')}`
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
      sources
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

function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildQueryVariants(question: string): string[] {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const meses = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const mesExtenso = meses[now.getMonth()]

  const base = question.trim()
  const baseNorm = normalizeText(base)

  const synonyms: Record<string, string[]> = {
    'bioparque pantanal': ['aquario do pantanal', 'aquario pantanal', 'bioparque de campo grande'],
    'morada dos bais': ['morada dos bais campo grande', 'morada dos bais ms'],
    'parque das nacoes indigenas': ['museu das culturas dom bosco', 'museu dom bosco', 'mcdb campo grande', 'parque das nações indígenas campo grande', 'parque das nacoes indigenas campo grande'],
    'mis ms': ['museu da imagem e do som de mato grosso do sul', 'museu da imagem e do som ms', 'mis campo grande', 'museu imagem som campo grande']
  }

  const extra: string[] = []
  for (const key of Object.keys(synonyms)) {
    if (baseNorm.includes(key)) extra.push(...synonyms[key])
  }

  const variants: string[] = [
    base,
    `${base} Campo Grande Mato Grosso do Sul`,
    `${base} Campo Grande ${dd}/${mm}/${yyyy}`,
    `${base} Campo Grande ${mesExtenso} ${yyyy}`,
    // globais sem restrição
    `${base}`,
    // utilitárias
    `${base} endereço`,
    `${base} localização`,
    `${base} como chegar`,
    `${base} horário`,
    // sinônimos
    ...extra.map(s => `${s} Campo Grande MS`)
  ]

  // dedup
  return variants.filter((q, i, arr) => arr.findIndex(x => normalizeText(x) === normalizeText(q)) === i)
}
