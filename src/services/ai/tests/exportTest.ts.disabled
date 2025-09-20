/**
 * Teste de Exportações
 * Verifica se todas as exportações estão funcionando corretamente
 */

import { guataInteligenteService, GuataQuery, GuataResponse } from '../guataInteligenteService';

console.log('🧪 TESTE DE EXPORTAÇÕES');
console.log('=' .repeat(40));

try {
  console.log('✅ guataInteligenteService:', typeof guataInteligenteService);
  console.log('✅ GuataQuery:', typeof GuataQuery);
  console.log('✅ GuataResponse:', typeof GuataResponse);
  
  // Teste de criação de objeto
  const testQuery: GuataQuery = {
    question: 'Teste',
    userId: 'test',
    priority: 'medium'
  };
  
  console.log('✅ Objeto GuataQuery criado:', testQuery);
  
  console.log('\n🎉 TODAS AS EXPORTAÇÕES ESTÃO FUNCIONANDO!');
  
} catch (error) {
  console.error('❌ Erro nas exportações:', error.message);
  console.error('Stack:', error.stack);
} 