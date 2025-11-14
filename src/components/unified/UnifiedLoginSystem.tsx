import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  MapPin, 
  Bot, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  type: 'private_company' | 'municipal_government' | 'cat_location';
  region: string;
  city: string;
  country: string;
  isActive: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  role: 'private' | 'secretary' | 'attendant' | 'admin';
  organization: Organization;
  permissions: string[];
  profile: {
    name: string;
    avatar?: string;
    phone?: string;
  };
}

const UnifiedLoginSystem = () => {
  const { user, login, logout } = useAuth();
  const { userRole, permissions, canAccess } = useRoleBasedAccess();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Carregar organizações disponíveis
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Redirecionar automaticamente baseado no role
  useEffect(() => {
    if (user && userRole) {
      redirectToDashboard();
    }
  }, [user, userRole]);

  const loadOrganizations = async () => {
    try {
      // Simular carregamento de organizações
      const mockOrganizations: Organization[] = [
        {
          id: '1',
          name: 'Hotel Bonito Palace',
          type: 'private_company',
          region: 'Mato Grosso do Sul',
          city: 'Bonito',
          country: 'Brasil',
          isActive: true
        },
        {
          id: '2',
          name: 'Prefeitura de Bonito',
          type: 'municipal_government',
          region: 'Mato Grosso do Sul',
          city: 'Bonito',
          country: 'Brasil',
          isActive: true
        },
        {
          id: '3',
          name: 'CAT Bonito - Centro',
          type: 'cat_location',
          region: 'Mato Grosso do Sul',
          city: 'Bonito',
          country: 'Brasil',
          isActive: true
        }
      ];
      
      setOrganizations(mockOrganizations);
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "✅ Login realizado",
          description: "Redirecionando para seu dashboard..."
        });
        
        // Redirecionar baseado no role
        redirectToDashboard();
      } else {
        toast({
          title: "❌ Erro no login",
          description: result.error || "Credenciais inválidas",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "❌ Erro no login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = () => {
    switch (userRole) {
      case 'private':
        navigate('/private-dashboard');
        break;
      case 'secretary':
        navigate('/municipal-dashboard');
        break;
      case 'attendant':
        navigate('/attendant-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'private':
        return <Building2 className="h-5 w-5" />;
      case 'secretary':
        return <Shield className="h-5 w-5" />;
      case 'attendant':
        return <Users className="h-5 w-5" />;
      case 'admin':
        return <Bot className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'private':
        return 'Empresas do setor privado';
      case 'secretary':
        return 'Secretarias de turismo';
      case 'attendant':
        return 'Atendentes dos CATs';
      case 'admin':
        return 'Administradores do sistema';
      default:
        return 'Usuário comum';
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bem-vindo à viajAR</CardTitle>
            <p className="text-gray-600">Redirecionando para seu dashboard...</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              {getRoleIcon(userRole)}
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-600">{getRoleDescription(userRole)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={redirectToDashboard} className="flex-1">
                <ArrowRight className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
              <Button variant="outline" onClick={logout}>
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">viajAR</CardTitle>
          <p className="text-gray-600">Plataforma unificada para turismo</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organização</Label>
              <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua organização" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(org.type === 'private_company' ? 'private' : 
                                     org.type === 'municipal_government' ? 'secretary' : 'attendant')}
                        <span>{org.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {org.type === 'private_company' ? 'Privado' : 
                           org.type === 'municipal_government' ? 'Público' : 'CAT'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Tipos de acesso disponíveis:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Setor Privado - Sistema de diagnóstico inteligente</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secretarias - Gestão de turismo municipal</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-purple-600" />
                <span>CATs - Atendimento ao turista com IA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLoginSystem;


