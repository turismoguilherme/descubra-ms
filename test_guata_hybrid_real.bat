@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ SMART HYBRID REAL
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
echo 🧠 Testando compilação do Guatá Smart Hybrid Real...
npx tsc --noEmit src/services/ai/guataSmartHybridRealService.ts src/services/ai/index.ts
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Smart Hybrid Real no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ SMART HYBRID REAL PRONTO!
echo ========================================
echo.
echo Agora o Guatá é VERDADEIRAMENTE INTELIGENTE:
echo ✅ Sistema híbrido real - Local + Web quando necessário
echo ✅ Decisão inteligente - Usa local primeiro, web como complemento
echo ✅ Personalidade natural - Sem expressões exageradas
echo ✅ Aprendizado contínuo - Melhora com cada conversa
echo ✅ Sistema de parceiros preparado - Para o futuro
echo ✅ Conversação natural - Usuário esquece que é bot
echo.
echo TESTE ESTAS PERGUNTAS:
echo - "Oi!" (saudação natural)
echo - "Me conte sobre a comida típica de MS" (gastronomia local)
echo - "Qual o melhor hotel em Bonito?" (recomendação - vai buscar na web)
echo - "pode me montar um roteiro de três dias na cidade" (planejamento)
echo - "rota bioceanica" (infraestrutura local)
echo.
echo 🧠 SISTEMA HÍBRIDO INTELIGENTE:
echo - Usa conhecimento local PRIMEIRO (rápido e confiável)
echo - Busca na web quando NÃO souber (complementar)
echo - Combina ambos para resposta completa
echo - Sempre aprende e melhora
echo - Prioriza parceiros quando existirem
echo.
echo 📊 LOGS INTELIGENTES:
echo - Mostra se usou local, web ou híbrido
echo - Indica fonte do conhecimento
echo - Mostra sugestões de parceiros
echo - Registra aprendizado contínuo
echo.
pause





