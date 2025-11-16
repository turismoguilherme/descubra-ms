import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações de crawling
const CRAWLING_CONFIG = {
  MAX_PAGES_PER_SOURCE: 50,
  MAX_DEPTH: 3,
  RATE_LIMIT_MS: 2000,
  FRESHNESS_THRESHOLD_DAYS: 30,
  PRIORITY_SOURCES: [
    'https://turismo.ms.gov.br',
    'https://www.ms.gov.br',
    'https://secult.ms.gov.br',
    'https://www.bonito-ms.com.br'
  ]
}

// Estratégias de crawling por tipo de fonte
const CRAWLING_STRATEGIES = {
  government: {
    priority: 'high',
    maxDepth: 4,
    updateFrequency: 'daily',
    sections: ['turismo', 'cultura', 'eventos', 'transporte', 'noticias']
  },
  tourism_official: {
    priority: 'high',
    maxDepth: 5,
    updateFrequency: 'daily',
    sections: ['destinos', 'atrativos', 'hoteis', 'restaurantes', 'eventos', 'roteiros']
  },
  destination: {
    priority: 'medium',
    maxDepth: 3,
    updateFrequency: 'weekly',
    sections: ['atrativos', 'hoteis', 'restaurantes', 'passeios', 'precos', 'horarios']
  },
  city_official: {
    priority: 'medium',
    maxDepth: 3,
    updateFrequency: 'weekly',
    sections: ['turismo', 'cultura', 'eventos', 'gastronomia', 'hospedagem']
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      state_code = 'MS', 
      depth = 2, 
      budget_pages = 200,
      force_update = false,
      source_filter = null
    } = await req.json()

    console.log(`🚀 Iniciando crawling inteligente para ${state_code}`)
    console.log(`📊 Configurações: depth=${depth}, budget=${budget_pages}, force=${force_update}`)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verificar necessidade de atualização
    if (!force_update) {
      const needsUpdate = await checkUpdateNecessity(supabase, state_code)
      if (!needsUpdate) {
        console.log('✅ Base de conhecimento está atualizada, não é necessário crawling')
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Base atualizada, crawling não necessário',
            last_update: new Date().toISOString()
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 2. Obter fontes para crawling
    const sources = await getSourcesForCrawling(supabase, state_code, source_filter)
    console.log(`📚 ${sources.length} fontes selecionadas para crawling`)

    // 3. Executar crawling inteligente
    const crawlingResults = await executeIntelligentCrawling(sources, depth, budget_pages)
    
    // 4. Processar e salvar resultados
    const processingResults = await processCrawlingResults(supabase, crawlingResults, state_code)
    
    // 5. Atualizar metadados de crawling
    await updateCrawlingMetadata(supabase, state_code, processingResults)
    
    // 6. Limpar dados antigos
    const cleanupResults = await cleanupOldData(supabase, state_code)
    
    console.log(`🎉 Crawling concluído: ${processingResults.processed} fontes, ${processingResults.chunks} chunks`)
    
    return new Response(
      JSON.stringify({
        success: true,
        crawling_results: crawlingResults,
        processing_results: processingResults,
        cleanup_results: cleanupResults,
        state_code,
        timestamp: new Date().toISOString()
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro no crawling:', error)
    return new Response(
      JSON.stringify({ error: 'Erro no crawling', details: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Verificar se é necessário atualizar a base
async function checkUpdateNecessity(supabase: any, state_code: string): Promise<boolean> {
  try {
    // Verificar última atualização
    const { data: lastUpdate } = await supabase
      .from('documents')
      .select('last_fetched_at')
      .eq('state_code', state_code)
      .order('last_fetched_at', { ascending: false })
      .limit(1)
      .single()

    if (!lastUpdate) return true

    const lastUpdateDate = new Date(lastUpdate.last_fetched_at)
    const daysSinceUpdate = (Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)

    // Atualizar se passou mais de 1 dia
    return daysSinceUpdate > 1
  } catch (error) {
    console.error('Erro ao verificar necessidade de atualização:', error)
    return true // Em caso de erro, fazer crawling
  }
}

// Obter fontes para crawling
async function getSourcesForCrawling(supabase: any, state_code: string, source_filter?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('documents')
      .select('url, category, priority, metadata')
      .eq('state_code', state_code)
      .order('priority', { ascending: false })

    if (source_filter) {
      query = query.eq('category', source_filter)
    }

    const { data: sources, error } = await query

    if (error) throw error

    // Filtrar fontes que precisam de atualização
    const now = new Date()
    return sources.filter(source => {
      const lastFetched = new Date(source.metadata?.last_fetched || 0)
      const daysSinceFetch = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60 * 24)
      
      const strategy = CRAWLING_STRATEGIES[source.category as keyof typeof CRAWLING_STRATEGIES]
      if (!strategy) return false
      
      const updateFrequency = strategy.updateFrequency === 'daily' ? 1 : 7
      return daysSinceFetch > updateFrequency
    })

  } catch (error) {
    console.error('Erro ao obter fontes para crawling:', error)
    return []
  }
}

// Executar crawling inteligente
async function executeIntelligentCrawling(sources: any[], depth: number, budget_pages: number): Promise<any[]> {
  const results: any[] = []
  let pagesProcessed = 0

  console.log(`🕷️ Iniciando crawling de ${sources.length} fontes...`)

  for (const source of sources) {
    if (pagesProcessed >= budget_pages) {
      console.log(`⚠️ Budget de páginas atingido (${budget_pages})`)
      break
    }

    try {
      console.log(`📥 Crawling: ${source.url} (${source.category})`)
      
      const strategy = CRAWLING_STRATEGIES[source.category as keyof typeof CRAWLING_STRATEGIES]
      if (!strategy) continue

      // Crawling da página principal
      const mainPage = await crawlPage(source.url, 0, strategy)
      if (mainPage) {
        results.push(mainPage)
        pagesProcessed++
      }

      // Crawling das seções específicas
      for (const section of strategy.sections) {
        if (pagesProcessed >= budget_pages) break
        
        try {
          const sectionUrl = `${source.url}/${section}`
          const sectionPage = await crawlPage(sectionUrl, 1, strategy)
          
          if (sectionPage) {
            results.push(sectionPage)
            pagesProcessed++
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, CRAWLING_CONFIG.RATE_LIMIT_MS))
          
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`⚠️ Erro ao crawlear seção ${section}:`, errorMessage)
        }
      }

      // Rate limiting entre fontes
      await new Promise(resolve => setTimeout(resolve, CRAWLING_CONFIG.RATE_LIMIT_MS * 2))

    } catch (error) {
      console.error(`❌ Erro ao crawlear ${source.url}:`, error)
    }
  }

  console.log(`✅ Crawling concluído: ${pagesProcessed} páginas processadas`)
  return results
}

// Crawlear uma página específica
async function crawlPage(url: string, currentDepth: number, strategy: any): Promise<any | null> {
  try {
    if (currentDepth > strategy.maxDepth) return null

    console.log(`🕷️ Crawling página: ${url} (depth: ${currentDepth})`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GuataBot/1.0; +https://descubra-ms.com)'
      }
    })

    if (!response.ok) return null

    const html = await response.text()
    
    // Extrair informações da página
    const pageInfo = {
      url,
      title: extractTitle(html),
      content: cleanContent(html),
      metadata: {
        depth: currentDepth,
        category: strategy.priority,
        last_crawled: new Date().toISOString(),
        content_length: html.length
      }
    }

    return pageInfo

  } catch (error) {
    console.error(`❌ Erro ao crawlear ${url}:`, error)
    return null
  }
}

// Processar resultados do crawling
async function processCrawlingResults(supabase: any, results: any[], state_code: string): Promise<any> {
  let processed = 0
  let chunks = 0
  let errors = 0

  console.log(`🔄 Processando ${results.length} páginas crawleadas...`)

  for (const page of results) {
    try {
      if (!page.content || page.content.length < 100) continue

      // Upsert documento
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .upsert({
          url: page.url,
          title: page.title || page.url,
          content: page.content,
          metadata: page.metadata,
          state_code: state_code,
          last_fetched_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (docError) {
        errors++
        continue
      }

      // Criar chunks
      const pageChunks = chunkContent(page.content, 800, 150)
      const chunkRecords = pageChunks.map((chunk, index) => ({
        document_id: doc.id,
        chunk_index: index,
        content: chunk,
        metadata: {
          ...page.metadata,
          chunk_length: chunk.length,
          chunk_index: index
        },
        state_code: state_code,
        embedding: null // Placeholder para embeddings futuros
      }))

      const { error: chunkError } = await supabase
        .from('document_chunks')
        .upsert(chunkRecords)

      if (chunkError) {
        errors++
      } else {
        processed++
        chunks += pageChunks.length
      }

    } catch (error) {
      console.error(`❌ Erro ao processar página ${page.url}:`, error)
      errors++
    }
  }

  return { processed, chunks, errors }
}

// Atualizar metadados de crawling
async function updateCrawlingMetadata(supabase: any, state_code: string, results: any): Promise<void> {
  try {
    // Log de crawling
    await supabase.from('rag_query_logs').insert({
      question: `Crawling automático - ${state_code}`,
      state_code,
      strategy: 'automated_crawling',
      top_k: results.chunks,
      confidence: 0.9,
      processing_time_ms: 0,
      user_id: 'system',
      session_id: `crawling-${Date.now()}`
    })

    console.log('📊 Metadados de crawling atualizados')
  } catch (error) {
    console.error('❌ Erro ao atualizar metadados:', error)
  }
}

// Limpar dados antigos
async function cleanupOldData(supabase: any, state_code: string): Promise<any> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - CRAWLING_CONFIG.FRESHNESS_THRESHOLD_DAYS)

    // Remover documentos antigos
    const { data: oldDocs, error: docsError } = await supabase
      .from('documents')
      .delete()
      .eq('state_code', state_code)
      .lt('last_fetched_at', cutoffDate.toISOString())
      .select('id')

    if (docsError) throw docsError

    console.log(`🧹 ${oldDocs?.length || 0} documentos antigos removidos`)
    
    return {
      old_documents_removed: oldDocs?.length || 0,
      cutoff_date: cutoffDate.toISOString()
    }

  } catch (error) {
    console.error('❌ Erro ao limpar dados antigos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { old_documents_removed: 0, error: errorMessage }
  }
}

// Funções auxiliares
function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return titleMatch[1].trim()
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match) return h1Match[1].trim()
  
  return null
}

function cleanContent(html: string): string {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<[^>]+>/g, ' ')
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/\s+/g, ' ')
  return text.trim()
}

function chunkContent(content: string, chunkSize: number = 800, overlap: number = 150): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < content.length) {
    let end = start + chunkSize
    
    if (end < content.length) {
      const lastSpace = content.lastIndexOf(' ', end)
      if (lastSpace > start + chunkSize * 0.8) {
        end = lastSpace
      }
    }
    
    chunks.push(content.substring(start, end))
    start = end - overlap
    
    if (start >= content.length - 100) break
  }
  
  return chunks
}
