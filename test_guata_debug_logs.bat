@echo off
echo ========================================
echo 🦦 TESTE COM LOGS DETALHADOS - DEBUG
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
echo 🧠 Testando compilação com logs...
npx tsc --noEmit src/services/ai/guataPredictiveService.ts src/pages/Guata.tsx
if %errorlevel% neq 0 (
    echo ❌ Erro de compilação!
    pause
    exit /b 1
) else (
    echo ✅ Compilação OK!
)

echo.
echo 🎯 Abrindo o Guatá com logs detalhados...
start http://localhost:8085/ms/guata

echo.
echo ========================================
echo 🦦 GUATÁ COM LOGS DETALHADOS ATIVO!
echo ========================================
echo.
echo 📊 LOGS QUE VOCÊ DEVE VER NO CONSOLE:
echo.
echo 1. INÍCIO DO PROCESSAMENTO:
echo    - "🦦 Guatá Predictive: Processando pergunta..."
echo    - "📝 Query recebida: [objeto completo]"
echo    - "🔍 Pergunta processada: [pergunta]"
echo    - "👤 User ID: [id do usuário]"
echo.
echo 2. ANÁLISE DE COMPORTAMENTO:
echo    - "🧠 Iniciando análise de comportamento..."
echo    - "🧠 Análise de comportamento concluída: [objeto]"
echo.
echo 3. ANÁLISE DE PADRÕES:
echo    - "💬 Iniciando análise de padrões de conversa..."
echo    - "💬 Padrão de conversa detectado: [objeto]"
echo.
echo 4. BUSCA INTELIGENTE:
echo    - "🔍 Iniciando busca inteligente..."
echo    - "🔍 Pergunta: [pergunta]"
echo    - "🔍 Behavior analysis: [objeto]"
echo    - "🔍 Conversation pattern: [objeto]"
echo    - "🔍 Buscando no conhecimento local..."
echo    - "🔍 Resultado local: [objeto]"
echo    - "🔍 Precisa de web search? [true/false]"
echo    - "🔍 Confiança local: [número]"
echo    - "🔍 Palavras-chave detectadas: [objeto]"
echo.
echo 5. SE PRECISAR DE WEB SEARCH:
echo    - "🌐 Decisão: Buscar na web (necessário para resposta completa)"
echo    - "🌐 Iniciando busca web..."
echo    - "🌐 Buscando na web com contexto preditivo..."
echo    - "🌐 Pergunta para web search: [pergunta]"
echo    - "🌐 Chamando Supabase Edge Function..."
echo    - "🌐 Resposta do Supabase: [objeto]"
echo    - "🌐 Web search bem-sucedido!" ou "🌐 Web search falhou ou sem dados: [erro]"
echo    - "🌐 Resultado da busca web: [objeto]"
echo.
echo 6. GERAÇÃO DE RESPOSTA:
echo    - "✍️ Gerando resposta..."
echo    - "✍️ Resposta gerada: [objeto]"
echo.
echo 7. INSIGHTS PREDITIVOS:
echo    - "🔮 Gerando insights preditivos..."
echo    - "🔮 Insights preditivos: [objeto]"
echo    - "🚀 Sugestões proativas: [array]"
echo    - "🔮 Próximas perguntas: [array]"
echo.
echo 8. FINALIZAÇÃO:
echo    - "💾 Atualizando modelos preditivos..."
echo    - "✅ Guatá Predictive: Resposta gerada em [tempo] ms"
echo.
echo 9. SE HOUVER ERRO:
echo    - "❌ Erro no Guatá Predictive: [erro]"
echo    - "❌ Stack trace: [stack trace]"
echo    - "❌ Query que causou erro: [objeto]"
echo.
echo 🎯 TESTE ESTAS PERGUNTAS E OBSERVE OS LOGS:
echo.
echo 1. "Quais são os melhores passeios em Bonito?"
echo    - Deve mostrar: "🔍 Precisa de web search? true"
echo    - Deve mostrar: "🌐 Decisão: Buscar na web"
echo.
echo 2. "Me conte sobre a comida típica de MS"
echo    - Deve mostrar: "🔍 Precisa de web search? false"
echo    - Deve mostrar: "🏠 Usando apenas conhecimento local"
echo.
echo 3. "o que é rota bioceanica?"
echo    - Deve mostrar: "🔍 Precisa de web search? true"
echo    - Deve mostrar: "🌐 Decisão: Buscar na web"
echo.
echo 🔍 OBSERVE ONDE PARA:
echo - Se parar em "🔍 Iniciando busca inteligente..." = problema na busca
echo - Se parar em "🌐 Chamando Supabase Edge Function..." = problema no Supabase
echo - Se parar em "✍️ Gerando resposta..." = problema na geração
echo - Se mostrar "❌ Erro" = problema específico no código
echo.
echo 📱 ABRA O CONSOLE DO NAVEGADOR (F12) PARA VER OS LOGS!
echo.
pause




