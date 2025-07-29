import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Esta Edge Function seria configurada como um webhook no seu provedor de e-mail (ex: SendGrid)
serve(async (req) => {
  try {
    // SendGrid envia dados de e-mail em formato de formulário ou JSON, dependendo da configuração.
    // Para simplificar, assumiremos JSON. A implementação real pode precisar parsear form-data.
    const body = await req.json();

    // Exemplo de como SendGrid envia dados (simplificado)
    const fromAddress = body.from;
    const toAddress = body.to;
    const subject = body.subject;
    const emailBody = body.text || body.html; // Ou você pode escolher um ou outro

    if (!fromAddress || !toAddress || !subject || !emailBody) {
      console.error('Dados de webhook de e-mail incompletos:', body);
      return new Response(JSON.stringify({ error: 'Dados de webhook de e-mail incompletos.' }), {
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Registrar o e-mail recebido no log de comunicação
    const { error: logError } = await supabaseAdmin.from('communication_logs').insert({
      direction: 'in',
      channel: 'email',
      from_address: fromAddress,
      to_address: toAddress,
      subject_or_topic: subject,
      body: emailBody,
      status: 'received',
      // related_ticket_id e ai_generated_response seriam definidos por uma lógica de IA posterior
    });

    if (logError) {
      console.error('Erro ao registrar e-mail recebido no Supabase:', logError);
      return new Response(JSON.stringify({ error: 'Falha ao registrar e-mail.' }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'E-mail recebido e log registrado' }), {
      status: 200,
    });

  } catch (error) {
    console.error('Erro na Edge Function receive-email-webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}); 