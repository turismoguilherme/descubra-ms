# 🎯 Proposta: Estrutura Mais Limpa e Fluida

## 📊 Análise: O que torna o site de referência mais "natural"?

### **Características do Site de Referência:**

1. **Menu Simplificado:**
   - Apenas 6-7 itens principais
   - 2 dropdowns (Experiências, Polos)
   - Links diretos para páginas importantes
   - Botão CTA destacado ("Monte seu Roteiro")

2. **Home Organizada:**
   - Hero com vídeo/imagem impactante
   - Seções temáticas claras (não redundantes)
   - Conteúdo "exposto" (menos dependência de menus)
   - Fluxo natural de navegação

3. **Visual "Humano":**
   - Menos elementos técnicos
   - Mais foco em experiências
   - Linguagem mais natural
   - Menos "robótico"

---

## 🎯 PROPOSTA DE REORGANIZAÇÃO

### **1. Menu Simplificado** ⭐

**Estrutura Proposta:**
```
[Logo]  Regiões ▼  Experiências  Eventos  Parceiros  [🔍] [🌐] [Login]
                                                    [Monte seu Roteiro]
```

**Itens do Menu:**
- **Regiões Turísticas** (dropdown) - 4 principais + "Ver todas"
- **Experiências** (link simples) - vai para página de experiências
- **Eventos** (link simples)
- **Parceiros** (link simples)
- **Botão CTA:** "Monte seu Roteiro" (quando logado) ou "Cadastrar" (quando não logado)

**Remover do Menu Principal:**
- ❌ Mapa Turístico (mover para footer ou dentro de "Regiões")
- ❌ Destinos (redundante com Regiões)
- ❌ Sobre (mover para footer)
- ❌ Guatá IA (mover para botão no hero ou footer)
- ❌ Passaporte Digital (mover para botão no hero)

**Resultado:** Menu com apenas 4-5 itens principais (muito mais limpo!)

---

### **2. Home Reorganizada** ⭐

**Estrutura Proposta:**
```
┌─────────────────────────────────────────────────────────────┐
│  HERO (com vídeo de fundo editável via admin)               │
├─────────────────────────────────────────────────────────────┤
│  REGIÕES TURÍSTICAS EM DESTAQUE (4-6 principais)            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                       │
│  │ Card │ │ Card │ │ Card │ │ Card │                       │
│  │Grande│ │Grande│ │Grande│ │Grande│                       │
│  └──────┘ └──────┘ └──────┘ └──────┘                       │
├─────────────────────────────────────────────────────────────┤
│  EXPERIÊNCIAS (3 cards: Aventura, Cultura, Natureza)         │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │ Card │ │ Card │ │ Card │                                │
│  └──────┘ └──────┘ └──────┘                                │
├─────────────────────────────────────────────────────────────┤
│  CATs (se houver)                                            │
└─────────────────────────────────────────────────────────────┘
```

**Mudanças:**
- ✅ Transformar "Destinos em Destaque" → "Regiões Turísticas em Destaque"
- ✅ Remover "Polos Turísticos" (redundante)
- ✅ Remover "Regiões Turísticas" separada (redundante)
- ✅ Manter "Experiências" (simplificada)
- ✅ Manter "CATs" (se houver)

**Resultado:** Home com apenas 3-4 seções (muito mais limpa!)

---

### **3. Vídeo de Fundo Editável via Admin** ⭐

**Implementação:**
- ✅ Adicionar campo `ms_hero_video_url` no sistema de conteúdo editável
- ✅ Suportar URLs de YouTube, Vimeo ou arquivo direto
- ✅ Fallback para gradiente se vídeo não disponível
- ✅ Vídeo: autoplay, loop, muted, sem som

**Onde editar:**
- Admin → Conteúdo → Homepage → Hero → Vídeo de Fundo

---

### **4. Menu Mais "Humano"** ⭐

**Antes (técnico):**
- Mapa Turístico
- Destinos
- Eventos
- Parceiros
- Sobre
- Guatá IA
- Passaporte Digital

**Depois (mais natural):**
- Regiões Turísticas
- Experiências
- Eventos
- Parceiros
- [Monte seu Roteiro] (CTA)

**Resultado:** Menu mais simples e direto!

---

## 📋 ESTRUTURA FINAL PROPOSTA

### **Menu:**
```
[Logo]  Regiões ▼  Experiências  Eventos  Parceiros  [🔍] [🌐] [Login]
                                                    [Monte seu Roteiro]
```

### **Home:**
1. Hero (com vídeo editável)
2. Regiões Turísticas em Destaque (4-6 principais)
3. Experiências (3 cards)
4. CATs (se houver)

### **Footer:**
- Links secundários (Sobre, Mapa Turístico, Guatá, Passaporte, etc.)
- Newsletter
- Informações completas

---

## ❓ PRECISO DA SUA APROVAÇÃO

### **1. Menu Simplificado:**
- [ ] Aprovar estrutura: Regiões ▼, Experiências, Eventos, Parceiros
- [ ] Remover: Mapa Turístico, Destinos, Sobre, Guatá, Passaporte do menu principal
- [ ] Mover links removidos para footer

### **2. Home Reorganizada:**
- [ ] Transformar "Destinos em Destaque" → "Regiões Turísticas em Destaque"
- [ ] Remover "Polos Turísticos" (redundante)
- [ ] Remover "Regiões Turísticas" separada (redundante)
- [ ] Manter apenas: Hero, Regiões em Destaque, Experiências, CATs

### **3. Vídeo de Fundo:**
- [ ] Adicionar campo editável via admin
- [ ] Suportar URL de vídeo (YouTube, Vimeo ou arquivo)
- [ ] Fallback para gradiente

### **4. Botão CTA no Menu:**
- [ ] Adicionar "Monte seu Roteiro" quando logado
- [ ] Ou "Cadastrar" quando não logado

---

## 🎯 RESULTADO ESPERADO

Após as mudanças:
- ✅ Menu com apenas 4-5 itens (muito mais limpo)
- ✅ Home com 3-4 seções (sem redundância)
- ✅ Vídeo editável via admin
- ✅ Visual mais "humano" e menos "técnico"
- ✅ Fluxo mais natural e fluido
- ✅ Menos "feito por IA"

---

**O que você acha dessa proposta? Posso implementar?**













