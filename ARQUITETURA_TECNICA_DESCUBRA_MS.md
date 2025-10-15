# 🏗️ ARQUITETURA TÉCNICA - DESCUBRA MATO GROSSO DO SUL

## 🎯 **VISÃO GERAL DA ARQUITETURA**

O Descubra Mato Grosso do Sul é construído com uma arquitetura moderna, escalável e performática, utilizando as melhores práticas de desenvolvimento web e tecnologias de ponta.

---

## 🛠️ **STACK TECNOLÓGICO**

### **Frontend:**
- **React 18.3.1** - Biblioteca principal com hooks e context
- **TypeScript 5.5.4** - Tipagem estática para maior segurança
- **Vite 6.0.1** - Build tool moderno e rápido
- **Tailwind CSS 3.4.15** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes acessíveis

### **Backend & Database:**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL 15+ - Banco de dados relacional
  - Auth - Autenticação e autorização
  - Storage - Armazenamento de arquivos
  - Edge Functions - Lógica serverless

### **Inteligência Artificial:**
- **Google Gemini API** - Modelo de linguagem
- **Edge Functions** - Processamento serverless
- **Web Search API** - Pesquisa em tempo real

### **Deploy & Infraestrutura:**
- **Vercel** - Deploy e CDN global
- **Supabase Cloud** - Banco de dados gerenciado
- **GitHub** - Controle de versão

---

## 📁 **ESTRUTURA DE ARQUIVOS**

```
src/
├── components/                 # Componentes reutilizáveis
│   ├── layout/               # Layouts universais
│   │   ├── UniversalLayout.tsx
│   │   ├── UniversalNavbar.tsx
│   │   └── UniversalFooter.tsx
│   ├── home/                 # Seções da página inicial
│   │   ├── TourismDescription.tsx
│   │   ├── TourismStatsSection.tsx
│   │   ├── DestaquesSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   └── CatsSection.tsx
│   ├── guata/                # Componentes do Guatá IA
│   │   ├── GuataHeader.tsx
│   │   ├── GuataChat.tsx
│   │   └── SuggestionQuestions.tsx
│   ├── profile/              # Sistema de perfil
│   │   ├── PantanalAvatarSelector.tsx
│   │   ├── AvatarPersonalityModal.tsx
│   │   ├── AchievementSystemSimple.tsx
│   │   └── EnvironmentalQuizSimple.tsx
│   ├── auth/                 # Componentes de autenticação
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SecureProfileForm.tsx
│   ├── security/             # Componentes de segurança
│   │   ├── SecurityHeaders.tsx
│   │   └── SecurityProvider.tsx
│   └── ui/                   # Componentes base
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
├── pages/                    # Páginas da aplicação
│   ├── ms/                   # Páginas específicas do MS
│   │   ├── EventosMS.tsx
│   │   ├── PassaporteLista.tsx
│   │   └── PassaporteRouteMS.tsx
│   ├── MSIndex.tsx           # Página inicial
│   ├── Destinos.tsx          # Catálogo de destinos
│   ├── Guata.tsx             # Assistente IA
│   ├── ProfilePageFixed.tsx  # Sistema de perfil
│   └── ...
├── hooks/                    # Hooks customizados
│   ├── useAuth.ts
│   ├── useGuataConnection.ts
│   ├── useGuataInput.ts
│   └── use-toast.ts
├── services/                 # Serviços e APIs
│   ├── ai/                   # Serviços de IA
│   │   ├── guataIntelligentTourismService.ts
│   │   └── knowledge/
│   ├── supabase/             # Cliente Supabase
│   └── user-photos/          # Serviços de fotos
├── context/                  # Contextos React
│   ├── BrandContext.tsx
│   └── SecurityProvider.tsx
├── integrations/             # Integrações externas
│   └── supabase/
├── assets/                   # Recursos estáticos
│   └── images/
└── types/                    # Definições de tipos
    └── index.ts
```

---

## 🔧 **COMPONENTES PRINCIPAIS**

### **1. UniversalLayout.tsx**
```typescript
interface UniversalLayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
  className?: string;
}
```

**Responsabilidades:**
- Layout base para todas as páginas
- Integração com BrandContext
- Header e Footer universais
- Gerenciamento de estado global

### **2. UniversalNavbar.tsx**
```typescript
interface NavbarProps {
  brand: BrandConfig;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}
```

**Funcionalidades:**
- Navegação responsiva
- Logo dinâmico por marca
- Menu de usuário autenticado
- Integração com autenticação

### **3. GuataChat.tsx**
```typescript
interface GuataChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}
```

**Funcionalidades:**
- Interface de chat
- Mensagens em tempo real
- Sugestões de perguntas
- Estados de loading

---

## 🗄️ **BANCO DE DADOS (SUPABASE)**

### **Tabelas Principais:**

