CREATE TABLE public.guata_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guata_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guata_videos_public_read"
ON public.guata_videos FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "guata_videos_admin_read_all"
ON public.guata_videos FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_videos_admin_insert"
ON public.guata_videos FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_videos_admin_update"
ON public.guata_videos FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "guata_videos_admin_delete"
ON public.guata_videos FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE INDEX idx_guata_videos_active_order ON public.guata_videos (is_active, display_order);

CREATE TRIGGER guata_videos_set_updated_at
BEFORE UPDATE ON public.guata_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();