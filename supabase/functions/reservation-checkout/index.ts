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
    console.log('[reservation-checkout] Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      partnerId, 
      reservationType, 
      serviceName,
      serviceId, // ID do produto/serviço
      reservationDate,
      reservationTime,
      guests,
      totalAmount,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      successUrl,
      cancelUrl
    } = body;

    console.log('[reservation-checkout] Extracted values:', {
      partnerId: !!partnerId,
      totalAmount: !!totalAmount,
      guestName: !!guestName,
      guestEmail: !!guestEmail,
      hasServiceId: !!serviceId,
    });

    if (!partnerId || !totalAmount || !guestName || !guestEmail) {
      const missingFields = [];
      if (!partnerId) missingFields.push('partnerId');
      if (!totalAmount) missingFields.push('totalAmount');
      if (!guestName) missingFields.push('guestName');
      if (!guestEmail) missingFields.push('guestEmail');
      
      console.error('[reservation-checkout] Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
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

    // Buscar dados do parceiro
    const { data: partner, error: partnerError } = await supabase
      .from('institutional_partners')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ error: 'Parceiro não encontrado' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Verificar se parceiro está ativo
    console.log('[reservation-checkout] Partner status:', {
      is_active: partner.is_active,
      subscription_status: partner.subscription_status,
      partner_id: partner.id,
      partner_name: partner.name,
    });
    
    if (!partner.is_active || partner.subscription_status !== 'active') {
      const reasons = [];
      if (!partner.is_active) reasons.push('parceiro não está marcado como ativo');
      if (partner.subscription_status !== 'active') reasons.push(`assinatura está com status: ${partner.subscription_status || 'null'}`);
      
      console.error('[reservation-checkout] Partner not active:', {
        is_active: partner.is_active,
        subscription_status: partner.subscription_status,
        reasons: reasons.join(', '),
      });
      return new Response(
        JSON.stringify({ 
          error: `Parceiro não está disponível para reservas: ${reasons.join(', ')}. Entre em contato com o suporte.`,
          details: {
            is_active: partner.is_active,
            subscription_status: partner.subscription_status,
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validar disponibilidade se serviceId foi fornecido
    if (serviceId && reservationDate && guests) {
      try {
        const { data: availabilityCheck } = await supabase.rpc('check_availability', {
          p_partner_id: partnerId,
          p_service_id: serviceId,
          p_date: reservationDate,
          p_guests: guests,
        });

        if (!availabilityCheck) {
          return new Response(
            JSON.stringify({ error: 'Não há disponibilidade para esta data e número de pessoas' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }
      } catch (availabilityError) {
        console.warn('Erro ao verificar disponibilidade (continuando mesmo assim):', availabilityError);
        // Continuar mesmo se houver erro na verificação (pode ser que a função não exista ainda)
      }
    }

    // Buscar percentual de comissão configurado no admin (padrão: 10%)
    const { data: commissionSetting } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('platform', 'ms')
      .eq('setting_key', 'partner_commission_rate')
      .maybeSingle();

    const commissionRate = commissionSetting?.setting_value 
      ? parseFloat(String(commissionSetting.setting_value))
      : (partner.commission_rate || 10.00);
    
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const partnerAmount = totalAmount - commissionAmount;

    // Gerar código de reserva
    const { data: reservationCodeData } = await supabase.rpc('generate_reservation_code');
    const reservationCode = reservationCodeData || `RES-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Criar reserva no banco (status: pending)
    const { data: reservation, error: reservationError } = await supabase
      .from('partner_reservations')
      .insert({
        partner_id: partnerId,
        service_id: serviceId || null, // Salvar service_id se fornecido
        reservation_type: reservationType || 'other',
        service_name: serviceName || 'Serviço',
        reservation_date: reservationDate || new Date().toISOString().split('T')[0],
        reservation_time: reservationTime || null,
        guests: guests || 1,
        total_amount: totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: 'pending',
        reservation_code: reservationCode,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || null,
        special_requests: specialRequests || null,
      })
      .select()
      .single();

    if (reservationError) {
      console.error('Erro ao criar reserva:', reservationError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar reserva' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Criar notificação para o parceiro sobre nova reserva
    try {
      const { error: notificationError } = await supabase
        .from('partner_notifications')
        .insert({
          partner_id: partnerId,
          type: 'new_reservation',
          title: 'Nova Reserva Recebida',
          message: `Nova reserva ${reservationCode} recebida de ${guestName}. Valor: R$ ${totalAmount.toFixed(2)}. Aguardando pagamento.`,
          reservation_id: reservation.id,
          email_sent: false,
          metadata: {
            reservation_code: reservationCode,
            guest_name: guestName,
            total_amount: totalAmount,
          },
        });

      if (notificationError) {
        console.warn('Erro ao criar notificação (não crítico):', notificationError);
      } else if (partner.contact_email) {
        // Enviar email de notificação
        try {
          await supabase.functions.invoke('send-notification-email', {
            body: {
              type: 'partner_notification',
              to: partner.contact_email,
              data: {
                title: 'Nova Reserva Recebida',
                message: `Nova reserva ${reservationCode} recebida de ${guestName}. Valor: R$ ${totalAmount.toFixed(2)}. Aguardando pagamento.`,
                type: 'new_reservation',
                reservationId: reservation.id,
              },
            },
          });

          await supabase
            .from('partner_notifications')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
            })
            .eq('partner_id', partnerId)
            .eq('type', 'new_reservation')
            .eq('reservation_id', reservation.id);
        } catch (emailErr) {
          console.warn('Erro ao enviar email (não crítico):', emailErr);
        }
      }
    } catch (notificationErr) {
      console.warn('Erro ao criar notificação (não crítico):', notificationErr);
    }

    // URLs de callback
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'http://localhost:3000';
    const defaultSuccessUrl = successUrl || `${baseUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservation.id}`;
    const defaultCancelUrl = cancelUrl || `${baseUrl}/reservation/cancel?reservation_id=${reservation.id}`;

    // Converter valor para centavos
    const amountInCents = Math.round(totalAmount * 100);

    // Criar sessão de checkout no Stripe
    // Métodos de pagamento: Cartão, PIX e Boleto (habilitados para Brasil)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'pix', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Reserva - ${serviceName || 'Serviço'}`,
              description: `Reserva com ${partner.name} - ${reservationCode}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'partner_reservation',
        reservation_id: reservation.id,
        reservation_code: reservationCode,
        partner_id: partnerId,
        partner_name: partner.name,
        commission_rate: commissionRate.toString(),
        commission_amount: commissionAmount.toString(),
        partner_amount: partnerAmount.toString(),
      },
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      customer_email: guestEmail,
      locale: 'pt-BR',
      allow_promotion_codes: true,
    });

    // Salvar stripe_checkout_session_id na reserva
    if (session.id && reservation.id) {
      await supabase
        .from('partner_reservations')
        .update({ stripe_checkout_session_id: session.id })
        .eq('id', reservation.id);
    }

    // NOTA: A disponibilidade será atualizada quando o pagamento for confirmado via webhook do Stripe
    // Isso evita bloquear vagas para reservas que não foram pagas

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: session.url,
        sessionId: session.id,
        reservationId: reservation.id,
        reservationCode: reservationCode
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro ao criar checkout de reserva:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao criar sessão de checkout' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

