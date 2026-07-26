-- Editor da cartilha Guatá Capacita: salvar content_data com o login da própria cartilha
-- (sem precisar estar logado como admin Descubra no app).
-- Rode no SQL Editor do Supabase (PRODUCTION).

CREATE OR REPLACE FUNCTION public.save_guata_cartilha_content(
  p_slug text,
  p_email text,
  p_password text,
  p_content jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF lower(trim(coalesce(p_email, ''))) <> lower('guilhermearevalo27@gmail.com')
     OR trim(coalesce(p_password, '')) <> '99212361701040' THEN
    RAISE EXCEPTION 'Credenciais de editor inválidas';
  END IF;

  IF p_content IS NULL OR jsonb_typeof(p_content) <> 'object' THEN
    RAISE EXCEPTION 'content_data inválido';
  END IF;

  UPDATE public.guata_cartilhas
  SET
    content_data = p_content,
    updated_at = now()
  WHERE slug = coalesce(nullif(trim(p_slug), ''), 'guata-capacita')
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Cartilha não encontrada';
  END IF;

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

REVOKE ALL ON FUNCTION public.save_guata_cartilha_content(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_guata_cartilha_content(text, text, text, jsonb) TO anon, authenticated;

COMMENT ON FUNCTION public.save_guata_cartilha_content IS
  'Persiste content_data da cartilha autenticando com o login do editor HTML (Guatá Capacita).';
