@echo off
echo ========================================
echo 🦦 TESTE GUATÁ TRUE API - SUPABASE EDGE FUNCTIONS
echo ========================================
echo.

echo 🔍 Verificando se o Guatá True API está funcionando com Supabase Edge Functions...
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
echo 📝 O Guatá True API agora usa:
echo    ✅ Supabase Edge Function guata-ai (Gemini API)
echo    ✅ Supabase Edge Function guata-web-rag (Google Search API)
echo    ✅ Sistema de parceiros REAIS (não inventa)
echo    ✅ Busca web verdadeira e atualizada
echo    ✅ Personalidade de capivara natural
echo.
echo 🌐 Acesse: http://localhost:5173/ms/guata
echo.
echo ⚠️  IMPORTANTE: As APIs agora funcionam via Supabase Edge Functions!
echo    - Chaves de API seguras no Supabase
echo    - Sem dependência de variáveis de ambiente locais
echo    - Busca web real e atualizada
echo.

npm run dev




