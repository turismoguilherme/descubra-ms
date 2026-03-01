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
    <section className="relative overflow-hidden bg-white min-h-[650px] flex items-center">
      {/* Background sutil */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Lado esquerdo - Texto */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              {getContent('viajar_hero_title', 'ViajARTur')}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {getContent('viajar_hero_description', 'Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.')}
            </p>

            <div className="flex justify-center lg:justify-start">
              <Link to="/viajar/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-14 text-lg rounded-lg shadow-lg">
                  {getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Lado direito - Robô */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl">
            <TravelTechRobot />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelTechHero;
