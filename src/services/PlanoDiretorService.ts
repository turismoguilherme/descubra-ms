import { StrategicAIService } from './ai/StrategicAIService';

// Interfaces para o Plano Diretor
export interface DiagnosticoData {
  situacaoAtual: {
    populacao: number;
    visitantes: number;
    receita: number;
    atrativos: number;
    infraestrutura: number;
    satisfacao: number;
  };
  analiseSWOT: {
    forcas: string[];
    fraquezas: string[];
    oportunidades: string[];
    ameacas: string[];
  };
  gaps: {
    sinalizacao: boolean;
    acessibilidade: boolean;
    conectividade: boolean;
    seguranca: boolean;
    transporte: boolean;
    hospedagem: boolean;
  };
  benchmarks: {
    visitantesPorHabitante: number;
    receitaPorVisitante: number;
    satisfacaoMedia: number;
    posicaoRegional: number;
  };
}

export interface Objetivo {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'crescimento' | 'diversificacao' | 'infraestrutura' | 'sustentabilidade';
  meta: number;
  unidade: string;
  prazo: string;
  responsavel: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'atrasado';
  progresso: number;
  indicadores: Indicador[];
}

export interface Estrategia {
  id: string;
  titulo: string;
  descricao: string;
  objetivoId: string;
  acoes: Acao[];
  investimento: number;
  prazo: string;
  responsavel: string;
  status: 'planejada' | 'em_execucao' | 'concluida' | 'suspensa';
  roiEsperado: number;
}

export interface Acao {
  id: string;
  titulo: string;
  descricao: string;
  estrategiaId: string;
  investimento: number;
  prazo: string;
  responsavel: string;
  status: 'planejada' | 'em_execucao' | 'concluida' | 'atrasada';
  progresso: number;
  dependencias: string[];
}

export interface Indicador {
  id: string;
  nome: string;
  descricao: string;
  valorAtual: number;
  meta: number;
  unidade: string;
  frequencia: 'diaria' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
  fonte: string;
  ultimaAtualizacao: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  organizacao: string;
  permissoes: ('visualizar' | 'editar' | 'aprovar')[];
  ativo: boolean;
}

export interface Documento {
  id: string;
  titulo: string;
  tipo: 'estudo' | 'relatorio' | 'apresentacao' | 'lei' | 'decreto' | 'outro';
  arquivo: string;
  tamanho: number;
  dataUpload: string;
  uploader: string;
  versao: string;
  status: 'rascunho' | 'revisao' | 'aprovado' | 'arquivado';
}

export interface HistoricoVersao {
  id: string;
  versao: string;
  data: string;
  autor: string;
  alteracoes: string[];
  comentarios: string;
}

export interface PlanoDiretorDocument {
  id: string;
  titulo: string;
  versao: string;
  status: 'rascunho' | 'revisao' | 'aprovado' | 'implementacao' | 'concluido';
  municipio: string;
  periodo: string;
  objetivos: Objetivo[];
  estrategias: Estrategia[];
  acoes: Acao[];
  indicadores: Indicador[];
  colaboradores: Colaborador[];
  documentos: Documento[];
  historico: HistoricoVersao[];
  dataCriacao: string;
  dataAtualizacao: string;
  criador: string;
}

export interface KPIPlanoDiretor {
  visitantes: {
    atual: number;
    meta: number;
    percentual: number;
    tendencia: 'crescendo' | 'estavel' | 'decaindo';
  };
  receita: {
    atual: number;
    meta: number;
    percentual: number;
    tendencia: 'crescendo' | 'estavel' | 'decaindo';
  };
  satisfacao: {
    atual: number;
    meta: number;
    percentual: number;
    tendencia: 'crescendo' | 'estavel' | 'decaindo';
  };
  investimentos: {
    realizado: number;
    planejado: number;
    percentual: number;
    tendencia: 'crescendo' | 'estavel' | 'decaindo';
  };
  acoes: {
    concluidas: number;
    total: number;
    percentual: number;
    tendencia: 'crescendo' | 'estavel' | 'decaindo';
  };
}

export class PlanoDiretorService {
  private strategicAI: StrategicAIService;

  constructor() {
    this.strategicAI = new StrategicAIService();
  }

