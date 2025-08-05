@echo off
chcp 65001 >nul
echo 🚀 员工管理系统构建脚本
echo ==========================

echo 📋 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 环境正常

echo 📦 检查包管理器...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 使用 npm 作为包管理器
    set PACKAGE_MANAGER=npm
) else (
    pnpm --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ 使用 pnpm 作为包管理器
        set PACKAGE_MANAGER=pnpm
    ) else (
        echo ❌ 未找到 npm 或 pnpm
        pause
        exit /b 1
    )
)

echo 🔨 开始构建前端项目...
cd staff-management-frontend

echo 📦 安装依赖...
call %PACKAGE_MANAGER% install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🏗️ 构建项目...
call %PACKAGE_MANAGER% run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo ✅ 前端构建成功！

echo 📁 构建文件位置:
echo    - 前端构建文件: staff-management-frontend\dist\
echo    - 主要文件: staff-management-frontend\dist\assets\index-ChChek3X.js

echo.
echo 🎯 下一步操作:
echo    1. 将 dist 文件夹复制到后端静态文件目录
echo    2. 重启后端服务
echo    3. 访问网站查看效果

echo.
echo 📖 如果遇到问题，请检查:
echo    - Node.js 版本是否兼容
echo    - 网络连接是否正常
echo    - 是否有足够的磁盘空间

pause 