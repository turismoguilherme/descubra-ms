
-- Cria a tabela para os animais do Cerrado, com a mesma estrutura da tabela de animais do Pantanal.
CREATE TABLE public.cerrado_animals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  scientific_name text,
  image_url text,
  description text,
  rarity_level text NOT NULL DEFAULT 'comum'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adiciona um comentário para descrever a finalidade da tabela.
COMMENT ON TABLE public.cerrado_animals IS 'Armazena informações sobre animais do bioma Cerrado para o passaporte digital.';

-- Habilita a segurança em nível de linha (RLS).
ALTER TABLE public.cerrado_animals ENABLE ROW LEVEL SECURITY;

-- Cria uma política que permite o acesso público de leitura aos dados dos animais do Cerrado.
CREATE POLICY "Permitir acesso público de leitura aos animais do cerrado"
ON public.cerrado_animals FOR SELECT
USING (true);
