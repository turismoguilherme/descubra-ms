
import { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/auth";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null; // Adicionado
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    ...context,
    isLoading: context.loading
  };
};

// Export AuthProvider from AuthProvider.tsx
export { AuthProvider } from './AuthProvider';
