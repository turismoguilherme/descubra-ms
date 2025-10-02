import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { OverflowOneUserProfile } from "@/types/overflow-one-auth";

export interface OverflowOneAuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: OverflowOneUserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, companyName: string, contactPerson: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<any>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
}

export const OverflowOneAuthContext = createContext<OverflowOneAuthContextType | undefined>(undefined);
