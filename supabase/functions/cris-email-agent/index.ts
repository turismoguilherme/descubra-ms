/**
 * Edge Function: Cris Email Agent
 * Agente IA autônomo que responde emails automaticamente como "Cris"
 * 
 * Funcionalidades:
 * - Analisa emails recebidos
 * - Busca contexto do usuário
 * - Gera resposta personalizada com Gemini
 * - Envia resposta automaticamente (se confiança > 80%)
 * - Encaminha para humano se confiança < 80%
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface EmailToProcess {
  id: string;
  from_address: string;
  to_address: string;
  subject_or_topic: string;
  body: string;
  timestamp: string;
}

interface UserContext {
  user_email: string;
  user_name?: string;
  user_type?: string;
  conversation_history: any[];
  preferences: any;
  total_interactions: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 [Cris Email Agent] Iniciando processamento de emails...');

    // Buscar emails recebidos que ainda não foram respondidos
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('direction', 'in')
      .eq('channel', 'email')
      .eq('status', 'received')
      .is('ai_generated_response', null)
      .order('timestamp', { ascending: true })
      .limit(10); // Processar até 10 emails por execução

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ [Cris Email Agent] Nenhum email pendente para processar');
      return new Response(
        JSON.stringify({ message: 'Nenhum email pendente', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`📧 [Cris Email Agent] Encontrados ${pendingEmails.length} emails para processar`);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('❌ [Cris Email Agent] GEMINI_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const processedEmails: any[] = [];
    const skippedEmails: any[] = [];

    for (const email of pendingEmails) {
      try {
        console.log(`📨 [Cris Email Agent] Processando email ID: ${email.id} de ${email.from_address}`);

        // Buscar contexto do usuário
        const userContext = await getUserContext(supabase, email.from_address);

        // Gerar resposta com Gemini
        const response = await generateEmailResponse(
          GEMINI_API_KEY,
          email,
          userContext
        );

        if (!response.success || !response.text || response.confidence === undefined) {
          console.error(`❌ [Cris Email Agent] Erro ao gerar resposta para email ${email.id}:`, response.error);
          skippedEmails.push({ email_id: email.id, reason: response.error || 'Resposta incompleta' });
          continue;
        }

        const confidence = response.confidence;
        const responseText = response.text;

        // Salvar resposta gerada
        const { data: savedResponse, error: saveError } = await supabase
          .from('ai_email_responses')
          .insert({
            original_email_id: email.id,
            response_text: responseText,
            confidence_score: confidence,
            was_sent: confidence >= 0.8, // Enviar automaticamente se confiança >= 80%
            sent_at: confidence >= 0.8 ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (saveError) {
          console.error(`❌ [Cris Email Agent] Erro ao salvar resposta:`, saveError);
          skippedEmails.push({ email_id: email.id, reason: 'Erro ao salvar resposta' });
          continue;
        }

        // Se confiança >= 80%, enviar resposta automaticamente
        if (confidence >= 0.8 && savedResponse) {
          console.log(`✅ [Cris Email Agent] Enviando resposta automaticamente (confiança: ${(confidence * 100).toFixed(0)}%)`);

          // Enviar email via Edge Function
          const emailResponse = await supabase.functions.invoke('send-notification-email', {
            body: {
              type: 'partner_notification', // Usar template genérico
              to: email.from_address,
              data: {
                userName: userContext.user_name || 'Prezado(a)',
                message: responseText,
                subject: `Re: ${email.subject_or_topic}`,
              },
            },
          });

          if (emailResponse.error) {
            console.error(`❌ [Cris Email Agent] Erro ao enviar email:`, emailResponse.error);
            // Atualizar resposta como não enviada
            await supabase
              .from('ai_email_responses')
              .update({ was_sent: false, rejection_reason: 'Erro ao enviar email' })
              .eq('id', savedResponse.id);
          } else {
            // Marcar email original como respondido
            await supabase
              .from('communication_logs')
              .update({ 
                ai_generated_response: true,
                status: 'sent'
              })
              .eq('id', email.id);

            // Atualizar contexto do usuário
            await updateUserContext(supabase, email.from_address, {
              last_email: email.subject_or_topic,
              last_response: responseText.substring(0, 100),
            });

            console.log(`✅ [Cris Email Agent] Resposta enviada com sucesso para ${email.from_address}`);
          }
        } else {
          console.log(`⚠️ [Cris Email Agent] Resposta gerada mas precisa revisão humana (confiança: ${(confidence * 100).toFixed(0)}%)`);
          
          // Marcar email como processado mas aguardando revisão
          await supabase
            .from('communication_logs')
            .update({ 
              ai_generated_response: true,
              status: 'processing'
            })
            .eq('id', email.id);
        }

        processedEmails.push({
          email_id: email.id,
          from: email.from_address,
          confidence: confidence,
          sent: confidence >= 0.8,
        });

      } catch (error: any) {
        console.error(`❌ [Cris Email Agent] Erro ao processar email ${email.id}:`, error);
        skippedEmails.push({ email_id: email.id, reason: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processados ${processedEmails.length} emails`,
        processed: processedEmails,
        skipped: skippedEmails,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('❌ [Cris Email Agent] Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

/**
 * Busca contexto do usuário no banco
 */
