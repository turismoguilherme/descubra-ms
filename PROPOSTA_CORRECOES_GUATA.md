# 🔧 Proposta de Correções - Guatá

## 📋 Requisitos do Usuário

1. ✅ **Remover mensagem explícita sobre não poder ajudar com Detran/IPVA**
   - Apenas bloquear essas perguntas, sem mencionar isso na resposta
   - Redirecionar educadamente para turismo

2. ✅ **Atualizar identificação para "GUIA INTELIGENTE DE TURISMO DE MS"**
   - Garantir que sempre se identifique assim
   - Atualizar no prompt e nas respostas

3. ✅ **Remover "Que bom te ver aqui no Descubra Mato Grosso do Sul" quando em `/chatguata`**
   - A mensagem de boas-vindas não deve mencionar a plataforma quando estiver nessa rota

## 🔍 Análise do Código

### 1. Mensagem de Boas-vindas
- **Arquivo:** `src/pages/ChatGuata.tsx` (linhas 26-28, 138-140)
- **Problema:** Não verifica a rota antes de mostrar a mensagem
- **Solução:** Detectar se está em `/chatguata` e ajustar a mensagem

### 2. Prompt do Gemini
- **Arquivo:** `src/services/ai/guataGeminiService.ts` (linha 657+)
- **Problema:** 
  - Não tem instruções claras para bloquear perguntas fora do escopo
  - Não garante identificação como "GUIA INTELIGENTE DE TURISMO DE MS"
- **Solução:** Adicionar instruções no prompt

### 3. Validação de Escopo
- **Problema:** Não existe validação prévia de perguntas fora do escopo
- **Solução:** Criar validador que bloqueia silenciosamente

## 🎯 Solução Proposta

### 1. **Criar Validador de Escopo (sem mencionar bloqueio)**

Criar `src/services/ai/validation/tourismScopeValidator.ts`:

```typescript
export class TourismScopeValidator {
  // Palavras-chave que indicam FORA do escopo
  private readonly OFF_SCOPE_KEYWORDS = [
    'detran', 'ipva', 'licença', 'cnh', 'documento', 'rg', 'cpf',
    'imposto', 'taxa', 'tributo', 'receita federal', 'burocracia',
    'protocolo', 'processo administrativo'
  ];
  
  // Palavras-chave que indicam DENTRO do escopo
  private readonly TOURISM_KEYWORDS = [
    'turismo', 'viagem', 'destino', 'passeio', 'atração', 'ponto turístico',
    'hotel', 'pousada', 'hospedagem', 'restaurante', 'comida', 'gastronomia',
    'evento', 'festival', 'roteiro', 'itinerário', 'bonito', 'pantanal',
    'campo grande', 'corumbá', 'dourados', 'visitar', 'conhecer', 'explorar'
  ];
  
  validateQuestion(question: string): {
    isTourismRelated: boolean;
    shouldBlock: boolean;
    redirectResponse?: string;
  } {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Verificar se tem palavras de turismo
    const hasTourismKeywords = this.TOURISM_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    // Verificar se tem palavras fora do escopo
    const hasOffScopeKeywords = this.OFF_SCOPE_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    // Se tem palavras fora do escopo E não tem palavras de turismo = BLOQUEAR
    if (hasOffScopeKeywords && !hasTourismKeywords) {
      return {
        isTourismRelated: false,
        shouldBlock: true,
        redirectResponse: '🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟'
      };
    }
    
    return {
      isTourismRelated: hasTourismKeywords || !hasOffScopeKeywords,
      shouldBlock: false
    };
  }
}
```

### 2. **Atualizar Mensagem de Boas-vindas em `/chatguata`**

Modificar `src/pages/ChatGuata.tsx`:

```typescript
import { useLocation } from 'react-router-dom';

const ChatGuata = () => {
  const location = useLocation();
  const isChatGuataRoute = location.pathname === '/chatguata';
  
  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (mensagens.length === 0) {
      const mensagemBoasVindas = {
        id: 1,
        text: isChatGuataRoute
          ? "🦦 E aí, tudo bem por aí?! Eu sou o Guatá, a capivara guia mais simpática e animada desse paraíso! 😜\n\nSou seu braço direito para desvendar os segredos e as belezas de Mato Grosso do Sul. Quer saber onde comer uma boa sopa paraguaia? Ou quem sabe, um lugar top para ver o pôr do sol no Pantanal? 😅 Pode contar comigo!\n\nTô aqui para te ajudar a planejar desde um roteiro incrível até te dar dicas valiosas sobre os melhores passeios, hospedagens e tudo mais que você precisar para ter uma experiência inesquecível no nosso estado. ✈️"
          : "🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        isUser: false,
        timestamp: new Date()
      };
      setMensagens([mensagemBoasVindas]);
    }
  }, [mensagens.length, isChatGuataRoute]);
  
  // ... resto do código
}
```

