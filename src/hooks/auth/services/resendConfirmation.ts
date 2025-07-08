
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const resendConfirmationEmailService = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });

    if (error) {
      console.error("❌ Erro ao reenviar email:", error);
      showToast("Erro", "Não foi possível reenviar o e-mail. Tente novamente mais tarde.", "destructive");
      return { error };
    }
    
    showToast("E-mail reenviado!", "Verifique sua caixa de entrada.", "default");
    return { data, error: null };
  } catch (error: any) {
    console.error("❌ Erro catch ao reenviar email:", error);
    showToast("Erro", "Ocorreu um erro inesperado.", "destructive");
    return { error };
  }
};
