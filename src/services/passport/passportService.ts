import { supabase } from '@/integrations/supabase/client';
import type {
  UserPassport,
  RouteExtended,
  PassportConfiguration,
  RouteCheckpointExtended,
  StampProgress,
  CheckinResult,
} from '@/types/passportDigital';

class PassportService {
  // Constantes para fetch direto
  private SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
  private SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

  // Função auxiliar para fazer fetch no Supabase
  private async fetchSupabase(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${this.SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: {
        'apikey': this.SUPABASE_KEY,
        'Authorization': `Bearer ${this.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options?.method === 'POST' ? 'return=representation' : '',
        ...options?.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : null;
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
      } catch (e: any) {
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
    } catch (error: any) {
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
      } catch (e: any) {
        console.warn('⚠️ [getPassport] Tabela user_passports não existe, criando local');
        return this.createLocalPassport(userId, 'MS');
      }

      console.log('🔍 [getPassport] Resultado:', data ? data.passport_number : 'null');
      
      if (!data) {
        // Se não encontrou, criar um local
        return this.createLocalPassport(userId, 'MS');
      }
      
      return data;
    } catch (error: any) {
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
      let checkpoints: any[] = [];
      try {
        checkpoints = await this.fetchSupabase(`route_checkpoints?route_id=eq.${routeId}&order=order_sequence`);
      } catch (e) {
        console.warn('⚠️ [passportService.getActiveRoute] Erro ao buscar checkpoints:', e);
      }

      console.log('🔍 [passportService.getActiveRoute] Checkpoints:', {
        count: checkpoints?.length || 0,
        checkpoints: checkpoints?.map(cp => ({ id: cp.id, name: cp.name, order: cp.order_sequence }))
      });

      console.log('🔍 [passportService.getActiveRoute] Buscando recompensas...');
      // Buscar recompensas
      let rewards: any[] = [];
      try {
        rewards = await this.fetchSupabase(`passport_rewards?route_id=eq.${routeId}&is_active=eq.true`);
      } catch (e) {
        console.warn('⚠️ [passportService.getActiveRoute] Tabela passport_rewards não existe ou erro:', e);
      }

      console.log('🔍 [passportService.getActiveRoute] Recompensas:', {
        count: rewards?.length || 0
      });

      console.log('🔍 [passportService.getActiveRoute] Buscando stamps do usuário...');
      // Verificar quais checkpoints já foram visitados
      let stamps: any[] = [];
      try {
        stamps = await this.fetchSupabase(`passport_stamps?user_id=eq.${userId}&route_id=eq.${routeId}&select=checkpoint_id`);
      } catch (e) {
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
    } catch (error: any) {
      console.error('❌ [passportService.getActiveRoute] Erro ao buscar rota ativa:', {
        error,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      return null;
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
      let checkpoints: any[] = [];
      try {
        checkpoints = await this.fetchSupabase(`route_checkpoints?route_id=eq.${routeId}&stamp_fragment_number=not.is.null&order=stamp_fragment_number`);
      } catch (e) {
        console.warn('⚠️ [getRouteProgress] Erro ao buscar checkpoints:', e);
        return null;
      }

      if (!checkpoints || checkpoints.length === 0) return null;

      // Buscar carimbos coletados
      let stamps: any[] = [];
      try {
        stamps = await this.fetchSupabase(`passport_stamps?user_id=eq.${userId}&route_id=eq.${routeId}&select=checkpoint_id,stamped_at`);
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
    } catch (error) {
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

      // 2) Validar código do parceiro quando aplicável
      if (validationMode === 'code' || validationMode === 'mixed') {
        const expectedCode: string | null = checkpoint.partner_code || null;
        const inputCode = (partnerCodeInput || '').trim();

        if (!expectedCode) {
          return {
            success: false,
            checkpoint_id: checkpointId,
            route_id: routeId,
            stamp_earned: false,
            points_earned: 0,
            route_completed: false,
            error: 'Este ponto exige código do parceiro, mas nenhum código foi configurado.',
          };
        }

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

        // Comparação case-insensitive e ignorando espaços
        const normalize = (value: string) => value.replace(/\s+/g, '').toUpperCase();
        if (normalize(inputCode) !== normalize(expectedCode)) {
          return {
            success: false,
            checkpoint_id: checkpointId,
            route_id: routeId,
            stamp_earned: false,
            points_earned: 0,
            route_completed: false,
            error: 'Código do parceiro inválido. Confirme o código no balcão.',
          };
        }
      }

      // Verificar se já fez check-in (validação de duplicação)
      const { data: existing } = await supabase
        .from('passport_stamps')
        .select('id, stamped_at')
        .eq('user_id', userId)
        .eq('checkpoint_id', checkpointId)
        .single();

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
      let rewardsUnlocked: any[] = [];
      if (routeCompleted) {
        const { data: rewards } = await supabase.rpc('unlock_rewards', {
          p_user_id: userId,
          p_route_id: routeId,
        });
        rewardsUnlocked = rewards || [];
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
    } catch (error: any) {
      console.error('Erro ao fazer check-in:', error);
      return {
        success: false,
        checkpoint_id: checkpointId,
        route_id: '',
        stamp_earned: false,
        points_earned: 0,
        route_completed: false,
        error: error.message || 'Erro ao processar check-in',
      };
    }
  }
}

export const passportService = new PassportService();

