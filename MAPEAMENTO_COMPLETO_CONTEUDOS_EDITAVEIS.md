# 📋 MAPEAMENTO COMPLETO: Todos os Conteúdos Editáveis

## 🎯 OBJETIVO
Mapear TODOS os textos e conteúdos que precisam ser editáveis via admin, incluindo:
- Descubra MS: Homepage, Destinos, Passaporte, Políticas, Termos
- ViaJAR: Homepage, Páginas, Políticas, Termos

---

## 🔵 DESCUBRA MATO GROSSO DO SUL

### 1. **HOMEPAGE** (`/descubramatogrossodosul`)

#### Hero Principal (`src/components/home/Hero.tsx`)
- ✅ **Título**: "Descubra Mato Grosso do Sul"
- ✅ **Subtítulo**: "Explore destinos incríveis, crie roteiros únicos e viva experiências inesquecíveis"
- ✅ **Botão 1**: "Explorar Destinos"
- ✅ **Botão 2**: "Ver Galerias"
- ✅ **Botão 3**: "Eventos"

#### Hero Universal (`src/components/layout/UniversalHero.tsx`)
- ✅ **Título**: Vem de `BrandContext` mas pode ser editável
- ✅ **Subtítulo**: "Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul"
- ✅ **Botão 1**: "Descubra Agora"
- ✅ **Botão 2**: "Passaporte Digital"
- ✅ **Botão 3**: "Converse com o Guatá"

#### Seção Descrição Turística (`src/components/home/TourismDescription.tsx`)
- ✅ **Título**: "Descubra Mato Grosso do Sul – Viva essa experiência!"
- ✅ **Parágrafo 1**: "Prepare-se para descobrir o melhor de MS de um jeito inovador e inteligente. Com a ajuda do Guatá, seu guia virtual inspirado na cultura local, você explora atrativos como Bonito, Pantanal, Serra da Bodoquena e muito mais!"
- ✅ **Parágrafo 2**: "Crie seu passaporte digital, desbloqueie selos temáticos com animais do Cerrado e do Pantanal, participe de roteiros interativos, receba recompensas e viva momentos inesquecíveis! Cadastre-se para explorar mais e ajudar a melhorar o turismo local!"
- ✅ **Botão**: "Cadastre-se"

#### Seção Destaques (`src/components/home/DestaquesSection.tsx`)
- ✅ **Título**: "Destinos em Destaque"
- ✅ **Descrição**: "Descubra os principais destinos turísticos de Mato Grosso do Sul"
- ✅ **Botão**: "Ver Todos os Destinos"
- ⚠️ **Lista de Destinos**: Atualmente hardcoded (Bonito, Pantanal, Corumbá, Campo Grande)

#### Seção Experiências (`src/components/home/ExperienceSection.tsx`)
- ⚠️ Precisa verificar conteúdo

#### Seção CATs (`src/components/home/CatsSection.tsx`)
- ⚠️ Precisa verificar conteúdo

---

### 2. **DESTINOS**

#### Listagem de Destinos (`src/pages/ms/DestinosMS.tsx` ou similar)
- ✅ **Título da Página**: "Destinos"
- ✅ **Descrição**: Texto introdutório sobre destinos
- ⚠️ **Lista de destinos**: Vem do banco, mas textos descritivos podem precisar edição

#### Detalhes do Destino (`src/pages/DestinoDetalhes.tsx`)
- ✅ **Título**: "Sobre {nome_do_destino}"
- ✅ **Descrição**: `destination.description` (vem do banco)
- ✅ **Texto Promocional**: `details.promotional_text` (vem do banco)
- ✅ **Destaques**: `details.highlights` (array, vem do banco)
- ✅ **Título Seção**: "Principais Atrações"
- ✅ **Título Seção**: "Vídeo Promocional"
- ✅ **Título Seção**: "Galeria de Fotos"
- ✅ **Título Sidebar**: "Links Oficiais"
- ✅ **Título Sidebar**: "Como Chegar"
- ✅ **Título Sidebar**: "Informações de Contato"

**OBSERVAÇÃO**: Os dados dos destinos vêm do banco (`destinations` table), mas os **títulos das seções** estão hardcoded e podem precisar ser editáveis.

---

### 3. **PASSAPORTE DIGITAL**

#### Lista de Rotas (`src/pages/ms/PassaporteLista.tsx`)
- ✅ **Título Hero**: "Passaporte Digital MS"
- ✅ **Descrição Hero**: Texto sobre o passaporte
- ✅ **Título Seção**: "Rotas Disponíveis"
- ✅ **Descrição**: Texto explicativo sobre as rotas
- ⚠️ **Rotas**: Vêm do banco (`routes` table), mas textos descritivos podem precisar edição

