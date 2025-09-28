import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Brain,
  Zap,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';

interface ReliabilityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface GuataSession {
  id: string;
  timestamp: string;
  duration: number;
  success: boolean;
  userSatisfaction?: number;
  responseTime: number;
  errorMessage?: string;
}

const GuataReliabilityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ReliabilityMetric[]>([
    {
      id: 'uptime',
      name: 'Uptime do Sistema',
      value: 99.8,
      target: 99.5,
      status: 'excellent',
      trend: 'up',
      description: 'Tempo de funcionamento do sistema Guatá'
    },
    {
      id: 'response-time',
      name: 'Tempo de Resposta',
      value: 1.2,
      target: 2.0,
      status: 'excellent',
      trend: 'down',
      description: 'Tempo médio de resposta em segundos'
    },
    {
      id: 'accuracy',
      name: 'Precisão das Respostas',
      value: 94.2,
      target: 90.0,
      status: 'excellent',
      trend: 'up',
      description: 'Taxa de precisão das respostas do Guatá'
    },
    {
      id: 'user-satisfaction',
      name: 'Satisfação do Usuário',
      value: 4.6,
      target: 4.0,
      status: 'excellent',
      trend: 'up',
      description: 'Avaliação média dos usuários (1-5)'
    },
    {
      id: 'error-rate',
      name: 'Taxa de Erro',
      value: 0.8,
      target: 2.0,
      status: 'good',
      trend: 'down',
      description: 'Percentual de erros nas interações'
    },
    {
      id: 'concurrent-users',
      name: 'Usuários Simultâneos',
      value: 245,
      target: 500,
      status: 'good',
      trend: 'up',
      description: 'Número máximo de usuários simultâneos'
    }
  ]);

  const [recentSessions, setRecentSessions] = useState<GuataSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateMockSessions();
  }, []);

  const generateMockSessions = () => {
    const sessions: GuataSession[] = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(now.getTime() - i * 300000); // 5 min intervals
      sessions.push({
        id: `session-${i}`,
        timestamp: timestamp.toISOString(),
        duration: Math.random() * 300 + 30, // 30-330 seconds
        success: Math.random() > 0.1, // 90% success rate
        userSatisfaction: Math.random() > 0.2 ? Math.random() * 2 + 3 : undefined, // 3-5 rating
        responseTime: Math.random() * 3 + 0.5, // 0.5-3.5 seconds
        errorMessage: Math.random() > 0.9 ? 'Timeout na API' : undefined
      });
    }
    
    setRecentSessions(sessions);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="default" className="bg-green-500">Excelente</Badge>;
      case 'good':
        return <Badge variant="secondary" className="bg-blue-500">Bom</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOverallHealth = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return { status: 'critical', color: 'text-red-500', message: 'Sistema com problemas críticos' };
    if (warningCount > 2) return { status: 'warning', color: 'text-yellow-500', message: 'Sistema requer atenção' };
    return { status: 'healthy', color: 'text-green-500', message: 'Sistema funcionando perfeitamente' };
  };

  const health = getOverallHealth();
  const successRate = (recentSessions.filter(s => s.success).length / recentSessions.length) * 100;
  const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.responseTime, 0) / recentSessions.length;
  const avgSatisfaction = recentSessions
    .filter(s => s.userSatisfaction)
    .reduce((sum, s) => sum + (s.userSatisfaction || 0), 0) / 
    recentSessions.filter(s => s.userSatisfaction).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-500" />
              Painel de Confiabilidade - Guatá IA
            </h1>
            <p className="text-gray-600 mt-2">
              Monitoramento em tempo real da performance e confiabilidade do sistema
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${health.color}`}>
              {health.status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500">
              {health.message}
            </div>
          </div>
        </div>

        {/* Alertas */}
        {health.status !== 'healthy' && (
          <Alert className={health.status === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className={health.status === 'critical' ? 'text-red-700' : 'text-yellow-700'}>
              <strong>Atenção:</strong> {health.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    {metric.name}
                  </CardTitle>
                  {getStatusBadge(metric.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">
                      {metric.value}{metric.id === 'response-time' ? 's' : metric.id === 'user-satisfaction' ? '/5' : '%'}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Meta: {metric.target}{metric.id === 'response-time' ? 's' : metric.id === 'user-satisfaction' ? '/5' : '%'}</span>
                    <span className={metric.value >= metric.target ? 'text-green-500' : 'text-red-500'}>
                      {metric.value >= metric.target ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                Últimas 20 sessões
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Tempo Médio de Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {avgResponseTime.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-500">
                Resposta média
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Satisfação do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {avgSatisfaction.toFixed(1)}/5
              </div>
              <div className="text-sm text-gray-500">
                Avaliação média
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessões Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sessões Recentes do Guatá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${session.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(session.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Duração: {Math.round(session.duration)}s | Resposta: {session.responseTime.toFixed(1)}s
                      </div>
                      {session.errorMessage && (
                        <div className="text-xs text-red-500">
                          Erro: {session.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {session.userSatisfaction && (
                      <div className="text-sm font-medium text-purple-600">
                        {session.userSatisfaction.toFixed(1)}/5
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {session.success ? 'Sucesso' : 'Falha'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Controles de Monitoramento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    generateMockSessions();
                    setIsLoading(false);
                  }, 2000);
                }}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Atualizando...' : 'Atualizar Dados'}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Recarregar Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuataReliabilityDashboard;


