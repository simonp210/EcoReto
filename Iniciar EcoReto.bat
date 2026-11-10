@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if not errorlevel 1 (
    start "EcoReto - servidor local" cmd /c node servidor-local.js
) else (
    start "EcoReto - servidor local" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor-local.ps1"
)

timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:4173/
endlocal
