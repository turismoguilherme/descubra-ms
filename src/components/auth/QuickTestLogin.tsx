/**
 * Quick Test Login Component
 * Componente para login rápido de testes nos dashboards
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  Building2, 
  Users,
  Zap,
  X
} from 'lucide-react';
import { getTestUser, autoLoginTestUser, type TestUser } from '@/services/auth/TestUsers';

interface QuickTestLoginProps {
  onLogin?: (user: TestUser) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const QuickTestLogin: React.FC<QuickTestLoginProps> = ({ 
  onLogin, 
  onClose,
  showCloseButton = true 
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleQuickLogin = async (userId: string, role: string) => {
    setIsLoading(userId);
    
    try {
      const user = getTestUser(userId);
      if (!user) {
        console.error('Usuário de teste não encontrado:', userId);
        return;
      }

      // Salvar no localStorage
      autoLoginTestUser(userId);
      
      // Aguardar um pouco para o AuthProvider processar
      setTimeout(() => {
        if (onLogin) {
          onLogin(user);
        } else {
          // Redirecionar baseado no role
          switch (role) {
            case 'admin':
              navigate('/viajar/dashboard');
              break;
            case 'gestor_municipal':
              navigate('/secretary-dashboard');
              break;
            case 'user':
              navigate('/private-dashboard');
              break;
            case 'atendente':
            case 'cat_attendant':
              navigate('/attendant-dashboard');
              break;
            default:
              navigate('/unified');
          }
        }
        setIsLoading(null);
      }, 500);
    } catch (error) {
      console.error('Erro ao fazer login de teste:', error);
      setIsLoading(null);
    }
  };

  const privateUsers = [
    { id: 'hotel-owner-1', name: 'João Silva', business: 'Pousada do Sol', icon: '🏨' },
    { id: 'agency-owner-1', name: 'Maria Santos', business: 'Viagens & Cia', icon: '🚌' },
    { id: 'restaurant-owner-1', name: 'Pedro Oliveira', business: 'Sabores do MS', icon: '🍽️' },
    { id: 'attraction-owner-1', name: 'Ana Costa', business: 'Parque das Cachoeiras', icon: '🎯' },
  ];

  const publicUsers = [
    { id: 'municipal-1', name: 'Prefeitura Bonito', business: 'Secretaria de Turismo', icon: '🏛️' },
    { id: 'attendant-1', name: 'Maria Silva', business: 'CAT Centro', icon: '👩‍💼' },
    { id: 'cat-attendant-1', name: 'João Santos', business: 'CAT Aeroporto', icon: '👨‍💼' },
  ];

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Login Rápido de Testes</CardTitle>
          </div>
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Setor Privado */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-700">Setor Privado</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {privateUsers.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin(user.id, 'user')}
                disabled={isLoading === user.id}
                className="justify-start h-auto py-2 px-3 text-left hover:bg-blue-50"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-lg">{user.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.business}</div>
                  </div>
                  {isLoading === user.id && (
                    <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Setor Público */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-600" />
            <h3 className="font-semibold text-sm text-gray-700">Setor Público</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {publicUsers.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin(
                  user.id, 
                  user.id === 'municipal-1' ? 'gestor_municipal' : 'atendente'
                )}
                disabled={isLoading === user.id}
                className="justify-start h-auto py-2 px-3 text-left hover:bg-purple-50"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-lg">{user.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.business}</div>
                  </div>
                  {isLoading === user.id && (
                    <div className="animate-spin h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Link para página completa */}
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/test-login')}
            className="w-full text-xs"
          >
            <LogIn className="h-3 w-3 mr-2" />
            Ver todos os usuários de teste
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickTestLogin;

