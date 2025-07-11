import React, { createContext, useContext } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

const AuthContext = createContext<ReturnType<typeof useSecureAuth> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useSecureAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};