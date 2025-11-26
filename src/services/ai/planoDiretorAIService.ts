/**
 * Plano Diretor AI Service
 * Serviço de IA assistiva para sugestões e preenchimento automático
 */

import { StrategicAIService } from './StrategicAIService';
import { DiagnosticoData, Objetivo, Estrategia } from '../public/planoDiretorService';

export class PlanoDiretorAIService {
  private strategicAI: StrategicAIService;

  constructor() {
    this.strategicAI = StrategicAIService.getInstance();
  }

  /**
   * Gerar diagnóstico completo com IA
   */
  async generateDiagnostico(dados: any): Promise<DiagnosticoData> {
    try {
      const contexto = {
        region: dados.municipioUf || 'MS',
        userRole: 'secretary',
        businessType: 'tourism_public_sector',
        revenueData: dados.situacaoAtual ? [{
          receita: dados.situacaoAtual.receita || 0,
          visitantes: dados.situacaoAtual.visitantes || 0,
          periodo: 'anual'
        }] : [],
        marketData: dados.tendencias ? [{
          origem: dados.tendencias.origemPrincipal,
          sazonalidade: dados.tendencias.sazonalidade,
          satisfacao: dados.tendencias.satisfacao
        }] : []
      };

      const respostaIA = await this.strategicAI.analyzeBusinessData(contexto);

      return {
        situacaoAtual: {
          populacao: dados.situacaoAtual?.populacao || 0,
          visitantes: dados.situacaoAtual?.visitantes || dados.inventario?.total || 0,
          receita: dados.situacaoAtual?.receita || 0,
          atrativos: dados.inventario?.total || 0,
          infraestrutura: dados.cats?.total || 0,
          satisfacao: dados.situacaoAtual?.satisfacao || 4.0
        },
        analiseSWOT: {
          forcas: respostaIA.opportunities?.slice(0, 5) || this.getDefaultForcas(),
          fraquezas: respostaIA.risks?.slice(0, 5) || this.getDefaultFraquezas(),
          oportunidades: respostaIA.opportunities?.slice(0, 5) || [],
          ameacas: respostaIA.risks?.slice(0, 5) || []
        },
        desafiosEOportunidades: {
          desafios: respostaIA.risks?.slice(0, 3) || ['Melhorar infraestrutura turística', 'Aumentar divulgação'],
          oportunidades: respostaIA.opportunities?.slice(0, 3) || ['Crescimento do turismo regional', 'Novos segmentos de mercado']
        },
        gaps: {
          sinalizacao: dados.inventario?.total < 10,
          acessibilidade: dados.inventario?.total < 5,
          conectividade: dados.cats?.total < 2,
          seguranca: true,
          transporte: dados.cats?.total < 1,
          hospedagem: dados.inventario?.total < 3
        },
        benchmarks: {
          visitantesPorHabitante: dados.situacaoAtual?.populacao 
            ? (dados.situacaoAtual.visitantes / dados.situacaoAtual.populacao) 
            : 0,
          receitaPorVisitante: dados.situacaoAtual?.visitantes 
            ? (dados.situacaoAtual.receita / dados.situacaoAtual.visitantes) 
            : 0,
          satisfacaoMedia: dados.situacaoAtual?.satisfacao || 4.0,
          posicaoRegional: 0
        }
      };
    } catch (error) {
      console.error('Erro ao gerar diagnóstico com IA:', error);
      return this.getDefaultDiagnostico(dados);
    }
  }

