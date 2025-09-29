import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useGameification } from '@/hooks/useGameification';
import { Sparkles, MapPin, FileText } from 'lucide-react';
import LevelProgressCard from './LevelProgressCard';
import AchievementCard from './AchievementCard';
import StatsOverview from './StatsOverview';
import { Badge } from '@/components/ui/badge';
import { achievementService } from '@/services/achievementService';

const EnhancedDigitalPassport: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading } = useGameification();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Faça login para ver seu passaporte digital.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p>Carregando seu passaporte digital...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Erro ao carregar dados do passaporte.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          🛂 Meu Passaporte Digital
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso explorando Mato Grosso do Sul
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Level Progress */}
      <LevelProgressCard 
        currentPoints={stats.totalPoints}
        level={stats.level}
        className="max-w-2xl mx-auto"
      />

      <Separator />

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Conquistas Desbloqueadas
            <Badge variant="secondary" className="ml-auto">
              {stats.achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.achievements.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-6xl">🎯</div>
              <h3 className="text-lg font-semibold">Comece sua jornada!</h3>
              <p className="text-muted-foreground">
                Complete roteiros e visite pontos turísticos para desbloquear suas primeiras conquistas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.achievements.map((userAchievement) => (
                <AchievementCard
                  key={userAchievement.id}
                  achievement={userAchievement.achievement!}
                  userAchievement={userAchievement}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma atividade recente. Comece explorando!
            </div>
          ) : (
            <div className="space-y-4">
              {stats.achievements.slice(0, 5).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20"
                >
                  <div className="text-2xl">{achievement.achievement?.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.achievement?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Desbloqueado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline">
                    +{achievement.achievement?.points_reward} pontos
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDigitalPassport; 