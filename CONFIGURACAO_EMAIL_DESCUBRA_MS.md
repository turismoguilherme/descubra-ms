# 📧 Como Configurar Email Verdadeiro para Descubra MS

## 🎯 SITUAÇÃO ATUAL

**Problema:** O email atual `noreply@descubramatogrossodosul.com.br` **não existe**.

**Impacto:** Os emails são enviados usando o domínio fallback do Resend (`onboarding@resend.dev`), que tem limitações.

## 📋 PASSO A PASSO PARA CRIAR EMAIL VERDADEIRO

### 1. **ESCOLHA DO DOMÍNIO**

**Opções recomendadas:**

1. **Comprar domínio novo** (recomendado):
   - `descubrams.com.br`
   - `turismoms.com.br`
   - `viajarms.com.br`

2. **Usar subdomínio** (mais simples):
   - `email.descubramatogrossodosul.com.br`
   - `suporte.descubramatogrossodosul.com.br`

### 2. **REGISTRO DO DOMÍNIO**

**Hospedagem recomendada:**
- **Registro.br** (para .com.br)
- **GoDaddy** ou **Hostinger** (internacionais)

**Custo aproximado:** R$ 50-100/ano

### 3. **CONFIGURAÇÃO NO RESEND**

#### **Passo 1: Acessar Resend**
1. Vá para https://resend.com
2. Faça login na sua conta

#### **Passo 2: Verificar Domínio**
1. No menu lateral, clique em **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio: `descubrams.com.br`

#### **Passo 3: Configurar DNS**
O Resend fornecerá registros DNS para adicionar no seu domínio:

```dns
Tipo: TXT
Nome: _dmarc.descubrams.com.br
Valor: v=DMARC1; p=none; rua=mailto:admin@descubrams.com.br

Tipo: MX
Nome: descobrams.com.br
Valor: feedback-smtp.br.amazon.com
Prioridade: 10

Tipo: TXT
Nome: descobrams.com.br
Valor: v=spf1 include:_spf.resend.com ~all
```

#### **Passo 4: Configurar Endereços de Envio**
Após verificar o domínio, configure os endereços:

```typescript
// No Supabase - Edge Functions Environment Variables
RESEND_FROM_EMAIL=noreply@descubrams.com.br
RESEND_DEFAULT_FROM=suporte@descubrams.com.br
```

### 4. **TESTE COMPLETO**

#### **Teste 1: Verificação de Domínio**
```bash
# Verificar se o domínio está verificado no Resend
curl -X GET https://api.resend.com/domains \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### **Teste 2: Envio de Email de Teste**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@descubrams.com.br",
    "to": ["seu-email@teste.com"],
    "subject": "Teste de Domínio",
    "html": "<p>Este é um teste do novo domínio!</p>"
  }'
```

## 🔧 **IMPLEMENTAÇÃO NO CÓDIGO**

### **Atualizar Edge Function**
Arquivo: `supabase/functions/send-notification-email/index.ts`

```typescript
// Atualizar linha 595-597
const customDomain = Deno.env.get('RESEND_FROM_EMAIL') || 'Descubra MS <noreply@descubrams.com.br>';
const defaultDomain = Deno.env.get('RESEND_DEFAULT_FROM') || 'Descubra MS <suporte@descubrams.com.br>';
```

### **Variáveis de Ambiente no Supabase**
```
RESEND_FROM_EMAIL=noreply@descubrams.com.br
RESEND_DEFAULT_FROM=suporte@descubrams.com.br
```

## 📊 **LIMITE DE ENVIO**

| Plano Resend | Emails/Mês | Emails/Dia | Domínio Próprio |
|--------------|------------|------------|------------------|
| Gratuito | 3.000 | 100 | ❌ (fallback funciona) |
| Hobby | 50.000 | 500 | ✅ |
| Pro | 100.000+ | 2.000+ | ✅ |

## ✅ **RESULTADO FINAL**

Após configuração completa:
- ✅ Emails enviados de `noreply@descubrams.com.br`
- ✅ Melhor deliverability
- ✅ Aparência profissional
- ✅ Sem limites de domínio próprio

## 🚀 **RESUMO EXECUTIVO**

1. **Compre um domínio** (.com.br ou internacional)
2. **Configure no Resend** (adicionar domínio + DNS)
3. **Atualize variáveis** no Supabase
4. **Teste completamente**

**Custo total aproximado:** R$ 50-100 (domínio) + R$ 0-20/mês (Resend)

**Tempo estimado:** 30-60 minutos + 24-48h para propagação DNS

---

## ❓ **DÚVIDAS FREQUENTES**

**P: Posso usar Gmail ou Outlook?**
R: Não diretamente. O Resend precisa de domínio próprio.

**P: E se eu não configurar agora?**
R: Funciona com fallback, mas menos profissional.

**P: Posso usar subdomínio?**
R: Sim! Ex: `email.descubramatogrossodosul.com.br`

**P: Preciso de hospedagem?**
R: Não para email. Só para o site se quiser.
