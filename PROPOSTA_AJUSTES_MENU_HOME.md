# 📋 Proposta de Ajustes: Menu e Home

## 🎯 Pontos Identificados

### 1. **Roteiros Personalizados** ✅
**Status:** Está presente no menu quando usuário está logado
- ✅ Localizado em `authenticatedNavigationItems` no BrandContext
- ✅ Rota: `/descubrams/roteiros-personalizados`
- ✅ **Ação:** Manter como está (não remover)

---

### 2. **Redundância: Destinos em Destaque vs Regiões Turísticas** ⚠️

**Problema Identificado:**
- Atualmente temos:
  - "Destinos em Destaque" - mostra destinos individuais (Bonito, Pantanal, etc.)
  - "Polos Turísticos" - mostra 4 primeiras regiões
  - "Regiões Turísticas" - mostra outras 6 regiões

**Sugestão do Usuário:**
- Em vez de mostrar destinos individuais, mostrar regiões turísticas
- Isso faz sentido porque:
  - ✅ Menos redundância
  - ✅ Mais foco nas regiões (que é o conceito principal)
  - ✅ Melhor organização

**Proposta:**
- **Opção A:** Transformar "Destinos em Destaque" em "Regiões em Destaque"
  - Mostrar as principais regiões turísticas
  - Cards maiores e mais impactantes
  - Remover seção "Polos Turísticos" (redundante)
  - Manter apenas "Regiões Turísticas" para as outras

- **Opção B:** Remover "Destinos em Destaque" completamente
  - Manter apenas "Polos Turísticos" e "Regiões Turísticas"
  - Mas ainda há redundância entre essas duas

- **Opção C (Recomendada):** Unificar em uma única seção
  - Transformar "Destinos em Destaque" → "Regiões Turísticas em Destaque"
  - Mostrar as principais 4-6 regiões com cards grandes
  - Remover seções "Polos Turísticos" e "Regiões Turísticas" separadas
  - Ou manter apenas uma seção unificada de "Regiões Turísticas"

**Qual você prefere?**

---

### 3. **Menu com Muita Informação** ⚠️

**Problema Identificado:**
- Dropdown "Experiências" com 4 itens
- Dropdown "Regiões Turísticas" com 6+ itens
- Links normais (Mapa Turístico, Destinos, Eventos, Parceiros, Sobre, Guatá, Passaporte)
- Links autenticados (Roteiros Personalizados)

**Total:** Muitos itens no menu

**Proposta de Simplificação:**

**Opção A:** Simplificar Dropdowns
- Dropdown "Experiências" → Manter apenas 3 itens principais
- Dropdown "Regiões Turísticas" → Mostrar apenas 4 principais + link "Ver todas"

**Opção B:** Remover um Dropdown
- Remover dropdown "Experiências" (transformar em link simples)
- Manter apenas dropdown "Regiões Turísticas"

**Opção C:** Reorganizar Menu
- Menu principal: Experiências, Regiões, Eventos, Parceiros
- Dropdown "Regiões" com principais regiões
- Links secundários no footer

**Qual você prefere?**

---

### 4. **Vídeo de Fundo no Hero** 🎥

**Proposta:**
- Adicionar vídeo de fundo no hero (como no site de referência)
- Manter gradiente como fallback
- Vídeo deve ser:
  - Autoplay
  - Loop
  - Muted
  - Sem som (para não incomodar)
  - Overlay escuro para contraste do texto

**Perguntas:**
1. Você tem um vídeo específico para usar?
2. Ou prefere que eu use um vídeo placeholder/stock?
3. Qual duração preferida? (curto, médio, longo)
4. Tema do vídeo? (natureza, Pantanal, Bonito, geral do MS)

---

## 📊 Estrutura Atual vs Proposta

### **Estrutura Atual:**
```
Home:
├─ Hero
├─ Destinos em Destaque (4 destinos individuais)
├─ Experiências Completas
├─ Polos Turísticos (4 regiões)
├─ Regiões Turísticas (6 regiões)
└─ CATs

Menu:
├─ Experiências ▼ (4 itens)
├─ Regiões Turísticas ▼ (6+ itens)
├─ Mapa Turístico
├─ Destinos
├─ Eventos
├─ Parceiros
├─ Sobre
├─ Guatá IA
├─ Passaporte Digital
└─ Roteiros Personalizados (quando logado)
```

### **Estrutura Proposta (Opção Recomendada):**
```
Home:
├─ Hero (com vídeo de fundo)
├─ Regiões Turísticas em Destaque (4-6 principais regiões)
├─ Experiências Completas
└─ CATs

Menu (Simplificado):
├─ Regiões Turísticas ▼ (4 principais + "Ver todas")
├─ Experiências (link simples ou dropdown menor)
├─ Eventos
├─ Parceiros
├─ Mapa Turístico
└─ [Login/User Menu]
  └─ Roteiros Personalizados (quando logado)
```

---

## ❓ Preciso da Sua Aprovação

### **1. Destinos em Destaque:**
- [ ] Transformar em "Regiões Turísticas em Destaque"?
- [ ] Remover completamente?
- [ ] Outra opção?

### **2. Redundância:**
- [ ] Remover seção "Polos Turísticos"?
- [ ] Remover seção "Regiões Turísticas" separada?
- [ ] Unificar tudo em uma única seção?

### **3. Menu:**
- [ ] Simplificar dropdown "Experiências"?
- [ ] Simplificar dropdown "Regiões Turísticas"?
- [ ] Remover um dos dropdowns?
- [ ] Outra reorganização?

### **4. Vídeo de Fundo:**
- [ ] Adicionar vídeo de fundo no hero?
- [ ] Você tem vídeo específico ou usar placeholder?
- [ ] Tema preferido?

---

## 🎯 Recomendação Final

**Minha sugestão:**
1. ✅ **Transformar "Destinos em Destaque" → "Regiões Turísticas em Destaque"**
   - Mostrar 4-6 principais regiões com cards grandes
   
2. ✅ **Remover seções "Polos Turísticos" e "Regiões Turísticas" separadas**
   - Evitar redundância
   
3. ✅ **Simplificar menu:**
   - Dropdown "Regiões Turísticas" com apenas 4 principais + "Ver todas"
   - Dropdown "Experiências" com apenas 3 itens principais
   - Ou transformar "Experiências" em link simples
   
4. ✅ **Adicionar vídeo de fundo no hero**
   - Usar vídeo placeholder de natureza/Pantanal
   - Com overlay escuro para contraste

**O que você acha dessa proposta?**













