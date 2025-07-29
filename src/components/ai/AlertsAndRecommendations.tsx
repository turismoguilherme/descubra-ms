import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Lightbulb,
  Settings,
  Bell,
  X,
  Eye,
  Star,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { 
  proactiveAlertsService, 
  Alert 
} from '@/services/ai/ProactiveAlertsService';
import { 
  personalizedRecommendationsService, 
  PersonalizedRecommendation,
  UserProfile 
} from '@/services/ai/PersonalizedRecommendationsService';

interface AlertsAndRecommendationsProps {
  className?: string;
}

const AlertsAndRecommendations: React.FC<AlertsAndRecommendationsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { user, cityId, regionId } = useRoleBasedAccess();
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    loadData();
  }, [cityId, regionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar alertas
      const activeAlerts = await proactiveAlertsService.getActiveAlerts(cityId, regionId);
      setAlerts(activeAlerts);

      // Criar perfil do usuário
      const userProfile: UserProfile = {
        role: user?.user_metadata?.role || 'Gestor Municipal',
        cityId,
        regionId,
        interests: ['marketing', 'infrastructure', 'events'],
        previousActions: [],
        preferredTimeframes: ['short_term', 'medium_term']
      };

      // Carregar recomendações personalizadas
      const personalizedRecs = await personalizedRecommendationsService.generatePersonalizedRecommendations(userProfile);
      setRecommendations(personalizedRecs);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar alertas e recomendações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await proactiveAlertsService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      ));
      toast({
        title: "✅ Alerta Reconhecido",
        description: "O alerta foi marcado como reconhecido.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível reconhecer o alerta.",
        variant: "destructive"
      });
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await proactiveAlertsService.resolveAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      ));
      toast({
        title: "✅ Alerta Resolvido",
        description: "O alerta foi marcado como resolvido.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível resolver o alerta.",
        variant: "destructive"
      });
    }
  };

  const handleImplementRecommendation = async (recommendationId: string) => {
    try {
      await personalizedRecommendationsService.markAsImplemented(recommendationId);
      toast({
        title: "✅ Recomendação Implementada",
        description: "A recomendação foi marcada como implementada.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível marcar a recomendação.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'urgent': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Target className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'infrastructure': return <Settings className="h-4 w-4 text-gray-500" />;
      case 'events': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'capacity': return <Users className="h-4 w-4 text-orange-500" />;
      case 'experience': return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <Lightbulb className="h-4 w-4 text-green-500" />;
    }
  };

  const getTimeframeText = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return 'Imediato';
      case 'short_term': return 'Curto Prazo';
      case 'medium_term': return 'Médio Prazo';
      case 'long_term': return 'Longo Prazo';
      default: return 'A definir';
    }
  };

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum Alerta Ativo</h3>
            <p className="text-gray-500">Todos os sistemas estão funcionando normalmente.</p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${getPriorityColor(alert.priority)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(alert.priority)}
                  <CardTitle className="text-base">{alert.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                    {alert.priority === 'critical' ? 'Crítico' : 
                     alert.priority === 'urgent' ? 'Urgente' :
                     alert.priority === 'high' ? 'Alto' :
                     alert.priority === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                  <Badge variant="secondary">
                    {alert.affectedArea}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{alert.description}</p>
              
              {/* Métricas */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Atual:</span>
                    <span className="font-medium ml-1">{alert.metrics.current}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Limite:</span>
                    <span className="font-medium ml-1">{alert.metrics.threshold}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tendência:</span>
                    <span className={`font-medium ml-1 ${
                      alert.metrics.trend === 'increasing' ? 'text-green-600' :
                      alert.metrics.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {alert.metrics.trend === 'increasing' ? '↗️ Subindo' :
                       alert.metrics.trend === 'decreasing' ? '↘️ Descendo' : '➡️ Estável'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recomendações */}
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Ações Recomendadas:
                </h4>
                <ul className="space-y-1">
                  {alert.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                {alert.status === 'active' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Reconhecer
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolver
                    </Button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <Button 
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolver
                  </Button>
                )}
                {alert.status === 'resolved' && (
                  <Badge variant="outline" className="text-green-600">
                    ✅ Resolvido
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando Recomendações</h3>
            <p className="text-gray-500">Analisando dados para gerar recomendações personalizadas...</p>
          </CardContent>
        </Card>
      ) : (
        recommendations.map((rec) => (
          <Card key={rec.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rec.category)}
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                    {rec.priority === 'urgent' ? 'Urgente' :
                     rec.priority === 'high' ? 'Alto' :
                     rec.priority === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                  <Badge variant="secondary">
                    {getTimeframeText(rec.timeframe)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{rec.description}</p>
              
              {/* Justificativa */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-sm text-blue-900 mb-1">Por que esta recomendação?</h4>
                <p className="text-sm text-blue-800">{rec.reasoning}</p>
              </div>

              {/* Impacto Esperado */}
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Impacto Esperado:
                </h4>
                <p className="text-sm text-gray-700">{rec.expectedImpact}</p>
              </div>

              {/* Recursos Necessários */}
              {rec.resources.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Recursos Necessários:</h4>
                  <div className="flex flex-wrap gap-1">
                    {rec.resources.map((resource, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* KPIs */}
              {rec.kpis.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">KPIs para Acompanhar:</h4>
                  <div className="flex flex-wrap gap-1">
                    {rec.kpis.map((kpi, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {kpi}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Confiança e Ações */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Confiança:</span>
                  <Badge variant="outline">
                    {Math.round(rec.confidence * 100)}%
                  </Badge>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleImplementRecommendation(rec.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Implementar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-500" />
            Alertas e Recomendações
          </h2>
          <p className="text-gray-600 mt-1">
            Monitoramento inteligente e recomendações personalizadas
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Alertas Ativos</span>
            </div>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">Requer atenção</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Reconhecidos</span>
            </div>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'acknowledged').length}
            </div>
            <p className="text-xs text-gray-500">Em andamento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Recomendações</span>
            </div>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-gray-500">Disponíveis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Prioridade Alta</span>
            </div>
            <div className="text-2xl font-bold">
              {[...alerts, ...recommendations].filter(item => 
                item.priority === 'high' || item.priority === 'urgent' || item.priority === 'critical'
              ).length}
            </div>
            <p className="text-xs text-gray-500">Itens urgentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas Proativos
            {alerts.filter(a => a.status === 'active').length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {alerts.filter(a => a.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendações
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-6">
          {renderAlerts()}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {renderRecommendations()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsAndRecommendations; 