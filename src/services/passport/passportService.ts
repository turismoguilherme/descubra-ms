// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import type {
  UserPassport,
  RouteExtended,
  PassportConfiguration,
  RouteCheckpointExtended,
  StampProgress,
  CheckinResult,
} from '@/types/passportDigital';
import type { JsonValue } from '@/types/common';

// Interfaces locais para tipos de dados do serviço
interface RewardSummary {
  id: string;
  max_vouchers: number | null;
  expires_at: string | null;
}

interface UserRewardRow {
  reward_id: string;
}

interface RouteCheckpoint {
  id: string;
  name: string;
  order_sequence: number;
  stamp_fragment_number: number | null;
  geofence_radius: number | null;
  requires_photo: boolean | null;
  [key: string]: JsonValue | undefined;
}

interface RouteReward {
  id: string;
  [key: string]: JsonValue | undefined;
}

interface PassportStamp {
  checkpoint_id: string;
  route_id?: string | null;
}

interface CheckpointRaw {
  id: string;
  name: string;
  order_sequence: number;
  route_id: string;
  destination_id?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_mandatory?: boolean;
  created_at?: string | null;
  stamp_fragment_number?: number | null;
  geofence_radius?: number | null;
  requires_photo?: boolean | null;
  validation_mode?: string | null;
  partner_code?: string | null;
}

interface CheckpointWithFragment {
  id: string;
  name: string;
  stamp_fragment_number: number;
}

interface StampProgressData {
  checkpoint_id: string;
  stamped_at?: string;
}

interface ValidationResult {
  success: boolean;
  error?: string;
}

interface UnlockedReward {
  id: string;
  [key: string]: JsonValue | undefined;
}

class PassportService {
  /**
   * SEGURANÇA: Usando Supabase SDK ao invés de fetch direto.
   * O SDK respeita RLS e usa o token do usuário autenticado.
   */
  private async fetchSupabase<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    // Parse endpoint para extrair tabela e query params
    const [tablePart, ...queryParts] = endpoint.split('?');
    const table = tablePart;
    const queryString = queryParts.join('?');
    
    if (options?.method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const { data, error } = await supabase
        .from(table)
        .insert(body)
        .select();
      if (error) throw new Error(`Erro: ${error.message}`);
      return data as T;
    }
    
    // Parse query params para SELECT
    let query = supabase.from(table).select('*');
    
