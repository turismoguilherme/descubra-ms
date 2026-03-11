
-- Tabela para assinantes de newsletter, separada por plataforma
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('descubra_ms', 'viajar')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (email, platform)
);

-- Habilitar RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (anon ou autenticada) pode se inscrever
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins podem ler todos os assinantes
CREATE POLICY "Admins can read newsletter subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Admins podem atualizar (desativar assinantes)
CREATE POLICY "Admins can update newsletter subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Admins podem deletar assinantes
CREATE POLICY "Admins can delete newsletter subscribers"
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));
