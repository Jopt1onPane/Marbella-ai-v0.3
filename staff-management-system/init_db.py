#!/usr/bin/env python3
"""
数据库初始化脚本
用于Render部署时创建数据库表和初始管理员账户
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User

def init_database():
    """初始化数据库表和管理员账户"""
    with app.app_context():
        print("🔄 开始初始化数据库...")
        
        # 删除所有表（重新开始）
        db.drop_all()
        print("📋 已清空旧数据表")
        
        # 创建所有表
        db.create_all()
        print("✅ 数据库表创建完成")
        
        # 创建唯一的管理员账户
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@company.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("👑 管理员账户已创建: admin / admin123")
        else:
            print("👑 管理员账户已存在")
        
        # 提交更改
        db.session.commit()
        print("💾 数据库初始化完成")
        
        # 验证账户
        total_users = User.query.count()
        admin_count = User.query.filter_by(role='admin').count()
        print(f"📊 系统状态:")
        print(f"   - 总用户数: {total_users}")
        print(f"   - 管理员数: {admin_count}")

if __name__ == '__main__':
    init_database()