import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    // Verificar se STRIPE_SECRET_KEY está configurada
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey.trim() === '') {
      console.error('STRIPE_SECRET_KEY não configurada');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'STRIPE_SECRET_KEY não configurada. Configure no Supabase Dashboard → Edge Functions → Secrets. Veja: docs/STRIPE_CONFIGURACAO.md'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Buscar sessão do Stripe
    console.log('Buscando sessão do Stripe:', { session_id: session_id.substring(0, 20) + '...' });
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'payment_intent'],
    });
    console.log('Sessão encontrada:', { 
      id: session.id, 
      client_reference_id: session.client_reference_id,
      payment_status: session.payment_status 
    });

    // Retornar informações relevantes
    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: session.id,
          client_reference_id: session.client_reference_id,
          customer_email: session.customer_email || session.customer_details?.email,
          payment_status: session.payment_status,
          status: session.status,
          metadata: session.metadata,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Erro ao buscar sessão do Stripe:', error);
    console.error('Error type:', error.constructor?.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Verificar se é erro de autenticação do Stripe
    if (error.type === 'StripeAuthenticationError' || error.message?.includes('Invalid API Key')) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'STRIPE_SECRET_KEY inválida. Verifique se a chave está correta no Supabase Dashboard → Edge Functions → Secrets'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Verificar se é erro de sessão não encontrada
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Sessão não encontrada no Stripe. Verifique se o session_id está correto.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro ao buscar sessão do Stripe',
        errorType: error.type || 'Unknown',
        errorCode: error.code || 'Unknown'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

