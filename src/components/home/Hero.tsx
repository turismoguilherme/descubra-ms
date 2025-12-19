import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Camera, Calendar } from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';

const HeroSimple = () => {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('ms_hero_');
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
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {getContent('ms_hero_title', 'Descubra Mato Grosso do Sul')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            {getContent('ms_hero_subtitle', 'Explore destinos incríveis, crie roteiros únicos e viva experiências inesquecíveis')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <MapPin className="mr-2 h-5 w-5" />
              {getContent('ms_hero_button_1', 'Explorar Destinos')}
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Camera className="mr-2 h-5 w-5" />
              {getContent('ms_hero_button_2', 'Ver Galerias')}
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
              <Calendar className="mr-2 h-5 w-5" />
              {getContent('ms_hero_button_3', 'Eventos')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSimple;