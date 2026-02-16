/**
 * Helper para registrar eventos de segurança
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

interface SecurityLogEvent {
  action: string;
  userId?: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Registrar evento de segurança no banco de dados
 */
export async function logSecurityEvent(
  supabase: any,
  event: SecurityLogEvent
): Promise<void> {
  try {
    // Usar a função RPC se disponível, senão inserir diretamente
    const { error: rpcError } = await supabase.rpc('log_enhanced_security_event', {
      event_action: event.action,
      event_user_id: event.userId || null,
      event_success: event.success,
      event_error_message: event.errorMessage || null,
      event_metadata: {
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        ...event.metadata,
      },
    });

    if (rpcError) {
      // Fallback: inserir diretamente na tabela
      const { error: insertError } = await supabase
        .from('security_audit_log')
        .insert({
          action: event.action,
          user_id: event.userId || null,
          success: event.success,
          error_message: event.errorMessage || null,
          ip_address: event.ipAddress || null,
          user_agent: event.userAgent || null,
          metadata: event.metadata || {},
        });

      if (insertError) {
        console.error('Erro ao registrar evento de segurança:', insertError);
      }
    }
  } catch (error) {
    console.error('Erro ao registrar evento de segurança:', error);
    // Não falhar a requisição por causa do log
  }
}

/**
 * Extrair IP do request
 */
export function getClientIP(req: Request): string {
  // Tentar vários headers comuns
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Extrair User-Agent do request
 */
export function getClientUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}

