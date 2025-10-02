# 🐹 Guatá — Arquitetura, Configuração e Operação (Documento Mestre)

ATENÇÃO — NÃO APAGAR ESTE ARQUIVO
- Este é o documento mestre do chatbot Guatá. Em qualquer limpeza de docs, mantenha este arquivo intacto.
- Se precisar renomear ou mover, atualize os links internos e a wiki do projeto.

## 1) O que é o Guatá
Eu construí o Guatá como um guia de turismo inteligente para Mato Grosso do Sul (com foco especial em Campo Grande), com personalidade acolhedora, curiosa e autêntica — sem ser genérico. Ele responde com informações verdadeiras e atualizadas, incentiva a visitação e evolui com feedback dos usuários.

- Identidade: “Guatá, uma capivara simpática, acolhedora e curiosa.”
- Objetivo: Encantar, informar e incentivar experiências turísticas reais.
- Estilo: Tom caloroso, direto e conciso, com toques da cultura local (sem exageros).
- Regra de ouro: “Sem fonte confiável, sem resposta direta.”

## 2) Visão Geral da Arquitetura
```
Frontend (React + TS)
  ├─ src/pages/GuataPublic.tsx
  ├─ src/components/guata/
  │    ├─ GuataHeader.tsx (UI minimalista)
  │    ├─ ChatMessage.tsx (bolhas slim + feedback 👍/👎)
  │    └─ ChatInput.tsx (limpar conversa, enviar)
  └─ src/hooks/useGuataConversation.ts (lógica de conversa, feedback)

Serviços (client)
  └─ src/services/ai/guataSimpleEdgeService.ts (orquestra pergunta → web context → Edge AI)

Supabase (Edge Functions + DB)
  ├─ functions/guata-web-rag (busca web + RAG + ranking + cache + rate limit)
  ├─ functions/guata-ai (LLM Gemini + prompt persona + políticas de veracidade)
  ├─ functions/guata-feedback (persistência de 👍/👎 e correções)
  └─ migrations/*.sql (tabelas, p.ex. guata_feedback)

APIs Externas
  ├─ Google PSE (Custom Search) — busca web
  ├─ Google Places — endereços/horários
  └─ OpenWeather — clima (quando necessário)
```

## 3) Componentes Principais (arquivos)
- Frontend UI
  - `src/components/guata/GuataHeader.tsx`: Header limpo (só “Limpar Conversa”).
  - `src/components/guata/ChatMessage.tsx`: Bolhas slim, avatar só no Guatá, botões de feedback.
  - `src/components/guata/ChatInput.tsx`: Envio, limpar conversa (com `onClearConversation` opcional).
- Lógica de Conversa
  - `src/hooks/useGuataConversation.ts`: Welcome curto, sanitização, chamada ao serviço e envio de feedback.
  - `src/services/ai/guataSimpleEdgeService.ts`: Busca contexto web, invoca `guata-ai`, fallbacks concisos, detecção de tipo de pergunta.
- Backend (Supabase Edge Functions)
  - `supabase/functions/guata-web-rag/index.ts`: RAG com FTS/embeddings, Google PSE, Google Places, ranking, cache, rate limit.
  - `supabase/functions/guata-ai/index.ts`: Chamada ao Gemini, prompt persona, parâmetros de geração, validações e limites.
  - `supabase/functions/guata-ai/prompts.ts`: Regras de persona e concisão; “sem fonte, sem resposta”.
  - `supabase/functions/guata-feedback/index.ts`: Registro de 👍/👎, correções e metadados.
- Banco de Dados
  - `supabase/migrations/20250829000000_create_guata_feedback.sql`: Tabela `guata_feedback` (feedback e telemetria de conversa).

## 4) Fluxo de Requisição (fim a fim)
1. Usuário envia pergunta no `ChatInput` → `useGuataConversation`.
2. `guataSimpleEdgeService` decide sempre buscar contexto web (Freshness primeiro).
3. `guata-web-rag`:
   - Expande a consulta (sinônimos, datas, utilidades como “horário”, “endereço”).
   - Busca: PSE + Places + FTS/embeddings.
   - Normaliza, classifica (peso por domínios oficiais, locais, consenso).
   - Extrai `sources` + `snippet` e monta `context` (ou “NO_CONTEXT”).
4. `guata-ai`:
   - Aplica prompt do Guatá (concisão; persona calorosa; não exibir fontes).
   - Aplica políticas de veracidade e “no source, no answer”.
   - Gera resposta curta, direta e com convite à visitação.
5. Frontend exibe resposta; usuário pode enviar 👍/👎, que vai para `guata-feedback`.

## 5) RAG (Retrieval Augmented Generation)
- Foco em frescor de informação para eventos/horários.
- Multi-query expansion: sinônimos (ex.: "Bioparque Pantanal" → "Aquário do Pantanal"), utilidades (endereço, horário), entidades locais (ex.: “Comunidade Tia Eva”).
- Ranking com pesos por domínio (Prefeitura/SECTUR > plataformas oficiais > jornais locais > blogs).
- Integração Places (endereços, horários) quando a intenção é local/POI.
- “NO_CONTEXT” força políticas de não alucinar.

## 6) Políticas de Veracidade
- Sem fonte confiável → responder pedindo recorte/mais detalhes.
- Datas conflitantes/antigas → pedir confirmação temporal.
- Não exibir links/fontes no chat (apenas no dashboard/telemetria).

