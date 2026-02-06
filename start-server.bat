@echo off
echo ========================================
echo   MegaJu Live - Iniciando Sistema
echo ========================================
echo.

REM Mata todos os processos node.exe que estejam rodando
echo Fechando processos Node.js anteriores...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Define a porta do backend
set PORT=5000

REM Inicia o FRONTEND (Vite) em uma janela separada
echo Iniciando Frontend (Vite)...
start "MegaJu Live - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

REM Navega para o diretorio do servidor
cd /d "%~dp0server"

echo Verificando dependencias do servidor...
if not exist "node_modules\" (
    echo Instalando dependencias do servidor...
    call npm install
    echo.
)

echo.
echo ========================================
echo   Backend: http://localhost:%PORT%
echo   Frontend: http://localhost:5173
echo ========================================
echo Pressione Ctrl+C para parar o servidor
echo.

REM Inicia o BACKEND (Express + tsx watch)
call npm run dev

pause
