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
    const { reservationId, reason } = body;

    if (!reservationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: reservationId' }),
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

    // Buscar dados da reserva
    const { data: reservation, error: reservationError } = await supabase
      .from('partner_reservations')
      .select(`
        *,
        institutional_partners (
          id,
          name,
          contact_email
        )
      `)
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      return new Response(
        JSON.stringify({ error: 'Reserva não encontrada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Verificar se reserva pode ser cancelada
    if (reservation.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'Reserva já foi cancelada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (reservation.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Não é possível cancelar uma reserva já completada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Calcular dias até a reserva
    const reservationDate = new Date(reservation.reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reservationDate.setHours(0, 0, 0, 0);
    
    const daysUntilReservation = Math.floor(
      (reservationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Buscar política de cancelamento (do parceiro ou padrão)
    const { data: partnerPolicy } = await supabase
      .from('partner_cancellation_policies')
      .select('*')
      .eq('partner_id', reservation.partner_id)
      .eq('is_active', true)
      .maybeSingle();

    const { data: defaultPolicy } = await supabase
      .from('partner_cancellation_policies')
      .select('*')
      .is('partner_id', null)
      .eq('is_default', true)
      .eq('is_active', true)
      .maybeSingle();

    const policy = partnerPolicy || defaultPolicy;

    if (!policy) {
      return new Response(
        JSON.stringify({ error: 'Política de cancelamento não encontrada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Calcular percentual de reembolso baseado nos dias
    let refundPercent = 0;
    if (daysUntilReservation >= 7) {
      refundPercent = policy.days_before_7_refund_percent;
    } else if (daysUntilReservation >= 1 && daysUntilReservation <= 2) {
      refundPercent = policy.days_before_1_2_refund_percent;
    } else {
      refundPercent = policy.days_before_0_refund_percent;
    }

    const refundAmount = (reservation.total_amount * refundPercent) / 100;
    const refundAmountInCents = Math.round(refundAmount * 100);

    console.log('Cancelamento calculado:', {
      reservationId,
      daysUntilReservation,
      refundPercent,
      refundAmount,
      totalAmount: reservation.total_amount,
    });

    // Processar reembolso no Stripe (se houver pagamento)
    let stripeRefundId = null;
    const paymentIntentId = reservation.stripe_payment_intent_id || reservation.stripe_checkout_session_id;
    
    if (paymentIntentId && refundAmountInCents > 0) {
      try {
        // Se for checkout_session_id, buscar o payment_intent da sessão
        let actualPaymentIntentId = paymentIntentId;
        
        if (reservation.stripe_checkout_session_id && !reservation.stripe_payment_intent_id) {
          const session = await stripe.checkout.sessions.retrieve(
            reservation.stripe_checkout_session_id
          );
          actualPaymentIntentId = session.payment_intent as string;
        }

        if (actualPaymentIntentId) {
          // Buscar PaymentIntent
          const paymentIntent = await stripe.paymentIntents.retrieve(
            actualPaymentIntentId
          );

          if (paymentIntent.status === 'succeeded') {
            // Criar reembolso
            const refund = await stripe.refunds.create({
              payment_intent: actualPaymentIntentId,
              amount: refundAmountInCents,
              reason: 'requested_by_customer',
              metadata: {
                reservation_id: reservationId,
                reservation_code: reservation.reservation_code,
                refund_percent: refundPercent.toString(),
                days_until_reservation: daysUntilReservation.toString(),
              },
            });

            stripeRefundId = refund.id;
            console.log('Reembolso criado no Stripe:', refund.id);
          }
        }
      } catch (stripeError: any) {
        console.error('Erro ao processar reembolso no Stripe:', stripeError);
        // Continuar mesmo se houver erro no Stripe (pode ser processado manualmente depois)
      }
    }

    // Atualizar status da reserva
    const { error: updateError } = await supabase
      .from('partner_reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        refund_amount: refundAmount,
        refund_percent: refundPercent,
        stripe_refund_id: stripeRefundId,
        refunded_at: stripeRefundId ? new Date().toISOString() : null,
        partner_notes: reason ? `Cancelado pelo cliente. Motivo: ${reason}` : 'Cancelado pelo cliente',
      })
      .eq('id', reservationId);

    if (updateError) {
      console.error('Erro ao atualizar reserva:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar reserva' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Atualizar disponibilidade (liberar vagas)
    // Buscar service_id da reserva ou tentar encontrar pelo service_name
    let serviceId = reservation.service_id;
    
    if (!serviceId && reservation.service_name) {
      // Tentar encontrar service_id pelo nome do serviço
      const { data: pricing } = await supabase
        .from('partner_pricing')
        .select('id')
        .eq('partner_id', reservation.partner_id)
        .eq('service_name', reservation.service_name)
        .eq('is_active', true)
        .maybeSingle();
      
      if (pricing) {
        serviceId = pricing.id;
      }
    }
    
    if (serviceId) {
      const { error: availabilityError } = await supabase.rpc(
        'decrease_booked_guests',
        {
          p_partner_id: reservation.partner_id,
          p_service_id: serviceId,
          p_date: reservation.reservation_date,
          p_guests: -reservation.guests, // Negativo para liberar
        }
      );

      if (availabilityError) {
        console.warn('Erro ao atualizar disponibilidade via RPC (não crítico):', availabilityError);
        // Tentar atualização manual
        const { data: availability } = await supabase
          .from('partner_availability')
          .select('booked_guests')
          .eq('partner_id', reservation.partner_id)
          .eq('service_id', serviceId)
          .eq('date', reservation.reservation_date)
          .maybeSingle();

        if (availability) {
          await supabase
            .from('partner_availability')
            .update({
              booked_guests: Math.max(0, (availability.booked_guests || 0) - reservation.guests),
            })
            .eq('partner_id', reservation.partner_id)
            .eq('service_id', serviceId)
            .eq('date', reservation.reservation_date);
        } else {
          // Se não existe registro, não precisa fazer nada (vaga já estava liberada)
          console.log('Registro de disponibilidade não encontrado - vaga já estava liberada');
        }
      }
    } else {
      console.warn('service_id não encontrado - não foi possível atualizar disponibilidade');
    }

    // Criar notificação para o parceiro
    try {
      await supabase
        .from('partner_notifications')
        .insert({
          partner_id: reservation.partner_id,
          type: 'reservation_cancelled',
          title: 'Reserva Cancelada',
          message: `A reserva ${reservation.reservation_code} foi cancelada. Reembolso de R$ ${refundAmount.toFixed(2)} (${refundPercent}%) processado.`,
          reservation_id: reservationId,
          email_sent: false,
          metadata: {
            reservation_code: reservation.reservation_code,
            refund_amount: refundAmount,
            refund_percent: refundPercent,
            days_until_reservation: daysUntilReservation,
          },
        });
    } catch (notifError) {
      console.warn('Erro ao criar notificação (não crítico):', notifError);
    }

    // Enviar email para o cliente
    if (reservation.guest_email) {
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'reservation_cancelled',
            to: reservation.guest_email,
            data: {
              reservation_code: reservation.reservation_code,
              service_name: reservation.service_name,
              reservation_date: reservation.reservation_date,
              refund_amount: refundAmount,
              refund_percent: refundPercent,
              total_amount: reservation.total_amount,
            },
          },
        });
      } catch (emailError) {
        console.warn('Erro ao enviar email (não crítico):', emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        reservationId,
        refundAmount,
        refundPercent,
        daysUntilReservation,
        stripeRefundId,
        message: `Cancelamento processado. Reembolso de R$ ${refundAmount.toFixed(2)} (${refundPercent}%) será processado.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro ao cancelar reserva:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar cancelamento' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

