
import { supabase } from "@/integrations/supabase/client";
import { showToast } from "../authToast";

export const signInWithProviderService = async (provider: 'google' | 'facebook') => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        },
        skipBrowserRedirect: false
      }
    });

    if (error) {
      await supabase.rpc('log_security_event', {
        event_action: 'oauth_login_failure',
        event_success: false,
        event_error_message: error.message,
      });
      let errorMessage = `Erro no login com ${provider}`;
      
      if (error.message.includes('not enabled') || error.message.includes('disabled')) {
        errorMessage = `Login com ${provider} não habilitado no Supabase.`;
      } else if (error.message.includes('popup')) {
        errorMessage = "Pop-up bloqueado. Permita pop-ups e tente novamente.";
      } else if (error.message.includes('redirect')) {
        errorMessage = "Erro de redirecionamento. Verifique as configurações no Supabase.";
      }
      
      showToast("Erro no login social", errorMessage, "destructive");
      return { error };
    }

    return { error: null };

  } catch (error: any) {
    await supabase.rpc('log_security_event', {
      event_action: 'oauth_login_exception',
      event_success: false,
      event_error_message: error.message,
      
    });
    console.error(`❌ Erro catch OAuth ${provider}:`, error);
    showToast("Erro no login", "Erro inesperado. Tente novamente.", "destructive");
    return { error };
  }
};
