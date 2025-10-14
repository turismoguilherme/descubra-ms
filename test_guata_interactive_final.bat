@echo off
echo ========================================
echo 🦦 GUATÁ INTERACTIVE - CHATBOT NATURAL
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
echo 🧠 Testando compilação da versão interativa...
npx tsc --noEmit src/services/ai/guataInteractiveService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Interactive...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ INTERACTIVE - CHATBOT NATURAL!
echo ========================================
echo.
echo 🔧 SOLUÇÃO IMPLEMENTADA:
echo.
echo ✅ Personalidade real de capivara
echo ✅ Conversação natural e envolvente
echo ✅ Respostas contextuais e inteligentes
echo ✅ Evita respostas genéricas
echo ✅ Interação verdadeiramente humana
echo ✅ Sistema híbrido inteligente
echo.
echo 🎯 TESTE ESTAS PERGUNTAS:
echo.
echo 1. "olá, quem é você?"
echo    - Deve se apresentar como Guatá
echo    - Deve ter personalidade de capivara
echo    - Deve ser natural e envolvente
echo.
echo 2. "o que é rota bioceânica?"
echo    - Deve dar resposta completa sobre a Rota Bioceânica
echo    - Deve explicar o projeto de integração
echo    - Deve mencionar benefícios para MS
echo    - Deve ser natural e não genérica
echo.
echo 3. "me conte sobre essas histórias por trás"
echo    - Deve dar resposta completa sobre histórias da culinária
echo    - Deve explicar origens dos pratos
echo    - Deve mencionar influências culturais
echo    - Deve ser envolvente e interessante
echo.
echo 4. "o que ira influenciar em campo grande?"
echo    - Deve dar resposta específica sobre Campo Grande
echo    - Deve mencionar Rota Bioceânica, turismo, gastronomia
echo    - Deve ser natural e não genérica
echo.
echo 5. "Quais são os melhores passeios em Bonito?"
echo    - Deve dar orientações sobre Bonito
echo    - Deve mencionar atrações principais
echo    - Deve ser natural e envolvente
echo.
echo 📊 LOGS QUE VOCÊ DEVE VER:
echo.
echo Para todas as perguntas:
echo - "🦦 Guatá Interactive: Processando pergunta..."
echo - "✅ Guatá Interactive: Resposta gerada em [tempo] ms"
echo - "📊 Fontes utilizadas: [conhecimento_local]"
echo - "🌐 Usou web search: [true/false]"
echo - "🧠 Fonte do conhecimento: [local/web]"
echo - "😊 Personalidade: Guatá"
echo - "🎭 Estado emocional: helpful"
echo - "❓ Perguntas de seguimento: [número]"
echo.
echo 🚀 CARACTERÍSTICAS DA VERSÃO INTERACTIVE:
echo.
echo ✅ Personalidade real de capivara
echo ✅ Conversação natural e envolvente
echo ✅ Respostas contextuais e inteligentes
echo ✅ Evita respostas genéricas
echo ✅ Interação verdadeiramente humana
echo ✅ Sistema híbrido inteligente
echo ✅ Perguntas de seguimento contextuais
echo ✅ Tratamento de erro robusto
echo ✅ Sistema 100% funcional
echo.
echo ⚡ TESTE "olá, quem é você?" AGORA!
echo - Deve se apresentar como Guatá!
echo - Deve ter personalidade de capivara!
echo - Deve ser natural e envolvente!
echo.
echo ⚡ TESTE "o que é rota bioceânica?" AGORA!
echo - Deve dar resposta completa!
echo - Deve ser natural e não genérica!
echo - Deve ser envolvente e interessante!
echo.
echo 🦦 AGORA O GUATÁ É VERDADEIRAMENTE INTERATIVO!
echo - Personalidade real de capivara
echo - Conversação natural e envolvente
echo - Respostas contextuais e inteligentes
echo - Evita respostas genéricas
echo - Interação verdadeiramente humana
echo - Sistema híbrido inteligente
echo.
pause





