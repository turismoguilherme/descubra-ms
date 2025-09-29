/**
 * Teste da Fase 2: APIs + Scraping
 * Testa a integração das APIs gratuitas e web scraping seletivo
 */

import { freeAPIsService } from '../apis/freeAPIsService';
import { selectiveScrapingService } from '../scraping/selectiveScrapingService';
import { guataInteligenteService } from '../guataInteligenteService';

async function testPhase2() {
  console.log('🧪 TESTANDO FASE 2: APIs + SCRAPING');
  console.log('=====================================\n');

  // Teste 1: APIs Gratuitas
  console.log('1️⃣ Testando APIs Gratuitas...');
  
  try {
    // Teste Wikipedia
    const wikiResult = await freeAPIsService.getWikipediaInfo('Mato Grosso do Sul');
    console.log('📚 Wikipedia:', wikiResult.success ? '✅ Funcionando' : '❌ Erro');
    if (wikiResult.success) {
      console.log('   - Título:', wikiResult.data?.title);
      console.log('   - Extract:', wikiResult.data?.extract?.substring(0, 100) + '...');
    }

    // Teste IBGE
    const ibgeResult = await freeAPIsService.getIBGEData();
    console.log('📊 IBGE:', ibgeResult.success ? '✅ Funcionando' : '❌ Erro');
    if (ibgeResult.success) {
      console.log('   - População:', ibgeResult.data?.population?.toLocaleString());
      console.log('   - Região:', ibgeResult.data?.region);
    }

    // Teste Clima
    const weatherResult = await freeAPIsService.getWeatherData('Campo Grande');
    console.log('🌤️ Clima:', weatherResult.success ? '✅ Funcionando' : '❌ Erro');
    if (weatherResult.success) {
      console.log('   - Temperatura:', weatherResult.data?.temperature + '°C');
      console.log('   - Condição:', weatherResult.data?.condition);
    }

    // Teste DuckDuckGo
    const ddgResult = await freeAPIsService.getDuckDuckGoInfo('Bonito MS');
    console.log('🔍 DuckDuckGo:', ddgResult.success ? '✅ Funcionando' : '❌ Erro');
    if (ddgResult.success) {
      console.log('   - Título:', ddgResult.data?.title);
      console.log('   - Abstract:', ddgResult.data?.abstract?.substring(0, 100) + '...');
    }

    // Teste múltiplas APIs
    const multiResult = await freeAPIsService.getMultiSourceInfo('Pantanal');
    console.log('🔄 Múltiplas APIs:', multiResult.errors.length === 0 ? '✅ Funcionando' : '⚠️ Com erros');
    console.log('   - Erros:', multiResult.errors.length);
    console.log('   - Fontes disponíveis:', Object.keys(multiResult).filter(k => k !== 'errors').length);

  } catch (error) {
    console.error('❌ Erro nos testes de APIs:', error);
  }

  console.log('\n2️⃣ Testando Web Scraping...');
  
  try {
    // Teste scraping individual
    const bioparqueResult = await selectiveScrapingService.scrapeSite('bioparque', 'horário');
    console.log('🏛️ Bioparque:', bioparqueResult.success ? '✅ Funcionando' : '❌ Erro');
    if (bioparqueResult.success && bioparqueResult.data) {
      console.log('   - Dados encontrados:', bioparqueResult.data.length);
      console.log('   - Primeiro resultado:', bioparqueResult.data[0]?.title);
    }

    // Teste múltiplos sites
    const multiScraping = await selectiveScrapingService.scrapeMultipleSites('turismo');
    console.log('🌐 Múltiplos Sites:', multiScraping.results.length > 0 ? '✅ Funcionando' : '❌ Erro');
    console.log('   - Sites processados:', multiScraping.totalSources);
    console.log('   - Resultados:', multiScraping.results.length);
    console.log('   - Erros:', multiScraping.errors.length);

    // Teste com prioridade
    const priorityScraping = await selectiveScrapingService.scrapeWithPriority('Bonito');
    console.log('⭐ Scraping com Prioridade:', priorityScraping.length > 0 ? '✅ Funcionando' : '❌ Erro');
    console.log('   - Resultados ordenados:', priorityScraping.length);
    if (priorityScraping.length > 0) {
      console.log('   - Maior confiança:', Math.round(priorityScraping[0].confidence * 100) + '%');
    }

    // Estatísticas
    const stats = selectiveScrapingService.getStats();
    console.log('📊 Estatísticas de Scraping:');
    console.log('   - Sites configurados:', stats.totalSites);
    console.log('   - Entradas em cache:', stats.cachedEntries);
    console.log('   - Última atualização:', stats.lastUpdate.toLocaleString());

  } catch (error) {
    console.error('❌ Erro nos testes de scraping:', error);
  }

  console.log('\n3️⃣ Testando Integração Completa...');
  
  try {
    // Teste do Guatá Inteligente com dados externos
    const smartQuery = await guataInteligenteService.testQuery('Qual o clima em Campo Grande hoje?');
    console.log('🧠 Guatá Inteligente:', smartQuery.confidence > 0 ? '✅ Funcionando' : '❌ Erro');
    console.log('   - Confiança:', smartQuery.confidence + '%');
    console.log('   - Fontes:', smartQuery.metadata.sources.length);
    console.log('   - Tempo de processamento:', smartQuery.metadata.processingTime + 'ms');
    console.log('   - Resposta:', smartQuery.message.substring(0, 150) + '...');

    // Health check completo
    const health = await guataInteligenteService.healthCheck();
    console.log('🏥 Health Check:');
    console.log('   - Status geral:', health.status);
    console.log('   - APIs:', health.components.apis ? '✅' : '❌');
    console.log('   - Scraping:', health.components.scraping ? '✅' : '❌');
    console.log('   - Base de conhecimento:', health.components.knowledgeBase ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Erro no teste de integração:', error);
  }

  console.log('\n4️⃣ Testando Performance...');
  
  try {
    const startTime = Date.now();
    
    // Teste de performance com múltiplas consultas
    const queries = [
      'Clima em Campo Grande',
      'Bioparque horário',
      'Bonito atrações',
      'Pantanal turismo'
    ];

    const results = await Promise.allSettled(
      queries.map(query => guataInteligenteService.testQuery(query))
    );

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / queries.length;

    console.log('⚡ Performance:');
    console.log('   - Tempo total:', totalTime + 'ms');
    console.log('   - Tempo médio por consulta:', Math.round(avgTime) + 'ms');
    console.log('   - Consultas bem-sucedidas:', results.filter(r => r.status === 'fulfilled').length);
    console.log('   - Taxa de sucesso:', Math.round((results.filter(r => r.status === 'fulfilled').length / queries.length) * 100) + '%');

  } catch (error) {
    console.error('❌ Erro no teste de performance:', error);
  }

  console.log('\n✅ TESTE DA FASE 2 CONCLUÍDO!');
  console.log('=====================================');
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testPhase2().catch(console.error);
}

export { testPhase2 }; 