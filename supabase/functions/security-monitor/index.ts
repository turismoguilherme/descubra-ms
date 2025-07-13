import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityAlert {
  type: 'privilege_escalation' | 'suspicious_activity' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { alert }: { alert: SecurityAlert } = await req.json();
      
      // Validate alert data
      if (!alert.type || !alert.severity || !alert.description) {
        throw new Error('Missing required alert fields');
      }

      // Log security alert
      const { error: logError } = await supabase
        .from('security_audit_log')
        .insert({
          action: `security_alert_${alert.type}`,
          success: false,
          error_message: alert.description,
          user_id: null // System alert
        });

      if (logError) {
        console.error('Failed to log security alert:', logError);
        throw logError;
      }

      // For critical alerts, check if immediate action is needed
      if (alert.severity === 'critical') {
        console.log('🚨 CRITICAL SECURITY ALERT:', alert);
        
        // Could implement additional alerting here:
        // - Send notification to admins
        // - Trigger automatic security measures
        // - Escalate to external monitoring systems
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Security alert logged successfully' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (req.method === 'GET') {
      // Get recent security alerts (for admin dashboard)
      const { data: alerts, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .like('action', 'security_alert_%')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ alerts }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Security monitor error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});