# 📋 Instruções: Aplicar Migrations para Sistema de Parceiros

## ⚠️ Problema Identificado

As tabelas necessárias ainda não foram criadas no banco de dados. Os erros mostram:
- `relation "public.partner_reservations" does not exist`
- `relation "public.partner_notifications" does not exist`
- `relation "public.partner_transactions" does not exist`
- `relation "public.reservation_messages" does not exist`

## ✅ Solução

Execute o arquivo SQL consolidado no Supabase para criar todas as tabelas.

### **Passo a Passo:**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o arquivo SQL:**
   - Abra o arquivo `APLICAR_MIGRATIONS_PARCEIROS.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run" (ou pressione Ctrl+Enter)

4. **Verifique o resultado:**
   - O script mostrará mensagens de sucesso para cada tabela criada
   - No final, você verá uma tabela mostrando quais tabelas foram criadas

### **O que será criado:**

✅ **`partner_reservations`** - Tabela de reservas dos parceiros
✅ **`partner_transactions`** - Histórico de transações financeiras
✅ **`partner_notifications`** - Sistema de notificações
✅ **`reservation_messages`** - Chat entre cliente e parceiro

### **Após executar:**

1. Recarregue a página do dashboard (`/partner/dashboard`)
2. Os erros devem desaparecer
3. O dashboard deve funcionar normalmente

---

## 🔍 Verificação Manual

Se quiser verificar se as tabelas foram criadas, execute no SQL Editor:

```sql
SELECT 
  tablename,
  '✅ Criada' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'partner_reservations', 
  'partner_transactions', 
  'partner_notifications', 
  'reservation_messages'
)
ORDER BY tablename;
```

Deve retornar 4 linhas, uma para cada tabela.

---

## 📝 Notas Importantes

- O script é **idempotente** (pode ser executado múltiplas vezes sem problemas)
- Ele verifica se as tabelas já existem antes de criar
- As políticas RLS (Row Level Security) são criadas automaticamente
- O Realtime é habilitado para notificações em tempo real

---

**Após executar o SQL, recarregue a página e tudo deve funcionar!** 🚀
