import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Map, Users, Brain, Shield, Globe, Building2 } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import CommercialSection from '@/components/commercial/CommercialSection';

const ViaJARSaaS = () => {
  useEffect(() => {
    console.log("🚀 VIAJAR: Componente ViaJARSaaS montado com sucesso");
    
    // Verificar se todos os elementos estão carregando
    const checkElements = () => {
      console.log("🔍 VIAJAR: Verificando elementos da página...");
      
      // Verificar se o DOM está pronto
      if (document.readyState === 'complete') {
        console.log("✅ VIAJAR: DOM completamente carregado");
      } else {
        console.log("⏳ VIAJAR: DOM ainda carregando...");
      }
      
      // Verificar se o Tailwind está funcionando
      const testElement = document.createElement('div');
      testElement.className = 'bg-cyan-600 text-white p-4';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.textContent = 'Teste Tailwind';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const hasTailwind = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
      
      console.log("🎨 VIAJAR: Tailwind CSS funcionando:", hasTailwind);
      
      document.body.removeChild(testElement);
    };
    
    // Executar verificação após um pequeno delay
    setTimeout(checkElements, 100);
    
    return () => {
      console.log("🧹 VIAJAR: Componente ViaJARSaaS desmontado");
    };
  }, []);

  console.log("🎯 VIAJAR: Renderizando componente ViaJARSaaS");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Viaj</span>
              <span className="text-cyan-300">AR</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Ecossistema inteligente de turismo
            </p>
            <p className="text-lg text-blue-200 mb-12 max-w-4xl mx-auto">
              Transforme seu negócio turístico com inteligência artificial, 
              análise de dados e soluções inovadoras para o setor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/viajar/register">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-4 text-lg">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/viajar/login">
                <Button size="lg" variant="outline" className="border-cyan-300 text-cyan-300 hover:bg-cyan-300 hover:text-blue-900 px-8 py-4 text-lg">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Soluções Inteligentes para o Turismo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia avançada para impulsionar seu negócio turístico
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* IA Guilherme */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">IA Guilherme</h3>
              <p className="text-gray-600 mb-6">
                Assistente inteligente especializado em turismo, oferecendo insights estratégicos e suporte personalizado.
              </p>
              <Link to="/servicos" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Saiba mais →
              </Link>
            </div>

            {/* Relatórios Inteligentes */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Relatórios Inteligentes</h3>
              <p className="text-gray-600 mb-6">
                Análise de dados avançada com relatórios personalizados e insights para tomada de decisão.
              </p>
              <Link to="/servicos" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Saiba mais →
              </Link>
            </div>

            {/* Inventário Turístico */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-500 rounded-xl flex items-center justify-center mb-6">
                <Map className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventário Turístico</h3>
              <p className="text-gray-600 mb-6">
                Gestão completa de ativos turísticos com mapas interativos e análise de performance.
              </p>
              <Link to="/servicos" className="text-violet-600 hover:text-violet-700 font-medium">
                Saiba mais →
              </Link>
            </div>

            {/* Análise de Mercado */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Análise de Mercado</h3>
              <p className="text-gray-600 mb-6">
                Insights sobre tendências do mercado turístico e oportunidades de crescimento.
              </p>
              <Link to="/servicos" className="text-amber-600 hover:text-amber-700 font-medium">
                Saiba mais →
              </Link>
            </div>

            {/* Gestão de Parceiros */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestão de Parceiros</h3>
              <p className="text-gray-600 mb-6">
                Plataforma completa para gerenciar parcerias e colaborações no setor turístico.
              </p>
              <Link to="/parceiros" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Saiba mais →
              </Link>
            </div>

            {/* Segurança Avançada */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl border border-red-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Segurança Avançada</h3>
              <p className="text-gray-600 mb-6">
                Proteção de dados e conformidade com as melhores práticas de segurança.
              </p>
              <Link to="/servicos" className="text-pink-600 hover:text-pink-700 font-medium">
                Saiba mais →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar seu Negócio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a centenas de empresas que já confiam na ViaJAR para impulsionar seus resultados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/viajar/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Descubra MS Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nosso Case de Sucesso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O Descubra MS é nosso produto estrela, demonstrando o poder da ViaJAR
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Imagem/Logo do Descubra MS */}
              <div className="bg-gradient-to-br from-blue-300 to-cyan-400 p-12 flex items-center justify-center">
                <div className="text-center">
                  <img 
                    src="/images/logo-descubra-ms.png?v=5" 
                    alt="Descubra MS" 
                    className="h-24 w-auto mx-auto mb-6"
                  />
                  <h3 className="text-2xl font-bold text-white mb-2">Descubra MS</h3>
                  <p className="text-blue-100">Plataforma de Turismo de Mato Grosso do Sul</p>
                </div>
              </div>
              
              {/* Conteúdo */}
              <div className="p-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  Transformando o Turismo em Mato Grosso do Sul
                </h4>
                <div className="space-y-4 text-gray-600">
                  <p>
                    O <strong>Descubra MS</strong> é nossa primeira implementação completa, 
                    demonstrando como a tecnologia ViaJAR pode revolucionar o turismo regional.
                  </p>
                  <p>
                    Com <strong>IA Guatá</strong>, <strong>Passaporte Digital</strong>, 
                    <strong>Mapas Interativos</strong> e <strong>Analytics Avançado</strong>, 
                    transformamos Campo Grande em um destino turístico inteligente.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-600">50K+</div>
                      <div className="text-sm text-gray-500">Usuários Ativos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-600">95%</div>
                      <div className="text-sm text-gray-500">Satisfação</div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/ms">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                      Conhecer Descubra MS
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Section */}
      <CommercialSection />

      <ViaJARFooter />
    </div>
  );
};

export default ViaJARSaaS;

