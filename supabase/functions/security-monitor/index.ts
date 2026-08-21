import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  requireUser,
  requireAdmin,
  guardResponse,
  serviceClient,
} from "../_shared/authGuard.ts";

interface SecurityAlert {
  type: 'privilege_escalation' | 'suspicious_activity' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
}

const ALLOWED_TYPES = ['privilege_escalation', 'suspicious_activity', 'unauthorized_access'];
const ALLOWED_SEVERITIES = ['low', 'medium', 'high', 'critical'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = serviceClient();

    if (req.method === 'POST') {
      // Registro de alerta exige usuário autenticado; o autor vem do JWT
      const auth = await requireUser(req);
      if (!auth.ok) return guardResponse(auth, corsHeaders);

      const { alert }: { alert: SecurityAlert } = await req.json();

      if (
        !alert?.type || !alert?.severity || typeof alert?.description !== 'string' ||
        !ALLOWED_TYPES.includes(alert.type) ||
        !ALLOWED_SEVERITIES.includes(alert.severity)
      ) {
        return new Response(
          JSON.stringify({ error: 'Dados de alerta inválidos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const { error: logError } = await supabase
        .from('security_audit_log')
        .insert({
          action: `security_alert_${alert.type}`,
          success: false,
          error_message: alert.description.slice(0, 500),
          user_id: auth.user.id,
        });

      if (logError) {
        console.error('Failed to log security alert:', logError.message);
        return new Response(
          JSON.stringify({ error: 'Falha ao registrar alerta' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (alert.severity === 'critical') {
        console.log('🚨 CRITICAL SECURITY ALERT:', alert.type);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Security alert logged successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (req.method === 'GET') {
      // Leitura do log é restrita a administradores
      const auth = await requireAdmin(req);
      if (!auth.ok) return guardResponse(auth, corsHeaders);

      const { data: alerts, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .like('action', 'security_alert_%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify({ alerts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Security monitor error:', error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
