@echo off
echo ========================================
echo 🦦 TESTE GUATÁ COM TIMEOUT E FALLBACK
echo ========================================
echo.

echo 🔍 Verificando se o Guatá está funcionando com timeout e fallback...
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
echo    ✅ Tenta chamar Supabase Edge Functions (guata-ai e guata-web-rag)
echo    ✅ Timeout de 10 segundos para evitar travamento
echo    ✅ Fallback inteligente local se Edge Functions falharem
echo    ✅ Respostas específicas e personalizadas
echo    ✅ Sistema de parceiros REAIS (não inventa)
echo.
echo 🌐 Acesse: http://localhost:8082/ms/guata
echo.
echo 🔍 TESTE:
echo    1. Digite "oi" - deve responder com apresentação
echo    2. Digite "bonito" - deve falar sobre Bonito
echo    3. Digite "pantanal" - deve falar sobre Pantanal
echo    4. Digite "roteiro" - deve oferecer ajuda com planejamento
echo.
echo ⚠️  Se Edge Functions não funcionarem, usará fallback local inteligente!
echo.

npm run dev





