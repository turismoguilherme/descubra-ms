# 🧪 Guia de Teste: Integração Comunidade → Guatá IA

## 🎯 **Como Testar a Integração**

### **📝 Pré-requisitos:**
- ✅ Sistema rodando (`npm run dev`)
- ✅ Usuário logado como gestor
- ✅ Console do navegador aberto (F12)

---

## 🔬 **Teste 1: Criar e Aprovar Sugestão**

### **Passo 1: Criar Sugestão da Comunidade**
1. Acesse: `/ms/comunidade`
2. Clique em "Nova Sugestão"
3. Preencha:
   ```
   Título: "Restaurante do Zé - Melhor pacu de MS"
   Descrição: "Restaurante familiar com o melhor pacu assado da região. Ambiente acolhedor e preços justos."
   Localização: "Campo Grande"
   Categoria: "Gastronomia"
   ```
4. Envie a sugestão

### **Passo 2: Aprovar no Dashboard Admin**
1. Acesse: `/ms/admin` 
2. Vá em aba "Comunidade"
3. Encontre a sugestão criada
4. Clique em "Aprovar"
5. **Observe no console:**
   ```
   ✨ Sugestão "Restaurante do Zé - Melhor pacu de MS" integrada com sucesso ao Guatá IA
   ```

### **Passo 3: Verificar Integração no Guatá**
1. Acesse: `/ms/guata`
2. Pergunte: **"Me recomende restaurantes em Campo Grande"**
3. **Resultado esperado:** O Guatá deve mencionar a sugestão da comunidade

---

## 🔬 **Teste 2: Verificar Carregamento na Inicialização**

### **Passo 1: Recarregar Página**
1. Recarregue o navegador (F5)
2. Acesse: `/ms/guata`
3. **Observe no console:**
   ```
   🚀 Inicializando Super IA Turística...
   ✨ X sugestões da comunidade carregadas na base de conhecimento
   ✅ Super IA Turística inicializada com Y itens
   ```

### **Passo 2: Testar Conhecimento Persistente**
1. Pergunte ao Guatá: **"O que você sabe sobre restaurantes em Campo Grande?"**
2. **Resultado esperado:** Deve incluir sugestões da comunidade

---

## 🔬 **Teste 3: Categorização Automática**

### **Criar sugestões com diferentes categorias:**

#### **Teste 3.1: Hotel**
```
Título: "Pousada da Serra"
Descrição: "Hospedagem aconchegante com vista para a serra"
```
**Categoria esperada:** `hotel`

#### **Teste 3.2: Evento**
```
Título: "Festival de Inverno de Bonito"
Descrição: "Evento anual com shows e atividades culturais"
```
**Categoria esperada:** `event`

#### **Teste 3.3: Serviço**
```
Título: "Transporte Pantanal Express"
Descrição: "Serviço de transporte para atrações do Pantanal"
```
**Categoria esperada:** `service`

---

## 🔬 **Teste 4: Sistema de Tags e Coordenadas**

### **Criar sugestão específica:**
```
Título: "Trilha da Natureza em Bonito"
Descrição: "Trilha ecológica com cachoeiras e vida selvagem para famílias"
```

### **Verificar no console:**
```typescript
// Tags esperadas:
["comunidade", "sugestão local", "natureza", "ecoturismo", "família", "entretenimento"]

// Coordenadas esperadas (Bonito):
{ lat: -21.1293, lng: -56.4891 }
```

---

## 🔬 **Teste 5: Sistema de Avaliação por Votos**

### **Passo 1: Votar em Sugestão**
1. Acesse lista de sugestões da comunidade
2. Vote em uma sugestão várias vezes (com usuários diferentes se possível)
3. Aprove a sugestão

### **Passo 2: Verificar Rating**
- **Fórmula:** `rating = 3.0 + (votos / 10)`
- **Exemplo:** 5 votos = rating 3.5 ⭐
- **Exemplo:** 15 votos = rating 4.5 ⭐

---

## 🔬 **Teste 6: Logs de Auditoria**

### **Verificar logs no banco:**
1. Acesse Supabase
2. Tabela: `community_moderation_log`
3. **Busque por:** `action = 'knowledge_integrated'`
4. **Deve conter:** Log da integração automática

---

## ✅ **Checklist de Validação**

- [ ] ✨ Sugestão aprovada gera log de integração
- [ ] 🧠 Guatá carrega sugestões na inicialização  
- [ ] 🎯 Categorização automática funciona
- [ ] 📍 Coordenadas são estimadas corretamente
- [ ] 🏷️ Tags são geradas automaticamente
- [ ] ⭐ Rating baseado em votos funciona
- [ ] 💬 Guatá usa sugestões nas recomendações
- [ ] 📊 Logs de auditoria são criados
- [ ] 🔄 Integração funciona em tempo real
- [ ] 🛡️ Erros não impedem aprovação da sugestão

---

## 🐛 **Possíveis Problemas e Soluções**

### **Erro: "Sugestão não aparece no Guatá"**
**Solução:** Verificar se o status é `approved` e recarregar o Guatá

### **Erro: "Console não mostra logs"**
**Solução:** Verificar se está na aba correta e limpar cache

### **Erro: "Categorização incorreta"**
**Solução:** Ajustar palavras-chave no `CommunityKnowledgeIntegration.ts`

### **Erro: "Coordenadas erradas"**
**Solução:** Verificar se a cidade está listada no `estimateCoordinates()`

---

## 🎯 **Resultado Final Esperado**

Após todos os testes, o Guatá deve:
- ✅ **Conhecer** todas as sugestões aprovadas da comunidade
- ✅ **Recomendar** estas sugestões de forma contextual
- ✅ **Destacar** que são "dicas da comunidade local"
- ✅ **Integrar** automaticamente novas aprovações

**🚀 A integração deve funcionar de forma transparente e automática!** 