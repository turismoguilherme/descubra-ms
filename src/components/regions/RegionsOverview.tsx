import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Calendar, Star, Map } from 'lucide-react';
import { useMSRegions } from '@/hooks/useRegions';
import { MSRegion } from '@/types/regions';
import { useMultiTenant } from '@/config/multiTenant';

interface RegionsOverviewProps {
  onRegionSelect?: (region: MSRegion) => void;
  showStats?: boolean;
}

export const RegionsOverview: React.FC<RegionsOverviewProps> = ({
  onRegionSelect,
  showStats = true
}) => {
  const { regions, loading, error, getRegionStats } = useMSRegions();
  const { currentTenant } = useMultiTenant();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  const stats = getRegionStats();

  const tourismTypeLabels = {
    ecoturismo: 'Ecoturismo',
    turismo_rural: 'Turismo Rural',
    turismo_urbano: 'Turismo Urbano',
    turismo_aventura: 'Turismo de Aventura',
    turismo_cultural: 'Turismo Cultural',
    turismo_fronteira: 'Turismo de Fronteira'
  };

  const seasonLabels = {
    'Março': 'Março',
    'Abril': 'Abril',
    'Maio': 'Maio',
    'Junho': 'Junho',
    'Julho': 'Julho',
    'Agosto': 'Agosto',
    'Setembro': 'Setembro',
    'Outubro': 'Outubro',
    'Novembro': 'Novembro'
  };

  const filteredRegions = regions.filter(region => {
    // Converter para MSRegion para acessar as propriedades específicas
    const msRegion = region as MSRegion;
    const matchesType = selectedType === 'all' || msRegion.tourism_type === selectedType;
    const matchesSeason = selectedSeason === 'all' || msRegion.best_season.includes(selectedSeason);
    return matchesType && matchesSeason;
  });

  const handleRegionClick = (region: unknown) => {
    if (onRegionSelect) {
      onRegionSelect(region as MSRegion);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2">Carregando regiões...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Erro ao carregar regiões: {error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Estatísticas das Regiões Turísticas
            </CardTitle>
            <CardDescription>
              Visão geral das {stats.total} regiões turísticas de {currentTenant.fullName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Regiões</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalCities}</div>
                <div className="text-sm text-gray-600">Cidades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.byType.ecoturismo}</div>
                <div className="text-sm text-gray-600">Ecoturismo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.byType.turismo_rural}</div>
                <div className="text-sm text-gray-600">Turismo Rural</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="type" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="type">Tipo de Turismo</TabsTrigger>
              <TabsTrigger value="season">Melhor Época</TabsTrigger>
            </TabsList>
            
            <TabsContent value="type" className="mt-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType('all')}
                >
                  Todas
                </Button>
                {Object.entries(tourismTypeLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedType === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="season" className="mt-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSeason === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeason('all')}
                >
                  Todas as épocas
                </Button>
                {Object.entries(seasonLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedSeason === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeason(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lista de Regiões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRegions.map((region) => (
          <Card 
            key={region.slug} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleRegionClick(region as MSRegion)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{region.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {region.cities.length} cidades
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {tourismTypeLabels[(region as MSRegion).tourism_type]}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-3">
                {region.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {region.cities.slice(0, 3).join(', ')}
                    {region.cities.length > 3 && ` +${region.cities.length - 3} mais`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    Melhor época: {(region as MSRegion).best_season.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600 font-medium">Destaques:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(region as MSRegion).highlights.slice(0, 3).map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                  {(region as MSRegion).highlights.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(region as MSRegion).highlights.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegionClick(region as MSRegion);
                }}
              >
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRegions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              Nenhuma região encontrada com os filtros selecionados.
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => {
                setSelectedType('all');
                setSelectedSeason('all');
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 