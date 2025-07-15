-- Corrigir dados inconsistentes existentes (versão corrigida)

-- 1. Remover usuários duplicados na tabela user_profiles que não existem em auth.users
DELETE FROM public.user_profiles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);

-- 2. Remover roles duplicadas na tabela user_roles que não existem em auth.users
DELETE FROM public.user_roles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);

-- 3. Garantir que não existam conflitos de constraint unique (versão corrigida)
DELETE FROM public.user_roles 
WHERE ctid NOT IN (
  SELECT MIN(ctid) 
  FROM public.user_roles 
  GROUP BY user_id, role
);

-- 4. Função para corrigir perfis incompletos
CREATE OR REPLACE FUNCTION fix_incomplete_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar perfis básicos para usuários que não têm perfil
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    'tourist',
    u.created_at,
    now()
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;

  -- Atualizar perfis com dados nulos
  UPDATE public.user_profiles 
  SET 
    full_name = COALESCE(full_name, 'Usuário'),
    display_name = COALESCE(display_name, 'Usuário'),
    user_type = COALESCE(user_type, 'tourist'),
    updated_at = now()
  WHERE full_name IS NULL OR display_name IS NULL OR user_type IS NULL;
END;
$$;

-- 5. Executar a função de correção
SELECT fix_incomplete_profiles();

-- 6. Indexar para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 7. Log da correção
INSERT INTO public.security_audit_log (
  action,
  user_id,
  success,
  created_at
) VALUES (
  'data_consistency_fix',
  NULL,
  true,
  now()
);