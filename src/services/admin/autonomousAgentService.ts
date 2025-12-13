import { supabase } from '@/integrations/supabase/client';
import { generateContent } from '@/config/gemini';
import { financialDashboardService } from './financialDashboardService';

export interface TaskResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const autonomousAgentService = {
  /**
   * Executa análise de métricas
   */
  async runMetricsAnalysis(): Promise<TaskResult> {
    try {
      console.log('📊 [AutonomousAgent] Iniciando análise de métricas...');
      
      // Buscar dados reais
      const [usersResult, eventsResult, revenueResult] = await Promise.all([
        supabase.from('user_profiles').select('id, created_at', { count: 'exact', head: false }).limit(1000),
        supabase.from('events').select('id, created_at, is_visible').limit(1000),
        supabase.from('master_financial_records')
          .select('amount, record_type, paid_date')
          .eq('record_type', 'revenue')
          .gte('paid_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .limit(1000),
      ]);

      const totalUsers = usersResult.count || 0;
      const activeEvents = eventsResult.data?.filter(e => e.is_visible).length || 0;
      const totalRevenue = revenueResult.data?.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 0;

      // Calcular métricas
      const newUsersLast30Days = usersResult.data?.filter(u => {
        const created = new Date(u.created_at);
        return created >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length || 0;

      // Gerar análise com IA
      const analysisPrompt = `Analise as seguintes métricas do sistema de turismo do Mato Grosso do Sul e forneça insights:

MÉTRICAS:
- Total de usuários: ${totalUsers}
- Novos usuários (últimos 30 dias): ${newUsersLast30Days}
- Eventos ativos: ${activeEvents}
- Receita (últimos 30 dias): R$ ${totalRevenue.toFixed(2)}

Forneça:
1. Principais insights sobre o crescimento
2. Tendências identificadas
3. Recomendações de ação
4. Pontos de atenção

Seja conciso e objetivo.`;

      const aiAnalysis = await generateContent(analysisPrompt);
      
      const result = {
        totalUsers,
        newUsersLast30Days,
        activeEvents,
        totalRevenue,
        analysis: aiAnalysis.ok ? aiAnalysis.text : 'Análise não disponível no momento',
        timestamp: new Date().toISOString(),
      };

      // Salvar análise (opcional - pode criar tabela para isso)
      console.log('✅ [AutonomousAgent] Análise de métricas concluída');

      return {
        success: true,
        message: 'Análise de métricas concluída com sucesso',
        data: result,
      };
    } catch (error: any) {
      console.error('❌ [AutonomousAgent] Erro na análise de métricas:', error);
      return {
        success: false,
        message: 'Erro ao executar análise de métricas',
        error: error.message,
      };
    }
  },

  /**
   * Gera relatório financeiro
   */
  async generateFinancialReport(): Promise<TaskResult> {
    try {
      console.log('💰 [AutonomousAgent] Gerando relatório financeiro...');
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Buscar dados financeiros reais
      const [revenue, expenses, upcomingBills] = await Promise.all([
        financialDashboardService.getMonthlyRevenue(
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        ).catch(() => ({ total: 0, byCategory: {} })),
        financialDashboardService.getMonthlyExpenses(
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        ).catch(() => ({ total: 0, byCategory: {} })),
        financialDashboardService.getUpcomingBills(7).catch(() => []),
      ]);

      const profit = (revenue.total || 0) - (expenses.total || 0);
      const profitMargin = revenue.total > 0 ? ((profit / revenue.total) * 100) : 0;

      // Gerar relatório com IA
      const reportPrompt = `Gere um relatório financeiro profissional para o mês atual com os seguintes dados:

RECEITAS:
- Total: R$ ${(revenue.total || 0).toFixed(2)}
- Por categoria: ${JSON.stringify(revenue.byCategory || {})}

DESPESAS:
- Total: R$ ${(expenses.total || 0).toFixed(2)}
- Por categoria: ${JSON.stringify(expenses.byCategory || {})}

RESULTADO:
- Lucro: R$ ${profit.toFixed(2)}
- Margem de lucro: ${profitMargin.toFixed(2)}%

CONTAS A VENCER (próximos 7 dias): ${upcomingBills.length} contas

Forneça:
1. Resumo executivo
2. Análise de receitas
3. Análise de despesas
4. Projeções
5. Recomendações

Formato: Relatório profissional e objetivo.`;

      const aiReport = await generateContent(reportPrompt);

      const result = {
        period: {
          start: startOfMonth.toISOString().split('T')[0],
          end: endOfMonth.toISOString().split('T')[0],
        },
        revenue: revenue.total || 0,
        expenses: expenses.total || 0,
        profit,
        profitMargin,
        upcomingBills: upcomingBills.length,
        report: aiReport.ok ? aiReport.text : 'Relatório não disponível no momento',
        timestamp: new Date().toISOString(),
      };

      console.log('✅ [AutonomousAgent] Relatório financeiro gerado');

      return {
        success: true,
        message: 'Relatório financeiro gerado com sucesso',
        data: result,
      };
    } catch (error: any) {
      console.error('❌ [AutonomousAgent] Erro ao gerar relatório financeiro:', error);
      return {
        success: false,
        message: 'Erro ao gerar relatório financeiro',
        error: error.message,
      };
    }
  },

  /**
   * Detecta anomalias e envia alertas
   */
  async detectAnomalies(): Promise<TaskResult> {
    try {
      console.log('🔍 [AutonomousAgent] Detectando anomalias...');
      
      const anomalies: string[] = [];

      // Verificar métricas anômalas
      const [usersResult, eventsResult, healthChecks] = await Promise.all([
        supabase.from('user_profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1000),
        supabase.from('events')
          .select('id, is_visible')
          .eq('is_visible', true)
          .limit(1000),
        supabase.from('system_health_checks')
          .select('status, service_name, checked_at')
          .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('checked_at', { ascending: false })
          .limit(100),
      ]);

      // Anomalia 1: Queda súbita de novos usuários
      const newUsers24h = usersResult.data?.length || 0;
      if (newUsers24h === 0) {
        anomalies.push('⚠️ Nenhum novo usuário nas últimas 24h - possível problema no cadastro');
      }

      // Anomalia 2: Serviços offline
      const offlineServices = healthChecks.data?.filter(h => h.status === 'offline').length || 0;
      if (offlineServices > 5) {
        anomalies.push(`⚠️ ${offlineServices} verificações de serviços offline nas últimas 24h`);
      }

      // Anomalia 3: Poucos eventos ativos
      const activeEvents = eventsResult.data?.length || 0;
      if (activeEvents < 5) {
        anomalies.push(`⚠️ Apenas ${activeEvents} eventos ativos - considere adicionar mais conteúdo`);
      }

      const result = {
        anomaliesFound: anomalies.length,
        anomalies,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ [AutonomousAgent] Detecção de anomalias concluída:', anomalies.length, 'anomalias encontradas');

      return {
        success: true,
        message: anomalies.length > 0 
          ? `${anomalias.length} anomalia(s) detectada(s)`
          : 'Nenhuma anomalia detectada',
        data: result,
      };
    } catch (error: any) {
      console.error('❌ [AutonomousAgent] Erro na detecção de anomalias:', error);
      return {
        success: false,
        message: 'Erro ao detectar anomalias',
        error: error.message,
      };
    }
  },

  /**
   * Sugere conteúdos baseado em tendências
   */
  async suggestContent(): Promise<TaskResult> {
    try {
      console.log('💡 [AutonomousAgent] Gerando sugestões de conteúdo...');
      
      // Buscar dados de eventos e destinos
      const [events, destinations] = await Promise.all([
        supabase.from('events')
          .select('name, description, city, start_date, end_date')
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('destinations')
          .select('name, city, description')
          .limit(20),
      ]);

      const eventsData = events.data || [];
      const destinationsData = destinations.data || [];

      // Analisar com IA
      const suggestionPrompt = `Analise os seguintes dados de turismo do Mato Grosso do Sul e sugira novos conteúdos:

EVENTOS RECENTES:
${eventsData.map(e => `- ${e.name} (${e.city}) - ${e.start_date} a ${e.end_date}`).join('\n')}

DESTINOS POPULARES:
${destinationsData.map(d => `- ${d.name} (${d.city})`).join('\n')}

Sugira:
1. 3 novos eventos que poderiam ser criados
2. 2 novos destinos que poderiam ser adicionados
3. 2 tipos de conteúdo que estão faltando
4. Recomendações de melhorias no conteúdo existente

Seja criativo e baseado nas tendências atuais de turismo.`;

      const aiSuggestions = await generateContent(suggestionPrompt);

      const result = {
        eventsAnalyzed: eventsData.length,
        destinationsAnalyzed: destinationsData.length,
        suggestions: aiSuggestions.ok ? aiSuggestions.text : 'Sugestões não disponíveis no momento',
        timestamp: new Date().toISOString(),
      };

      console.log('✅ [AutonomousAgent] Sugestões de conteúdo geradas');

      return {
        success: true,
        message: 'Sugestões de conteúdo geradas com sucesso',
        data: result,
      };
    } catch (error: any) {
      console.error('❌ [AutonomousAgent] Erro ao gerar sugestões:', error);
      return {
        success: false,
        message: 'Erro ao gerar sugestões de conteúdo',
        error: error.message,
      };
    }
  },

  /**
   * Analisa e sugere otimizações de SEO
   */
  async analyzeSEO(): Promise<TaskResult> {
    try {
      console.log('🔎 [AutonomousAgent] Analisando SEO...');
      
      // Buscar eventos e destinos para análise
      const [events, destinations] = await Promise.all([
        supabase.from('events')
          .select('name, description, slug')
          .eq('is_visible', true)
          .limit(10),
        supabase.from('destinations')
          .select('name, description, slug')
          .limit(10),
      ]);

      const eventsData = events.data || [];
      const destinationsData = destinations.data || [];

      // Analisar com IA
      const seoPrompt = `Analise o SEO dos seguintes conteúdos de turismo e sugira melhorias:

EVENTOS:
${eventsData.map(e => `- ${e.name}: ${e.description?.substring(0, 100)}... (slug: ${e.slug})`).join('\n')}

DESTINOS:
${destinationsData.map(d => `- ${d.name}: ${d.description?.substring(0, 100)}... (slug: ${d.slug})`).join('\n')}

Forneça:
1. Análise de palavras-chave faltantes
2. Sugestões de títulos otimizados
3. Melhorias nas descrições
4. Recomendações de meta tags
5. Priorização das melhorias

Foque em SEO para turismo no Mato Grosso do Sul.`;

      const aiAnalysis = await generateContent(seoPrompt);

      const result = {
        eventsAnalyzed: eventsData.length,
        destinationsAnalyzed: destinationsData.length,
        seoAnalysis: aiAnalysis.ok ? aiAnalysis.text : 'Análise não disponível no momento',
        timestamp: new Date().toISOString(),
      };

      console.log('✅ [AutonomousAgent] Análise de SEO concluída');

      return {
        success: true,
        message: 'Análise de SEO concluída com sucesso',
        data: result,
      };
    } catch (error: any) {
      console.error('❌ [AutonomousAgent] Erro na análise de SEO:', error);
      return {
        success: false,
        message: 'Erro ao analisar SEO',
        error: error.message,
      };
    }
  },

  /**
   * Limpa cache e dados temporários
   */
  async cleanupCache(): Promise<TaskResult> {
    try {
      console.log('🧹 [AutonomousAgent] Limpando cache...');
      
      // Limpar localStorage de caches antigos
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cache_') || key.startsWith('temp_'))) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              // Remover itens com mais de 7 dias
              if (parsed.timestamp && Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
                keysToRemove.push(key);
              }
            } catch {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      const result = {
        itemsRemoved: keysToRemove.length,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ [AutonomousAgent] Limpeza de cache concluída:', keysToRemove.length, 'itens removidos');

      return {
        success: true,
        message: `Limpeza concluída: ${keysToRemove.length} itens removidos`,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ [AutonomousAgent] Erro na limpeza:', error);
      return {
        success: false,
        message: 'Erro ao limpar cache',
        error: error.message,
      };
    }
  },
};

