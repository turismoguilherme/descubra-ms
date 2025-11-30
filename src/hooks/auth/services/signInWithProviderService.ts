
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signInWithProviderService = async (provider: 'google' | 'facebook') => {
  try {
    console.log(`🔗 SOCIAL LOGIN: Iniciando login com ${provider.toUpperCase()}`);
    
    // Configurar URL de redirecionamento baseada na origem atual
    // Funciona automaticamente em qualquer domínio (localhost, vercel, viajartur.com)
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    console.log("🔗 SOCIAL LOGIN: URL de redirecionamento:", redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    console.log(`🔗 SOCIAL LOGIN: Resposta do ${provider.toUpperCase()}:`, { data, error });

    if (error) {
      let errorMessage = `Erro ao fazer login com ${provider}. Tente novamente.`;
      
      // Tratar erros específicos de OAuth
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Credenciais inválidas. Tente novamente.";
      } else if (error.message.includes("Provider not found")) {
        errorMessage = `${provider} não está configurado. Entre em contato com o suporte.`;
      } else if (error.message.includes("OAuth")) {
        errorMessage = `Erro na autenticação com ${provider}. Verifique se permitiu o acesso.`;
      }
      
      showToast(`Erro no login ${provider}`, errorMessage, "destructive");
      return { error };
    }

    console.log(`🔗 SOCIAL LOGIN: Redirecionando para ${provider}...`);
    // No OAuth flow, o redirecionamento acontece automaticamente
    // O usuário será redirecionado para o provider e depois de volta para nossa app
    
    return { error: null };
  } catch (unexpectedError) {
    console.error(`🔗 SOCIAL LOGIN: Erro inesperado no ${provider}:`, unexpectedError);
    showToast(
      "Erro inesperado", 
      `Ocorreu um erro durante o login com ${provider}. Tente novamente.`,
      "destructive"
    );
    return { error: unexpectedError };
  }
};
