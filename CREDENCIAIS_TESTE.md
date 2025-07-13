# Credenciais de Teste - Descubra MS

## Instruções para Login de Teste

**IMPORTANTE**: Os erros de login "Invalid credentials" ocorrem porque os usuários de teste devem ser criados manualmente no Supabase Auth.

### Como Criar Usuários de Teste:

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/hvtrpkbjgbuypkskqcqm/auth/users
2. Clique em "Add user" 
3. Crie os seguintes usuários:

#### Usuário Admin
- **Email**: `admin@teste.ms.gov.br`
- **Password**: `AdminTeste123!`
- **Confirm password**: desabilitado (para testes)

#### Usuário Gestor
- **Email**: `gestor@teste.ms.gov.br`
- **Password**: `GestorTeste123!`
- **Confirm password**: desabilitado (para testes)

#### Usuário Comum
- **Email**: `usuario@teste.ms.gov.br`
- **Password**: `UsuarioTeste123!`
- **Confirm password**: desabilitado (para testes)

### Após criar os usuários:

Os perfis e roles já foram configurados no banco de dados com os seguintes UUIDs:
- Admin: `11111111-1111-1111-1111-111111111111`
- Gestor: `22222222-2222-2222-2222-222222222222`
- Usuário: `33333333-3333-3333-3333-333333333333`

### Configuração no Supabase Auth:

1. Vá em Authentication > Settings
2. Desabilite "Enable email confirmations" para facilitar os testes
3. Configure Site URL: `https://preview--descubra-ms.lovable.app/`
4. Configure Redirect URLs: `https://preview--descubra-ms.lovable.app/**`

### Resolução dos Problemas de Login:

Os erros "400: Invalid login credentials" ocorrem porque:
- Os usuários não existem no Supabase Auth
- As credenciais não foram criadas no painel administrativo
- É necessário criar manualmente cada usuário no console do Supabase

**Após seguir essas instruções, o login funcionará corretamente.**