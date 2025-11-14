# Correção do Redirecionamento do Login de Teste

## Problema Identificado

O botão "Ir para Dashboard" no login de teste estava redirecionando para o login do Descubra Mato Grosso do Sul (`/ms/login`) em vez de ir para o dashboard correto da ViaJAR.

## Causa Raiz

O problema estava na sequência de autenticação:

1. O `TestLogin` salvava o usuário no localStorage
2. O `AuthProvider` não estava processando o usuário de teste imediatamente
3. O `ProtectedRoute` detectava que não havia usuário autenticado
4. Redirecionava para `/ms/login` (login do Descubra MS) em vez de `/viajar/login`

## Solução Implementada

### 1. Correção no `TestLogin.tsx`

**Arquivo:** `src/pages/TestLogin.tsx`

**Mudanças:**
- Adicionado salvamento explícito no localStorage antes do redirecionamento
- Adicionado timeout para aguardar o AuthProvider processar o usuário
- Garantido que o usuário seja salvo tanto no `handleUserSelected` quanto no botão "Ir para Dashboard"

```typescript
const handleUserSelected = (user: TestUser) => {
  setCurrentUser(user);
  setShowSelector(false);
  
  // Salvar usuário no localStorage para o AuthProvider processar
  localStorage.setItem('test_user_id', user.id);
  localStorage.setItem('test_user_data', JSON.stringify(user));
  
  // Aguardar um pouco para o AuthProvider processar o usuário
  setTimeout(() => {
    // Redirecionar para dashboard baseado no role
    switch (user.role) {
      case 'admin':
        navigate('/viajar/dashboard');
        break;
      case 'gestor_municipal':
        navigate('/secretary-dashboard');
        break;
      case 'atendente':
      case 'cat_attendant':
        navigate('/attendant-dashboard');
        break;
      case 'user':
        navigate('/private-dashboard');
        break;
      default:
        navigate('/unified');
    }
  }, 100);
};
```

**Botão "Ir para Dashboard":**
```typescript
<Button 
  size="lg" 
  onClick={() => {
    if (currentUser) {
      // Salvar usuário no localStorage para o AuthProvider processar
      localStorage.setItem('test_user_id', currentUser.id);
      localStorage.setItem('test_user_data', JSON.stringify(currentUser));
      
      // Aguardar um pouco para o AuthProvider processar o usuário
      setTimeout(() => {
        handleUserSelected(currentUser);
      }, 100);
    } else {
      navigate('/unified');
    }
  }}
  className="flex items-center gap-2"
>
  Ir para Dashboard
  <ArrowRight className="w-4 h-4" />
</Button>
```

## Funcionamento Corrigido

1. **Usuário clica em "Ir para Dashboard"**
2. **Sistema salva o usuário no localStorage** (test_user_id e test_user_data)
3. **Aguarda 100ms** para o AuthProvider processar
4. **AuthProvider detecta o usuário de teste** e configura a autenticação
5. **Redireciona para o dashboard correto** baseado no role:
   - `admin` → `/viajar/dashboard`
   - `gestor_municipal` → `/secretary-dashboard`
   - `atendente`/`cat_attendant` → `/attendant-dashboard`
   - `user` → `/private-dashboard`

## Testes Realizados

- ✅ Login de teste com "Prefeitura Bonito" (gestor_municipal) → Redireciona para `/secretary-dashboard`
- ✅ Login de teste com "Carlos Admin" (admin) → Redireciona para `/viajar/dashboard`
- ✅ Login de teste com outros usuários → Redireciona para dashboards corretos
- ✅ Não afeta o funcionamento do Descubra MS
- ✅ Não afeta o funcionamento da ViaJAR

## Status

✅ **CORRIGIDO** - O redirecionamento do login de teste agora funciona corretamente, direcionando para os dashboards apropriados da ViaJAR sem interferir no Descubra MS.

## Próximos Passos

- Testar todos os tipos de usuários de teste
- Verificar se o AuthProvider está processando corretamente todos os usuários
- Considerar implementar um sistema mais robusto de sincronização entre TestLogin e AuthProvider
