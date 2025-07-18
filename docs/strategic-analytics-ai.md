# IA Consultora Estratégica

Este documento detalha a arquitetura e implementação da funcionalidade "IA Consultora Estratégica", projetada para fornecer insights analíticos sobre o comportamento do usuário na plataforma Descubra MS.

## Visão Geral da Arquitetura

A funcionalidade é composta por três partes principais:

1.  **Coleta de Dados (Frontend):** Um serviço no frontend captura interações relevantes do usuário e as envia para o banco de dados.
2.  **Processamento de IA (Backend):** Uma Supabase Edge Function recebe as perguntas do gestor, busca os dados de interação do usuário no banco de dados, e (futuramente) usará um modelo de linguagem da OpenAI para gerar insights.
3.  **Interface do Usuário (Frontend):** Um componente de chat permite que gestores façam perguntas em linguagem natural e visualizem as respostas geradas pela IA.

---

## 1. Coleta de Dados

### Tabela `user_interactions`

Para armazenar os dados de comportamento, foi criada a tabela `user_interactions` com a seguinte estrutura:

```sql
CREATE TABLE public.user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    event_type TEXT NOT NULL, -- Ex: 'page_view', 'destination_click'
    target_id TEXT, -- Ex: ID do destino, URL da página
    region_id INT REFERENCES public.regions(id),
    city_id INT REFERENCES public.cities(id),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

-   **RLS:** A tabela possui políticas de Row Level Security que permitem a inserção de dados pelo frontend (usuários anônimos e logados) e a leitura apenas por administradores e pela função de IA.

### `InteractionTrackerService` e Hooks

-   **`src/services/analyticsService.ts`:**
    -   O `InteractionTrackerService` foi criado para centralizar a lógica de envio de eventos de interação para a tabela `user_interactions`. Ele garante que todos os eventos sejam enviados de forma padronizada.

-   **`src/hooks/usePageTracking.ts`:**
    -   Este hook automatiza o rastreamento de visualizações de página. Ele deve ser usado em todas as páginas que desejamos monitorar. Atualmente, está implementado na página de detalhes de um destino.

---

## 2. Processamento de IA (Backend)

### Supabase Edge Function: `strategic-analytics-ai`

-   **Localização:** `supabase/functions/strategic-analytics-ai/`
-   **Propósito:** Orquestrar a geração de respostas da IA.
-   **Fluxo de Trabalho:**
    1.  Recebe uma requisição POST com a pergunta do usuário.
    2.  Valida a autenticação do usuário para garantir que apenas gestores autorizados possam usar a funcionalidade.
    3.  Busca dados relevantes da tabela `user_interactions` no banco de dados.
    4.  **(Fase Atual - Mock)** Retorna uma resposta simulada para validar o fluxo ponta a ponta.
    5.  **(Próxima Fase)** Enviará os dados coletados e a pergunta do usuário para a API da OpenAI para gerar uma análise estratégica.
    6.  Retorna a resposta da IA para o frontend.

### Deployment

Para implantar ou atualizar a função, utilize o comando da Supabase CLI:

```bash
supabase functions deploy strategic-analytics-ai
```

É necessário configurar a variável `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente do projeto no Supabase para que a função tenha acesso ao banco de dados.

---

## 3. Interface do Usuário

### `StrategicAnalyticsAI.tsx`

-   **Localização:** `src/components/analytics/StrategicAnalyticsAI.tsx`
-   **Descrição:** Este componente renderiza uma interface de chat moderna onde o gestor pode interagir com a IA. Ele gerencia o estado da conversa (mensagens, status de carregamento).

### `useStrategicAnalytics.ts`

-   **Localização:** `src/hooks/useStrategicAnalytics.ts`
-   **Descrição:** Este hook faz a ponte entre a interface (`StrategicAnalyticsAI.tsx`) e a Edge Function. Ele é responsável por:
    -   Enviar a pergunta do usuário para a função de backend.
    -   Receber a resposta da IA.
    -   Gerenciar o estado de carregamento e possíveis erros de comunicação. 