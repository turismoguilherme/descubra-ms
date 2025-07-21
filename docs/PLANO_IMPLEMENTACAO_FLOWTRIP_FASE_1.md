# Plano de Implementação da Plataforma Flowtrip - Fase 1

Este documento detalha o plano de ação para aprimorar a plataforma Flowtrip, abordando as funcionalidades de eventos, passaporte digital, integração de inteligência artificial e a expansão multi-estado. Ele servirá como um guia para as próximas etapas de desenvolvimento, garantindo que todas as mudanças estejam alinhadas com a visão estratégica.

## Sumário das Discussões Anteriores

### 1. Correção do Avatar do Guatá
- **Problema**: O avatar do Guatá estava sendo exibido incorretamente nas mensagens da IA para os usuários.
- **Solução**: O avatar correto (guata-mascote.jpg) foi referenciado e implementado no componente `ChatMessage.tsx` para ser exibido ao lado das mensagens geradas pela IA.

### 2. Funcionalidade de Eventos
- **Visão**: A plataforma deve puxar automaticamente eventos temporários de diversas fontes (incluindo não-oficiais de turismo, mas relevantes para turistas) e permitir o cadastro manual com funcionalidade de expiração.
- **Fontes Sugeridas**: APIs de plataformas como Sympla (para eventos do organizador), e prospecção ativa de APIs/portais de dados abertos de órgãos governamentais de turismo/cultura, e APIs de outras plataformas de eventos públicos e abrangentes.
- **Expiração**: Eventos cadastrados manualmente ou importados devem sumir da plataforma após a data de expiração definida.

### 3. Passaporte Digital e Roteiros
- **Visão**: Gestores na administração poderão cadastrar rotas e roteiros para o passaporte digital.
- **Integração com Mapa**: As rotas serão exibidas no mapa, com pontos específicos para "carimbo" e recompensa.
- **Geolocalização Offline**: A identificação do "carimbo" deve funcionar mesmo em áreas sem internet, com sincronização posterior.
- **Carimbo Temático**: Os "carimbos" serão representados por animais do Pantanal.
- **Recompensa**: Recompensas serão atreladas à conclusão de rotas ou coleta de carimbos.
- **Solução para Offline (Mapbox)**: Utilização do pré-cache de mapas do Mapbox, aproveitando o SDK já existente na plataforma, para geolocalização e registro offline.

### 4. Integração de Inteligência Artificial (IA)
- **APIs de IA**: A IA analítica para gestores e a IA de suporte para atendentes (Guatá) utilizarão a API do Google Gemini.
- **Insights em Linguagem Natural**: Todos os insights e informações geradas pelas IAs serão apresentados em linguagem natural (texto), tornando-os acessíveis e acionáveis.

#### 4.1. Distinção Flowtrip vs. Alumia
- **Alumia**: Entendida como uma plataforma externa de dados brutos e inteligência de mercado focada em turismo.
- **Flowtrip**: Será a plataforma de aplicação e engajamento, que coleta dados primários, integra e enriquece os dados da Alumia, oferece funcionalidades específicas (passaporte, eventos, etc.), e gera valor acionável e recomendações estratégicas diretamente aplicáveis para os gestores.

#### 4.2. Desafios de Campo Grande e Soluções com a Flowtrip
- **Campo Grande como "cidade de passagem" na Rota Bioceânica**:
    - **Soluções**: Criação de roteiros e passaportes temáticos, integração de eventos, marketing personalizado com IA (recomendando atrativos e eventos com base no perfil do turista), e coleta de feedback para melhorias nas ofertas.
- **Moradores não conhecem a cidade e dizem "não ter nada para fazer"**:
    - **Soluções**:
        - **Planejamento Participativo da Comunidade**: Módulo de "Co-criação de Experiências" onde moradores podem propor atrativos/rotas, participar de fóruns de discussão e adicionar pontos em mapas colaborativos.
        - **Conteúdo Curado e Storytelling**: Apresentação mais envolvente dos atrativos, com fotos, descrições e histórias, e treinamento da IA dos atendentes com esse conteúdo.

