import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBrand } from "@/context/BrandContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation('pages');
  const [msContent, setMsContent] = useState<Record<string, string>>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (isMS) {
      const loadContent = async () => {
        try {
          const contents = await platformContentService.getContentByPrefix('ms_hero_');
          const contentMap: Record<string, string> = {};
          contents.forEach(item => {
            contentMap[item.content_key] = item.content_value || '';
          });
          setMsContent(contentMap);
          
          // Carregar URL do vídeo se disponível
          const video = contentMap['ms_hero_video_url'];
          if (video && video.trim()) {
            setVideoUrl(video.trim());
            setVideoLoading(true);
          } else {
            setVideoLoading(false);
          }
        } catch (error) {
          console.error('Erro ao carregar conteúdo:', error);
          setVideoLoading(false);
        }
      };
      loadContent();
    } else {
      setVideoLoading(false);
    }
  }, [isMS]);

  const getContent = (key: string, fallback: string) => msContent[key] || fallback;

  // Função para converter URL do YouTube em embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    // YouTube - suporta múltiplos formatos
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      // Parâmetros otimizados para background video com melhor performance
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&fs=0&disablekb=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&loop=1&muted=1&background=1&autopause=0`;
    }
    // Se for URL direta de vídeo
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
    return null;
  };

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  // Para MS, usar tradução do i18next, com fallback para conteúdo do banco ou padrão
  const title = isMS ? t('hero.title', { defaultValue: 'Descubra Mato Grosso do Sul' }) : config.hero.title;
  const subtitle = isMS 
    ? t('hero.subtitle', { defaultValue: getContent('ms_hero_universal_subtitle', 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul') })
    : config.hero.subtitle;


  return (
    <div 
      className="relative min-h-[75vh] bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 flex items-center justify-center overflow-hidden hero-section"
      style={{ 
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Background Video ou Image */}
      {embedUrl ? (
        <>
          {embedUrl.includes('youtube.com/embed') ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {/* Loading overlay - gradiente enquanto carrega */}
              {videoLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 z-10 transition-opacity duration-500" style={{ opacity: videoReady ? 0 : 1 }}></div>
              )}
              <iframe
                src={embedUrl}
                className="absolute top-1/2 left-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full"
                style={{
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  pointerEvents: 'none',
                  border: 'none',
                  opacity: 1
                }}
                allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                allowFullScreen={false}
                frameBorder="0"
                onLoad={() => {
                  // Marcar como carregado imediatamente
                  setVideoLoading(false);
                  setVideoReady(true);
                }}
              />
            </div>
          ) : embedUrl.includes('vimeo.com') ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {videoLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 z-10 transition-opacity duration-500" style={{ opacity: videoReady ? 0 : 1 }}></div>
              )}
              <iframe
                src={embedUrl}
                className="absolute top-1/2 left-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full"
                style={{
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  pointerEvents: 'none',
                  border: 'none',
                  opacity: 1
                }}
                allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                allowFullScreen={false}
                frameBorder="0"
                onLoad={() => {
                  setVideoLoading(false);
                  setVideoReady(true);
                }}
              />
            </div>
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{
                opacity: videoReady ? 1 : 0
              }}
              onLoadedData={() => {
                setVideoLoading(false);
                setVideoReady(true);
              }}
              onCanPlay={() => {
                setVideoLoading(false);
                setVideoReady(true);
              }}
            >
              <source src={embedUrl} type="video/mp4" />
            </video>
          )}
        </>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 transition-opacity duration-1000"
          style={{
            backgroundImage: 'url("https://source.unsplash.com/photo-1482938289607-e9573fc25ebb")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        ></div>
      )}
      
      {/* Overlay bem mínimo para vídeo mais visível - apenas para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/15"></div>
      
      {/* Content Container com animação */}
      <div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in duration-1000"
        style={{ 
          zIndex: 1000,
          position: 'relative'
        }}
      >
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
          style={{ 
            zIndex: 1,
            position: 'relative',
            display: 'block',
            width: '100%',
            textAlign: 'center',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {title}
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          {subtitle}
        </p>
        
        {/* Buttons melhorados */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={config.hero.buttons.primary.path}
            className="group bg-ms-secondary-yellow text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-ms-secondary-yellow/95 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-ms-secondary-yellow/50"
          >
            {isMS 
              ? t('hero.button1', { defaultValue: getContent('ms_hero_universal_button_1', config.hero.buttons.primary.text) })
              : config.hero.buttons.primary.text
            }
          </Link>
          <Link 
            to={config.hero.buttons.secondary.path}
            className="group bg-ms-pantanal-green text-white font-semibold px-8 py-4 rounded-xl hover:bg-ms-pantanal-green/95 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-ms-pantanal-green/50"
          >
            {isMS 
              ? t('hero.button2', { defaultValue: getContent('ms_hero_universal_button_2', config.hero.buttons.secondary.text) })
              : config.hero.buttons.secondary.text
            }
          </Link>
          <Link 
            to={config.hero.buttons.tertiary.path}
            className="group bg-white/95 backdrop-blur-md text-ms-primary-blue font-semibold px-8 py-4 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-white/50"
          >
            {isMS 
              ? t('hero.button3', { defaultValue: getContent('ms_hero_universal_button_3', config.hero.buttons.tertiary.text) })
              : config.hero.buttons.tertiary.text
            }
          </Link>
        </div>
      </div>
      
      {/* Bottom Gradient - Transição suave para próxima seção */}
      <div className="absolute bottom-0 left-0 w-full h-72 bg-gradient-to-t from-white from-10% via-white/80 via-50% to-transparent"></div>
    </div>
  );
};

export default UniversalHero;