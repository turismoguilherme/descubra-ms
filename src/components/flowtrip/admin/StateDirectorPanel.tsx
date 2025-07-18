import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Settings,
  FileText,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { useFlowTripAuth } from '@/hooks/useFlowTripAuth';
import { supabase } from '@/integrations/supabase/client';

export const StateDirectorPanel: React.FC = () => {
  const { currentState } = useFlowTripAuth();
  const [analytics, setAnalytics] = useState({
    total_municipalities: 5,
    active_users: 2847,
    total_destinations: 45,
    monthly_events: 12,
    growth_rate: 18,
    engagement_score: 84
  });

  useEffect(() => {
    if (currentState) {
      loadStateAnalytics();
    }
  }, [currentState]);

  const loadStateAnalytics = async () => {
    try {
      // Carregar dados reais do estado
      // Simulação por enquanto
      console.log('Carregando analytics para estado:', currentState?.code);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  if (!currentState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Carregando dados do estado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Diretor Estadual */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentState.logo_url && (
            <img 
              src={currentState.logo_url} 
              alt={`${currentState.name} Logo`}
              className="w-16 h-16 rounded-lg border-2"
              style={{ borderColor: currentState.primary_color }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: currentState.primary_color }}>
              Diretor Estadual - {currentState.name}
            </h1>
            <p className="text-muted-foreground">
              Gestão completa do turismo estadual e coordenação municipal
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Building2 className="w-4 h-4 mr-2" />
          Plano {currentState.plan_type}
        </Badge>
      </div>

      {/* Métricas do Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municípios Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_municipalities}</div>
            <p className="text-xs text-muted-foreground">
              Municípios participantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.active_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.growth_rate}% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinos Cadastrados</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_destinations}</div>
            <p className="text-xs text-muted-foreground">
              Locais turísticos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.monthly_events}</div>
            <p className="text-xs text-muted-foreground">
              Eventos programados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{analytics.growth_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagement_score}%</div>
            <p className="text-xs text-muted-foreground">
              Score de engajamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navegação do Diretor */}
      <Card>
        <CardHeader>
          <CardTitle>🏛️ Gestão Estadual de Turismo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Coordene municípios, gerencie destinos e monitore o desempenho estadual
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Building2 className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Municípios</div>
                <div className="text-xs text-muted-foreground">Gestão municipal</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Destinos</div>
                <div className="text-xs text-muted-foreground">Locais turísticos</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Eventos</div>
                <div className="text-xs text-muted-foreground">Programação estadual</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Usuários</div>
                <div className="text-xs text-muted-foreground">Gestão de usuários</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Performance estadual</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Relatórios</div>
                <div className="text-xs text-muted-foreground">Reports executivos</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Target className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Metas</div>
                <div className="text-xs text-muted-foreground">Objetivos estratégicos</div>
              </div>
            </Button>

            <Button 
              className="h-20 flex-col gap-2"
              style={{ 
                backgroundColor: currentState.primary_color,
                borderColor: currentState.primary_color 
              }}
            >
              <Settings className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Configurações</div>
                <div className="text-xs">Estado {currentState.code.toUpperCase()}</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Ações Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Revisar novos destinos</h4>
                <Badge variant="destructive">Urgente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                3 novos destinos aguardando aprovação municipal
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Relatório mensal</h4>
                <Badge variant="secondary">Pendente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Consolidar dados de todos os municípios
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Reunião IGR</h4>
                <Badge variant="outline">Agendada</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Coordenação com gestores regionais
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance do Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cobertura Municipal</span>
                  <span>5/79 municípios (6%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: '6%',
                      backgroundColor: currentState.primary_color 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Engajamento dos Usuários</span>
                  <span>84%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: '84%',
                      backgroundColor: currentState.secondary_color 
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Meta Anual</span>
                  <span>67% alcançada</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: '67%',
                      backgroundColor: currentState.accent_color 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};