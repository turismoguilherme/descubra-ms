# Correções Aplicadas

## Bug 1 e 2: useEffect sem dependências corretas
**Arquivo:** `src/components/admin/settings/PoliciesEditor.tsx`

**Problema:** O `useEffect` que sincroniza a política ativa quando muda de plataforma não incluía `activePolicy` e `getPoliciesForPlatform` no array de dependências.

**Correção aplicada:**
- Adicionado `useCallback` import
- Criada função `getPoliciesForPlatform` com `useCallback` antes do `useEffect`
- Adicionado `activePolicy` e `getPoliciesForPlatform` ao array de dependências do `useEffect`

## Bug 3: Permissões 'content' não existem
**Arquivo:** `src/components/admin/layout/ModernAdminLayout.tsx`

**Problema:** Três itens de menu (Destinations, CATs, Footer) usavam `permission: 'content'`, mas essa permissão não existe mais no `ROLE_PERMISSIONS`.

**Correção aplicada:**
- Alterado `permission: 'content'` para `permission: 'destinations'` nos três itens de menu


