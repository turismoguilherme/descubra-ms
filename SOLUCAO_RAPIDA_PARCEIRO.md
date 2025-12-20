# Solução Rápida - Criar Parceiro de Teste

## ✅ O que já foi feito:
- ✅ Parceiro criado na tabela `institutional_partners` (via SQL)

## 🔧 O que falta fazer:
- ❌ Criar usuário de autenticação no Supabase Auth

---

## Método 1: Via Painel do Supabase (MAIS FÁCIL - RECOMENDADO)

### Passo 1: Criar Usuário de Autenticação

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** (menu lateral esquerdo)
4. Clique em **Users**
5. Clique no botão **Add user** (canto superior direito)
6. Selecione **Create new user**
7. Preencha:
   - **Email:** `parceiro.teste@descubrams.com.br`
   - **Password:** `ParceiroTeste2025!`
   - ✅ **Marque a opção "Auto Confirm User"** (IMPORTANTE!)
8. Clique em **Create user**

### Passo 2: Verificar se está tudo correto

Execute esta query no SQL Editor do Supabase para verificar:

```sql
SELECT 
  ip.id as partner_id,
  ip.name,
  ip.contact_email,
  ip.is_active,
  au.id as user_id,
  au.email as auth_email,
  au.email_confirmed_at
FROM institutional_partners ip
LEFT JOIN auth.users au ON au.email = ip.contact_email
WHERE ip.contact_email = 'parceiro.teste@descubrams.com.br';
```

Você deve ver:
- ✅ Um registro na tabela `institutional_partners`
- ✅ Um registro correspondente na tabela `auth.users`
- ✅ `is_active = true`
- ✅ `email_confirmed_at` não nulo

### Passo 3: Testar Login

1. Acesse: `/partner/login` ou `/descubramatogrossodosul/partner/login`
2. Faça login com:
   - **Email:** `parceiro.teste@descubrams.com.br`
   - **Senha:** `ParceiroTeste2025!`
3. Você deve ser redirecionado para `/partner/dashboard`

---

## Método 2: Via Console do Navegador (Alternativa)

**IMPORTANTE:** Este script é JavaScript e deve ser executado no **Console do Navegador**, NÃO no SQL Editor!

### Passos:

1. Abra a aplicação no navegador (ex: http://localhost:5173)
2. Abra o Console do navegador:
   - Pressione **F12** ou
   - Clique com botão direito > **Inspecionar** > Aba **Console**
3. Cole e execute o código abaixo:

```javascript
(async function criarUsuarioParceiroTeste() {
  console.log('🚀 Criando usuário de parceiro de teste...\n');
  
  const { supabase } = await import('./src/integrations/supabase/client');
  const PARTNER_EMAIL = 'parceiro.teste@descubrams.com.br';
  const PARTNER_PASSWORD = 'ParceiroTeste2025!';
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: PARTNER_EMAIL,
      password: PARTNER_PASSWORD,
      options: {
        emailRedirectTo: `${window.location.origin}/partner/dashboard`,
        data: { full_name: 'Parceiro de Teste', user_type: 'partner' }
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuário já existe. Verificando login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: PARTNER_EMAIL,
          password: PARTNER_PASSWORD
        });
        if (signInError) {
          console.error('❌ Erro:', signInError.message);
          console.log('💡 Reset a senha no painel do Supabase');
        } else {
          console.log('✅ Login OK! User ID:', signInData.user.id);
          if (!signInData.user.email_confirmed_at) {
            console.log('⚠️  Confirme o email no painel do Supabase (Auto Confirm User)');
          }
        }
      } else {
        console.error('❌ Erro:', authError.message);
      }
    } else if (authData.user) {
      console.log('✅ Usuário criado! ID:', authData.user.id);
      if (!authData.session) {
        console.log('⚠️  Confirme o email no painel do Supabase');
      }
    }
    
    const { data: partner } = await supabase
      .from('institutional_partners')
      .select('id, name, is_active')
      .eq('contact_email', PARTNER_EMAIL)
      .maybeSingle();
    
    if (partner) {
      console.log('✅ Parceiro encontrado:', partner.name, partner.is_active ? '(Ativo)' : '(Inativo)');
    } else {
      console.log('⚠️  Parceiro não encontrado na tabela');
    }
    
    console.log('\n📋 Credenciais:');
    console.log('   Email:', PARTNER_EMAIL);
    console.log('   Senha:', PARTNER_PASSWORD);
    console.log('\n🔗 Login:', window.location.origin + '/partner/login');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
```

---

## 🔍 Troubleshooting

### Erro: "Email ou senha incorretos"
- ✅ Verifique se o usuário foi criado no Supabase Auth
- ✅ Verifique se o email está correto (case-sensitive)
- ✅ Verifique se marcou "Auto Confirm User" ao criar

### Erro: "Este email não está cadastrado como parceiro"
- ✅ Verifique se o script SQL foi executado
- ✅ Verifique se o email na tabela `institutional_partners` corresponde exatamente ao email do usuário
- ✅ Execute a query de verificação acima

### Usuário criado mas não consegue fazer login
- ✅ Verifique se o email foi confirmado (marque "Auto Confirm User" no painel)
- ✅ Verifique se o parceiro está ativo (`is_active = true`)
- ✅ Limpe o cache do navegador e tente novamente

---

## 📋 Resumo das Credenciais

- **Email:** `parceiro.teste@descubrams.com.br`
- **Senha:** `ParceiroTeste2025!`
- **URL de Login:** `/partner/login` ou `/descubramatogrossodosul/partner/login`
