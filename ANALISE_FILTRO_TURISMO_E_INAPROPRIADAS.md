# 🔒 Análise: Filtro de Turismo e Mensagens Inapropriadas

## ❌ Problema Identificado

O Guatá está respondendo perguntas **fora do escopo de turismo**, como:
- Detran MS
- IPVA
- Questões administrativas/governamentais
- Outros assuntos não relacionados a turismo

**Exemplo da imagem:**
```
"E já que estamos no Mato Grosso do Sul, posso te dar algumas dicas! 
Sabia que Campo Grande tem várias vantagens para quem mora por aqui? 
E se você precisar de informações sobre o Detran MS ou IPVA, também posso te ajudar! 😊"
```

## 🎯 Objetivos

1. ✅ **Limitar respostas apenas a turismo** de Mato Grosso do Sul
2. ✅ **Bloquear mensagens inapropriadas** (ofensivas, spam, etc.)
3. ✅ **Responder educadamente** quando a pergunta for fora do escopo
4. ✅ **Identificar e registrar** tentativas de uso inadequado

## 📋 Escopo de Turismo (O QUE O GUATÁ DEVE RESPONDER)

### ✅ Tópicos Permitidos:
- **Destinos turísticos**: Bonito, Pantanal, Campo Grande, Corumbá, etc.
- **Atrações**: Pontos turísticos, parques, museus, monumentos
- **Gastronomia**: Comida típica, restaurantes, feiras
- **Hospedagem**: Hotéis, pousadas, fazendas
- **Eventos**: Festivais, shows, eventos culturais
- **Roteiros**: Itinerários, passeios, dicas de viagem
- **Transporte turístico**: Como chegar aos destinos, transporte entre cidades
- **Cultura**: Tradições, história relacionada ao turismo
- **Natureza**: Ecoturismo, trilhas, observação de animais
- **Informações práticas**: Melhor época para visitar, clima para turismo

### ❌ Tópicos Bloqueados (FORA DO ESCOPO):
- **Serviços governamentais**: Detran, IPVA, documentação, licenças
- **Questões administrativas**: Impostos, taxas, burocracias
- **Política**: Eleições, partidos, governos
- **Questões pessoais**: Saúde, educação, trabalho (exceto turismo)
- **Tecnologia**: Programação, software (exceto apps de turismo)
- **Finanças**: Investimentos, bancos (exceto câmbio para turismo)
- **Outros estados**: Turismo de outros lugares (exceto se relacionado a MS)
- **Assuntos gerais**: Notícias, esportes, entretenimento (exceto eventos turísticos)

## 🚫 Mensagens Inapropriadas

### Categorias a Bloquear:
1. **Ofensivas**: Palavrões, insultos, discriminação
2. **Spam**: Mensagens repetitivas, publicidade
3. **Tentativas de jailbreak**: Tentativas de fazer o bot sair do personagem
4. **Conteúdo ilegal**: Pedidos de atividades ilegais
5. **Informações pessoais**: Pedidos de dados pessoais de terceiros

## 🔧 Solução Proposta

### 1. **Criar Serviço de Validação**

Criar `src/services/ai/validation/tourismScopeValidator.ts`:

```typescript
export class TourismScopeValidator {
  // Palavras-chave que indicam FORA do escopo
  private readonly OFF_SCOPE_KEYWORDS = [
    // Serviços governamentais
    'detran', 'ipva', 'licença', 'cnh', 'documento', 'rg', 'cpf',
    'imposto', 'taxa', 'tributo', 'receita federal',
    
    // Questões administrativas
    'burocracia', 'protocolo', 'processo administrativo',
    
    // Política (exceto turismo)
    'eleição', 'candidato', 'partido', 'votar', 'urna',
    
    // Saúde/Educação (exceto turismo)
    'hospital', 'médico', 'remédio', 'escola', 'universidade',
    
    // Tecnologia (exceto apps de turismo)
    'programação', 'código', 'software', 'aplicativo' (exceto se mencionar turismo),
    
    // Finanças (exceto câmbio)
    'investimento', 'banco', 'empréstimo', 'financiamento',
    
    // Outros estados (exceto se relacionado a MS)
    'são paulo', 'rio de janeiro', 'minas gerais' (sem contexto de turismo em MS)
  ];
  
  // Palavras-chave que indicam DENTRO do escopo
  private readonly TOURISM_KEYWORDS = [
    'turismo', 'viagem', 'destino', 'passeio', 'atração', 'ponto turístico',
    'hotel', 'pousada', 'hospedagem', 'restaurante', 'comida', 'gastronomia',
    'evento', 'festival', 'roteiro', 'itinerário', 'bonito', 'pantanal',
    'campo grande', 'corumbá', 'dourados', 'visitar', 'conhecer', 'explorar',
    'trilha', 'cachoeira', 'ecoturismo', 'natureza', 'cultura', 'história',
    'artesanato', 'feira', 'museu', 'parque', 'monumento'
  ];
  
  // Palavras ofensivas/inapropriadas
  private readonly INAPPROPRIATE_KEYWORDS = [
    // Ofensas
    'idiota', 'burro', 'estúpido', 'imbecil',
    // Discriminação
    'racismo', 'homofobia', 'xenofobia', 'preconceito',
    // Outros
    'spam', 'hack', 'crack'
  ];
  
  validateQuestion(question: string): {
    isValid: boolean;
    isTourismRelated: boolean;
    isInappropriate: boolean;
    reason?: string;
    suggestedResponse?: string;
  } {
    const lowerQuestion = question.toLowerCase().trim();
    
    // 1. Verificar se é inapropriada
    const isInappropriate = this.INAPPROPRIATE_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    if (isInappropriate) {
      return {
        isValid: false,
        isTourismRelated: false,
        isInappropriate: true,
        reason: 'Mensagem contém conteúdo inapropriado',
        suggestedResponse: '🦦 Desculpe, mas não posso responder a esse tipo de pergunta. Posso te ajudar com informações sobre turismo em Mato Grosso do Sul! 😊'
      };
    }
    
    // 2. Verificar se tem palavras de turismo
    const hasTourismKeywords = this.TOURISM_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    // 3. Verificar se tem palavras fora do escopo
    const hasOffScopeKeywords = this.OFF_SCOPE_KEYWORDS.some(
      keyword => lowerQuestion.includes(keyword)
    );
    
    // 4. Decisão
    if (hasOffScopeKeywords && !hasTourismKeywords) {
      // Tem palavras fora do escopo E não tem palavras de turismo = FORA DO ESCOPO
      return {
        isValid: false,
        isTourismRelated: false,
        isInappropriate: false,
        reason: 'Pergunta fora do escopo de turismo',
        suggestedResponse: '🦦 Olá! Eu sou o Guatá, seu guia de turismo de Mato Grosso do Sul! 😊\n\nPosso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS. Mas não consigo ajudar com questões sobre Detran, IPVA, documentação ou outros serviços governamentais.\n\nO que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟'
      };
    }
    
    // Se tem palavras de turismo OU não tem palavras problemáticas = OK
    if (hasTourismKeywords || !hasOffScopeKeywords) {
      return {
        isValid: true,
        isTourismRelated: true,
        isInappropriate: false
      };
    }
    
    // Caso ambíguo: não tem palavras claras de turismo nem fora do escopo
    // Neste caso, permitir mas adicionar instrução no prompt para o Gemini verificar
    return {
      isValid: true,
      isTourismRelated: false, // Ambíguo
      isInappropriate: false
    };
  }
}
```

