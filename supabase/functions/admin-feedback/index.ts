import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, type, feedback_type, data, comment } = await req.json();

    if (!user_id || !type || !feedback_type) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: user_id, type, feedback_type.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let score: number | null = null;
    if (feedback_type === 'positive') {
      score = 5; // Exemplo: 5 para positivo
    } else if (feedback_type === 'negative') {
      score = 1; // Exemplo: 1 para negativo
    } else if (feedback_type === 'neutral') {
      score = 3; // Exemplo: 3 para neutro
    }

    const { error: logError } = await supabaseAdmin.from('ai_feedback_log').insert({
      interaction_id: data?.interactionId || null, // Se você tiver um ID de interação para registrar
      feedback_by_user_id: user_id,
      feedback_type: feedback_type,
      score: score,
      comments: comment || null,
      // Removido: Adicionar metadados sobre a interação da IA aqui se necessário
    });

    if (logError) {
      console.error('Erro ao registrar feedback da IA:', logError);
      return new Response(JSON.stringify({ error: 'Falha ao registrar feedback da IA.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Feedback da IA registrado com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function admin-feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 