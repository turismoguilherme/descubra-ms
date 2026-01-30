# Padrões de Código - Descubra MS

Este documento descreve os padrões de código que devem ser seguidos no projeto.

## Tratamento de Erros

### ✅ SEMPRE faça assim:

```typescript
import { getErrorMessage } from '@/utils/errorUtils';

try {
  // código que pode gerar erro
  await fazerAlgo();
} catch (error: unknown) {
  const message = getErrorMessage(error, 'Mensagem padrão caso erro seja desconhecido');
  console.error(message);
  setError(message);
  // ou
  toast({
    title: 'Erro',
    description: message,
    variant: 'destructive',
  });
}
```

### ❌ NUNCA faça assim:

```typescript
// ❌ ERRADO - Usa 'any' (desabilita verificação de tipos)
catch (error: any) {
  console.error(error.message);  // Perigoso! Pode quebrar em runtime
}

// ❌ ERRADO - Acessa propriedade de 'unknown' (erro de tipo)
catch (error: unknown) {
  console.error(error.message);  // TypeScript vai reclamar!
}

// ❌ ERRADO - Não trata o erro adequadamente
catch (error: unknown) {
  console.error(error);  // Não extrai mensagem de forma segura
}
```

## Por que usar `unknown` e `getErrorMessage`?

1. **Segurança de tipos**: `unknown` força você a verificar o tipo antes de usar
2. **Prevenção de erros**: `getErrorMessage` trata todos os casos (Error, string, objeto, etc.)
3. **Consistência**: Todo o código trata erros da mesma forma
4. **Manutenibilidade**: Mais fácil de debugar e manter

## Uso de `any`

### ⚠️ Evite usar `any`

O TypeScript foi criado para ter segurança de tipos. Usar `any` desabilita isso.

```typescript
// ❌ EVITE
const [data, setData] = useState<any>(null);

// ✅ PREFIRA
interface MyData {
  id: string;
  name: string;
}
const [data, setData] = useState<MyData | null>(null);
```

### Quando `any` é aceitável?

Apenas em casos muito específicos:
- Integração com bibliotecas externas sem tipos
- Dados dinâmicos que realmente podem ser qualquer coisa
- Migração gradual de código JavaScript para TypeScript

**Sempre documente o motivo** quando usar `any`:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// TODO: Tipar adequadamente quando a biblioteca fornecer tipos
const result: any = externalLibrary.call();
```

## Snippets do Editor

Use os snippets configurados para escrever código correto rapidamente:

- `catch-safe`: Gera catch block type-safe
- `try-catch-safe`: Gera try-catch completo
- `import-error-utils`: Importa getErrorMessage

## Checklist antes de Commit

Antes de fazer commit, verifique:

- [ ] Catch blocks usam `error: unknown` (não `any`)
- [ ] Usa `getErrorMessage()` para extrair mensagens de erro
- [ ] Não há `useState<any>` sem necessidade real
- [ ] Type guards quando necessário
- [ ] ESLint não mostra avisos sobre `any` ou acesso inseguro

## Executando ESLint

Para verificar se seu código está seguindo os padrões:

```bash
npm run lint
```

O ESLint vai avisar sobre:
- Uso de `any`
- Acesso inseguro a propriedades
- Atribuições inseguras

## Exemplos Práticos

### Exemplo 1: Tratamento de erro em função async

```typescript
async function loadData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Erro ao carregar dados');
    console.error(message);
    throw new Error(message);
  }
}
```

### Exemplo 2: Tratamento de erro com toast

```typescript
const handleSubmit = async () => {
  try {
    await submitForm();
    toast({ title: 'Sucesso!', description: 'Formulário enviado.' });
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Erro ao enviar formulário');
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive',
    });
  }
};
```

### Exemplo 3: Tratamento de erro do Supabase

```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
} catch (error: unknown) {
  // Supabase errors podem ter propriedade 'code'
  const errorWithCode = error && typeof error === 'object' && 'code' in error
    ? (error as { code?: string; message?: string })
    : null;
  
  if (errorWithCode?.code === '23505') {
    // Erro específico de constraint
    toast({ title: 'Erro', description: 'Registro já existe' });
  } else {
    const message = getErrorMessage(error, 'Erro ao salvar');
    toast({ title: 'Erro', description: message });
  }
}
```

## Recursos

- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook - Error Handling](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4.0.html#unknown-on-catch-clause-bindings)
- Helper: `src/utils/errorUtils.ts`

