#!/usr/bin/env python3
"""
人员管理系统功能测试脚本
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class SystemTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        
    def login(self):
        print("🔐 测试管理员登录...")
        try:
            response = self.session.post(f"{BASE_URL}/auth/login", json={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                print("✅ 管理员登录成功")
                return True
            else:
                print(f"❌ 登录失败: {response.text}")
                return False
        except Exception as e:
            print(f"❌ 登录异常: {e}")
            return False
    
    def test_create_task(self):
        print("\n📝 测试创建任务...")
        try:
            task_data = {
                "title": "测试任务 - 网站UI优化",
                "description": "这是一个测试任务，用于验证系统功能。",
                "publisher_name": "系统管理员",
                "start_date": datetime.now().strftime('%Y-%m-%d'),
                "end_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                "max_points": 150
            }
            
            response = self.session.post(f"{BASE_URL}/tasks", json=task_data)
            
            if response.status_code == 201:
                data = response.json()
                task_id = data['task']['id']
                print(f"✅ 任务创建成功，ID: {task_id}")
                return task_id
            else:
                print(f"❌ 任务创建失败: {response.text}")
                return None
        except Exception as e:
            print(f"❌ 创建任务异常: {e}")
            return None
    
    def test_get_tasks(self):
        print("\n📋 测试获取任务列表...")
        try:
            response = self.session.get(f"{BASE_URL}/tasks")
            
            if response.status_code == 200:
                data = response.json()
                tasks = data.get('tasks', [])
                print(f"✅ 成功获取 {len(tasks)} 个任务")
                return tasks
            else:
                print(f"❌ 获取任务失败: {response.text}")
                return []
        except Exception as e:
            print(f"❌ 获取任务异常: {e}")
            return []
    
    def run_all_tests(self):
        print("🚀 开始系统功能测试...")
        print("=" * 50)
        
        if not self.login():
            print("❌ 登录失败，无法继续测试")
            return False
        
        self.test_get_tasks()
        task_id = self.test_create_task()
        
        if task_id:
            self.test_get_tasks()
        
        print("\n" + "=" * 50)
        print("🎉 系统功能测试完成！")
        return True

def main():
    print("人员管理系统 - 功能测试")
    print("请确保后端服务已启动在 http://localhost:5000")
    print()
    
    input("按回车键开始测试...")
    
    tester = SystemTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ 所有测试通过！系统运行正常。")
    else:
        print("\n❌ 测试失败，请检查系统配置。")
    
    print("\n💡 提示:")
    print("- 前端地址: http://localhost:5173")
    print("- 后端地址: http://localhost:5000")
    print("- 管理员账户: admin / admin123")

if __name__ == "__main__":
    main() 