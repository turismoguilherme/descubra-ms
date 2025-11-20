# 🔧 CORREÇÕES DE ERROS DO CONSOLE

## ✅ **CORREÇÕES APLICADAS**

### **1. ✅ Google Search API - Espaços nas Chaves**
**Problema:** As chaves da API tinham espaços no final (`%20`), causando erro 400.

**Solução:** Adicionado `.trim()` nas chaves:
- `src/services/ai/search/googleSearchAPI.ts`
- `src/services/private/regionalDataService.ts`

```typescript
// ANTES
private readonly API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;

// DEPOIS
private readonly API_KEY = (import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '').trim();
```

### **2. ✅ Gemini API - Endpoint Incorreto**
**Problema:** Usando `gemini-pro` que retorna 404. Deveria usar `gemini-1.5-flash`.

**Solução:** Atualizado endpoint em `src/services/ai/GeminiAIService.ts`:
```typescript
// ANTES
const response = await this.makeRequest('/models/gemini-pro:generateContent', data);

// DEPOIS
const response = await this.makeRequest('/models/gemini-1.5-flash:generateContent', data);
```

---

## ⚠️ **PROBLEMAS QUE PRECISAM SER RESOLVIDOS NO SUPABASE**

### **1. ❌ Tabelas Não Existem (404)**

As seguintes tabelas precisam ser criadas no Supabase:

#### **Tabelas Necessárias:**
1. `viajar_diagnostic_results` - Resultados do diagnóstico
2. `cat_ai_conversations` - Conversas da IA
3. `business_goals` - Metas do negócio
4. `business_evolution_history` - Histórico de evolução
5. `viajar_documents` - Documentos enviados
6. `users` - Usuários (pode já existir, mas precisa verificar)
7. `user_profiles` - Perfis de usuário

#### **Solução:**
Criar migrations no Supabase ou executar SQL manualmente. Exemplo:

```sql
-- Exemplo de criação de tabela
CREATE TABLE IF NOT EXISTS viajar_diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  analysis_result JSONB NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_diagnostic_user_id ON viajar_diagnostic_results(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_created_at ON viajar_diagnostic_results(created_at DESC);
```

### **2. ❌ Bucket Storage Não Existe**

**Problema:** O bucket `viajar-documents` não existe no Supabase Storage.

**Solução:**
1. Acessar Supabase Dashboard
2. Ir para Storage
3. Criar bucket `viajar-documents`
4. Configurar políticas de acesso (RLS)

---

## 🔍 **ERROS NÃO CRÍTICOS (Podem ser ignorados)**

### **1. CORS Errors - Serviços Externos**
- `cdn.gpteng.co/gptengineer.js` - Script externo, não crítico
- `lucid.thereadme.com/api/39/envelope/` - Sentry, não crítico

**Solução:** Esses erros não afetam a funcionalidade principal. Podem ser ignorados ou removidos se não forem necessários.

### **2. SecurityHeaders.tsx - CSP Warning**
**Problema:** `frame-ancestors` não funciona em `<meta>` tags.

**Solução:** Se necessário, configurar CSP via headers HTTP no servidor.

---

## 📋 **CHECKLIST DE CORREÇÕES**

### **✅ Feito:**
- [x] Remover espaços das chaves da Google Search API
- [x] Corrigir endpoint do Gemini API

### **⏳ Pendente (Requer Acesso ao Supabase):**
- [ ] Criar tabela `viajar_diagnostic_results`
- [ ] Criar tabela `cat_ai_conversations`
- [ ] Criar tabela `business_goals`
- [ ] Criar tabela `business_evolution_history`
- [ ] Criar tabela `viajar_documents`
- [ ] Verificar/criar tabela `users`
- [ ] Verificar/criar tabela `user_profiles`
- [ ] Criar bucket `viajar-documents` no Storage
- [ ] Configurar políticas RLS para todas as tabelas

### **🔧 Melhorias Futuras:**
- [ ] Adicionar tratamento de erro melhor para tabelas não existentes
- [ ] Adicionar fallback quando APIs não estão configuradas
- [ ] Melhorar mensagens de erro para o usuário

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Verificar arquivo `.env`:**
   ```bash
   # Verificar se as chaves não têm espaços
   VITE_GOOGLE_SEARCH_API_KEY=AIzaSyCYbGmuHEOwz5kbJ5fJ9YPghAFq5e2etzk
   VITE_GOOGLE_SEARCH_ENGINE_ID=d29ed853fc8e94830
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```

2. **Criar tabelas no Supabase:**
   - Acessar Supabase Dashboard
   - Ir para SQL Editor
   - Executar migrations ou criar tabelas manualmente

3. **Criar bucket no Storage:**
   - Acessar Supabase Dashboard
   - Ir para Storage
   - Criar bucket `viajar-documents`

4. **Testar novamente:**
   - Limpar cache do navegador
   - Recarregar página
   - Verificar console para novos erros

---

**Status:** ✅ CORREÇÕES DE API APLICADAS - ⏳ AGUARDANDO CRIAÇÃO DE TABELAS NO SUPABASE


