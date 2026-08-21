import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, guardResponse, serviceClient, hasInternalSecret } from '../_shared/authGuard.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'no-reply@overflow-one.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, body, relatedTicketId, aiGenerated } = await req.json();

    if (typeof to !== 'string' || typeof subject !== 'string' || typeof body !== 'string' ||
        !EMAIL_RE.test(to.trim()) || !subject.trim() || !body.trim()) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios inválidos: to, subject, body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const recipient = to.trim().toLowerCase();

    // Anti-relay: chamada interna, admin (qualquer destinatário) ou usuário
    // autenticado enviando somente para o próprio e-mail.
    if (!hasInternalSecret(req)) {
      const auth = await requireUser(req);
      if (!auth.ok) return guardResponse(auth, corsHeaders);
      const ownEmail = (auth.user.email ?? '').trim().toLowerCase();
      if (!auth.isAdmin && recipient !== ownEmail) {
        return new Response(
          JSON.stringify({ error: 'Você só pode enviar e-mails para o seu próprio endereço.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 },
        );
      }
    }

    if (!SENDGRID_API_KEY) {
      console.error('send-email-via-gateway: SENDGRID_API_KEY não configurada');
      return new Response(JSON.stringify({ error: 'Serviço de e-mail indisponível' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipient }] }],
        from: { email: SENDER_EMAIL },
        subject: subject.slice(0, 200),
        content: [{ type: 'text/plain', value: body }],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('send-email-via-gateway: falha SendGrid', sendGridResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

    const supabaseAdmin = serviceClient();

    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'out',
      channel: 'email',
      from_address: SENDER_EMAIL,
      to_address: recipient,
      subject_or_topic: subject,
      body: body,
      status: 'sent',
      related_ticket_id: relatedTicketId || null,
      ai_generated_response: aiGenerated || false,
    });

    if (logError) {
      console.error('Erro ao registrar log de e-mail:', logError.message);
    }

    return new Response(JSON.stringify({ message: 'E-mail enviado com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function send-email-via-gateway:', error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
