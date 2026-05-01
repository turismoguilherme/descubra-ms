-- Migração corretiva: remove o CHECK antigo de stamp_theme em passport_configurations
-- e amplia a coluna para VARCHAR(50), alinhado a stamp_themes.theme_key.
--
-- Motivo: ambientes onde 20250207000000 rodou mas 20250215000003 não (ou CHECK recriado)
-- rejeitam valores como capivara com erro 400 no PostgREST.
-- Idempotente: seguro reaplicar.

ALTER TABLE public.passport_configurations
  DROP CONSTRAINT IF EXISTS passport_configurations_stamp_theme_check;

ALTER TABLE public.passport_configurations
  ALTER COLUMN stamp_theme TYPE VARCHAR(50);

COMMENT ON COLUMN public.passport_configurations.stamp_theme IS
  'Chave do tema (ex.: onca, capivara); alinhada a public.stamp_themes.theme_key.';

-- Tema usado no admin / Guatá (só se stamp_themes existir)
DO $$
BEGIN
  IF to_regclass('public.stamp_themes') IS NOT NULL THEN
    INSERT INTO public.stamp_themes (theme_key, theme_name, emoji, color_primary, color_secondary, description)
    VALUES (
      'capivara',
      'Capivara',
      '🦫',
      '#6B8E23',
      '#8FBC8F',
      'Tema Guatá / capivara para carimbos do passaporte'
    )
    ON CONFLICT (theme_key) DO NOTHING;
  END IF;
END $$;
