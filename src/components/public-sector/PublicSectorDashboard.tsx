import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  Star,
  TrendingUp,
  Activity,
  Shield,
  Globe
} from 'lucide-react';
import { publicSectorService } from '@/services/public-sector/publicSectorService';
import { PublicSectorStats } from '@/types/public-sector';
import { useToast } from '@/hooks/use-toast';

const PublicSectorDashboard: React.FC = () => {
  const [stats, setStats] = useState<PublicSectorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await publicSectorService.getPublicSectorStats('month');
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do setor público.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionIcon = (rating: number) => {
    if (rating >= 4.5) return '⭐';
    if (rating >= 3.5) return '⭐';
    return '⭐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Não foi possível carregar as estatísticas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Setor Público</h1>
          <p className="text-gray-600 mt-2">
            Gestão de CATs e Atendimento ao Turista - Mato Grosso do Sul
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadStats}>
            <Activity className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Interações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_interactions)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(stats.interactions_this_month)} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interações Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.interactions_today)}</div>
            <p className="text-xs text-muted-foreground">
              Pico às {stats.peak_hour}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSatisfactionColor(stats.average_satisfaction)}`}>
              {stats.average_satisfaction.toFixed(1)} {getSatisfactionIcon(stats.average_satisfaction)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em {formatNumber(stats.total_interactions)} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergency_alerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.emergency_alerts > 0 ? 'Atenção necessária' : 'Tudo normal'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="attendants">Atendentes</TabsTrigger>
          <TabsTrigger value="locations">Locais</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactions by Hour */}
            <Card>
              <CardHeader>
                <CardTitle>Interações por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.interactions_by_hour.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.hour}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...stats.interactions_by_hour.map(i => i.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactions by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Interações por Dia da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.interactions_by_day.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{item.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...stats.interactions_by_day.map(i => i.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.total_locations}</div>
                  <div className="text-sm text-gray-600">CATs Ativos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.active_attendants}</div>
                  <div className="text-sm text-gray-600">Atendentes Ativos</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{stats.emergency_alerts}</div>
                  <div className="text-sm text-gray-600">Alertas Ativos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Atendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_attendants.map((attendant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{attendant.attendant}</div>
                        <div className="text-sm text-gray-600">{attendant.interactions} interações</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{attendant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Locais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_locations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{location.location}</div>
                        <div className="text-sm text-gray-600">{location.interactions} interações</div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {location.interactions} atendimentos
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">{stats.most_popular_service}</p>
                <p className="text-sm text-gray-600">Serviço mais solicitado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicSectorDashboard;
