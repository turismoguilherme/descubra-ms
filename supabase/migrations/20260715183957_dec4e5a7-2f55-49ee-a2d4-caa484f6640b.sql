
CREATE TABLE public.guata_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','error','rate_limited')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_guata_action_logs_user_created ON public.guata_action_logs(user_id, created_at DESC);
CREATE INDEX idx_guata_action_logs_tool ON public.guata_action_logs(tool_name, created_at DESC);

GRANT SELECT ON public.guata_action_logs TO authenticated;
GRANT ALL ON public.guata_action_logs TO service_role;

ALTER TABLE public.guata_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own action logs"
  ON public.guata_action_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all action logs"
  ON public.guata_action_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','super_admin','master_admin')
  ));

CREATE POLICY "Service role manages action logs"
  ON public.guata_action_logs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
