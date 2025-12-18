-- Migration: Corrigir políticas RLS das tabelas de IA
-- Descrição: As políticas RLS estavam usando user_profiles.role que não existe.
-- O campo role está na tabela user_roles, não em user_profiles.
-- Data: 2025-12-18

-- ============================================
-- CORREÇÃO DAS POLÍTICAS RLS
-- ============================================

-- Remover políticas incorretas que usam user_profiles.role
DROP POLICY IF EXISTS "Admins can view ai_analyses" ON ai_analyses;
DROP POLICY IF EXISTS "Admins can insert ai_analyses" ON ai_analyses;
DROP POLICY IF EXISTS "Admins can view ai_seo_improvements" ON ai_seo_improvements;
DROP POLICY IF EXISTS "Admins can insert ai_seo_improvements" ON ai_seo_improvements;
DROP POLICY IF EXISTS "Admins can update ai_seo_improvements" ON ai_seo_improvements;
DROP POLICY IF EXISTS "Admins can view ai_auto_approvals" ON ai_auto_approvals;
DROP POLICY IF EXISTS "Admins can insert ai_auto_approvals" ON ai_auto_approvals;

-- Criar políticas corretas usando user_roles
-- Nota: A constraint de user_roles permite: 'admin', 'tech', 'diretor_estadual', 'gestor_igr', 'gestor_municipal', 'atendente', 'user'
-- Usamos apenas 'admin' e 'tech' para acesso às tabelas de IA
CREATE POLICY "Admins can view ai_analyses" ON ai_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_analyses" ON ai_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can view ai_seo_improvements" ON ai_seo_improvements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_seo_improvements" ON ai_seo_improvements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can update ai_seo_improvements" ON ai_seo_improvements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can view ai_auto_approvals" ON ai_auto_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

CREATE POLICY "Admins can insert ai_auto_approvals" ON ai_auto_approvals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

COMMENT ON POLICY "Admins can view ai_analyses" ON ai_analyses IS 'Permite que admins vejam análises de IA. Usa user_roles para verificar permissões.';
COMMENT ON POLICY "Admins can insert ai_analyses" ON ai_analyses IS 'Permite que admins insiram análises de IA. Usa user_roles para verificar permissões.';

