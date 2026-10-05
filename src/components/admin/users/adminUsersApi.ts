import { supabase } from '@/integrations/supabase/client';
import { buildResetRedirectUrl } from '@/lib/passwordReset';

export type UserPlatform = 'descubra-ms' | 'guata-labs';

export interface AdminUser {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  roles: string[];
  platform: UserPlatform;
  blocked: boolean;
  protectedAccount: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  role: string;
  platform: UserPlatform;
  password?: string;
}

/** Chamada única ao serviço admin-users, normalizando erros. */
async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  const remote = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : null;
  if (error || remote) throw new Error(remote || error?.message || 'Falha na operação.');
  return data as T;
}

export const adminUsersApi = {
  list: () => call<{ users: AdminUser[] }>({ action: 'list' }).then((r) => r.users),
  create: (input: CreateUserInput) => call<{ password: string }>({ action: 'create', ...input }),
  remove: (userId: string) => call({ action: 'delete', userId }),
  sendResetEmail: (user: AdminUser) =>
    call({
      action: 'reset_email',
      email: user.email,
      redirectTo: buildResetRedirectUrl(user.platform === 'guata-labs' ? 'guata-labs' : 'ms'),
    }),
  tempPassword: (userId: string) => call<{ password: string }>({ action: 'temp_password', userId }).then((r) => r.password),
};

export const ROLE_OPTIONS: Record<UserPlatform, { value: string; label: string }[]> = {
  'descubra-ms': [
    { value: 'user', label: 'Turista' },
    { value: 'partner', label: 'Parceiro' },
    { value: 'atendente', label: 'Atendente' },
  ],
  'guata-labs': [
    { value: 'admin', label: 'Administrador' },
    { value: 'tech', label: 'Equipe técnica' },
    { value: 'partner', label: 'Parceiro' },
  ],
};

export const roleLabel = (role: string) =>
  Object.values(ROLE_OPTIONS).flat().find((r) => r.value === role)?.label ??
  ({ banned: 'Bloqueado', master_admin: 'Administrador principal' } as Record<string, string>)[role] ??
  role;
