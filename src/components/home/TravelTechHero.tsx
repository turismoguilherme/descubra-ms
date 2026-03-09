import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Zap } from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';
import TravelTechRobot from './TravelTechRobot';
import TechBackground from './TechBackground';
import { useIsMobile } from '@/hooks/use-mobile';

const TravelTechHero = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [mousePosition, setMousePosition] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_');
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

  const getContent = (key: string, fallback: string) => content[key] || fallback;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) / (rect.width / 2);
    const deltaY = (event.clientY - centerY) / (rect.height / 2);
    
    const rotateY = deltaX * 8; // max 8 degrees horizontal
    const rotateX = -deltaY * 5; // max 5 degrees vertical
    
    setMousePosition({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setMousePosition({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section className="relative overflow-hidden min-h-[100vh] flex items-center">
      <TechBackground variant="hero" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            {/* Animated tech badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full text-cyan-100 font-medium shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse-slow">
              <Zap className="w-4 h-4" />
              <span>🤖 Travel Tech | IA + Turismo</span>
            </div>

            {/* Main title with gradient */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                {getContent('viajar_hero_title', 'Tecnologia que transforma o turismo')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {getContent('viajar_hero_description', 'IA, dados e automação para destinos e negócios turísticos inteligentes')}
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/viajar/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold px-8 h-14 text-lg rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:-translate-y-1 transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                  {getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 font-semibold px-8 h-14 text-lg rounded-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {getContent('viajar_hero_cta_secondary', 'Agendar Demo')}
                </Button>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-white/70 font-mono text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>+100K Usuários</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>98% Satisfação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>IA 24/7</span>
              </div>
            </div>
          </div>

          {/* Right side - Interactive Robot */}
          <div 
            className="flex-1 w-full max-w-2xl lg:max-w-3xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <TravelTechRobot 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              rotateX={mousePosition.rotateX}
              rotateY={mousePosition.rotateY}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelTechHero;