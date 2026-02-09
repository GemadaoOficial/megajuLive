@echo off
echo.
echo ========================================
echo   MegaJu Live - Build Electron App
echo ========================================
echo.

echo [1/3] Buildando Backend (TypeScript)...
cd server
call npm run build
if errorlevel 1 (
    echo ERRO ao buildar backend!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Buildando Frontend (React + Vite)...
cd client
call npm run build
if errorlevel 1 (
    echo ERRO ao buildar frontend!
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Gerando Executavel com Electron Builder...
call npx electron-builder --win --x64
if errorlevel 1 (
    echo ERRO ao gerar executavel!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Instalador gerado em:
echo   dist-electron\MegaJu Live Setup 1.0.0.exe
echo.
echo Tamanho aproximado: ~344 MB
echo.
pause
