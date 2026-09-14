import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { requireAdmin, guardResponse, serviceClient } from '../_shared/authGuard.ts';

type Platform = 'descubra-ms' | 'guata-labs';

const PROTECTED_ROLES = ['admin', 'master_admin'];

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

const randomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('') + '!2Aa';
};

serve(async (req) => {
  const cors = getCorsHeaders(req.headers.get('origin'));
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return guardResponse(auth, cors);

    const admin = serviceClient();
    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    if (action === 'list') {
      const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;

      const ids = list.users.map((u) => u.id);
      const [{ data: profiles }, { data: roles }, { data: employees }] = await Promise.all([
        admin.from('user_profiles').select('user_id, full_name, user_type').in('user_id', ids),
        admin.from('user_roles').select('user_id, role').in('user_id', ids),
        admin.from('viajar_employees').select('user_id, is_active').in('user_id', ids),
      ]);

      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      const rolesMap = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        rolesMap.set(r.user_id, [...(rolesMap.get(r.user_id) ?? []), r.role]);
      });
      const employeeMap = new Map((employees ?? []).map((e) => [e.user_id, e.is_active !== false]));

      const users = list.users.map((u) => {
        const roleList = rolesMap.get(u.id) ?? [];
        const isEmployee = employeeMap.has(u.id);
        const isInternal =
          isEmployee || roleList.some((r) => ['admin', 'master_admin', 'tech'].includes(r));
        return {
          user_id: u.id,
          email: u.email ?? '',
          full_name: profileMap.get(u.id)?.full_name ?? (u.user_metadata?.full_name as string) ?? null,
          role: roleList.includes('banned')
            ? 'banned'
            : roleList[0] ?? profileMap.get(u.id)?.user_type ?? 'user',
          roles: roleList,
          platform: (isInternal ? 'guata-labs' : 'descubra-ms') as Platform,
          blocked: roleList.includes('banned') || (isEmployee && employeeMap.get(u.id) === false),
          protectedAccount: roleList.some((r) => PROTECTED_ROLES.includes(r)),
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed: !!u.email_confirmed_at,
        };
      });

      return json({ users }, 200, cors);
    }

    if (action === 'create') {
      const email = String(body?.email ?? '').trim().toLowerCase();
      const fullName = String(body?.fullName ?? '').trim();
      const role = String(body?.role ?? 'user').trim();
      const platform: Platform = body?.platform === 'guata-labs' ? 'guata-labs' : 'descubra-ms';
      const password = String(body?.password ?? '').trim() || randomPassword();

      if (!email || !email.includes('@')) {
        return json({ error: 'Informe um e-mail válido.' }, 400, cors);
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || email },
      });
      if (createError) {
        return json({ error: createError.message }, 400, cors);
      }
      const userId = created.user!.id;

      await admin.from('user_profiles').upsert(
        { user_id: userId, full_name: fullName || email, user_type: role },
        { onConflict: 'user_id' },
      );
      await admin.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id' });

      if (platform === 'guata-labs') {
        await admin.from('viajar_employees').upsert(
          { user_id: userId, full_name: fullName || email, email, role, is_active: true },
          { onConflict: 'user_id' },
        );
      }

      return json({ success: true, userId, password }, 200, cors);
    }

    if (action === 'delete') {
      const userId = String(body?.userId ?? '');
      if (!userId) return json({ error: 'userId é obrigatório.' }, 400, cors);
      if (auth.user && auth.user.id === userId) {
        return json({ error: 'Você não pode excluir a sua própria conta.' }, 400, cors);
      }

      const { data: targetRoles } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', PROTECTED_ROLES)
        .limit(1);
      if (targetRoles?.length) {
        return json({ error: 'Contas administradoras não podem ser excluídas aqui.' }, 403, cors);
      }

      await Promise.all([
        admin.from('inactive_account_warnings').delete().eq('user_id', userId),
        admin.from('user_roles').delete().eq('user_id', userId),
        admin.from('user_profiles').delete().eq('user_id', userId),
        admin.from('viajar_employees').delete().eq('user_id', userId),
      ]);

      const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
      if (deleteError) return json({ error: deleteError.message }, 500, cors);

      return json({ success: true }, 200, cors);
    }

    if (action === 'reset_email') {
      const email = String(body?.email ?? '').trim().toLowerCase();
      const redirectTo = String(body?.redirectTo ?? '').trim();
      if (!email) return json({ error: 'E-mail é obrigatório.' }, 400, cors);

      const anon = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      );
      const { error } = await anon.auth.resetPasswordForEmail(
        email,
        redirectTo ? { redirectTo } : undefined,
      );
      if (error) return json({ error: error.message }, 400, cors);

      return json({ success: true }, 200, cors);
    }

    if (action === 'temp_password') {
      const userId = String(body?.userId ?? '');
      if (!userId) return json({ error: 'userId é obrigatório.' }, 400, cors);

      const password = randomPassword();
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) return json({ error: error.message }, 400, cors);

      return json({ success: true, password }, 200, cors);
    }

    return json({ error: 'Ação inválida.' }, 400, cors);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('admin-users error:', message);
    return json({ error: message }, 500, cors);
  }
});
