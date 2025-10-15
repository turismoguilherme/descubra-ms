# 🎯 FUNCIONALIDADES ESPECÍFICAS - DESCUBRA MATO GROSSO DO SUL

## 🏠 **PÁGINA INICIAL (MSIndex.tsx)**

### **Seções Implementadas:**

#### **1. UniversalHero**
- **Propósito:** Apresentação visual impactante do MS
- **Elementos:**
  - Logo do Descubra MS
  - Título principal: "Descubra Mato Grosso do Sul"
  - Subtítulo: "Conecte-se com a natureza e cultura sul-mato-grossense"
  - Call-to-Action: "Explorar Destinos"
  - Imagem de fundo: Pantanal ou Bonito
- **Visual:**
  - Gradiente azul-verde
  - Altura: 100vh
  - Texto centralizado
  - Botão com hover effect

#### **2. TourismDescription**
- **Propósito:** Descrição do turismo no MS
- **Conteúdo:**
  - Texto sobre biodiversidade
  - Destaque para Pantanal e Bonito
  - Estatísticas de turismo
  - Imagens representativas
- **Layout:**
  - Grid 2 colunas (texto + imagem)
  - Responsivo para mobile
  - Animações suaves

#### **3. TourismStatsSection**
- **Propósito:** Métricas de turismo em tempo real
- **Dados Exibidos:**
  - Total de visitantes: 1.250.000
  - Taxa de crescimento: 15.2%
  - Interesses por categoria
  - Gráficos de tendências
  - Origem dos visitantes
- **Visual:**
  - Cards com ícones
  - Gráficos interativos
  - Cores temáticas
  - Animações de contagem

#### **4. DestaquesSection**
- **Propósito:** Principais atrativos do estado
- **Destinos em Destaque:**
  - Pantanal
  - Bonito
  - Campo Grande
  - Corumbá
  - Três Lagoas
- **Layout:**
  - Grid responsivo
  - Cards com imagens
  - Botões de ação
  - Hover effects

#### **5. ExperienceSection**
- **Propósito:** Categorias de experiência
- **Categorias:**
  - Ecoturismo
  - Turismo Rural
  - Pesca Esportiva
  - Turismo Cultural
  - Aventura
- **Visual:**
  - Ícones representativos
  - Descrições curtas
  - Links para filtros

#### **6. CatsSection**
- **Propósito:** Centros de Atendimento ao Turista
- **Informações:**
  - Localização dos CATs
  - Horários de funcionamento
  - Serviços oferecidos
  - Contato
- **Layout:**
  - Lista com ícones
  - Informações de contato
  - Mapas integrados

---

## 🗺️ **DESTINOS (Destinos.tsx)**

### **Funcionalidades Principais:**

#### **1. Sistema de Filtros**
```typescript
const categorias = [
  { name: "Todos", icon: Compass },
  { name: "Ecoturismo", icon: Palmtree },
  { name: "Turismo Rural", icon: Mountain },
  { name: "Pesca Esportiva", icon: Waves },
  { name: "Turismo Cultural", icon: Building2 },
  { name: "Aventura", icon: Star }
];
```

**Funcionalidades:**
- Filtros por categoria
- Busca por texto
- Ordenação (nome, popularidade)
- Filtros combinados

#### **2. Grid de Destinos**
```typescript
interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  region: string;
  image_url: string;
  category?: string;
}
```

**Layout:**
- Grid responsivo (1-3 colunas)
- Cards com imagens
- Informações básicas
- Botões de ação

#### **3. Página de Detalhes**
- **Rota:** `/ms/destino/:id`
- **Componente:** `DestinoDetalhes.tsx`
- **Conteúdo:**
  - Galeria de imagens
  - Informações completas
  - Localização no mapa
  - Avaliações
  - Roteiros relacionados

### **Integração com Supabase:**
```typescript
const fetchDestinos = async () => {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('name');
};
```

---

## 🤖 **GUATÁ - ASSISTENTE IA (Guata.tsx)**

### **Arquitetura da IA:**

