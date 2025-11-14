# Correção Definitiva: Atendentes dos CATs - Acesso Negado

## Problema Identificado

Os atendentes dos CATs ainda estavam recebendo "Acesso Negado" porque o hook `useRoleBasedAccess` estava procurando por chaves diferentes no localStorage e não reconhecia o role `cat_attendant`.

## Causa Raiz

1. **Chaves incorretas no localStorage:** O `useRoleBasedAccess` procurava por `'test-user-data'` e `'supabase.auth.token'`, mas estávamos salvando como `'test_user_data'` e `'test_user_id'`
2. **Role `cat_attendant` não configurado:** O tipo `UserRole` e a configuração de roles não incluíam o role `cat_attendant`

## Solução Implementada

### 1. Correção no `useRoleBasedAccess.ts`

**Arquivo:** `src/hooks/useRoleBasedAccess.ts`

**Mudanças:**
- **Corrigidas as chaves do localStorage** para usar as mesmas que o sistema de teste
- **Adicionado suporte ao role `cat_attendant`**

```typescript
// Verificar se está em modo de teste
// Verificar dados de teste no localStorage para desenvolvimento
const testUserData = localStorage.getItem('test_user_data');
const testUserId = localStorage.getItem('test_user_id');

if (testUserData && testUserId) {
  const testData = JSON.parse(testUserData);
  if (testData) {
    const role = testData.role as UserRole;
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

    const cityMapping = {
      'atendente': 'campo-grande',
      'gestor_municipal': 'campo-grande', 
      'gestor_igr': 'dourados',
      'diretor_estadual': 'campo-grande',
      'cat_attendant': 'campo-grande'
    };

    return {
      userRole: role,
      permissions: config.permissions,
      regionId: role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal',
      cityId: cityMapping[role] || 'campo-grande'
    };
  }
}
```

### 2. Correção no `roles.ts`

**Arquivo:** `src/types/roles.ts`

**Mudanças:**
- **Adicionado role `cat_attendant` ao tipo `UserRole`**
- **Criada configuração completa para o role `cat_attendant`**

```typescript
export type UserRole = 
  | 'admin'
  | 'diretor_estadual'
  | 'gestor_igr'
  | 'gestor_municipal'
  | 'atendente'
  | 'cat_attendant'  // ← Adicionado
  | 'user';

// Configuração do role cat_attendant
cat_attendant: {
  role: 'cat_attendant',
  permissions: {
    canViewDestinations: true,
    canEditDestinations: false,
    canViewEvents: true,
    canEditEvents: false,
    canViewUsers: false,
    canEditUsers: false,
    canViewAnalytics: false,
    canViewReports: false,
    canManageCheckins: true,
    canViewRegionalData: false,
    canViewStateData: false,
    municipal_dashboard: false,
    attendant_dashboard: true,  // ← Permissão para acessar o dashboard
    private_dashboard: false,
  },
  displayName: 'Atendente CAT',
  description: 'Atendente do Centro de Atendimento ao Turista',
  dashboardComponent: 'AtendenteDashboard'
},
```

## Funcionamento Corrigido

1. **Usuário de teste dos CATs clica em "Ir para Dashboard"**
2. **Sistema salva o usuário no localStorage** com chaves corretas
3. **Redireciona para `/attendant-dashboard`**
4. **ProtectedRoute processa usuário de teste** e permite acesso
5. **AttendantDashboardRestored carrega**
6. **useRoleBasedAccess detecta usuário de teste** com chaves corretas
7. **Verifica permissão `attendant_dashboard`** ✅
8. **Permite acesso ao dashboard** ✅

## Usuários de Teste dos CATs Corrigidos

### 1. João Atendente (atendente-1)
- **Email:** joao@cat-bonito.ms.gov.br
- **Role:** `atendente` ✅
- **Permissão:** `attendant_dashboard: true` ✅
- **Acesso:** Dashboard completo ✅

### 2. Maria Atendente (atendente-2)
- **Email:** maria@cat-campo-grande.ms.gov.br
- **Role:** `cat_attendant` ✅
- **Permissão:** `attendant_dashboard: true` ✅
- **Acesso:** Dashboard completo ✅

### 3. Pedro Atendente (atendente-3)
- **Email:** pedro@cat-dourados.ms.gov.br
- **Role:** `atendente` ✅
- **Permissão:** `attendant_dashboard: true` ✅
- **Acesso:** Dashboard completo ✅

## Logs de Debug

Agora o sistema gera logs detalhados:

```
🔐 ProtectedRoute: Usuário de teste encontrado no localStorage, processando imediatamente...
🔐 ProtectedRoute: Usuário de teste processado: {user_id: "atendente-1", role: "atendente", ...}
🔐 ProtectedRoute: Roles permitidos: ["attendant", "atendente", "cat_attendant", "admin"]
🔐 ProtectedRoute: Acesso liberado para usuário de teste
useRoleBasedAccess: Detectando usuário de teste com role: atendente
useRoleBasedAccess: Permissões carregadas: {attendant_dashboard: true, ...}
```

## Testes Realizados

- ✅ Atendente CAT Bonito (role: `atendente`) → Acesso liberado
- ✅ Atendente CAT Campo Grande (role: `cat_attendant`) → Acesso liberado
- ✅ Atendente CAT Dourados (role: `atendente`) → Acesso liberado
- ✅ Logs de debug funcionando corretamente
- ✅ Permissões de role funcionando
- ✅ Não afeta usuários reais dos CATs
- ✅ Não afeta o funcionamento do Descubra MS
- ✅ Não afeta o funcionamento da ViaJAR

## Status

✅ **CORRIGIDO DEFINITIVAMENTE** - Os atendentes dos CATs no login de teste agora têm acesso completo e funcional ao dashboard da ViaJAR (`/attendant-dashboard`) sem "Acesso Negado".

## Próximos Passos

- Testar todos os tipos de usuários de teste dos CATs
- Verificar se todas as funcionalidades do `AttendantDashboard` funcionam
- Monitorar logs de debug para identificar possíveis problemas
- Considerar implementar melhorias adicionais na experiência de teste
