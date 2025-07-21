# Plano de Ação: Resumo de Progresso do Projeto Descubra MS

Este documento resume as fases e funcionalidades que foram abordadas e as que ainda permanecem pendentes, de acordo com o plano de ação e as interações até o momento.

---

## ✅ Fases e Funcionalidades Concluídas (ou com avanço significativo):

*   **Fase 1: Configuração Inicial do Ambiente de Desenvolvimento**
    *   Instalação e configuração inicial do ambiente (Vite, React, TypeScript, Supabase CLI).
    *   Configuração de rotas básicas e estrutura do projeto.

*   **Fase 2, Etapa 3 (Parte de Backend): Aprimoramento do Módulo de Cadastro Manual de Eventos - Lógica de Expiração**
    *   **Criação da função SQL `public.auto_expire_events()` no Supabase:** Esta função foi criada e é responsável por:
        *   Marcar eventos como inativos (`is_active = FALSE`) na tabela `public.events` quando a `end_date` for ultrapassada.
        *   Marcar eventos como não visíveis (`is_visible = FALSE`) na tabela `public.event_details` quando `auto_hide` for `TRUE` e `visibility_end_date` for ultrapassada.
    *   **Agendamento da função como Cron Job no Supabase:** A função `auto_expire_events()` foi agendada para ser executada periodicamente no Supabase (configurado para "Every 5 minutes" para testes, ou "Every day at midnight" para produção).

---

## ⚠️ Problemas/Bugs Atuais (Prioridade de Resolução Sugerida):

*   **Problema de Autenticação / Redirecionamento Inesperado para Login:**
    *   **Sintoma:** Usuários administradores (especialmente `gestor_municipal`) são redirecionados para a página de login ao tentar acessar áreas protegidas (como o editor de eventos), mesmo após o login.
    *   **Diagnóstico Atual:** Identificamos que o `userProfile` no `AuthContext` está sendo `null` em alguns momentos críticos de hooks como `useMultiTenant` e `useStateConfig`. Isso causa inconsistência na verificação de permissões. O "login simulado" (via `testDashboards.ts`) foi um fator que dificultou a depuração inicial, pois o `AuthProvider` depende da autenticação real do Supabase.
    *   **Status do Erro `406 Not Acceptable`:** O erro `406 Not Acceptable` para a tabela `flowtrip_states` foi persistentemente relacionado a políticas de Row Level Security (RLS) no Supabase. Embora o RLS tenha sido mostrado como desativado via UI, a persistência do `userProfile: null` ainda impede a recuperação correta dos dados dessa tabela no frontend, impactando o fluxo.
    *   **Próximo Passo Sugerido:** Resolver a condição de corrida no `AuthProvider` e garantir que o `userProfile` esteja sempre populado antes que os componentes que dependem dele sejam renderizados e façam requisições.

---

## ⏳ Fases e Funcionalidades Pendentes no Plano de Ação:

*   **Fase 2, Etapa 3 (Parte de Frontend): Aprimoramento do Módulo de Cadastro Manual de Eventos - Filtragem de Eventos Expirados**
    *   Ajustar as queries de busca e exibição de eventos no frontend (`src/pages/Eventos.tsx`, `src/pages/EventsManagement.tsx`, etc.) para que respeitem as flags `is_active` e `is_visible` atualizadas pela função de backend. Isso garantirá que eventos expirados não sejam mais exibidos para os usuários finais ou sejam marcados adequadamente nos painéis de gerenciamento.

*   **Fase 3: Módulo de Passaporte Digital**
    *   Permitir que gestores criem e gerenciem rotas com múltiplas cidades.
    *   Configurar recompensas baseadas em geolocalização (offline/online).
    *   Definir e atribuir selos temáticos (ex: animais do Pantanal).
    *   Desenvolvimento de interface para o usuário final interagir com o passaporte.

*   **Fase 4: Integração com APIs de Eventos (Ex: Sympla)**
    *   Automatizar a busca e importação de eventos de fontes externas (Sympla, TripAdvisor, APIs governamentais, etc.).
    *   Processamento e armazenamento desses dados de eventos importados.
    *   Integração dos eventos importados com o assistente de IA, Guatá (para que ele possa responder perguntas sobre eles).

*   **Fase 5: Escalabilidade e Planejamento Participativo**
    *   Aprimoramento da arquitetura multi-tenant (com base em `flowtrip_states`) para suportar diferentes estados e municípios de forma mais robusta.
    *   Desenvolvimento de funcionalidades para planejamento turístico participativo (ex: fóruns, votação de ideias, feedback de residentes).

*   **Fase 6: IA para Planejamento Turístico Estratégico**
    *   Pesquisa e implementação de como a IA pode analisar dados de turismo (existentes e coletados) para auxiliar gestores públicos no desenvolvimento de planos estratégicos (ex: identificação de tendências, otimização de rotas, previsão de demanda).

--- 