#### Documento do Passaporte (`src/components/passport/PassportDocument.tsx`)
- ✅ **Título**: "🛂 Passaporte Digital MS"
- ✅ **Texto**: "Nº: {número}"
- ✅ **Mensagens**: "Carregando passaporte...", "Erro ao carregar passaporte"

#### Passaporte Melhorado (`src/components/passport/EnhancedDigitalPassport.tsx`)
- ✅ **Título**: "🛂 Meu Passaporte Digital"
- ✅ **Descrição**: "Acompanhe seu progresso explorando Mato Grosso do Sul"
- ✅ **Título Seção**: "Conquistas Desbloqueadas"
- ✅ **Mensagens**: "Faça login para ver seu passaporte digital", "Erro ao carregar dados do passaporte"

#### Detalhes da Rota (`src/pages/ms/RouteDetailsMS.tsx`)
- ✅ **Títulos de seções**: "Sobre a Rota", "Checkpoints", etc.
- ✅ **Textos explicativos**: Descrições sobre como funciona

---

### 4. **POLÍTICA DE PRIVACIDADE** (`src/pages/ms/PrivacidadeMS.tsx`)

**TODO O CONTEÚDO DA PÁGINA** precisa ser editável:
- ✅ **Título Hero**: "Política de Privacidade"
- ✅ **Data de atualização**: (pode ser automática)
- ✅ **Todo o texto legal**: Seções, parágrafos, listas
- ✅ **Contato**: Email, endereço
- ⚠️ **Arquivo muito grande** (~450 linhas de conteúdo hardcoded)

---

### 5. **TERMOS DE USO** (`src/pages/ms/TermosUsoMS.tsx`)

**TODO O CONTEÚDO DA PÁGINA** precisa ser editável:
- ✅ **Título Hero**: "Termos de Uso"
- ✅ **Data de atualização**: (pode ser automática)
- ✅ **Todo o texto legal**: Seções, parágrafos, listas
- ⚠️ **Arquivo muito grande** (~485 linhas de conteúdo hardcoded)

---

### 6. **MENU/NAVBAR** (`src/components/layout/UniversalNavbar.tsx`)

- ✅ **Itens do menu**: Vêm de `BrandContext` mas podem ser editáveis:
  - "Mapa Turístico"
  - "Destinos"
  - "Eventos"
  - "Parceiros"
  - "Sobre"
- ✅ **Botões CTA**: "Cadastrar", "Entrar"

---

### 7. **FOOTER** (`src/components/layout/UniversalFooter.tsx`)

- ✅ **Textos do rodapé**: Links, descrições, copyright
- ✅ **Seções**: Sobre, Links, Redes Sociais

---

### 8. **PÁGINA SOBRE** (`src/pages/ms/SobreMS.tsx`)

- ✅ **Título Hero**: "Sobre o Descubra MS"
- ✅ **Descrição Hero**: "Sua plataforma completa para explorar..."
- ✅ **Seções**: Missão, Visão, Valores (todo conteúdo)

---

### 9. **PÁGINA SEJA PARCEIRO** (`src/pages/ms/SejaUmParceiroMS.tsx`)

- ✅ **Título Hero**
- ✅ **Descrição**
- ✅ **Benefícios**
- ✅ **Formulário**: Labels, placeholders, mensagens

---

## 🟣 VIAJAR

### 1. **HOMEPAGE** (`/` - ViaJARSaaS)

#### Hero (`src/pages/ViaJARSaaS.tsx`)
- ✅ **Badge**: "Plataforma #1 de Turismo Inteligente"
- ✅ **Título**: "ViajARTur"
- ✅ **Subtítulo 1**: "Ecossistema inteligente de turismo"
- ✅ **Subtítulo 2**: "Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado."
- ✅ **Botão 1**: "Acessar Plataforma"
- ✅ **Botão 2**: "Agendar Demo"
- ✅ **Features**: Array com títulos e descrições (linhas 10-46)

---

### 2. **POLÍTICA DE PRIVACIDADE** (`src/pages/viajar/Privacidade.tsx`)

**TODO O CONTEÚDO DA PÁGINA** precisa ser editável:
- ✅ **Título Hero**: "Política de Privacidade"
- ✅ **Data de atualização**
- ✅ **Todo o texto legal**: Seções, parágrafos, tabelas
- ⚠️ **Arquivo muito grande** (~589 linhas de conteúdo hardcoded)

---

