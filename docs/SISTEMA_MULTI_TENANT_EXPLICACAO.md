# Sistema Multi-Tenant FlowTrip - Como Funciona

## 🎯 **Visão Geral**

Quando outro estado contrata a plataforma FlowTrip, ele recebe uma **implementação personalizada** da solução, mantendo a mesma qualidade e funcionalidades do Mato Grosso do Sul, mas com sua própria identidade visual e configurações.

## 🏗️ **Como Funciona na Prática**

### **1. Processo de Contratação**

#### **Antes da Contratação**:
1. **Demonstração**: Estado visita `/` (FlowTrip SaaS) e vê o case de sucesso do MS
2. **Proposta**: Recebe proposta personalizada com planos e preços
3. **Contrato**: Assina contrato com FlowTrip

#### **Após a Contratação**:
1. **Setup Inicial**: IA configura automaticamente o novo estado
2. **Personalização**: Logo, cores e configurações específicas
3. **Treinamento**: Equipe recebe treinamento
4. **Go-Live**: Estado começa a usar a plataforma

### **2. Estrutura de URLs**

#### **FlowTrip SaaS** (Comercial):
- `/` - Landing page comercial
- `/solucoes` - Funcionalidades
- `/casos-sucesso` - Cases de sucesso
- `/precos` - Planos e preços

#### **Estados Contratantes**:
- `/{estado}/` - Página principal do estado
- `/{estado}/destinos` - Destinos do estado
- `/{estado}/eventos` - Eventos do estado
- `/{estado}/guata` - Chatbot do estado
- `/{estado}/passaporte` - Passaporte digital do estado

#### **Exemplos Práticos**:
```
/ms/ - Mato Grosso do Sul
/mt/ - Mato Grosso
/go/ - Goiás
/sp/ - São Paulo
/rj/ - Rio de Janeiro
```

### **3. Configuração Automática por Estado**

#### **Detecção Automática**:
```typescript
// src/hooks/useMultiTenant.ts
const detectTenant = async () => {
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const tenantSlug = pathSegments[0]; // primeiro segmento após a barra
  
  // Buscar configuração do estado no banco
  const { data: state } = await supabase
    .from('flowtrip_states')
    .select('*')
    .eq('code', tenantSlug.toUpperCase())
    .eq('is_active', true)
    .single();
};
```

#### **Configurações Dinâmicas**:
```typescript
// Configuração por estado
const stateConfig = {
  id: state.id,
  slug: state.code.toLowerCase(), // 'ms', 'mt', 'go'
  name: state.name, // 'Mato Grosso do Sul'
  logo: state.logo_url,
  primaryColor: state.primary_color,
  secondaryColor: state.secondary_color,
  accentColor: state.accent_color
};
```

## 🎨 **Personalização por Estado**

### **1. Identidade Visual**
- **Logo**: Logo oficial do estado
- **Cores**: Paleta de cores do estado
- **Tipografia**: Fontes personalizadas
- **Imagens**: Imagens dos destinos locais

### **2. Conteúdo Específico**
- **Destinos**: Pontos turísticos do estado
- **Eventos**: Eventos locais
- **Roteiros**: Trilhas e percursos
- **Parceiros**: Parceiros locais

### **3. Configurações de IA**
- **Chatbot**: Nome e personalidade específica
- **Respostas**: Contexto local
- **Recomendações**: Baseadas no estado

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Multi-Tenant**:

#### **1. flowtrip_states** (Estados)
```sql
CREATE TABLE flowtrip_states (
  id UUID PRIMARY KEY,
  code VARCHAR(2) UNIQUE, -- 'MS', 'MT', 'GO'
  name VARCHAR(100), -- 'Mato Grosso do Sul'
  logo_url TEXT,
  primary_color VARCHAR(7), -- '#1e40af'
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  is_active BOOLEAN DEFAULT true
);
```

#### **2. flowtrip_clients** (Clientes/Estados)
```sql
CREATE TABLE flowtrip_clients (
  id UUID PRIMARY KEY,
  state_id UUID REFERENCES flowtrip_states(id),
  client_name VARCHAR(100), -- 'Secretaria de Turismo MS'
  contact_name VARCHAR(100),
  contact_email TEXT,
  status VARCHAR(20) DEFAULT 'active'
);
```

