@echo off
echo ========================================
echo 🦦 TESTE FINAL - GUATÁ PREDICTIVE ATIVO
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
echo 🧠 Testando compilação final...
npx tsc --noEmit src/pages/Guata.tsx src/services/ai/guataPredictiveService.ts
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Predictive no navegador...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ PREDICTIVE ATIVO - TESTE FINAL!
echo ========================================
echo.
echo 🚀 CORREÇÕES IMPLEMENTADAS:
echo.
echo ✅ Guata.tsx agora usa guataPredictiveService
echo ✅ Busca web real ativada
echo ✅ Decisão inteligente para web search
echo ✅ Combinação local + web
echo ✅ Análise preditiva e sugestões proativas
echo.
echo 🎯 TESTE ESTAS PERGUNTAS:
echo.
echo 1. "o que é rota bioceanica?" 
echo    - Deve buscar na web e dar resposta completa
echo.
echo 2. "quem é você?"
echo    - Deve se apresentar corretamente
echo.
echo 3. "Qual o melhor hotel em Bonito?"
echo    - Deve buscar na web para recomendações
echo.
echo 4. "Me conte sobre a comida típica de MS"
echo    - Deve usar conhecimento local
echo.
echo 5. "pode me montar um roteiro de três dias?"
echo    - Deve buscar na web para planejamento
echo.
echo 📊 LOGS QUE VOCÊ DEVE VER:
echo.
echo Para perguntas que precisam de web:
echo - "🌐 Decisão: Buscar na web (necessário para resposta completa)"
echo - "🌐 Buscando na web com contexto preditivo..."
echo - "🌐 Usou web search: true"
echo - "🧠 Fonte do conhecimento: web" ou "hybrid"
echo.
echo Para perguntas locais:
echo - "🌐 Usou web search: false"
echo - "🧠 Fonte do conhecimento: local"
echo.
echo 🔮 RECURSOS PREDITIVOS:
echo - "🔮 Insights preditivos: [objeto com análise]"
echo - "🚀 Sugestões proativas: [número]"
echo - "🧠 Análise de comportamento: [objeto]"
echo - "🔮 Próximas perguntas previstas: [número]"
echo.
echo 🦦 AGORA O GUATÁ DEVE:
echo ✅ Entender perguntas corretamente
echo ✅ Usar web search quando necessário
echo ✅ Dar respostas específicas e úteis
echo ✅ Não ficar limitado ao conhecimento local
echo ✅ Ser verdadeiramente inteligente
echo.
echo ⚡ TESTE "o que é rota bioceanica?" AGORA!
echo - Deve buscar na web e dar resposta completa!
echo.
echo ⚡ TESTE "quem é você?" AGORA!
echo - Deve se apresentar corretamente!
echo.
pause




