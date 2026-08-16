// @ts-nocheck
/**
 * Analytics Avançados para Setor Público
 * Dashboard com análises profundas e preditivas
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import {
  BarChart3, TrendingUp, Users, MapPin, Calendar, DollarSign,
  Download, RefreshCw, Eye, Filter, Target, Award, Clock, Globe,
  ArrowRight, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { publicAnalyticsService, AdvancedAnalytics } from '@/services/public/analyticsService';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

const AdvancedAnalyticsComponent: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('flow');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const analytics = await publicAnalyticsService.getAdvancedAnalytics({
        start: startDate.toISOString(),
        end: endDate
      });

      setData(analytics);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar analytics:', err);
      toast({
        title: "Erro ao carregar Analytics",
        description: error?.message || "Não foi possível carregar os dados de analytics. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
      // Garantir que data seja null em caso de erro para mostrar estado vazio
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <SectionWrapper variant="default" title="Analytics Avançados" subtitle="Análises profundas e preditivas">
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-slate-600">Carregando análises...</span>
        </div>
      </SectionWrapper>
    );
  }

  if (!data) {
    return (
      <SectionWrapper variant="default" title="Analytics Avançados" subtitle="Análises profundas e preditivas">
        <CardBox>
          <div className="text-center p-8 text-slate-500">
            Nenhum dado disponível para análise.
          </div>
        </CardBox>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      variant="default"
      title="Analytics Avançados"
      subtitle="Análises profundas e preditivas sobre o turismo municipal"
      actions={
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="flow">Fluxos</TabsTrigger>
          <TabsTrigger value="seasonal">Sazonal</TabsTrigger>
          <TabsTrigger value="demographic">Demográfica</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="predictive">Preditiva</TabsTrigger>
        </TabsList>

        {/* Análise de Fluxos */}
        <TabsContent value="flow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Fluxos de Turistas</h3>
              {data.flowAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {data.flowAnalysis.slice(0, 5).map((flow, index) => (
                    <CardBox key={index} className="bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ArrowRight className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="font-medium text-slate-900">{flow.from}</p>
                            <p className="text-sm text-slate-500">→ {flow.to}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{flow.count}</p>
                          <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                            {flow.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </CardBox>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados de fluxo disponíveis</p>
              )}
            </CardBox>

            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Origens</h3>
              {data.flowAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.flowAnalysis.slice(0, 5).map(f => ({ name: f.from, value: f.count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.flowAnalysis.slice(0, 5).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>
          </div>
        </TabsContent>

        {/* Análise Sazonal */}
        <TabsContent value="seasonal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Visitantes por Mês</h3>
              {data.seasonalAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.seasonalAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#3b82f6" name="Visitantes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados sazonais disponíveis</p>
              )}
            </CardBox>

            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Receita por Mês</h3>
              {data.seasonalAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.seasonalAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>
          </div>

          <CardBox>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Crescimento Mensal</h3>
            {data.seasonalAnalysis.length > 0 ? (
              <div className="space-y-2">
                {data.seasonalAnalysis.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">{month.visitors} visitantes</span>
                      {month.growth !== 0 && (
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-1 rounded-full ${
                            month.growth > 0 ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'
                          }`}
                        >
                          {month.growth > 0 ? '+' : ''}{month.growth.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
            )}
          </CardBox>
        </TabsContent>

        {/* Análise Demográfica */}
        <TabsContent value="demographic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Faixas Etárias</h3>
              {data.demographicAnalysis.ageGroups.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.demographicAnalysis.ageGroups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ group, percentage }) => `${group}: ${percentage.toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {data.demographicAnalysis.ageGroups.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>

            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Origens (Estados)</h3>
              {data.demographicAnalysis.origins.length > 0 ? (
                <div className="space-y-2">
                  {data.demographicAnalysis.origins.slice(0, 5).map((origin, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm font-medium text-slate-900">{origin.origin}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{origin.count}</span>
                        <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                          {origin.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>

            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Países</h3>
              {data.demographicAnalysis.countries.length > 0 ? (
                <div className="space-y-2">
                  {data.demographicAnalysis.countries.slice(0, 5).map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm font-medium text-slate-900">{country.country}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{country.count}</span>
                        <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                          {country.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>
          </div>
        </TabsContent>

        {/* Análise de Receita */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Receita Total</p>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.revenueAnalysis.total)}</p>
              <Badge variant="outline" className="mt-2 text-xs px-2 py-1 rounded-full bg-green-100 border-green-300">
                +{data.revenueAnalysis.growth.toFixed(1)}%
              </Badge>
            </CardBox>

            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Receita Mensal</p>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.revenueAnalysis.monthly)}</p>
            </CardBox>

            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Crescimento</p>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.revenueAnalysis.growth.toFixed(1)}%</p>
            </CardBox>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Fontes de Receita</h3>
              {data.revenueAnalysis.sources.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.revenueAnalysis.sources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${source}: ${percentage.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {data.revenueAnalysis.sources.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>

            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendência de Receita</h3>
              {data.revenueAnalysis.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenueAnalysis.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Receita" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>
          </div>
        </TabsContent>

        {/* Análise de Engajamento */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Total de Interações</p>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(data.engagementAnalysis.totalInteractions)}</p>
            </CardBox>

            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Avaliação Média</p>
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.engagementAnalysis.averageRating.toFixed(1)}</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${star <= data.engagementAnalysis.averageRating ? 'text-yellow-400' : 'text-slate-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </CardBox>

            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Top Interesses</p>
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.engagementAnalysis.topInterests.length}</p>
            </CardBox>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribuição de Satisfação</h3>
              {data.engagementAnalysis.satisfactionDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.engagementAnalysis.satisfactionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Avaliações" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>

            <CardBox>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Interesses</h3>
              {data.engagementAnalysis.topInterests.length > 0 ? (
                <div className="space-y-2">
                  {data.engagementAnalysis.topInterests.slice(0, 8).map((interest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-900">{interest.interest}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{interest.count}</span>
                        <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                          {interest.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
              )}
            </CardBox>
          </div>
        </TabsContent>

        {/* Análise Preditiva */}
        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Previsão Próximo Mês</p>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(data.predictiveAnalysis.nextMonthVisitors)}</p>
              <p className="text-xs text-slate-500 mt-1">visitantes</p>
            </CardBox>

            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Receita Prevista</p>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.predictiveAnalysis.nextMonthRevenue)}</p>
            </CardBox>

            <CardBox>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600">Confiança</p>
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.predictiveAnalysis.confidence.toFixed(0)}%</p>
            </CardBox>
          </div>

          <CardBox>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendências e Previsões</h3>
            {data.predictiveAnalysis.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.predictiveAnalysis.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Real" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="predicted" stroke="#10b981" name="Previsto" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Sem dados disponíveis</p>
            )}
          </CardBox>

          <CardBox>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recomendações Estratégicas</h3>
            {data.predictiveAnalysis.recommendations.length > 0 ? (
              <div className="space-y-3">
                {data.predictiveAnalysis.recommendations.map((rec, index) => (
                  <CardBox key={index} className="bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900 flex-1">{rec}</p>
                    </div>
                  </CardBox>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Sem recomendações disponíveis</p>
            )}
          </CardBox>
        </TabsContent>
      </Tabs>
    </SectionWrapper>
  );
};

export default AdvancedAnalyticsComponent;

