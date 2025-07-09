import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trophy, Star, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedTouristRoute {
  id: string;
  name: string;
  description: string;
  difficulty_level: "facil" | "medio" | "dificil";
  estimated_duration: number;
  points: number;
  is_active: boolean;
  checkpoints: any[];
}

const EnhancedDigitalPassport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<EnhancedTouristRoute[]>([]);
  const [completedRoutes, setCompletedRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRoutes();
      fetchCompletedRoutes();
    }
  }, [user]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          checkpoints:route_checkpoints(*)
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Converter para o formato esperado e garantir que difficulty_level seja válido
      const convertedRoutes: EnhancedTouristRoute[] = (data || []).map(route => ({
        ...route,
        difficulty_level: ['facil', 'medio', 'dificil'].includes(route.difficulty) 
          ? route.difficulty as "facil" | "medio" | "dificil"
          : "facil",
        estimated_duration: route.estimated_duration ? 
          (typeof route.estimated_duration === 'string' ? 60 : 60) : 60, // Convert interval to minutes
        points: 10, // Default points
        checkpoints: route.checkpoints || []
      }));

      setRoutes(convertedRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as rotas",
        variant: "destructive",
      });
    }
  };

  const fetchCompletedRoutes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('passport_stamps')
        .select('route_id')
        .eq('user_id', user.id)
        .not('route_id', 'is', null);

      if (error) throw error;

      setCompletedRoutes((data || []).map(item => item.route_id).filter(Boolean));
    } catch (error) {
      console.error('Error fetching completed routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeRoute = async (routeId: string, points: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('passport_stamps')
        .insert({
          user_id: user.id,
          route_id: routeId,
          stamp_type: 'route_completion',
          stamped_at: new Date().toISOString()
        });

      if (error) throw error;

      setCompletedRoutes(prev => [...prev, routeId]);

      toast({
        title: "Parabéns!",
        description: `Você completou a rota e ganhou ${points} pontos!`,
      });

      fetchCompletedRoutes();
    } catch (error) {
      console.error('Error completing route:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a rota",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return 'N/A';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Faça login para acessar seu passaporte digital</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ms-primary-blue mb-4">
          Passaporte Digital de Turismo
        </h1>
        <p className="text-gray-600">
          Complete rotas turísticas e ganhe selos digitais. Explore Mato Grosso do Sul de forma interativa!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => {
          const isCompleted = completedRoutes.includes(route.id);
          
          return (
            <Card key={route.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-800">
                      <Trophy className="w-3 h-3 mr-1" />
                      Completo
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={getDifficultyColor(route.difficulty_level)}>
                    {getDifficultyLabel(route.difficulty_level)}
                  </Badge>
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1" />
                    {route.points} pts
                  </Badge>
                  <Badge variant="outline">
                    <MapPin className="w-3 h-3 mr-1" />
                    {route.checkpoints?.length || 0} pontos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm">
                  {route.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Duração: ~{route.estimated_duration} min</span>
                </div>
                {!isCompleted ? (
                  <Button
                    onClick={() => completeRoute(route.id, route.points)}
                    className="w-full"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Completar Rota
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" size="sm" disabled>
                    Rota Completada
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {routes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhuma rota disponível no momento.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedDigitalPassport;
