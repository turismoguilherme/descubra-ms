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
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
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
          endpoint: 'stripe-connect-onboarding',
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
    const rateLimitResult = checkRateLimit(user.id, 'stripe_connect_onboarding');
    if (!rateLimitResult.allowed) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_rate_limit_exceeded',
        userId: user.id,
        success: false,
        errorMessage: `Rate limit excedido. Bloqueado até ${rateLimitResult.blockExpiry?.toISOString()}`,
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
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

    const { partnerId, partnerEmail, partnerName, returnUrl, refreshUrl } = await req.json();

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
          endpoint: 'stripe-connect-onboarding',
          providedPartnerId: partnerId,
        },
      });
      throw new Error('partnerId inválido');
    }

    if (!partnerEmail || typeof partnerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'Email inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
          providedEmail: partnerEmail,
        },
      });
      throw new Error('Email inválido');
    }

    if (!partnerName || typeof partnerName !== 'string' || partnerName.trim().length === 0) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'Nome do parceiro inválido',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
        },
      });
      throw new Error('Nome do parceiro inválido');
    }

    // Validar URLs de retorno para prevenir open redirect
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

    if (returnUrl && !isValidUrl(returnUrl)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'URL de retorno inválida (possível open redirect)',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
          providedReturnUrl: returnUrl,
        },
      });
      throw new Error('URL de retorno inválida');
    }

    if (refreshUrl && !isValidUrl(refreshUrl)) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'URL de refresh inválida (possível open redirect)',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
          providedRefreshUrl: refreshUrl,
        },
      });
      throw new Error('URL de refresh inválida');
    }

    console.log('Criando/recuperando conta Stripe Connect para parceiro:', partnerId);

    // Verificar se o parceiro já tem uma conta Stripe Connect
    const { data: partner, error: partnerError } = await supabase
      .from('institutional_partners')
      .select('stripe_account_id, stripe_connect_status, person_type, contact_email')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      throw new Error('Parceiro não encontrado');
    }

    // Validar ownership: verificar se o email do usuário corresponde ao parceiro
    if (partner.contact_email !== user.email) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_unauthorized_access',
        userId: user.id,
        success: false,
        errorMessage: `Tentativa de acessar parceiro ${partnerId} sem permissão`,
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
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

    // Validar se o email fornecido corresponde ao parceiro
    if (partner.contact_email !== partnerEmail) {
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_invalid_input',
        userId: user.id,
        success: false,
        errorMessage: 'Email fornecido não corresponde ao parceiro',
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
          partnerId: partnerId,
          providedEmail: partnerEmail,
          expectedEmail: partner.contact_email,
        },
      });
      throw new Error('Email não corresponde ao parceiro');
    }

    // Registrar início do onboarding
    await logSecurityEvent(supabase, {
      action: 'stripe_connect_onboarding_started',
      userId: user.id,
      success: true,
      ipAddress: clientIP,
      userAgent: userAgent,
      metadata: {
        endpoint: 'stripe-connect-onboarding',
        partnerId: partnerId,
        hasExistingAccount: !!partner?.stripe_account_id,
      },
    });

    let accountId = partner?.stripe_account_id;

    // Se não tem conta, criar uma nova conta Express
    if (!accountId) {
      console.log('Criando nova conta Stripe Connect Express...');
      
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: partnerEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: partner?.person_type === 'pf' ? 'individual' : 'company',
        metadata: {
          partner_id: partnerId,
          platform: 'descubra_ms',
        },
      });

      accountId = account.id;

      // Salvar o account_id no banco
      const { error: updateError } = await supabase
        .from('institutional_partners')
        .update({
          stripe_account_id: accountId,
          stripe_connect_status: 'pending',
        })
        .eq('id', partnerId);

      if (updateError) {
        console.error('Erro ao salvar stripe_account_id:', updateError);
        // Não falhar, continuar com o onboarding
      }

      // Registrar criação da conta
      await logSecurityEvent(supabase, {
        action: 'stripe_connect_account_created',
        userId: user.id,
        success: true,
        ipAddress: clientIP,
        userAgent: userAgent,
        metadata: {
          endpoint: 'stripe-connect-onboarding',
          partnerId: partnerId,
          stripeAccountId: accountId,
          businessType: partner?.person_type === 'pf' ? 'individual' : 'company',
        },
      });

      console.log('Conta Stripe Connect criada com sucesso para parceiro:', partnerId);
    }

    // Gerar link de onboarding
    console.log('Gerando link de onboarding para conta:', accountId);
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${returnUrl}?stripe_connect=refresh`,
      return_url: returnUrl || `${returnUrl}?stripe_connect=success`,
      type: 'account_onboarding',
    });

    console.log('Link de onboarding gerado:', accountLink.url);

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId: accountId,
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro no stripe-connect-onboarding:', error);
    
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
          endpoint: 'stripe-connect-onboarding',
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
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400,
      }
    );
  }
});

