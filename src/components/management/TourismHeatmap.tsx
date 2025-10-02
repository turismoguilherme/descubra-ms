import React, { useState, useEffect } from 'react';
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

interface TourismHeatmapProps {
  region?: string;
  userRole?: string;
}

const TourismHeatmap = ({ region, userRole }: TourismHeatmapProps) => {
  const [loading, setLoading] = useState(false);
  const [mapType, setMapType] = useState<'density' | 'duration' | 'engagement'>('density');
  const [timeRange, setTimeRange] = useState('7');
  const [selectedRegion, setSelectedRegion] = useState(region || 'all');

  // Dados simulados para demonstração
  const mockHeatmapData = [
    { id: 1, name: 'Centro Histórico', lat: -20.4697, lng: -54.6201, density: 89, duration: 4.2, engagement: 4.6 },
    { id: 2, name: 'Mercado Municipal', lat: -20.4686, lng: -54.6250, density: 67, duration: 2.8, engagement: 4.3 },
    { id: 3, name: 'Rodoviária', lat: -20.4700, lng: -54.6150, density: 45, duration: 1.5, engagement: 3.8 },
    { id: 4, name: 'Aeroporto', lat: -20.4686, lng: -54.6725, density: 78, duration: 3.1, engagement: 4.1 },
    { id: 5, name: 'Parque das Nações', lat: -20.4750, lng: -54.6100, density: 34, duration: 2.2, engagement: 4.4 }
  ];

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-red-500';
    if (density >= 60) return 'bg-orange-500';
    if (density >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDensityLabel = (density: number) => {
    if (density >= 80) return 'Alta Concentração';
    if (density >= 60) return 'Média Concentração';
    if (density >= 40) return 'Baixa Concentração';
    return 'Muito Baixa';
  };

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Mapa de Calor Turístico</h3>
          <p className="text-gray-600 mt-1">
            Visualização de concentrações e fluxos turísticos em tempo real
          </p>
        </div>
        
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

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pontos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{mockHeatmapData.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Turistas Ativos</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">3.2h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crescimento</p>
                <p className="text-2xl font-bold text-gray-900">+15%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Calor Simulado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mapa de Calor - {mapType === 'density' ? 'Densidade' : mapType === 'duration' ? 'Duração' : 'Engajamento'}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Atualizado: {new Date().toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto" />
              <h4 className="text-lg font-semibold text-gray-700">Mapa Interativo</h4>
              <p className="text-gray-500">
                Aqui seria exibido o mapa de calor interativo com os pontos de concentração turística.
                <br />
                <span className="text-sm">Funcionalidade será implementada com integração de mapas externos.</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pontos de Concentração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Pontos de Concentração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHeatmapData.map((point) => (
              <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${getDensityColor(point.density)}`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{point.name}</h4>
                    <p className="text-sm text-gray-500">
                      {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {mapType === 'density' ? `${point.density}%` : 
                       mapType === 'duration' ? `${point.duration}h` : 
                       `${point.engagement}/5`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {mapType === 'density' ? 'Densidade' : 
                       mapType === 'duration' ? 'Duração' : 'Engajamento'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {getDensityLabel(point.density)}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zonas de Alta Concentração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockHeatmapData
              .filter(point => point.density >= 70)
              .map((point) => (
                <div key={point.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">{point.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{point.density}% ocupação</span>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recomendações Inteligentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-900">Redistribuir Fluxo</h4>
              <p className="text-sm text-blue-700 mt-1">
                Centro Histórico com 89% de ocupação. Promover atrativos alternativos.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-900">Oportunidade</h4>
              <p className="text-sm text-green-700 mt-1">
                Parque das Nações com baixa ocupação (34%). Potencial para novos eventos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TourismHeatmap;




