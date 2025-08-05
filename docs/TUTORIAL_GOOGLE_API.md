# 🚀 TUTORIAL: CONFIGURAR GOOGLE SEARCH API

## **📋 O QUE VOCÊ VAI PRECISAR:**

- Conta Google (gmail)
- 5 minutos do seu tempo
- Nenhum conhecimento técnico necessário

## **🎯 PASSO A PASSO:**

### **PASSO 1: Criar Projeto no Google Cloud**

1. **Acesse:** https://console.cloud.google.com/
2. **Faça login** com sua conta Google
3. **Clique em "Selecionar projeto"** (canto superior esquerdo)
4. **Clique em "Novo projeto"**
5. **Digite o nome:** "Guatá MS"
6. **Clique em "Criar"**

### **PASSO 2: Ativar a API**

1. **No menu lateral, clique em "APIs e serviços"**
2. **Clique em "Biblioteca"**
3. **Digite na busca:** "Custom Search API"
4. **Clique no resultado "Custom Search API"**
5. **Clique em "Ativar"**

### **PASSO 3: Criar Chave da API**

1. **No menu lateral, clique em "APIs e serviços"**
2. **Clique em "Credenciais"**
3. **Clique em "Criar credenciais"**
4. **Selecione "Chave de API"**
5. **Copie a chave que aparecer** (algo como: AIzaSyC...)

### **PASSO 4: Criar Search Engine**

1. **Acesse:** https://programmablesearchengine.google.com/
2. **Clique em "Criar um mecanismo de pesquisa"**
3. **Configure:**
   - **Nome:** "Guatá MS Search"
   - **Descrição:** "Busca para turismo em MS"
   - **Sites para pesquisar:** Deixe em branco (busca em toda web)
4. **Clique em "Criar"**
5. **Copie o ID do mecanismo** (algo como: 123456789:abcdef...)

### **PASSO 5: Configurar no Projeto**

1. **Crie um arquivo chamado `.env` na raiz do projeto**
2. **Adicione estas linhas:**

```env
GOOGLE_SEARCH_API_KEY=sua_chave_aqui
GOOGLE_SEARCH_ENGINE_ID=seu_id_aqui
```

3. **Substitua:**
   - `sua_chave_aqui` pela chave do PASSO 3
   - `seu_id_aqui` pelo ID do PASSO 4

## **✅ TESTE RÁPIDO:**

Após configurar, teste fazendo uma pergunta:

```
"Hotéis em Campo Grande"
```

**Se funcionar:** Você verá informações reais de hotéis
**Se não funcionar:** Verá mensagem de direcionamento para sites oficiais

## **💰 CUSTOS:**

- **Gratuito:** 100 consultas por dia
- **Pago:** $5 por 1000 consultas (apenas se usar muito)

## **🔧 EXEMPLO PRÁTICO:**

### **ANTES (sem API):**
```
Usuário: "Restaurantes em Bonito"
Guatá: "Restaurante Feira Central - (67) 3255-5678" ❌ FALSO!
```

### **DEPOIS (com API):**
```
Usuário: "Restaurantes em Bonito"
Guatá: 🔍 Buscando...
       ✅ ENCONTRADO: Restaurante Casa do João
       📍 Rua 24 de Fevereiro, 456
       🍽️ Especialidade: Sobá regional
       🔗 Site: https://casadojoao.com.br
```

## **🚨 PROBLEMAS COMUNS:**

### **Erro: "API keys não configuradas"**
**Solução:** Verifique se o arquivo `.env` está na raiz do projeto

### **Erro: "Nenhum resultado encontrado"**
**Solução:** Verifique se o Search Engine ID está correto

### **Erro: "Quota exceeded"**
**Solução:** Aguarde até o próximo dia (limite diário)

## **📞 PRECISA DE AJUDA?**

Se tiver dúvidas em qualquer passo, me avise! Posso ajudar com screenshots e explicações mais detalhadas.

---

**🎯 RESULTADO FINAL:**
Com a API configurada, o Guatá nunca mais inventará informações e sempre fornecerá dados reais e atualizados! 