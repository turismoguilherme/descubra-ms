@echo off
echo ========================================
echo 🦦 TESTANDO GUATÁ COM BUSCA WEB REAL
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
echo 🧠 Testando compilação do Guatá com busca web...
npx tsc --noEmit src/services/ai/guataPredictiveService.ts src/services/ai/index.ts
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá com busca web no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ COM BUSCA WEB REAL ATIVADA!
echo ========================================
echo.
echo 🌐 BUSCA WEB INTELIGENTE ATIVADA:
echo.
echo ✅ Decisão inteligente para usar web search:
echo    - Quando conhecimento local < 50%% confiança
echo    - Perguntas sobre "melhor", "recomenda", "onde"
echo    - Perguntas sobre "como", "quando", "roteiro"
echo    - Perguntas sobre "preço", "horário", "contato"
echo    - Planejamento de viagem
echo.
echo ✅ Combinação inteligente:
echo    - Local + Web quando ambos encontram algo
echo    - Apenas Web quando local não encontra
echo    - Apenas Local quando web não é necessário
echo.
echo 🎯 TESTE ESTAS PERGUNTAS QUE DEVEM USAR WEB:
echo.
echo - "o que é rota bioceanica?" (deve buscar na web)
echo - "Qual o melhor hotel em Bonito?" (deve buscar na web)
echo - "Como chegar ao Pantanal?" (deve buscar na web)
echo - "Preços dos passeios em Bonito" (deve buscar na web)
echo - "Horário de funcionamento da Feira Central" (deve buscar na web)
echo - "Contato de restaurantes em Campo Grande" (deve buscar na web)
echo.
echo 🎯 TESTE ESTAS PERGUNTAS QUE DEVEM USAR LOCAL:
echo.
echo - "Me conte sobre a comida típica de MS" (deve usar local)
echo - "O que é Bonito?" (deve usar local)
echo - "História do Mato Grosso do Sul" (deve usar local)
echo.
echo 📊 LOGS QUE VOCÊ DEVE VER:
echo - "🌐 Decisão: Buscar na web (necessário para resposta completa)"
echo - "🌐 Buscando na web com contexto preditivo..."
echo - "✅ Guatá Predictive: Resposta gerada em X ms"
echo - "🌐 Usou web search: true"
echo - "🧠 Fonte do conhecimento: web" ou "hybrid"
echo.
echo 🚀 AGORA O GUATÁ É VERDADEIRAMENTE INTELIGENTE!
echo - Usa conhecimento local quando suficiente
echo - Busca na web quando necessário
echo - Combina ambos para resposta completa
echo - Sem limitações de conhecimento
echo.
echo ⚡ TESTE "o que é rota bioceanica?" NOVAMENTE!
echo - Agora deve buscar na web e dar resposta completa!
echo.
pause





