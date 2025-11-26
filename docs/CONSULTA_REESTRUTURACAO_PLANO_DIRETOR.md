# 📋 CONSULTA: Reestruturação do Módulo Plano Diretor

## ✅ **CONFIRMAÇÕES RECEBIDAS**

Você confirmou:
1. ✅ Dashboard deve mostrar apenas **status e progresso do plano** (não métricas gerais)
2. ✅ Indicadores devem **coletar dados automaticamente** dos outros módulos, mas **pedir permissão** (como sugestão)
3. ✅ Exportação deve ficar no módulo **"Relatórios"**
4. ✅ Plano Diretor deve **usar dados** dos outros módulos (não duplicar)

---

## 🔍 **PESQUISA SOBRE REQUISITOS DO MINISTÉRIO DO TURISMO**

**Resultado da Pesquisa:**
- ❌ Não encontrei documentos oficiais específicos do Ministério do Turismo sobre estrutura detalhada de Planos Diretores
- ✅ Encontrei referências a:
  - **Destinos Turísticos Inteligentes (DTI)** - conceito do Ministério do Turismo
  - **Municípios de Interesse Turístico (MIT)** - requerem planejamento
  - **Planejamento estratégico** como requisito para classificações

**Baseado na Proposta Original e Boas Práticas:**
- Componentes típicos de um PDT incluem: Diagnóstico, Objetivos, Estratégias, Ações, Indicadores
- Deve ter participação social e aprovação
- Deve ter sistema de monitoramento

---

## ❓ **PERGUNTAS PARA CONFIRMAÇÃO ANTES DE IMPLEMENTAR**

### **1. DASHBOARD DO PLANO DIRETOR**

**O que deve mostrar:**
- ✅ Status do Plano (rascunho, revisão, aprovado, implementação, concluído)
- ✅ Progresso Geral (% de objetivos concluídos)
- ✅ Ações em Andamento (próximas ações do plano)
- ✅ KPIs do Plano (comparação meta vs. atual dos indicadores do plano)
- ✅ Alertas (metas não alcançadas, ações atrasadas)

**O que NÃO deve mostrar:**
- ❌ Total de CATs (já está na Visão Geral)
- ❌ Total de Turistas Hoje (já está na Visão Geral)
- ❌ Total de Atrações (já está na Visão Geral)

**❓ CONFIRMAÇÃO:**
- Você confirma que o Dashboard deve ter APENAS essas informações (status, progresso, ações, KPIs do plano)?
- Você quer que eu remova as métricas gerais que estão duplicadas?

---

### **2. INDICADORES E COLETA AUTOMÁTICA DE DADOS**

**Como deve funcionar:**
- ✅ Indicadores vinculados aos **OBJETIVOS** do plano
- ✅ Valores atuais **coletados automaticamente** dos outros módulos
- ✅ Metas definidas no plano
- ✅ Progresso (% de conclusão)
- ✅ **Solicitar permissão** antes de coletar dados (como sugestão)

**Exemplo de Indicador:**
```
Objetivo: "Aumentar visitantes em 25%"
Indicador: "Número de visitantes"
- Meta: 1.500.000
- Atual: 1.200.000 (coletado de Analytics - com permissão)
- Progresso: 80% ✅
```

**❓ CONFIRMAÇÃO:**
- Quando você diz "pedir permissão", você quer:
  - A) Um modal perguntando "Permitir coleta automática de dados?" (uma vez)
  - B) Um modal para cada indicador perguntando "Usar dados de [módulo] para este indicador?"
  - C) Uma opção de "Sugerir dados" que o usuário pode aceitar ou recusar?
- Quais módulos devem fornecer dados para os indicadores?
  - ✅ Analytics/Visão Geral (visitantes, receita)
  - ✅ Inventário Turístico (atrações)
  - ✅ Gestão de Eventos (eventos, participantes)
  - ✅ Gestão de CATs (atendimentos)
  - ❓ Outros?

---

### **3. DIAGNÓSTICO**

**Como deve funcionar:**
- ✅ Coleta automática de dados dos outros módulos
- ✅ Análise SWOT gerada por IA baseada nos dados coletados
- ✅ Benchmarking com outras cidades
- ✅ Identificação de Gaps

**Fontes de Dados:**
- ✅ Inventário Turístico → Total de atrativos, categorias
- ✅ Gestão de Eventos → Total de eventos, participantes
- ✅ Gestão de CATs → Total de CATs, atendimentos
- ✅ Analytics → Métricas consolidadas

