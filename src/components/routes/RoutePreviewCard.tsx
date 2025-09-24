import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  Star, 
  Play, 
  Heart, 
  Share2, 
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TouristRoute } from '@/types/passport';

interface RoutePreviewCardProps {
  route: TouristRoute;
  onViewDetails: () => void;
  onStartRoute: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  isFavorite: boolean;
  userProgress?: number;
}

const RoutePreviewCard: React.FC<RoutePreviewCardProps> = ({
  route,
  onViewDetails,
  onStartRoute,
  onToggleFavorite,
  onShare,
  isFavorite,
  userProgress = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facil':
        return 'bg-green-500 text-white';
      case 'medio':
        return 'bg-yellow-500 text-white';
      case 'dificil':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  const getProgressMessage = () => {
    if (userProgress === 0) return 'Não iniciado';
    if (userProgress === 100) return 'Concluído';
    return `${userProgress}% concluído`;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 group overflow-hidden">
      {/* Header com ações */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-white group-hover:text-ms-accent-orange transition-colors">
            {route.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="text-white hover:text-red-400 hover:bg-white/10"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="text-white hover:text-blue-400 hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getDifficultyColor(route.difficulty_level)}>
            {getDifficultyLabel(route.difficulty_level)}
          </Badge>
          {userProgress > 0 && (
            <Badge className="bg-ms-secondary-teal text-white">
              <Trophy className="w-3 h-3 mr-1" />
              Em andamento
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Descrição */}
        <div className="mb-4">
          <p className="text-white/90 text-sm leading-relaxed">
            {isExpanded 
              ? route.description 
              : `${route.description.substring(0, 120)}${route.description.length > 120 ? '...' : ''}`
            }
          </p>
          {route.description.length > 120 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-ms-accent-orange hover:text-ms-accent-orange/80 p-0 h-auto mt-2"
            >
              {isExpanded ? (
                <>Ver menos <ChevronUp className="w-4 h-4 ml-1" /></>
              ) : (
                <>Ver mais <ChevronDown className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          )}
        </div>

        {/* Informações do roteiro */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-white/80">
            <MapPin className="w-4 h-4 mr-2 text-ms-secondary-teal" />
            <span>{route.region}</span>
          </div>

          <div className="flex items-center text-sm text-white/80">
            <Clock className="w-4 h-4 mr-2 text-ms-accent-orange" />
            <span>~{route.estimated_duration} minutos</span>
          </div>

          <div className="flex items-center text-sm text-white/80">
            <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
            <span>10 pontos no passaporte</span>
          </div>
        </div>

        {/* Progresso */}
        {userProgress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span>Progresso</span>
              <span>{getProgressMessage()}</span>
            </div>
            <Progress 
              value={userProgress} 
              className="h-2 bg-white/20"
            />
          </div>
        )}

        {/* Preview de vídeo */}
        {route.video_url && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-white border-white/30 hover:bg-white/10 hover:border-white/50"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Abrir modal de vídeo
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Assistir preview
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button 
            variant="outline"
            onClick={onViewDetails}
            className="text-white border-white/50 hover:bg-white/10"
          >
            Ver detalhes
          </Button>
          <Button 
            onClick={onStartRoute}
            className="bg-ms-accent-orange hover:bg-ms-accent-orange/90 text-white"
          >
            {userProgress > 0 ? 'Continuar' : 'Começar jornada'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoutePreviewCard;