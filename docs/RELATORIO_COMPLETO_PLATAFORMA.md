# 📋 RELATÓRIO COMPLETO DA PLATAFORMA VIAJARTUR + DESCUBRA MATO GROSSO DO SUL

**Data:** Março 2026  
**Versão:** 1.0  
**Autor:** Equipe de Desenvolvimento  

---

## 📑 ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Plataforma 1: ViajARTur (SaaS B2B/B2G)](#2-plataforma-1-viajartur)
3. [Plataforma 2: Descubra Mato Grosso do Sul (B2C)](#3-plataforma-2-descubra-ms)
4. [Tipos de Usuários](#4-tipos-de-usuários)
5. [Fluxo Completo: Da Escolha do Plano ao Uso](#5-fluxo-completo)
6. [Funcionalidades Detalhadas — ViajARTur](#6-funcionalidades-viajartur)
7. [Funcionalidades Detalhadas — Descubra MS](#7-funcionalidades-descubra-ms)
8. [Painel Administrativo (Admin Panel)](#8-painel-administrativo)
9. [Status de Implementação por Funcionalidade](#9-status-implementação)
10. [Integrações e APIs Necessárias](#10-integrações-e-apis)
11. [Esclarecimentos sobre Funcionalidades Mencionadas](#11-esclarecimentos)

---

## 1. VISÃO GERAL

A plataforma é composta por **dois produtos integrados** que operam sob a marca **ViajARTur**:

| Produto | Público | URL | Objetivo |
|---------|---------|-----|----------|
| **ViajARTur SaaS** | Gestores públicos e empresários do turismo | `viajartur.com` | Plataforma de gestão e inteligência turística |
| **Descubra MS** | Turistas e público geral | `descubrams.com` | Portal turístico do estado de MS |

### Relação entre os dois:
- A **ViajARTur** é a empresa (SaaS) que vende tecnologia para gestores e empresários
- O **Descubra MS** é o produto público/vitrine que conecta turistas com destinos, eventos e parceiros
- Empresários que assinam a ViajARTur podem aparecer como parceiros no Descubra MS

---

## 2. PLATAFORMA 1: VIAJARTUR (SaaS B2B/B2G)

### O que é?
Uma plataforma SaaS (Software as a Service) de inteligência turística que oferece ferramentas para:
- **Secretarias de Turismo** (B2G — Business to Government): gestão de destinos, dados, eventos
- **Empresários do Turismo** (B2B): visibilidade, diagnóstico, otimização de negócios

### Página principal: `/viajar`
Exibe:
- Hero Section com mascote animado (robô de IA)
- Seção "O que a ViajARTur faz" (cards de funcionalidades)
- "Plataforma em Ação" (demonstração visual)
- Benefícios
- Cases de Sucesso
- Vídeo institucional (carregado do admin)
- CTA para contato/planos

---

## 3. PLATAFORMA 2: DESCUBRA MATO GROSSO DO SUL (B2C)

### O que é?
Portal turístico voltado ao público final (turistas), com:
- Regiões turísticas de MS
- Calendário de eventos
- Diretório de parceiros (empresas do turismo)
- Guatá IA (assistente virtual turístico)
- Passaporte Digital
- Roteiros personalizados por IA

### Página principal: `/descubrams`
Exibe:
- Hero com carrossel/banner
- Destaques (regiões turísticas do banco de dados)
- Eventos em destaque
- Banner de roteiro personalizado
- Avatares do Pantanal
- Seção de CATs (Centros de Atendimento ao Turista)

---

## 4. TIPOS DE USUÁRIOS

### 4.1 Usuários Públicos (sem login)
- **Turista casual**: Acessa o Descubra MS, navega em regiões, eventos, parceiros
- **Visitante do site ViaJARTur**: Conhece o produto SaaS, vê planos

### 4.2 Usuários Autenticados

| Tipo | Descrição | Onde atua |
|------|-----------|-----------|
| **user** | Turista cadastrado | Descubra MS — Passaporte Digital, Guatá IA, favoritos |
| **partner** | Empresário/parceiro comercial | Descubra MS — Perfil de parceiro, métricas |
| **attendant** | Atendente de CAT | Sistema de check-in geolocalizado |
| **admin** | Administrador da plataforma | Painel Admin completo |
| **master_admin** | Administrador master | Todas as permissões + sistema |
| **tech** | Usuário técnico | Acesso ao painel admin + configurações técnicas |
| **government** | Gestor público (secretaria) | Dashboard de inteligência turística |

### 4.3 Detalhamento por Tipo

#### Turista (user)
- Cria conta via email
- Acessa o **Passaporte Digital**: documento digital que registra rotas e checkpoints visitados
- Conversa com o **Guatá IA**: chatbot que responde perguntas sobre turismo em MS
- Personaliza preferências (interesses, tipo de viagem)
- Vê parceiros sugeridos com base no perfil

**Exemplo prático:**
> Maria acessa descubrams.com, cria uma conta, abre o Guatá e pergunta: "Quais as melhores cachoeiras perto de Bonito?". O Guatá responde com sugestões baseadas na base de conhecimento. Maria então abre seu Passaporte Digital, escolhe uma rota e começa a registrar seus checkpoints durante a viagem.

#### Empresário/Parceiro (partner)
- Se cadastra via formulário de parceria (`/descubrams/parceiros/cadastro`)
- Preenche dados da empresa (CNPJ, tipo de negócio, contato)
- Aceita termos de uso
- Após aprovação do admin, aparece no diretório de parceiros
- Pode assinar um plano da ViajARTur para funcionalidades avançadas

**Exemplo prático:**
> João é dono de uma pousada em Bonito. Ele acessa "Seja um Parceiro", preenche o formulário com CNPJ, fotos e descrição. Após aprovação, sua pousada aparece no diretório do Descubra MS com informações de contato e localização.

#### Gestor Público (government)
- Acessa via plano específico "Government" na ViajARTur
- Dashboard com indicadores turísticos da região
- Visualização de dados de fluxo turístico
- Gestão de eventos culturais da região

**Exemplo prático:**
> A Secretária de Turismo de Corumbá acessa a ViajARTur com plano Government. No dashboard, ela vê o número de turistas que visitaram a região no mês, os eventos mais populares e sugestões de IA para melhorar a ocupação hoteleira na baixa temporada.

#### Administrador (admin/master_admin/tech)
- Acesso completo ao painel admin (`/admin`)
- Gerencia todas as plataformas
- Configura parceiros, eventos, regiões, IA, financeiro, equipe

---

## 5. FLUXO COMPLETO: DA ESCOLHA DO PLANO AO USO

### 5.1 Fluxo do Empresário

```
1. Acessa viajartur.com (ou /viajar)
   ↓
2. Clica em "Ver Planos" → Vai para /precos
   ↓
3. Escolhe um plano (Starter, Professional, Enterprise, Government)
   - Vê features, preços, limites de cada plano
   ↓
4. Clica "Começar Agora" → Redirecionado para /viajar/register?plan=professional&billing=monthly
   ↓
5. Cria conta (email + senha)
   ↓
6. Entra no Onboarding (/viajar/onboarding):
   - Etapa 1: Pagamento (Stripe)
   - Etapa 2: Aceitar Termos de Uso
   - Etapa 3: Completar Perfil (dados da empresa)
   - Etapa 4: Diagnóstico Inteligente (questionário sobre o negócio — apenas empresários)
   - Etapa 5: Conclusão → Redirecionado ao Dashboard
   ↓
7. Acessa o Dashboard (/dashboard)
   - Vê métricas do negócio
   - Acessa ferramentas de IA
   - Gerencia perfil de parceiro no Descubra MS
```

### 5.2 Fluxo do Gestor Público

```
1. Acessa viajartur.com
   ↓
2. Vai para /precos → Seleciona plano "Government"
   ↓
3. Cria conta
   ↓
4. Onboarding simplificado (sem diagnóstico empresarial):
   - Pagamento → Termos → Perfil → Dashboard
   ↓
5. Dashboard de Inteligência Turística:
   - Dados de fluxo turístico
   - Indicadores por região
   - Sugestões de IA para políticas públicas
```

### 5.3 Fluxo do Turista no Descubra MS

```
1. Acessa descubrams.com (ou /descubrams)
   ↓
2. Navega pelo portal:
   - Explora regiões turísticas (clica no dropdown "Regiões Turísticas")
   - Vê calendário de eventos
   - Consulta diretório de parceiros
   ↓
3. Cria conta (opcional) para acessar:
   - Guatá IA (chatbot turístico)
   - Passaporte Digital
   - Roteiros personalizados
   ↓
4. Usa o Guatá: pergunta sobre destinos, restaurantes, hospedagens
   ↓
5. Abre o Passaporte Digital:
   - Escolhe uma rota
   - Visita checkpoints
   - Escaneia QR codes nos pontos turísticos
   - Ganha selos/conquistas
   ↓
6. Volta ao portal para mais informações
```

---

## 6. FUNCIONALIDADES DETALHADAS — VIAJARTUR

### 6.1 Página de Preços (`/precos`)
**O que faz:** Exibe os planos disponíveis com preços, features e limites.

**Status:** ✅ Implementado (UI completa)

**Planos configurados:**
- **Starter**: Para pequenos negócios — funcionalidades básicas
- **Professional**: Para negócios em crescimento — IA, diagnóstico
- **Enterprise**: Para grandes operações — tudo incluído
- **Government**: Para secretarias de turismo — dashboard público

**Exemplo:**
> O plano Professional custa R$XX/mês e inclui: diagnóstico de negócio, sugestões de IA, perfil de parceiro destacado, relatórios mensais.

**O que falta:** Integração real com Stripe para processamento de pagamentos. Atualmente o fluxo de pagamento está preparado mas sem gateway ativo.

---

### 6.2 Onboarding Inteligente (`/viajar/onboarding`)
**O que faz:** Wizard de 4-5 etapas que guia o novo assinante.

**Status:** ✅ UI implementada | ⚠️ Pagamento Stripe pendente

**Etapas:**
1. **Pagamento**: Card com Stripe Checkout (pendente integração)
2. **Termos**: Aceite de termos de uso e privacidade
3. **Perfil**: Dados da empresa, CNPJ, contatos
4. **Diagnóstico**: Questionário sobre o negócio (apenas empresários)
5. **Conclusão**: Redirecionamento ao dashboard

---

### 6.3 Smart Onboarding (`/smart-onboarding`)
**O que faz:** Versão com IA que detecta automaticamente o tipo de negócio e configura a plataforma.

**Status:** ✅ UI implementada | ⚠️ IA usa fallback local (sem API real)

**Como funciona:**
1. Usuário informa nome da empresa e categoria
2. Sistema tenta detectar automaticamente via IA (website, redes sociais)
3. Configura dashboard personalizado

**Exemplo:**
> "Pousada Pantaneira" → Sistema detecta: Categoria=Hospedagem, Região=Pantanal, Serviços=[Hospedagem, Café da manhã, Passeios]. Configura dashboard com métricas de ocupação.

---

### 6.4 Dashboard do Empresário (`/dashboard`)
**O que faz:** Painel com métricas e ferramentas.

**Status:** ✅ Estrutura implementada | ⚠️ Dados simulados

**Seções:**
- Visão geral (faturamento, ocupação, avaliações)
- Sugestões de IA para o negócio
- Performance no Descubra MS (visualizações, cliques)
- Diagnóstico de negócio

---

### 6.5 Página Institucional (`/viajar`)
**O que faz:** Landing page de vendas da ViajARTur.

**Status:** ✅ Totalmente implementado

**Seções (controláveis via admin):**
- Hero com mascote robô animado
- "O que a ViajARTur faz" (cards de funcionalidades)
- "Plataforma em Ação" (screenshots/demos)
- Benefícios
- Cases de sucesso
- Vídeo institucional
- CTA

---

## 7. FUNCIONALIDADES DETALHADAS — DESCUBRA MS

### 7.1 Página Inicial (`/descubrams`)
**O que faz:** Portal turístico principal.

**Status:** ✅ Totalmente implementado

**Seções:**
- Hero com banner/carrossel
- Regiões turísticas em destaque (do banco de dados via Supabase)
- Eventos em destaque
- Banner de roteiro personalizado por IA
- Avatares do Pantanal (mascotes interativos)
- CATs (Centros de Atendimento ao Turista)

---

### 7.2 Regiões Turísticas (`/descubrams/regioes/:slug`)
**O que faz:** Página detalhada de cada região turística de MS.

**Status:** ✅ Implementado com dados do Supabase

**Conteúdo de cada região:**
- Hero com nome e cor da região
- Sobre a região (descrição)
- Cidades da região
- Principais atrativos/destaques
- Vídeo (se disponível)
- Galeria de fotos
- Mapa da região
- CTA para explorar

**10 Regiões Turísticas de MS:**
1. Pantanal
2. Bonito e Serra da Bodoquena
3. Campo Grande e Região
4. Costa Leste
5. Rota Norte
6. Caminho dos Ipês
7. Caminhos da Fronteira
8. Vale das Águas
9. Cerrado Pantaneiro
10. Grande Dourados

**Exemplo:**
> Turista clica em "Bonito e Serra da Bodoquena" → Vê descrição da região, lista de cidades (Bonito, Bodoquena, Jardim...), destaques (Gruta do Lago Azul, Rio da Prata, Abismo Anhumas), vídeo e fotos.

---

### 7.3 Mapa Turístico Interativo (`/descubrams/mapa-turistico`)
**O que faz:** Mapa SVG interativo de MS com regiões clicáveis coloridas.

**Status:** ✅ Implementado

**Como funciona:**
- Mapa renderizado em SVG inline
- Cada região tem cor específica
- Clique em uma região → mostra informações laterais (cidades, destaques)
- Detecção de região por cor do fill do SVG + heurística geográfica

**Exemplo:**
> Turista abre o mapa, vê MS dividido em regiões coloridas. Clica na área amarela (Pantanal) → Aparece sidebar com informações: "Pantanal — 3 cidades, 5 destaques. Explore safáris, pesca esportiva e ecoturismo."

---

### 7.4 Eventos (`/descubrams/eventos`)
**O que faz:** Calendário de eventos turísticos e culturais de MS.

**Status:** ✅ Implementado

**Funcionalidades:**
- Listagem de eventos com filtros (data, cidade, tipo)
- Cadastro de evento pelo público (`/descubrams/eventos/cadastrar`)
- Promoção de evento com pagamento (`/descubrams/eventos/promover`)
- Detalhe do evento com informações completas
- Status de aprovação (pendente → aprovado → publicado)

**Fluxo de cadastro de evento:**
```
1. Organizador acessa "Cadastrar Evento"
   ↓
2. Preenche formulário (nome, data, local, descrição, imagem)
   ↓
3. Evento fica com status "Pendente"
   ↓
4. Admin aprova no painel → Evento aparece no calendário
   ↓
5. (Opcional) Organizador paga para promover → Evento em destaque
```

**Exemplo:**
> Festival de Inverno de Bonito é cadastrado por um organizador. Admin aprova. O evento aparece no calendário com data, local, descrição e link para inscrição.

---

### 7.5 Parceiros (`/descubrams/parceiros`)
**O que faz:** Diretório de empresas turísticas parceiras.

**Status:** ✅ Implementado

**Funcionalidades:**
- Listagem com filtros (tipo de negócio, busca textual)
- Card de parceiro com logo, descrição, contatos
- Modal de detalhes com galeria, horários, mapa
- Personalização baseada no perfil do turista
- Cadastro de novo parceiro (`/descubrams/parceiros/cadastro`)

**Tipos de parceiro:** Hotel, Pousada, Restaurante, Agência, Atrativo turístico, Guia, Transporte, etc.

**Exemplo:**
> Turista busca "restaurante" → Vê lista de restaurantes parceiros. Clica em "Restaurante Pantaneiro" → Modal com fotos, horário de funcionamento, cardápio, telefone, WhatsApp, localização no mapa.

---

### 7.6 Guatá IA (`/descubrams/guata`)
**O que faz:** Chatbot de IA especializado em turismo de MS.

**Status:** ✅ Interface implementada | ⚠️ IA com fallback local

**Como funciona:**
- Turista digita perguntas em linguagem natural
- O sistema consulta a base de conhecimento local (dados estáticos sobre MS)
- Responde com informações sobre destinos, restaurantes, hospedagens, atividades
- Sugere perguntas relacionadas
- Mantém histórico da conversa

**O que falta para funcionar 100%:**
- Integração real com **Google Gemini API** para respostas mais inteligentes
- Atualmente usa base de conhecimento estática (`guataKnowledgeBase.ts`)
- A API Gemini permitiria respostas contextuais, compreensão de intenção e recomendações personalizadas

**Exemplo:**
> Turista pergunta: "Quero viajar com minha família para um lugar com cachoeiras e trilhas. O que sugere?"
> Guatá responde: "Para uma viagem em família com foco em natureza, recomendo Bonito! A região tem cachoeiras acessíveis como a Cachoeira do Aquidauana, trilhas na Serra da Bodoquena e flutuação no Rio Sucuri — segura para crianças acima de 6 anos."

---

### 7.7 Passaporte Digital (`/descubrams/passaporte`)
**O que faz:** Documento digital gamificado que registra a jornada do turista em MS.

**Status:** ✅ Implementado

**Como funciona:**
1. Turista acessa o Passaporte Digital (precisa estar logado)
2. Completa perfil (gate de dados)
3. Vê rotas disponíveis
4. Escolhe uma rota (ex: "Rota das Águas")
5. Visita os checkpoints da rota
6. Em cada ponto, escaneia QR code ou faz check-in geolocalizado
7. Ganha selos e conquistas (achievements)
8. Completa a rota → Recebe selo especial

**Componentes:**
- `PassportProfileGate`: Solicita dados antes de mostrar o passaporte
- `PassportDocument`: O documento digital em si (visual de passaporte)
- `PassportRouteView`: Visualização de uma rota específica

**Exemplo:**
> Turista em Bonito abre o Passaporte Digital, seleciona "Rota Bonito Aventura" com 5 checkpoints: Gruta do Lago Azul, Nascente Azul, Rio Sucuri, Abismo Anhumas, Buraco das Araras. A cada visita, faz check-in. Ao completar 3/5, ganha selo "Explorador de Bonito". Ao completar todos, ganha selo ouro.

---

### 7.8 Roteiros por IA (`/ia-routes`)
**O que faz:** Geração de roteiros turísticos personalizados usando IA.

**Status:** ✅ Interface implementada | ⚠️ IA com lógica simplificada

**Como funciona:**
1. Turista responde questionário (interesses, duração, orçamento, acessibilidade)
2. IA gera roteiro personalizado com pontos de interesse
3. Roteiro pode ser salvo no Passaporte Digital

**O que falta:** Integração real com Gemini API para roteiros mais inteligentes e contextuais.

---

### 7.9 Koda — Chatbot do Canadá (`/koda`)
**O que faz:** Versão internacional do chatbot, focado no Canadá.

**Status:** ✅ Implementado (protótipo/demonstração)

**Nota:** Este é um produto separado/demonstração da tecnologia aplicada a outro destino. Possui tradução EN/FR.

---

## 8. PAINEL ADMINISTRATIVO

### Acesso: `/admin`
**Quem pode acessar:** Usuários com role `admin`, `master_admin` ou `tech`

### 8.1 Módulos do Admin

#### A) GESTÃO VIAJARTUR
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| Conteúdo ViaJAR | `/admin/viajar/content` | Edita textos, imagens e conteúdo do site ViaJARTur |
| Clientes | `/admin/viajar/clients` | Gerencia empresas assinantes |
| Assinaturas | `/admin/viajar/subscriptions` | Gerencia planos e pagamentos |
| Config. Planos | `/admin/viajar/plan-settings` | Configura preços, features, limites dos planos |
| Equipe ViaJAR | `/admin/viajar/team-members` | Gerencia membros da equipe interna |
| Seções do Site | `/admin/viajar/sections` | Liga/desliga seções da landing page ViaJARTur |

#### B) GESTÃO DESCUBRA MS
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| CATs | `/admin/descubra-ms/cats` | Gerencia Centros de Atendimento ao Turista |
| Rodapé | `/admin/descubra-ms/footer` | Configura links e informações do footer |
| Regiões Turísticas | `/admin/descubra-ms/tourist-regions` | CRUD de regiões turísticas (nome, cor, cidades, destaques) |
| Usuários | `/admin/descubra-ms/users` | Gerencia usuários do Descubra MS |
| Eventos | `/admin/descubra-ms/events` | Aprova/rejeita/edita eventos cadastrados |
| Parceiros | `/admin/descubra-ms/partners` | Aprova/rejeita/edita parceiros comerciais |
| Termos de Parceiros | `/admin/descubra-ms/partner-terms` | Visualiza aceites de termos dos parceiros |
| Config. Parceiros | `/admin/descubra-ms/partner-settings` | Configura regras de parceria |
| WhatsApp | `/admin/descubra-ms/whatsapp` | Configura integração WhatsApp |
| Passaporte | `/admin/descubra-ms/passport` | Gerencia rotas, checkpoints e selos do Passaporte Digital |
| Avatares | `/admin/descubra-ms/avatars` | Gerencia avatares do Pantanal (mascotes) |

#### C) FINANCEIRO
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| Dashboard Financeiro | `/admin/financial` | Visão geral de receitas, despesas, fluxo de caixa |
| Contas a Pagar | `/admin/financial/bills` | Gerencia contas e boletos |
| Receitas | `/admin/financial/revenue` | Registra e visualiza entradas |
| Despesas | `/admin/financial/expenses` | Registra e visualiza saídas |
| Salários | `/admin/financial/salaries` | Folha de pagamento da equipe |
| Pagamentos | `/admin/financial/payments` | Pagamentos recebidos (Stripe, etc.) |
| Relatórios | `/admin/financial/reports` | Relatórios financeiros periódicos |
| Reembolsos | `/admin/financial/refunds` | Gerencia solicitações de reembolso |
| Leads de Contato | `/admin/financial/contact-leads` | Leads capturados via formulário de contato |
| Contas Bancárias | `/admin/financial/accounts` | Cadastro de contas bancárias |

#### D) INTELIGÊNCIA ARTIFICIAL
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| Sugestões IA | `/admin/ai/suggestions` | Visualiza sugestões geradas pela IA |
| Fila de Ações | `/admin/ai/actions` | Ações pendentes sugeridas pela IA |
| Agente Autônomo | `/admin/ai/agent` | Configuração do agente de IA autônomo |
| Base de Conhecimento | `/admin/ai/knowledge-base` | Gerencia documentos e dados que alimentam a IA |
| Editor de Prompts | `/admin/ai/prompts` | Configura prompts dos chatbots (Guatá, Koda) |

#### E) EQUIPE
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| Membros | `/admin/team/members` | Gerencia funcionários |
| Atividades | `/admin/team/activities` | Log de atividades da equipe |
| Permissões | `/admin/team/permissions` | Configuração de roles e permissões |

#### F) SISTEMA
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| Fallback Config | `/admin/system/fallback` | Configura fallbacks quando APIs falham |
| Monitoramento | `/admin/system/monitoring` | Métricas de saúde do sistema |
| Logs de Auditoria | `/admin/system/logs` | Registro de todas as ações administrativas |
| Saúde do Sistema | `/admin/system/health` | Status de serviços e dependências |
| Traduções | `/admin/system/translations` | Gerencia traduções i18n (PT, EN, ES, FR, DE) |
| Banco de Dados | `/admin/database` | Visualizador e gerenciador de tabelas |
| E-mails | `/admin/email` | Dashboard de e-mails enviados |

#### G) CONFIGURAÇÕES
| Módulo | Rota Admin | O que faz |
|--------|-----------|-----------|
| Políticas | `/admin/settings/policies` | Editor de termos de uso, privacidade, cookies |
| Métricas da Plataforma | `/admin/settings/metrics` | Configura métricas exibidas na landing page |

---

## 9. STATUS DE IMPLEMENTAÇÃO POR FUNCIONALIDADE

### ✅ = Implementado e funcional
### ⚠️ = Implementado mas com limitações (usa dados mock/fallback)
### ❌ = Não implementado

| # | Funcionalidade | Status | Detalhe |
|---|---------------|--------|---------|
| 1 | Landing page ViajARTur | ✅ | Completa com seções controláveis |
| 2 | Landing page Descubra MS | ✅ | Completa com dados do Supabase |
| 3 | Página de preços | ✅ | UI completa, planos configuráveis |
| 4 | Registro de usuário | ✅ | Email + senha via Supabase Auth |
| 5 | Onboarding wizard | ✅ | 4-5 etapas completas |
| 6 | Pagamento Stripe | ⚠️ | Fluxo preparado, sem gateway ativo |
| 7 | Regiões turísticas | ✅ | CRUD completo + páginas públicas |
| 8 | Mapa interativo | ✅ | SVG com detecção por cor |
| 9 | Eventos (calendário) | ✅ | CRUD + aprovação + promoção |
| 10 | Parceiros (diretório) | ✅ | CRUD + aprovação + perfil público |
| 11 | Guatá IA (chatbot) | ⚠️ | Interface OK, IA usa base local sem Gemini |
| 12 | Passaporte Digital | ✅ | Rotas, checkpoints, QR, selos |
| 13 | Roteiros por IA | ⚠️ | Interface OK, geração simplificada |
| 14 | Painel Admin | ✅ | 30+ módulos implementados |
| 15 | Dashboard financeiro | ✅ | Receitas, despesas, relatórios |
| 16 | Sistema de IA admin | ⚠️ | Sugestões e agente com lógica simplificada |
| 17 | Base de conhecimento | ✅ | CRUD de documentos no Supabase |
| 18 | Traduções i18n | ✅ | PT-BR, EN-US, ES-ES, FR-FR, DE-DE |
| 19 | Check-in geolocalizado | ✅ | Para atendentes de CAT |
| 20 | Personalização por perfil | ⚠️ | Lógica básica implementada |
| 21 | CMS de conteúdo | ✅ | Edição de textos/imagens via admin |
| 22 | E-mail marketing | ⚠️ | Dashboard UI, sem provedor real |
| 23 | Avatares Pantanal | ✅ | Mascotes configuráveis via admin |
| 24 | Koda (Canadá) | ✅ | Protótipo funcional EN/FR |

---

## 10. INTEGRAÇÕES E APIs NECESSÁRIAS

### 10.1 APIs que PRECISAM ser integradas

| API | Para quê | Prioridade | Status |
|-----|---------|-----------|--------|
| **Stripe** | Processamento de pagamentos (assinaturas e promoção de eventos) | 🔴 Alta | Preparado mas sem chave |
| **Google Gemini** | IA do Guatá, geração de roteiros, sugestões inteligentes, diagnóstico | 🔴 Alta | Chave existe mas respostas usam fallback |
| **Google Maps/Places** | Geolocalização de parceiros, check-in, rotas | 🟡 Média | Parcialmente via Mapbox |
| **Mapbox** | Mapas nos detalhes de região e parceiros | ✅ | Integrado |
| **WhatsApp Business API** | Notificações e atendimento via WhatsApp | 🟡 Média | Config no admin, sem integração real |
| **SendGrid/Resend** | Envio de e-mails transacionais e marketing | 🟡 Média | Dashboard UI existe, sem provedor |
| **OpenWeather** | Previsão do tempo para sugestões de roteiro | 🟢 Baixa | Não integrado |
| **ALUMIA/API oficial MS** | Dados oficiais de turismo do estado | 🟢 Baixa | Não integrado |
| **Google Analytics** | Métricas de tráfego e conversão | 🟡 Média | Não integrado |

### 10.2 O que funciona SEM APIs externas
- Todo o CRUD de dados (regiões, parceiros, eventos, usuários)
- Sistema de autenticação (Supabase Auth)
- Passaporte Digital (checkpoints, QR codes)
- Painel administrativo completo
- Sistema de traduções
- Mapa interativo SVG
- Check-in geolocalizado (usa API nativa do browser)
- CMS de conteúdo

---

## 11. ESCLARECIMENTOS SOBRE FUNCIONALIDADES MENCIONADAS

### 11.1 "Gestão do Descubra MS" — O que é?
**NÃO é uma funcionalidade separada.** É o nome dado ao grupo de módulos dentro do painel admin que gerencia o portal Descubra MS. Inclui:
- Gerenciar regiões turísticas
- Aprovar eventos e parceiros
- Configurar CATs, rodapé, WhatsApp
- Gerenciar Passaporte Digital

**Ou seja:** É a seção do painel admin dedicada ao Descubra MS (em oposição à seção "Gestão ViaJARTur" que cuida do site SaaS).

### 11.2 "Compliance do CADASTUR" — O que é?
**NÃO está implementado na plataforma.** O CADASTUR é o Cadastro de Prestadores de Serviços Turísticos do Ministério do Turismo do Brasil.

O que existe no código:
- Um arquivo `src/services/cadasturService.ts` — **está VAZIO** (apenas espaço em branco)
- Um componente `src/components/onboarding/CadastURVerification.tsx` — **está VAZIO**

**Resumo:** A ideia era permitir que empresários verificassem seu cadastro no CADASTUR durante o onboarding, mas **isso nunca foi implementado**. Não há verificação de CADASTUR em lugar nenhum da plataforma.

Para implementar, seria necessário:
- API do CADASTUR (se existir API pública)
- Ou verificação manual via upload de documento
- Ou consulta ao site do Ministério do Turismo

### 11.3 "Revenue Optimizer" / "Otimizador de Receita"
**NÃO existe como funcionalidade implementada.** Era um conceito mencionado em relatórios anteriores, mas não há componente ou página que implemente isso. A ideia seria:
- IA sugere preços baseados em demanda/temporada
- Requer: dados de ocupação + API de clima + modelo de IA

### 11.4 "Competitive Benchmarking" / "Benchmarking Competitivo"
**NÃO está implementado.** Conceito de comparar desempenho de um negócio contra concorrentes da região. Não há componente implementado.

---

## CONCLUSÃO

A plataforma tem **arquitetura sólida e UI completa** para a maioria das funcionalidades. Os principais gargalos para entrega de valor real são:

1. **Stripe**: Sem pagamentos, não há receita → Prioridade máxima
2. **Google Gemini**: Sem IA real, os chatbots e sugestões são limitados → Prioridade alta
3. **Dados reais**: Muitos dashboards usam dados mock em vez de dados do banco → Prioridade média
4. **E-mail**: Sem provedor de e-mail, não há notificações nem marketing → Prioridade média

O código está organizado em camadas claras (pages → components → hooks → services → integrations) e o banco de dados Supabase tem as tabelas necessárias para 90% das funcionalidades.

---

*Documento gerado em Março de 2026*
*Base: Análise do código-fonte real da aplicação*
