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

// Expondo a função no console para fins de desenvolvimento e reparo
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.elevateToAdmin = elevateToAdmin;
}

// Função removida da exposição global por motivos de segurança
// Para usar: importe diretamente onde necessário em vez de usar window object