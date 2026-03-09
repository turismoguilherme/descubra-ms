import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Map, Shield, TrendingUp, Building2, ArrowRight, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { platformContentService } from '@/services/admin/platformContentService';
import TechBackground from '@/components/home/TechBackground';
import GlowCard from '@/components/home/GlowCard';

const Solucoes = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  
  // Carregar conteúdo do CMS
  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_solutions_');
        const contentMap: Record<string, string> = {};
        contents.forEach(item => {
          contentMap[item.content_key] = item.content_value || '';
        });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      }
    };
    loadContent();
  }, []);

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const getContent = (key: string, fallback: string) => content[key] || fallback;

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
    <div className="min-h-screen bg-slate-950">
      <ViaJARNavbar />
      
      {/* Hero Section with Tech Background */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        <TechBackground variant="hero" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-100 font-medium">🤖 Tecnologia de Ponta</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                {getContent('viajar_solutions_hero_title', 'Soluções Travel Tech')}
              </span>
            </h1>
            {getContent('viajar_solutions_hero_subtitle', '') && (
              <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                {getContent('viajar_solutions_hero_subtitle', 'Inteligência Artificial e Analytics para o turismo do futuro')}
              </p>
            )}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/precos">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold gap-2 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:-translate-y-1 transition-all duration-300">
                  Ver Planos e Preços
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                  Agendar Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Solutions */}
      <section id="para-empresarios" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full mb-4 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <Building2 className="h-4 w-4" />
              <span className="font-semibold text-sm">Para Empresários</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Business Intelligence Turístico
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Ferramentas de IA para maximizar receita e otimizar operações
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tradeSolutions.map((solution, index) => (
              <GlowCard key={index} className="p-8 text-center min-h-[280px] flex flex-col justify-center">
                <div 
                  id={solution.id}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${solution.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                    <solution.icon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{solution.title}</h3>
                    <p className="text-white/60 text-base leading-relaxed">{solution.benefit}</p>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Government Solutions */}
      <section id="para-setor-publico" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Shield className="h-4 w-4" />
              <span className="font-semibold text-sm">Para Setor Público</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              GovTech Turístico
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Gestão inteligente e transparente do turismo municipal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {govSolutions.map((solution, index) => (
              <GlowCard key={index} className="p-8 text-center min-h-[280px] flex flex-col justify-center">
                <div 
                  id={solution.id}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${solution.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                    <solution.icon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{solution.title}</h3>
                    <p className="text-white/60 text-base leading-relaxed">{solution.benefit}</p>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <TechBackground variant="section" className="opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Transformar seu Turismo?
          </h2>
          <p className="text-white/70 mb-8 text-lg max-w-2xl mx-auto">
            Junte-se às organizações que já usam nossa tecnologia para revolucionar o setor turístico
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/precos">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold px-8 gap-2 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:-translate-y-1 transition-all duration-300">
                Ver Planos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
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