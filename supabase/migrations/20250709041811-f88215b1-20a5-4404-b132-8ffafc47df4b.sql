-- Create missing tables that are referenced in the code

-- Tourist regions table
CREATE TABLE public.tourist_regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Tourism intelligence documents table
CREATE TABLE public.tourism_intelligence_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID,
  description TEXT,
  tags TEXT[],
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Institutional content table
CREATE TABLE public.institutional_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT,
  content_type TEXT DEFAULT 'text',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Institutional partners table  
CREATE TABLE public.institutional_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  partner_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.tourist_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_intelligence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_partners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Tourist regions policies
CREATE POLICY "Tourist regions are publicly readable" ON public.tourist_regions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tourist regions" ON public.tourist_regions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech', 'municipal_manager')
    )
  );

-- Tourism intelligence documents policies
CREATE POLICY "Admins can manage tourism documents" ON public.tourism_intelligence_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech')
    )
  );

-- Institutional content policies
CREATE POLICY "Institutional content is publicly readable" ON public.institutional_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage institutional content" ON public.institutional_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech')
    )
  );

-- Institutional partners policies
CREATE POLICY "Institutional partners are publicly readable" ON public.institutional_partners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage institutional partners" ON public.institutional_partners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'tech')
    )
  );

-- Create update triggers for updated_at columns
CREATE TRIGGER update_tourist_regions_updated_at
  BEFORE UPDATE ON public.tourist_regions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tourism_intelligence_documents_updated_at
  BEFORE UPDATE ON public.tourism_intelligence_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutional_content_updated_at
  BEFORE UPDATE ON public.institutional_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_institutional_partners_updated_at
  BEFORE UPDATE ON public.institutional_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default institutional content
INSERT INTO public.institutional_content (content_key, content_value, description) VALUES
  ('footer_description', 'Descubra as maravilhas do Pantanal, Cerrado e muito mais. Sua jornada pelo coração da América do Sul começa aqui.', 'Descrição do rodapé'),
  ('footer_facebook_link', '#', 'Link do Facebook'),
  ('footer_instagram_link', '#', 'Link do Instagram'), 
  ('footer_twitter_link', '#', 'Link do Twitter'),
  ('footer_youtube_link', '#', 'Link do YouTube'),
  ('footer_contact_email', 'contato@descubramsconline.com.br', 'Email de contato'),
  ('footer_contact_phone', '(67) 3318-7600', 'Telefone de contato')
ON CONFLICT (content_key) DO NOTHING;