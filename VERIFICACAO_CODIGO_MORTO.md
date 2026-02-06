# Verificação de Código Morto - Fase 3

## Status: Em Verificação

Este documento lista as páginas e componentes identificados como potencialmente não utilizados, com verificação de uso.

---

## 📋 PÁGINAS NÃO UTILIZADAS (Confirmadas)

### ✅ Confirmadas para Deletar (Não estão em App.tsx nem em rotas)

1. **OverFlowOneMasterDashboard.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Observação: Existe ViaJARMasterDashboard que é usado
   - Ação: **DELETAR**

2. **OverflowOneDashboard.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Observação: Existe ViaJARUnifiedDashboard que é usado
   - Ação: **DELETAR**

3. **OverflowOneEstadualDashboard.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Ação: **DELETAR**

4. **OverflowOneMunicipalDashboard.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Observação: É apenas um wrapper de MunicipalDashboard
   - Ação: **DELETAR**

5. **MunicipalAdmin.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Ação: **DELETAR**

6. **TechnicalAdmin.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Ação: **DELETAR**

7. **RecursosAnalytics.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Ação: **DELETAR**

8. **RecursosMultiTenant.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Ação: **DELETAR**

9. **RecursosWhiteLabel.tsx** ❌
   - Status: Não encontrado em App.tsx
   - Ação: **DELETAR**

10. **Resultados.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Ação: **DELETAR**

11. **GuataReliabilityDashboard.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Ação: **DELETAR**

12. **Personalizar.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Ação: **DELETAR**

13. **EnhancedDigitalPassport.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Observação: Existe PassportDigital.tsx que é usado
    - Ação: **DELETAR**

14. **EnhancedDigitalPassportPage.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Observação: Existe PassportDigital.tsx que é usado
    - Ação: **DELETAR**

15. **PassaporteSimple.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Observação: Existe PassportDigital.tsx que é usado
    - Ação: **DELETAR**

16. **CommercialDashboard.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Ação: **DELETAR**

17. **CommercialPartnersPortal.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Ação: **DELETAR**

18. **Colaborador.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Ação: **DELETAR**

19. **Mapa.tsx** ❌
    - Status: Não encontrado em App.tsx
    - Observação: Existe MapaTuristico.tsx que é usado
    - Ação: **DELETAR**

20. **DestinoDetalhes.tsx** ❌
    - Status: Não encontrado em App.tsx nem em nenhum import
    - Observação: Usa `useParams` para pegar `id`, mas não há rota `/destinos/:id` no App.tsx
    - Observação: Existe RegiaoDetalhes.tsx que é usado para regiões
    - Ação: **DELETAR**

---

## ⚠️ PÁGINAS COM LINKS ATIVOS (Verificar antes de deletar)

1. **Documentacao.tsx** ⚠️
   - Status: **TEM LINK ATIVO** no `UniversalFooter.tsx` (linha 104)
   - Link: `/documentacao`
   - Observação: A rota não está em App.tsx, mas o link existe no footer
   - Ação: **ADICIONAR ROTA NO App.tsx OU REMOVER LINK DO FOOTER ANTES DE DELETAR**

---

## 📊 Resumo

- **Total de páginas para deletar**: 20
- **Páginas com links ativos**: 1 (Documentacao.tsx - precisa adicionar rota ou remover link)
- **Páginas para verificar**: 0

---

## 🔍 Próximos Passos

1. ✅ Verificar links para Documentacao.tsx no footer
2. ✅ Verificar uso de DestinoDetalhes.tsx
3. ⏳ Deletar páginas confirmadas (após verificação de links)

---

## 📝 Notas

- Todas as verificações foram feitas contra App.tsx
- Algumas páginas podem ter rotas dinâmicas ou serem importadas em outros lugares
- Recomenda-se fazer backup antes de deletar

