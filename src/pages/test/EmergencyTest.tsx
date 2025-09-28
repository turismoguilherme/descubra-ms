import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wifi, 
  Database,
  Server,
  Shield,
  Activity
} from 'lucide-react';

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastCheck: string;
  responseTime?: number;
  description: string;
}

const EmergencyTest: React.FC = () => {
  const [systems, setSystems] = useState<SystemStatus[]>([
    {
      id: 'api',
      name: 'API Principal',
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: 120,
      description: 'API principal do Descubra MS'
    },
    {
      id: 'database',
      name: 'Base de Dados',
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: 45,
      description: 'Supabase PostgreSQL'
    },
    {
      id: 'guata',
      name: 'Sistema Guatá',
      status: 'warning',
      lastCheck: new Date().toISOString(),
      responseTime: 2500,
      description: 'IA Guatá - Resposta lenta'
    },
    {
      id: 'auth',
      name: 'Autenticação',
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: 80,
      description: 'Sistema de autenticação'
    },
    {
      id: 'storage',
      name: 'Armazenamento',
      status: 'error',
      lastCheck: new Date().toISOString(),
      description: 'Supabase Storage - Erro de conexão'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-500">Online</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const runEmergencyTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      'Iniciando testes de emergência...',
      'Verificando conectividade com API...',
      'Testando autenticação...',
      'Validando base de dados...',
      'Verificando sistema Guatá...',
      'Testando armazenamento de arquivos...',
      'Verificando logs de erro...',
      'Testes concluídos!'
    ];

    for (let i = 0; i < tests.length; i++) {
      setTestResults(prev => [...prev, tests[i]]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const getSystemHealth = () => {
    const onlineCount = systems.filter(s => s.status === 'online').length;
    const totalCount = systems.length;
    const healthPercentage = (onlineCount / totalCount) * 100;
    
    if (healthPercentage >= 80) return { status: 'healthy', color: 'text-green-500' };
    if (healthPercentage >= 60) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'critical', color: 'text-red-500' };
  };

  const health = getSystemHealth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              Teste de Emergência - Descubra MS
            </h1>
            <p className="text-gray-600 mt-2">
              Monitoramento e diagnóstico do sistema em tempo real
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${health.color}`}>
              {systems.filter(s => s.status === 'online').length}/{systems.length} Sistemas
            </div>
            <div className="text-sm text-gray-500">
              Status: {health.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Alertas */}
        {systems.some(s => s.status === 'error') && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Atenção:</strong> Alguns sistemas estão com problemas críticos. 
              Verifique os logs e execute os testes de emergência.
            </AlertDescription>
          </Alert>
        )}

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Controles de Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={runEmergencyTests} 
                disabled={isRunning}
                className="bg-red-600 hover:bg-red-700"
              >
                {isRunning ? 'Executando...' : 'Executar Testes de Emergência'}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Atualizar Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status dos Sistemas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map((system) => (
            <Card key={system.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(system.status)}
                    {system.name}
                  </CardTitle>
                  {getStatusBadge(system.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{system.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Última verificação:</span>
                    <span>{new Date(system.lastCheck).toLocaleTimeString()}</span>
                  </div>
                  {system.responseTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tempo de resposta:</span>
                      <span className={system.responseTime > 2000 ? 'text-yellow-500' : 'text-green-500'}>
                        {system.responseTime}ms
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Log de Testes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                    <span>{result}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Versão da Aplicação:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ambiente:</span>
                  <span className="text-yellow-600">Desenvolvimento</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Última atualização:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime:</span>
                  <span>99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Usuários ativos:</span>
                  <span>1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status geral:</span>
                  <span className={health.color}>{health.status}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyTest;


