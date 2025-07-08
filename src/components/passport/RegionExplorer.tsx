
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Trophy, Gift, Star, Play, Users, Target } from "lucide-react";
import { TouristRegion, RegionCity, EnhancedTouristRoute } from "@/types/digitalPassport";
import { 
  fetchRegionCities, 
  fetchRoutesByRegion, 
  checkLocationProximity 
} from "@/services/digitalPassportService";

interface RegionExplorerProps {
  region: TouristRegion;
  onBack: () => void;
  onStartRoute: (route: EnhancedTouristRoute) => void;
  userLocation?: { latitude: number; longitude: number };
  userStamps?: string[];
}

const RegionExplorer: React.FC<RegionExplorerProps> = ({
  region,
  onBack,
  onStartRoute,
  userLocation,
  userStamps = []
}) => {
  const [cities, setCities] = useState<RegionCity[]>([]);
  const [routes, setRoutes] = useState<EnhancedTouristRoute[]>([]);
  const [selectedCity, setSelectedCity] = useState<RegionCity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegionData = async () => {
      try {
        setLoading(true);
        const [citiesData, routesData] = await Promise.all([
          fetchRegionCities(region.id),
          fetchRoutesByRegion(region.id)
        ]);
        
        setCities(citiesData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Erro ao carregar dados da região:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRegionData();
  }, [region.id]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return level;
    }
  };

  const isRouteAvailable = (route: EnhancedTouristRoute) => {
    if (!userLocation || !route.city?.latitude || !route.city?.longitude) {
      return false;
    }

    return checkLocationProximity(
      userLocation.latitude,
      userLocation.longitude,
      route.city.latitude,
      route.city.longitude,
      5000 // 5km de raio
    );
  };

  const hasCompletedRoute = (routeId: string) => {
    return userStamps.includes(routeId);
  };

  const filteredRoutes = selectedCity 
    ? routes.filter(route => route.city_id === selectedCity.id)
    : routes;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Região */}
      <div className="flex items-start gap-4">
        <Button variant="outline" onClick={onBack} className="mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{region.name}</h2>
            {region.video_url && (
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                Vídeo
              </Button>
            )}
          </div>
          
          {region.description && (
            <p className="text-gray-600 mb-4">{region.description}</p>
          )}

          {/* Estatísticas da região */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{cities.length}</div>
              <div className="text-sm text-gray-600">Cidades</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600">{routes.length}</div>
              <div className="text-sm text-gray-600">Roteiros</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">
                {routes.filter(r => hasCompletedRoute(r.id)).length}
              </div>
              <div className="text-sm text-gray-600">Concluídos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Gift className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">
                {routes.reduce((acc, r) => acc + (r.rewards?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Recompensas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro por cidade */}
      {cities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Filtrar por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedCity === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCity(null)}
              >
                Todas as Cidades
              </Button>
              {cities.map(city => (
                <Button 
                  key={city.id}
                  variant={selectedCity?.id === city.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCity(city)}
                  className="flex items-center gap-1"
                >
                  {city.name}
                  <Badge variant="secondary" className="ml-1">
                    {routes.filter(r => r.city_id === city.id).length}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Roteiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => {
          const isAvailable = isRouteAvailable(route);
          const isCompleted = hasCompletedRoute(route.id);
          
          return (
            <Card 
              key={route.id} 
              className={`group transition-all duration-300 ${
                isCompleted ? 'border-green-500 bg-green-50' : 
                isAvailable ? 'hover:shadow-lg border-blue-300' : 
                'opacity-60 border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">
                    {route.name}
                  </CardTitle>
                  {isCompleted && (
                    <Badge className="bg-green-500 text-white">
                      <Trophy className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
                
                {route.city && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {route.city.name}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {route.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {route.description}
                  </p>
                )}

                {/* Badges de informação */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(route.difficulty_level)}>
                    {getDifficultyLabel(route.difficulty_level)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {route.estimated_duration}min
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {route.points} pts
                  </Badge>
                </div>

                {/* Recompensas */}
                {route.rewards && route.rewards.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-700">Recompensas:</div>
                    {route.rewards.slice(0, 2).map(reward => (
                      <div key={reward.id} className="text-xs text-green-600 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {reward.title}
                      </div>
                    ))}
                    {route.rewards.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{route.rewards.length - 2} mais recompensas
                      </div>
                    )}
                  </div>
                )}

                {/* Botão de ação */}
                <Button 
                  className="w-full"
                  disabled={!isAvailable && !isCompleted}
                  variant={isCompleted ? "outline" : "default"}
                  onClick={() => onStartRoute(route)}
                >
                  {isCompleted ? (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </>
                  ) : isAvailable ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Roteiro
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Aproxime-se para Iniciar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRoutes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum roteiro encontrado
            </h3>
            <p className="text-gray-500">
              {selectedCity 
                ? `Não há roteiros disponíveis em ${selectedCity.name} no momento.`
                : `Esta região ainda não possui roteiros cadastrados.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegionExplorer;
