import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { serverSideSecurityService } from "@/services/serverSideSecurityService";

interface CSRFContextType {
  token: string | null;
  validateToken: (token: string) => boolean;
  refreshToken: () => void;
  getSecurityHeaders: () => Record<string, string>;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export const useCSRF = (): CSRFContextType => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error("useCSRF must be used within a CSRFProvider");
  }
  return context;
};

interface CSRFProviderProps {
  children: ReactNode;
}

export const CSRFProvider: React.FC<CSRFProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  // Generate initial token
  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = () => {
    const newToken = serverSideSecurityService.generateCSRFToken();
    setToken(newToken);
  };

  const validateToken = (tokenToValidate: string): boolean => {
    return serverSideSecurityService.validateCSRFToken(tokenToValidate);
  };

  const getSecurityHeaders = (): Record<string, string> => {
    const headers = serverSideSecurityService.getSecurityHeaders();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  };

  const contextValue: CSRFContextType = {
    token,
    validateToken,
    refreshToken,
    getSecurityHeaders
  };

  return (
    <CSRFContext.Provider value={contextValue}>
      {children}
    </CSRFContext.Provider>
  );
};

interface CSRFFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent, csrfToken: string) => void;
  className?: string;
}

export const CSRFForm: React.FC<CSRFFormProps> = ({ children, onSubmit, className }) => {
  const { token, refreshToken } = useCSRF();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.error("CSRF token not available");
      return;
    }
    onSubmit(e, token);
    // Refresh token after use for security
    refreshToken();
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {token && (
        <input
          type="hidden"
          name="csrf_token"
          value={token}
          readOnly
        />
      )}
      {children}
    </form>
  );
};