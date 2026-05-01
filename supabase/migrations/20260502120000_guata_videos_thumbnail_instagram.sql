-- Capa opcional (recomendado para Instagram). youtube_url continua guardando link YouTube ou Instagram.
ALTER TABLE public.guata_videos
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN public.guata_videos.youtube_url IS 'URL do vídeo (YouTube ou post/reel público do Instagram).';
COMMENT ON COLUMN public.guata_videos.thumbnail_url IS 'Miniatura opcional; se vazio, YouTube usa thumbnail oficial; Instagram usa placeholder no carrossel.';
