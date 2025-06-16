@echo off
cd /d C:\Users\HP\Desktop\heytek-project

echo ===============================
echo   HEYTEK PROJECT GIT PUSHER
echo ===============================

REM Add all changes
git add .

REM Ask for commit message
set /p msg="Enter commit message: "
git commit -m "%msg%"

REM Push to GitHub
git push origin main

echo ===============================
echo    ✅ PUSH COMPLETE!
echo ===============================
pause
