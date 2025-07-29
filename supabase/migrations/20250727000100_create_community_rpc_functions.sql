-- Função para atualizar a contagem de votos de uma sugestão
CREATE OR REPLACE FUNCTION public.update_suggestion_votes_count(p_suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Garante que a função pode ser executada com permissões de owner
AS $$
BEGIN
  UPDATE public.community_suggestions
  SET votes_count = (SELECT COUNT(*) FROM public.community_votes WHERE suggestion_id = p_suggestion_id)
  WHERE id = p_suggestion_id;
END;
$$;

-- Função para incrementar a contagem de comentários de uma sugestão
CREATE OR REPLACE FUNCTION public.increment_suggestion_comments_count(p_suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.community_suggestions
  SET comments_count = comments_count + 1
  WHERE id = p_suggestion_id;
END;
$$; 