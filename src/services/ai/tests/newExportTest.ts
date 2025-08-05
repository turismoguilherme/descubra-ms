/**
 * Teste de Exportações - Nova Versão
 */

import { guataInteligenteService, GuataQuery, GuataResponse } from '../guataInteligenteServiceNew';

console.log('🧪 TESTE DE EXPORTAÇÕES - NOVA VERSÃO');
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
  
  // Teste de processamento
  const result = await guataInteligenteService.processQuery(testQuery);
  console.log('✅ Processamento funcionando:', result);
  
  console.log('\n🎉 TODAS AS EXPORTAÇÕES ESTÃO FUNCIONANDO!');
  
} catch (error) {
  console.error('❌ Erro nas exportações:', error.message);
  console.error('Stack:', error.stack);
} 