
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { LEVEL_THRESHOLDS } from '@/types/flowtrip';

const LevelProgressCard = () => {
  const { userLevel } = useFlowTrip();

  const currentPoints = userLevel?.total_points || 0;
  const currentLevelName = userLevel?.current_level || 'Iniciante';
  const currentLevelNumber = userLevel?.level_number || 1;

  // Calcular próximo nível
  const nextLevelThreshold = Object.values(LEVEL_THRESHOLDS).find(threshold => threshold > currentPoints) || 2000;
  const previousLevelThreshold = Object.values(LEVEL_THRESHOLDS).filter(threshold => threshold <= currentPoints).pop() || 0;
  const progressToNextLevel = ((currentPoints - previousLevelThreshold) / (nextLevelThreshold - previousLevelThreshold)) * 100;
  const pointsToNext = nextLevelThreshold - currentPoints;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'text-gray-600 bg-gray-100';
      case 'Explorador': return 'text-blue-600 bg-blue-100';
      case 'Viajante': return 'text-green-600 bg-green-100';
      case 'Aventureiro': return 'text-orange-600 bg-orange-100';
      case 'Mestre': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Iniciante': return Star;
      case 'Explorador': return TrendingUp;
      case 'Viajante': return Zap;
      case 'Aventureiro': return Trophy;
      case 'Mestre': return Trophy;
      default: return Star;
    }
  };

  const LevelIcon = getLevelIcon(currentLevelName);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LevelIcon className="h-5 w-5 text-primary" />
            Progresso de Nível
          </div>
          <Badge className={`${getLevelColor(currentLevelName)} border-0`}>
            Nível {currentLevelNumber}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-primary">{currentLevelName}</h3>
          <p className="text-sm text-muted-foreground">
            {currentPoints.toLocaleString()} pontos totais
          </p>
        </div>

        {currentPoints < 2000 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Próximo nível</span>
              <span className="font-medium">
                {pointsToNext} pontos restantes
              </span>
            </div>
            <Progress 
              value={progressToNextLevel} 
              className="h-2"
            />
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progressToNextLevel)}% completado
            </p>
          </div>
        )}

        {currentPoints >= 2000 && (
          <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="font-semibold text-yellow-800">
              🎉 Nível Máximo Alcançado!
            </p>
            <p className="text-sm text-yellow-700">
              Você é um verdadeiro Mestre FlowTrip!
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-3 bg-white/50 rounded-lg border">
            <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Pontos</p>
            <p className="font-semibold">{currentPoints}</p>
          </div>
          <div className="text-center p-3 bg-white/50 rounded-lg border">
            <Star className="h-4 w-4 mx-auto mb-1 text-secondary" />
            <p className="text-xs text-muted-foreground">Nível</p>
            <p className="font-semibold">{currentLevelNumber}/5</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgressCard;
