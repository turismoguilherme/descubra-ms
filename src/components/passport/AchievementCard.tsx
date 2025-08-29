import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement, UserAchievement } from '@/types/achievements';
import { motion } from 'framer-motion';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  userAchievement,
  className = '' 
}) => {
  const isUnlocked = !!userAchievement;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner': return '🎯';
      case 'exploration': return '🗺️';
      case 'collection': return '📝';
      case 'nature': return '🌲';
      case 'culture': return '🏛️';
      case 'special': return '⚡';
      case 'master': return '👑';
      default: return '🏆';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={className}
    >
      <Card className={`
        relative overflow-hidden transition-all duration-300
        ${isUnlocked 
          ? 'border-2 border-primary shadow-lg bg-gradient-to-br from-background to-muted/20' 
          : 'border border-muted-foreground/20 opacity-60 grayscale'
        }
      `}>
        {isUnlocked && (
          <div className="absolute top-2 right-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-primary text-primary-foreground rounded-full p-1"
            >
              ✓
            </motion.div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl
                ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}
              `}>
                {isUnlocked ? achievement.icon : '🔒'}
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {achievement.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {getCategoryIcon(achievement.category)}
                  </span>
                  <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </Badge>
                </div>
              </div>
            </div>
            {achievement.points_reward > 0 && (
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  +{achievement.points_reward}
                </div>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className={`text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {achievement.description}
          </p>
          
          {userAchievement && (
            <div className="mt-3 pt-3 border-t border-muted">
              <p className="text-xs text-muted-foreground">
                Desbloqueado em: {new Date(userAchievement.earned_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;