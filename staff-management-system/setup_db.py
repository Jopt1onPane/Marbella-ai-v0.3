#!/usr/bin/env python3
"""
简单的数据库初始化脚本
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User

def setup_database():
    print("开始初始化数据库...")
    
    with app.app_context():
        try:
            # 创建数据库表
            db.create_all()
            print("✓ 数据库表创建成功")
            
            # 检查并创建管理员账户
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    email='admin@company.com',
                    role='admin'
                )
                admin.set_password('admin123')
                db.session.add(admin)
                print("✓ 管理员账户创建成功")
            else:
                print("✓ 管理员账户已存在")
            
            # 检查并创建测试员工账户
            employee = User.query.filter_by(username='employee').first()
            if not employee:
                employee = User(
                    username='employee',
                    email='employee@company.com',
                    role='user'
                )
                employee.set_password('employee123')
                db.session.add(employee)
                print("✓ 员工账户创建成功")
            else:
                print("✓ 员工账户已存在")
            
            db.session.commit()
            print("\n🎉 数据库初始化完成！")
            print("📋 账户信息：")
            print("   管理员: admin / admin123")
            print("   员工: employee / employee123")
            
        except Exception as e:
            print(f"❌ 数据库初始化失败: {e}")
            db.session.rollback()
            return False
    
    return True

if __name__ == '__main__':
    setup_database()
