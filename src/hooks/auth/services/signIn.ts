import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signInService = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'login_failure',
        p_success: false,
        p_error_message: error.message,
        p_metadata: { email, source: 'signInService' }
      });
      let errorMessage = error.message;
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos.";
      }
      
      showToast("Erro no login", errorMessage, "destructive");
    }

    return { error };
  } catch (error: any) {
    await supabase.rpc('log_security_event', {
      p_user_id: null,
      p_action: 'login_exception',
      p_success: false,
      p_error_message: error.message,
      p_metadata: { email, source: 'signInService_catch' }
    });
    console.error("❌ Erro catch no login:", error);
    showToast("Erro no login", error.message || "Erro inesperado", "destructive");
    return { error };
  }
};
