/**
 * Cancelamento voluntário iniciado pelo próprio parceiro (JWT).
 * - Ainda não aprovado no Descubra MS: cancela assinatura no Stripe e tenta reembolso integral da última fatura.
 * - Já aprovado (listado): cancela renovação (fim no fim do período), remove da vitrine (status cancelled),
 *   mantém acesso ao painel até voluntary_cancel_access_until; reembolso parcial opcional (% em site_settings).
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-12-15.clover',
  httpClient: Stripe.createFetchHttpClient(),
});

async function refundLatestPaidInvoicePartialOrFull(
  subscriptionId: string,
  percent: number,
): Promise<{ refundId: string | null; note: string | null }> {
  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    status: 'paid',
    limit: 1,
  });
  const latest = invoices.data[0];
  if (!latest) return { refundId: null, note: 'Nenhuma fatura paga para reembolso.' };

  let chargeId: string | null = null;
  let chargeAmount = 0;
  if (typeof latest.charge === 'string' && latest.charge) {
    const ch = await stripe.charges.retrieve(latest.charge);
    chargeId = typeof ch.id === 'string' ? ch.id : null;
    chargeAmount = ch.amount ?? 0;
  } else if (latest.payment_intent) {
    const pi = await stripe.paymentIntents.retrieve(
      typeof latest.payment_intent === 'string' ? latest.payment_intent : latest.payment_intent.id,
    );
    if (pi.latest_charge && typeof pi.latest_charge === 'string') {
      chargeId = pi.latest_charge;
      const ch = await stripe.charges.retrieve(chargeId);
      chargeAmount = ch.amount ?? 0;
    }
  }
  if (!chargeId || chargeAmount <= 0) {
    return { refundId: null, note: 'Cobrança sem valor reembolsável automático.' };
  }

  const pct = Math.min(100, Math.max(0, percent));
  const refundAmount = Math.floor((chargeAmount * pct) / 100);
  if (pct < 100 && refundAmount < 1) {
    return { refundId: null, note: 'Percentual de reembolso muito baixo para esta fatura.' };
  }

  const refund =
    pct >= 100
      ? await stripe.refunds.create({ charge: chargeId, reason: 'requested_by_customer' })
      : await stripe.refunds.create({
        charge: chargeId,
        amount: refundAmount,
        reason: 'requested_by_customer',
      });
  return { refundId: refund.id, note: null };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const body = await req.json().catch(() => ({}));
    const partnerId = body?.partnerId;
    const reason = typeof body?.reason === 'string' ? body.reason : null;
    if (!partnerId || typeof partnerId !== 'string') {
      return new Response(JSON.stringify({ error: 'partnerId obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: partner, error: loadErr } = await supabaseAdmin
      .from('institutional_partners')
      .select(
        'id, contact_email, status, stripe_subscription_id, subscription_status',
      )
      .eq('id', partnerId)
      .single();

    if (loadErr || !partner) {
      return new Response(JSON.stringify({ error: 'Parceiro não encontrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const pEmail = (partner.contact_email as string | null)?.toLowerCase().trim();
    const uEmail = user.email?.toLowerCase().trim();
    if (!pEmail || pEmail !== uEmail) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    if (partner.status === 'rejected') {
      return new Response(JSON.stringify({ error: 'Cadastro já encerrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (partner.status === 'cancelled') {
      return new Response(JSON.stringify({ success: true, message: 'Já cancelado anteriormente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const subId = partner.stripe_subscription_id as string | null;
    const nowIso = new Date().toISOString();
    let refundNote: string | null = null;
    let refundId: string | null = null;
    let mode: 'immediate' | 'end_of_period' = 'immediate';

    if (partner.status === 'approved') {
      mode = 'end_of_period';
      if (!subId) {
        await supabaseAdmin
          .from('institutional_partners')
          .update({
            status: 'cancelled',
            is_active: false,
            voluntary_cancel_at: nowIso,
            voluntary_cancel_access_until: null,
            voluntary_cancel_reason: reason,
            updated_at: nowIso,
          })
          .eq('id', partnerId);
        return new Response(
          JSON.stringify({ success: true, mode, message: 'Sem assinatura Stripe; acesso encerrado.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
        );
      }

      const sub = await stripe.subscriptions.retrieve(subId);
      await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
      const refreshed = await stripe.subscriptions.retrieve(subId);
      const accessUntil = new Date(refreshed.current_period_end * 1000).toISOString();

      const { data: setting } = await supabaseAdmin
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_voluntary_cancel_refund_percent_if_approved')
        .maybeSingle();

      const pct = parseInt(String(setting?.setting_value ?? '0'), 10);
      if (!Number.isNaN(pct) && pct > 0) {
        try {
          const r = await refundLatestPaidInvoicePartialOrFull(subId, pct);
          refundId = r.refundId;
          refundNote = r.note;
        } catch (e: unknown) {
          refundNote = e instanceof Error ? e.message : String(e);
        }
      }

      await supabaseAdmin
        .from('institutional_partners')
        .update({
          status: 'cancelled',
          is_active: true,
          voluntary_cancel_at: nowIso,
          voluntary_cancel_access_until: accessUntil,
          voluntary_cancel_reason: reason,
          subscription_end_date: accessUntil,
          subscription_status: refreshed.status,
          updated_at: nowIso,
        })
        .eq('id', partnerId);

      return new Response(
        JSON.stringify({
          success: true,
          mode,
          accessUntil,
          refundId,
          refundNote,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Não aprovado ainda: encerra assinatura e tenta estorno integral da última fatura
    if (subId) {
      try {
        await stripe.subscriptions.cancel(subId);
        const r = await refundLatestPaidInvoicePartialOrFull(subId, 100);
        refundId = r.refundId;
        refundNote = r.note;
      } catch (e: unknown) {
        refundNote = e instanceof Error ? e.message : String(e);
      }
    }

    await supabaseAdmin
      .from('institutional_partners')
      .update({
        status: 'cancelled',
        is_active: false,
        voluntary_cancel_at: nowIso,
        voluntary_cancel_access_until: null,
        voluntary_cancel_reason: reason,
        subscription_status: 'canceled',
        updated_at: nowIso,
      })
      .eq('id', partnerId);

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'immediate',
        refundId,
        refundNote,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[partner-voluntary-cancel]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
