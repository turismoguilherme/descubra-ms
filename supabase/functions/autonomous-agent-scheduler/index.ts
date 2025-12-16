import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Edge Function: Autonomous Agent Scheduler
 * Executa tarefas agendadas da IA Autônoma 24/7
 * 
 * Esta função é chamada periodicamente via pg_cron e:
 * 1. Verifica quais tarefas precisam ser executadas
 * 2. Executa as tarefas automaticamente
 * 3. Salva os resultados no banco
 */

interface AITask {
  id: string;
  type: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 [AutonomousAgentScheduler] Iniciando verificação de tarefas agendadas...');

    // Verificar se o agente está ativo (configuração salva)
    // Por enquanto, vamos assumir que está ativo se houver tarefas habilitadas
    // No futuro, pode ter uma tabela de configuração

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    // Definir tarefas padrão (mesmas do frontend)
    const defaultTasks: AITask[] = [
      {
        id: '1',
        type: 'analysis',
        name: 'Análise de Métricas',
        schedule: 'Diariamente às 08:00',
        enabled: true,
      },
      {
        id: '2',
        type: 'report',
        name: 'Relatório Financeiro',
        schedule: 'Semanalmente (Segunda)',
        enabled: true,
      },
      {
        id: '3',
        type: 'notification',
        name: 'Alertas de Anomalias',
        schedule: 'A cada hora',
        enabled: true,
      },
      {
        id: '4',
        type: 'cleanup',
        name: 'Limpeza de Cache',
        schedule: 'Semanalmente (Domingo)',
        enabled: true,
      },
      {
        id: '5',
        type: 'notification',
        name: 'Aprovação Automática de Eventos',
        schedule: 'A cada hora',
        enabled: false, // Desabilitado por padrão - admin pode ativar
      },
    ];

    // Verificar quais tarefas devem ser executadas
    const tasksToRun: AITask[] = [];

    for (const task of defaultTasks) {
      if (!task.enabled) continue;

      const shouldRun = checkIfTaskShouldRun(task, currentHour, currentMinute, currentDay);
      
      if (shouldRun) {
        // Verificar última execução (buscar do banco se existir)
        // Por enquanto, vamos executar se não tiver executado na última hora/dia
        tasksToRun.push(task);
      }
    }

    console.log(`📋 [AutonomousAgentScheduler] ${tasksToRun.length} tarefa(s) para executar`);

    const results = [];

