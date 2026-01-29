
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signOutService = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    showToast("Logout realizado", "Você saiu da sua conta.");
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("❌ Erro no logout:", err);
    showToast("Erro no logout", err.message || "Erro inesperado", "destructive");
  }
};
