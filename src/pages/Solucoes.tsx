import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Map, Users, Shield, Globe, TrendingUp, Building2, CheckCircle2, Calendar, FileText } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Solucoes = () => {
  // Soluções para o TRADE (Setor Privado)
  const tradeSolutions = [
    {
      icon: Brain,
      title: "ViaJAR Guilherme",
      description: "Guilherme - Inteligência artificial que analisa seu negócio e fornece recomendações estratégicas baseadas em dados reais do mercado turístico.",
      features: ["Previsão de demanda com IA", "Análise de concorrência", "Insights personalizados", "Tendências de mercado"],
      color: "from-purple-600 to-violet-500"
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimizer",
      description: "Sistema de precificação dinâmica que maximiza sua receita baseado em demanda, eventos, sazonalidade e concorrência.",
      features: ["Precificação dinâmica", "Análise de RevPAR", "Projeção de receita", "Otimização de ocupação"],
      color: "from-green-600 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Análise completa do mercado: origem dos turistas, perfil de clientes, ROI por canal de marketing e tendências do setor.",
      features: ["Análise de origem", "Segmentação de público", "ROI por canal", "Benchmarking competitivo"],
      color: "from-blue-600 to-cyan-500"
    }
  ];

  // Soluções para GOVERNOS
  const govSolutions = [
    {
      icon: Map,
      title: "Inventário Turístico",
      description: "Gestão completa de atrativos turísticos com padronização SeTur, validação inteligente, preenchimento automático com IA e analytics integrado.",
      features: ["Padronização SeTur", "Validação inteligente", "Preenchimento automático com IA", "Analytics e relatórios"],
      color: "from-blue-600 to-cyan-500"
    },
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      description: "Sistema completo para planejamento, execução e análise de eventos turísticos com IA preditiva, detecção de conflitos e sugestão de datas.",
      features: ["Calendário de eventos", "IA preditiva de público", "Detecção de conflitos", "Analytics de eventos"],
      color: "from-pink-600 to-rose-500"
    },
    {
      icon: Building2,
      title: "Gestão de CATs",
      description: "Controle completo de Centros de Atendimento ao Turista com GPS, ponto eletrônico, registro de atendimentos e métricas em tempo real.",
      features: ["Check-in por GPS", "Ponto eletrônico", "Registro de atendimentos", "Dashboard de performance"],
      color: "from-indigo-600 to-blue-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Municipal",
      description: "Dashboards com mapas de calor, análise de fluxo turístico, KPIs estratégicos e relatórios consolidados para tomada de decisão.",
      features: ["Mapas de calor", "Fluxo turístico", "KPIs em tempo real", "Relatórios consolidados"],
      color: "from-orange-600 to-amber-500"
    },
    {
      icon: FileText,
      title: "Relatórios e Exportação",
      description: "Geração de relatórios executivos com exportação SeTur (JSON/XML), análises comparativas e insights acionáveis para gestão pública.",
      features: ["Exportação SeTur", "Relatórios executivos", "Análises comparativas", "Insights acionáveis"],
      color: "from-slate-600 to-gray-500"
    },
    {
      icon: Brain,
      title: "Guilherme",
      description: "Assistente IA especializado que analisa dados do município e sugere políticas públicas e ações estratégicas baseadas em evidências.",
      features: ["Recomendações estratégicas", "Análise de impacto", "Benchmarking", "Projeções futuras"],
      color: "from-purple-600 to-pink-500"
    }
  ];

  // Recursos Gerais
  const generalFeatures = [
    {
      icon: Globe,
      title: "Multi-Regional",
      description: "Funciona em 27 estados brasileiros + internacional",
      color: "from-cyan-600 to-blue-500"
    },
    {
      icon: Shield,
      title: "Segurança LGPD",
      description: "Conformidade total com LGPD e criptografia E2E",
      color: "from-red-600 to-rose-500"
    },
    {
      icon: CheckCircle2,
      title: "CADASTUR Verificado",
      description: "Integração oficial com Ministério do Turismo",
      color: "from-green-600 to-emerald-500"
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
              Soluções para Cada Necessidade
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Tecnologia de ponta para estabelecimentos privados e governos transformarem a gestão do turismo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/viajar/pricing">
                <Button size="lg" variant="secondary">
                  Ver Planos e Preços
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                  Agendar Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold">Para Hotéis, Pousadas e Agências</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Business Intelligence Turístico
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dados tratados + IA para maximizar sua receita e entender seu mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tradeSolutions.map((solution, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 bg-gradient-to-r ${solution.color} rounded-xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-cyan-600 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/viajar/pricing">
              <Button size="lg" className="gap-2">
                Ver Planos para Trade
                <TrendingUp className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Government Solutions */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold">Para Prefeituras e Secretarias</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              GovTech Turístico
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Gestão completa de CATs, analytics municipal e Guilherme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {govSolutions.map((solution, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 bg-gradient-to-r ${solution.color} rounded-xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-cyan-600 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* General Features */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Recursos Incluídos em Todos os Planos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
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
            Teste grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/viajar/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
                Começar Teste Grátis
              </Button>
            </Link>
            <Link to="/viajar/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                Ver Todos os Planos
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
