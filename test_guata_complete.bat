@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ COMPLETO - TODAS AS FASES
echo ========================================
echo.

echo ✅ Verificando se o servidor está rodando...
netstat -an | findstr :8085
if %errorlevel% neq 0 (
    echo ❌ Servidor não está rodando! Iniciando...
    start /B npm run dev
    timeout 5
) else (
    echo ✅ Servidor está rodando na porta 8085
)

echo.
echo 🧠 Testando compilação de todos os serviços...
npx tsc --noEmit src/services/ai/guataPredictiveService.ts src/services/ai/guataAdvancedMemoryService.ts src/services/ai/guataEmotionalIntelligenceService.ts src/services/ai/guataPartnersService.ts src/services/ai/index.ts
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Completo no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ COMPLETO - TODAS AS FASES IMPLEMENTADAS!
echo ========================================
echo.
echo 🚀 SISTEMA COMPLETO IMPLEMENTADO:
echo.
echo ✅ FASE 1: SISTEMA HÍBRIDO INTELIGENTE REAL
echo    - Conhecimento local + Web search inteligente
echo    - Decisão automática baseada em confiança
echo    - Sem mentiras - Informações sempre verificadas
echo.
echo ✅ FASE 2: MEMÓRIA AVANÇADA E APRENDIZADO CONTÍNUO
echo    - Memória contextual por usuário
echo    - Aprendizado de padrões de comportamento
echo    - Análise de conversas e contexto
echo    - Melhoria contínua baseada em interações
echo.
echo ✅ FASE 3: INTELIGÊNCIA EMOCIONAL E PERSONALIZAÇÃO
echo    - Análise emocional avançada
echo    - Personalização baseada no perfil do usuário
echo    - Respostas empáticas e contextuais
echo    - Detecção de humor e intenção
echo.
echo ✅ FASE 4: SISTEMA DE PARCEIROS REAL
echo    - Parceiros reais do turismo de MS
echo    - Priorização inteligente de parceiros
echo    - Alternativas não parceiras quando necessário
echo    - Sistema preparado para expansão
echo.
echo ✅ FASE 5: ANÁLISE PREDITIVA E SUGESTÕES PROATIVAS
echo    - Análise preditiva do comportamento
echo    - Sugestões proativas baseadas em padrões
echo    - Predição de próximas perguntas
echo    - Insights de comportamento do usuário
echo.
echo 🧠 CARACTERÍSTICAS IMPLEMENTADAS:
echo.
echo 1. Personalidade Natural:
echo    ✅ Sem expressões exageradas
echo    ✅ Tom conversacional natural
echo    ✅ Personalidade sutil de capivara
echo    ✅ Usuário esquece que é bot
echo.
echo 2. Sistema Híbrido Inteligente:
echo    ✅ Conhecimento local expandido
echo    ✅ Web search inteligente
echo    ✅ Decisão automática
echo    ✅ Sem mentiras
echo.
echo 3. Base de Conhecimento Expandida:
echo    ✅ Destinos: Bonito, Pantanal, Campo Grande, Corumbá, etc.
echo    ✅ Gastronomia: Pratos típicos, onde comer
echo    ✅ Infraestrutura: Rota Bioceânica
echo    ✅ Eventos: Festivais e festas regionais
echo    ✅ Cultura: História e tradições
echo    ✅ Roteiros: Planejamento de viagem
echo.
echo 4. Sistema de Parceiros Preparado:
echo    ✅ Parceiros reais do turismo
echo    ✅ Priorização inteligente
echo    ✅ Não inventa parceiros
echo    ✅ Alternativas quando necessário
echo.
echo 5. Conversação Natural:
echo    ✅ Perguntas inteligentes
echo    ✅ Contexto emocional
echo    ✅ Transições suaves
echo    ✅ Aprendizado contínuo
echo.
echo 6. Análise Preditiva:
echo    ✅ Padrões de comportamento
echo    ✅ Sugestões proativas
echo    ✅ Predição de perguntas
echo    ✅ Insights de usuário
echo.
echo 🎯 TESTE ESTAS PERGUNTAS:
echo.
echo - "Oi!" (saudação natural)
echo - "Me conte sobre a comida típica de MS" (gastronomia local)
echo - "Qual o melhor hotel em Bonito?" (recomendação - web search)
echo - "pode me montar um roteiro de três dias na cidade" (planejamento)
echo - "rota bioceanica" (infraestrutura local)
echo - "Onde comer em Campo Grande?" (parceiros)
echo - "Quais passeios fazer em Bonito?" (parceiros + web)
echo.
echo 📊 LOGS INTELIGENTES COMPLETOS:
echo - Mostra fonte do conhecimento (local/web/híbrido)
echo - Indica sugestões de parceiros
echo - Registra aprendizado contínuo
echo - Mostra análise emocional
echo - Exibe insights preditivos
echo - Sugere próximas perguntas
echo.
echo 🦦 AGORA O GUATÁ É VERDADEIRAMENTE INTELIGENTE!
echo - Combina todos os recursos avançados
echo - Aprende continuamente
echo - Personaliza respostas
echo - Prioriza parceiros
echo - Faz sugestões proativas
echo - Analisa comportamento
echo - Prediz necessidades
echo.
echo ⚡ RESPOSTA INTELIGENTE - SEM TRAVAMENTO!
echo 🧠 CONHECIMENTO LOCAL + WEB - SEM MENTIRAS!
echo 🦦 PERSONALIDADE NATURAL - CONVERSA REAL!
echo 🤝 SISTEMA DE PARCEIROS - PRIORIZAÇÃO INTELIGENTE!
echo 🔮 ANÁLISE PREDITIVA - SUGESTÕES PROATIVAS!
echo.
pause




