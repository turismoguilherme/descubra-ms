
import { useState, useCallback, useEffect } from "react";
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

  // Carregar rotas automaticamente ao montar o hook
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 [useRouteManagement] ========== INÍCIO loadRoutes ==========');
      console.log('🔍 [useRouteManagement] Buscando rotas no banco...');
      
      let data, error;
      try {
        console.log('🔍 [useRouteManagement] Executando query Supabase...');
        const result = await supabase
          .from('routes')
          .select('*')
          .eq('is_active', true);
        
        console.log('🔍 [useRouteManagement] Resultado recebido:', {
          hasResult: !!result,
          hasData: !!result?.data,
          dataLength: result?.data?.length,
          hasError: !!result?.error,
          errorCode: result?.error?.code,
          errorMessage: result?.error?.message
        });
        
        data = result.data;
        error = result.error;
        console.log('✅ [useRouteManagement] Query executada com sucesso');
      } catch (queryError: unknown) {
        console.error('❌ [useRouteManagement] Erro na execução da query:', queryError);
        error = queryError;
        data = null;
      }

      // Log imediato após a query
      console.log('🔍 [useRouteManagement] Query executada. Status:', {
        hasData: !!data,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataLength: data?.length ?? 'null',
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details,
        errorHint: error?.hint
      });

      console.log('🔍 [useRouteManagement] Resultado da busca:', {
        dataCount: data?.length || 0,
        data: data?.map(r => ({ id: r.id, name: r.name, difficulty: r.difficulty, is_active: r.is_active })),
        error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null
      });

      if (error) {
        console.error('❌ [useRouteManagement] Erro ao buscar rotas:', error);
        throw error;
      }
      
      console.log('✅ [useRouteManagement] Rotas encontradas:', data?.length || 0);
      
      // Map routes data to TouristRoute format
      const formattedRoutes: TouristRoute[] = (data || []).map(route => {
        // Converter difficulty de inglês para português
        let difficulty_level: "facil" | "medio" | "dificil" = "facil";
        if (route.difficulty === 'easy') difficulty_level = 'facil';
        else if (route.difficulty === 'medium') difficulty_level = 'medio';
        else if (route.difficulty === 'hard') difficulty_level = 'dificil';
        
        // Converter estimated_duration de interval para minutos
        let estimated_duration = 60; // default
        if (route.estimated_duration) {
          // Se for string no formato '2 days' ou '48:00:00', converter para minutos
          const durationStr = route.estimated_duration.toString();
          if (durationStr.includes('day')) {
            const days = parseInt(durationStr) || 1;
            estimated_duration = days * 24 * 60; // converter dias para minutos
          } else if (durationStr.includes(':')) {
            // Formato HH:MM:SS
            const parts = durationStr.split(':');
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;
            estimated_duration = hours * 60 + minutes;
          } else {
            // Tentar parse direto
            estimated_duration = parseInt(durationStr) || 60;
          }
        }
        
        return {
          id: route.id,
          name: route.name || '',
          description: route.description,
          region: route.region,
          difficulty_level,
          estimated_duration,
          promotional_text: route.description,
          video_url: route.video_url || '',
          is_active: route.is_active !== false
        };
      });
      
      // Filtrar por região se necessário
      const filteredRoutes = userRegion && userRegion !== "all" 
        ? formattedRoutes.filter(route => route.region === userRegion)
        : formattedRoutes;
      
      console.log('✅ [useRouteManagement] Rotas formatadas:', {
        total: formattedRoutes.length,
        filtradas: filteredRoutes.length,
        rotas: filteredRoutes.map(r => ({ id: r.id, name: r.name, difficulty: r.difficulty_level }))
      });
      
      setRoutes(filteredRoutes);
    } catch (error: unknown) {
      console.error("❌ [useRouteManagement] Erro ao carregar roteiros:", {
        error,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      toast({
        title: "Erro",
        description: error?.message || "Erro ao carregar roteiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 [useRouteManagement] Carregamento finalizado');
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
