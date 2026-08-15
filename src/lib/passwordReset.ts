import { supabase } from '@/integrations/supabase/client';

export type ResetBrand = 'ms' | 'guata-labs';

/**
 * Fonte única de verdade para o envio do e-mail de redefinição de senha.
 *
 * O link do e-mail SEMPRE aponta para /reset-password, que é a tela onde a
 * pessoa define a nova senha. O parâmetro `brand` serve apenas para a tela
 * saber para qual login voltar depois (Parceiro Descubra MS ou Guatá Labs).
 */
export const detectResetBrand = (pathname: string = window.location.pathname): ResetBrand =>
  pathname.startsWith('/descubrams') ? 'ms' : 'guata-labs';

export const buildResetRedirectUrl = (brand: ResetBrand): string =>
  `${window.location.origin}/reset-password?brand=${brand}`;

export const sendPasswordResetEmail = async (
  email: string,
  brand: ResetBrand = detectResetBrand(),
): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: buildResetRedirectUrl(brand),
  });

  if (error) throw error;
};

export const loginPathForBrand = (brand: ResetBrand): string =>
  brand === 'ms' ? '/descubrams/partner/login' : '/viajar/admin';