#### **1. Serviço Principal**
```typescript
// guataIntelligentTourismService.ts
export class GuataIntelligentTourismService {
  async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<GuataResponse> {
    // Processamento com Gemini API
  }
}
```

#### **2. Base de Conhecimento**
```typescript
// guataKnowledgeBase.ts
export const getInitialKnowledgeBase = () => ({
  destinations: [
    {
      name: "Pantanal",
      description: "Maior planície alagável do mundo",
      activities: ["Observação de fauna", "Pesca esportiva"],
      bestTime: "Abril a novembro"
    }
  ],
  events: [...],
  culture: [...],
  nature: [...]
});
```

#### **3. Hooks Customizados**
```typescript
// useGuataConnection.ts
export const useGuataConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionChecking, setConnectionChecking] = useState(true);
  
  // Lógica de conexão
};
```

### **Interface de Chat:**

#### **1. GuataHeader**
- Avatar da capivara
- Status de conexão
- Contador de mensagens
- Botão de configurações

#### **2. GuataChat**
- Lista de mensagens
- Input de texto
- Botões de ação
- Estados de loading

#### **3. SuggestionQuestions**
- Perguntas sugeridas
- Categorias temáticas
- Botões de ação rápida

### **Capacidades da IA:**

#### **1. Recomendações Personalizadas**
- Baseadas no perfil do usuário
- Histórico de conversas
- Preferências salvas
- Localização atual

#### **2. Informações Turísticas**
- Horários de funcionamento
- Preços atualizados
- Condições climáticas
- Disponibilidade

#### **3. Pesquisa Web**
- Informações em tempo real
- Notícias relevantes
- Eventos atuais
- Dados oficiais

---

## 📅 **EVENTOS (EventosMS.tsx)**

### **Funcionalidades:**

#### **1. Calendário de Eventos**
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  start_date: string;
  end_date?: string;
  image_url?: string;
  source: string;
  external_url?: string;
  is_active?: boolean;
  is_visible?: boolean;
}
```

#### **2. Sistema de Filtros**
- Por data (mês/ano)
- Por categoria
- Por localização
- Por status (ativo/inativo)

#### **3. Integração com APIs**
- Eventos governamentais
- Calendários oficiais
- Sincronização automática
- Atualizações em tempo real

### **Layout:**
- Grid responsivo
- Cards com imagens
- Informações de data/hora
- Botões de ação
- Sistema de busca

---

## 🎫 **PASSAPORTE DIGITAL (PassaporteLista.tsx)**

### **Sistema de Rotas:**

#### **1. Rotas Disponíveis**
```typescript
interface PassaporteRoute {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  duration: string;
  checkpoints: number;
  completed: boolean;
  progress: number;
}
```

#### **2. Sistema de Check-ins**
- Marcação de locais visitados
- Validação por GPS
- Fotos de comprovação
- Timestamps automáticos

#### **3. Gamificação**
- Sistema de pontos
- Conquistas especiais
- Rankings de usuários
- Certificados digitais

### **Rotas Temáticas:**

#### **1. Rota do Pantanal**
- **Duração:** 3 dias
- **Dificuldade:** Médio
- **Checkpoints:** 8
- **Atrações:** Observação de fauna, pesca, trilhas

#### **2. Rota de Bonito**
- **Duração:** 2 dias
- **Dificuldade:** Fácil
- **Checkpoints:** 6
- **Atrações:** Cachoeiras, grutas, flutuação

#### **3. Rota Cultural**
- **Duração:** 1 dia
- **Dificuldade:** Fácil
- **Checkpoints:** 4
- **Atrações:** Museus, centros históricos, artesanato

---

## 👤 **SISTEMA DE PERFIL (ProfilePageFixed.tsx)**

### **Estrutura do Perfil:**

#### **1. Header do Perfil**
```typescript
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  selected_avatar?: string;
  achievements: any[];
  pantanal_animals: PantanalAnimal[];
  created_at: string;
  updated_at: string;
}
```

#### **2. Sistema de Abas**
- **Perfil:** Informações pessoais
- **Conquistas:** Sistema de gamificação
- **Quiz:** Educação ambiental
- **Animais:** Catálogo de avatares
- **Histórico:** Timeline de atividades

### **Sistema de Avatares:**

#### **1. Seleção de Avatar**
```typescript
interface PantanalAnimal {
  id: string;
  name: string;
  scientific_name: string;
  image: string;
  description: string;
  habitat: string;
  diet: string;
  curiosities: string[];
  is_unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlock_requirement?: string;
}
```

#### **2. Sistema de Raridade**
- **Comum:** Cinza - Disponível desde o início
- **Raro:** Azul - Requer esforço moderado
- **Épico:** Roxo - Desafio significativo
- **Lendário:** Dourado - Conquista especial

#### **3. Educação Ambiental**
- Informações sobre conservação
- Ameaças às espécies
- Ações de preservação
- Importância no ecossistema

### **Sistema de Conquistas:**

#### **1. Tipos de Conquistas**
- **Exploração:** Visitar destinos
- **Educação:** Completar quiz
- **Social:** Compartilhar conquistas
- **Especial:** Eventos únicos

#### **2. Sistema de Progresso**
- Barras de progresso
- Indicadores visuais
- Recompensas por conclusão
- Histórico de conquistas

### **Quiz Educativo:**

#### **1. Estrutura do Quiz**
```typescript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}
```

#### **2. Categorias**
- **Conservação:** Ameaças e preservação
- **Fauna:** Animais do Pantanal
- **Geografia:** Características regionais
- **Turismo:** Melhores práticas

#### **3. Sistema de Pontuação**
- 0-100% de acerto
- Explicações detalhadas
- Recompensas por performance
- Certificados digitais

---

## 🎨 **SISTEMA DE DESIGN**

### **Componentes UI:**

#### **1. Cards**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}
```