#### **1. user_profiles**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  selected_avatar TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  pantanal_animals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **2. destinations**
```sql
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  region TEXT,
  image_url TEXT,
  category TEXT,
  coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **3. events**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location JSONB,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  source TEXT,
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Políticas de Segurança (RLS):**

#### **user_profiles**
```sql
-- Usuários podem ler seu próprio perfil
CREATE POLICY "Users can read their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);
```

#### **destinations**
```sql
-- Destinos são públicos para leitura
CREATE POLICY "Destinations are publicly readable" ON destinations
    FOR SELECT USING (true);
```

#### **events**
```sql
-- Eventos são públicos para leitura
CREATE POLICY "Events are publicly readable" ON events
    FOR SELECT USING (true);
```

---

## 🔐 **SISTEMA DE AUTENTICAÇÃO**

### **Fluxo de Autenticação:**

#### **1. Registro:**
```typescript
const handleRegister = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
};
```

#### **2. Login:**
```typescript
const handleLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
};
```

#### **3. Perfil Completo:**
```typescript
const handleProfileCompletion = async (profileData: ProfileFormData) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      ...profileData
    });
};
```

### **Hooks de Autenticação:**

#### **useAuth.ts**
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
}
```

---

## 🤖 **SISTEMA DE IA (GUATÁ)**

### **Arquitetura da IA:**

#### **1. Serviço Principal:**
```typescript
// guataIntelligentTourismService.ts
export class GuataIntelligentTourismService {
  async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<GuataResponse> {
    // Lógica de processamento
  }
}
```

#### **2. Base de Conhecimento:**
```typescript
// guataKnowledgeBase.ts
export const getInitialKnowledgeBase = () => ({
  destinations: [...],
  events: [...],
  culture: [...],
  nature: [...]
});
```

#### **3. Integração com Gemini:**
```typescript
const response = await fetch('/api/guata-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: userMessage,
    context: conversationContext
  })
});
```

### **Edge Functions:**

#### **guata-chat.ts**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { message, context } = await req.json();
  
  // Processar com Gemini API
  const response = await processWithGemini(message, context);
  
  return new Response(JSON.stringify(response));
});
```

---

## 🎨 **SISTEMA DE DESIGN**

### **Design Tokens:**

#### **Cores:**
```typescript
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#f0fdf4',
    500: '#22c55e',
    900: '#14532d'
  }
};
```

#### **Tipografia:**
```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  }
};
```

#### **Espaçamento:**
```typescript
const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem'
};
```

### **Componentes Base:**

#### **Button.tsx**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

#### **Card.tsx**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}
```

---

## 📱 **RESPONSIVIDADE**

### **Breakpoints:**
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

### **Grid System:**
```typescript
const grid = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  columns: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  }
};
```

---

## 🚀 **PERFORMANCE**

### **Otimizações:**

#### **1. Code Splitting:**
```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

#### **2. Lazy Loading:**
```typescript
const ProfilePage = lazy(() => import('@/pages/ProfilePageFixed'));
```

#### **3. Memoização:**
```typescript
const MemoizedComponent = memo(ExpensiveComponent);
```

#### **4. Bundle Optimization:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
```

### **Caching Strategy:**
- **Static Assets:** Cache longo (1 ano)
- **API Responses:** Cache médio (1 hora)
- **User Data:** Cache curto (5 minutos)

---

## 🔒 **SEGURANÇA**

### **Content Security Policy:**
```typescript
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https://source.unsplash.com'],
  'connect-src': ["'self'", 'https://api.supabase.co']
};
```

### **Autenticação:**
- **JWT Tokens:** Segurança de sessão
- **RLS:** Row Level Security no Supabase
- **CSRF Protection:** Proteção contra ataques
- **Session Timeout:** Expiração automática

---

## 📊 **MONITORAMENTO**

### **Métricas de Performance:**
- **Core Web Vitals:** LCP, FID, CLS
- **Bundle Size:** Análise de tamanho
- **Load Time:** Tempo de carregamento
- **Error Rate:** Taxa de erros

### **Logging:**
```typescript
const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  error: (message: string, error?: Error) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data)
};
```

---

## 🚀 **DEPLOY**

### **Vercel Configuration:**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### **Environment Variables:**
```typescript
const env = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY
};
```

---

## 🔮 **ROADMAP TÉCNICO**

### **Fase 1 - Implementada ✅**
- Arquitetura base
- Sistema de autenticação
- IA integrada
- Interface responsiva

### **Fase 2 - Planejada 🚧**
- PWA (Progressive Web App)
- Offline support
- Push notifications
- Advanced caching

### **Fase 3 - Futuro 🔮**
- Microservices
- Real-time features
- Advanced analytics
- AI/ML enhancements

---

*Esta arquitetura garante escalabilidade, manutenibilidade e performance otimizada para a plataforma Descubra Mato Grosso do Sul.*
