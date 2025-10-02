import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Map, Users, Shield, Zap, Globe } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Solucoes = () => {
  const solutions = [
    {
      icon: Brain,
      title: "IA Guilherme",
      description: "Assistente inteligente com IA generativa especializado em turismo, oferecendo insights estratégicos 24/7.",
      features: ["Respostas contextualizadas", "Análise preditiva", "Recomendações personalizadas"],
      color: "from-blue-600 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Dashboards inteligentes com análise de dados em tempo real e relatórios automatizados.",
      features: ["Métricas em tempo real", "Relatórios customizados", "Alertas inteligentes"],
      color: "from-green-600 to-emerald-500"
    },
    {
      icon: Map,
      title: "Inventário Turístico",
      description: "Gestão completa de ativos turísticos com mapas interativos e geolocalização.",
      features: ["Mapas interativos", "Gestão de POIs", "Rotas otimizadas"],
      color: "from-purple-600 to-violet-500"
    },
    {
      icon: Users,
      title: "Gestão de Parceiros",
      description: "Plataforma para gerenciar parcerias, contratos e colaborações no setor turístico.",
      features: ["Portal de parceiros", "Gestão de contratos", "Performance tracking"],
      color: "from-indigo-600 to-blue-500"
    },
    {
      icon: Globe,
      title: "Multi-Tenant",
      description: "Arquitetura escalável para múltiplos estados e municípios com isolamento de dados.",
      features: ["Isolamento de dados", "Customização por região", "Escalabilidade"],
      color: "from-orange-600 to-amber-500"
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção de dados com criptografia, auditoria completa e conformidade LGPD.",
      features: ["Criptografia ponta-a-ponta", "Auditoria de logs", "Conformidade LGPD"],
      color: "from-red-600 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Soluções Inteligentes para o Turismo
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Tecnologia de ponta para transformar a gestão do turismo com inteligência artificial, 
              análise de dados e automação.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-r ${solution.color} rounded-xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                <ul className="space-y-2 mb-6">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Zap className="h-4 w-4 text-cyan-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar seu Turismo?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Agende uma demonstração e veja como nossas soluções podem revolucionar sua gestão turística.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/viajar/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
                Começar Teste Grátis
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                Agendar Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Solucoes;
