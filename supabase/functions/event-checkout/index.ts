import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getEventSponsorPriceBrl } from '../_shared/eventSponsorPrice.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('=== EVENT CHECKOUT FUNCTION STARTED ===');
  console.log('Method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('ERRO: STRIPE_SECRET_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY não configurada nas Edge Function Secrets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('ERRO ao parsear body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar dados da requisição' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { eventId, eventName, organizerEmail, successUrl, cancelUrl } = body;

    if (!eventId || !eventName || !organizerEmail) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: eventId, eventName, organizerEmail' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Preço sempre de site_settings (mesmo valor do admin / Guatá)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    let priceCents = 49990;
    let priceBrl = 499.9;
    let durationDays = 30;
    if (supabaseUrl && serviceKey) {
      try {
        const admin = createClient(supabaseUrl, serviceKey);
        const price = await getEventSponsorPriceBrl(admin);
        priceCents = price.price_cents;
        priceBrl = price.price_brl;
        durationDays = price.duration_days;
      } catch (e) {
        console.warn('Falha ao ler event_sponsor_price, usando fallback 499.90', e);
      }
    }

    console.log('Preço Em Destaque:', { priceBrl, priceCents, durationDays });

    const baseUrl = 'https://descubrams.com';
    const finalSuccessUrl = successUrl || `${baseUrl}/descubrams/eventos?payment=success&event_id=${eventId}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/descubrams/cadastrar-evento?payment=cancelled`;

    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('customer_email', organizerEmail);
    formData.append('line_items[0][price_data][currency]', 'brl');
    formData.append('line_items[0][price_data][product_data][name]', 'Evento Em Destaque - Descubra MS');
    formData.append(
      'line_items[0][price_data][product_data][description]',
      `Destaque por ${durationDays} dias: ${eventName}`,
    );
    formData.append('line_items[0][price_data][unit_amount]', priceCents.toString());
    formData.append('line_items[0][quantity]', '1');
    formData.append('success_url', finalSuccessUrl);
    formData.append('cancel_url', finalCancelUrl);
    formData.append('metadata[type]', 'event_sponsorship');
    formData.append('metadata[event_id]', eventId);
    formData.append('metadata[event_name]', eventName);
    formData.append('metadata[price_brl]', String(priceBrl));

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('ERRO do Stripe:', stripeData.error);
      return new Response(
        JSON.stringify({
          error: stripeData.error?.message || 'Erro no Stripe',
          stripe_error_type: stripeData.error?.type,
          stripe_error_code: stripeData.error?.code,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: stripeData.url,
        sessionId: stripeData.id,
        priceBrl,
        durationDays,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('=== ERRO GERAL ===', error?.message);
    return new Response(
      JSON.stringify({ error: 'Erro interno desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
