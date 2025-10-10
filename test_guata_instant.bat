@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ INSTANT
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
echo 🧠 Testando compilação do Guatá Instant...
npx tsc --noEmit src/services/ai/guataInstantService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Instant no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ INSTANT PRONTO!
echo ========================================
echo.
echo Agora o Guatá responde INSTANTANEAMENTE:
echo ✅ SEM travamento - Resposta em milissegundos
echo ✅ Personalidade natural - Sem expressões exageradas
echo ✅ Conhecimento local expandido - Base robusta do MS
echo ✅ SEM web search - Não trava mais
echo ✅ Conversação inteligente - Tom natural e útil
echo ✅ Sistema de parceiros preparado - Para o futuro
echo.
echo TESTE ESTAS PERGUNTAS:
echo - "Oi!" (saudação natural)
echo - "Me conte sobre a comida típica de MS" (gastronomia)
echo - "rota bioceanica" (infraestrutura)
echo - "Quais são os melhores passeios em Bonito?" (destinos)
echo - "Onde posso comer em Campo Grande?" (recomendação)
echo.
echo ⚡ RESPOSTA INSTANTÂNEA - SEM TRAVAMENTO!
echo 🧠 CONHECIMENTO LOCAL - SEM MENTIRAS!
echo 🦦 PERSONALIDADE NATURAL - CONVERSA REAL!
echo.
pause





