# Documentação da Plataforma de Turismo - Mato Grosso do Sul

## Visão Geral

A Plataforma de Turismo do Mato Grosso do Sul é um sistema completo de gestão e promoção turística que integra múltiplas funcionalidades para diferentes tipos de usuários. A plataforma oferece desde informações turísticas públicas até ferramentas administrativas avançadas para gestão do setor.

## Arquitetura da Plataforma

### Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Autenticação**: Supabase Auth (email/senha + OAuth)
- **Estado**: React Query + Context API
- **Roteamento**: React Router DOM

### Estrutura do Banco de Dados

#### Tabelas Principais

1. **auth.users** (Supabase)
   - Gerenciamento de usuários e autenticação

2. **user_profiles**
   - Perfis estendidos dos usuários
   - Informações demográficas e preferências

3. **user_roles**
   - Sistema de permissões baseado em roles
   - Roles: admin, tech, municipal_manager, gestor, atendente, user

4. **regions** e **cities**
   - Estrutura geográfica do estado
   - Relacionamento hierárquico região->cidade

5. **destinations**
   - Pontos turísticos e atrações
   - Geolocalizados por cidade/região

6. **events**
   - Eventos turísticos e culturais
   - Sistema de visibilidade e auto-ocultação

7. **routes**
   - Roteiros turísticos
   - Checkpoints e validação de passaporte

8. **cat_locations**
   - Centros de Atendimento ao Turista (CAT)
   - Geolocalização e informações operacionais

## Sistema de Roles e Permissões

### Tipos de Usuário

1. **Admin/Tech**
   - Acesso total ao sistema
   - Gestão de usuários e configurações
   - Análises e relatórios avançados

2. **Municipal Manager/Gestor**
   - Gestão de conteúdo municipal
   - Eventos e destinos da sua região
   - Relatórios municipais

3. **Atendente (CAT)**
   - Check-ins nos CATs
   - Atendimento ao turista
   - Controle de ponto

4. **User (Público)**
   - Acesso às informações turísticas
   - Passaporte digital
   - Interações básicas

### Fluxo de Autenticação

1. **Registro**
   - Email/senha ou OAuth (Google/Facebook)
   - Criação automática de perfil
   - Primeiro usuário torna-se admin automaticamente

2. **Login**
   - Verificação de credenciais
   - Carregamento de perfil e roles
   - Redirecionamento baseado no role

3. **Autorização**
   - RLS (Row Level Security) no banco
   - Políticas baseadas em roles
   - Funções de segurança para verificação

## Funcionalidades por Módulo

### 1. Portal Público (Index)

**Localização**: `/`

**Funcionalidades**:
- Hero section com informações do estado
- Estatísticas de turismo em tempo real
- Destaques de destinos e eventos
- Seção de experiências e CATs
- Design responsivo e otimizado

**Componentes Principais**:
- `Hero.tsx` - Seção principal
- `TourismStatsSection.tsx` - Dados estatísticos
- `DestaquesSection.tsx` - Conteúdo em destaque
- `ExperienceSection.tsx` - Experiências turísticas
- `CatsSection.tsx` - Informações dos CATs

### 2. Sistema de Destinos

**Localização**: `/destinos`

**Funcionalidades**:
- Listagem de pontos turísticos
- Filtros por região/cidade/categoria
- Detalhes completos com mídia
- Sistema de avaliações
- Mapa interativo

**Gestão (Admin/Municipal)**:
- CRUD completo de destinos
- Upload de imagens
- Geolocalizaçãø
- Sistema de aprovação

### 3. Sistema de Eventos

**Localização**: `/eventos`

**Funcionalidades**:
- Agenda de eventos turísticos
- Filtros por data/local/tipo
- Sistema de inscrição
- Auto-ocultação após data
- Integração com calendário

**Gestão (Admin/Municipal)**:
- Criação e edição de eventos
- Controle de visibilidade
- Relatórios de participação
- Notificações automáticas

### 4. Passaporte Digital

**Localização**: `/passaporte`

**Funcionalidades**:
- Coleta de carimbos virtuais
- Gamificação da experiência
- Histórico de visitas
- Conquistas e badges
- Compartilhamento social

**Tecnologia**:
- Geolocalização para validação
- QR codes nos pontos
- Sistema de pontuação
- Integração com perfil

### 5. CATs (Centros de Atendimento)

**Localização**: `/delinha`

**Funcionalidades Públicas**:
- Localização dos CATs
- Horários de funcionamento
- Serviços disponíveis
- Contato e direções

**Gestão (Atendentes)**:
- Sistema de check-in/out
- Controle de ponto
- Registro de atendimentos
- Relatórios de atividade

