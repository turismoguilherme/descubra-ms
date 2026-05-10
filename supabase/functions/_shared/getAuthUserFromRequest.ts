import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.9.6/index.ts';

export type AuthUserLite = { id: string; email: string | null };

/** Chave publishable/anon no ambiente da Edge (novo formato sb_ + legado eyJ). */
export function resolvePublishableKey(): string | null {
  const plural = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')?.trim();
  if (plural) {
    try {
      const obj = JSON.parse(plural) as Record<string, string>;
      if (typeof obj.default === 'string' && obj.default) return obj.default;
      const names = Object.keys(obj);
      for (const n of names) {
        const v = obj[n];
        if (typeof v === 'string' && v) return v;
      }
    } catch {
      /* ignore */
    }
  }
  const single = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')?.trim();
  if (single) return single;
  const legacy = Deno.env.get('SUPABASE_ANON_KEY')?.trim();
  if (legacy) return legacy;
  return null;
}

/** Service role / secret no ambiente da Edge (novo formato sb_ + legado). */
export function resolveServiceRoleKey(): string | null {
  const plural = Deno.env.get('SUPABASE_SECRET_KEYS')?.trim();
  if (plural) {
    try {
      const obj = JSON.parse(plural) as Record<string, string>;
      if (typeof obj.default === 'string' && obj.default) return obj.default;
      for (const n of Object.keys(obj)) {
        const v = obj[n];
        if (typeof v === 'string' && v) return v;
      }
    } catch {
      /* ignore */
    }
  }
  const single = Deno.env.get('SUPABASE_SECRET_KEY')?.trim();
  if (single) return single;
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim() ?? null;
}

function parseJwksForLocalSet(): jose.JSONWebKeySet | null {
  const raw = Deno.env.get('SUPABASE_JWKS')?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return { keys: parsed as jose.JSONWebKeySet['keys'] };
    }
    if (parsed && typeof parsed === 'object' && parsed !== null && 'keys' in parsed) {
      return parsed as jose.JSONWebKeySet;
    }
  } catch {
    return null;
  }
  return null;
}

function emailFromJwtPayload(payload: Record<string, unknown>): string | null {
  if (typeof payload.email === 'string' && payload.email.trim()) {
    return payload.email.trim();
  }
  const meta = payload.user_metadata;
  if (meta && typeof meta === 'object' && meta !== null && 'email' in meta) {
    const e = (meta as { email?: unknown }).email;
    if (typeof e === 'string' && e.trim()) return e.trim();
  }
  return null;
}

async function userFromVerifiedJwt(token: string, base: string): Promise<AuthUserLite | null> {
  const issuer = `${base}/auth/v1`;
  const jwksUrl = new URL(`${issuer}/.well-known/jwks.json`);
  try {
    const remote = jose.createRemoteJWKSet(jwksUrl);
    for (const issuerOpt of [undefined, issuer] as (string | undefined)[]) {
      try {
        const { payload } = issuerOpt
          ? await jose.jwtVerify(token, remote, { issuer: issuerOpt })
          : await jose.jwtVerify(token, remote);
        const sub = typeof payload.sub === 'string' ? payload.sub : null;
        if (sub) {
          return { id: sub, email: emailFromJwtPayload(payload as Record<string, unknown>) };
        }
      } catch {
        /* tentar com issuer ou JWKS seguinte */
      }
    }
  } catch {
    /* JWKS remoto indisponível ou keys vazias */
  }

  const jwks = parseJwksForLocalSet();
  if (jwks?.keys?.length) {
    try {
      const local = jose.createLocalJWKSet(jwks);
      const { payload } = await jose.jwtVerify(token, local);
      const sub = typeof payload.sub === 'string' ? payload.sub : null;
      if (sub) {
        return { id: sub, email: emailFromJwtPayload(payload as Record<string, unknown>) };
      }
    } catch {
      /* tentar HS256 abaixo */
    }
  }

  const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')?.trim();
  if (!jwtSecret) return null;

  try {
    const key = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, key, { algorithms: ['HS256'] });
    const sub = typeof payload.sub === 'string' ? payload.sub : null;
    if (!sub) return null;
    return { id: sub, email: emailFromJwtPayload(payload as Record<string, unknown>) };
  } catch {
    return null;
  }
}

