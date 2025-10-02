@echo off
echo Corrigindo logo em todas as páginas...

REM Parar todos os processos Node.js
taskkill /f /im node.exe 2>nul

REM Limpar cache do Vite
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

REM Limpar cache do navegador (instruções)
echo.
echo ========================================
echo LOGO CORRIGIDA EM TODAS AS PÁGINAS!
echo ========================================
echo.
echo Cache-busting atualizado para v=3 em:
echo - Navbar.tsx
echo - UniversalNavbar.tsx  
echo - UniversalFooter.tsx
echo - BrandContext.tsx
echo - SimpleBrandContext.tsx
echo - useMultiTenantSimple.ts
echo.
echo Para ver a nova logo em TODAS as páginas:
echo 1. Pressione Ctrl+F5 em cada página
echo 2. Ou abra uma janela incógnita/privada
echo 3. Ou limpe o cache: Ctrl+Shift+Delete
echo.
echo Acesse: http://localhost:8080/ms
echo.

REM Reiniciar servidor
echo Reiniciando servidor...
npm run dev

pause






