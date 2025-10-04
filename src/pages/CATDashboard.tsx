import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Map,
  Headphones,
  HelpCircle,
  Star,
  Navigation,
  Camera,
  FileText
} from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

const CATDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados simulados do CAT
  const catInfo = {
    name: 'CAT Campo Grande',
    location: 'Centro de Campo Grande',
    address: 'Av. Afonso Pena, 1000 - Centro',
    phone: '(67) 99999-9999',
    email: 'cat@campogrande.ms.gov.br',
    status: 'Ativo',
    capacity: 50,
    currentVisitors: 12,
    operatingHours: '24h'
  };

  const recentVisitors = [
    {
      id: 1,
      name: 'Maria Silva',
      origin: 'São Paulo',
      arrival: '14:30',
      purpose: 'Informações turísticas',
      status: 'Atendido',
      rating: 5
    },
    {
      id: 2,
      name: 'João Santos',
      origin: 'Rio de Janeiro',
      arrival: '14:45',
      purpose: 'Reserva de hotel',
      status: 'Em atendimento',
      rating: null
    },
    {
      id: 3,
      name: 'Ana Costa',
      origin: 'Brasília',
      arrival: '15:00',
      purpose: 'Informações sobre eventos',
      status: 'Aguardando',
      rating: null
    }
  ];

  const services = [
    { name: 'Informações Turísticas', count: 45, icon: MapPin },
    { name: 'Reservas de Hotel', count: 23, icon: Users },
    { name: 'Informações de Transporte', count: 18, icon: Navigation },
    { name: 'Suporte Emergencial', count: 5, icon: AlertCircle },
    { name: 'Fotos e Selfies', count: 32, icon: Camera },
    { name: 'Mapas e Roteiros', count: 28, icon: Map }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Atendido': return 'bg-green-100 text-green-800';
      case 'Em atendimento': return 'bg-blue-100 text-blue-800';
      case 'Aguardando': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CAT Dashboard</h1>
              <p className="text-gray-600 mt-2">
                {catInfo.name} • {catInfo.location}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {catInfo.status}
              </Badge>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Atendimento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Visitantes Atuais</p>
                  <p className="text-2xl font-bold text-gray-900">{catInfo.currentVisitors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Atendimentos Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Headphones className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Atendentes Online</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="visitors">Visitantes</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Visitors */}
              <Card>
                <CardHeader>
                  <CardTitle>Visitantes Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentVisitors.map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{visitor.name}</h4>
                            <p className="text-sm text-gray-600">{visitor.origin} • {visitor.arrival}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(visitor.status)}>
                            {visitor.status}
                          </Badge>
                          {visitor.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{visitor.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Serviços Mais Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <service.icon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </div>
                        <Badge variant="secondary">{service.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visitors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestão de Visitantes</CardTitle>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Buscar visitantes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gestão de Visitantes</h3>
                  <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catálogo de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3 mb-2">
                        <service.icon className="h-6 w-6 text-blue-600" />
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {service.count} atendimentos hoje
                      </p>
                      <Button size="sm" className="w-full">
                        Iniciar Atendimento
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios do CAT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Relatórios em Desenvolvimento</h3>
                  <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do CAT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Centro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <Input value={catInfo.name} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                        <Input value={catInfo.location} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <Input value={catInfo.phone} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input value={catInfo.email} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CATDashboard;

