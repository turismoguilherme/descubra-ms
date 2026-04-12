

# Plano: Corrigir Guatá (Tela Branca) + Parceiros (Botão + PDF + Assinatura Digital + Admin)

## 1. Guatá - Tela Branca

**Causa raiz**: `Guata.tsx` usa `getGuataSessionId` e `resetGuataSessionId` mas nunca importa essas funções. O `@ts-nocheck` esconde o erro, causando crash em runtime.

**Fix**: Adicionar import na linha 1-13:
```ts
import { getGuataSessionId, resetGuataSessionId } from "@/utils/guataSession";
```

## 2. Build Error - `npm:jose@5.9.6`

**Causa raiz**: `supabase/functions/_shared/googleServiceAccountToken.ts` importa `npm:jose@5.9.6` mas nao ha `deno.json` com essa dependencia na raiz do functions.

**Fix**: Criar `supabase/functions/deno.json` com:
```json
{
  "imports": {
    "npm:jose@5.9.6": "npm:jose@5.9.6"
  }
}
```

## 3. Botão do Formulário de Parceiros

**Problema**: O botão do Step 1 diz "Enviar Solicitação de Parceria" quando deveria dizer "Próximo" (ja que existem mais 3 etapas).

**Fix**: Em `PartnerApplicationForm.tsx` (linha 911), trocar texto de "Enviar Solicitação de Parceria" por "Próximo".

## 4. Sistema de Assinatura + PDF + Admin (Funcionalidade Nova)

A ideia do usuario e excelente e nao e "muita coisa" -- faz parte do fluxo natural de parceria. O sistema ja tem `partnerTermsService.ts` com `generatePartnerTermsPDF`, entao a base existe.

### O que sera implementado:

**A) Assinatura Digital no Wizard (Step 2)**
- Adicionar canvas de assinatura digital (desenhar com mouse/touch) no `PartnerTermsAcceptance.tsx`
- Salvar imagem da assinatura no Supabase Storage (bucket `documents`)
- Incluir assinatura no PDF gerado

**B) Download do Termo em PDF**
- Botao "Baixar Termo" para o parceiro baixar o PDF com sua assinatura digital
- PDF gerado com dados do parceiro + assinatura + data/hora/IP

**C) Upload de Termo Assinado Fisicamente**
- Apos Step 2, opcao adicional: "Enviar termo assinado em PDF"
- Upload de arquivo PDF para Supabase Storage
- Salvar referencia na tabela `partner_terms_acceptances`

**D) Painel Admin - Gestao de Termos**
- Nova aba/secao no admin de parceiros para listar termos enviados
- Status: "Pendente", "Aprovado", "Rejeitado"
- Visualizar PDF digital e PDF fisico enviado
- Botao "Marcar como OK" e "Marcar como Pendente"
- Filtros por status

### Migration SQL necessaria:
- Garantir tabela `partner_terms_acceptances` tenha colunas: `digital_signature_url`, `uploaded_pdf_url`, `review_status` (pending/approved/rejected), `reviewed_by`, `reviewed_at`, `review_notes`

## Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/pages/Guata.tsx` | Fix: adicionar import getGuataSessionId/resetGuataSessionId |
| `supabase/functions/deno.json` | Criar: resolver build error jose |
| `src/components/partners/PartnerApplicationForm.tsx` | Fix: botao "Proximo" |
| `src/components/partners/PartnerTermsAcceptance.tsx` | Adicionar canvas assinatura digital + download PDF + upload PDF |
| `src/components/partners/SignatureCanvas.tsx` | Criar: componente de assinatura digital |
| `src/services/partners/partnerTermsService.ts` | Atualizar: incluir assinatura no PDF + upload PDF fisico |
| `src/components/admin/partners/PartnerTermsReview.tsx` | Criar: painel admin de revisao de termos |
| `src/components/admin/descubra_ms/PartnersAdminModule.tsx` | Adicionar aba "Termos" |
| Migration SQL | Adicionar colunas de revisao na tabela |

## Resultado

- Guata abre normalmente (sem tela branca)
- Build sem erros
- Formulario de parceiros com botao "Proximo" no Step 1
- Assinatura digital + download PDF + upload PDF fisico
- Admin pode revisar e aprovar/rejeitar termos assinados

