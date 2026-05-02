## Plano de correções e melhoria — Passaporte Digital, Stripe Connect e Termos

Antes de codar, tenho 2 dúvidas importantes que precisam de resposta — listadas no final do plano.

---

### 1) Passaporte Digital — checkpoints por DIA (rotas difíceis / multi-dia)

**Diagnóstico:** hoje `route_checkpoints` tem `order_sequence` (ordem linear), mas não há nenhum conceito de "dia". Para roteiros classificados como `Difícil` que ocupam vários dias, o admin precisa agrupar checkpoints por dia (Dia 1, Dia 2, …) e o app precisa exibir/validar respeitando essa divisão.

**O que será implementado:**
- **Migration** adicionando à tabela `route_checkpoints`:
  - `day_number INTEGER DEFAULT 1` (em qual dia do roteiro está o checkpoint)
  - `day_title TEXT NULL` (rótulo opcional do dia, ex.: "Dia 1 – Bonito Centro")
- Em `routes`: adicionar `total_days INTEGER DEFAULT 1` para o admin definir a duração em dias.
- **Admin (`PassportCheckpointManager` + `PassportRouteManager`)**:
  - Em rotas `Difícil`, exibir campo "Total de dias" e, ao criar/editar checkpoint, um seletor "Dia". Os checkpoints passam a ser listados agrupados por dia.
- **App público (`PassaporteRota` / detalhe da rota)**:
  - Renderizar a lista de checkpoints agrupada por dia, com cabeçalho de cada dia.
  - O progresso por dia é exibido (X/Y do Dia 1, etc.); o sequencial continua respeitando `order_sequence` dentro do dia.
- **Compatibilidade:** rotas existentes ficam com `day_number = 1` e `total_days = 1`, sem mudança visual.

### 2) Tela "Nenhuma Rota Disponível" — remover botão administrativo

**Diagnóstico:** `src/pages/ms/PassaporteLista.tsx` linhas 269–284 mostram botão "Ir para Painel Administrativo" para qualquer visitante quando não há rotas. Inadequado para o público final.

**Correção:** substituir o estado vazio por mensagem amigável sem CTA administrativo:
- Ícone + título "Em breve, novas rotas"
- Texto: "Ainda não há rotas publicadas. Volte em breve para descobrir os roteiros do Passaporte Digital."
- Botão único "Voltar para o início" → navega para `/descubrams`.

### 3) Stripe Connect — erro ao tentar conectar

**Diagnóstico:** a edge function `stripe-connect-onboarding` (linhas 236 e 262) faz duas validações estritas:
1. `partner.contact_email !== user.email` → bloqueia 403.
2. `partner.contact_email !== partnerEmail` (do body) → lança erro.

Cenários reais que falham hoje:
- Parceiro foi cadastrado pelo admin com `contact_email` diferente do email da conta auth do usuário-parceiro.
- Letras maiúsculas/minúsculas ou espaços diferentes entre os emails.
- Admin/master_admin tentando conectar em nome de um parceiro.

**Correção:**
- **Edge function `stripe-connect-onboarding`:**
  - Comparar emails sempre normalizados: `.trim().toLowerCase()`.
  - Permitir acesso quando o usuário é `admin`/`master_admin`/`tech` (consulta `user_roles`), além do próprio parceiro.
  - Em vez de derivar `partnerEmail` do body, **usar sempre `partner.contact_email`** do banco (mais seguro e evita divergência); manter o body apenas como fallback.
  - Mensagens de erro mais claras no `catch` final (incluir `error.code` quando vier do Stripe) para o front exibir o motivo real.
- **Front `StripeConnectStep.tsx`:** mostrar a mensagem retornada pela edge function (já mostra `err.message`), e adicionar log do `error.context` para diagnóstico futuro.

### 4) Termos do parceiro não aparecem no admin

**Diagnóstico:** existem **3 registros pendentes** em `partner_terms_acceptances` com `pdf_url` e `uploaded_pdf_url` preenchidos, mas a política RLS de leitura para admin é:

```
EXISTS (... user_roles WHERE role = ANY (ARRAY['admin','tech']))
```

Não inclui `master_admin`. Em outras tabelas o padrão do projeto é aceitar `admin`, `tech` e `master_admin`. Como você (provavelmente `master_admin`) consulta a tabela e a RLS bloqueia, o painel `PartnerTermsReview` mostra "Nenhum termo encontrado" mesmo com dados válidos no banco. Isso também explica por que, ao "Solicitar ajuste" e o parceiro reenviar, o novo registro não aparece.

**Correção:**
- **Migration:** atualizar a policy `Admins can view all term acceptances` (e equivalentes de UPDATE) em `partner_terms_acceptances` para incluir `master_admin`:
  ```sql
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin','tech','master_admin')
  ))
  ```
- Conferir e alinhar a policy de UPDATE (aprovar/rejeitar/solicitar ajuste) com a mesma lista de roles.
- **Bonus front-end (`PartnerTermsReview.tsx`):** quando o filtro estiver em "Todos", carregar de fato todos (já carrega), mas adicionar um aviso visual "0 registros visíveis" diferenciando "sem permissão" de "sem dados", lendo `count` separado.

---

### Mudança técnica resumida

- **Migrations SQL** (1 arquivo):
  - `route_checkpoints.day_number`, `route_checkpoints.day_title`
  - `routes.total_days`
  - Atualização das policies de SELECT/UPDATE em `partner_terms_acceptances` para incluir `master_admin`.
- **Edge function:** `supabase/functions/stripe-connect-onboarding/index.ts` (normalização e bypass admin).
- **Front-end:**
  - `src/pages/ms/PassaporteLista.tsx` (estado vazio).
  - `src/components/admin/passport/PassportCheckpointManager.tsx` e `PassportRouteManager.tsx` (UI de dias).
  - `src/pages/ms/PassaporteRota.tsx` ou equivalente (agrupamento por dia).
  - `src/types/passportDigital.ts` (campos novos opcionais).
  - `src/integrations/supabase/types.ts` (regenerado pela migration).

---

### Perguntas antes de implementar

1. **Checkpoints por dia — sequência:** dentro do mesmo dia, os checkpoints devem ser feitos **em ordem obrigatória** (sequencial), ou **em qualquer ordem**? E entre dias, o usuário precisa terminar o Dia 1 antes de fazer check-in no Dia 2?
2. **Stripe Connect — bypass admin:** quando o admin/master_admin clicar em "Conectar Stripe" no painel, devo (a) **deixar o admin completar o onboarding em nome do parceiro** (gera link e abre normalmente) ou (b) **apenas permitir gerar o link e enviar por email/WhatsApp para o parceiro completar**? A opção (b) é mais segura porque o KYC pertence ao parceiro.
