
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-flowtrip-bg-primary">
      {/* Background com gradiente FlowTrip */}
      <div className="absolute inset-0 bg-gradient-to-br from-flowtrip-bg-secondary via-orange-50/30 to-teal-50/50" />
      
      {/* Elementos decorativos orgânicos */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-flowtrip-accent-orange/20 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-flowtrip-secondary-teal/20 to-transparent rounded-full blur-xl" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-flowtrip-primary-blue/20 to-transparent rounded-full blur-xl" />

      <div className="flowtrip-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              variant="outline" 
              className="mb-8 text-flowtrip-primary-blue border-flowtrip-accent-orange/30 bg-flowtrip-white/80 backdrop-blur-sm px-6 py-3 text-sm font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4 text-flowtrip-accent-orange" />
              ⭐ Primeira Plataforma SaaS de Destinos Inteligentes do Brasil
            </Badge>
            
            <h1 className="flowtrip-title-hero mb-8 leading-tight text-center">
              <span className="flowtrip-text-gradient">
                Transforme
              </span>
              <br />
              <span className="text-flowtrip-text-primary">
                seu Destino em
              </span>
              <br />
              <span className="flowtrip-text-gradient">
                Referência
              </span>
            </h1>
            
            <p className="flowtrip-text-lead mb-12 max-w-3xl mx-auto">
              FlowTrip automatiza a gestão turística do seu estado ou município com 
              <strong className="text-flowtrip-primary-blue"> inteligência artificial</strong>, 
              <strong className="text-flowtrip-accent-orange"> dados conectados</strong> e 
              <strong className="text-flowtrip-secondary-teal"> experiências memoráveis</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-flowtrip-primary-blue hover:bg-flowtrip-primary-blue/90 text-white flowtrip-shadow-xl hover:flowtrip-shadow-elegant transform hover:scale-105 flowtrip-transition-smooth font-medium"
                onClick={() => navigate('#contato')}
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                ✈️ Ver Demonstração Gratuita
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-6 border-2 border-flowtrip-accent-orange/30 text-flowtrip-accent-orange hover:bg-flowtrip-accent-orange/5 bg-flowtrip-white/80 backdrop-blur-sm flowtrip-shadow-lg hover:flowtrip-shadow-xl transform hover:scale-105 flowtrip-transition-smooth font-medium"
                onClick={() => navigate('/ms')}
              >
                <MapPin className="mr-3 h-5 w-5" />
                🏛️ Case MS
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-flowtrip-primary-blue mb-2">40%</div>
                <div className="text-flowtrip-text-secondary">Aumento no Engajamento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-flowtrip-accent-orange mb-2">60%</div>
                <div className="text-flowtrip-text-secondary">Redução na Gestão</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-flowtrip-secondary-teal mb-2">24/7</div>
                <div className="text-flowtrip-text-secondary">Suporte Especializado</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
