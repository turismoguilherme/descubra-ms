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
    const { partnerId, monthlyFee, successUrl, cancelUrl } = body;

    if (!partnerId || !monthlyFee) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: partnerId, monthlyFee' }),
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

    // Buscar ou criar cliente no Stripe
    let customerId: string;
    
    if (partner.stripe_customer_id) {
      customerId = partner.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: partner.contact_email || undefined,
        name: partner.name,
        metadata: {
          partner_id: partner.id,
          type: 'partner_subscription',
        },
      });
      customerId = customer.id;

      // Salvar customer_id no banco
      await supabase
        .from('institutional_partners')
        .update({ stripe_customer_id: customerId })
        .eq('id', partnerId);
    }

    // URLs de callback
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'http://localhost:3000';
    const defaultSuccessUrl = successUrl || `${baseUrl}/descubramatogrossodosul/seja-um-parceiro/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = cancelUrl || `${baseUrl}/descubramatogrossodosul/seja-um-parceiro`;

    // Converter valor para centavos
    const amountInCents = Math.round(monthlyFee * 100);

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Parceiro Descubra MS - ${partner.name}`,
              description: `Assinatura mensal para parceiro do Descubra Mato Grosso do Sul`,
            },
            unit_amount: amountInCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          type: 'partner_subscription',
          partner_id: partner.id,
          partner_name: partner.name,
        },
      },
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      metadata: {
        type: 'partner_subscription',
        partner_id: partner.id,
        partner_name: partner.name,
      },
      locale: 'pt-BR',
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: session.url,
        sessionId: session.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro ao criar checkout de parceiro:', error);
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

