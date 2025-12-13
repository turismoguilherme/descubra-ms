# 📋 PLANO: Integração de Políticas com Frontend

## 🎯 OBJETIVO

Fazer com que o conteúdo editado no `PoliciesEditor` apareça nas páginas públicas do site.

## 🔧 SOLUÇÃO

### 1. **Criar serviço para buscar políticas** ✅
- `src/services/public/policyService.ts`
- Função `getPublishedPolicy()` que busca do banco
- Suporte a markdown → HTML

### 2. **Modificar páginas públicas para usar o serviço**

**Páginas a modificar:**
- `src/pages/ms/TermosUsoMS.tsx` - Termos do Descubra MS
- `src/pages/viajar/TermosUso.tsx` - Termos do ViajARTur
- Criar página de Privacidade (se não existir)

**Como funciona:**
1. Página tenta buscar do banco usando `policyService.getPublishedPolicy()`
2. Se encontrar conteúdo publicado → usa do banco
3. Se não encontrar → usa conteúdo hardcoded como fallback
4. Mantém toda a estrutura visual (layout, botões, etc)

### 3. **Mapeamento de políticas**

| Chave no Banco | Página | Plataforma |
|----------------|--------|------------|
| `terms_of_use` | `/descubramatogrossodosul/termos` | Descubra MS |
| `terms_of_use` | `/termos` (ViajARTur) | ViajARTur |
| `privacy_policy` | `/descubramatogrossodosul/privacidade` | Descubra MS |
| `privacy_policy` | `/privacidade` (ViajARTur) | ViajARTur |
| `cookie_policy` | (se houver página) | Ambas |
| `partner_terms` | (se houver página) | Descubra MS |
| `event_terms` | (se houver página) | Descubra MS |
| `refund_policy` | (se houver página) | ViajARTur |
| `subscription_terms` | (se houver página) | ViajARTur |

## 📝 IMPLEMENTAÇÃO

### Passo 1: Criar serviço ✅
- [x] `policyService.ts` criado

### Passo 2: Modificar TermosUsoMS.tsx
- [ ] Adicionar `useState` para conteúdo dinâmico
- [ ] Adicionar `useEffect` para buscar do banco
- [ ] Renderizar conteúdo do banco ou fallback hardcoded

### Passo 3: Modificar TermosUso.tsx
- [ ] Mesmo processo

### Passo 4: Criar página de Privacidade (se necessário)
- [ ] Verificar se existe
- [ ] Criar se não existir

## ✅ VANTAGENS

1. **Flexibilidade:** Você edita no admin e aparece no site
2. **Fallback:** Se não houver conteúdo no banco, usa o hardcoded
3. **Sem quebrar:** Mantém toda a estrutura visual
4. **Incremental:** Pode migrar página por página

## 🚀 PRÓXIMOS PASSOS

Aguardando confirmação para implementar! 🎯

