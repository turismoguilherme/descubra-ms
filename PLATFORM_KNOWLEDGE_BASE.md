# Base de Conhecimento da Plataforma FlowTrip / Descubra MS

Este documento serve como uma fonte de conhecimento consolidada sobre a arquitetura, funcionalidades e status de desenvolvimento da plataforma FlowTrip / Descubra MS, baseando-se em análises de código, documentação e estrutura do Supabase.

---

## 1. Visão Geral da Plataforma FlowTrip / Descubra MS

A plataforma **FlowTrip / Descubra MS** é um sistema abrangente de turismo digital, focado em promover, gerenciar e otimizar as atividades turísticas dentro do estado do Mato Grosso do Sul. Ela funciona como um ecossistema completo para visitantes, gestores e atendentes, integrando dados e serviços para aprimorar tanto a experiência turística quanto a gestão do setor.

**Propósito Principal:** Modernizar e otimizar a experiência turística no Mato Grosso do Sul, tanto para os visitantes quanto para os operadores e gestores do setor, visando aumentar o fluxo turístico, melhorar a qualidade do atendimento, facilitar a gestão do turismo, promover o engajamento dos turistas e garantir a segurança e a conformidade.

---

## 2. Tecnologias e Arquitetura Implementadas

### Frontend
*   **Tecnologias:** Vite, TypeScript, React, shadcn-ui, Tailwind CSS.
*   **Características:** Aplicação performática, tipagem forte, componentes reutilizáveis e estilização flexível. Ambiente de desenvolvimento ágil com recarregamento rápido.

### Backend e Banco de Dados (Supabase)
*   **Infraestrutura:** Supabase como "Backend as a Service" (BaaS).
*   **Banco de Dados:** PostgreSQL, gerenciado por migrações SQL (`supabase/migrations/`).
    *   **Estrutura de Dados:** Tabelas para `user_profiles`, `user_roles`, `destinations`, `events`, `routes`, `attendant_timesheet`, `ai_insights`, `flowtrip_clients`, `security_audit_log`, e muitas outras, indicando um esquema robusto para gestão de usuários, conteúdo turístico, dados de IA, operações e auditoria.
    *   **Lógica de Negócios:** Funções SQL como `assign_user_role`, `audit_table_changes`, `create_initial_admin_user` para lógica de negócios e segurança.
    *   **Segurança:** Implementação de Row Level Security (RLS) para controle de acesso granular aos dados.
*   **Edge Functions (Deno):** Localizadas em `supabase/functions/`.
    *   **Funções Existentes:** `delinha-ai`, `enhanced-security-monitor`, `guata-ai`, `security-monitor`, `strategic-analytics-ai`, `create-user`, `delete-user`, `_shared`.
    *   **Funcionalidade:** Exemplo da função `create-user` demonstra controle de acesso (apenas admins/tech) e uso da `SUPABASE_SERVICE_ROLE_KEY` para operações privilegiadas.

### Integrações e Mecanismos
*   **APIs Governamentais:** Integração com APIs oficiais (Ministério do Turismo, IBGE, INMET, ANTT, Fundtur-MS) para dados em tempo real.
*   **Sistema de Cache Inteligente:** Redução de chamadas desnecessárias e aumento de resiliência (5 minutos por requisição, chave única, limpeza automática).
*   **Sistema de Fallback:** Dados mockados para garantir continuidade do serviço quando APIs externas não estão disponíveis.
*   **Autenticação:** Gerenciamento de usuários e sessões via Supabase Auth, com configurações detalhadas em `supabase/config.toml` (incluindo `site_url`, `redirect_urls`, MFA, e-mail).

---

## 3. Funcionalidades Chave Implementadas

A plataforma FlowTrip / Descubra MS já possui as seguintes funcionalidades principais:

*   **Gestão de Usuários e Perfis:**
    *   Criação e gerenciamento de `user_profiles` (nome, avatar, bio, tipo de usuário, localização, preferências).
    *   Atribuição e gerenciamento de `user_roles` (admin, tech, diretor_estadual, gestor_igr, gestor_municipal, atendente, user).
    *   Autenticação robusta via Supabase Auth.
*   **Gestão de Conteúdo Turístico:**
    *   Cadastro e detalhamento de `destinations` (com `destination_details`), `events` (com `event_details`) e `routes` (com `route_checkpoints`).
    *   Organização de cidades, regiões e estados (`cities`, `regions`, `states`).
*   **Funcionalidades de Atendimento e Gestão Interna:**
    *   `attendant_timesheet` para controle de ponto.
    *   Dashboard do Atendente com funcionalidades para controle de check-ins, preparação para IA e visualização de dados de turistas.
