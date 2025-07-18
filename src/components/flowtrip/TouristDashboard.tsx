
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, MapPin, Star, Trophy, Calendar, TrendingUp, Users, Gift } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import OnboardingWelcome from './OnboardingWelcome';
import DemoDataSeeder from './DemoDataSeeder';
import LevelProgressCard from './LevelProgressCard';
import AchievementBadges from './AchievementBadges';
import QuickActions from './QuickActions';

const TouristDashboard = () => {
  const { userLevel, passportStamps, currentState, isLoading } = useFlowTrip();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDemoSeeder, setShowDemoSeeder] = useState(false);

  useEffect(() => {
    // Verificar se precisa mostrar onboarding
    const onboardingComplete = localStorage.getItem('flowtrip_onboarding_complete');
    const hasPoints = userLevel?.total_points && userLevel.total_points > 0;
    
    if (!onboardingComplete && !hasPoints) {
      setShowOnboarding(true);
    }

    // Verificar se deve mostrar o seeder de dados demo
    const demoDataSeeded = localStorage.getItem('flowtrip_demo_data_seeded');
    const hasStamps = passportStamps && passportStamps.length > 0;
    
    if (!demoDataSeeded && !hasStamps && onboardingComplete) {
      setShowDemoSeeder(true);
    }
  }, [userLevel, passportStamps]);

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

  const stats = [
    {
      title: 'Pontos Totais',
      value: currentPoints.toLocaleString(),
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+12 hoje'
    },
    {
      title: 'Locais Visitados',
      value: passportStamps.filter(s => s.activity_type === 'check_in').length,
      icon: MapPin,
      color: 'text-ms-discovery-teal',
      bgColor: 'bg-ms-discovery-teal/10',
      trend: 'Novos locais disponíveis'
    },
    {
      title: 'Eventos Participados',
      value: passportStamps.filter(s => s.activity_type === 'event_participation').length,
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      trend: '3 eventos próximos'
    },
    {
      title: 'Carimbos Coletados',
      value: passportStamps.length,
      icon: Star,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      trend: 'Coleção crescendo'
    }
  ];

  return (
    <>
      {showOnboarding && <OnboardingWelcome />}
      
      <div className="space-y-6">
        {/* Header com informações do usuário */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                  <Gift className="h-6 w-6" />
                  Bem-vindo ao FlowTrip!
                </CardTitle>
                <p className="text-white/80">
                  Explorando {currentState?.name || 'destinos incríveis'} • Nível {currentLevelName}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/20 text-white border-white/30">
                  Nível {currentLevelNumber}
                </Badge>
                <p className="text-white/80 mt-1 text-sm">
                  {currentPoints} pontos
                </p>
              </div>
            </div>
          </CardHeader>
          {/* Decorative elements */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 -top-8 w-16 h-16 bg-white/5 rounded-full"></div>
        </Card>

        {/* Demo Data Seeder - aparece se necessário */}
        {showDemoSeeder && <DemoDataSeeder />}

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Progresso e ações */}
          <div className="lg:col-span-1 space-y-6">
            <LevelProgressCard />
            <QuickActions />
          </div>

          {/* Coluna direita - Stats e conquistas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-xs text-green-600 font-medium">
                        {stat.trend}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Conquistas */}
            <AchievementBadges />
          </div>
        </div>

        {/* Atividades recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividades Recentes
              {passportStamps.length > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {passportStamps.length} atividades
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {passportStamps.slice(0, 5).map((stamp, index) => (
                <div key={stamp.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {stamp.activity_type === 'check_in' ? 'Check-in realizado' : 
                         stamp.activity_type === 'event_participation' ? 'Participação em evento' :
                         stamp.activity_type === 'onboarding_welcome' ? 'Boas-vindas ao FlowTrip' :
                         stamp.activity_type === 'onboarding_complete' ? 'Onboarding completado' :
                         'Nova atividade'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(stamp.stamped_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-primary bg-primary/5 border-primary/20">
                    +{stamp.points_earned} pontos
                  </Badge>
                </div>
              ))}
              
              {passportStamps.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade ainda</p>
                  <p className="text-sm">Use as ações rápidas acima para começar sua jornada!</p>
                </div>
              )}

              {passportStamps.length > 5 && (
                <div className="text-center pt-4">
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    Ver todas as {passportStamps.length} atividades
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cards de acesso rápido aos recursos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-green-800">Explorar Destinos</h3>
              <p className="text-sm text-green-600 mt-1">
                Descubra novos lugares incríveis
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-blue-800">Eventos</h3>
              <p className="text-sm text-blue-600 mt-1">
                Participe de experiências únicas
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-purple-200 bg-purple-50/50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-purple-800">Comunidade</h3>
              <p className="text-sm text-purple-600 mt-1">
                Conecte-se com outros viajantes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TouristDashboard;
