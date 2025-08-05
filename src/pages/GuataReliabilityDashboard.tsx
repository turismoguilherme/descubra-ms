import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { informationVerificationService } from '@/services/ai/verification/informationVerificationService';
import { VerifiedSource, InformationLog, Partner } from '@/services/ai/verification/informationVerificationService';
import { CheckCircle, AlertCircle, Clock, TrendingUp, Users, Shield } from 'lucide-react';

const GuataReliabilityDashboard: React.FC = () => {
  const [logs, setLogs] = useState<InformationLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [report, setReport] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentLogs = informationVerificationService.getInformationLogs();
    const currentStats = informationVerificationService.getReliabilityStats();
    const currentReport = informationVerificationService.generateReliabilityReport();

    setLogs(currentLogs);
    setStats(currentStats);
    setReport(currentReport);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Painel de Confiabilidade - Guatá
          </h1>
          <p className="text-gray-600">
            Monitoramento em tempo real da veracidade das informações fornecidas
          </p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalQueries || 0}</div>
              <p className="text-xs text-muted-foreground">
                Consultas realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Verificação</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `${((stats.verifiedQueries / stats.totalQueries) * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Informações verificadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `${(stats.averageConfidence * 100).toFixed(1)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Nível de confiança
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioridade Parceiros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.partnerPriorityCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Vezes priorizados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Confiança */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nível de Confiança por Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(-10).reverse().map((log) => (
                <div key={log.id} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 min-w-[200px]">
                    {getVerificationIcon(log.verified)}
                    <span className="text-sm font-medium truncate">
                      {log.query.length > 30 ? log.query.substring(0, 30) + '...' : log.query}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={log.confidence * 100} 
                      className="h-2"
                    />
                  </div>
                  <Badge variant={log.partnerPriority ? "default" : "secondary"}>
                    {log.partnerPriority ? "Parceiro" : "Geral"}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logs Detalhados */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Logs Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.slice(-20).reverse().map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getVerificationIcon(log.verified)}
                      <span className="font-medium">Consulta: {log.query}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getConfidenceColor(log.confidence)}>
                        {(log.confidence * 100).toFixed(1)}%
                      </Badge>
                      {log.partnerPriority && (
                        <Badge variant="default">💫 Parceiro</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Resposta:</strong> {log.response}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>Fontes: {log.sources.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relatório Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Confiabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{report}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="mt-8 flex space-x-4">
          <Button onClick={loadData} variant="outline">
            🔄 Atualizar Dados
          </Button>
          <Button onClick={() => console.log(report)} variant="outline">
            📊 Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuataReliabilityDashboard; 