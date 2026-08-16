// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  Eye,
  MousePointer,
  Route,
  Download
} from 'lucide-react';
import { analyticsService, AnalyticsMetric } from '@/services/analyticsService';
import { catCheckinService } from '@/services/catCheckinService';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsDashboardProps {
  region?: string;
  userRole?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard = ({ region, userRole }: AnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState('7');
  const [selectedMetric, setSelectedMetric] = useState('page_views');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPageViews: 0,
    totalRouteCompletions: 0,
    uniqueUsers: 0,
    avgEngagement: 0
  });

  // Carregar dados
  useEffect(() => {
    loadAnalyticsData();
    loadPerformanceData();
  }, [timeRange, region]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = subDays(new Date(), parseInt(timeRange)).toISOString().split('T')[0];
      
      const data = await analyticsService.getAnalyticsMetrics(
        region,
        { start: startDate, end: endDate }
      );
      
      setAnalyticsData(data);
      
      // Calcular resumo
      const pageViews = data.filter(d => d.metric_type === 'page_views');
      const routeCompletions = data.filter(d => d.metric_type === 'route_completions');
      
      setSummary({
        totalPageViews: pageViews.reduce((sum, d) => sum + d.metric_value, 0),
        totalRouteCompletions: routeCompletions.reduce((sum, d) => sum + d.metric_value, 0),
        uniqueUsers: Math.round(pageViews.reduce((sum, d) => sum + (d.additional_data?.unique_users || 0), 0) / Math.max(pageViews.length, 1)),
        avgEngagement: Math.round((routeCompletions.length / Math.max(pageViews.length, 1)) * 100)
      });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const data = await catCheckinService.getPerformanceMetrics(timeRange);
      setPerformanceData(data);
    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error);
    }
  };

  // Preparar dados para gráficos
  const chartData = analyticsData
    .filter(d => d.metric_type === selectedMetric)
    .reduce((acc, item) => {
      const existingItem = acc.find(d => d.date === item.date);
      if (existingItem) {
        existingItem.value += item.metric_value;
      } else {
        acc.push({
          date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
          value: item.metric_value,
          fullDate: item.date
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .slice(-7); // Últimos 7 dias

  const regionData = analyticsData
    .filter(d => d.metric_type === selectedMetric)
    .reduce((acc, item) => {
      const region = item.region || 'Não especificado';
      const existingRegion = acc.find(d => d.region === region);
      if (existingRegion) {
        existingRegion.value += item.metric_value;
      } else {
        acc.push({ region, value: item.metric_value });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const performanceChart = performanceData
    .slice(-7)
    .map(item => ({
      date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
      checkins: item.total_checkins,
      hours: item.total_hours_worked,
      score: item.performance_score
    }));

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard de Analytics</h2>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page_views">Visualizações</SelectItem>
              <SelectItem value="route_completions">Roteiros Concluídos</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold">{summary.totalPageViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roteiros Concluídos</p>
                <p className="text-2xl font-bold">{summary.totalRouteCompletions.toLocaleString()}</p>
              </div>
              <Route className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Únicos</p>
                <p className="text-2xl font-bold">{summary.uniqueUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engajamento</p>
                <p className="text-2xl font-bold">{summary.avgEngagement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Tendência */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Região */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, percent }) => `${region} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance dos CATs */}
          {userRole !== 'atendente' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance dos CATs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="checkins" fill="#0ea5e9" name="Check-ins" />
                    <Bar dataKey="score" fill="#10b981" name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
