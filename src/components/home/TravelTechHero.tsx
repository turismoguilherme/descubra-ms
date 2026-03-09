import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Users, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { platformContentService } from '@/services/admin/platformContentService';
import TravelTechRobot from './TravelTechRobot';
import FloatingTechElements from './FloatingTechElements';
import TechBackground from './TechBackground';
import heroBackground from '@/assets/travel-tech-hero-bg.jpg';

const TravelTechHero = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_hero_');
      const contentMap: Record<string, string> = {};
      contents.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Erro ao carregar conteúdo do hero:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  const statsData = [
    { 
      icon: Users, 
      value: getContent('viajar_hero_stat_users', '+100K'),
      label: getContent('viajar_hero_stat_users_label', 'Usuários')
    },
    { 
      icon: TrendingUp, 
      value: getContent('viajar_hero_stat_satisfaction', '98%'),
      label: getContent('viajar_hero_stat_satisfaction_label', 'Satisfação')
    },
    { 
      icon: Zap, 
      value: getContent('viajar_hero_stat_ai', 'IA 24/7'),
      label: getContent('viajar_hero_stat_ai_label', 'Disponível')
    }
  ];

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-travel-tech-dark-base">
        <div className="animate-pulse text-travel-tech-turquoise">
          <div className="w-8 h-8 border-2 border-travel-tech-turquoise border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Immersive Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="Travel Tech Background"
          className="w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-travel-tech-dark-base/90 via-travel-tech-dark-base/70 to-travel-tech-dark-base/50" />
      </div>

      {/* Tech Background Elements */}
      <TechBackground variant="hero" className="z-10" />

      {/* Floating Tech Elements */}
      <FloatingTechElements variant="hero" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Travel Tech Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-6 py-3 rounded-full border border-travel-tech-turquoise/30 bg-travel-tech-turquoise/10 backdrop-blur-sm"
              >
                <span className="text-travel-tech-turquoise font-semibold text-sm tracking-wide">
                  Travel Tech | Turismo + Inteligência Artificial
                </span>
              </motion.div>

              {/* Main Title - Gradient */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-white via-travel-tech-turquoise to-travel-tech-ocean-blue bg-clip-text text-transparent">
                  {getContent('viajar_hero_title', 'ViajARTur – IA que Transforma o Turismo')}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl"
              >
                {getContent('viajar_hero_subtitle', 'Analytics avançado, inteligência artificial 24/7 e big data para decisões estratégicas, destinos mais sustentáveis e experiências inesquecíveis.')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/viajar/login"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue text-white font-semibold text-lg hover:from-travel-tech-ocean-blue hover:to-travel-tech-turquoise transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-travel-tech-turquoise/30 border border-travel-tech-turquoise/20"
                >
                  <span>Acessar Plataforma</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                
                <Link
                  to="/contato"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-travel-tech-turquoise/50 text-travel-tech-turquoise font-semibold text-lg hover:bg-travel-tech-turquoise hover:text-travel-tech-dark-base transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
                >
                  <Play className="mr-2 h-5 w-5" />
                  <span>Ver Demonstração</span>
                </Link>
              </motion.div>

              {/* Mini Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="grid grid-cols-3 gap-6 pt-8"
              >
                {statsData.map((stat, index) => (
                  <div 
                    key={index}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-travel-tech-turquoise/20 backdrop-blur-sm border border-travel-tech-turquoise/30">
                      <stat.icon className="w-6 h-6 text-travel-tech-turquoise" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Robot */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative h-[600px] lg:h-[700px]"
            >
              <TravelTechRobot />
            </motion.div>
            
          </div>
        </div>
      </div>

      {/* Holographic Scan Lines */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-travel-tech-turquoise/30 to-transparent animate-data-flow" />
        <div className="absolute bottom-1/3 right-0 w-full h-px bg-gradient-to-l from-transparent via-travel-tech-ocean-blue/30 to-transparent animate-data-flow-delayed" />
      </div>
    </section>
  );
};

export default TravelTechHero;