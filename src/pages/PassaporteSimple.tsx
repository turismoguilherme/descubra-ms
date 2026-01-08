import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Trophy, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PassportRoute {
  id: string;
  name: string;
  location: string;
  difficulty: string | null;
  duration: number;
  points: number;
  completed: boolean;
  completedAt?: Date;
}

const PassaporteSimple = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<PassportRoute | null>(null);
  const [routes, setRoutes] = useState<PassportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar rotas reais do Supabase
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar rotas ativas
        const { data: routesData, error: routesError } = await supabase
          .from('routes')
          .select(`
            id,
            name,
            difficulty,
            estimated_duration,
            distance_km,
            region,
            city_id,
            cities(name)
          `)
          .eq('is_active', true)
          .eq('state_id', 'ms') // Apenas MS por enquanto
          .order('name');

        if (routesError) throw routesError;

        // Buscar carimbos do usuário para determinar progresso
        const { data: stampsData, error: stampsError } = await supabase
          .from('passport_stamps')
          .select('route_id, stamped_at')
          .eq('user_id', user.id);

        if (stampsError) throw stampsError;

        // Criar mapa de rotas completadas
        const completedRoutesMap = new Map<string, Date>();
        if (stampsData) {
          // Agrupar carimbos por rota e verificar se rota está completa
          const routeStamps = new Map<string, any[]>();
          stampsData.forEach(stamp => {
            if (stamp.route_id) {
              if (!routeStamps.has(stamp.route_id)) {
                routeStamps.set(stamp.route_id, []);
              }
              routeStamps.get(stamp.route_id)!.push(stamp);
            }
          });

          // Para cada rota, verificar se está completa (simplificado)
          for (const [routeId, stamps] of routeStamps) {
            if (stamps.length > 0) {
              // Considerar completa se tem pelo menos um carimbo
              const latestStamp = stamps.sort((a, b) =>
                new Date(b.stamped_at).getTime() - new Date(a.stamped_at).getTime()
              )[0];
              completedRoutesMap.set(routeId, new Date(latestStamp.stamped_at));
            }
          }
        }

        // Transformar dados para o formato esperado
        const transformedRoutes: PassportRoute[] = (routesData || []).map(route => {
          const isCompleted = completedRoutesMap.has(route.id);
          const completedAt = completedRoutesMap.get(route.id);

          return {
            id: route.id,
            name: route.name,
            location: route.cities?.name || route.region || 'Mato Grosso do Sul',
            difficulty: route.difficulty || 'Médio',
            duration: typeof route.estimated_duration === 'number'
              ? route.estimated_duration
              : 120, // fallback
            points: Math.floor((route.distance_km || 10) * 5), // Pontos baseado na distância
            completed: isCompleted,
            completedAt: completedAt
          };
        });

        setRoutes(transformedRoutes);
        setError(null);

      } catch (err: any) {
        console.error('Erro ao carregar rotas:', err);
        setError('Erro ao carregar dados do passaporte');

        // Fallback para dados vazios em caso de erro
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user]);

  const completedRoutes = routes.filter(route => route.completed);
  const totalPoints = completedRoutes.reduce((sum, route) => sum + route.points, 0);
  const totalRoutes = routes.length;
  const completionRate = totalRoutes > 0 ? Math.round((completedRoutes.length / totalRoutes) * 100) : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-500";
      case "Médio": return "bg-yellow-500";
      case "Difícil": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <div className="text-white text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Carregando Passaporte...</p>
          <Loader2 className="w-6 h-6 mx-auto mt-2 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-white/80">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Faça login para acessar seu passaporte digital.</p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/ms")}
                className="text-white hover:bg-white/20 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Trophy className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl font-bold text-white">Passaporte Digital</h1>
            </div>
            <p className="text-white/80 text-lg">
              Colecione carimbos e conquiste recompensas únicas!
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-ms-accent-orange mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{completedRoutes.length}</h3>
                <p className="text-white/80">Roteiros Concluídos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{totalPoints}</h3>
                <p className="text-white/80">Pontos Totais</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{completionRate}%</h3>
                <p className="text-white/80">Taxa de Conclusão</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{totalRoutes}</h3>
                <p className="text-white/80">Roteiros Disponíveis</p>
              </CardContent>
            </Card>
          </div>

          {/* Routes Grid */}
          {routes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum roteiro disponível</h3>
              <p className="text-white/80">
                Ainda não há roteiros cadastrados para Mato Grosso do Sul.
                Entre em contato com a administração para adicionar novos roteiros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => (
              <Card 
                key={route.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  route.completed 
                    ? "bg-green-500/20 border-green-400/50" 
                    : "bg-white/10 backdrop-blur-sm border-white/20"
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">{route.name}</CardTitle>
                    {route.completed && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {route.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(route.difficulty)}>
                        {route.difficulty}
                      </Badge>
                      <div className="flex items-center text-white/80 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration}min
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{route.points} pontos</span>
                      </div>
                      {route.completed && route.completedAt && (
                        <span className="text-green-400 text-sm">
                          Concluído em {route.completedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Route Details Modal */}
          {selectedRoute && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {selectedRoute.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRoute(null)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedRoute.location}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(selectedRoute.difficulty)}>
                        {selectedRoute.difficulty}
                      </Badge>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedRoute.duration} minutos
                      </div>
                    </div>
                    
                    <div className="flex items-center text-yellow-600">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{selectedRoute.points} pontos</span>
                    </div>
                    
                    {selectedRoute.completed ? (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-semibold">Roteiro Concluído!</p>
                        {selectedRoute.completedAt && (
                          <p className="text-green-600 text-sm">
                            Concluído em {selectedRoute.completedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button className="w-full bg-ms-accent-orange hover:bg-ms-accent-orange/90">
                        Iniciar Roteiro
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PassaporteSimple;

