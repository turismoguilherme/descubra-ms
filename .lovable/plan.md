

## Ajuste no plano: voltar assinatura digital ao formato anterior (sem canvas)

### Mudança solicitada

Remover o **canvas de desenho** da assinatura digital. Voltar ao formato anterior: **checkbox de aceite** ("Li e aceito os termos") + **upload obrigatório do PDF físico assinado**.

### Fluxo final do parceiro (`PartnerTermsAcceptance.tsx`)

```text
┌─ Passo 1: Ler o termo ────────────────────┐
│  [Texto do termo renderizado]              │
│  [📥 Baixar Termo em PDF para assinar]    │
└────────────────────────────────────────────┘
┌─ Passo 2: Aceite Digital (obrigatório) ───┐
│  ☑ Li e aceito os termos de parceria      │
│     (registra: nome, email, IP, data/hora)│
└────────────────────────────────────────────┘
┌─ Passo 3: Upload do PDF assinado (obrig.) ┐
│  [Área de upload PDF/JPG/PNG]             │
│  Dica: imprima, assine à mão, escaneie    │
└────────────────────────────────────────────┘
[Finalizar Cadastro] ← só habilita com aceite + upload
```

### Mudanças concretas

| Arquivo | Ação |
|---------|------|
| `src/components/partners/PartnerTermsAcceptance.tsx` | Remover `<SignatureCanvas/>`, voltar checkbox de aceite. Manter upload PDF obrigatório e botão "Baixar Termo" |
| `src/components/partners/SignatureCanvas.tsx` | **Deletar** (não usado mais) |
| `src/services/partners/partnerTermsService.ts` | Remover parâmetro `signatureDataUrl` de `generatePartnerTermsPDF`. PDF gerado conterá apenas dados do parceiro + hash + IP + data/hora (sem imagem de assinatura) |
| `src/components/admin/partners/PartnerTermsReview.tsx` | Mostrar lado a lado: **PDF Digital gerado** (com aceite eletrônico registrado) + **PDF Físico** (escaneado pelo parceiro) |

### O que NÃO muda

- Coluna `digital_signature_url` no banco continua existindo (compatibilidade), mas ficará `null` para novos registros
- `uploaded_pdf_url` continua **obrigatório**
- `review_status` (pending/approved/rejected) e fluxo do admin continuam iguais
- Botão "Baixar Termo em PDF" no Step 1 continua

### Resultado

- Assinatura digital = aceite eletrônico simples (checkbox + log de IP/hora) — como era antes
- Assinatura física = upload obrigatório do PDF escaneado
- Admin vê os 2 documentos lado a lado em **Parceiros → Termos** e aprova/rejeita

