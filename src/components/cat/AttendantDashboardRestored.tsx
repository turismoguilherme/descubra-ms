/**
 * Dashboard do Atendente - Versão Restaurada
 * Layout conforme imagem fornecida
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Bot,
  BarChart3,
  Settings
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useAuth } from '@/hooks/useAuth';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import CATCheckInSection from './CATCheckInSection';
import CATAIInterface from './CATAIInterface';
import CATReportsSection from './CATReportsSection';

const AttendantDashboardRestored: React.FC = () => {
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('AttendantDashboardRestored: AuthProvider não disponível:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }

  const { user } = auth;
  
  // Hooks devem ser chamados sempre, não condicionalmente
  let roleAccess;
  try {
    roleAccess = useRoleBasedAccess();
  } catch (error) {
    console.error('AttendantDashboardRestored: Erro ao obter role access:', error);
    // Retornar valores padrão se houver erro
    roleAccess = {
      isAttendant: false,
      userRole: 'user' as const,
      isAdmin: false,
      isManager: false,
      isSecretary: false,
      isPrivate: false,
      permissions: {} as any,
      canAccess: () => false,
      getDashboardComponent: () => '',
      getDisplayName: () => '',
      getDescription: () => '',
      regionId: undefined,
      cityId: undefined
    };
  }
  
  const isAttendant = roleAccess?.isAttendant || false;
  const userRole = roleAccess?.userRole || 'user';

  // Debug: Log do estado de autenticação
  console.log('🔍 AttendantDashboardRestored: Estado atual:', {
    user: user ? { id: user.id, email: user.email } : null,
    isAttendant,
    userRole,
    testUserId: typeof window !== 'undefined' ? localStorage.getItem('test_user_id') : null,
    testUserData: typeof window !== 'undefined' ? localStorage.getItem('test_user_data') : null
  });

  const [activeTab, setActiveTab] = useState('checkin');

  // Forçar processamento de usuário de teste se necessário
  useEffect(() => {
    let testUserId: string | null = null;
    let testUserData: string | null = null;
    
    try {
      testUserId = typeof window !== 'undefined' ? localStorage.getItem('test_user_id') : null;
      testUserData = typeof window !== 'undefined' ? localStorage.getItem('test_user_data') : null;
    } catch (e) {
      // Ignorar erros de localStorage
    }
    
    if (testUserId && testUserData && !user) {
      console.log('🔍 AttendantDashboardRestored: Forçando processamento de usuário de teste...');
      // Disparar evento customizado para o AuthProvider processar
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          // Também tentar novamente após um pequeno delay
          const timeout = setTimeout(() => {
            window.dispatchEvent(new Event('storage'));
          }, 100);
          
          return () => clearTimeout(timeout);
        }
      } catch (e) {
        console.warn('🔍 AttendantDashboardRestored: Erro ao disparar evento:', e);
      }
    }
  }, [user]);

  // Verificar se há usuário de teste no localStorage (aguardar processamento)
  let testUserId: string | null = null;
  let testUserData: string | null = null;
  
  try {
    testUserId = typeof window !== 'undefined' ? localStorage.getItem('test_user_id') : null;
    testUserData = typeof window !== 'undefined' ? localStorage.getItem('test_user_data') : null;
  } catch (e) {
    console.warn('🔍 AttendantDashboardRestored: Erro ao acessar localStorage:', e);
  }
  
  // Se há usuário de teste mas ainda não foi processado, aguardar
  if (testUserId && testUserData && !user) {
    try {
      const testUser = JSON.parse(testUserData);
      const isTestAttendant = testUser.role === 'atendente' || testUser.role === 'cat_attendant';
      
      if (isTestAttendant) {
        console.log('🔍 AttendantDashboardRestored: Aguardando processamento do usuário de teste...');
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando usuário de teste...</p>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('🔍 AttendantDashboardRestored: Erro ao processar usuário de teste:', error);
    }
  }

  if (!user || !isAttendant) {
    console.warn('🔍 AttendantDashboardRestored: Acesso negado', {
      hasUser: !!user,
      isAttendant,
      userRole
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
          <p className="text-gray-700 mb-4">Você não tem permissão para acessar este dashboard.</p>
          <p className="text-sm text-gray-500 mb-4">
            Role: {userRole || 'não definido'} | isAttendant: {isAttendant ? 'sim' : 'não'}
          </p>
          <Button onClick={() => window.location.href = '/test-login'}>Voltar para Login de Teste</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header com gradiente azul-roxo */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard do Atendente</h1>
              <p className="text-blue-100 mt-2">Bem-vindo, {user?.name || 'Atendente'}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar Esquerda */}
        <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Atendente</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('checkin')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'checkin' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-4 w-4" />
                Controle de Ponto
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'ai' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bot className="h-4 w-4" />
                IA Guilherme
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === 'reports' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Relatórios
              </button>
            </nav>
          </div>
                </div>
                
        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {/* Controle de Ponto */}
          {activeTab === 'checkin' && (
            <CATCheckInSection catName="CAT Centro" />
          )}

          {/* IA Guilherme */}
          {activeTab === 'ai' && (
            <CATAIInterface catId={undefined} />
          )}

          {/* Relatórios */}
          {activeTab === 'reports' && (
            <CATReportsSection catId={undefined} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendantDashboardRestored;
