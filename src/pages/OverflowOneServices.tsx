import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BarChart3, 
  Map, 
  FileText, 
  TrendingUp, 
  Target, 
  Users, 
  Building2,
  Zap,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const aiServices = [
  {
    id: 'market-analysis',
    title: 'Análise de Mercado',
    description: 'IA analisa tendências, sazonalidade e oportunidades no mercado turístico',
    icon: TrendingUp,
    features: ['Análise de tendências', 'Previsão de demanda', 'Benchmarking competitivo'],
    price: 'R$ 299/mês',
    popular: true
  },
  {
    id: 'demand-forecast',
    title: 'Previsão de Demanda',
    description: 'Previsões inteligentes de ocupação hoteleira e fluxo turístico',
    icon: Target,
    features: ['Previsão de ocupação', 'Análise sazonal', 'Alertas de demanda'],
    price: 'R$ 199/mês',
    popular: false
  },
  {
    id: 'benchmarking',
    title: 'Benchmarking Inteligente',
    description: 'Compare sua performance com concorrentes e mercado',
    icon: BarChart3,
    features: ['Comparação de preços', 'Análise de concorrência', 'Métricas de performance'],
    price: 'R$ 249/mês',
    popular: false
  },
  {
    id: 'guilherme-ai',
    title: 'IA Guilherme',
    description: 'Assistente inteligente para análise de dados e suporte estratégico',
    icon: Brain,
    features: ['Chat inteligente 24/7', 'Análise de dados', 'Sugestões estratégicas'],
    price: 'R$ 399/mês',
    popular: true
  }
];

const reportServices = [
  {
    id: 'custom-reports',
    title: 'Relatórios Personalizados',
    description: 'Relatórios detalhados com gráficos e infográficos personalizados',
    icon: FileText,
    features: ['Templates personalizados', 'Gráficos interativos', 'Exportação múltipla'],
    price: 'R$ 149/relatório',
    popular: false
  },
  {
    id: 'infographics',
    title: 'Infográficos Automáticos',
    description: 'Criação automática de infográficos para apresentações',
    icon: Zap,
    features: ['Templates profissionais', 'Dados em tempo real', 'Customização visual'],
    price: 'R$ 99/infográfico',
    popular: false
  },
  {
    id: 'dashboard-custom',
    title: 'Dashboard Personalizado',
    description: 'Dashboard exclusivo para sua empresa com métricas específicas',
    icon: BarChart3,
    features: ['Métricas personalizadas', 'Visualizações interativas', 'Acesso 24/7'],
    price: 'R$ 499/mês',
    popular: true
  }
];

const inventoryServices = [
  {
    id: 'asset-mapping',
    title: 'Mapeamento de Ativos',
    description: 'Inventário completo de ativos físicos e serviços da sua empresa',
    icon: Map,
    features: ['Mapa interativo', 'Lista detalhada', 'Categorização automática'],
    price: 'R$ 199/mês',
    popular: false
  },
  {
    id: 'service-inventory',
    title: 'Inventário de Serviços',
    description: 'Catálogo inteligente de todos os serviços oferecidos',
    icon: Building2,
    features: ['Catálogo digital', 'Preços dinâmicos', 'Disponibilidade em tempo real'],
    price: 'R$ 149/mês',
    popular: false
  }
];

const OverflowOneServices: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai-services');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Plataforma de Serviços Empresariais
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Inteligência artificial, relatórios personalizados e inventário turístico para impulsionar seu negócio
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="ai-services">IA & Análise</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
          </TabsList>

          {/* IA & Análise */}
          <TabsContent value="ai-services" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Serviços de Inteligência Artificial
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Aproveite o poder da IA para tomar decisões mais inteligentes e impulsionar seu negócio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiServices.map((service) => (
                <Card key={service.id} className={`hover:shadow-lg transition-all duration-300 ${service.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                      </div>
                      {service.popular && (
                        <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Contratar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Relatórios e Visualizações
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Relatórios detalhados, gráficos interativos e infográficos profissionais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportServices.map((service) => (
                <Card key={service.id} className={`hover:shadow-lg transition-all duration-300 ${service.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                      </div>
                      {service.popular && (
                        <Badge className="bg-green-100 text-green-800">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">{service.price}</span>
                      <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                        Contratar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Inventário */}
          <TabsContent value="inventory" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Inventário Turístico
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Mapeie e gerencie todos os seus ativos físicos e serviços de forma inteligente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inventoryServices.map((service) => (
                <Card key={service.id} className={`hover:shadow-lg transition-all duration-300 ${service.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                      </div>
                      {service.popular && (
                        <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">{service.price}</span>
                      <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                        Contratar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Pronto para Transformar seu Negócio?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Comece hoje mesmo e veja como a inteligência artificial pode revolucionar sua empresa turística
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Users className="h-5 w-5 mr-2" />
              Falar com Especialista
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <ArrowRight className="h-5 w-5 mr-2" />
              Ver Demonstração
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverflowOneServices;