#### **3. flowtrip_subscriptions** (Assinaturas)
```sql
CREATE TABLE flowtrip_subscriptions (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES flowtrip_clients(id),
  plan_type VARCHAR(20), -- 'basic', 'premium', 'enterprise'
  monthly_fee NUMERIC,
  max_users INTEGER,
  features JSONB
);
```

### **Isolamento de Dados**:
- Cada estado vê apenas seus próprios dados
- Políticas RLS garantem isolamento
- Configurações independentes por estado

## 🔐 **Sistema de Roles por Estado**

### **Hierarquia de Permissões**:

#### **1. Diretor Estadual** (Máximo nível do estado)
- **Acesso**: Todos os dados do estado
- **Funcionalidades**: 
  - Dashboard executivo
  - Relatórios completos
  - Gestão de usuários
  - Configurações do estado

#### **2. Gestor IGR** (Instância de Governança Regional)
- **Acesso**: Dados da região específica
- **Funcionalidades**:
  - Gestão regional
  - Relatórios regionais
  - Coordenação municipal

#### **3. Gestor Municipal**
- **Acesso**: Dados do município
- **Funcionalidades**:
  - Gestão de destinos locais
  - Eventos municipais
  - Relatórios locais

#### **4. Atendente CAT**
- **Acesso**: Sistema de atendimento
- **Funcionalidades**:
  - Check-in de turistas
  - Atendimento presencial
  - Registro de interações

#### **5. Colaborador**
- **Acesso**: Sistema de contribuições
- **Funcionalidades**:
  - Sugerir destinos
  - Contribuir com conteúdo
  - Avaliar locais

#### **6. Turista/Usuário**
- **Acesso**: Plataforma pública
- **Funcionalidades**:
  - Explorar destinos
  - Usar passaporte digital
  - Interagir com chatbot

## 🤖 **IA Superinteligente - Como Funciona**

### **1. IA Personalizada por Estado**

#### **Configuração Automática**:
```typescript
// IA se adapta ao contexto do estado
const aiConfig = {
  personality: 'professional',
  responseStyle: 'friendly',
  localContext: state.name, // 'Mato Grosso do Sul'
  localKnowledge: stateDestinations,
  localEvents: stateEvents
};
```

#### **Respostas Contextualizadas**:
- **Conhecimento Local**: IA conhece destinos do estado
- **Eventos Locais**: Informações sobre eventos específicos
- **Cultura Local**: Respeita características regionais
- **Linguagem**: Adapta-se ao vocabulário local

### **2. Funcionalidades da IA**

#### **Suporte Automático**:
- **Resposta a Tickets**: IA responde automaticamente
- **Resolução de Problemas**: Resolve questões técnicas
- **Análise de Clientes**: Gera insights sobre uso
- **Relatórios Automáticos**: Cria relatórios mensais

#### **Monitoramento Inteligente**:
- **Performance**: Monitora performance do sistema
- **Segurança**: Verifica vulnerabilidades
- **Backups**: Controla backups automáticos
- **Alertas**: Notifica sobre problemas

### **3. Personalidade Humanizada**

#### **Tom de Voz**:
```
"Oi João! 😊

Tudo bem? Vi que você está com uma dúvida sobre o Pantanal. 
Não se preocupe, vou te ajudar com isso!

O Pantanal é realmente incrível, né? Temos várias opções para você explorar..."

- Equipe FlowTrip
```

#### **Características**:
- **Amigável**: Usa emojis e linguagem casual
- **Profissional**: Mantém qualidade técnica
- **Local**: Conhece o contexto regional
- **Responsiva**: Responde rapidamente

## 📊 **Dashboard Master - Seu Controle Total**

### **1. Visão Geral do Negócio**
- **Receita Total**: Soma de todos os estados
- **Clientes Ativos**: Estados contratantes
- **Performance**: Métricas de todos os sistemas
- **Alertas**: Problemas identificados

### **2. Gestão por Estado**
- **Análise Individual**: Dados específicos de cada estado
- **Comparativo**: Comparação entre estados
- **Tendências**: Evolução ao longo do tempo
- **Oportunidades**: Sugestões de crescimento

### **3. IA Central**
- **Ações Automáticas**: IA gerencia tudo
- **Relatórios**: Geração automática
- **Otimizações**: Melhorias contínuas
- **Suporte**: Atendimento automático

## 💰 **Sistema de Cobrança**

### **1. Planos Disponíveis**

#### **Básico**:
- **Preço**: R$ 5.000/mês
- **Usuários**: Até 50
- **Destinos**: Até 100
- **Funcionalidades**: Core