**❓ CONFIRMAÇÃO:**
- O diagnóstico deve ser **preenchido automaticamente** quando o plano é criado?
- Deve ter opção de **editar manualmente** os dados coletados?
- A análise SWOT deve ser **gerada automaticamente** por IA ou o usuário deve poder editar?

---

### **4. EXPORTAÇÃO NO MÓDULO DE RELATÓRIOS**

**O que deve ter:**
- ✅ Opção "Exportar Plano Diretor" no módulo de Relatórios
- ✅ Formatos: PDF, Excel, DOCX
- ✅ Conteúdo: Plano completo (diagnóstico, objetivos, estratégias, ações, indicadores)

**❓ CONFIRMAÇÃO:**
- Você quer que eu:
  - A) Adicione apenas a opção de exportar Plano Diretor no módulo de Relatórios existente?
  - B) Crie uma seção específica "Relatórios do Plano Diretor" dentro do módulo de Relatórios?
- O que deve ser incluído no PDF/Excel exportado?
  - ✅ Diagnóstico completo
  - ✅ Todos os objetivos
  - ✅ Todas as estratégias
  - ✅ Todas as ações
  - ✅ Todos os indicadores com valores atuais
  - ✅ Histórico de alterações?
  - ✅ Comentários e colaborações?

---

### **5. INTEGRAÇÃO COM OUTROS MÓDULOS**

**Fluxo de Dados:**
```
Inventário → Plano Diretor (diagnóstico, indicadores)
Eventos → Plano Diretor (diagnóstico, indicadores)
CATs → Plano Diretor (diagnóstico, indicadores)
Analytics → Plano Diretor (diagnóstico, indicadores, KPIs)
```

**❓ CONFIRMAÇÃO:**
- As ações do Plano Diretor devem poder **criar eventos** automaticamente?
- As ações do Plano Diretor devem poder **criar melhorias de CATs**?
- As ações do Plano Diretor devem poder **sugerir novos atrativos** no Inventário?

---

### **6. ESTRUTURA FINAL DO MÓDULO**

**Abas Propostas:**
1. ✅ **Dashboard** - Status e progresso do plano
2. ✅ **Diagnóstico** - Situação atual (coletado automaticamente)
3. ✅ **Objetivos** - Metas estratégicas
4. ✅ **Estratégias** - Como alcançar objetivos
5. ✅ **Ações** - Tarefas específicas
6. ✅ **Indicadores** - Monitoramento de metas (dados coletados)
7. ✅ **Colaboradores** - Gestão de equipe
8. ✅ **Histórico** - Alterações e versões
9. ❌ **Documentos** - REMOVIDO (já existe módulo dedicado)

**❓ CONFIRMAÇÃO:**
- Você confirma essa estrutura de 8 abas?
- Alguma aba deve ser removida ou adicionada?

---

## 📝 **RESUMO DAS MUDANÇAS PROPOSTAS**

### **O QUE VAI MUDAR:**

1. **Dashboard:**
   - ❌ Remover métricas gerais (CATs, turistas, atrações)
   - ✅ Adicionar status do plano, progresso, ações em andamento, KPIs do plano

2. **Indicadores:**
   - ✅ Coletar dados automaticamente dos outros módulos
   - ✅ Solicitar permissão antes de coletar
   - ✅ Mostrar progresso em relação às metas

3. **Diagnóstico:**
   - ✅ Preencher automaticamente com dados dos outros módulos
   - ✅ Permitir edição manual
   - ✅ Gerar SWOT por IA

4. **Exportação:**
   - ✅ Mover para módulo "Relatórios"
   - ✅ Adicionar opção "Exportar Plano Diretor"

5. **Integração:**
   - ✅ Usar dados dos outros módulos (não duplicar)
   - ✅ Permitir ações criar eventos, melhorar CATs, etc.

---

## ⏸️ **AGUARDANDO SUAS RESPOSTAS**

Por favor, responda todas as perguntas acima para eu poder implementar as mudanças corretamente.

**Após suas respostas, vou:**
1. ✅ Implementar as mudanças no Dashboard
2. ✅ Implementar coleta automática de dados com permissão
3. ✅ Mover exportação para módulo de Relatórios
4. ✅ Melhorar integração com outros módulos

---

**Aguardando suas confirmações! 🚀**


