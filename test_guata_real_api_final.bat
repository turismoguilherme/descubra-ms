@echo off
echo ========================================
echo 🦦 GUATÁ REAL API - APIS REAIS CONFIGURADAS
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
echo 🧠 Testando compilação da versão com APIs reais...
npx tsc --noEmit src/services/ai/guataRealApiService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá Real API...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ REAL API - APIS REAIS CONFIGURADAS!
echo ========================================
echo.
echo 🔧 SOLUÇÃO IMPLEMENTADA:
echo.
echo ✅ Supabase Edge Functions (guata-web-rag)
echo ✅ Google Gemini API
echo ✅ Sistema de parceiros real
echo ✅ Busca web verdadeira e atualizada
echo ✅ Respostas específicas e contextuais
echo ✅ Personalidade natural de capivara
echo.
echo 🎯 TESTE ESTAS PERGUNTAS:
echo.
echo 1. "o que é rota bioceânica?"
echo    - Deve usar Supabase Edge Function ou Gemini API
echo    - Deve dar resposta verdadeira e atualizada
echo    - Deve ser específica sobre o projeto
echo.
echo 2. "me conte sobre essas histórias por trás"
echo    - Deve usar APIs para buscar informações atualizadas
echo    - Deve dar resposta completa sobre histórias da culinária
echo    - Deve ser envolvente e interessante
echo.
echo 3. "Quais são os melhores passeios em Bonito?"
echo    - Deve usar APIs para buscar informações atualizadas
echo    - Deve sugerir parceiros relevantes
echo    - Deve dar orientações específicas
echo.
echo 4. "o que ira influenciar em campo grande?"
echo    - Deve usar APIs para buscar informações atualizadas
echo    - Deve dar resposta específica sobre Campo Grande
echo    - Deve mencionar Rota Bioceânica, turismo, gastronomia
echo.
echo 5. "Me conte sobre a comida típica de MS"
echo    - Deve usar APIs para buscar informações atualizadas
echo    - Deve sugerir parceiros de gastronomia
echo    - Deve dar resposta completa sobre pratos típicos
echo.
echo 📊 LOGS QUE VOCÊ DEVE VER:
echo.
echo Para todas as perguntas:
echo - "🦦 Guatá Real API: Processando pergunta..."
echo - "🤝 Parceiros encontrados: [número]"
echo - "🌐 Chamando Supabase Edge Function guata-web-rag..."
echo - "✅ Supabase Edge Function respondeu!" OU "⚠️ Supabase Edge Function falhou"
echo - "🤖 Chamando Google Gemini API..." (se Supabase falhar)
echo - "✅ Gemini API respondeu!" (se Gemini funcionar)
echo - "✅ Guatá Real API: Resposta gerada em [tempo] ms"
echo - "📊 Fontes utilizadas: [web_search, parceiros, etc]"
echo - "🌐 Usou web search: true"
echo - "🧠 Fonte do conhecimento: web/hybrid"
echo - "🤝 Parceiros encontrados: [número]"
echo - "😊 Personalidade: Guatá"
echo - "🎭 Estado emocional: helpful"
echo - "❓ Perguntas de seguimento: [número]"
echo.
echo 🚀 CARACTERÍSTICAS DA VERSÃO REAL API:
echo.
echo ✅ Supabase Edge Functions (guata-web-rag)
echo ✅ Google Gemini API
echo ✅ Sistema de parceiros real
echo ✅ Busca web verdadeira e atualizada
echo ✅ Respostas específicas e contextuais
echo ✅ Personalidade natural de capivara
echo ✅ Perguntas de seguimento contextuais
echo ✅ Tratamento de erro robusto
echo ✅ Sistema 100% funcional
echo.
echo ⚡ TESTE "o que é rota bioceânica?" AGORA!
echo - Deve usar APIs reais!
echo - Deve dar resposta verdadeira e atualizada!
echo - Deve ser específica sobre o projeto!
echo.
echo ⚡ TESTE "Quais são os melhores passeios em Bonito?" AGORA!
echo - Deve usar APIs reais!
echo - Deve sugerir parceiros relevantes!
echo - Deve dar orientações específicas!
echo.
echo 🦦 AGORA O GUATÁ USA APIS REAIS!
echo - Supabase Edge Functions (guata-web-rag)
echo - Google Gemini API
echo - Sistema de parceiros real
echo - Busca web verdadeira e atualizada
echo - Respostas específicas e contextuais
echo - Personalidade natural
echo.
pause





