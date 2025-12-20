# 📋 Instruções: Sistema de Preços e Reserva Direta

## ✅ O QUE FOI IMPLEMENTADO

### **1. Sistema de Preços**
- ✅ Parceiro pode cadastrar preços no dashboard
- ✅ Tipos de preço: Fixo, Por Pessoa, Por Noite, Pacote
- ✅ Tabela `partner_pricing` criada

### **2. Reserva Direta**
- ✅ Cliente vê preços no modal do parceiro
- ✅ Cliente seleciona serviço, data, pessoas
- ✅ Valor calculado automaticamente
- ✅ Botão "Reservar Agora" → Checkout Stripe
- ✅ Reserva criada automaticamente
- ✅ Comissão calculada automaticamente

### **3. Mantido (Não Removido)**
- ✅ Formulário de LEAD (interesse) ainda disponível
- ✅ Layout do modal preservado
- ✅ Todas funcionalidades existentes funcionando

---

## 🚀 COMO APLICAR

### **Passo 1: Aplicar Migrations**

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo: `APLICAR_MIGRATIONS_PRECOS.sql`
4. Verifique se as tabelas foram criadas

### **Passo 2: Parceiro Cadastra Preços**

1. Parceiro acessa `/partner/dashboard`
2. Vai em **Meu Negócio** → Aba **Preços e Disponibilidade**
3. Clica em **Adicionar Preço**
4. Preenche:
   - Tipo de serviço
   - Nome do serviço
   - Tipo de preço (fixo, por pessoa, por noite, pacote)
   - Preço base
   - Preço por pessoa/noite (se aplicável)
   - Mínimo e máximo de pessoas
   - Descrição (opcional)
5. Clica em **Salvar**

### **Passo 3: Cliente Faz Reserva**

1. Cliente acessa `/descubramatogrossodosul/parceiros`
2. Clica em um parceiro
3. Vê seção **"Reservar Agora"** (se parceiro tiver preços cadastrados)
4. Seleciona:
   - Serviço
   - Data
   - Horário (opcional)
   - Número de pessoas
   - Observações (opcional)
5. Vê valor total calculado
6. Clica em **"Reservar Agora"**
7. Vai para Stripe Checkout
8. Faz pagamento
9. Reserva criada automaticamente (status: `pending`)
10. Parceiro recebe notificação
11. Parceiro confirma/rejeita
12. Se confirmar: status → `confirmed`, comissão automática

---

## 📍 ONDE ESTÁ CADA COISA

### **Dashboard do Parceiro:**
- **URL**: `/partner/dashboard`
- **Localização**: Sidebar → **Meu Negócio** → Aba **Preços e Disponibilidade**
- **Funcionalidade**: Cadastrar, editar, ativar/desativar preços

### **Modal do Parceiro:**
- **URL**: `/descubramatogrossodosul/parceiros` → Clica em parceiro
- **Localização**: Seção **"Reservar Agora"** (antes do formulário de lead)
- **Funcionalidade**: Cliente seleciona serviço, data, pessoas e reserva

---

## 🔄 FLUXO COMPLETO

```
1. PARCEIRO
   └─> Acessa /partner/dashboard
   └─> Meu Negócio → Preços e Disponibilidade
   └─> Adiciona preços dos serviços

2. CLIENTE
   └─> Acessa /descubramatogrossodosul/parceiros
   └─> Clica em um parceiro
   └─> Vê seção "Reservar Agora" (com preços)
   └─> Seleciona: serviço, data, pessoas
   └─> Vê valor total
   └─> Clica "Reservar Agora"

3. CHECKOUT
   └─> Redireciona para Stripe Checkout
   └─> Cliente paga

4. SISTEMA
   └─> Cria reserva (status: pending)
   └─> Envia notificação para parceiro
   └─> Envia confirmação para cliente

5. PARCEIRO
   └─> Recebe notificação
   └─> Acessa /partner/dashboard → Reservas
   └─> Vê reserva na aba "Pendentes"
   └─> Confirma ou rejeita

6. SE CONFIRMAR
   └─> Status → confirmed
   └─> Pagamento processado
   └─> COMISSÃO AUTOMÁTICA calculada
   └─> Parceiro recebe valor (total - comissão)
   └─> Plataforma recebe comissão

7. CHAT
   └─> Cliente e parceiro podem conversar sobre a reserva
```

---

## ✅ VANTAGENS

1. **Tudo dentro da plataforma**
   - Cliente não precisa sair para reservar
   - Pagamento integrado
   - Comissão automática

2. **Flexibilidade**
   - Parceiro pode ter preços OU só receber leads
   - Cliente pode reservar direto OU enviar interesse

3. **Não quebra nada**
   - Formulário de lead mantido
   - Layout preservado
   - Funcionalidades existentes funcionando

---

## 📝 PRÓXIMOS PASSOS (Opcional)

- [ ] Calendário de disponibilidade (bloquear datas)
- [ ] Chat antes da reserva (botão "Tirar dúvidas")
- [ ] Auto-confirmação de reservas (se disponibilidade OK)
- [ ] Notificações por email quando cliente faz reserva

---

**Sistema pronto para uso!** ✅