#### **2. Botões**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

#### **3. Modais**
```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}
```

### **Paleta de Cores:**

#### **Cores Primárias:**
- **Azul MS:** #1E40AF
- **Verde Pantanal:** #059669
- **Amarelo Ouro:** #F59E0B

#### **Cores de Raridade:**
- **Comum:** #6B7280 (Cinza)
- **Raro:** #3B82F6 (Azul)
- **Épico:** #8B5CF6 (Roxo)
- **Lendário:** #F59E0B (Dourado)

### **Tipografia:**
- **Fonte:** Inter
- **Tamanhos:** xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- **Pesos:** normal, medium, semibold, bold

---

## 📱 **RESPONSIVIDADE**

### **Breakpoints:**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### **Adaptações Mobile:**
- Grid de 1 coluna
- Botões maiores
- Texto legível
- Navegação simplificada
- Menu hamburger

### **Adaptações Desktop:**
- Grid de 3 colunas
- Hover effects
- Mais informações
- Navegação completa
- Sidebar

---

## 🔧 **INTEGRAÇÕES**

### **APIs Externas:**
- **Gemini AI:** Inteligência artificial
- **Unsplash:** Imagens de alta qualidade
- **Google Maps:** Localização e rotas
- **APIs Governamentais:** Dados oficiais

### **Supabase:**
- **Database:** PostgreSQL
- **Auth:** Autenticação
- **Storage:** Arquivos e imagens
- **Edge Functions:** Lógica serverless

---

## 🚀 **PERFORMANCE**

### **Otimizações:**
- **Code Splitting:** Componentes lazy
- **Lazy Loading:** Imagens sob demanda
- **Caching:** Dados em cache
- **Bundle Optimization:** Chunks otimizados

### **Métricas:**
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle Size:** < 500KB

---

## 🔒 **SEGURANÇA**

### **Autenticação:**
- **JWT Tokens:** Segurança de sessão
- **RLS:** Row Level Security
- **CSRF Protection:** Proteção contra ataques
- **Session Timeout:** Expiração automática

### **Dados:**
- **Criptografia:** Dados sensíveis
- **Validação:** Input sanitization
- **Rate Limiting:** Proteção contra spam
- **CSP:** Content Security Policy

---

*Esta documentação detalha todas as funcionalidades específicas implementadas na plataforma Descubra Mato Grosso do Sul, garantindo uma experiência completa e integrada para os usuários.*
