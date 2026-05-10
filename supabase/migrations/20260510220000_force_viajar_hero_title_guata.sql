-- Normaliza título do hero quando ainda contém a marca antiga (CMS).
UPDATE public.institutional_content
SET content_value = 'Guatá Labs — IA que transforma a gestão do turismo',
    updated_at = now()
WHERE content_key = 'viajar_hero_title'
  AND (
    content_value ILIKE '%viajartur%'
    OR TRIM(BOTH FROM content_value) IN ('ViajARTur', 'Viajartur', 'VIAJARTUR')
  );
