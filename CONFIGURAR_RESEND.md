# 📧 Como Configurar o Resend para Envio de Emails

Este guia explica como configurar o Resend para que os emails de notificação funcionem corretamente.

## 🎯 O que é o Resend?

O Resend é um serviço de envio de emails transacionais. Ele é usado para enviar emails de notificação quando:
- ✅ Eventos são aprovados
- ❌ Eventos são rejeitados
- 🤝 Parceiros são aprovados/rejeitados
- 💳 Pagamentos são confirmados

## 📋 Passo a Passo

### 1. Criar Conta no Resend

1. Acesse: https://resend.com
2. Clique em "Sign Up" e crie uma conta gratuita
3. Confirme seu email

### 2. Obter API Key

1. Após fazer login, vá em **API Keys** no menu lateral
2. Clique em **Create API Key**
3. Dê um nome para a chave (ex: "Descubra MS Production")
4. Selecione as permissões necessárias (geralmente "Full Access" para começar)
5. Clique em **Create**
6. **IMPORTANTE**: Copie a chave imediatamente! Ela só é mostrada uma vez.

### 3. Configurar no Supabase

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Edge Functions** → **Secrets**
4. Clique em **Add new secret**
5. Configure:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Cole a API Key que você copiou do Resend
6. Clique em **Save**

### 4. Verificar Domínio (Opcional mas Recomendado)

Para enviar emails de um domínio próprio (ex: noreply@descubramatogrossodosul.com.br):

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Adicione seu domínio (ex: `descubramatogrossodosul.com.br`)
4. Siga as instruções para configurar os registros DNS
5. Aguarde a verificação (pode levar algumas horas)

**Nota**: Sem verificar o domínio, você pode usar o domínio padrão do Resend, mas pode ter limitações.

## ✅ Verificar se Está Funcionando

Após configurar:

1. Tente aprovar ou rejeitar um evento
2. Verifique os logs da Edge Function no Supabase:
   - Vá em **Edge Functions** → **send-notification-email** → **Logs**
3. Se estiver funcionando, você verá: `Email enviado com sucesso`
4. Se não estiver, verifique:
   - Se a variável `RESEND_API_KEY` está configurada corretamente
   - Se a API Key está ativa no Resend
   - Os logs de erro no Supabase

## 🔧 Alternativa: Sem Resend

Se você não quiser configurar o Resend agora:

- ✅ A aprovação/rejeição de eventos **ainda funciona normalmente**
- ✅ O sistema apenas não enviará emails de notificação
- ✅ Os emails serão registrados na tabela `pending_emails` (se existir) para envio manual depois

## 📊 Limites do Plano Gratuito do Resend

- **3.000 emails/mês** gratuitos
- **100 emails/dia** de limite
- Domínio verificado necessário para produção

## 🆘 Problemas Comuns

### Erro: "Invalid API Key"
- Verifique se copiou a chave completa
- Certifique-se de que a chave está ativa no Resend
- Verifique se o nome da variável está correto: `RESEND_API_KEY`

### Erro: "Domain not verified"
- Você precisa verificar o domínio no Resend
- Ou use o domínio padrão do Resend (pode ter limitações)

### Emails não estão sendo enviados
- Verifique os logs da Edge Function no Supabase
- Confirme que a variável de ambiente está configurada
- Teste a API Key diretamente no Resend

## 📝 Notas Importantes

- A API Key é sensível - **nunca** compartilhe publicamente
- Mantenha backups seguros da API Key
- Se suspeitar que a chave foi comprometida, revogue-a no Resend e crie uma nova
- O sistema funciona mesmo sem Resend configurado (apenas não envia emails)

