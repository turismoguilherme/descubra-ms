import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, Trophy, Target, Gift, Star, TrendingUp } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { LEVEL_THRESHOLDS, ACTIVITY_POINTS } from '@/types/flowtrip';

const PointsSystem = () => {
  const { userLevel, addPoints, isLoading } = useFlowTrip();

  const currentPoints = userLevel?.total_points || 0;
  const currentLevelNumber = userLevel?.level_number || 1;
  const currentLevelName = userLevel?.current_level || 'Iniciante';

  // Sistema de níveis
  const levels = [
    { name: 'Iniciante', number: 1, threshold: 0, color: 'bg-gray-500' },
    { name: 'Explorador', number: 2, threshold: 101, color: 'bg-blue-500' },
    { name: 'Viajante', number: 3, threshold: 501, color: 'bg-green-500' },
    { name: 'Aventureiro', number: 4, threshold: 1001, color: 'bg-purple-500' },
    { name: 'Mestre', number: 5, threshold: 2000, color: 'bg-yellow-500' }
  ];

  // Calcular próximo nível
  const nextLevel = levels.find(level => level.threshold > currentPoints);
  const currentLevelData = levels.find(level => level.number === currentLevelNumber);
  const progressToNextLevel = nextLevel 
    ? ((currentPoints - (currentLevelData?.threshold || 0)) / (nextLevel.threshold - (currentLevelData?.threshold || 0))) * 100
    : 100;

  // Atividades para ganhar pontos
  const activities = [
    {
      name: 'Check-in em destinos',
      points: ACTIVITY_POINTS.CHECK_IN,
      icon: Target,
      description: 'Visite locais turísticos'
    },
    {
      name: 'Participar de eventos',
      points: ACTIVITY_POINTS.EVENT_PARTICIPATION,
      icon: Star,
      description: 'Participe de eventos locais'
    },
    {
      name: 'Avaliar destinos',
      points: ACTIVITY_POINTS.DESTINATION_REVIEW,
      icon: Trophy,
      description: 'Deixe sua avaliação'
    },
    {
      name: 'Compartilhar experiências',
      points: ACTIVITY_POINTS.SOCIAL_SHARE,
      icon: Gift,
      description: 'Compartilhe nas redes sociais'
    }
  ];

  const handleTestPoints = async () => {
    if (isLoading) return;
    await addPoints(10, 'test');
  };

  return (
    <div className="space-y-6">
      {/* Status atual */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Sistema de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentPoints.toLocaleString()} pontos</p>
                <p className="text-white/80">Nível {currentLevelNumber}: {currentLevelName}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-1" />
                {currentLevelName}
              </Badge>
            </div>
            
            {nextLevel && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso para {nextLevel.name}</span>
                  <span>{currentPoints}/{nextLevel.threshold} pontos</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
                <p className="text-xs text-white/70">
                  Faltam {nextLevel.threshold - currentPoints} pontos para o próximo nível
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Níveis disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Níveis do FlowTrip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levels.map((level, index) => (
              <div key={level.number} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center text-white font-bold`}>
                  {level.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{level.name}</h3>
                    {currentLevelNumber === level.number && (
                      <Badge variant="default" className="text-xs">Atual</Badge>
                    )}
                    {currentLevelNumber > level.number && (
                      <Badge variant="secondary" className="text-xs">Conquistado</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {level.threshold === 0 ? 'Nível inicial' : `${level.threshold}+ pontos`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Como ganhar pontos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Como Ganhar Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-full">
                  <activity.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.name}</h4>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <Badge variant="outline" className="text-primary">
                  +{activity.points}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão de teste (remover em produção) */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Teste o sistema de pontos (apenas para desenvolvimento)
          </p>
          <Button 
            onClick={handleTestPoints} 
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Ganhar 10 pontos (teste)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PointsSystem;