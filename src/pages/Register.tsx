import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import RegisterForm, { RegisterFormValues } from "@/components/auth/RegisterForm";
// import { AccessibilityPreferences } from "@/components/auth/AccessibilityQuestion";
import SecureProfileForm from "@/components/auth/SecureProfileForm";
import EmailConfirmationMessage from "@/components/auth/EmailConfirmationMessage";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { getLoginRedirectPath } from "@/utils/authRedirect";
import { consumeGuataLoginReturn } from "@/utils/guataPendingAction";

function resolveDescubraRegisterRedirect(redirectUrlParam: string | null): string {
  const fromQuery = redirectUrlParam?.trim();
  if (fromQuery && fromQuery.startsWith("/") && !fromQuery.startsWith("//") && fromQuery !== "/") {
    if (!fromQuery.startsWith("/viajar") && fromQuery !== "/login") {
      try { sessionStorage.removeItem("guata_login_return"); } catch { /* ignore */ }
      return fromQuery;
    }
  }

  const fromStorage = consumeGuataLoginReturn();
  if (fromStorage) return fromStorage;

  const fallback = getLoginRedirectPath();
  if (fallback === "/" || fallback.startsWith("/viajar")) {
    return "/descubrams";
  }
  return fallback;
}

const Register = () => {
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const { user, signUp, signInWithProvider, loading } = useAuth();
  const { profileComplete, loading: profileLoading } = useProfileCompletion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrlParam = searchParams.get("redirect") || searchParams.get("next");

  useEffect(() => {
    if (!loading && !profileLoading && user) {
      const pathname = window.location.pathname.toLowerCase();
      const isDescubraMSRegister =
        pathname.startsWith("/descubrams/register") ||
        pathname.startsWith("/ms/register") ||
        pathname.startsWith("/descubramatogrossodosul/register");

      console.log("👤 REGISTER: Usuário logado detectado, verificando perfil...", {
        userEmail: user.email,
        provider: user.app_metadata?.provider,
        profileComplete,
        userMetadata: user.user_metadata,
        isDescubraMSRegister,
        redirectUrlParam
      });

      if (isDescubraMSRegister) {
        const redirectPath = resolveDescubraRegisterRedirect(redirectUrlParam);
        console.log("👤 REGISTER: Descubra MS sem Complete perfil, redirecionando para:", redirectPath);
        navigate(redirectPath, { replace: true });
        return;
      }
      
      if (profileComplete) {
        console.log("👤 REGISTER: ========== PERFIL COMPLETO - REDIRECIONANDO ==========");
        console.log("👤 REGISTER: Origin atual:", window.location.origin);
        console.log("👤 REGISTER: Hostname:", window.location.hostname);
        console.log("👤 REGISTER: Pathname:", window.location.pathname);
        
        // IMPORTANTE: Usar redirecionamento dinâmico baseado no domínio atual
        // Não hardcodar /descubrams - respeitar o domínio onde o usuário está
        const redirectPath = getLoginRedirectPath();
        
        console.log("👤 REGISTER: 📋 RESUMO DO REDIRECIONAMENTO:");
        console.log("👤 REGISTER:   - Path calculado:", redirectPath);
        console.log("👤 REGISTER:   - Domínio será mantido:", window.location.hostname);
        console.log("👤 REGISTER: 🚀 Executando redirecionamento...");
        
        navigate(redirectPath);
      } else {
        console.log("👤 REGISTER: Perfil incompleto, indo para etapa 2");
        setStep(2);
      }
    }
  }, [user, loading, profileLoading, profileComplete, navigate, redirectUrlParam]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    console.log("🔐 Tentativa de login social:", provider);
    await signInWithProvider(provider);
  };

  const handleRegister = async (values: RegisterFormValues, accessibilityPreferences?: Record<string, unknown>) => {
    console.log("📝 Tentativa de registro:", values.email);
    console.log("🎯 Preferências de acessibilidade:", accessibilityPreferences);
    
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
