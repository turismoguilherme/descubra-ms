import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, ThumbsUp, Bot } from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';
import TravelTechRobot from './TravelTechRobot';

const TravelTechHero = () => {
  const [content, setContent] = useState<Record<string, string>>({});

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

  const stats = [
    { icon: <Users className="w-4 h-4" />, value: '+100K', label: 'Usuários' },
    { icon: <ThumbsUp className="w-4 h-4" />, value: '98%', label: 'Satisfação' },
    { icon: <Bot className="w-4 h-4" />, value: '24/7', label: 'IA Ativa' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-cyan-50/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--viajar-slate)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-viajar-emerald/10 rounded-full blur-3xl" />

      {/* Circuit line decoration */}
      <svg className="absolute bottom-0 left-0 right-0 h-1 opacity-20" viewBox="0 0 1200 4">
        <line x1="0" y1="2" x2="1200" y2="2" stroke="hsl(var(--viajar-cyan))" strokeWidth="1" strokeDasharray="8 4" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-viajar-cyan/10 backdrop-blur-sm border border-viajar-cyan/20 mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-viajar-slate font-medium">
                {getContent('viajar_hero_badge', 'Travel Tech | Turismo + Inteligência Artificial')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-viajar-slate mb-6 tracking-tight leading-tight">
              {getContent('viajar_hero_title', 'Tecnologia que transforma o turismo')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
              {getContent('viajar_hero_subtitle', 'IA, dados e automação para destinos e negócios turísticos')}
            </p>

            {/* Description */}
            {getContent('viajar_hero_description', '') && (
              <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                {getContent('viajar_hero_description', '')}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link to="/viajar/login">
                <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-white font-semibold px-8 h-14 text-lg gap-2 shadow-lg shadow-viajar-cyan/25 w-full sm:w-auto">
                  {getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" className="bg-white/60 hover:bg-white/80 text-viajar-slate border border-slate-200 px-8 h-14 text-lg backdrop-blur-sm shadow-sm w-full sm:w-auto">
                  {getContent('viajar_hero_cta_secondary', 'Agendar Demo')}
                </Button>
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex items-center gap-6 justify-center lg:justify-start">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-viajar-cyan/10 flex items-center justify-center text-viajar-cyan">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-viajar-slate">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="w-px h-8 bg-slate-200 ml-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Robot */}
          <div className="flex-1 w-full max-w-sm lg:max-w-none">
            <TravelTechRobot />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelTechHero;
