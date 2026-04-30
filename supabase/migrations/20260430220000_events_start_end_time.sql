-- Horários públicos de evento (cadastro Descubra MS / admin)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS start_time text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS end_time text;

COMMENT ON COLUMN public.events.start_time IS 'Hora de início (ex.: HH:mm) no contexto das datas data_inicio/data_fim.';
COMMENT ON COLUMN public.events.end_time IS 'Hora de término (ex.: HH:mm) para ocultar evento após o instante de fim.';