*   **Inteligência Artificial (base):**
    *   Tabelas para `ai_insights` e `ai_master_insights` para armazenar dados e recomendações geradas por IA.
    *   Edge Functions dedicadas à IA (`delinha-ai`, `guata-ai`, `strategic-analytics-ai`).
    *   Preparação da interface para IA de atendimento (tradução automática, sugestão de roteiros, informações em tempo real).
*   **Gamificação e Engajamento do Usuário:**
    *   `passport_stamps` para registrar visitas a destinos/pontos.
    *   `user_achievements` e `user_levels` para sistema de pontos e conquistas.
    *   `user_interactions` para rastrear o comportamento do usuário.
*   **Gerenciamento Corporativo (FlowTrip):**
    *   Gestão de clientes (`flowtrip_clients`), faturas (`flowtrip_invoices`), assinaturas (`flowtrip_subscriptions`), onboarding (`flowtrip_onboarding_steps`), recursos por estado (`flowtrip_state_features`), métricas de uso (`flowtrip_usage_metrics`) e configurações white-label (`flowtrip_white_label_configs`).
*   **Conteúdo Institucional e Conhecimento:**
    *   `institutional_content` para informações gerais.
    *   `institutional_partners` para parcerias.
    *   `institutional_surveys` para coleta de dados e feedback.
    *   `knowledge_base_entries` para base de conhecimento.
*   **Segurança e Auditoria:**
    *   `security_audit_log` para eventos de segurança.
    *   `content_audit_log` para auditoria de alterações de conteúdo.
    *   `password_reset_tokens` para recuperação de senhas.

---

## 4. Recursos Existentes para Solucionar os Problemas Levantados

A plataforma FlowTrip / Descubra MS já possui recursos fundamentais para abordar os desafios de Campo Grande como cidade de passagem, o planejamento participativo e a percepção dos moradores sobre a cidade:

### Campo Grande: De Cidade de Passagem a Destino de Permanência
*   **Curadoria e Promoção de Roteiros:**
    *   A estrutura de `routes` e `route_checkpoints` permite que os gestores criem e destaquem roteiros de múltiplos dias, incentivando o turista a pernoitar em Campo Grande.
    *   O módulo `events` e `event_details` é ideal para centralizar e divulgar a agenda cultural completa da cidade, atraindo turistas para estenderem sua estadia.
*   **Personalização com IA:**
    *   As tabelas `user_profiles` e `user_interactions`, combinadas com as Edge Functions de IA (`delinha-ai`, `guata-ai`), podem alimentar sugestões personalizadas de destinos e eventos em Campo Grande, adaptadas aos interesses do turista.
    *   A integração com APIs como INMET permite que a plataforma sugira atividades otimizadas em tempo real (ex: alternativas em dias de chuva).
*   **Engajamento e Gamificação:**
    *   O sistema de `passport_stamps`, `user_achievements` e `user_levels` pode ser usado para criar desafios de exploração dentro da cidade, incentivando os turistas a visitarem mais atrativos e prolongarem sua estadia para obter recompensas.

### Planejamento Participativo da Comunidade
*   **Identificação de Colaboradores:** O campo `wants_to_collaborate` em `user_profiles` é a base para identificar moradores interessados em contribuir.
*   **Coleta de Feedback Estruturada:** A tabela `institutional_surveys` permite que os gestores criem pesquisas direcionadas para coletar ideias e sugestões dos moradores colaboradores sobre o turismo local.
*   **Processamento de Insights:** As informações coletadas podem ser processadas e analisadas pelo sistema de `ai_insights`, fornecendo dados para tomadas de decisão mais alinhadas com a comunidade.
*   **Gestão de Conteúdo:** Após curadoria, as contribuições dos moradores podem ser integradas ao conteúdo da plataforma (destinos, eventos, etc.) usando as tabelas existentes e auditadas via `content_audit_log`.

### Mudança da Narrativa para Moradores
*   **Educação e Descoberta:**
    *   As tabelas `routes` e `knowledge_base_entries` podem ser usadas para criar roteiros e artigos específicos para moradores, destacando atrativos "escondidos" e informações culturais da própria cidade.
*   **Gamificação Local:**
    *   O sistema de gamificação (`passport_stamps`, `user_achievements`, `user_levels`) pode ser adaptado para criar desafios de exploração urbana para os moradores, incentivando-os a redescobrir Campo Grande e mudar sua percepção.
