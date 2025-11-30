# 🚀 Guia: Executar Migration do Passaporte Digital

## ⚠️ IMPORTANTE: Siga os passos na ordem!

### Passo 1: Verificar Dependências

1. Abra o **SQL Editor** no Supabase Dashboard
2. Execute o arquivo: `VERIFICAR_DEPENDENCIAS_PASSAPORTE.sql`
3. Verifique se todas as dependências estão OK (✅)
4. Se houver erros (❌), resolva-os antes de continuar

### Passo 2: Executar a Migration

1. No **SQL Editor**, abra o arquivo: `supabase/migrations/20250207000000_create_passport_digital_tables.sql`
2. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor (Ctrl+V)
4. Clique em **RUN** (ou Ctrl+Enter)
5. Aguarde a execução

### Passo 3: Verificar Resultado

1. Execute o arquivo: `DIAGNOSTICO_PASSAPORTE.sql`
2. Verifique se todas as tabelas, colunas, funções e políticas foram criadas (✅)
3. Se houver algo faltando (❌), consulte `TROUBLESHOOTING_PASSAPORTE.md`

### Passo 4: Testar no Frontend

1. Acesse: `/descubramatogrossodosul/passaporte`
2. Verifique se não há erros no console
3. Se houver erros, consulte `TROUBLESHOOTING_PASSAPORTE.md`

---

## 🔧 Se a Migration Falhar

### Erro: "duplicate key" ou "already exists"
**Solução:** A migration foi atualizada para usar `DROP POLICY IF EXISTS` e `CREATE OR REPLACE FUNCTION`. Execute novamente.

### Erro: "relation does not exist"
**Solução:** 
1. Execute `VERIFICAR_DEPENDENCIAS_PASSAPORTE.sql` para identificar qual tabela está faltando
2. Execute a migration que cria essa tabela primeiro

### Erro: "column 'role' does not exist"
**Solução:** ✅ JÁ CORRIGIDO - A migration foi atualizada para usar `user_roles` em vez de `user_profiles.role`

### Erro: "permission denied"
**Solução:** 
1. Verifique se você tem permissões de admin no Supabase
2. Tente executar como `service_role` se necessário

---

## 📋 Checklist Final

Após executar a migration, verifique:

- [ ] 5 tabelas criadas: `passport_configurations`, `passport_rewards`, `user_rewards`, `offline_checkins`, `user_passports`
- [ ] Colunas adicionadas em `routes`: `video_url`, `passport_number_prefix`
- [ ] Colunas adicionadas em `route_checkpoints`: `stamp_fragment_number`, `geofence_radius`, `requires_photo`
- [ ] 5 funções criadas: `generate_passport_number`, `calculate_distance`, `check_geofence`, `check_checkin_rate_limit`, `unlock_rewards`
- [ ] Políticas RLS criadas para todas as tabelas
- [ ] Frontend acessa `/descubramatogrossodosul/passaporte` sem erros

---

## 🆘 Ainda com Problemas?

1. Execute `DIAGNOSTICO_PASSAPORTE.sql` e copie o resultado
2. Copie a mensagem de erro completa do SQL Editor
3. Consulte `TROUBLESHOOTING_PASSAPORTE.md`
4. Se ainda não resolver, forneça essas informações para suporte

