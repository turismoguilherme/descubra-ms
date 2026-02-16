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

    // Criar cliente Supabase para autenticação
    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const clientIP = getClientIP(req);
      const userAgent = getClientUserAgent(req);
      
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_unauthorized_access',
        success: false,
        errorMessage: 'Token de autenticação inválido ou ausente',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
        },
      });

      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const clientIP = getClientIP(req);
    const userAgent = getClientUserAgent(req);

    // Verificar rate limiting
    const rateLimitResult = checkRateLimit(user.id, 'stripe_connect_callback');
    if (!rateLimitResult.allowed) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_rate_limit_exceeded',
        userId: user.id,
        success: false,
        errorMessage: `Rate limit excedido. Bloqueado até ${rateLimitResult.blockExpiry?.toISOString()}`,
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
          blockExpiry: rateLimitResult.blockExpiry?.toISOString(),
        },
      });

      return new Response(
        JSON.stringify({ 
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          retryAfter: rateLimitResult.blockExpiry ? Math.ceil((rateLimitResult.blockExpiry.getTime() - Date.now()) / 1000) : 1800
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      );
    }

    const { partnerId, accountId } = await req.json();

    // Validação de inputs
    if (!partnerId || typeof partnerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partnerId)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'partnerId inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
          providedPartnerId: partnerId,
        },
      });
      throw new Error('partnerId inválido');
    }

    if (!accountId || typeof accountId !== 'string' || !accountId.startsWith('acct_')) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'accountId inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
          providedAccountId: accountId,
        },
      });
      throw new Error('accountId inválido');
    }

    // Validar ownership: verificar se o parceiro pertence ao usuário
    const { data: partner, error: partnerError } = await supabase
      .from('institutional_partners')
      .select('id, contact_email, stripe_account_id')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      throw new Error('Parceiro não encontrado');
    }

    if (partner.contact_email !== user.email) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_unauthorized_access',
        userId: user.id,
        success: false,
        errorMessage: `Tentativa de acessar parceiro ${partnerId} sem permissão`,
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
          requestedPartnerId: partnerId,
          userEmail: user.email,
          partnerEmail: partner.contact_email,
        },
      });

      return new Response(
        JSON.stringify({ error: 'Você não tem permissão para acessar este parceiro' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    if (partner.stripe_account_id !== accountId) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'accountId não corresponde ao parceiro',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
          partnerId: partnerId,
          providedAccountId: accountId,
          expectedAccountId: partner.stripe_account_id,
        },
      });
      throw new Error('accountId não corresponde ao parceiro');
    }

    console.log('Verificando status da conta Stripe para parceiro:', partnerId);

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

    // Registrar verificação do callback
    await logSecurityEvent(supabase, {
      action: 'stripe_connect_callback_verified',
      userId: user.id,
      success: true,
      ipAddress: clientIP,
      userAgent: userAgent,
      metadata: {
        endpoint: 'stripe-connect-callback',
        partnerId: partnerId,
        accountId: accountId,
        connectStatus: connectStatus,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    });

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
    
    // Registrar erro de segurança
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );
      const clientIP = getClientIP(req);
      const userAgent = getClientUserAgent(req);
      
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_error',
        success: false,
        errorMessage: error.message || 'Erro interno',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-callback',
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

