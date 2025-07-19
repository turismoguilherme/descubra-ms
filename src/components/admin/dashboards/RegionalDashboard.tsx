import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Building2,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const RegionalDashboard = () => {
  const { cityId, regionId, getDisplayName } = useRoleBasedAccess();
  const [searchTerm, setSearchTerm] = useState('');

  const [regionalStats] = useState([
    {
      title: 'Cidades na Região',
      value: '8',
      change: '+0',
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      description: 'Municípios da região turística'
    },
    {
      title: 'Destinos Ativos',
      value: '45',
      change: '+5',
      icon: <MapPin className="h-6 w-6 text-green-600" />,
      description: 'Destinos turísticos regionais'
    },
    {
      title: 'Visitantes Regionais',
      value: '1.234',
      change: '+15%',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      description: 'Turistas na região hoje'
    },
    {
      title: 'Receita Regional',
      value: 'R$ 156.8k',
      change: '+12%',
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      description: 'Receita turística mensal'
    }
  ]);

  const [cities] = useState([
    {
      id: 1,
      name: 'Corumbá',
      status: 'active',
      destinations: 12,
      visitors: 456,
      revenue: 'R$ 45.2k',
      lastUpdate: '1 hora atrás'
    },
    {
      id: 2,
      name: 'Aquidauana',
      status: 'active',
      destinations: 8,
      visitors: 234,
      revenue: 'R$ 23.1k',
      lastUpdate: '2 horas atrás'
    },
    {
      id: 3,
      name: 'Miranda',
      status: 'active',
      destinations: 6,
      visitors: 189,
      revenue: 'R$ 18.9k',
      lastUpdate: '3 horas atrás'
    },
    {
      id: 4,
      name: 'Anastácio',
      status: 'maintenance',
      destinations: 4,
      visitors: 67,
      revenue: 'R$ 6.7k',
      lastUpdate: '1 dia atrás'
    }
  ]);

  const [regionalEvents] = useState([
    {
      id: 1,
      name: 'Festival do Pantanal',
      date: '20-25 Julho',
      status: 'upcoming',
      attendees: 2500,
      location: 'Corumbá',
      cities: ['Corumbá', 'Aquidauana', 'Miranda']
    },
    {
      id: 2,
      name: 'Rota Gastronômica',
      date: '15-17 Agosto',
      status: 'planning',
      attendees: 1200,
      location: 'Região Pantanal',
      cities: ['Corumbá', 'Aquidauana']
    },
    {
      id: 3,
      name: 'Ecoturismo Regional',
      date: '5-10 Setembro',
      status: 'upcoming',
      attendees: 800,
      location: 'Miranda',
      cities: ['Miranda', 'Anastácio']
    }
  ]);

  const [quickActions] = useState([
    {
      name: 'Gerenciar Cidades',
      description: 'Administrar municípios da região',
      icon: <Building2 className="h-4 w-4" />,
      action: 'manage-cities'
    },
    {
      name: 'Criar Evento Regional',
      description: 'Organizar evento para toda região',
      icon: <Calendar className="h-4 w-4" />,
      action: 'create-regional-event'
    },
    {
      name: 'Relatórios Regionais',
      description: 'Visualizar analytics da região',
      icon: <BarChart3 className="h-4 w-4" />,
      action: 'regional-reports'
    },
    {
      name: 'Configurações Regionais',
      description: 'Configurar preferências da região',
      icon: <Settings className="h-4 w-4" />,
      action: 'regional-settings'
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Dashboard Regional
              </h1>
              <p className="text-purple-100">
                Bem-vindo(a), {getDisplayName()}. Gerencie a região turística do Pantanal.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-purple-200">Região</p>
                <p className="font-semibold">Pantanal</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6" />
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
                placeholder="Buscar cidades, destinos ou eventos regionais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <Button className="h-12 px-6">
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento Regional
            </Button>
          </div>
        </div>
      </section>

      {/* Regional Stats */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regionalStats.map((stat, index) => (
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
            {/* Cities and Events */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cities */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Cidades da Região
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cities.map((city) => (
                      <div key={city.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{city.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{city.destinations} destinos</span>
                              <span>{city.visitors} visitantes</span>
                              <span>{city.revenue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={city.status === 'active' ? 'default' : 'secondary'}
                          >
                            {city.status === 'active' ? 'Ativa' : 'Manutenção'}
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

              {/* Regional Events */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Eventos Regionais
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Evento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalEvents.map((event) => (
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
                              <span className="text-xs text-gray-500">Cidades:</span>
                              {event.cities.map((city, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {city}
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
                  <CardTitle>Ações Regionais</CardTitle>
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

              {/* Regional Analytics */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Regional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Visitantes este mês</span>
                      <span className="font-semibold">8.456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receita regional</span>
                      <span className="font-semibold">R$ 234.5k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cidades ativas</span>
                      <span className="font-semibold">7/8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Eventos ativos</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Ver Relatório Regional
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Atividade Regional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Novo evento regional - Festival do Pantanal</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Cidade Corumbá atualizada - 12 destinos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Relatório regional gerado - Julho 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Rota gastronômica planejada - 3 cidades</span>
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

export default RegionalDashboard; 