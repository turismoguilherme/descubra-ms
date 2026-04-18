/**
 * Processa contas inativas do Descubra MS:
 * - Envia e-mail de aviso para quem não acessa há X meses
 * - Após prazo de graça, exclui a conta (Auth)
 * Não afeta usuários ViajarTur (viajar_employees) nem admins (user_roles).
 *
 * Chamado por pg_cron semanalmente. Pode ser invocado com Authorization: Bearer ANON_KEY.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const INACTIVE_MONTHS = Number(Deno.env.get('INACTIVE_ACCOUNT_MONTHS')) || 9;
const GRACE_DAYS = Number(Deno.env.get('INACTIVE_ACCOUNT_GRACE_DAYS')) || 30;

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const cutoff = monthsAgo(INACTIVE_MONTHS);
    const graceCutoff = daysAgo(GRACE_DAYS);

    const { data: viajarUserIds } = await supabaseAdmin
      .from('viajar_employees')
      .select('user_id');
    const viajarSet = new Set((viajarUserIds ?? []).map((r) => r.user_id).filter(Boolean));

    const { data: staffRows } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'tech', 'master_admin']);
    const staffSet = new Set((staffRows ?? []).map((r) => r.user_id).filter(Boolean));

    const excludeIds = new Set<string>([...viajarSet, ...staffSet]);

    let page = 1;
    const perPage = 1000;
    const inactiveToWarn: { id: string; email: string | undefined }[] = [];
    const inactiveToDelete: { id: string; email: string | undefined }[] = [];

    while (true) {
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (listError) throw listError;
      const users = listData?.users ?? [];
      if (users.length === 0) break;

      for (const u of users) {
        if (excludeIds.has(u.id)) continue;
        const lastSignIn = u.last_sign_in_at ? new Date(u.last_sign_in_at) : null;
        if (lastSignIn && lastSignIn > cutoff) continue;
        inactiveToWarn.push({ id: u.id, email: u.email ?? undefined });
      }

      if (users.length < perPage) break;
      page += 1;
    }

    const { data: warnings } = await supabaseAdmin
      .from('inactive_account_warnings')
      .select('user_id, warned_at');

    const warnedMap = new Map<string, Date>();
    for (const w of warnings ?? []) {
      warnedMap.set(w.user_id, new Date(w.warned_at));
    }

    const toWarn: typeof inactiveToWarn = [];
    const toDelete: typeof inactiveToDelete = [];

    for (const u of inactiveToWarn) {
      const warnedAt = warnedMap.get(u.id);
      if (!warnedAt) {
        toWarn.push(u);
      } else if (warnedAt < graceCutoff) {
        toDelete.push(u);
      }
    }

    const loginUrl = Deno.env.get('DESCUBRA_MS_LOGIN_URL') || 'https://descubramatogrossodosul.com.br/descubrams/login';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    for (const u of toWarn) {
      await supabaseAdmin.from('inactive_account_warnings').upsert(
        { user_id: u.id, warned_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      if (u.email) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({
              type: 'inactive_account_warning',
              to: u.email,
              data: { daysToAct: GRACE_DAYS, loginUrl },
            }),
          });
        } catch (e) {
          console.warn('inactive-users-process: send email failed for', u.email, e);
        }
      }
    }

    let deletedCount = 0;
    for (const u of toDelete) {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
      if (!delErr) {
        deletedCount += 1;
        await supabaseAdmin.from('inactive_account_warnings').delete().eq('user_id', u.id);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        warned: toWarn.length,
        deleted: deletedCount,
        inactiveCandidates: inactiveToWarn.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
