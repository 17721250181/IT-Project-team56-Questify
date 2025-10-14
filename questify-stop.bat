@echo off
title Questify Stop Script
color 0C

echo ========================================
echo         Questify Stop Script
echo ========================================
echo.
echo Stopping all Questify services...
echo.

:: Kill Django processes (usually running on port 8000)
echo [1/2] Stopping Django Backend...
taskkill /f /im python.exe 2>nul
netstat -ano | findstr :8000 > temp_port.txt 2>nul
for /f "tokens=5" %%a in (temp_port.txt) do (
    taskkill /f /pid %%a 2>nul
)
del temp_port.txt 2>nul

:: Kill Node.js processes (Vite dev server)
echo [2/2] Stopping React Frontend...
taskkill /f /im node.exe 2>nul
netstat -ano | findstr :5173 > temp_port2.txt 2>nul
for /f "tokens=5" %%a in (temp_port2.txt) do (
    taskkill /f /pid %%a 2>nul
)
del temp_port2.txt 2>nul

:: Close command windows with specific titles
taskkill /f /fi "WINDOWTITLE eq Questify Backend*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Questify Frontend*" 2>nul

echo.
echo ========================================
echo    All Questify services stopped!
echo ========================================
echo.
echo Press any key to exit...
pause >nul