/**
 * Analytics Avançados para Secretarias
 * Dashboard com métricas, gráficos e relatórios de turismo
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3, TrendingUp, Users, MapPin, Calendar, DollarSign, 
  Download, RefreshCw, Eye, Filter, Target, Award, Clock, Globe
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

interface AnalyticsData {
  visitors: {
    total: number;
    monthly: number;
    daily: number;
    growth: number;
  };
  attractions: {
    total: number;
    mostVisited: Array<{
      name: string;
      visits: number;
      growth: number;
    }>;
    categories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  events: {
    total: number;
    upcoming: number;
    completed: number;
    totalAudience: number;
    averageAudience: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    sources: Array<{
      source: string;
      amount: number;
      percentage: number;
    }>;
  };
  seasonality: Array<{
    month: string;
    visitors: number;
    revenue: number;
  }>;
  demographics: {
    ageGroups: Array<{
      group: string;
      percentage: number;
    }>;
    origins: Array<{
      origin: string;
      percentage: number;
    }>;
  };
  satisfaction: {
    average: number;
    totalReviews: number;
    distribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
  };
}

const TourismAnalytics: React.FC = () => {
  const { canAccess } = useRoleBasedAccess();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('visitors');

  // Dados mockados para demonstração
  const mockData: AnalyticsData = {
    visitors: {
      total: 125430,
      monthly: 15420,
      daily: 514,
      growth: 12.5
    },
    attractions: {
      total: 45,
      mostVisited: [
        { name: 'Parque das Cachoeiras', visits: 12500, growth: 8.2 },
        { name: 'Centro Histórico', visits: 9800, growth: 15.3 },
        { name: 'Rio Cristalino', visits: 8700, growth: 5.7 },
        { name: 'Teatro Municipal', visits: 6200, growth: 22.1 }
      ],
      categories: [
        { category: 'Natural', count: 18, percentage: 40 },
        { category: 'Cultural', count: 15, percentage: 33.3 },
        { category: 'Gastronômico', count: 8, percentage: 17.8 },
        { category: 'Esportivo', count: 4, percentage: 8.9 }
      ]
    },
    events: {
      total: 23,
      upcoming: 5,
      completed: 18,
      totalAudience: 45600,
      averageAudience: 1983
    },
    revenue: {
      total: 2840000,
      monthly: 285000,
      growth: 18.7,
      sources: [
        { source: 'Hospedagem', amount: 1200000, percentage: 42.3 },
        { source: 'Gastronomia', amount: 850000, percentage: 29.9 },
        { source: 'Transporte', amount: 450000, percentage: 15.8 },
        { source: 'Atrações', amount: 340000, percentage: 12.0 }
      ]
    },
    seasonality: [
      { month: 'Jan', visitors: 8500, revenue: 180000 },
      { month: 'Fev', visitors: 9200, revenue: 195000 },
      { month: 'Mar', visitors: 10800, revenue: 230000 },
      { month: 'Abr', visitors: 12500, revenue: 265000 },
      { month: 'Mai', visitors: 14200, revenue: 300000 },
      { month: 'Jun', visitors: 15800, revenue: 335000 },
      { month: 'Jul', visitors: 17200, revenue: 365000 },
      { month: 'Ago', visitors: 16500, revenue: 350000 },
      { month: 'Set', visitors: 14800, revenue: 315000 },
      { month: 'Out', visitors: 13200, revenue: 280000 },
      { month: 'Nov', visitors: 11800, revenue: 250000 },
      { month: 'Dez', visitors: 10500, revenue: 220000 }
    ],
    demographics: {
      ageGroups: [
        { group: '18-25', percentage: 25 },
        { group: '26-35', percentage: 35 },
        { group: '36-45', percentage: 22 },
        { group: '46-55', percentage: 12 },
        { group: '55+', percentage: 6 }
      ],
      origins: [
        { origin: 'São Paulo', percentage: 35 },
        { origin: 'Rio de Janeiro', percentage: 20 },
        { origin: 'Minas Gerais', percentage: 15 },
        { origin: 'Paraná', percentage: 10 },
        { origin: 'Outros', percentage: 20 }
      ]
    },
    satisfaction: {
      average: 4.6,
      totalReviews: 2840,
      distribution: [
        { rating: 5, count: 1420, percentage: 50 },
        { rating: 4, count: 852, percentage: 30 },
        { rating: 3, count: 284, percentage: 10 },
        { rating: 2, count: 142, percentage: 5 },
        { rating: 1, count: 142, percentage: 5 }
      ]
    }
  };

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData(mockData);
      setLoading(false);
    };

    loadData();
  }, [timeRange]);

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
      currency: 'BRL'
    }).format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics de Turismo</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Turismo</h2>
          <p className="text-gray-600">Métricas e insights para gestão municipal</p>
        </div>
        <div className="flex items-center space-x-2">
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visitantes Totais</p>
                <p className="text-2xl font-bold">{formatNumber(data.visitors.total)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{data.visitors.growth}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{data.revenue.growth}%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atrativos</p>
                <p className="text-2xl font-bold">{data.attractions.total}</p>
                <p className="text-sm text-gray-500 mt-1">Cadastrados</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold">{data.satisfaction.average}/5</p>
                <p className="text-sm text-gray-500 mt-1">{data.satisfaction.totalReviews} avaliações</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análise */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="attractions">Atrativos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitantes por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.seasonality.slice(-6).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(month.visitors / 18000) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{formatNumber(month.visitors)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origem dos Visitantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.demographics.origins.map((origin, index) => (
                    <div key={origin.origin} className="flex items-center justify-between">
                      <span className="font-medium">{origin.origin}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${origin.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{origin.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attractions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atrativos Mais Visitados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.attractions.mostVisited.map((attraction, index) => (
                    <div key={attraction.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{attraction.name}</p>
                        <p className="text-sm text-gray-500">{formatNumber(attraction.visits)} visitas</p>
                      </div>
                      <Badge variant={attraction.growth > 0 ? "default" : "secondary"}>
                        {attraction.growth > 0 ? "+" : ""}{attraction.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.attractions.categories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{category.count} ({category.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Eventos</span>
                    <span className="font-bold">{data.events.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próximos</span>
                    <Badge variant="default">{data.events.upcoming}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Concluídos</span>
                    <Badge variant="secondary">{data.events.completed}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Público Total</span>
                    <span className="font-bold">{formatNumber(data.events.totalAudience)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Média por Evento</span>
                    <span className="font-bold">{formatNumber(data.events.averageAudience)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Eventos por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Gráfico de eventos será implementado aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fontes de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.revenue.sources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="font-medium">{source.source}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(source.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.seasonality.slice(-6).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(month.revenue / 400000) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(month.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Faixas Etárias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.demographics.ageGroups.map((group, index) => (
                    <div key={group.group} className="flex items-center justify-between">
                      <span className="font-medium">{group.group} anos</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{group.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.satisfaction.distribution.map((rating, index) => (
                    <div key={rating.rating} className="flex items-center justify-between">
                      <span className="font-medium">{rating.rating} estrelas</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${rating.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{rating.count} ({rating.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TourismAnalytics;
