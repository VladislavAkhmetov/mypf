@echo off
chcp 65001 >nul
title Деплой портфолио на VPS (vladakhmetov.com)
cd /d "%~dp0"

set "PYTHON_EXE=d:\dev\experiments\tg crm\venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=python"
)

echo ========================================================
echo   Деплой портфолио на VPS (vladakhmetov.com)
echo ========================================================
echo.

"%PYTHON_EXE%" scripts\deploy_vps.py %*

echo.
pause
