# Guia de Sincronização do Ambiente Supabase

Este documento orienta como alinhar o ambiente local com o banco de dados remoto do Supabase, garantindo que o desenvolvimento siga sem conflitos de migração ou divergências de schema.

---

## 1. Pré-requisitos
- Docker Desktop instalado e em execução.
- Supabase CLI instalado e atualizado.
- Acesso ao painel do Supabase e credenciais do projeto.
- Terminal aberto na raiz do projeto.

---

## 2. Passos para Sincronização

### 2.1. Limpeza e backup das migrações locais (já realizado)
- Faça backup da pasta de migrações:
  ```bash
  cp -r supabase/migrations supabase/migrations_backup
  ```
- Limpe a pasta de migrações locais, se necessário.

### 2.2. Puxar o esquema do banco remoto
- Execute o comando abaixo na raiz do projeto:
  ```bash
  npx supabase db pull
  ```
- Isso irá baixar o schema atual do banco remoto e alinhar o ambiente local.

### 2.3. Conferir se o schema foi atualizado
- Verifique se não houve erros no comando acima.
- Confira se os arquivos de schema/migração foram atualizados corretamente.

### 2.4. Rodar o projeto localmente
- Instale as dependências e rode o projeto:
  ```bash
  npm install
  npm run dev
  ```
- Certifique-se de que o frontend está rodando e conectado ao Supabase.

---

## 3. Resolução de Problemas Comuns

- **Erro de autenticação SCRAM/SASL:**
  - Verifique se a senha do banco está correta e atualizada no painel do Supabase.
  - Tente redefinir a senha e atualizar as variáveis locais.
  - Certifique-se de que as configurações de rede do Supabase permitem acesso externo.
  - Execute o terminal como administrador.

- **Erro de conexão com Docker:**
  - Certifique-se de que o Docker Desktop está instalado e em execução.
  - Abra o terminal como administrador.

- **Erro 404 ao instalar Supabase CLI:**
  - Verifique o registro do npm:
    ```bash
    npm config get registry
    ```
  - Limpe o cache do npm:
    ```bash
    npm cache clean --force
    ```
  - Tente instalar novamente:
    ```bash
    npm install -g supabase-cli
    ```

---

## 4. Recomendações
- Sempre sincronize o schema local antes de criar novas migrações.
- Documente qualquer alteração relevante no ambiente.
- Mantenha o Docker e o Supabase CLI atualizados.

---

## 5. Próximos Passos
- Com o ambiente sincronizado, prossiga para o desenvolvimento de novas features, criação de migrações e testes.
- Consulte este guia sempre que houver problemas de sincronização ou dúvidas sobre o ambiente.

---

*Este documento deve ser atualizado sempre que houver mudanças relevantes no fluxo de sincronização ou ferramentas utilizadas.* 