import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EVENTO_DESTAQUE_PRICE_CENTS = 49990; // R$ 499,90

serve(async (req) => {
  console.log('=== EVENT CHECKOUT FUNCTION STARTED ===');
  console.log('Method:', req.method);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Step 1: Verificar chave do Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('Step 1 - STRIPE_SECRET_KEY exists:', !!stripeKey);
    console.log('Step 1 - Key starts with:', stripeKey ? stripeKey.substring(0, 7) : 'NOT SET');
    
    if (!stripeKey) {
      console.error('ERRO: STRIPE_SECRET_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY não configurada nas Edge Function Secrets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 2: Parse body
    console.log('Step 2 - Parsing request body...');
    let body;
    try {
      body = await req.json();
      console.log('Step 2 - Body parsed:', JSON.stringify(body));
    } catch (parseError) {
      console.error('Step 2 - ERRO ao parsear body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar dados da requisição' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { eventId, eventName, organizerEmail, successUrl, cancelUrl } = body;

    if (!eventId || !eventName || !organizerEmail) {
      console.error('Step 2 - Campos faltando:', { eventId: !!eventId, eventName: !!eventName, organizerEmail: !!organizerEmail });
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: eventId, eventName, organizerEmail' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Step 3: Preparar URLs
    console.log('Step 3 - Preparando URLs...');
    const baseUrl = 'https://descubramatogrossodosul.com.br';
    const finalSuccessUrl = successUrl || `${baseUrl}/descubramatogrossodosul/eventos?payment=success&event_id=${eventId}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/descubramatogrossodosul/cadastrar-evento?payment=cancelled`;
    console.log('Step 3 - Success URL:', finalSuccessUrl);
    console.log('Step 3 - Cancel URL:', finalCancelUrl);

    // Step 4: Chamar API do Stripe
    console.log('Step 4 - Chamando API do Stripe...');
    
    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('customer_email', organizerEmail);
    formData.append('line_items[0][price_data][currency]', 'brl');
    formData.append('line_items[0][price_data][product_data][name]', 'Evento Em Destaque - Descubra MS');
    formData.append('line_items[0][price_data][product_data][description]', `Destaque por 30 dias: ${eventName}`);
    formData.append('line_items[0][price_data][unit_amount]', EVENTO_DESTAQUE_PRICE_CENTS.toString());
    formData.append('line_items[0][quantity]', '1');
    formData.append('success_url', finalSuccessUrl);
    formData.append('cancel_url', finalCancelUrl);
    formData.append('metadata[type]', 'event_sponsorship');
    formData.append('metadata[event_id]', eventId);
    formData.append('metadata[event_name]', eventName);

    console.log('Step 4 - Form data prepared');

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    console.log('Step 4 - Stripe response status:', stripeResponse.status);

    const stripeData = await stripeResponse.json();
    console.log('Step 4 - Stripe response data:', JSON.stringify(stripeData));

    if (!stripeResponse.ok) {
      console.error('Step 4 - ERRO do Stripe:', stripeData.error);
      return new Response(
        JSON.stringify({ 
          error: stripeData.error?.message || 'Erro no Stripe',
          stripe_error_type: stripeData.error?.type,
          stripe_error_code: stripeData.error?.code
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Step 5: Sucesso!
    console.log('Step 5 - SUCESSO! Session ID:', stripeData.id);
    console.log('Step 5 - Checkout URL:', stripeData.url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutUrl: stripeData.url, 
        sessionId: stripeData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('=== ERRO GERAL ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

