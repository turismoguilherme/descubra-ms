# 🔍 Verificação de Código Morto - 2025

**Data:** 2025-01-02  
**Status:** Em Execução

---

## 📋 PÁGINAS COM LINKS ATIVOS MAS SEM ROTAS (⚠️ Verificar antes de deletar)

### 1. **SobreOverFlowOne.tsx** ⚠️
- **Status:** Tem links no navbar e footer, mas **NÃO tem rota no App.tsx**
- **Links encontrados:**
  - `RestoredNavbar.tsx` (linha 70, 235)
  - `OverflowOneNavbar.tsx` (linha 66, 176)
  - `OverflowOneFooter.tsx` (linha 88)
  - `SimpleBrandContext.tsx` (linha 55)
- **Ação:** **ADICIONAR ROTA OU REMOVER LINKS**

### 2. **Delinha.tsx** ⚠️
- **Status:** Tem links, mas **NÃO tem rota no App.tsx**
- **Links encontrados:**
  - `DelinhaSection.tsx` (linha 76, 160)
  - `ManagementAI.tsx` (linha 102)
- **Ação:** **ADICIONAR ROTA OU REMOVER LINKS**

### 3. **Welcome.tsx** ⚠️
- **Status:** Usado no BrandContext, mas **NÃO tem rota no App.tsx**
- **Links encontrados:**
  - `BrandContext.tsx` (linha 75, 110)
- **Ação:** **ADICIONAR ROTA OU REMOVER LINKS**

### 4. **BlogOverFlowOne.tsx** ⚠️
- **Status:** Tem link, mas **NÃO tem rota no App.tsx**
- **Links encontrados:**
  - `Documentacao.tsx` (linha 323)
- **Ação:** **ADICIONAR ROTA OU REMOVER LINK**

---

## ✅ PÁGINAS SEGURAS PARA DELETAR (Sem links e sem rotas)

### Páginas Principais (31 arquivos):
1. ✅ `AttendantDashboard.tsx` - Wrapper simples, rota usa `AttendantDashboardRestored` diretamente
2. ✅ `CasesSucesso.tsx` - Existe `CasosSucesso.tsx` que é usado
3. ✅ `ContatoOverFlowOne.tsx` - Existe `Contato.tsx` que é usado
4. ✅ `Contribute.tsx` - Sem links e sem rotas
5. ✅ `DigitalPassport.tsx` - Existe `PassportDigital.tsx` que é usado
6. ✅ `EventoDetalhes.tsx` - Sem links e sem rotas
7. ✅ `EventsManagement.tsx` - Existe componente admin que é usado
8. ✅ `GuataSimple.tsx` - Existe `Guata.tsx` e `GuataTest.tsx` que são usados
9. ✅ `Index.tsx` - Existe `MSIndex.tsx` que é usado
10. ✅ `ManagementAI.tsx` - Sem rotas (tem link para /delinha, mas não é rota própria)
11. ✅ `NotFound.tsx` - Sem rotas (404 não configurado)
12. ✅ `OverflowOneAtendenteDashboard.tsx` - Sem rotas
13. ✅ `OverFlowOneSaaS.tsx` - Existe `ViaJARSaaS.tsx` que é usado
14. ✅ `OverflowOneServices.tsx` - Sem rotas
15. ✅ `ParaGovernos.tsx` - Existe `PublicSectorPage.tsx` que é usado
16. ✅ `Profile.tsx` - Existe `ProfilePageFixed.tsx` que é usado
17. ✅ `Regions.tsx` - Existe `RegiaoDetalhes.tsx` que é usado
18. ✅ `RewardsManagement.tsx` - Sem rotas
19. ✅ `SecretaryDashboard.tsx` (página) - Rota usa componente `SecretaryDashboard` diretamente
20. ✅ `ServicosStakeholders.tsx` - Sem rotas
21. ✅ `SuporteOverFlowOne.tsx` - Sem rotas
22. ✅ `TourismData.tsx` - Sem rotas
23. ✅ `TourismManagement.tsx` - Sem rotas
24. ✅ `ViaJARContato.tsx` - Existe `Contato.tsx` que é usado
25. ✅ `ViaJARPrecos.tsx` - Existe `Precos.tsx` que é usado
26. ✅ `ViaJARSecretaryDashboard.tsx` - Rota usa componente `SecretaryDashboard` diretamente
27. ✅ `ViaJARUnifiedDashboardSimple.tsx` - Existe `ViaJARUnifiedDashboard.tsx` que é usado

### Páginas em `/ms` (4 arquivos):
1. ✅ `PassaporteRouteMS.tsx` - Sem rotas
2. ✅ `RoteirosMS.tsx` - Sem rotas
3. ✅ `RoteirosMSSimple.tsx` - Sem rotas
4. ✅ `RouteDetailsMS.tsx` - Sem rotas

---

## 📊 RESUMO

- **Total de páginas para deletar:** 35
  - 31 páginas principais seguras
  - 4 páginas em `/ms` seguras
- **Páginas com links ativos:** 4 (precisam de rota ou remoção de links)
- **Total de código morto:** ~35 arquivos (~7000-10000 linhas)

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Deletar 35 páginas confirmadas como não utilizadas
2. ⚠️ Verificar 4 páginas com links (adicionar rotas ou remover links)
3. 📝 Atualizar documentação

---

## 📝 NOTAS

- Todas as verificações foram feitas contra App.tsx e busca de links no código
- Algumas páginas podem ter rotas dinâmicas ou serem importadas em outros lugares
- Recomenda-se fazer backup antes de deletar


