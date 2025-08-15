import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Conteúdo rico sobre MS
const RICH_CONTENT = [
  {
    title: 'Turismo MS - Destinos Principais',
    category: 'tourism_official',
    content: `Mato Grosso do Sul é um dos destinos turísticos mais incríveis do Brasil. BONITO - Capital do Ecoturismo: Gruta do Lago Azul, Rio Sucuri, Buraco das Araras, Estância Mimosa, Aquário Natural. PANTANAL - Maior Planície Alagada do Mundo: Observação de fauna, passeios de barco, safáris fotográficos. CAMPO GRANDE - Capital Cultural: Memorial da Cultura Indígena, Museu de Arte Contemporânea, Parque das Nações Indígenas. CORUMBÁ - Portal do Pantanal: Forte Coimbra, Porto Geral, Museu de História do Pantanal. DOURADOS - Cidade Universitária: Parque Antenor Martins, Museu Histórico, Feira do Produtor. ATIVIDADES: Mergulho, observação de fauna, trilhas, passeios de barco, gastronomia regional. MELHOR ÉPOCA: Abril a Outubro (seca) para águas cristalinas, Novembro a Março (chuvosa) para paisagens exuberantes.`
  },
  {
    title: 'Hotéis e Hospedagem MS',
    category: 'accommodation',
    content: `Ofertas de hospedagem em Mato Grosso do Sul. BONITO: Hotel Zagaia (4 estrelas), Pousada Olho d'Água, Hotel Águas de Bonito, Pousada Muito Bonito. CAMPO GRANDE: Hotel Deville Prime (5 estrelas), Hotel Jandaia (4 estrelas), Hotel Nacional (3 estrelas). PANTANAL: Pousada Aguapé, Fazenda San Francisco, Pousada Araraúna. CORUMBÁ: Hotel Santa Teresa, Pousada Pantanal. PREÇOS: Pousadas econômicas R$ 80-150, Hotéis 3 estrelas R$ 150-300, Hotéis 4-5 estrelas R$ 300-800, Resorts de luxo R$ 800-2000. RESERVAS: Booking.com, Hotels.com, sites oficiais, agências locais.`
  },
  {
    title: 'Restaurantes e Gastronomia MS',
    category: 'gastronomy',
    content: `Gastronomia rica em sabores regionais. PRATOS TÍPICOS: Arroz de Carreteiro, Pacu Assado, Sopa Paraguaia, Chipa, Tereré, Carne de Jacaré, Peixe Pintado. BONITO: Casa do João, Restaurante Pantanal, Churrascaria Gaúcha, Pizzaria Forno de Minas. CAMPO GRANDE: Feira Central, Churrascaria Fogo de Chão, Restaurante Casa do Peixe. PANTANAL: Pousadas com refeições, churrascos tradicionais, peixes frescos. FEIRAS: Feira Central de Campo Grande, Feira do Produtor de Dourados. BEBIDAS: Tereré, Chimarrão, sucos regionais. PREÇOS: Refeições simples R$ 15-30, restaurantes médios R$ 30-60, restaurantes finos R$ 60-120.`
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { state_code = 'MS' } = await req.json()
    console.log(`🚀 Iniciando ingestão de CONTEÚDO RICO para ${state_code}`)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let totalProcessed = 0
    let totalChunks = 0
    let totalErrors = 0

    for (const contentData of RICH_CONTENT) {
      try {
        console.log(`📥 Processando: ${contentData.title}`)
        
        const cleanContent = contentData.content.trim()
        const chunks = chunkContent(cleanContent, 800, 150)
        
        const metadata = {
          url: `https://conteudo-ms.gov.br/${contentData.category}`,
          title: contentData.title,
          domain: 'conteudo-ms.gov.br',
          category: contentData.category,
          priority: 'high',
          state_code: state_code,
          lastUpdated: new Date().toISOString(),
          source_type: 'official_knowledge'
        }

        // Salvar documento
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .upsert({
            url: metadata.url,
            title: metadata.title,
            content: cleanContent,
            metadata: metadata,
            state_code: state_code,
            category: metadata.category,
            priority: metadata.priority,
            last_fetched_at: new Date().toISOString()
          })
          .select('id')
          .single()

        if (docError) {
          console.error(`❌ Erro ao salvar documento ${contentData.title}:`, docError)
          totalErrors++
          continue
        }

        // Criar chunks
        const chunkRecords = chunks.map((chunk, index) => ({
          document_id: doc.id,
          chunk_index: index,
          content: chunk,
          metadata: {
            ...metadata,
            chunk_length: chunk.length,
            chunk_index: index
          },
          state_code: state_code
        }))

        const { error: chunkError } = await supabase
          .from('document_chunks')
          .upsert(chunkRecords)

        if (chunkError) {
          console.error(`❌ Erro ao salvar chunks para ${contentData.title}:`, chunkError)
          totalErrors++
        } else {
          totalProcessed++
          totalChunks += chunks.length
          console.log(`✅ ${contentData.title}: ${chunks.length} chunks criados`)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`❌ Erro ao processar ${contentData.title}:`, error)
        totalErrors++
      }
    }

    console.log(`🎉 Ingestão concluída: ${totalProcessed} fontes, ${totalChunks} chunks, ${totalErrors} erros`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_sources: totalProcessed, 
        total_chunks: totalChunks, 
        errors: totalErrors,
        state_code: state_code, 
        message: `Ingestão de CONTEÚDO RICO concluída para ${state_code}` 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erro na ingestão:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Função para dividir conteúdo em chunks
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
