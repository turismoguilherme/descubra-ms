import { createContext, useContext, ReactNode } from "react";
import { AuthContext } from "@/hooks/auth/AuthContext";
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
  // Sempre chamar useContext para manter a ordem dos hooks consistente
  const authContext = useContext(AuthContext);
  const user = authContext?.user ?? null;
  const sessionSecurityEnabled = !!user;
  
  // Sempre chamar useSessionSecurity para manter a ordem dos hooks consistente
  // Mas desabilitar quando não há usuário
  useSessionSecurity({
    enabled: sessionSecurityEnabled,
    timeoutMinutes: sessionTimeoutMinutes,
    warningMinutes: sessionWarningMinutes,
    trackActivity: sessionSecurityEnabled
  });

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