  /**
   * Sugerir objetivos baseados em dados
   */
  async suggestObjetivos(diagnostico: DiagnosticoData, municipioNome: string): Promise<Objetivo[]> {
    try {
      const sugestoes: Objetivo[] = [];

      // Objetivo 1: Aumentar visitantes
      if (diagnostico.situacaoAtual.visitantes > 0) {
        const aumentoPercentual = 25; // Sugestão padrão
        const novaMeta = diagnostico.situacaoAtual.visitantes * (1 + aumentoPercentual / 100);
        
        sugestoes.push({
          id: '',
          titulo: `Aumentar número de visitantes em ${aumentoPercentual}%`,
          descricao: `Baseado nos dados atuais de ${diagnostico.situacaoAtual.visitantes.toLocaleString()} visitantes, aumentar para ${Math.round(novaMeta).toLocaleString()} visitantes até o final do período do plano.`,
          categoria: 'crescimento',
          meta: Math.round(novaMeta),
          unidade: 'visitantes/ano',
          prazo: new Date(Date.now() + 365 * 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejado',
          progresso: 0,
          indicadores: []
        });
      }

      // Objetivo 2: Diversificar atrativos
      if (diagnostico.situacaoAtual.atrativos < 20) {
        sugestoes.push({
          id: '',
          titulo: 'Diversificar oferta de atrativos turísticos',
          descricao: `Atualmente há ${diagnostico.situacaoAtual.atrativos} atrativos cadastrados. Objetivo é aumentar para pelo menos 30 atrativos diversificados.`,
          categoria: 'diversificacao',
          meta: 30,
          unidade: 'atrativos',
          prazo: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejado',
          progresso: 0,
          indicadores: []
        });
      }

      // Objetivo 3: Melhorar infraestrutura
      if (diagnostico.situacaoAtual.infraestrutura < 3) {
        sugestoes.push({
          id: '',
          titulo: 'Ampliar infraestrutura de atendimento ao turista',
          descricao: `Ampliar número de CATs de ${diagnostico.situacaoAtual.infraestrutura} para pelo menos 5 unidades estratégicas.`,
          categoria: 'infraestrutura',
          meta: 5,
          unidade: 'CATs',
          prazo: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejado',
          progresso: 0,
          indicadores: []
        });
      }

      // Objetivo 4: Melhorar satisfação
      if (diagnostico.situacaoAtual.satisfacao < 4.5) {
        sugestoes.push({
          id: '',
          titulo: 'Melhorar satisfação dos visitantes',
          descricao: `Aumentar índice de satisfação de ${diagnostico.situacaoAtual.satisfacao.toFixed(1)} para 4.8 estrelas através de melhorias na experiência do turista.`,
          categoria: 'sustentabilidade',
          meta: 4.8,
          unidade: 'estrelas',
          prazo: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejado',
          progresso: 0,
          indicadores: []
        });
      }

      return sugestoes;
    } catch (error) {
      console.error('Erro ao sugerir objetivos:', error);
      return [];
    }
  }

  /**
   * Sugerir estratégias para um objetivo
   */
  async suggestEstrategias(objetivo: Objetivo, diagnostico: DiagnosticoData): Promise<Estrategia[]> {
    try {
      const sugestoes: Estrategia[] = [];

      if (objetivo.categoria === 'crescimento') {
        sugestoes.push({
          id: '',
          titulo: 'Marketing digital e promoção',
          descricao: 'Investir em campanhas de marketing digital focadas nas redes sociais e plataformas de viagem para aumentar a visibilidade do destino.',
          objetivoId: objetivo.id,
          acoes: [],
          investimento: 50000,
          prazo: new Date(Date.now() + 365 * 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejada',
          roiEsperado: 300
        });

        sugestoes.push({
          id: '',
          titulo: 'Parcerias com agências de viagem',
          descricao: 'Estabelecer parcerias estratégicas com agências de viagem para incluir o destino em pacotes turísticos.',
          objetivoId: objetivo.id,
          acoes: [],
          investimento: 30000,
          prazo: new Date(Date.now() + 365 * 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejada',
          roiEsperado: 250
        });
      }

      if (objetivo.categoria === 'diversificacao') {
        sugestoes.push({
          id: '',
          titulo: 'Mapeamento de novos atrativos',
          descricao: 'Realizar mapeamento completo do território para identificar novos atrativos potenciais e incluí-los no inventário turístico.',
          objetivoId: objetivo.id,
          acoes: [],
          investimento: 40000,
          prazo: new Date(Date.now() + 365 * 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejada',
          roiEsperado: 200
        });
      }

      if (objetivo.categoria === 'infraestrutura') {
        sugestoes.push({
          id: '',
          titulo: 'Ampliação da rede de CATs',
          descricao: 'Instalar novos Centros de Atendimento ao Turista em pontos estratégicos da cidade.',
          objetivoId: objetivo.id,
          acoes: [],
          investimento: 200000,
          prazo: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsavel: 'Secretaria de Turismo',
          status: 'planejada',
          roiEsperado: 150
        });
      }

      return sugestoes;
    } catch (error) {
      console.error('Erro ao sugerir estratégias:', error);
      return [];
    }
  }

  /**
   * Validar objetivo SMART
   */
  async validateObjetivoSMART(objetivo: Objetivo): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Specific (Específico)
    if (!objetivo.titulo || objetivo.titulo.length < 10) {
      issues.push('Título muito genérico');
      suggestions.push('Seja mais específico sobre o que deseja alcançar');
    }

    // Measurable (Mensurável)
    if (!objetivo.meta || objetivo.meta <= 0) {
      issues.push('Meta não definida ou inválida');
      suggestions.push('Defina uma meta numérica clara');
    }

    // Achievable (Alcançável)
    if (objetivo.meta && objetivo.meta > 1000000) {
      issues.push('Meta pode ser muito ambiciosa');
      suggestions.push('Considere uma meta mais realista baseada nos dados atuais');
    }

    // Relevant (Relevante)
    if (!objetivo.categoria) {
      issues.push('Categoria não definida');
      suggestions.push('Defina uma categoria para melhor organização');
    }

    // Time-bound (Temporal)
    if (!objetivo.prazo) {
      issues.push('Prazo não definido');
      suggestions.push('Defina um prazo claro para alcançar a meta');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Preencher descrição automaticamente
   */
  async fillDescription(tipo: 'objetivo' | 'estrategia' | 'acao', contexto: any): Promise<string> {
    try {
      if (tipo === 'objetivo') {
        return `Objetivo estratégico para ${contexto.categoria || 'desenvolvimento turístico'}. Meta: ${contexto.meta || 'não definida'} ${contexto.unidade || ''}.`;
      }
      
      if (tipo === 'estrategia') {
        return `Estratégia para alcançar o objetivo relacionado. Investimento estimado: R$ ${(contexto.investimento || 0).toLocaleString()}.`;
      }

      if (tipo === 'acao') {
        return `Ação específica para implementar a estratégia. Prazo: ${contexto.prazo || 'não definido'}.`;
      }

      return '';
    } catch (error) {
      console.error('Erro ao preencher descrição:', error);
      return '';
    }
  }

  // Métodos auxiliares
  private getDefaultForcas(): string[] {
    return [
      'Localização estratégica',
      'Riqueza natural e cultural',
      'Potencial turístico identificado',
      'Comunidade engajada',
      'Infraestrutura básica existente'
    ];
  }

  private getDefaultFraquezas(): string[] {
    return [
      'Falta de divulgação',
      'Infraestrutura limitada',
      'Sazonalidade',
      'Dependência de um segmento',
      'Recursos limitados'
    ];
  }

  private getDefaultDiagnostico(dados: any): DiagnosticoData {
    return {
      situacaoAtual: {
        populacao: 0,
        visitantes: dados.inventario?.total || 0,
        receita: 0,
        atrativos: dados.inventario?.total || 0,
        infraestrutura: dados.cats?.total || 0,
        satisfacao: 4.0
      },
      analiseSWOT: {
        forcas: this.getDefaultForcas(),
        fraquezas: this.getDefaultFraquezas(),
        oportunidades: [],
        ameacas: []
      },
      desafiosEOportunidades: {
        desafios: ['Melhorar infraestrutura turística', 'Aumentar divulgação'],
        oportunidades: ['Crescimento do turismo regional', 'Novos segmentos de mercado']
      },
      gaps: {
        sinalizacao: true,
        acessibilidade: true,
        conectividade: true,
        seguranca: true,
        transporte: true,
        hospedagem: true
      },
      benchmarks: {
        visitantesPorHabitante: 0,
        receitaPorVisitante: 0,
        satisfacaoMedia: 4.0,
        posicaoRegional: 0
      }
    };
  }
}

