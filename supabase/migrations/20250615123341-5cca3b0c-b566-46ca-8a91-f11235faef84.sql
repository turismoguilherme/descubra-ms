
-- Cria tipos ENUM para garantir a consistência dos dados de parceiros.
CREATE TYPE public.partner_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.partner_category AS ENUM ('local', 'regional', 'estadual');
CREATE TYPE public.partner_tier AS ENUM ('ouro', 'prata', 'bronze', 'apoiador');

-- Cria a tabela para armazenar os parceiros institucionais.
CREATE TABLE public.institutional_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  city TEXT NOT NULL,
  segment TEXT NOT NULL,
  website_link TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,
  message TEXT,
  
  -- Categorização do parceiro
  category public.partner_category NOT NULL,
  tier public.partner_tier,

  -- Fluxo de aprovação
  status public.partner_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativa a Segurança a Nível de Linha (RLS)
ALTER TABLE public.institutional_partners ENABLE ROW LEVEL SECURITY;

-- Política: Usuários públicos podem visualizar parceiros aprovados.
CREATE POLICY "Public can view approved partners"
  ON public.institutional_partners
  FOR SELECT
  USING (status = 'approved');

-- Política: Qualquer pessoa pode enviar um pedido de parceria.
CREATE POLICY "Anyone can create a partnership request"
  ON public.institutional_partners
  FOR INSERT
  WITH CHECK (true);

-- Política: Gestores podem gerenciar todos os parceiros.
CREATE POLICY "Managers can manage all partners"
  ON public.institutional_partners
  FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'tech', 'gestor'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'tech', 'gestor'));
  
-- Trigger para atualizar 'updated_at' automaticamente.
CREATE TRIGGER handle_institutional_partners_updated_at
BEFORE UPDATE ON public.institutional_partners
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
