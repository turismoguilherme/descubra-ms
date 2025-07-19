// Utilitário para testar os dashboards da Fase 2
// Este arquivo permite testar os dashboards sem dependência do banco de dados

import { UserRole } from '@/types/roles';

// Dados mock para teste
export const mockUserProfiles = {
  atendente: {
    user_id: 'atendente-test',
    role: 'atendente' as UserRole,
    full_name: 'Maria Silva - Atendente',
    region_id: 'bonito-region-id',
    city_id: 'bonito-city-id'
  },
  gestor_municipal: {
    user_id: 'gestor-municipal-test',
    role: 'gestor_municipal' as UserRole,
    full_name: 'João Santos - Gestor Municipal',
    region_id: 'caminho-ipes-region-id',
    city_id: 'campo-grande-city-id'
  },
  gestor_igr: {
    user_id: 'gestor-igr-test',
    role: 'gestor_igr' as UserRole,
    full_name: 'Ana Costa - Gestor Regional',
    region_id: 'pantanal-region-id',
    city_id: null
  },
  diretor_estadual: {
    user_id: 'diretor-estadual-test',
    role: 'diretor_estadual' as UserRole,
    full_name: 'Carlos Lima - Diretor Estadual',
    region_id: null,
    city_id: null
  }
};

// Função para simular login de teste
export const simulateLogin = (role: UserRole) => {
  const userProfile = mockUserProfiles[role];
  
  // Simular dados do usuário autenticado
  const mockUser = {
    id: userProfile.user_id,
    email: `${role}@ms.gov.br`,
    created_at: new Date().toISOString()
  };

  // Armazenar no localStorage para simular sessão
  localStorage.setItem('test_user', JSON.stringify(mockUser));
  localStorage.setItem('test_user_profile', JSON.stringify(userProfile));
  
  console.log(`✅ Login simulado para: ${userProfile.full_name}`);
  console.log(`📊 Role: ${userProfile.role}`);
  console.log(`🏢 Região: ${userProfile.region_id || 'N/A'}`);
  console.log(`🏙️ Cidade: ${userProfile.city_id || 'N/A'}`);
  
  return { user: mockUser, userProfile };
};

// Função para limpar dados de teste
export const clearTestData = () => {
  localStorage.removeItem('test_user');
  localStorage.removeItem('test_user_profile');
  console.log('🧹 Dados de teste limpos');
};

// Função para verificar se está em modo de teste
export const isTestMode = () => {
  return localStorage.getItem('test_user') !== null;
};

// Função para obter dados de teste
export const getTestData = () => {
  const user = localStorage.getItem('test_user');
  const userProfile = localStorage.getItem('test_user_profile');
  
  if (user && userProfile) {
    return {
      user: JSON.parse(user),
      userProfile: JSON.parse(userProfile)
    };
  }
  
  return null;
};

// Lista de roles disponíveis para teste
export const availableRoles: UserRole[] = [
  'atendente',
  'gestor_municipal', 
  'gestor_igr',
  'diretor_estadual'
];

// URLs de teste para cada dashboard
export const testUrls = {
  atendente: '/ms/admin?test=atendente',
  gestor_municipal: '/ms/admin?test=gestor_municipal',
  gestor_igr: '/ms/admin?test=gestor_igr',
  diretor_estadual: '/ms/admin?test=diretor_estadual'
};

// Instruções de teste
export const testInstructions = `
🧪 **INSTRUÇÕES PARA TESTE DA FASE 2**

1. **Acesse o servidor de desenvolvimento**:
   http://localhost:8080

2. **Teste os dashboards**:
   - Atendente: ${testUrls.atendente}
   - Gestor Municipal: ${testUrls.gestor_municipal}
   - Gestor Regional: ${testUrls.gestor_igr}
   - Diretor Estadual: ${testUrls.diretor_estadual}

3. **Ou use o console do navegador**:
   - Abra F12 → Console
   - Digite: simulateLogin('atendente')
   - Digite: simulateLogin('gestor_municipal')
   - Digite: simulateLogin('gestor_igr')
   - Digite: simulateLogin('diretor_estadual')

4. **Limpar dados de teste**:
   - Console: clearTestData()

5. **Verificar dados atuais**:
   - Console: getTestData()
`; 