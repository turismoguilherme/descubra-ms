/**
 * Plano Diretor de Turismo Service
 * Serviço para gerenciamento completo de Planos Diretores de Turismo
 */

import { supabase } from '@/integrations/supabase/client';
import { v5 as uuidv5 } from 'uuid';
import { PlanoDiretorAIService } from '../ai/planoDiretorAIService';
import { PlanoDiretorIntegrationService } from './planoDiretorIntegrationService';

// Interfaces principais (mantidas compatíveis com o serviço antigo)
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
  categoria: 'crescimento' | 'diversificacao' | 'infraestrutura' | 'sustentabilidade' | 'outro';
  meta: number;
  unidade: string;
  prazo: string;
  responsavel: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
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
  status: 'planejada' | 'em_execucao' | 'concluida' | 'suspensa' | 'cancelada';
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
  status: 'planejada' | 'em_execucao' | 'concluida' | 'atrasada' | 'cancelada';
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
  cargo?: string;
  organizacao?: string;
  tipoAtor?: string;
  permissoes: string[];
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

export interface PlanoDiretorDocument {
  id: string;
  titulo: string;
  versao: string;
  status: 'rascunho' | 'revisao' | 'aprovado' | 'implementacao' | 'concluido';
  municipio: string;
  municipioUf: string;
  periodo: string;
  periodoInicio: string;
  periodoFim: string;
  objetivos: Objetivo[];
  estrategias: Estrategia[];
  acoes: Acao[];
  indicadores: Indicador[];
  colaboradores: Colaborador[];
  documentos: Documento[];
  criadorId: string;
  dataCriacao: string;
  dataAtualizacao: string;
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
  private aiService: PlanoDiretorAIService;
  private integrationService: PlanoDiretorIntegrationService;

  constructor() {
    this.aiService = new PlanoDiretorAIService();
    this.integrationService = new PlanoDiretorIntegrationService();
  }

  // Expor métodos do integration service
  async collectDataForDiagnostic(municipioNome: string, municipioUf: string): Promise<any> {
    return this.integrationService.collectAllData(municipioNome, municipioUf);
  }

  async generateDiagnosticoIA(dados: any): Promise<DiagnosticoData> {
    return this.aiService.generateDiagnostico(dados);
  }

  /**
   * Criar novo Plano Diretor
   */
  async createPlanoDiretor(data: {
    titulo: string;
    municipioNome: string;
    municipioUf: string;
    periodoInicio: string;
    periodoFim: string;
    criadorId: string;
  }): Promise<PlanoDiretorDocument> {
    try {
      console.log('planoDiretorService: Criando plano diretor com dados:', data);
      
      // Verificar se o usuário está autenticado no Supabase
      let supabaseUser = null;
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!authError && user) {
          supabaseUser = user;
        }
      } catch (authErr) {
        // Ignorar erro de autenticação para usuários de teste
        console.log('planoDiretorService: Usuário de teste detectado (sem sessão Supabase)');
      }
      
      console.log('planoDiretorService: Usuário Supabase:', supabaseUser?.id);
      console.log('planoDiretorService: Criador ID recebido:', data.criadorId);
      
