/**
 * Reprovação definitiva de parceiro (admin): cancela assinatura Stripe,
 * tenta reembolso integral da última fatura paga e marca parceiro como rejeitado.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-12-15.clover',
  httpClient: Stripe.createFetchHttpClient(),
});

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

    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: roleRows } = await supabaseUser
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .in('role', ['admin', 'tech', 'master_admin'])
      .limit(1);

    if (!roleRows?.length) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const body = await req.json().catch(() => ({}));
    const partnerId = body?.partnerId;
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
      .select('id, name, contact_email, stripe_subscription_id, status')
      .eq('id', partnerId)
      .single();

    if (loadErr || !partner) {
      return new Response(JSON.stringify({ error: 'Parceiro não encontrado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    if (partner.status === 'rejected') {
      return new Response(JSON.stringify({ success: true, message: 'Já estava rejeitado', refundId: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let refundId: string | null = null;
    let stripeMessage: string | null = null;

    const subId = partner.stripe_subscription_id as string | null;
    if (subId) {
      try {
        const invoices = await stripe.invoices.list({
          subscription: subId,
          status: 'paid',
          limit: 1,
        });

        const latest = invoices.data[0];

        if (latest) {
          let chargeId: string | null = null;
          if (typeof latest.charge === 'string' && latest.charge) {
            chargeId = latest.charge;
          } else if (latest.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(
              typeof latest.payment_intent === 'string'
                ? latest.payment_intent
                : latest.payment_intent.id,
            );
            if (pi.latest_charge && typeof pi.latest_charge === 'string') {
              chargeId = pi.latest_charge;
            }
          }

          if (chargeId) {
            const refund = await stripe.refunds.create({
              charge: chargeId,
              reason: 'requested_by_customer',
            });
            refundId = refund.id;
          } else {
            stripeMessage = 'Fatura paga sem charge reembolsável automático; verifique no Stripe.';
          }
        }

        await stripe.subscriptions.cancel(subId);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[partner-final-reject] Stripe error:', msg);
        stripeMessage = msg;
      }
    }

    const { error: upErr } = await supabaseAdmin
      .from('institutional_partners')
      .update({
        status: 'rejected',
        is_active: false,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', partnerId);

    if (upErr) {
      console.error('[partner-final-reject] DB update:', upErr);
      return new Response(JSON.stringify({ error: upErr.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        refundId,
        stripeMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[partner-final-reject]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
