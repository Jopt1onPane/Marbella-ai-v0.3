#!/bin/bash

# 设置工作目录
cd /opt/render/project/src/staff-management-system

# 安装依赖
pip install -r requirements.txt

# 启动应用
exec python -m gunicorn src.main:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120