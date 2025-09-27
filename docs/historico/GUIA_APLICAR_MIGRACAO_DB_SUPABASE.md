## Guia: Como Aplicar Migrações do Banco de Dados Supabase (Tabela `tourism_reviews`)

Este documento contém as instruções para aplicar a migração da tabela `tourism_reviews` (para avaliações e comentários) ao seu banco de dados Supabase. Esta etapa é crucial para que as funcionalidades de avaliação de roteiros e checkpoints funcionem corretamente.

### Pré-requisitos

Certifique-se de ter:

1.  **Supabase CLI instalada:** Verifique executando `supabase --version` no seu terminal.
2.  **Projeto Supabase vinculado:** Seu ambiente local deve estar vinculado ao seu projeto remoto. Se não estiver, use o comando de link (já executado, mas bom para referência):
    `supabase link --project-ref <SEU_ID_DO_PROJETO>`
3.  **A senha do seu banco de dados Supabase:** Esta é a senha que você definiu ao criar ou redefinir no painel do Supabase. **É fundamental que esta senha esteja correta.**

### Passos para Aplicar a Migração

Para aplicar as migrações pendentes, incluindo a tabela `tourism_reviews`, execute o seguinte comando no seu terminal, na raiz do projeto `descubra-ms`:

```bash
supabase db push --password <SUA_SENHA_DO_BANCO_DE_DADOS>
```

**Observações Importantes:**

*   **Substitua `<SUA_SENHA_DO_BANCO_DE_DADOS>`** pela senha *exata* do seu banco de dados Supabase. Coloque-a diretamente no comando como mostrado.
*   **Não interrompa o comando:** Uma vez que você execute o comando, deixe-o rodar até o final. Ele pode levar alguns minutos para ser concluído, dependendo do número de migrações e da sua conexão de internet. Interromper o comando pode deixar o estado do seu banco de dados inconsistente.
*   **Saída do Comando:** Ao final da execução, verifique a saída do terminal para confirmar se a migração `20250722000000_create_tourism_reviews_table.sql` foi aplicada com sucesso.
    *   Se houver erros de autenticação (`failed SASL auth` ou similar), isso indica que a senha está incorreta. Você precisará redefinir a senha no painel do Supabase e tentar novamente.
    *   Se vir mensagens como "Skipping migration...", mas não houver erros fatais, é provável que as migrações já tenham sido aplicadas ou que os nomes dos arquivos antigos não estejam no formato esperado (o que já foi notado e não impede novas migrações).

### Verificação no Painel do Supabase

Após a execução do comando, você pode verificar diretamente no Painel do Supabase se a tabela `public.tourism_reviews` foi criada:

1.  Acesse o Painel do Supabase do seu projeto.
2.  Vá para a seção **Database** (Banco de Dados).
3.  Clique em **Tables** (Tabelas).
4.  Procure pela tabela `public.tourism_reviews` na lista.

### Próximos Passos (Após a Migração bem-sucedida)

Uma vez que a tabela `tourism_reviews` esteja confirmada no seu banco de dados, podemos prosseguir com as etapas de desenvolvimento do frontend:

*   **Definir as interfaces TypeScript** para as avaliações (`TourismReview`).
*   **Criar um serviço** (`tourismReviewService`) para interagir com a nova tabela no Supabase.
*   **Integrar a funcionalidade de avaliações** na interface do usuário (criação e exibição). 