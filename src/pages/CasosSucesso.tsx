import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, BarChart3, Award, MapPin, ArrowRight, CheckCircle2, Brain, Building2, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const CasosSucesso = () => {
  const metrics = [
    { icon: Users, value: "50K+", label: "Turistas Impactados", color: "text-viajar-cyan" },
    { icon: TrendingUp, value: "95%", label: "Satisfação", color: "text-emerald-500" },
    { icon: BarChart3, value: "200+", label: "Pontos Turísticos", color: "text-viajar-blue" },
    { icon: Award, value: "150+", label: "Parceiros", color: "text-purple-500" },
  ];

  const features = [
    "Guatá - Assistente IA regional especializado em turismo",
    "Passaporte Digital com sistema de gamificação e recompensas",
    "Mapas interativos com geolocalização em tempo real",
    "Analytics avançado para gestão de destinos",
    "Gestão de eventos e calendário turístico",
    "Integração com CATs (Centros de Atendimento ao Turista)"
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
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Award className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Casos de Sucesso</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transformando o Turismo
            </h1>
            <p className="text-xl text-white/70">
              Veja como estamos revolucionando a gestão do turismo no Brasil
            </p>
          </div>
        </div>
      </section>

      {/* Descubra MS - Main Case */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Visual Side */}
              <div className="bg-gradient-to-br from-viajar-cyan to-viajar-blue p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Descubra MS</h3>
                  <p className="text-white/80 text-lg">Mato Grosso do Sul</p>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {metrics.map((metric, i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <metric.icon className="h-6 w-6 text-white/80 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <div className="text-xs text-white/70">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Content Side */}
              <div className="p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-viajar-cyan/10 text-viajar-cyan text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Case Principal
                </div>
                
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Transformando o Turismo em Mato Grosso do Sul
                </h2>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  O <strong className="text-foreground">Descubra MS</strong> é nossa primeira implementação 
                  completa da plataforma ViajARTur, demonstrando todo o poder da nossa tecnologia 
                  aplicada ao turismo regional.
                </p>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  A plataforma oferece uma experiência completa para turistas explorarem o estado, 
                  enquanto fornece ferramentas avançadas de gestão para secretarias e empresários.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-foreground">Funcionalidades Implementadas:</h4>
                  <ul className="space-y-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-viajar-cyan flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/ms">
                  <Button className="bg-viajar-slate hover:bg-viajar-slate/90 text-white gap-2">
                    Conhecer Descubra MS
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos / Resultados */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Resultados que Importam
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Números que demonstram o impacto da plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 text-center border border-border hover:border-viajar-cyan/30 transition-all duration-300 hover:shadow-lg">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-viajar-cyan/20 to-viajar-blue/20 flex items-center justify-center mx-auto mb-4`}>
                  <metric.icon className={`h-7 w-7 ${metric.color}`} />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnologias Utilizadas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tecnologias de Ponta
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              As ferramentas que tornam nossa plataforma única
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Inteligência Artificial</h3>
              <p className="text-muted-foreground">
                Guilherme IA e Guatá oferecem assistência inteligente 24/7 com respostas 
                personalizadas e insights estratégicos.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Analytics Avançado</h3>
              <p className="text-muted-foreground">
                Dashboards em tempo real com métricas de fluxo turístico, 
                análise de demanda e benchmarking competitivo.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Gestão Integrada</h3>
              <p className="text-muted-foreground">
                Plataforma unificada para empresários e gestores públicos 
                com ferramentas de inventário, eventos e CATs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Quer ser nosso próximo case de sucesso?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar o turismo na sua região.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
                Falar com Especialista
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/precos">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 h-14 text-lg backdrop-blur-sm">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default CasosSucesso;
