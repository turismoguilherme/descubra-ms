## 1. Remover a versão paga dos eventos (Descubra MS)

Escopo confirmado: remover a compra e ocultar o histórico de pagamento.

- `EventSubmissionForm.tsx`: remove o seletor "Gratuito / Destaque (pago)", a busca do preço em `site_settings.event_sponsor_price`, a regra de vídeo/logo obrigatório e o redirecionamento para o Stripe. Todo evento enviado passa a ser gratuito (`is_sponsored = false`, sem status de pagamento).
- Remove a página `PromoverEventoMS.tsx`, `EventPromotionForm.tsx`, `EventPaymentReturn.tsx`, `EventPaymentSuccess.tsx`, o serviço `eventCheckoutService.ts` e as rotas correspondentes no `App.tsx`.
- Admin (`EventsManagement.tsx`, `EventStatus.tsx`): esconde colunas/badges de status de pagamento e valor. Mantém apenas um interruptor manual "Evento em destaque" (sem cobrança), para a home continuar tendo a seção de destaques.
- Edge functions `event-checkout` e `refund-event-payment` são desativadas (removidas do projeto). Os dados já existentes em `events` (colunas `is_sponsored`, `sponsor_payment_status`) permanecem no banco, apenas deixam de ser exibidos — nada é apagado, então é reversível.

## 2. Passaporte: rotas com ordem livre

Hoje o check-in é "sequencial total" (dia anterior completo + ordem dentro do dia). A mudança é um interruptor por rota no admin, mantendo o comportamento atual como padrão.

- Migração: nova coluna `routes.checkpoint_order_mode` (`'sequential'` padrão | `'free'`).
- `validate_and_stamp_checkpoint`: quando a rota for `free`, pula as duas checagens de ordem (dias anteriores e ordem dentro do dia). Geofence, foto obrigatória e anti-duplicidade continuam iguais.
- Admin (formulário de rota): interruptor "Permitir concluir os pontos em qualquer ordem", com texto explicativo.
- App (`PassportRouteView`, `CheckpointList`): quando `free`, todos os checkpoints ficam habilitados (sem cadeado) e o rótulo do dia vira apenas agrupamento visual; a barra de progresso continua contando concluídos/total.

Nada do que já existe quebra: rotas atuais continuam `sequential`.

## 3. Ranking e gamificação

Recomendação (escolhida com base no que gera mais engajamento e é à prova de fraude): **três abas — Mensal, Geral e Por região turística**, alimentadas só por carimbos válidos de roteiros oficiais (que já passam por geofence). Assim há sempre "corrida do mês" para novos usuários competirem, sem que os veteranos travem o topo.

- Migração: view/função `passport_leaderboard(period, region)` que soma `passport_stamps.points_earned` (e conta carimbos) por usuário, com `RANK()`; exposta via RPC `SECURITY DEFINER` retornando apenas `display_name`, `avatar_url`, pontos, carimbos e posição — sem e-mail ou dados pessoais. Coluna `user_profiles.leaderboard_opt_out` para quem não quiser aparecer.
- Nova aba "Ranking" no passaporte digital: pódio (top 3), lista top 50 e um card fixo com "Sua posição", além do filtro de período/região.
- Card compartilhável: componente que gera uma imagem 1080×1920 (formato story) com a logo do Descubra MS, apelido, avatar, posição, pontos e carimbos do mês — botão "Compartilhar" usando a Web Share API (nativo no app) com fallback de download.
- Conquistas de ranking (usa a tabela `achievements` existente): "Top 10 do mês", "1º lugar regional", "Sequência de 3 meses no top 50".

## Detalhes técnicos

- Migrações: `routes.checkpoint_order_mode`, `user_profiles.leaderboard_opt_out`, RPC de ranking com GRANT para `authenticated`/`anon` (leitura) e substituição de `validate_and_stamp_checkpoint`.
- A imagem do story é gerada no cliente (canvas), sem custo de servidor.
- Arquivos novos ficam em `src/components/passport/ranking/` para não inchar os componentes atuais.
