# Documentação Completa - Descubra Mato Grosso do Sul

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura da Aplicação](#estrutura-da-aplicação)
3. [Layout e Componentes](#layout-e-componentes)
4. [Sistema de Navegação](#sistema-de-navegação)
5. [Guatá IA - Sistema Completo](#guatá-ia---sistema-completo)
6. [Cores e Branding](#cores-e-branding)
7. [Páginas e Funcionalidades](#páginas-e-funcionalidades)
8. [Sistema de Proteção](#sistema-de-proteção)
9. [Restauração de Emergência](#restauração-de-emergência)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Descubra Mato Grosso do Sul** é uma plataforma de turismo inteligente que integra:
- **Sistema de IA Guatá** - Assistente virtual especializado em turismo
- **Passaporte Digital** - Sistema de gamificação para turistas
- **Gestão de Destinos** - Catálogo completo de atrativos turísticos
- **Sistema Multi-tenant** - Suporte a diferentes marcas (MS e ViaJAR)

---

## 🏗️ Estrutura da Aplicação

### **Arquitetura Principal**
```
src/
├── components/
│   ├── layout/           # Componentes de layout
│   ├── home/            # Componentes da página inicial
│   ├── auth/            # Autenticação
│   └── ui/              # Componentes de interface
├── pages/
│   ├── MSIndex.tsx      # Página inicial MS
│   ├── Guata.tsx        # Página do Guatá
│   ├── Destinos.tsx     # Página de destinos
│   └── ms/              # Páginas específicas MS
├── context/
│   ├── BrandContext.tsx # Contexto de marca
│   └── TourismDataContext.tsx
├── hooks/
│   ├── useAuth.ts       # Hook de autenticação
│   ├── useGuata*.ts     # Hooks do Guatá
│   └── useTourismData.tsx
├── services/
│   ├── ai/              # Serviços de IA
│   └── tourism/         # Serviços de turismo
└── utils/
    ├── guataLayoutProtection.ts
    └── guataTimeout.ts
```

### **Roteamento Principal**
```typescript
// Rotas MS (App.tsx)
<Route path="/ms" element={<MSIndex />} />
<Route path="/ms/login" element={<Login />} />
<Route path="/ms/register" element={<Register />} />
<Route path="/ms/destinos" element={<Destinos />} />
<Route path="/ms/destinos/:id" element={<DestinoDetalhes />} />
<Route path="/ms/eventos" element={<EventosMS />} />
<Route path="/ms/parceiros" element={<Partners />} />
<Route path="/ms/guata" element={<Guata />} />
<Route path="/ms/passaporte" element={<PassaporteLista />} />
```

---

## 🎨 Layout e Componentes

### **1. UniversalLayout**
**Arquivo**: `src/components/layout/UniversalLayout.tsx`
- **Função**: Layout principal que envolve todas as páginas
- **Componentes**: UniversalNavbar + UniversalFooter + children
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### **2. UniversalNavbar**
**Arquivo**: `src/components/layout/UniversalNavbar.tsx`
- **Logo**: Logo dinâmica baseada no contexto de marca
- **Menu**: Navegação adaptativa (público/autenticado)
- **Botões**: "Entrar" e "Cadastrar" com links corretos
- **Responsivo**: Menu hambúrguer em mobile

### **3. UniversalHero**
**Arquivo**: `src/components/layout/UniversalHero.tsx`
- **Fundo**: Gradiente `from-blue-600 via-teal-600 to-green-600`
- **Conteúdo**: Título, subtítulo e 3 botões de ação
- **Botões**:
  - "Descubra Agora" → `/ms/welcome`
  - "Passaporte Digital" → `/ms/passaporte`
  - "Converse com o Guatá" → `/ms/guata`

### **4. Seções da Página Inicial**

#### **TourismDescription**
**Arquivo**: `src/components/home/TourismDescription.tsx`
- **Fundo**: Gradiente igual ao cadastro
- **Conteúdo**: Descrição da plataforma
- **Botão**: "Cadastre-se" → `/ms/register`

#### **TourismStatsSection**
**Arquivo**: `src/components/home/TourismStatsSection.tsx`
- **Fundo**: `from-ms-primary-blue/5 via-white to-ms-pantanal-green/5`
- **Conteúdo**: Estatísticas de turismo com gráficos
- **Dados**: Visitantes, crescimento, interesses, origens

#### **DestaquesSection**
**Arquivo**: `src/components/home/DestaquesSection.tsx`
- **Conteúdo**: Destinos em destaque
- **Link**: "Ver Todos os Destinos" → `/ms/destinos`

#### **ExperienceSection**
**Arquivo**: `src/components/home/ExperienceSection.tsx`
- **Conteúdo**: Experiências completas
- **Design**: Cards com gradientes e animações

#### **CatsSection**
**Arquivo**: `src/components/home/CatsSection.tsx`
- **Conteúdo**: Centros de Atendimento ao Turista
- **Design**: Cards centralizados com ícones

---

## 🧭 Sistema de Navegação

### **Menu Principal (Navbar)**
```typescript
// Navegação pública
navigation: [
  { name: 'Destinos', path: '/ms/destinos' },
  { name: 'Eventos', path: '/ms/eventos' },
  { name: 'Parceiros', path: '/ms/parceiros' },
  { name: 'Entrar', path: '/ms/login' }
]

// Navegação autenticada
authenticatedNavigation: [
  { name: 'Home', path: '/ms' },
  { name: 'Guatá IA', path: '/ms/guata' },
  { name: 'Passaporte Digital', path: '/ms/passaporte' }
]
```

### **Sistema de Branding**
**Arquivo**: `src/context/BrandContext.tsx`
- **Detecção automática** de tenant baseada na URL
- **Configuração MS**: Cores, logo, textos específicos
- **Configuração ViaJAR**: Configuração alternativa
- **Logo dinâmica**: `/images/logo-descubra-ms.png?v=3`

---

## 🤖 Guatá IA - Sistema Completo

### **Arquitetura do Guatá**

#### **1. Página Principal**
**Arquivo**: `src/pages/Guata.tsx`
- **Layout**: UniversalLayout (navbar + footer)
- **Estados**: Loading, erro, modo convidado
- **Timeout**: 3s para autenticação, 5s para inicialização
- **Fallback**: Modo convidado se autenticação falhar

#### **2. Hooks Especializados**

##### **useGuataConnection**
**Arquivo**: `src/hooks/useGuataConnection.ts`
- **Função**: Verifica conexão com API do Guatá
- **Timeout**: 5 segundos
- **Retry**: 3 tentativas

##### **useGuataConversation**
**Arquivo**: `src/hooks/useGuataConversation.ts`
- **Função**: Gerencia conversas com o Guatá
- **Mensagens**: Envio e recebimento
- **Estado**: Loading, erro, sucesso

##### **useGuataMessages**
**Arquivo**: `src/hooks/useGuataMessages.ts`
- **Função**: Gerencia histórico de mensagens
- **Persistência**: LocalStorage
- **Limpeza**: Auto-limpeza de mensagens antigas

#### **3. Serviços de IA**

##### **Knowledge Base**
**Arquivo**: `src/services/ai/knowledge/guataKnowledgeBase.ts`
- **Conteúdo**: Base de conhecimento sobre MS
- **Tópicos**: Turismo, cultura, geografia, história
- **Atualização**: Manual via arquivo

##### **AI Service**
**Arquivo**: `src/services/ai/index.ts`
- **Função**: Orquestra todos os serviços de IA
- **Integração**: Conecta hooks e serviços
- **Fallback**: Respostas padrão se API falhar

#### **4. Sistema de Timeout**
**Arquivo**: `src/utils/guataTimeout.ts`
```typescript
export const GUATA_TIMEOUTS = {
  AUTH_LOADING: 3000,      // 3s para carregar auth
  INITIALIZATION: 5000,    // 5s para inicializar
  CONNECTION_CHECK: 5000,  // 5s para verificar conexão
  MESSAGE_SEND: 10000,     // 10s para enviar mensagem
  COMPONENT_LOAD: 3000     // 3s para carregar componente
};
```

#### **5. Proteção de Layout**
**Arquivo**: `src/utils/guataLayoutProtection.ts`
- **Função**: Protege layout do Guatá contra alterações
- **Backup**: Cria backup automático
- **Restauração**: Restaura layout original se necessário
- **Verificação**: Valida integridade do componente

### **Estados do Guatá**

#### **1. Carregamento Inicial**
```typescript
const [isInitializing, setIsInitializing] = useState(true);
const [initializationError, setInitializationError] = useState<string | null>(null);
const [retryCount, setRetryCount] = useState(0);
```

#### **2. Autenticação**
```typescript
const [isGuestMode, setIsGuestMode] = useState(false);
const [authTimeout, setAuthTimeout] = useState(false);
```

#### **3. Conversa**
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### **Interface do Guatá**

#### **Tela de Carregamento**
- **Spinner**: Animação de carregamento
- **Mensagem**: "Inicializando Guatá..."
- **Timeout**: Opção de continuar como convidado

#### **Tela de Erro**
- **Mensagem**: Erro específico
- **Botão**: "Tentar Novamente"
- **Fallback**: "Continuar como Convidado"

#### **Modo Convidado**
- **Banner**: Aviso de modo limitado
- **Funcionalidade**: Chat básico sem persistência

#### **Chat Principal**
- **Input**: Campo de texto com placeholder
- **Mensagens**: Histórico com scroll
- **Typing**: Indicador de digitação
- **Envio**: Enter ou botão

---

## 🎨 Cores e Branding

### **Cores Principais MS**
**Arquivo**: `src/index.css`
```css
:root {
  --ms-primary-blue: 220 91% 29%;
  --ms-secondary-yellow: 48 96% 55%;
  --ms-pantanal-green: 140 65% 42%;
  --ms-cerrado-orange: 24 95% 53%;
  --ms-discovery-teal: 180 84% 32%;
  --ms-earth-brown: 30 45% 35%;
  --ms-sky-blue: 210 100% 70%;
  --ms-nature-green-light: 140 50% 75%;
  --ms-guavira-purple: 280 65% 50%;
  --ms-rivers-blue: 200 85% 45%;
  --ms-accent-orange: 25 100% 60%;
}
```

### **Gradientes Padrão**
- **Hero**: `from-blue-600 via-teal-600 to-green-600`
- **Descrição**: `from-blue-600 via-teal-600 to-green-600`
- **Estatísticas**: `from-ms-primary-blue/5 via-white to-ms-pantanal-green/5`

---

## 📄 Páginas e Funcionalidades

### **1. Página Inicial (MSIndex)**
**Arquivo**: `src/pages/MSIndex.tsx`
- **Componentes**: Hero + Descrição + Estatísticas + Destaques + Experiências + CATs
- **Dados**: Mock data para evitar loading infinito
- **Responsivo**: Adapta-se a todos os dispositivos

### **2. Página de Destinos**
**Arquivo**: `src/pages/Destinos.tsx`
- **Layout**: Grid responsivo de cards
- **Filtros**: Por categoria e região
- **Links**: Para páginas de detalhes
- **Design**: Cards com hover effects

### **3. Página de Detalhes do Destino**
**Arquivo**: `src/pages/DestinoDetalhes.tsx`
- **Rota**: `/ms/destinos/:id`
- **Dados**: Mock data com fallback
- **Conteúdo**: Descrição, vídeo, fotos
- **Navegação**: Voltar para destinos

### **4. Página de Eventos**
**Arquivo**: `src/pages/ms/EventosMS.tsx`
- **Conteúdo**: Calendário de eventos
- **Dados**: Mock data
- **Filtros**: Por data e categoria

### **5. Página de Parceiros**
**Arquivo**: `src/pages/Partners.tsx`
- **Conteúdo**: Lista de parceiros
- **Categorias**: Diferentes tipos de parceiros
- **Contato**: Informações de contato

---

## 🛡️ Sistema de Proteção

### **1. Proteção do Layout Guatá**
**Arquivo**: `src/utils/guataLayoutProtection.ts`
```typescript
export const protectGuataLayout = () => {
  // Cria backup do layout atual
  // Monitora alterações
  // Restaura se necessário
};
```

### **2. Scripts de Restauração**
- **restore_guata_layout.bat**: Restaura layout do Guatá
- **verify_guata_layout.bat**: Verifica integridade
- **test_guata_protection.bat**: Testa proteção

### **3. Backups Automáticos**
- **Guata.tsx.backup**: Backup do componente principal
- **Verificação contínua**: Monitora alterações
- **Restauração automática**: Se detectar problemas

---

## 🔧 Restauração de Emergência

### **1. Restaurar Layout do Guatá**
```bash
# Executar script de restauração
./restore_guata_layout.bat

# Verificar integridade
./verify_guata_layout.bat
```

### **2. Restaurar Cores e Branding**
```bash
# Restaurar cores MS
git checkout HEAD -- src/index.css

# Restaurar contexto de marca
git checkout HEAD -- src/context/BrandContext.tsx
```

### **3. Restaurar Estrutura Completa**
```bash
# Restaurar todos os componentes
git checkout HEAD -- src/components/
git checkout HEAD -- src/pages/
git checkout HEAD -- src/hooks/
```

### **4. Verificar Funcionamento**
```bash
# Testar aplicação
npm run dev

# Verificar logs
npm run build
```

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **1. Loading Infinito**
- **Causa**: TourismDataProvider com React Query
- **Solução**: Usar dados mock no MSIndex
- **Prevenção**: Evitar dependências complexas

#### **2. Tela Branca**
- **Causa**: Erro de renderização (objetos como children)
- **Solução**: Verificar renderização de arrays/objetos
- **Debug**: Console do navegador

#### **3. Guatá Não Carrega**
- **Causa**: Timeout de autenticação
- **Solução**: Modo convidado ou retry
- **Configuração**: Ajustar timeouts

#### **4. Cores Não Aplicam**
- **Causa**: Variáveis CSS não definidas
- **Solução**: Verificar src/index.css
- **Aplicação**: Reiniciar servidor

### **Logs de Debug**
```typescript
// Ativar logs detalhados
console.log("🚀 APP: Componente App sendo renderizado");
console.log("🧭 NAVBAR: Componente UniversalNavbar sendo renderizado");
console.log("🏗️ UNIVERSAL LAYOUT: Renderizando layout universal");
```

---

## 📚 Arquivos de Documentação

### **Documentação Técnica**
- `CORRECAO_LOADING_INFINITO.md` - Correção de loading infinito
- `CORRECAO_ERRO_OBJETOS_REACT.md` - Correção de erros de renderização
- `ALTERACAO_CORES_HERO_CADASTRO.md` - Harmonização de cores
- `CORRECAO_BOTAO_E_CORES_DESCRICAO.md` - Correção de botões e cores
- `SISTEMA_PROTECAO_LAYOUT_GUATA.md` - Sistema de proteção

### **Documentação de Funcionalidades**
- `GUATA_IA_INTELIGENTE_IMPLEMENTADA.md` - Sistema Guatá
- `SISTEMA_VIAJAR_FUNCIONANDO.md` - Sistema ViaJAR
- `IMPLEMENTACAO_MULTI_TENANT_CONCLUIDA.md` - Multi-tenant

---

## 🎯 Resumo de Funcionamento

### **Fluxo Principal**
1. **Usuário acessa** `/ms`
2. **BrandContext** detecta tenant MS
3. **UniversalLayout** carrega com navbar MS
4. **MSIndex** renderiza seções da página inicial
5. **Navegação** para outras páginas via navbar
6. **Guatá** disponível via `/ms/guata`

### **Sistema de Cores**
- **Consistente** em todas as seções
- **Gradiente padrão**: `blue-600 → teal-600 → green-600`
- **Variáveis CSS** definidas em `:root`
- **Tailwind** aplica cores automaticamente

### **Sistema Guatá**
- **Protegido** contra alterações acidentais
- **Timeout** configurável para diferentes operações
- **Fallback** para modo convidado
- **Persistência** de mensagens no localStorage

### **Responsividade**
- **Mobile-first** design
- **Breakpoints** Tailwind padrão
- **Componentes** adaptativos
- **Navegação** hambúrguer em mobile

---

## 🔄 Manutenção e Atualizações

### **Verificações Regulares**
1. **Testar** todas as páginas principais
2. **Verificar** funcionamento do Guatá
3. **Validar** cores e branding
4. **Confirmar** responsividade

### **Backup Contínuo**
1. **Commits** regulares no Git
2. **Backups** automáticos dos componentes críticos
3. **Documentação** sempre atualizada
4. **Scripts** de restauração testados

---

**📝 Esta documentação deve ser mantida sempre atualizada e serve como referência completa para restaurar a funcionalidade do Descubra Mato Grosso do Sul em caso de problemas.**




