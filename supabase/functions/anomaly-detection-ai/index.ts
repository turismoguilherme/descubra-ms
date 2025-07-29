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
    // Esta função pode ser acionada por um cron job no Supabase ou manualmente.
    // Não precisa de input do corpo da requisição para coletar dados.
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada como variável de ambiente do Supabase.');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Coletar as métricas de performance mais recentes (ex: últimas 24h ou 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: recentMetrics, error: metricsError } = await supabaseAdmin
      .from('platform_performance_metrics')
      .select('metric_name, metric_value, unit, timestamp, context_info')
      .gte('timestamp', oneWeekAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (metricsError) throw metricsError;

    // 2. Coletar logs de segurança recentes (ex: últimas 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: securityLogs, error: securityLogsError } = await supabaseAdmin
      .from('security_audit_log')
      .select('action, success, created_at, user_id, ip_address, error_message')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });

    if (securityLogsError) throw securityLogsError;

    // 3. Preparar o prompt para a IA
    const prompt = `
      Analise os seguintes dados de métricas de performance e logs de segurança da plataforma FlowTrip para detectar anomalias, padrões incomuns ou potenciais problemas.

      Métricas de Performance Recentes (últimos 7 dias):
      ${JSON.stringify(recentMetrics, null, 2)}

      Logs de Segurança Recentes (últimas 24 horas):
      ${JSON.stringify(securityLogs, null, 2)}

      Com base nesses dados, identifique:
      - Qualquer anomalia ou desvio significativo nas métricas (ex: picos/quedas inesperadas de uso, latência).
      - Tentativas de acesso não autorizado, logins falhos repetidos, ou outras atividades suspeitas nos logs de segurança.
      - Padrões que possam indicar problemas de performance, segurança ou operacionais.

      Sugira:
      - Ações imediatas ou investigações adicionais necessárias.
      - Recomendações proativas para prevenir problemas futuros.
      - Determine se é necessário enviar um alerta crítico (respondendo 'SIM' ou 'NAO' para 'critical_alert_needed').

      Responda em formato JSON, com as chaves: "analise_anomalias", "acoes_sugeridas", "recomendacoes_proativas", "critical_alert_needed" (SIM/NAO).
    `;

    // 4. Chamar a API Gemini (mockado por enquanto)
    const mockGeminiResponse = {
      text: () => {
        return JSON.stringify({
          analise_anomalias: "Análise mockada: Nenhuma anomalia crítica detectada. Usuários ativos estável.",
          acoes_sugeridas: "Ações mockadas: Monitorar login de novos usuários.",
          recomendacoes_proativas: "Recomendações mockadas: Implementar autenticação multi-fator para administradores.",
          critical_alert_needed: "NAO"
        }, null, 2);
      },
    };

    const aiResponse = mockGeminiResponse.text(); // Substituir pela chamada real ao Gemini
    const parsedAiResponse = JSON.parse(aiResponse);

    // 5. Registrar insights da IA (opcional, pode ser na tabela ai_insights ou uma nova)
    const { error: insightLogError } = await supabaseAdmin.from('ai_insights').insert({
      region: 'global',
      insight_type: 'anomaly_detection',
      title: 'Relatório de Detecção de Anomalias',
      description: parsedAiResponse.analise_anomalias,
      confidence_score: 0.8,
      recommendations: parsedAiResponse.recomendacoes_proativas,
      status: parsedAiResponse.critical_alert_needed === 'SIM' ? 'critical' : 'active',
    });
    if (insightLogError) console.error('Erro ao registrar insight de anomalia:', insightLogError);

    // 6. Enviar alerta crítico se a IA sugerir
    if (parsedAiResponse.critical_alert_needed === 'SIM') {
      const adminEmail = 'admin@flowtrip.com'; // Definir email do admin
      const subject = 'ALERTA CRÍTICO: Anomalia Detectada na Plataforma FlowTrip!';
      const body = `Detalhes da Anomalia:\n${parsedAiResponse.analise_anomalias}\n\nAções Sugeridas:\n${parsedAiResponse.acoes_sugeridas}\n\nRecomendações Proativas:\n${parsedAiResponse.recomendacoes_proativas}\n\nPor favor, investigue imediatamente.`;
      
      // Chamar a Edge Function de envio de e-mail (ou um NotificationService se disponível no backend)
      // Para o Deno, teríamos que fazer a chamada HTTP diretamente para send-email-via-gateway
      const emailResponse = await fetch(`${supabaseAdmin.functions.url}/send-email-via-gateway`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: adminEmail, subject, body, aiGenerated: true }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Falha ao enviar alerta por e-mail:', errorText);
      }
    }

    return new Response(JSON.stringify({ insights: parsedAiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function anomaly-detection-ai:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 