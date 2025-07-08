
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signUpService = async (email: string, password: string, fullName: string) => {
  console.log("🔐 REGISTRO: Iniciando processo de registro para:", email);
  
  try {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          name: fullName
        }
      }
    });

    if (error) {
      console.error("❌ REGISTRO: Erro no registro:", error);
      
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login.";
      } else if (error.message.includes("Password should be")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message.includes("Unable to validate email")) {
        errorMessage = "Email inválido. Verifique o formato.";
      }

      showToast("Erro no Registro", errorMessage, "destructive");
      return { error, user: null, session: null };
    }

    if (data.user && !data.session) {
      console.log("📧 REGISTRO: Usuário criado, aguardando confirmação de email");
      showToast(
        "Conta criada com sucesso!", 
        "Verifique seu email para confirmar a conta antes de fazer login.",
        "default"
      );
    } else if (data.user && data.session) {
      console.log("✅ REGISTRO: Usuário criado e logado automaticamente");
      
      // Aguardar processamento do trigger
      console.log("⏳ REGISTRO: Aguardando processamento do perfil e role...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      showToast("Conta criada!", "Bem-vindo! Sua conta foi criada com sucesso.");
    }

    return { error: null, user: data.user, session: data.session };
  } catch (unexpectedError: any) {
    console.error("❌ REGISTRO: Erro inesperado:", unexpectedError);
    showToast("Erro Inesperado", "Ocorreu um erro inesperado. Tente novamente.", "destructive");
    return { error: unexpectedError, user: null, session: null };
  }
};
