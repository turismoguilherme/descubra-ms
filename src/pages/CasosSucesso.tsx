import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, BarChart3, Award } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const CasosSucesso = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Casos de Sucesso
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Veja como estamos transformando o turismo em todo o Brasil
            </p>
          </div>
        </div>
      </section>

      {/* Descubra MS - Main Case */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Imagem/Logo */}
              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-12 flex items-center justify-center">
                <div className="text-center">
                  <img 
                    src="/images/logo-descubra-ms.png?v=5" 
                    alt="Descubra MS" 
                    className="h-32 w-auto mx-auto mb-6"
                  />
                  <h3 className="text-3xl font-bold text-white mb-2">Descubra MS</h3>
                  <p className="text-blue-100 text-lg">Mato Grosso do Sul</p>
                </div>
              </div>
              
              {/* Conteúdo */}
              <div className="p-12">
                <div className="inline-block bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  Case de Sucesso Principal
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Transformando o Turismo em Mato Grosso do Sul
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  O <strong>Descubra MS</strong> é nossa primeira implementação completa da plataforma ViaJAR, 
                  demonstrando todo o poder da nossa tecnologia aplicada ao turismo regional.
                </p>
                
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-6 bg-white rounded-xl shadow-md">
                    <Users className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-600">Usuários Ativos</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-md">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">95%</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-md">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">200+</div>
                    <div className="text-sm text-gray-600">Pontos Turísticos</div>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-md">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">150+</div>
                    <div className="text-sm text-gray-600">Parceiros</div>
                  </div>
                </div>

                {/* Funcionalidades */}
                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-gray-900">Funcionalidades Implementadas:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
                      IA Guatá - Assistente inteligente de turismo
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
                      Passaporte Digital com gamificação
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
                      Mapas interativos com geolocalização
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
                      Analytics e relatórios em tempo real
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-600 rounded-full mr-3"></span>
                      Gestão de eventos e destinos
                    </li>
                  </ul>
                </div>

                <Link to="/ms">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    Conhecer Descubra MS
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Quer ser nosso próximo case de sucesso?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Entre em contato e descubra como podemos transformar o turismo na sua região.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
              Falar com Especialista
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default CasosSucesso;
