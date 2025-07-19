
import React from 'react';
import UniversalNavbar from '@/components/layout/UniversalNavbar';
import UniversalFooter from '@/components/layout/UniversalFooter';
import { BarChart3, TrendingUp, Users, MapPin, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecursosAnalytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNavbar />
      
      <main className="py-20">
        <div className="ms-container">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Avançado
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforme dados em insights acionáveis com nosso sistema de analytics completo. 
              Monitore performance, comportamento de usuários e tendências em tempo real.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Dashboard em Tempo Real</CardTitle>
                <CardDescription>
                  Acompanhe métricas de visitação, engajamento e conversões instantaneamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Visitantes únicos e recorrentes</li>
                  <li>• Taxa de conversão</li>
                  <li>• Tempo de permanência</li>
                  <li>• Páginas mais visitadas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Análise de Comportamento</CardTitle>
                <CardDescription>
                  Entenda como os turistas interagem com sua plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Mapa de calor de cliques</li>
                  <li>• Jornada do usuário</li>
                  <li>• Funil de conversão</li>
                  <li>• Segmentação avançada</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <MapPin className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Geolocalização</CardTitle>
                <CardDescription>
                  Dados geográficos detalhados sobre seus visitantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Origem dos visitantes</li>
                  <li>• Destinos mais procurados</li>
                  <li>• Rotas turísticas populares</li>
                  <li>• Sazonalidade regional</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Calendar className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Análise Temporal</CardTitle>
                <CardDescription>
                  Identifique padrões e tendências ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sazonalidade turística</li>
                  <li>• Picos de demanda</li>
                  <li>• Comparação histórica</li>
                  <li>• Previsões de tendências</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Eye className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Relatórios Customizáveis</CardTitle>
                <CardDescription>
                  Crie relatórios personalizados para diferentes stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Templates prontos</li>
                  <li>• Filtros avançados</li>
                  <li>• Exportação automática</li>
                  <li>• Agendamento de relatórios</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>KPIs Turísticos</CardTitle>
                <CardDescription>
                  Métricas específicas para o setor de turismo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• ROI de campanhas</li>
                  <li>• Satisfação do turista</li>
                  <li>• Performance de destinos</li>
                  <li>• Impacto econômico</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Transformar Seus Dados?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comece a usar nosso sistema de analytics hoje mesmo e tome decisões baseadas em dados reais.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Solicitar Demonstração
            </Button>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
};

export default RecursosAnalytics;
