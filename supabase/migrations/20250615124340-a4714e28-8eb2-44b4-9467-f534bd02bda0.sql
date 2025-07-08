
-- Cria o bucket 'partner-logos' e o torna público.
-- A cláusula ON CONFLICT garante que não haverá erro se o bucket já existir.
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Define a política para permitir que qualquer pessoa visualize os logotipos.
-- Isso é necessário para que as imagens apareçam na galeria pública.
CREATE POLICY "Partner logos are publicly viewable."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'partner-logos' );

-- Define a política para permitir que qualquer pessoa envie um logotipo.
-- Isso é essencial para o funcionamento do formulário "Quero ser parceiro".
CREATE POLICY "Anyone can upload a partner logo."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'partner-logos' );

-- Define a política para permitir que gestores atualizem os logotipos.
-- Será útil na área administrativa.
CREATE POLICY "Managers can update partner logos."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'partner-logos' AND get_user_role(auth.uid()) IN ('admin', 'tech', 'gestor') );

-- Define a política para permitir que gestores removam os logotipos.
-- Também será útil na área administrativa.
CREATE POLICY "Managers can delete partner logos."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'partner-logos' AND get_user_role(auth.uid()) IN ('admin', 'tech', 'gestor') );
