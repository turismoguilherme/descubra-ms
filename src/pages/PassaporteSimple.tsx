import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Trophy, ArrowLeft, CheckCircle, Loader2, X } from "lucide-react";
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
          .eq('state_id', 'ms')
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
          const routeStamps = new Map<string, any[]>();
          stampsData.forEach(stamp => {
            if (stamp.route_id) {
              if (!routeStamps.has(stamp.route_id)) {
                routeStamps.set(stamp.route_id, []);
              }
              routeStamps.get(stamp.route_id)!.push(stamp);
            }
          });

          for (const [routeId, stamps] of routeStamps) {
            if (stamps.length > 0) {
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
              : 120,
            points: Math.floor((route.distance_km || 10) * 5),
            completed: isCompleted,
            completedAt: completedAt
          };
        });

        setRoutes(transformedRoutes);
        setError(null);

      } catch (err: any) {
        console.error('Erro ao carregar rotas:', err);
        setError('Erro ao carregar dados do passaporte');
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

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "Fácil": return "bg-ms-pantanal-green text-white";
      case "Médio": return "bg-ms-secondary-yellow text-gray-800";
      case "Difícil": return "bg-ms-cerrado-orange text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  // Loading State - Padrão Descubra MS
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/30 flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-700">
          <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-6 rounded-full shadow-lg mx-auto mb-4 animate-pulse">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Carregando seu passaporte...</p>
          <Loader2 className="w-6 h-6 mx-auto mt-4 animate-spin text-ms-primary-blue" />
        </div>
      </div>
    );
  }

  // Error State - Padrão Descubra MS
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl border-0 animate-in fade-in zoom-in-95 duration-500">
          <CardContent className="p-8 text-center">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:opacity-90 text-white"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth Required State - Padrão Descubra MS
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl border-0 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white rounded-t-2xl">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-6">Faça login para acessar seu passaporte digital e começar a colecionar carimbos!</p>
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:opacity-90 text-white"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-green-50/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header - Padrão Descubra MS */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Button
              variant="ghost"
              onClick={() => navigate("/ms")}
              className="text-gray-600 hover:text-ms-primary-blue hover:bg-ms-primary-blue/10 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal p-5 rounded-full shadow-lg">
                <Trophy size={40} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-4">
              Passaporte Digital
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Colecione carimbos e conquiste recompensas explorando Mato Grosso do Sul
            </p>
          </div>

          {/* Stats Cards - Padrão Descubra MS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {/* Roteiros Concluídos */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-ms-discovery-teal/10 to-ms-discovery-teal/20 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-ms-discovery-teal" />
                </div>
                <h3 className="text-3xl font-bold text-ms-discovery-teal">{completedRoutes.length}</h3>
                <p className="text-sm text-gray-600 mt-1">Roteiros Concluídos</p>
              </CardContent>
            </Card>
            
            {/* Pontos Totais */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-ms-secondary-yellow/20 to-ms-secondary-yellow/30 flex items-center justify-center">
                  <Star className="w-7 h-7 text-ms-secondary-yellow fill-current" />
                </div>
                <h3 className="text-3xl font-bold text-ms-secondary-yellow">{totalPoints}</h3>
                <p className="text-sm text-gray-600 mt-1">Pontos Totais</p>
              </CardContent>
            </Card>
            
            {/* Taxa de Conclusão */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-ms-pantanal-green/10 to-ms-pantanal-green/20 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-ms-pantanal-green" />
                </div>
                <h3 className="text-3xl font-bold text-ms-pantanal-green">{completionRate}%</h3>
                <p className="text-sm text-gray-600 mt-1">Taxa de Conclusão</p>
              </CardContent>
            </Card>
            
            {/* Roteiros Disponíveis */}
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-ms-primary-blue/10 to-ms-primary-blue/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-ms-primary-blue" />
                </div>
                <h3 className="text-3xl font-bold text-ms-primary-blue">{totalRoutes}</h3>
                <p className="text-sm text-gray-600 mt-1">Roteiros Disponíveis</p>
              </CardContent>
            </Card>
          </div>

          {/* Routes Grid - Padrão Descubra MS */}
          {routes.length === 0 ? (
            <div className="text-center py-16 animate-in fade-in duration-700">
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-5xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum roteiro disponível</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Ainda não há roteiros cadastrados para Mato Grosso do Sul.
                Entre em contato com a administração para adicionar novos roteiros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route, index) => (
                <Card 
                  key={route.id} 
                  className={`cursor-pointer transition-all duration-500 transform hover:-translate-y-2 rounded-2xl shadow-lg hover:shadow-2xl border-2 group animate-in fade-in slide-in-from-bottom-4 ${
                    route.completed 
                      ? "bg-gradient-to-br from-white to-green-50 border-ms-pantanal-green/40 hover:border-ms-pantanal-green" 
                      : "bg-white border-gray-100 hover:border-ms-primary-blue/40"
                  }`}
                  onClick={() => setSelectedRoute(route)}
                  style={{ animationDelay: `${(index + 5) * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-ms-primary-blue transition-colors">
                        {route.name}
                      </CardTitle>
                      {route.completed && (
                        <div className="bg-ms-pantanal-green/10 p-2 rounded-full">
                          <CheckCircle className="w-5 h-5 text-ms-pantanal-green" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mt-2">
                      <MapPin className="w-4 h-4 mr-2 text-ms-discovery-teal" />
                      {route.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(route.difficulty)}>
                          {route.difficulty}
                        </Badge>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {route.duration}min
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-ms-secondary-yellow">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span className="font-semibold">{route.points} pts</span>
                        </div>
                        {route.completed && route.completedAt && (
                          <span className="text-ms-pantanal-green text-sm font-medium">
                            ✓ {route.completedAt.toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Route Details Modal - Padrão Descubra MS */}
          {selectedRoute && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-0 animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white rounded-t-3xl">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {selectedRoute.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                      onClick={() => setSelectedRoute(null)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    <div className="flex items-center text-gray-600">
                      <div className="w-10 h-10 rounded-lg bg-ms-discovery-teal/10 flex items-center justify-center mr-3">
                        <MapPin className="w-5 h-5 text-ms-discovery-teal" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Localização</p>
                        <p className="font-medium">{selectedRoute.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`${getDifficultyColor(selectedRoute.difficulty)} px-4 py-1`}>
                        {selectedRoute.difficulty}
                      </Badge>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedRoute.duration} minutos</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-ms-secondary-yellow/10 rounded-xl p-4">
                      <Star className="w-6 h-6 text-ms-secondary-yellow fill-current mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Pontuação</p>
                        <span className="font-bold text-lg text-ms-secondary-yellow">{selectedRoute.points} pontos</span>
                      </div>
                    </div>
                    
                    {selectedRoute.completed ? (
                      <div className="text-center p-6 bg-gradient-to-br from-ms-pantanal-green/5 to-ms-pantanal-green/10 rounded-2xl border border-ms-pantanal-green/20">
                        <div className="bg-ms-pantanal-green/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-8 h-8 text-ms-pantanal-green" />
                        </div>
                        <p className="text-ms-pantanal-green font-bold text-lg">Roteiro Concluído!</p>
                        {selectedRoute.completedAt && (
                          <p className="text-ms-pantanal-green/80 text-sm mt-1">
                            Concluído em {selectedRoute.completedAt.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button className="w-full bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:opacity-90 text-white h-12 text-lg font-semibold rounded-xl shadow-lg">
                        Iniciar Roteiro
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PassaporteSimple;
