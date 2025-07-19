import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare, 
  Settings,
  Globe,
  Shield,
  Activity,
  BarChart3,
  Calendar,
  Zap,
  Brain,
  Headphones,
  Wrench,
  FileText,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClientData {
  id: string;
  client_name: string;
  state_name: string;
  status: string;
  monthly_fee: number;
  users_count: number;
  last_activity: string;
  subscription_plan: string;
}

interface SupportTicket {
  id: string;
  client_name: string;
  title: string;
  priority: string;
  status: string;
  created_at: string;
}

interface SystemMetrics {
  total_revenue: number;
  active_clients: number;
  total_users: number;
  system_health: string;
  uptime_percentage: number;
  active_support_tickets: number;
}

const FlowTripMasterDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    total_revenue: 0,
    active_clients: 0,
    total_users: 0,
    system_health: 'excellent',
    uptime_percentage: 99.9,
    active_support_tickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Credenciais do Master (em produção, isso deveria estar no backend)
  const MASTER_EMAIL = 'master@flowtrip.com';
  const MASTER_PASSWORD = 'FlowTripMaster2024!';

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Verificar se já está autenticado
    const checkAuth = localStorage.getItem('flowtrip_master_auth');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      setShowLogin(false);
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginData.email === MASTER_EMAIL && loginData.password === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setShowLogin(false);
      localStorage.setItem('flowtrip_master_auth', 'true');
      loadDashboardData();
    } else {
      setLoginError('Credenciais inválidas. Apenas o Master pode acessar este dashboard.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(true);
    localStorage.removeItem('flowtrip_master_auth');
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dados mockados para demonstração (em produção viriam do banco)
      const mockClients: ClientData[] = [
        {
          id: '1',
          client_name: 'Secretaria de Turismo MS',
          state_name: 'Mato Grosso do Sul',
          status: 'active',
          monthly_fee: 10000,
          users_count: 150,
          last_activity: '2024-07-19T10:30:00Z',
          subscription_plan: 'Premium'
        },
        {
          id: '2',
          client_name: 'Secretaria de Turismo MT',
          state_name: 'Mato Grosso',
          status: 'pending',
          monthly_fee: 5000,
          users_count: 0,
          last_activity: '2024-07-18T15:45:00Z',
          subscription_plan: 'Basic'
        }
      ];

      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          client_name: 'Secretaria de Turismo MS',
          title: 'Dúvida sobre configuração de eventos',
          priority: 'medium',
          status: 'open',
          created_at: '2024-07-19T09:15:00Z'
        },
        {
          id: '2',
          client_name: 'Secretaria de Turismo MT',
          title: 'Problema com upload de imagens',
          priority: 'high',
          status: 'open',
          created_at: '2024-07-19T08:30:00Z'
        }
      ];

      const totalRevenue = mockClients.reduce((sum, client) => sum + client.monthly_fee, 0);

      setMetrics({
        total_revenue: totalRevenue,
        active_clients: mockClients.filter(c => c.status === 'active').length,
        total_users: mockClients.reduce((sum, client) => sum + client.users_count, 0),
        system_health: 'excellent',
        uptime_percentage: 99.9,
        active_support_tickets: mockTickets.length
      });

      setClients(mockClients);
      setTickets(mockTickets);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action: string, data?: any) => {
    console.log(`IA executando ação: ${action}`, data);
    
    // Simular ações da IA
    switch (action) {
      case 'respond_ticket':
        alert('IA respondeu automaticamente ao ticket!');
        break;
      case 'resolve_issue':
        alert('IA resolveu o problema técnico!');
        break;
      case 'generate_report':
        alert('IA gerou relatório mensal!');
        break;
      case 'optimize_system':
        alert('IA otimizou o sistema!');
        break;
    }
  };

  // Tela de Login
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">FlowTrip Master</CardTitle>
            <CardDescription>
              Acesso exclusivo ao Dashboard Master
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Master</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="master@flowtrip.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha Master</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {loginError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Acessar Dashboard Master
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Credenciais de demonstração:</p>
              <p className="font-mono text-xs mt-1">
                Email: master@flowtrip.com<br/>
                Senha: FlowTripMaster2024!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FlowTrip Master Dashboard</h1>
          <p className="text-gray-600">Controle total da plataforma SaaS</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="w-4 h-4 mr-1" />
            Sistema Online
          </Badge>
          <Button onClick={() => handleAIAction('optimize_system')}>
            <Zap className="w-4 h-4 mr-2" />
            IA Otimizar Sistema
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <Shield className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.total_revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_clients}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.total_users} usuários totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime_percentage}%</div>
            <p className="text-xs text-muted-foreground">
              Status: {metrics.system_health}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_support_tickets}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando resposta da IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
          <TabsTrigger value="ai">IA Central</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Estados Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{client.state_name}</p>
                        <p className="text-sm text-gray-600">{client.client_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          R$ {client.monthly_fee.toLocaleString()}/mês
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>CPU</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memória</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">60%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Gerencie todos os estados contratantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{client.state_name}</h3>
                        <p className="text-sm text-gray-600">{client.client_name}</p>
                        <p className="text-sm text-gray-500">
                          Plano: {client.subscription_plan} | 
                          Usuários: {client.users_count} |
                          Última atividade: {new Date(client.last_activity).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {client.monthly_fee.toLocaleString()}/mês</p>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suporte e Tickets</CardTitle>
              <CardDescription>
                Monitoramento de tickets e problemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <p className="text-sm text-gray-600">{ticket.client_name}</p>
                        <p className="text-sm text-gray-500">
                          Criado em: {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          ticket.priority === 'high' ? 'destructive' : 
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority === 'high' ? 'Alta' : 
                           ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAIAction('respond_ticket', ticket.id)}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            IA Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IA Superinteligente</CardTitle>
              <CardDescription>
                Controle das ações automáticas da IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('generate_report')}
                >
                  <FileText className="w-6 h-6 mb-2" />
                  Gerar Relatório Mensal
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('resolve_issue')}
                >
                  <Wrench className="w-6 h-6 mb-2" />
                  Resolver Problemas Técnicos
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('optimize_system')}
                >
                  <Zap className="w-6 h-6 mb-2" />
                  Otimizar Sistema
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => handleAIAction('analyze_clients')}
                >
                  <Brain className="w-6 h-6 mb-2" />
                  Analisar Clientes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlowTripMasterDashboard; 