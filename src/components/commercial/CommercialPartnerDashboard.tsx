import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Calendar,
  MapPin,
  Globe,
  Phone,
  Mail,
  Edit,
  Settings
} from 'lucide-react';
import { useCommercialPartners } from '@/hooks/useCommercialPartners';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CommercialPartnerDashboard: React.FC = () => {
  const { partners, isLoading } = useCommercialPartners();

  // Mock data para demonstração
  const mockMetrics = {
    totalViews: 1247,
    totalClicks: 89,
    conversionRate: 7.1,
    totalLeads: 23,
    monthlyGrowth: 12.5,
  };

  const mockChartData = [
    { month: 'Jan', views: 400, clicks: 24, leads: 4 },
    { month: 'Fev', views: 300, clicks: 13, leads: 2 },
    { month: 'Mar', views: 500, clicks: 35, leads: 7 },
    { month: 'Abr', views: 450, clicks: 28, leads: 5 },
    { month: 'Mai', views: 600, clicks: 42, leads: 8 },
    { month: 'Jun', views: 550, clicks: 38, leads: 6 },
  ];

  const mockTrafficSources = [
    { source: 'Portal Principal', visitors: 45, percentage: 45 },
    { source: 'Google Search', visitors: 30, percentage: 30 },
    { source: 'Redes Sociais', visitors: 15, percentage: 15 },
    { source: 'Referências', visitors: 10, percentage: 10 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Simular dados do parceiro logado (em produção viria da autenticação)
  const currentPartner = partners[0] || {
    id: '1',
    company_name: 'Empresa Exemplo',
    business_type: 'Tecnologia',
    subscription_plan: 'premium',
    status: 'approved',
    city: 'Campo Grande',
    state: 'MS',
    contact_email: 'contato@exemplo.com',
    contact_phone: '(67) 99999-9999',
    website: 'https://exemplo.com',
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Parceiro</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, {currentPartner.company_name}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Status e Plano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status da Conta</p>
                <Badge className={`mt-2 ${currentPartner.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {currentPartner.status === 'approved' ? 'Aprovado' : 'Pendente'}
                </Badge>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plano Atual</p>
                <Badge className={`mt-2 ${getPlanBadgeColor(currentPartner.subscription_plan)}`}>
                  {currentPartner.subscription_plan.toUpperCase()}
                </Badge>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próxima Cobrança</p>
                <p className="text-lg font-semibold text-gray-900">15/11/2024</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{mockMetrics.monthlyGrowth}% vs mês anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <MousePointer className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cliques</p>
                <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalClicks}</p>
                <p className="text-sm text-gray-500">{mockMetrics.conversionRate}% taxa de conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Gerados</p>
                <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalLeads}</p>
                <p className="text-sm text-gray-500">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Crescimento</p>
                <p className="text-2xl font-bold text-gray-900">+{mockMetrics.monthlyGrowth}%</p>
                <p className="text-sm text-green-600">vs mês anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="traffic">Tráfego</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="leads" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fontes de Tráfego</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockTrafficSources}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Visitantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTrafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source.source}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{currentPartner.company_name}</p>
                      <p className="text-sm text-gray-600">{currentPartner.business_type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{currentPartner.city}, {currentPartner.state}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{currentPartner.contact_email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{currentPartner.contact_phone}</p>
                    </div>
                  </div>
                  
                  {currentPartner.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <a 
                          href={currentPartner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {currentPartner.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommercialPartnerDashboard;
