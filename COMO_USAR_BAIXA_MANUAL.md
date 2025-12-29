# 🎁 Como Usar a Funcionalidade de Baixa Manual (Promoções)

## 📋 O que é?

A funcionalidade de **"Baixa Manual"** permite que você, como admin, libere acesso para parceiros **sem precisar de pagamento**. É perfeito para:
- ✅ Promoções especiais
- ✅ Parcerias estratégicas
- ✅ Testes e validações
- ✅ Casos especiais aprovados manualmente

## 🚀 Como Usar

### **Opção 1: Na Lista de Parceiros Pendentes**

1. Acesse o Admin: `/viajar/admin/descubra-ms/partners`
2. Vá na aba **"Pendentes"**
3. Encontre o parceiro que você quer dar baixa
4. Clique no botão **"Baixa Manual"** (botão roxo)
5. Pronto! O parceiro terá acesso liberado automaticamente

### **Opção 2: No Modal de Detalhes**

1. Acesse o Admin: `/viajar/admin/descubra-ms/partners`
2. Clique em **"Ver Detalhes"** no parceiro
3. No modal, clique em **"Dar Baixa Manual (Promoção)"**
4. Pronto! O parceiro terá acesso liberado automaticamente

## ✨ O que acontece quando você dá baixa manual?

Quando você clica em "Dar Baixa Manual", o sistema:

1. ✅ **Aprova o parceiro** (`status = 'approved'`)
2. ✅ **Ativa o parceiro** (`is_active = true`)
3. ✅ **Ativa a assinatura** (`subscription_status = 'active'`)
4. ✅ **Registra quem deu a baixa** (`approved_by = seu usuário`)
5. ✅ **Registra quando foi dado** (`approved_at = agora`)
6. ✅ **Define data de início** (`subscription_start_date = agora`)
7. ✅ **Envia email de notificação** para o parceiro

## 🎯 Diferença entre "Aprovar" e "Baixa Manual"

| Ação | O que faz | Quando usar |
|------|-----------|-------------|
| **Aprovar** | Aprova o parceiro, mas ele ainda precisa pagar a assinatura | Quando o parceiro vai pagar normalmente |
| **Baixa Manual** | Aprova + Ativa assinatura sem pagamento | Quando você quer dar acesso grátis (promoção) |

## 📊 Status da Assinatura

Após dar baixa manual, o parceiro terá:
- `status`: `approved`
- `is_active`: `true`
- `subscription_status`: `active`
- `subscription_start_date`: Data atual

## 🔍 Verificar Parceiros com Baixa Manual

Para ver quais parceiros receberam baixa manual, você pode:

1. Verificar no banco de dados:
```sql
SELECT 
  name,
  contact_email,
  status,
  subscription_status,
  approved_by,
  approved_at
FROM institutional_partners
WHERE subscription_status = 'active'
AND stripe_subscription_id IS NULL; -- Sem assinatura Stripe = baixa manual
```

2. Ou verificar no admin:
   - Vá em **Parceiros** → Aba **Ativos**
   - Parceiros com `subscription_status = 'active'` e sem `stripe_subscription_id` receberam baixa manual

## ⚠️ Importante

- A baixa manual **não cria** uma assinatura no Stripe
- O parceiro terá acesso **permanente** até você suspender manualmente
- Use com cuidado para não dar acesso indevido
- Sempre verifique se o parceiro realmente merece a promoção

## 🎉 Exemplo de Uso

**Cenário:** Você quer dar uma promoção para um parceiro estratégico

1. Parceiro se cadastra normalmente em `/descubramatogrossodosul/seja-um-parceiro`
2. Você recebe notificação de novo parceiro pendente
3. Você acessa o admin e vê o parceiro na aba "Pendentes"
4. Você clica em **"Baixa Manual"**
5. O parceiro recebe email dizendo que foi aprovado
6. O parceiro pode fazer login e acessar o dashboard **sem precisar pagar**!

---

**Pronto!** Agora você pode dar baixa manual para qualquer parceiro quando quiser fazer uma promoção! 🎁


