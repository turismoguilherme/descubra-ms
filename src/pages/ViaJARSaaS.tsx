import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Map, Brain, Shield, Globe, Building2, TrendingUp, Calendar, FileText, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import CommercialSection from '@/components/commercial/CommercialSection';

const ViaJARSaaS = () => {
  const features = [
    {
      icon: Brain,
      title: "Guilherme IA",
      description: "Assistente inteligente especializado em turismo com insights estratégicos personalizados.",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimizer",
      description: "Precificação dinâmica com IA que maximiza receita baseado em demanda e sazonalidade.",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Análise de mercado: origem dos turistas, perfil de clientes e benchmarking competitivo.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Map,
      title: "Inventário Turístico",
      description: "Gestão de atrativos com padronização SeTur, validação inteligente e analytics.",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      description: "Planejamento e análise de eventos turísticos com IA preditiva de público.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: Building2,
      title: "Gestão de CATs",
      description: "Controle de Centros de Atendimento com GPS, ponto eletrônico e métricas.",
      gradient: "from-indigo-500 to-blue-600"
    },
  ];

  const stats = [
    { value: "50K+", label: "Usuários Ativos" },
    { value: "95%", label: "Satisfação" },
    { value: "27", label: "Estados" },
    { value: "500+", label: "Parceiros" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Plataforma #1 de Turismo Inteligente</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="text-white">Viaj</span>
              <span className="text-viajar-cyan">AR</span>
              <span className="text-white">Tur</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
              Ecossistema inteligente de turismo
            </p>
            
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
              Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/viajar/register">
                <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2 shadow-lg shadow-viajar-cyan/25">
                  Começar Gratuitamente
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
                  Agendar Demo
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Soluções Inteligentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para transformar a gestão do turismo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/50 transition-all duration-300 hover:shadow-xl hover:shadow-viajar-cyan/5"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                
                <Link 
                  to="/solucoes" 
                  className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-viajar-cyan hover:text-viajar-cyan/80 transition-colors"
                >
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Descubra MS Section */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-viajar-cyan/10 text-viajar-cyan text-sm font-medium mb-6">
                <Globe className="h-4 w-4" />
                Case de Sucesso
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Descubra Mato Grosso do Sul
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Nossa primeira implementação completa demonstra como a tecnologia ViajARTur revoluciona o turismo regional com Guatá IA, Passaporte Digital e Analytics Avançado.
              </p>
              
              <ul className="space-y-4 mb-8">
                {['Guatá - Assistente IA regional', 'Passaporte Digital interativo', 'Mapas e rotas inteligentes', 'Analytics em tempo real'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-viajar-cyan flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/ms">
                <Button className="bg-viajar-slate hover:bg-viajar-slate/90 text-white gap-2">
                  Conhecer Descubra MS
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Visual */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-viajar-cyan/20 to-viajar-blue/20 border border-viajar-cyan/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Descubra MS</h3>
                  <p className="text-muted-foreground">Plataforma de Turismo</p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-viajar-cyan/10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl bg-viajar-blue/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Transformar seu Turismo?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresas e órgãos públicos que já confiam na ViajARTur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/viajar/register">
              <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
                Teste Grátis por 14 dias
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
                Falar com Especialista
              </Button>
            </Link>
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
