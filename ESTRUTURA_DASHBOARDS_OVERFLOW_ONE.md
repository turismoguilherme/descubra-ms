# 🏗️ ESTRUTURA DE DASHBOARDS - OVERFLOW ONE

## 📋 **VISÃO GERAL**

Este documento define a estrutura completa de dashboards e sistema de usuários para a plataforma Overflow One, diferenciando-a do Descubra MS.

---

## 🎯 **SISTEMA DE USUÁRIOS**

### **Tipos de Usuários:**
1. **`empresa`** - Empresas de turismo
2. **`atendente`** - Atendentes dos CATs
3. **`gestor_municipal`** - Gestores municipais
4. **`gestor_estadual`** - Gestores estaduais
5. **`master_admin`** - Administrador master (você)

### **Sistema de Login:**
- ✅ **Mesmo sistema** para todos os tipos de usuários
- ✅ **Redirecionamento automático** baseado no tipo de usuário
- ✅ **Proteção de rotas** por tipo de usuário

---

## 🚀 **ESTRUTURA DE ROTAS**

### **URLs por Tipo de Usuário:**

| Tipo de Usuário | URL | Dashboard | Permissões |
|------------------|-----|-----------|------------|
| **Empresa** | `/overflow-one/dashboard` | Dashboard Empresarial | IA, relatórios, inventário |
| **Atendente** | `/overflow-one/atendente` | Dashboard Atendentes | Apenas visualização |
| **Gestor Municipal** | `/overflow-one/municipal` | Dashboard Municipal | Visualização + edições locais |
| **Gestor Estadual** | `/overflow-one/estadual` | Dashboard Estadual | Visualização + coordenação regional |
| **Master Admin** | `/overflow-one/master` | Master Dashboard | Controle total + edição de conteúdo |

---

## 📊 **DASHBOARDS ESPECÍFICOS**

### **1. Dashboard Empresarial** (`/overflow-one/dashboard`)
**Para:** Empresas de turismo
**Funcionalidades:**
- 🤖 IA Guilherme (assistente empresarial)
- 📊 Relatórios personalizados
- 🗺️ Inventário turístico (mapa + lista)
- 📈 Análise de mercado
- 💼 Gestão de parceiros
- 📋 Diagnósticos empresariais

### **2. Dashboard Atendentes** (`/overflow-one/atendente`)
**Para:** Atendentes dos CATs
**Funcionalidades:**
- 👥 Gestão de atendimentos
- 📞 Suporte ao turista
- 📊 Métricas de atendimento
- 📋 Relatórios de atividades
- 🎯 Metas e indicadores

### **3. Dashboard Municipal** (`/overflow-one/municipal`)
**Para:** Gestores municipais
**Funcionalidades:**
- 🏛️ Gestão municipal de turismo
- 📊 Métricas locais
- 🎯 Planejamento estratégico
- 📋 Relatórios municipais
- ✏️ **Edições locais** (eventos, roteiros locais)

### **4. Dashboard Estadual** (`/overflow-one/estadual`)
**Para:** Gestores estaduais
**Funcionalidades:**
- 🌍 Coordenação regional
- 📊 Métricas estaduais
- 🎯 Planejamento estratégico estadual
- 📋 Relatórios estaduais
- ✏️ **Coordenação regional** (roteiros interestaduais)

### **5. Master Dashboard** (`/overflow-one/master`)
**Para:** Administrador master (você)
**Funcionalidades:**
- 🎛️ **Gestão de Conteúdo** (editar eventos, roteiros, passaporte)
- ⚙️ **Configurações** do sistema
- 👥 Gestão de usuários
- 📊 Métricas globais
- 🔧 Configurações avançadas

---

## 🔐 **SISTEMA DE PERMISSÕES**

### **Níveis de Acesso:**

| Funcionalidade | Empresa | Atendente | Gestor Municipal | Gestor Estadual | Master Admin |
|----------------|---------|-----------|------------------|-----------------|--------------|
| **Visualização** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edições Locais** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Coordenação Regional** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gestão de Conteúdo** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Configurações** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🛠️ **IMPLEMENTAÇÃO TÉCNICA**

### **ETAPA 1: Atualizar Sistema de Usuários** ✅
- [x] Adicionar campo `user_type` ao `OverflowOneUserProfile`
- [x] Atualizar tipos TypeScript
- [x] Modificar sistema de registro

### **ETAPA 2: Reutilizar Dashboards Existentes** ✅
- [x] `OverflowOneAtendenteDashboard` (wrapper do AtendenteDashboard existente)
- [x] `OverflowOneMunicipalDashboard` (wrapper do MunicipalDashboard existente)
- [x] `OverflowOneEstadualDashboard` (wrapper do EstadualDashboard existente)
- [x] Manter `OverflowOneDashboard` (empresas)
- [x] Manter `OverflowOneMasterDashboard` (master)

### **ETAPA 3: Sistema de Roteamento Inteligente** ✅
- [x] Redirecionamento automático baseado no tipo
- [x] Proteção de rotas por tipo de usuário
- [x] Middleware de autenticação

### **ETAPA 4: Atualizar Navbar** 🔄
- [ ] Links dinâmicos baseados no tipo de usuário
- [ ] Esconder funcionalidades não permitidas
- [ ] Indicador visual do tipo de usuário

### **ETAPA 5: Testes e Validação** 🔄
- [x] Testar login com diferentes tipos
- [x] Validar redirecionamentos
- [ ] Verificar proteção de rotas
- [ ] Testar permissões

---

## 📝 **NOTAS IMPORTANTES**

### **Diferença das Plataformas:**
- **Overflow One**: Plataforma principal com dashboards empresariais e órgãos públicos
- **Descubra MS**: Produto da Overflow One (não modificar)

### **Segurança:**
- Cada tipo de usuário vê apenas seu dashboard
- Proteção de rotas implementada
- Validação de permissões em tempo real

### **Escalabilidade:**
- Sistema preparado para novos tipos de usuários
- Fácil adição de novas funcionalidades
- Estrutura modular e manutenível

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Implementar sistema de tipos de usuários**
2. **Criar dashboards específicos**
3. **Implementar roteamento inteligente**
4. **Atualizar interface de usuário**
5. **Testar e validar sistema**

---

*Documento criado em: 2024*
*Versão: 1.0*
*Status: Em implementação*
