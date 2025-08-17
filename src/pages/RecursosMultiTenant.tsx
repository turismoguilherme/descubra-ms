
import React from 'react';
import UniversalNavbar from '@/components/layout/UniversalNavbar';
import UniversalFooter from '@/components/layout/UniversalFooter';
import { Server, Users, Database, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecursosMultiTenant = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <UniversalNavbar />
      
      <main className="py-20">
        <div className="ms-container">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <Server className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Arquitetura Multi-tenant
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma única plataforma, múltiplos estados. Isolamento completo de dados, 
              customização independente e escalabilidade ilimitada.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Arquitetura da Solução</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">OverFlow One Core</h3>
                <p className="text-sm text-gray-600">
                  Plataforma central que gerencia todos os estados clientes
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Isolamento de Dados</h3>
                <p className="text-sm text-gray-600">
                  Cada estado possui dados completamente isolados e seguros
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Estados Clientes</h3>
                <p className="text-sm text-gray-600">
                  MS, MT, GO, SP e outros estados com identidade própria
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Isolamento Completo</CardTitle>
                <CardDescription>
                  Cada estado opera de forma totalmente independente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dados isolados por estado</li>
                  <li>• Usuários segregados</li>
                  <li>• Configurações independentes</li>
                  <li>• Backups separados</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Database className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Escalabilidade</CardTitle>
                <CardDescription>
                  Cresça sem limites com arquitetura distribuída
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Auto-scaling automático</li>
                  <li>• Load balancing inteligente</li>
                  <li>• CDN global</li>
                  <li>• Cache distribuído</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  Otimização contínua para máxima velocidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Queries otimizadas por tenant</li>
                  <li>• Caching inteligente</li>
                  <li>• Compressão de dados</li>
                  <li>• Lazy loading</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Gestão Centralizada</CardTitle>
                <CardDescription>
                  Administre todos os estados de um só lugar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Dashboard master</li>
                  <li>• Métricas consolidadas</li>
                  <li>• Billing automatizado</li>
                  <li>• Suporte unificado</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Globe className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Customização</CardTitle>
                <CardDescription>
                  Cada estado com sua identidade única
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Branding personalizado</li>
                  <li>• Funcionalidades específicas</li>
                  <li>• Integrações locais</li>
                  <li>• Workflows únicos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Server className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Infraestrutura</CardTitle>
                <CardDescription>
                  Cloud-native com alta disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 99.9% de uptime</li>
                  <li>• Disaster recovery</li>
                  <li>• Multi-região</li>
                  <li>• Monitoramento 24/7</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Vantagens do Multi-tenant</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Para os Estados</h3>
                <ul className="space-y-2">
                  <li>• Custo reduzido de infraestrutura</li>
                  <li>• Implementação mais rápida</li>
                  <li>• Atualizações automáticas</li>
                  <li>• Suporte especializado</li>
                  <li>• Manutenção zero</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Para a OverFlow One</h3>
                <ul className="space-y-2">
                  <li>• Economia de recursos</li>
                  <li>• Deploy centralizado</li>
                  <li>• Métricas consolidadas</li>
                  <li>• Inovação compartilhada</li>
                  <li>• Escala eficiente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Escalar Nacionalmente?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se à revolução do turismo digital com nossa arquitetura multi-tenant.
            </p>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Conhecer a Arquitetura
            </Button>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
};

export default RecursosMultiTenant;
