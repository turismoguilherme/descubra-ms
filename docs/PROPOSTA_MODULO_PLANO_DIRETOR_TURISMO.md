# 📋 Proposta: Módulo de Plano Diretor de Turismo Digital

## 🎯 **Resumo Executivo**

Proposta para desenvolvimento de um módulo completo de **Plano Diretor de Turismo Digital** dentro da plataforma ViaJAR/Descubra MS, permitindo:

1. ✅ **Colaboração multi-ator** com diferentes níveis de acesso
2. ✅ **Preenchimento automático com IA** de dados e análises
3. ✅ **Digitalização completa** do processo de planejamento turístico
4. ✅ **Integração** com inventário turístico e outras funcionalidades existentes

---

## 📚 **O que é um Plano Diretor de Turismo?**

### **Definição Legal (Ministério do Turismo)**
O **Plano Diretor de Turismo (PDT)** é um instrumento de planejamento municipal que estabelece:
- **Diretrizes estratégicas** para desenvolvimento turístico sustentável
- **Objetivos e metas** de curto, médio e longo prazo
- **Programas e ações** para alcançar os objetivos
- **Cronograma e orçamento** para execução
- **Sistema de monitoramento** e avaliação

### **Requisitos Legais**
- ✅ **Obrigatório** para municípios que pleiteiam classificações como:
  - Município de Interesse Turístico (MIT)
  - Estância Turística
- ✅ **Revisão periódica** (geralmente a cada 4-5 anos)
- ✅ **Participação social** obrigatória (audiências públicas, consultas)
- ✅ **Aprovação** pela Câmara Municipal

### **Componentes Típicos de um PDT**
1. **Diagnóstico Situacional**
   - Situação atual do turismo
   - Análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças)
   - Benchmarking com outras cidades
   - Identificação de gaps

2. **Visão e Objetivos Estratégicos**
   - Visão de futuro (onde queremos chegar)
   - Objetivos SMART (Específicos, Mensuráveis, Alcançáveis, Relevantes, Temporais)
   - Metas quantitativas e qualitativas

3. **Estratégias e Programas**
   - Estratégias para alcançar objetivos
   - Programas de ação
   - Projetos específicos

4. **Cronograma e Orçamento**
   - Cronograma de execução (4-5 anos)
   - Orçamento detalhado
   - Fontes de financiamento

5. **Sistema de Monitoramento**
   - Indicadores de desempenho (KPIs)
   - Relatórios periódicos
   - Avaliação de resultados

---

## 🏗️ **Arquitetura Proposta do Módulo**

### **1. Estrutura de Dados**

#### **Tabela Principal: `plano_diretor_documents`**
```sql
CREATE TABLE plano_diretor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES municipalities(id),
  titulo VARCHAR(200) NOT NULL,
  versao VARCHAR(20) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'rascunho', -- rascunho, revisao, aprovado, implementacao, concluido
  criador_id UUID REFERENCES auth.users(id),
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  data_aprovacao TIMESTAMP,
  aprovado_por UUID REFERENCES auth.users(id),
  metadata JSONB -- dados adicionais flexíveis
);
```

#### **Tabela de Objetivos: `plano_diretor_objetivos`**
```sql
CREATE TABLE plano_diretor_objetivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50), -- crescimento, diversificacao, infraestrutura, sustentabilidade
  meta NUMERIC,
  unidade VARCHAR(50),
  prazo DATE,
  responsavel_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'planejado',
  progresso NUMERIC DEFAULT 0,
  ordem INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Estratégias: `plano_diretor_estrategias`**
```sql
CREATE TABLE plano_diretor_estrategias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  objetivo_id UUID REFERENCES plano_diretor_objetivos(id),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  investimento NUMERIC,
  prazo DATE,
  responsavel_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'planejada',
  roi_esperado NUMERIC,
  ordem INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Ações: `plano_diretor_acoes`**
```sql
CREATE TABLE plano_diretor_acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estrategia_id UUID REFERENCES plano_diretor_estrategias(id),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  investimento NUMERIC,
  prazo DATE,
  responsavel_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'planejada',
  progresso NUMERIC DEFAULT 0,
  dependencias UUID[], -- IDs de outras ações
  ordem INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Colaboradores: `plano_diretor_colaboradores`**
```sql
CREATE TABLE plano_diretor_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  usuario_id UUID REFERENCES auth.users(id),
  tipo_ator VARCHAR(50), -- secretario, consultor, empresario, sociedade_civil, academia
  nivel_acesso VARCHAR(20), -- visualizar, editar, aprovar
  permissoes JSONB, -- permissões granulares
  convidado_por UUID REFERENCES auth.users(id),
  data_convite TIMESTAMP DEFAULT NOW(),
  data_aceite TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Indicadores: `plano_diretor_indicadores`**
