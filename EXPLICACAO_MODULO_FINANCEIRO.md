# 💰 Como Funciona o Módulo Financeiro

## 📊 Visão Geral

O módulo financeiro gerencia **receitas**, **despesas**, **salários** e **relatórios** da plataforma.

---

## 🎯 1. RECEITAS (Revenue)

### O que é?
Dinheiro que **entra** na empresa.

### Exemplos práticos:
- 💳 **Assinatura ViaJAR**: Cliente paga R$ 2.500/mês → Receita de R$ 2.500
- ⭐ **Evento em Destaque**: Organizador paga R$ 499,90 para destacar evento → Receita de R$ 499,90
- 🤝 **Parceiro Premium**: Parceiro paga mensalidade → Receita recorrente

### Como funciona:
1. Receitas são registradas automaticamente quando:
   - Cliente paga assinatura (Stripe)
   - Evento é pago para destaque
   - Parceiro faz pagamento

2. Você pode **filtrar** por:
   - Fonte: ViaJAR, Eventos, Parceiros, Outros
   - Período: Data inicial e final

3. **Exportar** para CSV para análise

---

## 💸 2. DESPESAS (Expenses)

### O que é?
Dinheiro que **sai** da empresa (contas a pagar).

### Exemplos práticos:
- 🖥️ **Servidores**: R$ 500/mês (AWS, Vercel) → Despesa mensal recorrente
- 📢 **Marketing**: R$ 1.000 (Google Ads) → Despesa única
- 🏢 **Infraestrutura**: R$ 300 (domínios, SSL) → Despesa anual
- 💼 **Impostos**: R$ 2.000 (DAS, IR) → Despesa mensal
- 👥 **Salários**: R$ 15.000 (folha de pagamento) → Despesa mensal

### Como adicionar uma despesa:

1. Clique em **"+ Nova Despesa"**
2. Preencha:
   - **Descrição**: "Hospedagem AWS - Dezembro"
   - **Categoria**: Selecione (Servidores, Marketing, etc.)
   - **Valor**: R$ 500,00
   - **Data de Vencimento**: 10/12/2025
   - **Recorrência**: 
     - "Única vez" → Paga uma vez só
     - "Mensal" → Repete todo mês automaticamente
     - "Anual" → Repete todo ano

3. Clique em **"Salvar"**

### Status das despesas:
- ⏳ **Pending** (Pendente) → Ainda não foi paga
- ✅ **Paid** (Paga) → Já foi paga (clique no ✓ para marcar como paga)
- ❌ **Cancelled** (Cancelada) → Foi cancelada
- 🔴 **Overdue** (Vencida) → Passou da data de vencimento

---

## 💵 3. SALÁRIOS (Salaries)

### O que é?
**Registro** dos pagamentos de salários dos funcionários da empresa.

⚠️ **IMPORTANTE**: O sistema **NÃO faz o pagamento automaticamente**. Você precisa:
1. **Fazer o pagamento manualmente** (transferência bancária, PIX, etc.)
2. **Registrar no sistema** para controle e relatórios

### Exemplos práticos:
- 👨‍💼 **João Silva**: R$ 5.000/mês (Desenvolvedor)
- 👩‍💼 **Maria Santos**: R$ 4.500/mês (Designer)
- 👨‍💼 **Pedro Costa**: R$ 6.000/mês (Gerente)

### Como registrar um pagamento:

**Passo 1: Faça o pagamento real**
- Faça a transferência bancária ou PIX para o funcionário
- Guarde o comprovante

**Passo 2: Registre no sistema**
1. Clique em **"Registrar Pagamento"**
2. Preencha:
   - **Funcionário**: Selecione da lista
   - **Mês**: Dezembro
   - **Ano**: 2025
   - **Salário Base**: R$ 5.000,00
   - **Bônus** (opcional): R$ 500,00
   - **Descontos** (opcional): R$ 200,00 (INSS, etc.)
   - **Data de Pagamento**: 05/12/2025 (data que você realmente pagou)
   - **Observações**: "Pagamento referente a dezembro/2025"

3. O sistema calcula automaticamente:
   - **Total** = Salário Base + Bônus - Descontos
   - Exemplo: R$ 5.000 + R$ 500 - R$ 200 = **R$ 5.300**

**Resumo**: Você paga → Sistema registra → Relatórios são gerados

---

## 📈 4. RELATÓRIOS (Reports)

### O que é?
Análise e exportação dos dados financeiros.

