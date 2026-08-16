
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signOutService = async () => {
  try {
    console.log("🚪 LOGOUT: Fazendo logout...");
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("🚪 LOGOUT: Erro:", error);
      showToast("Erro ao sair", error.message, "destructive");
      throw error;
    }
    
    console.log("🚪 LOGOUT: Logout realizado com sucesso");
    showToast("Até logo!", "Você foi desconectado com sucesso.");
    
  } catch (unexpectedError) {
    console.error("🚪 LOGOUT: Erro inesperado:", unexpectedError);
    showToast(
      "Erro inesperado", 
      "Ocorreu um erro durante o logout.",
      "destructive"
    );
    throw unexpectedError;
  }
};