async function getUserContext(supabase: any, userEmail: string): Promise<UserContext> {
  try {
    // Buscar contexto existente
    const { data: context } = await supabase
      .from('ai_email_context')
      .select('*')
      .eq('user_email', userEmail)
      .maybeSingle();

    if (context) {
      return {
        user_email: context.user_email,
        user_name: context.user_name,
        user_type: context.user_type,
        conversation_history: context.conversation_history || [],
        preferences: context.preferences || {},
        total_interactions: context.total_interactions || 0,
      };
    }

    // Buscar informações do usuário no banco
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('email', userEmail)
      .maybeSingle();

    // Criar contexto inicial
    const newContext: UserContext = {
      user_email: userEmail,
      user_name: profile?.name,
      user_type: profile?.role || 'user',
      conversation_history: [],
      preferences: {},
      total_interactions: 0,
    };

    // Salvar contexto inicial
    await supabase
      .from('ai_email_context')
      .upsert({
        user_email: userEmail,
        user_name: profile?.name,
        user_type: profile?.role || 'user',
        conversation_history: [],
        preferences: {},
        total_interactions: 0,
        last_interaction_at: new Date().toISOString(),
      }, {
        onConflict: 'user_email'
      });

    return newContext;
  } catch (error: any) {
    console.error('❌ [Cris Email Agent] Erro ao buscar contexto:', error);
    // Retornar contexto padrão em caso de erro
    return {
      user_email: userEmail,
      user_name: undefined,
      user_type: 'user',
      conversation_history: [],
      preferences: {},
      total_interactions: 0,
    };
  }
}

/**
 * Atualiza contexto do usuário após interação
 */
async function updateUserContext(supabase: any, userEmail: string, interaction: any) {
  try {
    await supabase
      .from('ai_email_context')
      .update({
        last_interaction_at: new Date().toISOString(),
        total_interactions: supabase.raw('total_interactions + 1'),
        conversation_history: supabase.raw(`
          COALESCE(conversation_history, '[]'::jsonb) || 
          jsonb_build_array(jsonb_build_object(
            'timestamp', now(),
            'interaction', ${JSON.stringify(interaction)}
          ))
        `),
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', userEmail);
  } catch (error: any) {
    console.error('❌ [Cris Email Agent] Erro ao atualizar contexto:', error);
  }
}

/**
 * Gera resposta de email usando Gemini
 */
async function generateEmailResponse(
  geminiApiKey: string,
  email: EmailToProcess,
  context: UserContext
): Promise<{ success: boolean; text?: string; confidence?: number; error?: string }> {
  try {
    const prompt = `Você é Cris, assistente virtual feminina do Descubra MS, uma plataforma de turismo do Mato Grosso do Sul.

CARACTERÍSTICAS:
- Profissional mas amigável
- Brasileira, usa português natural e coloquial quando apropriado
- Prestativa e solícita
- Usa emojis moderadamente (apenas quando apropriado, máximo 2 por resposta)
- Assina sempre como "Cris - Equipe Descubra MS"
- Tom: profissional mas caloroso, como uma colega de trabalho prestativa

CONTEXTO DO USUÁRIO:
- Nome: ${context.user_name || 'Prezado(a)'}
- Email: ${context.user_email}
- Tipo: ${context.user_type || 'usuário'}
- Interações anteriores: ${context.total_interactions}

EMAIL RECEBIDO:
Assunto: ${email.subject_or_topic}
De: ${email.from_address}
Conteúdo:
${email.body.substring(0, 1000)}${email.body.length > 1000 ? '...' : ''}

TAREFA:
Responda o email de forma natural, como uma pessoa real, não robótica. 
Seja útil, prestativa e mantenha o tom profissional mas amigável.
Se não souber algo, seja honesta e ofereça ajuda para encontrar a resposta.
Mantenha a resposta concisa (máximo 300 palavras).

IMPORTANTE:
- Se o email for spam, ofensivo ou inadequado, responda educadamente mas brevemente
- Se for uma dúvida sobre a plataforma, seja detalhada e útil
- Se for um agradecimento, seja calorosa mas profissional
- Se for uma reclamação, seja empática e ofereça soluções

RESPONDA APENAS O CORPO DO EMAIL (sem assunto, sem cabeçalhos):
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      throw new Error('Resposta vazia do Gemini');
    }

    // Calcular confiança baseado em fatores:
    // - Tamanho da resposta (respostas muito curtas ou muito longas têm menor confiança)
    // - Presença de palavras-chave de incerteza
    // - Qualidade geral da resposta
    let confidence = 0.85; // Base

    const uncertaintyWords = ['não tenho certeza', 'não sei', 'talvez', 'provavelmente', 'acho que'];
    const hasUncertainty = uncertaintyWords.some(word => generatedText.toLowerCase().includes(word));
    if (hasUncertainty) confidence -= 0.15;

    const wordCount = generatedText.split(/\s+/).length;
    if (wordCount < 20) confidence -= 0.1; // Resposta muito curta
    if (wordCount > 400) confidence -= 0.05; // Resposta muito longa

    // Verificar se resposta parece completa
    const hasGreeting = /olá|oi|bom dia|boa tarde|boa noite/i.test(generatedText);
    const hasClosing = /atenciosamente|abraço|até|obrigad/i.test(generatedText);
    if (hasGreeting && hasClosing) confidence += 0.05;

    confidence = Math.max(0.5, Math.min(0.95, confidence)); // Manter entre 50% e 95%

    // Adicionar assinatura se não tiver
    let finalText = generatedText.trim();
    if (!finalText.includes('Cris')) {
      finalText += '\n\nAtenciosamente,\nCris - Equipe Descubra MS';
    }

    return {
      success: true,
      text: finalText,
      confidence: Math.round(confidence * 100) / 100,
    };

  } catch (error: any) {
    console.error('❌ [Cris Email Agent] Erro ao gerar resposta:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao gerar resposta',
    };
  }
}

