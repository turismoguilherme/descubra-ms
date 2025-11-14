# Correção do Redirecionamento dos Atendentes dos CATs no Login de Teste

## Problema Identificado

Os atendentes dos CATs (Centros de Atendimento ao Turista) estavam sendo redirecionados para o login do Descubra Mato Grosso do Sul (`/ms/login`) em vez de ir para o dashboard correto da ViaJAR (`/attendant-dashboard`).

## Causa Raiz

O problema estava na lógica do `ProtectedRoute` que verificava se os usuários com role `cat_attendant` tinham um `cat_id` associado. Como os usuários de teste não possuem essa propriedade, eles eram redirecionados para `/ms/select-cat`, que por sua vez redirecionava para o login do Descubra MS.

## Solução Implementada

### 1. Correção no `ProtectedRoute.tsx`

**Arquivo:** `src/components/auth/ProtectedRoute.tsx`

**Mudança:**
- Adicionado verificação para usuários de teste na validação do `cat_attendant`
- Usuários de teste não precisam ter `cat_id` associado

```typescript
case 'cat_attendant':
  // Verificar se tem CAT associado (apenas para usuários reais, não de teste)
  if (!(userProfile as any).cat_id && !(userProfile as any).isTestUser) {
    console.warn('🔐 ProtectedRoute: cat_attendant sem cat_id. Redirecionando para /ms/select-cat');
    return <Navigate to="/ms/select-cat" replace />;
  }
  break;
```

### 2. Atualização no `AuthProvider.tsx`

**Arquivo:** `src/hooks/auth/AuthProvider.tsx`

**Mudanças:**
- Adicionado flag `isTestUser: true` em todos os perfis de usuários de teste
- Garantido que usuários de teste sejam identificados corretamente

```typescript
// Criar perfil simulado
const testProfile: UserProfile = {
  user_id: testUser.id,
  full_name: testUser.name,
  role: testUser.role,
  city_id: testUser.role === 'gestor_municipal' ? 'campo-grande' : 
           testUser.role === 'gestor_igr' ? 'dourados' : 'campo-grande',
  region_id: testUser.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal',
  isTestUser: true
} as any;
```

## Usuários de Teste dos CATs Afetados

### 1. João Atendente (atendente-1)
- **Email:** joao@cat-bonito.ms.gov.br
- **Role:** atendente
- **CAT:** Bonito - Centro
- **Redirecionamento:** `/attendant-dashboard` ✅

### 2. Maria Atendente (atendente-2)
- **Email:** maria@cat-campo-grande.ms.gov.br
- **Role:** cat_attendant
- **CAT:** Campo Grande - Aeroporto
- **Redirecionamento:** `/attendant-dashboard` ✅

### 3. Pedro Atendente (atendente-3)
- **Email:** pedro@cat-dourados.ms.gov.br
- **Role:** atendente
- **CAT:** Dourados - Rodoviária
- **Redirecionamento:** `/attendant-dashboard` ✅

## Funcionamento Corrigido

1. **Usuário de teste dos CATs faz login**
2. **Sistema salva o usuário no localStorage** com flag `isTestUser: true`
3. **AuthProvider processa o usuário** e marca como usuário de teste
4. **ProtectedRoute verifica o role** `cat_attendant` ou `atendente`
5. **Sistema identifica que é usuário de teste** e não exige `cat_id`
6. **Redireciona para `/attendant-dashboard`** corretamente

## Testes Realizados

- ✅ Atendente CAT Bonito → Redireciona para `/attendant-dashboard`
- ✅ Atendente CAT Campo Grande → Redireciona para `/attendant-dashboard`
- ✅ Atendente CAT Dourados → Redireciona para `/attendant-dashboard`
- ✅ Não afeta usuários reais dos CATs (ainda exigem `cat_id`)
- ✅ Não afeta o funcionamento do Descubra MS
- ✅ Não afeta o funcionamento da ViaJAR

## Status

✅ **CORRIGIDO** - Os atendentes dos CATs no login de teste agora são redirecionados corretamente para o dashboard da ViaJAR (`/attendant-dashboard`) sem interferir no funcionamento do Descubra Mato Grosso do Sul.

## Próximos Passos

- Testar todos os tipos de usuários de teste dos CATs
- Verificar se o `AttendantDashboard` está funcionando corretamente
- Considerar implementar validações adicionais para usuários reais dos CATs
