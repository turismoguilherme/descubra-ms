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
    features: ['Revenue Optimizer', 'Market Intelligence', 'Guilherme', 'Sistema de Reservas'],
    autoLogin: true,
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
    features: ['Lead Generation', 'Guilherme', 'Market Intelligence', 'Sistema de Pacotes'],
    autoLogin: true,
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
    features: ['Sistema de Reservas', 'Menu Optimizer', 'Guilherme', 'Analytics'],
    autoLogin: true,
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
    features: ['Sistema de Ingressos', 'Guilherme', 'Market Intelligence', 'Analytics'],
    autoLogin: true,
  },
  {
    id: 'admin-1',
    name: 'Carlos Admin',
    email: 'admin@viajar.com',
    businessType: 'other',
    businessName: 'ViajARTur Admin',
    role: 'admin',
    avatar: '👨‍💼',
    description: 'Administrador da ViajARTur',
    features: ['Todas as funcionalidades', 'Painel administrativo', 'Relatórios avançados'],
    autoLogin: true,
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
    autoLogin: true,
  },
  {
    id: 'attendant-1',
    name: 'Maria Silva',
    email: 'maria.silva@bonito.ms.gov.br',
    businessType: 'other',
    businessName: 'CAT Bonito - Centro',
    role: 'atendente',
    avatar: '👩‍💼',
    description: 'Atendente do CAT Centro de Bonito, MS',
    features: ['Controle de Ponto', 'IA para Atendimento', 'Gestão de Turistas', 'Tradução Automática'],
    autoLogin: true,
  },
  {
    id: 'cat-attendant-1',
    name: 'João Santos',
    email: 'joao.santos@bonito.ms.gov.br',
    businessType: 'other',
    businessName: 'CAT Aeroporto',
    role: 'cat_attendant',
    avatar: '👨‍💼',
    description: 'Atendente do CAT Aeroporto de Bonito, MS',
    features: ['Controle de Ponto', 'IA para Atendimento', 'Gestão de Turistas', 'Tradução Automática'],
    autoLogin: true,
  },
];

export const getTestUser = (id: string): TestUser | undefined => {
  return TEST_USERS.find((user) => user.id === id);
};

export const getAllTestUsers = (): TestUser[] => {
  return TEST_USERS;
};

export const getTestUsersByBusinessType = (businessType: string): TestUser[] => {
  return TEST_USERS.filter((user) => user.businessType === businessType);
};

export const getTestUsersByRole = (role: string): TestUser[] => {
  return TEST_USERS.filter((user) => user.role === role);
};

export const autoLoginTestUser = (userId: string): TestUser | null => {
  const user = getTestUser(userId);
  if (user && user.autoLogin) {
    localStorage.setItem('test_user_id', userId);
    localStorage.setItem('test_user_data', JSON.stringify(user));
    return user;
  }
  return null;
};

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

export const logoutTestUser = (): void => {
  localStorage.removeItem('test_user_id');
  localStorage.removeItem('test_user_data');
};

export const getRecommendedTestUsers = (context?: string): TestUser[] => {
  switch (context) {
    case 'hotel':
      return TEST_USERS.filter((user) => user.businessType === 'hotel');
    case 'agency':
      return TEST_USERS.filter((user) => user.businessType === 'agency');
    case 'restaurant':
      return TEST_USERS.filter((user) => user.businessType === 'restaurant');
    case 'attraction':
      return TEST_USERS.filter((user) => user.businessType === 'attraction');
    case 'admin':
      return TEST_USERS.filter((user) => user.role === 'admin');
    case 'municipal':
      return TEST_USERS.filter((user) => user.role === 'gestor_municipal');
    default:
      return TEST_USERS.filter((user) => user.autoLogin);
  }
};
