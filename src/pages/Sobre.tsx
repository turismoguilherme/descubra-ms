import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Eye, Award, Users, ArrowRight, MapPin, Brain, BarChart3, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Sobre = () => {
  const values = [
    {
      icon: Brain,
      title: "Inovação",
      description: "Utilizamos inteligência artificial e tecnologia de ponta para revolucionar a gestão do turismo."
    },
    {
      icon: Users,
      title: "Colaboração",
      description: "Trabalhamos lado a lado com empresários e gestores públicos para criar soluções que realmente funcionam."
    },
    {
      icon: BarChart3,
      title: "Resultados",
      description: "Focamos em métricas e resultados mensuráveis que impactam positivamente o setor turístico."
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Buscamos a excelência em cada funcionalidade, garantindo qualidade e confiabilidade."
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
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Building2 className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Quem Somos</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Sobre a ViajARTur
            </h1>
            <p className="text-xl text-white/70">
              Transformando o turismo brasileiro com tecnologia, inovação e inteligência artificial
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Democratizar o acesso à tecnologia de ponta para o setor turístico, 
                permitindo que governos e empresas de qualquer tamanho possam oferecer 
                experiências excepcionais aos turistas e tomar decisões estratégicas 
                baseadas em dados e inteligência artificial.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-viajar-blue to-viajar-cyan flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Visão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ser a plataforma líder em gestão inteligente de turismo no Brasil, 
                conectando destinos, turistas e gestores através de tecnologia inovadora 
                e inteligência artificial, contribuindo para o desenvolvimento 
                sustentável do setor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* O que fazemos */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que Oferecemos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluções completas para o setor público e privado do turismo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-viajar-cyan/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-viajar-cyan" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Guilherme IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Assistente virtual inteligente que fornece insights estratégicos e recomendações personalizadas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-viajar-blue/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-viajar-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Analytics Avançado</h3>
                    <p className="text-sm text-muted-foreground">
                      Dashboards completos com métricas em tempo real para tomada de decisão.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Gestão de CATs</h3>
                    <p className="text-sm text-muted-foreground">
                      Controle completo de Centros de Atendimento ao Turista com GPS e ponto eletrônico.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Revenue Optimizer</h3>
                    <p className="text-sm text-muted-foreground">
                      Precificação dinâmica baseada em IA para maximizar receita.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-viajar-cyan/20 to-viajar-blue/20 border border-viajar-cyan/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mx-auto mb-6">
                    <Building2 className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    <span className="text-viajar-slate">Viaj</span>
                    <span className="text-viajar-cyan">AR</span>
                    <span className="text-viajar-slate">Tur</span>
                  </h3>
                  <p className="text-muted-foreground">Turismo Inteligente</p>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-viajar-cyan/10 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl bg-viajar-blue/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os princípios que guiam nossa atuação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border hover:border-viajar-cyan/30 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Descubra MS */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-viajar-cyan/10 text-viajar-cyan text-sm font-medium mb-6">
                  <Award className="h-4 w-4" />
                  Nosso Primeiro Case
                </div>
                
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Descubra Mato Grosso do Sul
                </h2>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Nossa primeira implementação completa demonstra o potencial da plataforma ViajARTur. 
                  O portal Descubra MS oferece uma experiência completa para turistas explorarem 
                  o estado com tecnologia de ponta.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['Guatá - Assistente IA regional', 'Passaporte Digital com gamificação', 'Mapas interativos e rotas', 'Eventos e destinos em tempo real'].map((item, i) => (
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Quer fazer parte dessa história?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar o turismo na sua região.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
              Falar Conosco
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Sobre;
