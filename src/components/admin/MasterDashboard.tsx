import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Globe, 
  Users, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MapPin,
  Zap,
  Database,
  Monitor,
  UserPlus,
  Cog,
  Bell
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  totalUsers: number;
  activeStates: number;
  totalRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  totalCheckIns: number;
  activeEvents: number;
}

interface StateStatus {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  users: number;
  revenue: number;
  lastUpdate: string;
  version: string;
}

const MasterDashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeStates: 0,
    totalRevenue: 0,
    systemHealth: 'healthy',
    totalCheckIns: 0,
    activeEvents: 0
  });

  const [states, setStates] = useState<StateStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemMetrics();
    fetchStatesStatus();
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      // Buscar métricas do sistema
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('status', 'active');

      const { data: statesData } = await supabase
        .from('flowtrip_states')
        .select('id')
        .eq('is_active', true);

      const { data: checkInsData } = await supabase
        .from('cat_checkins')
        .select('id');

      const { data: eventsData } = await supabase
        .from('events')
        .select('id')
        .eq('is_visible', true);

      setMetrics({
        totalUsers: usersData?.length || 0,
        activeStates: statesData?.length || 0,
        totalRevenue: 2850000, // Valor exemplo - implementar cálculo real
        systemHealth: 'healthy',
        totalCheckIns: checkInsData?.length || 0,
        activeEvents: eventsData?.length || 0
      });

    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar métricas do sistema",
        variant: "destructive"
      });
    }
  };

  const fetchStatesStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('flowtrip_states')
        .select(`
          id,
          name,
          code,
          is_active,
          created_at,
          updated_at
        `);

      if (error) throw error;

      const statesWithMetrics = await Promise.all(
        data?.map(async (state) => {
          // Buscar usuários por estado
          const { data: usersData } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('state_id', state.id)
            .eq('status', 'active');

          return {
            id: state.id,
            name: state.name,
            status: state.is_active ? 'active' : 'inactive' as 'active' | 'maintenance' | 'inactive',
            users: usersData?.length || 0,
            revenue: Math.floor(Math.random() * 500000) + 100000, // Exemplo
            lastUpdate: new Date(state.updated_at).toLocaleString('pt-BR'),
            version: '1.0.0'
          };
        }) || []
      );

      setStates(statesWithMetrics);
    } catch (error) {
      console.error('Erro ao buscar status dos estados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar status dos estados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      maintenance: 'bg-yellow-500',
      inactive: 'bg-red-500'
    };

    const labels = {
      active: 'Ativo',
      maintenance: 'Manutenção',
      inactive: 'Inativo'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Master Dashboard</h1>
            <p className="text-muted-foreground">
              Central de controle da plataforma FlowTrip
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alertas
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Usuários
                </p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Estados Ativos
                </p>
                <p className="text-2xl font-bold">{metrics.activeStates}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </p>
                <p className="text-2xl font-bold">
                  R$ {(metrics.totalRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Check-ins
                </p>
                <p className="text-2xl font-bold">{metrics.totalCheckIns.toLocaleString()}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Eventos Ativos
                </p>
                <p className="text-2xl font-bold">{metrics.activeEvents}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status do Sistema
                </p>
                <p className="text-sm font-semibold text-green-600">Saudável</p>
              </div>
              {getHealthIcon(metrics.systemHealth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="states" className="space-y-4">
        <TabsList>
          <TabsTrigger value="states">Estados</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estados da Federação</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Estado
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredStates.map((state) => (
                  <div
                    key={state.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{state.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {state.users} usuários ativos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {(state.revenue / 1000).toFixed(0)}k
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Atualizado: {state.lastUpdate}
                        </p>
                      </div>
                      {getStatusBadge(state.status)}
                      <Button variant="outline" size="sm">
                        <Cog className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários Master</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sistema de gestão de usuários em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Central de configurações em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dashboard de analytics em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterDashboard; 