
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const enhancedSignInService = async (email: string, password: string) => {
  console.log("🔐 Iniciando login para:", email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Erro no login:", error);
      
      let errorMessage = "Erro no login. Tente novamente.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos.";
      }

      showToast("Erro no Login", errorMessage, "destructive");
      return { error };
    }

    if (data.user) {
      console.log("✅ Login realizado com sucesso para:", data.user.email);
      
      // Log de segurança simplificado
      try {
        await supabase.rpc('log_security_event', {
          event_action: 'login_success',
          event_user_id: data.user.id,
          event_success: true
        });
      } catch (logError) {
        console.warn("⚠️ Erro ao registrar log:", logError);
      }
    }

    return { error: null };
  } catch (unexpectedError: unknown) {
    console.error("❌ Erro inesperado no login:", unexpectedError);
    showToast("Erro Inesperado", "Ocorreu um erro inesperado. Tente novamente.", "destructive");
    return { error: unexpectedError };
  }
};
