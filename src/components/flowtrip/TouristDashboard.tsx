import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, MapPin, Star, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { LEVEL_THRESHOLDS } from '@/types/flowtrip';

const TouristDashboard = () => {
  const { userLevel, passportStamps, currentState, isLoading } = useFlowTrip();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted/50" />
            <CardContent className="h-24 bg-muted/20" />
          </Card>
        ))}
      </div>
    );
  }

  const currentPoints = userLevel?.total_points || 0;
  const currentLevelNumber = userLevel?.level_number || 1;
  const currentLevelName = userLevel?.current_level || 'Iniciante';

  // Calcular próximo nível
  const nextLevelThreshold = Object.values(LEVEL_THRESHOLDS).find(threshold => threshold > currentPoints) || 2000;
  const previousLevelThreshold = Object.values(LEVEL_THRESHOLDS).filter(threshold => threshold <= currentPoints).pop() || 0;
  const progressToNextLevel = ((currentPoints - previousLevelThreshold) / (nextLevelThreshold - previousLevelThreshold)) * 100;

  const stats = [
    {
      title: 'Pontos Totais',
      value: currentPoints.toLocaleString(),
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Nível Atual',
      value: currentLevelName,
      icon: Trophy,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      title: 'Locais Visitados',
      value: passportStamps.length,
      icon: MapPin,
      color: 'text-ms-discovery-teal',
      bgColor: 'bg-ms-discovery-teal/10'
    },
    {
      title: 'Conquistas',
      value: '0', // Implementar depois
      icon: Star,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com informações do usuário */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                Bem-vindo ao FlowTrip!
              </CardTitle>
              <p className="text-white/80">
                Explorando {currentState?.name || 'destinos incríveis'}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Nível {currentLevelNumber}
              </Badge>
              <p className="text-white/80 mt-1">{currentLevelName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{currentPoints}/{nextLevelThreshold} pontos</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Atividades recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {passportStamps.slice(0, 5).map((stamp, index) => (
              <div key={stamp.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {stamp.activity_type === 'check_in' ? 'Check-in realizado' : 'Nova atividade'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(stamp.stamped_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary">
                  +{stamp.points_earned} pontos
                </Badge>
              </div>
            ))}
            {passportStamps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma atividade ainda</p>
                <p className="text-sm">Comece explorando os destinos!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TouristDashboard;