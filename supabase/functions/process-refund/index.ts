import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { refundId, reservationId, paymentIntentId, checkoutSessionId, amount } = body;

    if (!refundId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: refundId, amount' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do reembolso pendente
    const { data: pendingRefund, error: refundError } = await supabase
      .from('pending_refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (refundError || !pendingRefund) {
      return new Response(
        JSON.stringify({ error: 'Reembolso pendente não encontrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    if (pendingRefund.status !== 'pending' && pendingRefund.status !== 'processing') {
      return new Response(
        JSON.stringify({ error: `Reembolso já foi processado ou cancelado (status: ${pendingRefund.status})` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Processar reembolso no Stripe
    const initialPaymentIntentId = paymentIntentId || pendingRefund.stripe_payment_intent_id;
    const initialCheckoutSessionId = checkoutSessionId || pendingRefund.stripe_checkout_session_id;
    const refundAmountInCents = Math.round(Number(amount) * 100);

    if (refundAmountInCents <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor do reembolso deve ser maior que zero' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    let stripeRefundId = '';
    try {
      let finalPaymentIntentId = null;

      // Se tiver checkout_session_id, buscar o payment_intent da sessão
      if (initialCheckoutSessionId && !initialPaymentIntentId) {
        const session = await stripe.checkout.sessions.retrieve(
          initialCheckoutSessionId
        );
        finalPaymentIntentId = session.payment_intent as string;
      } else if (initialPaymentIntentId) {
        finalPaymentIntentId = initialPaymentIntentId;
      }

      if (!finalPaymentIntentId) {
        return new Response(
          JSON.stringify({ error: 'Payment Intent ID não encontrado' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Buscar PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        finalPaymentIntentId
      );

      if (paymentIntent.status !== 'succeeded') {
        return new Response(
          JSON.stringify({ error: `Payment Intent não está com status 'succeeded' (status atual: ${paymentIntent.status})` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      // Criar reembolso no Stripe
      const refund = await stripe.refunds.create({
        payment_intent: finalPaymentIntentId,
        amount: refundAmountInCents,
        reason: 'requested_by_customer',
        metadata: {
          refund_id: refundId,
          reservation_id: reservationId || pendingRefund.reservation_id,
          reservation_code: pendingRefund.reservation_code || '',
          refund_percent: pendingRefund.refund_percent.toString(),
          days_until_reservation: pendingRefund.days_until_reservation?.toString() || '',
          processed_by: 'admin',
        },
      });

      stripeRefundId = refund.id;
      console.log('✅ Reembolso criado no Stripe:', refund.id);

      return new Response(
        JSON.stringify({ 
          success: true,
          stripe_refund_id: stripeRefundId,
          refund_amount: amount,
          message: 'Reembolso processado com sucesso no Stripe'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } catch (stripeError: any) {
      console.error('❌ Erro ao processar reembolso no Stripe:', stripeError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar reembolso no Stripe',
          details: stripeError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

