# 🎓 Sistema de Analytics para TCC - Guatá AI

## 📋 **Visão Geral**

O sistema de analytics foi desenvolvido especificamente para seu TCC, coletando dados em tempo real sobre o uso do Guatá AI em totens físicos. **O Guatá usado é EXATAMENTE o mesmo da plataforma**, apenas sem necessidade de cadastro. Todos os dados são armazenados localmente no navegador e podem ser exportados para análise.

## 🔧 **Como Funciona**

### **1. Guatá Idêntico à Plataforma**
- ✅ **Mesma IA**: Usa exatamente o mesmo sistema de IA
- ✅ **Mesmas funcionalidades**: ML, roteiros, emergência, feedback
- ✅ **Mesma base de conhecimento**: Informações oficiais e atualizadas
- ✅ **Mesma personalidade**: Respostas hospitaleiras e precisas
- ✅ **Mesma interface**: Layout, cores, componentes idênticos
- ✅ **Mesmas sugestões**: Botões de sugestão iguais
- ✅ **Detecção de idioma**: Responde automaticamente em português, inglês ou espanhol
- ✅ **Tela inicial**: Interface otimizada para totens com botão "Começar"
- ✅ **Sem autenticação**: Funciona imediatamente, sem cadastro

### **2. Detecção Automática de Idioma**
- **Português**: Detecta palavras em português e responde em português
- **Inglês**: Detecta palavras em inglês e responde em inglês
- **Espanhol**: Detecta palavras em espanhol e responde em espanhol
- **Palavras-chave**: Identifica idioma por palavras específicas
- **Resposta automática**: Mantém o mesmo idioma da pergunta

### **3. Interface Otimizada para Totens**
- **Tela inicial**: Apresentação clara com botão "TOQUE PARA COMEÇAR"
- **Design responsivo**: Funciona em telas grandes de totens
- **Touch-friendly**: Botões grandes para interação por toque
- **Informações visuais**: Ícones e recursos destacados

### **4. Coleta Automática de Dados**
- **Sessões**: Cada visita ao totem inicia uma nova sessão
- **Interações**: Todas as ações do usuário são registradas
- **Tempo**: Tempo total de uso é calculado automaticamente
- **Feedback**: Avaliações positivas/negativas são contabilizadas
- **Idioma**: Registra qual idioma foi usado

### **5. Dados Coletados**

#### **📊 Métricas Quantitativas**
- **Total de sessões**: Número de vezes que o totem foi usado
- **Mensagens por sessão**: Quantas perguntas foram feitas
- **Tempo médio**: Duração média de cada interação
- **Taxa de satisfação**: Porcentagem de feedback positivo
- **Taxa de conversão**: Quantos clicaram em "Começar"

#### **📈 Análise Qualitativa**
- **Tópicos populares**: Assuntos mais perguntados
- **Dispositivos**: Tipo de tela usada (mobile, tablet, desktop)
- **Distribuição temporal**: Como o tempo é distribuído
- **Idioma usado**: Português vs Inglês vs Espanhol

#### **📱 Informações Técnicas**
- **User Agent**: Tipo de navegador/dispositivo
- **Tamanho da tela**: Resolução do totem
- **Idioma**: Configuração do usuário

## 🎯 **Dados Específicos para TCC**

### **Interações Registradas**
1. **Tela inicial**: Clique no botão "Começar"
2. **Mensagens**: Cada pergunta feita ao Guatá
3. **Feedback**: Avaliações (👍/👎) das respostas
4. **Limpeza**: Quando o usuário limpa a conversa
5. **Sugestões**: Cliques em botões de sugestão rápida
6. **Visualização**: Tempo na página
7. **Idioma**: Detecção automática de idioma usado

### **Categorização Automática**
O sistema identifica automaticamente os tópicos:
- **Bonito**: Turismo em Bonito
- **Campo Grande**: Turismo na capital
- **Pantanal**: Ecoturismo no Pantanal
- **Hospedagem**: Hotéis e pousadas
- **Gastronomia**: Restaurantes e comida
- **Ecoturismo**: Trilhas, grutas, natureza
- **Planejamento**: Roteiros e itinerários
- **Transporte**: Como chegar, locomoção
- **Informações**: Preços, horários, contatos

## 📊 **Relatórios Disponíveis**

### **1. Dashboard em Tempo Real**
- **URL**: `flowtrip.com/tcc-report`
- **Métricas principais**: Sessões, mensagens, satisfação
- **Gráficos**: Distribuição de dispositivos e tempo
- **Tópicos populares**: Ranking dos assuntos mais perguntados
- **Idioma**: Distribuição de uso por idioma

### **2. Exportação CSV**
- **Dados completos**: Todas as sessões detalhadas
- **Análise externa**: Use em Excel, Google Sheets, etc.
- **Backup**: Preservação dos dados para o TCC

## 🔄 **Como Usar**

