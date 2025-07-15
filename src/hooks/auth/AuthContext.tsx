
import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/auth";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isProfileComplete: boolean | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  fetchUserProfile: (user: User | null) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthProvider from AuthProvider.tsx
export { AuthProvider } from './AuthProvider';
