
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterForm, { RegisterFormValues } from "@/components/auth/RegisterForm";
import SecureProfileForm from "@/components/auth/SecureProfileForm";
import EmailConfirmationMessage from "@/components/auth/EmailConfirmationMessage";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

const Register = () => {
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const { user, signUp, signInWithProvider, loading } = useAuth();
  const { profileComplete, loading: profileLoading } = useProfileCompletion();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 REGISTER EFFECT: User, loading, profileComplete, profileLoading state changed", {
      user: user?.id, // Logar apenas o ID do usuário para evitar logs muito grandes
      loadingAuth: loading,
      profileComplete: profileComplete,
      loadingProfile: profileLoading,
    });

    if (!loading && !profileLoading && user) {
      console.log("👤 REGISTER: Usuário logado detectado, verificando perfil...", {
        userEmail: user.email,
        provider: user.app_metadata?.provider,
        profileComplete,
        userMetadata: user.user_metadata
      });
      
      if (profileComplete) {
        console.log("👤 REGISTER: Perfil completo, redirecionando para home");
        navigate('/');
      } else {
        console.log("👤 REGISTER: Perfil incompleto, indo para etapa 2");
        setStep(2);
        navigate('/complete-profile'); // Redireciona para a página de completar perfil
      }
    } else if (!loading && !user) {
      console.log("👤 REGISTER: Nenhum usuário logado após carregamento.");
      // Se o carregamento terminou e não há usuário, significa que não logou ou deslogou.
      // Mantenha o passo 1 (registro/login inicial)
      setStep(1);
    }
  }, [user, loading, profileLoading, profileComplete, navigate]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    console.log("🔐 Tentativa de login social:", provider);
    const { error } = await signInWithProvider(provider);
    if (error) {
      console.error("❌ SOCIAL LOGIN: Erro ao iniciar login social:", error);
    } else {
      console.log("✅ SOCIAL LOGIN: Login social iniciado, aguardando redirecionamento...");
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    console.log("📝 Tentativa de registro:", values.email);
    const { email, password, fullName } = values;
    const { error, user: signedUpUser, session } = await signUp(email, password, fullName);

    if (!error && signedUpUser && !session) {
      console.log("📧 Confirmação de email necessária");
      setRegisteredEmail(email);
    } else if (!error && signedUpUser && session) {
      console.log("✅ Usuário logado automaticamente");
      // O useEffect acima vai gerenciar o redirecionamento
    }
  };

  if (loading && !user && !registeredEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (registeredEmail) {
    return <EmailConfirmationMessage email={registeredEmail} />;
  }

  if (step === 2) {
    return <SecureProfileForm />;
  }

  return (
    <RegisterForm
      onRegister={handleRegister}
      onSocialLogin={handleSocialLogin}
      loading={loading}
    />
  );
};

export default Register;
