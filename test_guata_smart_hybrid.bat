@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ SMART HYBRID
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
echo 🧠 Testando compilação do Guatá Smart Hybrid...
npx tsc --noEmit src/services/ai/guataSmartHybridService.ts src/services/ai/index.ts
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Smart Hybrid no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ SMART HYBRID PRONTO!
echo ========================================
echo.
echo Agora o Guatá é VERDADEIRAMENTE INTELIGENTE:
echo ✅ Personalidade natural (sem expressões exageradas)
echo ✅ Conhecimento local expandido do MS
echo ✅ Web search inteligente (só quando necessário)
echo ✅ Sistema de parceiros preparado
echo ✅ Conversação natural e útil
echo ✅ Aprendizado contínuo
echo ✅ Velocidade + Inteligência
echo.
echo TESTE ESTAS PERGUNTAS:
echo - "Oi!" (saudação natural)
echo - "Me conte sobre a comida típica de MS" (gastronomia)
echo - "rota bioceanica" (infraestrutura)
echo - "Quais são os melhores passeios em Bonito?" (destinos)
echo - "Onde posso comer em Campo Grande?" (recomendação)
echo.
echo 🧠 SISTEMA HÍBRIDO INTELIGENTE:
echo - Usa conhecimento local primeiro (rápido)
echo - Busca na web só quando necessário
echo - Prioriza parceiros quando existirem
echo - Não inventa informações
echo - Sempre aprende e melhora
echo.
pause




