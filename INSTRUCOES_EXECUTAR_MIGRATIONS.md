# Instruções: Executar Migrations - Destinos, CATs e Footer

## 📋 O que foi criado

Foram criadas 2 migrations para habilitar os novos gerenciadores:

1. **`20250210000000_add_platform_to_cat_locations.sql`** - Adiciona campo `platform` na tabela `cat_locations`
2. **`20250210000001_create_site_settings_table.sql`** - Cria tabela `site_settings` para gerenciar footer

---

## ✅ Opção 1: Via SQL Editor do Supabase (RECOMENDADO - Mais Fácil)

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://app.supabase.com
   - Faça login na sua conta
   - Selecione o projeto do Descubra MS

2. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em **"SQL Editor"**
   - Clique em **"New query"** (Nova consulta)

3. **Execute a Migration 1: Adicionar campo platform**
   - Abra o arquivo: `supabase/migrations/20250210000000_add_platform_to_cat_locations.sql`
   - **Copie TODO o conteúdo** do arquivo
   - Cole no SQL Editor do Supabase
   - Clique em **"RUN"** (ou pressione `Ctrl+Enter`)
   - Aguarde a mensagem de sucesso ✅

4. **Execute a Migration 2: Criar tabela site_settings**
   - Abra o arquivo: `supabase/migrations/20250210000001_create_site_settings_table.sql`
   - **Copie TODO o conteúdo** do arquivo
   - Cole no SQL Editor do Supabase
   - Clique em **"RUN"** (ou pressione `Ctrl+Enter`)
   - Aguarde a mensagem de sucesso ✅

### ✅ Verificação

Após executar, você pode verificar se funcionou executando estas queries no SQL Editor:

```sql
-- Verificar se o campo platform foi adicionado
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cat_locations' AND column_name = 'platform';

-- Verificar se a tabela site_settings foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'site_settings';
```

Se ambos retornarem resultados, está tudo certo! ✅

---

## ⚙️ Opção 2: Via Supabase CLI (Se tiver instalado)

Se você tem o Supabase CLI instalado e configurado:

```bash
# No diretório do projeto
cd "C:\Users\guilh\Descubra MS\descubra-ms"

# Executar todas as migrations pendentes
supabase db push
```

**Nota:** Isso executará TODAS as migrations pendentes, não apenas as novas.

---

## 🎯 Após Executar as Migrations

Depois de executar as migrations, você poderá:

1. ✅ **Gerenciar Destinos** - Acesse: `/viajar/admin/descubra-ms/destinations`
2. ✅ **Gerenciar CATs** - Acesse: `/viajar/admin/descubra-ms/cats`
3. ✅ **Gerenciar Footer** - Acesse: `/viajar/admin/descubra-ms/footer`

---

## ⚠️ Problemas Comuns

### Erro: "column already exists"
- Significa que o campo `platform` já existe na tabela `cat_locations`
- **Solução:** Pule a Migration 1 e execute apenas a Migration 2

### Erro: "table already exists"
- Significa que a tabela `site_settings` já existe
- **Solução:** Pule a Migration 2 (já está criada)

### Erro de permissão
- Verifique se você tem permissão de administrador no projeto Supabase
- Certifique-se de estar logado com a conta correta

---

## 📝 Próximos Passos (Opcional)

Após executar as migrations, você pode:

1. **Popular dados iniciais de CATs** (se necessário)
2. **Configurar o footer** através do gerenciador no admin
3. **Criar destinos** através do gerenciador no admin

---

## ✅ Checklist

- [ ] Migration 1 executada com sucesso
- [ ] Migration 2 executada com sucesso
- [ ] Verificação realizada (queries de teste)
- [ ] Acessou o gerenciador de Destinos
- [ ] Acessou o gerenciador de CATs
- [ ] Acessou o gerenciador de Footer

---

**Dúvidas?** Verifique os logs no SQL Editor do Supabase ou consulte a documentação do Supabase.




