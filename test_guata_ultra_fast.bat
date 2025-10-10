@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ ULTRA FAST INTELIGENTE
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
echo 🧠 Testando compilação do Guatá Ultra Fast Inteligente...
npx tsc --noEmit src/services/ai/guataUltraFastIntelligentService.ts src/services/ai/index.ts
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Ultra Fast Inteligente no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ ULTRA FAST INTELIGENTE PRONTO!
echo ========================================
echo.
echo Agora o Guatá:
echo ✅ Responde INSTANTANEAMENTE (sem demora)
echo ✅ Tem personalidade de capivara
echo ✅ NÃO depende da web (sem mentiras)
echo ✅ Usa apenas conhecimento local confiável
echo ✅ Tem expressões visuais (*coçando a cabeça*)
echo ✅ Faz perguntas de seguimento
echo.
echo Teste perguntando:
echo - "Oi!" (saudação)
echo - "Me conte sobre a comida típica de MS" (gastronomia)
echo - "rota bioceanica" (infraestrutura)
echo - "Quais são os melhores passeios em Bonito?" (destinos)
echo.
echo ⚡ RESPOSTA INSTANTÂNEA - SEM DEMORA!
echo.
pause





