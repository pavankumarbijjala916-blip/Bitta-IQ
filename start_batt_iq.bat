@echo off
setlocal
title BATT IQ - Battery Monitoring System Startup

echo ===================================================
echo       BATT IQ - Battery Monitoring System
echo ===================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python from https://python.org/
    pause
    exit /b
)

echo [1/3] Checking Email/Telemetry Service...
cd email-service
if not exist node_modules (
    echo    - Installing Node.js dependencies...
    call npm install
) else (
    echo    - Dependencies found.
)

echo    - Starting Email/Telemetry Service (Background)...
echo @echo off > run_backend.bat
echo title BATT IQ Backend >> run_backend.bat
echo :loop >> run_backend.bat
echo npm start >> run_backend.bat
echo echo [RESTARTING BACKEND IN 5 SECONDS...] >> run_backend.bat
echo timeout /t 5 /nobreak ^>nul >> run_backend.bat
echo goto loop >> run_backend.bat
start "BATT IQ Backend" /min cmd /c "run_backend.bat"
cd ..
echo.

echo [2/3] Checking Battery Agent...
cd battery-agent
if not exist venv (
    echo    - Creating Python virtual environment...
    python -m venv venv
)

echo    - Activating virtual environment...
call venv\Scripts\activate

echo    - Installing Python dependencies...
pip install -r requirements.txt >nul 2>nul

echo    - Starting Battery Agent...
echo @echo off > run_agent.bat
echo title BATT IQ Agent >> run_agent.bat
echo call %cd%\venv\Scripts\activate.bat >> run_agent.bat
echo :loop >> run_agent.bat
echo python agent.py >> run_agent.bat
echo echo [RESTARTING AGENT IN 5 SECONDS...] >> run_agent.bat
echo timeout /t 5 /nobreak ^>nul >> run_agent.bat
echo goto loop >> run_agent.bat
start "BATT IQ Agent" cmd /c "run_agent.bat"
cd ..
echo.

echo [3/3] System Status
echo.
echo ===================================================
echo  ✅ Backend Service running on port 5001
echo  ✅ Battery Agent running (check new window)
echo.
echo  👉 Open your dashboard at http://localhost:5173
echo.
echo  To stop: Close the opened terminal windows.
echo ===================================================
pause
