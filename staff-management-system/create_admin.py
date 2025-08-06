#!/usr/bin/env python3
"""
创建管理员账户脚本
运行此脚本来创建管理员账户
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User

def create_admin_user():
    with app.app_context():
        # 创建数据库表
        db.create_all()
        
        # 检查是否已存在管理员
        admin = User.query.filter_by(role='admin').first()
        if admin:
            print(f"管理员账户已存在: {admin.username}")
            return
        
        # 创建管理员账户
        admin = User(
            username='admin',
            email='admin@company.com',
            role='admin'
        )
        admin.set_password('admin123')
        
        # 创建普通管理员账户
        manager = User(
            username='manager',
            email='manager@company.com',
            role='admin'
        )
        manager.set_password('manager123')
        
        # 创建测试员工账户
        employee = User(
            username='employee',
            email='employee@company.com',
            role='user'
        )
        employee.set_password('employee123')
        
        db.session.add(admin)
        db.session.add(manager)
        db.session.add(employee)
        db.session.commit()
        
        print("账户创建成功:")
        print("管理员账户: admin / admin123")
        print("管理员账户: manager / manager123")
        print("员工账户: employee / employee123")

if __name__ == '__main__':
    create_admin_user()
