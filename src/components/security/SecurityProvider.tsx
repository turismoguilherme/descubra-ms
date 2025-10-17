import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSessionSecurity } from "@/hooks/useSessionSecurity";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";

interface SecurityContextType {
  isSecure: boolean;
  sessionTimeoutEnabled: boolean;
}

const SecurityContext = createContext<SecurityContextType>({
  isSecure: false,
  sessionTimeoutEnabled: false,
});

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
  enableSessionTimeout?: boolean;
  sessionTimeoutMinutes?: number;
  sessionWarningMinutes?: number;
}

export const SecurityProvider = ({
  children,
  enableSessionTimeout = true,
  sessionTimeoutMinutes = 30,
  sessionWarningMinutes = 5,
}: SecurityProviderProps) => {
  // Usar try-catch para evitar erro quando não há AuthProvider
  let user = null;
  let sessionSecurityEnabled = false;
  
  try {
    const auth = useAuth();
    user = auth.user;
    sessionSecurityEnabled = !!user;
  } catch (error) {
    // Se não há AuthProvider, continuar sem usuário
    console.log("🔒 SecurityProvider: AuthProvider não disponível, continuando sem usuário");
  }
  
  // Initialize session security monitoring apenas se há usuário
  if (sessionSecurityEnabled) {
    useSessionSecurity({
      enabled: true,
      timeoutMinutes: sessionTimeoutMinutes,
      warningMinutes: sessionWarningMinutes,
      trackActivity: true
    });
  }

  const contextValue: SecurityContextType = {
    isSecure: !!user,
    sessionTimeoutEnabled: enableSessionTimeout,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
      {user && enableSessionTimeout && (
        <SessionTimeoutWarning
          timeoutMinutes={sessionTimeoutMinutes}
          warningTimeMinutes={sessionWarningMinutes}
        />
      )}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;