import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { partnerId, accountId } = await req.json();

    if (!partnerId || !accountId) {
      throw new Error('partnerId e accountId são obrigatórios');
    }

    console.log('Verificando status da conta Stripe:', accountId);

    // Buscar detalhes da conta no Stripe
    const account = await stripe.accounts.retrieve(accountId);

    console.log('Status da conta:', {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });

    // Determinar o status baseado nas capacidades
    let connectStatus = 'pending';
    
    if (account.charges_enabled && account.payouts_enabled) {
      connectStatus = 'connected';
    } else if (account.details_submitted) {
      connectStatus = 'restricted'; // Documentos em análise
    }

    // Atualizar status no banco
    const { error: updateError } = await supabase
      .from('institutional_partners')
      .update({
        stripe_connect_status: connectStatus,
        stripe_connected_at: connectStatus === 'connected' ? new Date().toISOString() : null,
      })
      .eq('id', partnerId);

    if (updateError) {
      throw new Error(`Erro ao atualizar status: ${updateError.message}`);
    }

    console.log('Status atualizado para:', connectStatus);

    return new Response(
      JSON.stringify({
        status: connectStatus,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro no stripe-connect-callback:', error);
    
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

