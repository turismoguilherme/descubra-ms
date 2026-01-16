import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { getOAuthCallbackRedirectPath, isDescubraMSContext } from '@/utils/authRedirect';

/**
 * Componente para processar callback OAuth do Supabase
 * Processa o token do hash da URL antes de redirecionar
 */
export const OAuthCallback = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log('🔐 [OAuthCallback] ========== PROCESSANDO CALLBACK OAuth ==========');
      console.log('🔐 [OAuthCallback] URL completa:', window.location.href);
      console.log('🔐 [OAuthCallback] Hash:', window.location.hash);
      console.log('🔐 [OAuthCallback] Pathname:', window.location.pathname);

      try {
        // O Supabase deve processar automaticamente o token do hash
        // Mas vamos garantir que a sessão seja obtida
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🔐 [OAuthCallback] Sessão obtida:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: error ? error.message : null
        });

        if (error) {
          console.error('❌ [OAuthCallback] Erro ao obter sessão:', error);
          setStatus('error');
          // Usar função utilitária para redirecionar corretamente
          const loginPath = isDescubraMSContext() ? '/descubrams/login' : '/login';
          setTimeout(() => {
            navigate(loginPath, { replace: true });
          }, 2000);
          return;
        }

        if (session?.user) {
          console.log('✅ [OAuthCallback] Login OAuth bem-sucedido!');
          console.log('✅ [OAuthCallback] Usuário:', session.user.email);
          
          // Usar função utilitária para garantir redirecionamento correto
          const redirectPath = getOAuthCallbackRedirectPath();
          const isDescubraMS = isDescubraMSContext();

          console.log('🔄 [OAuthCallback] Domínio atual:', window.location.hostname);
          console.log('🔄 [OAuthCallback] É contexto Descubra MS:', isDescubraMS);
          console.log('🔄 [OAuthCallback] Redirecionando para:', redirectPath);

          setStatus('success');

          // Aguardar um pouco para garantir que o estado seja atualizado
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 500);
        } else {
          console.warn('⚠️ [OAuthCallback] Nenhuma sessão encontrada após callback');
          setStatus('error');
          // Usar função utilitária para redirecionar corretamente
          const loginPath = isDescubraMSContext() ? '/descubrams/login' : '/login';
          setTimeout(() => {
            navigate(loginPath, { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        console.error('❌ [OAuthCallback] Erro inesperado:', error);
        setStatus('error');
        // Usar função utilitária para redirecionar corretamente
        const loginPath = isDescubraMSContext() ? '/descubrams/login' : '/login';
        setTimeout(() => {
          navigate(loginPath, { replace: true });
        }, 2000);
      }
    };

    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Processando login...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-8 h-8 rounded-full bg-green-500 mx-auto flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
            <p className="text-muted-foreground">Login realizado com sucesso! Redirecionando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-8 h-8 rounded-full bg-red-500 mx-auto flex items-center justify-center">
              <span className="text-white text-xl">✗</span>
            </div>
            <p className="text-muted-foreground">Erro ao processar login. Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
};

