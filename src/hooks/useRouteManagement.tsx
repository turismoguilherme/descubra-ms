
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
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Map routes data to TouristRoute format
      const formattedRoutes: TouristRoute[] = (data || []).map(route => ({
        id: route.id,
        name: route.name || '',
        description: route.description,
        region: route.region,
        difficulty_level: (route.difficulty || 'facil') as "facil" | "medio" | "dificil",
        estimated_duration: route.estimated_duration ? parseInt(route.estimated_duration.toString()) : 60,
        promotional_text: route.description,
        video_url: '',
        is_active: route.is_active || true
      }));
      
      // Filtrar por região se necessário
      const filteredRoutes = userRegion && userRegion !== "all" 
        ? formattedRoutes.filter(route => route.region === userRegion)
        : formattedRoutes;
      
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
        .from('routes')
        .insert({
          name: routeData.name,
          description: routeData.description,
          region: routeData.region,
          difficulty: routeData.difficulty_level,
          estimated_duration: `${routeData.estimated_duration} minutes`,
          is_active: routeData.is_active,
          created_by: user.user.id
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Criar checkpoints se fornecidos
      if (routeData.checkpoints && routeData.checkpoints.length > 0) {
        const formattedCheckpoints = routeData.checkpoints.map(checkpoint => ({
          route_id: route.id,
          name: checkpoint.name,
          description: checkpoint.description,
          latitude: checkpoint.latitude,
          longitude: checkpoint.longitude,
          order_sequence: checkpoint.order_index
        }));

        const { error: checkpointsError } = await supabase
          .from('route_checkpoints')
          .insert(formattedCheckpoints);

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
        .from('routes')
        .update({
          name: routeData.name,
          description: routeData.description,
          region: routeData.region,
          difficulty: routeData.difficulty_level,
          estimated_duration: `${routeData.estimated_duration} minutes`,
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
          const formattedCheckpoints = routeData.checkpoints.map(checkpoint => ({
            route_id: routeId,
            name: checkpoint.name,
            description: checkpoint.description,
            latitude: checkpoint.latitude,
            longitude: checkpoint.longitude,
            order_sequence: checkpoint.order_index
          }));

          const { error: checkpointsError } = await supabase
            .from('route_checkpoints')
            .insert(formattedCheckpoints);

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
        .from('routes')
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
      // Buscar estatísticas de selos/carimbos do passaporte
      const { data: stamps, error: stampsError } = await supabase
        .from('passport_stamps')
        .select('user_id')
        .eq('route_id', routeId);

      if (stampsError) throw stampsError;

      const uniqueUsers = new Set(stamps?.map(s => s.user_id) || []).size;

      return {
        totalCheckins: 0, // Not available without dedicated table
        totalCompletions: stamps?.length || 0,
        uniqueUsers: uniqueUsers
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