## 7) Prompt Engineering (persona + concisão)
Arquivo: `supabase/functions/guata-ai/prompts.ts`
- 2–3 frases para perguntas simples; até 4–5 em casos complexos.
- Tom caloroso e convite à visitação (“vai se encantar”, “vale muito a pena”).
- Sem autopromoção, sem repetição, sem markdown pesado.
- Fechar com 1 pergunta útil (ex.: “Quer saber o horário?”).

## 8) Variáveis de Ambiente (principais)
- Supabase (Frontend)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Supabase (Server/Functions — setar via secrets)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Gemini
  - `GEMINI_API_KEY`
  - `GEMINI_TEMPERATURE` (ex.: 0.2)
  - `GEMINI_MAX_OUTPUT_TOKENS` (ex.: 512–768)
- Google Search / Places
  - `GOOGLE_CSE_ID`
  - `GOOGLE_API_KEY`
- OpenWeather (opcional)
  - `OPENWEATHER_API_KEY`
- Limites e Cache
  - `RATE_LIMIT_PER_MIN` (ex.: 10)
  - `DAILY_BUDGET_CALLS` (ex.: 500)
  - `CACHE_TTL` (ms, ex.: 600000)
  - `EVENT_CACHE_TTL` (ms, ex.: 300000)

## 9) Deploy e Setup Rápido
- Instalar/atualizar CLI: `npm i -g supabase`
- Logar: `supabase login`
- Setar secrets (exemplos):
```bash
supabase secrets set GEMINI_API_KEY=... GOOGLE_CSE_ID=... GOOGLE_API_KEY=... \
SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_URL=... RATE_LIMIT_PER_MIN=10 DAILY_BUDGET_CALLS=500 \
CACHE_TTL=600000 EVENT_CACHE_TTL=300000
```
- Deploy funções:
```bash
supabase functions deploy guata-web-rag
supabase functions deploy guata-ai
supabase functions deploy guata-feedback
```
- Migrar DB (se necessário):
```bash
supabase db push
```

## 10) Tabelas e Migrações
- `guata_feedback`: armazena sessão, pergunta, resposta, 👍/👎, correções, fontes e metadados.
- `document_chunks` (quando usado): base local com FTS/embeddings para conteúdo curado.

## 11) Rate Limiting e Cache
- Rate por minuto e orçamento diário nas Edge Functions.
- Cache por 10 min (geral) e 5 min (eventos) no `guata-web-rag`.

## 12) Custos e Free-tier
- Multi-fonte com cache + rate limit para caber no free-tier.
- Centralização no backend evita expor chaves e reduz desperdício de chamadas.

## 13) UI/UX e Persona
- Header limpo, sem textos longos.
- Bolhas slim com boa legibilidade.
- Avatar apenas no Guatá.
- Sugestões sempre como perguntas curtas e úteis.

## 14) Feedback e Aprendizado Contínuo
- Botões 👍/👎 registram no `guata-feedback` com contexto da conversa.
- Planejado: usar pontuação de feedback para re-ranking e preenchimento de gaps na base.

## 15) Testes Rápidos (cURL)
- `guata-ai`:
```bash
curl -X POST "https://<SUPABASE_PROJECT>.supabase.co/functions/v1/guata-ai" \
  -H "Authorization: Bearer <ANON_OR_SERVICE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"O que é o Bioparque?","knowledgeBase":[],"userContext":"{}","mode":"tourist"}'
```
- `guata-web-rag`:
```bash
curl -X POST "https://<SUPABASE_PROJECT>.supabase.co/functions/v1/guata-web-rag" \
  -H "Authorization: Bearer <ANON_OR_SERVICE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"question":"horário Bioparque Campo Grande","state_code":"MS"}'
```
- `guata-feedback`:
```bash
curl -X POST "https://<SUPABASE_PROJECT>.supabase.co/functions/v1/guata-feedback" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"abc","question":"...","answer":"...","positive":true}'
```

## 16) Troubleshooting (comuns)
- 500 no `guata-ai`: verifique `GEMINI_API_KEY` nos secrets e logs da função.
- Edge usando chave local: front não deve chamar Gemini direto; use sempre a função `guata-ai`.
- `onClearConversation` não é função: garanta prop opcional com default no `ChatInput` (já implementado).
- Respostas longas/repetitivas: prompt atualizado em `prompts.ts` e sanitização no hook.

## 17) Checklist de Lançamento
- [ ] Secrets configurados no projeto Supabase
- [ ] Funções Edge deployadas (`guata-web-rag`, `guata-ai`, `guata-feedback`)
- [ ] Migrações aplicadas (`guata_feedback`)
- [ ] Página pública testada (`/chatguata`)
- [ ] Rate limit e cache validados no uso real
- [ ] Logs de erro revisados

## 18) Manutenção e Próximos Passos
- Atualizar dependências e CLI periodicamente.
- Monitorar custos/chamadas e ajustar TTL/limites.
- Evoluir re-ranking com feedback real.
- Planejado: CI/CD, dashboards de fontes, monitoramento em tempo real e segurança preditiva.

---
Este documento é o guia mestre do Guatá. Eu o mantenho atualizado e uso como base para qualquer evolução do chatbot. NÃO APAGAR em limpezas de documentação.



