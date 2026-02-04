
# Plano: Correção da Logo na Página Sobre, Sistema de Traduções e Vídeo Mobile

## Resumo das Solicitações

1. **Logo na página "Sobre MS"** - Melhorar visibilidade sem alterar layout ou logo, removendo a sobreposição transparente
2. **Traduções não funcionam completamente** - O sistema não traduz todo o conteúdo que deveria
3. **Vídeo no mobile** - Não fica em tela cheia e aparecem informações do YouTube

---

## Análise Técnica Detalhada

### 1. Problema da Logo na Página "Sobre MS"

**Arquivo:** `src/pages/ms/SobreMS.tsx`

**Situação Atual (linhas 54-67):**
```tsx
<div className="bg-white/30 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
  <img 
    src={logoUrl} 
    alt="Descubra Mato Grosso do Sul" 
    className="h-36 w-auto"
  />
</div>
```

A logo está dentro de um container com `bg-white/30` (fundo branco com 30% de opacidade) e `backdrop-blur-md`. Isso cria um efeito de "glassmorphism" que foi adicionado para aumentar a visibilidade da logo sobre o fundo gradiente.

**Solução Proposta:**
Em vez de usar fundo transparente com blur, usar um fundo sólido branco (ou muito claro) sem transparência. Isso mantém o estilo limpo enquanto garante que a logo seja claramente visível.

**Modificação:**
```tsx
<div className="bg-white rounded-2xl p-4 shadow-2xl">
  <img 
    src={logoUrl} 
    alt="Descubra Mato Grosso do Sul" 
    className="h-36 w-auto"
  />
</div>
```

---

### 2. Problema das Traduções

**Diagnóstico Completo:**

O sistema de traduções tem **dois mecanismos**:

1. **i18next (UI estática):** Funciona corretamente para textos predefinidos (arquivos JSON em `src/i18n/locales/`)
2. **Traduções dinâmicas (conteúdo do banco):** Usa a tabela `content_translations` que **NÃO EXISTE** no banco de dados

**Causa Raiz:**
A tabela `content_translations` não foi criada, então qualquer conteúdo editável (do CMS) não tem traduções disponíveis. Quando o usuário muda o idioma, apenas os textos estáticos do i18next são traduzidos.

**O que traduz atualmente:**
- ✅ Textos do Hero (título, subtítulo, botões)
- ✅ Títulos das seções principais
- ✅ Labels de filtros e navegação

**O que NÃO traduz:**
- ❌ Conteúdo editável do CMS (`institutional_content`)
- ❌ Descrições de destinos, eventos, roteiros
- ❌ Textos personalizados pelo administrador
- ❌ Nomes de regiões e cidades

**Solução Proposta (Fase 1 - Infraestrutura):**

Criar a tabela `content_translations` com a seguinte estrutura:

```sql
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'descubra_ms',
  section TEXT NOT NULL DEFAULT 'general',
  language_code TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(content_key, language_code)
);

-- Índices para performance
CREATE INDEX idx_content_translations_key ON content_translations(content_key);
CREATE INDEX idx_content_translations_language ON content_translations(language_code);
```

**Solução Proposta (Fase 2 - Lazy Translation):**

O sistema já tem código para "lazy translation" (traduzir sob demanda). Uma vez que a tabela exista, quando um usuário acessar em outro idioma e a tradução não existir, o sistema tentará gerar automaticamente via API de tradução.

**Solução Proposta (Fase 3 - Elementos Faltantes):**

Alguns elementos não estão usando as funções de tradução. Será necessário:
- Adicionar traduções para mais elementos nos arquivos JSON
- Garantir que todos os componentes usem `useTranslation()` corretamente

---

### 3. Problema do Vídeo no Mobile

**Arquivo:** `src/components/layout/UniversalHero.tsx`

**Problemas Identificados:**

1. **Não fica em "tela cheia" no mobile:**
   - O container do vídeo usa `height: 56.25vw` (proporção 16:9 para desktop)
   - No mobile, isso causa uma altura que não ocupa toda a viewport

2. **Informações do YouTube aparecem:**
   - Mesmo usando parâmetros como `modestbranding=1`, `controls=0`, `showinfo=0`, navegadores mobile frequentemente ignoram esses parâmetros
   - O YouTube em mobile tem comportamento diferente e mostra título/logo do canal

**Soluções Atuais (linhas 336-416):**
- Já existe tratamento para `isMobile`
- Já existe overlay transparente para esconder elementos

**Problema com a Solução Atual:**
Os parâmetros do YouTube não são respeitados em todos os navegadores mobile. Além disso, o overlay atual (linhas 405-415) não tem gradiente suficiente para esconder os metadados do YouTube.

**Solução Proposta:**

1. **Aumentar cobertura do overlay físico:**
   ```tsx
   {isMobile && (
     <div className="absolute inset-0 w-full h-full z-[10] pointer-events-none">
       {/* Overlay superior para esconder título/logo do YouTube */}
       <div 
         className="absolute top-0 left-0 right-0 h-20"
         style={{
           background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)'
         }}
       />
       {/* Overlay inferior para esconder barra de controles */}
       <div 
         className="absolute bottom-0 left-0 right-0 h-16"
         style={{
           background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
         }}
       />
     </div>
   )}
   ```

2. **Garantir altura completa no mobile:**
   ```tsx
   height: isMobile ? '100vh' : '56.25vw'
   minHeight: '100vh'
   ```

3. **Adicionar transformação para cobrir toda a área:**
   - Escalar o vídeo ligeiramente maior para garantir que cubra toda a área visível

---

## Plano de Implementação

### Fase 1: Correção da Logo (SobreMS.tsx)
- Remover `bg-white/30` e `backdrop-blur-md`
- Usar `bg-white` sólido
- Manter `rounded-2xl`, `p-4`, `shadow-2xl`

### Fase 2: Criar Tabela de Traduções
- Executar migração SQL para criar `content_translations`
- Adicionar índices para performance
- Ativar políticas RLS

### Fase 3: Corrigir Vídeo no Mobile (UniversalHero.tsx)
- Modificar overlay físico com gradientes superior/inferior
- Ajustar dimensões do container de vídeo para mobile
- Garantir que `minHeight: 100vh` seja aplicado corretamente

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/pages/ms/SobreMS.tsx` | Remover transparência do container da logo |
| Migração SQL | Criar tabela `content_translations` |
| `src/components/layout/UniversalHero.tsx` | Melhorar overlay mobile e dimensões do vídeo |

---

## Resultado Esperado

1. **Logo** aparecerá claramente visível sobre fundo branco sólido (sem transparência ou blur)
2. **Traduções** terão infraestrutura completa para funcionar (tabela + lazy translation)
3. **Vídeo mobile** ocupará tela cheia e metadados do YouTube serão cobertos por gradientes
