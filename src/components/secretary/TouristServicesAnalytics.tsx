/**
 * Tourist Services Analytics Component
 * Componente para exibir análises e insights de atendimentos presenciais aos turistas
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  MapPin,
  RefreshCw,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line
} from 'recharts';
import { touristServiceService, ServiceStats } from '@/services/public/touristServiceService';
import { format, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function TouristServicesAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [dateFrom, setDateFrom] = useState<Date>(subMonths(new Date(), 1));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    loadStats();
  }, [dateFrom, dateTo]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // TODO: Obter cityId do usuário
      const statsData = await touristServiceService.getServiceStats(
        undefined, // cityId
        dateFrom,
        dateTo
      );
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as estatísticas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareTypeData = () => {
    if (!stats?.byType) return [];
    return Object.entries(stats.byType).map(([type, count]) => ({
      name: type === 'informacao' ? 'Informação' :
            type === 'orientacao' ? 'Orientação' :
            type === 'venda' ? 'Venda' :
            type === 'reclamacao' ? 'Reclamação' : 'Outro',
      value: count,
    }));
  };

  const prepareOriginData = () => {
    if (!stats?.byOrigin?.country) return [];
    return Object.entries(stats.byOrigin.country)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({
        name: country,
        value: count,
      }));
  };

  if (loading) {
    return (
      <CardBox className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </CardBox>
    );
  }

  if (!stats) {
    return (
      <CardBox className="p-6">
        <p className="text-center text-gray-500 py-8">
          Nenhum dado disponível para o período selecionado.
        </p>
      </CardBox>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <CardBox className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dateFrom">Data Inicial</Label>
            <Input
              id="dateFrom"
              type="date"
              value={format(dateFrom, 'yyyy-MM-dd')}
              onChange={(e) => setDateFrom(new Date(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dateTo">Data Final</Label>
            <Input
              id="dateTo"
              type="date"
              value={format(dateTo, 'yyyy-MM-dd')}
              onChange={(e) => setDateTo(new Date(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={loadStats} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardBox>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardBox className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Atendimentos</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalServices}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600 opacity-50" />
          </div>
        </CardBox>

        <CardBox className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Duração Média</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.averageDuration > 0 ? `${stats.averageDuration} min` : 'N/A'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600 opacity-50" />
          </div>
        </CardBox>

        <CardBox className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfação Média</p>
              <p className="text-2xl font-bold text-yellow-900">
                {stats.averageSatisfaction > 0 ? stats.averageSatisfaction.toFixed(1) : 'N/A'}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600 opacity-50" />
          </div>
        </CardBox>

        <CardBox className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média Diária</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.servicesByDay.length > 0
                  ? Math.round(
                      stats.totalServices / stats.servicesByDay.length
                    )
                  : 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
          </div>
        </CardBox>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos por Tipo */}
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Atendimentos por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareTypeData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareTypeData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardBox>

        {/* Origem dos Turistas */}
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Origem dos Turistas (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareOriginData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardBox>

        {/* Atendimentos por Dia */}
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Atendimentos por Dia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.servicesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
              />
              <YAxis />
              <RechartsTooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardBox>

        {/* Horários de Pico */}
        <CardBox className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Horários de Pico
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(value) => `${value}h`}
              />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardBox>
      </div>
    </div>
  );
}

