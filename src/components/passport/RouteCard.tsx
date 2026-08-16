
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Play, Star } from "lucide-react";
import { TouristRoute } from "@/types/passport";

interface RouteCardProps {
  route: TouristRoute;
  onStartRoute: (route: TouristRoute) => void;
  userProgress?: number;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onStartRoute, userProgress = 0 }) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facil':
        return 'bg-green-500';
      case 'medio':
        return 'bg-yellow-500';
      case 'dificil':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'facil':
        return 'Fácil';
      case 'medio':
        return 'Médio';
      case 'dificil':
        return 'Difícil';
      default:
        return level;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-black/20 text-white border-white/20 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{route.name}</CardTitle>
          <Badge className={`${getDifficultyColor(route.difficulty_level)} text-white`}>
            {getDifficultyLabel(route.difficulty_level)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-gray-300 mb-4 line-clamp-3">{route.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{route.region}</span>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>{route.estimated_duration} minutos</span>
          </div>

          {userProgress > 0 && (
            <div className="flex items-center text-sm text-green-400">
              <Star className="w-4 h-4 mr-2" />
              <span>Progresso: {userProgress}%</span>
            </div>
          )}
        </div>

        {route.video_url && (
          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full text-white border-white/50 hover:bg-white/10">
              <Play className="w-4 h-4 mr-2" />
              Ver Vídeo Promocional
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onStartRoute(route)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {userProgress > 0 ? 'Continuar Roteiro' : 'Iniciar Roteiro'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RouteCard;
