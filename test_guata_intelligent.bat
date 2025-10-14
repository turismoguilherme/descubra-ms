@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ INTELLIGENT
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
echo 🧠 Testando compilação do Guatá Inteligente...
npx tsc --noEmit src/services/ai/guataIntelligentService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Inteligente no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ INTELLIGENT PRONTO!
echo ========================================
echo.
echo Agora o Guatá tem:
echo ✅ Personalidade de capivara
echo ✅ Análise emocional
echo ✅ Detecção de intenção
echo ✅ Aprendizado contínuo
echo ✅ Interação natural
echo.
echo Teste perguntando:
echo - "Oi!" (saudação casual)
echo - "Quais são os melhores passeios em Bonito?" (busca de informação)
echo - "Quero planejar uma viagem" (planejamento)
echo - "rota bioceanica" (pergunta específica)
echo.
pause






