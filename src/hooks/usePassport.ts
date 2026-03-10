// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { passportService } from '@/services/passport/passportService';
import type {
  UserPassport,
  RouteExtended,
  StampProgress,
  CheckinResult,
} from '@/types/passportDigital';

export const usePassport = () => {
  const { user } = useAuth();
  const [passport, setPassport] = useState<UserPassport | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteExtended | null>(null);
  const [progress, setProgress] = useState<StampProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Criar ou obter passaporte
   */
  const initializePassport = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let userPassport = await passportService.getPassport(user.id);

      if (!userPassport) {
        try {
          userPassport = await passportService.createPassport(user.id);
        } catch (createError: unknown) {
          if (createError.message?.includes('não existe') || createError.message?.includes('does not exist')) {
            console.warn('Tabelas do passaporte não existem.');
            setError('Sistema de passaporte não configurado. Contate o administrador.');
            setLoading(false);
            return;
          }
          throw createError;
        }
      }

      setPassport(userPassport);
    } catch (err: unknown) {
      console.error('Erro ao inicializar passaporte:', err);
      if (!err.message?.includes('não existe') && !err.message?.includes('does not exist')) {
        setError('Erro ao carregar passaporte. Tente novamente.');
      } else {
        setError('Sistema de passaporte não configurado.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Carregar rota ativa
   */
  const loadRoute = useCallback(
    async (routeId: string) => {
      if (!user) return;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(routeId)) {
        console.warn('[usePassport.loadRoute] ID de rota não é UUID válido:', routeId);
      }

      try {
        setLoading(true);
        setError(null);
        
        const route = await passportService.getActiveRoute(user.id, routeId);

        if (route) {
          setActiveRoute(route);
          
          try {
            const routeProgress = await passportService.getRouteProgress(user.id, routeId);
            setProgress(routeProgress);
          } catch (progressError) {
            console.warn('[usePassport.loadRoute] Erro ao carregar progresso:', progressError);
          }
        } else {
          setError('Rota não encontrada ou inativa.');
        }
      } catch (err: unknown) {
        console.error('[usePassport.loadRoute] Erro ao carregar rota:', err);
        if (err.message?.includes('não existe') || err.message?.includes('does not exist')) {
          setError('Sistema de passaporte não configurado.');
        } else {
          setError(err.message || 'Erro ao carregar rota. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * Fazer check-in
   */
  const checkIn = useCallback(
    async (
      checkpointId: string,
      latitude: number,
      longitude: number,
      photoUrl?: string,
      partnerCodeInput?: string
    ): Promise<CheckinResult> => {
      if (!user) {
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: '',
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: 'Usuário não autenticado',
        };
      }

      try {
        const result = await passportService.checkIn(
          user.id,
          checkpointId,
          latitude,
          longitude,
          photoUrl,
          partnerCodeInput
        );

        if (result.success && result.route_id) {
          const routeProgress = await passportService.getRouteProgress(user.id, result.route_id);
          setProgress(routeProgress);
        }

        return result;
      } catch (err: unknown) {
        console.error('Erro ao fazer check-in:', err);
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: activeRoute?.id || '',
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: err.message,
        };
      }
    },
    [user, activeRoute]
  );

  /**
   * Obter detalhes da rota
   */
  const getRouteDetails = useCallback(
    async (routeId: string) => {
      if (!user) return null;
      try {
        return await passportService.getActiveRoute(user.id, routeId);
      } catch (err: unknown) {
        console.error('Erro ao obter detalhes da rota:', err);
        return null;
      }
    },
    [user]
  );

  useEffect(() => {
    initializePassport();
  }, [initializePassport]);

  return {
    passport,
    activeRoute,
    progress,
    loading,
    error,
    loadRoute,
    checkIn,
    getRouteDetails,
    refresh: initializePassport,
  };
};
