// @ts-nocheck
import { useEffect, useState } from 'react';
import { Loader2, Play, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { platformContentService } from '@/services/admin/platformContentService';
import { getGuataCarouselThumbnail, getGuataEmbedSrc, getGuataVideoProvider } from '@/utils/guataVideo';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface GuataVideo {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  display_order: number;
}

const GuataVideosSection = () => {
  const [videos, setVideos] = useState<GuataVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  const [activeVideo, setActiveVideo] = useState<GuataVideo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const items = await platformContentService.getContentByPrefix('ms_guata_videos_');
        const map: Record<string, string> = {};
        items.forEach((i: any) => (map[i.content_key] = i.content_value || ''));
        setContent(map);
      } catch (e) {
        console.error('Erro carregando conteúdo Guatá videos:', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('guata_videos')
          .select('id,title,youtube_url,thumbnail_url,display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (error) throw error;
        setVideos(data || []);
      } catch (e) {
        console.error('Erro carregando vídeos Guatá:', e);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const get = (k: string, fb: string) => content[k] || fb;

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
        <div className="ms-container flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-ms-primary-blue" />
        </div>
      </section>
    );
  }

  if (videos.length === 0) return null;

  const activeProvider = activeVideo ? getGuataVideoProvider(activeVideo.youtube_url) : null;

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
        <div className="ms-container">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-ms-primary-blue mb-5">
              {get('ms_guata_videos_title', 'Conheça MS com o Guatá')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {get(
                'ms_guata_videos_description',
                'Vídeos curtos do nosso guia digital mostrando os encantos de Mato Grosso do Sul.'
              )}
            </p>
          </div>

          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-ms-primary-blue/30">
            {videos.map((v, idx) => {
              const thumb = getGuataCarouselThumbnail(v.youtube_url, v.thumbnail_url, 'maxres');
              const fallbackThumb = getGuataCarouselThumbnail(v.youtube_url, v.thumbnail_url, 'hq');
              const provider = getGuataVideoProvider(v.youtube_url);
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className="group relative flex-shrink-0 snap-start w-[240px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 80}ms` }}
                  aria-label={`Reproduzir vídeo: ${v.title}`}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={v.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        if (fallbackThumb && (e.target as HTMLImageElement).src !== fallbackThumb) {
                          (e.target as HTMLImageElement).src = fallbackThumb;
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal flex flex-col items-center justify-center gap-2 px-4">
                      <Play size={40} className="text-white/90" />
                      <span className="text-white/85 text-xs font-medium text-center">
                        {provider === 'instagram' ? 'Instagram' : 'Vídeo'}
                      </span>
                    </div>
                  )}

                  {/* Overlay escuro pra contraste */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Botão play centralizado */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play size={28} className="text-ms-primary-blue fill-ms-primary-blue ml-1" />
                    </div>
                  </div>

                  {/* Título embaixo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 drop-shadow-lg">
                      {v.title}
                    </h3>
                  </div>

                  {/* Badge MS canto superior */}
                  <div className="absolute top-3 left-3 bg-ms-primary-blue/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Guatá
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal do player */}
      <Dialog open={!!activeVideo} onOpenChange={(o) => !o && setActiveVideo(null)}>
        <DialogContent
          className={cn(
            'p-0 overflow-hidden bg-black border-0 [&>button]:hidden',
            activeProvider === 'instagram' ? 'max-w-[420px]' : 'max-w-4xl'
          )}
        >
          <DialogTitle className="sr-only">{activeVideo?.title || 'Vídeo'}</DialogTitle>
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            aria-label="Fechar vídeo"
          >
            <X size={20} />
          </button>
          {activeVideo && (
            <div
              className={cn(
                'w-full',
                activeProvider === 'instagram' ? 'aspect-[9/16] max-h-[85vh]' : 'aspect-video'
              )}
            >
              <iframe
                src={
                  getGuataEmbedSrc(activeVideo.youtube_url, {
                    autoplay: true,
                    controls: true,
                  }) || ''
                }
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={activeVideo.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuataVideosSection;
