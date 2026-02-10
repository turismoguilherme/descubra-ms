import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const body = await req.json();
    const { event_id, reason } = body;
    
    console.log('Refund request received:', { event_id, reason });

    if (!event_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: event_id' }),
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

    // Buscar dados do evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, sponsor_payment_status, organizador_email, organizador_nome')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Verificar se o evento foi pago
    if (event.sponsor_payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'Event payment status is not paid', status: event.sponsor_payment_status }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Buscar checkout_session_id de master_financial_records
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('master_financial_records')
      .select('metadata, stripe_invoice_id, amount')
      .eq('source', 'event_sponsor')
      .contains('metadata', { event_id })
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentError || !paymentRecord) {
      return new Response(
        JSON.stringify({ error: 'Payment record not found', details: paymentError?.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Extrair checkout_session_id do metadata
    const metadata = paymentRecord.metadata as any;
    const checkoutSessionId = metadata?.checkout_session_id;

    if (!checkoutSessionId) {
      return new Response(
        JSON.stringify({ error: 'Checkout session ID not found in payment record' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Buscar sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: 'Payment intent not found in session' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Verificar status do payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: `Payment intent status is ${paymentIntent.status}, cannot refund` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Calcular valor do reembolso: usar amount_received (valor líquido) em vez de amount (valor bruto)
    // Isso evita que você perca a taxa de processamento do Stripe
    const refundAmount = paymentIntent.amount_received || paymentIntent.amount;
    
    console.log('Valores do pagamento:', {
      amount_total: paymentIntent.amount,
      amount_received: paymentIntent.amount_received,
      refund_amount: refundAmount,
      fee: paymentIntent.amount - (paymentIntent.amount_received || paymentIntent.amount),
    });

    // Criar reembolso parcial no Stripe (reembolsa apenas o valor líquido recebido)
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount, // Reembolso parcial: apenas o valor líquido
      reason: 'requested_by_customer',
      metadata: {
        event_id: event_id,
        event_name: event.name,
        reason: reason || 'Evento rejeitado pelo administrador',
        refund_type: 'partial_net_amount', // Indica que é reembolso parcial
        original_amount: paymentIntent.amount,
        refunded_amount: refundAmount,
      },
    });

    console.log('Reembolso criado no Stripe:', refund.id);

    // Atualizar evento: sponsor_payment_status = 'refunded'
    const { error: updateError } = await supabase
      .from('events')
      .update({
        sponsor_payment_status: 'refunded',
        is_sponsored: false,
        is_visible: false,
      })
      .eq('id', event_id);

    if (updateError) {
      console.error('Erro ao atualizar evento:', updateError);
      // Continuar mesmo com erro, pois o reembolso já foi processado
    }

    // Registrar reembolso em master_financial_records
    // Usar o valor reembolsado (refundAmount já está em centavos do Stripe, converter para reais)
    const refundAmountInReais = refundAmount / 100;
    await supabase
      .from('master_financial_records')
      .insert({
        record_type: 'refund',
        amount: refundAmountInReais,
        description: `Reembolso parcial de evento em destaque: ${event.name} (valor líquido, sem taxa de processamento)`,
        stripe_invoice_id: refund.id,
        status: 'completed',
        paid_date: new Date().toISOString().split('T')[0],
        source: 'event_sponsor',
        currency: 'BRL',
        metadata: {
          event_id: event_id,
          event_name: event.name,
          original_payment_id: paymentRecord.stripe_invoice_id,
          refund_id: refund.id,
          reason: reason || 'Evento rejeitado pelo administrador',
          refund_type: 'partial_net_amount',
          original_amount: paymentRecord.amount,
          refunded_amount: refundAmountInReais,
        },
      });

    // Enviar email de notificação (opcional)
    if (event.organizador_email) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'event_refunded',
            to: event.organizador_email,
            data: {
              organizerName: event.organizador_nome,
              eventName: event.name,
              reason: reason || 'Evento rejeitado pelo administrador',
              refundAmount: refundAmount / 100, // Converter centavos para reais
            },
          }),
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de reembolso:', emailError);
        // Não falhar se email não for enviado
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        refund_id: refund.id,
        message: 'Refund processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro ao processar reembolso:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process refund' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

