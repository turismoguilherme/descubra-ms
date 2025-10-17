/**
 * Test User Selector Component
 * Seletor de usuários de teste para desenvolvimento
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  LogIn, 
  User, 
  Building2, 
  Star,
  Zap,
  CheckCircle,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getAllTestUsers, 
  getTestUsersByBusinessType, 
  getTestUsersByRole,
  autoLoginTestUser,
  getCurrentTestUser,
  logoutTestUser,
  type TestUser 
} from '@/services/auth/TestUsers';

interface TestUserSelectorProps {
  onUserSelected: (user: TestUser) => void;
  onCancel: () => void;
  className?: string;
}

const TestUserSelector: React.FC<TestUserSelectorProps> = ({
  onUserSelected,
  onCancel,
  className
}) => {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<TestUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<TestUser | null>(null);

  useEffect(() => {
    const allUsers = getAllTestUsers();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
    
    const current = getCurrentTestUser();
    setCurrentUser(current);
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de negócio
    if (selectedBusinessType !== 'all') {
      filtered = filtered.filter(user => user.businessType === selectedBusinessType);
    }

    // Filtrar por role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedBusinessType, selectedRole]);

  const handleUserSelect = (user: TestUser) => {
    autoLoginTestUser(user.id);
    onUserSelected(user);
  };

  const handleLogout = () => {
    logoutTestUser();
    setCurrentUser(null);
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'agency': return '🚌';
      case 'restaurant': return '🍽️';
      case 'attraction': return '🎯';
      default: return '🏢';
    }
  };

  const getBusinessTypeColor = (type: string) => {
    switch (type) {
      case 'hotel': return 'text-blue-600 bg-blue-100';
      case 'agency': return 'text-green-600 bg-green-100';
      case 'restaurant': return 'text-orange-600 bg-orange-100';
      case 'attraction': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'gestor_municipal': return 'text-indigo-600 bg-indigo-100';
      case 'user': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Usuários de Teste</h1>
        </div>
        <p className="text-muted-foreground">
          Selecione um usuário para testar as funcionalidades da ViaJAR
        </p>
      </div>

      {/* Usuário Atual */}
      {currentUser && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  {currentUser.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    Logado como: {currentUser.name}
                  </h3>
                  <p className="text-sm text-green-600">
                    {currentUser.businessName} • {currentUser.description}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, empresa ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessType">Tipo de Negócio</Label>
              <select
                id="businessType"
                value={selectedBusinessType}
                onChange={(e) => setSelectedBusinessType(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="all">Todos os tipos</option>
                <option value="hotel">Hotel/Pousada</option>
                <option value="agency">Agência de Viagem</option>
                <option value="restaurant">Restaurante</option>
                <option value="attraction">Atração Turística</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <Label htmlFor="role">Função</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="all">Todas as funções</option>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
                <option value="gestor_municipal">Gestor Municipal</option>
                <option value="atendente">Atendente</option>
                <option value="cat_attendant">Atendente CAT</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.businessName}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{user.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getBusinessTypeColor(user.businessType)}>
                  {getBusinessTypeIcon(user.businessType)} {user.businessType}
                </Badge>
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Funcionalidades:</h4>
                <div className="flex flex-wrap gap-1">
                  {user.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {user.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.features.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => handleUserSelect(user)}
                className="w-full flex items-center gap-2"
                disabled={currentUser?.id === user.id}
              >
                {currentUser?.id === user.id ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Logado
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Fazer Login
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar usuários
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {currentUser && (
          <Button onClick={() => onUserSelected(currentUser)}>
            Continuar com {currentUser.name}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TestUserSelector;
