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
      let existing = null;
      try {
        const passports = await this.fetchSupabase(`user_passports?user_id=eq.${userId}`);
        existing = passports?.[0] || null;
      } catch {
        return this.createLocalPassport(userId, prefix);
      }

      if (existing) return existing;

      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const passportNumber = `${prefix}-${timestamp}-${random.toUpperCase()}`;

      try {
        const result = await this.fetchSupabase('user_passports', {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            passport_number: passportNumber,
          })
        });
        return result?.[0] || this.createLocalPassport(userId, prefix);
      } catch {
        return this.createLocalPassport(userId, prefix);
      }
    } catch (error: unknown) {
      console.error('[createPassport] Erro:', error);
      return this.createLocalPassport(userId, prefix);
    }
  }

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
      let data = null;
      try {
        const passports = await this.fetchSupabase(`user_passports?user_id=eq.${userId}`);
        data = passports?.[0] || null;
      } catch {
        return this.createLocalPassport(userId, 'MS');
      }

      if (!data) return this.createLocalPassport(userId, 'MS');
      return data;
    } catch (error: unknown) {
      console.error('[getPassport] Erro:', error);
      return this.createLocalPassport(userId, 'MS');
    }
  }

  /**
   * Obter rota ativa do usuário (com configuração e checkpoints)
   */
  async getActiveRoute(userId: string, routeId: string): Promise<RouteExtended | null> {
    try {
      const routes = await this.fetchSupabase(`routes?id=eq.${routeId}&is_active=eq.true`);
      const route = routes?.[0] || null;

      if (!route) return null;

      // Buscar configuração do passaporte
      let config = null;
      try {
        const configs = await this.fetchSupabase(`passport_configurations?route_id=eq.${routeId}&is_active=eq.true`);
        config = configs?.[0] || null;
      } catch {
        // Tabela pode não existir
      }

      // Buscar checkpoints
      let checkpoints: RouteCheckpoint[] = [];
      try {
        checkpoints = await this.fetchSupabase<RouteCheckpoint[]>(`route_checkpoints?route_id=eq.${routeId}&order=order_sequence`);
      } catch {
        // Erro ao buscar checkpoints
      }

      // Buscar recompensas
      let rewards: RouteReward[] = [];
      try {
        rewards = await this.fetchSupabase<RouteReward[]>(`passport_rewards?route_id=eq.${routeId}&is_active=eq.true`);
      } catch {
        // Tabela pode não existir
      }

      // Buscar stamps do usuário (por route_id e por checkpoint_id para compatibilidade)
      let stamps: PassportStamp[] = [];
      try {
        const checkpointIds = checkpoints?.map(cp => cp.id) || [];

        let stampsByRoute: PassportStamp[] = [];
        try {
          stampsByRoute = await this.fetchSupabase<PassportStamp[]>(`passport_stamps?user_id=eq.${userId}&route_id=eq.${routeId}&select=checkpoint_id,route_id`);
        } catch {
          // Erro ao buscar stamps por route_id
        }

        let stampsByCheckpoint: PassportStamp[] = [];
        if (checkpointIds.length > 0) {
          try {
            const { data: checkpointStamps } = await supabase
              .from('passport_stamps')
              .select('checkpoint_id, route_id')
              .eq('user_id', userId)
              .in('checkpoint_id', checkpointIds);
            stampsByCheckpoint = (checkpointStamps || []) as PassportStamp[];
          } catch {
            // Erro ao buscar stamps por checkpoint_id
          }
        }

        // Combinar resultados removendo duplicatas
        const allStamps = [...stampsByRoute, ...stampsByCheckpoint];
        stamps = Array.from(
          new Map(allStamps.map(s => [s.checkpoint_id, s])).values()
        );
      } catch {
        // Erro ao buscar stamps
      }

      return {
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
    } catch (error: unknown) {
      console.error('[getActiveRoute] Erro ao buscar rota ativa:', error);
      return null;
    }
  }

  /**
   * Obter checkpoints de uma rota
   */
  async getRouteCheckpoints(routeId: string): Promise<RouteCheckpointExtended[]> {
    try {
      const checkpoints = await this.fetchSupabase<CheckpointRaw[]>(
        `route_checkpoints?route_id=eq.${routeId}&order=order_sequence.asc`
      );

      return (checkpoints || []).map((cp: CheckpointRaw) => ({
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
    } catch (error: unknown) {
      console.warn('[getRouteCheckpoints] Erro:', error);
      return [];
    }
  }

  /**
   * Obter progresso do roteiro
   */
  async getRouteProgress(userId: string, routeId: string): Promise<StampProgress | null> {
    try {
      let config = null;
      try {
        const configs = await this.fetchSupabase(`passport_configurations?route_id=eq.${routeId}&is_active=eq.true`);
        config = configs?.[0] || null;
      } catch {
        return null;
      }

      if (!config) return null;

      let checkpoints: CheckpointWithFragment[] = [];
      try {
        checkpoints = await this.fetchSupabase<CheckpointWithFragment[]>(`route_checkpoints?route_id=eq.${routeId}&stamp_fragment_number=not.is.null&order=stamp_fragment_number`);
      } catch {
        return null;
      }

      if (!checkpoints || checkpoints.length === 0) return null;

      // Buscar carimbos coletados (por route_id e por checkpoint_id para compatibilidade)
      let stamps: StampProgressData[] = [];
      try {
        let stampsByRoute: StampProgressData[] = [];
        try {
          stampsByRoute = await this.fetchSupabase<StampProgressData[]>(`passport_stamps?user_id=eq.${userId}&route_id=eq.${routeId}&select=checkpoint_id,stamped_at`);
        } catch {
          // Erro ao buscar stamps por route_id
        }

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
          } catch {
            // Erro ao buscar stamps por checkpoint_id
          }
        }

        const allStamps = [...stampsByRoute, ...stampsByCheckpoint];
        stamps = Array.from(
          new Map(allStamps.map(s => [s.checkpoint_id, s])).values()
        );
      } catch {
        // Erro ao buscar stamps
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
      console.error('[getRouteProgress] Erro:', error);
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
      // Rate limiting via SQL
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

      // Validar ordem sequencial se necessário
      try {
        const configResult = await supabase
          .from('passport_configurations')
          .select('require_sequential')
          .eq('route_id', routeId)
          .eq('is_active', true)
          .single();

        const config = configResult.data as { require_sequential?: boolean } | null;

        if (config?.require_sequential) {
          const { data: allCheckpoints } = await supabase
            .from('route_checkpoints')
            .select('id, order_sequence')
            .eq('route_id', routeId)
            .order('order_sequence', { ascending: true });

          if (allCheckpoints && allCheckpoints.length > 0) {
            const currentCheckpointIndex = allCheckpoints.findIndex(cp => cp.id === checkpointId);

            if (currentCheckpointIndex > 0) {
              const previousCheckpoints = allCheckpoints.slice(0, currentCheckpointIndex);
              const previousCheckpointIds = previousCheckpoints.map(cp => cp.id);

              const { data: completedStamps } = await supabase
                .from('passport_stamps')
                .select('checkpoint_id')
                .eq('user_id', userId)
                .in('checkpoint_id', previousCheckpointIds);

              const completedCheckpointIds = new Set(completedStamps?.map(s => s.checkpoint_id) || []);
              const missingCheckpoints = previousCheckpoints.filter(cp => !completedCheckpointIds.has(cp.id));

              if (missingCheckpoints.length > 0) {
                const nextRequired = missingCheckpoints[0];
                const nextRequiredOrder = allCheckpoints.find(cp => cp.id === nextRequired.id)?.order_sequence || 0;

                const { data: nextCheckpoint } = await supabase
                  .from('route_checkpoints')
                  .select('name')
                  .eq('id', nextRequired.id)
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
        console.warn('Erro ao validar ordem sequencial:', error);
      }

      // Validar de acordo com o modo de validação
      const validationMode: string = checkpoint.validation_mode || 'geofence';

      // 1) Validar geofence
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

      // 2) Validar código do parceiro (SERVER-SIDE)
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

        try {
          const { data: validationResult, error: validationError } = await supabase.rpc(
            'validate_partner_code',
            {
              p_checkpoint_id: checkpointId,
              p_code_input: inputCode,
              p_user_id: userId,
              p_ip_address: null,
              p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            }
          );

          if (validationError) {
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
        } catch {
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

      // Verificar check-in duplicado
      const { data: existing, error: existingError } = await supabase
        .from('passport_stamps')
        .select('id, stamped_at')
        .eq('user_id', userId)
        .eq('checkpoint_id', checkpointId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
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

      if (existing) {
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

      // Anti-fraude: mínimo 30s entre check-ins
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

      // Calcular pontos
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

      // Desbloquear recompensas se completo
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
