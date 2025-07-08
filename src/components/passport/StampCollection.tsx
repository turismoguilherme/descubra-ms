
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, MapPin, Star } from "lucide-react";
import { UserStamp, PantanalAnimal } from "@/types/passport";

interface StampCollectionProps {
  stamps: UserStamp[];
  animals?: PantanalAnimal[];
}

const StampCollection = ({ stamps, animals = [] }: StampCollectionProps) => {
  const getStampIcon = (stamp: UserStamp) => {
    if (stamp.stamp_icon_url) {
      return stamp.stamp_icon_url;
    }
    
    // Default icon based on completion percentage
    if (stamp.completion_percentage === 100) {
      return "🏆";
    } else if (stamp.completion_percentage >= 75) {
      return "⭐";
    } else if (stamp.completion_percentage >= 50) {
      return "🎯";
    }
    return "📍";
  };

  const getAnimalInfo = (stamp: UserStamp): PantanalAnimal | null => {
    if (!stamp.animal_id) return null;
    return animals.find(animal => animal.id === stamp.animal_id) || null;
  };

  const getRarityBadge = (animal: PantanalAnimal | null) => {
    if (!animal?.rarity_level) return null;
    
    const rarity = animal.rarity_level.toLowerCase();
    const variants = {
      'comum': 'secondary',
      'raro': 'default',
      'épico': 'destructive',
      'lendário': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[rarity as keyof typeof variants] || 'secondary'}>
        {animal.rarity_level}
      </Badge>
    );
  };

  const groupStampsByCategory = () => {
    const groups = {
      routes: stamps.filter(s => s.route_id),
      cities: stamps.filter(s => s.city_id && !s.route_id),
      regions: stamps.filter(s => s.region_id && !s.city_id && !s.route_id),
      animals: stamps.filter(s => s.animal_id)
    };
    
    return groups;
  };

  const stampGroups = groupStampsByCategory();

  if (stamps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Award className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum selo coletado
          </h3>
          <p className="text-gray-500 text-center">
            Complete roteiros e visite destinos para começar sua coleção de selos digitais!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selos de Roteiros */}
      {stampGroups.routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Selos de Roteiros ({stampGroups.routes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stampGroups.routes.map((stamp) => (
                <div key={stamp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{getStampIcon(stamp)}</div>
                    <Badge variant="outline">
                      {stamp.completion_percentage}%
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{stamp.stamp_name}</h4>
                  
                  {stamp.cultural_phrase && (
                    <p className="text-sm text-blue-600 italic mb-2">
                      "{stamp.cultural_phrase}"
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(stamp.earned_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selos de Cidades */}
      {stampGroups.cities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏙️ Selos de Cidades ({stampGroups.cities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stampGroups.cities.map((stamp) => (
                <div key={stamp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl">{getStampIcon(stamp)}</div>
                    <Badge variant="outline">Cidade</Badge>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{stamp.stamp_name}</h4>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(stamp.earned_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selos de Animais do Pantanal */}
      {stampGroups.animals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🐆 Fauna do Pantanal ({stampGroups.animals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stampGroups.animals.map((stamp) => {
                const animal = getAnimalInfo(stamp);
                return (
                  <div key={stamp.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">
                        {animal?.image_url ? (
                          <img 
                            src={animal.image_url} 
                            alt={animal.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          getStampIcon(stamp)
                        )}
                      </div>
                      {getRarityBadge(animal)}
                    </div>
                    
                    <h4 className="font-semibold mb-1">
                      {animal?.name || stamp.stamp_name}
                    </h4>
                    
                    {animal?.scientific_name && (
                      <p className="text-sm text-gray-500 italic mb-2">
                        {animal.scientific_name}
                      </p>
                    )}
                    
                    {animal?.fun_fact && (
                      <p className="text-sm text-blue-600 mb-2">
                        💡 {animal.fun_fact}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(stamp.earned_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas da Coleção */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Estatísticas da Coleção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stamps.length}
              </div>
              <div className="text-sm text-gray-600">Total de Selos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stampGroups.routes.length}
              </div>
              <div className="text-sm text-gray-600">Roteiros</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stampGroups.cities.length}
              </div>
              <div className="text-sm text-gray-600">Cidades</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stampGroups.animals.length}
              </div>
              <div className="text-sm text-gray-600">Animais</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StampCollection;
