# 📋 Instruções: Executar Migration de Templates no Supabase

## 🎯 Objetivo
Migrar os 14 templates de email hardcoded para a tabela `message_templates` para que possam ser editados via interface admin.

## 📝 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

3. **Cole o conteúdo da migration**
   - Abra o arquivo: `supabase/migrations/20250120000001_migrate_email_templates.sql`
   - Copie TODO o conteúdo do arquivo
   - Cole no SQL Editor do Supabase

4. **Execute o script**
   - Clique em **Run** (ou pressione Ctrl+Enter)
   - Aguarde a execução completar

5. **Verifique se funcionou**
   - Execute esta query para verificar:
   ```sql
   SELECT COUNT(*) as total_templates, 
          COUNT(CASE WHEN is_active = true THEN 1 END) as templates_ativos
   FROM message_templates 
   WHERE channel = 'email';
   ```
   - Deve retornar: `total_templates: 14` e `templates_ativos: 14`

6. **Verifique os templates inseridos**
   ```sql
   SELECT name, purpose, is_active 
   FROM message_templates 
   WHERE channel = 'email' 
   ORDER BY name;
   ```
   - Deve listar todos os 14 templates

## ✅ Verificação Final

Após executar a migration:

1. **No Admin Panel:**
   - Vá em: `Sistema` → `Gestão de Emails` → `Templates`
   - Você deve ver 14 templates listados
   - Todos devem estar ativos (badge verde)

2. **Teste de edição:**
   - Clique em "Editar" em qualquer template
   - Faça uma pequena alteração
   - Salve
   - Verifique se a alteração foi salva

## ⚠️ Problemas Comuns

### Erro: "duplicate key value violates unique constraint"
- **Causa**: Templates já existem no banco
- **Solução**: A migration usa `ON CONFLICT DO NOTHING`, então é seguro executar novamente

### Erro: "permission denied"
- **Causa**: RLS (Row Level Security) bloqueando
- **Solução**: Verifique se você está logado como admin no Supabase Dashboard

### Templates não aparecem no admin
- **Causa**: Cache do navegador ou RLS
- **Solução**: 
  1. Limpe o cache do navegador
  2. Faça logout e login novamente no admin
  3. Verifique se a tabela `message_templates` tem RLS habilitado e políticas corretas

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do Supabase (Dashboard → Logs)
2. Console do navegador (F12 → Console)
3. Network tab para ver requisições falhando

