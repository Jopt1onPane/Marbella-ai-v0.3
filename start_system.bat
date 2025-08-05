@echo off
title 人员管理系统 - 一键启动
echo ========================================
echo           人员管理系统
echo ========================================
echo.
echo 正在启动系统...
echo.

echo 1. 启动后端服务...
start "后端服务" cmd /k "cd staff-management-system && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python src/main.py"

echo 等待后端服务启动...
timeout /t 5 /nobreak > nul

echo 2. 启动前端服务...
start "前端服务" cmd /k "cd staff-management-frontend && npm install && npm run dev"

echo.
echo ========================================
echo 系统启动完成！
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:5000
echo.
echo 管理员账户: admin / admin123
echo ========================================
echo.
echo 按任意键退出...
pause > nul 