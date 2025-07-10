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
 * DEPRECATED AND DISABLED: Create initial admin user using Supabase Auth
 * WARNING: This function is completely disabled for security reasons
 * Admin users must be created through secure database operations only
 */
export async function createInitialAdminUser(data: AdminSeedData): Promise<boolean> {
  // SECURITY: Function completely disabled
  console.error("🚨 Admin seeding is permanently disabled for security reasons");
  toast.error("Criação de admin desabilitada por segurança");
  
  // Log all attempts
  await enhancedSecurityService.logSecurityEvent({
    action: 'admin_seeding_attempt_blocked',
    success: false,
    error_message: 'Admin seeding function called but blocked for security',
    metadata: { blocked: true, reason: 'security_policy' }
  });
  
  return false;
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