
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Trophy, Gift, Play, Image as ImageIcon } from "lucide-react";
import { TouristRegion } from "@/types/digitalPassport";
import { fetchTouristRegions } from "@/services/digitalPassportService";

interface InteractivePassportMapProps {
  onRegionSelect: (region: TouristRegion) => void;
  userStampsCount?: Record<string, number>;
}

const InteractivePassportMap: React.FC<InteractivePassportMapProps> = ({
  onRegionSelect,
  userStampsCount = {}
}) => {
  const [regions, setRegions] = useState<TouristRegion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await fetchTouristRegions();
        setRegions(data);
      } catch (error) {
        console.error('Erro ao carregar regiões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getRegionColor = (regionName: string) => {
    const colors = {
      'Pantanal': 'from-green-600 to-blue-600',
      'Bonito/Serra da Bodoquena': 'from-cyan-500 to-blue-500',
      'Campo Grande e Região': 'from-red-500 to-orange-500',
      'Corumbá': 'from-yellow-500 to-orange-500',
      'Costa Leste': 'from-orange-500 to-red-500',
      'Caminhos da Fronteira': 'from-green-500 to-emerald-500',
      'Grande Dourados': 'from-purple-500 to-pink-500',
      'Cerrado Pantanal': 'from-green-600 to-yellow-500',
      'Cone Sul': 'from-pink-500 to-purple-500',
      'Portal Sul': 'from-blue-500 to-indigo-500'
    };
    return colors[regionName as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCompletionLevel = (regionId: string) => {
    const stamps = userStampsCount[regionId] || 0;
    if (stamps === 0) return { level: 'Inexplorada', color: 'bg-gray-500', icon: MapPin };
    if (stamps < 3) return { level: 'Explorando', color: 'bg-blue-500', icon: Star };
    if (stamps < 5) return { level: 'Aventureiro', color: 'bg-yellow-500', icon: Trophy };
    return { level: 'Mestre', color: 'bg-green-500', icon: Gift };
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          🗺️ Mapa Interativo de Mato Grosso do Sul
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore as 10 regiões turísticas oficiais do estado. Colete carimbos digitais, 
          desbloqueie recompensas e torne-se um verdadeiro explorador sul-mato-grossense!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {regions.map((region) => {
          const completion = getCompletionLevel(region.id);
          const IconComponent = completion.icon;
          const stampsCount = userStampsCount[region.id] || 0;

          return (
            <Card 
              key={region.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 hover:border-blue-300"
              onClick={() => onRegionSelect(region)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold line-clamp-2 flex-1">
                    {region.name}
                  </CardTitle>
                  <Badge className={`${completion.color} text-white text-xs flex items-center gap-1`}>
                    <IconComponent className="w-3 h-3" />
                    {completion.level}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Imagem da região */}
                <div className={`h-32 rounded-lg bg-gradient-to-br ${getRegionColor(region.name)} flex items-center justify-center relative overflow-hidden`}>
                  {region.visual_art_url ? (
                    <img 
                      src={region.visual_art_url} 
                      alt={region.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium">Região Turística</span>
                    </div>
                  )}
                  
                  {/* Overlay com ícones */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {region.video_url && (
                      <div className="bg-black/50 rounded-full p-1">
                        <Play className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {region.guardian_avatar_url && (
                      <div className="bg-black/50 rounded-full p-1">
                        <ImageIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {region.description || 'Uma região única para explorar em Mato Grosso do Sul.'}
                </p>

                {/* Estatísticas */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Star className="w-4 h-4" />
                    <span>{stampsCount} carimbos</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                  >
                    Explorar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legenda */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Níveis de Exploração:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>Inexplorada (0 carimbos)</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span>Explorando (1-2 carimbos)</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Aventureiro (3-4 carimbos)</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-500" />
              <span>Mestre (5+ carimbos)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractivePassportMap;
