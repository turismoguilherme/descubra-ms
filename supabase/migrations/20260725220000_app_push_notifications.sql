-- Push notifications do app Descubra MS (Guatá → eventos por cidade/GPS)

CREATE TABLE IF NOT EXISTS public.app_push_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  platform text NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  fcm_token text NOT NULL,
  city_name text,
  latitude double precision,
  longitude double precision,
  events_nearby boolean NOT NULL DEFAULT true,
  guata_tips boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_push_devices_fcm_token_unique UNIQUE (fcm_token)
);

CREATE INDEX IF NOT EXISTS idx_app_push_devices_city
  ON public.app_push_devices (lower(trim(city_name)))
  WHERE events_nearby = true AND city_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_push_devices_user
  ON public.app_push_devices (user_id);

CREATE TABLE IF NOT EXISTS public.app_push_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES public.app_push_devices(id) ON DELETE CASCADE,
  event_id uuid,
  kind text NOT NULL CHECK (kind IN ('event_new', 'event_reminder', 'guata_tip')),
  title text,
  body text,
  deep_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_push_log_dedupe
  ON public.app_push_log (device_id, event_id, kind)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_push_log_created
  ON public.app_push_log (created_at DESC);

ALTER TABLE public.app_push_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_push_log ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado gerencia o próprio device; anônimos usam Edge Function (service role)
DROP POLICY IF EXISTS app_push_devices_select_own ON public.app_push_devices;
CREATE POLICY app_push_devices_select_own
  ON public.app_push_devices FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS app_push_devices_update_own ON public.app_push_devices;
CREATE POLICY app_push_devices_update_own
  ON public.app_push_devices FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS app_push_devices_delete_own ON public.app_push_devices;
CREATE POLICY app_push_devices_delete_own
  ON public.app_push_devices FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Sem policies de INSERT para authenticated: upsert via Edge Function (service role)
-- Sem policies em app_push_log para clientes: só service role

COMMENT ON TABLE public.app_push_devices IS
  'Tokens FCM do app Capacitor; city_name vem do GPS (cidade atual) para matching de eventos.';
COMMENT ON TABLE public.app_push_log IS
  'Histórico/dedupe de pushes enviados (eventos novos e lembretes).';