#### 4.3. Expansão para Outros Estados (Multi-Estado)
- **Arquitetura Multi-Tenant**: A plataforma será projetada com uma arquitetura multi-tenant, permitindo o isolamento de dados e configurações específicas por estado/município.
- **Gerenciamento Centralizado**: A Flowtrip terá uma super-administração para provisionar novos tenants e gerenciar configurações globais.
- **Gestão de Conteúdo e Eventos**: Extensibilidade de dados geográficos e configurações de fontes de eventos por tenant.
- **Gerenciamento de Usuários e Funções (RBAC)**: Controle de acesso rigoroso por `region_id` e `city_id` para gestores de diferentes estados/municípios.
- **Modelos de IA Adaptáveis**: IAs capazes de processar e gerar insights relevantes para diferentes contextos regionais.
- **Infraestrutura Escalável**: Hospedagem robusta para lidar com o crescimento de usuários e dados.

## Plano de Implementação Detalhado

### Fase 1: Correção do Avatar do Guatá e Documentação Inicial
- **Concluído**: Correção do avatar do Guatá no `ChatMessage.tsx`.
- **Próximos Passos**: Criação deste documento de planejamento.
- **Fases Restantes**: Fases 2, 3, 4 e 5.

### Fase 2: Implementação da Funcionalidade de Eventos
- **Objetivo**: Permitir a importação automática de eventos temporários e atrações permanentes, além do cadastro manual com gerenciamento de expiração.
- **Etapas**:
    1.  **Análise e Seleção de APIs de Eventos e Atrações**: Pesquisar e selecionar APIs de eventos (ex: Sympla, com foco em eventos do organizador) para eventos temporários, e priorizar APIs/portais de dados abertos de órgãos governamentais de turismo/cultura para atrações permanentes e eventos abrangentes. O TripAdvisor será considerado como fonte complementar para atrações (para avaliações e fotos, e para o Guatá), com gerenciamento de limites de chamadas. Será realizada prospecção ativa de APIs de outras plataformas de eventos públicos e abrangentes.
    2.  **Desenvolvimento da Integração de APIs**: Implementar os serviços e funções para consumir dados das APIs externas e mapeá-los para o modelo de dados da plataforma.
    3.  **Aprimoramento do Módulo de Cadastro Manual de Eventos**: Adicionar campos para data de início e fim no formulário de cadastro na área administrativa.
    4.  **Implementação da Lógica de Expiração de Eventos**: Desenvolver um serviço em background que verifique periodicamente os eventos temporários e os remova (ou os oculte) da exibição pública após a data de expiração.
- **Próximos Passos (após Fase 2)**: Validação e testes da funcionalidade de eventos e atrações. Início da Fase 3.
- **Fases Restantes**: Fases 3, 4 e 5.

### Fase 3: Implementação do Passaporte Digital
- **Objetivo**: Habilitar a criação de roteiros por gestores, com geolocalização offline para carimbos e recompensas.
- **Etapas**:
    1.  **Design e Desenvolvimento do Módulo de Gestão de Rotas (Admin)**: Criar a interface de usuário na área administrativa para gestores cadastrarem roteiros, definirem pontos de interesse (checkpoints) e associarem recompensas.
    2.  **Configuração do Mapbox para Rotas**: Implementar a exibição das rotas no mapa usando o Mapbox, com visualização clara dos pontos de interesse.
    3.  **Implementação da Geolocalização Offline com Mapbox SDK**: Configurar os SDKs móveis do Mapbox para permitir o pré-cache de mapas das áreas dos roteiros.
    4.  **Desenvolvimento do Sistema de "Carimbos" Digitais**: Criar a lógica para detectar a proximidade do usuário com um ponto de interesse (via geolocalização offline) e registrar o "carimbo" digital (animal do Pantanal).
    5.  **Desenvolvimento do Sistema de Recompensas**: Implementar a lógica para atribuir e gerenciar recompensas aos usuários que completarem os desafios ou coletarem os carimbos.
    6.  **Sincronização de Dados Offline**: Desenvolver um mecanismo para sincronizar os dados dos carimbos e progresso da rota com o servidor assim que o dispositivo tiver conexão.
