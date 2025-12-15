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
    const { 
      partnerId, 
      reservationType, 
      serviceName,
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

    if (!partnerId || !totalAmount || !guestName || !guestEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: partnerId, totalAmount, guestName, guestEmail' }),
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
    if (!partner.is_active || partner.subscription_status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Parceiro não está ativo ou assinatura não está ativa' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
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

    // URLs de callback
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'http://localhost:3000';
    const defaultSuccessUrl = successUrl || `${baseUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservation.id}`;
    const defaultCancelUrl = cancelUrl || `${baseUrl}/reservation/cancel?reservation_id=${reservation.id}`;

    // Converter valor para centavos
    const amountInCents = Math.round(totalAmount * 100);

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
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

