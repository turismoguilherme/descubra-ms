# 🚀 GUIA COMPLETO - Como Acessar as Funcionalidades da viajAR

## 📋 **SISTEMA DE LOGIN DE TESTES**

### **1. Acesso ao Sistema de Testes**
```
URL: http://localhost:8082/test-login
```

### **2. Usuários de Teste Disponíveis**

#### **🏨 SETOR PRIVADO - Hotéis**
- **João Silva** - Pousada do Sol (Bonito, MS)
  - Role: `user`
  - Funcionalidades: Revenue Optimizer, Market Intelligence, IA Conversacional
  - Dashboard: `/private-dashboard`

#### **🚌 SETOR PRIVADO - Agências**
- **Maria Santos** - Viagens & Cia (Campo Grande, MS)
  - Funcionalidades: Lead Generation, IA Conversacional, Sistema de Pacotes
  - Dashboard: `/private-dashboard`

#### **🍽️ SETOR PRIVADO - Restaurantes**
- **Pedro Oliveira** - Sabores do MS (Corumbá, MS)
  - Funcionalidades: Sistema de Reservas, Menu Optimizer, Analytics
  - Dashboard: `/private-dashboard`

#### **🎯 SETOR PRIVADO - Atrativos**
- **Ana Costa** - Parque das Cachoeiras (Bonito, MS)
  - Funcionalidades: Sistema de Ingressos, IA Conversacional, Analytics
  - Dashboard: `/private-dashboard`

#### **🏛️ SETOR PÚBLICO - Secretarias**
- **Prefeitura Bonito** - Secretaria de Turismo
  - Funcionalidades: Dashboard Municipal, Relatórios, Gestão de Atrações
  - Dashboard: `/secretary-dashboard`

#### **👨‍💼 ADMINISTRADOR**
- **Carlos Admin** - ViaJAR Admin
  - Funcionalidades: Todas as funcionalidades, Painel administrativo
  - Dashboard: `/viajar/dashboard`

## 🎯 **COMO TESTAR CADA FUNCIONALIDADE**

### **PASSO 1: Acessar o Sistema de Testes**
1. Abra o navegador
2. Acesse: `http://localhost:8082/test-login`
3. Você verá a tela "Usuários de Teste"

### **PASSO 2: Selecionar um Usuário**
1. **Para testar SETOR PRIVADO**: Clique em "João Silva", "Maria Santos", "Pedro Oliveira" ou "Ana Costa"
2. **Para testar SECRETARIAS**: Clique em "Prefeitura Bonito"
3. **Para testar ADMIN**: Clique em "Carlos Admin"

### **PASSO 3: Acessar o Dashboard**
1. Após selecionar o usuário, clique em "Ir para Dashboard"
2. O sistema redirecionará automaticamente para o dashboard correto

## 🏢 **FUNCIONALIDADES DO SETOR PRIVADO**

### **Dashboard: `/private-dashboard`**
- ✅ **Sistema de Diagnóstico Inteligente**
- ✅ **IA para Recomendações Personalizadas**
- ✅ **Dashboard de ROI com Métricas**
- ✅ **Implementação Guiada**

### **Como Testar:**
1. Faça login como "João Silva" (Pousada do Sol)
2. Será redirecionado para `/private-dashboard`
3. Explore as funcionalidades:
   - Sistema de diagnóstico
   - IA para recomendações
   - Analytics de ROI

## 🏛️ **FUNCIONALIDADES DAS SECRETARIAS**

### **Dashboard: `/secretary-dashboard`**
- ✅ **Inventário Turístico Inteligente**
- ✅ **Gestão de Eventos Integrada**
- ✅ **Analytics e Relatórios Avançados**
- ✅ **Marketing Digital Automático**
- ✅ **Multi-idiomas para Turistas**

### **Como Testar:**
1. Faça login como "Prefeitura Bonito"
2. Será redirecionado para `/secretary-dashboard`
3. Explore as funcionalidades:
   - **Aba "Atrativos"**: Cadastrar pontos turísticos
   - **Aba "Eventos"**: Criar e gerenciar eventos
   - **Aba "Analytics"**: Ver relatórios e métricas
   - **Aba "Marketing"**: Criar conteúdo automático

## 👥 **FUNCIONALIDADES DOS CATs (Centros de Atendimento)**

