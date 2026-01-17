
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signInWithProviderService = async (provider: 'google' | 'facebook') => {
  try {
    console.log(`🔗 SOCIAL LOGIN: ========== INÍCIO LOGIN COM ${provider.toUpperCase()} ==========`);
    console.log(`🔗 SOCIAL LOGIN: Origin atual:`, window.location.origin);
    console.log(`🔗 SOCIAL LOGIN: Hostname completo:`, window.location.hostname);
    console.log(`🔗 SOCIAL LOGIN: Pathname:`, window.location.pathname);
    
    // Configurar URL de redirecionamento baseada no domínio atual
    const hostname = window.location.hostname.toLowerCase();
    let callbackPath: string;
    
    // Se está em descubrams.com, usar /ms para callback OAuth
    // Se está em viajartur.com, usar /auth/callback
    if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
      callbackPath = '/ms';
      console.log("🔗 SOCIAL LOGIN: ✅ Detectado Descubra MS - usando callback /ms");
    } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
      callbackPath = '/auth/callback';
      console.log("🔗 SOCIAL LOGIN: ✅ Detectado ViaJAR - usando callback /auth/callback");
    } else {
      // Fallback: usar /auth/callback para outros contextos
      callbackPath = '/auth/callback';
      console.log("🔗 SOCIAL LOGIN: ⚠️ Domínio não reconhecido - usando callback fallback /auth/callback");
    }
    
    // IMPORTANTE: Garantir que o redirectTo seja ABSOLUTO e correto
    // LOCALHOST: Sempre manter no localhost (nunca redirecionar para produção)
    let redirectUrl: string;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.0.') || hostname.includes('local');
    
    if (isLocal) {
      // LOCALHOST: usar origin atual (mantém no localhost)
      redirectUrl = `${window.location.origin}${callbackPath}`;
      console.log("🔗 SOCIAL LOGIN: 🏠 LOCALHOST detectado - mantendo redirectTo no localhost:", redirectUrl);
    } else if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
      // FORÇAR absoluto para descobrams.com
      redirectUrl = 'https://descubrams.com/ms';
      console.log("🔗 SOCIAL LOGIN: 🎯 Configurando redirectTo ABSOLUTO para Descubra MS:", redirectUrl);
    } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
      // FORÇAR absoluto para viajartur.com
      redirectUrl = 'https://www.viajartur.com/auth/callback';
      console.log("🔗 SOCIAL LOGIN: 🎯 Configurando redirectTo ABSOLUTO para ViaJAR:", redirectUrl);
    } else {
      // Fallback: usar origin atual
      redirectUrl = `${window.location.origin}${callbackPath}`;
      console.log("🔗 SOCIAL LOGIN: ⚠️ Configurando redirectTo FALLBACK:", redirectUrl);
    }
    
    console.log("🔗 SOCIAL LOGIN: 📋 RESUMO DA CONFIGURAÇÃO:");
    console.log("🔗 SOCIAL LOGIN:   - Hostname detectado:", hostname);
    console.log("🔗 SOCIAL LOGIN:   - Callback path:", callbackPath);
    console.log("🔗 SOCIAL LOGIN:   - Redirect URL final:", redirectUrl);
    
    console.log(`🔗 SOCIAL LOGIN: 📤 Enviando requisição OAuth para Supabase...`);
    console.log(`🔗 SOCIAL LOGIN:   - Provider:`, provider);
    console.log(`🔗 SOCIAL LOGIN:   - redirectTo:`, redirectUrl);
    
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

    console.log(`🔗 SOCIAL LOGIN: 📥 Resposta do Supabase para ${provider.toUpperCase()}:`);
    console.log(`🔗 SOCIAL LOGIN:   - Has data:`, !!data);
    console.log(`🔗 SOCIAL LOGIN:   - Has error:`, !!error);
    if (error) {
      console.error(`🔗 SOCIAL LOGIN:   - Error message:`, error.message);
    }
    if (data?.url) {
      console.log(`🔗 SOCIAL LOGIN:   - OAuth URL:`, data.url);
    }

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
