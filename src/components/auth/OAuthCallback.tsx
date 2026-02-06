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

          console.log('✅ [OAuthCallback] ========== LOGIN OAUTH BEM-SUCEDIDO ==========');
          console.log('✅ [OAuthCallback] Usuário:', session.user.email);
          console.log('✅ [OAuthCallback] User ID:', session.user.id);
          
          const currentHostname = window.location.hostname.toLowerCase();
          const isLocal = currentHostname === 'localhost' || currentHostname === '127.0.0.1' || currentHostname.startsWith('192.168.') || currentHostname.startsWith('10.0.') || currentHostname.includes('local');
          
          console.log('🔄 [OAuthCallback] 📍 INFORMAÇÕES DO DOMÍNIO:');
          console.log('🔄 [OAuthCallback]   - Origin atual:', window.location.origin);
          console.log('🔄 [OAuthCallback]   - Hostname completo:', window.location.hostname);
          console.log('🔄 [OAuthCallback]   - Hostname normalizado:', currentHostname);
          console.log('🔄 [OAuthCallback]   - É localhost:', isLocal);
          console.log('🔄 [OAuthCallback]   - Pathname:', window.location.pathname);
          
          // IMPORTANTE: Garantir que o redirecionamento use o DOMÍNIO ATUAL
          // LOCALHOST: sempre manter no localhost (getOAuthCallbackRedirectPath já trata isso)
          // Não forçar redirecionamento para outro domínio - respeitar o domínio onde o usuário está
          let redirectPath = getOAuthCallbackRedirectPath();
          console.log('🔄 [OAuthCallback] 🎯 Path inicial calculado:', redirectPath);
          
          // LOCALHOST: O getOAuthCallbackRedirectPath já trata localhost corretamente
          // Apenas garantir que não haja ajustes que forcem redirecionamento para produção
          if (isLocal) {
            console.log('🔄 [OAuthCallback] 🏠 LOCALHOST detectado - mantendo no localhost');
            // O path já foi calculado corretamente pela função, não fazer ajustes adicionais
            // que possam forçar redirecionamento para domínios de produção
          }
          // Se estamos em descubrams.com, garantir que o path seja /descubrams (não /ms)
          else if ((currentHostname === 'descubrams.com' || currentHostname.includes('descubrams'))) {
            console.log('🔄 [OAuthCallback] ✅ Detectado Descubra MS');
            // Se o callback path for /ms (que é usado para OAuth callback), redirecionar para /descubrams
            if (redirectPath === '/ms' || redirectPath.startsWith('/ms/')) {
              console.log('🔄 [OAuthCallback]   ↳ Convertendo /ms para /descubrams');
              redirectPath = '/descubrams';
            }
            // Garantir que sempre redireciona para /descubrams se estamos em descubrams.com
            if (!redirectPath.startsWith('/descubrams')) {
              console.log('🔄 [OAuthCallback]   ↳ Forçando path para /descubrams');
              redirectPath = '/descubrams';
            }
          }
          // Se estamos em viajartur.com, garantir que não redireciona para /descubrams
          else if (currentHostname === 'viajartur.com' || currentHostname.includes('viajartur') || currentHostname === 'viajar.com') {
            console.log('🔄 [OAuthCallback] ✅ Detectado ViaJAR');
            // Não redirecionar para /descubrams se estiver em viajartur.com
            if (redirectPath === '/descubrams' || redirectPath.startsWith('/descubrams/')) {
              console.log('🔄 [OAuthCallback]   ↳ Prevenindo redirecionamento para /descubrams, usando /');
              redirectPath = '/';
            }
          } else {
            console.log('🔄 [OAuthCallback] ⚠️ Domínio não reconhecido:', currentHostname);
          }
          
          const isDescubraMS = isDescubraMSContext();

          console.log('🔄 [OAuthCallback] 📋 RESUMO DO REDIRECIONAMENTO:');
          console.log('🔄 [OAuthCallback]   - É contexto Descubra MS:', isDescubraMS);
          console.log('🔄 [OAuthCallback]   - Path final calculado:', redirectPath);
          console.log('🔄 [OAuthCallback]   - Domínio será mantido:', currentHostname);

          setStatus('success');

          // IMPORTANTE: Usar navigate (path relativo) para manter o domínio atual
          // Não forçar mudança de domínio - o usuário deve permanecer onde está
          console.log('🔄 [OAuthCallback] 🚀 Executando redirecionamento em 500ms...');
          setTimeout(() => {
            console.log('🔄 [OAuthCallback] ✅ Redirecionando para:', redirectPath);
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
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('❌ [OAuthCallback] Erro inesperado:', err);
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

