import { createContext, ReactNode } from "react";

interface SecurityContextType {
  isSecure: boolean;
  sessionTimeoutEnabled: boolean;
}

const SecurityContext = createContext<SecurityContextType>({
  isSecure: false,
  sessionTimeoutEnabled: false,
});

interface SecurityProviderProps {
  children: ReactNode;
  enableSessionTimeout?: boolean;
  sessionTimeoutMinutes?: number;
  sessionWarningMinutes?: number;
}

const SecurityProvider = ({
  children,
  enableSessionTimeout = true,
  sessionTimeoutMinutes = 30,
  sessionWarningMinutes = 5,
}: SecurityProviderProps) => {
  const contextValue: SecurityContextType = {
    isSecure: true,
    sessionTimeoutEnabled: false, // Desabilitado para evitar problemas
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;
export { SecurityContext };
