# 🔍 VERIFICAÇÃO DA CHAVE DE API DO GOOGLE CUSTOM SEARCH

## ✅ CHECKLIST DE VERIFICAÇÃO

### 1. **Verificar se a chave no código corresponde à chave editada**

**Chave no código:**
```
AIzaSyAjh12gRofCgSf6-y1-ckvrDyT7ICuW7XY
```

**Como verificar:**
1. No Google Cloud Console, na página de edição da chave
2. Procure pelo campo que mostra o valor completo da chave
3. Compare com a chave acima
4. Se forem diferentes, atualize o código ou use a chave correta

---

### 2. **Verificar se a API Custom Search está HABILITADA no projeto**

**URL para verificar:**
```
https://console.cloud.google.com/apis/library/customsearch.googleapis.com?project=gen-lang-client-0847008941
```

**O que verificar:**
- ✅ Deve mostrar "HABILITADA" ou "ENABLED"
- ❌ Se mostrar "Habilitar" ou "Enable", clique para habilitar
- ⏱️ Aguarde 1-2 minutos após habilitar

---

### 3. **Verificar as restrições da chave**

**Opção A: Sem restrições (deve funcionar)**
- ✅ "Não restringir a chave" selecionado
- ✅ Deve funcionar para todas as APIs

**Opção B: Com restrições (recomendado)**
- ✅ "Restringir chave" selecionado
- ✅ "Custom Search API" deve estar na lista de APIs permitidas
- ✅ Clique em "Salvar"
- ⏱️ Aguarde 1-2 minutos

---

### 4. **Verificar o projeto correto**

**Projeto no código:** Não especificado (usa a chave diretamente)

**Projeto na imagem:** `gen-lang-client-0847008941` (GuataIA)

**Importante:**
- A chave deve estar no mesmo projeto onde a API Custom Search está habilitada
- Se a chave estiver em outro projeto, você precisa:
  1. Habilitar Custom Search API no projeto da chave, OU
  2. Criar uma nova chave no projeto correto

---

### 5. **Verificar o Search Engine ID**

**Engine ID no código:**
```
a3641e1665f7b4909
```

**Como verificar:**
1. Acesse: https://cse.google.com/cse/
2. Verifique se o Engine ID existe e está ativo
3. Confirme que está configurado para buscar "toda a web"

---

## 🔧 PASSOS PARA CORRIGIR O ERRO 400

### **Cenário 1: Chave diferente**
Se a chave editada não for `AIzaSyAjh12gRofCgSf6-y1-ckvrDyT7ICuW7XY`:

1. Copie a chave que está sendo editada no Google Cloud Console
2. Atualize o código em `src/services/ai/guataRealWebSearchService.ts` linha 93
3. Ou configure a variável de ambiente `VITE_GOOGLE_SEARCH_API_KEY`

### **Cenário 2: API não habilitada**
Se a Custom Search API não estiver habilitada:

1. Acesse: https://console.cloud.google.com/apis/library/customsearch.googleapis.com?project=gen-lang-client-0847008941
2. Clique em "HABILITAR" ou "ENABLE"
3. Aguarde 1-2 minutos
4. Teste novamente

### **Cenário 3: Projeto diferente**
Se a chave estiver em um projeto diferente:

1. Verifique em qual projeto a chave está (na URL da edição)
2. Se for diferente de `gen-lang-client-0847008941`:
   - Opção A: Habilitar Custom Search API no projeto da chave
   - Opção B: Criar nova chave no projeto correto

---

## 🧪 TESTE RÁPIDO

Após fazer as correções:

1. **Recarregue a página** do chat (Ctrl+F5 ou Cmd+Shift+R)
2. **Faça uma pergunta** no chat
3. **Verifique o console** do navegador (F12)
4. **Procure por:**
   - ✅ `✅ Encontrados X resultados REAIS do Google` (sucesso)
   - ❌ `❌ Google Search API: Chave de API inválida` (ainda com erro)

---

## 📝 NOTAS IMPORTANTES

- ⏱️ **Propagação:** Mudanças no Google Cloud Console podem levar até 5 minutos para serem aplicadas
- 🔑 **Segurança:** Recomenda-se usar restrições de API mesmo em desenvolvimento
- 🌐 **Engine ID:** Deve estar configurado para buscar "toda a web" no CSE
- 🔄 **Cache:** O código tem cache de 30 minutos, então resultados antigos podem aparecer

---

## 🆘 SE AINDA NÃO FUNCIONAR

1. **Verifique o console do navegador** para mensagens de erro específicas
2. **Teste a chave diretamente** usando:
   ```
   https://www.googleapis.com/customsearch/v1?key=SUA_CHAVE&cx=a3641e1665f7b4909&q=teste
   ```
3. **Verifique se há quotas excedidas** no Google Cloud Console
4. **Crie uma nova chave** se necessário


