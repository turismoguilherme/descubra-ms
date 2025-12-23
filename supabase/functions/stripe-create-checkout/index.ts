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
    // #region agent log
    const authHeader = req.headers.get('Authorization');
    console.log(JSON.stringify({location:'stripe-create-checkout/index.ts:19',message:'Edge Function entry - auth header check',data:{hasAuthHeader:!!authHeader,authHeaderPreview:authHeader?.substring(0,30)+'...',allHeaders:Object.fromEntries(req.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}));
    // #endregion

    // Verificar autenticação
    if (!authHeader) {
      // #region agent log
      console.log(JSON.stringify({location:'stripe-create-checkout/index.ts:25',message:'Missing auth header - returning 401',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}));
      // #endregion
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
    
    // #region agent log
    console.log(JSON.stringify({location:'stripe-create-checkout/index.ts:52',message:'getUser result',data:{hasUser:!!user,hasError:!!userError,userError:userError?.message,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion
    
    if (userError || !user) {
      // #region agent log
      console.log(JSON.stringify({location:'stripe-create-checkout/index.ts:57',message:'Unauthorized - returning 401',data:{userError:userError?.message,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
      // #endregion
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

    // Mapear planos para Product IDs do Stripe
    // ViaJAR Tur: Empresários (professional) e Governo (government)
    const planProducts: Record<string, { productId: string; monthlyAmount: number }> = {
      professional: { 
        productId: 'prod_Tebg3KDIPBYNZC', // Empresários - R$ 199,00/mês
        monthlyAmount: 19900 
      },
      government: { 
        productId: 'prod_Tebhwjsw65UnRQ', // Governo - R$ 2.000,00/mês
        monthlyAmount: 200000 
      },
    };

    const planProduct = planProducts[planId];
    if (!planProduct) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID. Only professional and government plans are available.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Buscar preços associados ao produto
    const prices = await stripe.prices.list({
      product: planProduct.productId,
      active: true,
    });

    if (prices.data.length === 0) {
      return new Response(
        JSON.stringify({ error: `No prices found for product ${planProduct.productId}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Encontrar o preço que corresponde ao intervalo desejado
    const interval = billingPeriod === 'annual' ? 'year' : 'month';
    const price = prices.data.find(p => 
      p.recurring?.interval === interval && p.active
    );

    if (!price) {
      return new Response(
        JSON.stringify({ error: `No ${billingPeriod} price found for product ${planProduct.productId}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
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

    // Criar sessão de checkout usando o Price ID do Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: paymentMethodTypes,
      payment_method_options: paymentMethodOptions,
      line_items: [
        {
          price: price.id, // Usa o Price ID encontrado
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
          stripe_product_id: planProduct.productId,
        },
      },
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      metadata: {
        plan_id: planId,
        billing_period: billingPeriod,
        payment_method: paymentMethod,
        supabase_user_id: user.id,
        stripe_product_id: planProduct.productId,
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

