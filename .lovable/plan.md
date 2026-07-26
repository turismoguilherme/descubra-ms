## O que eu verifiquei antes de planejar

- **Banco (548 MB no total)**: `security_audit_log` sozinha ocupa **92 MB com 9.108 linhas** (registros de 08/02/2026 a 17/07/2026). É de longe o maior peso e é tabela de log — ou seja, dá para reduzir com segurança. As outras tabelas são pequenas (a segunda maior tem 1 MB).
- **Storage**: 171 arquivos, **152 MB**.
- **Repositório**: `public/downloads/descubra-ms.apk` = **82 MB** versionado dentro do projeto.
- **Cartilha Guatá Capacita**: é um HTML único (`public/cartilhas/guata-capacita/index.html`) exibido em iframe. Os "links das aulas" hoje apontam para URLs de exemplo (`https://turismo.ms.gov.br/capacita/modulo1-video`, etc.) geradas em `generateDefaultQRCodes()`, e o botão "Abrir link" usa `target="_blank"` — que no app nativo (WebView dentro de iframe) normalmente não abre nada.
- **Sugestões do chat**: `GuataChat.tsx` renderiza `SuggestionQuestions variant="inline"` em grade de 2 colunas alinhada à esquerda (`SuggestionQuestions.tsx`).

---

## 1) Limpeza de arquivos (sem risco)

- Remover o `descubra-ms.apk` (82 MB) do repositório — ele é gerado por `scripts/build-android-apk.mjs`, então não se perde nada; o link de download passa a apontar para o artefato publicado. **Confirmo com você antes de apagar.**
- Remover docs de trabalho já concluídos e duplicados em `docs/` (RESUMO_*, STATUS_*, CORRECOES_IMPLEMENTADAS_*_FINAL, README_ATUALIZADO, etc.), mantendo os documentos de arquitetura/configuração úteis.
- Varredura de órfãos em `src/` (arquivos `.ts/.tsx` sem nenhum import), removendo apenas os 100% sem referência.

## 2) Limpeza do Supabase

**Etapa A — o ganho real (imediato):**
- Apagar registros de `security_audit_log` com mais de 90 dias e rodar `VACUUM FULL` na tabela. Expectativa: liberar a maior parte dos 92 MB.
- Criar uma função de retenção agendada (90 dias) para o log não crescer de novo.
- Limpar caches expirados: `guata_response_cache` e `koda_response_cache`.

**Etapa B — tabelas legadas (só depois de conferir com você):**
Existem tabelas antigas praticamente vazias (grupo `flowtrip_*`, `master_*`, `workflow_definitions`, `automated_tasks`, `ai_master_insights`, `ai_proactive_insights`). Elas ocupam pouquíssimo espaço, então **não vale o risco de remover às cegas**. Vou levantar a lista das que não têm nenhuma leitura/escrita no código e te mostrar antes de qualquer `DROP`. Nada é apagado sem sua aprovação nominal.

## 3) Guatá Capacita no app (layout + links das aulas)

- **Links das aulas**: trocar o `target="_blank"` por abertura compatível com o app (no nativo, abre no navegador do sistema via ponte do Capacitor; no site, continua em nova aba) e transformar o bloco QR + botão em um cartão que não vaza da coluna no celular.
- **Textos saindo para fora**: aplicar `overflow-wrap/break-words`, remover `whitespace-nowrap` das barras de navegação em telas pequenas (hoje as pílulas "Página 1..8" forçam scroll horizontal), e ajustar grids fixos (`grid-cols-2`, tabelas e cabeçalhos) para empilhar abaixo de 768px. Ajustes ficam dentro do bloco `@media screen and (max-width: 767px)`, sem alterar o layout A4/impressão.
- **URLs de exemplo**: as URLs dos módulos são placeholders. Se você já tem os links reais das aulas/quizzes, me manda que eu coloco; senão, deixo o botão desabilitado com aviso "aula em breve" em vez de abrir link quebrado.

## 4) Chat Guatá — sugestões centralizadas no app

- Em `SuggestionQuestions.tsx` (variante `inline`): centralizar o título e os chips, com os cartões em largura consistente e texto centralizado, mantendo o toque confortável.
- Em `GuataChat.tsx`: centralizar o bloco no container e limitar a largura máxima para não colar nas bordas.
- Conferir os balões de mensagem no app (`ChatMessage.tsx`) para garantir alinhamento e quebra de texto correta em telas estreitas.

---

## Ordem de execução
1. Limpeza do `security_audit_log` + retenção + caches (migration)
2. Correções de layout do Guatá Capacita e links das aulas
3. Centralização das sugestões e revisão dos balões no app
4. Limpeza de arquivos do repositório (após seu OK sobre o APK)
5. Lista de tabelas legadas para sua aprovação

## Detalhes técnicos
- A migration só apaga linhas de log/cache e cria a função de retenção; nenhum schema de negócio é alterado.
- As correções da cartilha ficam restritas ao CSS mobile e à função `createQRCode` do HTML — layout de impressão/A4 intocado.
