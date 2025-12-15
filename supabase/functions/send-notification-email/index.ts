import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Tipos de notificação
type NotificationType = 
  | 'event_approved'
  | 'event_rejected'
  | 'event_payment_confirmed'
  | 'partner_approved'
  | 'partner_rejected'
  | 'welcome'
  | 'system_alert';

interface EmailRequest {
  type: NotificationType;
  to: string;
  data: Record<string, any>;
}

// Templates de email
const templates: Record<NotificationType, { subject: string; html: (data: any) => string }> = {
  event_approved: {
    subject: '✅ Seu evento foi aprovado! - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #1e3a5f;">Parabéns! Seu evento foi aprovado! 🎉</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>Temos o prazer de informar que o evento <strong>"${data.eventName}"</strong> foi aprovado e já está visível no calendário de eventos do Descubra MS.</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>📅 Data:</strong> ${data.eventDate}</p>
            <p><strong>📍 Local:</strong> ${data.eventLocation}</p>
          </div>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/eventos" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver no Calendário
          </a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Descubra Mato Grosso do Sul - Turismo e Cultura</p>
        </div>
      </div>
    `,
  },
  event_rejected: {
    subject: 'Sobre seu evento - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a5f;">Sobre seu evento</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>Infelizmente, o evento <strong>"${data.eventName}"</strong> não pôde ser aprovado no momento.</p>
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
          <p>Você pode entrar em contato conosco para mais informações ou enviar um novo evento.</p>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/cadastrar-evento" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Cadastrar Novo Evento
          </a>
        </div>
      </div>
    `,
  },
  event_payment_confirmed: {
    subject: '💳 Pagamento confirmado - Evento Em Destaque! - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #f59e0b, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⭐ Evento Em Destaque!</h1>
        </div>
        <div style="padding: 30px; background: #fffbeb;">
          <h2 style="color: #92400e;">Pagamento confirmado!</h2>
          <p>Olá, <strong>${data.organizerName || 'Organizador'}</strong>!</p>
          <p>O pagamento do seu evento <strong>"${data.eventName}"</strong> foi confirmado com sucesso!</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #f59e0b;">
            <p><strong>🌟 Status:</strong> Em Destaque</p>
            <p><strong>📅 Válido até:</strong> ${data.validUntil}</p>
            <p><strong>💰 Valor:</strong> R$ 499,90</p>
          </div>
          <p>Seu evento agora aparece com destaque especial no calendário!</p>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/eventos" 
             style="display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Meu Evento
          </a>
        </div>
      </div>
    `,
  },
  partner_approved: {
    subject: '🤝 Parceria aprovada! - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #22c55e); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Bem-vindo, Parceiro!</h1>
        </div>
        <div style="padding: 30px; background: #f0fdf4;">
          <h2 style="color: #166534;">Sua parceria foi aprovada! 🎉</h2>
          <p>Olá!</p>
          <p>Temos o prazer de informar que <strong>"${data.partnerName}"</strong> agora faz parte da rede de parceiros do Descubra MS!</p>
          <p>Seu estabelecimento já está visível para milhares de turistas que visitam nossa plataforma.</p>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul/parceiros" 
             style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Ver Minha Página
          </a>
        </div>
      </div>
    `,
  },
  partner_rejected: {
    subject: 'Sobre sua solicitação de parceria - Descubra MS',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a5f; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Descubra MS</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Sobre sua solicitação</h2>
          <p>Olá!</p>
          <p>Infelizmente, a solicitação de parceria de <strong>"${data.partnerName}"</strong> não pôde ser aprovada no momento.</p>
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
          <p>Você pode entrar em contato conosco para mais informações.</p>
        </div>
      </div>
    `,
  },
  welcome: {
    subject: 'Bem-vindo ao Descubra MS! 🌿',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1e3a5f, #2d8a8a, #22c55e); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Descubra Mato Grosso do Sul</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e3a5f;">Bem-vindo(a), ${data.userName || 'Viajante'}! 🌿</h2>
          <p>Estamos muito felizes em ter você conosco!</p>
          <p>O Descubra MS é sua porta de entrada para as maravilhas de Mato Grosso do Sul:</p>
          <ul>
            <li>🐆 Pantanal - A maior planície alagável do mundo</li>
            <li>💎 Bonito - Águas cristalinas e natureza preservada</li>
            <li>🏛️ História e Cultura de nossa gente</li>
          </ul>
          <a href="https://descubramatogrossodosul.com.br/descubramatogrossodosul" 
             style="display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Começar a Explorar
          </a>
        </div>
      </div>
    `,
  },
  system_alert: {
    subject: '🚨 Alerta do Sistema - Descubra MS',
    html: (data: any) => {
      const severityColors: Record<string, string> = {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#f59e0b',
        low: '#3b82f6',
      };
      const severityColor = severityColors[data.severity] || '#6b7280';
      const alertIcon = data.alert_type === 'error' ? '🔴' : data.alert_type === 'warning' ? '⚠️' : 'ℹ️';
      
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${severityColor}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">${alertIcon} Alerta do Sistema</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: ${severityColor}; margin-top: 0;">${data.service_name || 'Serviço'} - ${data.severity?.toUpperCase() || 'ALERTA'}</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${severityColor}; margin: 20px 0;">
              <p style="font-size: 16px; margin: 0;"><strong>${data.message || 'Alerta do sistema'}</strong></p>
            </div>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Serviço:</strong> ${data.service_name || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Tipo:</strong> ${data.alert_type || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Severidade:</strong> ${data.severity || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Data/Hora:</strong> ${data.timestamp ? new Date(data.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}</p>
            </div>
            <a href="https://descubramatogrossodosul.com.br/viajar/admin/system/health" 
               style="display: inline-block; background: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Ver Detalhes no Painel Admin
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px; background: #f9fafb;">
            <p>Este é um email automático do sistema de monitoramento do Descubra MS.</p>
            <p>Para gerenciar suas preferências de alertas, acesse o painel administrativo.</p>
          </div>
        </div>
      `;
    },
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let requestData: EmailRequest;
    try {
      // Usar req.json() diretamente como outras Edge Functions fazem
      requestData = await req.json() as EmailRequest;
      console.log('✅ [send-notification-email] Body parseado com sucesso:', {
        hasType: !!requestData.type,
        type: requestData.type,
        hasTo: !!requestData.to,
        to: requestData.to,
        hasData: !!requestData.data,
        dataKeys: requestData.data ? Object.keys(requestData.data) : [],
        fullRequestData: JSON.stringify(requestData).substring(0, 1000),
        requestDataType: typeof requestData,
        requestDataKeys: Object.keys(requestData || {})
      });
    } catch (parseError) {
      console.error('❌ [send-notification-email] Erro ao fazer parse do JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: String(parseError) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extrair campos com valores padrão para evitar undefined
    const type = requestData?.type;
    const to = requestData?.to;
    const data = requestData?.data;

    console.log('📧 [send-notification-email] Campos extraídos após destructuring:', { 
      type, 
      to, 
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      fullData: JSON.stringify(data || {}).substring(0, 500),
      typeIsTruthy: !!type,
      toIsTruthy: !!to,
      typeValue: type,
      toValue: to
    });

    if (!type || !to) {
      console.error('❌ [send-notification-email] Campos obrigatórios faltando:', { 
        type: type || 'MISSING', 
        to: to || 'MISSING',
        requestData: JSON.stringify(requestData).substring(0, 500)
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request: type and to are required',
          received: { type: type || null, to: to || null }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!templates[type]) {
      console.error('❌ [send-notification-email] Tipo de template não encontrado:', {
        requestedType: type,
        availableTypes: Object.keys(templates),
        templatesCount: Object.keys(templates).length
      });
      return new Response(
        JSON.stringify({ 
          error: `Invalid template type: ${type}. Available: ${Object.keys(templates).join(', ')}`,
          requestedType: type,
          availableTypes: Object.keys(templates)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const template = templates[type];
    
    // Para system_alert, personalizar o subject com o nome do serviço
    let subject = template.subject;
    if (type === 'system_alert' && data?.service_name) {
      subject = `🚨 Alerta: ${data.service_name} - Descubra MS`;
    }
    
    // Gerar HTML do template
    let htmlContent: string;
    try {
      htmlContent = template.html(data || {});
      if (!htmlContent) {
        throw new Error('Template HTML retornou vazio');
      }
    } catch (htmlError: any) {
      console.error('❌ [send-notification-email] Erro ao gerar HTML do template:', htmlError);
      return new Response(
        JSON.stringify({ error: `Error generating email HTML: ${htmlError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const emailContent = {
      to,
      subject,
      html: htmlContent,
    };

    console.log('📧 [send-notification-email] Conteúdo do email preparado:', { to, subject, htmlLength: htmlContent.length });

    // Verificar se Resend está configurado (aceita ambos os nomes)
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || Deno.env.get('RESEND_KEY');

    if (resendApiKey) {
      // Tentar usar domínio customizado primeiro, com fallback para domínio padrão do Resend
      // O domínio padrão do Resend é sempre verificado e pode ser usado sem configuração adicional
      const customDomain = Deno.env.get('RESEND_FROM_EMAIL') || 'Descubra MS <noreply@descubramatogrossodosul.com.br>';
      // Domínio padrão do Resend (sempre verificado - funciona mesmo sem verificar domínio customizado)
      const defaultDomain = Deno.env.get('RESEND_DEFAULT_FROM') || 'Descubra MS <onboarding@resend.dev>';
      
      // Função para tentar enviar com um domínio específico
      const trySendEmail = async (fromEmail: string, isRetry: boolean = false) => {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromEmail,
          to: [to],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });

      if (!resendResponse.ok) {
          let errorData: any;
          try {
            errorData = await resendResponse.json();
          } catch {
            errorData = { status: resendResponse.status, statusText: resendResponse.statusText };
          }
          
          // Se for erro 403 (domínio não verificado) e ainda não tentou o domínio padrão, tentar novamente
          if (resendResponse.status === 403 && !isRetry && fromEmail === customDomain) {
            console.warn('⚠️ [send-notification-email] Domínio customizado não verificado, tentando com domínio padrão do Resend...');
            return await trySendEmail(defaultDomain, true);
          }
          
          console.error('❌ [send-notification-email] Erro Resend:', {
            status: resendResponse.status,
            statusText: resendResponse.statusText,
            errorData,
            emailTo: to,
            emailSubject: emailContent.subject,
            fromEmail,
            isRetry
          });
          
          // Se for erro 403 de domínio não verificado, retornar sucesso mas com aviso
          if (resendResponse.status === 403 && errorData?.message?.includes('domain is not verified')) {
            console.warn('⚠️ [send-notification-email] Domínio não verificado no Resend. Email não enviado, mas retornando sucesso para não bloquear o fluxo.');
            return {
              success: true,
              pending: true,
              warning: 'Domínio não verificado no Resend. Verifique o domínio em resend.com/domains',
              errorData
            };
          }
          
          throw new Error(`Resend API error: ${resendResponse.status} - ${errorData?.message || resendResponse.statusText}`);
      }

      const result = await resendResponse.json();
        return { success: true, result, fromEmail, isRetry };
      };

      try {
        const emailResult = await trySendEmail(customDomain);
        
        if (emailResult.pending) {
          // Domínio não verificado - retornar sucesso com aviso
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Email não enviado - domínio não verificado no Resend',
              pending: true,
              warning: emailResult.warning,
              errorData: emailResult.errorData
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        console.log('✅ [send-notification-email] Email enviado com sucesso:', {
          id: emailResult.result?.id,
          from: emailResult.fromEmail,
          to,
          usedDefaultDomain: emailResult.isRetry
        });

      return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email enviado', 
            id: emailResult.result?.id,
            from: emailResult.fromEmail,
            usedDefaultDomain: emailResult.isRetry
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (emailError: any) {
        console.error('❌ [send-notification-email] Erro ao enviar email:', emailError);
        // Retornar sucesso para não bloquear o fluxo, mas logar o erro
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email não enviado (erro não crítico)',
            pending: true,
            error: emailError.message || 'Erro desconhecido'
          }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      }

    } else {
      // Resend não configurado - registrar no banco para envio manual
      console.log('RESEND_API_KEY não configurada. Registrando email para envio manual.');

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Tentar registrar no banco, mas não falhar se a tabela não existir
      try {
        const { error: insertError } = await supabase.from('pending_emails').insert({
          to_email: to,
          subject: emailContent.subject,
          html_content: emailContent.html,
          type: type,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.warn('Não foi possível registrar email pendente (tabela pode não existir):', insertError);
        }
      } catch (dbError) {
        console.warn('Erro ao registrar email pendente:', dbError);
      }

      // Retornar sucesso mesmo sem Resend configurado (não é erro crítico)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email registrado para envio manual (RESEND_API_KEY não configurada)',
          pending: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

  } catch (error: any) {
    console.error('Erro ao processar email:', error);
    
    // SEMPRE retornar sucesso para não bloquear o fluxo de aprovação
    // O email não é crítico para a operação principal
    console.warn('Erro no envio de email, mas retornando sucesso para não bloquear o fluxo:', error.message || error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email não enviado (erro não crítico)',
        pending: true,
        error: error.message || 'Erro desconhecido'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
