-- Migration: Criar tabela viajar_products
-- Description: Tabela para gerenciar produtos/soluções do ViajARTur com suporte a imagens e vídeos
-- Date: 2025-01-31

CREATE TABLE IF NOT EXISTS viajar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações Básicas (Marketing)
  title TEXT NOT NULL,
  short_description TEXT,                  -- Descrição curta e marketing
  full_description TEXT,                   -- Descrição completa (opcional)
  
  -- Mídia (IMPORTANTE!)
  image_url TEXT,                          -- URL da imagem principal
  video_url TEXT,                          -- URL do vídeo (YouTube) - OPCIONAL
  icon_name TEXT,                          -- Nome do ícone Lucide (ex: "Brain")
  gradient_colors TEXT,                    -- Cores do gradiente (ex: "from-purple-500 to-violet-600")
  
  -- Ordenação e Status
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Links e CTAs
  cta_text TEXT DEFAULT 'Saiba mais',     -- Texto do botão
  cta_link TEXT,                          -- Link (ex: "/solucoes/guata-ia")
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_viajar_products_display_order ON viajar_products(display_order);
CREATE INDEX IF NOT EXISTS idx_viajar_products_is_active ON viajar_products(is_active);

-- Comentários
COMMENT ON TABLE viajar_products IS 'Produtos/Soluções do ViajARTur gerenciáveis via admin';
COMMENT ON COLUMN viajar_products.title IS 'Título do produto/solução';
COMMENT ON COLUMN viajar_products.short_description IS 'Descrição curta e marketing (usada nos cards)';
COMMENT ON COLUMN viajar_products.full_description IS 'Descrição completa (opcional)';
COMMENT ON COLUMN viajar_products.image_url IS 'URL da imagem principal do produto';
COMMENT ON COLUMN viajar_products.video_url IS 'URL do vídeo do YouTube (opcional)';
COMMENT ON COLUMN viajar_products.icon_name IS 'Nome do ícone Lucide (ex: Brain, TrendingUp)';
COMMENT ON COLUMN viajar_products.gradient_colors IS 'Cores do gradiente (ex: from-purple-500 to-violet-600)';
COMMENT ON COLUMN viajar_products.display_order IS 'Ordem de exibição (menor = primeiro)';
COMMENT ON COLUMN viajar_products.is_active IS 'Se o produto está ativo e deve ser exibido';
COMMENT ON COLUMN viajar_products.cta_text IS 'Texto do botão de call-to-action';
COMMENT ON COLUMN viajar_products.cta_link IS 'Link de destino do botão CTA';

-- RLS Policies (apenas admins podem editar, todos podem ler)
ALTER TABLE viajar_products ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem ler produtos ativos
CREATE POLICY "Anyone can view active products"
  ON viajar_products
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins podem ver todos os produtos
CREATE POLICY "Admins can view all products"
  ON viajar_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Policy: Admins podem inserir produtos
CREATE POLICY "Admins can insert products"
  ON viajar_products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Policy: Admins podem atualizar produtos
CREATE POLICY "Admins can update products"
  ON viajar_products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Policy: Admins podem deletar produtos
CREATE POLICY "Admins can delete products"
  ON viajar_products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'master_admin', 'tech')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_viajar_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_viajar_products_updated_at
  BEFORE UPDATE ON viajar_products
  FOR EACH ROW
  EXECUTE FUNCTION update_viajar_products_updated_at();






