import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

/**
 * Auditoria via RPC foi revogada para `authenticated` no banco (migration 20260719033513).
 * Logs de segurança devem ocorrer em Edge Functions com service_role.
 */
export const CLIENT_SECURITY_RPC_ENABLED = false;

const noopRpcResult = {
  data: null,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
};

/** Bloqueia RPC revogada no PostgREST (evita 403 no console). */
export function installClientSecurityRpcGuard(supabase: SupabaseClient<Database>): void {
  if (CLIENT_SECURITY_RPC_ENABLED) return;

  const original = supabase.rpc.bind(supabase);
  supabase.rpc = ((fn: string, args?: object, options?: object) => {
    if (fn === 'log_enhanced_security_event') {
      return Promise.resolve(noopRpcResult) as ReturnType<typeof original>;
    }
    return original(fn as keyof Database['public']['Functions'], args, options);
  }) as typeof supabase.rpc;
}

export function isSecurityRpcAccessDenied(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; status?: number };
  return (
    e.code === '42501' ||
    e.code === 'PGRST301' ||
    e.status === 403 ||
    /permission denied|forbidden/i.test(e.message ?? '')
  );
}
