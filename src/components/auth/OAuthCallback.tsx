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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OAuthCallback.tsx:processOAuthCallback:OAUTH_SUCCESS',message:'OAuth login bem-sucedido, calculando redirect',data:{hostname:window.location.hostname,pathname:window.location.pathname,origin:window.location.origin,hash:window.location.hash,userId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          console.log('✅ [OAuthCallback] Login OAuth bem-sucedido!');
          console.log('✅ [OAuthCallback] Usuário:', session.user.email);
          
          const currentHostname = window.location.hostname.toLowerCase();
          
          // IMPORTANTE: Garantir que o redirecionamento use o DOMÍNIO ATUAL
          let redirectPath = getOAuthCallbackRedirectPath();
          
          // Se estamos em descubrams.com, garantir que o path seja /descubrams (não /ms)
          if ((currentHostname === 'descubrams.com' || currentHostname.includes('descubrams'))) {
            // Se o callback path for /ms (que é usado para OAuth callback), redirecionar para /descubrams
            if (redirectPath === '/ms' || redirectPath.startsWith('/ms/')) {
              redirectPath = '/descubrams';
            }
            // Garantir que sempre redireciona para /descubrams se estamos em descubrams.com
            if (!redirectPath.startsWith('/descubrams')) {
              redirectPath = '/descubrams';
            }
          }
          
          const isDescubraMS = isDescubraMSContext();

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OAuthCallback.tsx:processOAuthCallback:NAVIGATE',message:'Navegando após OAuth callback',data:{redirectPath,isDescubraMS,hostname:window.location.hostname,pathname:window.location.pathname,currentHostname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
          // #endregion

          console.log('🔄 [OAuthCallback] Domínio atual:', window.location.hostname);
          console.log('🔄 [OAuthCallback] É contexto Descubra MS:', isDescubraMS);
          console.log('🔄 [OAuthCallback] Redirecionando para path:', redirectPath);

          setStatus('success');

          // IMPORTANTE: Se estamos no domínio errado, redirecionar para o correto
          if ((currentHostname === 'descubrams.com' || currentHostname.includes('descubrams'))) {
            // Estamos no domínio correto, usar navigate (path relativo mantém o domínio)
            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 500);
          } else {
            // Estamos no domínio errado, redirecionar para o correto
            console.error('❌ [OAuthCallback] Domínio incorreto detectado:', currentHostname);
            const correctOrigin = 'https://descubrams.com';
            setTimeout(() => {
              window.location.href = `${correctOrigin}${redirectPath}`;
            }, 500);
          }
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

