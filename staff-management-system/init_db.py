#!/usr/bin/env python3
"""
数据库初始化脚本
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User

def init_database():
    with app.app_context():
        try:
            # 创建数据库表
            db.create_all()
            print("数据库表创建完成")
            
            # 创建管理员账户
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    email='admin@company.com',
                    role='admin'
                )
                admin.set_password('admin123')
                db.session.add(admin)
                print("管理员账户创建完成")
            
            # 创建测试员工账户
            employee = User.query.filter_by(username='employee').first()
            if not employee:
                employee = User(
                    username='employee',
                    email='employee@company.com',
                    role='user'
                )
                employee.set_password('employee123')
                db.session.add(employee)
                print("员工账户创建完成")
            
            db.session.commit()
            print("数据库初始化完成！")
            print("管理员账户: admin / admin123")
            print("员工账户: employee / employee123")
        except Exception as e:
            print(f"数据库初始化失败: {e}")
            db.session.rollback()

if __name__ == '__main__':
    init_database()
