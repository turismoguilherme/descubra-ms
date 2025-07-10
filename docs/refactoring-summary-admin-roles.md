# Changelog: Reestruturação da Área Administrativa

**Data:** 15 de Julho de 2024

## 1. Objetivo da Refatoração

Esta documentação resume a reestruturação completa do sistema de papéis (roles) e permissões da área administrativa. O objetivo foi alinhar a plataforma com a estrutura de gestão do turismo de Mato Grosso do Sul, que é baseada em Regiões Turísticas (IGRs) e Municípios.

## 2. Resumo das Mudanças

A refatoração foi dividida em 5 fases principais, impactando o banco de dados, a lógica de segurança e a interface do usuário.

---

### Fase 1: Reestruturação do Banco de Dados

-   **Novas Tabelas:**
    -   `public.regions`: Para armazenar as 10 regiões turísticas (IGRs).
    -   `public.cities`: Para armazenar os municípios, com referência à sua região (`region_id`).
-   **Novos Papéis (Roles):** O sistema agora reconhece uma nova hierarquia de papéis:
    -   `admin`, `tech`
    -   `diretor_estadual` (visão global)
    -   `gestor_igr` (visão regional)
    -   `gestor_municipal` (visão municipal)
    -   `atendente` (visão municipal)
-   **Associação de Localidade:**
    -   A tabela `user_roles` foi modificada para incluir `city_id` e `region_id`, permitindo associar um usuário gestor a uma localidade específica.
    -   As tabelas de conteúdo (`destinations`, `events`, etc.) foram atualizadas para incluir `city_id`, garantindo que todo conteúdo pertença a um município.

*Arquivo de Migração Criado: `supabase/migrations/20250715100000_restructure_roles_and_locations.sql`*

---

### Fase 2: População dos Dados Geográficos

-   As tabelas `regions` e `cities` foram populadas com os dados oficiais das 10 regiões e 60 municípios turísticos de Mato Grosso do Sul.

*Arquivo de Migração Criado: `supabase/migrations/20250715100100_seed_regions_and_cities.sql`*

---

### Fase 3: Implementação da Lógica de Permissões (RLS)

-   As políticas de Row Level Security (RLS) do Supabase foram completamente reescritas para refletir a nova hierarquia.
-   **Regra Principal:** Gestores (`gestor_municipal`, `atendente`, `gestor_igr`) agora só podem ver e/ou modificar dados pertencentes ao seu escopo geográfico (cidade ou região), enquanto o `diretor_estadual` e `admins` têm visão completa.

*Arquivo de Migração Criado: `supabase/migrations/20250715100200_setup_rls_policies.sql`*

---

### Fase 4: Adaptação da Interface (Frontend)

-   **Centralização da Autenticação:** A lógica de autenticação foi centralizada no `AuthProvider`. Ele agora busca o perfil completo do usuário (`role`, `city_id`, `region_id`) no login e o disponibiliza globalmente através do hook `useAuth`.
    -   *Arquivos Modificados: `AuthProvider.tsx`, `AuthContext.tsx`, `useAuth.tsx`, `auth.ts` (novo).*
-   **Hook de Segurança Refatorado:** O hook `useSecureAuth` foi modernizado para consumir os dados do `AuthProvider`, eliminando chamadas redundantes ao banco e simplificando a verificação de permissões.
    -   *Arquivo Modificado: `useSecureAuth.tsx`.*
-   **Adaptação dos Painéis de Gestão:**
    +   O painel `Management.tsx` foi simplificado para servir como dashboard principal para `Diretor Estadual` e `Gestor da IGR`.
    +   O painel `MunicipalAdmin.tsx` foi totalmente refatorado. Ele agora serve como um contêiner que passa o `cityId` do gestor logado para todos os seus sub-componentes, garantindo que toda a gestão municipal seja corretamente segmentada por cidade.
    +   **Sub-componentes Adaptados:**
        +   `CollaboratorManager.tsx`: Filtra e gerencia colaboradores por cidade.
        +   `CityTourManager.tsx`: Filtra e gerencia agendamentos de city tours por cidade.
        +   `FileManager.tsx`: Filtra e gerencia arquivos por cidade.
        +   `SurveyManager.tsx`: Filtra e gerencia pesquisas por cidade.
    +   *Arquivos Modificados: `Management.tsx`, `MunicipalAdmin.tsx`, e todos os seus componentes de gerenciamento (`CollaboratorManager`, `CityTourManager`, `FileManager`, `SurveyManager`) e seus respectivos hooks ou lógicas internas.*

---

### Fase 5: Migração de Dados e Tabelas Antigas

-   **Migração de Papéis:** Foi criado um script para mapear os papéis antigos (`municipal_manager`, `gestor`, etc.) para os novos (`gestor_municipal`), incluindo instruções para a associação manual de usuários a localidades.
    -   *Arquivo de Migração Criado: `supabase/migrations/20250715100300_migrate_old_user_roles.sql`.*
-   **Adaptação das Tabelas de Conteúdo:** Para completar a refatoração dos painéis, foram criadas migrações para cada tabela de conteúdo, trocando o antigo campo de texto `city` pela nova referência `city_id`.
    -   Tabela `municipal_collaborators`:
        -   *Migração: `20250715110000_update_collaborators_table.sql`*
        -   *Tipo: `src/types/collaborator.ts`*
    -   Tabelas `city_tour_bookings` e `city_tour_settings`:
        -   *Migração: `20250715120000_update_city_tours_tables.sql`*
    -   Tabela `secretary_files`:
        -   *Migração: `20250715123000_update_secretary_files_table.sql`*
        -   *Tipo: `src/types/municipal.ts` (também atualizou `Survey`)*
    -   Tabela `institutional_surveys`:
        -   *Migração: `20250715130000_update_surveys_table.sql`*

## 3. Conclusão

A plataforma agora possui uma base de permissões robusta e segura. O painel `MunicipalAdmin` está 100% funcional, com todas as suas seções (`Colaboradores`, `City Tours`, `Arquivos`, `Pesquisas`) operando corretamente com a nova lógica de segmentação por cidade, permitindo uma gestão de conteúdo municipal segura e organizada. 