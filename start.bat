@echo off
title Shopee Live Management System

echo ========================================
echo    Shopee Live Management System
echo ========================================
echo.

:: Start backend server
echo Iniciando Backend (porta 5000)...
start "Shopee Live - Backend" cmd /k "cd /d %~dp0server && npm run dev"

:: Wait a bit for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend server
echo Iniciando Frontend (porta 5173)...
start "Shopee Live - Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo Servidores iniciados!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Credenciais:
echo   Admin: admin@shopee.com / admin123
echo   User:  user@shopee.com / user123
echo ========================================
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause > nul

start http://localhost:5173
