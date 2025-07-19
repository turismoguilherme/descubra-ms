import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar dados dos clientes
      const { data: clientsData } = await supabase
        .from('flowtrip_clients')
        .select(`
          id,
          client_name,
          status,
          flowtrip_states(name),
          flowtrip_subscriptions(monthly_fee, plan_type)
        `);

      // Carregar tickets de suporte
      const { data: ticketsData } = await supabase
        .from('flowtrip_support_tickets')
        .select(`
          id,
          title,
          priority,
          status,
          created_at,
          flowtrip_clients(client_name)
        `)
        .eq('status', 'open');

      // Calcular métricas
      const totalRevenue = clientsData?.reduce((sum, client) => {
        return sum + (client.flowtrip_subscriptions?.[0]?.monthly_fee || 0);
      }, 0) || 0;

      setMetrics({
        total_revenue: totalRevenue,
        active_clients: clientsData?.filter(c => c.status === 'active').length || 0,
        total_users: 0, // Implementar contagem de usuários
        system_health: 'excellent',
        uptime_percentage: 99.9,
        active_support_tickets: ticketsData?.length || 0
      });

      setClients(clientsData || []);
      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action: string, data?: any) => {
    // Simular ações da IA
    console.log(`IA executando ação: ${action}`, data);
    
    // Aqui você implementaria as chamadas para a IA
    switch (action) {
      case 'respond_ticket':
        // IA responde automaticamente ao ticket
        break;
      case 'resolve_issue':
        // IA resolve problema técnico
        break;
      case 'generate_report':
        // IA gera relatório
        break;
      case 'optimize_system':
        // IA otimiza sistema
        break;
    }
  };

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
              Estados contratantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime_percentage}%</div>
            <p className="text-xs text-muted-foreground">
              Sistema estável
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
              Aguardando resolução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="support">Suporte IA</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ações Rápidas da IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Ações Rápidas da IA
                </CardTitle>
                <CardDescription>
                  Comandos para a IA gerenciar automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleAIAction('respond_all_tickets')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  IA Responder Todos os Tickets
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleAIAction('generate_monthly_report')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  IA Gerar Relatório Mensal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleAIAction('optimize_performance')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  IA Otimizar Performance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleAIAction('security_audit')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  IA Auditoria de Segurança
                </Button>
              </CardContent>
            </Card>

            {/* Status do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Servidor Principal</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Banco de Dados</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>IA Assistant</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Automático</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Funcionando
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Ativos</CardTitle>
              <CardDescription>
                Estados contratantes da plataforma FlowTrip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{client.client_name}</h3>
                      <p className="text-sm text-gray-600">
                        Plano: {client.flowtrip_subscriptions?.[0]?.plan_type || 'Básico'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAIAction('client_analysis', client.id)}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        IA Analisar
                      </Button>
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
              <CardTitle>Suporte Automatizado por IA</CardTitle>
              <CardDescription>
                Tickets sendo gerenciados automaticamente pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{ticket.title}</h3>
                      <p className="text-sm text-gray-600">
                        Cliente: {ticket.flowtrip_clients?.client_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        ticket.priority === 'high' ? 'destructive' : 
                        ticket.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {ticket.priority}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAIAction('respond_ticket', ticket.id)}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        IA Responder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoramento do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>CPU</span>
                    <span className="text-green-600">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memória</span>
                    <span className="text-yellow-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disco</span>
                    <span className="text-green-600">32%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rede</span>
                    <span className="text-green-600">12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações da IA no Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleAIAction('backup_verification')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    IA Verificar Backups
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleAIAction('security_scan')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    IA Scan de Segurança
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleAIAction('performance_optimization')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    IA Otimizar Performance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics da Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15.2k</div>
                  <div className="text-sm text-gray-600">Usuários Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">2.3s</div>
                  <div className="text-sm text-gray-600">Tempo de Resposta</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlowTripMasterDashboard; 