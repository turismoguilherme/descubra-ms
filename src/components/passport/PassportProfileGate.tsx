import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

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
    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        setProfileComplete(false);
        setCheckingProfile(false);
        return;
      }

      try {
        // Verificar se tem perfil completo na tabela user_profiles
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('user_id, gender, state, travel_motives, country')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          setProfileComplete(false);
          setCheckingProfile(false);
          return;
        }

        // Perfil está completo se tem pelo menos as informações básicas obrigatórias
        // Verificamos se tem gender, state (origin_state) e travel_motives
        const hasRequiredFields = profile && 
          profile.gender && 
          profile.state && 
          profile.travel_motives && 
          Array.isArray(profile.travel_motives) && 
          profile.travel_motives.length > 0;

        setProfileComplete(!!hasRequiredFields);

        // Se perfil incompleto, redirecionar para /register
        if (!hasRequiredFields) {
          navigate('/descubramatogrossodosul/register');
        }
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
        setProfileComplete(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfile();
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

  // Se não tem conta, mostrar opções de login/registro
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-ms-primary-blue">
              Acesso ao Passaporte Digital
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Para usar o Passaporte Digital, você precisa criar uma conta e completar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
    );
  }

  // Perfil completo - renderizar conteúdo filho
  if (profileComplete) {
    return <>{children}</>;
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
