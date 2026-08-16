import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserLevel } from '@/types/achievements';

interface LevelProgressCardProps {
  currentPoints: number;
  level: UserLevel;
  className?: string;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({ 
  currentPoints, 
  level, 
  className = '' 
}) => {
  const getProgressPercentage = () => {
    if (!level.points_to_next) return 100; // Nível máximo
    
    const pointsForCurrentLevel = getCurrentLevelMinPoints();
    const pointsForNextLevel = pointsForCurrentLevel + level.points_to_next;
    const progress = ((currentPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const getCurrentLevelMinPoints = () => {
    switch (level.level) {
      case 1: return 0;
      case 2: return 101;
      case 3: return 501;
      case 4: return 1001;
      case 5: return 2000;
      default: return 0;
    }
  };

  const progressPercentage = getProgressPercentage();

  return (
    <Card className={`border-2 ${className}`} style={{ borderColor: level.color }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: level.color }}
            >
              {level.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{level.name}</h3>
              <p className="text-sm text-muted-foreground">Nível {level.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: level.color }}>
              {currentPoints}
            </div>
            <p className="text-xs text-muted-foreground">pontos</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {level.points_to_next && (
          <>
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
            <p className="text-center text-sm text-muted-foreground">
              Faltam {level.points_to_next} pontos para ser um{' '}
              <strong>{getNextLevelName()}</strong>
            </p>
          </>
        )}
        {!level.points_to_next && (
          <div className="text-center py-4">
            <div className="text-lg font-bold text-primary">
              🎉 Parabéns! Você alcançou o nível máximo!
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Continue explorando para colecionar mais conquistas!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function getNextLevelName() {
    switch (level.level) {
      case 1: return 'Explorador';
      case 2: return 'Viajante';
      case 3: return 'Aventureiro';
      case 4: return 'Mestre';
      default: return '';
    }
  }
};

export default LevelProgressCard;