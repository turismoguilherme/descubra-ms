import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  getAuthUserFromRequest,
  resolveServiceRoleKey,
  type AuthUserLite,
} from './getAuthUserFromRequest.ts';

export type GuardFailure = { ok: false; status: number; error: string };
export type GuardUserSuccess = { ok: true; user: AuthUserLite; isAdmin: boolean };
export type GuardInternalSuccess = { ok: true; user: null; isAdmin: true };

const SUPABASE_URL = () => Deno.env.get('SUPABASE_URL') ?? '';

export function serviceClient() {
  return createClient(SUPABASE_URL(), resolveServiceRoleKey() ?? '');
}

/**
 * Chamada interna confiável: header x-internal-secret == INTERNAL_FUNCTION_SECRET,
 * ou Authorization Bearer com a própria service role key (usada por pg_cron/net.http_post).
 */
export function hasInternalSecret(req: Request): boolean {
  const provided = req.headers.get('x-internal-secret')?.trim();
  const expected = Deno.env.get('INTERNAL_FUNCTION_SECRET')?.trim();
  if (provided && expected && provided === expected) return true;

  const serviceKey = resolveServiceRoleKey();
  if (!serviceKey) return false;
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  return !!bearer && bearer === serviceKey;
}

/** Exige um usuário autenticado. Retorna também se ele é admin. */
export async function requireUser(req: Request): Promise<GuardFailure | GuardUserSuccess> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.trim()) {
    return { ok: false, status: 401, error: 'Não autenticado' };
  }
  const { user } = await getAuthUserFromRequest(authHeader, SUPABASE_URL());
  if (!user?.id) {
    return { ok: false, status: 401, error: 'Não autenticado' };
  }

  let isAdmin = false;
  try {
    const { data } = await serviceClient().rpc('is_admin_user', { check_user_id: user.id });
    isAdmin = data === true;
  } catch {
    isAdmin = false;
  }

  return { ok: true, user, isAdmin };
}

/** Exige admin autenticado (ou chamada interna com segredo/service role). */
export async function requireAdmin(
  req: Request,
): Promise<GuardFailure | GuardUserSuccess | GuardInternalSuccess> {
  if (hasInternalSecret(req)) {
    return { ok: true, user: null, isAdmin: true };
  }
  const result = await requireUser(req);
  if (!result.ok) return result;
  if (!result.isAdmin) {
    return { ok: false, status: 403, error: 'Acesso restrito a administradores' };
  }
  return result;
}

export function guardResponse(
  failure: GuardFailure,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: failure.error }), {
    status: failure.status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
