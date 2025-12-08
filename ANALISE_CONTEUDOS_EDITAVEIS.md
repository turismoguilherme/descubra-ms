# 📋 ANÁLISE: Conteúdos que Precisam Ser Editáveis

## ⚠️ PROBLEMA IDENTIFICADO

Os componentes do site estão com textos **HARDCODED** (escritos diretamente no código), mas o editor salva no banco de dados. **Os componentes NÃO estão lendo do banco ainda!**

---

## 🔍 DESCUBRA MATO GROSSO DO SUL

### ✅ O que JÁ está editável (salvo no banco):
- Nada ainda - precisa implementar a leitura do banco nos componentes

### 📝 O que PRECISA ser editável (atualmente hardcoded):

#### 1. **Homepage - Hero Principal** (`src/components/home/Hero.tsx`)
- ❌ Título: "Descubra Mato Grosso do Sul" (linha 12)
- ❌ Subtítulo: "Explore destinos incríveis..." (linha 15)
- ❌ Botão 1: "Explorar Destinos" (linha 21)
- ❌ Botão 2: "Ver Galerias" (linha 25)
- ❌ Botão 3: "Eventos" (linha 29)

#### 2. **Homepage - Seção de Descrição** (`src/components/home/TourismDescription.tsx`)
- ❌ Título: "Descubra Mato Grosso do Sul – Viva essa experiência!" (linha 10)
- ❌ Parágrafo 1: "Prepare-se para descobrir..." (linha 12-16)
- ❌ Parágrafo 2: "Crie seu passaporte digital..." (linha 18-22)
- ❌ Botão: "Cadastre-se" (linha 26)

#### 3. **Homepage - Destaques** (`src/components/home/DestaquesSection.tsx`)
- ❌ Título: "Destinos em Destaque" (linha 56)
- ❌ Descrição: "Descubra os principais destinos..." (linha 59)
- ❌ Botão: "Ver Todos os Destinos" (linha 113)
- ❌ Lista de destinos (hardcoded no array `destinos`, linhas 5-34)

#### 4. **Navbar - Menu** (`src/components/layout/UniversalNavbar.tsx`)
- ❌ Itens do menu vêm de `BrandContext` (linha 49)
- ❌ Configurado em `src/context/BrandContext.tsx` (linhas 78-84):
  - "Mapa Turístico"
  - "Destinos"
  - "Eventos"
  - "Parceiros"
  - "Sobre"
- ❌ Botões CTA: "Cadastrar" e "Entrar" (linhas 90-91)

#### 5. **Hero Universal** (`src/components/layout/UniversalHero.tsx`)
- ❌ Título e subtítulo vêm de `BrandContext` (linhas 26-27)
- ❌ Botões vêm de `config.hero.buttons` (linhas 78-94)

#### 6. **Página Sobre MS** (`src/pages/ms/SobreMS.tsx`)
- ❌ Título: "Sobre o Descubra MS" (linha 23)
- ❌ Descrição hero (linha 25-28)
- ❌ Seções de Missão, Visão, Valores (hardcoded)

---

## 🚀 VIAJAR

### ✅ O que JÁ está editável:
- Nada ainda - precisa implementar a leitura do banco nos componentes

### 📝 O que PRECISA ser editável (atualmente hardcoded):

#### 1. **Homepage - Hero** (`src/pages/ViaJARSaaS.tsx`)
- ❌ Badge: "Plataforma #1 de Turismo Inteligente" (linha 80)
- ❌ Título: "ViajARTur" (linhas 85-87)
- ❌ Subtítulo 1: "Ecossistema inteligente de turismo" (linha 91)
- ❌ Subtítulo 2: "Transforme dados em decisões..." (linha 95)
- ❌ Botão 1: "Acessar Plataforma" (linha 102)
- ❌ Botão 2: "Agendar Demo" (linha 108)
- ❌ Array de features (linhas 10-46)

#### 2. **Navbar - Menu** (`src/components/layout/ViaJARNavbar.tsx`)
- ❌ Itens do menu (linhas 65-72):
  - "Início"
  - "Soluções"
  - "Cases"
  - "Preços"
  - "Sobre"
  - "Contato"
- ❌ Itens do dashboard dropdown (linhas 74-81)

#### 3. **Páginas ViaJAR** (preciso verificar mais arquivos)
- Página de Soluções
- Página de Preços
- Página Sobre
- Página Contato

---

## 🎯 PROPOSTA DE IMPLEMENTAÇÃO

### Opção 1: **Integrar leitura do banco nos componentes existentes**
- Modificar cada componente para buscar conteúdo do banco
- Manter fallback para valores hardcoded se não houver conteúdo
- **Vantagem**: Funciona imediatamente com o editor que já criamos
- **Desvantagem**: Precisa modificar vários componentes

### Opção 2: **Criar hooks/services para carregar conteúdo**
- Criar `useContent()` hook que busca do banco
- Componentes usam o hook e mostram loading/fallback
- **Vantagem**: Código mais limpo e reutilizável
- **Desvantagem**: Mais trabalho inicial

### Opção 3: **Híbrido - Componentes inteligentes**
- Componentes verificam se há conteúdo no banco
- Se houver, usa do banco
- Se não houver, usa valores padrão (hardcoded)
- **Vantagem**: Funciona com ou sem conteúdo editado
- **Desvantagem**: Pode ser confuso qual está sendo usado

---

## ❓ PERGUNTAS ANTES DE IMPLEMENTAR

1. **Você quer que TODOS esses textos sejam editáveis?**
   - Ou prefere manter alguns fixos (como nomes de botões de navegação)?

2. **Prefere qual opção de implementação?**
   - Opção 1: Modificar componentes diretamente
   - Opção 2: Criar hooks/services
   - Opção 3: Híbrido

3. **Quais páginas/seções são PRIORIDADE?**
   - Homepage Descubra MS?
   - Homepage ViaJAR?
   - Menus?
   - Todas?

4. **Você já tem conteúdo no banco de dados?**
   - Ou vamos começar do zero?

---

## 📊 RESUMO

- **Descubra MS**: ~15-20 textos hardcoded que precisam ser editáveis
- **ViaJAR**: ~10-15 textos hardcoded que precisam ser editáveis
- **Total**: ~25-35 textos que precisam ser conectados ao editor

**Status atual**: Editor criado ✅ | Componentes lendo do banco ❌

**Próximo passo**: Aguardar sua aprovação para implementar a leitura do banco nos componentes!




