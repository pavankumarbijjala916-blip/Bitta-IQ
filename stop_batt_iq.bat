@echo off
echo Stopping BATT IQ Services...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM python.exe /T 2>nul
echo Services stopped successfully.
pause
