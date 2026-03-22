import type { User } from '@supabase/supabase-js';
import type { TestUser } from '@/services/auth/TestUsers';
import type { UserProfile } from '@/types/auth';

const LEGACY_TEST_TOKEN = 'test-token';

/** Ativo em `npm run dev` ou se `VITE_ENABLE_TEST_LOGIN=true` no build (ex.: preview de homologação). */
export function isViajarTestLoginEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_ENABLE_TEST_LOGIN === 'true';
}

export function simulatedUserFromTestUser(testUser: TestUser): { user: User; profile: UserProfile } {
  const user = {
    id: testUser.id,
    email: testUser.email,
    created_at: new Date().toISOString(),
  } as User;

  const profile: UserProfile = {
    user_id: testUser.id,
    full_name: testUser.name,
    role: testUser.role,
    city_id:
      testUser.role === 'gestor_municipal'
        ? 'campo-grande'
        : testUser.role === 'gestor_igr'
          ? 'dourados'
          : 'campo-grande',
    region_id: testUser.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal',
  };

  return { user, profile };
}

export function readLegacyStoredTestLogin(): { user: User; profile: UserProfile } | null {
  const raw = localStorage.getItem('test-user-data');
  const token = localStorage.getItem('supabase.auth.token');
  if (!raw || token !== LEGACY_TEST_TOKEN) return null;
  try {
    const testData = JSON.parse(raw);
    const user = {
      id: testData.id,
      email: testData.email,
      created_at: testData.created_at,
    } as User;
    const profile: UserProfile = {
      user_id: testData.id,
      full_name: testData.name,
      role: testData.role,
      city_id:
        testData.role === 'gestor_municipal'
          ? 'campo-grande'
          : testData.role === 'gestor_igr'
            ? 'dourados'
            : 'campo-grande',
      region_id: testData.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal',
    };
    return { user, profile };
  } catch {
    return null;
  }
}

type StaticTestRow = { password: string; name: string; role: string };

const STATIC_TEST_ACCOUNTS: Record<string, StaticTestRow> = {
  'teste@viajar.com': { password: '123456', name: 'Usuário Teste ViaJAR', role: 'user' },
  'atendente@ms.gov.br': { password: '123456', name: 'Atendente MS', role: 'atendente' },
  'admin@viajar.com': { password: '123456', name: 'Admin ViaJAR', role: 'admin' },
  'gestor@ms.gov.br': { password: '123456', name: 'Gestor MS', role: 'gestor_municipal' },
  'atendente@cat-campo-grande.com': { password: '123456', name: 'Atendente CAT Campo Grande', role: 'cat_attendant' },
  'atendente@cat-dourados.com': { password: '123456', name: 'Atendente CAT Dourados', role: 'cat_attendant' },
  'atendente@cat-corumba.com': { password: '123456', name: 'Atendente CAT Corumbá', role: 'cat_attendant' },
  'atendente@cat-bonito.com': { password: '123456', name: 'Atendente CAT Bonito', role: 'cat_attendant' },
};

function cityRegionForStaticEmail(email: string): Pick<UserProfile, 'city_id' | 'region_id'> {
  return {
    city_id: email.includes('ms')
      ? 'campo-grande'
      : email.includes('cat-campo-grande')
        ? 'campo-grande'
        : email.includes('cat-dourados')
          ? 'dourados'
          : email.includes('cat-corumba')
            ? 'corumba'
            : email.includes('cat-bonito')
              ? 'bonito'
              : null,
    region_id:
      email.includes('ms') || email.includes('cat') ? 'regiao-pantanal' : null,
  };
}

/** Login por email/senha fixos (apenas quando test login está habilitado). */
export function tryStaticTestSignIn(email: string, password: string): { user: User; profile: UserProfile } | null {
  const key = email.trim().toLowerCase();
  const row = STATIC_TEST_ACCOUNTS[key];
  if (!row || row.password !== password) return null;

  const user = {
    id: `test-${key.replace('@', '-').replace(/\./g, '-')}`,
    email: key,
    created_at: new Date().toISOString(),
  } as User;

  const { city_id, region_id } = cityRegionForStaticEmail(key);
  const profile: UserProfile = {
    user_id: user.id,
    full_name: row.name,
    role: row.role,
    city_id,
    region_id,
  };

  localStorage.setItem(
    'test-user-data',
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: profile.full_name,
      role: profile.role,
      created_at: user.created_at,
    }),
  );
  localStorage.setItem('supabase.auth.token', LEGACY_TEST_TOKEN);

  return { user, profile };
}

export function clearSimulatedTestSessionMarkers(): void {
  localStorage.removeItem('test_user_id');
  localStorage.removeItem('test_user_data');
  localStorage.removeItem('test-user-data');
  localStorage.removeItem('supabase.auth.token');
}

/** Senha comum às contas estáticas de teste. */
export const VIAJAR_TEST_PASSWORD = '123456';

/** Admin de teste exibido no AdminLogin (dev / VITE_ENABLE_TEST_LOGIN). */
export const VIAJAR_ADMIN_TEST_DISPLAY = {
  email: 'admin@viajar.com',
  password: VIAJAR_TEST_PASSWORD,
  label: 'Admin ViajARTur (teste)',
} as const;
