
# Plano: Correção da Logo, Traduções Dinâmicas e Vídeo Mobile

## Resumo dos Problemas Identificados

Com base na imagem enviada e na análise do código, identifiquei três problemas:

1. **Vídeo no Mobile**: A imagem mostra que há uma área preta grande acima do conteúdo do Hero - o vídeo não está ocupando toda a tela vertical no celular
2. **Logo na Página Sobre**: O fundo branco sólido que foi aplicado não ficou agradável visualmente
3. **Traduções Incompletas**: Os textos estáticos do Hero estão traduzidos (como "Découvrir maintenant" em francês), mas o conteúdo dinâmico do banco de dados não está sendo traduzido

---

## Análise Técnica

### 1. Problema do Vídeo no Mobile

**Diagnóstico pela Imagem:**
- A área do vídeo mostra uma grande parte preta no topo
- O conteúdo do Hero (título, subtítulo, botões) está posicionado muito abaixo
- O vídeo não está cobrindo toda a altura da viewport

**Causa no Código (UniversalHero.tsx - linhas 336-348):**
```tsx
<div
  style={{
    height: isMobile ? '100vh' : '56.25vw',
    minHeight: '100vh',
    // ...
  }}
>
```

O problema é que mesmo com `height: 100vh`, o container pai pode estar limitando a exibição. Além disso, o iframe do YouTube pode não estar renderizando corretamente em dispositivos móveis.

**Solução Proposta:**
- Aumentar a escala do vídeo no mobile para cobrir toda a área visível
- Usar `scale(1.5)` ou similar para garantir que o vídeo preencha toda a viewport sem bordas pretas
- Ajustar o `objectFit: cover` equivalente para iframes

### 2. Problema da Logo na Página Sobre

**Situação Atual (SobreMS.tsx - linha 55):**
```tsx
<div className="bg-white rounded-2xl p-4 shadow-2xl">
```

**O usuário não gostou** do fundo branco sólido porque fica muito contrastante e "pesado" visualmente sobre o gradiente colorido do Hero.

**Soluções Alternativas:**
- **Opção A**: Usar um gradiente claro suave (`bg-gradient-to-br from-white/80 to-white/60`) com blur para manter a transparência mas com mais visibilidade
- **Opção B**: Usar sombra mais forte na logo sem container (`drop-shadow`) para destacá-la diretamente sobre o fundo
- **Opção C**: Manter transparência sutil (`bg-white/50`) mas aumentar o blur para melhor legibilidade

A **Opção B** parece mais elegante: remover o container e usar múltiplas sombras (`drop-shadow-2xl` ou filtro CSS customizado) para fazer a logo se destacar naturalmente sobre o gradiente.

### 3. Problema das Traduções Dinâmicas

**O que ESTÁ funcionando:**
- ✅ Textos do i18next (arquivos JSON em `src/i18n/locales/`) - Como visto na imagem: "Découvrir maintenant", "Passeport numérique"
- ✅ Títulos e subtítulos do Hero que estão nos arquivos de tradução

**O que NÃO está funcionando:**
- ❌ Conteúdo do banco de dados (`institutional_content`)
- ❌ Descrições de destinos, eventos, roteiros
- ❌ Qualquer texto que vem do CMS

**Análise do Sistema de Tradução:**

O código tem uma arquitetura completa mas com problemas na execução:

1. **TranslationManager** (prioridade):
   - LibreTranslate (gratuito, prioridade 1) → URL: `https://libretranslate.de`
   - Google Translate (prioridade 2) → Requer API Key
   - Gemini AI (prioridade 3) → Requer API Key

2. **Problema com LibreTranslate:**
   - O serviço `libretranslate.de` é uma instância pública que pode estar lenta, bloqueada por CORS, ou fora do ar
   - Não há tratamento adequado para timeout ou fallback quando o serviço falha

3. **Fluxo de Tradução Automática:**
   - Quando conteúdo é salvo, `platformContentService.updateContent()` tenta gerar traduções automaticamente
   - Mas isso depende do `AutoTranslationGenerator` que usa o `TranslationManager`
   - Se LibreTranslate falha e não há API keys configuradas, nenhuma tradução é gerada

