import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

const MunicipalDashboard = () => {
  const { cityId, regionId, getDisplayName } = useRoleBasedAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Inicializar useNavigate

  const [municipalStats] = useState([
    {
      title: 'Destinos Ativos',
      value: '18',
      change: '+3',
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      description: 'Destinos turísticos da cidade'
    },
    {
      title: 'Eventos Ativos',
      value: '5',
      change: '+1',
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      description: 'Eventos em andamento'
    },
    {
      title: 'Visitantes Hoje',
      value: '234',
      change: '+12%',
      icon: <Users className="h-6 w-6 text-green-600" />,
      description: 'Turistas registrados hoje'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45.2k',
      change: '+8%',
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      description: 'Receita do turismo municipal'
    }
  ]);

  const [destinations] = useState([
    {
      id: 1,
      name: 'Parque Municipal',
      status: 'active',
      visitors: 156,
      rating: 4.5,
      lastUpdate: '2 horas atrás'
    },
    {
      id: 2,
      name: 'Museu Histórico',
      status: 'active',
      visitors: 89,
      rating: 4.2,
      lastUpdate: '1 dia atrás'
    },
    {
      id: 3,
      name: 'Praça Central',
      status: 'maintenance',
      visitors: 0,
      rating: 4.0,
      lastUpdate: '3 dias atrás'
    }
  ]);

  const [events] = useState([
    {
      id: 1,
      name: 'Festival de Inverno',
      date: '15-20 Julho',
      status: 'upcoming',
      attendees: 1200,
      location: 'Centro da Cidade'
    },
    {
      id: 2,
      name: 'Feira Gastronômica',
      date: '25-27 Agosto',
      status: 'planning',
      attendees: 800,
      location: 'Parque Municipal'
    },
    {
      id: 3,
      name: 'Show Cultural',
      date: '10 Setembro',
      status: 'upcoming',
      attendees: 500,
      location: 'Teatro Municipal'
    }
  ]);

  const [quickActions] = useState([
    {
      name: 'Adicionar Destino',
      description: 'Cadastrar novo destino turístico',
      icon: <Plus className="h-4 w-4" />,
      action: 'add-destination'
    },
    {
      name: 'Criar Evento',
      description: 'Organizar novo evento',
      icon: <Calendar className="h-4 w-4" />,
      action: 'create-event'
    },
    {
      name: 'Relatórios',
      description: 'Visualizar relatórios municipais',
      icon: <FileText className="h-4 w-4" />,
      action: 'reports'
    },
    {
      name: 'Configurações',
      description: 'Configurar preferências',
      icon: <Settings className="h-4 w-4" />,
      action: 'settings'
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Dashboard Municipal
              </h1>
              <p className="text-green-100">
                Bem-vindo(a), {getDisplayName()}. Gerencie destinos e eventos da sua cidade.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-green-200">Cidade</p>
                <p className="font-semibold">Campo Grande</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6" />
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
                placeholder="Buscar destinos, eventos ou relatórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <Button className="h-12 px-6" onClick={() => navigate('/ms/admin/destination-editor')}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Destino
            </Button>
          </div>
        </div>
      </section>

      {/* Municipal Stats */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {municipalStats.map((stat, index) => (
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
            {/* Destinations and Events */}
            <div className="lg:col-span-2 space-y-6">
              {/* Destinations */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Destinos Turísticos
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/ms/admin/destinations-management')}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Todos
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {destinations.map((destination) => (
                      <div key={destination.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{destination.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{destination.visitors} visitantes</span>
                              <span>★ {destination.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={destination.status === 'active' ? 'default' : 'secondary'}
                          >
                            {destination.status === 'active' ? 'Ativo' : 'Manutenção'}
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

              {/* Events */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Eventos Municipais
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/ms/admin/event-editor')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Evento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event) => (
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
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="w-full justify-start h-auto p-3"
                        onClick={() => {
                          if (action.action === 'add-destination') {
                            navigate('/ms/admin/destination-editor');
                          } else if (action.action === 'create-event') {
                            navigate('/ms/admin/event-editor');
                          } else if (action.action === 'reports') {
                            // navigate('/ms/admin/reports'); // Implementar rota de relatórios
                            alert('Funcionalidade de Relatórios em desenvolvimento!');
                          } else if (action.action === 'settings') {
                            // navigate('/ms/admin/settings'); // Implementar rota de configurações
                            alert('Funcionalidade de Configurações em desenvolvimento!');
                          }
                        }}
                      >
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

              {/* Analytics Preview */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Municipal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Visitantes este mês</span>
                      <span className="font-semibold">2.456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receita turística</span>
                      <span className="font-semibold">R$ 89.2k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Destinos ativos</span>
                      <span className="font-semibold">18/20</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Ver Relatório Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Novo destino cadastrado - Parque Municipal</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Evento atualizado - Festival de Inverno</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Relatório gerado - Estatísticas mensais</span>
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

export default MunicipalDashboard; 