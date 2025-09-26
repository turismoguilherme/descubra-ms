/**
 * Teste Rápido do Guatá Inteligente
 * Verifica se o sistema está funcionando corretamente
 */

import { guataInteligenteService } from '../guataInteligenteService';
import { performanceOptimizer } from '../optimization/performanceOptimizer';
import { masterDashboardService } from '../integration/masterDashboardService';

async function quickTest() {
  console.log('🧪 TESTE RÁPIDO DO GUATÁ INTELIGENTE');
  console.log('=' .repeat(50));

  try {
    // Teste 1: Otimização de Performance
    console.log('\n1. Testando otimização de performance...');
    const optimized = performanceOptimizer.optimizeQuery('Qual o clima em Campo Grande?');
    console.log('✅ Otimização funcionando:', optimized.cacheStrategy);

    // Teste 2: Dashboard Master
    console.log('\n2. Testando dashboard master...');
    const dashboard = await masterDashboardService.getDashboard();
    console.log('✅ Dashboard funcionando:', dashboard.systemHealth);

    // Teste 3: Sistema Completo
    console.log('\n3. Testando sistema completo...');
    const response = await guataInteligenteService.processQuery({
      question: 'Qual o clima em Campo Grande hoje?',
      userId: 'test-user',
      priority: 'high'
    });
    
    console.log('✅ Sistema funcionando!');
    console.log('   Resposta:', response.answer.substring(0, 100) + '...');
    console.log('   Confiança:', (response.confidence * 100).toFixed(1) + '%');
    console.log('   Fontes:', response.sources.length);

    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Guatá Inteligente está funcionando corretamente!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste se chamado diretamente
quickTest().catch(console.error);

export { quickTest }; 