### Tipos de relatórios:

#### 📊 **DRE (Demonstração do Resultado do Exercício)**
- Mostra: Receitas - Despesas = Lucro
- Exemplo:
  ```
  Receitas: R$ 50.000
  Despesas: R$ 30.000
  Salários: R$ 15.000
  Impostos: R$ 5.000
  ─────────────────────
  Lucro Líquido: R$ 0
  ```

#### 💰 **Fluxo de Caixa**
- Mostra: Entradas e saídas de dinheiro ao longo do tempo
- Exemplo:
  ```
  Janeiro: +R$ 10.000 (entrada) - R$ 8.000 (saída) = +R$ 2.000
  Fevereiro: +R$ 12.000 - R$ 9.000 = +R$ 3.000
  ```

#### 📉 **Lucro Mensal/Anual**
- Mostra: Evolução do lucro ao longo do tempo
- Gráfico mostrando se está crescendo ou diminuindo

### Como usar:
1. Selecione o **período** (Semana, Mês, Trimestre, Ano)
2. Clique em **"Gerar DRE"**, **"Gerar Fluxo de Caixa"** ou **"Gerar Relatório de Lucro"**
3. Exporte em **CSV** ou **JSON** para análise externa

---

## 🏦 5. CONTAS BANCÁRIAS (Bank Accounts)

### O que é?
Contas bancárias da empresa para controle.

### Exemplos práticos:
- 🏦 **Conta Principal**: Banco do Brasil - Ag: 1234-5, Conta: 12345-6
- 💰 **Poupança**: Caixa Econômica - Para reserva de emergência
- 📈 **Investimento**: Nubank - Para aplicações

### Como adicionar uma conta:

1. Vá em **Financeiro → Contas Bancárias**
2. Clique em **"+ Nova Conta"**
3. Preencha:
   - **Nome da Conta**: "Conta Principal"
   - **Banco**: "Banco do Brasil"
   - **Agência**: "1234-5"
   - **Número da Conta**: "12345-6"
   - **Tipo**: 
     - Conta Corrente (para movimentação diária)
     - Poupança (para guardar dinheiro)
     - Investimento (para aplicações)
   - **Saldo Atual**: R$ 50.000,00
   - **Cor**: Escolha uma cor para identificar (azul, verde, etc.)

4. Clique em **"Salvar"**

### Para que serve?
- Controlar saldo de cada conta
- Ver movimentações
- Fazer conciliação bancária

---

## 📋 RESUMO PRÁTICO

### Fluxo de trabalho típico:

**1. Início do Mês:**
- ✅ Registrar despesas recorrentes (servidores, marketing)
- ✅ Verificar receitas do mês anterior

**2. Durante o Mês:**
- ✅ Marcar despesas como pagas quando pagar
- ✅ Registrar novas despesas que surgirem
- ✅ Acompanhar receitas que entram

**3. Final do Mês:**
- ✅ **Pagar** os salários (transferência bancária/PIX)
- ✅ **Registrar** os pagamentos no sistema
- ✅ Gerar relatórios (DRE, Fluxo de Caixa)
- ✅ Exportar dados para contador

### Exemplo real:

**Janeiro 2025:**
- 📈 **Receitas**: R$ 25.000
  - ViaJAR: R$ 20.000 (8 clientes × R$ 2.500)
  - Eventos: R$ 3.000 (6 eventos em destaque)
  - Parceiros: R$ 2.000

- 📉 **Despesas**: R$ 18.000
  - Servidores: R$ 500
  - Marketing: R$ 2.000
  - Salários: R$ 15.000
  - Impostos: R$ 500

- 💰 **Lucro**: R$ 7.000

---

## ⚠️ PROBLEMAS CORRIGIDOS

✅ **Selects não apareciam** → Corrigido (z-index aumentado)
✅ **Categoria não funcionava** → Corrigido
✅ **Recorrência não mostrava opções** → Corrigido
✅ **Salários não carregavam funcionários** → Corrigido
✅ **Contas bancárias não salvavam** → Corrigido

---

## 🎯 DICAS

1. **Use recorrência** para despesas que se repetem (servidores, marketing mensal)
2. **Marque como paga** assim que pagar uma despesa
3. **Exporte relatórios** mensalmente para análise
4. **Mantenha saldos atualizados** nas contas bancárias
5. **Pague e registre salários** sempre no mesmo dia do mês (o sistema não paga automaticamente!)
6. **Registre logo após pagar** para manter os relatórios atualizados

