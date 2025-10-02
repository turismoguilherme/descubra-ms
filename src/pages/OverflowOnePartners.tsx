import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Star, TrendingUp, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOverflowOnePartners } from '@/hooks/useOverflowOnePartners';
import OverflowOnePartnerCard from '@/components/overflow-one/partners/OverflowOnePartnerCard';
import OverflowOnePartnerForm from '@/components/overflow-one/partners/OverflowOnePartnerForm';
import OverflowOnePartnerFilters from '@/components/overflow-one/partners/OverflowOnePartnerFilters';
import { Skeleton } from '@/components/ui/skeleton';

const OverflowOnePartners: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [activeTab, setActiveTab] = useState('explore');

  const { partners, isLoading, error } = useOverflowOnePartners({
    status: 'approved',
    business_type: businessTypeFilter || undefined,
    city: cityFilter || undefined,
    subscription_plan: planFilter || undefined,
  });

  // Filtrar parceiros localmente baseado na busca
  const filteredPartners = partners.filter(partner =>
    partner.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.trade_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    setSearchTerm('');
    setBusinessTypeFilter('');
    setCityFilter('');
    setPlanFilter('');
  };

  const handleViewDetails = (partner: any) => {
    // Implementar navegação para detalhes do parceiro
    console.log('Ver detalhes do parceiro:', partner);
  };

  // Estatísticas
  const stats = {
    total: partners.length,
    featured: partners.filter(p => p.featured).length,
    verified: partners.filter(p => p.verified).length,
    totalViews: partners.reduce((sum, p) => sum + (p.total_views || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Parceiros Overflow One
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Conecte-se com empresas inovadoras e expanda seus negócios através de parcerias estratégicas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Parceiros</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Destaques</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Verificados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="explore">Explorar Parceiros</TabsTrigger>
            <TabsTrigger value="become">Tornar-se Parceiro</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
          </TabsList>

          {/* Explorar Parceiros */}
          <TabsContent value="explore" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Parceiros Comerciais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OverflowOnePartnerFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  businessTypeFilter={businessTypeFilter}
                  onBusinessTypeChange={setBusinessTypeFilter}
                  cityFilter={cityFilter}
                  onCityChange={setCityFilter}
                  planFilter={planFilter}
                  onPlanChange={setPlanFilter}
                  onClearFilters={clearFilters}
                  isLoading={isLoading}
                />

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-80 w-full" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                      <Building2 className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Erro ao carregar parceiros
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ocorreu um erro ao carregar a lista de parceiros. Tente novamente.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Tentar Novamente
                    </Button>
                  </div>
                ) : filteredPartners.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredPartners.map((partner) => (
                      <OverflowOnePartnerCard
                        key={partner.id}
                        partner={partner}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum parceiro encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tente ajustar os filtros ou a busca para encontrar parceiros.
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tornar-se Parceiro */}
          <TabsContent value="become">
            <OverflowOnePartnerForm />
          </TabsContent>

          {/* Planos */}
          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Planos de Assinatura</CardTitle>
                <p className="text-muted-foreground">
                  Escolha o plano ideal para seu negócio e comece a crescer conosco
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-center">Plano Básico</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">R$ 99</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
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
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Listagem na plataforma
                        </li>
                      </ul>
                      <Button className="w-full mt-4" onClick={() => setActiveTab('become')}>
                        Escolher Plano
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-500 ring-2 ring-blue-500">
                    <CardHeader>
                      <CardTitle className="text-center">Plano Premium</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">R$ 299</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
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
                          Listagem destacada
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Badge verificado
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Integração API
                        </li>
                      </ul>
                      <Button className="w-full mt-4" onClick={() => setActiveTab('become')}>
                        Escolher Plano
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-center">Plano Enterprise</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">R$ 999</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
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
                          Listagem premium
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Consultoria dedicada
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          API completa
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          White-label
                        </li>
                      </ul>
                      <Button className="w-full mt-4" onClick={() => setActiveTab('become')}>
                        Fale Conosco
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OverflowOnePartners;





