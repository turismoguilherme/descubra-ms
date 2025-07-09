// DEPRECATED: Admin user seeding utilities
// WARNING: This functionality is deprecated for security reasons
// Admin users should be created through secure channels only
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";

export interface AdminSeedData {
  email: string;
  password: string;
  fullName: string;
}

/**
 * DEPRECATED: Create initial admin user using Supabase Auth
 * WARNING: This function is deprecated for security reasons
 * Admin users should be created through secure administrative channels only
 */
export async function createInitialAdminUser(data: AdminSeedData): Promise<boolean> {
  try {
    // Security check: Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      console.error("🚨 Admin seeding is disabled in production for security reasons");
      toast.error("Criação de admin não permitida em produção");
      
      // Log security violation
      await enhancedSecurityService.logSecurityEvent({
        action: 'admin_seeding_production_attempt',
        success: false,
        error_message: 'Attempted admin seeding in production environment',
        metadata: { environment: 'production', blocked: true }
      });
      
      return false;
    }

    console.log("🔧 Creating initial admin user... (DEVELOPMENT ONLY)");

    // Enhanced security checks
    const { data: existingAdmins, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .in('role', ['admin', 'tech'])
      .limit(1);

    if (checkError) {
      console.error("Error checking existing admins:", checkError);
      toast.error("Erro ao verificar administradores existentes");
      return false;
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log("⚠️ Admin users already exist. Skipping creation.");
      toast.info("Usuários administradores já existem no sistema");
      return false;
    }

    // Create the admin user via Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: data.fullName,
          user_type: 'administrator'
        }
      }
    });

    if (signUpError) {
      console.error("Error creating admin user:", signUpError);
      toast.error(`Erro ao criar usuário admin: ${signUpError.message}`);
      return false;
    }

    if (!authData.user) {
      toast.error("Erro: Usuário não foi criado corretamente");
      return false;
    }

    console.log("✅ Admin user created via Auth:", authData.user.id);

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        full_name: data.fullName,
        display_name: data.fullName,
        user_type: 'administrator'
      });

    if (profileError) {
      console.error("Error creating admin profile:", profileError);
      toast.error("Erro ao criar perfil do administrador");
      return false;
    }

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin',
        created_by: authData.user.id
      });

    if (roleError) {
      console.error("Error assigning admin role:", roleError);
      toast.error("Erro ao atribuir função de administrador");
      return false;
    }

    console.log("✅ Initial admin user created successfully");
    toast.success("Usuário administrador inicial criado com sucesso!");
    
    return true;

  } catch (error) {
    console.error("Unexpected error creating admin user:", error);
    toast.error("Erro inesperado ao criar usuário administrador");
    return false;
  }
}

/**
 * Check if the system needs an initial admin user
 */
export async function needsInitialAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .in('role', ['admin', 'tech'])
      .limit(1);

    if (error) {
      console.error("Error checking for admin users:", error);
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error("Error in needsInitialAdmin:", error);
    return false;
  }
}