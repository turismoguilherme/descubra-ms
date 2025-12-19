import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBrand } from "@/context/BrandContext";
import { Skeleton } from "@/components/ui/skeleton";
import { platformContentService } from '@/services/admin/platformContentService';

// Componente de loading otimizado
const HeroLoadingSkeleton = () => (
  <section className="relative min-h-[70vh] bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
      <Skeleton className="h-12 w-96 mx-auto bg-white/30" />
      <Skeleton className="h-8 w-[500px] mx-auto bg-white/30" />
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Skeleton className="h-12 w-32 bg-white/40" />
        <Skeleton className="h-12 w-40 bg-white/40" />
        <Skeleton className="h-12 w-48 bg-white/40" />
      </div>
    </div>
  </section>
);

const UniversalHero = () => {
  const { config, isMS } = useBrand();
  const [msContent, setMsContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isMS) {
      const loadContent = async () => {
        try {
          const contents = await platformContentService.getContentByPrefix('ms_hero_universal_');
          const contentMap: Record<string, string> = {};
          contents.forEach(item => {
            contentMap[item.content_key] = item.content_value || '';
          });
          setMsContent(contentMap);
        } catch (error) {
          console.error('Erro ao carregar conteúdo:', error);
        }
      };
      loadContent();
    }
  }, [isMS]);

  const getContent = (key: string, fallback: string) => msContent[key] || fallback;

  // Para MS, sempre usar o título correto "Descubra Mato Grosso do Sul"
  const title = isMS ? 'Descubra Mato Grosso do Sul' : config.hero.title;
  const subtitle = isMS 
    ? getContent('ms_hero_universal_subtitle', 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul')
    : config.hero.subtitle;


  return (
    <div 
      className="relative min-h-[70vh] bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 flex items-center justify-center overflow-hidden hero-section"
      style={{ 
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: 'url("https://source.unsplash.com/photo-1482938289607-e9573fc25ebb")'
        }}
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Content Container */}
      <div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ 
          zIndex: 1000,
          position: 'relative'
        }}
      >
        <h1 
          className="text-4xl md:text-6xl font-semibold text-white mb-6 leading-tight"
          style={{ 
            zIndex: 1,
            position: 'relative',
            display: 'block',
            width: '100%',
            textAlign: 'center',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
          }}
        >
          {title}
        </h1>
        
        <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={config.hero.buttons.primary.path}
            className="bg-ms-secondary-yellow text-gray-800 font-bold px-8 py-4 rounded-xl hover:bg-ms-secondary-yellow/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            {isMS 
              ? getContent('ms_hero_universal_button_1', config.hero.buttons.primary.text)
              : config.hero.buttons.primary.text
            }
          </Link>
          <Link 
            to={config.hero.buttons.secondary.path}
            className="bg-ms-pantanal-green text-white font-medium px-8 py-4 rounded-xl hover:bg-ms-pantanal-green/90 transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            {isMS 
              ? getContent('ms_hero_universal_button_2', config.hero.buttons.secondary.text)
              : config.hero.buttons.secondary.text
            }
          </Link>
          <Link 
            to={config.hero.buttons.tertiary.path}
            className="bg-white/90 backdrop-blur-sm text-ms-primary-blue font-medium px-8 py-4 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            {isMS 
              ? getContent('ms_hero_universal_button_3', config.hero.buttons.tertiary.text)
              : config.hero.buttons.tertiary.text
            }
          </Link>
        </div>
      </div>
      
      {/* Bottom Gradient - Transição suave para próxima seção */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white from-20% via-white/60 via-60% to-transparent"></div>
    </div>
  );
};

export default UniversalHero;