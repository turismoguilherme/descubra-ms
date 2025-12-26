-- Script para verificar e corrigir políticas RLS da tabela routes

-- 1. Verificar se RLS está habilitado
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'routes';

-- 2. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'routes';

-- 3. Habilitar RLS se não estiver habilitado
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas (se necessário)
DROP POLICY IF EXISTS "Admins can manage routes" ON routes;
DROP POLICY IF EXISTS "Routes are publicly readable" ON routes;

-- 5. Criar política para admins gerenciarem rotas
CREATE POLICY "Admins can manage routes"
ON routes
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'municipal_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'municipal_manager')
  )
);

-- 6. Criar política para leitura pública de rotas ativas
CREATE POLICY "Routes are publicly readable"
ON routes
FOR SELECT
TO public
USING (is_active = true);

-- 7. Verificar roles do usuário atual
SELECT 
  ur.user_id,
  ur.role,
  u.email
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role IN ('admin', 'tech', 'municipal_manager')
ORDER BY u.email, ur.role;

-- 8. Verificar se o usuário atual tem permissão
SELECT 
  auth.uid() as current_user_id,
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'tech', 'municipal_manager')
  ) as has_permission;

