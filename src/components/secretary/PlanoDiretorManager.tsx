// @ts-nocheck
/**
 * Plano Diretor de Turismo Manager
 * Componente principal para gerenciamento completo do Plano Diretor
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Target, 
  BarChart3, 
  Lightbulb, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Plus,
  Sparkles,
  Loader2,
  ClipboardList,
  History,
  AlertTriangle,
  ExternalLink,
  AlertCircle,
  Clock,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, PlanoDiretorDocument, KPIPlanoDiretor } from '@/services/public/planoDiretorService';
import PlanoDiretorDiagnostico from './PlanoDiretorDiagnostico';
import PlanoDiretorObjetivos from './PlanoDiretorObjetivos';
import PlanoDiretorEstrategias from './PlanoDiretorEstrategias';
import PlanoDiretorAcoes from './PlanoDiretorAcoes';
import PlanoDiretorIndicadores from './PlanoDiretorIndicadores';
import PlanoDiretorColaboradores from './PlanoDiretorColaboradores';
import PlanoDiretorHistorico from './PlanoDiretorHistorico';

interface PlanoDiretorManagerProps {
  municipioNome?: string;
  municipioUf?: string;
}

const PlanoDiretorManager: React.FC<PlanoDiretorManagerProps> = ({ 
  municipioNome = 'Campo Grande',
  municipioUf = 'MS'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [planos, setPlanos] = useState<PlanoDiretorDocument[]>([]);
  const [planoAtual, setPlanoAtual] = useState<PlanoDiretorDocument | null>(null);
  const [kpis, setKPIs] = useState<KPIPlanoDiretor | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [migrationError, setMigrationError] = useState(false);
  const [checkingMigrations, setCheckingMigrations] = useState(true);
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [acoes, setAcoes] = useState<any[]>([]);

  console.log('PlanoDiretorManager: Componente renderizado. user:', user, 'authLoading:', authLoading);

  // Verificar migrations no início
  useEffect(() => {
    const checkMigrations = async () => {
      try {
        setCheckingMigrations(true);
        const migrationsExecuted = await planoDiretorService.checkMigrationsExecuted();
        setMigrationError(!migrationsExecuted);
        console.log('PlanoDiretorManager: Migrations executadas:', migrationsExecuted);
      } catch (error) {
        console.error('PlanoDiretorManager: Erro ao verificar migrations:', error);
        setMigrationError(true);
      } finally {
        setCheckingMigrations(false);
      }
    };

    checkMigrations();
  }, []);

  useEffect(() => {
    console.log('PlanoDiretorManager: useEffect disparado. user?.id:', user?.id, 'authLoading:', authLoading);
    
    // Aguardar autenticação carregar
    if (authLoading) {
      console.log('PlanoDiretorManager: Aguardando autenticação...');
      return;
    }

    // Aguardar verificação de migrations
    if (checkingMigrations) {
      console.log('PlanoDiretorManager: Aguardando verificação de migrations...');
      return;
    }

    if (user?.id) {
      console.log('PlanoDiretorManager: Chamando loadPlanos para user.id:', user.id);
      loadPlanos();
    } else {
      console.log('PlanoDiretorManager: Usuário não autenticado, setLoading(false)');
      setLoading(false);
    }
  }, [user?.id, authLoading, checkingMigrations]);

  useEffect(() => {
    if (planoAtual?.id) {
      loadKPIs();
      loadDashboardData();
    }
  }, [planoAtual?.id]);

  const loadDashboardData = async () => {
    if (!planoAtual?.id) return;
    
    try {
      const [objetivosData, acoesData] = await Promise.all([
        planoDiretorService.getObjetivos(planoAtual.id),
        planoDiretorService.getAcoes(planoAtual.id)
      ]);
      setObjetivos(objetivosData);
      setAcoes(acoesData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const loadPlanos = async () => {
    if (!user?.id) {
      console.log('PlanoDiretorManager: Usuário não autenticado, parando carregamento');
      setLoading(false);
      return;
    }

    try {
      console.log('PlanoDiretorManager: Iniciando carregamento de planos para usuário:', user.id);
      setLoading(true);
      const data = await planoDiretorService.listPlanosDiretores(user.id);
      console.log('PlanoDiretorManager: Planos carregados:', data.length, data);
      setPlanos(data);
      
      // Se chegou aqui, as migrations foram executadas com sucesso
      setMigrationError(false);
      
      // Selecionar o primeiro plano ativo ou mais recente
      if (data.length > 0) {
        const planoAtivo = data.find(p => p.status !== 'concluido') || data[0];
        console.log('PlanoDiretorManager: Plano ativo selecionado:', planoAtivo.id);
        await loadPlanoCompleto(planoAtivo.id);
      } else {
        console.log('PlanoDiretorManager: Nenhum plano encontrado');
        setPlanoAtual(null);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('PlanoDiretorManager: Erro ao carregar planos:', err);
      
      // Verificar se é erro de migration
      const isMigrationError = error?.isMigrationError || 
                                error?.message?.includes('migrations') || 
                                error?.message?.includes('Tabela não encontrada') || 
                                error?.message?.includes('404') ||
                                error?.code === '42P01';
      
      if (isMigrationError) {
        // Re-verificar se as migrations foram executadas
        try {
          const migrationsExecuted = await planoDiretorService.checkMigrationsExecuted();
          setMigrationError(!migrationsExecuted);
        } catch (checkError) {
          setMigrationError(true);
        }
        
        toast({
          title: 'Migrations Não Executadas',
          description: 'As tabelas do Plano Diretor não foram criadas. Execute as migrations no Supabase antes de usar este módulo.',
          variant: 'destructive',
          duration: 10000
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os planos diretores.',
          variant: 'destructive'
        });
      }
      
      setPlanoAtual(null);
    } finally {
      console.log('PlanoDiretorManager: Finalizando carregamento, setLoading(false)');
      setLoading(false);
    }
  };

  const loadPlanoCompleto = async (id: string) => {
    try {
      const plano = await planoDiretorService.getPlanoDiretorById(id);
      if (plano) {
        setPlanoAtual(plano);
      } else {
        console.warn('Plano não encontrado:', id);
        setPlanoAtual(null);
      }
    } catch (error) {
      console.error('Erro ao carregar plano completo:', error);
      setPlanoAtual(null);
    }
  };

  const loadKPIs = async () => {
    if (!planoAtual) return;

    try {
      const kpisData = await planoDiretorService.getKPIs(planoAtual.id);
      setKPIs(kpisData);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    }
  };

  const handleCreatePlano = async () => {
    if (!user?.id) {
      console.error('PlanoDiretorManager: Tentativa de criar plano sem usuário autenticado');
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para criar um plano.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('PlanoDiretorManager: Iniciando criação de plano para usuário:', user.id);
      setCreating(true);
      
      const planoData = {
        titulo: `Plano Diretor de Turismo - ${municipioNome}`,
        municipioNome,
        municipioUf,
        periodoInicio: new Date().toISOString().split('T')[0],
        periodoFim: new Date(Date.now() + 365 * 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        criadorId: user.id
      };
      
      console.log('PlanoDiretorManager: Dados do plano:', planoData);
      
      const novoPlano = await planoDiretorService.createPlanoDiretor(planoData);
      console.log('PlanoDiretorManager: Plano criado:', novoPlano);

      await loadPlanoCompleto(novoPlano.id);
      setActiveTab('diagnostico');
      
      // Se chegou aqui, as migrations foram executadas com sucesso
      setMigrationError(false);
      
      toast({
        title: 'Sucesso',
        description: 'Plano diretor criado com sucesso!',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('PlanoDiretorManager: Erro ao criar plano:', err);
      const errorMessage = error?.message || 'Não foi possível criar o plano diretor. Verifique se as migrations foram executadas.';
      
      // Detectar se é erro de migration ou de usuário
      const isMigrationError = error?.isMigrationError ||
                                errorMessage.includes('migrations') || 
                                errorMessage.includes('Tabela não encontrada') || 
                                errorMessage.includes('404') ||
                                error?.code === '42P01';
      
      const isUserError = error?.isUserError || 
                          errorMessage.includes('usuário não existe') ||
                          errorMessage.includes('foreign key') ||
                          error?.code === '23503';
      
      if (isMigrationError) {
        // Re-verificar se as migrations foram executadas
        try {
          const migrationsExecuted = await planoDiretorService.checkMigrationsExecuted();
          setMigrationError(!migrationsExecuted);
        } catch (checkError) {
          setMigrationError(true);
        }
      }
      
      // Se for erro de usuário, mostrar mensagem específica
      if (isUserError && !isMigrationError) {
        toast({
          title: 'Erro de Autenticação',
          description: 'O usuário não existe no Supabase Auth. Para usuários de teste, é necessário criar o usuário no Supabase ou ajustar as políticas RLS.',
          variant: 'destructive',
          duration: 10000
        });
      } else {
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
          duration: 10000 // 10 segundos para dar tempo de ler
        });
      }
    } finally {
      // Reset imediato do estado
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      rascunho: 'bg-gray-500',
      revisao: 'bg-yellow-500',
      aprovado: 'bg-green-500',
      implementacao: 'bg-blue-500',
      concluido: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      rascunho: 'Rascunho',
      revisao: 'Em Revisão',
      aprovado: 'Aprovado',
      implementacao: 'Em Implementação',
      concluido: 'Concluído'
    };
    return labels[status] || status;
  };

  console.log('PlanoDiretorManager: Renderizando. loading:', loading, 'planoAtual:', planoAtual);

  if (loading || checkingMigrations) {
    console.log('PlanoDiretorManager: Mostrando tela de loading');
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {checkingMigrations ? 'Verificando migrations...' : 'Carregando planos diretores...'}
        </span>
      </div>
    );
  }

  if (!planoAtual) {
    console.log('PlanoDiretorManager: Renderizando tela sem plano. migrationError:', migrationError, 'creating:', creating, 'loading:', loading);
    
    return (
      <div className="p-6 space-y-4">
        {migrationError && (
          <Card className="border-orange-500 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Migrations Não Executadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-orange-800">
                As tabelas do Plano Diretor não foram criadas no banco de dados. É necessário executar as migrations no Supabase antes de usar este módulo.
              </p>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <p className="font-semibold text-sm text-gray-700 mb-2">Como executar as migrations:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Acesse o Supabase Dashboard</li>
                  <li>Vá em SQL Editor</li>
                  <li>Execute as migrations na ordem: tabelas, funções, RLS</li>
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                  Consulte o arquivo <code className="bg-gray-100 px-1 rounded">docs/INSTRUCOES_MIGRATIONS_PLANO_DIRETOR.md</code> para instruções detalhadas.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  console.log('PlanoDiretorManager: Clicou em "Entendi, continuar"');
                  // Re-verificar se as migrations foram executadas
                  try {
                    setCheckingMigrations(true);
                    const migrationsExecuted = await planoDiretorService.checkMigrationsExecuted();
                    setMigrationError(!migrationsExecuted);
                    if (migrationsExecuted) {
                      toast({
                        title: 'Sucesso',
                        description: 'Migrations detectadas! Recarregando...',
                      });
                      // Recarregar planos se o usuário estiver autenticado
                      if (user?.id) {
                        await loadPlanos();
                      }
                    }
                  } catch (error) {
                    console.error('PlanoDiretorManager: Erro ao re-verificar migrations:', error);
                  } finally {
                    setCheckingMigrations(false);
                  }
                }}
                className="w-full sm:w-auto"
                disabled={checkingMigrations}
              >
                {checkingMigrations ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar novamente'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Plano Diretor de Turismo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Você ainda não possui um Plano Diretor de Turismo cadastrado.
            </p>
            <Button 
              onClick={(e) => {
                console.log('PlanoDiretorManager: Botão clicado!', { 
                  creating, 
                  migrationError, 
                  user: user?.id
                });
                e.preventDefault();
                e.stopPropagation();
                
                if (creating) {
                  console.warn('PlanoDiretorManager: Botão desabilitado (criando), não executando');
                  return;
                }
                
                console.log('PlanoDiretorManager: Chamando handleCreatePlano...');
                handleCreatePlano();
              }} 
              disabled={creating}
              className="w-full sm:w-auto"
              type="button"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Plano Diretor
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header com informações do plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                {planoAtual.titulo}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {planoAtual.municipio} - {planoAtual.municipioUf} • {planoAtual.periodo}
              </p>
            </div>
            <Badge className={getStatusColor(planoAtual.status)}>
              {getStatusLabel(planoAtual.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* KPIs rápidos */}
          {kpis && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{kpis.acoes.percentual.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Ações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{kpis.visitantes.percentual.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Visitantes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{kpis.receita.percentual.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Receita</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{kpis.satisfacao.percentual.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Satisfação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{kpis.investimentos.percentual.toFixed(0)}%</p>
                <p className="text-xs text-gray-600">Investimentos</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-1">
          <TabsTrigger value="dashboard" className="text-xs md:text-sm">
            <BarChart3 className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostico" className="text-xs md:text-sm">
            <ClipboardList className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Diagnóstico</span>
          </TabsTrigger>
          <TabsTrigger value="objetivos" className="text-xs md:text-sm">
            <Target className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Objetivos</span>
          </TabsTrigger>
          <TabsTrigger value="estrategias" className="text-xs md:text-sm">
            <Lightbulb className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Estratégias</span>
          </TabsTrigger>
          <TabsTrigger value="acoes" className="text-xs md:text-sm">
            <CheckCircle className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Ações</span>
          </TabsTrigger>
          <TabsTrigger value="indicadores" className="text-xs md:text-sm">
            <TrendingUp className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Indicadores</span>
          </TabsTrigger>
          <TabsTrigger value="colaboradores" className="text-xs md:text-sm">
            <Users className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Colaboradores</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-xs md:text-sm">
            <History className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="space-y-6">
            {/* Status do Plano */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Status do Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={`${getStatusColor(planoAtual.status)} text-white`}>
                      {getStatusLabel(planoAtual.status)}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Versão {planoAtual.versao} • Período: {planoAtual.periodo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="text-sm font-medium">
                      {new Date(planoAtual.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Progresso Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {objetivos.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Objetivos Concluídos</span>
                        <span className="font-semibold">
                          {objetivos.filter(o => o.status === 'concluido').length} / {objetivos.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ 
                            width: `${objetivos.length > 0 ? (objetivos.filter(o => o.status === 'concluido').length / objetivos.length) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {objetivos.length > 0 ? ((objetivos.filter(o => o.status === 'concluido').length / objetivos.length) * 100).toFixed(0) : 0}% dos objetivos concluídos
                      </p>
                    </div>
                    {kpis && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{kpis.acoes.percentual.toFixed(0)}%</p>
                          <p className="text-xs text-gray-600">Ações</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{kpis.visitantes.percentual.toFixed(0)}%</p>
                          <p className="text-xs text-gray-600">Visitantes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{kpis.receita.percentual.toFixed(0)}%</p>
                          <p className="text-xs text-gray-600">Receita</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{kpis.satisfacao.percentual.toFixed(0)}%</p>
                          <p className="text-xs text-gray-600">Satisfação</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Nenhum objetivo cadastrado ainda. Comece criando objetivos na aba "Objetivos".</p>
                )}
              </CardContent>
            </Card>

            {/* Ações em Andamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Ações em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {acoes.length > 0 ? (
                  <div className="space-y-3">
                    {acoes
                      .filter(a => a.status === 'em_execucao' || a.status === 'planejada')
                      .slice(0, 5)
                      .map((acao) => (
                        <div key={acao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{acao.titulo}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(acao.prazo).toLocaleDateString('pt-BR')}
                              </span>
                              <span>Progresso: {acao.progresso.toFixed(0)}%</span>
                            </div>
                          </div>
                          <Badge className={acao.status === 'em_execucao' ? 'bg-blue-500' : 'bg-gray-500'}>
                            {acao.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    {acoes.filter(a => a.status === 'em_execucao' || a.status === 'planejada').length === 0 && (
                      <p className="text-gray-600 text-sm">Nenhuma ação em andamento no momento.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Nenhuma ação cadastrada ainda.</p>
                )}
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Alertas e Avisos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const alertas: Array<{ tipo: 'warning' | 'info'; mensagem: string }> = [];
                    
                    // Verificar ações atrasadas
                    const acoesAtrasadas = acoes.filter(a => {
                      const prazo = new Date(a.prazo);
                      const hoje = new Date();
                      return prazo < hoje && a.status !== 'concluida' && a.status !== 'cancelada';
                    });
                    
                    if (acoesAtrasadas.length > 0) {
                      alertas.push({
                        tipo: 'warning',
                        mensagem: `${acoesAtrasadas.length} ação(ões) com prazo vencido`
                      });
                    }

                    // Verificar metas não alcançadas
                    if (kpis) {
                      if (kpis.visitantes.percentual < 80) {
                        alertas.push({
                          tipo: 'warning',
                          mensagem: `Meta de visitantes em ${kpis.visitantes.percentual.toFixed(0)}% - abaixo do esperado`
                        });
                      }
                      if (kpis.receita.percentual < 80) {
                        alertas.push({
                          tipo: 'warning',
                          mensagem: `Meta de receita em ${kpis.receita.percentual.toFixed(0)}% - abaixo do esperado`
                        });
                      }
                    }

                    // Verificar objetivos sem progresso
                    const objetivosSemProgresso = objetivos.filter(o => o.progresso === 0 && o.status !== 'concluido');
                    if (objetivosSemProgresso.length > 0) {
                      alertas.push({
                        tipo: 'info',
                        mensagem: `${objetivosSemProgresso.length} objetivo(s) ainda sem progresso`
                      });
                    }

                    if (alertas.length === 0) {
                      return (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Tudo em dia! Nenhum alerta no momento.</span>
                        </div>
                      );
                    }

                    return alertas.map((alerta, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded ${
                          alerta.tipo === 'warning' ? 'bg-orange-50 text-orange-800' : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{alerta.mensagem}</span>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostico" className="mt-6">
          <PlanoDiretorDiagnostico 
            planoId={planoAtual.id}
            municipioNome={municipioNome}
            municipioUf={municipioUf}
            onUpdate={loadPlanoCompleto}
          />
        </TabsContent>

        <TabsContent value="objetivos" className="mt-6">
          <PlanoDiretorObjetivos 
            planoId={planoAtual.id}
            onUpdate={loadPlanoCompleto}
          />
        </TabsContent>

        <TabsContent value="estrategias" className="mt-6">
          <PlanoDiretorEstrategias 
            planoId={planoAtual.id}
            onUpdate={loadPlanoCompleto}
          />
        </TabsContent>

        <TabsContent value="acoes" className="mt-6">
          <PlanoDiretorAcoes 
            planoId={planoAtual.id}
            onUpdate={loadPlanoCompleto}
          />
        </TabsContent>

        <TabsContent value="indicadores" className="mt-6">
          <PlanoDiretorIndicadores 
            planoId={planoAtual.id}
            onUpdate={loadPlanoCompleto}
          />
        </TabsContent>

        <TabsContent value="colaboradores" className="mt-6">
          <PlanoDiretorColaboradores 
            planoId={planoAtual.id}
            onUpdate={loadPlanoCompleto}
          />
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <PlanoDiretorHistorico 
            planoId={planoAtual.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanoDiretorManager;

