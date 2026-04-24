

## Diagnóstico

Hoje no admin existem **duas telas separadas** para parceiros, e isso está confundindo:

1. **Aba "Lista" (Parceiros)** → mostra cadastro + botões `Aprovar`, `Devolver p/ ajuste`, `Baixa Manual`, `Reprovar (definitivo)`, `Excluir Permanentemente`. **NÃO mostra o PDF assinado.**
2. **Aba "Termos"** → é onde o PDF físico assinado pelo parceiro aparece (campo `uploaded_pdf_url` da tabela `partner_terms_acceptances`). Você provavelmente nunca abriu essa aba — por isso "não consegue ver o documento".

## O que cada botão faz hoje (significado real no código)

| Botão | O que acontece de fato |
|---|---|
| **Aprovar** | Marca `status=approved` + `is_active=true`. Parceiro ainda precisa **pagar** a assinatura no Stripe para ter acesso. |
| **Devolver p/ ajuste** | Marca `status=revision_requested`. Parceiro recebe email e pode reenviar dados/PDF. Mantém acesso. |
| **Baixa Manual** | Aprova **+ ativa a assinatura sem pagamento** (`subscription_status=active`). Usado para **promoções/cortesias** (acesso grátis). |
| **Reprovar (definitivo)** | Cancela assinatura no Stripe, tenta **reembolso integral** da última fatura e **encerra acesso**. Irreversível em termos de cobrança. |
| **Excluir Permanentemente** | **Apaga** o registro do parceiro do banco + remove conta de auth. Não tem volta. |

## O que vou implementar

### 1. Mostrar o PDF assinado direto no card e modal de detalhes do parceiro (aba Lista)

No `PartnersManagement.tsx`, ao carregar a lista, buscar também o termo mais recente (`partner_terms_acceptances`) de cada parceiro e exibir:

- **No card do parceiro**: badge "Termo: Pendente / Aprovado / Rejeitado" + ícone para abrir o PDF assinado em nova aba (se existir `uploaded_pdf_url`).
- **No modal "Ver Detalhes"**: nova seção **"Termo de Parceria"** com:
  - Status da revisão
  - Data de assinatura + IP
  - Botão **"Ver PDF Digital (gerado)"** → abre `pdf_url`
  - Botão **"Ver PDF Físico Assinado"** → abre `uploaded_pdf_url`
  - Botões **"Aprovar termo"** / **"Solicitar ajuste"** / **"Rejeitar termo"** (mesma lógica da aba Termos, agora acessível direto daqui)

### 2. Renomear botões para deixar o significado claro

Trocar os labels para serem autoexplicativos, sem mudar a lógica:

- `Baixa Manual` → **"Liberar acesso grátis (cortesia)"** com tooltip "Aprova e ativa a assinatura sem cobrança no Stripe — para promoções"
- `Reprovar (definitivo)` → **"Reprovar e cancelar assinatura"** com tooltip "Cancela no Stripe, tenta reembolso e encerra acesso"
- `Excluir Permanentemente` → **"Apagar do banco (irreversível)"** com tooltip "Remove parceiro e conta de login — não tem volta"
- `Devolver p/ ajuste` → **"Pedir ajuste ao parceiro"**
- Adicionar pequeno ícone `?` ao lado de cada botão abrindo um popover com explicação curta em PT-BR.

### 3. Tornar o `window.confirm()` (alert nativo feio) um Dialog do shadcn

Trocar os `window.confirm` de "Reprovar definitivo" e "Excluir permanentemente" por `AlertDialog` do shadcn com texto explicando exatamente o que vai acontecer (incluindo se haverá tentativa de reembolso, se Stripe será cancelado etc.).

### 4. Manter a aba "Termos" funcionando como está

Continua útil para revisão em massa de todos os termos. Apenas adicionamos atalho na lista de parceiros para não obrigar a navegar entre abas.

## Arquivos afetados

- `src/components/admin/descubra_ms/PartnersManagement.tsx` — adicionar fetch de termos, seção no modal, renomear botões, popovers de ajuda, AlertDialog
- Reaproveitar a função `updateStatus` da `PartnerTermsReview.tsx` extraindo para `src/services/partners/partnerTermsReviewService.ts` (novo) para evitar duplicação de lógica

## Resultado esperado

- Você abre **Parceiros → Ver Detalhes** e já vê o PDF assinado + status do termo + botões para aprovar/rejeitar o termo
- Nenhum botão fica com nome ambíguo: cada um tem tooltip e popover de ajuda explicando exatamente o efeito (acesso, Stripe, reembolso, exclusão)
- Confirmações destrutivas viram diálogos claros, não mais `alert()` do navegador

