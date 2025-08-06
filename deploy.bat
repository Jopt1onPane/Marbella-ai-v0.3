@echo off
chcp 65001 >nul
echo 🌐 员工管理系统公网部署脚本
echo ================================

echo 📋 检查当前目录...
echo 当前目录: %CD%

echo 🔨 第一步：构建前端项目
echo 正在运行构建脚本...
call build.bat

if %errorlevel% neq 0 (
    echo ❌ 前端构建失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 前端构建成功！

echo.
echo 🌐 第二步：准备部署文件
echo 正在创建部署包...

if not exist "deploy-package" mkdir deploy-package
if not exist "deploy-package\frontend" mkdir deploy-package\frontend
if not exist "deploy-package\backend" mkdir deploy-package\backend

echo 📦 复制前端文件...
xcopy "staff-management-frontend\dist\*" "deploy-package\frontend\" /E /I /Y

echo 📦 复制后端文件...
xcopy "staff-management-system\*" "deploy-package\backend\" /E /I /Y

echo ✅ 部署包创建完成！

echo.
echo 📁 部署文件位置:
echo    - 前端文件: deploy-package\frontend\
echo    - 后端文件: deploy-package\backend\

echo.
echo 🚀 第三步：部署到公网
echo.
echo 📋 部署选项:
echo    1. Vercel + Railway (推荐，免费)
echo    2. Netlify + Render (备选，免费)
echo    3. 手动部署 (需要服务器)

echo.
echo 💡 详细部署步骤请查看: 公网部署教程.md
echo.

echo 🎯 下一步操作:
echo    1. 注册 Vercel 账户: https://vercel.com
echo    2. 注册 Railway 账户: https://railway.app
echo    3. 按照教程部署前端和后端
echo    4. 配置环境变量和数据库

echo.
echo 📖 重要提示:
echo    - 确保有 GitHub 账户
echo    - 准备好信用卡信息（免费额度）
echo    - 按照教程逐步操作

echo.
echo �� 准备就绪！开始部署吧！

pause 