```sql
CREATE TABLE plano_diretor_indicadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  objetivo_id UUID REFERENCES plano_diretor_objetivos(id),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  valor_atual NUMERIC,
  meta NUMERIC,
  unidade VARCHAR(50),
  frequencia VARCHAR(20), -- diaria, semanal, mensal, trimestral, anual
  fonte VARCHAR(200),
  ultima_atualizacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Documentos: `plano_diretor_documentos_anexos`**
```sql
CREATE TABLE plano_diretor_documentos_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  titulo VARCHAR(200) NOT NULL,
  tipo VARCHAR(50), -- estudo, relatorio, apresentacao, lei, decreto, outro
  arquivo_url TEXT,
  tamanho_bytes BIGINT,
  versao VARCHAR(20),
  status VARCHAR(20) DEFAULT 'rascunho',
  uploader_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Histórico: `plano_diretor_historico`**
```sql
CREATE TABLE plano_diretor_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  versao VARCHAR(20),
  autor_id UUID REFERENCES auth.users(id),
  tipo_alteracao VARCHAR(50), -- criacao, edicao, aprovacao, comentario
  alteracoes JSONB, -- detalhes das alterações
  comentarios TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Tabela de Comentários: `plano_diretor_comentarios`**
```sql
CREATE TABLE plano_diretor_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_diretor_id UUID REFERENCES plano_diretor_documents(id),
  secao VARCHAR(50), -- diagnostico, objetivo, estrategia, acao
  secao_id UUID, -- ID do item específico
  autor_id UUID REFERENCES auth.users(id),
  comentario TEXT NOT NULL,
  resolvido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 👥 **Sistema de Colaboração Multi-Ator**

### **Níveis de Acesso Propostos**

#### **1. Secretário de Turismo (Administrador do Plano)**
- ✅ **Acesso Total**
  - Criar, editar, aprovar plano
  - Gerenciar colaboradores
  - Definir níveis de acesso
  - Publicar versões
  - Exportar documentos

#### **2. Consultor Técnico**
- ✅ **Acesso de Edição Completa**
  - Editar todas as seções
  - Adicionar análises
  - Sugerir objetivos e estratégias
  - Comentar e revisar
  - ❌ Não pode aprovar/publicar

#### **3. Empresário do Setor Turístico**
- ✅ **Acesso de Contribuição**
  - Visualizar plano completo
  - Comentar em seções específicas
  - Sugerir ações e estratégias
  - Participar de consultas públicas
  - ❌ Não pode editar diretamente

#### **4. Representante da Sociedade Civil**
- ✅ **Acesso de Consulta**
  - Visualizar plano completo
  - Comentar em todas as seções
  - Participar de audiências públicas
  - Votar em consultas
  - ❌ Não pode editar

#### **5. Acadêmico/Pesquisador**
- ✅ **Acesso de Pesquisa**
  - Visualizar plano completo
  - Acessar dados históricos
  - Comentar com base em estudos
  - Exportar dados para pesquisa
  - ❌ Não pode editar

#### **6. Outros Órgãos Públicos**
- ✅ **Acesso de Colaboração**
  - Visualizar seções relevantes
  - Comentar em áreas de competência
  - Integrar dados de outros sistemas
  - ❌ Não pode editar plano principal

### **Sistema de Permissões Granulares**

```typescript
interface PermissaoPlanoDiretor {
  // Permissões de Visualização
  visualizar_diagnostico: boolean;
  visualizar_objetivos: boolean;
  visualizar_estrategias: boolean;
  visualizar_acoes: boolean;
  visualizar_indicadores: boolean;
  visualizar_documentos: boolean;
  
  // Permissões de Edição
  editar_diagnostico: boolean;
  editar_objetivos: boolean;
  editar_estrategias: boolean;
  editar_acoes: boolean;
  editar_indicadores: boolean;
  
  // Permissões de Aprovação
  aprovar_objetivos: boolean;
  aprovar_estrategias: boolean;
  aprovar_acoes: boolean;
  aprovar_plano_completo: boolean;
  
  // Permissões de Gestão
  gerenciar_colaboradores: boolean;
  publicar_versoes: boolean;
  exportar_documentos: boolean;
  
  // Permissões de Comentários
  comentar_todas_secoes: boolean;
  comentar_secoes_especificas: string[]; // IDs das seções
  resolver_comentarios: boolean;
}
```

---

## 🤖 **Preenchimento Automático com IA**

### **Funcionalidades de IA Propostas**

