// Stub temporário para useOverflowOneAuth
export const useOverflowOneAuth = () => {
  return {
    user: null,
    session: null,
    userProfile: null,
    loading: false,
    signUp: async (email: string, password: string, companyName?: string, contactPerson?: string) => ({ data: null, error: null }),
    signIn: async (email: string, password: string) => ({ data: null, error: null }),
    signInWithProvider: async (provider: 'google' | 'facebook') => ({ data: null, error: null }),
    signOut: async () => {},
    resetPassword: async (email: string) => {},
    resendConfirmationEmail: async (email: string) => ({ data: null, error: null }),
  };
};
