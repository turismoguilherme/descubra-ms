# 🔧 Guia Completo: Configuração de Tradução

## 🚀 SOLUÇÃO MAIS FÁCIL: LibreTranslate (GRATUITA)

Se você está tendo problemas com o Google Cloud, use o **LibreTranslate** - é gratuito e não requer configuração!

### ✅ Como usar LibreTranslate (Recomendado):

1. **Não precisa configurar nada!** Já está funcionando
2. **Teste executando:**
   ```bash
   node test-google-translate.js
   ```
3. **Resultado esperado:**
   ```
   ✅ LibreTranslate funcionando!
   ```
4. **Configure no Vercel (opcional):**
   ```
   VITE_LIBRE_TRANSLATE_URL=https://libretranslate.de
   ```

### 🎯 Vantagens do LibreTranslate:
- ✅ **100% Gratuito** - Sem limites
- ✅ **Sem cadastro** - Funciona imediatamente
- ✅ **Sem chaves API** - Não precisa configurar nada
- ✅ **Qualidade boa** - Suficiente para turismo

---

# 🔧 Configuração Google Translate API (Opcional)

## ❌ Problemas Comuns e Soluções

### Problema 1: "Você não tem permissão para acessar este projeto"
**Sintomas**: Erro de permissão ao tentar acessar APIs

**Soluções**:
1. **Verificar conta correta**:
   - Use a conta Google que criou o projeto
   - Se for conta Workspace/GSuite, peça permissão ao admin

2. **Verificar papel (Role)**:
   - Vá para: IAM & Admin → IAM
   - Procure seu email na lista
   - Deve ter pelo menos: `Editor` ou `Owner`

### Problema 2: "API não está ativada neste projeto"
**Sintomas**: API aparece como "desativada"

**Solução**:
1. Vá para: APIs & Services → Library
2. Procure por "Cloud Translation API"
3. Clique em "Ativar"

### Problema 3: "Cobrança não ativada"
**Sintomas**: "Billing account required"

**Solução**:
1. Vá para: Billing → Conta de faturamento
2. Crie ou vincule uma conta de cobrança
3. **IMPORTANTE**: A API é gratuita até 500.000 caracteres/mês!

### Problema 4: "Conta Pessoal vs Workspace"
**Sintomas**: Confusão entre contas

**Solução**:
- **Conta Pessoal**: cloud.google.com
- **Workspace**: admin.google.com ou console.cloud.google
- Use sempre a mesma conta para tudo

---

## 📋 Checklist Completo de Setup

### ✅ Passo 1: Acessar Console Correto
```
URL: https://console.cloud.google.com/
Conta: Mesma usada para o Gemini
```

### ✅ Passo 2: Selecionar Projeto
- Clique no seletor de projetos (topo)
- Escolha o projeto onde está o Gemini

### ✅ Passo 3: Ativar API
```
APIs & Services → Library
Buscar: "Cloud Translation API"
Clicar: "Ativar"
```

### ✅ Passo 4: Criar Chave API
```
APIs & Services → Credentials
"+ CREATE CREDENTIALS" → API key
Copiar a chave gerada
```

### ✅ Passo 5: Restringir Chave (Opcional/Seguro)
```
Editar chave → Restrições
Aplicar a: Cloud Translation API
```

### ✅ Passo 6: Configurar no Vercel
```bash
VITE_GOOGLE_TRANSLATE_API_KEY=sua-chave-aqui
```

---

## ✅ Solução 3: Painel de Administração

**Como acessar:**
1. Vá para: `https://descubrams.com/viajar/admin`
2. Faça login como administrador
3. No menu lateral, vá para: **Sistema → Traduções**

**Funcionalidades do painel:**
- 📊 **Dashboard com estatísticas** - Veja quantos conteúdos têm tradução
- 🔄 **Geração automática** - Botão "Gerar Traduções Faltantes"
- 📋 **Lista detalhada** - Visualize todos os conteúdos e suas traduções
- ✅ **Status visual** - Verde = traduzido, Vermelho = pendente
- 🌍 **Suporte multi-idioma** - pt-BR, en-US, es-ES, fr-FR, de-DE

**Como usar:**
1. **Verificar status** - Veja quantos conteúdos precisam tradução
2. **Gerar traduções** - Clique em "Gerar Traduções Faltantes"
3. **Acompanhar progresso** - Barra de progresso mostra andamento
4. **Testar** - Mude idioma no site para ver traduções funcionando

### 🔧 Solução 4: Script Node.js (Avançado)

Para traduções em massa via linha de comando:

```bash
# 1. Instalar dependências
npm install dotenv node-fetch

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Adicionar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Executar script
node generate-missing-translations.js
```

**Vantagens:** Processa todos os conteúdos de uma vez
**Desvantagens:** Requer acesso ao terminal/projeto

---

## 🧪 Teste da API

Execute este comando no terminal para testar:

```bash
node test-google-translate.js
```

Ou teste manualmente:

```bash
curl -X POST \
  "https://translation.googleapis.com/language/translate/v2?key=SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{"q":"Olá mundo","target":"en","source":"pt"}'
```

**Resposta esperada**:
```json
{
  "data": {
    "translations": [
      {
        "translatedText": "Hello world",
        "detectedSourceLanguage": "pt"
      }
    ]
  }
}
```

---

## 🚨 Soluções Avançadas

### Se ainda não funcionar:

1. **Verificar limites de quota**:
   - APIs & Services → Quotas
   - Verificar se não atingiu limites

2. **Testar com Postman**:
   - Importar a requisição de teste
   - Verificar resposta da API

3. **Criar novo projeto**:
   - Às vezes reiniciar resolve problemas de permissão
   - Criar projeto do zero com a API

4. **Suporte Google**:
   - Google Cloud Support
   - Stack Overflow
   - Documentação oficial

---

## 💡 Dicas Importantes

- **Custo**: GRÁTIS até 500.000 caracteres/mês
- **Limites**: 6.000.000 caracteres/dia (gratuito)
- **Segurança**: Restrinja chaves por API/domínio
- **Monitoramento**: Acompanhe uso no Console

---

## 🔍 Status Atual do Projeto

Após configurar, o sistema irá:
- ✅ Traduzir automaticamente todo conteúdo novo
- ✅ Fallback: Google Translate → Gemini → Original
- ✅ Suporte: pt-BR, en-US, es-ES, fr-FR, de-DE

**Configure a API e teste com o script acima!** 🚀