### 3. **TERMOS DE USO** (`src/pages/viajar/TermosUso.tsx`)

**TODO O CONTEÚDO DA PÁGINA** precisa ser editável:
- ✅ **Título Hero**: "Termos de Uso"
- ✅ **Data de atualização**
- ✅ **Todo o texto legal**: Seções, parágrafos
- ⚠️ **Arquivo muito grande** (~539 linhas de conteúdo hardcoded)

---

### 4. **MENU/NAVBAR** (`src/components/layout/ViaJARNavbar.tsx`)

- ✅ **Itens do menu** (hardcoded, linhas 65-72):
  - "Início"
  - "Soluções"
  - "Cases"
  - "Preços"
  - "Sobre"
  - "Contato"
- ✅ **Itens do dashboard dropdown** (linhas 74-81)

---

### 5. **FOOTER** (`src/components/layout/ViaJARFooter.tsx`)

- ✅ **Textos do rodapé**: Links, descrições, copyright
- ✅ **Seções**: Sobre, Links, Redes Sociais

---

### 6. **PÁGINAS VIAJAR** (precisam verificação)

- ⚠️ **Página Soluções** (`/solucoes`)
- ⚠️ **Página Preços** (`/precos`)
- ⚠️ **Página Sobre** (`/sobre`)
- ⚠️ **Página Contato** (`/contato`)
- ⚠️ **Página Cases** (`/casos-sucesso`)

---

## 📊 RESUMO QUANTITATIVO

### Descubra MS:
- **Homepage**: ~15 textos
- **Destinos**: ~10 textos (títulos de seções)
- **Passaporte**: ~8 textos
- **Políticas/Termos**: ~900 linhas de conteúdo legal
- **Menus/Footer**: ~10 textos
- **Outras páginas**: ~20 textos
- **TOTAL**: ~60-70 textos + conteúdo legal extenso

### ViaJAR:
- **Homepage**: ~15 textos
- **Políticas/Termos**: ~1100 linhas de conteúdo legal
- **Menus/Footer**: ~10 textos
- **Páginas**: ~30 textos (estimado)
- **TOTAL**: ~55-65 textos + conteúdo legal extenso

### **TOTAL GERAL**: ~115-135 textos editáveis + conteúdo legal extenso

---

## 🎯 PROPOSTA DE IMPLEMENTAÇÃO

### **Opção Recomendada: Sistema Híbrido Inteligente**

1. **Hook `useContent()`** que:
   - Busca conteúdo do banco por `content_key`
   - Se encontrar conteúdo publicado, usa do banco
   - Se não encontrar, usa valor padrão (hardcoded)
   - Mostra loading enquanto busca

2. **Componentes modificados** para:
   - Usar `useContent('homepage_hero_title')` ao invés de texto hardcoded
   - Manter fallback para valores padrão

3. **Editor atualizado** com:
   - **Categorias expandidas**:
     - Homepage (todas as seções)
     - Destinos (títulos de seções)
     - Passaporte (todos os textos)
     - Políticas e Termos (por seção)
     - Menus e Footer
     - ViaJAR (homepage, páginas, políticas, termos)

4. **Para Políticas/Termos**:
   - Editor especial com seções colapsáveis
   - Cada seção editável separadamente
   - Suporte a HTML/Markdown

---

## ❓ PERGUNTAS ANTES DE IMPLEMENTAR

1. **Políticas e Termos**: 
   - Quer editar por **seção** (mais organizado) ou **texto completo** (mais simples)?
   - Prefere editor **HTML/Markdown** ou **texto simples**?

2. **Destinos**:
   - Os dados vêm do banco (`destinations` table)
   - Quer editar apenas **títulos de seções** ou também **textos descritivos**?

3. **Passaporte**:
   - Quer editar **textos informativos** sobre o passaporte?
   - Ou apenas **dados das rotas** (que já vêm do banco)?

4. **Prioridade**:
   - Qual implementar primeiro?
     - Homepage?
     - Políticas/Termos?
     - Tudo de uma vez?

5. **Editor de Políticas/Termos**:
   - Editor simples (textarea grande)?
   - Editor com seções (mais organizado)?
   - Editor WYSIWYG (tipo Word)?

---

## ✅ PRÓXIMOS PASSOS

Aguardando sua aprovação para:
1. ✅ Expandir o editor com todas as categorias
2. ✅ Criar hook `useContent()` para buscar do banco
3. ✅ Modificar componentes para usar o hook
4. ✅ Implementar editor especial para Políticas/Termos

**Aguardando suas respostas antes de implementar!** 🚀




