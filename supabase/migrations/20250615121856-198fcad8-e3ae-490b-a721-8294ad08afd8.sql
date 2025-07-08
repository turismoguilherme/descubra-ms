
-- Cria a tabela para armazenar o conteúdo institucional editável.
CREATE TABLE public.institutional_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text', -- Tipos podem ser 'text', 'link', 'image_url'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativa a segurança a nível de linha (RLS) para a tabela.
ALTER TABLE public.institutional_content ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer pessoa (público) possa ler o conteúdo.
CREATE POLICY "Public can read institutional content"
  ON public.institutional_content
  FOR SELECT
  USING (true);

-- Permite que apenas usuários com papéis de gestor possam criar, atualizar ou deletar conteúdo.
CREATE POLICY "Managers can manage institutional content"
  ON public.institutional_content
  FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'tech', 'gestor', 'municipal', 'atendente'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'tech', 'gestor', 'municipal', 'atendente'));

-- Cria uma função para atualizar automaticamente o campo `updated_at` em cada modificação.
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o gatilho (trigger) para executar a função de atualização.
CREATE TRIGGER handle_institutional_content_updated_at
BEFORE UPDATE ON public.institutional_content
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Adiciona um gatilho para auditar todas as mudanças feitas nesta tabela.
CREATE TRIGGER audit_institutional_content_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.institutional_content
FOR EACH ROW EXECUTE FUNCTION public.audit_content_changes();

-- Insere os dados iniciais que serão editáveis na nova seção.
INSERT INTO public.institutional_content (content_key, content_value, content_type, description) VALUES
('hero_title', 'Descubra Mato Grosso do Sul', 'text', 'Título principal na página inicial.'),
('hero_subtitle', 'Do Pantanal ao Cerrado, uma experiência única de natureza, cultura e aventura', 'text', 'Subtítulo na página inicial.'),
('hero_button_register', 'Cadastre-se', 'text', 'Texto do botão de cadastro no Hero.'),
('hero_button_passport', 'Passaporte Digital', 'text', 'Texto do botão do passaporte no Hero.'),
('hero_button_delinha', 'Converse com a Delinha', 'text', 'Texto do botão da Delinha no Hero.'),
('footer_description', 'Sua plataforma digital para explorar as maravilhas do Mato Grosso do Sul, conhecer a cultura local e planejar suas viagens.', 'text', 'Descrição no rodapé.'),
('footer_initiative', 'Uma iniciativa da Fundtur-MS', 'text', 'Texto sobre a iniciativa no rodapé.'),
('footer_facebook_link', 'https://www.facebook.com/VisiteMatoGrossodoSul/', 'link', 'Link para a página do Facebook.'),
('footer_instagram_link', 'https://www.instagram.com/visitems/', 'link', 'Link para a página do Instagram.'),
('footer_twitter_link', 'https://twitter.com/visitems', 'link', 'Link para a página do Twitter.'),
('footer_youtube_link', 'https://www.youtube.com/user/turismomatogrossodosul', 'link', 'Link para o canal do Youtube.'),
('footer_contact_email', 'contato@istoems.com.br', 'text', 'Email de contato no rodapé.'),
('footer_contact_phone', '(67) 3318-7600', 'text', 'Telefone de contato no rodapé.');
