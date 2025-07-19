import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Map, Users, Brain, Shield, Globe } from 'lucide-react';
import SimpleNavbar from '@/components/layout/SimpleNavbar';

const FlowTripSaaS = () => {
  return (
    <div className="min-h-screen bg-white">
      <SimpleNavbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transforme seu Estado em Destino Inteligente
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Plataforma SaaS completa para gestão turística governamental com IA, analytics e passaporte digital
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300">
                Agendar Demonstração
              </Button>
            </Link>
            <Link to="/ms">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Ver Case de Sucesso
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600">3</div>
              <div className="text-gray-600">Estados Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600">Municípios</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">500k+</div>
              <div className="text-gray-600">Turistas Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15%</div>
              <div className="text-gray-600">Aumento Médio em Visitação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como o FlowTrip Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plataforma completa que transforma dados em insights e turistas em embaixadores do seu estado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Portal Turístico</h3>
              <p className="text-gray-600">Interface completa com destinos, eventos e roteiros inteligentes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA Conversacional</h3>
              <p className="text-gray-600">Assistente virtual que atende turistas 24/7 com informações precisas</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Passaporte Digital</h3>
              <p className="text-gray-600">Gamificação que engaja turistas e gera dados valiosos de comportamento</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics & IA</h3>
              <p className="text-gray-600">Dashboard completo com insights automáticos para decisões estratégicas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case de Sucesso MS */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-semibold mb-4">
                Case de Sucesso
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mato Grosso do Sul: Referência Nacional
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Em 18 meses, MS se tornou o estado mais inovador do turismo brasileiro com a plataforma FlowTrip
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <ArrowRight className="w-4 h-4 text-blue-900" />
                  </div>
                  <span>500k+ turistas utilizando passaporte digital</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <ArrowRight className="w-4 h-4 text-blue-900" />
                  </div>
                  <span>15% aumento na permanência média</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <ArrowRight className="w-4 h-4 text-blue-900" />
                  </div>
                  <span>100% dos municípios turísticos integrados</span>
                </div>
              </div>

              <Link to="/ms">
                <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-semibold px-8 py-3">
                  Explorar Case Completo
                </Button>
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">500k+</div>
                  <div className="text-white/80">Usuários Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">100%</div>
                  <div className="text-white/80">Municípios Integrados</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">15%</div>
                  <div className="text-white/80">↑ Permanência</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400">4.8</div>
                  <div className="text-white/80">★ Satisfação</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que seu estado precisa para liderar o turismo nacional
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Gestão Governamental</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Dashboard executivo</li>
                <li>• Relatórios automáticos</li>
                <li>• Controle de usuários</li>
                <li>• Auditoria completa</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-teal-600">
              <Globe className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Portal do Turista</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Catálogo completo</li>
                <li>• Busca inteligente</li>
                <li>• Mapas interativos</li>
                <li>• Reviews e ratings</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-600">
              <Brain className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Inteligência Artificial</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Chatbot especializado</li>
                <li>• Recomendações personalizadas</li>
                <li>• Análise preditiva</li>
                <li>• Insights automáticos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar seu Estado?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se aos estados que já estão revolucionando o turismo com tecnologia de ponta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Agendar Demonstração
              </Button>
            </Link>
            <Link to="/master-dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Acessar Dashboard Master
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Simples */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 FlowTrip. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default FlowTripSaaS;