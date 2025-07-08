
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signUpService = async (email: string, password: string, fullName: string) => {
  try {
    console.log("📝 Iniciando cadastro para:", email);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl
      },
    });

    if (error) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login.";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Email inválido. Verifique o formato do email.";
      } else if (error.message.includes("Password should be")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      }
      
      showToast("Erro no cadastro", errorMessage, "destructive");
      return { error, user: null, session: null };
    }

    if (data.user && !data.session) {
      console.log("📝 Usuário criado, aguardando confirmação de email");
      showToast(
        "Conta criada!", 
        "Verifique seu email para confirmar a conta.",
        "default"
      );
    } else if (data.user && data.session) {
      console.log("📝 Usuário criado e logado automaticamente");
      showToast("Bem-vindo!", "Sua conta foi criada com sucesso!");
    }

    return { error: null, user: data.user, session: data.session };
  } catch (unexpectedError) {
    console.error("📝 Erro inesperado no cadastro:", unexpectedError);
    showToast(
      "Erro inesperado", 
      "Ocorreu um erro durante o cadastro. Tente novamente.",
      "destructive"
    );
    return { error: unexpectedError, user: null, session: null };
  }
};
