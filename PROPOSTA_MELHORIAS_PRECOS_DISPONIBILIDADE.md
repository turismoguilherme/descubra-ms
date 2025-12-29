# Proposta de Melhorias: Preços, Disponibilidade e Políticas

## 1. Qual a melhor opção para o layout?

### ✅ **Opção A: Wizard em Modal (RECOMENDADA)**

**Fluxo:**
1. Clique em "Adicionar Preço" → Abre modal com 3 etapas
2. **Etapa 1: Informações do Preço** (obrigatório)
   - Nome, tipo, valores, descrição
   - Campo para upload de foto(s) do produto
3. **Etapa 2: Disponibilidade** (opcional, mas sugerido)
   - Tooltip: "Configure quais datas estão disponíveis. Se não configurar, todas as datas estarão disponíveis."
   - Calendário mensal inline
   - Botão "Pular" ou "Configurar Depois"
4. **Etapa 3: Política de Cancelamento** (opcional)
   - Mostra política padrão
   - Opção: "Usar padrão" ou "Personalizar"
   - Tooltip: "Se não personalizar, será usada a política padrão da plataforma."

**Vantagens:**
- ✅ Fluxo guiado e intuitivo
- ✅ Disponibilidade como próximo passo natural
- ✅ Tudo em um lugar
- ✅ Pode pular etapas opcionais
- ✅ Não polui a tela principal

---

## 2. Parceiros com vários produtos - Como funcionar?

### **Estrutura Proposta:**

**Na aba "Preços":**
- Lista de produtos em cards (grid 2 colunas)
- Cada card mostra:
  - **Foto principal** (se houver)
  - Nome do produto
  - Tipo e preço
  - Badges: "Ativo", "Disponibilidade configurada", "Política personalizada"
  - Botões: "Editar", "Gerenciar Disponibilidade", "Duplicar", "Desativar"

**Ao clicar em um produto:**
- Abre modal/wizard com as mesmas 3 etapas
- Permite editar tudo de uma vez

**Filtros e busca:**
- Busca por nome
- Filtro por tipo (hotel, restaurante, etc.)
- Filtro por status (ativo/inativo)
- Ordenação (nome, preço, data)

---

## 3. Fotos dos produtos - Como implementar?

### **Opção 1: Foto única (simples)**
- Campo `image_url` na tabela `partner_pricing`
- Upload de 1 foto por produto
- Usar bucket `partner-images` existente

### **Opção 2: Galeria de fotos (recomendada)**
- Campo `gallery_images TEXT[]` na tabela `partner_pricing`
- Upload de múltiplas fotos (máximo 5-10)
- Primeira foto = foto principal
- Galeria completa visível no card

**Recomendação: Opção 2 (Galeria)**

**Implementação:**
1. Adicionar campo `gallery_images TEXT[]` na tabela
2. Upload múltiplo no wizard (etapa 1)
3. Preview das fotos no card do produto
4. Lightbox ao clicar na foto

---

## 4. Política de Cancelamento no Dashboard

### **Nova Aba: "Políticas"**

**Estrutura:**
- **Seção 1: Política Padrão**
  - Mostra política padrão da plataforma (somente leitura)
  - Informações: 7+ dias = 100%, 1-2 dias = 50%, 0 dias = 0%

- **Seção 2: Minha Política Personalizada**
  - Se não tem política personalizada:
    - Botão "Criar Política Personalizada"
    - Tooltip: "Crie uma política personalizada para substituir a padrão"
  - Se tem política personalizada:
    - Mostra política atual
    - Botão "Editar"
    - Botão "Usar Política Padrão" (remove personalização)

- **Seção 3: Histórico de Cancelamentos** (opcional)
  - Lista de cancelamentos recentes
  - Mostra reembolsos processados

---

## 5. Tooltips e Ajuda Contextual

### **Onde adicionar (?) com tooltips:**

1. **"Adicionar Preço"**
   - "Crie um novo produto/serviço com preço, disponibilidade e política de cancelamento"

2. **"Disponibilidade" (no wizard)**
   - "Configure quais datas estão disponíveis e quantas vagas há. Se não configurar, todas as datas estarão disponíveis sem limite de vagas."

3. **"Política de Cancelamento" (no wizard)**
   - "Defina as regras de reembolso para este produto. Se não personalizar, será usada a política padrão da plataforma."

4. **Badge "Disponibilidade configurada"**
   - "Este produto tem disponibilidade configurada para datas específicas"

5. **Badge "Política personalizada"**
   - "Este produto usa uma política de cancelamento personalizada"

---

## Resumo da Implementação

### **Mudanças no Banco de Dados:**
1. Adicionar `gallery_images TEXT[]` em `partner_pricing`
2. (Já existe) `partner_cancellation_policies` para políticas personalizadas

### **Mudanças na Interface:**
1. Transformar formulário inline em **Modal Wizard** (3 etapas)
2. Adicionar **upload de fotos** na etapa 1
3. Adicionar **calendário de disponibilidade** na etapa 2
4. Adicionar **configuração de política** na etapa 3
5. Melhorar **cards de produtos** com fotos e badges
6. Adicionar **aba "Políticas"** no dashboard
7. Adicionar **tooltips (?) em pontos estratégicos**

### **Ordem de Implementação:**
1. ✅ Banco de dados (adicionar campo gallery_images)
2. ✅ Modal Wizard (estrutura básica)
3. ✅ Upload de fotos (etapa 1)
4. ✅ Calendário de disponibilidade (etapa 2)
5. ✅ Política de cancelamento (etapa 3)
6. ✅ Melhorar cards de produtos
7. ✅ Aba "Políticas" no dashboard
8. ✅ Tooltips e ajuda contextual

---

## Perguntas para Confirmar:

1. **Fotos:** Galeria (múltiplas) ou foto única?
2. **Limite de fotos:** Quantas fotos por produto? (sugestão: 5-10)
3. **Política:** Cada produto pode ter política diferente, ou política única por parceiro?
4. **Disponibilidade:** Obrigatória ou opcional? (sugestão: opcional, mas recomendada)

