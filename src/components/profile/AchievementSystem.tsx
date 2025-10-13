import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Trophy, 
  Star, 
  Shield, 
  Heart, 
  MapPin,
  Camera,
  BookOpen,
  Users,
  Target
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

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  achievements,
  pantanalAnimals
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
    },
    {
      id: 'education-enthusiast',
      title: 'Entusiasta da Educação',
      description: 'Ler informações de 10 animais diferentes',
      icon: <BookOpen className="h-5 w-5" />,
      category: 'education',
      requirement: 'Ler sobre 10 animais',
      reward: 'Acesso a conteúdo educacional exclusivo',
      progress: Math.min(achievements.filter(a => a.includes('learned')).length, 10),
      maxProgress: 10,
      isUnlocked: achievements.filter(a => a.includes('learned')).length >= 10,
      rarity: 'rare'
    },
    {
      id: 'pantanal-ambassador',
      title: 'Embaixador do Pantanal',
      description: 'Compartilhou perfil 5 vezes',
      icon: <Users className="h-5 w-5" />,
      category: 'social',
      requirement: 'Compartilhar perfil 5 vezes',
      reward: 'Badge de embaixador',
      progress: Math.min(achievements.filter(a => a.includes('shared')).length, 5),
      maxProgress: 5,
      isUnlocked: achievements.filter(a => a.includes('shared')).length >= 5,
      rarity: 'epic'
    },
    {
      id: 'avatar-collector',
      title: 'Colecionador de Avatares',
      description: 'Desbloqueou todos os avatares disponíveis',
      icon: <Award className="h-5 w-5" />,
      category: 'exploration',
      requirement: 'Desbloquear todos os avatares',
      reward: 'Avatar especial exclusivo',
      progress: unlockedAnimals,
      maxProgress: totalAnimals,
      isUnlocked: unlockedAnimals === totalAnimals,
      rarity: 'legendary'
    },
    {
      id: 'conservation-advocate',
      title: 'Defensor da Conservação',
      description: 'Completou 3 roteiros de conservação',
      icon: <Heart className="h-5 w-5" />,
      category: 'conservation',
      requirement: 'Completar roteiros de conservação',
      reward: 'Acesso a projetos de conservação',
      progress: Math.min(achievements.filter(a => a.includes('conservation')).length, 3),
      maxProgress: 3,
      isUnlocked: achievements.filter(a => a.includes('conservation')).length >= 3,
      rarity: 'rare'
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
            Sistema de Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ms-primary-blue">
                {unlockedAchievements.length}
              </div>
              <div className="text-sm text-gray-600">Conquistas Desbloqueadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completionPercentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Progresso Geral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {unlockedAnimals}
              </div>
              <div className="text-sm text-gray-600">Avatares Desbloqueados</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Conquistas por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['exploration', 'conservation', 'education', 'social'].map((category) => {
          const categoryAchievements = allAchievements.filter(a => a.category === category);
          const categoryUnlocked = categoryAchievements.filter(a => a.isUnlocked).length;
          const categoryTotal = categoryAchievements.length;
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  {getCategoryIcon(category)}
                  <span className="ml-2 capitalize">
                    {category === 'exploration' ? 'Exploração' :
                     category === 'conservation' ? 'Conservação' :
                     category === 'education' ? 'Educação' : 'Social'}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {categoryUnlocked}/{categoryTotal}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryAchievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.isUnlocked 
                          ? getRarityColor(achievement.rarity)
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {achievement.icon}
                          <span className="ml-2 font-medium">{achievement.title}</span>
                        </div>
                        {achievement.isUnlocked && (
                          <Badge className="bg-green-100 text-green-800">
                            Desbloqueada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {achievement.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{achievement.requirement}</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1"
                        />
                      </div>
                      {achievement.isUnlocked && (
                        <div className="mt-2 text-xs text-green-700 font-medium">
                          🎁 Recompensa: {achievement.reward}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conquistas Recentes */}
      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.slice(-6).map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="flex items-center mb-2">
                    {achievement.icon}
                    <span className="ml-2 font-semibold">{achievement.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementSystem;
