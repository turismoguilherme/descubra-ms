import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Verificar documentos
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('state_code', 'MS')
    
    if (docsError) {
      console.error('Erro ao buscar documentos:', docsError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar documentos', details: docsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Verificar chunks
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('*')
      .eq('state_code', 'MS')
    
    if (chunksError) {
      console.error('Erro ao buscar chunks:', chunksError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar chunks', details: chunksError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Testar busca FTS
    const { data: ftsResults, error: ftsError } = await supabase
      .from('document_chunks')
      .select('content, metadata')
      .eq('state_code', 'MS')
      .textSearch('content', 'Campo')
      .limit(5)
    
    if (ftsError) {
      console.error('Erro na busca FTS:', ftsError)
      return new Response(
        JSON.stringify({ error: 'Erro na busca FTS', details: ftsError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        documents_count: docs?.length || 0,
        chunks_count: chunks?.length || 0,
        fts_results_count: ftsResults?.length || 0,
        documents: docs?.slice(0, 3), // Primeiros 3 docs
        chunks: chunks?.slice(0, 3), // Primeiros 3 chunks
        fts_results: ftsResults?.slice(0, 3) // Primeiros 3 resultados FTS
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('Erro geral:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Erro geral', message: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
