import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Função para elevar um usuário a admin - uso interno apenas
 * Para usar: execute no console do navegador na página admin
 */
export const elevateToAdmin = async (userEmail: string): Promise<boolean> => {
  try {
    console.log(`🔧 Elevando usuário ${userEmail} para admin...`);
    
    const { data, error } = await supabase.rpc('elevate_to_admin', {
      user_email: userEmail
    });

    if (error) {
      console.error("❌ Erro ao elevar usuário:", error);
      toast.error(`Erro ao elevar usuário: ${error.message}`);
      return false;
    }

    console.log("✅ Usuário elevado a admin com sucesso!");
    toast.success(`Usuário ${userEmail} elevado a admin com sucesso!`);
    return true;
  } catch (error: any) {
    console.error("❌ Erro crítico:", error);
    toast.error("Erro crítico ao elevar usuário");
    return false;
  }
};

// SECURITY: Global exposure removed permanently for security reasons
// Function is no longer exposed to window object to prevent unauthorized access
// Use: Import directly where needed instead of using window object
// All admin elevation attempts are now logged and require proper authorization