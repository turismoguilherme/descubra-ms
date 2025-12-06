import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Assumindo que você terá as variáveis de ambiente para SendGrid
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'no-reply@overflow-one.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, body, relatedTicketId, aiGenerated } = await req.json();

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: to, subject, body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY não configurada.');
    }

    // Enviar e-mail via SendGrid API (exemplo, a implementação real pode variar)
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
        }],
        from: { email: SENDER_EMAIL },
        subject: subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      throw new Error(`Falha ao enviar e-mail via SendGrid: ${sendGridResponse.status} - ${errorText}`);
    }

    // Registrar o log de comunicação no Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'out',
      channel: 'email',
      from_address: SENDER_EMAIL,
      to_address: to,
      subject_or_topic: subject,
      body: body,
      status: 'sent',
      related_ticket_id: relatedTicketId || null,
      ai_generated_response: aiGenerated || false,
    });

    if (logError) {
      console.error('Erro ao registrar log de e-mail no Supabase:', logError);
      // A função deve continuar mesmo se o log falhar, mas é importante registrar o erro.
    }

    return new Response(JSON.stringify({ message: 'E-mail enviado com sucesso e log registrado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na Edge Function send-email-via-gateway:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 