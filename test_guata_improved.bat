@echo off
echo ========================================
echo 🦦 TESTE DO GUATÁ MELHORADO
echo ========================================
echo.
echo Testando o Guatá com melhorias de timeout e fallback...
echo.

echo ✅ Verificando se o servidor está rodando...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Abrindo navegador para testar o Guatá...
start http://localhost:8082/ms/guata

echo.
echo 📋 INSTRUÇÕES PARA O TESTE:
echo.
echo 1. Faça login na aplicação
echo 2. Vá para a página do Guatá
echo 3. Teste as seguintes perguntas:
echo    - "Olá, quem é você?"
echo    - "Quais são os melhores passeios em Bonito?"
echo    - "Me conte sobre a Rota Bioceânica"
echo    - "O que é o Pantanal?"
echo    - "Quero um roteiro de 3 dias"
echo.
echo 4. Observe no console do navegador (F12):
echo    - Se há logs de ping da Edge Function
echo    - Se há fallback para resposta local
echo    - Se não há mais timeouts
echo    - Se as respostas são inteligentes e específicas
echo.
echo 5. Verifique se:
echo    - Guatá se apresenta corretamente
echo    - Respostas são específicas e úteis
echo    - Não há travamentos em "Processando..."
echo    - Fallback funciona quando Edge Functions falham
echo.
echo ========================================
echo 🎯 TESTE CONCLUÍDO - Verifique o navegador
echo ========================================
pause