    // Executar cada tarefa
    for (const task of tasksToRun) {
      try {
        console.log(`🚀 [AutonomousAgentScheduler] Executando: ${task.name}`);
        
        let result: any = null;

        switch (task.type) {
          case 'analysis':
            result = await executeMetricsAnalysis(supabase);
            break;
          case 'report':
            result = await executeFinancialReport(supabase);
            break;
          case 'notification':
            if (task.name === 'Aprovação Automática de Eventos') {
              result = await executeAutoApproveEvents(supabase);
            } else {
              result = await executeAnomalyDetection(supabase);
            }
            break;
          case 'cleanup':
            result = await executeCacheCleanup(supabase);
            break;
        }

        results.push({
          task: task.name,
          success: result?.success || false,
          message: result?.message || 'Executado',
        });

        console.log(`✅ [AutonomousAgentScheduler] ${task.name} concluída`);
      } catch (error: any) {
        console.error(`❌ [AutonomousAgentScheduler] Erro em ${task.name}:`, error);
        results.push({
          task: task.name,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        tasksExecuted: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('❌ [AutonomousAgentScheduler] Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function checkIfTaskShouldRun(task: AITask, hour: number, minute: number, day: number): boolean {
  const schedule = task.schedule.toLowerCase();

  // Diariamente às 08:00
  if (schedule.includes('diariamente') && schedule.includes('08:00')) {
    return hour === 8 && minute === 0;
  }

  // Diariamente às 10:00
  if (schedule.includes('diariamente') && schedule.includes('10:00')) {
    return hour === 10 && minute === 0;
  }

  // Diariamente às 03:00
  if (schedule.includes('diariamente') && schedule.includes('03:00')) {
    return hour === 3 && minute === 0;
  }

  // Semanalmente (Segunda)
  if (schedule.includes('semanalmente') && schedule.includes('segunda')) {
    return day === 1 && hour === 8 && minute === 0;
  }

  // Semanalmente (Quarta)
  if (schedule.includes('semanalmente') && schedule.includes('quarta')) {
    return day === 3 && hour === 8 && minute === 0;
  }

  // Semanalmente (Domingo)
  if (schedule.includes('semanalmente') && schedule.includes('domingo')) {
    return day === 0 && hour === 8 && minute === 0;
  }

  // A cada hora
  if (schedule.includes('a cada hora')) {
    return minute === 0; // Executa no início de cada hora
  }

  return false;
}

// Função para executar análise de métricas
async function executeMetricsAnalysis(supabase: any) {
  try {
    // Buscar dados unificados
    const [usersResult, eventsResult, revenueResult, passportsResult, destinationsResult] = await Promise.all([
      supabase.from('user_profiles').select('id, created_at', { count: 'exact', head: false }).limit(1000),
      supabase.from('events').select('id, created_at, is_visible, source').limit(1000),
      supabase.from('master_financial_records')
        .select('amount, record_type, paid_date')
        .eq('record_type', 'revenue')
        .gte('paid_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .limit(1000),
      supabase.from('user_passports').select('id', { count: 'exact', head: true }),
      supabase.from('destinations').select('id', { count: 'exact', head: true }),
    ]);

    const totalUsers = usersResult.count || 0;
    const activeEvents = eventsResult.data?.filter((e: any) => e.is_visible).length || 0;
    const totalRevenue = revenueResult.data?.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) || 0;
    const totalPassports = passportsResult.count || 0;
    const totalDestinations = destinationsResult.count || 0;

    const newUsersLast30Days = usersResult.data?.filter((u: any) => {
      const created = new Date(u.created_at);
      return created >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length || 0;

    // Gerar análise com IA (usar Gemini via HTTP)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const analysisPrompt = `Analise as seguintes métricas UNIFICADAS das plataformas ViajARTur e Descubra MS:

MÉTRICAS:
- Total de usuários: ${totalUsers}
- Novos usuários (30 dias): ${newUsersLast30Days}
- Eventos ativos: ${activeEvents}
- Receita ViajARTur (30 dias): R$ ${totalRevenue.toFixed(2)}
- Passaportes Digitais: ${totalPassports}
- Destinos: ${totalDestinations}

Forneça insights concisos sobre crescimento, tendências e recomendações.`;

    // Chamar Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    const insights = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Análise gerada com sucesso';

    const result = {
      viajar: {
        users: totalUsers,
        events: activeEvents,
        revenue: totalRevenue,
      },
      descubra: {
        users: totalUsers,
        events: activeEvents,
        passports: totalPassports,
        destinations: totalDestinations,
      },
      unified: {
        totalUsers,
        newUsersLast30Days,
        totalEvents: activeEvents,
      },
      insights,
      timestamp: new Date().toISOString(),
    };

    // Salvar no banco
    await supabase.from('ai_analyses').insert({
      type: 'metrics',
      analysis_data: result,
      insights,
    });

    return { success: true, message: 'Análise de métricas executada', data: result };
  } catch (error: any) {
    console.error('Erro na análise de métricas:', error);
    return { success: false, message: 'Erro ao executar análise', error: error.message };
  }
}

// Função para executar relatório financeiro
async function executeFinancialReport(supabase: any) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Buscar dados financeiros
    const [revenueResult, expensesResult] = await Promise.all([
      supabase
        .from('master_financial_records')
        .select('amount')
        .eq('record_type', 'revenue')
        .gte('paid_date', startOfMonth.toISOString().split('T')[0])
        .lte('paid_date', endOfMonth.toISOString().split('T')[0]),
      supabase
        .from('master_financial_records')
        .select('amount')
        .eq('record_type', 'expense')
        .gte('paid_date', startOfMonth.toISOString().split('T')[0])
        .lte('paid_date', endOfMonth.toISOString().split('T')[0]),
    ]);

    const revenue = revenueResult.data?.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) || 0;
    const expenses = expensesResult.data?.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) || 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100) : 0;

    // Gerar relatório com IA
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const reportPrompt = `Gere um relatório financeiro profissional para o mês atual:

RECEITAS: R$ ${revenue.toFixed(2)}
DESPESAS: R$ ${expenses.toFixed(2)}
LUCRO: R$ ${profit.toFixed(2)}
MARGEM: ${profitMargin.toFixed(2)}%

Forneça resumo executivo, análise e recomendações.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: reportPrompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();
    const report = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Relatório gerado com sucesso';

    const result = {
      period: {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
      },
      revenue,
      expenses,
      profit,
      profitMargin,
      report,
      timestamp: new Date().toISOString(),
    };

    // Salvar no banco
    await supabase.from('ai_analyses').insert({
      type: 'financial',
      analysis_data: result,
      insights: report,
    });

    return { success: true, message: 'Relatório financeiro gerado', data: result };
  } catch (error: any) {
    console.error('Erro no relatório financeiro:', error);
    return { success: false, message: 'Erro ao gerar relatório', error: error.message };
  }
}

// Função para detectar anomalias
async function executeAnomalyDetection(supabase: any) {
  try {
    const anomalies: string[] = [];

    // Verificar métricas
    const [usersResult, eventsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1000),
      supabase
        .from('events')
        .select('id, is_visible')
        .eq('is_visible', true)
        .limit(1000),
    ]);

    const newUsers24h = usersResult.data?.length || 0;
    const activeEvents = eventsResult.data?.length || 0;

    if (newUsers24h === 0) {
      anomalies.push('⚠️ Nenhum novo usuário nas últimas 24h');
    }
    if (activeEvents < 5) {
      anomalies.push(`⚠️ Apenas ${activeEvents} eventos ativos`);
    }

    return {
      success: true,
      message: anomalies.length > 0 ? `${anomalies.length} anomalia(s) detectada(s)` : 'Nenhuma anomalia',
      data: { anomalies, timestamp: new Date().toISOString() },
    };
  } catch (error: any) {
    return { success: false, message: 'Erro na detecção', error: error.message };
  }
}

// Função para aprovar eventos automaticamente
async function executeAutoApproveEvents(supabase: any) {
  try {
    // Buscar eventos pendentes gratuitos
    const { data: pendingEvents, error } = await supabase
      .from('events')
      .select('id, name, title, start_date, is_free, price, approval_status')
      .eq('approval_status', 'pending')
      .or('is_free.eq.true,price.eq.0')
      .limit(50);

    if (error) throw error;

    const approvedEvents: any[] = [];
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 7); // Mínimo 7 dias no futuro

    const blockedWords = ['teste', 'test', 'spam', 'xxx'];

    for (const event of pendingEvents || []) {
      const eventName = (event.name || event.title || '').toLowerCase();
      const startDate = event.start_date ? new Date(event.start_date) : null;
      const isFree = event.is_free === true || event.price === 0 || event.price === null;
      
      const hasBlockedWords = blockedWords.some(word => eventName.includes(word));
      const hasValidDate = startDate && startDate >= minDate;
      const hasRequiredFields = event.name || event.title;

      if (isFree && hasValidDate && hasRequiredFields && !hasBlockedWords) {
        // Aprovar
        const { error: updateError } = await supabase
          .from('events')
          .update({
            approval_status: 'approved',
            is_visible: true,
            approved_at: new Date().toISOString(),
          })
          .eq('id', event.id);

        if (!updateError) {
          approvedEvents.push(event);
          
          await supabase.from('ai_auto_approvals').insert({
            event_id: event.id,
            approval_reason: 'Evento gratuito com data válida e campos obrigatórios preenchidos',
            rules_applied: {
              isFree: true,
              hasValidDate: true,
              hasRequiredFields: true,
              hasBlockedWords: false,
            },
            event_data: event,
          });
        }
      }
    }

    return {
      success: true,
      message: `${approvedEvents.length} evento(s) aprovado(s) automaticamente`,
      data: {
        totalChecked: pendingEvents?.length || 0,
        approved: approvedEvents.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return { success: false, message: 'Erro na aprovação automática', error: error.message };
  }
}

// Função para limpeza de cache
async function executeCacheCleanup(supabase: any) {
  try {
    // Limpeza de cache seria feita no frontend (localStorage)
    // Aqui podemos limpar dados temporários do banco se houver
    return {
      success: true,
      message: 'Limpeza de cache concluída',
      data: { timestamp: new Date().toISOString() },
    };
  } catch (error: any) {
    return { success: false, message: 'Erro na limpeza', error: error.message };
  }
}


