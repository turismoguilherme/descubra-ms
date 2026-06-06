## Objetivo

Aplicar três ajustes no Guatá (todas as rotas: `/guata`, `/chatguata`, `/descubrams/chatguata`):

1. Remover botão "Ver mais/Ver menos" das mensagens.
2. Encurtar as respostas do Guatá (~4-6 frases, máx ~800 caracteres).
3. Transformar as sugestões de pergunta em **carrossel horizontal de chips** em mobile/tablet/totem, mantendo a coluna lateral em desktop.

## O que será alterado

### 1. Remover "Ver mais" — `src/components/guata/ChatMessage.tsx`
- Remover lógica de truncamento (`expanded`, `MAX_PREVIEW_CHARS`, botão toggle).
- Renderizar o texto/markdown completo sempre.

### 2. Encurtar respostas — `supabase/functions/guata-web-rag/index.ts`
- `maxOutputTokens`: 2048 → **600**.
- Adicionar bloco no system prompt (nos dois caminhos, com e sem contexto):
  - "Responda em no máximo 4-6 frases ou ~800 caracteres."
  - "Use bullets curtos quando listar mais de 2 itens."
  - "Vá direto ao ponto: 1 frase de resposta + 2-3 detalhes específicos + 1 pergunta de acompanhamento opcional."
- Remover instruções redundantes que estimulam respostas longas ("seja DETALHADO", "extraia TODOS os detalhes"), mantendo "seja ESPECÍFICO".
- Re-deploy da edge function.

### 3. Carrossel de sugestões — `src/components/guata/SuggestionQuestions.tsx`
- Detectar breakpoint: abaixo de `lg` (1024px) renderiza como **carrossel horizontal de chips** scrollável (sem barra visível, com snap), acima de `lg` mantém o card vertical atual.
- Chips compactos: padding pequeno, `rounded-full`, borda translúcida, ícone opcional.
- Em `ChatGuata.tsx` e `Guata.tsx`, mover o `<SuggestionQuestions />` para **dentro/acima do chat** quando em mobile (renderiza logo acima do `ChatInput`); em desktop continua na coluna lateral direita.
- Implementação: o próprio `SuggestionQuestions` exporta duas variantes via prop `variant="sidebar" | "carousel"`. Cada página decide com `useMediaQuery('(min-width: 1024px)')` ou passa `carousel` por padrão e o CSS esconde em desktop quando a coluna lateral existir — vamos usar a primeira abordagem (prop explícita) para clareza.

### Sobre a base de conhecimento (informativo, sem mudança)
Confirmado: o Guatá usa sim a base do admin. Fluxo:
- `guataTrueApiService` → `guataIntelligentTourismService` → `guataKnowledgeBaseService` consulta `guata_knowledge_base` (gerenciada no admin).
- Se a KB não responde, cai no `guata-web-rag` (Gemini + Google Search).

## Arquivos tocados

- `src/components/guata/ChatMessage.tsx` — remover "Ver mais".
- `src/components/guata/SuggestionQuestions.tsx` — adicionar variante `carousel`.
- `src/pages/ChatGuata.tsx` — renderizar carrossel acima do chat em mobile.
- `src/pages/Guata.tsx` — idem.
- `supabase/functions/guata-web-rag/index.ts` — encurtar prompts + reduzir `maxOutputTokens`.

## Fora do escopo

- Não mexer no `guata_knowledge_base` nem no admin.
- Não alterar a personalidade/voz do Guatá (capivara, emojis, tom acolhedor).
- Não tocar no design da rota desktop além da inclusão condicional do carrossel.

Posso implementar?
