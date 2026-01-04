import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import { platformContentService } from '@/services/admin/platformContentService';
import WhatViajARTurDoesSection from '@/components/home/WhatViajARTurDoesSection';
import SuccessCasesSection from '@/components/home/SuccessCasesSection';
// CommercialSection removido temporariamente


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
    
    // Extrair ID do YouTube de diferentes formatos
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
  // Estados para conteúdos editáveis
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Carregar conteúdos do banco
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

  // Helper para obter conteúdo com fallback
  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };


  // Stats removidos - podem ser reativados via admin futuramente
  // const stats = [
  //   { value: "50K+", label: "Usuários Ativos" },
  //   { value: "95%", label: "Satisfação" },
  //   { value: "27", label: "Estados" },
  //   { value: "500+", label: "Parceiros" },
  // ];

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            {getContent('viajar_hero_badge') && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
                <span className="text-sm text-white/90 font-medium">{getContent('viajar_hero_badge', 'Plataforma #1 de Turismo Inteligente')}</span>
            </div>
            )}
            
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              {getContent('viajar_hero_title') ? (
                <span className="text-white">{getContent('viajar_hero_title', 'ViajARTur')}</span>
              ) : (
                <>
              <span className="text-white">Viaj</span>
              <span className="text-viajar-cyan">AR</span>
              <span className="text-white">Tur</span>
                </>
              )}
            </h1>
            
            {getContent('viajar_hero_subtitle') && (
            <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
                {getContent('viajar_hero_subtitle', 'Ecossistema inteligente de turismo')}
            </p>
            )}
            
            {getContent('viajar_hero_description') && (
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
                {getContent('viajar_hero_description', 'Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.')}
            </p>
            )}
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/viajar/login">
                <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2 shadow-lg shadow-viajar-cyan/25">
                  {getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-8 h-14 text-lg backdrop-blur-sm">
                  {getContent('viajar_hero_cta_secondary', 'Agendar Demo')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* O que a ViajARTur faz - Cards visuais grandes */}
      <WhatViajARTurDoesSection />

      {/* Cases de Sucesso - Koda + Descubra MS */}
      <SuccessCasesSection />

      {/* Video Section */}
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
          
          {/* Video Container */}
          <VideoSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {getContent('viajar_cta_title', 'Pronto para Transformar seu Turismo?')}
          </h2>
          {getContent('viajar_cta_description') && (
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
              {getContent('viajar_cta_description', 'Junte-se a empresas e órgãos públicos que já confiam na ViajARTur.')}
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


      <ViaJARFooter />
      <CookieConsentBanner platform="viajar" />
    </div>
  );
};

export default ViaJARSaaS;