### 6. Painel Administrativo

**Localização**: `/technical-admin`, `/municipal-admin`

**Funcionalidades**:

#### Admin Técnico
- Gestão completa de usuários
- Configurações do sistema
- Análises avançadas
- Logs de segurança
- Backup e manutenção

#### Admin Municipal
- Gestão de conteúdo local
- Eventos da região
- Colaboradores municipais
- Relatórios regionais
- Configurações locais

### 7. Sistema de IA (Delinha AI)

**Localização**: `/delinha-ai`

**Funcionalidades**:
- Assistente virtual inteligente
- Recomendações personalizadas
- Análise de dados turísticos
- Insights estratégicos
- Chatbot para turistas

## Fluxos de Dados

### 1. Carregamento de Dados Turísticos

```
useTourismData() -> 
  Destinations API -> 
  Events API -> 
  Statistics API -> 
  Combined Data -> 
  UI Components
```

### 2. Autenticação e Autorização

```
Login Form -> 
  Supabase Auth -> 
  User Profile Fetch -> 
  Role Verification -> 
  Route Protection -> 
  Dashboard Redirect
```

### 3. Gestão de Conteúdo

```
Content Form -> 
  Validation -> 
  RLS Check -> 
  Database Insert/Update -> 
  Audit Log -> 
  UI Update
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas implementam RLS com políticas específicas:

- **user_profiles**: Usuários veem apenas próprio perfil
- **user_roles**: Admins gerenciam, usuários veem própria role
- **destinations/events**: Públicos para leitura, gestores para escrita
- **cat_checkins**: Atendentes criam, gestores visualizam

### Funções de Segurança

- `is_admin_user()`: Verifica se usuário é admin
- `get_current_user_role()`: Obtém role do usuário atual
- `log_security_event()`: Registra eventos de segurança

### Auditoria

- **security_audit_log**: Log de eventos de segurança
- **content_audit_log**: Histórico de mudanças de conteúdo
- Rastreamento de todas as operações sensíveis

## Configuração e Deploy

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

### Scripts de Deploy

- `npm run build`: Build de produção
- `npm run preview`: Preview local
- `npm run dev`: Desenvolvimento

### Configuração do Supabase

1. **Autenticação**
   - Habilitar email/senha
   - Configurar OAuth providers
   - Definir URLs de redirecionamento

2. **Database**
   - Executar migrações
   - Configurar RLS
   - Criar funções de segurança

3. **Storage**
   - Buckets para imagens
   - Políticas de acesso
   - CDN configuration

## Monitoramento e Analytics

### Métricas Coletadas

- **user_interactions**: Interações dos usuários
- **passport_stamps**: Carimbos do passaporte
- **tourism_statistics**: Dados agregados
- **security_events**: Eventos de segurança

### Dashboards

- **Admin**: Visão geral do sistema
- **Municipal**: Dados regionais
- **Performance**: Métricas técnicas
- **Security**: Logs de segurança

## Manutenção

### Tarefas Regulares

1. **Backup de Dados**
   - Backup automático via Supabase
   - Exportação de dados críticos
   - Teste de restauração

2. **Limpeza de Logs**
   - Rotação de logs antigos
   - Arquivamento de dados históricos
   - Otimização de performance

3. **Atualizações**
   - Dependências de segurança
   - Features do Supabase
   - Melhorias de UI/UX

### Troubleshooting

#### Problemas Comuns

1. **Tela Branca**
   - Verificar console de erros
   - Confirmar autenticação
   - Validar permissões RLS

2. **Login não Funciona**
   - Verificar credenciais
   - Confirmar role do usuário
   - Checar políticas RLS

3. **Dados não Carregam**
   - Verificar conexão com Supabase
   - Validar consultas SQL
   - Confirmar permissões

## Roadmap

### Próximas Funcionalidades

1. **Mobile App**
   - App nativo React Native
   - Notificações push
   - Modo offline

2. **Analytics Avançados**
   - ML para recomendações
   - Análise preditiva
   - Dashboard executivo

3. **Integração Externa**
   - APIs de clima
   - Redes sociais
   - Sistemas de pagamento

4. **Gamificação**
   - Sistema de pontos
   - Rankings
   - Recompensas

## Conclusão

A Plataforma de Turismo do MS é um sistema robusto e escalável que atende às necessidades do setor turístico estadual. Com arquitetura moderna, segurança avançada e interface intuitiva, oferece uma experiência completa tanto para turistas quanto para gestores do setor.

Para mais informações técnicas, consulte os arquivos de código-fonte e documentação específica de cada módulo.