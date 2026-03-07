@echo off 
title BATT IQ Backend 
:loop 
npm start 
echo [RESTARTING BACKEND IN 5 SECONDS...] 
timeout /t 5 /nobreak >nul 
goto loop 
