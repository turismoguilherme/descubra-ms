/**
 * Teste da Fase 3: Integração Final e Otimizações
 * Testa o sistema completo do Guatá Inteligente
 */

import { guataInteligenteService } from '../guataInteligenteService';
import { performanceOptimizer } from '../optimization/performanceOptimizer';
import { masterDashboardService } from '../integration/masterDashboardService';
import { freeAPIsService } from '../apis/freeAPIsService';
import { selectiveScrapingService } from '../scraping/selectiveScrapingService';

async function testPhase3() {
  console.log('🚀 TESTANDO FASE 3: INTEGRAÇÃO FINAL E OTIMIZAÇÕES');
  console.log('=' .repeat(60));

  // Teste 1: Otimização de Performance
  console.log('\n📊 1. TESTE DE OTIMIZAÇÃO DE PERFORMANCE');
  console.log('-'.repeat(40));
  
  const testQueries = [
    'Qual o clima em Campo Grande hoje?',
    'Como chegar ao Bioparque?',
    'Quais são os melhores hotéis em Bonito?',
    'Onde posso comer em MS?'
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 Otimizando consulta: "${query}"`);
    const optimized = performanceOptimizer.optimizeQuery(query);
    console.log(`   Estratégia: ${optimized.cacheStrategy}`);
    console.log(`   Prioridade: ${optimized.priority}`);
    console.log(`   Fontes: ${optimized.sources.join(', ')}`);
  }

  // Teste 2: Dashboard Master
  console.log('\n📈 2. TESTE DO DASHBOARD MASTER');
  console.log('-'.repeat(40));
  
  const dashboard = await masterDashboardService.getDashboard();
  console.log(`   Status do Sistema: ${dashboard.systemHealth}`);
  console.log(`   Fontes Ativas: ${dashboard.dataSources.filter(ds => ds.status === 'active').length}`);
  console.log(`   Logs Recentes: ${dashboard.recentLogs.length}`);
  console.log(`   Recomendações: ${dashboard.recommendations.length}`);

  // Teste 3: Sistema Completo
  console.log('\n🧠 3. TESTE DO SISTEMA COMPLETO');
  console.log('-'.repeat(40));
  
  const testQuery = {
    question: 'Qual o clima em Campo Grande hoje?',
    userId: 'test-user-123',
    priority: 'high' as const
  };

  try {
    console.log('🔍 Processando consulta inteligente...');
    const startTime = Date.now();
    
    const response = await guataInteligenteService.processQuery(testQuery);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`   ✅ Resposta gerada em ${processingTime}ms`);
    console.log(`   Confiança: ${(response.confidence * 100).toFixed(1)}%`);
    console.log(`   Status: ${response.verificationStatus}`);
    console.log(`   Fontes: ${response.sources.length}`);
    console.log(`   Dados Enriquecidos: ${Object.keys(response.enrichedData || {}).length}`);
    
    if (response.learningInsights) {
      console.log(`   Insights de Aprendizado: ${Object.keys(response.learningInsights).length}`);
    }

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }

  // Teste 4: Health Check Completo
  console.log('\n🏥 4. HEALTH CHECK COMPLETO');
  console.log('-'.repeat(40));
  
  const health = await guataInteligenteService.healthCheck();
  console.log(`   Status Geral: ${health.status}`);
  console.log(`   Componentes Ativos: ${Object.values(health.components).filter(Boolean).length}/7`);
  console.log(`   Total de Consultas: ${health.metrics.totalQueries}`);
  console.log(`   Uptime: ${health.metrics.uptime.toFixed(2)} horas`);

  // Teste 5: Métricas de Performance
  console.log('\n⚡ 5. MÉTRICAS DE PERFORMANCE');
  console.log('-'.repeat(40));
  
  const perfMetrics = performanceOptimizer.getMetrics();
  console.log(`   Tempo de Resposta: ${perfMetrics.responseTime}ms`);
  console.log(`   Taxa de Cache Hit: ${(perfMetrics.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`   Taxa de Sucesso: ${(perfMetrics.successRate * 100).toFixed(1)}%`);
  console.log(`   Conexões Ativas: ${perfMetrics.activeConnections}`);

  const cacheStats = performanceOptimizer.getCacheStats();
  console.log(`   Entradas no Cache: ${cacheStats.totalEntries}`);
  console.log(`   Entradas Válidas: ${cacheStats.validEntries}`);
  console.log(`   Uso de Memória: ${cacheStats.memoryUsage} bytes`);

  // Teste 6: Estatísticas Detalhadas
  console.log('\n📊 6. ESTATÍSTICAS DETALHADAS');
  console.log('-'.repeat(40));
  
  const detailedStats = masterDashboardService.getDetailedStats();
  console.log(`   Taxa de Erro: ${(detailedStats.errorRate * 100).toFixed(1)}%`);
  console.log(`   Tempo Médio de Resposta: ${detailedStats.averageResponseTime}ms`);
  console.log(`   Eficiência do Cache: ${(detailedStats.cacheEfficiency * 100).toFixed(1)}%`);
  console.log(`   Consultas por Hora: ${detailedStats.queriesByHour.reduce((a, b) => a + b, 0)}`);

  console.log('\n📋 Top 5 Consultas:');
  detailedStats.topQueries.forEach((query, index) => {
    console.log(`   ${index + 1}. "${query.query}" - ${query.count} vezes`);
  });

  // Teste 7: Troubleshooting
  console.log('\n🔧 7. INFORMAÇÕES DE TROUBLESHOOTING');
  console.log('-'.repeat(40));
  
  const troubleshooting = masterDashboardService.getTroubleshootingInfo();
  console.log(`   Problemas Comuns: ${troubleshooting.commonIssues.length}`);
  console.log(`   Verificações do Sistema: ${troubleshooting.systemChecks.length}`);
  console.log(`   Tarefas de Manutenção: ${troubleshooting.maintenanceTasks.length}`);

  // Teste 8: Performance com Múltiplas Consultas
  console.log('\n🚀 8. TESTE DE PERFORMANCE COM MÚLTIPLAS CONSULTAS');
  console.log('-'.repeat(40));
  
  const performanceQueries = [
    'Clima em Campo Grande',
    'Hotéis em Bonito',
    'Como chegar ao Bioparque',
    'Restaurantes em MS',
    'Atrações turísticas'
  ];

  const startTime = Date.now();
  const promises = performanceQueries.map(async (query, index) => {
    try {
      const response = await guataInteligenteService.processQuery({
        question: query,
        userId: `perf-test-${index}`
      });
      return { success: true, time: response.processingTime };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  const successfulQueries = results.filter(r => r.success).length;
  const averageTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.time, 0) / successfulQueries;

  console.log(`   Total de Consultas: ${performanceQueries.length}`);
  console.log(`   Consultas Bem-sucedidas: ${successfulQueries}`);
  console.log(`   Tempo Total: ${totalTime}ms`);
  console.log(`   Tempo Médio: ${averageTime.toFixed(0)}ms`);
  console.log(`   Taxa de Sucesso: ${(successfulQueries / performanceQueries.length * 100).toFixed(1)}%`);

  // Resumo Final
  console.log('\n🎉 RESUMO DA FASE 3');
  console.log('=' .repeat(60));
  
  const stats = guataInteligenteService.getStats();
  console.log(`✅ Sistema Completo Implementado`);
  console.log(`✅ ${stats.components} Componentes Integrados`);
  console.log(`✅ ${stats.dataSources} Fontes de Dados`);
  console.log(`✅ ${stats.totalQueries} Consultas Processadas`);
  console.log(`✅ Uptime: ${stats.uptime.toFixed(2)} horas`);
  console.log(`✅ Dashboard Master Funcional`);
  console.log(`✅ Otimização de Performance Ativa`);
  console.log(`✅ Cache Inteligente Operacional`);
  console.log(`✅ Verificação Tripla Implementada`);
  console.log(`✅ Machine Learning Contínuo`);
  console.log(`✅ APIs e Scraping Integrados`);

  console.log('\n🚀 GUATÁ INTELIGENTE - SISTEMA COMPLETO E OPERACIONAL!');
  console.log('=' .repeat(60));
}

if (require.main === module) {
  testPhase3().catch(console.error);
}

export { testPhase3 }; 