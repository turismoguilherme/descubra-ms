import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import { platformContentService } from '@/services/admin/platformContentService';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';
import WhatViajARTurDoesSection from '@/components/home/WhatViajARTurDoesSection';
import SuccessCasesSection from '@/components/home/SuccessCasesSection';
import TravelTechHero from '@/components/home/TravelTechHero';
import PlatformInActionSection from '@/components/home/PlatformInActionSection';
import BenefitsSection from '@/components/home/BenefitsSection';

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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border bg-viajar-slate">
      {!loading && embedUrl ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title="ViajARTur - Plataforma de Turismo Inteligente"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-viajar-slate to-slate-800">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-viajar-cyan/20 flex items-center justify-center mx-auto mb-4">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-viajar-cyan border-b-[12px] border-b-transparent ml-1" />
            </div>
            <p className="text-white/60 text-sm">
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
  const [loading, setLoading] = useState(true);
  const { isSectionActive, loading: controlsLoading } = useViaJARSectionControls();

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
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <TravelTechHero />

      {/* O que a ViajARTur faz */}
      {isSectionActive('what_we_do') && <WhatViajARTurDoesSection />}

      {/* Plataforma em Ação */}
      {isSectionActive('platform_in_action') && <PlatformInActionSection />}

      {/* Benefícios */}
      {isSectionActive('benefits') && <BenefitsSection />}

      {/* Cases de Sucesso */}
      {isSectionActive('success_cases') && <SuccessCasesSection />}

      {/* Video Section */}
      {isSectionActive('video_section') && (
        <section className="py-24 bg-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {getContent('viajar_video_title', 'Veja a Plataforma em Ação')}
              </h2>
              {getContent('viajar_video_description') && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {getContent('viajar_video_description', 'Descubra como a ViajARTur pode transformar a gestão do turismo na sua região')}
                </p>
              )}
            </div>
            <VideoSection />
          </div>
        </section>
      )}

      {/* CTA Section */}
      {isSectionActive('cta_section') && (
        <section className="py-24 bg-viajar-slate">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {getContent('viajar_cta_title', 'Pronto para Transformar a Gestão Turística?')}
            </h2>
            {getContent('viajar_cta_description') && (
              <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                {getContent('viajar_cta_description', 'Junte-se a secretarias de turismo e empresários que confiam na ViajARTur para decisões estratégicas.')}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contato">
                <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
                  {getContent('viajar_cta_button_primary', 'Solicitar Demonstração')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/precos">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 h-14 text-lg backdrop-blur-sm">
                  {getContent('viajar_cta_button_secondary', 'Ver Planos')}
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
