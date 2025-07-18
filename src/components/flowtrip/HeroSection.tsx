
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente mais natural */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-orange-50/30 to-teal-50/50" />
      
      {/* Elementos decorativos orgânicos */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-teal-200/40 to-transparent rounded-full blur-xl" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-blue-200/40 to-transparent rounded-full blur-xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              variant="outline" 
              className="mb-8 text-blue-700 border-orange-200 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4 text-orange-500" />
              Primeira Plataforma SaaS de Destinos Inteligentes do Brasil
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-700 via-orange-600 to-teal-600 bg-clip-text text-transparent">
                Transforme
              </span>
              <br />
              <span className="text-gray-800">
                seu Destino em
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                Referência
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              FlowTrip automatiza a gestão turística do seu estado ou município com 
              <strong className="text-blue-700"> inteligência artificial</strong>, 
              <strong className="text-orange-600"> dados conectados</strong> e 
              <strong className="text-teal-600"> experiências memoráveis</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('#contato')}
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                Ver Demonstração Gratuita
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-6 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/ms')}
              >
                <MapPin className="mr-3 h-5 w-5" />
                Case de Sucesso: MS
              </Button>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">40%</div>
                <div className="text-gray-600">Aumento no Engajamento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">60%</div>
                <div className="text-gray-600">Redução na Gestão</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">24/7</div>
                <div className="text-gray-600">Suporte Especializado</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
