import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Search, Filter, Plus, BarChart3, Users, Eye, MousePointer, TrendingUp } from 'lucide-react';
import { useCommercialPartners } from '@/hooks/useCommercialPartners';
import CommercialPartnerForm from '@/components/commercial/CommercialPartnerForm';
import CommercialPartnerDashboard from '@/components/commercial/CommercialPartnerDashboard';

const ParceirosComerciais = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('explore');

  const { data: partners = [], isLoading } = useCommercialPartners();

  const businessTypes = [
    'Tecnologia', 'Consultoria', 'Marketing', 'Design', 'Desenvolvimento',
    'Infraestrutura', 'Segurança', 'Analytics', 'Comunicação', 'Outros'
  ];

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || partner.business_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Portal de Parceiros Comerciais
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Conecte-se com empresas inovadoras e expanda seus negócios através de parcerias estratégicas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="explore">Explorar Parceiros</TabsTrigger>
            <TabsTrigger value="become">Tornar-se Parceiro</TabsTrigger>
            <TabsTrigger value="dashboard">Meu Dashboard</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
          </TabsList>

          {/* Explorar Parceiros */}
          <TabsContent value="explore" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar parceiros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {businessTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando parceiros...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{partner.company_name}</CardTitle>
                            <p className="text-sm text-gray-500">{partner.business_type}</p>
                          </div>
                        </div>
                        <Badge className={getPlanBadgeColor(partner.subscription_plan)}>
                          {partner.subscription_plan}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{partner.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium">Localização:</span>
                          <span className="ml-2">{partner.city}, {partner.state}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-medium">Serviços:</span>
                          <span className="ml-2">{partner.services}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tornar-se Parceiro */}
          <TabsContent value="become">
            <CommercialPartnerForm />
          </TabsContent>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <CommercialPartnerDashboard />
          </TabsContent>

          {/* Planos */}
          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Básico</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">R$ 99</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Até 5 produtos/serviços
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Analytics básicos
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Suporte por email
                    </li>
                  </ul>
                  <Button className="w-full">Escolher Plano</Button>
                </CardContent>
              </Card>

              <Card className="border-blue-500 ring-2 ring-blue-500">
                <CardHeader>
                  <CardTitle className="text-center">Premium</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">R$ 299</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Até 20 produtos/serviços
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Analytics avançados
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Suporte prioritário
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Integração API
                    </li>
                  </ul>
                  <Button className="w-full">Escolher Plano</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Enterprise</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">R$ 999</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Produtos/serviços ilimitados
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Analytics personalizados
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Suporte dedicado
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Integração completa
                    </li>
                  </ul>
                  <Button className="w-full">Fale Conosco</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParceirosComerciais;