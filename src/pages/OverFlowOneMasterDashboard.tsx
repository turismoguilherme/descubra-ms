import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  MapPin, 
  Calendar, 
  BarChart3, 
  Shield, 
  Building2,
  Crown,
  Star,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';

// Importar dashboards dos órgãos públicos
import AtendenteDashboard from '@/components/admin/dashboards/AtendenteDashboard';
import MunicipalDashboard from '@/components/admin/dashboards/MunicipalDashboard';
import EstadualDashboard from '@/components/admin/dashboards/EstadualDashboard';

const OverflowOneMasterDashboard: React.FC = () => {
  const { user, userProfile } = useOverflowOneAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Dados simulados para o dashboard
  const masterData = {
    totalUsers: 1247,
    activeCompanies: 89,
    totalRevenue: 156780,
    monthlyGrowth: 12.5,
    recentActivities: [
      { id: 1, type: 'user', message: 'Nova empresa cadastrada: Hotel Pantanal', time: '2 min atrás' },
      { id: 2, type: 'payment', message: 'Pagamento recebido: R$ 2.500', time: '15 min atrás' },
      { id: 3, type: 'support', message: 'Ticket de suporte resolvido', time: '1 hora atrás' },
      { id: 4, type: 'system', message: 'Backup automático concluído', time: '2 horas atrás' }
    ],
    systemStats: {
      uptime: '99.9%',
      responseTime: '120ms',
      activeConnections: 456,
      storageUsed: '2.3GB'
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-green-500" />;
      case 'payment': return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'support': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'system': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Master Dashboard
              </h1>
              <p className="text-gray-600">Controle total da plataforma Overflow One</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                Sistema Online
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="atendentes">Atendentes CATs</TabsTrigger>
            <TabsTrigger value="municipais">Gestores Municipais</TabsTrigger>
            <TabsTrigger value="estaduais">Gestores Estaduais</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                      <p className="text-2xl font-bold text-gray-900">{masterData.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Empresas Ativas</p>
                      <p className="text-2xl font-bold text-gray-900">{masterData.activeCompanies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Total</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {masterData.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Crescimento</p>
                      <p className="text-2xl font-bold text-gray-900">+{masterData.monthlyGrowth}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Atividades Recentes e Stats do Sistema */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {masterData.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Uptime</span>
                      <Badge className="bg-green-100 text-green-800">{masterData.systemStats.uptime}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Tempo de Resposta</span>
                      <span className="text-sm text-gray-900">{masterData.systemStats.responseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Conexões Ativas</span>
                      <span className="text-sm text-gray-900">{masterData.systemStats.activeConnections}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Armazenamento</span>
                      <span className="text-sm text-gray-900">{masterData.systemStats.storageUsed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Atendentes CATs */}
          <TabsContent value="atendentes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Dashboard dos Atendentes dos CATs
                </CardTitle>
                <p className="text-muted-foreground">
                  Visualização e controle dos atendentes dos Centros de Atendimento ao Turista
                </p>
              </CardHeader>
              <CardContent>
                <AtendenteDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestores Municipais */}
          <TabsContent value="municipais">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dashboard dos Gestores Municipais
                </CardTitle>
                <p className="text-muted-foreground">
                  Gestão municipal do turismo e análise de dados locais
                </p>
              </CardHeader>
              <CardContent>
                <MunicipalDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestores Estaduais */}
          <TabsContent value="estaduais">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dashboard dos Gestores Estaduais
                </CardTitle>
                <p className="text-muted-foreground">
                  Visão estadual do turismo e coordenação regional
                </p>
              </CardHeader>
              <CardContent>
                <EstadualDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestão de Conteúdo */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Gerenciar eventos turísticos</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Roteiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Gerenciar roteiros turísticos</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Passaporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Gerenciar passaporte digital</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Configurações em Desenvolvimento
                  </h3>
                  <p className="text-gray-600">
                    Esta seção estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OverflowOneMasterDashboard;