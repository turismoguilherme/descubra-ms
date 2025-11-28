# 🎯 PLANO DE MELHORIAS - GUATÁ

## 📋 Requisitos Identificados

1. **Remover asteriscos (markdown)** - Respostas muito formatadas
2. **Remover referência ao site** - descubrams.com.br não existe ainda
3. **Adicionar conhecimento da plataforma** - ViajAR e Descubra Mato Grosso do Sul
4. **Melhorar inteligência contextual** - Responder conforme perguntado
5. **Suportar múltiplos usuários simultâneos** - Sem parar de funcionar
6. **Rate limiting inteligente** - Não ultrapassar limites gratuitos

---

## 🔧 IMPLEMENTAÇÕES PROPOSTAS

### 1. Remover Asteriscos das Respostas

**Problema**: Respostas usam `**texto**` (markdown) que aparece como asteriscos no chat

**Solução**:
- Remover formatação markdown (`**`, `*`, etc.) das respostas do Gemini
- Criar função para limpar markdown antes de retornar resposta
- Manter apenas emojis e quebras de linha

**Arquivos**:
- `src/services/ai/guataGeminiService.ts` - Adicionar função `cleanMarkdown()`
- `src/services/ai/guataIntelligentTourismService.ts` - Remover `**` das formatações

---

### 2. Remover Referência ao Site (com lógica condicional)

**Problema**: Guatá menciona `descubrams.com.br` que não existe ainda

**Solução**:
- Remover todas as referências ao site no código
- Adicionar variável de ambiente `VITE_DESCUBRA_MS_URL` (opcional)
- Se variável existir, mencionar o site; se não, não mencionar
- Remover URLs hardcoded de `guataRealWebSearchService.ts`

**Arquivos**:
- `src/services/ai/guataGeminiService.ts` - Remover do prompt
- `src/services/ai/guataRealWebSearchService.ts` - Remover URLs hardcoded
- `src/services/ai/guataIntelligentTourismService.ts` - Remover referências

---

### 3. Adicionar Conhecimento da Plataforma

**Problema**: Guatá não conhece ViajAR e Descubra Mato Grosso do Sul

**Solução**:
- Adicionar seção no prompt sobre as plataformas
- Informações sobre:
  - **ViajAR**: Plataforma SaaS B2B para gestão turística (Revenue Optimizer, Market Intelligence, IA Conversacional, CATs, etc.)
  - **Descubra Mato Grosso do Sul**: Plataforma B2C para turistas (Guatá IA, Passaporte Digital, Destinos, Eventos, Parceiros, Roteiros)
- Guatá deve saber que faz parte do ecossistema

**Arquivos**:
- `src/services/ai/guataGeminiService.ts` - Adicionar seção no `buildPrompt()`

---

### 4. Melhorar Inteligência Contextual

**Problema**: Respostas genéricas, não entende contexto completo

**Solução**:
- Melhorar prompt para entender contexto completo
- Adicionar exemplos de respostas contextuais
- Instruir para analisar pergunta completa, não apenas palavras-chave
- Melhorar detecção de intenção

**Arquivos**:
- `src/services/ai/guataGeminiService.ts` - Melhorar `buildPrompt()`
- `src/services/ai/guataIntelligentTourismService.ts` - Melhorar detecção de contexto

---

### 5. Rate Limiting para Múltiplos Usuários Simultâneos

**Problema**: Atual rate limit (10/min) pode não suportar muitos usuários

**Solução**:
- Implementar rate limiting por usuário/sessão
- Rate limit global mais conservador (8/min para margem de segurança)
- Rate limit por usuário (2/min por usuário)
- Fila inteligente com priorização
- Cache agressivo para perguntas comuns
- Fallback imediato quando rate limit atingido

**Limites Propostos**:
- **Global**: 8 requisições/minuto (margem de segurança)
- **Por usuário**: 2 requisições/minuto
- **Cache**: 10 minutos (já implementado)
- **Fallback**: Imediato quando rate limit atingido

**Arquivos**:
- `src/services/ai/guataGeminiService.ts` - Melhorar rate limiting
- Adicionar rate limit por usuário/sessão
- Implementar fila com priorização

---

### 6. Sistema de Cache Mais Agressivo

**Solução**:
- Cache compartilhado para perguntas comuns (já existe)
- Cache individual por usuário (já existe)
- Cache por similaridade (já existe)
- Aumentar duração do cache para perguntas muito comuns (15 min)
- Cache de respostas de fallback

**Arquivos**:
- `src/services/ai/guataGeminiService.ts` - Melhorar cache

---

## 📊 ESTRATÉGIA DE RATE LIMITING

### Cenário: 100 usuários simultâneos

**Limite Gratuito Gemini**: ~15 RPM (requests per minute)

**Estratégia**:
1. **Cache primeiro** - 80% das perguntas comuns vêm do cache
2. **Rate limit global**: 8 RPM (margem de segurança)
3. **Rate limit por usuário**: 2 RPM (evita um usuário consumir tudo)
4. **Fallback inteligente**: Quando rate limit, usa fallback imediatamente
5. **Fila transparente**: Usuário não percebe, sempre recebe resposta

**Cálculo**:
- 100 usuários × 2 RPM = 200 RPM potencial
- Mas com cache: ~20 RPM reais (80% cache hit)
- Rate limit global: 8 RPM
- Fallback: Imediato para os outros

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO

1. ✅ Remover asteriscos (rápido)
2. ✅ Remover referência ao site (rápido)
3. ✅ Adicionar conhecimento da plataforma (médio)
4. ✅ Melhorar inteligência contextual (médio)
5. ✅ Rate limiting melhorado (complexo)
6. ✅ Cache mais agressivo (médio)

---

## ⚠️ ANTES DE IMPLEMENTAR

**Preciso da sua aprovação para**:
1. Limites de rate limiting propostos (8 global, 2 por usuário)
2. Estratégia de cache (15 min para perguntas comuns)
3. Informações sobre ViajAR e Descubra MS a incluir no prompt
4. Se quer manter alguma referência ao site (mesmo que condicional)

**Perguntas**:
1. Os limites propostos (8 global, 2 por usuário) estão ok?
2. Quer que eu adicione mais informações sobre ViajAR/Descubra MS no prompt?
3. Prefere remover completamente o site ou deixar condicional?

---

## 📝 PRÓXIMOS PASSOS

1. **Aguardar sua aprovação**
2. **Atualizar repositório remoto** (git push)
3. **Implementar melhorias** na ordem proposta
4. **Testar** com múltiplos usuários simultâneos

