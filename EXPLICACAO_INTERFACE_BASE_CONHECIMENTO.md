# 📋 Explicação da Interface - Base de Conhecimento e Prompts

## ❓ SUAS DÚVIDAS

### 1. **Onde a base de conhecimento deve aparecer no menu?**

**Opções:**

#### **Opção A: Dentro de "IA Administradora" (atual)**
```
📱 Menu Admin
├── Dashboard
├── ViajARTur
├── Descubra MS
├── Financeiro
├── Sistema
└── 🤖 IA Administradora
    ├── Chat
    ├── Sugestões
    ├── Ações Pendentes
    ├── 📚 Base de Conhecimento  ← AQUI
    └── 📝 Editor de Prompts     ← AQUI
```

**Vantagens:** Tudo relacionado a IA fica junto  
**Desvantagens:** Pode não ser óbvio para quem procura

#### **Opção B: Dentro de "Descubra MS"**
```
📱 Menu Admin
└── Descubra MS
    ├── Homepage
    ├── Destinos
    ├── Eventos
    ├── Parceiros
    ├── Passaporte Digital
    ├── Conteúdo
    ├── Usuários
    ├── 📚 Base de Conhecimento (Guatá)  ← AQUI
    └── Configurações
```

**Vantagens:** Base do Guatá fica junto com Descubra MS  
**Desvantagens:** E o Koda? Ficaria separado?

#### **Opção C: Dentro de "Sistema"**
```
📱 Menu Admin
└── Sistema
    ├── Fallback
    ├── Monitoramento
    ├── Auditoria
    ├── 📚 Base de Conhecimento  ← AQUI
    └── 📝 Editor de Prompts     ← AQUI
```

**Vantagens:** Configurações técnicas ficam juntas  
**Desvantagens:** Pode parecer muito técnico

**Qual você prefere?** 🤔

---

### 2. **Onde aparecem os arquivos que fiz upload?**

**PROBLEMA ATUAL:**
Quando você faz upload de um arquivo (ex: `informacoes-turismo.csv`), o sistema:
1. Processa o arquivo
2. Extrai as informações
3. Cria itens na base de conhecimento
4. **MAS:** O arquivo original "some" - você não vê mais ele

**SOLUÇÃO PROPOSTA:**

#### **Opção A: Mostrar arquivo original em cada item**
```
📋 Lista de Itens:
└── 📄 "O que fazer em Bonito?"
    ├── Chatbot: Guatá
    ├── Categoria: Destinos
    ├── 📎 Arquivo: informacoes-turismo.csv  ← Mostra aqui
    └── [Editar] [Excluir]
```

**Vantagem:** Você vê de onde veio cada item  
**Desvantagem:** Se o arquivo tinha 100 itens, aparece 100x

#### **Opção B: Aba separada "Arquivos Enviados"**
```
📱 Abas:
├── 📋 Lista (itens da base)
├── 📊 Estatísticas
└── 📁 Arquivos Enviados  ← NOVA ABA
    ├── 📄 informacoes-turismo.csv
    │   ├── Enviado em: 01/02/2026
    │   ├── Itens criados: 45
    │   └── [Ver itens] [Reenviar] [Excluir]
    └── 📄 destinos-bonito.txt
        ├── Enviado em: 02/02/2026
        ├── Itens criados: 12
        └── [Ver itens] [Reenviar] [Excluir]
```

**Vantagem:** Você vê todos os arquivos e pode gerenciar  
**Desvantagem:** Precisa criar tabela para armazenar arquivos

#### **Opção C: Mostrar arquivo + itens relacionados**
```
📁 Arquivos Enviados:
└── 📄 informacoes-turismo.csv
    ├── 📊 45 itens criados
    ├── 📋 Ver itens criados → [Abrir lista filtrada]
    └── [Reenviar] [Excluir arquivo e itens]
```

**Qual você prefere?** 🤔

---

### 3. **O que é "Lista" e "Estatísticas"?**

#### **Aba "Lista" (atual):**
```
📋 LISTA
├── Filtros (Chatbot, Categoria, Status)
├── Busca
└── Cards com cada item:
    └── "O que fazer em Bonito?"
        ├── Chatbot: Guatá
        ├── Categoria: Destinos
        ├── Usado: 1523x
        └── [Editar] [Excluir]
```

**É aqui que você:**
- ✅ Vê todos os itens da base de conhecimento
- ✅ Edita itens
- ✅ Exclui itens
- ✅ Filtra e busca

#### **Aba "Estatísticas" (atual):**
```
📊 ESTATÍSTICAS
├── Total de Itens: 234
├── Por Chatbot:
│   ├── Guatá: 156
│   ├── Koda: 78
│   └── Ambos: 0
└── Mais Usados:
    ├── Documentação: 2341x
    ├── Bonito: 1523x
    └── ...
```

**É aqui que você:**
- ✅ Vê quantos itens tem no total
- ✅ Vê distribuição por chatbot
- ✅ Vê quais são mais usados

**PROBLEMA:** Talvez você não precise dessa aba? Ou prefere que seja mais simples?

**Opções:**
- **A) Manter como está** (Lista + Estatísticas)
- **B) Só Lista** (remover Estatísticas)
- **C) Lista + Arquivos** (trocar Estatísticas por Arquivos Enviados)

**Qual você prefere?** 🤔

---

## 🎯 MINHA RECOMENDAÇÃO

### **1. Menu:**
**Opção A** - Dentro de "IA Administradora" faz sentido, mas podemos adicionar também em "Descubra MS" se você quiser acesso rápido.

### **2. Arquivos:**
**Opção B** - Criar aba "Arquivos Enviados" para você poder:
- Ver todos os arquivos enviados
- Ver quantos itens cada arquivo criou
- Reenviar arquivo (atualizar)
- Excluir arquivo e todos os itens relacionados

### **3. Abas:**
**Opção C** - Trocar "Estatísticas" por "Arquivos Enviados", mas manter estatísticas básicas no topo da página.

---

## ❓ O QUE VOCÊ PREFERE?

Por favor, me diga:

1. **Menu:** Onde você quer que apareça? (A, B ou C)
2. **Arquivos:** Como você quer gerenciar? (A, B ou C)
3. **Abas:** O que você quer ver? (A, B ou C)

Depois eu implemento exatamente como você quer! 🚀

