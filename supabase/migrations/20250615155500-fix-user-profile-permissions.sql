
-- Correção de Segurança: Permitir que gestores vejam todos os perfis de usuário

-- A política atual em `user_profiles` só permite que um usuário veja seu próprio perfil.
-- Isso impede que administradores e gestores visualizem a lista de usuários em painéis de gerenciamento.
-- Esta migração adiciona uma nova política para conceder permissão de leitura a usuários com função de gestor.

DROP POLICY IF EXISTS "Managers can view all user profiles" ON public.user_profiles;

CREATE POLICY "Managers can view all user profiles" ON public.user_profiles
  FOR SELECT
  USING (public.is_manager(auth.uid()));