#### **1. Geração Automática de Diagnóstico**
```typescript
interface IADiagnostico {
  // Coleta automática de dados
  coletarDadosSituacaoAtual(): Promise<DiagnosticoData>;
  
  // Análise SWOT automática
  gerarAnaliseSWOT(dados: DiagnosticoData): Promise<SWOTAnalysis>;
  
  // Benchmarking automático
  compararComOutrasCidades(municipio: string): Promise<BenchmarkData>;
  
  // Identificação de gaps
  identificarGaps(dados: DiagnosticoData): Promise<GapAnalysis>;
}
```

**Fontes de Dados Automáticas:**
- ✅ Inventário Turístico (já implementado)
- ✅ Dados de CATs (já implementado)
- ✅ Eventos cadastrados (já implementado)
- ✅ Analytics e métricas (já implementado)
- ✅ Dados do IBGE (integração via API)
- ✅ Dados do Ministério do Turismo (integração via API)
- ✅ Dados de redes sociais (análise de sentimento)

#### **2. Sugestão Inteligente de Objetivos**
```typescript
interface IAObjetivos {
  // Sugerir objetivos baseados em dados
  sugerirObjetivos(diagnostico: DiagnosticoData): Promise<Objetivo[]>;
  
  // Validar objetivos SMART
  validarObjetivoSMART(objetivo: Objetivo): Promise<ValidationResult>;
  
  // Calcular viabilidade
  calcularViabilidade(objetivo: Objetivo): Promise<ViabilidadeAnalysis>;
}
```

**Critérios de Sugestão:**
- Baseado em dados históricos
- Comparação com cidades similares
- Tendências de mercado
- Capacidade atual do município
- Recursos disponíveis

#### **3. Geração de Estratégias**
```typescript
interface IAEstrategias {
  // Sugerir estratégias para objetivos
  sugerirEstrategias(objetivo: Objetivo): Promise<Estrategia[]>;
  
  // Calcular ROI esperado
  calcularROI(estrategia: Estrategia): Promise<ROIAnalysis>;
  
  // Identificar dependências
  identificarDependencias(estrategia: Estrategia): Promise<DependencyGraph>;
}
```

#### **4. Preenchimento de Campos**
```typescript
interface IAPreenchimento {
  // Preencher descrições automaticamente
  preencherDescricao(tipo: string, contexto: any): Promise<string>;
  
  // Sugerir valores para campos numéricos
  sugerirValor(campo: string, contexto: any): Promise<number>;
  
  // Completar informações faltantes
  completarInformacoes(dados: Partial<any>): Promise<any>;
}
```

**Exemplos de Preenchimento Automático:**
- ✅ Descrição de objetivos baseada em dados
- ✅ Metas calculadas automaticamente
- ✅ Cronogramas sugeridos
- ✅ Orçamentos estimados
- ✅ Descrições de estratégias

#### **5. Análise e Recomendações**
```typescript
interface IARecomendacoes {
  // Analisar plano completo
  analisarPlanoCompleto(plano: PlanoDiretorDocument): Promise<AnaliseCompleta>;
  
  // Identificar riscos
  identificarRiscos(plano: PlanoDiretorDocument): Promise<RiskAnalysis>;
  
  // Sugerir melhorias
  sugerirMelhorias(plano: PlanoDiretorDocument): Promise<Melhoria[]>;
  
  // Comparar com melhores práticas
  compararMelhoresPraticas(plano: PlanoDiretorDocument): Promise<BestPractices>;
}
```

---

## 🔗 **Integração com Funcionalidades Existentes**

### **1. Integração com Inventário Turístico**
- ✅ Usar dados do inventário para diagnóstico
- ✅ Sugerir novos atrativos baseado em objetivos
- ✅ Monitorar performance de atrativos como indicadores

### **2. Integração com Gestão de CATs**
- ✅ Usar dados de atendimento para diagnóstico
- ✅ Sugerir melhorias de localização de CATs
- ✅ Monitorar performance de CATs como indicadores

### **3. Integração com Gestão de Eventos**
- ✅ Usar dados de eventos para diagnóstico
- ✅ Sugerir eventos estratégicos baseado em objetivos
- ✅ Monitorar impacto de eventos como indicadores

### **4. Integração com IA Estratégica**
- ✅ Usar análises da IA Estratégica para diagnóstico
- ✅ Incorporar recomendações da IA nos objetivos
- ✅ Usar previsões da IA para planejamento

### **5. Integração com Analytics**
- ✅ Usar dados de analytics para diagnóstico
- ✅ Monitorar KPIs do plano em tempo real
- ✅ Gerar relatórios automáticos

---

## 📱 **Interface do Usuário Proposta**

### **Estrutura de Navegação**

