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
  FileText,
  Plus,
  Sparkles,
  Loader2,
  ClipboardList,
  History,
  AlertTriangle,
  ExternalLink
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
import PlanoDiretorDocumentos from './PlanoDiretorDocumentos';
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

  console.log('PlanoDiretorManager: Componente renderizado. user:', user, 'authLoading:', authLoading);

  useEffect(() => {
    console.log('PlanoDiretorManager: useEffect disparado. user?.id:', user?.id, 'authLoading:', authLoading);
    
    // Aguardar autenticação carregar
    if (authLoading) {
      console.log('PlanoDiretorManager: Aguardando autenticação...');
      return;
    }

    if (user?.id) {
      console.log('PlanoDiretorManager: Chamando loadPlanos para user.id:', user.id);
      loadPlanos();
    } else {
      console.log('PlanoDiretorManager: Usuário não autenticado, setLoading(false)');
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (planoAtual?.id) {
      loadKPIs();
    }
  }, [planoAtual?.id]);

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
      
      // Selecionar o primeiro plano ativo ou mais recente
      if (data.length > 0) {
        const planoAtivo = data.find(p => p.status !== 'concluido') || data[0];
        console.log('PlanoDiretorManager: Plano ativo selecionado:', planoAtivo.id);
        await loadPlanoCompleto(planoAtivo.id);
      } else {
        console.log('PlanoDiretorManager: Nenhum plano encontrado');
        setPlanoAtual(null);
      }
    } catch (error: any) {
      console.error('PlanoDiretorManager: Erro ao carregar planos:', error);
      
      // Verificar se é erro de migration
      const isMigrationError = error?.isMigrationError || 
                                error?.message?.includes('migrations') || 
                                error?.message?.includes('Tabela não encontrada') || 
                                error?.message?.includes('404') ||
                                error?.code === '42P01';
      
      if (isMigrationError) {
        setMigrationError(true);
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
      
      toast({
        title: 'Sucesso',
        description: 'Plano diretor criado com sucesso!',
      });
    } catch (error: any) {
      console.error('PlanoDiretorManager: Erro ao criar plano:', error);
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
        setMigrationError(true);
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

  if (loading) {
    console.log('PlanoDiretorManager: Mostrando tela de loading');
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando planos diretores...</span>
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
                onClick={() => {
                  console.log('PlanoDiretorManager: Clicou em "Entendi, continuar"');
                  setMigrationError(false);
                }}
                className="w-full sm:w-auto"
              >
                Entendi, continuar
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
                  user: user?.id,
                  disabled: creating || migrationError
                });
                e.preventDefault();
                e.stopPropagation();
                
                if (creating || migrationError) {
                  console.warn('PlanoDiretorManager: Botão desabilitado, não executando');
                  return;
                }
                
                console.log('PlanoDiretorManager: Chamando handleCreatePlano...');
                handleCreatePlano();
              }} 
              disabled={creating || migrationError}
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
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <div>Debug: creating={creating ? 'true' : 'false'}, migrationError={migrationError ? 'true' : 'false'}, user={user?.id || 'null'}</div>
              <div>Botão desabilitado: {(creating || migrationError) ? 'SIM' : 'NÃO'}</div>
            </div>
            {/* Botão de teste direto */}
            <button
              type="button"
              onClick={() => {
                console.log('PlanoDiretorManager: Botão de teste clicado!');
                handleCreatePlano();
              }}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Teste Direto (sem Button component)
            </button>
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
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-1">
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
          <TabsTrigger value="documentos" className="text-xs md:text-sm">
            <FileText className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="text-xs md:text-sm">
            <History className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {kpis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Visitantes</h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {kpis.visitantes.atual.toLocaleString()} / {kpis.visitantes.meta.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpis.visitantes.percentual.toFixed(1)}% da meta
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Receita</h3>
                      <p className="text-3xl font-bold text-green-600">
                        R$ {(kpis.receita.atual / 1000000).toFixed(1)}M / R$ {(kpis.receita.meta / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpis.receita.percentual.toFixed(1)}% da meta
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">Ações</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {kpis.acoes.concluidas} / {kpis.acoes.total}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpis.acoes.percentual.toFixed(1)}% concluídas
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">Satisfação</h3>
                      <p className="text-2xl font-bold text-orange-600">
                        {kpis.satisfacao.atual.toFixed(1)} / {kpis.satisfacao.meta.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpis.satisfacao.percentual.toFixed(1)}% da meta
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h3 className="font-semibold text-indigo-900 mb-2">Investimentos</h3>
                      <p className="text-2xl font-bold text-indigo-600">
                        R$ {(kpis.investimentos.realizado / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {kpis.investimentos.percentual.toFixed(1)}% do planejado
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Carregando KPIs...</p>
              )}
            </CardContent>
          </Card>
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

        <TabsContent value="documentos" className="mt-6">
          <PlanoDiretorDocumentos 
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

