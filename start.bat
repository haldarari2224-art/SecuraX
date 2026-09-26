@echo off
title SecuraX - IPsec VPN Protocol Analyzer
color 0A

echo ============================================
echo   SecuraX - Unified Server Launcher
echo   AI-Powered IPsec VPN Protocol Analyzer
echo ============================================
echo.

:: Check if frontend is built
if not exist "%~dp0vite-project\dist\index.html" (
    echo [!] Frontend not built yet. Building now...
    cd /d "%~dp0vite-project"
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Frontend build failed!
        pause
        exit /b 1
    )
    echo [OK] Frontend built successfully.
    echo.
)

:: Start the backend (which now serves frontend too)
cd /d "%~dp0backend"

echo [*] Starting SecuraX server...
echo [*] Open your browser at: http://localhost:8000
echo [*] API docs available at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server.
echo ============================================

python app.py

pause
