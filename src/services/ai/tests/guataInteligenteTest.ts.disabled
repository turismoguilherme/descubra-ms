// Testes e exemplos do Guatá Inteligente
// Demonstra o funcionamento completo do sistema

import { guataInteligenteService } from '../guataInteligenteService';

// Exemplos de uso do Guatá Inteligente
export class GuataInteligenteTest {
  
  // Teste básico de funcionamento
  static async testeBasico() {
    console.log('🧪 === TESTE BÁSICO DO GUATÁ INTELIGENTE ===\n');
    
    const perguntas = [
      'Qual o horário do Bioparque?',
      'Onde ficar em Campo Grande?',
      'Restaurantes em Bonito',
      'Como está o tempo hoje?',
      'O que fazer no Pantanal?'
    ];

    for (const pergunta of perguntas) {
      console.log(`❓ Pergunta: "${pergunta}"`);
      
      const response = await guataInteligenteService.testQuery(pergunta);
      
      console.log(`🧠 Resposta (${response.confidence}% confiança):`);
      console.log(`   ${response.message}`);
      
      if (response.hasPartners) {
        console.log(`🤝 Parceiros: ${response.partnerRecommendations.join(', ')}`);
      }
      
      if (response.generalRecommendations.length > 0) {
        console.log(`💡 Recomendações: ${response.generalRecommendations.slice(0, 2).join(', ')}`);
      }
      
      console.log(`📊 Metadados:`);
      console.log(`   - Verificado: ${response.metadata.verified ? 'Sim' : 'Não'}`);
      console.log(`   - Fontes: ${response.metadata.sources.join(', ')}`);
      console.log(`   - Tempo: ${response.metadata.processingTime}ms`);
      console.log('');
    }
  }

  // Teste de categorização automática
  static async testeCategorização() {
    console.log('🧪 === TESTE DE CATEGORIZAÇÃO AUTOMÁTICA ===\n');
    
    const perguntasComCategoria = [
      { pergunta: 'Preciso de um hotel bom em Campo Grande', categoriaEsperada: 'hotel' },
      { pergunta: 'Onde comer peixe pintado?', categoriaEsperada: 'restaurant' },
      { pergunta: 'Visitar a Gruta do Lago Azul', categoriaEsperada: 'attraction' },
      { pergunta: 'Como chegar no aeroporto?', categoriaEsperada: 'transport' },
      { pergunta: 'Vai chover amanhã?', categoriaEsperada: 'climate' }
    ];

    for (const teste of perguntasComCategoria) {
      console.log(`❓ Pergunta: "${teste.pergunta}"`);
      console.log(`🎯 Categoria esperada: ${teste.categoriaEsperada}`);
      
      const response = await guataInteligenteService.testQuery(teste.pergunta);
      
      console.log(`🧠 Resposta: ${response.message.substring(0, 100)}...`);
      console.log(`✅ Sistema funcionou: ${response.helpful ? 'Sim' : 'Não'}`);
      console.log('');
    }
  }

