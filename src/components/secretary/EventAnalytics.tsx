// @ts-nocheck
/**
 * Event Analytics Component
 * Componente para exibir análises e insights de eventos turísticos
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Target,
  Calendar,
  MapPin
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line } from 'recharts';
import { eventAnalyticsService } from '@/services/public/eventAnalyticsService';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function EventAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [completeness, setCompleteness] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [outdated, setOutdated] = useState<any[]>([]);
  const [locations, setLocations] = useState<any>(null);
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [completenessData, trendsData, benchmarksData, outdatedData, locationsData, successData] = await Promise.all([
        eventAnalyticsService.analyzeCompleteness(),
        eventAnalyticsService.analyzeEventTrends(),
        eventAnalyticsService.compareWithBenchmarks(),
        eventAnalyticsService.checkOutdatedEvents(),
        eventAnalyticsService.analyzeLocationUsage(),
        eventAnalyticsService.analyzeEventSuccess(),
      ]);

      setCompleteness(completenessData);
      setTrends(trendsData);
      setBenchmarks(benchmarksData);
      setOutdated(outdatedData);
      setLocations(locationsData);
      setSuccess(successData);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as análises.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráfico de completude por categoria
  const completenessChartData = completeness
    ? Object.entries(completeness.byCategory).map(([category, data]: [string, any]) => ({
        category,
        score: data.score,
        complete: data.complete,
        incomplete: data.incomplete,
      }))
    : [];

  // Preparar dados para gráfico de tendências
  const trendsChartData = trends?.eventsByMonth || [];

  // Preparar dados para gráfico de eventos por categoria
  const categoryChartData = trends
    ? Object.entries(trends.eventsByCategory).map(([category, count]) => ({
        category,
        count,
      }))
    : [];

  // Preparar dados para gráfico de benchmarks
  const benchmarksChartData = benchmarks.map(b => ({
    metric: b.metric,
    atual: b.currentValue,
    média: b.averageValue,
    ideal: b.benchmarkValue,
  }));

  // Preparar dados para gráfico de locais
  const locationsChartData = locations?.mostUsedLocations.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Score Geral de Completude */}
      {completeness && (
        <CardBox className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Completude Geral</h3>
              <p className="text-sm text-slate-600">Score médio de completude dos dados</p>
            </div>
            <div className={`text-4xl font-bold ${
              completeness.overallScore >= 80 
                ? 'text-green-600' 
                : completeness.overallScore >= 60
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {completeness.overallScore}%
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                completeness.overallScore >= 80 
                  ? 'bg-green-600' 
                  : completeness.overallScore >= 60
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${completeness.overallScore}%` }}
            />
          </div>
        </CardBox>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completude por Categoria */}
        {completenessChartData.length > 0 && (
          <CardBox className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Completude por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completenessChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="category" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" name="Score de Completude" />
              </BarChart>
            </ResponsiveContainer>
          </CardBox>
        )}

        {/* Eventos por Período */}
        {trendsChartData.length > 0 && (
          <CardBox className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Eventos por Período</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Número de Eventos" />
                <Line type="monotone" dataKey="totalAudience" stroke="#10b981" name="Público Total" />
              </LineChart>
            </ResponsiveContainer>
          </CardBox>
        )}

        {/* Eventos por Categoria */}
        {categoryChartData.length > 0 && (
          <CardBox className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Eventos por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBox>
        )}

        {/* Comparação com Benchmarks */}
        {benchmarksChartData.length > 0 && (
          <CardBox className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Comparação com Benchmarks</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchmarksChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="metric" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="atual" fill="#3b82f6" name="Atual" />
                <Bar dataKey="média" fill="#8b5cf6" name="Média" />
                <Bar dataKey="ideal" fill="#10b981" name="Ideal" />
              </BarChart>
            </ResponsiveContainer>
          </CardBox>
        )}
      </div>

      {/* Locais Mais Utilizados */}
      {locations && locations.mostUsedLocations.length > 0 && (
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Locais Mais Utilizados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationsChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis 
                type="category" 
                dataKey="location" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                width={150}
              />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Número de Eventos" />
            </BarChart>
          </ResponsiveContainer>
        </CardBox>
      )}

      {/* Taxa de Sucesso */}
      {success && (
        <CardBox className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Taxa de Sucesso</h3>
              <p className="text-sm text-slate-600">Público real vs. público esperado</p>
            </div>
            <div className={`text-4xl font-bold ${
              success.averageSuccessRate >= 90 
                ? 'text-green-600' 
                : success.averageSuccessRate >= 70
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {success.averageSuccessRate}%
            </div>
          </div>
          {Object.entries(success.byCategory).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Por Categoria:</h4>
              {Object.entries(success.byCategory).map(([category, data]: [string, any]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{category}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-600">Esperado: {data.expected}</span>
                    <span className="text-slate-600">Real: {data.actual}</span>
                    <Badge variant="outline" className={
                      data.rate >= 90 ? 'bg-green-100 text-green-700' :
                      data.rate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {data.rate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBox>
      )}

      {/* Recomendações */}
      {completeness?.recommendations && completeness.recommendations.length > 0 && (
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Recomendações
          </h3>
          <ul className="space-y-2">
            {completeness.recommendations.map((rec: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardBox>
      )}

      {/* Tendências */}
      {trends?.trends && trends.trends.length > 0 && (
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Tendências Identificadas
          </h3>
          <ul className="space-y-2">
            {trends.trends.map((trend: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>{trend}</span>
              </li>
            ))}
          </ul>
          {trends.peakMonths && trends.peakMonths.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-2">Meses de Pico:</p>
              <div className="flex flex-wrap gap-2">
                {trends.peakMonths.map((month: string, i: number) => (
                  <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {month}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardBox>
      )}

      {/* Dados Desatualizados */}
      {outdated.length > 0 && (
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Eventos Desatualizados ({outdated.length})
          </h3>
          <div className="space-y-3">
            {outdated.slice(0, 10).map((alert) => (
              <div key={alert.eventId} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{alert.name}</p>
                    <p className="text-sm text-slate-600">
                      Última atualização: {new Date(alert.lastUpdated).toLocaleDateString('pt-BR')} 
                      ({alert.daysSinceUpdate} dias atrás)
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">{alert.recommendedAction}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    {alert.daysSinceUpdate} dias
                  </Badge>
                </div>
              </div>
            ))}
            {outdated.length > 10 && (
              <p className="text-sm text-slate-600 text-center">
                E mais {outdated.length - 10} evento(s) desatualizado(s)...
              </p>
            )}
          </div>
        </CardBox>
      )}

      {/* Botão de Atualizar */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}

