@echo off
setlocal
cd /d "%~dp0"

echo Starting Johnny Five on http://localhost:5173/
npm.cmd run dev
