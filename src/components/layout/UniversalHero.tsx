// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBrand } from "@/context/BrandContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { platformContentService } from '@/services/admin/platformContentService';
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown } from "lucide-react";

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
  const { language } = useLanguage();
  const [msContent, setMsContent] = useState<Record<string, string>>({});
  
  // Log inicial para debug
  useEffect(() => {
    console.log('🎬 [UniversalHero] Componente renderizado:', { isMS, language });
  }, [isMS, language]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [placeholderImageUrl, setPlaceholderImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMS) {
      // Resetar estados ao recarregar conteúdo para evitar flickering
      setVideoUrl(null);
      setVideoReady(false);
      setVideoLoading(false);
      setContentLoaded(false);
      setPlaceholderImageUrl(null);
      setImageLoaded(false);
      
      const loadContent = async () => {
        try {
          // Buscar conteúdo com tradução baseada no idioma atual
          console.log(`🌐 [UniversalHero] Buscando conteúdo para idioma: ${language}`);
          const contents = await platformContentService.getContentByPrefix('ms_hero_', language);
          console.log(`📄 [UniversalHero] Recebidos ${contents.length} itens de conteúdo`);

          const contentMap: Record<string, string> = {};
          contents.forEach(item => {
            contentMap[item.content_key] = item.content_value || '';
            console.log(`📝 [UniversalHero] ${item.content_key}: "${item.content_value?.substring(0, 50) || '(vazio)'}"`);
          });

          console.log(`✅ [UniversalHero] ContentMap final:`, Object.keys(contentMap));
          setMsContent(contentMap);
          
          // Carregar URL da imagem placeholder PRIMEIRO
          const placeholderImage = contentMap['ms_hero_video_placeholder_image_url'];
          console.log('🖼️ [UniversalHero] Carregando placeholder:', { 
            hasPlaceholder: !!placeholderImage, 
            placeholderUrl: placeholderImage?.substring(0, 50) || 'não encontrado'
          });
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:71',message:'Verificando placeholder',data:{hasPlaceholder:!!placeholderImage,placeholderLength:placeholderImage?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          if (placeholderImage && placeholderImage.trim()) {
            setPlaceholderImageUrl(placeholderImage.trim());
            setImageLoaded(false);
            // Pré-carregar a imagem
            const img = new Image();
            img.onload = () => {
              console.log('✅ [UniversalHero] Imagem placeholder carregada');
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:79',message:'Imagem placeholder carregada',data:{imageLoaded:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              setImageLoaded(true);
            };
            img.onerror = () => {
              console.warn('❌ [UniversalHero] Erro ao carregar imagem placeholder');
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:85',message:'Erro ao carregar placeholder',data:{imageLoaded:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              setImageLoaded(false);
            };
            img.loading = 'eager';
            img.src = placeholderImage.trim();
          } else {
            setPlaceholderImageUrl(null);
            setImageLoaded(false);
          }
          
          // Carregar URL do vídeo DEPOIS
          const video = contentMap['ms_hero_video_url'];
          console.log('🎥 [UniversalHero] Carregando vídeo:', { 
            hasVideo: !!video, 
            videoUrl: video?.substring(0, 50) || 'não encontrado',
            allKeys: Object.keys(contentMap)
          });
          if (video && video.trim()) {
            setVideoUrl(video.trim());
            setVideoLoading(true);
            setVideoReady(false);
          } else {
            setVideoUrl(null); // Garantir que é null se não há vídeo
            setVideoLoading(false);
            setVideoReady(false);
          }
          
          setContentLoaded(true);
        } catch (error) {
          console.error('Erro ao carregar conteúdo:', error);
          setVideoLoading(false);
        }
      };
      loadContent();
    } else {
      setVideoLoading(false);
    }
  }, [isMS, language]);

  const getContent = (key: string, fallback: string) => msContent[key] || fallback;

  // Função para converter URL do YouTube em embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    // YouTube - suporta múltiplos formatos
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      // Parâmetros otimizados para background video - sem controles, sem informações, sem fullscreen
      // Usando youtube-nocookie.com para evitar cookies e informações extras
      // Parâmetros adicionais para esconder informações do YouTube no mobile
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&mute=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&fs=0&disablekb=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&enablejsapi=0&origin=${window.location.origin}&widget_referrer=${window.location.origin}&color=white&theme=dark&autohide=1&wmode=opaque&mute=1&start=0&end=0&playsinline=1&nocookie=1`;
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
  
  useEffect(() => {
    if (videoUrl) {
      console.log('🔗 [UniversalHero] URL do vídeo:', videoUrl.substring(0, 50));
      console.log('🔗 [UniversalHero] URL do embed:', embedUrl?.substring(0, 100) || 'não gerada');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:131',message:'URL embed gerada',data:{hasEmbedUrl:!!embedUrl,embedUrlLength:embedUrl?.length||0,hasModestbranding:embedUrl?.includes('modestbranding')||false,hasControls:embedUrl?.includes('controls=0')||false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
  }, [videoUrl, embedUrl]);

  // Fallback: se o onLoad não disparar, marcar como pronto após um tempo
  useEffect(() => {
    if (embedUrl && !videoReady && videoLoading) {
      console.log('⏰ [UniversalHero] Iniciando fallback timer para vídeo');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:139',message:'Fallback timer iniciado',data:{hasEmbedUrl:!!embedUrl,videoReady,videoLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const fallbackTimer = setTimeout(() => {
        console.log('⏰ [UniversalHero] Fallback: marcando vídeo como pronto após timeout');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:142',message:'Fallback timer executado',data:{videoReady:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setVideoLoading(false);
        setVideoReady(true);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:145',message:'Vídeo marcado como pronto via fallback',data:{videoReady:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }, 2000); // Reduzido para 2 segundos para aparecer mais rápido

      return () => {
        console.log('🧹 [UniversalHero] Limpando fallback timer');
        clearTimeout(fallbackTimer);
      };
    }
  }, [embedUrl, videoReady, videoLoading]);

  // Para MS, usar tradução do i18next, com fallback para conteúdo do banco ou padrão
  const title = isMS ? t('hero.title', { defaultValue: 'Descubra Mato Grosso do Sul' }) : config.hero.title;
  const subtitle = isMS 
    ? t('hero.subtitle', { defaultValue: getContent('ms_hero_universal_subtitle', 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul') })
    : config.hero.subtitle;


  return (
    <>
    <style>{`
      /* Esconder elementos do YouTube completamente - Desktop e Mobile */
      .hero-section iframe[src*="youtube"] {
        pointer-events: none !important;
      }
      /* Garantir que o iframe não mostre controles mesmo em hover */
      .hero-section iframe[src*="youtube"]:hover {
        pointer-events: none !important;
      }
      /* Garantir que o overlay cubra tudo */
      .hero-section .youtube-overlay {
        z-index: 10 !important;
      }
      /* Garantir que iframe fique abaixo dos overlays */
      .hero-section iframe[src*="youtube"] {
        z-index: 1 !important;
      }
      
      /* Mobile: Esconder completamente informações do YouTube */
      @media (max-width: 768px) {
        .hero-section iframe[src*="youtube"] {
          /* Forçar esconder todos os elementos do YouTube */
          overflow: hidden !important;
        }
        
        /* Esconder qualquer elemento filho do iframe do YouTube */
        .hero-section iframe[src*="youtube"] * {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Esconder controles, títulos, logos do YouTube */
        .hero-section iframe[src*="youtube"]::before,
        .hero-section iframe[src*="youtube"]::after {
          display: none !important;
        }
      }
      
      /* Esconder elementos do YouTube que aparecem sobre o vídeo */
      .hero-section iframe[src*="youtube"] + *,
      .hero-section [class*="ytp"],
      .hero-section [id*="ytp"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `}</style>
    <div 
      className="relative flex items-center justify-center overflow-hidden hero-section"
      style={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%',
        minHeight: '100vh',
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#000000'
      }}
    >
      {/* Background Video ou Image */}
      {embedUrl ? (
        <>
          {/* Imagem placeholder - aparece enquanto vídeo está carregando */}
          {contentLoaded && placeholderImageUrl && imageLoaded && !videoReady && (
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden z-[5]"
              style={{
                opacity: videoReady ? 0 : 1,
                pointerEvents: 'none',
                transition: videoReady ? 'opacity 0.5s ease-out' : 'opacity 0s',
                zIndex: videoReady ? 0 : 5,
              }}
              ref={(el) => {
                // #region agent log
                if (el) {
                  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:273',message:'Imagem placeholder renderizada',data:{contentLoaded,hasPlaceholder:!!placeholderImageUrl,imageLoaded,videoReady},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                }
                // #endregion
              }}
            >
              <img
                src={placeholderImageUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  imageRendering: 'high-quality',
                  display: 'block',
                }}
                loading="eager"
                decoding="sync"
              />
            </div>
          )}
          
          {/* Fallback: fundo preto enquanto vídeo não está pronto E não há imagem placeholder */}
          {contentLoaded && (!placeholderImageUrl || !imageLoaded) && !videoReady && (
            <div 
              className="absolute inset-0 bg-black z-[2]"
            />
          )}
          
          {embedUrl.includes('youtube') ? (
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden z-0"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                minHeight: '100vh'
              }}
            >
              {/* Container para vídeo YouTube - técnica para cobrir toda tela (desktop e mobile) */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: isMobile ? '100vw' : '100vw',
                  height: isMobile ? '100vh' : '56.25vw', // Mobile: altura completa, Desktop: 16:9
                  minHeight: '100vh',
                  minWidth: isMobile ? '100vw' : '177.77vh', // Mobile: largura completa
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                  overflow: 'hidden' // Esconder qualquer overflow no mobile
                }}
              >
                <iframe
                  src={embedUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    opacity: videoReady ? 1 : 0,
                    visibility: videoReady ? 'visible' : 'hidden',
                    transition: 'opacity 0.5s ease-in-out',
                    pointerEvents: 'none',
                    zIndex: 1,
                    display: videoReady ? 'block' : 'none',
                    overflow: 'hidden', // Esconder overflow
                    clipPath: 'inset(0 0 0 0)' // Garantir que nada apareça fora
                  }}
                  allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                  allowFullScreen={false}
                  frameBorder="0"
                  title="Background video"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  ref={(el) => {
                    // #region agent log
                    if (el) {
                      const computedStyle = window.getComputedStyle(el);
                      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:287',message:'Iframe renderizado',data:{videoReady,opacity:computedStyle.opacity,visibility:computedStyle.visibility,display:computedStyle.display,zIndex:computedStyle.zIndex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    }
                    // #endregion
                  }}
                  onLoad={() => {
                    console.log('✅ [UniversalHero] Iframe do YouTube carregado');
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:300',message:'Iframe YouTube carregado',data:{videoReady,embedUrl:embedUrl?.substring(0,100)||''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    
                    // Marcar como pronto IMEDIATAMENTE para mostrar o vídeo
                    setTimeout(() => {
                      console.log('✅ [UniversalHero] Vídeo pronto para exibição');
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:305',message:'Marcando vídeo como pronto',data:{videoReady:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      // #endregion
                      setVideoLoading(false);
                      setVideoReady(true);
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UniversalHero.tsx:310',message:'Vídeo marcado como pronto',data:{videoReady:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      // #endregion
                    }, 500); // Reduzido para 500ms para aparecer mais rápido
                  }}
                  onError={(e) => {
                    console.error('❌ [UniversalHero] Erro ao carregar iframe do YouTube:', e);
                    setVideoLoading(false);
                  }}
                />
              </div>
            </div>
          ) : embedUrl.includes('vimeo.com') ? (
            <div 
              className="absolute inset-0 w-full h-full overflow-hidden z-0"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                minHeight: '100vh'
              }}
            >
              <iframe
                src={embedUrl}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100vh',
                  border: 'none',
                  opacity: videoReady ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  zIndex: 0,
                  pointerEvents: 'auto'
                }}
                allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen={true}
                mozallowfullscreen="true"
                webkitallowfullscreen="true"
                frameBorder="0"
                onLoad={() => {
                  console.log('✅ [UniversalHero] Iframe do YouTube carregado');
                  setTimeout(() => {
                    console.log('✅ [UniversalHero] Vídeo pronto para exibição');
                    setVideoLoading(false);
                    setVideoReady(true);
                  }, 3000);
                }}
                onError={(e) => {
                  console.error('❌ [UniversalHero] Erro ao carregar iframe do YouTube:', e);
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
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0"
              style={{
                width: '100%',
                height: '100%',
                minWidth: '100%',
                minHeight: '100vh',
                objectFit: 'cover',
                opacity: videoReady ? 1 : 0
              }}
              onLoadedData={() => {
                setTimeout(() => {
                  setVideoLoading(false);
                  setVideoReady(true);
                }, 3000);
              }}
              onCanPlay={() => {
                setTimeout(() => {
                  setVideoLoading(false);
                  setVideoReady(true);
                }, 3000);
              }}
            >
              <source src={embedUrl} type="video/mp4" />
            </video>
          )}
        </>
      ) : placeholderImageUrl ? (
        <>
          {/* Quando não há vídeo mas há imagem, mostrar imagem */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden z-0"
            style={{
              zIndex: 1
            }}
          >
            <img
              src={placeholderImageUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              loading="eager"
            />
          </div>
        </>
      ) : (
        <>
          {/* Quando não há vídeo nem imagem, mostrar fundo preto */}
          <div 
            className="absolute inset-0 bg-black z-0"
              style={{
                zIndex: 1
              }}
            />
        </>
      )}
      
      {/* Overlay para melhor legibilidade do texto - mais forte no mobile para esconder YouTube */}
        <div 
          className="absolute inset-0 z-[2]"
          style={{
            background: isMobile 
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)'
              : 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.4) 100%)'
          }}
        ></div>
      
      {/* Borda decorativa ondulada - transição minimalista */}
      <div className="absolute bottom-0 left-0 w-full z-[20] pointer-events-none" style={{ transform: 'translateY(1px)' }}>
        <svg 
          viewBox="0 0 1440 80" 
          preserveAspectRatio="none" 
          className="w-full h-auto block"
          style={{ height: '40px', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,40 Q180,10 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z" 
            fill="white" 
            stroke="none"
          />
        </svg>
      </div>
      
      {/* Content Container com animação */}
      <div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in duration-1000"
        style={{ 
          zIndex: 1000,
          position: 'relative'
        }}
      >
        {/* Título estilizado como na referência */}
        <h1 
          className="mb-6 leading-tight drop-shadow-2xl"
          style={{ 
            zIndex: 1,
            position: 'relative',
            display: 'block',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <span 
            className="block font-playfair italic text-4xl md:text-5xl lg:text-6xl mb-2"
            style={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            Descubra
          </span>
          <span 
            className="block text-white font-bold text-3xl md:text-5xl lg:text-6xl"
            style={{ 
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            Mato Grosso do Sul
          </span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          {subtitle}
        </p>
        
        {/* Buttons melhorados */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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

        {/* Scroll Indicator - como na referência */}
        <div className="flex flex-col items-center animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/80" />
        </div>
      </div>
      
      {/* Bottom Gradient Transition - removido para evitar efeito branco excessivo */}
    </div>
    </>
  );
};

export default UniversalHero;