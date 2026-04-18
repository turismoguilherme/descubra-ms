-- ============================================
-- CONFIGURAR SECRETS NO VAULT
-- ============================================
-- IMPORTANTE: Execute estes comandos UM POR VEZ no Supabase SQL Editor
-- Substitua os valores pelos seus dados reais

-- 1. Obter URL do projeto:
--    - Vá em Settings → API → Project URL
--    - Copie a URL completa (exemplo: https://hvtrpkbjgbuypkskqcqm.supabase.co)
--    - Execute o comando abaixo substituindo YOUR_PROJECT_URL

SELECT vault.create_secret(
  'https://YOUR_PROJECT_REF.supabase.co',
  'autonomous_agent_project_url'
);

-- 2. Obter ANON KEY:
--    - Vá em Settings → API → Project API keys
--    - Copie a chave "anon public"
--    - Execute o comando abaixo substituindo YOUR_ANON_KEY

SELECT vault.create_secret(
  'YOUR_ANON_KEY',
  'autonomous_agent_anon_key'
);

-- 3. Verificar se foram criados:
SELECT name, created_at 
FROM vault.decrypted_secrets 
WHERE name IN ('autonomous_agent_project_url', 'autonomous_agent_anon_key')
ORDER BY name;