#### **Premium**:
- **Preço**: R$ 10.000/mês
- **Usuários**: Até 200
- **Destinos**: Ilimitados
- **Funcionalidades**: + IA avançada

#### **Enterprise**:
- **Preço**: R$ 20.000/mês
- **Usuários**: Ilimitados
- **Destinos**: Ilimitados
- **Funcionalidades**: + White-label

### **2. Cobrança Automática**
- **Faturas**: Geradas automaticamente
- **Pagamentos**: Processados mensalmente
- **Relatórios**: Financeiros automáticos
- **Alertas**: Pagamentos em atraso

## 🚀 **Processo de Onboarding**

### **1. Setup Automático** (IA faz tudo)
1. **Criação do Tenant**: IA cria configuração do estado
2. **Configuração de Dados**: IA importa dados básicos
3. **Personalização**: IA aplica identidade visual
4. **Testes**: IA valida funcionamento

### **2. Treinamento da Equipe**
1. **Vídeos**: Tutoriais personalizados
2. **Documentação**: Guias específicos
3. **Suporte**: IA responde dúvidas
4. **Acompanhamento**: Monitoramento contínuo

### **3. Go-Live**
1. **Lançamento**: Estado começa a usar
2. **Monitoramento**: IA acompanha performance
3. **Otimizações**: Melhorias contínuas
4. **Suporte**: Atendimento 24/7

## 📈 **Métricas e Analytics**

### **1. Por Estado**
- **Usuários Ativos**: Turistas usando a plataforma
- **Engajamento**: Tempo de permanência
- **Conversões**: Check-ins no passaporte
- **Satisfação**: Avaliações e feedback

### **2. Comparativo**
- **Performance**: Comparação entre estados
- **Melhores Práticas**: Estados que se destacam
- **Oportunidades**: Estados com potencial
- **Tendências**: Evolução do mercado

### **3. Preditivo**
- **Crescimento**: Previsões de uso
- **Receita**: Projeções financeiras
- **Expansão**: Novos mercados
- **Inovação**: Novas funcionalidades

## 🎯 **Vantagens do Sistema Multi-Tenant**

### **Para Você (FlowTrip)**:
- ✅ **Escalabilidade**: Pode vender para qualquer estado
- ✅ **Eficiência**: Uma base de código para todos
- ✅ **Receita**: Múltiplas fontes de receita
- ✅ **Controle**: Dashboard central para tudo

### **Para os Estados**:
- ✅ **Personalização**: Identidade própria mantida
- ✅ **Qualidade**: Mesma qualidade do MS
- ✅ **Suporte**: IA disponível 24/7
- ✅ **Custo**: Solução acessível

### **Para os Turistas**:
- ✅ **Experiência**: Interface familiar
- ✅ **Conteúdo**: Informações específicas do estado
- ✅ **Funcionalidades**: Todas as funcionalidades disponíveis
- ✅ **Suporte**: Atendimento local

## 🔄 **Exemplo Prático - Mato Grosso Contrata**

### **1. Antes da Contratação**:
- MT visita `/` e vê o case de sucesso do MS
- Interessa-se pela solução
- Solicita demonstração

### **2. Durante a Contratação**:
- Recebe proposta personalizada
- Define plano e configurações
- Assina contrato

### **3. Setup Automático**:
- IA cria configuração do MT
- Aplica logo e cores do MT
- Configura destinos do MT
- Treina equipe do MT

### **4. Após o Go-Live**:
- MT acessa `/mt/` (sua plataforma)
- Turistas usam `/mt/destinos`, `/mt/eventos`
- Chatbot responde como "Guatá MT"
- Passaporte digital do MT

### **5. Monitoramento**:
- Você vê tudo no dashboard master
- IA gerencia suporte do MT
- Relatórios automáticos
- Cobrança automática

## 💡 **Conclusão**

O sistema multi-tenant da FlowTrip é **revolucionário** porque:

1. **Escala Nacionalmente**: Pode vender para qualquer estado
2. **Mantém Qualidade**: Mesma qualidade do MS para todos
3. **Personalização**: Cada estado mantém sua identidade
4. **IA Inteligente**: Gerencia tudo automaticamente
5. **Controle Total**: Você monitora tudo de um lugar

É como ter **27 versões personalizadas** da plataforma MS, cada uma com sua identidade, mas todas com a mesma qualidade e funcionalidades, gerenciadas automaticamente pela IA superinteligente! 