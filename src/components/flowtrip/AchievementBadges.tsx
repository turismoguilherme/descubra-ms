
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, MapPin, Calendar, Zap, Gift, Crown, Target, TrendingUp } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: (userLevel: any, stamps: any[]) => boolean;
  color: string;
  bgColor: string;
}

const AchievementBadges = () => {
  const { userLevel, passportStamps } = useFlowTrip();

  const achievements: Achievement[] = [
    {
      id: 'first_steps',
      name: 'Primeiros Passos',
      description: 'Complete o onboarding',
      icon: Star,
      requirement: (level, stamps) => level?.total_points >= 50,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'point_collector',
      name: 'Colecionador',
      description: 'Alcance 100 pontos',
      icon: Zap,
      requirement: (level, stamps) => level?.total_points >= 100,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'explorer',
      name: 'Explorador',
      description: 'Faça 3 check-ins',
      icon: MapPin,
      requirement: (level, stamps) => stamps.filter(s => s.activity_type === 'check_in').length >= 3,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'event_participant',
      name: 'Participativo',
      description: 'Participe de um evento',
      icon: Calendar,
      requirement: (level, stamps) => stamps.some(s => s.activity_type === 'event_participation'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'level_up',
      name: 'Evoluindo',
      description: 'Alcance o nível Explorador',
      icon: TrendingUp,
      requirement: (level, stamps) => level?.level_number >= 2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      id: 'stamp_collector',
      name: 'Colecionador de Carimbos',
      description: 'Colete 5 carimbos',
      icon: Gift,
      requirement: (level, stamps) => stamps.length >= 5,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      id: 'point_master',
      name: 'Mestre dos Pontos',
      description: 'Alcance 500 pontos',
      icon: Target,
      requirement: (level, stamps) => level?.total_points >= 500,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'champion',
      name: 'Campeão',
      description: 'Alcance o nível máximo',
      icon: Crown,
      requirement: (level, stamps) => level?.level_number >= 5,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  const unlockedAchievements = achievements.filter(achievement => 
    achievement.requirement(userLevel, passportStamps)
  );

  const lockedAchievements = achievements.filter(achievement => 
    !achievement.requirement(userLevel, passportStamps)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Conquistas
          <Badge variant="secondary">
            {unlockedAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Conquistas Desbloqueadas */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-green-800 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Desbloqueadas ({unlockedAchievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border border-green-200 ${achievement.bgColor} transition-all hover:scale-105`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-white/50`}>
                          <IconComponent className={`h-4 w-4 ${achievement.color}`} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{achievement.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conquistas Bloqueadas */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Próximas Conquistas ({lockedAchievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.slice(0, 4).map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-200">
                          <IconComponent className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-gray-700">
                            {achievement.name}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado vazio para conquistas */}
          {unlockedAchievements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conquista desbloqueada ainda</p>
              <p className="text-sm">Complete atividades para ganhar seus primeiros troféus!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadges;
