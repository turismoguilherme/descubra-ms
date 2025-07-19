import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Crown, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Globe,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Edit,
  Plus,
  Building2
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const EstadualDashboard = () => {
  const { cityId, regionId, getDisplayName } = useRoleBasedAccess();
  const [searchTerm, setSearchTerm] = useState('');

  const [stateStats] = useState([
    {
      title: 'Regiões Turísticas',
      value: '10',
      change: '+0',
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      description: 'Regiões turísticas do MS'
    },
    {
      title: 'Municípios Ativos',
      value: '79',
      change: '+2',
      icon: <Building2 className="h-6 w-6 text-green-600" />,
      description: 'Cidades com turismo ativo'
    },
    {
      title: 'Visitantes Estaduais',
      value: '15.234',
      change: '+18%',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      description: 'Turistas no MS hoje'
    },
    {
      title: 'Receita Estadual',
      value: 'R$ 2.8M',
      change: '+22%',
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      description: 'Receita turística mensal'
    }
  ]);

  const [regions] = useState([
    {
      id: 1,
      name: 'Bonito / Serra da Bodoquena',
      status: 'active',
      cities: 8,
      destinations: 45,
      visitors: 3456,
      revenue: 'R$ 456.2k',
      lastUpdate: '1 hora atrás'
    },
    {
      id: 2,
      name: 'Pantanal',
      status: 'active',
      cities: 5,
      destinations: 32,
      visitors: 2890,
      revenue: 'R$ 389.1k',
      lastUpdate: '2 horas atrás'
    },
    {
      id: 3,
      name: 'Caminho dos Ipês',
      status: 'active',
      cities: 9,
      destinations: 28,
      visitors: 2345,
      revenue: 'R$ 312.8k',
      lastUpdate: '3 horas atrás'
    },
    {
      id: 4,
      name: 'Rota Norte',
      status: 'active',
      cities: 11,
      destinations: 23,
      visitors: 1890,
      revenue: 'R$ 245.6k',
      lastUpdate: '4 horas atrás'
    },
    {
      id: 5,
      name: 'Costa Leste',
      status: 'maintenance',
      cities: 7,
      destinations: 19,
      visitors: 1234,
      revenue: 'R$ 167.3k',
      lastUpdate: '1 dia atrás'
    }
  ]);

  const [stateEvents] = useState([
    {
      id: 1,
      name: 'Festival de Turismo MS',
      date: '25-30 Julho',
      status: 'upcoming',
      attendees: 5000,
      location: 'Campo Grande',
      regions: ['Todas as regiões']
    },
    {
      id: 2,
      name: 'Rota Gastronômica Estadual',
      date: '10-15 Agosto',
      status: 'planning',
      attendees: 3000,
      location: 'MS - Estado',
      regions: ['Bonito', 'Pantanal', 'Caminho dos Ipês']
    },
    {
      id: 3,
      name: 'Ecoturismo MS',
      date: '5-12 Setembro',
      status: 'upcoming',
      attendees: 2500,
      location: 'Múltiplas regiões',
      regions: ['Bonito', 'Pantanal', 'Costa Leste']
    }
  ]);

  const [quickActions] = useState([
    {
      name: 'Gerenciar Regiões',
      description: 'Administrar regiões turísticas',
      icon: <Globe className="h-4 w-4" />,
      action: 'manage-regions'
    },
    {
      name: 'Criar Evento Estadual',
      description: 'Organizar evento para todo MS',
      icon: <Calendar className="h-4 w-4" />,
      action: 'create-state-event'
    },
    {
      name: 'Relatórios Estaduais',
      description: 'Visualizar analytics do estado',
      icon: <BarChart3 className="h-4 w-4" />,
      action: 'state-reports'
    },
    {
      name: 'Configurações Estaduais',
      description: 'Configurar preferências do estado',
      icon: <Settings className="h-4 w-4" />,
      action: 'state-settings'
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Dashboard Estadual
              </h1>
              <p className="text-orange-100">
                Bem-vindo(a), {getDisplayName()}. Gerencie o turismo de Mato Grosso do Sul.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-orange-200">Estado</p>
                <p className="font-semibold">Mato Grosso do Sul</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar regiões, cidades ou eventos estaduais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <Button className="h-12 px-6">
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento Estadual
            </Button>
          </div>
        </div>
      </section>

      {/* State Stats */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stateStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Regions and Events */}
            <div className="lg:col-span-2 space-y-6">
              {/* Regions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Regiões Turísticas
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regions.map((region) => (
                      <div key={region.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{region.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{region.cities} cidades</span>
                              <span>{region.destinations} destinos</span>
                              <span>{region.visitors} visitantes</span>
                              <span>{region.revenue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={region.status === 'active' ? 'default' : 'secondary'}
                          >
                            {region.status === 'active' ? 'Ativa' : 'Manutenção'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* State Events */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Eventos Estaduais
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Evento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stateEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{event.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{event.date}</span>
                              <span>{event.location}</span>
                              <span>{event.attendees} participantes</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">Regiões:</span>
                              {event.regions.map((region, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                          >
                            {event.status === 'upcoming' ? 'Próximo' : 'Planejamento'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Ações Estaduais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button key={index} variant="outline" className="w-full justify-start h-auto p-3">
                        {action.icon}
                        <div className="ml-3 text-left">
                          <p className="font-semibold">{action.name}</p>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* State Analytics */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Estadual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Visitantes este mês</span>
                      <span className="font-semibold">45.678</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receita estadual</span>
                      <span className="font-semibold">R$ 2.8M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Regiões ativas</span>
                      <span className="font-semibold">9/10</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Municípios ativos</span>
                      <span className="font-semibold">79/79</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Eventos ativos</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Ver Relatório Estadual
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* State Activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Atividade Estadual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Novo evento estadual - Festival de Turismo MS</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Região Bonito atualizada - 45 destinos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Relatório estadual gerado - Julho 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Rota gastronômica estadual planejada</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Nova cidade ativada - Paraíso das Águas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EstadualDashboard; 