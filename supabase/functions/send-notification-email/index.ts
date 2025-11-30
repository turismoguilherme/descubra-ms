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
  | 'welcome';

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
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json() as EmailRequest;

    if (!type || !to || !templates[type]) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: type and to are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const template = templates[type];
    const emailContent = {
      to,
      subject: template.subject,
      html: template.html(data),
    };

    // Verificar se Resend está configurado
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      // Enviar via Resend
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Descubra MS <noreply@descubramatogrossodosul.com.br>',
          to: [to],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error('Erro Resend:', errorData);
        throw new Error('Falha ao enviar email via Resend');
      }

      const result = await resendResponse.json();
      console.log('Email enviado com sucesso:', result);

      return new Response(
        JSON.stringify({ success: true, message: 'Email enviado', id: result.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } else {
      // Resend não configurado - registrar no banco para envio manual
      console.log('RESEND_API_KEY não configurada. Registrando email para envio manual.');

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Criar tabela de emails pendentes se não existir (será criada via migration)
      await supabase.from('pending_emails').insert({
        to_email: to,
        subject: emailContent.subject,
        html_content: emailContent.html,
        type: type,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

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
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao enviar email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