*   **Visibilidade de Eventos:** O calendário `events` pode ser o principal canal para divulgar a agenda de eventos locais, mostrando aos moradores a diversidade de atividades disponíveis na cidade.
*   **Feedback e Engajamento:**
    *   `institutional_surveys` pode ser usado para coletar a percepção dos moradores e identificar lacunas, permitindo que os gestores criem campanhas de comunicação direcionadas para desmistificar a ideia de "não ter nada para fazer".

---

## 5. Funcionalidades e Melhorias Pendentes / Sugeridas

Apesar da robustez da plataforma, há áreas que podem ser aprimoradas para otimizar ainda mais o desempenho, a manutenibilidade e a experiência do usuário, conforme as análises:

*   **1. Monitoramento e Logs Centralizados:**
    *   **Pendente:** Implementação de uma solução unificada para agregação de logs de frontend, Edge Functions e banco de dados (e.g., Sentry, Datadog, Loggly).
    *   **Benefício:** Visão em tempo real da saúde da aplicação, performance e erros, facilitando a depuração e otimização.

*   **2. Estratégia de Testes Abrangente:**
    *   **Pendente:** Desenvolvimento e implementação de testes automatizados (unitários, de integração, end-to-end) para:
        *   **Frontend (React/TypeScript):** Uso de Jest, React Testing Library, Cypress ou Playwright.
        *   **Edge Functions (Deno/TypeScript):** Testes para a lógica e interação com o Supabase.
        *   **Banco de Dados (SQL):** Testes para funções SQL e RLS.
    *   **Benefício:** Aumento da qualidade do código, redução de bugs e garantia de funcionalidade em novas implementações.

*   **3. Otimização de Performance do Banco de Dados (Supabase):**
    *   **Pendente:** Análise proativa de consultas SQL lentas, otimização de índices e revisão de funções SQL para garantir máxima performance.
    *   **Benefício:** Melhoria na velocidade de resposta da aplicação e redução de custos de infraestrutura.

*   **4. Gerenciamento de Segredos e Variáveis de Ambiente:**
    *   **Pendente:** Assegurar que chaves sensíveis (`SUPABASE_SERVICE_ROLE_KEY`, chaves de APIs externas) não sejam versionadas (ex: via `.env`) e sejam carregadas de forma segura em produção (via segredos do Vercel/Netlify ou gerenciadores de segredos dedicados).
    *   **Pendente:** Implementação de uma política de rotação periódica de chaves.
    *   **Benefício:** Fortalecimento da segurança da aplicação.

*   **5. Refatoração de Funções/Arquivos Extensos:**
    *   **Pendente:** Monitoramento contínuo do tamanho dos arquivos de código-fonte (principalmente React/TypeScript e Edge Functions).
    *   **Pendente:** Refatoração proativa de arquivos/funções que excedam 200-300 linhas de código, dividindo-os em módulos menores e mais focados.
    *   **Benefício:** Melhoria da manutenibilidade, legibilidade e colaboração da equipe.

*   **6. Desenvolvimento de Canais de Contribuição Estruturados para Moradores:**
    *   **Pendente:** Implementar (ou integrar com) funcionalidades como fóruns de discussão, grupos online ou formulários de submissão de conteúdo dedicados aos moradores colaboradores.
    *   **Benefício:** Facilita e formaliza a participação da comunidade no planejamento turístico.

*   **7. Dashboard/Visualização para Moradores Colaboradores:**
    *   **Pendente:** Criação de um painel simples na plataforma para que moradores que escolhem contribuir possam ver o status de suas sugestões e o impacto de suas contribuições.
    *   **Benefício:** Aumenta o engajamento e a sensação de valorização dos moradores.

*   **8. Sistema de Notificações Personalizadas:**
    *   **Pendente:** Implementação de notificações (push, e-mail, in-app) para alertar moradores e turistas sobre eventos, atividades e informações de interesse baseadas em localização ou preferências.
    *   **Benefício:** Aumenta a proatividade da plataforma em engajar os usuários e informar sobre oportunidades.

*   **9. Recurso de Conteúdo Gerado pelo Usuário (UGC):**
    *   **Pendente:** Desenvolver a capacidade para moradores e turistas submeterem fotos, vídeos ou textos diretamente na plataforma (com um robusto sistema de moderação).
    *   **Benefício:** Enriquece o conteúdo da plataforma, cria um senso de comunidade e torna a experiência mais autêntica.

---

Este documento será uma ferramenta viva para guiar o desenvolvimento e aprimoramento contínuo da plataforma FlowTrip / Descubra MS. 