### **Dashboard: `/attendant-dashboard`**
- ✅ **Controle de Ponto Eletrônico**
- ✅ **IA para Atendimento Presencial**
- ✅ **Tradução Automática Multilíngue**
- ✅ **Monitoramento de Turistas**
- ✅ **Histórico de Atividades**

### **Como Testar:**
1. Faça login como usuário com role "atendente"
2. Será redirecionado para `/attendant-dashboard`
3. Explore as funcionalidades:
   - Fazer check-in/check-out
   - Usar IA para atendimento
   - Testar tradução automática

## 🔧 **SISTEMA DE LOGIN DE TESTES**

### **Arquivo: `src/services/auth/TestUsers.ts`**
```typescript
export const TEST_USERS: TestUser[] = [
  {
    id: 'hotel-owner-1',
    name: 'João Silva',
    email: 'joao@pousadadosol.com',
    businessType: 'hotel',
    businessName: 'Pousada do Sol',
    role: 'user',
    // ... outras propriedades
  },
  {
    id: 'municipal-1',
    name: 'Prefeitura Bonito',
    email: 'turismo@bonito.ms.gov.br',
    businessType: 'other',
    businessName: 'Secretaria de Turismo - Bonito',
    role: 'gestor_municipal',
    // ... outras propriedades
  }
];
```

### **Redirecionamento Automático:**
```typescript
// src/pages/OverflowOneLogin.tsx
switch (userRole) {
  case 'gestor_municipal':
    navigate('/secretary-dashboard');
    break;
  case 'atendente':
    navigate('/attendant-dashboard');
    break;
  case 'user':
    navigate('/private-dashboard');
    break;
  default:
    navigate('/unified');
}
```

## 🎮 **DEMONSTRAÇÃO PRÁTICA**

### **Cenário 1: Testar Secretaria de Turismo**
1. Acesse: `http://localhost:8082/test-login`
2. Clique em "Prefeitura Bonito"
3. Clique em "Ir para Dashboard"
4. **Resultado**: Dashboard Municipal com:
   - Inventário turístico
   - Gestão de eventos
   - Analytics avançados
   - Marketing digital

### **Cenário 2: Testar Hotel do Setor Privado**
1. Acesse: `http://localhost:8082/test-login`
2. Clique em "João Silva" (Pousada do Sol)
3. Clique em "Ir para Dashboard"
4. **Resultado**: Dashboard do Setor Privado com:
   - Sistema de diagnóstico
   - IA para recomendações
   - Analytics de ROI

### **Cenário 3: Testar Atendente de CAT**
1. Acesse: `http://localhost:8082/test-login`
2. Clique em usuário com role "atendente"
3. Clique em "Ir para Dashboard"
4. **Resultado**: Dashboard do Atendente com:
   - Controle de ponto
   - IA para atendimento
   - Tradução automática

## 🚀 **ROTAS IMPLEMENTADAS**

### **Rotas Principais:**
- `/test-login` - Sistema de login de testes
- `/private-dashboard` - Dashboard do setor privado
- `/secretary-dashboard` - Dashboard das secretarias
- `/attendant-dashboard` - Dashboard dos atendentes
- `/unified` - Sistema unificado (fallback)

### **Rotas Existentes Mantidas:**
- `/viajar/dashboard` - Dashboard original
- `/ms/*` - Sistema Descubra MS

## 🎯 **PRÓXIMOS PASSOS PARA TESTE**

### **1. Iniciar o Servidor**
```bash
npm run dev
```

### **2. Acessar o Sistema**
```
http://localhost:8082/test-login
```

### **3. Testar Todas as Funcionalidades**
1. **Setor Privado**: Teste com João Silva, Maria Santos, Pedro Oliveira
2. **Secretarias**: Teste com Prefeitura Bonito
3. **Administradores**: Teste com Carlos Admin

## ✅ **RESULTADO FINAL**

A viajAR agora é uma **plataforma completa** que integra:
- 🏢 **Setor Privado** (diagnóstico inteligente)
- 🏛️ **Secretarias** (gestão municipal)
- 👥 **CATs** (atendimento com IA)
- 🌍 **Escala Global** (multi-idiomas)

**Tudo funcionando em um sistema unificado com login de testes!** 🚀


