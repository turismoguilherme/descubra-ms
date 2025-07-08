
-- Correções de Segurança: Fase 1 - Políticas de RLS

-- Protegendo a tabela 'profiles'. Esta tabela armazena informações de perfil vinculadas a um usuário.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Removendo políticas existentes para evitar conflitos.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Permitindo que usuários atualizem seu próprio perfil.
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permitindo acesso público de leitura aos perfis.
CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Protegendo a tabela 'cat_checkins'. Ela contém dados de localização dos atendentes.
ALTER TABLE public.cat_checkins ENABLE ROW LEVEL SECURITY;

-- Removendo políticas existentes para evitar conflitos.
DROP POLICY IF EXISTS "Attendants can manage their own checkins" ON public.cat_checkins;
DROP POLICY IF EXISTS "Managers can view all checkins" ON public.cat_checkins;

-- Permitindo que atendentes gerenciem (criem, leiam, atualizem, apaguem) seus próprios registros de check-in.
-- O campo 'attendant_id' é comparado com o ID do usuário autenticado.
CREATE POLICY "Attendants can manage their own checkins" ON public.cat_checkins
  FOR ALL USING (auth.uid() = attendant_id);

-- Permitindo que gestores ('admin', 'tech', 'gestor', 'municipal') visualizem todos os check-ins para supervisão.
-- A função is_manager() já existe e será utilizada aqui.
CREATE POLICY "Managers can view all checkins" ON public.cat_checkins
  FOR SELECT USING (public.is_manager(auth.uid()));

