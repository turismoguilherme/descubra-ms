import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSessionSecurity } from "@/hooks/useSessionSecurity";
import SessionTimeoutWarning from "./SessionTimeoutWarning";

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
  const { user } = useAuth();
  
  // Initialize session security monitoring
  useSessionSecurity({
    enabled: !!user,
    timeoutMinutes: sessionTimeoutMinutes,
    warningMinutes: sessionWarningMinutes,
    trackActivity: true
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
          enabled={true}
        />
      )}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;