    if (queryString) {
      const params = queryString.split('&');
      for (const param of params) {
        if (param.startsWith('order=')) {
          const [col, dir] = param.replace('order=', '').split('.');
          query = query.order(col, { ascending: dir !== 'desc' });
        } else {
          const match = param.match(/^(\w+)=eq\.(.+)$/);
          if (match) {
            query = query.eq(match[1], match[2]);
          }
        }
      }
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Erro: ${error.message}`);
    return data as T;
  }

  /**
   * Resumo de disponibilidade de recompensas de uma rota.
   * Usado para exibir uma mensagem amigável quando a rota foi concluída,
   * mas nenhum voucher foi gerado (ex.: estoque esgotado).
   */
  async getRewardAvailabilitySummary(routeId: string): Promise<{
    hasActiveRewards: boolean;
    anyAvailable: boolean;
  }> {
    const { data: rewards, error: rewardsError } = await supabase
      .from('passport_rewards')
      .select('id, max_vouchers, is_active, expires_at')
      .eq('route_id', routeId)
      .eq('is_active', true);

    if (rewardsError) throw rewardsError;

    const activeRewards = (rewards || []).filter((r: RewardSummary) => {
      if (!r.expires_at) return true;
      return new Date(r.expires_at).getTime() > Date.now();
    });

    if (activeRewards.length === 0) {
      return { hasActiveRewards: false, anyAvailable: false };
    }

    // Se alguma recompensa não tem estoque (max_vouchers null), consideramos disponível
    const unlimitedExists = activeRewards.some((r: RewardSummary) => r.max_vouchers == null);
    if (unlimitedExists) {
      return { hasActiveRewards: true, anyAvailable: true };
    }

    const rewardIds = activeRewards.map((r: RewardSummary) => r.id);
    const { data: userRewardsData, error: userRewardsError } = await supabase
      .from('user_rewards')
      .select('reward_id')
      .in('reward_id', rewardIds);

    if (userRewardsError) throw userRewardsError;

    const emittedById = (userRewardsData || []).reduce((acc: Record<string, number>, row: UserRewardRow) => {
      acc[row.reward_id] = (acc[row.reward_id] || 0) + 1;
      return acc;
    }, {});

    const anyAvailable = activeRewards.some((r: RewardSummary) => {
      const emitted = emittedById[r.id] || 0;
      const max = r.max_vouchers ?? 0;
      return emitted < max;
    });

    return { hasActiveRewards: true, anyAvailable };
  }

  /**
   * Criar ou obter passaporte do usuário
   */
  async createPassport(userId: string, prefix: string = 'MS'): Promise<UserPassport> {
    try {
      console.log('🔍 [createPassport] Verificando passaporte existente para:', userId);
      
      // Verificar se já existe
      let existing = null;
      try {
        const passports = await this.fetchSupabase(`user_passports?user_id=eq.${userId}`);
        existing = passports?.[0] || null;
      } catch (e: unknown) {
        console.warn('⚠️ [createPassport] Tabela user_passports não existe, criando passaporte local');
        // Se tabela não existe, criar passaporte local temporário
        return this.createLocalPassport(userId, prefix);
      }

      if (existing) {
        console.log('✅ [createPassport] Passaporte existente encontrado:', existing.passport_number);
        return existing;
      }

      // Gerar número do passaporte localmente
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const passportNumber = `${prefix}-${timestamp}-${random.toUpperCase()}`;

      console.log('🔍 [createPassport] Criando novo passaporte:', passportNumber);

      // Criar passaporte
      try {
        const result = await this.fetchSupabase('user_passports', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            passport_number: passportNumber,
          })
        });
        
        console.log('✅ [createPassport] Passaporte criado:', result?.[0]?.passport_number);
        return result?.[0] || this.createLocalPassport(userId, prefix);
      } catch (e) {
        console.warn('⚠️ [createPassport] Erro ao criar no banco, usando local');
        return this.createLocalPassport(userId, prefix);
      }
    } catch (error: unknown) {
      console.error('❌ [createPassport] Erro:', error);
      // Se falhar, criar passaporte local
      return this.createLocalPassport(userId, prefix);
    }
  }

  // Criar passaporte local temporário (quando tabela não existe)
  private createLocalPassport(userId: string, prefix: string = 'MS'): UserPassport {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return {
      id: `local-${userId}`,
      user_id: userId,
      passport_number: `${prefix}-${timestamp}-${random.toUpperCase()}`,
      created_at: new Date().toISOString(),
      total_stamps: 0,
      total_routes_completed: 0,
      total_points: 0,
    } as UserPassport;
  }

  /**
   * Obter passaporte do usuário
   */
  async getPassport(userId: string): Promise<UserPassport | null> {
    try {
      console.log('🔍 [getPassport] Buscando passaporte para:', userId);
      
      let data = null;
      try {
        const passports = await this.fetchSupabase(`user_passports?user_id=eq.${userId}`);
        data = passports?.[0] || null;
      } catch (e: unknown) {
        console.warn('⚠️ [getPassport] Tabela user_passports não existe, criando local');
        return this.createLocalPassport(userId, 'MS');
      }

      console.log('🔍 [getPassport] Resultado:', data ? data.passport_number : 'null');
      
      if (!data) {
        // Se não encontrou, criar um local
        return this.createLocalPassport(userId, 'MS');
      }
      
      return data;
    } catch (error: unknown) {
      console.error('❌ [getPassport] Erro:', error);
      // Se falhar, criar passaporte local
      return this.createLocalPassport(userId, 'MS');
    }
  }

  /**
   * Obter rota ativa do usuário (com configuração e checkpoints)
   */
  async getActiveRoute(userId: string, routeId: string): Promise<RouteExtended | null> {
    console.log('🔍 [passportService.getActiveRoute] ========== INÍCIO ==========');
    console.log('🔍 [passportService.getActiveRoute] Parâmetros:', {
      userId,
      routeId,
      routeIdType: typeof routeId,
      routeIdLength: routeId?.length
    });
    
    try {
      console.log('🔍 [passportService.getActiveRoute] Buscando rota no banco (fetch direto)...');
      
      // Buscar rota com fetch direto
      const routes = await this.fetchSupabase(`routes?id=eq.${routeId}&is_active=eq.true`);
      const route = routes?.[0] || null;

      console.log('🔍 [passportService.getActiveRoute] Resultado da busca:', {
        route: route ? {
          id: route.id,
          name: route.name,
          is_active: route.is_active
        } : null
      });

      if (!route) {
        console.warn('⚠️ [passportService.getActiveRoute] Rota não encontrada');
        return null;
      }
      
      console.log('✅ [passportService.getActiveRoute] Rota encontrada:', route.id);

      console.log('🔍 [passportService.getActiveRoute] Buscando configuração do passaporte...');
      // Buscar configuração do passaporte
      let config = null;
      try {
        const configs = await this.fetchSupabase(`passport_configurations?route_id=eq.${routeId}&is_active=eq.true`);
        config = configs?.[0] || null;
      } catch (e) {
        console.warn('⚠️ [passportService.getActiveRoute] Tabela passport_configurations não existe ou erro:', e);
      }

      console.log('🔍 [passportService.getActiveRoute] Configuração:', {
        config: config ? { id: config.id, stamp_theme: config.stamp_theme } : null
      });

      console.log('🔍 [passportService.getActiveRoute] Buscando checkpoints...');
      // Buscar checkpoints
      let checkpoints: RouteCheckpoint[] = [];
      try {
        checkpoints = await this.fetchSupabase<RouteCheckpoint[]>(`route_checkpoints?route_id=eq.${routeId}&order=order_sequence`);
      } catch (e) {
        console.warn('⚠️ [passportService.getActiveRoute] Erro ao buscar checkpoints:', e);
      }

      console.log('🔍 [passportService.getActiveRoute] Checkpoints:', {
        count: checkpoints?.length || 0,
        checkpoints: checkpoints?.map(cp => ({ id: cp.id, name: cp.name, order: cp.order_sequence }))
      });

      console.log('🔍 [passportService.getActiveRoute] Buscando recompensas...');
      // Buscar recompensas
      let rewards: RouteReward[] = [];
      try {
        rewards = await this.fetchSupabase<RouteReward[]>(`passport_rewards?route_id=eq.${routeId}&is_active=eq.true`);
      } catch (e) {
        console.warn('⚠️ [passportService.getActiveRoute] Tabela passport_rewards não existe ou erro:', e);
      }

      console.log('🔍 [passportService.getActiveRoute] Recompensas:', {
        count: rewards?.length || 0
      });

      console.log('🔍 [passportService.getActiveRoute] Buscando stamps do usuário...');
      // Verificar quais checkpoints já foram visitados
      // Buscar stamps de duas formas:
      // 1. Por route_id (stamps novos)
      // 2. Por checkpoint_id IN (stamps antigos que podem não ter route_id)
      let stamps: PassportStamp[] = [];
      try {
        const checkpointIds = checkpoints?.map(cp => cp.id) || [];
        console.log('🔵 [passportService.getActiveRoute] Query stamps:', {
          userId,
          routeId,
          checkpointIds,
          checkpointIdsCount: checkpointIds.length,
        });
        
        // Primeiro, tentar buscar por route_id
        let stampsByRoute: PassportStamp[] = [];
        try {
          stampsByRoute = await this.fetchSupabase<PassportStamp[]>(`passport_stamps?user_id=eq.${userId}&route_id=eq.${routeId}&select=checkpoint_id,route_id`);
          console.log('🔵 [passportService.getActiveRoute] Stamps por route_id:', {
            count: stampsByRoute?.length || 0,
            stamps: stampsByRoute,
          });
        } catch (e) {
          console.warn('⚠️ [passportService.getActiveRoute] Erro ao buscar stamps por route_id:', e);
        }
        
        // Segundo, buscar por checkpoint_id (para stamps antigos sem route_id)
        let stampsByCheckpoint: PassportStamp[] = [];
        if (checkpointIds.length > 0) {
          try {
            // Construir query com múltiplos checkpoint_ids
            const checkpointIdsQuery = checkpointIds.map(id => `checkpoint_id=eq.${id}`).join('&');
            // Usar Supabase client para query mais complexa
            const { data: checkpointStamps } = await supabase
              .from('passport_stamps')
              .select('checkpoint_id, route_id')
              .eq('user_id', userId)
              .in('checkpoint_id', checkpointIds);
            
            stampsByCheckpoint = (checkpointStamps || []) as PassportStamp[];
            console.log('🔵 [passportService.getActiveRoute] Stamps por checkpoint_id:', {
              count: stampsByCheckpoint?.length || 0,
              stamps: stampsByCheckpoint,
            });
          } catch (e) {
            console.warn('⚠️ [passportService.getActiveRoute] Erro ao buscar stamps por checkpoint_id:', e);
          }
        }
        
        // Combinar resultados, removendo duplicatas
        const allStamps = [...stampsByRoute, ...stampsByCheckpoint];
        const uniqueStamps = Array.from(
          new Map(allStamps.map(s => [s.checkpoint_id, s])).values()
        );
        stamps = uniqueStamps;
        
        console.log('🔵 [passportService.getActiveRoute] Resultado query stamps combinado:', {
          stamps,
          count: stamps?.length || 0,
          isArray: Array.isArray(stamps),
          stampsByRoute: stampsByRoute?.length || 0,
          stampsByCheckpoint: stampsByCheckpoint?.length || 0,
        });
      } catch (e) {
        console.error('❌ [passportService.getActiveRoute] Erro ao buscar stamps:', e);
        console.warn('⚠️ [passportService.getActiveRoute] Tabela passport_stamps não existe ou erro:', e);
      }

      console.log('🔍 [passportService.getActiveRoute] Stamps:', {
        count: stamps?.length || 0
      });

      const visitedCheckpointIds = new Set(stamps?.map(s => s.checkpoint_id) || []);

      const result = {
        ...route,
        configuration: config || null,
        checkpoints: (checkpoints || []).map(cp => ({
          ...cp,
          stamp_fragment_number: cp.stamp_fragment_number,
          geofence_radius: cp.geofence_radius || 100,
          requires_photo: cp.requires_photo || false,
        })),
        rewards: rewards || [],
      };

      console.log('✅ [passportService.getActiveRoute] Rota completa montada:', {
        id: result.id,
        name: result.name,
        checkpointsCount: result.checkpoints?.length || 0,
        rewardsCount: result.rewards?.length || 0,
        hasConfig: !!result.configuration
      });
      console.log('✅ [passportService.getActiveRoute] ========== FIM ==========');

      return result;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string; details?: string; stack?: string };
      console.error('❌ [passportService.getActiveRoute] Erro ao buscar rota ativa:', {
        error,
        message: err?.message,
        code: err?.code,
        details: err?.details,
        stack: err?.stack
      });
      return null;
    }
  }

  /**
   * Obter checkpoints de uma rota
   */
  async getRouteCheckpoints(routeId: string): Promise<RouteCheckpointExtended[]> {
    console.log('🔍 [passportService.getRouteCheckpoints] ========== INÍCIO ==========');
    console.log('🔍 [passportService.getRouteCheckpoints] Route ID:', routeId);
    
    try {
      console.log('🔍 [passportService.getRouteCheckpoints] Buscando checkpoints...');
      const checkpoints = await this.fetchSupabase<CheckpointRaw[]>(
        `route_checkpoints?route_id=eq.${routeId}&order=order_sequence.asc`
      );

      console.log('🔍 [passportService.getRouteCheckpoints] Checkpoints encontrados:', {
        count: checkpoints?.length || 0,
        checkpoints: checkpoints?.map((cp: CheckpointRaw) => ({ 
          id: cp.id, 
          name: cp.name, 
          order: cp.order_sequence 
        }))
      });

      const result = (checkpoints || []).map((cp: CheckpointRaw) => ({
        id: cp.id,
        route_id: cp.route_id,
        destination_id: cp.destination_id || null,
        order_sequence: cp.order_sequence,
        name: cp.name,
        description: cp.description || null,
        latitude: cp.latitude || null,
        longitude: cp.longitude || null,
        is_mandatory: cp.is_mandatory !== undefined ? cp.is_mandatory : true,
        created_at: cp.created_at || null,
        stamp_fragment_number: cp.stamp_fragment_number || null,
        geofence_radius: cp.geofence_radius || null,
        requires_photo: cp.requires_photo || null,
        validation_mode: cp.validation_mode || null,
        partner_code: cp.partner_code || null,
      })) as RouteCheckpointExtended[];

      console.log('✅ [passportService.getRouteCheckpoints] Checkpoints formatados:', result.length);
      console.log('✅ [passportService.getRouteCheckpoints] ========== FIM ==========');

      return result;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      console.warn('⚠️ [passportService.getRouteCheckpoints] Erro ao buscar checkpoints:', {
        error,
        message: err?.message,
        code: err?.code,
      });
      return [];
    }
  }

  /**
   * Obter progresso do roteiro
   */
  async getRouteProgress(userId: string, routeId: string): Promise<StampProgress | null> {
    try {
      // Buscar configuração
      let config = null;
      try {
        const configs = await this.fetchSupabase(`passport_configurations?route_id=eq.${routeId}&is_active=eq.true`);
        config = configs?.[0] || null;
      } catch (e) {
        console.warn('⚠️ [getRouteProgress] Tabela passport_configurations não existe:', e);
        return null;
      }

      if (!config) return null;

      // Buscar checkpoints com fragmentos
      let checkpoints: CheckpointWithFragment[] = [];
      try {
        checkpoints = await this.fetchSupabase<CheckpointWithFragment[]>(`route_checkpoints?route_id=eq.${routeId}&stamp_fragment_number=not.is.null&order=stamp_fragment_number`);
      } catch (e) {
        console.warn('⚠️ [getRouteProgress] Erro ao buscar checkpoints:', e);
        return null;
      }

      if (!checkpoints || checkpoints.length === 0) return null;

      // Buscar carimbos coletados
      // Buscar stamps de duas formas:
      // 1. Por route_id (stamps novos)
      // 2. Por checkpoint_id IN (stamps antigos que podem não ter route_id)
      let stamps: StampProgressData[] = [];
      try {

        // Primeiro, tentar buscar por route_id
        let stampsByRoute: StampProgressData[] = [];
        try {
          stampsByRoute = await this.fetchSupabase<StampProgressData[]>(`passport_stamps?user_id=eq.${userId}&route_id=eq.${routeId}&select=checkpoint_id,stamped_at`);
          
        } catch (e) {
          console.warn('⚠️ [getRouteProgress] Erro ao buscar stamps por route_id:', e);
        }
        
        // Segundo, buscar por checkpoint_id (para stamps antigos sem route_id)
        let stampsByCheckpoint: StampProgressData[] = [];
        const checkpointIds = checkpoints?.map(cp => cp.id) || [];
        if (checkpointIds.length > 0) {
          try {
            const { data: checkpointStamps } = await supabase
              .from('passport_stamps')
              .select('checkpoint_id, stamped_at')
              .eq('user_id', userId)
              .in('checkpoint_id', checkpointIds);
            
            stampsByCheckpoint = (checkpointStamps || []) as StampProgressData[];
            
          } catch (e) {
            console.warn('⚠️ [getRouteProgress] Erro ao buscar stamps por checkpoint_id:', e);
          }
        }
        
        // Combinar resultados, removendo duplicatas
        const allStamps = [...stampsByRoute, ...stampsByCheckpoint];
        stamps = Array.from(
          new Map(allStamps.map(s => [s.checkpoint_id, s])).values()
        );

      } catch (e) {
        console.warn('⚠️ [getRouteProgress] Tabela passport_stamps não existe:', e);
        
      }

      const collectedCheckpointIds = new Set(stamps?.map(s => s.checkpoint_id) || []);
      
      const collectedFragments = checkpoints.filter(cp => collectedCheckpointIds.has(cp.id));

      const fragments = checkpoints.map(cp => {
        const stamp = stamps?.find(s => s.checkpoint_id === cp.id);
        return {
          checkpoint_id: cp.id,
          checkpoint_name: cp.name,
          fragment_number: cp.stamp_fragment_number || 0,
          collected: collectedCheckpointIds.has(cp.id),
          collected_at: stamp?.stamped_at || undefined,
        };
      });

      return {
        route_id: routeId,
        theme: config.stamp_theme,
        total_fragments: config.stamp_fragments,
        collected_fragments: collectedFragments.length,
        completion_percentage: Math.round((collectedFragments.length / config.stamp_fragments) * 100),
        fragments,
      };
    } catch (error: unknown) {
      console.error('❌ [getRouteProgress] Erro:', error);
      return null;
    }
  }

  /**
   * Fazer check-in em um checkpoint
   */
  async checkIn(
    userId: string,
    checkpointId: string,
    latitude: number,
    longitude: number,
    photoUrl?: string,
    partnerCodeInput?: string
  ): Promise<CheckinResult> {
    try {
      // Validação anti-fraude: Rate limiting usando função SQL
      const { data: rateLimitAllowed } = await supabase.rpc('check_checkin_rate_limit', {
        p_user_id: userId,
        p_max_checkins: 10,
        p_window_minutes: 60,
      });

      if (!rateLimitAllowed) {
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: '',
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: 'Limite de check-ins excedido. Aguarde antes de tentar novamente.',
        };
      }

      // Buscar checkpoint com dados da rota
      const { data: checkpoint, error: cpError } = await supabase
        .from('route_checkpoints')
        .select('*, routes!inner(*)')
        .eq('id', checkpointId)
        .single();

      if (cpError || !checkpoint) {
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: '',
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: 'Checkpoint não encontrado',
        };
      }

      const routeId = checkpoint.routes.id;

      // Validar ordem sequencial se a rota requer
      try {
        const configResult = await supabase
          .from('passport_configurations')
          .select('require_sequential')
          .eq('route_id', routeId)
          .eq('is_active', true)
          .single();

        const config = configResult.data as { require_sequential?: boolean } | null;

        if (config?.require_sequential) {
          // Buscar todos os checkpoints da rota ordenados
          const { data: allCheckpoints } = await supabase
            .from('route_checkpoints')
            .select('id, order_sequence')
            .eq('route_id', routeId)
            .order('order_sequence', { ascending: true });

          if (allCheckpoints && allCheckpoints.length > 0) {
            const currentCheckpointOrder = checkpoint.order_sequence;
            const currentCheckpointIndex = allCheckpoints.findIndex(cp => cp.id === checkpointId);

            // Verificar se há checkpoints anteriores que não foram completados
            if (currentCheckpointIndex > 0) {
              const previousCheckpoints = allCheckpoints.slice(0, currentCheckpointIndex);
              const previousCheckpointIds = previousCheckpoints.map(cp => cp.id);

              // Verificar quais foram completados
              const { data: completedStamps } = await supabase
                .from('passport_stamps')
                .select('checkpoint_id')
                .eq('user_id', userId)
                .in('checkpoint_id', previousCheckpointIds);

              const completedCheckpointIds = new Set(completedStamps?.map(s => s.checkpoint_id) || []);
              const missingCheckpoints = previousCheckpoints.filter(cp => !completedCheckpointIds.has(cp.id));

              if (missingCheckpoints.length > 0) {
                const nextRequiredCheckpoint = missingCheckpoints[0];
                const nextRequiredOrder = allCheckpoints.find(cp => cp.id === nextRequiredCheckpoint.id)?.order_sequence || 0;

                // Buscar nome do próximo checkpoint necessário
                const { data: nextCheckpoint } = await supabase
                  .from('route_checkpoints')
                  .select('name')
                  .eq('id', nextRequiredCheckpoint.id)
                  .single();

                return {
                  success: false,
                  checkpoint_id: checkpointId,
                  route_id: routeId,
                  stamp_earned: false,
                  points_earned: 0,
                  route_completed: false,
                  error: `Complete o checkpoint ${nextRequiredOrder} (${nextCheckpoint?.name || 'anterior'}) antes deste.`,
                };
              }
            }
          }
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn('Erro ao validar ordem sequencial:', err);
        // Continuar se houver erro (não bloquear check-in)
      }

      // Validar de acordo com o modo de validação do checkpoint
      const validationMode: string = checkpoint.validation_mode || 'geofence';

      // 1) Validar geofence quando aplicável
      if (validationMode === 'geofence' || validationMode === 'mixed') {
        if (checkpoint.latitude && checkpoint.longitude) {
          const { data: isValid } = await supabase.rpc('check_geofence', {
            checkpoint_lat: checkpoint.latitude,
            checkpoint_lon: checkpoint.longitude,
            user_lat: latitude,
            user_lon: longitude,
            radius_meters: checkpoint.geofence_radius || 100,
          });

          if (!isValid) {
            return {
              success: false,
              checkpoint_id: checkpointId,
              route_id: routeId,
              stamp_earned: false,
              points_earned: 0,
              route_completed: false,
              error: 'Você está muito longe do checkpoint',
            };
          }
        }
      }

      // 2) Validar código do parceiro quando aplicável (SERVER-SIDE)
      if (validationMode === 'code' || validationMode === 'mixed') {
        const inputCode = (partnerCodeInput || '').trim();

        if (!inputCode) {
          return {
            success: false,
            checkpoint_id: checkpointId,
            route_id: routeId,
            stamp_earned: false,
            points_earned: 0,
            route_completed: false,
            error: 'Informe o código do parceiro para concluir o check-in.',
          };
        }

        // Validação server-side com rate limiting e auditoria
        try {
          // Obter IP do cliente (se disponível)
          const ipAddress = null; // TODO: Passar IP real se disponível no contexto
          
          const { data: validationResult, error: validationError } = await supabase.rpc(
            'validate_partner_code',
            {
              p_checkpoint_id: checkpointId,
              p_code_input: inputCode,
              p_user_id: userId,
              p_ip_address: ipAddress,
              p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            }
          );

          if (validationError) {
            console.error('Erro ao validar código do parceiro:', validationError);
            return {
              success: false,
              checkpoint_id: checkpointId,
              route_id: routeId,
              stamp_earned: false,
              points_earned: 0,
              route_completed: false,
              error: 'Erro ao validar código. Tente novamente.',
            };
          }

          // Verificar resultado da validação
          const result = validationResult as ValidationResult | null;
          if (!result?.success) {
            return {
              success: false,
              checkpoint_id: checkpointId,
              route_id: routeId,
              stamp_earned: false,
              points_earned: 0,
              route_completed: false,
              error: result?.error || 'Código do parceiro inválido. Confirme o código no balcão.',
            };
          }

          // Código válido! Continuar com check-in
          console.log('✅ Código do parceiro validado com sucesso');
        } catch (error: unknown) {
          console.error('Erro inesperado ao validar código:', error);
          return {
            success: false,
            checkpoint_id: checkpointId,
            route_id: routeId,
            stamp_earned: false,
            points_earned: 0,
            route_completed: false,
            error: 'Erro ao validar código. Tente novamente.',
          };
        }
      }

      // Verificar se já fez check-in (validação de duplicação)
      
      const { data: existing, error: existingError } = await supabase
        .from('passport_stamps')
        .select('id, stamped_at')
        .eq('user_id', userId)
        .eq('checkpoint_id', checkpointId)
        .single();

      console.log('🔵 [passportService.checkIn] Query resultado:', {
        existing,
        existingError,
        errorCode: existingError?.code,
        errorMessage: existingError?.message,
      });

      // Se o erro for PGRST116 (nenhum resultado encontrado), isso é normal - significa que não existe check-in
      if (existingError && existingError.code !== 'PGRST116') {
        console.error('❌ [passportService.checkIn] Erro ao verificar check-in existente:', existingError);
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: routeId,
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: `Erro ao verificar check-in: ${existingError.message}`,
        };
      }

      // Se encontrou stamp existente, verificar se tem route_id
      if (existing) {
        console.log('🔵 [passportService.checkIn] Stamp existente completo:', existing);
        // Buscar todos os campos do stamp para verificar route_id
        const { data: fullStamp } = await supabase
          .from('passport_stamps')
          .select('*')
          .eq('id', existing.id)
          .single();
        console.log('🔵 [passportService.checkIn] Stamp completo do banco:', {
          id: fullStamp?.id,
          user_id: fullStamp?.user_id,
          route_id: fullStamp?.route_id,
          checkpoint_id: fullStamp?.checkpoint_id,
          stamped_at: fullStamp?.stamped_at,
        });
      }

      console.log('🔵 [passportService.checkIn] Verificação check-in existente:', {
        hasExisting: !!existing,
        existingId: existing?.id,
        existingData: existing,
        userId,
        checkpointId,
      });

      if (existing) {
        console.log('⚠️ [passportService.checkIn] Check-in já existe!', existing);
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: routeId,
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: 'Check-in já realizado neste checkpoint',
        };
      }

      // Validação anti-fraude: Verificar se não está fazendo check-ins muito rápidos (mínimo 30 segundos entre check-ins)
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      const { data: recentStamp } = await supabase
        .from('passport_stamps')
        .select('stamped_at')
        .eq('user_id', userId)
        .gte('stamped_at', thirtySecondsAgo)
        .order('stamped_at', { ascending: false })
        .limit(1)
        .single();

      if (recentStamp) {
        return {
          success: false,
          checkpoint_id: checkpointId,
          route_id: routeId,
          stamp_earned: false,
          points_earned: 0,
          route_completed: false,
          error: 'Aguarde alguns segundos antes do próximo check-in',
        };
      }

      // Calcular pontos baseado na dificuldade da rota
      let pointsEarned = 10;
      if (checkpoint.routes.difficulty === 'medium') pointsEarned = 20;
      if (checkpoint.routes.difficulty === 'hard') pointsEarned = 35;

      // Criar carimbo
      
      const { data: stamp, error: stampError } = await supabase
        .from('passport_stamps')
        .insert({
          user_id: userId,
          route_id: routeId,
          checkpoint_id: checkpointId,
          stamp_type: 'checkpoint',
          latitude,
          longitude,
          points_earned: pointsEarned,
        })
        .select()
        .single();

      if (stampError) throw stampError;

      // Verificar se roteiro foi completado
      
      const progress = await this.getRouteProgress(userId, routeId);
      const routeCompleted = progress?.completion_percentage === 100;

      // Desbloquear recompensas se roteiro completo
      let rewardsUnlocked: UnlockedReward[] = [];
      if (routeCompleted) {
        const { data: rewards } = await supabase.rpc('unlock_rewards', {
          p_user_id: userId,
          p_route_id: routeId,
        });
        rewardsUnlocked = (rewards || []) as UnlockedReward[];
      }

      return {
        success: true,
        checkpoint_id: checkpointId,
        route_id: routeId,
        stamp_earned: true,
        fragment_collected: checkpoint.stamp_fragment_number || undefined,
        points_earned: pointsEarned,
        route_completed: routeCompleted,
        rewards_unlocked: rewardsUnlocked.length > 0 ? rewardsUnlocked : undefined,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Erro ao fazer check-in:', error);
      return {
        success: false,
        checkpoint_id: checkpointId,
        route_id: '',
        stamp_earned: false,
        points_earned: 0,
        route_completed: false,
        error: err?.message || 'Erro ao processar check-in',
      };
    }
  }
}

export const passportService = new PassportService();