/**
 * Resolve o usuário do JWT: getUser (publishable + Bearer), GET auth/v1/user,
 * depois verificação local com SUPABASE_JWKS (novo) ou SUPABASE_JWT_SECRET (legado HS256).
 */
export async function getAuthUserFromRequest(
  authHeader: string,
  supabaseUrl: string,
): Promise<{ user: AuthUserLite | null; logDetail: string }> {
  const publishable = resolvePublishableKey();
  if (!publishable) {
    return {
      user: null,
      logDetail:
        'sem chave: defina SUPABASE_PUBLISHABLE_KEYS / SUPABASE_PUBLISHABLE_KEY ou SUPABASE_ANON_KEY na Edge',
    };
  }

  const base = supabaseUrl.replace(/\/$/, '');
  const trimmed = authHeader.trim();
  const token = trimmed.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { user: null, logDetail: 'token vazio após Bearer' };
  }

  const authorization = /^Bearer\s+/i.test(trimmed) ? trimmed : `Bearer ${token}`;

  const pubHeaders = {
    Authorization: authorization,
    apikey: publishable,
  };

  const authClient = createClient(supabaseUrl, publishable, {
    global: { headers: pubHeaders },
  });
  const {
    data: { user: u },
    error: getUserErr,
  } = await authClient.auth.getUser();
  if (!getUserErr && u?.id) {
    return { user: { id: u.id, email: u.email ?? null }, logDetail: '' };
  }

  let fetchDetail = '';
  try {
    const res = await fetch(`${base}/auth/v1/user`, {
      headers: {
        ...pubHeaders,
        Accept: 'application/json',
      },
    });
    if (res.ok) {
      const body = (await res.json()) as { id?: string; email?: string | null; message?: string };
      if (body?.id) {
        return { user: { id: body.id, email: body.email ?? null }, logDetail: '' };
      }
      fetchDetail = body?.message || 'auth/v1/user OK sem id';
    } else {
      fetchDetail = `auth/v1/user ${res.status}: ${await res.text()}`;
    }
  } catch (e) {
    fetchDetail = `auth/v1/user fetch: ${e instanceof Error ? e.message : String(e)}`;
  }

  // GoTrue às vezes aceita o JWT do usuário com apikey = service role (padrão em Edge).
  const serviceKey = resolveServiceRoleKey();
  if (serviceKey) {
    const svcHeaders = { Authorization: authorization, apikey: serviceKey };
    const svcClient = createClient(supabaseUrl, serviceKey, {
      global: { headers: svcHeaders },
    });
    const {
      data: { user: su },
      error: svcErr,
    } = await svcClient.auth.getUser();
    if (!svcErr && su?.id) {
      return { user: { id: su.id, email: su.email ?? null }, logDetail: '' };
    }
    try {
      const resS = await fetch(`${base}/auth/v1/user`, {
        headers: { ...svcHeaders, Accept: 'application/json' },
      });
      if (resS.ok) {
        const bodyS = (await resS.json()) as {
          id?: string;
          email?: string | null;
          message?: string;
        };
        if (bodyS?.id) {
          return { user: { id: bodyS.id, email: bodyS.email ?? null }, logDetail: '' };
        }
        fetchDetail += ` | svc auth/v1/user OK sem id`;
      } else {
        fetchDetail += ` | svc auth/v1/user ${resS.status}: ${await resS.text()}`;
      }
    } catch (e) {
      fetchDetail += ` | svc fetch: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  const fromJwt = await userFromVerifiedJwt(token, base);
  if (fromJwt) {
    return { user: fromJwt, logDetail: '' };
  }

  const hasJwks = !!parseJwksForLocalSet()?.keys?.length;
  const hasLegacySecret = !!Deno.env.get('SUPABASE_JWT_SECRET')?.trim();
  return {
    user: null,
    logDetail: `jwt local falhou (jwks=${hasJwks} legacySecret=${hasLegacySecret}); getUser: ${getUserErr?.message ?? ''}; ${fetchDetail}`,
  };
}
