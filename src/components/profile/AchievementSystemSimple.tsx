import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Crown } from 'lucide-react';
import { PantanalAnimal } from './PantanalAvatarSelector';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward?: string;
  unlockedAt?: Date;
}

interface AchievementSystemProps {
  achievements: Achievement[];
  pantanalAnimals: PantanalAnimal[];
}

const AchievementSystemSimple: React.FC<AchievementSystemProps> = ({
  achievements = [],
  pantanalAnimals = []
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Comum';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Award className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const completedAchievements = achievements.filter(a => a.isCompleted);
  const totalAchievements = achievements.length;
  const completionRate = totalAchievements > 0 ? (completedAchievements.length / totalAchievements) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Conquistas</h2>
        <p className="text-gray-600 mb-6">
          Desbloqueie conquistas e avatares especiais do Pantanal
        </p>
        
        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{completedAchievements.length}</div>
                <div className="text-sm text-gray-600">Conquistas Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalAchievements}</div>
                <div className="text-sm text-gray-600">Total de Conquistas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
                <div className="text-sm text-gray-600">Taxa de Conclusão</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={completionRate} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id}
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
              achievement.isCompleted ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getRarityIcon(achievement.rarity)}
                  {achievement.title}
                </CardTitle>
                <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                  {getRarityText(achievement.rarity)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{achievement.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-2"
                />
              </div>

              {/* Reward */}
              {achievement.reward && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    🎁 Recompensa: {achievement.reward}
                  </p>
                </div>
              )}

              {/* Completion Status */}
              {achievement.isCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Concluída!</span>
                </div>
              )}

              {/* Unlock Date */}
              {achievement.unlockedAt && (
                <p className="text-xs text-gray-500">
                  Desbloqueada em: {achievement.unlockedAt.toLocaleDateString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhuma conquista disponível
            </h3>
            <p className="text-gray-500">
              Complete ações na plataforma para desbloquear conquistas!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementSystemSimple;
