import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { passportService } from '@/services/passport/passportService';
import { offlineSyncService } from '@/services/passport/offlineSyncService';
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
        } catch (createError: any) {
          // Se erro for de tabela não existente, apenas avisar mas não bloquear
          if (createError.message?.includes('não existe') || createError.message?.includes('does not exist')) {
            console.warn('Tabelas do passaporte não existem. Execute a migration primeiro.');
            setError('Sistema de passaporte não configurado. Contate o administrador.');
            setLoading(false);
            return;
          }
          throw createError;
        }
      }

      setPassport(userPassport);
    } catch (err: any) {
      console.error('Erro ao inicializar passaporte:', err);
      // Não mostrar erro técnico para o usuário, apenas log
      if (!err.message?.includes('não existe') && !err.message?.includes('does not exist')) {
        setError('Erro ao carregar passaporte. Tente novamente.');
      } else {
        setError('Sistema de passaporte não configurado. Execute a migration primeiro.');
      }
    } finally {
      // Garantir que loading sempre seja false
      setLoading(false);
    }
  }, [user]);

  /**
   * Carregar rota ativa
   */
  const loadRoute = useCallback(
    async (routeId: string) => {
      console.log('🔍 [usePassport.loadRoute] ========== INÍCIO ==========');
      console.log('🔍 [usePassport.loadRoute] Parâmetros:', {
        routeId,
        userId: user?.id,
        hasUser: !!user
      });

      if (!user) {
        console.warn('⚠️ [usePassport.loadRoute] Usuário não autenticado');
        return;
      }

      // Validar se routeId é um UUID válido (mas não bloquear se não for - pode ser ID legado)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUUID = uuidRegex.test(routeId);
      console.log('🔍 [usePassport.loadRoute] Validação UUID:', {
        routeId,
        isValidUUID
      });
      
      if (!isValidUUID) {
        console.warn('⚠️ [usePassport.loadRoute] ID de rota não é UUID válido:', routeId);
        // Não bloquear, apenas avisar - pode ser ID legado que precisa ser migrado
      }

      try {
        console.log('🔍 [usePassport.loadRoute] Iniciando carregamento...');
        setLoading(true);
        setError(null);
        
        console.log('🔍 [usePassport.loadRoute] Chamando passportService.getActiveRoute...');
        const route = await passportService.getActiveRoute(user.id, routeId);

        console.log('🔍 [usePassport.loadRoute] Resultado do getActiveRoute:', {
          route: route ? {
            id: route.id,
            name: route.name,
            checkpointsCount: route.checkpoints?.length || 0
          } : null
        });

        if (route) {
          console.log('✅ [usePassport.loadRoute] Rota encontrada, atualizando estado...');
          setActiveRoute(route);
          
          // Carregar progresso
          try {
            console.log('🔍 [usePassport.loadRoute] Carregando progresso...');
            const routeProgress = await passportService.getRouteProgress(user.id, routeId);
            console.log('🔍 [usePassport.loadRoute] Progresso:', routeProgress);
            setProgress(routeProgress);
          } catch (progressError) {
            console.warn('⚠️ [usePassport.loadRoute] Erro ao carregar progresso (pode ser normal se tabelas não existem):', progressError);
            // Não bloquear se progresso falhar
          }
          
          // Cachear para offline
          try {
            console.log('🔍 [usePassport.loadRoute] Cacheando rota para offline...');
            await offlineSyncService.cacheRoute(routeId, route, route.checkpoints || []);
            console.log('✅ [usePassport.loadRoute] Rota cacheada com sucesso');
          } catch (cacheError) {
            console.warn('⚠️ [usePassport.loadRoute] Erro ao cachear rota (não crítico):', cacheError);
          }
          
          console.log('✅ [usePassport.loadRoute] Rota carregada com sucesso');
        } else {
          console.error('❌ [usePassport.loadRoute] Rota não encontrada ou inativa');
          setError('Rota não encontrada ou inativa. Verifique se a rota existe no sistema.');
        }
      } catch (err: any) {
        console.error('❌ [usePassport.loadRoute] Erro ao carregar rota:', {
          error: err,
          message: err?.message,
          code: err?.code,
          stack: err?.stack
        });
        if (err.message?.includes('não existe') || err.message?.includes('does not exist')) {
          setError('Sistema de passaporte não configurado. Execute a migration primeiro.');
        } else {
          setError(err.message || 'Erro ao carregar rota. Tente novamente.');
        }
      } finally {
        console.log('🔍 [usePassport.loadRoute] Finalizando (setLoading false)');
        setLoading(false);
        console.log('✅ [usePassport.loadRoute] ========== FIM ==========');
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
        // Se offline, salvar localmente
        if (!offlineSyncService.isOnline()) {
          const routeId = activeRoute?.id || '';
          await offlineSyncService.saveCheckinOffline(
            user.id,
            checkpointId,
            routeId,
            latitude,
            longitude,
            undefined,
            photoUrl
          );

          return {
            success: true,
            checkpoint_id: checkpointId,
            route_id: routeId,
            stamp_earned: true,
            points_earned: 10,
            route_completed: false,
          };
        }

        // Se online, fazer check-in direto
        const result = await passportService.checkIn(
          user.id,
          checkpointId,
          latitude,
          longitude,
          photoUrl,
          partnerCodeInput
        );

        // Se sucesso, atualizar progresso
        if (result.success && result.route_id) {
          const routeProgress = await passportService.getRouteProgress(user.id, result.route_id);
          setProgress(routeProgress);
        }

        return result;
      } catch (err: any) {
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
   * Sincronizar dados offline
   */
  const syncOfflineData = useCallback(async () => {
    if (!user) return;

    try {
      const result = await offlineSyncService.syncPendingCheckins(user.id);
      
      // Recarregar progresso se houver rota ativa
      if (activeRoute?.id) {
        const routeProgress = await passportService.getRouteProgress(user.id, activeRoute.id);
        setProgress(routeProgress);
      }

      return result;
    } catch (err: any) {
      console.error('Erro ao sincronizar dados offline:', err);
      throw err;
    }
  }, [user, activeRoute]);

  /**
   * Obter detalhes da rota
   */
  const getRouteDetails = useCallback(
    async (routeId: string) => {
      if (!user) return null;

      try {
        const route = await passportService.getActiveRoute(user.id, routeId);
        return route;
      } catch (err: any) {
        console.error('Erro ao obter detalhes da rota:', err);
        return null;
      }
    },
    [user]
  );

  // Inicializar passaporte ao montar
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
    syncOfflineData,
    getRouteDetails,
    refresh: initializePassport,
  };
};

