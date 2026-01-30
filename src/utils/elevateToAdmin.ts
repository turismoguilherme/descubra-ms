import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorUtils";

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
      const errorMessage = getErrorMessage(error, 'Erro desconhecido ao elevar usuário');
      console.error("❌ Erro ao elevar usuário:", errorMessage);
      toast.error(`Erro ao elevar usuário: ${errorMessage}`);
      return false;
    }

    console.log("✅ Usuário elevado a admin com sucesso!");
    toast.success(`Usuário ${userEmail} elevado a admin com sucesso!`);
    return true;
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Erro crítico ao elevar usuário");
    console.error("❌ Erro crítico:", message);
    toast.error(message);
    return false;
  }
};

// SECURITY: Global exposure removed permanently for security reasons
// Function is no longer exposed to window object to prevent unauthorized access
// Use: Import directly where needed instead of using window object
// All admin elevation attempts are now logged and require proper authorization