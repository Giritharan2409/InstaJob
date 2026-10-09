@echo off
title InstaJob Startup Launcher

echo ====================================================
echo           InstaJob Application Launcher
echo ====================================================

echo.
echo [1/4] Checking and freeing ports 5000 and 5173...
powershell -Command "Get-NetTCPConnection -LocalPort 5000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo [2/4] Seeding MongoDB Database...
cd backend
call npm run seed
cd ..

echo.
echo [3/4] Starting Backend Server (Express + MongoDB on Port 5000)...
start cmd /k "title InstaJob Backend && cd backend && npm start"

echo.
echo [4/4] Starting Frontend App (Vite React on Port 5173)...
start cmd /k "title InstaJob Frontend && cd frontend && npm run dev"

echo.
echo ====================================================
echo  Backend and Frontend are starting up!
echo  - Backend API: http://localhost:5000/api
echo  - Frontend UI:  http://localhost:5173
echo ====================================================
echo.

pause