### 2. **Integrar Validação no Fluxo**

Modificar `guataIntelligentTourismService.ts` ou `guataGeminiService.ts`:

```typescript
import { TourismScopeValidator } from '@/services/ai/validation/tourismScopeValidator';

// No início do processQuestion:
const validator = new TourismScopeValidator();
const validation = validator.validateQuestion(question);

if (!validation.isValid) {
  return {
    answer: validation.suggestedResponse || 'Desculpe, não posso ajudar com isso.',
    confidence: 0.9,
    sources: [],
    processingTime: 0,
    // ... outros campos
  };
}
```

### 3. **Adicionar Instruções no Prompt do Gemini**

Modificar `buildPrompt` em `guataGeminiService.ts`:

```typescript
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
- Se receber uma pergunta fora do escopo, responda educadamente:
  "🦦 Olá! Eu sou o Guatá, seu guia de turismo de Mato Grosso do Sul! 😊
  
  Posso te ajudar com informações sobre destinos, atrações, gastronomia, hospedagem, eventos e roteiros turísticos em MS. Mas não consigo ajudar com questões sobre [tema da pergunta].
  
  O que você gostaria de saber sobre turismo em Mato Grosso do Sul? 🌟"
- NUNCA invente informações sobre serviços governamentais ou outros assuntos fora do escopo
- Seja sempre educado e ofereça alternativas relacionadas a turismo
```

### 4. **Melhorar Filtro de Conteúdo Inapropriado**

Expandir `contentUtils.ts`:

```typescript
export const containsOffensiveContent = (text: string): boolean => {
  const offensiveTerms = [
    // Ofensas
    'idiota', 'burro', 'estúpido', 'imbecil', 'retardado',
    // Discriminação
    'racismo', 'homofobia', 'xenofobia', 'preconceito', 'nazista',
    // Violência
    'matar', 'assassinar', 'violência extrema',
    // Spam
    'spam', 'propaganda não solicitada',
    // Outros
    'hack', 'crack', 'pirataria'
  ];
  
  const lowerText = text.toLowerCase();
  return offensiveTerms.some(term => lowerText.includes(term));
};
```

## 📊 Fluxo de Validação

```
Usuário envia pergunta
    ↓
1. Verificar conteúdo inapropriado
    ↓ (se inapropriado)
    → Bloquear e retornar mensagem educada
    ↓ (se OK)
2. Verificar escopo de turismo
    ↓ (se fora do escopo)
    → Retornar mensagem explicando o escopo
    ↓ (se OK)
3. Processar normalmente com Gemini
    ↓
4. Gemini também verifica no prompt
    ↓
5. Retornar resposta
```

## ✅ Benefícios

1. ✅ **Foco em turismo**: Guatá só responde sobre turismo
2. ✅ **Proteção**: Bloqueia conteúdo inapropriado
3. ✅ **Educação**: Usuário entende o escopo do bot
4. ✅ **Experiência**: Respostas mais relevantes e úteis
5. ✅ **Segurança**: Previne uso inadequado

## 🎯 Implementação

**Arquivos a modificar:**
1. ✅ Criar `src/services/ai/validation/tourismScopeValidator.ts`
2. ✅ Modificar `src/services/ai/guataIntelligentTourismService.ts` (adicionar validação)
3. ✅ Modificar `src/services/ai/guataGeminiService.ts` (adicionar validação + instruções no prompt)
4. ✅ Melhorar `src/components/ai/utils/contentUtils.ts` (expandir filtro)

**Quer que eu implemente essa solução?**


