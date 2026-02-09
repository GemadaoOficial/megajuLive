@echo off
echo ========================================
echo    MegaJu Live - Servidor de Rede
echo ========================================
echo.
echo [1] Descobrindo seu IP local...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    if not "!IP!"=="" (
        echo    SEU IP: !IP!
        echo    Acesse de outro PC: http://!IP!:5000
        echo.
    )
)
echo ========================================
echo.
echo [2] Iniciando servidor na porta 5000...
echo.
cd server
npm start