- **Próximos Passos (após Fase 3)**: Testes abrangentes da funcionalidade do passaporte e preparação para a Fase 4.
- **Fases Restantes**: Fases 4 e 5.

### Fase 4: Implementação das IAs e Análise de Dados
- **Objetivo**: Integrar a API do Gemini para a IA analítica dos gestores e a IA de suporte aos atendentes, e consolidar fontes de dados.
- **Etapas**:
    1.  **Desenvolvimento do Módulo de Coleta de Dados de Perfil do Usuário**: Aprimorar o fluxo de registro para coletar sexo, faixa etária e origem do usuário.
    2.  **Integração com API da Alumia**: Quando disponível, desenvolver o serviço para consumir dados da Alumia e integrá-los ao banco de dados da Flowtrip.
    3.  **Criação do Módulo de Anexação de Dados por Secretarias**: Desenvolver uma interface para as secretarias de turismo fazerem upload e gerenciarem seus próprios dados na plataforma.
    4.  **Desenvolvimento da IA Consultora Estratégica (Gestores)**:
        *   Construir a lógica para processar e analisar os dados combinados (usuário, Alumia, secretarias) usando a API do Gemini.
        *   Desenvolver os componentes de UI para apresentar os insights estratégicos em linguagem natural (relatórios, recomendações, gráficos explicativos).
    5.  **Aprimoramento da IA de Suporte ao Atendente (Guatá)**:
        *   Integrar o Guatá com a base de conhecimento da Flowtrip (eventos, destinos, roteiros, dados de perfil).
        *   Configurar o Guatá para usar a API do Gemini para processar perguntas e gerar respostas precisas e rápidas em linguagem natural.
    6.  **Desenvolvimento do Módulo de Planejamento Participativo da Comunidade**:
        *   Criar interfaces para que moradores possam propor ideias (atrativos, rotas, eventos).
        *   Implementar um sistema de fórum ou votação para as ideias.
        *   Integrar a IA para analisar e destacar as sugestões mais promissoras.
        *   Desenvolver mapas colaborativos para que moradores possam adicionar pontos de interesse.
- **Próximos Passos (após Fase 4)**: Testes e refinamento das funcionalidades de IA. Início da Fase 5.
- **Fases Restantes**: Fase 5.

### Fase 5: Modularidade e Escalabilidade para Múltiplos Estados
- **Objetivo**: Garantir que a plataforma esteja preparada para uma expansão eficiente para outros estados.
- **Etapas**:
    1.  **Refatoração da Arquitetura Multi-Tenant**: Revisar e aprimorar a arquitetura para garantir um isolamento robusto de dados e configurações por tenant (estado/município).
    2.  **Implementação de Configurações Dinâmicas por Tenant**: Desenvolver um sistema para carregar configurações específicas (idioma, moedas, fontes de dados de eventos) com base no tenant ativo.
    3.  **Desenvolvimento da Super-Administração (Flowtrip)**: Criar uma interface para a equipe da Flowtrip provisionar, configurar e gerenciar novos estados/municípios na plataforma.
    4.  **Revisão e Aprimoramento do RBAC Multi-Tenant**: Assegurar que as permissões dos gestores (estadual, municipal) sejam corretamente escopadas pelo `region_id` e `city_id` em um ambiente multi-tenant, prevenindo acesso indevido a dados de outras regiões.
    5.  **Estratégia de Infraestrutura Escalável**: Planejar e, se necessário, implementar ajustes na infraestrutura de hospedagem para suportar o crescimento esperado (ex: escalabilidade de banco de dados, balanceamento de carga).
- **Concluído (após Fase 5)**: Plataforma pronta para expansão multi-estado.
- **Próximos Passos**: Monitoramento contínuo, manutenção, e consideração de novas funcionalidades. 