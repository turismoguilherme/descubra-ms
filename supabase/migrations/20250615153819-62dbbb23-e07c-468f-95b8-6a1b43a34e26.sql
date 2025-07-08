
-- Correções de Segurança: Fase 1 (Continuação) - Política para city_managers

-- Esta política corrige o alerta "RLS Enabled No Policy" para a tabela `public.city_managers`.
-- Apenas usuários com nível de acesso de gestor poderão visualizar e modificar os dados.

ALTER TABLE public.city_managers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can manage city managers" ON public.city_managers;

CREATE POLICY "Managers can manage city managers" ON public.city_managers
  FOR ALL
  USING (public.is_manager(auth.uid()))
  WITH CHECK (public.is_manager(auth.uid()));

