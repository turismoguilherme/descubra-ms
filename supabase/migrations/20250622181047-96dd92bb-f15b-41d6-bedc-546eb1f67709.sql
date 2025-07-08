
-- 1. HABILITAR RLS E CRIAR POLÍTICAS PARA user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user to become first admin" ON public.user_roles;

-- Política: Usuários podem ver sua própria role
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Admins e Techs podem gerenciar todas as roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin_or_tech(auth.uid()));

-- Política: Permitir que usuários autenticados criem sua primeira role SE não existir admin
CREATE POLICY "Allow first user to become admin" ON public.user_roles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'tech'))
  );

-- 2. LIMPAR POLÍTICAS DUPLICADAS EM user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Recriar políticas limpas para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (public.is_admin_or_tech(auth.uid()));

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin_or_tech(auth.uid()));

-- 3. ATUALIZAR TRIGGER PARA AUTO-PROMOÇÃO DE ADMIN
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log do início da função
  RAISE LOG 'TRIGGER: handle_new_user iniciado para usuário %', NEW.id;
  
  -- 1. Inserir perfil básico
  INSERT INTO public.user_profiles (
    user_id, 
    email, 
    full_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    updated_at = now();
  
  RAISE LOG 'TRIGGER: Perfil criado/atualizado para usuário %', NEW.id;
  
  -- 2. Verificar se é o primeiro usuário (não existe admin/tech)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'tech')) THEN
    -- Promover a admin
    INSERT INTO public.user_roles (user_id, role, region_id)
    VALUES (NEW.id, 'admin', NULL);
    
    RAISE LOG 'TRIGGER: Usuário % promovido a ADMIN (primeiro usuário)', NEW.id;
  ELSE
    -- Criar como usuário normal
    INSERT INTO public.user_roles (user_id, role, region_id)
    VALUES (NEW.id, 'user', NULL)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE LOG 'TRIGGER: Usuário % criado como USER normal', NEW.id;
  END IF;
  
  RAISE LOG 'TRIGGER: handle_new_user concluído para usuário %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'TRIGGER ERROR para usuário %: %', NEW.id, SQLERRM;
    -- Não bloquear o registro mesmo se houver erro nas roles
    RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. GARANTIR QUE A COLUNA region NÃO É region_id EM user_roles
-- (Baseado no schema, parece que é region_id, mas vamos garantir consistência)
DO $$
BEGIN
  -- Verificar se existe coluna 'region' e renomear para 'region_id' se necessário
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'user_roles' 
             AND column_name = 'region' 
             AND table_schema = 'public') THEN
    ALTER TABLE public.user_roles RENAME COLUMN region TO region_id;
    RAISE LOG 'Coluna region renomeada para region_id em user_roles';
  END IF;
END $$;
