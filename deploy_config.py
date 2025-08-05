#!/usr/bin/env python3
"""
人员管理系统 - 部署配置
"""

import os
from datetime import datetime

# 部署配置
DEPLOY_CONFIG = {
    'host': '0.0.0.0',
    'port': 5000,
    'debug': False,
    'secret_key': os.environ.get('SECRET_KEY', 'your-production-secret-key'),
    'jwt_secret_key': os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key'),
    'workers': 4,
    'timeout': 30
}

def create_env_file():
    """创建环境变量文件"""
    env_content = f"""# 人员管理系统 - 环境变量配置
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY={DEPLOY_CONFIG['secret_key']}
JWT_SECRET_KEY={DEPLOY_CONFIG['jwt_secret_key']}
DATABASE_URL=sqlite:///app.db
HOST={DEPLOY_CONFIG['host']}
PORT={DEPLOY_CONFIG['port']}
"""
    
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print("✅ 环境变量文件 .env 已创建")

def create_gunicorn_config():
    """创建Gunicorn配置文件"""
    gunicorn_config = f"""# Gunicorn配置文件
bind = "{DEPLOY_CONFIG['host']}:{DEPLOY_CONFIG['port']}"
workers = {DEPLOY_CONFIG['workers']}
timeout = {DEPLOY_CONFIG['timeout']}
accesslog = "logs/access.log"
errorlog = "logs/error.log"
loglevel = "info"
preload_app = True
"""
    
    with open('gunicorn.conf.py', 'w', encoding='utf-8') as f:
        f.write(gunicorn_config)
    
    print("✅ Gunicorn配置文件 gunicorn.conf.py 已创建")

def main():
    """主函数"""
    print("🔧 人员管理系统 - 部署配置生成器")
    print("=" * 50)
    
    os.makedirs('logs', exist_ok=True)
    os.makedirs('uploads', exist_ok=True)
    
    create_env_file()
    create_gunicorn_config()
    
    print("\n" + "=" * 50)
    print("✅ 配置文件已生成完成！")

if __name__ == "__main__":
    main() 