import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Importar o cliente Gemini ou as libs necessárias para a chamada
// Exemplo: import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

// Assumir que a chave da API Gemini será um segredo do Supabase
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { period, metric_focus } = await req.json();

    if (!period) {
      return new Response(JSON.stringify({ error: 'O período de análise é obrigatório (ex: last_month, last_quarter, last_year).' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada como variável de ambiente do Supabase.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Coletar dados financeiros e de uso
    let startDate: Date;
    switch (period) {
      case 'last_month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'last_quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'last_year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // Desde o início
    }

    const { data: metrics, error: metricsError } = await supabaseAdmin
      .from('platform_performance_metrics')
      .select('metric_name, metric_value, unit, timestamp, context_info')
      .gte('timestamp', startDate.toISOString());

    if (metricsError) throw metricsError;

    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('flowtrip_invoices')
      .select('amount, status, due_date, paid_at, client_id')
      .gte('created_at', startDate.toISOString());

    if (invoicesError) throw invoicesError;

    const { data: usage, error: usageError } = await supabaseAdmin
      .from('flowtrip_usage_metrics')
      .select('metric_type, metric_value, recorded_date, client_id')
      .gte('recorded_date', startDate.toISOString());

    if (usageError) throw usageError;

    // 2. Preparar o prompt para a IA (passando os dados coletados)
    const prompt = `
      Analise os seguintes dados de performance, financeiros e de uso da plataforma OverFlow One para o período '${period}'.
      O foco principal da análise é: '${metric_focus || 'geral'}'.

      Métricas de Performance da Plataforma:
      ${JSON.stringify(metrics, null, 2)}

      Faturas (Invoices):
      ${JSON.stringify(invoices, null, 2)}

      Métricas de Uso (Clientes):
      ${JSON.stringify(usage, null, 2)}

      Com base nesses dados, forneça:
      - Uma análise da performance atual.
      - Identificação de tendências e padrões.
      - Previsões financeiras para o próximo trimestre (receita, inadimplência).
      - Sugestões de otimização de custos.
      - Recomendações proativas para melhorar a saúde financeira e operacional da plataforma.

      Responda em formato JSON, com as chaves: "analise_atual", "tendencias", "previsoes_financeiras", "otimizacao_custos", "recomendacoes_proativas".
    `;

    // 3. Chamar a API Gemini (mockado por enquanto)
    const mockGeminiResponse = {
      text: () => {
        return JSON.stringify({
          analise_atual: "Análise mockada: A plataforma está operando com XX% de eficiência.",
          tendencias: "Tendências mockadas: Crescimento de X% em usuários, Y% em receita.",
          previsoes_financeiras: "Previsões mockadas: Receita de R$ZZZ no próximo trimestre.",
          otimizacao_custos: "Otimização mockada: Reduzir custos com infraestrutura.",
          recomendacoes_proativas: "Recomendações mockadas: Focar na retenção de clientes."
        }, null, 2);
      },
    };

    const responseText = mockGeminiResponse.text(); // Substituir pela chamada real ao Gemini

    return new Response(JSON.stringify({ insights: JSON.parse(responseText) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na Edge Function financial-prediction-ai:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 