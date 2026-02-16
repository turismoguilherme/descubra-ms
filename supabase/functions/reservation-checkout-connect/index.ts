import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { logSecurityEvent, getClientIP, getClientUserAgent } from '../_shared/securityLog.ts';

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const userAgent = getClientUserAgent(req);
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      reservationId,
      partnerId,
      partnerName,
      serviceName,
      amount, // Valor total em reais (ex: 150.00)
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
    } = await req.json();

    // Validação de inputs
    if (!reservationId || typeof reservationId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reservationId)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_invalid_input',
        success: false,
        errorMessage: 'reservationId inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          providedReservationId: reservationId,
        },
      });
      throw new Error('reservationId inválido');
    }

    if (!partnerId || typeof partnerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partnerId)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_invalid_input',
        success: false,
        errorMessage: 'partnerId inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          providedPartnerId: partnerId,
        },
      });
      throw new Error('partnerId inválido');
    }

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_invalid_input',
        success: false,
        errorMessage: 'Valor inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          providedAmount: amount,
        },
      });
      throw new Error('Valor inválido (deve ser entre 0.01 e 10000.00)');
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_invalid_input',
        success: false,
        errorMessage: 'Email do cliente inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          providedEmail: customerEmail,
        },
      });
      throw new Error('Email do cliente inválido');
    }

    // Validar URLs de retorno
    const isValidUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        const allowedDomains = [
          'localhost',
          '127.0.0.1',
          'descubra-ms.vercel.app',
          'viajartur.com',
          'www.viajartur.com',
          supabaseUrl.replace('https://', '').replace('.supabase.co', '')
        ];
        const hostname = parsed.hostname.replace(/^www\./, '');
        return allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
      } catch {
        return false;
      }
    };

    if (successUrl && !isValidUrl(successUrl)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_invalid_input',
        success: false,
        errorMessage: 'URL de sucesso inválida (possível open redirect)',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          providedSuccessUrl: successUrl,
        },
      });
      throw new Error('URL de sucesso inválida');
    }

    if (cancelUrl && !isValidUrl(cancelUrl)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_invalid_input',
        success: false,
        errorMessage: 'URL de cancelamento inválida (possível open redirect)',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          providedCancelUrl: cancelUrl,
        },
      });
      throw new Error('URL de cancelamento inválida');
    }

    console.log('Criando checkout para reserva:', {
      reservationId,
      partnerId,
      amount: `R$ ${amount.toFixed(2)}`,
    });

    // Buscar dados do parceiro
    const { data: partner, error: partnerError } = await supabase
      .from('institutional_partners')
      .select('stripe_account_id, stripe_connect_status, name')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      throw new Error('Parceiro não encontrado');
    }

    if (!partner.stripe_account_id || partner.stripe_connect_status !== 'connected') {
      throw new Error('Parceiro não tem conta Stripe Connect configurada');
    }

    // Buscar percentual de comissão do site_settings
    const { data: commissionSetting } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('platform', 'ms')
      .eq('setting_key', 'partner_commission_rate')
      .single();

    const commissionRate = commissionSetting?.setting_value 
      ? parseFloat(commissionSetting.setting_value) / 100 
      : 0.10; // Default 10%

    // Calcular valores
    const amountInCents = Math.round(amount * 100);
    const platformFeeInCents = Math.round(amountInCents * commissionRate);
    const partnerAmountInCents = amountInCents - platformFeeInCents;

    console.log('Valores calculados:', {
      total: amountInCents,
      platformFee: platformFeeInCents,
      partnerAmount: partnerAmountInCents,
      commissionRate: commissionRate * 100 + '%',
    });

    // Criar Checkout Session com split de pagamento
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: serviceName || `Reserva - ${partnerName || partner.name}`,
              description: `Reserva em ${partnerName || partner.name}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // Configurar split de pagamento
        application_fee_amount: platformFeeInCents, // Comissão da plataforma
        transfer_data: {
          destination: partner.stripe_account_id, // Conta do parceiro
        },
        metadata: {
          reservation_id: reservationId,
          partner_id: partnerId,
          platform_fee: platformFeeInCents,
          partner_amount: partnerAmountInCents,
        },
      },
      metadata: {
        type: 'partner_reservation_connect',
        reservation_id: reservationId,
        partner_id: partnerId,
        partner_name: partnerName || partner.name,
        commission_rate: (commissionRate * 100).toFixed(2),
        commission_amount: (platformFeeInCents / 100).toFixed(2),
        partner_amount: (partnerAmountInCents / 100).toFixed(2),
      },
      success_url: successUrl || `${supabaseUrl.replace('.supabase.co', '.com')}/reservas?success=true&reservation_id=${reservationId}`,
      cancel_url: cancelUrl || `${supabaseUrl.replace('.supabase.co', '.com')}/reservas?canceled=true`,
    });

    console.log('Checkout session criada:', session.id);

    // Atualizar reserva com o ID do checkout
    await supabase
      .from('partner_reservations')
      .update({
        stripe_checkout_session_id: session.id,
        status: 'pending_payment',
      })
      .eq('id', reservationId);

    // Registrar criação do checkout
    await logSecurityEvent(supabase, {
      action: 'stripe_checkout_session_created',
      success: true,
      ipAddress: clientIP,
      userAgent: userAgent,
      metadata: {
        endpoint: 'reservation-checkout-connect',
        reservationId: reservationId,
        partnerId: partnerId,
        sessionId: session.id,
        amount: amount,
        platformFee: platformFeeInCents / 100,
        partnerAmount: partnerAmountInCents / 100,
      },
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        platformFee: platformFeeInCents / 100,
        partnerAmount: partnerAmountInCents / 100,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro no reservation-checkout-connect:', error);
    
    // Registrar erro de segurança
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );
      const clientIP = getClientIP(req);
      const userAgent = getClientUserAgent(req);
      
      await logSecurityEvent(supabase, {
        action: 'stripe_checkout_error',
        success: false,
        errorMessage: error.message || 'Erro interno',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'reservation-checkout-connect',
          errorType: error.name || 'Unknown',
        },
      });
    } catch (logError) {
      console.error('Erro ao registrar log de segurança:', logError);
    }
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro interno',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

