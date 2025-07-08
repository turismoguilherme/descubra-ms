
-- Correções de Segurança: Fase 1 (Continuação) - Políticas de RLS

-- 1. Protegendo a tabela 'user_profiles'
-- Garante que os usuários só possam ver e gerenciar seus próprios perfis.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 2. Protegendo a tabela 'user_roles'
-- Permite que usuários vejam seu próprio nível de acesso, mas apenas gestores podem modificar.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can manage user roles" ON public.user_roles
  FOR ALL USING (public.is_manager(auth.uid()));


-- 3. Protegendo a tabela 'location_logs'
-- Garante que os registros de localização de um usuário sejam privados.
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own location logs" ON public.location_logs;
DROP POLICY IF EXISTS "Managers can view all location logs" ON public.location_logs;

CREATE POLICY "Users can manage their own location logs" ON public.location_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all location logs" ON public.location_logs
  FOR SELECT USING (public.is_manager(auth.uid()));


-- 4. Protegendo a tabela 'security_audit_log'
-- Apenas gestores podem visualizar os logs de auditoria de segurança. Ninguém pode modificar os registros diretamente.
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Managers can view security audit log" ON public.security_audit_log;

CREATE POLICY "Managers can view security audit log" ON public.security_audit_log
  FOR SELECT USING (public.is_manager(auth.uid()));

