import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Map, Shield, TrendingUp, Building2, ArrowRight, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Solucoes = () => {
  // Scroll para o topo quando a página carregar
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Scroll suave para seções (com offset para header fixo)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const headerOffset = 80; // Altura do header fixo
          // Usar offsetTop que é relativo ao documento, não à viewport
          const offsetTop = (element as HTMLElement).offsetTop - headerOffset;
          
          window.scrollTo({
            top: Math.max(0, offsetTop),
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, []);

  const tradeSolutions = [
    {
      id: "revenue-optimizer",
      icon: TrendingUp,
      title: "Revenue Optimizer",
      benefit: "Maximize receita com precificação inteligente",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: "market-intelligence",
      icon: BarChart3,
      title: "Market Intelligence",
      benefit: "Entenda seu mercado e concorrentes",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      id: "ia-conversacional",
      icon: Brain,
      title: "IA Conversacional",
      benefit: "Assistente inteligente para seu negócio",
      gradient: "from-purple-500 to-violet-600"
    }
  ];

  const govSolutions = [
    {
      id: "inventario-turistico",
      icon: Map,
      title: "Inventário Turístico",
      benefit: "Gestão completa de atrativos",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      id: "gestao-cats",
      icon: Building2,
      title: "Gestão de CATs",
      benefit: "Controle total dos Centros de Atendimento",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      id: "analytics-governamental",
      icon: BarChart3,
      title: "Analytics Governamental",
      benefit: "Dados para tomada de decisão",
      gradient: "from-orange-500 to-amber-600"
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
              Soluções
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              Tecnologia avançada para turismo
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
      <section id="para-empresarios" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold text-sm">Para Empresários</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Business Intelligence Turístico
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradeSolutions.map((solution, index) => (
              <div 
                key={index} 
                id={solution.id}
                className="bg-card rounded-2xl p-10 border border-border hover:border-viajar-cyan/30 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center min-h-[250px] justify-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${solution.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground text-base">{solution.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Solutions */}
      <section id="para-setor-publico" className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full mb-4">
              <Shield className="h-4 w-4" />
              <span className="font-semibold text-sm">Para Setor Público</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              GovTech Turístico
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {govSolutions.map((solution, index) => (
              <div 
                key={index} 
                id={solution.id}
                className="bg-card rounded-2xl p-10 border border-border hover:border-viajar-cyan/30 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center min-h-[250px] justify-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${solution.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <solution.icon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground text-base">{solution.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Pronto para Transformar seu Turismo?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/precos">
              <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 gap-2">
                Ver Planos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 px-8">
                Falar com Especialista
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