      // Namespace UUID fixo para gerar UUIDs determinísticos para usuários de teste
      const TEST_USER_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      
      // Verificar se é um ID de teste (não é UUID válido)
      const isTestUserId = data.criadorId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.criadorId);
      
      // Para usuários de teste, converter para UUID determinístico usando UUID v5
      // Para usuários reais, usar o ID do Supabase se disponível, senão usar o ID recebido
      let criadorId: string;
      if (isTestUserId && !supabaseUser?.id) {
        // Gerar UUID determinístico baseado no ID de teste
        // O mesmo ID de teste sempre gerará o mesmo UUID
        criadorId = uuidv5(data.criadorId, TEST_USER_NAMESPACE);
        console.log('planoDiretorService: ID de teste detectado, convertendo para UUID:', data.criadorId, '->', criadorId);
      } else {
        criadorId = supabaseUser?.id || data.criadorId;
      }
      console.log('planoDiretorService: Usando criador_id:', criadorId);
      
      const insertData = {
        titulo: data.titulo,
        municipio_nome: data.municipioNome,
        municipio_uf: data.municipioUf,
        periodo_inicio: data.periodoInicio,
        periodo_fim: data.periodoFim,
        criador_id: criadorId,
        versao: '1.0',
        status: 'rascunho'
      };
      
      console.log('planoDiretorService: Dados para inserção:', insertData);

      let plano, error;
      try {
        const result = await supabase
          .from('plano_diretor_documents')
          .insert(insertData)
          .select()
          .single();
        plano = result.data;
        error = result.error;
      } catch (fetchError: any) {
        // Capturar erros de fetch (404, etc)
        console.error('planoDiretorService: Erro de fetch:', fetchError);
        if (fetchError.message?.includes('404') || fetchError.status === 404 || fetchError.statusText === 'Not Found') {
          const errorMessage = 'Tabela não encontrada (404). As migrations do Plano Diretor não foram executadas no Supabase. Por favor, execute as migrations antes de usar este módulo. Consulte o arquivo docs/INSTRUCOES_MIGRATIONS_PLANO_DIRETOR.md para instruções detalhadas.';
          const migrationError = new Error(`Erro ao criar plano diretor: ${errorMessage}`);
          (migrationError as any).isMigrationError = true;
          throw migrationError;
        }
        throw fetchError;
      }

      if (error) {
        console.error('planoDiretorService: Erro do Supabase:', error);
        console.error('planoDiretorService: Código do erro:', error.code);
        console.error('planoDiretorService: Mensagem do erro:', error.message);
        console.error('planoDiretorService: Detalhes do erro:', error.details);
        console.error('planoDiretorService: Hint do erro:', error.hint);
        
        // Verificar se é erro 404 (tabela não existe)
        // Objeto vazio ou sem código/mensagem geralmente indica 404 do PostgREST
        const isEmptyError = !error.code && !error.message && Object.keys(error).length === 0;
        const is404Error = isEmptyError || 
          error.code === '42P01' ||
          error.code === 'PGRST116' || 
          error.message?.includes('relation') || 
          error.message?.includes('does not exist') || 
          error.message?.includes('not found') || 
          error.message?.includes('404') ||
          (error.message?.toLowerCase().includes('table') && error.message?.toLowerCase().includes('not exist'));
        
        if (is404Error) {
          const errorMessage = 'Tabela não encontrada (404). As migrations do Plano Diretor não foram executadas no Supabase. Por favor, execute as migrations antes de usar este módulo. Consulte o arquivo docs/INSTRUCOES_MIGRATIONS_PLANO_DIRETOR.md para instruções detalhadas.';
          const migrationError = new Error(`Erro ao criar plano diretor: ${errorMessage}${error.code ? ` (${error.code})` : ''}`);
          (migrationError as any).isMigrationError = true;
          throw migrationError;
        }
        
        // Mensagem mais amigável baseada no tipo de erro
        let errorMessage = error.message || 'Erro desconhecido';
        
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
          errorMessage = 'Permissão negada. Verifique as políticas RLS ou se o usuário está autenticado corretamente.';
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          errorMessage = 'Erro de referência. O usuário não existe no sistema de autenticação do Supabase. Se você está usando um usuário de teste, é necessário criar o usuário no Supabase Auth ou ajustar as políticas RLS.';
          const migrationError = new Error(`Erro ao criar plano diretor: ${errorMessage}${error.code ? ` (${error.code})` : ''}`);
          (migrationError as any).isMigrationError = true;
          (migrationError as any).isUserError = true;
          throw migrationError;
        }
        
        throw new Error(`Erro ao criar plano diretor: ${errorMessage}${error.code ? ` (${error.code})` : ''}`);
      }
      
      // Verificar se plano é null (pode indicar erro 404 também)
      if (!plano) {
        const errorMessage = 'Tabela não encontrada (404). As migrations do Plano Diretor não foram executadas no Supabase. Por favor, execute as migrations antes de usar este módulo. Consulte o arquivo docs/INSTRUCOES_MIGRATIONS_PLANO_DIRETOR.md para instruções detalhadas.';
        const migrationError = new Error(`Erro ao criar plano diretor: ${errorMessage}`);
        (migrationError as any).isMigrationError = true;
        throw migrationError;
      }

      console.log('planoDiretorService: Plano criado com sucesso:', plano);
      return this.mapDocumentToInterface(plano);
    } catch (error: any) {
      console.error('planoDiretorService: Erro ao criar plano diretor:', error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error(`Erro desconhecido ao criar plano diretor: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Buscar Plano Diretor por ID
   */
  async getPlanoDiretorById(id: string): Promise<PlanoDiretorDocument | null> {
    try {
      const { data: plano, error } = await supabase
        .from('plano_diretor_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!plano) return null;

      // Buscar dados relacionados
      const [objetivos, estrategias, acoes, indicadores, colaboradores, documentos] = await Promise.all([
        this.getObjetivos(id),
        this.getEstrategias(id),
        this.getAcoes(id),
        this.getIndicadores(id),
        this.getColaboradores(id),
        this.getDocumentos(id)
      ]);

      return {
        ...this.mapDocumentToInterface(plano),
        objetivos,
        estrategias,
        acoes,
        indicadores,
        colaboradores,
        documentos
      };
    } catch (error) {
      console.error('Erro ao buscar plano diretor:', error);
      return null;
    }
  }

  /**
   * Listar Planos Diretores do usuário
   */
  async listPlanosDiretores(userId: string): Promise<PlanoDiretorDocument[]> {
    try {
      console.log('planoDiretorService: Buscando planos para userId:', userId);
      
      // Namespace UUID fixo para gerar UUIDs determinísticos para usuários de teste
      const TEST_USER_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      
      // Verificar se é um ID de teste e converter para UUID
      const isTestUserId = userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      const searchUserId = isTestUserId ? uuidv5(userId, TEST_USER_NAMESPACE) : userId;
      
      if (isTestUserId) {
        console.log('planoDiretorService: ID de teste detectado, convertendo para UUID:', userId, '->', searchUserId);
      }
      
      // Buscar planos onde o usuário é criador
      const { data: planosCriados, error: errorCriados } = await supabase
        .from('plano_diretor_documents')
        .select('*')
        .eq('criador_id', searchUserId)
        .order('created_at', { ascending: false });

      if (errorCriados) {
        console.error('planoDiretorService: Erro ao buscar planos criados:', errorCriados);
        // Verificar se é erro de tabela não encontrada (migration não executada)
        if (errorCriados.code === '42P01' || errorCriados.message?.includes('does not exist') || errorCriados.message?.includes('relation')) {
          const migrationError = new Error('Tabela não encontrada (404). As migrations do Plano Diretor não foram executadas no Supabase. Por favor, execute as migrations antes de usar este módulo. Consulte o arquivo docs/INSTRUCOES_MIGRATIONS_PLANO_DIRETOR.md para instruções detalhadas.');
          (migrationError as any).isMigrationError = true;
          throw migrationError;
        }
        throw errorCriados;
      }
      console.log('planoDiretorService: Planos criados encontrados:', planosCriados?.length || 0);

      // Buscar planos onde o usuário é colaborador
      const { data: colaboracoes, error: errorColab } = await supabase
        .from('plano_diretor_colaboradores')
        .select('plano_diretor_id')
        .eq('usuario_id', searchUserId)
        .eq('ativo', true);

      if (errorColab) {
        // Se a tabela de colaboradores não existe, apenas ignorar (migration não executada)
        if (errorColab.code === '42P01' || errorColab.message?.includes('does not exist') || errorColab.message?.includes('relation')) {
          console.warn('planoDiretorService: Tabela de colaboradores não encontrada, continuando sem colaborações');
        } else {
          throw errorColab;
        }
      }

      const planosIds = colaboracoes?.map(c => c.plano_diretor_id) || [];
      
      let planosColaborados: any[] = [];
      if (planosIds.length > 0) {
        const { data: planosColab, error: errorPlanosColab } = await supabase
          .from('plano_diretor_documents')
          .select('*')
          .in('id', planosIds)
          .order('created_at', { ascending: false });

        if (errorPlanosColab) throw errorPlanosColab;
        planosColaborados = planosColab || [];
      }

      // Combinar e remover duplicatas
      const todosPlanos = [...(planosCriados || []), ...planosColaborados];
      const planosUnicos = todosPlanos.filter((plano, index, self) =>
        index === self.findIndex(p => p.id === plano.id)
      );

      console.log('planoDiretorService: Total de planos únicos:', planosUnicos.length);
      const resultado = planosUnicos.map(plano => this.mapDocumentToInterface(plano));
      console.log('planoDiretorService: Planos mapeados:', resultado);
      return resultado;
    } catch (error: any) {
      console.error('planoDiretorService: Erro ao listar planos diretores:', error);
      // Se for erro de migration, propagar para que o componente possa mostrar o aviso
      if (error.isMigrationError) {
        throw error;
      }
      return [];
    }
  }

  /**
   * Atualizar Plano Diretor
   */
  async updatePlanoDiretor(id: string, updates: Partial<PlanoDiretorDocument>): Promise<PlanoDiretorDocument> {
    try {
      const updateData: any = {};
      if (updates.titulo) updateData.titulo = updates.titulo;
      if (updates.status) updateData.status = updates.status;
      if (updates.versao) updateData.versao = updates.versao;
      if (updates.municipio) updateData.municipio_nome = updates.municipio;
      if (updates.municipioUf) updateData.municipio_uf = updates.municipioUf;
      if (updates.periodoInicio) updateData.periodo_inicio = updates.periodoInicio;
      if (updates.periodoFim) updateData.periodo_fim = updates.periodoFim;

      const { data, error } = await supabase
        .from('plano_diretor_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDocumentToInterface(data);
    } catch (error) {
      console.error('Erro ao atualizar plano diretor:', error);
      throw error;
    }
  }


  // Métodos para Objetivos
  async getObjetivos(planoDiretorId: string): Promise<Objetivo[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_objetivos')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      return (data || []).map(obj => ({
        id: obj.id,
        titulo: obj.titulo,
        descricao: obj.descricao || '',
        categoria: obj.categoria || 'outro',
        meta: obj.meta || 0,
        unidade: obj.unidade || '',
        prazo: obj.prazo || '',
        responsavel: obj.responsavel_nome || '',
        status: obj.status || 'planejado',
        progresso: obj.progresso || 0,
        indicadores: [] // Será preenchido separadamente
      }));
    } catch (error) {
      console.error('Erro ao buscar objetivos:', error);
      return [];
    }
  }

  async createObjetivo(planoDiretorId: string, objetivo: Partial<Objetivo>): Promise<Objetivo> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_objetivos')
        .insert({
          plano_diretor_id: planoDiretorId,
          titulo: objetivo.titulo || '',
          descricao: objetivo.descricao,
          categoria: objetivo.categoria || 'outro',
          meta: objetivo.meta,
          unidade: objetivo.unidade,
          prazo: objetivo.prazo,
          responsavel_nome: objetivo.responsavel,
          status: objetivo.status || 'planejado',
          progresso: objetivo.progresso || 0
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapObjetivoToInterface(data);
    } catch (error) {
      console.error('Erro ao criar objetivo:', error);
      throw error;
    }
  }

  async updateObjetivo(id: string, updates: Partial<Objetivo>): Promise<Objetivo> {
    try {
      const updateData: any = {};
      if (updates.titulo) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.categoria) updateData.categoria = updates.categoria;
      if (updates.meta !== undefined) updateData.meta = updates.meta;
      if (updates.unidade) updateData.unidade = updates.unidade;
      if (updates.prazo) updateData.prazo = updates.prazo;
      if (updates.responsavel) updateData.responsavel_nome = updates.responsavel;
      if (updates.status) updateData.status = updates.status;
      if (updates.progresso !== undefined) updateData.progresso = updates.progresso;

      const { data, error } = await supabase
        .from('plano_diretor_objetivos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapObjetivoToInterface(data);
    } catch (error) {
      console.error('Erro ao atualizar objetivo:', error);
      throw error;
    }
  }

  async deleteObjetivo(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_objetivos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar objetivo:', error);
      throw error;
    }
  }

  // Métodos para Estratégias
  async getEstrategias(planoDiretorId: string): Promise<Estrategia[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_estrategias')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      const estrategias = (data || []).map(est => this.mapEstrategiaToInterface(est));
      
      // Buscar ações para cada estratégia
      for (const estrategia of estrategias) {
        estrategia.acoes = await this.getAcoesByEstrategia(estrategia.id);
      }

      return estrategias;
    } catch (error) {
      console.error('Erro ao buscar estratégias:', error);
      return [];
    }
  }

  async createEstrategia(objetivoId: string, estrategia: Partial<Estrategia>): Promise<Estrategia> {
    try {
      // Buscar plano_diretor_id do objetivo
      const { data: objetivo } = await supabase
        .from('plano_diretor_objetivos')
        .select('plano_diretor_id')
        .eq('id', objetivoId)
        .single();

      if (!objetivo) throw new Error('Objetivo não encontrado');

      const { data, error } = await supabase
        .from('plano_diretor_estrategias')
        .insert({
          plano_diretor_id: objetivo.plano_diretor_id,
          objetivo_id: objetivoId,
          titulo: estrategia.titulo || '',
          descricao: estrategia.descricao,
          investimento: estrategia.investimento || 0,
          prazo: estrategia.prazo,
          responsavel_nome: estrategia.responsavel,
          status: estrategia.status || 'planejada',
          roi_esperado: estrategia.roiEsperado
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapEstrategiaToInterface(data);
    } catch (error) {
      console.error('Erro ao criar estratégia:', error);
      throw error;
    }
  }

  async updateEstrategia(id: string, updates: Partial<Estrategia>): Promise<Estrategia> {
    try {
      const updateData: any = {};
      if (updates.titulo) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.investimento !== undefined) updateData.investimento = updates.investimento;
      if (updates.prazo) updateData.prazo = updates.prazo;
      if (updates.responsavel) updateData.responsavel_nome = updates.responsavel;
      if (updates.status) updateData.status = updates.status;
      if (updates.roiEsperado !== undefined) updateData.roi_esperado = updates.roiEsperado;

      const { data, error } = await supabase
        .from('plano_diretor_estrategias')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapEstrategiaToInterface(data);
    } catch (error) {
      console.error('Erro ao atualizar estratégia:', error);
      throw error;
    }
  }

  async deleteEstrategia(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_estrategias')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar estratégia:', error);
      throw error;
    }
  }

  // Métodos para Ações
  async getAcoes(planoDiretorId: string): Promise<Acao[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_acoes')
        .select(`
          *,
          plano_diretor_estrategias!inner(plano_diretor_id)
        `)
        .eq('plano_diretor_estrategias.plano_diretor_id', planoDiretorId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      return (data || []).map(acao => this.mapAcaoToInterface(acao));
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
      return [];
    }
  }

  async getAcoesByEstrategia(estrategiaId: string): Promise<Acao[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_acoes')
        .select('*')
        .eq('estrategia_id', estrategiaId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      return (data || []).map(acao => this.mapAcaoToInterface(acao));
    } catch (error) {
      console.error('Erro ao buscar ações da estratégia:', error);
      return [];
    }
  }

  async createAcao(estrategiaId: string, acao: Partial<Acao>): Promise<Acao> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_acoes')
        .insert({
          estrategia_id: estrategiaId,
          titulo: acao.titulo || '',
          descricao: acao.descricao,
          investimento: acao.investimento || 0,
          prazo: acao.prazo,
          responsavel_nome: acao.responsavel,
          status: acao.status || 'planejada',
          progresso: acao.progresso || 0,
          dependencias: acao.dependencias || []
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapAcaoToInterface(data);
    } catch (error) {
      console.error('Erro ao criar ação:', error);
      throw error;
    }
  }

  async updateAcao(id: string, updates: Partial<Acao>): Promise<Acao> {
    try {
      const updateData: any = {};
      if (updates.titulo) updateData.titulo = updates.titulo;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.investimento !== undefined) updateData.investimento = updates.investimento;
      if (updates.prazo) updateData.prazo = updates.prazo;
      if (updates.responsavel) updateData.responsavel_nome = updates.responsavel;
      if (updates.status) updateData.status = updates.status;
      if (updates.progresso !== undefined) updateData.progresso = updates.progresso;
      if (updates.dependencias) updateData.dependencias = updates.dependencias;

      const { data, error } = await supabase
        .from('plano_diretor_acoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapAcaoToInterface(data);
    } catch (error) {
      console.error('Erro ao atualizar ação:', error);
      throw error;
    }
  }

  async deleteAcao(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_acoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar ação:', error);
      throw error;
    }
  }

  // Métodos para Indicadores
  async getIndicadores(planoDiretorId: string): Promise<Indicador[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_indicadores')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .order('nome', { ascending: true });

      if (error) throw error;

      return (data || []).map(ind => ({
        id: ind.id,
        nome: ind.nome,
        descricao: ind.descricao || '',
        valorAtual: ind.valor_atual || 0,
        meta: ind.meta || 0,
        unidade: ind.unidade || '',
        frequencia: ind.frequencia || 'mensal',
        fonte: ind.fonte || '',
        ultimaAtualizacao: ind.ultima_atualizacao || ind.created_at
      }));
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
      return [];
    }
  }

  async createIndicador(planoDiretorId: string, indicador: Partial<Indicador>): Promise<Indicador> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_indicadores')
        .insert({
          plano_diretor_id: planoDiretorId,
          objetivo_id: indicador.id ? indicador.id : null,
          nome: indicador.nome || '',
          descricao: indicador.descricao,
          valor_atual: indicador.valorAtual,
          meta: indicador.meta,
          unidade: indicador.unidade,
          frequencia: indicador.frequencia || 'mensal',
          fonte: indicador.fonte
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapIndicadorToInterface(data);
    } catch (error) {
      console.error('Erro ao criar indicador:', error);
      throw error;
    }
  }

  async updateIndicador(id: string, updates: Partial<Indicador>): Promise<Indicador> {
    try {
      const updateData: any = {};
      if (updates.nome) updateData.nome = updates.nome;
      if (updates.descricao !== undefined) updateData.descricao = updates.descricao;
      if (updates.valorAtual !== undefined) updateData.valor_atual = updates.valorAtual;
      if (updates.meta !== undefined) updateData.meta = updates.meta;
      if (updates.unidade) updateData.unidade = updates.unidade;
      if (updates.frequencia) updateData.frequencia = updates.frequencia;
      if (updates.fonte) updateData.fonte = updates.fonte;
      updateData.ultima_atualizacao = new Date().toISOString();

      const { data, error } = await supabase
        .from('plano_diretor_indicadores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapIndicadorToInterface(data);
    } catch (error) {
      console.error('Erro ao atualizar indicador:', error);
      throw error;
    }
  }

  async deleteIndicador(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_indicadores')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar indicador:', error);
      throw error;
    }
  }

  // Métodos para Colaboradores
  async getColaboradores(planoDiretorId: string): Promise<Colaborador[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_colaboradores')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(col => ({
        id: col.id,
        nome: col.nome || col.email,
        email: col.email,
        tipoAtor: col.tipo_ator,
        permissoes: col.permissoes ? Object.keys(col.permissoes).filter(k => col.permissoes[k] === true) : [col.nivel_acesso],
        ativo: col.ativo
      }));
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      return [];
    }
  }

  async addColaborador(planoDiretorId: string, colaborador: {
    email: string;
    nome?: string;
    tipoAtor?: string;
    nivelAcesso: 'visualizar' | 'editar' | 'aprovar';
    permissoes?: Record<string, boolean>;
  }): Promise<Colaborador> {
    try {
      let supabaseUser = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          supabaseUser = user;
        }
      } catch (authErr) {
        console.log('planoDiretorService: Usuário de teste detectado (sem sessão Supabase)');
      }
      
      if (!supabaseUser) {
        throw new Error('Usuário não autenticado. É necessário estar logado para adicionar colaboradores.');
      }

      const { data, error } = await supabase
        .from('plano_diretor_colaboradores')
        .insert({
          plano_diretor_id: planoDiretorId,
          email: colaborador.email,
          nome: colaborador.nome,
          tipo_ator: colaborador.tipoAtor,
          nivel_acesso: colaborador.nivelAcesso,
          permissoes: colaborador.permissoes || {},
          convidado_por: supabaseUser.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        nome: data.nome || data.email,
        email: data.email,
        tipoAtor: data.tipo_ator,
        permissoes: data.permissoes ? Object.keys(data.permissoes).filter(k => data.permissoes[k] === true) : [data.nivel_acesso],
        ativo: data.ativo
      };
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      throw error;
    }
  }

  async updateColaboradorPermissions(id: string, updates: {
    nivelAcesso?: 'visualizar' | 'editar' | 'aprovar';
    permissoes?: Record<string, boolean>;
    ativo?: boolean;
  }): Promise<Colaborador> {
    try {
      const updateData: any = {};
      if (updates.nivelAcesso) updateData.nivel_acesso = updates.nivelAcesso;
      if (updates.permissoes) updateData.permissoes = updates.permissoes;
      if (updates.ativo !== undefined) updateData.ativo = updates.ativo;

      const { data, error } = await supabase
        .from('plano_diretor_colaboradores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        nome: data.nome || data.email,
        email: data.email,
        tipoAtor: data.tipo_ator,
        permissoes: data.permissoes ? Object.keys(data.permissoes).filter(k => data.permissoes[k] === true) : [data.nivel_acesso],
        ativo: data.ativo
      };
    } catch (error) {
      console.error('Erro ao atualizar permissões do colaborador:', error);
      throw error;
    }
  }

  async removeColaborador(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_colaboradores')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      throw error;
    }
  }

  // Métodos para Comentários
  async getComentarios(planoDiretorId: string, secao?: string, secaoId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('plano_diretor_comentarios')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .order('created_at', { ascending: false });

      if (secao) {
        query = query.eq('secao', secao);
      }
      if (secaoId) {
        query = query.eq('secao_id', secaoId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(com => ({
        id: com.id,
        planoDiretorId: com.plano_diretor_id,
        secao: com.secao,
        secaoId: com.secao_id,
        autorId: com.autor_id,
        comentario: com.comentario,
        resolvido: com.resolvido,
        resolvidoPor: com.resolvido_por,
        dataResolucao: com.data_resolucao,
        createdAt: com.created_at,
        updatedAt: com.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      return [];
    }
  }

  async createComentario(planoDiretorId: string, comentario: {
    secao: string;
    secaoId?: string;
    comentario: string;
  }): Promise<any> {
    try {
      let supabaseUser = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          supabaseUser = user;
        }
      } catch (authErr) {
        // Ignorar erro de autenticação para usuários de teste
        console.log('planoDiretorService: Usuário de teste detectado (sem sessão Supabase)');
      }
      
      // Para usuários de teste, usar um ID temporário ou null
      const autorId = supabaseUser?.id || null;
      
      if (!autorId) {
        throw new Error('Usuário não autenticado. É necessário estar logado para criar comentários.');
      }

      const { data, error } = await supabase
        .from('plano_diretor_comentarios')
        .insert({
          plano_diretor_id: planoDiretorId,
          secao: comentario.secao,
          secao_id: comentario.secaoId || null,
          autor_id: autorId,
          comentario: comentario.comentario
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        planoDiretorId: data.plano_diretor_id,
        secao: data.secao,
        secaoId: data.secao_id,
        autorId: data.autor_id,
        comentario: data.comentario,
        resolvido: data.resolvido,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      throw error;
    }
  }

  async updateComentario(id: string, updates: {
    comentario?: string;
    resolvido?: boolean;
  }): Promise<any> {
    try {
      let supabaseUser = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          supabaseUser = user;
        }
      } catch (authErr) {
        // Ignorar erro de autenticação para usuários de teste
        console.log('planoDiretorService: Usuário de teste detectado (sem sessão Supabase)');
      }
      
      if (!supabaseUser && !updates.resolvido) {
        // Para usuários de teste, permitir atualização se não for para resolver
        console.log('planoDiretorService: Atualizando comentário sem autenticação Supabase (usuário de teste)');
      }

      const updateData: any = {};
      if (updates.comentario !== undefined) updateData.comentario = updates.comentario;
      if (updates.resolvido !== undefined) {
        updateData.resolvido = updates.resolvido;
        if (updates.resolvido) {
          updateData.resolvido_por = supabaseUser?.id || null;
          updateData.data_resolucao = new Date().toISOString();
        } else {
          updateData.resolvido_por = null;
          updateData.data_resolucao = null;
        }
      }

      const { data, error } = await supabase
        .from('plano_diretor_comentarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        planoDiretorId: data.plano_diretor_id,
        secao: data.secao,
        secaoId: data.secao_id,
        autorId: data.autor_id,
        comentario: data.comentario,
        resolvido: data.resolvido,
        resolvidoPor: data.resolvido_por,
        dataResolucao: data.data_resolucao,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      throw error;
    }
  }

  async deleteComentario(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_comentarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      throw error;
    }
  }

  // Métodos para Documentos
  async getDocumentos(planoDiretorId: string): Promise<Documento[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_documentos_anexos')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(doc => ({
        id: doc.id,
        titulo: doc.titulo,
        tipo: doc.tipo || 'outro',
        arquivo: doc.arquivo_url,
        tamanho: doc.tamanho_bytes || 0,
        dataUpload: doc.created_at,
        uploader: doc.uploader_id,
        versao: doc.versao || '1.0',
        status: doc.status || 'rascunho'
      }));
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      return [];
    }
  }

  async uploadDocumento(planoDiretorId: string, documento: {
    titulo: string;
    tipo: string;
    arquivoUrl: string;
    tamanhoBytes: number;
    versao?: string;
  }): Promise<Documento> {
    try {
      let supabaseUser = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          supabaseUser = user;
        }
      } catch (authErr) {
        console.log('planoDiretorService: Usuário de teste detectado (sem sessão Supabase)');
      }
      
      if (!supabaseUser) {
        throw new Error('Usuário não autenticado. É necessário estar logado para fazer upload de documentos.');
      }

      const { data, error } = await supabase
        .from('plano_diretor_documentos_anexos')
        .insert({
          plano_diretor_id: planoDiretorId,
          titulo: documento.titulo,
          tipo: documento.tipo,
          arquivo_url: documento.arquivoUrl,
          tamanho_bytes: documento.tamanhoBytes,
          versao: documento.versao || '1.0',
          uploader_id: supabaseUser.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        titulo: data.titulo,
        tipo: data.tipo || 'outro',
        arquivo: data.arquivo_url,
        tamanho: data.tamanho_bytes || 0,
        dataUpload: data.created_at,
        uploader: data.uploader_id,
        versao: data.versao || '1.0',
        status: data.status || 'rascunho'
      };
    } catch (error) {
      console.error('Erro ao fazer upload de documento:', error);
      throw error;
    }
  }

  async deleteDocumento(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('plano_diretor_documentos_anexos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  // Métodos para Histórico
  async getHistorico(planoDiretorId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('plano_diretor_historico')
        .select('*')
        .eq('plano_diretor_id', planoDiretorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(hist => ({
        id: hist.id,
        versao: hist.versao,
        autorId: hist.autor_id,
        tipoAlteracao: hist.tipo_alteracao,
        secao: hist.secao,
        secaoId: hist.secao_id,
        alteracoes: hist.alteracoes,
        comentarios: hist.comentarios,
        createdAt: hist.created_at
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  /**
   * Gerar KPIs de acompanhamento
   */
  async getKPIs(planoDiretorId: string): Promise<KPIPlanoDiretor> {
    try {
      const plano = await this.getPlanoDiretorById(planoDiretorId);
      if (!plano) throw new Error('Plano não encontrado');

      // Calcular KPIs baseados nos dados do plano
      const acoesConcluidas = plano.acoes.filter(a => a.status === 'concluida').length;
      const acoesTotal = plano.acoes.length;
      const investimentoRealizado = plano.acoes
        .filter(a => a.status === 'concluida')
        .reduce((sum, a) => sum + (a.investimento || 0), 0);
      const investimentoPlanejado = plano.acoes.reduce((sum, a) => sum + (a.investimento || 0), 0);

      // Buscar indicadores relevantes
      const indicadorVisitantes = plano.indicadores.find(i => i.nome.toLowerCase().includes('visitante'));
      const indicadorReceita = plano.indicadores.find(i => i.nome.toLowerCase().includes('receita'));
      const indicadorSatisfacao = plano.indicadores.find(i => i.nome.toLowerCase().includes('satisfação') || i.nome.toLowerCase().includes('satisfacao'));

      return {
        visitantes: {
          atual: indicadorVisitantes?.valorAtual || 0,
          meta: indicadorVisitantes?.meta || 0,
          percentual: indicadorVisitantes?.meta ? (indicadorVisitantes.valorAtual / indicadorVisitantes.meta) * 100 : 0,
          tendencia: (indicadorVisitantes?.valorAtual || 0) >= (indicadorVisitantes?.meta || 0) * 0.8 ? 'crescendo' : 'decaindo'
        },
        receita: {
          atual: indicadorReceita?.valorAtual || 0,
          meta: indicadorReceita?.meta || 0,
          percentual: indicadorReceita?.meta ? (indicadorReceita.valorAtual / indicadorReceita.meta) * 100 : 0,
          tendencia: (indicadorReceita?.valorAtual || 0) >= (indicadorReceita?.meta || 0) * 0.8 ? 'crescendo' : 'decaindo'
        },
        satisfacao: {
          atual: indicadorSatisfacao?.valorAtual || 0,
          meta: indicadorSatisfacao?.meta || 0,
          percentual: indicadorSatisfacao?.meta ? (indicadorSatisfacao.valorAtual / indicadorSatisfacao.meta) * 100 : 0,
          tendencia: (indicadorSatisfacao?.valorAtual || 0) >= (indicadorSatisfacao?.meta || 0) * 0.8 ? 'crescendo' : 'decaindo'
        },
        investimentos: {
          realizado: investimentoRealizado,
          planejado: investimentoPlanejado,
          percentual: investimentoPlanejado ? (investimentoRealizado / investimentoPlanejado) * 100 : 0,
          tendencia: investimentoRealizado >= investimentoPlanejado * 0.8 ? 'crescendo' : 'decaindo'
        },
        acoes: {
          concluidas: acoesConcluidas,
          total: acoesTotal,
          percentual: acoesTotal ? (acoesConcluidas / acoesTotal) * 100 : 0,
          tendencia: acoesConcluidas >= acoesTotal * 0.8 ? 'crescendo' : 'decaindo'
        }
      };
    } catch (error) {
      console.error('Erro ao gerar KPIs:', error);
      throw error;
    }
  }

  // Helper methods para mapear dados do banco para interfaces
  private mapDocumentToInterface(data: any): PlanoDiretorDocument {
    return {
      id: data.id,
      titulo: data.titulo,
      versao: data.versao,
      status: data.status,
      municipio: data.municipio_nome,
      municipioUf: data.municipio_uf,
      periodo: `${data.periodo_inicio} - ${data.periodo_fim}`,
      periodoInicio: data.periodo_inicio,
      periodoFim: data.periodo_fim,
      criadorId: data.criador_id,
      dataCriacao: data.created_at,
      dataAtualizacao: data.updated_at,
      objetivos: [],
      estrategias: [],
      acoes: [],
      indicadores: [],
      colaboradores: [],
      documentos: []
    };
  }

  private mapObjetivoToInterface(data: any): Objetivo {
    return {
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao || '',
      categoria: data.categoria || 'outro',
      meta: data.meta || 0,
      unidade: data.unidade || '',
      prazo: data.prazo || '',
      responsavel: data.responsavel_nome || '',
      status: data.status || 'planejado',
      progresso: data.progresso || 0,
      indicadores: []
    };
  }

  private mapEstrategiaToInterface(data: any): Estrategia {
    return {
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao || '',
      objetivoId: data.objetivo_id,
      acoes: [],
      investimento: data.investimento || 0,
      prazo: data.prazo || '',
      responsavel: data.responsavel_nome || '',
      status: data.status || 'planejada',
      roiEsperado: data.roi_esperado
    };
  }

  private mapAcaoToInterface(data: any): Acao {
    return {
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao || '',
      estrategiaId: data.estrategia_id,
      investimento: data.investimento || 0,
      prazo: data.prazo || '',
      responsavel: data.responsavel_nome || '',
      status: data.status || 'planejada',
      progresso: data.progresso || 0,
      dependencias: data.dependencias || []
    };
  }

  private mapIndicadorToInterface(data: any): Indicador {
    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || '',
      valorAtual: data.valor_atual || 0,
      meta: data.meta || 0,
      unidade: data.unidade || '',
      frequencia: data.frequencia || 'mensal',
      fonte: data.fonte || '',
      ultimaAtualizacao: data.ultima_atualizacao || data.created_at
    };
  }
}

// Export singleton instance
export const planoDiretorService = new PlanoDiretorService();

