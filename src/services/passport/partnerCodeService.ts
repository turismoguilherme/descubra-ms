import { supabase } from '@/integrations/supabase/client';

export interface PartnerCodeValidation {
  isValid: boolean;
  points?: number;
  error?: string;
  checkpoint?: {
    id: string;
    name: string;
    partner_name?: string;
  };
}

export const partnerCodeService = {
  /**
   * Gera um código único para um checkpoint de parceiro
   */
  async generatePartnerCode(checkpointId: string): Promise<string> {
    // Gerar código alfanumérico único (6 caracteres)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Verificar se já existe (baixa probabilidade, mas seguro)
    const { data: existing } = await supabase
      .from('route_checkpoints')
      .select('id')
      .eq('partner_code', code)
      .maybeSingle();

    if (existing) {
      // Tentar novamente com código diferente
      return this.generatePartnerCode(checkpointId);
    }

    // Salvar o código no checkpoint
    const { error } = await supabase
      .from('route_checkpoints')
      .update({ partner_code: code })
      .eq('id', checkpointId);

    if (error) throw error;

    return code;
  },

  /**
   * Valida um código de parceiro (SERVER-SIDE com rate limiting e auditoria)
   */
  async validatePartnerCode(
    code: string,
    checkpointId: string,
    userId: string
  ): Promise<PartnerCodeValidation> {
    try {
      // Obter IP (se disponível via headers ou contexto)
      // Por enquanto, deixar como null - pode ser melhorado com Edge Function
      const ipAddress = null;
      
      // Usar função RPC server-side para validação segura
      const { data: result, error } = await supabase.rpc('validate_partner_code', {
        p_checkpoint_id: checkpointId,
        p_code_input: code,
        p_user_id: userId,
        p_ip_address: ipAddress,
        p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      if (error) {
        console.error('Erro ao validar código do parceiro via RPC:', error);
        return {
          isValid: false,
          error: 'Erro ao validar código. Tente novamente.'
        };
      }

      const validation = result as { 
        success: boolean; 
        error?: string; 
        blocked?: boolean;
        attempts_remaining?: number;
      };
      
      if (!validation.success) {
        return {
          isValid: false,
          error: validation.error || 'Código inválido',
        };
      }

      // Se validação foi bem-sucedida, buscar dados do checkpoint para retornar
      const { data: checkpoint, error: checkpointError } = await supabase
        .from('route_checkpoints')
        .select(`
          id,
          name,
          points_reward,
          partner_id,
          institutional_partners(name)
        `)
        .eq('id', checkpointId)
        .single();

      if (checkpointError) {
        console.warn('Erro ao buscar dados do checkpoint após validação:', checkpointError);
        // Mesmo com erro, retornar sucesso pois a validação RPC já passou
        return {
          isValid: true,
          points: 10, // Default
          checkpoint: {
            id: checkpointId,
            name: '',
            partner_name: undefined
          }
        };
      }

      return {
        isValid: true,
        points: checkpoint?.points_reward || 10,
        checkpoint: {
          id: checkpoint.id,
          name: checkpoint.name || '',
          partner_name: checkpoint.institutional_partners?.name
        }
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao validar código de parceiro:', err);
      return {
        isValid: false,
        error: 'Erro interno do sistema'
      };
    }
  },

  /**
   * Registra o uso de um código (cria carimbo)
   */
  async registerCodeUsage(
    code: string,
    checkpointId: string,
    userId: string,
    routeId: string
  ): Promise<{ success: boolean; points: number; error?: string }> {
    try {
      // Primeiro validar
      const validation = await this.validatePartnerCode(code, checkpointId, userId);

      if (!validation.isValid) {
        return {
          success: false,
          points: 0,
          error: validation.error
        };
      }

      // Criar carimbo
      const { error: stampError } = await supabase
        .from('passport_stamps')
        .insert({
          user_id: userId,
          route_id: routeId,
          checkpoint_id: checkpointId,
          stamp_type: 'partner_code',
          activity_type: 'partner_validation',
          points_earned: validation.points,
          stamped_at: new Date().toISOString()
        });

      if (stampError) throw stampError;

      return {
        success: true,
        points: validation.points || 10
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao registrar uso do código:', err);
      return {
        success: false,
        points: 0,
        error: 'Erro ao registrar carimbo'
      };
    }
  },

  /**
   * Busca códigos de parceiro para um administrador
   */
  async getPartnerCodes(routeId?: string): Promise<Array<{
    checkpoint_id: string;
    checkpoint_name: string;
    partner_code: string;
    partner_name?: string;
    usage_count: number;
  }>> {
    try {
      let query = supabase
        .from('route_checkpoints')
        .select(`
          id,
          name,
          partner_code,
          partner_id,
          institutional_partners(name),
          route_id,
          routes(name)
        `)
        .neq('partner_code', null);

      if (routeId) {
        query = query.eq('route_id', routeId);
      }

      const { data: checkpoints, error } = await query;

      if (error) throw error;

      // Para cada checkpoint, contar usos
      const result = await Promise.all(
        (checkpoints || []).map(async (checkpoint) => {
          const { count } = await supabase
            .from('passport_stamps')
            .select('id', { count: 'exact', head: true })
            .eq('checkpoint_id', checkpoint.id);

          return {
            checkpoint_id: checkpoint.id,
            checkpoint_name: checkpoint.name,
            partner_code: checkpoint.partner_code,
            partner_name: checkpoint.institutional_partners?.name,
            usage_count: count || 0
          };
        })
      );

      return result;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao buscar códigos de parceiro:', err);
      return [];
    }
  }
};

