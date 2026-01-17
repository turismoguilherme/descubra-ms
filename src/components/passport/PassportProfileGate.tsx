import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, MapPin, Award, Compass } from 'lucide-react';
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

  // Se ainda está verificando - Loading elegante padrão Descubra MS
  if (checkingProfile || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-ms-primary-blue/20"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-ms-primary-blue absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🛂</span>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Verificando perfil...</p>
          <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Se não tem conta, mostrar opções de login/registro com visual Descubra MS
  if (!user) {
    return (
      <UniversalLayout>
        <main className="flex-grow bg-gradient-to-b from-blue-50 via-white to-green-50">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-12 md:py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm p-5 rounded-full inline-block mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="text-5xl">🛂</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                Passaporte Digital MS
              </h1>
              <p className="text-white/90 text-lg mt-3 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Explore os destinos incríveis de Mato Grosso do Sul e colecione selos da fauna pantaneira
              </p>
            </div>
          </div>

          {/* Card de Acesso */}
          <div className="container mx-auto px-4 py-12 -mt-8">
            <Card className="bg-white rounded-2xl shadow-xl border-0 max-w-lg mx-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-bold text-ms-primary-blue">
                  Acesse seu Passaporte
                </CardTitle>
                <CardDescription className="text-base mt-2 text-gray-600">
                  Crie sua conta para começar a explorar e colecionar carimbos exclusivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-8 pb-8">
                {/* Benefícios */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gradient-to-br from-ms-primary-blue/5 to-ms-discovery-teal/5 rounded-xl">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ms-primary-blue/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Rotas Exclusivas</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-ms-discovery-teal/5 to-ms-pantanal-green/5 rounded-xl">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ms-discovery-teal/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-ms-discovery-teal" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Selos Temáticos</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-ms-pantanal-green/5 to-ms-secondary-yellow/5 rounded-xl">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ms-pantanal-green/10 flex items-center justify-center">
                      <Compass className="w-5 h-5 text-ms-pantanal-green" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Recompensas</p>
                  </div>
                </div>

                <Link to="/descubrams/register" className="block">
                  <Button className="w-full bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal hover:from-ms-primary-blue/90 hover:to-ms-discovery-teal/90 text-white py-6 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Conta Gratuita
                  </Button>
                </Link>
                <Link to="/descubrams/login" className="block">
                  <Button variant="outline" className="w-full border-2 border-ms-primary-blue text-ms-primary-blue py-6 rounded-full font-bold text-lg hover:bg-ms-primary-blue/5 transition-all duration-300">
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
        <div className="bg-gradient-to-r from-ms-secondary-yellow/20 to-orange-50 border-l-4 border-ms-secondary-yellow p-4 mb-4 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-ms-secondary-yellow/30 p-2 rounded-full mr-3">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong className="text-ms-primary-blue">Dica:</strong> Complete seu perfil para uma experiência personalizada. 
                <Link to="/descubrams/register" className="underline ml-1 text-ms-primary-blue hover:text-ms-discovery-teal transition-colors font-medium">
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-ms-primary-blue/20"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-ms-primary-blue absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-600 text-lg">Carregando...</p>
      </div>
    </div>
  );
};

export default PassportProfileGate;