```
📊 PLANO DIRETOR DE TURISMO
├── 📈 Dashboard
│   ├── Status do Plano
│   ├── KPIs Principais
│   ├── Progresso de Objetivos
│   └── Ações em Andamento
│
├── 🔍 Diagnóstico
│   ├── Situação Atual (preenchido automaticamente)
│   ├── Análise SWOT (gerada por IA)
│   ├── Benchmarking (comparação automática)
│   └── Identificação de Gaps
│
├── 🎯 Objetivos
│   ├── Lista de Objetivos
│   ├── Criar/Editar Objetivo
│   ├── Sugestões de IA
│   └── Validação SMART
│
├── 💡 Estratégias
│   ├── Lista de Estratégias
│   ├── Criar/Editar Estratégia
│   ├── Sugestões de IA
│   └── Cálculo de ROI
│
├── ✅ Ações
│   ├── Lista de Ações
│   ├── Criar/Editar Ação
│   ├── Dependências
│   └── Cronograma
│
├── 📊 Indicadores
│   ├── Lista de Indicadores
│   ├── Valores Atuais (atualização automática)
│   ├── Metas
│   └── Gráficos de Progresso
│
├── 👥 Colaboradores
│   ├── Lista de Colaboradores
│   ├── Convidar Novo Colaborador
│   ├── Gerenciar Permissões
│   └── Histórico de Participação
│
├── 💬 Comentários
│   ├── Comentários por Seção
│   ├── Resolver Comentários
│   └── Notificações
│
├── 📄 Documentos
│   ├── Upload de Documentos
│   ├── Versões do Plano
│   ├── Exportar PDF/DOCX
│   └── Histórico de Alterações
│
└── ⚙️ Configurações
    ├── Informações do Plano
    ├── Período de Vigência
    ├── Notificações
    └── Integrações
```

---

## 🚀 **Fases de Implementação Proposta**

### **Fase 1: Estrutura Base (2-3 semanas)**
1. ✅ Criar tabelas no banco de dados
2. ✅ Implementar serviços básicos (CRUD)
3. ✅ Criar interface básica de visualização
4. ✅ Sistema de autenticação e permissões básico

### **Fase 2: Colaboração (2 semanas)**
1. ✅ Sistema de convites
2. ✅ Níveis de acesso
3. ✅ Sistema de comentários
4. ✅ Notificações

### **Fase 3: IA e Automação (3-4 semanas)**
1. ✅ Integração com dados existentes
2. ✅ Geração automática de diagnóstico
3. ✅ Sugestões de objetivos e estratégias
4. ✅ Preenchimento automático de campos

### **Fase 4: Funcionalidades Avançadas (2 semanas)**
1. ✅ Sistema de indicadores em tempo real
2. ✅ Exportação de documentos
3. ✅ Histórico e versionamento
4. ✅ Relatórios automáticos

### **Fase 5: Polimento e Testes (1-2 semanas)**
1. ✅ Testes de usabilidade
2. ✅ Correções de bugs
3. ✅ Otimizações de performance
4. ✅ Documentação

---

## 💡 **Diferenciais Competitivos**

### **vs. Destinos Inteligentes**
- ✅ **Foco em Planejamento** (não apenas inventário)
- ✅ **Colaboração Multi-Ator** (não apenas gestão interna)
- ✅ **IA Integrada** (não apenas cadastro manual)
- ✅ **Monitoramento em Tempo Real** (não apenas relatórios estáticos)

### **vs. Soluções Tradicionais**
- ✅ **Digitalização Completa** (não apenas documentos PDF)
- ✅ **Colaboração Online** (não apenas reuniões presenciais)
- ✅ **Dados Automáticos** (não apenas preenchimento manual)
- ✅ **Integração com Dados Reais** (não apenas estimativas)

---

## ❓ **Perguntas para Validação**

Antes de implementar, preciso confirmar:

1. **Escopo:**
   - ✅ O módulo deve ser apenas para secretarias ou também para outros níveis (estadual, federal)?
   - ✅ Deve integrar com algum sistema externo específico?

2. **Colaboração:**
   - ✅ Quais atores são prioritários? (empresários, sociedade civil, academia, etc.)
   - ✅ Como será o processo de convite? (email, link público, etc.)

3. **IA:**
   - ✅ Qual nível de automação você prefere? (sugestões, preenchimento automático, ou ambos?)
   - ✅ Deve haver opção de desabilitar IA para edição manual?

4. **Interface:**
   - ✅ Prefere interface mais simples ou mais completa?
   - ✅ Deve ter modo de visualização pública?

5. **Integração:**
   - ✅ Quais funcionalidades existentes são prioritárias para integração?
   - ✅ Deve exportar para formatos específicos? (PDF, DOCX, Excel)

---

## 📝 **Próximos Passos**

1. ✅ **Aguardar sua aprovação** desta proposta
2. ✅ **Confirmar respostas** às perguntas acima
3. ✅ **Definir prioridades** de implementação
4. ✅ **Iniciar Fase 1** após validação

---

**Aguardando sua validação para prosseguir com a implementação! 🚀**


