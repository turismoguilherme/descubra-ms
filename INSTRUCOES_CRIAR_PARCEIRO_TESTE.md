# Instruções para Criar Parceiro de Teste

Este guia explica como criar um usuário de teste para a área de parceiros.

## Credenciais de Teste

- **Email:** `parceiro.teste@descubrams.com.br`
- **Senha:** `ParceiroTeste2025!`

## Passo 1: Criar Parceiro no Banco de Dados

Execute o script SQL `CRIAR_PARCEIRO_TESTE.sql` no Supabase SQL Editor:

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `CRIAR_PARCEIRO_TESTE.sql`
4. Execute o script

Isso criará o registro do parceiro na tabela `institutional_partners`.

## Passo 2: Criar Usuário de Autenticação

Você tem 3 opções:

### Opção A: Via Painel do Supabase (Mais Fácil)

1. Acesse o painel do Supabase
2. Vá em **Authentication** > **Users**
3. Clique em **Add user** > **Create new user**
4. Preencha:
   - **Email:** `parceiro.teste@descubrams.com.br`
   - **Password:** `ParceiroTeste2025!`
   - Marque **Auto Confirm User** (para pular confirmação de email)
5. Clique em **Create user**

### Opção B: Via Console do Navegador

1. Abra o console do navegador (F12) na aplicação
2. Execute o seguinte código:

```javascript
// Importar cliente Supabase
const { supabase } = await import('./src/integrations/supabase/client');

// Criar usuário
const { data, error } = await supabase.auth.signUp({
  email: 'parceiro.teste@descubrams.com.br',
  password: 'ParceiroTeste2025!',
  options: {
    emailRedirectTo: `${window.location.origin}/partner/dashboard`,
    data: {
      full_name: 'Parceiro de Teste',
      user_type: 'partner'
    }
  }
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Usuário criado!', data);
}
```

### Opção C: Via Formulário de Cadastro

1. Acesse a página de cadastro de parceiros: `/descubramatogrossodosul/seja-um-parceiro`
2. Preencha o formulário com:
   - **Email:** `parceiro.teste@descubrams.com.br`
   - **Senha:** `ParceiroTeste2025!`
   - Outros dados necessários
3. Marque a opção de criar senha
4. Envie o formulário

## Passo 3: Verificar Login

1. Acesse a página de login de parceiros: `/partner/login` ou `/descubramatogrossodosul/partner/login`
2. Faça login com:
   - **Email:** `parceiro.teste@descubrams.com.br`
   - **Senha:** `ParceiroTeste2025!`
3. Você deve ser redirecionado para `/partner/dashboard`

## Troubleshooting

### Erro: "Este email não está cadastrado como parceiro"

- Verifique se o script SQL foi executado corretamente
- Verifique se o email na tabela `institutional_partners` corresponde ao email do usuário

### Erro: "Email ou senha incorretos"

- Verifique se o usuário foi criado no Supabase Auth
- Verifique se o email está correto (case-sensitive)
- Tente resetar a senha no painel do Supabase

### Usuário criado mas não consegue fazer login

- Verifique se o email foi confirmado (no painel do Supabase, marque "Auto Confirm User")
- Verifique se o parceiro está ativo (`is_active = true`) na tabela `institutional_partners`

## Verificação no Banco de Dados

Execute esta query para verificar se tudo está correto:

```sql
SELECT 
  ip.id,
  ip.name,
  ip.contact_email,
  ip.is_active,
  au.email as auth_email,
  au.email_confirmed_at
FROM institutional_partners ip
LEFT JOIN auth.users au ON au.email = ip.contact_email
WHERE ip.contact_email = 'parceiro.teste@descubrams.com.br';
```

Você deve ver:
- Um registro na tabela `institutional_partners`
- Um registro correspondente na tabela `auth.users`
- `is_active = true`
- `email_confirmed_at` não nulo (ou confirmado manualmente)
