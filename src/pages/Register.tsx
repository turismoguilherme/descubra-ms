
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
      }
    }
  }, [user, loading, profileLoading, profileComplete, navigate]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    console.log("🔐 Tentativa de login social:", provider);
    await signInWithProvider(provider);
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

  if ((loading || profileLoading) && !user && !registeredEmail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md space-y-6 p-8 bg-white shadow-lg rounded-lg">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
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
