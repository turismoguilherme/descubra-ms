
# Visão Geral do Projeto: Descubra MS

## 1. Visão Geral e Objetivos

**Descubra MS** é uma plataforma de turismo digital e interativa para o estado de Mato Grosso do Sul. O projeto visa centralizar informações turísticas, promover destinos e eventos, e engajar os visitantes através de uma experiência moderna e gamificada.

### O que o projeto faz?

*   **Para o Turista:** Serve como um guia completo para explorar o estado, oferecendo um mapa interativo, informações sobre destinos, eventos e roteiros. Inclui funcionalidades inovadoras como um "Passaporte Digital" para registrar visitas e um chatbot com Inteligência Artificial ("Delinha") para assistência em tempo real.
*   **Para a Gestão:** Funciona como uma poderosa ferramenta de back-office para gestores de turismo (municipais e estaduais), parceiros comerciais e administradores. Permite o gerenciamento completo do conteúdo da plataforma, o monitoramento de métricas e a análise de dados para tomada de decisão estratégica.

## 2. Especificações Técnicas

### 2.1. Arquitetura e Tecnologias

A aplicação segue uma arquitetura moderna baseada em componentes, com um frontend reativo e um backend "serverless" robusto.

*   **Frontend:**
    *   **Framework:** React com Vite para um desenvolvimento rápido e otimizado.
    *   **Linguagem:** TypeScript para garantir a tipagem e a manutenibilidade do código.
    *   **UI/Componentes:** `shadcn-ui` sobre `Radix UI` e `Tailwind CSS` para uma interface de usuário elegante, acessível e customizável.
    *   **Roteamento:** `react-router-dom` para a navegação entre as páginas.
    *   **Gerenciamento de Estado do Servidor:** `@tanstack/react-query` para fetching, caching e atualização de dados de forma eficiente.
    *   **Mapas:** `Mapbox GL` para a renderização de mapas interativos.
    *   **Gráficos:** `Recharts` para a visualização de dados e dashboards.

*   **Backend (BaaS - Backend as a Service):**
    *   **Provedor:** Supabase.
    *   **Autenticação:** Gerenciamento de usuários e segurança via Supabase Auth.
    *   **Banco de Dados:** PostgreSQL, com um esquema bem definido e migrações gerenciadas.
    *   **Segurança:** Implementação de Row Level Security (RLS) para um controle de acesso fino e granular aos dados.
    *   **Funções Serverless:** Uso de Supabase Functions para lógica de backend, como a integração com a IA "Delinha".

### 2.2. Estrutura do Banco de Dados (Supabase/PostgreSQL)

O esquema do banco de dados é projetado para ser relacional e escalável, com as seguintes tabelas principais:

*   `user_profiles` & `user_roles`: Gerenciam os dados dos usuários e seus respectivos níveis de permissão.
*   `destinations` & `destination_details`: Armazenam todas as informações sobre os pontos turísticos.
*   `events` & `event_details`: Gerenciam os eventos, incluindo datas, locais e visibilidade.
*   `routes` & `route_checkpoints`: Estruturam os roteiros turísticos e seus pontos de parada.
*   `passport_stamps`: Tabela central para a funcionalidade do "Passaporte Digital", registrando as visitas dos usuários.
*   `security_audit_log` & `content_audit_log`: Registram ações importantes na plataforma para fins de segurança e auditoria.

### 2.3. Papéis de Acesso (Roles)

O sistema define uma hierarquia clara de papéis para garantir a segurança e a governança dos dados:

*   **`admin`**: Administrador geral com acesso irrestrito.
*   **`tech`**: Administrador técnico, focado em manutenção e segurança.
*   **`municipal_manager`**: Gestor de conteúdo de um município ou região.
*   **`gestor`**: Gestor com acesso a dashboards e relatórios.
*   **`atendente`**: Atendente de Centro de Atendimento ao Turista (CAT).
*   **`collaborator`**: Colaborador que pode sugerir conteúdo.
*   **`user`**: Turista ou usuário final da plataforma.

## 3. Próximos Passos e Manutenibilidade

Para garantir a evolução e a qualidade do projeto, é recomendado:

*   **Manter a Documentação Atualizada:** Este arquivo deve ser revisado a cada nova funcionalidade implementada.
*   **Seguir os Padrões de Código:** Manter a consistência do código com ESLint e as convenções já estabelecidas.
*   **Revisar a Segurança:** Realizar auditorias de segurança periódicas, especialmente nas políticas de RLS do Supabase e nas funções serverless.
*   **Otimizar o Desempenho:** Monitorar o tempo de carregamento das páginas e as consultas ao banco de dados para garantir uma boa experiência ao usuário. 