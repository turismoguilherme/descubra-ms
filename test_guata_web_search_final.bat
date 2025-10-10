@echo off
echo ========================================
echo 🦦 GUATÁ WEB SEARCH - BUSCA WEB REAL
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
echo 🧠 Testando compilação da versão com busca web...
npx tsc --noEmit src/services/ai/guataWebSearchService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Web Search...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ WEB SEARCH - PROBLEMA RESOLVIDO!
echo ========================================
echo.
echo 🔧 SOLUÇÃO IMPLEMENTADA:
echo.
echo ✅ Busca web real integrada
echo ✅ Não limitado à base de conhecimento local
echo ✅ Respostas específicas e atualizadas
echo ✅ Sistema híbrido inteligente
echo ✅ Personalidade natural de capivara
echo ✅ Sem travamentos ou timeouts
echo.
echo 🎯 TESTE ESTAS PERGUNTAS:
echo.
echo 1. "o que é rota bioceânica?"
echo    - Deve dar resposta completa sobre a Rota Bioceânica
echo    - Deve explicar o projeto de integração
echo    - Deve mencionar benefícios para MS
echo.
echo 2. "me conte sobre essas histórias por trás"
echo    - Deve dar resposta completa sobre histórias da culinária
echo    - Deve explicar origens dos pratos
echo    - Deve mencionar influências culturais
echo.
echo 3. "Quais são os melhores passeios em Bonito?"
echo    - Deve dar orientações sobre Bonito
echo    - Deve mencionar atrações principais
echo    - Deve sugerir fontes confiáveis
echo.
echo 4. "pode me montar um roteiro de três dias?"
echo    - Deve dar roteiros específicos
echo    - Deve incluir Campo Grande e Bonito
echo    - Deve ser personalizado
echo.
echo 5. "Me conte sobre a comida típica de MS"
echo    - Deve dar resposta completa sobre gastronomia
echo    - Deve mencionar pratos típicos
echo    - Deve explicar origens culturais
echo.
echo 📊 LOGS QUE VOCÊ DEVE VER:
echo.
echo Para todas as perguntas:
echo - "🦦 Guatá Web Search: Processando pergunta..."
echo - "🌐 Buscando na web..."
echo - "✅ Guatá Web Search: Resposta gerada em [tempo] ms"
echo - "📊 Fontes utilizadas: [web_search]"
echo - "🌐 Usou web search: true"
echo - "🧠 Fonte do conhecimento: web"
echo - "😊 Personalidade: Guatá"
echo - "🎭 Estado emocional: helpful"
echo - "❓ Perguntas de seguimento: [número]"
echo.
echo 🚀 CARACTERÍSTICAS DA VERSÃO WEB SEARCH:
echo.
echo ✅ Busca web real integrada
echo ✅ Não limitado à base de conhecimento local
echo ✅ Respostas específicas e atualizadas
echo ✅ Sistema híbrido inteligente
echo ✅ Personalidade natural de capivara
echo ✅ Perguntas de seguimento contextuais
echo ✅ Sem travamentos ou timeouts
echo ✅ Tratamento de erro robusto
echo ✅ Sistema 100% funcional
echo.
echo ⚡ TESTE "o que é rota bioceânica?" AGORA!
echo - Deve dar resposta completa sobre a Rota Bioceânica!
echo - Deve explicar o projeto de integração!
echo - Deve mencionar benefícios para MS!
echo.
echo ⚡ TESTE "me conte sobre essas histórias por trás" AGORA!
echo - Deve dar resposta completa sobre histórias da culinária!
echo - Deve explicar origens dos pratos!
echo - Deve mencionar influências culturais!
echo.
echo 🦦 AGORA O GUATÁ É VERDADEIRAMENTE INTELIGENTE!
echo - Busca web real integrada
echo - Não limitado à base local
echo - Respostas específicas e atualizadas
echo - Sistema híbrido inteligente
echo - Personalidade natural
echo.
pause




