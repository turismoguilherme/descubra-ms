import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Map, 
  List, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Star, 
  Edit, 
  Trash2,
  Eye,
  Download,
  Upload
} from 'lucide-react';

const assetCategories = [
  'Hospedagem',
  'Alimentação', 
  'Transporte',
  'Atrações',
  'Serviços',
  'Eventos',
  'Outros'
];

const serviceTypes = [
  'Guia Turístico',
  'Receptivo',
  'Transporte',
  'Alimentação',
  'Hospedagem',
  'Eventos',
  'Outros'
];

const mockAssets = [
  {
    id: 1,
    name: 'Hotel Fazenda Pantanal',
    type: 'Hospedagem',
    category: 'asset',
    location: { lat: -20.4697, lng: -54.6201 },
    address: 'Rodovia MS-184, km 12',
    city: 'Corumbá',
    state: 'MS',
    description: 'Hotel fazenda com 50 quartos, piscina e restaurante',
    status: 'active',
    rating: 4.8,
    price: 'R$ 250/diária'
  },
  {
    id: 2,
    name: 'Restaurante Peixe Dourado',
    type: 'Alimentação',
    category: 'asset',
    location: { lat: -20.4697, lng: -54.6201 },
    address: 'Rua 15 de Novembro, 123',
    city: 'Corumbá',
    state: 'MS',
    description: 'Especializado em peixes do Pantanal',
    status: 'active',
    rating: 4.6,
    price: 'R$ 80/pessoa'
  },
  {
    id: 3,
    name: 'Passeio de Barco Pantanal',
    type: 'Atrações',
    category: 'asset',
    location: { lat: -20.4697, lng: -54.6201 },
    address: 'Porto Geral',
    city: 'Corumbá',
    state: 'MS',
    description: 'Passeio de barco para observação da fauna',
    status: 'active',
    rating: 4.9,
    price: 'R$ 150/pessoa'
  }
];

const mockServices = [
  {
    id: 1,
    name: 'Guia Especializado Pantanal',
    type: 'Guia Turístico',
    category: 'service',
    description: 'Guia especializado em fauna e flora do Pantanal',
    duration: '4 horas',
    capacity: '15 pessoas',
    status: 'active',
    price: 'R$ 200/dia'
  },
  {
    id: 2,
    name: 'Receptivo Aeroporto',
    type: 'Receptivo',
    category: 'service',
    description: 'Serviço de recepção no aeroporto de Campo Grande',
    duration: '2 horas',
    capacity: '8 pessoas',
    status: 'active',
    price: 'R$ 150/transfer'
  },
  {
    id: 3,
    name: 'City Tour Campo Grande',
    type: 'Transporte',
    category: 'service',
    description: 'City tour completo pela capital',
    duration: '6 horas',
    capacity: '20 pessoas',
    status: 'inactive',
    price: 'R$ 80/pessoa'
  }
];

const OverflowOneInventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || asset.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || service.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventário Turístico</h1>
              <p className="text-gray-600">Gerencie seus ativos físicos e serviços</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="map">Visualização em Mapa</TabsTrigger>
            <TabsTrigger value="assets">Ativos Físicos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
          </TabsList>

          {/* Mapa */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Mapa Interativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Mapa Interativo
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Visualize seus ativos em um mapa interativo
                    </p>
                    <Button>
                      <MapPin className="h-4 w-4 mr-2" />
                      Ativar Mapa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ativos Físicos */}
          <TabsContent value="assets" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar ativos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {assetCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Ativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{asset.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{asset.type}</p>
                        <Badge className={asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {asset.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{asset.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{asset.city}, {asset.state}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{asset.description}</p>
                      <p className="text-sm font-medium text-green-600">{asset.price}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum ativo encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou adicione novos ativos
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Ativo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Serviços */}
          <TabsContent value="services" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar serviços..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{service.type}</p>
                        <Badge className={service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {service.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Duração: {service.duration}</span>
                        <span>Capacidade: {service.capacity}</span>
                      </div>
                      <p className="text-sm font-medium text-green-600">{service.price}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum serviço encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou adicione novos serviços
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Serviço
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OverflowOneInventory;

