import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta

from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.tasks import tasks_bp
from src.routes.submissions import submissions_bp
from src.routes.points import points_bp
from src.routes.upload import upload_bp

app = Flask(__name__)

# 配置
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')  # JWT密钥
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Token过期时间

# 数据库配置
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # 如果没有设置DATABASE_URL，使用SQLite
    if os.name == 'nt':  # Windows系统
        # Windows环境，使用当前目录
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_dir = os.path.join(base_dir, 'database')
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
        db_path = os.path.join(db_dir, 'app.db')
    else:
        # Linux/Unix环境（如Render），使用/tmp目录
        db_path = os.path.join('/tmp', 'app.db')
    
    DATABASE_URL = f"sqlite:///{db_path}"
elif DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 文件上传配置
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)

# CORS 配置
cors_origins = os.getenv('CORS_ORIGINS', '*')
if cors_origins != '*':
    cors_origins = cors_origins.split(',')
CORS(app, origins=cors_origins)  # 允许跨域请求

# 注册蓝图
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tasks_bp, url_prefix='/api')
app.register_blueprint(submissions_bp, url_prefix='/api')
app.register_blueprint(points_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

# 创建数据库表
with app.app_context():
    db.create_all()
    print("数据库表创建完成")

@app.route('/')
def health_check():
    return jsonify({
        'message': 'Staff Management System API',
        'status': 'running',
        'version': '1.0.0'
    })

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '资源不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': '服务器内部错误'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token已过期，请重新登录'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Token无效，请重新登录'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': '需要登录才能访问'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

