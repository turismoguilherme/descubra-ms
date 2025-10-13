import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Trophy, 
  Star, 
  Shield, 
  Heart, 
  MapPin,
  BookOpen,
  Users,
  Target,
  Zap,
  Lock,
  CheckCircle
} from 'lucide-react';

interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  image: string;
  habitat: string;
  diet: string;
  curiosities: string[];
  conservation_status: string;
  unlock_requirement?: string;
  is_unlocked: boolean;
}

interface AchievementSystemProps {
  achievements: string[];
  pantanalAnimals: PantanalAnimal[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'exploration' | 'conservation' | 'education' | 'social';
  requirement: string;
  reward: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const AchievementSystemSimple: React.FC<AchievementSystemProps> = ({
  achievements = [],
  pantanalAnimals = []
}) => {
  // Calcular progresso baseado nos animais desbloqueados
  const unlockedAnimals = pantanalAnimals.filter(animal => animal.is_unlocked).length;
  const totalAnimals = pantanalAnimals.length;
  const completedRoutes = achievements.filter(a => a.includes('route')).length;

  const allAchievements: Achievement[] = [
    {
      id: 'first-avatar',
      title: 'Primeiro Passo',
      description: 'Escolheu seu primeiro avatar do Pantanal',
      icon: <Star className="h-5 w-5" />,
      category: 'exploration',
      requirement: 'Escolher qualquer avatar',
      reward: 'Desbloqueia mais informações sobre o animal',
      progress: achievements.includes('first-avatar') ? 1 : 0,
      maxProgress: 1,
      isUnlocked: achievements.includes('first-avatar'),
      rarity: 'common'
    },
    {
      id: 'pantanal-explorer',
      title: 'Explorador do Pantanal',
      description: 'Desbloqueou 5 avatares diferentes',
      icon: <MapPin className="h-5 w-5" />,
      category: 'exploration',
      requirement: 'Desbloquear 5 avatares',
      reward: 'Acesso a informações exclusivas',
      progress: Math.min(unlockedAnimals, 5),
      maxProgress: 5,
      isUnlocked: unlockedAnimals >= 5,
      rarity: 'rare'
    },
    {
      id: 'conservation-champion',
      title: 'Campeão da Conservação',
      description: 'Desbloqueou todos os avatares ameaçados',
      icon: <Shield className="h-5 w-5" />,
      category: 'conservation',
      requirement: 'Desbloquear avatares de espécies ameaçadas',
      reward: 'Badge especial de conservacionista',
      progress: pantanalAnimals.filter(animal => 
        animal.is_unlocked && 
        animal.conservation_status !== 'Pouco Preocupante'
      ).length,
      maxProgress: pantanalAnimals.filter(animal => 
        animal.conservation_status !== 'Pouco Preocupante'
      ).length,
      isUnlocked: pantanalAnimals.filter(animal => 
        animal.is_unlocked && 
        animal.conservation_status !== 'Pouco Preocupante'
      ).length === pantanalAnimals.filter(animal => 
        animal.conservation_status !== 'Pouco Preocupante'
      ).length,
      rarity: 'epic'
    },
    {
      id: 'route-master',
      title: 'Mestre dos Roteiros',
      description: 'Completou 10 roteiros do Passaporte',
      icon: <Trophy className="h-5 w-5" />,
      category: 'exploration',
      requirement: 'Completar 10 roteiros',
      reward: 'Desbloqueia avatares exclusivos',
      progress: completedRoutes,
      maxProgress: 10,
      isUnlocked: completedRoutes >= 10,
      rarity: 'legendary'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exploration':
        return <MapPin className="h-4 w-4" />;
      case 'conservation':
        return <Shield className="h-4 w-4" />;
      case 'education':
        return <BookOpen className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const unlockedAchievements = allAchievements.filter(a => a.isUnlocked);
  const totalAchievements = allAchievements.length;
  const completionPercentage = (unlockedAchievements.length / totalAchievements) * 100;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
            Sistema de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-ms-primary-blue">
                {unlockedAchievements.length}
              </div>
              <div className="text-sm text-gray-600">Conquistas Desbloqueadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {completionPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Progresso Geral</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {unlockedAnimals}
              </div>
              <div className="text-sm text-gray-600">Avatares Desbloqueados</div>
            </div>
          </div>
          
          {/* Barra de Progresso Customizada */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allAchievements.map((achievement) => (
          <Card key={achievement.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div 
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  achievement.isUnlocked 
                    ? `${getRarityColor(achievement.rarity)} shadow-md` 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {achievement.icon}
                    <span className="ml-2 font-semibold">{achievement.title}</span>
                  </div>
                  {achievement.isUnlocked ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Desbloqueada</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <Lock className="h-4 w-4 mr-1" />
                      <span className="text-sm">Bloqueada</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {achievement.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{achievement.requirement}</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  
                  {/* Barra de Progresso Customizada */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        achievement.rarity === 'common' ? 'bg-gray-400' :
                        achievement.rarity === 'rare' ? 'bg-blue-400' :
                        achievement.rarity === 'epic' ? 'bg-purple-400' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {achievement.isUnlocked && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700 font-medium">
                    🎁 Recompensa: {achievement.reward}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AchievementSystemSimple;
