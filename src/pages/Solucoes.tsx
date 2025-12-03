import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Map, Shield, Globe, TrendingUp, Building2, CheckCircle2, Calendar, FileText, ArrowRight, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Solucoes = () => {
  const tradeSolutions = [
    {
      icon: Brain,
      title: "Guilherme IA",
      description: "Inteligência artificial que analisa seu negócio e fornece recomendações estratégicas baseadas em dados reais do mercado turístico.",
      features: ["Previsão de demanda com IA", "Análise de concorrência", "Insights personalizados", "Tendências de mercado"],
      gradient: "from-purple-500 to-violet-600"
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimizer",
      description: "Sistema de precificação dinâmica que maximiza sua receita baseado em demanda, eventos, sazonalidade e concorrência.",
      features: ["Precificação dinâmica", "Análise de RevPAR", "Projeção de receita", "Otimização de ocupação"],
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Análise completa do mercado: origem dos turistas, perfil de clientes, ROI por canal de marketing e tendências.",
      features: ["Análise de origem", "Segmentação de público", "ROI por canal", "Benchmarking competitivo"],
      gradient: "from-blue-500 to-cyan-600"
    }
  ];

  const govSolutions = [
    {
      icon: Map,
      title: "Inventário Turístico",
      description: "Gestão completa de atrativos turísticos com padronização SeTur, validação inteligente e analytics integrado.",
      features: ["Padronização SeTur", "Validação inteligente", "Preenchimento com IA", "Analytics e relatórios"],
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      description: "Sistema completo para planejamento, execução e análise de eventos turísticos com IA preditiva.",
      features: ["Calendário de eventos", "IA preditiva de público", "Detecção de conflitos", "Analytics de eventos"],
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Building2,
      title: "Gestão de CATs",
      description: "Controle completo de Centros de Atendimento ao Turista com GPS, ponto eletrônico e métricas em tempo real.",
      features: ["Check-in por GPS", "Ponto eletrônico", "Registro de atendimentos", "Dashboard de performance"],
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Analytics Municipal",
      description: "Dashboards com mapas de calor, análise de fluxo turístico, KPIs estratégicos e relatórios consolidados.",
      features: ["Mapas de calor", "Fluxo turístico", "KPIs em tempo real", "Relatórios consolidados"],
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: FileText,
      title: "Relatórios e Exportação",
      description: "Geração de relatórios executivos com exportação SeTur (JSON/XML), análises comparativas e insights.",
      features: ["Exportação SeTur", "Relatórios executivos", "Análises comparativas", "Insights acionáveis"],
      gradient: "from-slate-500 to-gray-600"
    },
    {
      icon: Brain,
      title: "Guilherme Estratégico",
      description: "Assistente IA que analisa dados do município e sugere políticas públicas baseadas em evidências.",
      features: ["Recomendações estratégicas", "Análise de impacto", "Benchmarking", "Projeções futuras"],
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  const generalFeatures = [
    {
      icon: Globe,
      title: "Multi-Regional",
      description: "Funciona em 27 estados brasileiros + internacional",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Segurança LGPD",
      description: "Conformidade total com LGPD e criptografia E2E",
      gradient: "from-red-500 to-rose-600"
    },
    {
      icon: CheckCircle2,
      title: "CADASTUR Verificado",
      description: "Integração oficial com Ministério do Turismo",
      gradient: "from-emerald-500 to-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Tecnologia de Ponta</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Soluções para Cada Necessidade
            </h1>
            <p className="text-xl text-white/70 mb-10 max-w-3xl mx-auto">
              Tecnologia avançada para estabelecimentos privados e governos transformarem a gestão do turismo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/precos">
                <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold gap-2">
                  Ver Planos e Preços
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Agendar Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Solutions */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold text-sm">Para Hotéis, Pousadas e Agências</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Business Intelligence Turístico
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dados tratados + IA para maximizar sua receita e entender seu mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tradeSolutions.map((solution, index) => (
              <div key={index} className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 hover:shadow-lg transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-viajar-cyan mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Solutions */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold text-sm">Para Prefeituras e Secretarias</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              GovTech Turístico
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gestão completa de CATs, analytics municipal e inteligência estratégica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {govSolutions.map((solution, index) => (
              <div key={index} className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 hover:shadow-lg transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{solution.title}</h3>
                <p className="text-muted-foreground mb-6">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-viajar-cyan mr-2 flex-shrink-0" />
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
      <section className="py-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-10 text-foreground">
            Recursos em Todos os Planos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-xl bg-muted/50 border border-border">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Transformar seu Turismo?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Teste grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/viajar/register">
              <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
                Começar Teste Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/precos">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
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
