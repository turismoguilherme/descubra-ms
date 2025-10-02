import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { ViaJARUserProfile } from "@/types/viajar-auth";

export interface ViaJARAuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: ViaJARUserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, companyName: string, contactPerson: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
}

export const ViaJARAuthContext = createContext<ViaJARAuthContextType | undefined>(undefined);

// ViaJARAuthProvider is exported separately to avoid circular imports

