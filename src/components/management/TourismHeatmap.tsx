import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Users, 
  Clock, 
  TrendingUp, 
  Eye,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  tourismHeatmapService, 
  HeatmapData, 
  TourismAnalytics, 
  HeatmapFilters 
} from '@/services/tourismHeatmapService';

interface TourismHeatmapProps {
  region?: string;
  userRole?: string;
}

const TourismHeatmap = ({ region, userRole }: TourismHeatmapProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [analytics, setAnalytics] = useState<TourismAnalytics | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'density' | 'duration' | 'engagement'>('density');
  const [timeRange, setTimeRange] = useState('7');
  const [selectedRegion, setSelectedRegion] = useState(region || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHeatmapData();
    loadRealTimeStats();
    
    // Atualizar estatísticas em tempo real a cada 5 minutos
    const interval = setInterval(loadRealTimeStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [mapType, timeRange, selectedRegion]);

  const loadHeatmapData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const filters: HeatmapFilters = {
        timeRange: { start: startDate, end: endDate },
        type: mapType,
        region: selectedRegion === 'all' ? undefined : selectedRegion
      };

      const [heatmap, analyticsData] = await Promise.all([
        tourismHeatmapService.generateHeatmapData(filters),
        tourismHeatmapService.generateTourismAnalytics(filters)
      ]);

      setHeatmapData(heatmap);
      setAnalytics(analyticsData);
      
      console.log(`✅ Mapa de calor carregado com ${heatmap.length} pontos`);
    } catch (error) {
      console.error('❌ Erro ao carregar mapa de calor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o mapa de calor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      const stats = await tourismHeatmapService.getRealTimeStats();
      setRealTimeStats(stats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas em tempo real:', error);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500';
    if (intensity >= 0.6) return 'bg-orange-500';
    if (intensity >= 0.4) return 'bg-yellow-500';
    if (intensity >= 0.2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getMapTypeDescription = () => {
    switch (mapType) {
      case 'density':
        return 'Mostra onde há mais turistas';
      case 'duration':
        return 'Mostra onde turistas ficam mais tempo';
      case 'engagement':
        return 'Mostra onde há maior engajamento';
      default:
        return '';
    }
  };

  const exportHeatmapData = () => {
    const exportData = {
      heatmap_data: heatmapData,
      analytics: analytics,
      real_time_stats: realTimeStats,
      filters: {
        map_type: mapType,
        time_range: timeRange,
        region: selectedRegion
      },
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tourism_heatmap_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Dados Exportados",
      description: "Dados do mapa de calor exportados com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mapa de Calor Turístico</h2>
          <p className="text-gray-600">{getMapTypeDescription()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={loadHeatmapData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportHeatmapData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de Mapa</label>
                <Select value={mapType} onValueChange={(value: any) => setMapType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="density">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Densidade de Visitantes
                      </div>
                    </SelectItem>
                    <SelectItem value="duration">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Tempo de Permanência
                      </div>
                    </SelectItem>
                    <SelectItem value="engagement">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Engajamento
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Período</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Últimas 24 horas</SelectItem>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Região</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Regiões</SelectItem>
                    <SelectItem value="centro_oeste">Centro-Oeste</SelectItem>
                    <SelectItem value="pantanal">Pantanal</SelectItem>
                    <SelectItem value="bonito">Bonito</SelectItem>
                    <SelectItem value="campo_grande">Campo Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas em Tempo Real */}
      {realTimeStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitantes Ativos</p>
                  <p className="text-2xl font-bold">{realTimeStats.active_visitors}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitas (Última Hora)</p>
                  <p className="text-2xl font-bold">{realTimeStats.current_hour_visits}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visitas (Hoje)</p>
                  <p className="text-2xl font-bold">{realTimeStats.today_visits}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tendência</p>
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mapa de Calor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Mapa de Calor Turístico
            </div>
            <Badge variant="outline">
              {heatmapData.length} pontos de interesse
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : heatmapData.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum dado de movimento encontrado</p>
              <p className="text-gray-400 text-sm">Tente ajustar os filtros ou período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Legenda */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Intensidade:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">Baixa</span>
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs">Média</span>
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs">Alta</span>
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-xs">Muito Alta</span>
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs">Máxima</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {mapType === 'density' && 'Visitantes por localização'}
                  {mapType === 'duration' && 'Tempo médio de permanência'}
                  {mapType === 'engagement' && 'Nível de engajamento'}
                </div>
              </div>

              {/* Pontos de Calor */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heatmapData.slice(0, 12).map((point, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getIntensityColor(point.intensity)}`}></div>
                        <span className="font-medium text-sm">
                          Ponto {index + 1}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(point.intensity * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Localização:</span>
                        <p>{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Visitantes:</span>
                          <p>{point.metadata.total_visitors}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duração:</span>
                          <p>{point.metadata.average_duration} min</p>
                        </div>
                      </div>
                      
                      {point.metadata.peak_hours.length > 0 && (
                        <div>
                          <span className="font-medium">Horários de Pico:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {point.metadata.peak_hours.map((hour, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {hour}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {point.metadata.popular_activities.length > 0 && (
                        <div>
                          <span className="font-medium">Atividades:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {point.metadata.popular_activities.map((activity, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {heatmapData.length > 12 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    Mostrando 12 de {heatmapData.length} pontos. 
                    Use os filtros para refinar a busca.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atrações Populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Atrações Mais Visitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.popular_attractions.slice(0, 8).map((attraction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{attraction.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {attraction.visits} visitas
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fluxo de Visitantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Fluxo de Visitantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.visitor_flow.slice(0, 8).map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{flow.from}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium">{flow.to}</span>
                    </div>
                    <Badge variant="secondary">
                      {flow.count} pessoas
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TourismHeatmap; 