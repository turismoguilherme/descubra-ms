import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada como variável de ambiente do Supabase.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Coletar dados de feedback recentes
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Últimos 7 dias de feedback

    const { data: recentFeedback, error: feedbackError } = await supabaseAdmin
      .from('ai_feedback_log')
      .select('feedback_type, score, comments, interaction_id, created_at')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (feedbackError) throw feedbackError;

    // 2. Preparar um prompt para a IA (Gemini)
    let prompt = `Analise os seguintes dados de feedback de usuários sobre a performance da IA da plataforma OverFlow One:

Dados de Feedback Recentes:
${JSON.stringify(recentFeedback, null, 2)}

Com base neste feedback, forneça:
- Uma análise da qualidade das respostas da IA (identificando pontos fortes e fracos).
- Sugestões detalhadas para ajustes nos parâmetros da IA (seja para o modelo de chat, análise estratégica, ou outras IAs).
- Recomendações para melhoria da base de conhecimento ou dos prompts de sistema.
- Indique se uma intervenção manual imediata é recomendada (SIM/NAO para 'manual_intervention_recommended').

Responda em formato JSON, com as chaves: "analise_qualidade", "sugestoes_ajuste_parametros", "recomendacoes_base_conhecimento", "manual_intervention_recommended".`;

    // 3. Chamar a API Gemini (mockado por enquanto)
    const mockGeminiResponse = {
      text: () => {
        return JSON.stringify({
          analise_qualidade: "Análise mockada: A maioria do feedback é positivo, mas há casos de respostas genéricas.",
          sugestoes_ajuste_parametros: "Sugestões mockadas: Aumentar 'temperature' para mais criatividade, revisar prompts de áreas específicas.",
          recomendacoes_base_conhecimento: "Recomendações mockadas: Adicionar mais FAQs sobre faturamento.",
          manual_intervention_recommended: "NAO"
        }, null, 2);
      },
    };

    const aiResponse = mockGeminiResponse.text(); // Substituir pela chamada real ao Gemini
    const parsedAiResponse = JSON.parse(aiResponse);

    // 4. Registrar insights da IA (opcional, na tabela ai_insights ou uma nova para otimização)
    const { error: insightLogError } = await supabaseAdmin.from('ai_insights').insert({
      region: 'global',
      insight_type: 'ai_optimization',
      title: 'Relatório de Otimização da IA',
      description: parsedAiResponse.analise_qualidade,
      confidence_score: 0.9,
      recommendations: JSON.stringify(parsedAiResponse.sugestoes_ajuste_parametros) + "\n" + JSON.stringify(parsedAiResponse.recomendacoes_base_conhecimento),
      status: parsedAiResponse.manual_intervention_recommended === 'SIM' ? 'action_required' : 'reviewed',
    });
    if (insightLogError) console.error('Erro ao registrar insight de otimização da IA:', insightLogError);

    // 5. Simular notificação ou ação se intervenção manual for recomendada
    if (parsedAiResponse.manual_intervention_recommended === 'SIM') {
      // Aqui, você chamaria uma função para notificar um administrador
      console.log('ALERTA: Intervenção manual na IA recomendada!');
      // Ex: Chamar a send-email-via-gateway para notificar
    }

    return new Response(JSON.stringify({ optimization_insights: parsedAiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function ai-optimizer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 