  // Coletar dados de todas as abas existentes
  async coletarDadosParaPlanoDiretor(): Promise<any> {
    try {
      console.log('🔍 Coletando dados para Plano Diretor...');
      
      // Simular coleta de dados das abas existentes
      const dadosGerais = await this.getDadosVisaoGeral();
      const atrativos = await this.getInventarioTuristico();
      const cats = await this.getDadosCATs();
      const eventos = await this.getDadosEventos();
      const heatmap = await this.getDadosHeatmap();
      const analytics = await this.getDadosAnalytics();

      return {
        situacaoAtual: this.processarDadosGerais(dadosGerais),
        atrativos: this.processarInventario(atrativos),
        infraestrutura: this.processarCATs(cats),
        eventos: this.processarEventos(eventos),
        fluxoTuristico: this.processarHeatmap(heatmap),
        tendencias: this.processarAnalytics(analytics),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao coletar dados:', error);
      throw error;
    }
  }

  // Gerar diagnóstico com IA
  async gerarDiagnosticoIA(dados: any): Promise<DiagnosticoData> {
    try {
      console.log('🤖 Gerando diagnóstico com IA...');
      
      const contexto = {
        region: dados.regiao || 'MS',
        userRole: 'secretary',
        businessType: 'tourism_public_sector',
        revenueData: dados.situacaoAtual ? [{
          receita: dados.situacaoAtual.receita,
          visitantes: dados.situacaoAtual.visitantes,
          periodo: 'anual'
        }] : [],
        marketData: dados.tendencias ? [{
          origem: dados.tendencias.origemPrincipal,
          sazonalidade: dados.tendencias.sazonalidade,
          satisfacao: dados.tendencias.satisfacao
        }] : [],
        alumiaData: dados.alumiaData,
        heatmapData: dados.fluxoTuristico
      };

      const respostaIA = await this.strategicAI.analyzeBusinessData(contexto);
      
      return this.processarDiagnosticoIA(respostaIA, dados);
    } catch (error) {
      console.error('❌ Erro ao gerar diagnóstico IA:', error);
      // Fallback para dados mock
      return this.gerarDiagnosticoMock(dados);
    }
  }

  // Criar novo plano diretor
  async criarPlanoDiretor(dados: DiagnosticoData, titulo: string, municipio: string): Promise<PlanoDiretorDocument> {
    try {
      console.log('📋 Criando novo Plano Diretor...');
      
      const plano: PlanoDiretorDocument = {
        id: `plano_${Date.now()}`,
        titulo,
        versao: '1.0',
        status: 'rascunho',
        municipio,
        periodo: '2024-2028',
        objetivos: await this.gerarObjetivosInteligentes(dados),
        estrategias: [],
        acoes: [],
        indicadores: await this.gerarIndicadoresBase(dados),
        colaboradores: [],
        documentos: [],
        historico: [{
          id: `hist_${Date.now()}`,
          versao: '1.0',
          data: new Date().toISOString(),
          autor: 'Sistema',
          alteracoes: ['Plano criado automaticamente'],
          comentarios: 'Plano diretor criado com base no diagnóstico automatizado'
        }],
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
        criador: 'Sistema'
      };

      return plano;
    } catch (error) {
      console.error('❌ Erro ao criar plano diretor:', error);
      throw error;
    }
  }

  // Gerar KPIs de acompanhamento
  async gerarKPIs(planoId: string): Promise<KPIPlanoDiretor> {
    try {
      console.log('📊 Gerando KPIs de acompanhamento...');
      
      // Simular dados de KPIs baseados no plano
      return {
        visitantes: {
          atual: 1250000,
          meta: 1562500,
          percentual: 80,
          tendencia: 'crescendo'
        },
        receita: {
          atual: 120000000,
          meta: 150000000,
          percentual: 80,
          tendencia: 'crescendo'
        },
        satisfacao: {
          atual: 4.6,
          meta: 4.8,
          percentual: 96,
          tendencia: 'crescendo'
        },
        investimentos: {
          realizado: 45000000,
          planejado: 60000000,
          percentual: 75,
          tendencia: 'crescendo'
        },
        acoes: {
          concluidas: 12,
          total: 20,
          percentual: 60,
          tendencia: 'crescendo'
        }
      };
    } catch (error) {
      console.error('❌ Erro ao gerar KPIs:', error);
      throw error;
    }
  }

  // FUNCIONALIDADES COLABORATIVAS

  // Adicionar colaborador ao plano
  async adicionarColaborador(planoId: string, colaborador: Omit<Colaborador, 'id'>): Promise<Colaborador> {
    try {
      console.log('👥 Adicionando colaborador ao plano...');
      
      const novoColaborador: Colaborador = {
        id: `colab_${Date.now()}`,
        ...colaborador,
        ativo: true
      };

      // Aqui seria implementada a lógica para salvar no banco de dados
      console.log('✅ Colaborador adicionado:', novoColaborador);
      return novoColaborador;
    } catch (error) {
      console.error('❌ Erro ao adicionar colaborador:', error);
      throw error;
    }
  }

  // Atualizar colaborador
  async atualizarColaborador(planoId: string, colaboradorId: string, dados: Partial<Colaborador>): Promise<Colaborador> {
    try {
      console.log('👥 Atualizando colaborador...');
      
      // Aqui seria implementada a lógica para atualizar no banco de dados
      const colaboradorAtualizado: Colaborador = {
        id: colaboradorId,
        nome: dados.nome || 'Nome não informado',
        email: dados.email || 'email@exemplo.com',
        cargo: dados.cargo || 'Cargo não informado',
        organizacao: dados.organizacao || 'Organização não informada',
        permissoes: dados.permissoes || ['visualizar'],
        ativo: dados.ativo !== undefined ? dados.ativo : true
      };

      console.log('✅ Colaborador atualizado:', colaboradorAtualizado);
      return colaboradorAtualizado;
    } catch (error) {
      console.error('❌ Erro ao atualizar colaborador:', error);
      throw error;
    }
  }

  // Remover colaborador
  async removerColaborador(planoId: string, colaboradorId: string): Promise<boolean> {
    try {
      console.log('👥 Removendo colaborador...');
      
      // Aqui seria implementada a lógica para remover do banco de dados
      console.log('✅ Colaborador removido');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover colaborador:', error);
      throw error;
    }
  }

  // Upload de documento
  async uploadDocumento(planoId: string, arquivo: File, tipo: Documento['tipo']): Promise<Documento> {
    try {
      console.log('📄 Fazendo upload de documento...');
      
      const documento: Documento = {
        id: `doc_${Date.now()}`,
        titulo: arquivo.name,
        tipo,
        arquivo: URL.createObjectURL(arquivo),
        tamanho: arquivo.size,
        dataUpload: new Date().toISOString(),
        uploader: 'Usuário Atual', // Seria obtido do contexto de autenticação
        versao: '1.0',
        status: 'rascunho'
      };

      console.log('✅ Documento enviado:', documento);
      return documento;
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      throw error;
    }
  }

  // Criar nova versão do plano
  async criarNovaVersao(planoId: string, alteracoes: string[], comentarios: string, autor: string): Promise<HistoricoVersao> {
    try {
      console.log('📝 Criando nova versão do plano...');
      
      const novaVersao: HistoricoVersao = {
        id: `hist_${Date.now()}`,
        versao: this.calcularProximaVersao(),
        data: new Date().toISOString(),
        autor,
        alteracoes,
        comentarios
      };

      console.log('✅ Nova versão criada:', novaVersao);
      return novaVersao;
    } catch (error) {
      console.error('❌ Erro ao criar nova versão:', error);
      throw error;
    }
  }

  // Aprovar versão do plano
  async aprovarVersao(planoId: string, versao: string, aprovador: string): Promise<boolean> {
    try {
      console.log('✅ Aprovando versão do plano...');
      
      // Aqui seria implementada a lógica para aprovar no banco de dados
      console.log(`✅ Versão ${versao} aprovada por ${aprovador}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao aprovar versão:', error);
      throw error;
    }
  }

  // Rejeitar versão do plano
  async rejeitarVersao(planoId: string, versao: string, rejeitador: string, motivo: string): Promise<boolean> {
    try {
      console.log('❌ Rejeitando versão do plano...');
      
      // Aqui seria implementada a lógica para rejeitar no banco de dados
      console.log(`❌ Versão ${versao} rejeitada por ${rejeitador}. Motivo: ${motivo}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao rejeitar versão:', error);
      throw error;
    }
  }

  // Obter histórico de versões
  async obterHistoricoVersoes(planoId: string): Promise<HistoricoVersao[]> {
    try {
      console.log('📚 Obtendo histórico de versões...');
      
      // Simular histórico de versões
      const historico: HistoricoVersao[] = [
        {
          id: 'hist_1',
          versao: '1.0',
          data: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          autor: 'Sistema',
          alteracoes: ['Plano criado automaticamente'],
          comentarios: 'Plano diretor criado com base no diagnóstico automatizado'
        },
        {
          id: 'hist_2',
          versao: '1.1',
          data: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
          autor: 'Secretário de Turismo',
          alteracoes: ['Adicionado objetivo de sustentabilidade', 'Atualizada meta de visitantes'],
          comentarios: 'Revisão inicial com ajustes nos objetivos'
        }
      ];

      console.log('✅ Histórico obtido:', historico);
      return historico;
    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error);
      throw error;
    }
  }

  // Obter colaboradores do plano
  async obterColaboradores(planoId: string): Promise<Colaborador[]> {
    try {
      console.log('👥 Obtendo colaboradores do plano...');
      
      // Simular lista de colaboradores
      const colaboradores: Colaborador[] = [
        {
          id: 'colab_1',
          nome: 'João Silva',
          email: 'joao@prefeitura.gov.br',
          cargo: 'Secretário de Turismo',
          organizacao: 'Prefeitura Municipal',
          permissoes: ['visualizar', 'editar', 'aprovar'],
          ativo: true
        },
        {
          id: 'colab_2',
          nome: 'Maria Santos',
          email: 'maria@turismo.gov.br',
          cargo: 'Coordenadora de Projetos',
          organizacao: 'Secretaria de Turismo',
          permissoes: ['visualizar', 'editar'],
          ativo: true
        },
        {
          id: 'colab_3',
          nome: 'Pedro Costa',
          email: 'pedro@conselho.gov.br',
          cargo: 'Conselheiro',
          organizacao: 'Conselho Municipal de Turismo',
          permissoes: ['visualizar'],
          ativo: true
        }
      ];

      console.log('✅ Colaboradores obtidos:', colaboradores);
      return colaboradores;
    } catch (error) {
      console.error('❌ Erro ao obter colaboradores:', error);
      throw error;
    }
  }

  // Obter documentos do plano
  async obterDocumentos(planoId: string): Promise<Documento[]> {
    try {
      console.log('📄 Obtendo documentos do plano...');
      
      // Simular lista de documentos
      const documentos: Documento[] = [
        {
          id: 'doc_1',
          titulo: 'Estudo de Viabilidade - Bonito 2024',
          tipo: 'estudo',
          arquivo: '/documentos/estudo-viabilidade-bonito.pdf',
          tamanho: 2048576, // 2MB
          dataUpload: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          uploader: 'João Silva',
          versao: '1.0',
          status: 'aprovado'
        },
        {
          id: 'doc_2',
          titulo: 'Apresentação - Plano Diretor',
          tipo: 'apresentacao',
          arquivo: '/documentos/apresentacao-plano-diretor.pptx',
          tamanho: 5120000, // 5MB
          dataUpload: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          uploader: 'Maria Santos',
          versao: '2.1',
          status: 'revisao'
        },
        {
          id: 'doc_3',
          titulo: 'Lei Municipal de Turismo',
          tipo: 'lei',
          arquivo: '/documentos/lei-municipal-turismo.pdf',
          tamanho: 1024000, // 1MB
          dataUpload: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
          uploader: 'Pedro Costa',
          versao: '1.0',
          status: 'aprovado'
        }
      ];

      console.log('✅ Documentos obtidos:', documentos);
      return documentos;
    } catch (error) {
      console.error('❌ Erro ao obter documentos:', error);
      throw error;
    }
  }

  // Enviar notificação para colaboradores
  async enviarNotificacao(planoId: string, tipo: 'nova_versao' | 'aprovacao' | 'rejeicao' | 'comentario', destinatarios: string[], mensagem: string): Promise<boolean> {
    try {
      console.log('📧 Enviando notificação...');
      
      // Aqui seria implementada a lógica para enviar notificações
      // Por exemplo: email, push notification, etc.
      console.log(`📧 Notificação enviada para ${destinatarios.length} colaboradores: ${mensagem}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      throw error;
    }
  }

  // Calcular próxima versão
  private calcularProximaVersao(): string {
    // Lógica simplificada para calcular próxima versão
    // Em um sistema real, isso seria baseado no histórico de versões
    return '1.2';
  }

  // FUNCIONALIDADES DE MONITORAMENTO E RELATÓRIOS

  // Obter alertas e notificações
  async obterAlertas(planoId: string): Promise<any[]> {
    try {
      console.log('🚨 Obtendo alertas do plano...');
      
      // Simular alertas baseados em KPIs
      const alertas = [
        {
          id: 'alert_1',
          tipo: 'warning',
          titulo: 'Meta de Visitantes em Risco',
          descricao: 'A meta de visitantes está 20% abaixo do esperado para este período',
          data: new Date().toISOString(),
          prioridade: 'alta',
          acao: 'Revisar estratégias de marketing'
        },
        {
          id: 'alert_2',
          tipo: 'info',
          titulo: 'Nova Versão Disponível',
          descricao: 'Versão 1.2 do Plano Diretor está pronta para revisão',
          data: new Date(Date.now() - 3600000).toISOString(),
          prioridade: 'media',
          acao: 'Revisar e aprovar versão'
        },
        {
          id: 'alert_3',
          tipo: 'success',
          titulo: 'Objetivo Concluído',
          descricao: 'Objetivo "Melhorar Sinalização" foi concluído com sucesso',
          data: new Date(Date.now() - 86400000).toISOString(),
          prioridade: 'baixa',
          acao: 'Celebrar conquista'
        }
      ];

      console.log('✅ Alertas obtidos:', alertas);
      return alertas;
    } catch (error) {
      console.error('❌ Erro ao obter alertas:', error);
      throw error;
    }
  }

  // Gerar relatório executivo
  async gerarRelatorioExecutivo(planoId: string): Promise<any> {
    try {
      console.log('📊 Gerando relatório executivo...');
      
      const relatorio = {
        id: `rel_exec_${Date.now()}`,
        tipo: 'executivo',
        titulo: 'Relatório Executivo - Plano Diretor de Turismo',
        periodo: '2024',
        dataGeracao: new Date().toISOString(),
        resumo: {
          situacaoAtual: 'O município apresenta potencial turístico significativo com 1.250.000 visitantes anuais',
          principaisConquistas: [
            'Aumento de 15% no número de visitantes',
            'Melhoria na satisfação dos turistas para 4.6 estrelas',
            'Implementação de 3 novos atrativos'
          ],
          desafios: [
            'Sazonalidade extrema (variação de 60%)',
            'Dependência de um segmento turístico',
            'Necessidade de diversificação'
          ],
          recomendacoes: [
            'Investir em marketing anti-sazonal',
            'Desenvolver turismo gastronômico',
            'Melhorar infraestrutura de sinalização'
          ]
        },
        metricas: {
          visitantes: { atual: 1250000, meta: 1562500, percentual: 80 },
          receita: { atual: 120000000, meta: 150000000, percentual: 80 },
          satisfacao: { atual: 4.6, meta: 4.8, percentual: 96 },
          investimentos: { realizado: 45000000, planejado: 60000000, percentual: 75 }
        },
        proximosPassos: [
          'Aprovar orçamento para 2025',
          'Implementar campanha de marketing',
          'Iniciar obras de sinalização'
        ]
      };

      console.log('✅ Relatório executivo gerado:', relatorio);
      return relatorio;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório executivo:', error);
      throw error;
    }
  }

  // Gerar relatório técnico
  async gerarRelatorioTecnico(planoId: string): Promise<any> {
    try {
      console.log('📋 Gerando relatório técnico...');
      
      const relatorio = {
        id: `rel_tec_${Date.now()}`,
        tipo: 'tecnico',
        titulo: 'Relatório Técnico - Análise Detalhada do Plano Diretor',
        periodo: '2024',
        dataGeracao: new Date().toISOString(),
        analiseDetalhada: {
          metodologia: 'Análise baseada em dados coletados de todas as abas da plataforma ViaJAR',
          fontesDados: [
            'Sistema de controle de visitantes',
            'Pesquisas de satisfação',
            'Dados de receita municipal',
            'Inventário turístico',
            'Mapas de calor'
          ],
          resultados: {
            crescimento: '15% de crescimento anual',
            sazonalidade: 'Variação de 60% entre pico e baixa temporada',
            satisfacao: '4.6 estrelas (meta: 4.8)',
            infraestrutura: '85% adequada (meta: 95%)'
          }
        },
        analiseSWOT: {
          forcas: [
            'Natureza única e preservada',
            'Marca consolidada no ecoturismo',
            'Alta satisfação dos turistas'
          ],
          fraquezas: [
            'Sazonalidade extrema',
            'Dependência de um segmento',
            'Infraestrutura abaixo do ideal'
          ],
          oportunidades: [
            'Crescimento do turismo gastronômico',
            'Mercado de São Paulo consolidado',
            'Potencial para turismo internacional'
          ],
          ameacas: [
            'Concorrência de outras cidades',
            'Mudanças climáticas',
            'Custos crescentes'
          ]
        },
        recomendacoesTecnicas: [
          'Implementar sistema de monitoramento contínuo',
          'Desenvolver indicadores de performance específicos',
          'Criar protocolos de gestão de crise',
          'Estabelecer parcerias estratégicas'
        ]
      };

      console.log('✅ Relatório técnico gerado:', relatorio);
      return relatorio;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório técnico:', error);
      throw error;
    }
  }

  // Gerar apresentação para prefeito
  async gerarApresentacao(planoId: string): Promise<any> {
    try {
      console.log('🎯 Gerando apresentação para prefeito...');
      
      const apresentacao = {
        id: `apres_${Date.now()}`,
        tipo: 'apresentacao',
        titulo: 'Apresentação - Plano Diretor de Turismo 2024-2028',
        dataGeracao: new Date().toISOString(),
        slides: [
          {
            numero: 1,
            titulo: 'Situação Atual do Turismo',
            conteudo: {
              visitantes: '1.250.000 visitantes/ano',
              receita: 'R$ 120 milhões/ano',
              satisfacao: '4.6 estrelas',
              posicao: '3ª posição regional'
            }
          },
          {
            numero: 2,
            titulo: 'Principais Conquistas',
            conteudo: [
              'Aumento de 15% no número de visitantes',
              'Melhoria na satisfação dos turistas',
              'Implementação de novos atrativos',
              'Consolidação da marca turística'
            ]
          },
          {
            numero: 3,
            titulo: 'Desafios Identificados',
            conteudo: [
              'Sazonalidade extrema (60% de variação)',
              'Dependência de um segmento turístico',
              'Necessidade de diversificação',
              'Infraestrutura abaixo do ideal'
            ]
          },
          {
            numero: 4,
            titulo: 'Objetivos Estratégicos',
            conteudo: [
              'Aumentar visitantes em 25% (1.562.500)',
              'Reduzir sazonalidade para 30%',
              'Melhorar infraestrutura para 95%',
              'Aumentar satisfação para 4.8 estrelas'
            ]
          },
          {
            numero: 5,
            titulo: 'Investimentos Necessários',
            conteudo: {
              total: 'R$ 60 milhões',
              distribuicao: [
                'Marketing: R$ 25 milhões',
                'Infraestrutura: R$ 20 milhões',
                'Eventos: R$ 10 milhões',
                'Capacitação: R$ 5 milhões'
              ]
            }
          },
          {
            numero: 6,
            titulo: 'ROI Esperado',
            conteudo: {
              investimento: 'R$ 60 milhões',
              retorno: 'R$ 150 milhões',
              roi: '150% em 5 anos',
              payback: '3.2 anos'
            }
          }
        ]
      };

      console.log('✅ Apresentação gerada:', apresentacao);
      return apresentacao;
    } catch (error) {
      console.error('❌ Erro ao gerar apresentação:', error);
      throw error;
    }
  }

  // Obter tendências e projeções
  async obterTendencias(planoId: string): Promise<any> {
    try {
      console.log('📈 Obtendo tendências e projeções...');
      
      const tendencias = {
        visitantes: {
          historico: [1000000, 1100000, 1200000, 1250000],
          projecao: [1300000, 1400000, 1500000, 1562500],
          tendencia: 'crescendo',
          crescimento: 15
        },
        receita: {
          historico: [100000000, 110000000, 115000000, 120000000],
          projecao: [130000000, 140000000, 145000000, 150000000],
          tendencia: 'crescendo',
          crescimento: 12
        },
        satisfacao: {
          historico: [4.2, 4.4, 4.5, 4.6],
          projecao: [4.7, 4.8, 4.8, 4.8],
          tendencia: 'crescendo',
          crescimento: 4
        },
        sazonalidade: {
          atual: 60,
          meta: 30,
          reducao: 50,
          tendencia: 'melhorando'
        }
      };

      console.log('✅ Tendências obtidas:', tendencias);
      return tendencias;
    } catch (error) {
      console.error('❌ Erro ao obter tendências:', error);
      throw error;
    }
  }

  // Exportar dados para Excel
  async exportarParaExcel(planoId: string, tipo: 'kpis' | 'objetivos' | 'colaboradores'): Promise<Blob> {
    try {
      console.log(`📊 Exportando dados para Excel (${tipo})...`);
      
      // Simular geração de arquivo Excel
      const dados = {
        tipo,
        data: new Date().toISOString(),
        conteudo: `Dados exportados para ${tipo}`
      };
      
      const blob = new Blob([JSON.stringify(dados, null, 2)], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('✅ Dados exportados para Excel');
      return blob;
    } catch (error) {
      console.error('❌ Erro ao exportar para Excel:', error);
      throw error;
    }
  }

  // Exportar dados para PDF
  async exportarParaPDF(planoId: string, tipo: 'relatorio' | 'apresentacao'): Promise<Blob> {
    try {
      console.log(`📄 Exportando dados para PDF (${tipo})...`);
      
      // Simular geração de arquivo PDF
      const dados = {
        tipo,
        data: new Date().toISOString(),
        conteudo: `Relatório PDF gerado para ${tipo}`
      };
      
      const blob = new Blob([JSON.stringify(dados, null, 2)], { 
        type: 'application/pdf' 
      });
      
      console.log('✅ Dados exportados para PDF');
      return blob;
    } catch (error) {
      console.error('❌ Erro ao exportar para PDF:', error);
      throw error;
    }
  }

  // SISTEMA DE GESTÃO DE USUÁRIOS

  // Criar usuário colaborador
  async criarUsuarioColaborador(dados: {
    nome: string;
    email: string;
    cargo: string;
    tipo: 'colaborador_plano_diretor' | 'atendente_cat';
    gestorId: string;
    secretariaId: string;
  }): Promise<any> {
    try {
      console.log('👤 Criando usuário colaborador...');
      
      // Gerar senha temporária
      const senhaTemporaria = this.gerarSenhaTemporaria();
      
      const usuario = {
        id: `user_${Date.now()}`,
        nome: dados.nome,
        email: dados.email,
        cargo: dados.cargo,
        tipo: dados.tipo,
        senha: senhaTemporaria,
        status: 'senha_temporaria',
        criado_por: dados.gestorId,
        secretaria_id: dados.secretariaId,
        data_criacao: new Date().toISOString(),
        ultimo_acesso: null,
        permissoes: this.definirPermissoes(dados.tipo)
      };

      // Enviar email com credenciais
      await this.enviarEmailCredenciais(usuario);
      
      console.log('✅ Usuário colaborador criado:', usuario);
      return usuario;
    } catch (error) {
      console.error('❌ Erro ao criar usuário colaborador:', error);
      throw error;
    }
  }

  // Obter usuários da secretaria
  async obterUsuariosSecretaria(secretariaId: string): Promise<any[]> {
    try {
      console.log('👥 Obtendo usuários da secretaria...');
      
      // Simular dados de usuários
      const usuarios = [
        {
          id: 'user_1',
          nome: 'João Silva',
          email: 'prefeito@cidade.com',
          cargo: 'Prefeito',
          tipo: 'colaborador_plano_diretor',
          status: 'ativo',
          data_criacao: '2024-01-15',
          ultimo_acesso: '2024-01-20'
        },
        {
          id: 'user_2',
          nome: 'Maria Santos',
          email: 'maria@cidade.com',
          cargo: 'Secretária de Turismo',
          tipo: 'colaborador_plano_diretor',
          status: 'senha_temporaria',
          data_criacao: '2024-01-18',
          ultimo_acesso: null
        },
        {
          id: 'user_3',
          nome: 'Ana Silva',
          email: 'ana@cidade.com',
          cargo: 'Atendente CAT',
          tipo: 'atendente_cat',
          status: 'ativo',
          data_criacao: '2024-01-10',
          ultimo_acesso: '2024-01-19'
        }
      ];

      console.log('✅ Usuários obtidos:', usuarios);
      return usuarios;
    } catch (error) {
      console.error('❌ Erro ao obter usuários:', error);
      throw error;
    }
  }

  // Reenviar senha temporária
  async reenviarSenhaTemporaria(usuarioId: string): Promise<void> {
    try {
      console.log('📧 Reenviando senha temporária...');
      
      // Gerar nova senha temporária
      const novaSenha = this.gerarSenhaTemporaria();
      
      // Simular atualização no banco
      console.log(`✅ Nova senha temporária gerada para usuário ${usuarioId}: ${novaSenha}`);
      
      // Enviar email com nova senha
      await this.enviarEmailCredenciais({
        id: usuarioId,
        senha: novaSenha
      });
      
    } catch (error) {
      console.error('❌ Erro ao reenviar senha:', error);
      throw error;
    }
  }

  // Remover usuário
  async removerUsuario(usuarioId: string): Promise<void> {
    try {
      console.log('🗑️ Removendo usuário...');
      
      // Simular remoção
      console.log(`✅ Usuário ${usuarioId} removido com sucesso`);
      
    } catch (error) {
      console.error('❌ Erro ao remover usuário:', error);
      throw error;
    }
  }

  // Atualizar permissões do usuário
  async atualizarPermissoes(usuarioId: string, permissoes: string[]): Promise<void> {
    try {
      console.log('🔐 Atualizando permissões do usuário...');
      
      // Simular atualização
      console.log(`✅ Permissões atualizadas para usuário ${usuarioId}:`, permissoes);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar permissões:', error);
      throw error;
    }
  }

  // MÉTODOS AUXILIARES

  // Gerar senha temporária
  private gerarSenhaTemporaria(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  }

  // Definir permissões baseadas no tipo
  private definirPermissoes(tipo: string): string[] {
    const permissoes = {
      'colaborador_plano_diretor': [
        'visualizar_plano_diretor',
        'editar_objetivos',
        'editar_estrategias',
        'comentar',
        'aprovar_versoes'
      ],
      'atendente_cat': [
        'visualizar_dashboard_cat',
        'usar_ia_conversacional',
        'gerar_relatorios',
        'controle_ponto'
      ]
    };
    
    return permissoes[tipo] || [];
  }

  // Enviar email com credenciais
  private async enviarEmailCredenciais(usuario: any): Promise<void> {
    try {
      console.log('📧 Enviando email com credenciais...');
      
      // Simular envio de email
      const emailData = {
        to: usuario.email,
        subject: 'Acesso à ViaJAR - Redefina sua senha',
        template: 'primeiro_login',
        data: {
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
          tipo: usuario.tipo
        }
      };
      
      console.log('✅ Email enviado:', emailData);
      
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  }

  // Métodos auxiliares para coleta de dados
  private async getDadosVisaoGeral(): Promise<any> {
    // Simular dados da aba "Visão Geral"
    return {
      cats: 12,
      turistas: 1247,
      atrativos: 45,
      eventos: 8
    };
  }

  private async getInventarioTuristico(): Promise<any> {
    // Simular dados da aba "Inventário Turístico"
    return [
      { nome: 'Gruta do Lago Azul', visitantes: 1250, satisfacao: 4.8 },
      { nome: 'Buraco das Araras', visitantes: 890, satisfacao: 4.6 },
      { nome: 'Aquário Natural', visitantes: 2100, satisfacao: 4.7 },
      { nome: 'Museu de Bonito', visitantes: 340, satisfacao: 4.4 }
    ];
  }

  private async getDadosCATs(): Promise<any> {
    // Simular dados da aba "Gestão de CATs"
    return [
      { nome: 'CAT Centro', turistas: 156, satisfacao: 4.8 },
      { nome: 'CAT Aeroporto', turistas: 89, satisfacao: 4.6 },
      { nome: 'CAT Rodoviária', turistas: 67, satisfacao: 4.4 },
      { nome: 'CAT Shopping', turistas: 45, satisfacao: 4.2 }
    ];
  }

  private async getDadosEventos(): Promise<any> {
    // Simular dados da aba "Gestão de Eventos"
    return [
      { nome: 'Festival de Inverno', participantes: 500, status: 'realizado' },
      { nome: 'Feira de Artesanato', participantes: 200, status: 'realizado' },
      { nome: 'Festival Gastronômico', participantes: 0, status: 'planejado' },
      { nome: 'Semana do Turismo', participantes: 0, status: 'planejado' }
    ];
  }

  private async getDadosHeatmap(): Promise<any> {
    // Simular dados da aba "Mapas de Calor"
    return {
      pontos: [
        { local: 'Gruta do Lago Azul', intensidade: 'alta', cor: 'vermelho' },
        { local: 'Buraco das Araras', intensidade: 'baixa', cor: 'verde' },
        { local: 'CAT Shopping', intensidade: 'baixa', cor: 'verde' }
      ]
    };
  }

  private async getDadosAnalytics(): Promise<any> {
    // Simular dados da aba "Analytics"
    return {
      origem: { 'São Paulo': 60, 'Rio de Janeiro': 20, 'Outros': 20 },
      sazonalidade: { julho: 40, fevereiro: -20 },
      satisfacao: 4.6
    };
  }

  // Processadores de dados
  private processarDadosGerais(dados: any): any {
    return {
      populacao: 22000,
      visitantes: dados.turistas * 365,
      receita: dados.turistas * 365 * 100,
      atrativos: dados.atrativos,
      infraestrutura: 85
    };
  }

  private processarInventario(atrativos: any[]): any {
    return {
      total: atrativos.length,
      visitantesTotal: atrativos.reduce((sum, a) => sum + a.visitantes, 0),
      satisfacaoMedia: atrativos.reduce((sum, a) => sum + a.satisfacao, 0) / atrativos.length
    };
  }

  private processarCATs(cats: any[]): any {
    return {
      total: cats.length,
      turistasTotal: cats.reduce((sum, c) => sum + c.turistas, 0),
      satisfacaoMedia: cats.reduce((sum, c) => sum + c.satisfacao, 0) / cats.length
    };
  }

  private processarEventos(eventos: any[]): any {
    return {
      total: eventos.length,
      realizados: eventos.filter(e => e.status === 'realizado').length,
      planejados: eventos.filter(e => e.status === 'planejado').length
    };
  }

  private processarHeatmap(heatmap: any): any {
    return {
      pontosAltaIntensidade: heatmap.pontos.filter(p => p.intensidade === 'alta').length,
      pontosBaixaIntensidade: heatmap.pontos.filter(p => p.intensidade === 'baixa').length
    };
  }

  private processarAnalytics(analytics: any): any {
    return {
      origemPrincipal: Object.keys(analytics.origem)[0],
      sazonalidade: analytics.sazonalidade,
      satisfacao: analytics.satisfacao
    };
  }

  // Processar diagnóstico com IA
  private processarDiagnosticoIA(respostaIA: any, dados: any): DiagnosticoData {
    // Extrair insights da IA para SWOT
    const forcas = this.extrairForcas(respostaIA, dados);
    const fraquezas = this.extrairFraquezas(respostaIA, dados);
    const oportunidades = this.extrairOportunidades(respostaIA, dados);
    const ameacas = this.extrairAmeacas(respostaIA, dados);
    
    // Calcular benchmarks baseados em dados reais
    const benchmarks = this.calcularBenchmarks(dados);
    
    // Identificar gaps automaticamente
    const gaps = this.identificarGaps(dados);

    return {
      situacaoAtual: {
        populacao: dados.situacaoAtual?.populacao || 22000,
        visitantes: dados.situacaoAtual?.visitantes || 0,
        receita: dados.situacaoAtual?.receita || 0,
        atrativos: dados.situacaoAtual?.atrativos || 0,
        infraestrutura: dados.situacaoAtual?.infraestrutura || 0,
        satisfacao: dados.tendencias?.satisfacao || 4.6
      },
      analiseSWOT: {
        forcas,
        fraquezas,
        oportunidades,
        ameacas
      },
      gaps,
      benchmarks
    };
  }

  // Extrair forças da análise da IA
  private extrairForcas(respostaIA: any, dados: any): string[] {
    const forcas = [
      'Natureza única e preservada',
      'Marca consolidada no ecoturismo'
    ];

    // Adicionar forças baseadas na IA
    if (respostaIA.insights) {
      respostaIA.insights.forEach((insight: string) => {
        if (insight.toLowerCase().includes('forte') || 
            insight.toLowerCase().includes('destaque') ||
            insight.toLowerCase().includes('vantagem')) {
          forcas.push(insight);
        }
      });
    }

    // Adicionar forças baseadas nos dados
    if (dados.situacaoAtual?.satisfacao >= 4.5) {
      forcas.push(`Alta satisfação dos turistas (${dados.situacaoAtual.satisfacao} estrelas)`);
    }
    if (dados.situacaoAtual?.infraestrutura >= 80) {
      forcas.push(`Infraestrutura adequada (${dados.situacaoAtual.infraestrutura}%)`);
    }
    if (dados.atrativos?.satisfacaoMedia >= 4.5) {
      forcas.push('Atrativos com alta qualidade');
    }

    return forcas.slice(0, 6); // Limitar a 6 forças
  }

  // Extrair fraquezas da análise da IA
  private extrairFraquezas(respostaIA: any, dados: any): string[] {
    const fraquezas = [];

    // Adicionar fraquezas baseadas na IA
    if (respostaIA.risks) {
      respostaIA.risks.forEach((risk: string) => {
        fraquezas.push(risk);
      });
    }

    // Adicionar fraquezas baseadas nos dados
    if (dados.tendencias?.sazonalidade) {
      const variacao = Math.abs(dados.tendencias.sazonalidade.julho || 0);
      if (variacao > 30) {
        fraquezas.push(`Sazonalidade extrema (variação de ${variacao}%)`);
      }
    }

    if (dados.infraestrutura?.pontosBaixaIntensidade > dados.infraestrutura?.pontosAltaIntensidade) {
      fraquezas.push('Distribuição desigual de fluxo turístico');
    }

    if (dados.situacaoAtual?.infraestrutura < 70) {
      fraquezas.push('Infraestrutura abaixo do ideal');
    }

    return fraquezas.slice(0, 6); // Limitar a 6 fraquezas
  }

  // Extrair oportunidades da análise da IA
  private extrairOportunidades(respostaIA: any, dados: any): string[] {
    const oportunidades = [];

    // Adicionar oportunidades baseadas na IA
    if (respostaIA.opportunities) {
      respostaIA.opportunities.forEach((opp: string) => {
        oportunidades.push(opp);
      });
    }

    // Adicionar oportunidades baseadas nos dados
    if (dados.tendencias?.origemPrincipal === 'São Paulo') {
      oportunidades.push('Mercado de São Paulo consolidado (60% dos visitantes)');
    }

    if (dados.eventos?.planejados > 0) {
      oportunidades.push('Potencial para novos eventos e festivais');
    }

    if (dados.atrativos?.satisfacaoMedia >= 4.5) {
      oportunidades.push('Potencial para turismo internacional');
    }

    return oportunidades.slice(0, 6); // Limitar a 6 oportunidades
  }

  // Extrair ameaças da análise da IA
  private extrairAmeacas(respostaIA: any, dados: any): string[] {
    const ameacas = [
      'Concorrência de outras cidades turísticas',
      'Mudanças climáticas'
    ];

    // Adicionar ameaças baseadas na IA
    if (respostaIA.risks) {
      respostaIA.risks.forEach((risk: string) => {
        if (!ameacas.includes(risk)) {
          ameacas.push(risk);
        }
      });
    }

    // Adicionar ameaças baseadas nos dados
    if (dados.tendencias?.sazonalidade && dados.tendencias.sazonalidade.fevereiro < -15) {
      ameacas.push('Dependência excessiva da alta temporada');
    }

    return ameacas.slice(0, 6); // Limitar a 6 ameaças
  }

  // Calcular benchmarks regionais
  private calcularBenchmarks(dados: any): any {
    const visitantes = dados.situacaoAtual?.visitantes || 0;
    const populacao = dados.situacaoAtual?.populacao || 22000;
    const receita = dados.situacaoAtual?.receita || 0;
    const satisfacao = dados.tendencias?.satisfacao || 4.6;

    return {
      visitantesPorHabitante: populacao > 0 ? (visitantes / populacao) : 0,
      receitaPorVisitante: visitantes > 0 ? (receita / visitantes) : 0,
      satisfacaoMedia: satisfacao,
      posicaoRegional: this.calcularPosicaoRegional(satisfacao, visitantes)
    };
  }

  // Calcular posição regional baseada em benchmarks
  private calcularPosicaoRegional(satisfacao: number, visitantes: number): number {
    // Lógica simplificada para posição regional
    let pontos = 0;
    
    if (satisfacao >= 4.5) pontos += 2;
    else if (satisfacao >= 4.0) pontos += 1;
    
    if (visitantes >= 1000000) pontos += 2;
    else if (visitantes >= 500000) pontos += 1;
    
    // Converter pontos em posição (1-5)
    if (pontos >= 4) return 1; // Top 1
    if (pontos >= 3) return 2; // Top 2
    if (pontos >= 2) return 3; // Top 3
    if (pontos >= 1) return 4; // Top 4
    return 5; // Top 5
  }

  // Identificar gaps automaticamente
  private identificarGaps(dados: any): any {
    const gaps = {
      sinalizacao: false,
      acessibilidade: false,
      conectividade: false,
      seguranca: false,
      transporte: false,
      hospedagem: false
    };

    // Lógica para identificar gaps baseada nos dados
    if (dados.situacaoAtual?.infraestrutura < 80) {
      gaps.sinalizacao = true;
      gaps.conectividade = true;
    }

    if (dados.atrativos?.satisfacaoMedia < 4.0) {
      gaps.acessibilidade = true;
    }

    if (dados.tendencias?.sazonalidade && Math.abs(dados.tendencias.sazonalidade.julho) > 30) {
      gaps.transporte = true;
    }

    return gaps;
  }

  // Gerar diagnóstico mock (fallback)
  private gerarDiagnosticoMock(dados: any): DiagnosticoData {
    return {
      situacaoAtual: {
        populacao: 22000,
        visitantes: dados.situacaoAtual.visitantes,
        receita: dados.situacaoAtual.receita,
        atrativos: dados.situacaoAtual.atrativos,
        infraestrutura: dados.situacaoAtual.infraestrutura,
        satisfacao: 4.6
      },
      analiseSWOT: {
        forcas: ['Natureza única', 'Marca consolidada', 'Alta satisfação'],
        fraquezas: ['Sazonalidade', 'Dependência de um segmento'],
        oportunidades: ['Turismo gastronômico', 'Mercado de São Paulo'],
        ameacas: ['Concorrência', 'Mudanças climáticas']
      },
      gaps: {
        sinalizacao: true,
        acessibilidade: false,
        conectividade: true,
        seguranca: false,
        transporte: true,
        hospedagem: false
      },
      benchmarks: {
        visitantesPorHabitante: 56.8,
        receitaPorVisitante: 96,
        satisfacaoMedia: 4.6,
        posicaoRegional: 3
      }
    };
  }

  // Gerar objetivos inteligentes baseados no diagnóstico
  private async gerarObjetivosInteligentes(dados: DiagnosticoData): Promise<Objetivo[]> {
    const objetivos: Objetivo[] = [];

    // Objetivo baseado na análise de visitantes
    if (dados.situacaoAtual.visitantes > 0) {
      const crescimento = this.calcularCrescimentoIdeal(dados);
      objetivos.push({
        id: 'obj_1',
        titulo: 'Aumentar Visitantes',
        descricao: `Aumentar número de visitantes em ${crescimento.percentual}% nos próximos 5 anos`,
        categoria: 'crescimento',
        meta: crescimento.meta,
        unidade: 'visitantes/ano',
        prazo: '2028-12-31',
        responsavel: 'Secretaria de Turismo',
        status: 'planejado',
        progresso: 0,
        indicadores: []
      });
    }

    // Objetivo baseado na análise de sazonalidade
    if (dados.analiseSWOT.fraquezas.some(f => f.includes('sazonalidade'))) {
      objetivos.push({
        id: 'obj_2',
        titulo: 'Reduzir Sazonalidade',
        descricao: 'Reduzir variação sazonal de 60% para 30%',
        categoria: 'diversificacao',
        meta: 30,
        unidade: '%',
        prazo: '2026-12-31',
        responsavel: 'Secretaria de Turismo',
        status: 'planejado',
        progresso: 0,
        indicadores: []
      });
    }

    // Objetivo baseado na análise de infraestrutura
    if (dados.situacaoAtual.infraestrutura < 90) {
      objetivos.push({
        id: 'obj_3',
        titulo: 'Melhorar Infraestrutura',
        descricao: `Aumentar índice de infraestrutura para ${Math.min(95, dados.situacaoAtual.infraestrutura + 15)}%`,
        categoria: 'infraestrutura',
        meta: Math.min(95, dados.situacaoAtual.infraestrutura + 15),
        unidade: '%',
        prazo: '2027-12-31',
        responsavel: 'Secretaria de Obras',
        status: 'planejado',
        progresso: 0,
        indicadores: []
      });
    }

    // Objetivo baseado na análise de satisfação
    if (dados.situacaoAtual.satisfacao < 4.8) {
      objetivos.push({
        id: 'obj_4',
        titulo: 'Aumentar Satisfação',
        descricao: 'Aumentar satisfação dos turistas para 4.8 estrelas',
        categoria: 'sustentabilidade',
        meta: 4.8,
        unidade: 'estrelas',
        prazo: '2026-12-31',
        responsavel: 'Secretaria de Turismo',
        status: 'planejado',
        progresso: 0,
        indicadores: []
      });
    }

    // Objetivo baseado em gaps identificados
    if (dados.gaps.sinalizacao || dados.gaps.acessibilidade) {
      objetivos.push({
        id: 'obj_5',
        titulo: 'Melhorar Sinalização',
        descricao: 'Implementar sistema de sinalização turística completo',
        categoria: 'infraestrutura',
        meta: 100,
        unidade: '%',
        prazo: '2025-12-31',
        responsavel: 'Secretaria de Obras',
        status: 'planejado',
        progresso: 0,
        indicadores: []
      });
    }

    return objetivos;
  }

  // Calcular crescimento ideal baseado em benchmarks
  private calcularCrescimentoIdeal(dados: DiagnosticoData): { percentual: number; meta: number } {
    const visitantesAtuais = dados.situacaoAtual.visitantes;
    const posicaoRegional = dados.benchmarks.posicaoRegional;
    
    // Definir percentual de crescimento baseado na posição regional
    let percentual = 15; // Crescimento padrão
    
    if (posicaoRegional <= 2) {
      percentual = 20; // Cidades top podem crescer mais
    } else if (posicaoRegional >= 4) {
      percentual = 25; // Cidades com potencial de crescimento
    }
    
    const meta = Math.round(visitantesAtuais * (1 + percentual / 100));
    
    return { percentual, meta };
  }

  // Gerar indicadores base
  private async gerarIndicadoresBase(dados: DiagnosticoData): Promise<Indicador[]> {
    return [
      {
        id: 'ind_1',
        nome: 'Visitantes Anuais',
        descricao: 'Número total de visitantes por ano',
        valorAtual: dados.situacaoAtual.visitantes,
        meta: 1562500,
        unidade: 'visitantes',
        frequencia: 'anual',
        fonte: 'Sistema de Controle',
        ultimaAtualizacao: new Date().toISOString()
      },
      {
        id: 'ind_2',
        nome: 'Receita Turística',
        descricao: 'Receita total do turismo',
        valorAtual: dados.situacaoAtual.receita,
        meta: 150000000,
        unidade: 'R$',
        frequencia: 'anual',
        fonte: 'Receita Municipal',
        ultimaAtualizacao: new Date().toISOString()
      },
      {
        id: 'ind_3',
        nome: 'Satisfação dos Turistas',
        descricao: 'Nota média de satisfação',
        valorAtual: dados.situacaoAtual.satisfacao,
        meta: 4.8,
        unidade: 'estrelas',
        frequencia: 'mensal',
        fonte: 'Pesquisas de Satisfação',
        ultimaAtualizacao: new Date().toISOString()
      }
    ];
  }
}

export const planoDiretorService = new PlanoDiretorService();
