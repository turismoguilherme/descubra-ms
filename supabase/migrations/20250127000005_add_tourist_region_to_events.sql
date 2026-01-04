-- Migration: Adicionar campo tourist_region_id na tabela events
-- Data: 2025-01-27
-- Descrição: Permite associar eventos diretamente às regiões turísticas

-- Adicionar coluna tourist_region_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'tourist_region_id'
  ) THEN
    ALTER TABLE events ADD COLUMN tourist_region_id UUID REFERENCES tourist_regions(id);
    COMMENT ON COLUMN events.tourist_region_id IS 'ID da região turística onde o evento ocorre';

    -- Criar índice para melhor performance
    CREATE INDEX IF NOT EXISTS idx_events_tourist_region_id ON events(tourist_region_id);

    RAISE NOTICE 'Coluna tourist_region_id adicionada à tabela events';
  ELSE
    RAISE NOTICE 'Coluna tourist_region_id já existe na tabela events';
  END IF;
END $$;

-- Atualizar eventos existentes com base na localização (cidade)
-- Isso vai associar automaticamente os eventos existentes às regiões corretas
UPDATE events
SET tourist_region_id = (
  SELECT tr.id
  FROM tourist_regions tr
  WHERE
    -- Pantanal
    (tr.slug = 'pantanal' AND (
      LOWER(events.location) LIKE '%corumbá%' OR
      LOWER(events.location) LIKE '%ladário%' OR
      LOWER(events.location) LIKE '%aquidauana%' OR
      LOWER(events.location) LIKE '%miranda%' OR
      LOWER(events.location) LIKE '%anastácio%' OR
      LOWER(events.location) LIKE '%pantanal%'
    )) OR
    -- Bonito-Serra da Bodoquena
    (tr.slug = 'bonito-serra-bodoquena' AND (
      LOWER(events.location) LIKE '%bonito%' OR
      LOWER(events.location) LIKE '%bodoquena%' OR
      LOWER(events.location) LIKE '%jardim%' OR
      LOWER(events.location) LIKE '%bela vista%' OR
      LOWER(events.location) LIKE '%caracol%' OR
      LOWER(events.location) LIKE '%guia lopes%' OR
      LOWER(events.location) LIKE '%nioaque%' OR
      LOWER(events.location) LIKE '%porto murtinho%'
    )) OR
    -- Vale das Águas
    (tr.slug = 'vale-aguas' AND (
      LOWER(events.location) LIKE '%nova andradina%' OR
      LOWER(events.location) LIKE '%angélica%' OR
      LOWER(events.location) LIKE '%batayporã%' OR
      LOWER(events.location) LIKE '%ivinhema%' OR
      LOWER(events.location) LIKE '%jateí%' OR
      LOWER(events.location) LIKE '%novo horizonte do sul%' OR
      LOWER(events.location) LIKE '%taquarussu%'
    )) OR
    -- Vale do Aporé
    (tr.slug = 'vale-apore' AND (
      LOWER(events.location) LIKE '%cassilândia%' OR
      LOWER(events.location) LIKE '%chapadão do sul%' OR
      LOWER(events.location) LIKE '%inocência%'
    )) OR
    -- Rota Norte
    (tr.slug = 'rota-norte' AND (
      LOWER(events.location) LIKE '%coxim%' OR
      LOWER(events.location) LIKE '%alcinópolis%' OR
      LOWER(events.location) LIKE '%bandeirantes%' OR
      LOWER(events.location) LIKE '%camapuã%' OR
      LOWER(events.location) LIKE '%costa rica%' OR
      LOWER(events.location) LIKE '%figueirão%' OR
      LOWER(events.location) LIKE '%paraíso das águas%' OR
      LOWER(events.location) LIKE '%pedro gomes%' OR
      LOWER(events.location) LIKE '%rio verde de mato grosso%' OR
      LOWER(events.location) LIKE '%são gabriel do oeste%' OR
      LOWER(events.location) LIKE '%sonora%'
    )) OR
    -- Caminho dos Ipês
    (tr.slug = 'caminho-ipes' AND (
      LOWER(events.location) LIKE '%campo grande%' OR
      LOWER(events.location) LIKE '%corguinho%' OR
      LOWER(events.location) LIKE '%dois irmãos do buriti%' OR
      LOWER(events.location) LIKE '%jaraguari%' OR
      LOWER(events.location) LIKE '%nova alvorada%' OR
      LOWER(events.location) LIKE '%ribas do rio pardo%' OR
      LOWER(events.location) LIKE '%rio negro%' OR
      LOWER(events.location) LIKE '%sidrolândia%' OR
      LOWER(events.location) LIKE '%terenos%'
    )) OR
    -- Caminhos da Fronteira
    (tr.slug = 'caminhos-fronteira' AND (
      LOWER(events.location) LIKE '%ponta porã%' OR
      LOWER(events.location) LIKE '%antônio joão%' OR
      LOWER(events.location) LIKE '%laguna carapã%'
    )) OR
    -- Costa Leste
    (tr.slug = 'costa-leste' AND (
      LOWER(events.location) LIKE '%três lagoas%' OR
      LOWER(events.location) LIKE '%água clara%' OR
      LOWER(events.location) LIKE '%aparecida do taboado%' OR
      LOWER(events.location) LIKE '%bataguassu%' OR
      LOWER(events.location) LIKE '%brasilândia%' OR
      LOWER(events.location) LIKE '%paranaíba%' OR
      LOWER(events.location) LIKE '%santa rita do pardo%'
    )) OR
    -- Grande Dourados
    (tr.slug = 'grande-dourados' AND (
      LOWER(events.location) LIKE '%dourados%' OR
      LOWER(events.location) LIKE '%caarapó%' OR
      LOWER(events.location) LIKE '%deodápolis%' OR
      LOWER(events.location) LIKE '%douradina%' OR
      LOWER(events.location) LIKE '%fátima do sul%' OR
      LOWER(events.location) LIKE '%glória de dourados%' OR
      LOWER(events.location) LIKE '%itaporã%' OR
      LOWER(events.location) LIKE '%maracaju%' OR
      LOWER(events.location) LIKE '%rio brilhante%' OR
      LOWER(events.location) LIKE '%vicentina%'
    ))
  LIMIT 1
)
WHERE tourist_region_id IS NULL;

-- Log da migração
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM events WHERE tourist_region_id IS NOT NULL;
  RAISE NOTICE 'Migração concluída. % eventos associados a regiões turísticas.', updated_count;
END $$;





















