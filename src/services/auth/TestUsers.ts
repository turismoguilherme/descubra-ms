/**
 * Test Users Service
 * Usuários de teste para desenvolvimento e demonstração
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  businessType: 'hotel' | 'agency' | 'restaurant' | 'attraction' | 'other';
  businessName: string;
  role: 'user' | 'admin' | 'gestor_municipal' | 'atendente' | 'cat_attendant';
  avatar?: string;
  description: string;
  features: string[];
  autoLogin: boolean;
}

export const TEST_USERS: TestUser[] = [
  {
    id: 'hotel-owner-1',
    name: 'João Silva',
    email: 'joao@pousadadosol.com',
    businessType: 'hotel',
    businessName: 'Pousada do Sol',
    role: 'user',
    avatar: '🏨',
    description: 'Dono da Pousada do Sol em Bonito, MS',
    features: ['Revenue Optimizer', 'Market Intelligence', 'IA Conversacional', 'Sistema de Reservas'],
    autoLogin: true
  },
  {
    id: 'agency-owner-1',
    name: 'Maria Santos',
    email: 'maria@viagenscia.com',
    businessType: 'agency',
    businessName: 'Viagens & Cia',
    role: 'user',
    avatar: '🚌',
    description: 'Dona da agência Viagens & Cia em Campo Grande, MS',
    features: ['Lead Generation', 'IA Conversacional', 'Market Intelligence', 'Sistema de Pacotes'],
    autoLogin: true
  },
  {
    id: 'restaurant-owner-1',
    name: 'Pedro Oliveira',
    email: 'pedro@saboresdoms.com',
    businessType: 'restaurant',
    businessName: 'Sabores do MS',
    role: 'user',
    avatar: '🍽️',
    description: 'Dono do restaurante Sabores do MS em Corumbá, MS',
    features: ['Sistema de Reservas', 'Menu Optimizer', 'IA Conversacional', 'Analytics'],
    autoLogin: true
  },
  {
    id: 'attraction-owner-1',
    name: 'Ana Costa',
    email: 'ana@parquedascachoeiras.com',
    businessType: 'attraction',
    businessName: 'Parque das Cachoeiras',
    role: 'user',
    avatar: '🎯',
    description: 'Dona do Parque das Cachoeiras em Bonito, MS',
    features: ['Sistema de Ingressos', 'IA Conversacional', 'Market Intelligence', 'Analytics'],
    autoLogin: true
  },
  {
    id: 'admin-1',
    name: 'Carlos Admin',
    email: 'admin@viajar.com',
    businessType: 'other',
    businessName: 'ViaJAR Admin',
    role: 'admin',
    avatar: '👨‍💼',
    description: 'Administrador da ViaJAR',
    features: ['Todas as funcionalidades', 'Painel administrativo', 'Relatórios avançados'],
    autoLogin: true
  },
  {
    id: 'municipal-1',
    name: 'Prefeitura Bonito',
    email: 'turismo@bonito.ms.gov.br',
    businessType: 'other',
    businessName: 'Secretaria de Turismo - Bonito',
    role: 'gestor_municipal',
    avatar: '🏛️',
    description: 'Gestor municipal de turismo de Bonito, MS',
    features: ['Dashboard Municipal', 'Relatórios de Turismo', 'Gestão de Atrações'],
    autoLogin: true
  }
];

/**
 * Obtém usuário de teste por ID
 */
export const getTestUser = (id: string): TestUser | undefined => {
  return TEST_USERS.find(user => user.id === id);
};

/**
 * Obtém todos os usuários de teste
 */
export const getAllTestUsers = (): TestUser[] => {
  return TEST_USERS;
};

/**
 * Obtém usuários por tipo de negócio
 */
export const getTestUsersByBusinessType = (businessType: string): TestUser[] => {
  return TEST_USERS.filter(user => user.businessType === businessType);
};

/**
 * Obtém usuários por role
 */
export const getTestUsersByRole = (role: string): TestUser[] => {
  return TEST_USERS.filter(user => user.role === role);
};

/**
 * Simula login automático
 */
export const autoLoginTestUser = (userId: string): TestUser | null => {
  console.log("🧪 autoLoginTestUser: Chamado com userId:", userId);
  
  const user = getTestUser(userId);
  console.log("🧪 autoLoginTestUser: usuário encontrado:", user);
  
  if (user && user.autoLogin) {
    console.log("🧪 autoLoginTestUser: Salvando no localStorage...");
    // Simular login automático
    localStorage.setItem('test_user_id', userId);
    localStorage.setItem('test_user_data', JSON.stringify(user));
    
    // Verificar se foi salvo
    const savedUserId = localStorage.getItem('test_user_id');
    const savedUserData = localStorage.getItem('test_user_data');
    console.log("🧪 autoLoginTestUser: Verificação - userId:", savedUserId, "userData:", savedUserData);
    
    return user;
  }
  
  console.log("🧪 autoLoginTestUser: Usuário não encontrado ou autoLogin=false");
  return null;
};

/**
 * Verifica se há usuário de teste logado
 */
export const getCurrentTestUser = (): TestUser | null => {
  const userId = localStorage.getItem('test_user_id');
  if (userId) {
    const userData = localStorage.getItem('test_user_data');
    if (userData) {
      return JSON.parse(userData);
    }
  }
  return null;
};

/**
 * Faz logout do usuário de teste
 */
export const logoutTestUser = (): void => {
  localStorage.removeItem('test_user_id');
  localStorage.removeItem('test_user_data');
};

/**
 * Obtém usuários recomendados baseado no contexto
 */
export const getRecommendedTestUsers = (context?: string): TestUser[] => {
  switch (context) {
    case 'hotel':
      return TEST_USERS.filter(user => user.businessType === 'hotel');
    case 'agency':
      return TEST_USERS.filter(user => user.businessType === 'agency');
    case 'restaurant':
      return TEST_USERS.filter(user => user.businessType === 'restaurant');
    case 'attraction':
      return TEST_USERS.filter(user => user.businessType === 'attraction');
    case 'admin':
      return TEST_USERS.filter(user => user.role === 'admin');
    case 'municipal':
      return TEST_USERS.filter(user => user.role === 'gestor_municipal');
    default:
      return TEST_USERS.filter(user => user.autoLogin);
  }
};
