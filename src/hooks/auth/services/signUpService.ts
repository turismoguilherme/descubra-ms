
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signUpService = async (email: string, password: string, fullName: string) => {
  try {
    console.log("📝 REGISTRO: ========== INÍCIO CADASTRO ==========");
    console.log("📝 REGISTRO: Email:", email);
    console.log("📝 REGISTRO: Origin atual:", window.location.origin);
    console.log("📝 REGISTRO: Hostname completo:", window.location.hostname);
    console.log("📝 REGISTRO: Pathname:", window.location.pathname);
    
    // IMPORTANTE: Configurar emailRedirectTo baseado no domínio atual
    // Isso garante que o link de confirmação no email redirecione para o domínio correto
    const hostname = window.location.hostname.toLowerCase();
    let redirectUrl: string;
    
    if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
      // Se está em descubrams.com, redirecionar para /descubrams após confirmação
      redirectUrl = 'https://descubrams.com/descubrams';
      console.log("📝 REGISTRO: ✅ Detectado Descubra MS - configurando emailRedirectTo para:", redirectUrl);
    } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
      // Se está em viajartur.com, redirecionar para / após confirmação
      redirectUrl = 'https://www.viajartur.com/';
      console.log("📝 REGISTRO: ✅ Detectado ViaJAR - configurando emailRedirectTo para:", redirectUrl);
    } else {
      // Fallback: usar origin atual
      redirectUrl = `${window.location.origin}/`;
      console.log("📝 REGISTRO: ⚠️ Domínio não reconhecido - usando fallback:", redirectUrl);
    }
    
    console.log("📝 REGISTRO: 📋 RESUMO DA CONFIGURAÇÃO:");
    console.log("📝 REGISTRO:   - Hostname detectado:", hostname);
    console.log("📝 REGISTRO:   - Email redirect URL:", redirectUrl);
    
    console.log("📝 REGISTRO: 📤 Enviando requisição de cadastro para Supabase...");
    
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

    console.log("📝 REGISTRO: 📥 Resposta do Supabase:");
    console.log("📝 REGISTRO:   - Has user:", !!data?.user);
    console.log("📝 REGISTRO:   - Has session:", !!data?.session);
    console.log("📝 REGISTRO:   - Has error:", !!error);

    if (error) {
      console.error("📝 REGISTRO: ❌ Erro no cadastro:", error.message);
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
