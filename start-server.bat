@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Запускаем сервер Block Blast для iPhone и ПК...
start "" "http://localhost:8080"
node server.js
pause
