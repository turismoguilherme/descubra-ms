import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Clock, 
  Camera, 
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Navigation,
  Sparkles,
  Flag,
  Star
} from 'lucide-react';
import { TouristRoute, RouteCheckpoint } from '@/types/passport';
import { useRouteManagement } from '@/hooks/useRouteManagement';
import CheckpointExecution from '@/components/passport/CheckpointExecution';
import RouteProgressTracker from '@/components/passport/RouteProgressTracker';
import PassportStampModal from '@/components/passport/PassportStampModal';
import { useToast } from '@/hooks/use-toast';

const PassaporteRouteMS = () => {
  console.log("📱 PASSAPORTE: Componente PassaporteRouteMS sendo renderizado");
  
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log("📱 PASSAPORTE: routeId:", routeId);
  const { routes, loadRoutes, loading: routesLoading } = useRouteManagement();
  const [route, setRoute] = useState<TouristRoute | null>(null);
  const [checkpoints, setCheckpoints] = useState<RouteCheckpoint[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([]);
  const [isRouteCompleted, setIsRouteCompleted] = useState(false);
  const [showStampModal, setShowStampModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    if (routeId && routes.length > 0) {
      const foundRoute = routes.find(r => r.id === routeId);
      if (foundRoute) {
        setRoute(foundRoute);
        loadMockCheckpoints();
        getUserLocation();
      }
    }
  }, [routeId, routes]);

  const loadMockCheckpoints = () => {
    // Mock checkpoints for demonstration
    setCheckpoints([
      {
        id: '1',
        route_id: routeId!,
        name: 'Centro Histórico',
        description: 'Explore a rica história da região e tire uma foto no marco histórico',
        latitude: -20.4486,
        longitude: -54.6295,
        order_index: 1,
        points_reward: 15,
        requires_photo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '2',
        route_id: routeId!,
        name: 'Mercado Local',
        description: 'Conheça os sabores locais e a cultura gastronômica da região',
        latitude: -20.4496,
        longitude: -54.6305,
        order_index: 2,
        points_reward: 20,
        requires_photo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '3',
        route_id: routeId!,
        name: 'Mirante Natural',
        description: 'Contemple a vista panorâmica e capture a beleza da natureza',
        latitude: -20.4506,
        longitude: -54.6315,
        order_index: 3,
        points_reward: 25,
        requires_photo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ]);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Localização não disponível",
            description: "Não foi possível obter sua localização atual.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleCheckpointComplete = (checkpointId: string, points: number, photo?: File) => {
    setCompletedCheckpoints(prev => [...prev, checkpointId]);
    setTotalPoints(prev => prev + points);
    
    // Move to next checkpoint
    if (currentCheckpointIndex < checkpoints.length - 1) {
      setCurrentCheckpointIndex(prev => prev + 1);
    } else {
      // Route completed
      setIsRouteCompleted(true);
      setShowStampModal(true);
    }

    toast({
      title: "Checkpoint concluído! ✅",
      description: `Você ganhou ${points} pontos!`,
    });
  };

  const handleRouteComplete = () => {
    navigate('/descubramatogrossodosul/passaporte', { 
      state: { 
        newStamp: route?.name,
        totalPoints: totalPoints + 50 // Bonus points for completion
      }
    });
  };

  const currentCheckpoint = checkpoints[currentCheckpointIndex];
  const progressPercentage = (completedCheckpoints.length / checkpoints.length) * 100;

  if (routesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando roteiros...</p>
        </div>
      </div>
    );
  }

  if (!routesLoading && routes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange flex items-center justify-center">
        <div className="bg-white/90 rounded-xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-ms-primary-blue mb-2">Nenhum roteiro disponível</h2>
          <p className="text-gray-600 mb-4">Não encontramos roteiros ativos para exibir no momento.</p>
          <Button onClick={() => navigate('/descubramatogrossodosul/passaporte')} className="bg-white text-ms-primary-blue hover:bg-white/90">
            Voltar para o Passaporte
          </Button>
        </div>
      </div>
    );
  }

  if (!route || checkpoints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Executando {route.name} - Passaporte Digital MS</title>
        <meta name="description" content={`Explore ${route.name} através do passaporte digital gamificado`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange">
        {/* Header com Progress */}
        <div className="bg-black/30 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between text-white mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/descubramatogrossodosul/roteiros/${routeId}`)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sair da jornada
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-ms-accent-orange">{totalPoints}</div>
                  <div className="text-xs">pontos</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{completedCheckpoints.length}/{checkpoints.length}</div>
                  <div className="text-xs">checkpoints</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{route.name}</span>
                <span>{Math.round(progressPercentage)}% concluído</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/20" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {!isRouteCompleted ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checkpoint Atual */}
              <div className="lg:col-span-2">
                <CheckpointExecution
                  checkpoint={currentCheckpoint}
                  onComplete={handleCheckpointComplete}
                  userLocation={userLocation}
                  checkpointNumber={currentCheckpointIndex + 1}
                  totalCheckpoints={checkpoints.length}
                />
              </div>

              {/* Sidebar com Progresso */}
              <div className="space-y-6">
                <RouteProgressTracker
                  checkpoints={checkpoints}
                  completedCheckpoints={completedCheckpoints}
                  currentIndex={currentCheckpointIndex}
                />

                {/* Próximo Checkpoint Preview */}
                {currentCheckpointIndex < checkpoints.length - 1 && (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center">
                        <Flag className="w-5 h-5 mr-2" />
                        Próximo destino
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-white">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{checkpoints[currentCheckpointIndex + 1]?.name}</h4>
                        <p className="text-sm text-white/80">
                          {checkpoints[currentCheckpointIndex + 1]?.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span>{checkpoints[currentCheckpointIndex + 1]?.points_reward} pontos</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* Tela de Conclusão */
            <div className="max-w-2xl mx-auto text-center">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-12">
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
                  <p className="text-xl mb-6">
                    Você concluiu o roteiro <strong>{route.name}</strong>!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-ms-accent-orange">{totalPoints + 50}</div>
                      <div className="text-sm">Pontos ganhos</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-ms-secondary-teal">{checkpoints.length}</div>
                      <div className="text-sm">Checkpoints</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Novo Carimbo Desbloqueado!
                    </Badge>
                    
                    <Button
                      onClick={handleRouteComplete}
                      className="bg-ms-accent-orange hover:bg-ms-accent-orange/90 text-white text-lg px-8 py-3"
                    >
                      Ver Meu Passaporte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Modal de Carimbo */}
        <PassportStampModal
          isOpen={showStampModal}
          onClose={() => setShowStampModal(false)}
          routeName={route.name}
          totalPoints={totalPoints + 50}
          onContinue={handleRouteComplete}
        />
      </div>
    </>
  );
};

export default PassaporteRouteMS;