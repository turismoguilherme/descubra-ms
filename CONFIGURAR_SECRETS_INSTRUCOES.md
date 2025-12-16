# 🔐 Configurar Secrets no Supabase Vault

## ⚠️ PROBLEMA IDENTIFICADO

O cron job está falhando porque os secrets não foram configurados no Vault. O erro mostra:
- `url: null` → Secret `autonomous_agent_project_url` não encontrado
- `Authorization: null` → Secret `autonomous_agent_anon_key` não encontrado

## ✅ SOLUÇÃO: Configurar os Secrets

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
2. **Vá em Database → Vault**
3. **Clique em "Create Secret"**

#### Secret 1: URL do Projeto
- **Name:** `autonomous_agent_project_url`
- **Secret:** `https://SEU_PROJECT_REF.supabase.co`
  - Para encontrar: **Settings** → **API** → **Project URL**
  - Exemplo: `https://hvtrpkbjgbuypkskqcqm.supabase.co`

#### Secret 2: Anon Key
- **Name:** `autonomous_agent_anon_key`
- **Secret:** Sua chave anon
  - Para encontrar: **Settings** → **API** → **Project API keys** → **anon public**

### Opção 2: Via SQL Editor

Execute os comandos do arquivo `CONFIGURAR_SECRETS.sql` **UM POR VEZ**, substituindo os valores:

```sql
-- 1. Criar secret da URL (substitua YOUR_PROJECT_REF)
SELECT vault.create_secret(
  'https://YOUR_PROJECT_REF.supabase.co',
  'autonomous_agent_project_url'
);

-- 2. Criar secret da anon key (substitua YOUR_ANON_KEY)
SELECT vault.create_secret(
  'YOUR_ANON_KEY',
  'autonomous_agent_anon_key'
);
```

## ✅ Verificar se Funcionou

Execute o arquivo `VERIFICAR_SECRETS.sql` para confirmar que os secrets foram criados:

```sql
SELECT name, created_at 
FROM vault.decrypted_secrets 
WHERE name IN ('autonomous_agent_project_url', 'autonomous_agent_anon_key')
ORDER BY name;
```

Você deve ver 2 linhas retornadas.

## 🔄 Após Configurar

Após configurar os secrets, o cron job deve funcionar automaticamente na próxima execução (próximo minuto). Você pode verificar executando `VERIFICAR_CRON.sql` novamente.


