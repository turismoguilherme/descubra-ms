// Usuários fictícios para teste da plataforma Overflow One
import { UserType } from '../types/overflow-one-auth';

export interface OverflowOneTestUser {
  email: string;
  password: string;
  companyName: string;
  contactPerson: string;
  userType: UserType;
  role: 'admin' | 'manager' | 'user';
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  description: string;
}

export const overflowOneTestUsers: OverflowOneTestUser[] = [
  {
    email: 'admin@overflowone.com',
    password: 'admin123',
    companyName: 'Overflow One Admin',
    contactPerson: 'Administrador Sistema',
    userType: 'master_admin',
    role: 'admin',
    subscriptionPlan: 'enterprise',
    description: 'Usuário administrador com acesso total'
  },
  {
    email: 'empresa1@teste.com',
    password: 'empresa123',
    companyName: 'Hotel Pantanal Premium',
    contactPerson: 'João Silva',
    userType: 'empresa',
    role: 'manager',
    subscriptionPlan: 'premium',
    description: 'Hotel de luxo no Pantanal'
  },
  {
    email: 'empresa2@teste.com',
    password: 'empresa123',
    companyName: 'Agência Turismo Sul',
    contactPerson: 'Maria Santos',
    userType: 'empresa',
    role: 'user',
    subscriptionPlan: 'basic',
    description: 'Agência de turismo regional'
  },
  {
    email: 'atendente1@teste.com',
    password: 'atendente123',
    companyName: 'CAT Campo Grande',
    contactPerson: 'Pedro Atendente',
    userType: 'atendente',
    role: 'user',
    subscriptionPlan: 'basic',
    description: 'Atendente do Centro de Atendimento ao Turista'
  },
  {
    email: 'municipal1@teste.com',
    password: 'municipal123',
    companyName: 'Prefeitura Campo Grande',
    contactPerson: 'Carlos Gestor Municipal',
    userType: 'gestor_municipal',
    role: 'manager',
    subscriptionPlan: 'premium',
    description: 'Gestor Municipal de Turismo'
  },
  {
    email: 'estadual1@teste.com',
    password: 'estadual123',
    companyName: 'SETUR MS',
    contactPerson: 'Ana Gestora Estadual',
    userType: 'gestor_estadual',
    role: 'admin',
    subscriptionPlan: 'enterprise',
    description: 'Gestora Estadual de Turismo'
  }
];

// Função para criar usuários de teste no Supabase
export const createTestUsers = async () => {
  console.log('🔄 Criando usuários de teste para Overflow One...');
  
  // Esta função seria implementada para criar os usuários no Supabase
  // Por enquanto, apenas retorna os dados para referência
  return overflowOneTestUsers;
};

// Função para obter usuário de teste por email
export const getTestUserByEmail = (email: string): OverflowOneTestUser | undefined => {
  return overflowOneTestUsers.find(user => user.email === email);
};

// Função para validar credenciais de teste
export const validateTestCredentials = (email: string, password: string): OverflowOneTestUser | null => {
  const user = getTestUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};
