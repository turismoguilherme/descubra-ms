
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ArrowRight, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: TrendingUp,
      title: "ROI Comprovado",
      description: "Resultados mensuráveis com aumento de 40% no engajamento turístico e redução de 60% em custos administrativos."
    },
    {
      icon: Users,
      title: "Experiência Conectada",
      description: "Plataforma unificada que conecta visitantes, empresas e gestores públicos em um ecossistema inteligente."
    },
    {
      icon: Zap,
      title: "Implementação Rápida",
      description: "Deploy completo em 30 dias com treinamento especializado e suporte técnico dedicado 24/7."
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background corporativo elegante */}
      <div className="absolute inset-0 flowtrip-hero-gradient" />
      
      {/* Padrão geométrico corporativo */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M60 60l30-30v60l-30-30zm-30 0l30 30v-60l-30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Elementos flutuantes decorativos */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-flowtrip-orange-vibrant/10 rounded-full blur-xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-flowtrip-teal-elegant/10 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flowtrip-container text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="outline" className="mb-8 border-white/20 text-white bg-white/10 backdrop-blur-sm px-8 py-3 text-sm font-medium">
            <Sparkles className="mr-3 h-5 w-5" />
            Transformação Digital em Turismo
          </Badge>
          
          <h1 className="flowtrip-title-hero mb-8 leading-tight font-bold">
            Eleve seu destino ao
            <br />
            <span className="flowtrip-text-gradient bg-gradient-to-r from-flowtrip-orange-vibrant to-white bg-clip-text text-transparent">
              próximo nível
            </span>
          </h1>
          
          <p className="flowtrip-text-lead mb-12 max-w-4xl mx-auto text-white/95 font-medium">
            Plataforma corporativa líder em destinos inteligentes. Conectamos dados, pessoas e experiências 
            para criar ecossistemas turísticos de alta performance com impacto mensurável.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button 
              size="lg" 
              onClick={() => navigate('/ms')}
              className="bg-flowtrip-orange-vibrant text-white hover:bg-flowtrip-orange-light font-bold px-10 py-4 text-lg flowtrip-shadow-lg hover:flowtrip-shadow-xl flowtrip-transition-smooth flowtrip-hover-scale"
            >
              <Play className="mr-3 h-6 w-6" />
              Demo Interativa
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/15 font-bold px-10 py-4 text-lg backdrop-blur-sm flowtrip-transition-smooth"
            >
              <ArrowRight className="mr-3 h-6 w-6" />
              Consultoria Especializada
            </Button>
          </div>
          
          {/* Cards de valor corporativo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 flowtrip-transition-smooth flowtrip-hover-scale"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-flowtrip-orange-vibrant/20 rounded-xl group-hover:bg-flowtrip-orange-vibrant/30 flowtrip-transition-smooth">
                    <benefit.icon className="h-8 w-8 text-flowtrip-orange-vibrant" />
                  </div>
                  <h3 className="font-bold text-xl text-white">{benefit.title}</h3>
                </div>
                <p className="text-white/85 leading-relaxed text-lg">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
