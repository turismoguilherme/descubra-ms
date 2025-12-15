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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { 
      planId, 
      billingPeriod, 
      paymentMethod, 
      successUrl, 
      cancelUrl 
    } = body;

    if (!planId || !billingPeriod || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: planId, billingPeriod, paymentMethod' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Mapear planos para preços do Stripe (em centavos)
    // ViaJAR Tur: apenas 2 planos (Secretárias e Empresários)
    const planPrices: Record<string, { monthly: number; annual: number }> = {
      freemium: { monthly: 0, annual: 0 }, // Não usado em ViaJAR Tur
      professional: { monthly: 20000, annual: 192000 }, // R$ 200/mês ou R$ 1920/ano (Empresários ViaJAR Tur)
      enterprise: { monthly: 49900, annual: 479200 }, // R$ 499/mês ou R$ 4792/ano (não usado em ViaJAR Tur)
      government: { monthly: 200000, annual: 1920000 }, // R$ 2000/mês ou R$ 19200/ano (Secretárias ViaJAR Tur)
    };

    const planPrice = planPrices[planId];
    if (!planPrice) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const amount = billingPeriod === 'annual' ? planPrice.annual : planPrice.monthly;

    // Se for freemium, não precisa de checkout
    if (amount === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Freemium plan - no payment required',
          checkoutUrl: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Buscar ou criar cliente no Stripe
    let customerId: string;
    
    // Verificar se já existe cliente no banco
    const { data: existingClient } = await supabase
      .from('master_clients')
      .select('stripe_customer_id')
      .eq('contact_email', user.email)
      .single();

    if (existingClient?.stripe_customer_id) {
      customerId = existingClient.stripe_customer_id;
    } else {
      // Criar novo cliente no Stripe
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
      });
      customerId = customer.id;

      // Salvar customer_id no banco
      await supabase
        .from('master_clients')
        .upsert({
          contact_email: user.email,
          client_name: user.email?.split('@')[0] || 'Cliente',
          stripe_customer_id: customerId,
          status: 'prospect',
        }, {
          onConflict: 'contact_email'
        });
    }

    // URLs de callback
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'http://localhost:3000';
    const defaultSuccessUrl = successUrl || `${baseUrl}/viajar/onboarding/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = cancelUrl || `${baseUrl}/viajar/onboarding?step=3`;

    // Configurar métodos de pagamento baseado na escolha
    // Nota: Para PIX e Boleto no Brasil, o Stripe usa payment_method_types específicos
    let paymentMethodTypes: string[] = [];
    let paymentMethodOptions: any = {};

    switch (paymentMethod) {
      case 'card':
        paymentMethodTypes = ['card'];
        break;
      case 'pix':
        // PIX no Stripe Brasil usa 'link' ou pode ser configurado via payment_method_options
        // Para checkout session, usamos 'card' e configuramos PIX como opção adicional
        paymentMethodTypes = ['card'];
        // PIX será oferecido como opção no checkout se configurado na conta Stripe
        break;
      case 'boleto':
        // Boleto no Stripe Brasil
        paymentMethodTypes = ['card'];
        // Boleto será oferecido como opção no checkout se configurado na conta Stripe
        break;
      default:
        // Se não especificado, permite cartão (PIX e Boleto aparecem como opções se habilitados)
        paymentMethodTypes = ['card'];
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: paymentMethodTypes,
      payment_method_options: paymentMethodOptions,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `ViaJAR ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
              description: `Plano ${planId} - ${billingPeriod === 'annual' ? 'Anual' : 'Mensal'}`,
            },
            unit_amount: amount,
            recurring: {
              interval: billingPeriod === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        // SEM período de teste - todos os planos são pagos imediatamente
        metadata: {
          plan_id: planId,
          billing_period: billingPeriod,
          supabase_user_id: user.id,
          platform: 'viajar_tur', // Identificador para ViaJAR Tur
        },
      },
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      metadata: {
        plan_id: planId,
        billing_period: billingPeriod,
        payment_method: paymentMethod,
        supabase_user_id: user.id,
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
    console.error('Erro ao criar checkout:', error);
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

