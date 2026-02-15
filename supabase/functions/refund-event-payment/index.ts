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

    // Garantir que amount existe e é um número
    const paymentAmount = (paymentRecord as any).amount || 0;

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

    // Buscar taxa do Stripe (mesmo método usado para reservas)
    let stripeFee = 0;
    try {
      if (paymentIntent.latest_charge) {
        const charge = await stripe.charges.retrieve(
          paymentIntent.latest_charge as string
        );
        
        if (charge.balance_transaction) {
          const balanceTransaction = await stripe.balanceTransactions.retrieve(
            charge.balance_transaction as string
          );
          // Taxa em centavos, converter para reais
          stripeFee = balanceTransaction.fee / 100;
          console.log('✅ Taxa do Stripe capturada:', stripeFee);
        }
      }
    } catch (feeError) {
      console.warn('⚠️ Erro ao buscar taxa do Stripe (não crítico):', feeError);
      // Se não conseguir buscar, usar amount_received como fallback
    }

    // Calcular valor do reembolso: valor total MENOS a taxa
    const totalAmountInReais = paymentIntent.amount / 100;
    const refundAmountInReais = Math.max(0, totalAmountInReais - stripeFee);
    const refundAmount = Math.round(refundAmountInReais * 100); // Converter para centavos
    
    console.log('💰 Cálculo de reembolso de evento:', {
      valorTotal: totalAmountInReais,
      taxaStripe: stripeFee,
      valorReembolso: refundAmountInReais,
      valorReembolsoCentavos: refundAmount,
    });

    // Criar reembolso no Stripe (com valor já descontado da taxa)
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount, // Valor já descontado da taxa
      reason: 'requested_by_customer',
      metadata: {
        event_id: event_id,
        event_name: event.name,
        reason: reason || 'Evento rejeitado pelo administrador',
        refund_type: 'fee_deducted', // Indica que taxa foi descontada
        original_amount: paymentIntent.amount,
        refunded_amount: refundAmount,
        stripe_fee_deducted: Math.round(stripeFee * 100).toString(), // Taxa em centavos
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
    await supabase
      .from('master_financial_records')
      .insert({
        record_type: 'refund',
        amount: refundAmountInReais,
        description: `Reembolso de evento em destaque: ${event.name} (taxa de processamento do Stripe descontada: R$ ${stripeFee.toFixed(2)})`,
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
          refund_type: 'fee_deducted',
          original_amount: paymentAmount,
          refunded_amount: refundAmountInReais,
          stripe_fee_deducted: stripeFee,
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
        refund_amount: refundAmountInReais,
        original_amount: paymentAmount,
        stripe_fee_deducted: stripeFee,
        message: 'Reembolso processado com sucesso (taxa do Stripe descontada)' 
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

