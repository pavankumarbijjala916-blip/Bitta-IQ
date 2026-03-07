@echo off 
title BATT IQ Agent 
call C:\Users\Pavankumar\OneDrive\Desktop\green-battery-buddy-main\battery-agent\venv\Scripts\activate.bat 
:loop 
python agent.py 
echo [RESTARTING AGENT IN 5 SECONDS...] 
timeout /t 5 /nobreak >nul 
goto loop 
