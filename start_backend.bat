@echo off
echo 启动人员管理系统后端服务...
echo.

cd staff-management-system

echo 检查Python虚拟环境...
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

echo 激活虚拟环境...
call venv\Scripts\activate

echo 安装依赖包...
pip install -r requirements.txt

echo 启动后端服务...
python src/main.py

pause 