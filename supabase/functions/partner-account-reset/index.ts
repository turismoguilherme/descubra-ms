/**
 * Libera um e-mail para novo cadastro de parceiro.
 *
 * Regra: se o e-mail já tem conta de acesso, mas NÃO existe parceria
 * (ativa, pendente ou suspensa) e o usuário NÃO é da equipe Guatá Labs
 * nem admin/tech/master_admin, a conta antiga é removida do Auth para que
 * a pessoa possa se cadastrar novamente com uma senha nova.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });

const PROTECTED_ROLES = ['admin', 'tech', 'master_admin'];

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === 'string' ? body.email : '';
    const email = rawEmail.trim().toLowerCase();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
      return json({ error: 'E-mail inválido.' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );

    // 1. Existe parceria vinculada a esse e-mail? Então não liberamos nada.
    const { data: partners, error: partnerError } = await admin
      .from('institutional_partners')
      .select('id, status')
      .ilike('contact_email', email)
      .limit(1);

    if (partnerError) {
      console.error('Erro ao consultar parceiros:', partnerError.message);
      return json({ error: 'Não foi possível verificar o cadastro agora.' }, 500);
    }

    if (partners && partners.length > 0) {
      return json(
        {
          reset: false,
          reason: 'active_partner',
          message:
            'Já existe uma solicitação de parceria com este e-mail. Faça login na Área do Parceiro ou fale com a equipe Descubra MS.',
        },
        409,
      );
    }

    // 2. Localizar o usuário no Auth
    let userId: string | null = null;
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) {
        console.error('Erro ao listar usuários:', error.message);
        return json({ error: 'Não foi possível verificar a conta agora.' }, 500);
      }
      const found = data.users.find((u) => (u.email || '').toLowerCase() === email);
      if (found) userId = found.id;
      if (data.users.length < 200) break;
    }

    if (!userId) {
      // Nada a remover: o e-mail já está livre.
      return json({ reset: false, reason: 'no_account' });
    }

    // 3. Proteção: equipe Guatá Labs e administradores nunca são removidos
    const [{ data: employee }, { data: roles }] = await Promise.all([
      admin.from('viajar_employees').select('id').eq('user_id', userId).limit(1),
      admin.from('user_roles').select('role').eq('user_id', userId).in('role', PROTECTED_ROLES).limit(1),
    ]);

    if ((employee && employee.length > 0) || (roles && roles.length > 0)) {
      return json(
        {
          reset: false,
          reason: 'protected_account',
          message:
            'Este e-mail pertence a uma conta interna da plataforma. Faça login com ela ou use outro e-mail para o cadastro de parceiro.',
        },
        409,
      );
    }

    // 4. Remover a conta antiga
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Erro ao remover conta antiga:', deleteError.message);
      return json({ error: 'Não foi possível liberar este e-mail. Fale com a equipe Descubra MS.' }, 500);
    }

    console.log('Conta antiga removida para novo cadastro de parceiro.');
    return json({ reset: true });
  } catch (err) {
    console.error('Erro inesperado em partner-account-reset:', err instanceof Error ? err.message : err);
    return json({ error: 'Erro inesperado. Tente novamente.' }, 500);
  }
});
