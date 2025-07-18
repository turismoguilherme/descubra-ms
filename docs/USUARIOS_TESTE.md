# Usuários de Teste - Sistema Descubra MS

Para testar o sistema, você deve criar os usuários manualmente no Supabase Auth e depois executar uma função para criar os perfis correspondentes.

## Credenciais de Teste

### Administrador
- **Email:** admin-teste@ms.gov.br
- **Senha:** AdminTeste2024!
- **Papel:** admin

### Diretor Estadual
- **Email:** diretor-teste@ms.gov.br
- **Senha:** DiretorTeste2024!
- **Papel:** diretor_estadual

### Gestor IGR
- **Email:** gestor-igr-teste@ms.gov.br
- **Senha:** GestorIgrTeste2024!
- **Papel:** gestor_igr

### Gestor Municipal
- **Email:** gestor-municipal-teste@ms.gov.br
- **Senha:** GestorMunicipalTeste2024!
- **Papel:** gestor_municipal

### Atendente
- **Email:** atendente-teste@ms.gov.br
- **Senha:** AtendenteTeste2024!
- **Papel:** atendente

### Usuário Comum
- **Email:** usuario-teste@ms.gov.br
- **Senha:** UsuarioTeste2024!
- **Papel:** user

## Como Criar os Usuários

### Passo 1: Criar Usuários no Supabase Auth
1. Acesse o painel do Supabase
2. Vá em Authentication > Users
3. Clique em "Add user" para cada email acima
4. Use as senhas fornecidas
5. Marque "Auto Confirm User" para pular a confirmação de email

### Passo 2: Criar Perfis e Papéis
Após criar todos os usuários no Auth, execute esta função SQL no Supabase:

```sql
SELECT * FROM public.create_test_user_profiles();
```

Esta função criará automaticamente:
- Perfis de usuário na tabela `user_profiles`
- Papéis na tabela `user_roles` (exceto para usuários comuns)
- Logs de auditoria

## Notas Importantes

- **IMPORTANTE:** Os usuários devem ser criados primeiro no Supabase Auth antes de executar a função
- Todos os usuários têm senhas que atendem aos critérios de segurança
- O sistema está configurado para confirmação automática de email em desenvolvimento
- Para testar diferentes funcionalidades, use os diferentes tipos de usuário
- Os UUIDs dos usuários serão gerados automaticamente pela função

## Solução de Problemas

Se houver problemas com login:
1. Verifique se o usuário foi criado no Supabase Auth
2. Verifique se a função `create_test_user_profiles()` foi executada
3. Confirme que o Site URL e Redirect URLs estão configurados corretamente no Supabase
4. Use as credenciais exatas fornecidas acima