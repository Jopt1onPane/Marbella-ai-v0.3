@echo off
chcp 65001 >nul
echo 🚀 员工管理系统构建脚本
echo ==========================

echo 📋 检查当前目录...
echo 当前目录: %CD%

echo 📋 检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装或未正确配置
    echo 📥 请下载安装: https://nodejs.org/
    echo 💡 安装后请重启命令行
    pause
    exit /b 1
)

echo ✅ Node.js 环境正常

echo 📦 检查包管理器...
npm --version
if %errorlevel% equ 0 (
    echo ✅ 使用 npm 作为包管理器
    set PACKAGE_MANAGER=npm
) else (
    echo ❌ npm 不可用，尝试 pnpm...
    pnpm --version
    if %errorlevel% equ 0 (
        echo ✅ 使用 pnpm 作为包管理器
        set PACKAGE_MANAGER=pnpm
    ) else (
        echo ❌ 未找到可用的包管理器
        echo 💡 请确保 npm 或 pnpm 已正确安装
        pause
        exit /b 1
    )
)

echo 🔨 检查前端项目目录...
if not exist "staff-management-frontend" (
    echo ❌ 找不到 staff-management-frontend 目录
    echo 💡 请确保在正确的项目根目录运行此脚本
    pause
    exit /b 1
)

echo ✅ 前端项目目录存在

echo 🔨 进入前端项目目录...
cd staff-management-frontend
echo 当前目录: %CD%

echo 📦 安装依赖...
echo 使用包管理器: %PACKAGE_MANAGER%
call %PACKAGE_MANAGER% install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    echo 💡 请检查网络连接和包管理器配置
    pause
    exit /b 1
)

echo ✅ 依赖安装成功

echo 🏗️ 开始构建项目...
call %PACKAGE_MANAGER% run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败
    echo 💡 请检查源代码是否有语法错误
    pause
    exit /b 1
)

echo ✅ 前端构建成功！

echo 📁 检查构建文件...
if exist "dist\assets\index-*.js" (
    echo ✅ 构建文件生成成功
    dir dist\assets\index-*.js
) else (
    echo ❌ 构建文件未找到
    pause
    exit /b 1
)

echo.
echo 🎯 构建完成！下一步操作:
echo    1. 将 dist 文件夹复制到后端静态文件目录
echo    2. 重启后端服务
echo    3. 访问网站查看效果

echo.
echo 📖 如果遇到问题:
echo    - 确保 Node.js 版本 >= 16
echo    - 检查网络连接
echo    - 确保有足够的磁盘空间

pause 