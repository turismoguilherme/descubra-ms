/**
 * Exclui um parceiro institucional e, quando seguro, o usuário do Auth.
 * Permite que o ex-parceiro se cadastre novamente com o mesmo e-mail.
 * NÃO remove do Auth se o usuário for ViajarTur (viajar_employees) ou admin/tech.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: missing Authorization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller } } = await supabaseClient.auth.getUser();
    if (!caller) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: roleRows } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .in('role', ['admin', 'tech', 'master_admin'])
      .limit(1);

    if (!roleRows?.length) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: only admins can delete partners' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const partnerId = body?.partnerId;
    if (!partnerId || typeof partnerId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Bad request: partnerId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('institutional_partners')
      .select('id, created_by, contact_email')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ error: 'Partner not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    let authUserId: string | null = partner.created_by ?? null;

    if (!authUserId && partner.contact_email) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const found = listData?.users?.find((u) => u.email?.toLowerCase() === (partner.contact_email as string).toLowerCase());
      if (found) authUserId = found.id;
    }

    let shouldDeleteAuth = !!authUserId;

    if (authUserId) {
      const { data: empRows } = await supabaseAdmin
        .from('viajar_employees')
        .select('user_id')
        .eq('user_id', authUserId)
        .limit(1);

      if (empRows?.length) {
        shouldDeleteAuth = false;
      } else {
        const { data: staffRoles } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', authUserId)
          .in('role', ['admin', 'tech', 'master_admin'])
          .limit(1);
        if (staffRoles?.length) shouldDeleteAuth = false;
      }
    }

    const { error: deletePartnerError } = await supabaseAdmin
      .from('institutional_partners')
      .delete()
      .eq('id', partnerId);

    if (deletePartnerError) {
      return new Response(
        JSON.stringify({ error: deletePartnerError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let authDeleted = false;
    if (shouldDeleteAuth && authUserId) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
      if (!deleteUserError) authDeleted = true;
    }

    return new Response(
      JSON.stringify({ success: true, authDeleted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
