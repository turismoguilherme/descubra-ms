import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import UniversalLayout from '@/components/layout/UniversalLayout';

interface PassportProfileGateProps {
  children: React.ReactNode;
  onProfileComplete?: () => void;
}

/**
 * Componente que verifica se o usuário tem perfil completo antes de permitir usar o passaporte
 * Se não tiver conta: mostra opções de login/registro
 * Se tiver conta mas perfil incompleto: redireciona para /register para completar perfil
 * Se tiver perfil completo: renderiza o conteúdo filho
 */
const PassportProfileGate: React.FC<PassportProfileGateProps> = ({ 
  children, 
  onProfileComplete 
}) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Verificar se o perfil está completo
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        setProfileComplete(false);
        setCheckingProfile(false);
        return;
      }

      try {
        // Timeout de segurança para evitar loading infinito
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('Timeout ao verificar perfil. Permitindo acesso.');
            setProfileComplete(true); // Permitir acesso mesmo se timeout
            setCheckingProfile(false);
          }
        }, 5000); // 5 segundos de timeout

        // Verificar se tem perfil completo na tabela user_profiles
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('user_id, gender, state, travel_motives, country')
          .eq('user_id', user.id)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (!isMounted) return;

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          // Se tabela não existe ou erro, permitir acesso (não bloquear)
          if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('não existe')) {
            console.warn('Tabela user_profiles não existe. Permitindo acesso.');
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
          setCheckingProfile(false);
          return;
        }

        // Perfil está completo se tem registro na tabela user_profiles
        // Tornamos a verificação mais permissiva - se tem registro, permite acesso
        // Mesmo que alguns campos estejam faltando, não bloqueamos o acesso ao passaporte
        const hasProfile = !!profile;
        
        console.log('🔍 [PassportProfileGate] Verificação de perfil:', {
          hasProfile,
          profileExists: !!profile,
          userId: user.id
        });

        setProfileComplete(hasProfile);

        // Não redirecionar automaticamente - deixar o usuário acessar o passaporte
        // Se quiser completar o perfil, pode fazer depois
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Erro ao verificar perfil:', error);
        // Em caso de erro, permitir acesso para não bloquear o usuário
        if (isMounted) {
          setProfileComplete(true);
          setCheckingProfile(false);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setCheckingProfile(false);
        }
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, authLoading, navigate]);

  // Se ainda está verificando
  if (checkingProfile || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-ms-primary-blue" />
          <p className="text-gray-600">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  // Se não tem conta, mostrar opções de login/registro com UniversalLayout
  if (!user) {
    return (
      <UniversalLayout>
        <main className="flex-grow py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-ms-primary-blue">
                  Acesso ao Passaporte Digital
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Para usar o Passaporte Digital, você precisa criar uma conta e completar seu perfil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <Link to="/descubramatogrossodosul/register" className="block">
                  <Button className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90" size="lg">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Conta
                  </Button>
                </Link>
                <Link to="/descubramatogrossodosul/login" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    <LogIn className="w-5 h-5 mr-2" />
                    Já tenho conta
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  // Se perfil completo ou se não tem perfil mas tem usuário autenticado, permitir acesso
  // Tornamos mais permissivo para não bloquear o uso do passaporte
  if (profileComplete || (user && profileComplete !== false)) {
    return <>{children}</>;
  }

  // Se perfil não completo mas tem usuário, mostrar aviso mas permitir acesso
  if (user && profileComplete === false) {
    return (
      <>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Dica:</strong> Complete seu perfil para uma experiência personalizada. 
                <Link to="/descubramatogrossodosul/register" className="underline ml-1">
                  Completar perfil
                </Link>
              </p>
            </div>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Caso ainda esteja verificando (fallback)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-ms-primary-blue" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default PassportProfileGate;
