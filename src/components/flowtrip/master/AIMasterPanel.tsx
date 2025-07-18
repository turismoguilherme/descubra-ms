import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Users, DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AIMasterInsight, StateAnalytics } from '@/types/flowtrip';

export const AIMasterPanel: React.FC = () => {
  const [insights, setInsights] = useState<AIMasterInsight[]>([]);
  const [analytics, setAnalytics] = useState<StateAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIMasterData();
  }, []);

  const loadAIMasterData = async () => {
    try {
      setLoading(true);
      
      // Simulando insights da IA Master
      const mockInsights: AIMasterInsight[] = [
        {
          id: '1',
          insight_type: 'performance',
          priority: 'high',
          title: 'Performance do Estado MS',
          description: 'Engagement dos usuários cresceu 35% este mês. Recomendar aumentar eventos.',
          state_code: 'ms',
          actions: ['Criar mais eventos', 'Expandir gamificação'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          insight_type: 'billing',
          priority: 'medium',
          title: 'Faturamento Otimizado',
          description: 'Oportunidade de upgrade para plano Enterprise detectada.',
          actions: ['Contatar cliente', 'Preparar proposta'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          insight_type: 'support',
          priority: 'critical',
          title: 'Suporte Pendente',
          description: '12 tickets de suporte aguardando resposta há mais de 24h.',
          actions: ['Priorizar atendimento', 'Automatizar respostas comuns'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          insight_type: 'analytics',
          priority: 'low',
          title: 'Nova Tendência Identificada',
          description: 'Turismo de aventura crescendo 40%. Sugerir novos destinos.',
          state_code: 'ms',
          actions: ['Analisar destinos', 'Criar categoria'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setInsights(mockInsights);

      // Carregar analytics reais dos estados
      const { data: states } = await supabase
        .from('flowtrip_states')
        .select('*')
        .eq('is_active', true);

      if (states) {
        const analyticsData: StateAnalytics[] = states.map(state => ({
          state_code: state.code,
          total_users: Math.floor(Math.random() * 10000) + 1000,
          active_users: Math.floor(Math.random() * 5000) + 500,
          points_distributed: Math.floor(Math.random() * 100000) + 10000,
          stamps_collected: Math.floor(Math.random() * 50000) + 5000,
          events_created: Math.floor(Math.random() * 100) + 20,
          destinations_visited: Math.floor(Math.random() * 500) + 100,
          monthly_growth: Math.floor(Math.random() * 50) + 5,
          engagement_score: Math.floor(Math.random() * 40) + 60
        }));
        
        setAnalytics(analyticsData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados IA Master:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'high': return <Activity className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header IA Master */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            🤖 IA Master - Gerenciamento Inteligente FlowTrip
          </CardTitle>
          <p className="text-primary-foreground/80">
            Monitoramento avançado, insights automáticos e otimização contínua
          </p>
        </CardHeader>
      </Card>

      {/* Insights da IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Insights Automáticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getPriorityIcon(insight.priority)}
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      {insight.state_code && (
                        <Badge variant="outline" className="mt-1">
                          {insight.state_code.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(insight.priority) as any}>
                    {insight.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {insight.actions.map((action, idx) => (
                    <Button key={idx} variant="outline" size="sm">
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Analytics Estados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance dos Estados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.map((state) => (
              <div key={state.state_code} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{state.state_code.toUpperCase()}</h4>
                  <Badge variant="secondary">
                    +{state.monthly_growth}% este mês
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{state.total_users.toLocaleString()} usuários</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>{state.engagement_score}% engajamento</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>🎛️ Ações Rápidas da IA Master</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Activity className="w-6 h-6" />
              Verificar Todos os Estados
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              Gerar Relatório de Faturamento
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              Otimizar Performance
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Brain className="w-6 h-6" />
              Responder Suporte Pendente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};