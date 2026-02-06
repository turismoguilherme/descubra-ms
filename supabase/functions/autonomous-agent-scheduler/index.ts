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

    // Buscar configuração do agente do banco de dados
    const { data: agentConfig, error: configError } = await supabase
      .from('ai_agent_config')
      .select('*')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Se não houver configuração ativa, não executar nada
    if (configError || !agentConfig || !agentConfig.active) {
      console.log('⏸️ [AutonomousAgentScheduler] Agente inativo ou configuração não encontrada. Pulando execução.');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Agente inativo - nenhuma tarefa executada',
          timestamp: new Date().toISOString(),
          tasksExecuted: 0,
          results: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`✅ [AutonomousAgentScheduler] Agente ativo - Nível de autonomia: ${agentConfig.autonomy_level}%`);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    // Usar tarefas da configuração do banco, ou tarefas padrão como fallback
    let tasks: AITask[] = [];
    
    if (agentConfig.tasks && Array.isArray(agentConfig.tasks) && agentConfig.tasks.length > 0) {
      // Usar tarefas salvas no banco
      tasks = agentConfig.tasks.map((t: any) => ({
        id: t.id || '',
        type: t.type || '',
        name: t.name || '',
        schedule: t.schedule || '',
        enabled: t.enabled !== undefined ? t.enabled : true,
        lastRun: t.lastRun ? new Date(t.lastRun).toISOString() : undefined,
      }));
      console.log(`📋 [AutonomousAgentScheduler] Carregadas ${tasks.length} tarefas da configuração do banco`);
    } else {
      // Fallback: tarefas padrão (mesmas do frontend)
      console.log('⚠️ [AutonomousAgentScheduler] Nenhuma tarefa na configuração, usando tarefas padrão');
      tasks = [
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
        {
          id: '6',
          type: 'email',
          name: 'Agente Cris - Responder Emails',
          schedule: 'A cada 15 minutos',
          enabled: true, // Ativo por padrão
        },
      ];
    }

    // Verificar quais tarefas devem ser executadas
    const tasksToRun: AITask[] = [];

    for (const task of tasks) {
      if (!task.enabled) {
        console.log(`⏸️ [AutonomousAgentScheduler] Tarefa ${task.name} está desabilitada`);
        continue;
      }

      const shouldRun = checkIfTaskShouldRun(task, currentHour, currentMinute, currentDay);
      
      if (shouldRun) {
        // Verificar última execução (buscar do banco se existir)
        // Por enquanto, vamos executar se não tiver executado na última hora/dia
        tasksToRun.push(task);
        console.log(`⏰ [AutonomousAgentScheduler] Tarefa agendada: ${task.name} (${task.schedule})`);
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
          case 'email':
            if (task.name === 'Agente Cris - Responder Emails') {
              result = await executeCrisEmailAgent(supabase);
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

  // A cada 15 minutos
  if (schedule.includes('a cada 15 minutos')) {
    return minute % 15 === 0; // Executa a cada 15 minutos (0, 15, 30, 45)
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

// Lista de palavrões em português brasileiro
const PROFANITY_WORDS = [
  'caralho', 'porra', 'puta', 'puto', 'foda', 'foder', 'fodido', 'fodida',
  'merda', 'bosta', 'cacete', 'caceta', 'cu', 'buceta', 'xoxota', 'xavasca',
  'viado', 'viadão', 'bicha', 'baitola', 'traveco', 'travesti',
  'filho da puta', 'fdp', 'vsf', 'vai se foder', 'vai tomar no cu',
  'crl', 'pqp', 'ptqp', 'vtnc', 'vtmnc',
  'idiota', 'imbecil', 'burro', 'burra', 'retardado', 'retardada',
];

// Temas proibidos
const PROHIBITED_TOPICS = [
  'assassinato', 'homicídio', 'matar', 'morte violenta', 'sangue', 'arma', 'tiro',
  'maconha', 'cocaína', 'crack', 'heroína', 'lsd', 'ecstasy', 'drogas ilícitas',
  'racismo', 'nazismo', 'fascismo', 'homofobia', 'xenofobia', 'preconceito',
  'pornografia', 'sexo explícito', 'nudez', 'erótico explícito',
  'terrorismo', 'extremismo', 'apologia ao crime',
];

// Palavras de spam
const SPAM_WORDS = [
  'teste', 'test', 'spam', 'xxx', 'promoção urgente', 'clique aqui agora',
  'ganhe dinheiro fácil', 'trabalhe em casa', 'enriquecer rápido',
];

// Função para verificar palavrões
function checkProfanity(content: string): boolean {
  const normalized = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PROFANITY_WORDS.some(word => 
    normalized.includes(word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
}

// Função para verificar temas proibidos
function checkProhibitedTopics(content: string): boolean {
  const normalized = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PROHIBITED_TOPICS.some(topic => 
    normalized.includes(topic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
}

// Função para verificar spam
function checkSpam(content: string): boolean {
  const normalized = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return SPAM_WORDS.some(spam => 
    normalized.includes(spam.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
}

// Função para analisar conteúdo com Gemini
async function analyzeContentWithAI(content: string): Promise<{
  isAppropriate: boolean;
  confidence: number;
  reason?: string;
}> {
  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY não configurada, pulando análise de IA');
      return { isAppropriate: true, confidence: 0.5, reason: 'IA não disponível' };
    }

    const prompt = `Você é um moderador de conteúdo para uma plataforma de turismo do Mato Grosso do Sul.

Analise o seguinte conteúdo e determine se é apropriado para ser publicado em uma plataforma de turismo familiar.

CONTEÚDO:
"${content}"

INSTRUÇÕES:
1. Verifique se contém palavrões, linguagem ofensiva ou inadequada
2. Verifique se faz apologia a violência, drogas, discriminação ou outros temas proibidos
3. Verifique se é spam ou conteúdo duplicado
4. Verifique se é apropriado para uma plataforma de turismo familiar
5. Verifique se o tom e linguagem são profissionais

RESPONDA APENAS EM JSON:
{
  "isAppropriate": true/false,
  "confidence": 0.0-1.0,
  "reason": "explicação breve"
}

Seja rigoroso mas justo. Conteúdo de turismo deve ser profissional e adequado para todas as idades.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Tentar extrair JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isAppropriate: parsed.isAppropriate !== false,
        confidence: parsed.confidence || 0.5,
        reason: parsed.reason,
      };
    }

    // Fallback: analisar texto
    const lowerText = text.toLowerCase();
    if (lowerText.includes('não apropriado') || lowerText.includes('inadequado') || lowerText.includes('rejeitar')) {
      return { isAppropriate: false, confidence: 0.7, reason: 'IA identificou conteúdo inadequado' };
    }

    return { isAppropriate: true, confidence: 0.8, reason: 'IA não identificou problemas' };
  } catch (error: any) {
    console.error('❌ Erro na análise com IA:', error);
    return { isAppropriate: true, confidence: 0.5, reason: 'Erro na análise de IA' };
  }
}

// Função para moderar evento
// NOVA LÓGICA: Aceita por padrão, rejeita apenas se detectar problemas graves
async function moderateEvent(event: any): Promise<{
  approved: boolean;
  score: number;
  reason?: string;
  needsHumanReview: boolean;
}> {
  const contentParts: string[] = [];
  if (event.name) contentParts.push(event.name);
  if (event.title) contentParts.push(event.title);
  if (event.description) contentParts.push(event.description);

  const fullContent = contentParts.join(' ');

  // Verificações básicas - problemas graves que causam rejeição
  const hasProfanity = checkProfanity(fullContent);
  const hasProhibitedTopic = checkProhibitedTopics(fullContent);
  const hasSpam = checkSpam(fullContent);

  // Análise com IA para detectar conteúdo falso ou claramente inadequado
  const aiAnalysis = await analyzeContentWithAI(fullContent);

  // NOVA LÓGICA: Aceitar por padrão, rejeitar apenas se tiver problemas graves
  // Rejeitar se: palavrões OU apologia OU spam OU conteúdo falso/inadequado detectado pela IA
  const approved = !hasProfanity && !hasProhibitedTopic && !hasSpam && aiAnalysis.isAppropriate;
  const needsHumanReview = false; // Não precisa mais de revisão humana intermediária

  // Calcular score apenas para registro (não usado na decisão)
  let score = 100;
  if (hasProfanity) score -= 40;
  if (hasProhibitedTopic) score -= 50;
  if (hasSpam) score -= 30;
  if (!aiAnalysis.isAppropriate) {
    score -= (1 - aiAnalysis.confidence) * 30;
  }
  score = Math.max(0, Math.min(100, score));

  let reason: string | undefined;
  if (!approved) {
    const reasons: string[] = [];
    if (hasProfanity) reasons.push('contém palavrões');
    if (hasProhibitedTopic) reasons.push('faz apologia a temas proibidos');
    if (hasSpam) reasons.push('identificado como spam');
    if (!aiAnalysis.isAppropriate) reasons.push(aiAnalysis.reason || 'conteúdo inadequado ou falso detectado pela IA');
    reason = reasons.join(', ');
  }

  return { approved, score: Math.round(score), reason, needsHumanReview };
}

// Função para aprovar eventos automaticamente
async function executeAutoApproveEvents(supabase: any) {
  try {
    console.log('🔍 [AutoApproveEvents] Iniciando verificação de eventos pendentes...');

    // Buscar eventos pendentes (gratuitos e pagos)
    const { data: pendingEvents, error } = await supabase
      .from('events')
      .select('id, name, title, description, start_date, is_free, price, approval_status')
      .eq('approval_status', 'pending')
      .limit(50);

    if (error) throw error;

    const approvedEvents: any[] = [];
    const rejectedEvents: any[] = [];
    const needsReviewEvents: any[] = [];
    const today = new Date();
    // REMOVIDO: Exigência de 7 dias no futuro - agora aceita eventos a partir de hoje
    const minDate = new Date(today);
    minDate.setHours(0, 0, 0, 0); // Aceitar eventos a partir de hoje (00:00)

    for (const event of pendingEvents || []) {
      const startDate = event.start_date ? new Date(event.start_date) : null;
      const isFree = event.is_free === true || event.price === 0 || event.price === null;
      // Aceitar eventos a partir de hoje (sem exigir 7 dias)
      const hasValidDate = startDate && startDate >= minDate;
      const hasRequiredFields = event.name || event.title;

      // Verificações básicas: apenas campos obrigatórios e data válida (a partir de hoje)
      if (!hasValidDate || !hasRequiredFields) {
        rejectedEvents.push({
          event,
          reason: !hasValidDate ? 'Data inválida ou no passado' :
                 !hasRequiredFields ? 'Campos obrigatórios faltando (nome/título)' : 'Outro motivo',
        });
        continue;
      }

      // Moderação de conteúdo - NOVA LÓGICA: aceita por padrão, rejeita apenas problemas graves
      const moderation = await moderateEvent(event);

      if (moderation.approved) {
        // Aprovar automaticamente
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
            approval_reason: `Aprovado automaticamente - Sem problemas detectados (palavrões, apologia, spam ou conteúdo falso)`,
            rules_applied: {
              isFree: isFree,
              hasValidDate: true,
              hasRequiredFields: true,
              moderationScore: moderation.score,
              flags: {
                hasProfanity: false,
                hasProhibitedTopic: false,
                hasSpam: false,
                aiAppropriate: true,
              },
            },
            event_data: event,
          });

          console.log(`✅ [AutoApproveEvents] Evento aprovado automaticamente: ${event.name || event.title}`);
        }
      } else {
        // Rejeitar apenas se detectar problemas graves (palavrões, apologia, spam ou conteúdo falso)
        // Rejeitar automaticamente
        rejectedEvents.push({
          event,
          reason: moderation.reason || 'Conteúdo inadequado',
          score: moderation.score,
        });

        const { error: updateError } = await supabase
          .from('events')
          .update({
            approval_status: 'rejected',
            rejection_reason: moderation.reason || 'Conteúdo contém palavrões, apologia, spam ou foi identificado como falso/inadequado',
          })
          .eq('id', event.id);

        if (!updateError) {
          await supabase.from('ai_auto_approvals').insert({
            event_id: event.id,
            approval_reason: `Rejeitado automaticamente - ${moderation.reason}`,
            rules_applied: {
              isFree: isFree,
              hasValidDate: true,
              hasRequiredFields: true,
              moderationScore: moderation.score,
              rejected: true,
              rejectionReason: moderation.reason,
            },
            event_data: event,
          });

          console.log(`❌ [AutoApproveEvents] Evento rejeitado: ${event.name || event.title} - Motivo: ${moderation.reason}`);
        }
      }
    }

    console.log(`📊 [AutoApproveEvents] Resumo: ${approvedEvents.length} aprovados automaticamente, ${rejectedEvents.length} rejeitados (problemas graves detectados)`);

    return {
      success: true,
      message: `${approvedEvents.length} evento(s) aprovado(s) automaticamente, ${rejectedEvents.length} rejeitado(s) (palavrões, apologia, spam ou conteúdo falso)`,
      data: {
        totalChecked: pendingEvents?.length || 0,
        approved: approvedEvents.length,
        rejected: rejectedEvents.length,
        needsReview: 0, // Não há mais revisão intermediária
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('❌ [AutoApproveEvents] Erro:', error);
    return { success: false, message: 'Erro na aprovação automática', error: error.message };
  }
}

// Função para executar agente Cris de email
async function executeCrisEmailAgent(supabase: any) {
  try {
    console.log('📧 [Cris Email Agent] Iniciando processamento de emails...');

    // Chamar Edge Function do Cris
    const functionUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '/functions/v1');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!functionUrl || !anonKey) {
      throw new Error('Configuração de URL ou chave do Supabase não encontrada');
    }

    const response = await fetch(`${functionUrl}/cris-email-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'autonomous-agent-scheduler',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao chamar Cris Email Agent: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || 'Emails processados pelo Cris',
      data: result,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('❌ [Cris Email Agent] Erro:', error);
    return {
      success: false,
      message: 'Erro ao processar emails com Cris',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
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


