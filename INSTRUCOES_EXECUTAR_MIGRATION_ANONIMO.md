# Instruções para Permitir INSERT Anônimo no Guatá

## O que foi implementado

Criada migration para permitir que usuários **não autenticados** salvem:
- **Feedback** (`guata_feedback`)
- **Interações e aprendizado** (`guata_user_memory`)

Isso permite que o Guatá aprenda e melhore mesmo com usuários anônimos no `/chatguata`.

## Segurança implementada

✅ **Validações de dados:**
- `session_id` obrigatório (para rastreamento)
- Tamanhos máximos de campos (question: 5000, answer: 10000, etc.)
- `user_id` deve ser NULL para anônimos (não podem usar IDs de outros)

✅ **Proteções:**
- Apenas INSERT permitido para anônimos
- SELECT, UPDATE, DELETE continuam bloqueados para anônimos
- Usuários autenticados continuam com todas as permissões

## Como executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo:
   `supabase/migrations/20250205000000_allow_anonymous_inserts_guata_ml.sql`
4. Execute o script
5. Verifique se não há erros

### Opção 2: Via CLI

```bash
# Se estiver usando Supabase CLI localmente
supabase db push
```

## Tabelas afetadas

1. **`guata_feedback`**
   - ✅ Permite INSERT anônimo (com `session_id`)
   - ✅ Mantém SELECT apenas para usuários autenticados
   - ✅ Mantém políticas de admin

2. **`guata_user_memory`**
   - ✅ Permite INSERT anônimo (com `session_id`)
   - ✅ Usado para salvar interações e preferências
   - ✅ Bloqueia SELECT/UPDATE/DELETE para anônimos

## Teste após executar

1. Acesse `/chatguata` sem estar logado
2. Faça uma pergunta
3. Dê feedback (👍 ou 👎)
4. Verifique no console se não há mais erros 401
5. Verifique no Supabase se os dados foram salvos

## Benefícios

- ✅ Guatá aprende com TODOS os usuários (não só autenticados)
- ✅ Feedback de usuários anônimos é coletado
- ✅ Interações são salvas para Machine Learning
- ✅ Preferências são detectadas mesmo sem login
- ✅ Sistema melhora continuamente

## Notas importantes

- Os dados são salvos com `session_id` para rastreamento
- `user_id` será NULL para usuários anônimos
- Dados antigos podem ser limpos periodicamente (opcional)
- Rate limiting pode ser adicionado no futuro se necessário

