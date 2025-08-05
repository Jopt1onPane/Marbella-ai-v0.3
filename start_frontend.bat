@echo off
echo 启动人员管理系统前端服务...
echo.

cd staff-management-frontend

echo 安装依赖包...
npm install

echo 启动前端开发服务器...
npm run dev

pause 