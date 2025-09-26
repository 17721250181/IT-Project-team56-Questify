@echo off
title Questify Startup Script
color 0A

echo ========================================
echo        Questify Startup Script
echo ========================================
echo.

:: Check if we're in the correct directory
if not exist "backend" (
    echo Error: backend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Starting Questify services...
echo.

:: Start Backend
echo [1/2] Starting Django Backend Server...
start "Questify Backend" cmd /k "cd /d %~dp0backend && env\Scripts\activate && python manage.py runserver 8000"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting React Frontend Server...
start "Questify Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo     Services are starting up...
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window.
echo Note: Backend and Frontend will continue running in separate windows.
pause >nul