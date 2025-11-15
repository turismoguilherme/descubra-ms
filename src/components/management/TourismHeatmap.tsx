import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
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
  const { toast } = useToast();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [analytics, setAnalytics] = useState<TourismAnalytics | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'density' | 'duration' | 'engagement'>('density');
  const [timeRange, setTimeRange] = useState('7');
  const [selectedRegion, setSelectedRegion] = useState(region || 'all');

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
        description: "Não foi possível carregar o mapa de calor. Usando dados de demonstração.",
        variant: "destructive"
      });
      // Fallback para dados mockados em caso de erro
      setHeatmapData([]);
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

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 0.8) return 'Alta Concentração';
    if (intensity >= 0.6) return 'Média Concentração';
    if (intensity >= 0.4) return 'Baixa Concentração';
    if (intensity >= 0.2) return 'Muito Baixa';
    return 'Mínima';
  };

  return (
    <SectionWrapper 
      variant="default" 
      title="Mapa de Calor Turístico"
      subtitle="Visualização de concentrações e fluxos turísticos em tempo real"
      actions={
        <div className="flex flex-wrap gap-3">
          <Select value={mapType} onValueChange={(value: any) => setMapType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="density">Densidade</SelectItem>
              <SelectItem value="duration">Duração</SelectItem>
              <SelectItem value="engagement">Engajamento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Hoje</SelectItem>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            onClick={loadHeatmapData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Estatísticas em Tempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pontos Ativos</p>
                <p className="text-2xl font-bold text-slate-900">{heatmapData.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardBox>

          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Turistas Ativos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics?.unique_visitors || realTimeStats?.active_visitors || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardBox>

          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics?.average_duration ? `${(analytics.average_duration / 60).toFixed(1)}h` : '0h'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardBox>

          <CardBox>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Movimentos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics?.total_movements || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardBox>
        </div>

        {/* Mapa de Calor Simulado */}
        <CardBox>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Mapa de Calor - {mapType === 'density' ? 'Densidade' : mapType === 'duration' ? 'Duração' : 'Engajamento'}
              </h3>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                <Clock className="h-3 w-3 mr-1" />
                Atualizado: {new Date().toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          <div className="bg-slate-100 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <MapPin className="h-16 w-16 text-slate-400 mx-auto" />
              <h4 className="text-lg font-semibold text-slate-700">Mapa Interativo</h4>
              <p className="text-slate-500">
                Aqui seria exibido o mapa de calor interativo com os pontos de concentração turística.
                <br />
                <span className="text-sm">Funcionalidade será implementada com integração de mapas externos.</span>
              </p>
            </div>
          </div>
        </CardBox>

        {/* Lista de Pontos de Concentração */}
        <CardBox>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Pontos de Concentração</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Carregando dados...</span>
            </div>
          ) : heatmapData.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              Nenhum dado de mapa de calor disponível no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {heatmapData.map((point, index) => (
                <CardBox key={index} className="hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${getIntensityColor(point.intensity)}`}></div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {point.metadata?.attraction_name || `Ponto ${index + 1}`}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-900">
                          {mapType === 'density' ? `${Math.round(point.intensity * 100)}%` : 
                           mapType === 'duration' ? `${point.metadata?.average_duration ? (point.metadata.average_duration / 60).toFixed(1) : 0}h` : 
                           `${Math.round(point.intensity * 5)}/5`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {mapType === 'density' ? 'Densidade' : 
                           mapType === 'duration' ? 'Duração' : 'Engajamento'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
                        {getIntensityLabel(point.intensity)}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardBox>
              ))}
            </div>
          )}
        </CardBox>

        {/* Insights e Recomendações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardBox>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Zonas de Alta Concentração</h3>
            <div className="space-y-3">
              {heatmapData
                .filter(point => point.intensity >= 0.7)
                .slice(0, 5)
                .map((point, index) => (
                  <CardBox key={index} className="bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">
                          {point.metadata?.attraction_name || `Ponto ${index + 1}`}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-red-100 border-red-300">
                        {Math.round(point.intensity * 100)}% ocupação
                      </Badge>
                    </div>
                  </CardBox>
                ))}
              {heatmapData.filter(point => point.intensity >= 0.7).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma zona de alta concentração no momento.
                </p>
              )}
            </div>
          </CardBox>

          <CardBox>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recomendações Inteligentes</h3>
            <div className="space-y-3">
              {analytics && analytics.popular_attractions.length > 0 ? (
                <>
                  {analytics.popular_attractions.slice(0, 2).map((attraction, index) => (
                    <CardBox key={index} className="bg-blue-50 border-blue-200">
                      <h4 className="font-medium text-blue-900">Atrativo Popular</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {attraction.name} com {attraction.visits} visitas.
                      </p>
                    </CardBox>
                  ))}
                </>
              ) : (
                <CardBox className="bg-slate-50 border-slate-200">
                  <h4 className="font-medium text-slate-900">Aguardando Dados</h4>
                  <p className="text-sm text-slate-700 mt-1">
                    Recomendações serão exibidas quando houver dados suficientes.
                  </p>
                </CardBox>
              )}
            </div>
          </CardBox>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default TourismHeatmap;




