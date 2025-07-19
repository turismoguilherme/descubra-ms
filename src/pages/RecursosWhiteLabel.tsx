
import React from 'react';
import UniversalNavbar from '@/components/layout/UniversalNavbar';
import UniversalFooter from '@/components/layout/UniversalFooter';
import { Palette, Smartphone, Globe, Settings, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecursosWhiteLabel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <UniversalNavbar />
      
      <main className="py-20">
        <div className="ms-container">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <Palette className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customização White Label
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Adapte completamente a plataforma à identidade visual do seu estado. 
              Cores, logos, conteúdo e funcionalidades personalizadas para cada região.
            </p>
          </div>

          {/* Before/After Showcase */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="bg-white shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Mato Grosso do Sul
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Identidade visual pantaneira
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Azul Pantanal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm">Amarelo Dourado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Verde Cerrado</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Logo oficial do estado + Mascote Guatá IA
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Mato Grosso
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Identidade visual amazônica (exemplo)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-700 rounded-full"></div>
                    <span className="text-sm">Verde Amazônia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Laranja Tropical</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-brown-600 rounded-full"></div>
                    <span className="text-sm">Marrom Terra</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Logo MT + Mascote personalizado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Palette className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Personalização Visual</CardTitle>
                <CardDescription>
                  Adapte cores, tipografia e elementos visuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Paleta de cores personalizada</li>
                  <li>• Logo e identidade visual</li>
                  <li>• Tipografia customizada</li>
                  <li>• Elementos gráficos únicos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Globe className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Conteúdo Regionalizado</CardTitle>
                <CardDescription>
                  Adapte textos e conteúdos para cada região
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Textos institucionais</li>
                  <li>• Informações regionais</li>
                  <li>• Dialetos e expressões locais</li>
                  <li>• Cultura e tradições</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Multi-dispositivo</CardTitle>
                <CardDescription>
                  Experiência consistente em todos os dispositivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Design responsivo</li>
                  <li>• App mobile nativo</li>
                  <li>• PWA (Progressive Web App)</li>
                  <li>• Offline-first</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Settings className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Configuração Avançada</CardTitle>
                <CardDescription>
                  Controle total sobre funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Módulos personalizáveis</li>
                  <li>• Integrações específicas</li>
                  <li>• Workflows customizados</li>
                  <li>• Permissões granulares</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Deploy Rápido</CardTitle>
                <CardDescription>
                  Implementação em poucos dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Setup automatizado</li>
                  <li>• Migração de dados</li>
                  <li>• Treinamento incluído</li>
                  <li>• Suporte técnico 24/7</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Segurança Enterprise</CardTitle>
                <CardDescription>
                  Proteção de dados governamentais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Conformidade LGPD</li>
                  <li>• Criptografia end-to-end</li>
                  <li>• Backup automático</li>
                  <li>• Auditoria completa</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Sua Marca, Nossa Tecnologia
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Crie uma experiência única para o turismo do seu estado com total personalização.
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Personalizar Agora
            </Button>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
};

export default RecursosWhiteLabel;
