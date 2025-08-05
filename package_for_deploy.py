#!/usr/bin/env python3
"""
人员管理系统 - 打包脚本
"""

import os
import tarfile
from datetime import datetime

def create_package():
    """创建部署包"""
    print("📦 创建部署包...")
    
    package_name = f"staff-management-system-deploy-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    with tarfile.open(f"{package_name}.tar.gz", "w:gz") as tar:
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in [
                '__pycache__', 'node_modules', '.git', 'venv', 'dist', 'build'
            ]]
            
            for file in files:
                if file.endswith(('.log', '.tmp', '.DS_Store')):
                    continue
                
                file_path = os.path.join(root, file)
                arc_name = os.path.relpath(file_path, '.')
                tar.add(file_path, arcname=arc_name)
    
    print(f"✅ 部署包已创建: {package_name}.tar.gz")
    return f"{package_name}.tar.gz"

def main():
    print("📦 人员管理系统 - 打包工具")
    print("=" * 50)
    
    package_file = create_package()
    
    print("\n" + "=" * 50)
    print("✅ 打包完成！")
    print(f"📦 部署包: {package_file}")

if __name__ == "__main__":
    main() 