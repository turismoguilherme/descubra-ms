# ⚙️ Guia de Configuração e Desenvolvimento - FlowTrip / Descubra MS

Este documento detalha os passos para configurar o ambiente de desenvolvimento, testar o sistema e realizar o deploy da plataforma FlowTrip / Descubra MS.

## 🧪 Como Testar o Sistema

### 1. Iniciar o Projeto
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

### 2. Acessar o Sistema
```
URL: http://localhost:8080
Login: http://localhost:8080/admin-login
```

### 3. Credenciais de Teste
| Role             | Email                    | Senha          | Dashboard              |
|------------------|--------------------------|----------------|------------------------|
| **Atendente**        | `atendente@ms.gov.br`    | `atendente123` | Check-ins e IA         |
| **Gestor Municipal** | `gestor.municipal@ms.gov.br` | `gestor123`    | Destinos locais        |
| **Gestor Regional**  | `gestor.regional@ms.gov.br`  | `regional123`  | Cidades regionais      |
| **Diretor Estadual** | `diretor.estadual@ms.gov.br` | `diretor123`   | Visão estadual         |

### 4. Testar Funcionalidades

#### Sistema de Ponto Eletrônico
1. Faça login como atendente
2. Clique em "Fazer Check-in"
3. Veja o tempo de trabalho em tempo real
4. Clique em "Fazer Check-out"

#### IA de Atendimento
1. No dashboard do atendente
2. Clique em "Testar Tradução"
3. Clique em "Testar Roteiros"
4. Digite mensagens no chat da IA

#### APIs Governamentais
1. Acesse o console do navegador (F12)
2. Execute comandos:
```javascript
// Testar APIs
governmentAPI.getRealTimeData()
governmentAPI.getMinistryTourismData('MS')
governmentAPI.getWeatherData('5002704')
governmentAPI.clearCache()
```

### 5. Comandos Úteis no Console
```javascript
// Login de teste
simulateLogin('atendente')
simulateLogin('gestor_municipal')
simulateLogin('gestor_igr')
simulateLogin('diretor_estadual')

// Verificar dados
getTestData()
isTestMode()

// Limpar dados
clearTestData()
localStorage.clear()

// Testar IA
attendanceAI.getStatus()
attendanceAI.translateText('Olá', 'en-US')
attendanceAI.processMessage('Gostaria de informações sobre Bonito')
```

## 🔧 Configuração e Deploy

### Variáveis de Ambiente
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ALUMIA (quando disponível)
REACT_APP_ALUMIA_API_KEY=your_alumia_api_key
REACT_APP_ALUMIA_BASE_URL=https://api.alumia.com/v1

# APIs Governamentais (opcional)
REACT_APP_MINISTRY_TOURISM_API_KEY=your_key
REACT_APP_INMET_API_KEY=your_key
```

### Deploy
```bash
# Build para produção
npm run build

# Deploy no Vercel
vercel --prod

# Deploy no Netlify
netlify deploy --prod
```

### Configuração do Supabase
1. Criar projeto no Supabase
2. Executar migrações SQL
3. Configurar autenticação
4. Configurar RLS (Row Level Security)
5. Configurar funções Edge 