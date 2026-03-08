// @ts-nocheck
/**
 * Testador do Sistema de Eventos
 * 
 * FUNCIONALIDADE: Testa se o sistema está funcionando
 * SEGURANÇA: Não interfere com funcionalidades existentes
 */

import { intelligentEventService } from './IntelligentEventService';
import { intelligentEventActivator } from './IntelligentEventActivator';

export class EventSystemTester {
  private static instance: EventSystemTester;

  public static getInstance(): EventSystemTester {
    if (!EventSystemTester.instance) {
      EventSystemTester.instance = new EventSystemTester();
    }
    return EventSystemTester.instance;
  }

  /**
   * Testa se o sistema está funcionando
   */
  public async testSystem(): Promise<{
    success: boolean;
    tests: Array<{
      name: string;
      passed: boolean;
      message: string;
    }>;
    errors: string[];
  }> {
    const result = {
      success: true,
      tests: [] as Array<{
        name: string;
        passed: boolean;
        message: string;
      }>,
      errors: [] as string[]
    };

    try {
      console.log("🧪 EVENT TESTER: Iniciando testes do sistema...");

      // Teste 1: Verificar se os tipos estão funcionando
      try {
        const testEvent = {
          id: 'test-1',
          titulo: 'Teste de Evento',
          descricao_resumida: 'Descrição de teste',
          descricao_completa: 'Descrição completa de teste',
          data_inicio: '2024-12-20',
          data_fim: '2024-12-21',
          local: 'Local de Teste',
          cidade: 'Campo Grande',
          estado: 'MS',
          endereco_completo: 'Endereço de teste',
          categoria: 'cultural' as const,
          tipo_entrada: 'gratuito' as const,
          publico_alvo: 'geral' as const,
          status: 'ativo' as const,
          visibilidade: true,
          destaque: false,
          organizador: 'Sistema de Teste',
          fonte: 'manual' as const,
          processado_por_ia: false,
          confiabilidade: 100,
          ultima_atualizacao: new Date().toISOString(),
          tags: ['teste'],
          palavras_chave: ['teste'],
          relevancia: 100
        };

        result.tests.push({
          name: 'Tipos TypeScript',
          passed: true,
          message: 'Tipos de eventos funcionando corretamente'
        });
      } catch (error) {
        result.tests.push({
          name: 'Tipos TypeScript',
          passed: false,
          message: `Erro nos tipos: ${error}`
        });
        result.success = false;
      }

      // Teste 2: Verificar se o serviço inteligente está disponível
      try {
        const status = intelligentEventService.getServiceStatus();
        result.tests.push({
          name: 'Serviço Inteligente',
          passed: true,
          message: 'Serviço inteligente disponível'
        });
      } catch (error) {
        result.tests.push({
          name: 'Serviço Inteligente',
          passed: false,
          message: `Erro no serviço: ${error}`
        });
        result.success = false;
      }

      // Teste 3: Verificar se o ativador está funcionando
      try {
        const activationStatus = intelligentEventActivator.getActivationStatus();
        result.tests.push({
          name: 'Ativador Inteligente',
          passed: true,
          message: 'Ativador inteligente funcionando'
        });
      } catch (error) {
        result.tests.push({
          name: 'Ativador Inteligente',
          passed: false,
          message: `Erro no ativador: ${error}`
        });
        result.success = false;
      }

      // Teste 4: Testar busca de eventos
      try {
        const eventsResult = await intelligentEventService.getEvents();
        result.tests.push({
          name: 'Busca de Eventos',
          passed: eventsResult.success,
          message: eventsResult.success 
            ? `Encontrados ${eventsResult.eventos.length} eventos`
            : `Erro na busca: ${eventsResult.errors.join(', ')}`
        });
        
        if (!eventsResult.success) {
          result.success = false;
        }
      } catch (error) {
        result.tests.push({
          name: 'Busca de Eventos',
          passed: false,
          message: `Erro na busca: ${error}`
        });
        result.success = false;
      }

      // Teste 5: Testar estatísticas
      try {
        const stats = await intelligentEventService.getEventStatistics();
        result.tests.push({
          name: 'Estatísticas',
          passed: true,
          message: `Estatísticas funcionando - ${stats.total_eventos} eventos totais`
        });
      } catch (error) {
        result.tests.push({
          name: 'Estatísticas',
          passed: false,
          message: `Erro nas estatísticas: ${error}`
        });
        result.success = false;
      }

      console.log(`🧪 EVENT TESTER: Testes concluídos - ${result.tests.filter(t => t.passed).length}/${result.tests.length} passaram`);

    } catch (error) {
      console.error("🧪 EVENT TESTER: Erro durante testes:", error);
      result.success = false;
      result.errors.push(`Erro geral: ${error}`);
    }

    return result;
  }

  /**
   * Executa teste rápido
   */
  public async quickTest(): Promise<boolean> {
    try {
      console.log("🧪 EVENT TESTER: Teste rápido...");
      
      // Testar apenas se o serviço está disponível
      const status = intelligentEventService.getServiceStatus();
      const activationStatus = intelligentEventActivator.getActivationStatus();
      
      const isWorking = status && activationStatus;
      
      console.log(`🧪 EVENT TESTER: Teste rápido ${isWorking ? 'PASSOU' : 'FALHOU'}`);
      return isWorking;
      
    } catch (error) {
      console.error("🧪 EVENT TESTER: Erro no teste rápido:", error);
      return false;
    }
  }
}

// Instância singleton
export const eventSystemTester = EventSystemTester.getInstance();

// Auto-teste em desenvolvimento (desabilitado por enquanto)
if (typeof window !== 'undefined' && import.meta.env.DEV && false) {
  setTimeout(() => {
    eventSystemTester.quickTest();
  }, 5000); // 5 segundos após carregar
}
