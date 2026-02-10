# Plano de Limpeza e Melhorias - Descubra MS

## Data: 2025-01-XX
## Status: Pendente

---

## ✅ O que foi concluído

### 1. Correções de Segurança do Passaporte Digital
- ✅ Validação server-side implementada
- ✅ Rate limiting funcionando (5 tentativas / 15 minutos)
- ✅ Auditoria completa de tentativas
- ✅ Proteção contra brute force

### 2. Aplicação de PeriodFilterTabs
- ✅ `ModernFinancialDashboard.tsx` - Tabs substituído por PeriodFilterTabs
- ✅ `FinancialReports.tsx` - Select substituído por PeriodFilterTabs

### 3. Remoção de Código Morto
- ✅ `EventManagementPanel.tsx` - Removido (370 linhas)

---

## 📋 Pendências Identificadas

### 1. Limpeza de console.log de Debug (Prioridade: Baixa)

**Problema**: Vários `console.log` de debug espalhados pelo código

**Arquivos a revisar**:
- `src/components/passport/CheckpointCheckin.tsx` - Múltiplos console.log
- `src/services/passport/passportService.ts` - Logs de debug
- `src/hooks/usePassport.ts` - Logs de debug
- Outros arquivos com logs excessivos

**Ação**:
1. Identificar todos os `console.log` de debug
2. Remover ou substituir por sistema de logging adequado
3. Manter apenas logs essenciais (erros, warnings importantes)

**Critérios para remoção**:
- `console.log` com mensagens de debug temporário
- `console.log` com informações sensíveis
- `console.log` excessivos que poluem o console

**Critérios para manter**:
- `console.error` para erros críticos
- `console.warn` para avisos importantes
- Logs de sistema essenciais

---

### 2. Restringir CSP em Produção (Prioridade: Média)

**Arquivo**: `src/components/security/SecurityHeaders.tsx`

**Problema Atual**:
```typescript
// Linhas 31-32
'unsafe-eval': true,  // Necessário para VLibras
'unsafe-inline': true, // Necessário para desenvolvimento
```

**Risco**: Médio
- `unsafe-eval`: Permite execução de código dinâmico (XSS risk)
- `unsafe-inline`: Permite scripts inline (XSS risk)

**Solução**:
1. **Desenvolvimento**: Manter como está
2. **Produção**: 
   - Remover `unsafe-eval` se possível
   - Usar nonces para `unsafe-inline` quando necessário
   - Configurar CSP mais restritivo

**Implementação**:
```typescript
// Exemplo de implementação
const isProduction = import.meta.env.PROD;

const cspConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    ...(isProduction ? [] : ["'unsafe-eval'", "'unsafe-inline'"]),
    // Adicionar domínios específicos necessários
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Tailwind
  ],
  // ... outros headers
};
```

**Dependências**:
- VLibras pode precisar de ajustes
- Verificar se há scripts inline que precisam de nonces

---

### 3. TODOs no Código (Prioridade: Baixa)

**TODOs identificados**:
- `AutonomousAIAgent.tsx` linha 1305: `// TODO: Implementar aplicação de melhorias (SEO)`
- `passportService.ts` linha 771: `// TODO: Passar IP real se disponível no contexto`

**Ação**:
1. Revisar cada TODO
2. Decidir: implementar, documentar ou remover
3. Criar issues/tarefas para TODOs importantes

---

### 4. Revisão de Outras Vulnerabilidades (Prioridade: Média)

**Documentos de referência**:
- `ANALISE_VULNERABILIDADES_PASSAPORTE.md` - Pode estar desatualizado
- Outras análises de segurança

**Ação**:
1. Revisar documentação de vulnerabilidades
2. Atualizar status das correções
3. Verificar se há novas vulnerabilidades

---

## 🎯 Plano de Execução

### Fase 1: Limpeza de Logs (Estimativa: 1-2 horas)
1. Buscar todos os `console.log` no código
2. Categorizar: remover, manter, substituir
3. Remover logs de debug
4. Testar para garantir que não quebrou nada

### Fase 2: CSP em Produção (Estimativa: 2-3 horas)
1. Criar configuração condicional (dev/prod)
2. Testar VLibras com CSP restritivo
3. Implementar nonces se necessário
4. Testar em ambiente de staging

### Fase 3: Revisão de TODOs (Estimativa: 1 hora)
1. Listar todos os TODOs
2. Priorizar e criar tarefas
3. Documentar decisões

### Fase 4: Atualização de Documentação (Estimativa: 30 min)
1. Atualizar `ANALISE_VULNERABILIDADES_PASSAPORTE.md`
2. Documentar correções implementadas
3. Atualizar status de pendências

---

## 📊 Priorização

| Item | Prioridade | Esforço | Impacto | Recomendação |
|------|------------|---------|---------|--------------|
| Limpeza console.log | Baixa | Baixo | Baixo | Fazer quando tiver tempo |
| CSP Produção | Média | Médio | Médio | Planejar para próxima sprint |
| Revisão TODOs | Baixa | Baixo | Baixo | Fazer incrementalmente |
| Atualizar Docs | Baixa | Baixo | Médio | Fazer após correções |

---

## 🔍 Ferramentas Úteis

### Buscar console.log
```bash
# Buscar todos os console.log
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx"

# Buscar console.log com contexto
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" -A 2 -B 2
```

### Buscar TODOs
```bash
# Buscar todos os TODOs
grep -r "TODO" src/ --include="*.ts" --include="*.tsx"
```

---

## 📝 Notas

- Todas as correções de segurança críticas do Passaporte foram implementadas
- PeriodFilterTabs está sendo usado consistentemente
- Código morto removido
- Sistema está mais seguro e limpo

---

## ✅ Checklist de Conclusão

- [ ] Limpeza de console.log concluída
- [ ] CSP restrito em produção
- [ ] TODOs revisados e documentados
- [ ] Documentação atualizada
- [ ] Testes realizados
- [ ] Deploy em produção validado

