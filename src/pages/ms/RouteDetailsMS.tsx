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
  Star, 
  Play, 
  Heart, 
  Share2, 
  Trophy,
  ArrowLeft,
  Users,
  Camera,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { TouristRoute, RouteCheckpoint } from '@/types/passport';
import { useRouteManagement } from '@/hooks/useRouteManagement';
import VideoPlayer from '@/components/routes/VideoPlayer';
import RouteMap from '@/components/routes/RouteMap';
import CheckpointPreview from '@/components/routes/CheckpointPreview';
import { useToast } from '@/hooks/use-toast';

const RouteDetailsMS = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { routes, loading } = useRouteManagement();
  const [route, setRoute] = useState<TouristRoute | null>(null);
  const [checkpoints, setCheckpoints] = useState<RouteCheckpoint[]>([]);
  const [userProgress, setUserProgress] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (routeId && routes.length > 0) {
      const foundRoute = routes.find(r => r.id === routeId);
      if (foundRoute) {
        setRoute(foundRoute);
        // TODO: Carregar checkpoints reais
        loadMockCheckpoints();
        // TODO: Carregar progresso real do usuário
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
        description: 'Explore a rica história da região',
        latitude: -20.4486,
        longitude: -54.6295,
        order_index: 1,
        points_reward: 10,
        requires_photo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '2',
        route_id: routeId!,
        name: 'Mercado Local',
        description: 'Conheça os sabores locais',
        latitude: -20.4496,
        longitude: -54.6305,
        order_index: 2,
        points_reward: 15,
        requires_photo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ]);
  };

  const handleStartRoute = () => {
    navigate(`/ms/passaporte/${routeId}`);
  };

  const handleAddToPassport = () => {
    toast({
      title: "Roteiro adicionado!",
      description: "O roteiro foi adicionado ao seu passaporte digital.",
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: "Suas preferências foram atualizadas.",
    });
  };

  const handleShare = async () => {
    if (navigator.share && route) {
      try {
        await navigator.share({
          title: route.name,
          text: route.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  if (loading || !route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando roteiro...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{route.name} - Roteiros MS</title>
        <meta name="description" content={route.description} />
        <meta name="keywords" content={`${route.name}, roteiro, Mato Grosso do Sul, turismo, passaporte digital`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between text-white">
              <Button
                variant="ghost"
                onClick={() => navigate('/ms/roteiros')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos roteiros
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className="text-white hover:text-red-400 hover:bg-white/10"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:text-blue-400 hover:bg-white/10"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Section */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{route.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-green-500 text-white">
                          {route.difficulty_level === 'facil' ? 'Fácil' : 
                           route.difficulty_level === 'medio' ? 'Médio' : 'Difícil'}
                        </Badge>
                        <Badge className="bg-ms-secondary-teal text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          10 pontos
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl mb-1">🏆</div>
                      <div className="text-sm text-white/80">Conquista</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    {route.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-ms-secondary-teal mx-auto mb-2" />
                      <div className="text-sm text-white/80">Localização</div>
                      <div className="font-semibold">{route.region}</div>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-ms-accent-orange mx-auto mb-2" />
                      <div className="text-sm text-white/80">Duração</div>
                      <div className="font-semibold">{route.estimated_duration} min</div>
                    </div>
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-sm text-white/80">Pontos</div>
                      <div className="font-semibold">{checkpoints.length}</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-white/80">Participantes</div>
                      <div className="font-semibold">47</div>
                    </div>
                  </div>

                  {/* Progresso */}
                  {userProgress > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Seu progresso</span>
                        <span>{userProgress}% concluído</span>
                      </div>
                      <Progress value={userProgress} className="h-3 bg-white/20" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={handleAddToPassport}
                      variant="outline"
                      className="text-white border-white/50 hover:bg-white/10"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Adicionar ao Passaporte
                    </Button>
                    <Button
                      onClick={handleStartRoute}
                      className="bg-ms-accent-orange hover:bg-ms-accent-orange/90 text-white"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {userProgress > 0 ? 'Continuar Jornada' : 'Começar Jornada'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Vídeo Promocional */}
              {route.video_url && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Vídeo Promocional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VideoPlayer url={route.video_url} />
                  </CardContent>
                </Card>
              )}

              {/* O que você vai descobrir */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">O que você vai descobrir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {checkpoints.map((checkpoint, index) => (
                      <CheckpointPreview
                        key={checkpoint.id}
                        checkpoint={checkpoint}
                        index={index + 1}
                        isCompleted={false} // TODO: Verificar se está completo
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Mapa */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Mapa do Roteiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteMap checkpoints={checkpoints} />
                </CardContent>
              </Card>

              {/* Dicas */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Dicas importantes</CardTitle>
                </CardHeader>
                <CardContent className="text-white/90 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Leve água e protetor solar</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Use calçados confortáveis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Carregue seu celular para os check-ins</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Respeite o meio ambiente</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RouteDetailsMS;