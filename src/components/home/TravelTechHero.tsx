import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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

  return (
    <section className="relative overflow-hidden bg-white min-h-[600px] flex items-center">
      {/* Background com ícones sutis de dados */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Ícones de dados sutis no background */}
      <div className="absolute inset-0 opacity-[0.02]">
        {/* Calendário */}
        <svg className="absolute top-20 left-[15%] w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5"/>
        </svg>
        {/* Gráfico */}
        <svg className="absolute top-32 right-[20%] w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 3v18h18" strokeWidth="1.5"/>
          <path d="M7 12l4-4 4 4 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Documento */}
        <svg className="absolute bottom-32 left-[25%] w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5"/>
          <path d="M14 2v6h6" strokeWidth="1.5"/>
        </svg>
        {/* Pasta */}
        <svg className="absolute bottom-20 right-[15%] w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" strokeWidth="1.5"/>
        </svg>
        {/* Relógio */}
        <svg className="absolute top-1/2 left-[10%] w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
          <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight leading-tight">
              {getContent('viajar_hero_title', 'ViajARTur: Ecossistema Inteligente de Turismo')}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-black mb-10 max-w-xl mx-auto lg:mx-0">
              {getContent('viajar_hero_description', 'Transforme dados em decisões estratégicas com IA para o setor público e privado.')}
            </p>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <Link to="/viajar/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-14 text-lg rounded-lg shadow-lg">
                  {getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Robot */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg">
            <TravelTechRobot />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelTechHero;
