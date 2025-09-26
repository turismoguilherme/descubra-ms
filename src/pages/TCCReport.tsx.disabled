import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { tccAnalyticsService, TCCAnalytics } from '@/services/analytics/tccAnalytics';

const TCCReport = () => {
  const [report, setReport] = useState<TCCAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateReport = () => {
      const analyticsReport = tccAnalyticsService.generateReport();
      setReport(analyticsReport);
      setLoading(false);
    };

    generateReport();
  }, []);

  const downloadCSV = () => {
    const csvContent = tccAnalyticsService.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guata_tcc_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Gerando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado disponível para relatório</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Relatório TCC - Guatá IA
          </h1>
          <p className="text-gray-600">
            Análise completa dos dados coletados para seu TCC
          </p>
          <div className="flex gap-4 mt-4">
            <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/chatguata', '_blank')}
            >
              Testar Guatá
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
                  <p className="text-2xl font-bold text-blue-600">{report.totalSessions}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mensagens Totais</p>
                  <p className="text-2xl font-bold text-green-600">{report.totalMessages}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(report.averageSessionTime / 60)}m {Math.round(report.averageSessionTime % 60)}s
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Satisfação</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {Math.round(report.satisfactionRate)}%
                  </p>
                </div>
                <ThumbsUp className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tópicos Populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tópicos Mais Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.mostPopularTopics.map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{topic}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {report.sessions.filter(session => 
                        session.popularTopics.includes(topic)
                      ).length} sessões
                    </div>
                  </div>
                ))}
                {report.mostPopularTopics.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum tópico popular ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Dispositivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Dispositivos Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(report.deviceBreakdown).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="font-medium">{device}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(count / report.totalSessions) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Tempo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Duração das Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(report.timeDistribution).map(([timeRange, count]) => (
                  <div key={timeRange} className="flex items-center justify-between">
                    <span className="font-medium">{timeRange}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: `${(count / report.totalSessions) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Estatísticas Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mensagens por Sessão</p>
                  <p className="text-lg font-bold text-blue-600">
                    {Math.round(report.averageMessagesPerSession)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Feedback Positivo</p>
                  <p className="text-lg font-bold text-green-600">
                    {report.sessions.reduce((sum, session) => 
                      sum + session.feedbackCount.positive, 0
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Feedback Negativo</p>
                  <p className="text-lg font-bold text-red-600">
                    {report.sessions.reduce((sum, session) => 
                      sum + session.feedbackCount.negative, 0
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Interações</p>
                  <p className="text-lg font-bold text-purple-600">
                    {report.sessions.reduce((sum, session) => 
                      sum + session.userInteractions.length, 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessões Recentes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sessões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">ID da Sessão</th>
                    <th className="text-left py-2">Início</th>
                    <th className="text-left py-2">Mensagens</th>
                    <th className="text-left py-2">Tempo</th>
                    <th className="text-left py-2">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sessions.slice(-10).reverse().map((session) => (
                    <tr key={session.id} className="border-b">
                      <td className="py-2 font-mono text-xs">
                        {session.id.slice(-8)}
                      </td>
                      <td className="py-2">
                        {new Date(session.startTime).toLocaleString()}
                      </td>
                      <td className="py-2">{session.totalMessages}</td>
                      <td className="py-2">
                        {Math.floor(session.totalTime / 60)}m {session.totalTime % 60}s
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs">{session.feedbackCount.positive}</span>
                          <ThumbsDown className="w-3 h-3 text-red-500" />
                          <span className="text-xs">{session.feedbackCount.negative}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Informações para TCC */}
        <Card className="mt-8 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">📋 Informações para seu TCC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Dados Coletados:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• {report.totalSessions} sessões de usuários</li>
                  <li>• {report.totalMessages} mensagens trocadas</li>
                  <li>• {Math.round(report.averageSessionTime / 60)} minutos de uso médio</li>
                  <li>• {Math.round(report.satisfactionRate)}% de satisfação</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Para Apresentação:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Sistema de IA funcional</li>
                  <li>• Dados reais de interação</li>
                  <li>• Métricas quantitativas</li>
                  <li>• Análise de comportamento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TCCReport; 