import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, context_type } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'A consulta é obrigatória.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let knowledgeBaseQuery = supabaseAdmin.from('knowledge_base_entries').select('title, content, category, context_type');

    if (context_type && context_type !== 'all') {
      knowledgeBaseQuery = knowledgeBaseQuery.eq('context_type', context_type);
    }

    // Simples busca de texto. Em uma implementação real, usaria PG_TRGM, embeddings, etc.
    const { data: results, error: searchError } = await knowledgeBaseQuery
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5); // Limita os resultados para as 5 entradas mais relevantes

    if (searchError) {
      throw searchError;
    }

    let aiResponse = "Desculpe, não encontrei informações relevantes para sua pergunta na base de conhecimento.";

    if (results && results.length > 0) {
      aiResponse = "Com certeza! Encontrei as seguintes informações:";
      results.forEach((item, index) => {
        aiResponse += `\n\n${index + 1}. **${item.title}** (Categoria: ${item.category}, Tipo: ${item.context_type})`;
        aiResponse += `\n   ${item.content.substring(0, 200)}...`; // Limita a prévia do conteúdo
      });
      aiResponse += `\n\nPosso ajudar com mais alguma dúvida sobre a administração?`;
    } else {
      aiResponse += " Você pode tentar reformular a pergunta ou verificar a categoria do contexto.";
    }

    return new Response(JSON.stringify({ response: aiResponse, raw_results: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function admin-advisor-ai:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 