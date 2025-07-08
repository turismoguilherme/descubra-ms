
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchTouristRoutes, 
  fetchRouteById,
  fetchRouteCheckpoints,
  createUserCheckin,
  updateUserPassportStats
} from "@/services/passport";
import { supabase } from "@/integrations/supabase/client";
import { TouristRoute, RouteCreateData } from "@/types/passport";

export const useRouteManagement = (userRegion?: string) => {
  const [routes, setRoutes] = useState<TouristRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const rawData = await fetchTouristRoutes();
      
      // Convert the raw data to match TouristRoute interface
      const data: TouristRoute[] = rawData.map(route => ({
        ...route,
        difficulty_level: route.difficulty_level as "facil" | "medio" | "dificil"
      }));
      
      // Filtrar por região se necessário
      const filteredRoutes = userRegion && userRegion !== "all" 
        ? data.filter(route => route.region === userRegion)
        : data;
      
      setRoutes(filteredRoutes);
    } catch (error) {
      console.error("Erro ao carregar roteiros:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar roteiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userRegion, toast]);

  const createRoute = async (routeData: RouteCreateData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      // Criar o roteiro
      const { data: route, error: routeError } = await supabase
        .from('tourist_routes')
        .insert({
          name: routeData.name,
          description: routeData.description,
          region: routeData.region,
          difficulty_level: routeData.difficulty_level,
          estimated_duration: routeData.estimated_duration,
          promotional_text: routeData.promotional_text,
          video_url: routeData.video_url,
          is_active: routeData.is_active,
          created_by: user.user.id
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Criar checkpoints se fornecidos
      if (routeData.checkpoints && routeData.checkpoints.length > 0) {
        const checkpoints = routeData.checkpoints.map(checkpoint => ({
          ...checkpoint,
          route_id: route.id
        }));

        const { error: checkpointsError } = await supabase
          .from('route_checkpoints')
          .insert(checkpoints);

        if (checkpointsError) throw checkpointsError;
      }

      return route;
    } catch (error) {
      console.error("Erro ao criar roteiro:", error);
      throw error;
    }
  };

  const updateRoute = async (routeId: string, routeData: RouteCreateData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não autenticado");

      // Atualizar o roteiro
      const { data: route, error: routeError } = await supabase
        .from('tourist_routes')
        .update({
          name: routeData.name,
          description: routeData.description,
          region: routeData.region,
          difficulty_level: routeData.difficulty_level,
          estimated_duration: routeData.estimated_duration,
          promotional_text: routeData.promotional_text,
          video_url: routeData.video_url,
          is_active: routeData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId)
        .select()
        .single();

      if (routeError) throw routeError;

      // Atualizar checkpoints se fornecidos
      if (routeData.checkpoints) {
        // Remover checkpoints existentes
        await supabase
          .from('route_checkpoints')
          .delete()
          .eq('route_id', routeId);

        // Inserir novos checkpoints
        if (routeData.checkpoints.length > 0) {
          const checkpoints = routeData.checkpoints.map(checkpoint => ({
            ...checkpoint,
            route_id: routeId
          }));

          const { error: checkpointsError } = await supabase
            .from('route_checkpoints')
            .insert(checkpoints);

          if (checkpointsError) throw checkpointsError;
        }
      }

      return route;
    } catch (error) {
      console.error("Erro ao atualizar roteiro:", error);
      throw error;
    }
  };

  const deleteRoute = async (routeId: string) => {
    try {
      // Deletar checkpoints primeiro (cascata deve cuidar disso, mas vamos ser explícitos)
      await supabase
        .from('route_checkpoints')
        .delete()
        .eq('route_id', routeId);

      // Deletar o roteiro
      const { error } = await supabase
        .from('tourist_routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar roteiro:", error);
      throw error;
    }
  };

  const getRouteStatistics = async (routeId: string) => {
    try {
      // Buscar estatísticas dos check-ins
      const { data: checkins, error: checkinsError } = await supabase
        .from('user_route_checkins')
        .select('user_id')
        .eq('route_id', routeId);

      if (checkinsError) throw checkinsError;

      // Buscar estatísticas de conclusões
      const { data: completions, error: completionsError } = await supabase
        .from('user_passport_progress')
        .select('user_id')
        .eq('route_id', routeId);

      if (completionsError) throw completionsError;

      const uniqueCheckinUsers = new Set(checkins?.map(c => c.user_id) || []).size;
      const uniqueCompletionUsers = new Set(completions?.map(c => c.user_id) || []).size;

      return {
        totalCheckins: checkins?.length || 0,
        totalCompletions: completions?.length || 0,
        uniqueUsers: uniqueCheckinUsers
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        totalCheckins: 0,
        totalCompletions: 0,
        uniqueUsers: 0
      };
    }
  };

  return {
    routes,
    loading,
    loadRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    getRouteStatistics
  };
};
