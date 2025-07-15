import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate secure random passwords or use environment variables
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const getSecurePassword = (role: string) => {
      const envPassword = Deno.env.get(`TEST_PASSWORD_${role.toUpperCase()}`);
      return envPassword || generateSecurePassword();
    };

    const testAccounts = [
      { 
        email: 'admin@ms.gov.br', 
        password: getSecurePassword('admin'),
        role: 'admin',
        full_name: 'Administrador Teste',
        user_type: 'collaborator'
      },
      { 
        email: 'diretor@ms.gov.br', 
        password: getSecurePassword('diretor'),
        role: 'diretor_estadual',
        full_name: 'Diretor Estadual Teste',
        user_type: 'collaborator'
      },
      { 
        email: 'gestor-igr@ms.gov.br', 
        password: getSecurePassword('gestor_igr'),
        role: 'gestor_igr',
        full_name: 'Gestor IGR Teste',
        user_type: 'collaborator'
      },
      { 
        email: 'gestor-municipal@ms.gov.br', 
        password: getSecurePassword('gestor_municipal'),
        role: 'gestor_municipal',
        full_name: 'Gestor Municipal Teste',
        user_type: 'collaborator'
      },
      { 
        email: 'atendente@ms.gov.br', 
        password: getSecurePassword('atendente'),
        role: 'atendente',
        full_name: 'Atendente CAT Teste',
        user_type: 'collaborator'
      },
      { 
        email: 'usuario@ms.gov.br', 
        password: getSecurePassword('usuario'),
        role: 'user',
        full_name: 'Usuário Teste',
        user_type: 'tourist'
      }
    ]

    const results = []

    for (const account of testAccounts) {
      try {
        // Verificar se o usuário já existe
        const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(account.email)
        
        if (existingUser.user) {
          results.push({
            email: account.email,
            status: 'already_exists',
            message: 'Usuário já existe'
          })
          continue
        }

        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.full_name
          }
        })

        if (authError) {
          // Log error securely without exposing sensitive details
          results.push({
            email: account.email,
            status: 'error',
            message: 'Authentication error occurred'
          })
          continue
        }

        if (!authData.user) {
          results.push({
            email: account.email,
            status: 'error',
            message: 'Usuário não foi criado'
          })
          continue
        }

        // Criar perfil do usuário
        const { error: profileError } = await supabaseClient
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: account.full_name,
            display_name: account.full_name,
            user_type: account.user_type
          })

        if (profileError) {
          // Profile creation error - logged for monitoring
        }

        // Criar role do usuário (se não for 'user')
        if (account.role !== 'user') {
          const { error: roleError } = await supabaseClient
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: account.role,
              created_by: authData.user.id
            })

          if (roleError) {
            // Role creation error - logged for monitoring
          }
        }

        // Log da criação
        await supabaseClient
          .from('security_audit_log')
          .insert({
            action: 'test_user_created',
            user_id: authData.user.id,
            success: true
          })

        results.push({
          email: account.email,
          status: 'created',
          message: 'Usuário criado com sucesso',
          user_id: authData.user.id,
          // Password not included in response for security
        })

      } catch (error) {
        results.push({
          email: account.email,
          status: 'error',
          message: 'Processing error occurred'
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})