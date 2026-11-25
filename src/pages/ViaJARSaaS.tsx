import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import { platformContentService } from '@/services/admin/platformContentService';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';
import WhatGuataLabsDoesSection from '@/components/home/WhatGuataLabsDoesSection';
import TravelTechHero from '@/components/home/TravelTechHero';
import PlatformInActionSection from '@/components/home/PlatformInActionSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import GuataMethodologySection from '@/components/home/guata/GuataMethodologySection';
import GuataVisionSection from '@/components/home/guata/GuataVisionSection';

const VideoSection = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_hero_video_url');
        const videoContent = contents.find(c => c.content_key === 'viajar_hero_video_url');
        if (videoContent?.content_value) {
          setVideoUrl(videoContent.content_value);
        }
      } catch (error) {
        console.error('Erro ao carregar vídeo:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVideo();
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-guata-gold/25 bg-guata-deep">
      {!loading && embedUrl ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title="Guatá Labs — plataforma de turismo inteligente"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-guata-deep to-guata-forest">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-guata-gold/20 flex items-center justify-center mx-auto mb-4">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-guata-gold border-b-[12px] border-b-transparent ml-1" />
            </div>
            <p className="text-guata-cream/70 text-sm">
              {loading ? 'Carregando...' : 'Configure o vídeo no admin'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ViaJARSaaS = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const { isSectionActive } = useViaJARSectionControls();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  return (
    <div className="min-h-screen bg-guata-cream">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <TravelTechHero />

      {/* Método Guatá Labs */}
      <GuataMethodologySection />

      {/* O que a Guatá Labs faz */}
      {isSectionActive('what_we_do') && <WhatGuataLabsDoesSection />}

      {/* Plataforma em Ação */}
      {isSectionActive('platform_in_action') && <PlatformInActionSection />}

      {/* Benefícios */}
      {isSectionActive('benefits') && <BenefitsSection />}

      {/* Video Section */}
      {isSectionActive('video_section') && (
        <section className="py-24 bg-guata-paper">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold font-guata text-guata-deep mb-4">
                {getContent('viajar_video_title', 'Veja a Plataforma em Ação')}
              </h2>
              <p className="text-lg text-guata-bark/85 max-w-2xl mx-auto">
                {getContent('viajar_video_description', 'Descubra como a Guatá Labs pode transformar a gestão do turismo na sua região')}
              </p>
            </div>
            <VideoSection />
          </div>
        </section>
      )}

      <GuataVisionSection />

      {/* CTA final */}
      {isSectionActive('cta_section') && (
        <section className="bg-guata-paper px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl border-t border-guata-forest/15 pt-16 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-guata-forest">Vamos conversar</p>
            <h2 className="mb-6 font-guata text-3xl font-bold text-guata-deep sm:text-5xl">
              {getContent('viajar_cta_title', 'Qual é o próximo passo do seu destino?')}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-guata-bark/75">
              {getContent('viajar_cta_description', 'Conheça as possibilidades da Guatá Labs em uma apresentação orientada à realidade da sua operação.')}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/contato">
                <Button size="lg" className="h-14 gap-2 bg-guata-forest px-8 text-lg font-semibold text-guata-cream hover:bg-guata-deep">
                  {getContent('viajar_cta_button_primary', 'Solicitar demonstração')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/precos">
                <Button size="lg" variant="outline" className="h-14 border-guata-forest/25 bg-transparent px-8 text-lg text-guata-deep hover:bg-guata-forest/5">
                  {getContent('viajar_cta_button_secondary', 'Conhecer soluções')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <ViaJARFooter />
      <CookieConsentBanner platform="viajar" />
    </div>
  );
};

export default ViaJARSaaS;