  // Teste de adição de parceiro
  static async testeParceiros() {
    console.log('🧪 === TESTE DE SISTEMA DE PARCEIROS ===\n');
    
    // Simular adição de parceiro
    const novoParceiro = {
      id: 'hotel-exemplo-001',
      name: 'Hotel Exemplo Pantanal',
      type: 'hotel' as const,
      location: 'Campo Grande',
      verified: true,
      lastUpdated: new Date(),
      source: 'manual' as const,
      priority: 1
    };

    console.log('🤝 Adicionando parceiro:', novoParceiro.name);
    
    try {
      await guataInteligenteService.addPartner(novoParceiro, {
        title: 'Hotel Exemplo Pantanal',
        description: 'Hotel parceiro com ofertas especiais para usuários da plataforma',
        details: {
          features: ['Desconto de 15%', 'Café da manhã incluso', 'Wi-Fi gratuito']
        }
      });
      
      console.log('✅ Parceiro adicionado com sucesso!');
      
      // Testar consulta com parceiro
      console.log('\n🧪 Testando consulta com parceiro:');
      const response = await guataInteligenteService.testQuery('Hotéis em Campo Grande');
      
      console.log(`🧠 Resposta: ${response.message}`);
      console.log(`🤝 Tem parceiros: ${response.hasPartners ? 'Sim' : 'Não'}`);
      
      if (response.hasPartners) {
        console.log(`🎯 Parceiros recomendados: ${response.partnerRecommendations.join(', ')}`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao adicionar parceiro:', error);
    }
    
    console.log('');
  }

  // Teste de verificação tripla
  static async testeVerificacao() {
    console.log('🧪 === TESTE DE VERIFICAÇÃO TRIPLA ===\n');
    
    const response = await guataInteligenteService.testQuery('Horário do Bioparque Pantanal');
    
    console.log(`❓ Pergunta: "Horário do Bioparque Pantanal"`);
    console.log(`🛡️ Resultado da Verificação Tripla:`);
    console.log(`   - Confiança: ${response.confidence}%`);
    console.log(`   - Verificado: ${response.metadata.verified ? 'Sim' : 'Não'}`);
    console.log(`   - Fontes consultadas: ${response.metadata.sources.length}`);
    console.log(`   - Fontes: ${response.metadata.sources.join(', ')}`);
    console.log(`   - Última atualização: ${response.metadata.lastUpdated}`);
    console.log(`\n🧠 Resposta: ${response.message}`);
    console.log('');
  }

  // Teste de estatísticas do sistema
  static async testeEstatisticas() {
    console.log('🧪 === ESTATÍSTICAS DO SISTEMA ===\n');
    
    const stats = await guataInteligenteService.getStats();
    
    console.log(`📊 Estatísticas Gerais:`);
    console.log(`   - Total de consultas: ${stats.totalQueries}`);
    console.log(`   - Confiança média: ${stats.avgConfidence}%`);
    console.log(`   - Satisfação média: ${stats.avgSatisfaction}/5`);
    console.log(`   - Taxa de verificação: ${stats.verificationRate}%`);
    console.log(`   - Parceiros ativos: ${stats.partnerUsage}`);
    console.log(`   - Gaps de conhecimento: ${stats.knowledgeGaps}`);
    console.log(`   - Fontes ativas: ${stats.sourceCount}`);
    console.log(`   - Última atualização: ${stats.lastUpdate}`);
    console.log('');
  }

  // Teste de saúde do sistema
  static async testeSaude() {
    console.log('🧪 === TESTE DE SAÚDE DO SISTEMA ===\n');
    
    const health = await guataInteligenteService.healthCheck();
    
    console.log(`🏥 Status do Sistema: ${health.status.toUpperCase()}`);
    console.log(`📋 Componentes:`);
    console.log(`   - Base de Conhecimento: ${health.components.knowledgeBase ? '✅ OK' : '❌ FALHA'}`);
    console.log(`   - Sistema de Verificação: ${health.components.verification ? '✅ OK' : '❌ FALHA'}`);
    console.log(`   - Machine Learning: ${health.components.learning ? '✅ OK' : '❌ FALHA'}`);
    console.log(`   - Última verificação: ${health.lastUpdate}`);
    console.log('');
  }

  // Executar todos os testes
  static async executarTodosTestes() {
    console.log('🚀 ===============================================');
    console.log('🚀   TESTE COMPLETO DO GUATÁ INTELIGENTE');
    console.log('🚀 ===============================================\n');
    
    try {
      await this.testeSaude();
      await this.testeBasico();
      await this.testeCategorização();
      await this.testeVerificacao();
      await this.testeParceiros();
      await this.testeEstatisticas();
      
      console.log('🎉 ===============================================');
      console.log('🎉   TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
      console.log('🎉 ===============================================');
      
    } catch (error) {
      console.error('❌ Erro durante os testes:', error);
    }
  }
}

// Função para executar testes durante desenvolvimento
export async function testarGuataInteligente() {
  await GuataInteligenteTest.executarTodosTestes();
}

// Exemplos de uso simples
export const exemplosUso = {
  // Uso básico
  async exemploBasico() {
    const response = await guataInteligenteService.testQuery('Restaurantes em Campo Grande');
    console.log('Resposta:', response.message);
  },

  // Uso com parâmetros completos
  async exemploCompleto() {
    const response = await guataInteligenteService.processQuery({
      message: 'Hotéis próximos ao aeroporto',
      category: 'hotel',
      location: 'Campo Grande',
      sessionId: 'user-session-123',
      userId: 'user-456'
    });
    
    console.log('Resposta completa:', response);
  },

  // Registro de feedback
  async exemploFeedback() {
    // Primeiro fazer uma consulta
    const response = await guataInteligenteService.testQuery('Bioparque horários');
    
    // Depois registrar feedback
    await guataInteligenteService.registerFeedback('interaction-id', {
      rating: 5,
      helpful: true,
      comment: 'Resposta muito útil!'
    });
  }
};

export default GuataInteligenteTest;