
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signOutService = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    showToast("Logout realizado", "Você saiu da sua conta.");
  } catch (error: any) {
    console.error("❌ Erro no logout:", error);
    showToast("Erro no logout", error.message || "Erro inesperado", "destructive");
  }
};
