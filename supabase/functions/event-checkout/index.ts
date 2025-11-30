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
    // Parse request body
    const body = await req.json();
    const { 
      eventId,
      eventName,
      organizerEmail,
      organizerName,
      successUrl, 
      cancelUrl 
    } = body;

    if (!eventId || !eventName || !organizerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: eventId, eventName, organizerEmail' }),
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

    // Preço do evento em destaque: R$ 499,90 = 49990 centavos
    const EVENTO_DESTAQUE_PRICE = 49990;

    // Buscar ou criar cliente no Stripe
    let customerId: string;
    
    const existingCustomers = await stripe.customers.list({
      email: organizerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: organizerEmail,
        name: organizerName,
        metadata: {
          event_id: eventId,
          type: 'event_sponsor',
        },
      });
      customerId = customer.id;
    }

    // URLs de callback
    const baseUrl = 'https://descubramatogrossodosul.com.br';
    const defaultSuccessUrl = successUrl || `${baseUrl}/descubramatogrossodosul/eventos?payment=success&event_id=${eventId}`;
    const defaultCancelUrl = cancelUrl || `${baseUrl}/descubramatogrossodosul/cadastrar-evento?payment=cancelled`;

    // Criar sessão de checkout (pagamento único)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment', // Pagamento único, não assinatura
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Evento Em Destaque - Descubra MS',
              description: `Destaque para: ${eventName}`,
              images: ['https://descubramatogrossodosul.com.br/images/logo-descubra-ms.png'],
            },
            unit_amount: EVENTO_DESTAQUE_PRICE,
          },
          quantity: 1,
        },
      ],
      success_url: defaultSuccessUrl,
      cancel_url: defaultCancelUrl,
      metadata: {
        type: 'event_sponsorship',
        event_id: eventId,
        event_name: eventName,
        organizer_email: organizerEmail,
        organizer_name: organizerName || '',
      },
      locale: 'pt-BR',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expira em 30 minutos
    });

    // Atualizar evento com status de pagamento pendente
    await supabase
      .from('events')
      .update({
        sponsor_payment_status: 'pending',
        sponsor_amount: EVENTO_DESTAQUE_PRICE / 100,
      })
      .eq('id', eventId);

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
    console.error('Erro ao criar checkout de evento:', error);
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