### **Para Testes**
1. Acesse: `http://localhost:8083/chatguata`
2. Veja a tela inicial com botão "TOQUE PARA COMEÇAR"
3. Clique no botão para iniciar a conversa
4. Faça perguntas em português, inglês ou espanhol
5. Use os botões de feedback
6. Use as sugestões rápidas (igual à plataforma)

### **Para Relatórios**
1. Acesse: `http://localhost:8083/tcc-report`
2. Visualize todas as métricas
3. Clique em "Exportar CSV" para download

### **Para Produção**
1. **Totem**: `flowtrip.com/chatguata`
2. **Relatórios**: `flowtrip.com/tcc-report`
3. **Dados**: Persistem automaticamente no navegador

## 📈 **Métricas para TCC**

### **Quantitativas**
- **Total de sessões**: Quantas pessoas usaram
- **Taxa de conversão**: Quantos clicaram em "Começar"
- **Mensagens por sessão**: Engajamento médio
- **Tempo médio**: Duração da interação
- **Taxa de satisfação**: Qualidade das respostas

### **Qualitativas**
- **Tópicos mais populares**: O que as pessoas perguntam
- **Padrões de uso**: Como interagem com o sistema
- **Feedback detalhado**: O que funciona e o que não
- **Idioma preferido**: Português vs Inglês vs Espanhol

### **Técnicas**
- **Dispositivos**: Compatibilidade com totens
- **Performance**: Tempo de resposta
- **Usabilidade**: Facilidade de uso

## 🛡️ **Privacidade e Segurança**

### **Dados Locais**
- ✅ Todos os dados ficam no navegador
- ✅ Não há envio para servidores externos
- ✅ Conformidade com LGPD
- ✅ Controle total sobre os dados

### **Limpeza Automática**
- 🧹 Dados antigos (30+ dias) são removidos
- 🧹 Evita sobrecarga de armazenamento
- 🧹 Mantém apenas dados relevantes

## 📋 **Checklist para TCC**

### **✅ Implementado**
- [x] **Guatá idêntico** ao da plataforma
- [x] **Mesma interface** e componentes
- [x] **Mesmas funcionalidades** da plataforma (ML, roteiros, emergência)
- [x] **Detecção automática de idioma** (Português/Inglês/Espanhol)
- [x] **Tela inicial otimizada** para totens
- [x] **Sem necessidade de cadastro** - funciona imediatamente
- [x] Coleta automática de dados
- [x] Métricas quantitativas e qualitativas
- [x] Relatórios em tempo real
- [x] Exportação para CSV
- [x] Interface otimizada para totens
- [x] Sistema de feedback
- [x] Categorização automática de tópicos
- [x] Persistência local de dados

### **📊 Dados Disponíveis**
- [x] Total de sessões
- [x] Taxa de conversão (botão "Começar")
- [x] Tempo médio de uso
- [x] Taxa de satisfação
- [x] Tópicos mais populares
- [x] Distribuição de dispositivos
- [x] Padrões de interação
- [x] Feedback detalhado
- [x] Idioma usado (PT/EN/ES)

## 🚀 **Próximos Passos**

### **Para o TCC**
1. **Teste em totens reais**: Valide a usabilidade
2. **Coleta de dados**: Execute testes com usuários reais
3. **Análise dos resultados**: Processe os dados coletados
4. **Relatório final**: Use os dados para seu TCC

### **Melhorias Futuras**
- [ ] Integração com Google Analytics
- [ ] Relatórios mais detalhados
- [ ] Análise de sentimento
- [ ] Mapeamento de jornada do usuário

## 📞 **Suporte**

### **Em Caso de Problemas**
1. **Verifique o console**: Logs detalhados disponíveis
2. **Limpe o cache**: Se necessário, limpe localStorage
3. **Teste em diferentes dispositivos**: Valide compatibilidade

### **Contatos**
- **Desenvolvedor**: Cursor AI Agent
- **Documentação**: Este arquivo e docs relacionados
- **Testes**: URLs fornecidas acima

---

## 🎯 **Resumo para TCC**

**O sistema está 100% funcional e pronto para seu TCC!**

✅ **Guatá idêntico** ao da plataforma - sem diferenças visuais  
✅ **Detecção automática de idioma** - responde em PT, EN ou ES  
✅ **Tela inicial otimizada** para totens com botão "Começar"  
✅ **Mesma interface** e experiência do usuário  
✅ **Sem necessidade de cadastro** - funciona imediatamente  
✅ **Todas as funcionalidades** da plataforma incluídas  
✅ **Coleta automática** de todos os dados necessários  
✅ **Interface otimizada** para totens físicos  
✅ **Relatórios completos** com métricas relevantes  
✅ **Exportação de dados** para análise externa  
✅ **Dados persistentes** - não se perdem entre sessões  

**URLs para teste:**
- **Totem**: `http://localhost:8083/chatguata`
- **Relatórios**: `http://localhost:8083/tcc-report`
- **Produção**: `flowtrip.com/chatguata` e `flowtrip.com/tcc-report`

**Todos os dados são verdadeiros e coletados em tempo real!** 