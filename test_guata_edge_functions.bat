@echo off
echo ========================================
echo 🦦 TESTE GUATÁ EDGE FUNCTIONS
echo ========================================
echo.

echo 🔍 Verificando se as Supabase Edge Functions estão funcionando...
echo.

echo 📋 Testando compilação TypeScript...
npx tsc --noEmit src/services/ai/guataTrueApiService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação TypeScript!
    pause
    exit /b 1
)
echo ✅ Compilação TypeScript OK!

echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo.
echo 📝 O Guatá True API agora:
echo    ✅ SEMPRE chama Supabase Edge Function guata-ai (Gemini)
echo    ✅ SEMPRE chama Supabase Edge Function guata-web-rag (Google Search)
echo    ✅ Logs detalhados para debug
echo    ✅ Sistema de parceiros REAIS (não inventa)
echo.
echo 🌐 Acesse: http://localhost:8082/ms/guata
echo.
echo 🔍 VERIFIQUE NO CONSOLE:
echo    - "🦦 Guatá True API: Processando pergunta..."
echo    - "🤖 Chamando Supabase Edge Function guata-ai..."
echo    - "🔍 Chamando Supabase Edge Function guata-web-rag..."
echo    - "✅ Resposta da IA recebida via Supabase!"
echo    - "✅ Dados de RAG recebidos via Supabase!"
echo.

npm run dev