### 3. **Atualizar Prompt do Gemini**

Modificar `src/services/ai/guataGeminiService.ts` - método `buildPrompt`:

```typescript
SOBRE VOCÊ - QUEM É O GUATÁ:
- Você é o Guatá, um GUIA INTELIGENTE DE TURISMO de Mato Grosso do Sul
- Você é uma capivara virtual, representada como uma capivara simpática e acolhedora
- Seu nome "Guatá" vem da língua guarani e significa "caminhar"
- Você é um GUIA INTELIGENTE DE TURISMO, especializado em ajudar pessoas a descobrirem as maravilhas de Mato Grosso do Sul
- IMPORTANTE: Sempre se identifique como "GUIA INTELIGENTE DE TURISMO DE MS" quando perguntarem sobre você

QUANDO PERGUNTAREM SOBRE VOCÊ:
- Se perguntarem "quem é você?", "qual seu nome?", "o que você faz?", responda de forma variada e natural
- SEMPRE mencione que você é um "GUIA INTELIGENTE DE TURISMO DE MS" ou "GUIA INTELIGENTE DE TURISMO DE MATO GROSSO DO SUL"
- Varie suas respostas: às vezes comece com "Eu sou o Guatá", outras vezes com "Meu nome é Guatá", outras com "Sou uma capivara virtual chamada Guatá"
- Sempre mencione o significado do nome "Guatá" (guarani, significa "caminhar") de forma natural e contextual
- Enfatize que você é um GUIA INTELIGENTE DE TURISMO especializado em MS
- NUNCA repita exatamente a mesma resposta sobre você - sempre varie a forma de expressar

LIMITAÇÕES E ESCOPO:
- Você APENAS responde perguntas relacionadas a TURISMO em Mato Grosso do Sul
- NÃO responda perguntas sobre:
  * Serviços governamentais (Detran, IPVA, documentação, licenças)
  * Questões administrativas ou burocráticas
  * Política, eleições ou partidos
  * Saúde, educação ou trabalho (exceto se relacionado a turismo)
  * Tecnologia ou programação (exceto apps de turismo)
  * Finanças ou investimentos (exceto câmbio para turismo)
  * Turismo de outros estados (exceto se relacionado a MS)
- Se receber uma pergunta fora do escopo, responda educadamente redirecionando para turismo:
  "🦦 Olá! Eu sou o Guatá, seu guia inteligente de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟"
- NUNCA mencione explicitamente que não pode ajudar com Detran, IPVA, etc. - apenas redirecione para turismo
- NUNCA invente informações sobre serviços governamentais ou outros assuntos fora do escopo
- Seja sempre educado e ofereça alternativas relacionadas a turismo
```

### 4. **Integrar Validação no Fluxo**

Modificar `src/services/ai/guataIntelligentTourismService.ts` ou `guataTrueApiService.ts`:

```typescript
import { TourismScopeValidator } from '@/services/ai/validation/tourismScopeValidator';

// No início do processQuestion:
const validator = new TourismScopeValidator();
const validation = validator.validateQuestion(question);

if (validation.shouldBlock) {
  return {
    answer: validation.redirectResponse || '...',
    confidence: 0.9,
    sources: [],
    processingTime: 0,
    // ... outros campos
  };
}
```

### 5. **Atualizar Mensagem de Boas-vindas (sem mencionar plataforma em `/chatguata`)**

A mensagem atual menciona "Descubra Mato Grosso do Sul" - remover isso quando em `/chatguata`.

## 📝 Resumo das Mudanças

1. ✅ Criar `tourismScopeValidator.ts` - validação silenciosa
2. ✅ Modificar `ChatGuata.tsx` - ajustar mensagem de boas-vindas baseado na rota
3. ✅ Modificar `guataGeminiService.ts` - atualizar prompt:
   - Garantir identificação como "GUIA INTELIGENTE DE TURISMO DE MS"
   - Adicionar instruções para bloquear perguntas fora do escopo (sem mencionar)
4. ✅ Integrar validação em `guataIntelligentTourismService.ts` ou `guataTrueApiService.ts`

## ✅ Resultado Esperado

1. ✅ Guatá sempre se identifica como "GUIA INTELIGENTE DE TURISMO DE MS"
2. ✅ Perguntas sobre Detran/IPVA são bloqueadas e redirecionadas educadamente (sem mencionar o bloqueio)
3. ✅ Mensagem de boas-vindas em `/chatguata` não menciona "Descubra Mato Grosso do Sul"
4. ✅ Sistema funciona silenciosamente, sem expor limitações ao usuário

**Posso implementar essas mudanças?**