**Soluções Propostas:**

1. **Configurar uma instância confiável de LibreTranslate** ou usar outra API gratuita como fallback
2. **Adicionar mais idiomas nos arquivos estáticos** do i18next para cobrir mais textos
3. **Criar uma UI no admin** para verificar status das traduções e regerar manualmente
4. **Implementar cache local** para traduções já realizadas
5. **Adicionar timeout adequado** e melhor tratamento de erros no LibreTranslateService

---

## Plano de Implementação

### Fase 1: Correção do Vídeo no Mobile (UniversalHero.tsx)

**Modificações:**
1. Aumentar escala do vídeo no mobile para cobrir toda a área:
```tsx
<div style={{
  // Container do vídeo
  transform: isMobile ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%)',
  width: isMobile ? '140vw' : '100vw',
  height: isMobile ? '140vh' : '56.25vw',
  minHeight: '100vh',
}}>
```

2. Garantir que o container principal do Hero tenha altura mínima correta:
```tsx
<div style={{
  minHeight: '100vh',
  height: '100dvh', // dvh para mobile (dynamic viewport height)
}}>
```

### Fase 2: Correção da Logo (SobreMS.tsx)

**Abordagem escolhida:** Remover container branco e usar múltiplas sombras na própria logo

```tsx
<div className="flex justify-center mb-6">
  <img 
    src={logoUrl} 
    alt="Descubra Mato Grosso do Sul" 
    className="h-36 w-auto"
    style={{
      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
    }}
  />
</div>
```

Isso cria um "brilho" branco ao redor da logo que a destaca do fundo colorido sem precisar de um container.

### Fase 3: Melhorar Sistema de Traduções

**3.1 - Adicionar fallback mock quando APIs falham:**
Modificar o `TranslationManager` para retornar uma tradução parcial (mesmo que não perfeita) quando APIs externas falham, em vez de retornar o texto original.

**3.2 - Adicionar instância alternativa de LibreTranslate:**
```typescript
// Lista de instâncias públicas de LibreTranslate
const LIBRE_TRANSLATE_INSTANCES = [
  'https://libretranslate.de',
  'https://lt.vern.cc',
  'https://translate.argosopentech.com',
];
```

**3.3 - Implementar verificação de saúde das APIs:**
Criar um hook `useTranslationStatus` que verifica se as APIs estão funcionando.

**3.4 - Adicionar mais traduções estáticas:**
Expandir os arquivos JSON de tradução para cobrir mais textos da interface.

---

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/components/layout/UniversalHero.tsx` | Ajustar escala e dimensões do vídeo no mobile |
| `src/pages/ms/SobreMS.tsx` | Remover container branco da logo, usar drop-shadow |
| `src/services/translation/LibreTranslateService.ts` | Adicionar múltiplas instâncias e fallback |
| `src/services/translation/TranslationManager.ts` | Melhorar tratamento de erros e timeout |

---

## Resultado Esperado

1. **Vídeo** ocupará toda a tela no mobile, sem áreas pretas visíveis
2. **Logo** terá boa visibilidade com um efeito de brilho suave, sem container branco
3. **Traduções** terão maior confiabilidade com múltiplos fallbacks

---

## Seção Técnica: O que precisa para traduções funcionarem completamente

Para tradução completa de conteúdo dinâmico, o sistema precisa de:

1. **Tabela `content_translations`** - Já criada na última sessão
2. **API de tradução funcional** - LibreTranslate ou Google Translate/Gemini
3. **Geração automática** - Ao salvar conteúdo no admin, gerar traduções
4. **Busca de traduções** - Ao exibir conteúdo, verificar se existe tradução

O problema atual é que LibreTranslate (`https://libretranslate.de`) pode estar:
- Com rate limiting
- Bloqueado por CORS no navegador
- Fora do ar temporariamente

A solução definitiva seria configurar a chave `VITE_GOOGLE_TRANSLATE_API_KEY` no projeto, mas isso tem custo. Alternativamente, podemos usar múltiplas instâncias públicas de LibreTranslate como fallback.
