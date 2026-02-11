// @ts-nocheck
/**
 * Inventory Analytics Component
 * Componente para exibir análises e insights do inventário turístico
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  FileText
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { inventoryAnalyticsService } from '@/services/public/inventoryAnalyticsService';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function InventoryAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [completeness, setCompleteness] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [outdated, setOutdated] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [completenessData, benchmarksData, outdatedData] = await Promise.all([
        inventoryAnalyticsService.analyzeCompleteness(),
        inventoryAnalyticsService.compareWithBenchmarks(),
        inventoryAnalyticsService.checkOutdatedData(),
      ]);

      setCompleteness(completenessData);
      setBenchmarks(benchmarksData);
      setOutdated(outdatedData);
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

  // Preparar dados para gráfico de benchmarks
  const benchmarksChartData = benchmarks.map(b => ({
    metric: b.metric,
    atual: b.currentValue,
    média: b.averageValue,
    ideal: b.benchmarkValue,
  }));

  return (
    <SectionWrapper
      variant="default"
      title="Análise e Insights do Inventário"
      subtitle="Métricas, comparações e recomendações para melhorar o inventário turístico"
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      }
    >
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

        {/* Dados Desatualizados */}
        {outdated.length > 0 && (
          <CardBox className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Dados Desatualizados ({outdated.length})
            </h3>
            <div className="space-y-3">
              {outdated.slice(0, 10).map((alert) => (
                <div key={alert.inventoryId} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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
                  E mais {outdated.length - 10} item(ns) desatualizado(s)...
                </p>
              )}
            </div>
          </CardBox>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

