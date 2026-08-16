/**
 * Gamification System Component
 * Sistema de gamificação para o diagnóstico
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  Shield,
  Crown,
  Medal,
  Gift,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionnaireAnswers } from '@/types/diagnostic';
import { AnalysisResult } from '@/services/diagnostic/analysisService';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  requirements: {
    score?: number;
    category?: string;
    businessType?: string;
    goals?: string[];
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
  reward: string;
}

interface GamificationSystemProps {
  answers: QuestionnaireAnswers;
  analysisResult: AnalysisResult;
  onBadgeEarned?: (badge: Badge) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  className?: string;
}

const GamificationSystem: React.FC<GamificationSystemProps> = ({
  answers,
  analysisResult,
  onBadgeEarned,
  onAchievementUnlocked,
  className
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Configuração de badges
  const availableBadges: Badge[] = [
    {
      id: 'hotel-expert',
      name: 'Hotel Expert',
      description: 'Perfil completo de hotel',
      icon: '🏨',
      earned: answers.businessType === 'hotel' && analysisResult.overallScore >= 80,
      requirements: { businessType: 'hotel', score: 80 },
      rarity: 'rare'
    },
    {
      id: 'agency-master',
      name: 'Agência Master',
      description: 'Agência experiente',
      icon: '🚌',
      earned: answers.businessType === 'agency' && analysisResult.overallScore >= 85,
      requirements: { businessType: 'agency', score: 85 },
      rarity: 'rare'
    },
    {
      id: 'gastronomy-star',
      name: 'Gastronomia Star',
      description: 'Restaurante destacado',
      icon: '🍽️',
      earned: answers.businessType === 'restaurant' && analysisResult.overallScore >= 75,
      requirements: { businessType: 'restaurant', score: 75 },
      rarity: 'rare'
    },
    {
      id: 'data-lover',
      name: 'Data Lover',
      description: 'Empresa analítica',
      icon: '📊',
      earned: answers.goals.includes('melhorar_analytics') && analysisResult.overallScore >= 70,
      requirements: { category: 'analytics', score: 70 },
      rarity: 'common'
    },
    {
      id: 'growth-champion',
      name: 'Growth Champion',
      description: 'Alto potencial de crescimento',
      icon: '🚀',
      earned: analysisResult.growthPotential >= 80,
      requirements: { score: 80 },
      rarity: 'epic'
    },
    {
      id: 'roi-master',
      name: 'ROI Master',
      description: 'Excelente retorno sobre investimento',
      icon: '💰',
      earned: analysisResult.estimatedROI >= 300,
      requirements: { score: 300 },
      rarity: 'epic'
    },
    {
      id: 'tech-savvy',
      name: 'Tech Savvy',
      description: 'Alto nível técnico',
      icon: '💻',
      earned: answers.technicalLevel === 'advanced' && analysisResult.overallScore >= 70,
      requirements: { score: 70 },
      rarity: 'common'
    },
    {
      id: 'visionary',
      name: 'Visionary',
      description: 'Visão de transformação digital',
      icon: '🔮',
      earned: answers.goals.includes('digitalizar') && answers.goals.includes('automatizar'),
      requirements: { goals: ['digitalizar', 'automatizar'] },
      rarity: 'legendary'
    },
    {
      id: 'revenue-optimizer',
      name: 'Revenue Optimizer',
      description: 'Foco em otimização de receita',
      icon: '📈',
      earned: answers.goals.includes('aumentar_receita') && analysisResult.estimatedROI >= 200,
      requirements: { goals: ['aumentar_receita'], score: 200 },
      rarity: 'rare'
    },
    {
      id: 'market-leader',
      name: 'Market Leader',
      description: 'Posição de liderança no mercado',
      icon: '👑',
      earned: analysisResult.businessProfile.marketPosition === 'leader',
      requirements: { score: 90 },
      rarity: 'legendary'
    }
  ];

  // Configuração de conquistas
  const availableAchievements: Achievement[] = [
    {
      id: 'first-diagnostic',
      name: 'Primeiro Diagnóstico',
      description: 'Complete seu primeiro diagnóstico',
      icon: '🎯',
      earned: true,
      progress: 1,
      maxProgress: 1,
      reward: 'Badge de Iniciante'
    },
    {
      id: 'high-score',
      name: 'High Score',
      description: 'Alcance um score acima de 80',
      icon: '⭐',
      earned: analysisResult.overallScore >= 80,
      progress: analysisResult.overallScore,
      maxProgress: 100,
      reward: 'Badge de Excelência'
    },
    {
      id: 'growth-potential',
      name: 'Growth Potential',
      description: 'Potencial de crescimento acima de 70%',
      icon: '🌱',
      earned: analysisResult.growthPotential >= 70,
      progress: analysisResult.growthPotential,
      maxProgress: 100,
      reward: 'Badge de Crescimento'
    },
    {
      id: 'roi-champion',
      name: 'ROI Champion',
      description: 'ROI estimado acima de 250%',
      icon: '💎',
      earned: analysisResult.estimatedROI >= 250,
      progress: Math.min(analysisResult.estimatedROI, 500),
      maxProgress: 500,
      reward: 'Badge de ROI'
    },
    {
      id: 'recommendation-master',
      name: 'Recommendation Master',
      description: 'Receba 5+ recomendações',
      icon: '🎖️',
      earned: analysisResult.recommendations.length >= 5,
      progress: analysisResult.recommendations.length,
      maxProgress: 10,
      reward: 'Badge de Recomendações'
    }
  ];

  useEffect(() => {
    // Calcular badges conquistados
    const earnedBadges = availableBadges.filter(badge => badge.earned);
    setBadges(earnedBadges);

    // Calcular conquistas desbloqueadas
    const unlockedAchievements = availableAchievements.filter(achievement => achievement.earned);
    setAchievements(unlockedAchievements);

    // Calcular score total
    const score = earnedBadges.reduce((sum, badge) => {
      const rarityMultiplier = {
        common: 10,
        rare: 25,
        epic: 50,
        legendary: 100
      };
      return sum + rarityMultiplier[badge.rarity];
    }, 0);
    setTotalScore(score);

    // Calcular nível
    const newLevel = Math.floor(score / 100) + 1;
    setLevel(newLevel);

    // Detectar novos badges
    const newBadgesEarned = earnedBadges.filter(badge => 
      !badges.some(existingBadge => existingBadge.id === badge.id)
    );
    setNewBadges(newBadgesEarned);

    // Detectar novas conquistas
    const newAchievementsUnlocked = unlockedAchievements.filter(achievement => 
      !achievements.some(existingAchievement => existingAchievement.id === achievement.id)
    );
    setNewAchievements(newAchievementsUnlocked);

    // Notificar novos badges e conquistas
    newBadgesEarned.forEach(badge => onBadgeEarned?.(badge));
    newAchievementsUnlocked.forEach(achievement => onAchievementUnlocked?.(achievement));
  }, [analysisResult, answers]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Medal className="w-4 h-4" />;
      case 'rare': return <Award className="w-4 h-4" />;
      case 'epic': return <Trophy className="w-4 h-4" />;
      case 'legendary': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Score e Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{totalScore}</div>
              <div className="text-sm text-muted-foreground">Pontos Totais</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">Nível {level}</div>
              <div className="text-sm text-muted-foreground">Nível Atual</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{badges.length}</div>
              <div className="text-sm text-muted-foreground">Badges Conquistados</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{totalScore % 100}/100</span>
            </div>
            <Progress value={(totalScore % 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Novos Badges e Conquistas */}
      {(newBadges.length > 0 || newAchievements.length > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Sparkles className="w-5 h-5" />
              Novas Conquistas!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newBadges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-yellow-800">{badge.name}</div>
                  <div className="text-sm text-yellow-600">{badge.description}</div>
                </div>
                <Badge className={getRarityColor(badge.rarity)}>
                  {getRarityIcon(badge.rarity)}
                  {badge.rarity}
                </Badge>
              </div>
            ))}
            
            {newAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-yellow-800">{achievement.name}</div>
                  <div className="text-sm text-yellow-600">{achievement.description}</div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  {achievement.reward}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Badges Conquistados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges Conquistados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{badge.name}</div>
                  <div className="text-sm text-muted-foreground">{badge.description}</div>
                </div>
                <Badge className={getRarityColor(badge.rarity)}>
                  {getRarityIcon(badge.rarity)}
                  {badge.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  <div className="mt-2">
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {achievement.reward}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Próximos Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableBadges.filter(badge => !badge.earned).slice(0, 3).map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <span className="text-xl opacity-50">{badge.icon}</span>
                <div className="flex-1">
                  <div className="font-medium opacity-75">{badge.name}</div>
                  <div className="text-sm text-muted-foreground">{badge.description}</div>
                </div>
                <Badge variant="outline" className="opacity-50">
                  {getRarityIcon(badge.rarity)}
                  {badge.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSystem;
