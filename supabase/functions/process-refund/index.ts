import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ===== AUTH/ADMIN GUARD =====
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(401, { error: 'Unauthorized' });

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabaseUser.auth.getUser();
    const user = userData?.user;
    if (!user) return json(401, { error: 'Unauthorized' });

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await supabase.rpc('is_admin_user', { check_user_id: user.id });
    if (!isAdmin) return json(403, { error: 'Forbidden' });

    // ===== INPUT =====
    const body = await req.json();
    const { refundId, reservationId, paymentIntentId, checkoutSessionId } = body;

    if (!refundId) return json(400, { error: 'Missing required field: refundId' });

    // Buscar dados do reembolso pendente — valor vem SEMPRE do banco
    const { data: pendingRefund, error: refundError } = await supabase
      .from('pending_refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (refundError || !pendingRefund) {
      return json(404, { error: 'Reembolso pendente não encontrado' });
    }

    if (pendingRefund.status !== 'pending' && pendingRefund.status !== 'processing') {
      return json(400, { error: `Reembolso já foi processado ou cancelado (status: ${pendingRefund.status})` });
    }

    const amount = Number(pendingRefund.refund_amount);
    const refundAmountInCents = Math.round(amount * 100);
    if (!refundAmountInCents || refundAmountInCents <= 0) {
      return json(400, { error: 'Valor do reembolso inválido' });
    }

    const initialPaymentIntentId = paymentIntentId || pendingRefund.stripe_payment_intent_id;
    const initialCheckoutSessionId = checkoutSessionId || pendingRefund.stripe_checkout_session_id;

    let stripeRefundId = '';
    try {
      let finalPaymentIntentId: string | null = null;

      if (initialCheckoutSessionId && !initialPaymentIntentId) {
        const session = await stripe.checkout.sessions.retrieve(initialCheckoutSessionId);
        finalPaymentIntentId = session.payment_intent as string;
      } else if (initialPaymentIntentId) {
        finalPaymentIntentId = initialPaymentIntentId;
      }

      if (!finalPaymentIntentId) return json(400, { error: 'Payment Intent ID não encontrado' });

      const paymentIntent = await stripe.paymentIntents.retrieve(finalPaymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return json(400, { error: `Payment Intent não está com status 'succeeded' (status atual: ${paymentIntent.status})` });
      }

      // Buscar taxa do Stripe
      let stripeFee = 0;
      try {
        const { data: reservation } = await supabase
          .from('partner_reservations')
          .select('stripe_processing_fee')
          .eq('id', pendingRefund.reservation_id)
          .single();

        if (reservation?.stripe_processing_fee) {
          stripeFee = Number(reservation.stripe_processing_fee);
        } else if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
          if (charge.balance_transaction) {
            const balanceTransaction = await stripe.balanceTransactions.retrieve(charge.balance_transaction as string);
            stripeFee = balanceTransaction.fee / 100;
          }
        }
      } catch (feeError) {
        console.warn('process-refund: erro ao buscar taxa', { message: (feeError as Error)?.message });
      }

      const originalRefundAmount = refundAmountInCents / 100;
      const refundAmountWithFeeDeducted = Math.max(0, originalRefundAmount - stripeFee);
      const finalRefundAmountInCents = Math.round(refundAmountWithFeeDeducted * 100);

      const refund = await stripe.refunds.create({
        payment_intent: finalPaymentIntentId,
        amount: finalRefundAmountInCents,
        reason: 'requested_by_customer',
        metadata: {
          refund_id: refundId,
          reservation_id: reservationId || pendingRefund.reservation_id,
          reservation_code: pendingRefund.reservation_code || '',
          refund_percent: pendingRefund.refund_percent?.toString() || '',
          days_until_reservation: pendingRefund.days_until_reservation?.toString() || '',
          stripe_fee_deducted: stripeFee.toString(),
          processed_by_user: user.id,
        },
      });

      stripeRefundId = refund.id;

      await supabase
        .from('pending_refunds')
        .update({
          stripe_refund_id: refund.id,
          stripe_fee_deducted: stripeFee,
          refund_amount: refundAmountWithFeeDeducted,
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', refundId);

      return json(200, {
        success: true,
        stripe_refund_id: stripeRefundId,
        refund_amount: refundAmountWithFeeDeducted,
        original_refund_amount: originalRefundAmount,
        stripe_fee_deducted: stripeFee,
        message: 'Reembolso processado com sucesso',
      });
    } catch (stripeError: any) {
      console.error('process-refund: stripe error', { message: stripeError?.message, stack: stripeError?.stack });
      return json(500, { error: 'Erro ao processar reembolso no Stripe' });
    }
  } catch (error: any) {
    console.error('process-refund: handler error', { message: error?.message, stack: error?.stack });
    return json(500, { error: 'Erro interno do servidor' });
  }
});
