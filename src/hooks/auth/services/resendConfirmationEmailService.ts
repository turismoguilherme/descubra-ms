
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const resendConfirmationEmailService = async (email: string) => {
  try {
    console.log("📧 RESEND: Reenviando email de confirmação para:", email);
    
    // Configurar URL de redirecionamento correto
    const redirectUrl = `${window.location.origin}/`;
    console.log("📧 RESEND: URL de redirecionamento:", redirectUrl);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.error("📧 RESEND: Erro:", error);
      
      let errorMessage = "Erro ao reenviar email de confirmação.";
      if (error.message.includes("Email rate limit")) {
        errorMessage = "Aguarde alguns minutos antes de solicitar um novo email.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Email inválido.";
      }
      
      showToast("Erro ao reenviar email", errorMessage, "destructive");
      return { error };
    }

    console.log("📧 RESEND: Email reenviado com sucesso");
    showToast(
      "Email enviado!", 
      "Verifique sua caixa de entrada e spam.",
      "default"
    );
    
    return { error: null };
  } catch (unexpectedError) {
    console.error("📧 RESEND: Erro inesperado:", unexpectedError);
    showToast(
      "Erro inesperado", 
      "Ocorreu um erro ao reenviar o email.",
      "destructive"
    );
    return { error: unexpectedError };
  }
};
